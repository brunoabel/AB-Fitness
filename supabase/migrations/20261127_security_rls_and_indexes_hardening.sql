-- AB Fitness: Endurecimento Global de Segurança, RLS, Storage, Funções SECURITY DEFINER e Índices
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261126_trainer_hub_rls_and_notes.sql.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- ============================================================================
-- 1. PROFILES: Bloquear auto-promoção a is_verified, is_pro, is_premium e role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (
         NEW.role IS DISTINCT FROM OLD.role
         OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
         OR NEW.is_premium IS DISTINCT FROM OLD.is_premium
         OR NEW.is_pro IS DISTINCT FROM OLD.is_pro
       )
       AND coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'ceo')
       )
    THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel ou estatuto de verificação/subscrição do utilizador.'
            USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 2. ARE_FRIENDS: Permitir execução por authenticated nas policies RLS
-- (restringindo consulta a pares em que o próprio utilizador participa ou admin/ceo)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.are_friends(a UUID, b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.friendships
        WHERE status = 'accepted'
          AND LEAST(requester_id, addressee_id) = LEAST(a, b)
          AND GREATEST(requester_id, addressee_id) = GREATEST(a, b)
          AND (
              (SELECT auth.uid()) IN (a, b)
              OR EXISTS (
                  SELECT 1 FROM public.profiles p
                  WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'ceo')
              )
          )
    );
$$;

REVOKE ALL ON FUNCTION public.are_friends(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.are_friends(UUID, UUID) TO authenticated;

-- ============================================================================
-- 3. FORCE ROW LEVEL SECURITY & REVOKE DE PUBLIC/ANON NAS TABELAS PÓS-20261112
-- ============================================================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'athlete_posts',
        'post_respects',
        'friend_messages',
        'wearable_connections',
        'athlete_biometrics',
        'waitlist'
    ]
    LOOP
        IF to_regclass('public.' || t) IS NOT NULL THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
            EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
            EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon', t);
            EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
        END IF;
    END LOOP;
END $$;

-- Preservar INSERT público apenas na waitlist de marketing
GRANT INSERT ON public.waitlist TO anon, authenticated;
GRANT SELECT ON public.waitlist TO authenticated;

-- ============================================================================
-- 4. FRIEND_MESSAGES: Trancar UPDATE apenas à coluna read_at + WITH CHECK + tamanho
-- ============================================================================
REVOKE UPDATE, DELETE ON public.friend_messages FROM authenticated;
GRANT SELECT, INSERT ON public.friend_messages TO authenticated;
GRANT UPDATE (read_at) ON public.friend_messages TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'friend_messages_content_len_check'
    ) THEN
        ALTER TABLE public.friend_messages
            ADD CONSTRAINT friend_messages_content_len_check
            CHECK (char_length(trim(content)) BETWEEN 1 AND 2000);
    END IF;
END $$;

DROP POLICY IF EXISTS "friend_messages_select" ON public.friend_messages;
CREATE POLICY "friend_messages_select" ON public.friend_messages
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) IN (sender_id, receiver_id));

DROP POLICY IF EXISTS "friend_messages_insert" ON public.friend_messages;
CREATE POLICY "friend_messages_insert" ON public.friend_messages
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = sender_id AND public.are_friends(sender_id, receiver_id));

DROP POLICY IF EXISTS "friend_messages_update" ON public.friend_messages;
CREATE POLICY "friend_messages_update" ON public.friend_messages
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = receiver_id)
    WITH CHECK ((SELECT auth.uid()) = receiver_id);

-- ============================================================================
-- 5. WEARABLES & BIOMETRICS: WITH CHECK explícito e política DELETE em falta
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wearable_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_biometrics TO authenticated;

