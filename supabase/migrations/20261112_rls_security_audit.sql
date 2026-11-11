-- AB Fitness: auditoria e endurecimento de RLS (dados de saúde, GPS, social, storage).
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de todas as outras migrations (por isso 20261112, não 20261109:
-- este ficheiro precisa de friendships, user_consents, etc. e ordena-se alfabeticamente antes de 20261109_social_profiles).
-- Idempotente e transacional: se qualquer passo falhar, nada é aplicado.
--
-- Mapeamento dos nomes pedidos para o schema real do projeto:
--   onboarding_biometrics, injury_prevention -> user_fitness_profiles (peso, altura, idade, lesões: colunas da mesma tabela)
--   workout_logs, exercise_history           -> workout_sessions + exercise_logs
--   muscle_recovery                          -> não é tabela: calculado por get_muscle_fatigue() (SECURITY INVOKER, sob RLS)
--   running_routes                           -> runs
BEGIN;

-- ============================================================================
-- 0. Pré-condições
-- ============================================================================
DO $$
DECLARE
    missing TEXT;
BEGIN
    -- FORCE RLS aplica-se também ao dono da tabela. As funções SECURITY DEFINER (feed, handle_new_user, apagar conta)
    -- correm como dono e precisam de BYPASSRLS; sem isso o registo e o social deixariam de funcionar.
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; FORCE ROW LEVEL SECURITY partiria as funções SECURITY DEFINER. Corre como postgres.', current_user;
    END IF;

    SELECT string_agg(t, ', ') INTO missing
    FROM unnest(ARRAY['profiles','workout_plans','workout_days','exercises','workout_sessions','exercise_logs','runs',
                      'user_fitness_profiles','friendships','workout_respects','user_consents','muscle_regions','exercise_muscle_targets']) AS t
    WHERE to_regclass('public.' || t) IS NULL;
    IF missing IS NOT NULL THEN
        RAISE EXCEPTION 'Faltam tabelas (%). Corre antes as migrations 20261108 a 20261111.', missing;
    END IF;
END $$;

-- ============================================================================
-- 1. Partilha explícita: nada é partilhado por defeito
-- ============================================================================
ALTER TABLE public.runs ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.workout_sessions ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.runs ALTER COLUMN is_shared SET DEFAULT false;
ALTER TABLE public.workout_sessions ALTER COLUMN is_shared SET DEFAULT false;

-- Índices das colunas usadas pelas policies (evitam varrimentos completos em cada pedido)
CREATE INDEX IF NOT EXISTS workout_plans_user_idx ON public.workout_plans (user_id);
CREATE INDEX IF NOT EXISTS workout_days_user_idx ON public.workout_days (user_id);
CREATE INDEX IF NOT EXISTS exercises_user_idx ON public.exercises (user_id);
CREATE INDEX IF NOT EXISTS exercise_logs_user_idx ON public.exercise_logs (user_id);
CREATE INDEX IF NOT EXISTS runs_user_created_idx ON public.runs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON public.friendships (requester_id, status);

-- ============================================================================
-- 2. RLS ativo e FORÇADO em todas as tabelas de utilizador; recomeçar as policies do zero
-- ============================================================================
DO $$
DECLARE
    t TEXT;
    p RECORD;
BEGIN
    FOREACH t IN ARRAY ARRAY['profiles','workout_plans','workout_days','exercises','workout_sessions','exercise_logs','runs',
                             'user_fitness_profiles','friendships','workout_respects','user_consents','muscle_regions','exercise_muscle_targets']
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
        FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
        END LOOP;
        -- Nunca o anon; e sem TRUNCATE/REFERENCES/TRIGGER para ninguém da API (o TRUNCATE ignora o RLS)
        EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon', t);
        EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
    END LOOP;
END $$;

-- ============================================================================
-- 3. Privilégios mínimos por tabela (a RLS filtra linhas; isto limita operações e colunas)
-- ============================================================================
REVOKE INSERT, UPDATE, DELETE ON public.muscle_regions, public.exercise_muscle_targets FROM authenticated;
GRANT SELECT ON public.muscle_regions, public.exercise_muscle_targets TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.user_consents FROM authenticated;      -- só o trigger do servidor escreve
GRANT SELECT ON public.user_consents TO authenticated;

