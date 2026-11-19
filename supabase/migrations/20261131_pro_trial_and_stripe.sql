-- Migration: 20261131_pro_trial_and_stripe.sql
-- Adiciona colunas para gestão de período de testes (Trial) e subscrições Stripe

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_idx ON public.profiles (stripe_customer_id);
