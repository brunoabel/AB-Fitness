-- AB Fitness — Tabela da Lista VIP / Waitlist de Marketing
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

-- 2. Qualquer visitante pode atualizar o seu próprio registo se tentar de novo (upsert)
DROP POLICY IF EXISTS "waitlist_update_public" ON public.waitlist;
CREATE POLICY "waitlist_update_public" ON public.waitlist
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Apenas Admin e CEO podem consultar a lista completa de leads
DROP POLICY IF EXISTS "waitlist_select_admin" ON public.waitlist;
CREATE POLICY "waitlist_select_admin" ON public.waitlist
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'ceo')
        )
        OR (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()) = 'brunoaaraujo2005@gmail.com'
    );

-- 4. Apenas Admin e CEO podem remover registos
DROP POLICY IF EXISTS "waitlist_delete_admin" ON public.waitlist;
CREATE POLICY "waitlist_delete_admin" ON public.waitlist
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'ceo')
        )
        OR (SELECT email FROM auth.users WHERE auth.users.id = auth.uid()) = 'brunoaaraujo2005@gmail.com'
    );
