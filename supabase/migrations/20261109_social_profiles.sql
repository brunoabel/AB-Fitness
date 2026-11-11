-- AB Fitness — Perfil de atleta editável + sistema social (amigos, feed, respect, head-to-head).
-- Idempotente: pode correr várias vezes no SQL Editor.
--
-- Princípio de segurança: as tabelas de treino (workout_sessions, exercise_logs) e as colunas
-- sensíveis de profiles (email, role) continuam visíveis só ao próprio utilizador. Tudo o que um
-- amigo vê passa por funções SECURITY DEFINER que verificam a amizade e as preferências de privacidade.

-- ==============================================================================
-- 1. PROFILES: tabela base + colunas novas + trigger de criação automática
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'athlete',
  athlete_type TEXT DEFAULT 'soccer_gym',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário pode visualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode visualizar seu próprio perfil"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário pode inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode inserir seu próprio perfil"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_style TEXT NOT NULL DEFAULT 'midnight';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS athlete_tag TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS featured_stat TEXT NOT NULL DEFAULT 'total_workouts';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB NOT NULL
  DEFAULT '{"public_profile": true, "show_weights": true, "show_streak": true, "show_history": true, "show_biometrics": false}'::jsonb;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_format CHECK (username IS NULL OR username ~ '^[a-z0-9_.]{3,20}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 160);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_cover_style_valid CHECK (cover_style IN ('midnight', 'carbon', 'abyss'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_featured_stat_valid CHECK (featured_stat IN ('total_workouts', 'streak', 'monthly_volume'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_full_name_lower_idx ON public.profiles (lower(full_name));

-- Username sempre em minúsculas + updated_at automático
CREATE OR REPLACE FUNCTION public.normalize_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN NEW.username := lower(trim(NEW.username)); END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_normalize_profile ON public.profiles;
CREATE TRIGGER trg_normalize_profile
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_profile();

-- ==============================================================================
-- 2. FRIENDSHIPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);
-- Um único registo por par, independentemente de quem pediu
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_key
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON public.friendships (addressee_id, status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friendships_select_own" ON public.friendships;
CREATE POLICY "friendships_select_own" ON public.friendships FOR SELECT
  USING (auth.uid() IN (requester_id, addressee_id));

DROP POLICY IF EXISTS "friendships_insert_as_requester" ON public.friendships;
CREATE POLICY "friendships_insert_as_requester" ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');

-- Só o destinatário aceita/bloqueia; qualquer das partes pode apagar (recusar, cancelar, desfazer)
DROP POLICY IF EXISTS "friendships_update_addressee" ON public.friendships;
CREATE POLICY "friendships_update_addressee" ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id) WITH CHECK (auth.uid() = addressee_id);

DROP POLICY IF EXISTS "friendships_delete_party" ON public.friendships;
CREATE POLICY "friendships_delete_party" ON public.friendships FOR DELETE
  USING (auth.uid() IN (requester_id, addressee_id));

-- ==============================================================================
-- 3. TABELAS DE TREINO BASE (caso ainda não existam) + RESPECTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_day_id UUID,
  workout_day_name TEXT NOT NULL DEFAULT 'Treino',
  workout_title TEXT NOT NULL DEFAULT 'Sessão',
  duration_seconds INT DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  notes TEXT
);
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas próprias sessões concluídas" ON public.workout_sessions;
CREATE POLICY "Usuário gerencia suas próprias sessões concluídas"
  ON public.workout_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID,
  exercise_code TEXT NOT NULL,
  set_number INT NOT NULL DEFAULT 1,
  weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
  reps_completed INT NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia seus próprios logs de séries e cargas" ON public.exercise_logs;
CREATE POLICY "Usuário gerencia seus próprios logs de séries e cargas"
  ON public.exercise_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workout_respects (
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, user_id)
);
ALTER TABLE public.workout_respects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "respects_select_own" ON public.workout_respects;
CREATE POLICY "respects_select_own" ON public.workout_respects FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "respects_delete_own" ON public.workout_respects;
CREATE POLICY "respects_delete_own" ON public.workout_respects FOR DELETE USING (auth.uid() = user_id);
-- INSERT só via toggle_respect() (valida a amizade)

-- ==============================================================================
-- 4. FUNÇÕES AUXILIARES
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.are_friends(a UUID, b UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND LEAST(requester_id, addressee_id) = LEAST(a, b)
      AND GREATEST(requester_id, addressee_id) = GREATEST(a, b)
  );
$$;

CREATE OR REPLACE FUNCTION public.privacy_flag(p JSONB, k TEXT, fallback BOOLEAN DEFAULT true)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$ SELECT COALESCE((p ->> k)::boolean, fallback); $$;

-- Streak: dias consecutivos com treino, terminando hoje ou ontem
CREATE OR REPLACE FUNCTION public.athlete_streak(uid UUID)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH d AS (
    SELECT DISTINCT (completed_at AT TIME ZONE 'UTC')::date AS day FROM workout_sessions WHERE user_id = uid
  ), g AS (
    SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp FROM d
  ), runs AS (
    SELECT MAX(day) AS last_day, COUNT(*)::int AS len FROM g GROUP BY grp
  )
  SELECT COALESCE((SELECT len FROM runs WHERE last_day >= current_date - 1 ORDER BY last_day DESC LIMIT 1), 0);
