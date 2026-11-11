-- AB Fitness: Trainer Hub — redesign da interface (Command Center master-detail).
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261114_trainer_hub_rpcs.sql.
--
-- get_roster_overview() ganha days_trained_this_week (dias ISO 1=Seg..7=Dom em que o atleta
-- treinou na semana corrente), usado pela grelha semanal de aderência no Command Center.
-- O tipo de retorno muda, por isso DROP + CREATE em vez de CREATE OR REPLACE.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regprocedure('public.get_roster_overview()') IS NULL THEN
        RAISE EXCEPTION 'Falta get_roster_overview(). Corre antes 20261114_trainer_hub_rpcs.sql.';
    END IF;
END $$;

DROP FUNCTION IF EXISTS public.get_roster_overview();

CREATE FUNCTION public.get_roster_overview()
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
    last_pain_flag BOOLEAN,
    days_trained_this_week SMALLINT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id, p.id, p.full_name, p.avatar_url,
           st.workouts, st.active_days, st.volume_kg, athlete_streak(p.id),
           ls.completed_at, ls.actual_rpe, ls.pain_flag,
           COALESCE(wk.days, ARRAY[]::SMALLINT[])
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
    LEFT JOIN LATERAL (
        SELECT array_agg(DISTINCT extract(isodow FROM s.completed_at)::smallint ORDER BY extract(isodow FROM s.completed_at)::smallint) AS days
        FROM workout_sessions s
        WHERE s.user_id = p.id AND s.completed_at >= date_trunc('week', now())
    ) wk ON true
    WHERE r.trainer_id = (SELECT auth.uid()) AND r.status = 'active'
    ORDER BY p.full_name;
$$;

REVOKE EXECUTE ON FUNCTION public.get_roster_overview() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_roster_overview() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_roster_overview() TO authenticated;

COMMIT;
