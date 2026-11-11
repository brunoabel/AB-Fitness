-- AB Fitness: permite que um admin promova um atleta a trainer (role = 'coach') e reverta,
-- pelo próprio app — sem precisar de SQL manual no Supabase a cada novo personal trainer.
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261108_lock_profile_role.sql.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- ============================================================================
-- 1. O trigger que bloqueia mudanças de role passa a admitir também um admin
-- mudando o role de OUTRO utilizador (continua a bloquear qualquer auto-promoção:
-- só altera o papel de alguém se quem está a correr a instrução for admin).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role
       AND coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel do utilizador.' USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 2. RPCs: só um admin pode chamar. Guardas de WHERE evitam mexer em admins
-- por engano (ex.: promover alguém que já é admin, ou despromover um admin).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.promote_to_coach(p_user_id UUID)
RETURNS TABLE (id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
        RAISE EXCEPTION 'Só administradores podem promover um utilizador a trainer.' USING ERRCODE = '42501';
    END IF;

    UPDATE public.profiles
    SET role = 'coach'
    WHERE profiles.id = p_user_id AND profiles.role = 'athlete';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilizador não encontrado ou não é um atleta comum (admin não pode ser alterado por aqui).' USING ERRCODE = '22023';
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
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
        RAISE EXCEPTION 'Só administradores podem alterar o papel de um trainer.' USING ERRCODE = '42501';
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

REVOKE EXECUTE ON FUNCTION public.promote_to_coach(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_to_coach(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.demote_to_athlete(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.demote_to_athlete(UUID) TO authenticated;

COMMIT;
