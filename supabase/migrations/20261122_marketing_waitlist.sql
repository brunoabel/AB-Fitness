-- AB Fitness — Tabela e RPC da Lista VIP / Waitlist de Marketing
-- Permite que qualquer visitante da web (anon) se inscreva na lista
-- e que o Administrador/CEO consulte todos os registos em tempo real.

CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    goal TEXT,
    phone TEXT,
    source TEXT DEFAULT 'marketing_private_launch',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativar Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- 1. Qualquer visitante da web (público / anon) pode inserir o seu e-mail
DROP POLICY IF EXISTS "waitlist_insert_public" ON public.waitlist;
CREATE POLICY "waitlist_insert_public" ON public.waitlist
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- 2. Qualquer visitante pode atualizar se submeter de novo
DROP POLICY IF EXISTS "waitlist_update_public" ON public.waitlist;
CREATE POLICY "waitlist_update_public" ON public.waitlist
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Leitura para painel Admin (acessível por authenticated e anon)
DROP POLICY IF EXISTS "waitlist_select_admin" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_all" ON public.waitlist;
CREATE POLICY "waitlist_select_all" ON public.waitlist
    FOR SELECT TO authenticated, anon
    USING (true);

-- 4. RPC com SECURITY DEFINER para garantir leitura instantânea no Painel de Admin
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id, name, email, goal, phone, source, created_at
    FROM public.waitlist
    ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_marketing_waitlist() TO authenticated, anon;
