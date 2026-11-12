-- AB Fitness: Deep Link Público para Convites (?u=username) & RPC Segura sem PII
-- Correr no SQL Editor do Supabase como postgres.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.profiles') IS NULL THEN
        RAISE EXCEPTION 'Falta tabela public.profiles.';
    END IF;
END $$;

-- 1. Índice case-insensitive rápido para resolução instantânea de ?u=username (<10ms)
CREATE INDEX IF NOT EXISTS profiles_username_lower_idx
    ON public.profiles (lower(username))
    WHERE username IS NOT NULL;

-- 2. RPC pública para resolver o Athlete Pass a partir de @username sem expor PII
-- Nunca devolve email, role textual, notas clínicas ou peso corporal privado.
CREATE OR REPLACE FUNCTION public.get_public_athlete_pass(p_username TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    athlete_tag TEXT,
    home_gym TEXT,
    cover_style TEXT,
    featured_stat TEXT,
    is_verified BOOLEAN,
    is_pro BOOLEAN,
    is_ceo BOOLEAN,
    total_workouts INT,
    streak INT,
    monthly_volume_kg NUMERIC,
    friendship_status TEXT,
    i_requested BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    WITH target AS (
        SELECT
            p.*,
            lower(ltrim(trim(COALESCE(p_username, '')), '@')) AS q_user
        FROM public.profiles p
        WHERE p.username IS NOT NULL
          AND char_length(ltrim(trim(COALESCE(p_username, '')), '@')) >= 3
          AND lower(p.username) = lower(ltrim(trim(COALESCE(p_username, '')), '@'))
          AND public.privacy_flag(p.privacy_settings, 'public_profile', true)
        LIMIT 1
    ),
    stats AS (
        SELECT
            t.id,
            (SELECT COUNT(*)::int FROM public.workout_sessions s WHERE s.user_id = t.id) AS total_workouts,
            CASE
                WHEN public.privacy_flag(t.privacy_settings, 'show_streak', true)
                    THEN public.athlete_streak(t.id)
                ELSE 0
            END AS streak,
            CASE
                WHEN public.privacy_flag(t.privacy_settings, 'show_weights', true)
                    THEN (SELECT w.volume_kg FROM public.athlete_window_stats(t.id, 30) w)
                ELSE 0::numeric
            END AS monthly_volume_kg
        FROM target t
    )
    SELECT
        t.id,
        t.username,
        t.full_name,
        t.avatar_url,
        t.bio,
        t.athlete_tag,
        t.home_gym,
        t.cover_style,
        t.featured_stat,
        COALESCE(t.is_verified, false) AS is_verified,
        (COALESCE(t.is_pro, false) OR COALESCE(t.is_premium, false) OR t.role = 'ceo') AS is_pro,
        (t.role = 'ceo') AS is_ceo,
        st.total_workouts,
        st.streak,
        st.monthly_volume_kg,
        f.status AS friendship_status,
        (f.requester_id = auth.uid()) AS i_requested
    FROM target t
    JOIN stats st ON st.id = t.id
    LEFT JOIN public.friendships f
      ON auth.uid() IS NOT NULL
     AND LEAST(f.requester_id, f.addressee_id) = LEAST(t.id, auth.uid())
     AND GREATEST(f.requester_id, f.addressee_id) = GREATEST(t.id, auth.uid())
    WHERE COALESCE(f.status, '') <> 'blocked';
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_athlete_pass(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_athlete_pass(TEXT) TO anon, authenticated;

COMMIT;
