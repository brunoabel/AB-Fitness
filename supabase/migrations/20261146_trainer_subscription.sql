-- AB Fitness: plano Personal Trainer (Stripe, STRIPE_TRAINER_PRICE_ID).
-- Correr como postgres, DEPOIS de 20261134_p0_integrity.sql.
--
-- 1. profiles.trainer_subscription_active: subscrição Personal Trainer ativa ou em teste.
-- 2. profiles.trainer_role_from_stripe: a role 'coach' foi concedida pelo webhook (e não por um admin).
--    Só nesse caso o fim da subscrição devolve a role a 'athlete'. Os vínculos e programas ficam guardados.
-- 3. As duas colunas só mudam via service_role (webhook) ou admin/CEO, como is_pro e stripe_customer_id.
BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trainer_subscription_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trainer_role_from_stripe BOOLEAN NOT NULL DEFAULT false;

-- Guarda de colunas protegidas (UPDATE): definição de 20261134 + colunas do plano Trainer
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_privileged BOOLEAN := coalesce(auth.role(), '') = 'service_role'
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role IN ('admin', 'ceo')
        );
BEGIN
    IF v_privileged THEN
        RETURN NEW;
    END IF;

    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
       OR NEW.is_premium IS DISTINCT FROM OLD.is_premium
       OR NEW.is_pro IS DISTINCT FROM OLD.is_pro
       OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
       OR NEW.trainer_subscription_active IS DISTINCT FROM OLD.trainer_subscription_active
       OR NEW.trainer_role_from_stripe IS DISTINCT FROM OLD.trainer_role_from_stripe
    THEN
        RAISE EXCEPTION 'Não é permitido alterar o papel ou estatuto de verificação/subscrição do utilizador.'
            USING ERRCODE = '42501';
    END IF;

    IF NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
       OR NEW.trial_granted_at IS DISTINCT FROM OLD.trial_granted_at
    THEN
        IF coalesce(current_setting('ab.trial_grant', true), '') <> 'on'
           OR NEW.trial_ends_at > now() + interval '15 days'
        THEN
            RAISE EXCEPTION 'Não é permitido alterar o período de teste.' USING ERRCODE = '42501';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;

-- Guarda no INSERT: um perfil criado pelo cliente nasce sem privilégios pagos
CREATE OR REPLACE FUNCTION public.sanitize_profile_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF coalesce(auth.role(), '') IN ('authenticated', 'anon') THEN
        NEW.is_pro := false;
        NEW.is_premium := false;
        NEW.is_verified := false;
        NEW.trial_ends_at := NULL;
        NEW.trial_granted_at := NULL;
        NEW.stripe_customer_id := NULL;
        NEW.trainer_subscription_active := false;
        NEW.trainer_role_from_stripe := false;
    END IF;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sanitize_profile_insert() FROM PUBLIC, anon, authenticated;

COMMIT;
