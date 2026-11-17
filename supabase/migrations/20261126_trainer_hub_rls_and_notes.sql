-- AB Fitness: Trainer Hub — Endurecimento de RLS, Privacidade de Notas e Ciclo de Vida do Vínculo
-- Correr no SQL Editor do Supabase como postgres, DEPOIS de 20261117_trainer_hub_roster_tags.sql.
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.trainer_rosters') IS NULL OR to_regclass('public.assigned_programs') IS NULL THEN
        RAISE EXCEPTION 'Faltam tabelas do Trainer Hub. Corre antes 20261113 a 20261117.';
    END IF;
END $$;

-- ============================================================================
-- 1. trainer_rosters: ocultar private_notes e tags do SELECT direto do atleta
-- e impedir reativação unilateral pelo ex-treinador sem novo código aceite pelo atleta.
-- ============================================================================
REVOKE SELECT ON public.trainer_rosters FROM authenticated;
GRANT SELECT (id, trainer_id, athlete_id, status, created_at, updated_at) ON public.trainer_rosters TO authenticated;

DROP POLICY IF EXISTS trainer_rosters_update_party ON public.trainer_rosters;
CREATE POLICY trainer_rosters_update_party ON public.trainer_rosters FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IN (trainer_id, athlete_id))
    WITH CHECK (
        (SELECT auth.uid()) IN (trainer_id, athlete_id)
        AND status = 'archived'
    );

-- ============================================================================
-- 2. Trigger: ao arquivar um vínculo em trainer_rosters, arquivar automaticamente
-- todos os assigned_programs ativos desse par (evita treinos órfãos ativos no atleta).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cascade_archive_assigned_programs()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'archived' AND OLD.status <> 'archived' THEN
        UPDATE public.assigned_programs
        SET status = 'archived', updated_at = timezone('utc'::text, now())
        WHERE trainer_id = NEW.trainer_id
          AND athlete_id = NEW.athlete_id
          AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cascade_archive_assigned_programs() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_cascade_archive_programs ON public.trainer_rosters;
CREATE TRIGGER trg_cascade_archive_programs
    AFTER UPDATE OF status ON public.trainer_rosters
    FOR EACH ROW EXECUTE FUNCTION public.cascade_archive_assigned_programs();

-- ============================================================================
-- 3. assigned_programs: exigir vínculo ativo para o trainer ler ou apagar;
-- permitir também ao atleta arquivar um programa prescrito a si.
-- ============================================================================
DROP POLICY IF EXISTS assigned_programs_select_party ON public.assigned_programs;
CREATE POLICY assigned_programs_select_party ON public.assigned_programs FOR SELECT TO authenticated
    USING (
        (SELECT auth.uid()) = athlete_id
        OR ((SELECT auth.uid()) = trainer_id AND public.is_active_trainer_of(athlete_id))
    );

DROP POLICY IF EXISTS assigned_programs_delete_trainer ON public.assigned_programs;
CREATE POLICY assigned_programs_delete_trainer ON public.assigned_programs FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = trainer_id AND public.is_active_trainer_of(athlete_id));

DROP POLICY IF EXISTS assigned_programs_archive_athlete ON public.assigned_programs;
CREATE POLICY assigned_programs_archive_athlete ON public.assigned_programs FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = athlete_id)
    WITH CHECK ((SELECT auth.uid()) = athlete_id AND status = 'archived');

