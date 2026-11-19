-- AB Fitness: quota diária do AB Coach e contexto de treino de 8 semanas vindo da base
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261135_waitlist_funnel.sql.
--
-- 1. ab_coach_usage: contador por utilizador, dia (fuso do perfil) e tipo de pedido.
-- 2. consume_ab_coach_quota(kind): incrementa de forma atómica e diz se o pedido pode seguir.
--    Plano gratuito: 5 conversas e 3 análises pós-treino por dia.
--    PRO (is_pro/is_premium, teste ativo, ceo/admin/coach): 50 conversas e 10 análises por dia.
-- 3. get_coach_training_context(): volume semanal e melhores e1RM das últimas 8 semanas.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ab_coach_usage (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('chat', 'narrative')),
    count INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day, kind)
);

-- Sem policies: só as funções SECURITY DEFINER abaixo leem e escrevem
ALTER TABLE public.ab_coach_usage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ab_coach_usage FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- consume_ab_coach_quota
-- ============================================================================
CREATE OR REPLACE FUNCTION public.consume_ab_coach_quota(p_kind TEXT DEFAULT 'chat')
RETURNS TABLE (out_allowed BOOLEAN, out_used INT, out_limit INT, out_is_pro BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_kind TEXT := CASE WHEN p_kind = 'narrative' THEN 'narrative' ELSE 'chat' END;
    v_pro BOOLEAN;
    v_tz TEXT;
    v_day DATE;
    v_limit INT;
    v_count INT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE = '42501';
    END IF;

    SELECT
        COALESCE(p.is_pro, false) OR COALESCE(p.is_premium, false)
            OR p.role IN ('ceo', 'admin', 'coach')
            OR (p.trial_ends_at IS NOT NULL AND p.trial_ends_at > now()),
        COALESCE(p.timezone, 'America/Sao_Paulo')
    INTO v_pro, v_tz
    FROM public.profiles p
    WHERE p.id = v_uid;

    v_pro := COALESCE(v_pro, false);
    v_day := (now() AT TIME ZONE COALESCE(v_tz, 'America/Sao_Paulo'))::date;
    v_limit := CASE
        WHEN v_kind = 'chat' AND v_pro THEN 50
        WHEN v_kind = 'chat' THEN 5
        WHEN v_pro THEN 10
        ELSE 3
    END;

    INSERT INTO public.ab_coach_usage AS u (user_id, day, kind, count)
    VALUES (v_uid, v_day, v_kind, 1)
    ON CONFLICT (user_id, day, kind) DO UPDATE
        SET count = u.count + 1
        WHERE u.count < v_limit
    RETURNING u.count INTO v_count;

    IF v_count IS NULL THEN
        -- Limite atingido: o UPDATE não aconteceu
        SELECT u.count INTO v_count FROM public.ab_coach_usage u
        WHERE u.user_id = v_uid AND u.day = v_day AND u.kind = v_kind;
        RETURN QUERY SELECT false, v_count, v_limit, v_pro;
        RETURN;
    END IF;

    RETURN QUERY SELECT true, v_count, v_limit, v_pro;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_ab_coach_quota(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ab_coach_quota(TEXT) TO authenticated;

-- ============================================================================
-- get_coach_training_context: últimas 8 semanas do próprio utilizador (RLS aplicada)
-- e1RM pela fórmula de Epley, só séries de trabalho concluídas com 1 a 12 repetições.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_coach_training_context()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH me AS (
    SELECT (SELECT auth.uid()) AS uid,
           COALESCE((SELECT timezone FROM profiles WHERE id = (SELECT auth.uid())), 'America/Sao_Paulo') AS tz
  ), sessions AS (
    SELECT s.id, s.completed_at, date_trunc('week', s.completed_at AT TIME ZONE me.tz)::date AS week_start
    FROM workout_sessions s, me
    WHERE s.user_id = me.uid AND s.completed_at >= now() - interval '56 days'
  ), sets AS (
    SELECT l.exercise_code, l.weight_kg, l.reps_completed, se.week_start, se.completed_at
    FROM exercise_logs l
    JOIN sessions se ON se.id = l.session_id
    WHERE l.completed AND COALESCE(l.set_type, 'N') <> 'W'
  ), weekly AS (
    SELECT se.week_start,
           COUNT(DISTINCT se.id) AS sessoes,
           (SELECT COUNT(*) FROM sets st WHERE st.week_start = se.week_start) AS series,
           (SELECT COALESCE(ROUND(SUM(st.weight_kg * st.reps_completed)), 0) FROM sets st WHERE st.week_start = se.week_start) AS volume_kg
    FROM sessions se
    GROUP BY se.week_start
  ), lifts AS (
    SELECT st.exercise_code,
           COUNT(*) AS series,
           ROUND(MAX(st.weight_kg * (1 + st.reps_completed / 30.0)) FILTER (WHERE st.completed_at >= now() - interval '28 days'), 1) AS e1rm_4s,
           ROUND(MAX(st.weight_kg * (1 + st.reps_completed / 30.0)) FILTER (WHERE st.completed_at < now() - interval '28 days'), 1) AS e1rm_4s_anteriores
    FROM sets st
    WHERE st.weight_kg > 0 AND st.reps_completed BETWEEN 1 AND 12
    GROUP BY st.exercise_code
    ORDER BY COUNT(*) DESC
    LIMIT 12
  )
  SELECT jsonb_build_object(
    'semanas', COALESCE((SELECT jsonb_agg(jsonb_build_object('inicio', w.week_start, 'sessoes', w.sessoes, 'series', w.series, 'volume_kg', w.volume_kg) ORDER BY w.week_start) FROM weekly w), '[]'::jsonb),
    'exercicios', COALESCE((SELECT jsonb_agg(jsonb_build_object('codigo', li.exercise_code, 'series', li.series, 'e1rm_4s', li.e1rm_4s, 'e1rm_4s_anteriores', li.e1rm_4s_anteriores)) FROM lifts li), '[]'::jsonb)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.get_coach_training_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_coach_training_context() TO authenticated;

COMMIT;