$$;

-- Estatísticas de um atleta numa janela de dias (base de resumo, comparativo e card)
CREATE OR REPLACE FUNCTION public.athlete_window_stats(uid UUID, days INT)
RETURNS TABLE (workouts INT, active_days INT, volume_kg NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT COUNT(*)::int FROM workout_sessions s WHERE s.user_id = uid AND s.completed_at >= now() - make_interval(days => days)),
    (SELECT COUNT(DISTINCT (s.completed_at AT TIME ZONE 'UTC')::date)::int FROM workout_sessions s WHERE s.user_id = uid AND s.completed_at >= now() - make_interval(days => days)),
    (SELECT COALESCE(SUM(l.weight_kg * l.reps_completed), 0) FROM exercise_logs l
       WHERE l.user_id = uid AND l.completed AND l.created_at >= now() - make_interval(days => days));
$$;

-- ==============================================================================
-- 5. RPCs PÚBLICAS (chamadas pelo app)
-- ==============================================================================

-- Username disponível? (ignora o próprio)
CREATE OR REPLACE FUNCTION public.username_available(candidate TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(candidate) ~ '^[a-z0-9_.]{3,20}$'
     AND NOT EXISTS (SELECT 1 FROM profiles WHERE username = lower(candidate) AND id <> auth.uid());
$$;

-- Pesquisa por @username ou nome; só perfis públicos, nunca devolve email/role
CREATE OR REPLACE FUNCTION public.search_athletes(q TEXT)
RETURNS TABLE (id UUID, username TEXT, full_name TEXT, avatar_url TEXT, athlete_tag TEXT, friendship_status TEXT, i_requested BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.username, p.full_name, p.avatar_url, p.athlete_tag, f.status, (f.requester_id = auth.uid())
  FROM profiles p
  LEFT JOIN friendships f
    ON LEAST(f.requester_id, f.addressee_id) = LEAST(p.id, auth.uid())
   AND GREATEST(f.requester_id, f.addressee_id) = GREATEST(p.id, auth.uid())
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND char_length(trim(q)) >= 2
    AND privacy_flag(p.privacy_settings, 'public_profile')
    AND COALESCE(f.status, '') <> 'blocked'
    AND (p.username LIKE lower(ltrim(trim(q), '@')) || '%' OR lower(p.full_name) LIKE '%' || lower(trim(q)) || '%')
  ORDER BY (p.username = lower(ltrim(trim(q), '@'))) DESC, p.username NULLS LAST
  LIMIT 20;
$$;

-- Amizades do utilizador com dados públicos da outra pessoa
CREATE OR REPLACE FUNCTION public.list_friendships()
RETURNS TABLE (friendship_id UUID, status TEXT, incoming BOOLEAN, created_at TIMESTAMPTZ,
               friend_id UUID, username TEXT, full_name TEXT, avatar_url TEXT, athlete_tag TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT f.id, f.status, (f.addressee_id = auth.uid()), f.created_at,
         p.id, p.username, p.full_name, p.avatar_url, p.athlete_tag
  FROM friendships f
  JOIN profiles p ON p.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  WHERE auth.uid() IN (f.requester_id, f.addressee_id) AND f.status <> 'blocked'
  ORDER BY f.created_at DESC;
$$;

-- Resumo semanal dos amigos aceites (shared_workouts), respeitando privacidade
CREATE OR REPLACE FUNCTION public.get_friends_weekly_summary()
RETURNS TABLE (friend_id UUID, username TEXT, full_name TEXT, avatar_url TEXT, athlete_tag TEXT,
               workouts_week INT, streak INT, volume_week_kg NUMERIC, last_exercises TEXT[], last_workout_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.username, p.full_name, p.avatar_url, p.athlete_tag,
         st.workouts,
         CASE WHEN privacy_flag(p.privacy_settings, 'show_streak') THEN athlete_streak(p.id) END,
         CASE WHEN privacy_flag(p.privacy_settings, 'show_weights') THEN st.volume_kg END,
         CASE WHEN privacy_flag(p.privacy_settings, 'show_history') THEN (
           SELECT ARRAY(SELECT DISTINCT l.exercise_code FROM exercise_logs l
                        WHERE l.session_id = (SELECT s.id FROM workout_sessions s WHERE s.user_id = p.id ORDER BY s.completed_at DESC LIMIT 1)
                        LIMIT 4)
         ) END,
         (SELECT MAX(s.completed_at) FROM workout_sessions s WHERE s.user_id = p.id)
  FROM friendships f
  JOIN profiles p ON p.id = CASE WHEN f.requester_id = auth.uid() THEN f.addressee_id ELSE f.requester_id END
  CROSS JOIN LATERAL athlete_window_stats(p.id, 7) st
  WHERE f.status = 'accepted' AND auth.uid() IN (f.requester_id, f.addressee_id)
  ORDER BY st.workouts DESC;
$$;

-- Feed de treinos concluídos pelos amigos (com respects)
CREATE OR REPLACE FUNCTION public.get_friend_feed(max_items INT DEFAULT 30)
RETURNS TABLE (session_id UUID, friend_id UUID, username TEXT, full_name TEXT, avatar_url TEXT,
               workout_title TEXT, duration_seconds INT, completed_at TIMESTAMPTZ, volume_kg NUMERIC,
               top_exercises TEXT[], respect_count INT, respected_by_me BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.id, p.id, p.username, p.full_name, p.avatar_url,
         s.workout_title, s.duration_seconds, s.completed_at,
         CASE WHEN privacy_flag(p.privacy_settings, 'show_weights') THEN
           (SELECT COALESCE(SUM(l.weight_kg * l.reps_completed), 0) FROM exercise_logs l WHERE l.session_id = s.id AND l.completed) END,
         ARRAY(SELECT l.exercise_code FROM exercise_logs l WHERE l.session_id = s.id AND l.completed
               GROUP BY l.exercise_code ORDER BY MAX(l.weight_kg * l.reps_completed) DESC LIMIT 3),
         (SELECT COUNT(*)::int FROM workout_respects r WHERE r.session_id = s.id),
         EXISTS (SELECT 1 FROM workout_respects r WHERE r.session_id = s.id AND r.user_id = auth.uid())
  FROM workout_sessions s
  JOIN profiles p ON p.id = s.user_id
  WHERE are_friends(auth.uid(), s.user_id)
    AND privacy_flag(p.privacy_settings, 'show_history')
    AND s.completed_at >= now() - interval '30 days'
  ORDER BY s.completed_at DESC
  LIMIT LEAST(GREATEST(max_items, 1), 100);
$$;

-- Liga/desliga o respect num treino de um amigo; devolve o total atualizado
CREATE OR REPLACE FUNCTION public.toggle_respect(target_session UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner UUID;
BEGIN
  SELECT user_id INTO owner FROM workout_sessions WHERE id = target_session;
  IF owner IS NULL OR NOT are_friends(auth.uid(), owner) THEN
    RAISE EXCEPTION 'Só podes dar respect a treinos de amigos.' USING ERRCODE = '42501';
  END IF;
  IF EXISTS (SELECT 1 FROM workout_respects WHERE session_id = target_session AND user_id = auth.uid()) THEN
    DELETE FROM workout_respects WHERE session_id = target_session AND user_id = auth.uid();
  ELSE
    INSERT INTO workout_respects (session_id, user_id) VALUES (target_session, auth.uid());
  END IF;
  RETURN (SELECT COUNT(*)::int FROM workout_respects WHERE session_id = target_session);
END;
$$;

-- Comparativo Você vs. Amigo (7 ou 30 dias). Valores do amigo a NULL quando a privacidade os esconde.
CREATE OR REPLACE FUNCTION public.get_head_to_head(friend UUID, days INT DEFAULT 7)
RETURNS TABLE (who TEXT, workouts INT, active_days INT, streak INT, volume_kg NUMERIC)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE priv JSONB;
BEGIN
  IF NOT are_friends(auth.uid(), friend) THEN
    RAISE EXCEPTION 'Comparativo disponível só entre amigos.' USING ERRCODE = '42501';
  END IF;
  days := CASE WHEN days >= 30 THEN 30 ELSE 7 END;
  SELECT privacy_settings INTO priv FROM profiles WHERE id = friend;

  RETURN QUERY SELECT 'me'::text, st.workouts, st.active_days, athlete_streak(auth.uid()), st.volume_kg
    FROM athlete_window_stats(auth.uid(), days) st;
  RETURN QUERY SELECT 'friend'::text, st.workouts, st.active_days,
      CASE WHEN privacy_flag(priv, 'show_streak') THEN athlete_streak(friend) END,
      CASE WHEN privacy_flag(priv, 'show_weights') THEN st.volume_kg END
    FROM athlete_window_stats(friend, days) st;
END;
$$;

-- Estatísticas do próprio para o Athlete Card
CREATE OR REPLACE FUNCTION public.get_my_card_stats()
RETURNS TABLE (total_workouts INT, streak INT, monthly_volume_kg NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT COUNT(*)::int FROM workout_sessions WHERE user_id = auth.uid()),
         athlete_streak(auth.uid()),
         (SELECT volume_kg FROM athlete_window_stats(auth.uid(), 30));
$$;

-- Funções internas não ficam expostas diretamente
REVOKE EXECUTE ON FUNCTION public.athlete_streak(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.athlete_window_stats(UUID, INT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.are_friends(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.username_available(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.search_athletes(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_friendships() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_friends_weekly_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_friend_feed(INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.toggle_respect(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_head_to_head(UUID, INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_my_card_stats() FROM anon;

-- ==============================================================================
-- 6. STORAGE: bucket público "avatars" (leitura pública, escrita só na própria pasta {uid}/...)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 1048576, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_insert_own" ON storage.objects;
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars_delete_own" ON storage.objects;
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