REVOKE INSERT ON public.workout_respects FROM authenticated;                   -- só toggle_respect() (valida a amizade)
REVOKE UPDATE ON public.workout_respects FROM authenticated;
GRANT SELECT, DELETE ON public.workout_respects TO authenticated;

REVOKE DELETE ON public.profiles FROM authenticated;                           -- o perfil só desaparece com a conta
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Amizades: o destinatário só pode mudar o estado. Antes, o UPDATE deixava-o reescrever requester_id e forjar
-- uma amizade aceite com qualquer utilizador, passando a ver o feed e as estatísticas dessa pessoa.
REVOKE INSERT, UPDATE ON public.friendships FROM authenticated;
GRANT SELECT, DELETE ON public.friendships TO authenticated;
GRANT INSERT (requester_id, addressee_id) ON public.friendships TO authenticated;
GRANT UPDATE (status) ON public.friendships TO authenticated;

-- ============================================================================
-- 4. Policies. Sempre TO authenticated e com (SELECT auth.uid()) para o planner guardar o valor em cache
-- ============================================================================

-- 4.1 profiles: só o próprio. Amigos veem o perfil apenas através das RPCs que respeitam privacy_settings.
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = id AND COALESCE(role, 'athlete') = 'athlete');
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = id) WITH CHECK ((SELECT auth.uid()) = id);

-- 4.2 Dados de saúde (art. 9.º RGPD): peso, altura, idade, lesões, prioridades. Só o dono, sem exceções para amigos.
CREATE POLICY fitness_profile_select_own ON public.user_fitness_profiles FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);
CREATE POLICY fitness_profile_insert_own ON public.user_fitness_profiles FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY fitness_profile_update_own ON public.user_fitness_profiles FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY fitness_profile_delete_own ON public.user_fitness_profiles FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- 4.3 Planos, dias e exercícios do plano: só o dono
CREATE POLICY workout_plans_select_own ON public.workout_plans FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_plans_insert_own ON public.workout_plans FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_plans_update_own ON public.workout_plans FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_plans_delete_own ON public.workout_plans FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY workout_days_select_own ON public.workout_days FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_days_insert_own ON public.workout_days FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_days_update_own ON public.workout_days FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_days_delete_own ON public.workout_days FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY exercises_select_own ON public.exercises FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY exercises_insert_own ON public.exercises FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY exercises_update_own ON public.exercises FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY exercises_delete_own ON public.exercises FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.4 Sessões de treino: dono + amigos aceites SÓ se is_shared = true
CREATE POLICY workout_sessions_select_own ON public.workout_sessions FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_select_shared_friends ON public.workout_sessions FOR SELECT TO authenticated
    USING (
        is_shared
        AND EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
              AND ((f.requester_id = workout_sessions.user_id AND f.addressee_id = (SELECT auth.uid()))
                OR (f.addressee_id = workout_sessions.user_id AND f.requester_id = (SELECT auth.uid())))
        )
    );
CREATE POLICY workout_sessions_insert_own ON public.workout_sessions FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_update_own ON public.workout_sessions FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY workout_sessions_delete_own ON public.workout_sessions FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.5 Séries e cargas (histórico de exercícios): só o dono. Cada log tem de apontar para uma sessão/exercício do próprio:
-- sem isto, quem conhecesse o id de uma sessão alheia (o feed expõe-no) podia injetar exercícios nela.
CREATE POLICY exercise_logs_select_own ON public.exercise_logs FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY exercise_logs_insert_own ON public.exercise_logs FOR INSERT TO authenticated
    WITH CHECK (
        (SELECT auth.uid()) = user_id
        AND (session_id IS NULL OR EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())))
        AND (exercise_id IS NULL OR EXISTS (SELECT 1 FROM public.exercises e WHERE e.id = exercise_id AND e.user_id = (SELECT auth.uid())))
    );
CREATE POLICY exercise_logs_update_own ON public.exercise_logs FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK (
        (SELECT auth.uid()) = user_id
        AND (session_id IS NULL OR EXISTS (SELECT 1 FROM public.workout_sessions s WHERE s.id = session_id AND s.user_id = (SELECT auth.uid())))
        AND (exercise_id IS NULL OR EXISTS (SELECT 1 FROM public.exercises e WHERE e.id = exercise_id AND e.user_id = (SELECT auth.uid())))
    );
