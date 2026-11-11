-- AB Fitness: Trainer Hub — Fase 2/3 (RPCs de leitura para o Command Center e o atleta).
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261113_trainer_hub.sql.
--
-- get_muscle_fatigue_for_athlete() fica para a Fase 4 (Builder), como já estava documentado
-- em 20261113_trainer_hub.sql — ainda não é consumida por nenhuma tela.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.trainer_rosters') IS NULL THEN
        RAISE EXCEPTION 'Falta trainer_rosters. Corre antes 20261113_trainer_hub.sql.';
    END IF;
END $$;

-- ============================================================================
-- 1. get_my_trainer: o atleta lê o trainer ativo sem precisar de SELECT direto em profiles de terceiros
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_my_trainer()
RETURNS TABLE (trainer_id UUID, full_name TEXT, avatar_url TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, p.full_name, p.avatar_url
    FROM public.trainer_rosters r
    JOIN public.profiles p ON p.id = r.trainer_id
    WHERE r.athlete_id = (SELECT auth.uid()) AND r.status = 'active'
    LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_trainer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_trainer() TO authenticated;

-- ============================================================================
-- 2. get_roster_overview: Command Center do trainer (KPIs + lista), reaproveitando
-- athlete_window_stats()/athlete_streak() já existentes (20261109_social_profiles.sql)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_roster_overview()
RETURNS TABLE (
    roster_id UUID,
    athlete_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    workouts_7d INT,
    active_days_7d INT,
    volume_7d_kg NUMERIC,
    streak INT,
    last_session_at TIMESTAMPTZ,
    last_actual_rpe NUMERIC,
    last_pain_flag BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id, p.id, p.full_name, p.avatar_url,
           st.workouts, st.active_days, st.volume_kg, athlete_streak(p.id),
           ls.completed_at, ls.actual_rpe, ls.pain_flag
    FROM trainer_rosters r
    JOIN profiles p ON p.id = r.athlete_id
    CROSS JOIN LATERAL athlete_window_stats(p.id, 7) st
    LEFT JOIN LATERAL (
        SELECT s.completed_at, s.actual_rpe, s.pain_flag
        FROM workout_sessions s
        WHERE s.user_id = p.id
        ORDER BY s.completed_at DESC
        LIMIT 1
    ) ls ON true
    WHERE r.trainer_id = (SELECT auth.uid()) AND r.status = 'active'
    ORDER BY p.full_name;
$$;

REVOKE EXECUTE ON FUNCTION public.get_roster_overview() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_roster_overview() TO authenticated;

-- ============================================================================
-- 3. workout_sessions: apertar as policies já existentes para também validar
-- assigned_program_id (mesmo padrão já usado em exercise_logs para session_id/exercise_id)
-- ============================================================================
DROP POLICY IF EXISTS workout_sessions_insert_own ON public.workout_sessions;
CREATE POLICY workout_sessions_insert_own ON public.workout_sessions FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = user_id
        AND (assigned_program_id IS NULL OR EXISTS (
            SELECT 1 FROM public.assigned_programs ap
            WHERE ap.id = assigned_program_id AND ap.athlete_id = (SELECT auth.uid())
        ))
    );

DROP POLICY IF EXISTS workout_sessions_update_own ON public.workout_sessions;
CREATE POLICY workout_sessions_update_own ON public.workout_sessions FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK (
        (SELECT auth.uid()) = user_id
        AND (assigned_program_id IS NULL OR EXISTS (
            SELECT 1 FROM public.assigned_programs ap
            WHERE ap.id = assigned_program_id AND ap.athlete_id = (SELECT auth.uid())
        ))
    );

COMMIT;