DROP POLICY IF EXISTS "wearables_select_own" ON public.wearable_connections;
CREATE POLICY "wearables_select_own" ON public.wearable_connections
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "wearables_insert_own" ON public.wearable_connections;
CREATE POLICY "wearables_insert_own" ON public.wearable_connections
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "wearables_update_own" ON public.wearable_connections;
CREATE POLICY "wearables_update_own" ON public.wearable_connections
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "wearables_delete_own" ON public.wearable_connections;
CREATE POLICY "wearables_delete_own" ON public.wearable_connections
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "biometrics_select_own" ON public.athlete_biometrics;
CREATE POLICY "biometrics_select_own" ON public.athlete_biometrics
    FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "biometrics_insert_own" ON public.athlete_biometrics;
CREATE POLICY "biometrics_insert_own" ON public.athlete_biometrics
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "biometrics_update_own" ON public.athlete_biometrics;
CREATE POLICY "biometrics_update_own" ON public.athlete_biometrics
    FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "biometrics_delete_own" ON public.athlete_biometrics;
CREATE POLICY "biometrics_delete_own" ON public.athlete_biometrics
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- 6. RPCs SECURITY DEFINER: toggle_post_respect, get_friend_feed, get_public_athlete_pass
-- ============================================================================
CREATE OR REPLACE FUNCTION public.toggle_post_respect(target_post UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_owner UUID;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE = '28000';
    END IF;

    SELECT user_id INTO v_owner FROM public.athlete_posts WHERE id = target_post;
    IF v_owner IS NULL OR (v_owner <> v_uid AND NOT public.are_friends(v_uid, v_owner)) THEN
        RAISE EXCEPTION 'Só podes dar respect a publicações tuas ou de amigos.' USING ERRCODE = '42501';
    END IF;

    IF EXISTS (SELECT 1 FROM public.post_respects WHERE post_id = target_post AND user_id = v_uid) THEN
        DELETE FROM public.post_respects WHERE post_id = target_post AND user_id = v_uid;
    ELSE
        INSERT INTO public.post_respects (post_id, user_id) VALUES (target_post, v_uid);
    END IF;

    UPDATE public.athlete_posts
    SET respect_count = (SELECT COUNT(*)::int FROM public.post_respects WHERE post_id = target_post)
    WHERE id = target_post;

    RETURN (SELECT respect_count FROM public.athlete_posts WHERE id = target_post);
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_post_respect(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.toggle_post_respect(UUID) TO authenticated;

-- get_friend_feed: respeitar workout_sessions.is_shared = true
CREATE OR REPLACE FUNCTION public.get_friend_feed(max_items INT DEFAULT 30)
RETURNS TABLE (
    session_id UUID,
    friend_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    workout_title TEXT,
    duration_seconds INT,
    completed_at TIMESTAMPTZ,
    volume_kg NUMERIC,
    top_exercises TEXT[],
    respect_count INT,
    respected_by_me BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT s.id, p.id, p.username, p.full_name, p.avatar_url,
           s.workout_title, s.duration_seconds, s.completed_at,
           CASE WHEN public.privacy_flag(p.privacy_settings, 'show_weights') THEN
               (SELECT COALESCE(SUM(l.weight_kg * l.reps_completed), 0)
                FROM public.exercise_logs l WHERE l.session_id = s.id AND l.completed)
           END,
           ARRAY(
               SELECT l.exercise_code FROM public.exercise_logs l
               WHERE l.session_id = s.id AND l.completed
               GROUP BY l.exercise_code
               ORDER BY MAX(l.weight_kg * l.reps_completed) DESC
               LIMIT 3
           ),
           (SELECT COUNT(*)::int FROM public.workout_respects r WHERE r.session_id = s.id),
           EXISTS (SELECT 1 FROM public.workout_respects r WHERE r.session_id = s.id AND r.user_id = (SELECT auth.uid()))
    FROM public.workout_sessions s
    JOIN public.profiles p ON p.id = s.user_id
    WHERE s.is_shared = true
      AND public.are_friends((SELECT auth.uid()), s.user_id)
      AND public.privacy_flag(p.privacy_settings, 'show_history')
      AND s.completed_at >= now() - interval '30 days'
    ORDER BY s.completed_at DESC
    LIMIT LEAST(GREATEST(max_items, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_friend_feed(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friend_feed(INT) TO authenticated;

-- get_public_athlete_pass: respeitar show_history em total_workouts
CREATE OR REPLACE FUNCTION public.get_public_athlete_pass(p_username TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    athlete_tag TEXT,
    home_gym TEXT,
    cover_style TEXT,
    featured_stat TEXT,
    is_verified BOOLEAN,
    is_pro BOOLEAN,
    is_ceo BOOLEAN,
    total_workouts INT,
    streak INT,
    monthly_volume_kg NUMERIC,
    friendship_status TEXT,
    i_requested BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH target AS (
        SELECT
            p.*,
            lower(ltrim(trim(COALESCE(p_username, '')), '@')) AS q_user
        FROM public.profiles p
        WHERE p.username IS NOT NULL
          AND char_length(ltrim(trim(COALESCE(p_username, '')), '@')) >= 3
          AND lower(p.username) = lower(ltrim(trim(COALESCE(p_username, '')), '@'))
          AND public.privacy_flag(p.privacy_settings, 'public_profile', true)
        LIMIT 1
    ),
    stats AS (
        SELECT
            t.id,
            CASE
                WHEN public.privacy_flag(t.privacy_settings, 'show_history', true)
                    THEN (SELECT COUNT(*)::int FROM public.workout_sessions s WHERE s.user_id = t.id)
                ELSE 0
            END AS total_workouts,
            CASE
                WHEN public.privacy_flag(t.privacy_settings, 'show_streak', true)
                    THEN public.athlete_streak(t.id)
                ELSE 0
            END AS streak,
            CASE
                WHEN public.privacy_flag(t.privacy_settings, 'show_weights', true)
                    THEN (SELECT w.volume_kg FROM public.athlete_window_stats(t.id, 30) w)
                ELSE 0::numeric
            END AS monthly_volume_kg
        FROM target t
    )
    SELECT
        t.id,
        t.username,
        t.full_name,
        t.avatar_url,
        t.bio,
        t.athlete_tag,
        t.home_gym,
        t.cover_style,
        t.featured_stat,
        COALESCE(t.is_verified, false) AS is_verified,
        (COALESCE(t.is_pro, false) OR COALESCE(t.is_premium, false) OR t.role = 'ceo') AS is_pro,
        (t.role = 'ceo') AS is_ceo,
        st.total_workouts,
        st.streak,
        st.monthly_volume_kg,
        f.status AS friendship_status,
        (f.requester_id = (SELECT auth.uid())) AS i_requested
    FROM target t
    JOIN stats st ON st.id = t.id
    LEFT JOIN public.friendships f
      ON (SELECT auth.uid()) IS NOT NULL
     AND LEAST(f.requester_id, f.addressee_id) = LEAST(t.id, (SELECT auth.uid()))
     AND GREATEST(f.requester_id, f.addressee_id) = GREATEST(t.id, (SELECT auth.uid()))
    WHERE COALESCE(f.status, '') <> 'blocked';
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_athlete_pass(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_athlete_pass(TEXT) TO anon, authenticated;

-- ============================================================================
-- 7. STORAGE BUCKET 'posts': impedir listagem pública de pastas de terceiros
-- ============================================================================
DROP POLICY IF EXISTS "posts_public_read" ON storage.objects;
DROP POLICY IF EXISTS "posts_select_own" ON storage.objects;
CREATE POLICY "posts_select_own" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "posts_update_own" ON storage.objects;
CREATE POLICY "posts_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
    WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

-- ============================================================================
-- 8. ÍNDICES EM CONSULTAS QUENTES (DMs, janela de volume 7d/30d e programas)
-- ============================================================================
CREATE INDEX IF NOT EXISTS friend_messages_receiver_sender_idx
    ON public.friend_messages (receiver_id, sender_id, created_at DESC);

CREATE INDEX IF NOT EXISTS exercise_logs_user_created_completed_idx
    ON public.exercise_logs (user_id, created_at DESC)
    WHERE completed = true;

DROP INDEX IF EXISTS public.assigned_programs_athlete_idx;
CREATE INDEX IF NOT EXISTS assigned_programs_athlete_idx
    ON public.assigned_programs (athlete_id, status, assigned_at DESC);

COMMIT;
