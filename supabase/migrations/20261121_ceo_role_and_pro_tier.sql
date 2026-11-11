-- AB Fitness — Nível Supremo de CEO & Estatuto PRO Vitalício
-- Atribui o papel de 'ceo' e status PRO/Verificado ao criador da plataforma (Bruno Araújo)
-- com autoridade máxima executiva e acesso a todas as funcionalidades do ecossistema.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- 1. Suporte explícito a colunas de subscrição PRO e verificação caso não existam
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT false;

-- 2. Atualizar trigger que protege os papéis (role) para reconhecer 'ceo' com plenos poderes
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'ceo'))
    THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel do utilizador.' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Atualizar RPCs de gestão de Personal Trainers para aceitar 'ceo'
CREATE OR REPLACE FUNCTION public.promote_to_coach(p_user_id UUID)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'ceo')) THEN
        RAISE EXCEPTION 'Só administradores ou CEO podem promover um utilizador a trainer.' USING ERRCODE = '42501';
    END IF;

    UPDATE public.profiles
    SET role = 'coach'
    WHERE profiles.id = p_user_id AND profiles.role = 'athlete';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilizador não encontrado ou não é um atleta comum (admins/CEO não podem ser alterados).' USING ERRCODE = '22023';
    END IF;

    RETURN QUERY SELECT p.id, p.email, p.full_name, p.role FROM public.profiles p WHERE p.id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.demote_to_athlete(p_user_id UUID)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'ceo')) THEN
        RAISE EXCEPTION 'Só administradores ou CEO podem alterar o papel de um trainer.' USING ERRCODE = '42501';
    END IF;

    UPDATE public.profiles
    SET role = 'athlete'
    WHERE profiles.id = p_user_id AND profiles.role = 'coach';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilizador não encontrado ou não é atualmente um trainer.' USING ERRCODE = '22023';
    END IF;

    RETURN QUERY SELECT p.id, p.email, p.full_name, p.role FROM public.profiles p WHERE p.id = p_user_id;
END;
$$;

-- 4. Promover e consolidar o perfil do criador Bruno Araújo como CEO & PRO Vitalício
UPDATE public.profiles
SET role = 'ceo',
    is_verified = true,
    is_premium = true,
    is_pro = true
WHERE email ILIKE '%brunoaaraujo2005@gmail.com%';

COMMIT;