CREATE POLICY exercise_logs_delete_own ON public.exercise_logs FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.6 Rotas GPS (Running Club): dono + amigos aceites SÓ se is_shared = true.
-- Nota: uma corrida partilhada expõe `coordinates`, que normalmente revela a morada (início e fim). Quando o botão de partilha
-- existir, convém expor as corridas dos amigos por uma RPC que corte os primeiros e últimos 200 m.
CREATE POLICY runs_select_own ON public.runs FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY runs_select_shared_friends ON public.runs FOR SELECT TO authenticated
    USING (
        is_shared
        AND EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE f.status = 'accepted'
              AND ((f.requester_id = runs.user_id AND f.addressee_id = (SELECT auth.uid()))
                OR (f.addressee_id = runs.user_id AND f.requester_id = (SELECT auth.uid())))
        )
    );
CREATE POLICY runs_insert_own ON public.runs FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY runs_update_own ON public.runs FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY runs_delete_own ON public.runs FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.7 Amizades: cada parte vê as suas; só o requerente cria (pendente); só o destinatário aceita ou bloqueia; qualquer parte apaga
CREATE POLICY friendships_select_party ON public.friendships FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) IN (requester_id, addressee_id));
CREATE POLICY friendships_insert_as_requester ON public.friendships FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = requester_id AND status = 'pending');
CREATE POLICY friendships_update_addressee ON public.friendships FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = addressee_id)
    WITH CHECK ((SELECT auth.uid()) = addressee_id AND status IN ('accepted', 'blocked'));
CREATE POLICY friendships_delete_party ON public.friendships FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) IN (requester_id, addressee_id));

-- 4.8 Respeitos: o próprio vê e retira; criar só pela RPC
CREATE POLICY respects_select_own ON public.workout_respects FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY respects_delete_own ON public.workout_respects FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.9 Consentimentos: o utilizador só lê os seus; o trigger do servidor escreve
CREATE POLICY user_consents_select_own ON public.user_consents FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- 4.10 Tabelas de referência (sem dados pessoais): leitura para sessões iniciadas, nunca anónima
CREATE POLICY muscle_regions_read ON public.muscle_regions FOR SELECT TO authenticated USING (true);
CREATE POLICY exercise_muscle_targets_read ON public.exercise_muscle_targets FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- 5. Funções: nada de EXECUTE por defeito para o anon nas funções internas e de trigger
-- ============================================================================
DO $$
DECLARE
    sig TEXT;
BEGIN
    FOREACH sig IN ARRAY ARRAY[
        'public.handle_new_user()', 'public.normalize_profile()', 'public.prevent_profile_role_change()',
        'public.touch_user_fitness_profiles()', 'public.record_signup_consents()',
        'public.privacy_flag(jsonb,text,boolean)', 'public.are_friends(uuid,uuid)',
        'public.athlete_streak(uuid)', 'public.athlete_window_stats(uuid,integer)'
    ]
    LOOP
        IF to_regprocedure(sig) IS NOT NULL THEN
            EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 6. Storage: fotos de perfil. O bucket é público (as imagens abrem por URL direto, sem policy), mas
-- ninguém pode LISTAR ficheiros de terceiros. Escrever, ler a lista e apagar: só na pasta {auth.uid()}/.
-- ============================================================================
DO $$
DECLARE
    p RECORD;
BEGIN
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE 'avatars\_%' LOOP
        EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
    END LOOP;
END $$;

CREATE POLICY avatars_select_own ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY avatars_insert_own ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY avatars_update_own ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
CREATE POLICY avatars_delete_own ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

-- ============================================================================
-- 7. Verificação: avisa de qualquer tabela do schema public sem RLS ou sem FORCE (ex.: criada à mão no painel)
-- ============================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity)
    LOOP
        RAISE WARNING 'Tabela public.% sem RLS completo (enable=%, force=%). Rever.', r.relname, r.relrowsecurity, r.relforcerowsecurity;
    END LOOP;
END $$;

COMMIT;

-- Resultado esperado: zero linhas (todas as tabelas do schema public com RLS ativo e forçado).
SELECT c.relname AS tabela_sem_rls_completo
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT (c.relrowsecurity AND c.relforcerowsecurity);
