-- AB Fitness: integridade P0 (trial PRO, data real do treino, fuso horário, histórico paginado)
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261133_trainer_b2b2c_trial_and_biometrics.sql.
--
-- 1. trial_ends_at, trial_granted_at e stripe_customer_id deixam de ser editáveis pelo próprio utilizador.
--    O trial B2B2C só é concedido uma vez por conta (trial_granted_at).
-- 2. sync_workout_session_atomic aceita p_completed_at (hora real do treino, limitada a 14 dias atrás).
-- 3. profiles.timezone: streak e estatísticas agrupam dias no fuso do atleta, não em UTC.
-- 4. get_my_workout_history: histórico paginado do próprio utilizador, para hidratar o cliente.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- ============================================================================
-- 1. COLUNAS NOVAS
-- ============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_granted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo';

-- Quem já recebeu trial antes desta migration conta como trial concedido
UPDATE public.profiles SET trial_granted_at = COALESCE(trial_granted_at, now())
WHERE trial_ends_at IS NOT NULL AND trial_granted_at IS NULL;

-- ============================================================================
-- 2. GUARDA DE COLUNAS PROTEGIDAS (UPDATE)
-- trial_* só muda via redeem_trainer_invite_code (flag local ab.trial_grant) ou service_role/admin.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_privileged BOOLEAN := coalesce(auth.role(), '') = 'service_role'
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'ceo')
        );
BEGIN
    IF v_privileged THEN
        RETURN NEW;
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
       OR NEW.is_premium IS DISTINCT FROM OLD.is_premium
       OR NEW.is_pro IS DISTINCT FROM OLD.is_pro
       OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
    THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel ou estatuto de verificação/subscrição do utilizador.'
            USING ERRCODE = '42501';
    END IF;

    IF NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
       OR NEW.trial_granted_at IS DISTINCT FROM OLD.trial_granted_at
    THEN
        IF coalesce(current_setting('ab.trial_grant', true), '') <> 'on'
           OR NEW.trial_ends_at > now() + interval '15 days'
        THEN
            RAISE EXCEPTION 'Não é permitido alterar o período de teste.' USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 3. GUARDA NO INSERT: um perfil criado pelo cliente nasce sem privilégios pagos
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sanitize_profile_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
        NEW.is_pro := false;
        NEW.is_premium := false;
        NEW.is_verified := false;
        NEW.trial_ends_at := NULL;
        NEW.trial_granted_at := NULL;
        NEW.stripe_customer_id := NULL;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sanitize_profile_insert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_sanitize_profile_insert ON public.profiles;
CREATE TRIGGER trg_sanitize_profile_insert
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sanitize_profile_insert();

-- ============================================================================
-- 4. FUSO HORÁRIO VÁLIDO (fuso inválido quebraria o AT TIME ZONE das estatísticas)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.validate_profile_timezone()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF NEW.timezone IS NULL
       OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name = NEW.timezone)
    THEN
        NEW.timezone := 'America/Sao_Paulo';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_profile_timezone ON public.profiles;
CREATE TRIGGER trg_validate_profile_timezone
    BEFORE INSERT OR UPDATE OF timezone ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.validate_profile_timezone();

-- ============================================================================
-- 5. TRIAL B2B2C: uma vez por conta
-- ============================================================================
CREATE OR REPLACE FUNCTION public.redeem_trainer_invite_code(p_code TEXT)
RETURNS TABLE (trainer_id UUID, trainer_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_trainer_id UUID;
    v_trainer_name TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE = '28000';
    END IF;

    SELECT id, full_name INTO v_trainer_id, v_trainer_name
    FROM public.profiles
    WHERE trainer_invite_code = upper(trim(p_code)) AND role IN ('coach', 'admin', 'ceo');

    IF v_trainer_id IS NULL THEN
        RAISE EXCEPTION 'Código de convite inválido.' USING ERRCODE = '22023';
    END IF;

    IF v_trainer_id = v_uid THEN
        RAISE EXCEPTION 'Não podes vincular-te a ti próprio.' USING ERRCODE = '22023';
    END IF;

    UPDATE public.trainer_rosters
    SET status = 'archived', updated_at = timezone('utc'::text, now())
    WHERE athlete_id = v_uid AND trainer_id <> v_trainer_id AND status = 'active';

    INSERT INTO public.trainer_rosters (trainer_id, athlete_id, status)
    VALUES (v_trainer_id, v_uid, 'active')
    ON CONFLICT (trainer_id, athlete_id) DO UPDATE
        SET status = 'active', updated_at = timezone('utc'::text, now())
        WHERE public.trainer_rosters.status <> 'active';

    -- Trial PRO B2B2C de 14 dias: só na primeira vez que a conta é vinculada
    PERFORM set_config('ab.trial_grant', 'on', true);
    UPDATE public.profiles
    SET trial_ends_at = now() + interval '14 days',
        trial_granted_at = now(),
        updated_at = timezone('utc'::text, now())
    WHERE id = v_uid AND trial_granted_at IS NULL;
    PERFORM set_config('ab.trial_grant', 'off', true);

    RETURN QUERY SELECT v_trainer_id, v_trainer_name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) TO authenticated;

