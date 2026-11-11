-- AB Fitness: Trainer Hub (módulo B2B2C de Personal Trainer) — Fase 1: schema + RLS.
-- Correr no SQL Editor do Supabase como postgres (precisa de BYPASSRLS para FORCE ROW LEVEL SECURITY
-- e para as funções SECURITY DEFINER), DEPOIS de 20261108 a 20261112.
--
-- Papel de trainer: reaproveita profiles.role = 'coach' (já existe e já é protegido pelo trigger
-- trg_prevent_profile_role_change — só service_role muda role). Não criar 'trainer' como valor novo.
-- Promoção athlete -> coach continua fora do client (service_role / futura ação no AdminDashboard).
--
-- Fatiga muscular por atleta (get_muscle_fatigue_for_athlete) fica para a Fase 4 (Builder), quando a
-- barra de contexto de lesão/recuperação for de facto consumida — evita função morta nesta fase.
BEGIN;

DO $$
DECLARE
    missing TEXT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;

    SELECT string_agg(t, ', ') INTO missing
    FROM unnest(ARRAY['profiles', 'workout_sessions', 'exercise_logs', 'user_fitness_profiles']) AS t
    WHERE to_regclass('public.' || t) IS NULL;
    IF missing IS NOT NULL THEN
        RAISE EXCEPTION 'Faltam tabelas (%). Corre antes as migrations 20261108 a 20261112.', missing;
    END IF;
END $$;

-- ============================================================================
-- 1. profiles: código de convite do trainer
-- ============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trainer_invite_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_trainer_invite_code_key
    ON public.profiles (trainer_invite_code) WHERE trainer_invite_code IS NOT NULL;

-- Gera um código de 6 caracteres (sem O/0/I/1, pra evitar confusão visual) único em profiles.
CREATE OR REPLACE FUNCTION public.generate_trainer_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code TEXT;
BEGIN
    LOOP
        code := '';
        FOR i IN 1..6 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE trainer_invite_code = code);
    END LOOP;
    RETURN code;
END;
$$;

-- Atribui o código automaticamente assim que o role passa a 'coach' (a troca de role em si continua
-- bloqueada para quem não é service_role pelo trigger trg_prevent_profile_role_change).
CREATE OR REPLACE FUNCTION public.ensure_trainer_invite_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'coach' AND NEW.trainer_invite_code IS NULL THEN
        NEW.trainer_invite_code := public.generate_trainer_invite_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_ensure_trainer_invite_code ON public.profiles;
CREATE TRIGGER trg_ensure_trainer_invite_code
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.ensure_trainer_invite_code();

REVOKE EXECUTE ON FUNCTION public.generate_trainer_invite_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ensure_trainer_invite_code() FROM PUBLIC;

-- ============================================================================
-- 2. trainer_rosters: vínculo trainer <-> atleta
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trainer_rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'archived')),
    private_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT trainer_rosters_not_self CHECK (trainer_id <> athlete_id),
    CONSTRAINT trainer_rosters_unique_pair UNIQUE (trainer_id, athlete_id)
);

COMMENT ON TABLE public.trainer_rosters IS 'Vínculo entre personal trainer (profiles.role = coach) e atleta';

CREATE INDEX IF NOT EXISTS trainer_rosters_trainer_idx ON public.trainer_rosters (trainer_id, status);
CREATE INDEX IF NOT EXISTS trainer_rosters_athlete_idx ON public.trainer_rosters (athlete_id);

-- ============================================================================
-- 3. trainer_templates: rotinas reutilizáveis do trainer
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.trainer_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    structure_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.trainer_templates IS 'Templates de treino reutilizáveis criados pelo trainer';

CREATE INDEX IF NOT EXISTS trainer_templates_trainer_idx ON public.trainer_templates (trainer_id);

-- ============================================================================
-- 4. assigned_programs: prescrição do trainer para um atleta
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assigned_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.trainer_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    structure_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_rpe NUMERIC(3, 1) CHECK (target_rpe BETWEEN 1 AND 10),
    rest_timer_seconds INT,
    coach_notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.assigned_programs IS 'Rotina prescrita por um trainer a um atleta específico';

