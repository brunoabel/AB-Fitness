-- AB Fitness: repõe o feed de treinos dos amigos.
-- A 20261127 passou a exigir workout_sessions.is_shared = true em get_friend_feed, mas a app nunca
-- marca sessões como partilhadas (default false), o que deixava o feed vazio para todos.
-- A privacidade do feed continua controlada por privacy_settings.show_history (opt-out do atleta)
-- e pela amizade aceite. Mantém o endurecimento da 20261127 (schema qualificado, auth.uid() em subselect).
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261127_security_rls_and_indexes_hardening.sql.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_friend_feed(max_items INT DEFAULT 30)
RETURNS TABLE (
    session_id UUID,
    friend_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    workout_title TEXT,
    duration_seconds INT,
    completed_at TIMESTAMPTZ,
    volume_kg NUMERIC,
    top_exercises TEXT[],
    respect_count INT,
    respected_by_me BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT s.id, p.id, p.username, p.full_name, p.avatar_url,
           s.workout_title, s.duration_seconds, s.completed_at,
           CASE WHEN public.privacy_flag(p.privacy_settings, 'show_weights') THEN
               (SELECT COALESCE(SUM(l.weight_kg * l.reps_completed), 0)
                FROM public.exercise_logs l WHERE l.session_id = s.id AND l.completed)
           END,
           ARRAY(
               SELECT l.exercise_code FROM public.exercise_logs l
               WHERE l.session_id = s.id AND l.completed
               GROUP BY l.exercise_code
               ORDER BY MAX(l.weight_kg * l.reps_completed) DESC
               LIMIT 3
           ),
           (SELECT COUNT(*)::int FROM public.workout_respects r WHERE r.session_id = s.id),
           EXISTS (SELECT 1 FROM public.workout_respects r WHERE r.session_id = s.id AND r.user_id = (SELECT auth.uid()))
    FROM public.workout_sessions s
    JOIN public.profiles p ON p.id = s.user_id
    WHERE public.are_friends((SELECT auth.uid()), s.user_id)
      AND public.privacy_flag(p.privacy_settings, 'show_history')
      AND s.completed_at >= now() - interval '30 days'
    ORDER BY s.completed_at DESC
    LIMIT LEAST(GREATEST(max_items, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_friend_feed(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friend_feed(INT) TO authenticated;

COMMIT;