-- ============================================================================
-- 6. SYNC ATÓMICO COM HORA REAL DO TREINO
-- A assinatura antiga é removida para o PostgREST não ficar com sobrecarga ambígua.
-- ============================================================================
DROP FUNCTION IF EXISTS public.sync_workout_session_atomic(UUID, TEXT, TEXT, INT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.sync_workout_session_atomic(
    p_session_id UUID,
    p_workout_day_name TEXT,
    p_workout_title TEXT,
    p_duration_seconds INT DEFAULT 0,
    p_notes TEXT DEFAULT NULL,
    p_assigned_program_id UUID DEFAULT NULL,
    p_logs JSONB DEFAULT '[]'::jsonb,
    p_completed_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_notes TEXT := COALESCE(NULLIF(trim(p_notes), ''), 'Treino finalizado com sucesso no AB Fitness');
    v_completed_at TIMESTAMPTZ := LEAST(now(), GREATEST(now() - interval '14 days', COALESCE(p_completed_at, now())));
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária para sincronizar treino.' USING ERRCODE = '42501';
    END IF;

    IF p_session_id IS NULL THEN
        RAISE EXCEPTION 'session_id obrigatório.' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.workout_sessions (
        id,
        user_id,
        workout_day_name,
        workout_title,
        duration_seconds,
        notes,
        assigned_program_id,
        completed_at
    )
    VALUES (
        p_session_id,
        v_uid,
        COALESCE(NULLIF(trim(p_workout_day_name), ''), 'Treino'),
        COALESCE(NULLIF(trim(p_workout_title), ''), 'Treino Concluído'),
        GREATEST(0, COALESCE(p_duration_seconds, 0)),
        v_notes,
        p_assigned_program_id,
        v_completed_at
    )
    ON CONFLICT (id) DO NOTHING;

    IF NOT EXISTS (
        SELECT 1 FROM public.workout_sessions s WHERE s.id = p_session_id AND s.user_id = v_uid
    ) THEN
        RAISE EXCEPTION 'Sessão pertence a outro utilizador ou não pôde ser criada.' USING ERRCODE = '42501';
    END IF;

    DELETE FROM public.exercise_logs
    WHERE session_id = p_session_id AND user_id = v_uid;

    IF p_logs IS NOT NULL AND jsonb_typeof(p_logs) = 'array' AND jsonb_array_length(p_logs) > 0 THEN
        INSERT INTO public.exercise_logs (
            user_id,
            session_id,
            exercise_code,
            set_number,
            weight_kg,
            reps_completed,
            completed,
            set_type,
            rpe,
            duration_seconds
        )
        SELECT
            v_uid,
            p_session_id,
            COALESCE(NULLIF(trim(elem->>'exercise_code'), ''), 'unknown'),
            GREATEST(1, COALESCE((elem->>'set_number')::INT, 1)),
            GREATEST(0, COALESCE((elem->>'weight_kg')::NUMERIC(6, 2), 0)),
            GREATEST(0, COALESCE((elem->>'reps_completed')::INT, 0)),
            COALESCE((elem->>'completed')::BOOLEAN, false),
            CASE
                WHEN upper(COALESCE(elem->>'set_type', 'N')) IN ('N', 'W', 'D', 'F')
                    THEN upper(elem->>'set_type')
                ELSE 'N'
            END,
            CASE
                WHEN (elem->>'rpe') IS NOT NULL AND (elem->>'rpe') <> ''
                     AND (elem->>'rpe')::NUMERIC BETWEEN 1 AND 10
                    THEN (elem->>'rpe')::NUMERIC(3, 1)
                ELSE NULL
            END,
            CASE
                WHEN (elem->>'duration_seconds') IS NOT NULL AND (elem->>'duration_seconds') <> ''
                     AND (elem->>'duration_seconds')::INT >= 0
                    THEN (elem->>'duration_seconds')::INT
                ELSE NULL
            END
        FROM jsonb_array_elements(p_logs) AS elem;
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.sync_workout_session_atomic(UUID, TEXT, TEXT, INT, TEXT, UUID, JSONB, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_workout_session_atomic(UUID, TEXT, TEXT, INT, TEXT, UUID, JSONB, TIMESTAMPTZ) TO authenticated;

-- ============================================================================
-- 7. STREAK E ESTATÍSTICAS NO FUSO DO ATLETA
-- ============================================================================
CREATE OR REPLACE FUNCTION public.athlete_streak(uid UUID)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH tz AS (
    SELECT COALESCE((SELECT timezone FROM profiles WHERE id = uid), 'America/Sao_Paulo') AS name
  ), d AS (
    SELECT DISTINCT (s.completed_at AT TIME ZONE tz.name)::date AS day
    FROM workout_sessions s, tz WHERE s.user_id = uid
  ), g AS (
    SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp FROM d
  ), runs AS (
    SELECT MAX(day) AS last_day, COUNT(*)::int AS len FROM g GROUP BY grp
  )
  SELECT COALESCE((
    SELECT len FROM runs, tz
    WHERE last_day >= (now() AT TIME ZONE tz.name)::date - 1
    ORDER BY last_day DESC LIMIT 1
  ), 0);
$$;

CREATE OR REPLACE FUNCTION public.athlete_window_stats(uid UUID, days INT)
RETURNS TABLE (workouts INT, active_days INT, volume_kg NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH tz AS (
    SELECT COALESCE((SELECT timezone FROM profiles WHERE id = uid), 'America/Sao_Paulo') AS name
  )
  SELECT
    (SELECT COUNT(*)::int FROM workout_sessions s WHERE s.user_id = uid AND s.completed_at >= now() - make_interval(days => days)),
    (SELECT COUNT(DISTINCT (s.completed_at AT TIME ZONE tz.name)::date)::int FROM workout_sessions s, tz
       WHERE s.user_id = uid AND s.completed_at >= now() - make_interval(days => days)),
    (SELECT COALESCE(SUM(l.weight_kg * l.reps_completed), 0) FROM exercise_logs l
       WHERE l.user_id = uid AND l.completed AND l.created_at >= now() - make_interval(days => days));
$$;

REVOKE EXECUTE ON FUNCTION public.athlete_streak(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.athlete_window_stats(UUID, INT) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- 8. HISTÓRICO PAGINADO DO PRÓPRIO UTILIZADOR (RLS aplicada: SECURITY INVOKER)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_workout_history(
    p_before TIMESTAMPTZ DEFAULT NULL,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    workout_day_name TEXT,
    workout_title TEXT,
    duration_seconds INT,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    assigned_program_id UUID,
    logs JSONB
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.workout_day_name,
    s.workout_title,
    s.duration_seconds,
    s.notes,
    s.completed_at,
    s.assigned_program_id,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
               'exercise_code', l.exercise_code,
               'set_number', l.set_number,
               'weight_kg', l.weight_kg,
               'reps_completed', l.reps_completed,
               'completed', l.completed,
               'set_type', l.set_type,
               'rpe', l.rpe,
               'duration_seconds', l.duration_seconds
             ) ORDER BY l.exercise_code, l.set_number)
      FROM exercise_logs l
      WHERE l.session_id = s.id AND l.user_id = s.user_id
    ), '[]'::jsonb) AS logs
  FROM workout_sessions s
  WHERE s.user_id = (SELECT auth.uid())
    AND (p_before IS NULL OR s.completed_at < p_before)
  ORDER BY s.completed_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 200);
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_workout_history(TIMESTAMPTZ, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_workout_history(TIMESTAMPTZ, INT) TO authenticated;
-- Índice (user_id, completed_at DESC) já existe: workout_sessions_user_completed_idx (20261110).

COMMIT;
