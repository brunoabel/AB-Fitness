-- AB Fitness: funil da waitlist (atribuição, posição na fila e indicações)
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261134_p0_integrity.sql.
--
-- 1. Atribuição de primeiro toque por lead (utm_*, referrer, página de entrada).
-- 2. Código de indicação por lead e referred_by.
-- 3. join_waitlist(): inscrição idempotente para visitantes (anon) que devolve posição e código.
--    Prioridade da fila: mais indicações primeiro, depois ordem de inscrição.
-- 4. get_marketing_waitlist() passa a devolver atribuição, posição e indicações, já na ordem da fila.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS utm_term TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS landing_path TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS referral_code TEXT;

UPDATE public.waitlist
SET referral_code = upper(substr(md5(gen_random_uuid()::text), 1, 8))
WHERE referral_code IS NULL;

ALTER TABLE public.waitlist ALTER COLUMN referral_code SET DEFAULT upper(substr(md5(gen_random_uuid()::text), 1, 8));
ALTER TABLE public.waitlist ALTER COLUMN referral_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_referral_code_key ON public.waitlist (referral_code);
CREATE INDEX IF NOT EXISTS waitlist_referred_by_idx ON public.waitlist (referred_by);

-- ============================================================================
-- join_waitlist: inscrição pública idempotente
-- Colunas de saída com prefixo out_ para não colidirem com as colunas da tabela no plpgsql.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.join_waitlist(
    p_email TEXT,
    p_name TEXT DEFAULT NULL,
    p_goal TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'marketing_private_launch',
    p_attribution JSONB DEFAULT '{}'::jsonb,
    p_referred_by TEXT DEFAULT NULL
)
RETURNS TABLE (out_position INT, out_referral_code TEXT, out_referral_count INT, out_already_joined BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_email TEXT := lower(trim(coalesce(p_email, '')));
    v_ref TEXT := upper(nullif(trim(coalesce(p_referred_by, '')), ''));
    v_attr JSONB := coalesce(p_attribution, '{}'::jsonb);
    v_code TEXT;
    v_existing BOOLEAN := false;
BEGIN
    IF v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(v_email) > 254 THEN
        RAISE EXCEPTION 'E-mail inválido.' USING ERRCODE = '22023';
    END IF;

    SELECT w.referral_code INTO v_code FROM public.waitlist w WHERE w.email = v_email;
    v_existing := v_code IS NOT NULL;

    IF NOT v_existing THEN
        -- Indicação só conta se o código existir
        IF v_ref IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.waitlist w WHERE w.referral_code = v_ref) THEN
            v_ref := NULL;
        END IF;

        INSERT INTO public.waitlist (
            name, email, goal, phone, source,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term,
            referrer, landing_path, referred_by
        )
        VALUES (
            left(nullif(trim(coalesce(p_name, '')), ''), 80),
            v_email,
            left(nullif(trim(coalesce(p_goal, '')), ''), 40),
            left(nullif(trim(coalesce(p_phone, '')), ''), 30),
            left(coalesce(nullif(trim(coalesce(p_source, '')), ''), 'marketing_private_launch'), 60),
            left(v_attr ->> 'utm_source', 100),
            left(v_attr ->> 'utm_medium', 100),
            left(v_attr ->> 'utm_campaign', 100),
            left(v_attr ->> 'utm_content', 100),
            left(v_attr ->> 'utm_term', 100),
            left(v_attr ->> 'referrer', 300),
            left(v_attr ->> 'landing_path', 300),
            v_ref
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING public.waitlist.referral_code INTO v_code;

        IF v_code IS NULL THEN
            SELECT w.referral_code INTO v_code FROM public.waitlist w WHERE w.email = v_email;
            v_existing := true;
        END IF;
    END IF;

    RETURN QUERY
    WITH counts AS (
        SELECT w.referral_code AS code,
               (SELECT count(*) FROM public.waitlist r WHERE r.referred_by = w.referral_code)::int AS refs,
               w.created_at
        FROM public.waitlist w
    ), ordered AS (
        SELECT c.code, c.refs, (row_number() OVER (ORDER BY c.refs DESC, c.created_at ASC))::int AS pos
        FROM counts c
    )
    SELECT o.pos, o.code, o.refs, v_existing FROM ordered o WHERE o.code = v_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_waitlist(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_waitlist(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

-- ============================================================================
-- get_marketing_waitlist: painel admin na ordem real da fila
-- O tipo de retorno muda, por isso a função antiga é removida.
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_marketing_waitlist();

CREATE FUNCTION public.get_marketing_waitlist()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    goal TEXT,
    phone TEXT,
    source TEXT,
    created_at TIMESTAMPTZ,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    referral_code TEXT,
    referred_by TEXT,
    referral_count INT,
    queue_position INT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('admin', 'ceo')
    ) THEN
        RAISE EXCEPTION 'Acesso restrito a administradores ou CEO.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    WITH counts AS (
        SELECT w.*,
               (SELECT count(*) FROM public.waitlist r WHERE r.referred_by = w.referral_code)::int AS refs
        FROM public.waitlist w
    )
    SELECT c.id, c.name, c.email, c.goal, c.phone, c.source, c.created_at,
           c.utm_source, c.utm_medium, c.utm_campaign, c.referrer,
           c.referral_code, c.referred_by, c.refs,
           (row_number() OVER (ORDER BY c.refs DESC, c.created_at ASC))::int
    FROM counts c
    ORDER BY 15;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_marketing_waitlist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_marketing_waitlist() TO authenticated;

COMMIT;
