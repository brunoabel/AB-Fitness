-- Migration: 20261130_runs_muscle_fatigue.sql
-- Injeta corridas das últimas 72h como estímulo de fadiga nos membros inferiores
-- S_run = (distance_km / 2.5) * (1 + coalesce(elevation_gain_m, 0) / 300.0)
-- Distribuído em: quadriceps (0.7), posteriores (0.6), gemeos (0.9)

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
SECURITY INVOKER
SET search_path = ''
AS $$
  WITH window_limit AS (
    SELECT make_interval(hours => least(greatest(coalesce(p_window_hours, 72), 24), 168)) AS w
  ),
  hard_sets AS (
    SELECT s.id AS session_id, s.completed_at, l.exercise_code, count(*)::numeric AS n
    FROM public.workout_sessions s
    JOIN public.exercise_logs l ON l.session_id = s.id
    CROSS JOIN window_limit wl
    WHERE s.user_id = (SELECT auth.uid())
      AND s.completed_at >= now() - wl.w
      AND s.completed_at <= now()
      AND l.completed
      AND l.reps_completed > 0
    GROUP BY 1, 2, 3
  ),
  workout_stimulus AS (
    SELECT h.session_id::text AS event_id, h.completed_at, t.muscle_id, sum(h.n * t.weight) AS s
    FROM hard_sets h
    JOIN public.exercise_muscle_targets t ON t.exercise_code = h.exercise_code
    GROUP BY 1, 2, 3
  ),
  runs_data AS (
    SELECT r.id AS event_id,
           r.created_at AS completed_at,
           (r.distance_km / 2.5) * (1 + coalesce(r.elevation_gain_m, 0)::numeric / 300.0) AS s_base
    FROM public.runs r
    CROSS JOIN window_limit wl
    WHERE r.user_id = (SELECT auth.uid())
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
               * power(0.5, extract(epoch FROM now() - x.completed_at) / 3600.0 / r.half_life_h) AS f
    FROM all_stimulus x
    JOIN public.muscle_regions r ON r.muscle_id = x.muscle_id
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
              ELSE round(r.half_life_h * ln(c.f / 35) / ln(2)) END AS hours_to_recovered
  FROM public.muscle_regions r
  LEFT JOIN combined c ON c.muscle_id = r.muscle_id
  ORDER BY r.sort_order;
$$;

REVOKE ALL ON FUNCTION public.get_muscle_fatigue(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_muscle_fatigue(INT) TO authenticated;
