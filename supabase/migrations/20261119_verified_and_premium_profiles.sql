-- AB Fitness — Perfis Verificados e Membros Premium
-- Adiciona suporte para selo de verificação e planos premium.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

-- Atribui verificação e estatuto de fundador/admin ao criador da plataforma
UPDATE public.profiles
SET is_verified = true, is_premium = true
WHERE email ILIKE '%brunoaaraujo2005@gmail.com%' OR role = 'admin';