CREATE INDEX IF NOT EXISTS assigned_programs_trainer_idx ON public.assigned_programs (trainer_id);
CREATE INDEX IF NOT EXISTS assigned_programs_athlete_idx ON public.assigned_programs (athlete_id, status);

-- ============================================================================
-- 5. workout_sessions: check-in pós-treino (RPE percebido, dor, feedback) e vínculo à prescrição
-- ============================================================================
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS assigned_program_id UUID
    REFERENCES public.assigned_programs(id) ON DELETE SET NULL;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS actual_rpe NUMERIC(3, 1)
    CHECK (actual_rpe BETWEEN 1 AND 10);
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS pain_flag BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS athlete_feedback TEXT;

CREATE INDEX IF NOT EXISTS workout_sessions_assigned_program_idx
    ON public.workout_sessions (assigned_program_id) WHERE assigned_program_id IS NOT NULL;

-- ============================================================================
-- 6. touch_updated_at genérico para as 3 tabelas novas
-- ============================================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_touch_trainer_rosters ON public.trainer_rosters;
CREATE TRIGGER trg_touch_trainer_rosters BEFORE UPDATE ON public.trainer_rosters
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_trainer_templates ON public.trainer_templates;
CREATE TRIGGER trg_touch_trainer_templates BEFORE UPDATE ON public.trainer_templates
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_assigned_programs ON public.assigned_programs;
CREATE TRIGGER trg_touch_assigned_programs BEFORE UPDATE ON public.assigned_programs
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- 7. is_active_trainer_of: helper usado pelas policies das tabelas do atleta
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_active_trainer_of(p_athlete_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.trainer_rosters
        WHERE trainer_id = (SELECT auth.uid())
          AND athlete_id = p_athlete_id
          AND status = 'active'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_active_trainer_of(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_trainer_of(UUID) TO authenticated;

-- ============================================================================
-- 8. redeem_trainer_invite_code: o atleta troca o código pelo vínculo (sem INSERT direto em trainer_rosters)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.redeem_trainer_invite_code(p_code TEXT)
RETURNS TABLE (trainer_id UUID, trainer_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_trainer_id UUID;
    v_trainer_name TEXT;
BEGIN
    SELECT id, full_name INTO v_trainer_id, v_trainer_name
    FROM public.profiles
    WHERE trainer_invite_code = upper(trim(p_code)) AND role = 'coach';

    IF v_trainer_id IS NULL THEN
        RAISE EXCEPTION 'Código de convite inválido.' USING ERRCODE = '22023';
    END IF;

    IF v_trainer_id = auth.uid() THEN
        RAISE EXCEPTION 'Não podes vincular-te a ti próprio.' USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.trainer_rosters (trainer_id, athlete_id, status)
    VALUES (v_trainer_id, auth.uid(), 'active')
    ON CONFLICT (trainer_id, athlete_id) DO UPDATE
        SET status = 'active', updated_at = timezone('utc'::text, now())
        WHERE trainer_rosters.status <> 'active';

    RETURN QUERY SELECT v_trainer_id, v_trainer_name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) TO authenticated;

-- ============================================================================
-- 9. set_roster_note: só o trainer escreve private_notes (coluna fora do GRANT UPDATE direto)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_roster_note(p_athlete_id UUID, p_note TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.trainer_rosters
    SET private_notes = p_note, updated_at = timezone('utc'::text, now())
    WHERE trainer_id = auth.uid() AND athlete_id = p_athlete_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vínculo com este atleta não encontrado.' USING ERRCODE = '22023';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_roster_note(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_roster_note(UUID, TEXT) TO authenticated;

-- ============================================================================
-- 10. RLS: ativar + forçar nas tabelas novas, revogar de PUBLIC/anon, privilégios mínimos
-- ============================================================================
DO $$
DECLARE
    t TEXT;
    p RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY['trainer_rosters', 'trainer_templates', 'assigned_programs']
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
        END LOOP;
        EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon', t);
        EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
    END LOOP;
END $$;

-- 10.1 trainer_rosters: sem INSERT/DELETE diretos (só via redeem_trainer_invite_code); UPDATE restrito a status
REVOKE INSERT, DELETE ON public.trainer_rosters FROM authenticated;
GRANT SELECT ON public.trainer_rosters TO authenticated;
GRANT UPDATE (status, updated_at) ON public.trainer_rosters TO authenticated;

CREATE POLICY trainer_rosters_select_party ON public.trainer_rosters FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) IN (trainer_id, athlete_id));

-- Arquivar: qualquer uma das partes. Reativar para 'active': só o trainer (o atleta não se auto-reativa).
CREATE POLICY trainer_rosters_update_party ON public.trainer_rosters FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IN (trainer_id, athlete_id))
    WITH CHECK (
        (SELECT auth.uid()) IN (trainer_id, athlete_id)
        AND status IN ('active', 'archived')
        AND (status = 'archived' OR (SELECT auth.uid()) = trainer_id)
    );

