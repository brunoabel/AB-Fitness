-- Migration: 20261141_athlete_streak_runs_and_tz.sql
-- Corrige public.athlete_streak(uid):
--   1. Respeita o fuso horário do atleta (profiles.timezone, fallback Europe/Lisbon) em vez de UTC fixo.
--   2. Inclui corridas registadas em public.runs (distance_km > 0) além de workout_sessions.

CREATE OR REPLACE FUNCTION public.athlete_streak(uid UUID)
RETURNS INT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tz TEXT := 'Europe/Lisbon';
  v_today DATE;
  v_streak INT := 0;
BEGIN
  SELECT COALESCE(NULLIF(trim(p.timezone), ''), 'Europe/Lisbon')
    INTO v_tz
  FROM public.profiles p
  WHERE p.id = uid;

  -- Validação defensiva de timezone: recua para UTC se o nome for inválido
  BEGIN
    v_today := (now() AT TIME ZONE v_tz)::date;
  EXCEPTION WHEN invalid_parameter_value THEN
    v_tz := 'UTC';
    v_today := (now() AT TIME ZONE 'UTC')::date;
  END;

  WITH active_days AS (
    SELECT DISTINCT (s.completed_at AT TIME ZONE v_tz)::date AS day
    FROM public.workout_sessions s
    WHERE s.user_id = uid
      AND s.completed_at IS NOT NULL
    UNION
    SELECT DISTINCT (r.created_at AT TIME ZONE v_tz)::date AS day
    FROM public.runs r
    WHERE r.user_id = uid
      AND r.created_at IS NOT NULL
      AND COALESCE(r.distance_km, 0) > 0
  ),
  grouped AS (
    SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
    FROM active_days
  ),
  streaks AS (
    SELECT MAX(day) AS last_day, COUNT(*)::int AS len
    FROM grouped
    GROUP BY grp
  )
  SELECT COALESCE(
    (SELECT len FROM streaks WHERE last_day >= v_today - 1 ORDER BY last_day DESC LIMIT 1),
    0
  )
  INTO v_streak;

  RETURN v_streak;
END;
$$;
