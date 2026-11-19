-- AB Fitness: painel admin com agregados calculados no servidor
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261137_weighted_muscle_fatigue.sql.
--
-- Antes o painel descarregava todas as linhas de profiles, workout_sessions e exercise_logs
-- para contar e somar no browser. Estas RPCs devolvem só os totais e listas limitadas.
-- Todas exigem papel admin ou ceo.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION public.assert_admin_or_ceo()
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'ceo')
    ) THEN
        RAISE EXCEPTION 'Acesso restrito a administradores ou CEO.' USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_admin_or_ceo() FROM PUBLIC, anon, authenticated;

-- ============================================================================
-- Totais do painel
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_dashboard_summary()
RETURNS TABLE (
    athletes INT,
    sessions INT,
    sessions_7d INT,
    active_athletes_7d INT,
    logs INT,
    volume_kg NUMERIC
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM public.assert_admin_or_ceo();
    RETURN QUERY
    SELECT
        (SELECT count(*)::int FROM public.profiles),
        (SELECT count(*)::int FROM public.workout_sessions),
        (SELECT count(*)::int FROM public.workout_sessions s WHERE s.completed_at >= now() - interval '7 days'),
        (SELECT count(DISTINCT s.user_id)::int FROM public.workout_sessions s WHERE s.completed_at >= now() - interval '7 days'),
        (SELECT count(*)::int FROM public.exercise_logs),
        (SELECT coalesce(round(sum(l.weight_kg * l.reps_completed)), 0)
           FROM public.exercise_logs l
           WHERE l.completed AND coalesce(l.set_type, 'N') <> 'W');
END;
$$;

REVOKE ALL ON FUNCTION public.admin_dashboard_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_summary() TO authenticated;

-- ============================================================================
-- Atletas com contagem de treinos (paginado, pesquisa opcional por nome ou e-mail)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_list_athletes(
    p_search TEXT DEFAULT NULL,
    p_limit INT DEFAULT 500,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    role TEXT,
    athlete_type TEXT,
    created_at TIMESTAMPTZ,
    session_count INT,
    last_session_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_q TEXT := nullif(lower(trim(coalesce(p_search, ''))), '');
BEGIN
    PERFORM public.assert_admin_or_ceo();
    RETURN QUERY
    SELECT p.id, p.full_name::text, p.email::text, p.role::text, p.athlete_type::text, p.created_at,
           coalesce(c.n, 0)::int, c.last_at
    FROM public.profiles p
    LEFT JOIN (
        SELECT s.user_id, count(*) AS n, max(s.completed_at) AS last_at
        FROM public.workout_sessions s
        GROUP BY s.user_id
    ) c ON c.user_id = p.id
    WHERE v_q IS NULL
       OR lower(coalesce(p.full_name, '')) LIKE '%' || v_q || '%'
       OR lower(coalesce(p.email, '')) LIKE '%' || v_q || '%'
    ORDER BY p.created_at DESC
    LIMIT least(greatest(coalesce(p_limit, 500), 1), 1000)
    OFFSET greatest(coalesce(p_offset, 0), 0);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_athletes(TEXT, INT, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_athletes(TEXT, INT, INT) TO authenticated;

-- ============================================================================
-- Treinos mais recentes com o nome do atleta
-- ============================================================================
CREATE OR REPLACE FUNCTION public.admin_recent_sessions(p_limit INT DEFAULT 100)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    workout_day_name TEXT,
    workout_title TEXT,
    duration_seconds INT,
    completed_at TIMESTAMPTZ,
    athlete_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM public.assert_admin_or_ceo();
    RETURN QUERY
    SELECT s.id, s.user_id, s.workout_day_name, s.workout_title, s.duration_seconds, s.completed_at,
           coalesce(nullif(p.full_name, ''), split_part(coalesce(p.email, ''), '@', 1), 'Atleta')::text
    FROM public.workout_sessions s
    LEFT JOIN public.profiles p ON p.id = s.user_id
    ORDER BY s.completed_at DESC
    LIMIT least(greatest(coalesce(p_limit, 100), 1), 500);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_recent_sessions(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_recent_sessions(INT) TO authenticated;

CREATE INDEX IF NOT EXISTS workout_sessions_completed_at_idx ON public.workout_sessions (completed_at DESC);

COMMIT;
