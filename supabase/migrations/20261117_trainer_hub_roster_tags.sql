-- AB Fitness: Trainer Hub — tags livres do trainer por atleta (ex: "iniciante", "VIP",
-- "lesão no joelho") e feedback pós-treino já existente (actual_rpe/pain_flag/athlete_feedback,
-- de 20261113_trainer_hub.sql) passam a ser consumidos no Command Center.
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261116_admin_promote_coach.sql.
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
-- 1. trainer_rosters: tags livres do trainer (não entram no GRANT UPDATE direto,
-- mesmo motivo de private_notes — só a RPC set_roster_tags escreve).
-- ============================================================================
ALTER TABLE public.trainer_rosters ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.set_roster_tags(p_athlete_id UUID, p_tags TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.trainer_rosters
    SET tags = (
        SELECT COALESCE(array_agg(DISTINCT trim(t)) FILTER (WHERE trim(t) <> ''), '{}')
        FROM unnest(p_tags) AS t
    ), updated_at = timezone('utc'::text, now())
    WHERE trainer_id = auth.uid() AND athlete_id = p_athlete_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vínculo com este atleta não encontrado.' USING ERRCODE = '22023';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_roster_tags(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_roster_tags(UUID, TEXT[]) TO authenticated;

-- ============================================================================
-- 2. get_roster_overview() ganha tags (DROP + CREATE: o tipo de retorno muda)
-- ============================================================================
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
    days_trained_this_week SMALLINT[],
    tags TEXT[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id, p.id, p.full_name, p.avatar_url,
           st.workouts, st.active_days, st.volume_kg, athlete_streak(p.id),
           ls.completed_at, ls.actual_rpe, ls.pain_flag,
           COALESCE(wk.days, ARRAY[]::SMALLINT[]),
           COALESCE(r.tags, ARRAY[]::TEXT[])
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
GRANT EXECUTE ON FUNCTION public.get_roster_overview() TO authenticated;

COMMIT;
