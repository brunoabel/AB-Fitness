-- AB Fitness — Endurecimento RLS da Lista VIP / Waitlist de Marketing (RGPD)
-- Corrige leitura e atualização públicas indevidas em public.waitlist e get_marketing_waitlist().
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.waitlist') IS NULL THEN
        RAISE EXCEPTION 'Falta tabela public.waitlist.';
    END IF;
END $$;

-- 1. Remover políticas abertas a anon / UPDATE público
DROP POLICY IF EXISTS "waitlist_update_public" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_all" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_admin" ON public.waitlist;

-- 2. Manter apenas INSERT público (waitlist_insert_public) e restringir SELECT a admin/ceo autenticados
CREATE POLICY "waitlist_select_admin" ON public.waitlist
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('admin', 'ceo')
        )
    );

-- 3. Recriar get_marketing_waitlist() com verificação explícita de papel admin/ceo
CREATE OR REPLACE FUNCTION public.get_marketing_waitlist()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    goal TEXT,
    phone TEXT,
    source TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'ceo')
    ) THEN
        RAISE EXCEPTION 'Acesso restrito a administradores ou CEO.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT w.id, w.name, w.email, w.goal, w.phone, w.source, w.created_at
    FROM public.waitlist w
    ORDER BY w.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_marketing_waitlist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_marketing_waitlist() TO authenticated;

COMMIT;
