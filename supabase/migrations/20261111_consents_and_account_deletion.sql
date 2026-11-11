-- AB Fitness: prova de consentimento (RGPD art. 7.º) e direito ao apagamento (art. 17.º; Apple 5.1.1(v) e Google Play).
-- Correr no SQL Editor do Supabase (como postgres), depois das migrations anteriores.

-- 1) Registo de consentimentos. Só o servidor escreve (trigger); o utilizador só lê os seus.
CREATE TABLE IF NOT EXISTS public.user_consents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('terms', 'health_data')),
    version TEXT NOT NULL,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, kind, version)
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_consents_select_own" ON public.user_consents;
CREATE POLICY "user_consents_select_own" ON public.user_consents FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
-- Sem políticas de INSERT/UPDATE/DELETE: o cliente não consegue forjar nem apagar o registo.

-- Copia as marcas de consentimento enviadas no signUp (options.data) para a tabela, com a hora do servidor.
CREATE OR REPLACE FUNCTION public.record_signup_consents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
    v TEXT := left(COALESCE(meta ->> 'consent_version', 'unknown'), 20);
BEGIN
    IF meta ? 'consent_terms_at' THEN
        INSERT INTO public.user_consents (user_id, kind, version) VALUES (NEW.id, 'terms', v) ON CONFLICT DO NOTHING;
    END IF;
    IF meta ? 'consent_health_at' THEN
        INSERT INTO public.user_consents (user_id, kind, version) VALUES (NEW.id, 'health_data', v) ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.record_signup_consents() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_consents ON auth.users;
CREATE TRIGGER on_auth_user_created_consents
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.record_signup_consents();

-- 2) Apagar a conta e todos os dados do utilizador autenticado.
-- Apagar a linha de auth.users remove, em cascata: profiles e tudo o que depende dele (treinos, logs, corridas,
-- amizades, respeitos, planos), user_fitness_profiles, user_consents e as sessões de autenticação.
-- Os ficheiros do bucket "avatars" são removidos pelo cliente através da API de Storage antes desta chamada
-- (apagar linhas de storage.objects por SQL deixaria os ficheiros órfãos no armazenamento).
-- p_confirm tem de ser 'ELIMINAR': proteção do lado do servidor contra chamadas acidentais.
CREATE OR REPLACE FUNCTION public.delete_user_account_and_data(p_confirm TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    uid UUID := auth.uid();
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Sessão necessária' USING ERRCODE = '28000';
    END IF;
    IF p_confirm IS DISTINCT FROM 'ELIMINAR' THEN
        RAISE EXCEPTION 'Confirmação em falta' USING ERRCODE = '22023';
    END IF;

    DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account_and_data(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account_and_data(TEXT) TO authenticated;