-- 10.2 trainer_templates: só o próprio trainer
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainer_templates TO authenticated;

CREATE POLICY trainer_templates_select_own ON public.trainer_templates FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = trainer_id);
CREATE POLICY trainer_templates_insert_own ON public.trainer_templates FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = trainer_id
        AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role = 'coach')
    );
CREATE POLICY trainer_templates_update_own ON public.trainer_templates FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = trainer_id) WITH CHECK ((SELECT auth.uid()) = trainer_id);
CREATE POLICY trainer_templates_delete_own ON public.trainer_templates FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = trainer_id);

-- 10.3 assigned_programs: trainer gere os seus; atleta só lê os seus
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assigned_programs TO authenticated;

CREATE POLICY assigned_programs_select_party ON public.assigned_programs FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) IN (trainer_id, athlete_id));
CREATE POLICY assigned_programs_insert_trainer ON public.assigned_programs FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = trainer_id AND public.is_active_trainer_of(athlete_id));
CREATE POLICY assigned_programs_update_trainer ON public.assigned_programs FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = trainer_id AND public.is_active_trainer_of(athlete_id))
    WITH CHECK ((SELECT auth.uid()) = trainer_id AND public.is_active_trainer_of(athlete_id));
CREATE POLICY assigned_programs_delete_trainer ON public.assigned_programs FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = trainer_id);

-- ============================================================================
-- 11. Acesso do trainer aos dados dos seus atletas ativos (adicional às policies existentes)
-- ============================================================================
DROP POLICY IF EXISTS profiles_select_trainer ON public.profiles;
CREATE POLICY profiles_select_trainer ON public.profiles FOR SELECT TO authenticated
    USING (public.is_active_trainer_of(id));

DROP POLICY IF EXISTS fitness_profile_select_trainer ON public.user_fitness_profiles;
CREATE POLICY fitness_profile_select_trainer ON public.user_fitness_profiles FOR SELECT TO authenticated
    USING (public.is_active_trainer_of(user_id));

DROP POLICY IF EXISTS workout_sessions_select_trainer ON public.workout_sessions;
CREATE POLICY workout_sessions_select_trainer ON public.workout_sessions FOR SELECT TO authenticated
    USING (public.is_active_trainer_of(user_id));

DROP POLICY IF EXISTS exercise_logs_select_trainer ON public.exercise_logs;
CREATE POLICY exercise_logs_select_trainer ON public.exercise_logs FOR SELECT TO authenticated
    USING (public.is_active_trainer_of(user_id));

-- ============================================================================
-- 12. Verificação: tabelas novas têm de ficar com RLS ativo e forçado
-- ============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname IN ('trainer_rosters', 'trainer_templates', 'assigned_programs')
          AND NOT (c.relrowsecurity AND c.relforcerowsecurity)
    LOOP
        RAISE WARNING 'Tabela public.% sem RLS completo (enable=%, force=%). Rever.', r.relname, r.relrowsecurity, r.relforcerowsecurity;
    END LOOP;
END $$;

COMMIT;
