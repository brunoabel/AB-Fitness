-- Motor de treino P1: inventário de equipamento em casa e treino de 2 dias por semana.
-- Os ids de equipamento são os de src/components/onboarding/profileSchema.js (HOME_EQUIPMENT).

ALTER TABLE public.user_fitness_profiles
    ADD COLUMN IF NOT EXISTS equipment TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.user_fitness_profiles
    DROP CONSTRAINT IF EXISTS user_fitness_profiles_days_per_week_check;

ALTER TABLE public.user_fitness_profiles
    ADD CONSTRAINT user_fitness_profiles_days_per_week_check CHECK (days_per_week BETWEEN 2 AND 6);