-- ============================================================================
-- 4. redeem_trainer_invite_code: validar sessão e arquivar treinadores anteriores
-- ============================================================================
CREATE OR REPLACE FUNCTION public.redeem_trainer_invite_code(p_code TEXT)
RETURNS TABLE (trainer_id UUID, trainer_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_uid UUID := (SELECT auth.uid());
    v_trainer_id UUID;
    v_trainer_name TEXT;
BEGIN
    IF v_uid IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária.' USING ERRCODE = '28000';
    END IF;

    SELECT id, full_name INTO v_trainer_id, v_trainer_name
    FROM public.profiles
    WHERE trainer_invite_code = upper(trim(p_code)) AND role = 'coach';

    IF v_trainer_id IS NULL THEN
        RAISE EXCEPTION 'Código de convite inválido.' USING ERRCODE = '22023';
    END IF;

    IF v_trainer_id = v_uid THEN
        RAISE EXCEPTION 'Não podes vincular-te a ti próprio.' USING ERRCODE = '22023';
    END IF;

    UPDATE public.trainer_rosters
    SET status = 'archived', updated_at = timezone('utc'::text, now())
    WHERE athlete_id = v_uid AND trainer_id <> v_trainer_id AND status = 'active';

    INSERT INTO public.trainer_rosters (trainer_id, athlete_id, status)
    VALUES (v_trainer_id, v_uid, 'active')
    ON CONFLICT (trainer_id, athlete_id) DO UPDATE
        SET status = 'active', updated_at = timezone('utc'::text, now())
        WHERE trainer_rosters.status <> 'active';

    RETURN QUERY SELECT v_trainer_id, v_trainer_name;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_trainer_invite_code(TEXT) TO authenticated;

-- ============================================================================
-- 5. set_roster_note & set_roster_tags: exigir vínculo ativo
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
    WHERE trainer_id = (SELECT auth.uid()) AND athlete_id = p_athlete_id AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vínculo ativo com este atleta não encontrado.' USING ERRCODE = '22023';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_roster_note(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_roster_note(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.set_roster_tags(p_athlete_id UUID, p_tags TEXT[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.trainer_rosters
    SET tags = (
        SELECT COALESCE(array_agg(DISTINCT trim(t)) FILTER (WHERE trim(t) <> ''), '{}')
        FROM unnest(p_tags) AS t
    ), updated_at = timezone('utc'::text, now())
    WHERE trainer_id = (SELECT auth.uid()) AND athlete_id = p_athlete_id AND status = 'active';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vínculo ativo com este atleta não encontrado.' USING ERRCODE = '22023';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_roster_tags(UUID, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_roster_tags(UUID, TEXT[]) TO authenticated;

-- ============================================================================
-- 6. get_roster_overview(): devolve também private_notes apenas ao próprio trainer
-- ============================================================================
DROP FUNCTION IF EXISTS public.get_roster_overview();

CREATE FUNCTION public.get_roster_overview()
RETURNS TABLE (
    roster_id UUID,
    athlete_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    workouts_7d INT,
    active_days_7d INT,
    volume_7d_kg NUMERIC,
    streak INT,
    last_session_at TIMESTAMPTZ,
    last_actual_rpe NUMERIC,
    last_pain_flag BOOLEAN,
    days_trained_this_week SMALLINT[],
    tags TEXT[],
    private_notes TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT r.id, p.id, p.full_name, p.avatar_url,
           st.workouts, st.active_days, st.volume_kg, athlete_streak(p.id),
           ls.completed_at, ls.actual_rpe, ls.pain_flag,
           COALESCE(wk.days, ARRAY[]::SMALLINT[]),
           COALESCE(r.tags, ARRAY[]::TEXT[]),
           r.private_notes
    FROM trainer_rosters r
    JOIN profiles p ON p.id = r.athlete_id
    CROSS JOIN LATERAL athlete_window_stats(p.id, 7) st
    LEFT JOIN LATERAL (
        SELECT s.completed_at, s.actual_rpe, s.pain_flag
        FROM workout_sessions s
        WHERE s.user_id = p.id
        ORDER BY s.completed_at DESC
        LIMIT 1
    ) ls ON true
    LEFT JOIN LATERAL (
        SELECT array_agg(DISTINCT extract(isodow FROM s.completed_at)::smallint ORDER BY extract(isodow FROM s.completed_at)::smallint) AS days
        FROM workout_sessions s
        WHERE s.user_id = p.id AND s.completed_at >= date_trunc('week', now())
    ) wk ON true
    WHERE r.trainer_id = (SELECT auth.uid()) AND r.status = 'active'
    ORDER BY p.full_name;
$$;

REVOKE EXECUTE ON FUNCTION public.get_roster_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_roster_overview() TO authenticated;

COMMIT;
