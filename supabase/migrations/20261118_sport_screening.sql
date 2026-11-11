-- AB Fitness — Screening de atleta híbrido (desporto além do ginásio)
-- Estende public.user_fitness_profiles. RLS existente (fitness_profile_*_own) já cobre as novas colunas.

ALTER TABLE public.user_fitness_profiles
    ADD COLUMN IF NOT EXISTS has_sport BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS sports TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS sport_days SMALLINT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS sport_intensity TEXT,
    ADD COLUMN IF NOT EXISTS session_order TEXT,
    ADD COLUMN IF NOT EXISTS other_sport TEXT;

ALTER TABLE public.user_fitness_profiles
    DROP CONSTRAINT IF EXISTS user_fitness_profiles_sport_intensity_check,
    ADD CONSTRAINT user_fitness_profiles_sport_intensity_check
        CHECK (sport_intensity IS NULL OR sport_intensity IN ('recreational', 'moderate', 'competitive'));

ALTER TABLE public.user_fitness_profiles
    DROP CONSTRAINT IF EXISTS user_fitness_profiles_session_order_check,
    ADD CONSTRAINT user_fitness_profiles_session_order_check
        CHECK (session_order IS NULL OR session_order IN ('gym_first', 'sport_first', 'split_hours'));

COMMENT ON COLUMN public.user_fitness_profiles.sports IS 'Modalidades praticadas além do ginásio (ver SPORTS em profileSchema.js)';
COMMENT ON COLUMN public.user_fitness_profiles.sport_days IS 'Dias da semana (0=segunda ... 6=domingo) em que há desporto';
