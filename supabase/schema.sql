-- ==============================================================================
-- AB FITNESS — SCHEMA DE BANCO DE DADOS (SUPABASE POSTGRESQL)
-- Arquitetura SaaS Multi-Tenant com Isolamento por Usuário via Row Level Security (RLS)
-- Desenvolvido por Bruno Abel
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA: PROFILES (Perfis dos Usuários)
-- Conectada diretamente ao auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'athlete', -- 'athlete', 'coach', 'admin'
    athlete_type TEXT DEFAULT 'soccer_gym', -- Ex: Atleta de Futebol & Hipertrofia
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentário da tabela
COMMENT ON TABLE public.profiles IS 'Perfis dos usuários sincronizados com auth.users';

-- 3. TABELA: WORKOUT_PLANS (Planos de Treino Personalizados)
-- Cada usuário possui seus próprios planos isolados
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.workout_plans IS 'Planos de treino customizados por usuário';

-- 4. TABELA: WORKOUT_DAYS (Dias de Treino da Semana)
CREATE TABLE IF NOT EXISTS public.workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    day_number INT NOT NULL, -- 1: Seg, 2: Ter, 3: Qua, 4: Qui, 5: Sex, 6: Sab, 7: Dom
    day_name TEXT NOT NULL,
    title TEXT NOT NULL,
    focus TEXT NOT NULL,
    duration TEXT DEFAULT '45 min',
    intensity TEXT DEFAULT 'Média',
    is_rest_day BOOLEAN DEFAULT false,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.workout_days IS 'Rotinas diárias de treino de cada usuário';

-- 5. TABELA: EXERCISES (Exercícios de Cada Rotina)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE,
    exercise_code TEXT NOT NULL,
    name TEXT NOT NULL,
    target_muscle TEXT NOT NULL,
    secondary_muscle TEXT,
    equipment TEXT,
    suggested_weight NUMERIC(6, 2) DEFAULT 10.0,
    suggested_reps INT DEFAULT 10,
    default_sets INT DEFAULT 3,
    rest_time_seconds INT DEFAULT 60,
    order_index INT DEFAULT 0,
    badge TEXT,
    soccer_benefit TEXT,
    tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.exercises IS 'Exercícios detalhados pertencentes à rotina do usuário';

-- 6. TABELA: WORKOUT_SESSIONS (Sessões Executadas / Histórico)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,
    workout_day_name TEXT NOT NULL,
    workout_title TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

COMMENT ON TABLE public.workout_sessions IS 'Histórico de treinos concluídos pelo atleta';

-- 7. TABELA: EXERCISE_LOGS (Registros Detalhados de Séries e Cargas)
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    exercise_code TEXT NOT NULL,
    set_number INT NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL,
    reps_completed INT NOT NULL,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.exercise_logs IS 'Histórico de séries, cargas (kg) e repetições para progressão de carga';

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) — SEGURANÇA E ISOLAMENTO MULTI-TENANT
-- Garante que um usuário NUNCA acesse ou modifique dados de outros usuários
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
DROP POLICY IF EXISTS "Usuário pode visualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode visualizar seu próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário pode inserir seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode inserir seu próprio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuário pode atualizar seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuário pode atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Políticas para WORKOUT_PLANS
DROP POLICY IF EXISTS "Usuário gerencia seus próprios planos de treino" ON public.workout_plans;
CREATE POLICY "Usuário gerencia seus próprios planos de treino" 
ON public.workout_plans FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Políticas para WORKOUT_DAYS
DROP POLICY IF EXISTS "Usuário gerencia seus próprios dias de treino" ON public.workout_days;
CREATE POLICY "Usuário gerencia seus próprios dias de treino" 
ON public.workout_days FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Políticas para EXERCISES
DROP POLICY IF EXISTS "Usuário gerencia seus próprios exercícios" ON public.exercises;
CREATE POLICY "Usuário gerencia seus próprios exercícios" 
ON public.exercises FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Políticas para WORKOUT_SESSIONS
DROP POLICY IF EXISTS "Usuário gerencia suas próprias sessões concluídas" ON public.workout_sessions;
CREATE POLICY "Usuário gerencia suas próprias sessões concluídas" 
ON public.workout_sessions FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Políticas para EXERCISE_LOGS
DROP POLICY IF EXISTS "Usuário gerencia seus próprios logs de séries e cargas" ON public.exercise_logs;
CREATE POLICY "Usuário gerencia seus próprios logs de séries e cargas" 
ON public.exercise_logs FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 8. TABELA: RUNS (Histórico de Corridas GPS / AB Running Club)
CREATE TABLE IF NOT EXISTS public.runs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    distance_km NUMERIC(8, 3) DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    avg_pace TEXT DEFAULT '--:--',
    avg_pace_seconds INT DEFAULT 0,
    calories INT DEFAULT 0,
    avg_speed_kmh NUMERIC(6, 2) DEFAULT 0,
    elevation_gain_m INT DEFAULT 0,
    splits JSONB DEFAULT '[]'::jsonb,
    coordinates JSONB DEFAULT '[]'::jsonb,
    is_simulation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.runs IS 'Registos de corridas com trajeto GPS, parciais (splits) e altimetria';

ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuário gerencia suas próprias corridas" ON public.runs;
CREATE POLICY "Usuário gerencia suas próprias corridas"
ON public.runs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: CRIAÇÃO DE PERFIL AO CADASTRAR NO SUPABASE AUTH
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Disparador que escuta novas inserções em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
