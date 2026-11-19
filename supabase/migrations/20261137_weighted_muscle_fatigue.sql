-- AB Fitness: fadiga muscular ponderada por esforço e intensidade, modulada pela prontidão
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261136_ab_coach_quota_and_context.sql.
--
-- Espelho exato de src/utils/muscleFatigue.js (computeLocalFatigue):
--   fator da série  = esforço × intensidade
--     esforço       = RPE registado: clamp(1 + 0.075 × (2 − (10 − RPE)), 0.7, 1.15); sem RPE 1.0
--     intensidade   = ≤5 reps 1.1, 6 a 15 1.0, 16 a 25 0.9, >25 0.8; séries de tempo 1.0
--   séries de aquecimento (W) deixam de contar, como no cálculo local
--   meia-vida × m, com m pela prontidão mais recente (athlete_biometrics, últimas 36 h):
--     <55 → 1.25, <70 → 1.1, ≥85 → 0.9, resto ou sem dados → 1.0
--   corridas como em 20261130 (quadríceps 0.7, posteriores 0.6, gémeos 0.9)
--
-- compute_muscle_fatigue() é a fonte única; get_muscle_fatigue (o próprio atleta) e
-- get_athlete_recovery_for_trainer (PT vinculado) passam a usá-la.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.compute_muscle_fatigue(p_uid UUID, p_window_hours INT DEFAULT 72)
RETURNS TABLE (
    muscle_id TEXT,
    fatigue NUMERIC,
    recovery NUMERIC,
    last_trained_at TIMESTAMPTZ,
    hours_to_recovered NUMERIC,
    sort_order SMALLINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH window_limit AS (
    SELECT make_interval(hours => least(greatest(coalesce(p_window_hours, 72), 24), 168)) AS w
  ),
  latest_readiness AS (
    SELECT b.recovery_score::numeric AS score
    FROM public.athlete_biometrics b
    WHERE b.user_id = p_uid
      AND b.recovery_score IS NOT NULL
      AND b.date >= (now() - interval '36 hours')::date
    ORDER BY b.date DESC, b.updated_at DESC
    LIMIT 1
  ),
  readiness_mult AS (
    SELECT CASE
             WHEN x.score IS NULL THEN 1.0
             WHEN x.score < 55 THEN 1.25
             WHEN x.score < 70 THEN 1.1
             WHEN x.score >= 85 THEN 0.9
             ELSE 1.0
           END::numeric AS m
    FROM (SELECT (SELECT score FROM latest_readiness) AS score) x
  ),
  weighted_sets AS (
    SELECT s.id AS session_id, s.completed_at, l.exercise_code,
           sum(
             (CASE WHEN l.rpe BETWEEN 1 AND 10
                   THEN least(1.15, greatest(0.7, 1 + 0.075 * (2 - (10 - l.rpe))))
                   ELSE 1.0 END)
             * (CASE WHEN l.duration_seconds IS NOT NULL THEN 1.0
                     WHEN l.reps_completed <= 5 THEN 1.1
                     WHEN l.reps_completed <= 15 THEN 1.0
                     WHEN l.reps_completed <= 25 THEN 0.9
                     ELSE 0.8 END)
           )::numeric AS n
    FROM public.workout_sessions s
    JOIN public.exercise_logs l ON l.session_id = s.id
    CROSS JOIN window_limit wl
    WHERE s.user_id = p_uid
      AND s.completed_at >= now() - wl.w
      AND s.completed_at <= now()
      AND l.completed
      AND l.reps_completed > 0
      AND coalesce(l.set_type, 'N') <> 'W'
    GROUP BY 1, 2, 3
  ),
  workout_stimulus AS (
    SELECT h.session_id::text AS event_id, h.completed_at, t.muscle_id, sum(h.n * t.weight) AS s
    FROM weighted_sets h
    JOIN public.exercise_muscle_targets t ON t.exercise_code = h.exercise_code
    GROUP BY 1, 2, 3
  ),
  runs_data AS (
    SELECT r.id::text AS event_id,
           r.created_at AS completed_at,
           (r.distance_km / 2.5) * (1 + coalesce(r.elevation_gain_m, 0)::numeric / 300.0) AS s_base
    FROM public.runs r
    CROSS JOIN window_limit wl
    WHERE r.user_id = p_uid
      AND r.created_at >= now() - wl.w
      AND r.created_at <= now()
      AND r.distance_km > 0
  ),
  runs_stimulus AS (
    SELECT rd.event_id, rd.completed_at, m.muscle_id, (rd.s_base * m.weight) AS s
    FROM runs_data rd
    CROSS JOIN (
      VALUES
        ('quadriceps', 0.7::numeric),
        ('posteriores', 0.6::numeric),
        ('gemeos', 0.9::numeric)
    ) AS m(muscle_id, weight)
  ),
  all_stimulus AS (
    SELECT event_id, completed_at, muscle_id, s FROM workout_stimulus
    UNION ALL
    SELECT event_id, completed_at, muscle_id, s FROM runs_stimulus
  ),
  per_session AS (
    SELECT x.muscle_id, x.completed_at,
           100 * (1 - exp(-x.s / 6.0))
               * power(0.5, extract(epoch FROM now() - x.completed_at) / 3600.0 / (r.half_life_h * rm.m)) AS f
    FROM all_stimulus x
    JOIN public.muscle_regions r ON r.muscle_id = x.muscle_id
    CROSS JOIN readiness_mult rm
  ),
  combined AS (
    SELECT p.muscle_id,
           100 * (1 - exp(sum(ln(greatest(1 - p.f / 100, 1e-6))))) AS f,
           max(p.completed_at) AS last_at
    FROM per_session p
    GROUP BY 1
  )
  SELECT r.muscle_id,
         round(coalesce(c.f, 0), 1) AS fatigue,
         round(100 - coalesce(c.f, 0), 1) AS recovery,
         c.last_at AS last_trained_at,
         CASE WHEN coalesce(c.f, 0) <= 35 THEN 0
              ELSE round(r.half_life_h * rm.m * ln(c.f / 35) / ln(2)) END AS hours_to_recovered,
         r.sort_order
  FROM public.muscle_regions r
  CROSS JOIN readiness_mult rm
  LEFT JOIN combined c ON c.muscle_id = r.muscle_id
  ORDER BY r.sort_order;
$$;

-- Só chamada a partir das funções abaixo (que fixam o utilizador e validam o acesso)
REVOKE ALL ON FUNCTION public.compute_muscle_fatigue(UUID, INT) FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- get_muscle_fatigue: o próprio atleta. Passa a SECURITY DEFINER para poder usar a função
-- interna; o utilizador continua fixado em auth.uid().
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_muscle_fatigue(p_window_hours INT DEFAULT 72)
RETURNS TABLE (
    muscle_id TEXT,
    fatigue NUMERIC,
    recovery NUMERIC,
    last_trained_at TIMESTAMPTZ,
    hours_to_recovered NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT f.muscle_id, f.fatigue, f.recovery, f.last_trained_at, f.hours_to_recovered
  FROM public.compute_muscle_fatigue((SELECT auth.uid()), p_window_hours) f
  WHERE (SELECT auth.uid()) IS NOT NULL
  ORDER BY f.sort_order;
$$;

REVOKE ALL ON FUNCTION public.get_muscle_fatigue(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_muscle_fatigue(INT) TO authenticated;

-- ============================================================================
-- get_athlete_recovery_for_trainer: mesmo modelo para o PT vinculado
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_athlete_recovery_for_trainer(p_athlete_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_bio JSONB;
    v_fatigue JSONB;
BEGIN
    IF NOT public.is_active_trainer_of(p_athlete_id) THEN
        RAISE EXCEPTION 'Acesso negado: atleta não vinculado.' USING ERRCODE = '42501';
    END IF;

    SELECT to_jsonb(b) INTO v_bio
    FROM (
        SELECT provider, date, recovery_score, hrv_ms, resting_hr_bpm, sleep_score, day_strain, last_point.updated_at
        FROM public.athlete_biometrics AS last_point
        WHERE user_id = p_athlete_id
        ORDER BY date DESC, updated_at DESC
        LIMIT 1
    ) b;

    SELECT coalesce(jsonb_agg(jsonb_build_object(
             'muscle_id', f.muscle_id,
             'fatigue', f.fatigue,
             'recovery', f.recovery
           ) ORDER BY f.sort_order), '[]'::jsonb)
    INTO v_fatigue
    FROM public.compute_muscle_fatigue(p_athlete_id, 72) f;

    RETURN jsonb_build_object(
      'biometrics', v_bio,
      'fatigue', v_fatigue
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_athlete_recovery_for_trainer(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_athlete_recovery_for_trainer(UUID) TO authenticated;

COMMIT;
