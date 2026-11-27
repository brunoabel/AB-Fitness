-- AB Fitness: Endurecimento pré-deploy (P0/P1/P2 da auditoria técnica)
-- 1. trainer_templates_insert_own passa a aceitar 'coach', 'admin' e 'ceo'
-- 2. athlete_posts e post_respects migrados para TO authenticated + (SELECT auth.uid())
-- 3. RPC get_friend_posts(max_items) com SECURITY DEFINER (evita join nulo de profiles)
-- 4. Tabela stripe_webhook_events para idempotência do webhook Stripe

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- 1. CEO e Admin também podem criar modelos no Trainer Hub
DROP POLICY IF EXISTS trainer_templates_insert_own ON public.trainer_templates;
CREATE POLICY trainer_templates_insert_own ON public.trainer_templates
    FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = trainer_id
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (SELECT auth.uid()) AND p.role IN ('coach', 'admin', 'ceo')
        )
    );

-- 2. Endurecimento de athlete_posts e post_respects para TO authenticated
DROP POLICY IF EXISTS athlete_posts_select ON public.athlete_posts;
CREATE POLICY athlete_posts_select ON public.athlete_posts
    FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = user_id
        OR public.are_friends((SELECT auth.uid()), user_id)
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = (SELECT auth.uid()) AND p.role IN ('admin', 'ceo')
        )
    );

DROP POLICY IF EXISTS athlete_posts_insert ON public.athlete_posts;
CREATE POLICY athlete_posts_insert ON public.athlete_posts
    FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS athlete_posts_delete ON public.athlete_posts;
CREATE POLICY athlete_posts_delete ON public.athlete_posts
    FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS post_respects_all ON public.post_respects;
CREATE POLICY post_respects_all ON public.post_respects
    FOR ALL TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- 3. RPC segura para o feed de fotos com metadados públicos do autor (amigos ou próprio)
CREATE OR REPLACE FUNCTION public.get_friend_posts(max_items INT DEFAULT 30)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    image_url TEXT,
    caption TEXT,
    respect_count INT,
    created_at TIMESTAMPTZ,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN,
    is_ceo BOOLEAN,
    respected_by_me BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        ap.id,
        ap.user_id,
        ap.image_url,
        ap.caption,
        ap.respect_count,
        ap.created_at,
        p.username,
        p.full_name,
        p.avatar_url,
        COALESCE(p.is_verified, false) AS is_verified,
        (p.role = 'ceo') AS is_ceo,
        EXISTS (
            SELECT 1 FROM public.post_respects pr
            WHERE pr.post_id = ap.id AND pr.user_id = (SELECT auth.uid())
        ) AS respected_by_me
    FROM public.athlete_posts ap
    JOIN public.profiles p ON p.id = ap.user_id
    WHERE (SELECT auth.uid()) IS NOT NULL
      AND (
          ap.user_id = (SELECT auth.uid())
          OR public.are_friends((SELECT auth.uid()), ap.user_id)
          OR EXISTS (
              SELECT 1 FROM public.profiles me
              WHERE me.id = (SELECT auth.uid()) AND me.role IN ('admin', 'ceo')
          )
      )
    ORDER BY ap.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(max_items, 30), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_friend_posts(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friend_posts(INT) TO authenticated;

-- 4. Tabela de idempotência para eventos de webhook Stripe (apenas service_role)
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_webhook_events FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stripe_webhook_events FROM PUBLIC, anon, authenticated;

COMMIT;
