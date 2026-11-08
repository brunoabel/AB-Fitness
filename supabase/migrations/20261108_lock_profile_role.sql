-- AB Fitness — Impede que um utilizador altere o próprio papel (role) em public.profiles.
-- A política "Usuário pode atualizar seu próprio perfil" permite UPDATE em qualquer coluna;
-- sem isto, qualquer conta podia fazer UPDATE profiles SET role = 'admin'.
-- Só o service_role (painel do Supabase / funções do servidor) pode mudar papéis.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND coalesce(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel do utilizador.' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_change
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

-- Garante também que o UPDATE só altera a própria linha (WITH CHECK explícito).
DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode atualizar seu próprio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
