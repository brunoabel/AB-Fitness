-- AB Fitness — Perfil de treino recolhido pelo Onboarding do AB Coach
-- Um registo por utilizador (1:1 com auth.users). Executar no SQL Editor do Supabase.

CREATE TABLE IF NOT EXISTS public.user_fitness_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Biometria
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    age SMALLINT NOT NULL CHECK (age BETWEEN 14 AND 90),
    weight_kg NUMERIC(5,1) NOT NULL CHECK (weight_kg BETWEEN 30 AND 250),
    height_cm SMALLINT NOT NULL CHECK (height_cm BETWEEN 120 AND 230),

    -- Objetivo e experiência
    primary_goal TEXT NOT NULL CHECK (primary_goal IN ('hypertrophy', 'fat_loss', 'strength', 'conditioning')),
    experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),

    -- Logística
    training_location TEXT NOT NULL CHECK (training_location IN ('gym', 'home_gym', 'bodyweight')),
    days_per_week SMALLINT NOT NULL CHECK (days_per_week BETWEEN 3 AND 6),
    session_minutes SMALLINT NOT NULL CHECK (session_minutes IN (45, 60, 75)),

    -- Preferências e restrições
    split_preference TEXT NOT NULL CHECK (split_preference IN ('ppl', 'upper_lower', 'arnold', 'full_body', 'auto')),
    injuries TEXT[] NOT NULL DEFAULT '{}',
    priority_muscles TEXT[] NOT NULL DEFAULT '{}',

    onboarding_completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.user_fitness_profiles IS 'Perfil de treino do onboarding do AB Coach (base para gerar o split personalizado)';

ALTER TABLE public.user_fitness_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fitness_profile_select_own" ON public.user_fitness_profiles;
CREATE POLICY "fitness_profile_select_own" ON public.user_fitness_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "fitness_profile_insert_own" ON public.user_fitness_profiles;
CREATE POLICY "fitness_profile_insert_own" ON public.user_fitness_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "fitness_profile_update_own" ON public.user_fitness_profiles;
CREATE POLICY "fitness_profile_update_own" ON public.user_fitness_profiles
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_fitness_profiles()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_user_fitness_profiles ON public.user_fitness_profiles;
CREATE TRIGGER trg_touch_user_fitness_profiles
    BEFORE UPDATE ON public.user_fitness_profiles
    FOR EACH ROW EXECUTE FUNCTION public.touch_user_fitness_profiles();
