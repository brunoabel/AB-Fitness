-- Motor de treino P2 (docs/TRAINING_SCIENCE_AUDIT.md, secção 6).
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261138_admin_aggregates.sql e 20261142_mesocycles.sql.
--
-- 1. Calibração individual do volume por músculo e registos dos mesociclos terminados, no mesociclo ativo,
--    para retomar a calibração noutro aparelho.
-- 2. admin_engine_metrics(): métricas agregadas do motor para o painel admin (adesão, RIR registado,
--    taxa de progressão, mesociclos e deloads reativos). Exige papel admin ou ceo.
BEGIN;

ALTER TABLE public.mesocycles
    ADD COLUMN IF NOT EXISTS calibration JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS volume_records JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.admin_engine_metrics()
RETURNS TABLE (
    profiles_28d INT,
    adherence_pct NUMERIC,
    working_sets_28d INT,
    rir_logged_pct NUMERIC,
    exercises_tracked INT,
    progressing_pct NUMERIC,
    mesocycles_active INT,
    mesocycles_completed INT,
    reactive_deloads INT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM public.assert_admin_or_ceo();
    RETURN QUERY
    WITH eligible AS (
        -- Perfis com onboarding há pelo menos 28 dias: sessões feitas / sessões planeadas nas últimas 4 semanas
        SELECT f.user_id,
               least(1.0, (
                   SELECT count(*) FROM public.workout_sessions s
                   WHERE s.user_id = f.user_id AND s.completed_at >= now() - interval '28 days'
               )::numeric / (f.days_per_week * 4)) AS adherence
        FROM public.user_fitness_profiles f
        WHERE f.onboarding_completed_at <= now() - interval '28 days' AND f.days_per_week > 0
    ),
    working AS (
        SELECT l.user_id, l.exercise_code, l.weight_kg, l.reps_completed, l.rpe, l.created_at
        FROM public.exercise_logs l
        WHERE l.completed AND coalesce(l.set_type, 'N') <> 'W'
          AND l.weight_kg > 0 AND l.reps_completed BETWEEN 1 AND 12
          AND l.created_at >= now() - interval '56 days'
    ),
    best AS (
        -- Força estimada (Epley) por exercício: últimas 4 semanas contra as 4 anteriores
        SELECT w.user_id, w.exercise_code,
               max(w.weight_kg * (1 + w.reps_completed / 30.0)) FILTER (WHERE w.created_at >= now() - interval '28 days') AS recent,
               max(w.weight_kg * (1 + w.reps_completed / 30.0)) FILTER (WHERE w.created_at < now() - interval '28 days') AS prior
        FROM working w
        GROUP BY w.user_id, w.exercise_code
    )
    SELECT
        (SELECT count(*)::int FROM eligible),
        (SELECT round(avg(e.adherence) * 100, 1) FROM eligible e),
        (SELECT count(*)::int FROM working w WHERE w.created_at >= now() - interval '28 days'),
        (SELECT round(100.0 * count(*) FILTER (WHERE w.rpe IS NOT NULL) / nullif(count(*), 0), 1)
           FROM working w WHERE w.created_at >= now() - interval '28 days'),
        (SELECT count(*)::int FROM best b WHERE b.recent IS NOT NULL AND b.prior IS NOT NULL),
        (SELECT round(100.0 * count(*) FILTER (WHERE b.recent > b.prior) / nullif(count(*), 0), 1)
           FROM best b WHERE b.recent IS NOT NULL AND b.prior IS NOT NULL),
        (SELECT count(*)::int FROM public.mesocycles m WHERE m.status = 'active'),
        (SELECT count(*)::int FROM public.mesocycles m WHERE m.status = 'completed'),
        (SELECT count(*)::int FROM public.mesocycles m WHERE m.status = 'completed' AND m.deload_week IS NOT NULL);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_engine_metrics() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_engine_metrics() TO authenticated;

CREATE INDEX IF NOT EXISTS exercise_logs_created_at_idx ON public.exercise_logs (created_at DESC);

COMMIT;
