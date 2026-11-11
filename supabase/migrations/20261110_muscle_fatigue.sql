-- AB Fitness: Mapa de Recuperação Muscular
-- Tabelas de referência (regiões + mapeamento exercício→região) e RPC get_muscle_fatigue().
-- Depois deste ficheiro, correr 20261110_muscle_fatigue_seed.sql (gerado por scripts/build_muscle_targets_sql.mjs).
-- A matemática é a mesma de src/utils/muscleFatigue.js.

CREATE TABLE IF NOT EXISTS public.muscle_regions (
    muscle_id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    half_life_h NUMERIC(4,1) NOT NULL CHECK (half_life_h > 0),
    sort_order SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exercise_muscle_targets (
    exercise_code TEXT NOT NULL,
    muscle_id TEXT NOT NULL REFERENCES public.muscle_regions(muscle_id) ON DELETE CASCADE,
    weight NUMERIC(3,2) NOT NULL CHECK (weight > 0 AND weight <= 1),
    PRIMARY KEY (exercise_code, muscle_id)
);

ALTER TABLE public.muscle_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_muscle_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "muscle_regions_read" ON public.muscle_regions;
CREATE POLICY "muscle_regions_read" ON public.muscle_regions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "exercise_muscle_targets_read" ON public.exercise_muscle_targets;
CREATE POLICY "exercise_muscle_targets_read" ON public.exercise_muscle_targets FOR SELECT TO anon, authenticated USING (true);

-- A janela de 72 h filtra por utilizador + data; os logs juntam por sessão
CREATE INDEX IF NOT EXISTS workout_sessions_user_completed_idx ON public.workout_sessions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS exercise_logs_session_idx ON public.exercise_logs (session_id);

/*
  Fadiga por região, 0 a 100, para o utilizador autenticado.
    S  = Σ séries concluídas (reps > 0) × peso da região        (primário 1.0, secundário 0.5)
    F0 = 100 × (1 − e^(−S/6))                                   6 séries ≈ 63%, 14 séries ≈ 90%
    F  = F0 × 0.5^(horas desde a sessão / meia-vida da região)
    várias sessões: 100 × (1 − Π(1 − Fi/100))
    hours_to_recovered = meia-vida × log2(F / 35)
  SECURITY INVOKER: corre com o RLS do próprio utilizador sobre workout_sessions/exercise_logs.
*/
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
SET search_path = public
AS $$
  WITH hard_sets AS (
    SELECT s.id AS session_id, s.completed_at, l.exercise_code, count(*)::numeric AS n
    FROM workout_sessions s
    JOIN exercise_logs l ON l.session_id = s.id
    WHERE s.user_id = (SELECT auth.uid())
      AND s.completed_at >= now() - make_interval(hours => least(greatest(coalesce(p_window_hours, 72), 24), 168))
      AND s.completed_at <= now()
      AND l.completed
      AND l.reps_completed > 0
    GROUP BY 1, 2, 3
  ),
  stimulus AS (
    SELECT h.session_id, h.completed_at, t.muscle_id, sum(h.n * t.weight) AS s
    FROM hard_sets h
    JOIN exercise_muscle_targets t ON t.exercise_code = h.exercise_code
    GROUP BY 1, 2, 3
  ),
  per_session AS (
    SELECT x.muscle_id, x.completed_at,
           100 * (1 - exp(-x.s / 6.0))
               * power(0.5, extract(epoch FROM now() - x.completed_at) / 3600.0 / r.half_life_h) AS f
    FROM stimulus x
    JOIN muscle_regions r USING (muscle_id)
  ),
  combined AS (
    SELECT p.muscle_id,
           100 * (1 - exp(sum(ln(greatest(1 - p.f / 100, 1e-6))))) AS f,
           max(p.completed_at) AS last_at
    FROM per_session p
    GROUP BY 1
  )
  SELECT r.muscle_id,
         round(coalesce(c.f, 0), 1),
         round(100 - coalesce(c.f, 0), 1),
         c.last_at,
         CASE WHEN coalesce(c.f, 0) <= 35 THEN 0
              ELSE round(r.half_life_h * ln(c.f / 35) / ln(2)) END
  FROM muscle_regions r
  LEFT JOIN combined c USING (muscle_id)
  ORDER BY r.sort_order;
$$;

REVOKE ALL ON FUNCTION public.get_muscle_fatigue(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_muscle_fatigue(INT) TO authenticated;
