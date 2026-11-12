-- AB Fitness: Blindagem de Sincronização Atómica, Metadados de Séries e Índice de Histórico
-- Correr no SQL Editor do Supabase como postgres.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.workout_sessions') IS NULL OR to_regclass('public.exercise_logs') IS NULL THEN
        RAISE EXCEPTION 'Faltam tabelas base (workout_sessions / exercise_logs).';
    END IF;
END $$;

-- ============================================================================
-- 1. EXERCISE_LOGS: Preservar tipo de série (N/W/D/F), RPE e duração isométrica
-- ============================================================================
ALTER TABLE public.exercise_logs
    ADD COLUMN IF NOT EXISTS set_type TEXT NOT NULL DEFAULT 'N',
    ADD COLUMN IF NOT EXISTS rpe NUMERIC(3, 1),
    ADD COLUMN IF NOT EXISTS duration_seconds INT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exercise_logs_set_type_check'
    ) THEN
        ALTER TABLE public.exercise_logs
            ADD CONSTRAINT exercise_logs_set_type_check CHECK (set_type IN ('N', 'W', 'D', 'F'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exercise_logs_rpe_check'
    ) THEN
        ALTER TABLE public.exercise_logs
            ADD CONSTRAINT exercise_logs_rpe_check CHECK (rpe IS NULL OR (rpe >= 1 AND rpe <= 10));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'exercise_logs_duration_seconds_check'
    ) THEN
        ALTER TABLE public.exercise_logs
            ADD CONSTRAINT exercise_logs_duration_seconds_check CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
    END IF;
END $$;

-- ============================================================================
-- 2. ÍNDICE COMPOSTO: Consulta rápida de histórico e cargas por exercício (<20ms)
-- Usado por getExerciseLastWeight e cálculos de recordes pessoais
-- ============================================================================
CREATE INDEX IF NOT EXISTS exercise_logs_user_exercise_created_idx
    ON public.exercise_logs (user_id, exercise_code, created_at DESC);

-- ============================================================================
-- 3. RPC TRANSACIONAL: sync_workout_session_atomic
-- Garante que workout_sessions + exercise_logs gravam numa única transação ACID
-- (elimina risco de sessão órfã sem séries se a rede falhar entre DELETE e INSERT).
-- SECURITY INVOKER respeita estritamente todas as policies RLS do utilizador autenticado.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.sync_workout_session_atomic(
    p_session_id UUID,
    p_workout_day_name TEXT,
    p_workout_title TEXT,
    p_duration_seconds INT DEFAULT 0,
    p_notes TEXT DEFAULT NULL,
    p_assigned_program_id UUID DEFAULT NULL,
    p_logs JSONB DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_notes TEXT := COALESCE(NULLIF(trim(p_notes), ''), 'Treino finalizado com sucesso no AB Fitness');
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
        assigned_program_id
    )
    VALUES (
        p_session_id,
        v_uid,
        COALESCE(NULLIF(trim(p_workout_day_name), ''), 'Treino'),
        COALESCE(NULLIF(trim(p_workout_title), ''), 'Treino Concluído'),
        GREATEST(0, COALESCE(p_duration_seconds, 0)),
        v_notes,
        p_assigned_program_id
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

REVOKE EXECUTE ON FUNCTION public.sync_workout_session_atomic(UUID, TEXT, TEXT, INT, TEXT, UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_workout_session_atomic(UUID, TEXT, TEXT, INT, TEXT, UUID, JSONB) TO authenticated;

COMMIT;
