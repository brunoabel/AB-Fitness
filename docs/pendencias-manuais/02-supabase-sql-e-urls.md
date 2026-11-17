# 02 — Supabase: SQL, URLs e Segurança de Autenticação

- **SQL Editor direto:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/sql/new
- **URL Configuration:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/url-configuration

---

## 1. Confirmar ou aplicar a Migration RLS da Waitlist

Ficheiro no repositório: `supabase/migrations/20261125_waitlist_rls_hardening.sql`

### Verificação rápida (corre primeiro se já a executaste antes):
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'waitlist';
```
Deve devolver apenas **`waitlist_insert_public`** (`INSERT`) e **`waitlist_select_admin`** (`SELECT`). Se ainda aparecer `waitlist_update_public` ou `waitlist_select_all`, corre o bloco completo abaixo:

```sql
-- AB Fitness — Endurecimento RLS da Lista VIP / Waitlist de Marketing (RGPD)
-- Corrige leitura e atualização públicas indevidas em public.waitlist e get_marketing_waitlist().
BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
    IF to_regclass('public.waitlist') IS NULL THEN
        RAISE EXCEPTION 'Falta tabela public.waitlist.';
    END IF;
END $$;

-- 1. Remover políticas abertas a anon / UPDATE público
DROP POLICY IF EXISTS "waitlist_update_public" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_all" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_admin" ON public.waitlist;

-- 2. Manter apenas INSERT público (waitlist_insert_public) e restringir SELECT a admin/ceo autenticados
CREATE POLICY "waitlist_select_admin" ON public.waitlist
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('admin', 'ceo')
        )
    );

-- 3. Recriar get_marketing_waitlist() com verificação explícita de papel admin/ceo
CREATE OR REPLACE FUNCTION public.get_marketing_waitlist()
RETURNS TABLE (
    id UUID,
    name TEXT,
    email TEXT,
    goal TEXT,
    phone TEXT,
    source TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role IN ('admin', 'ceo')
    ) THEN
        RAISE EXCEPTION 'Acesso restrito a administradores ou CEO.' USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    SELECT w.id, w.name, w.email, w.goal, w.phone, w.source, w.created_at
    FROM public.waitlist w
    ORDER BY w.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_marketing_waitlist() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_marketing_waitlist() TO authenticated;

COMMIT;
```

---

## 2. Limpeza das 7 tabelas órfãs (de `docs/CHECKLIST_LANCAMENTO.md`)

Primeiro verifica se ainda existem:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'wishlist_products', 'favorites', 'qc_photos',
    'haul_items', 'hauls', 'products', 'suppliers'
  );
```

Depois de confirmares que não contêm nada que precises:
```sql
DROP TABLE IF EXISTS public.wishlist_products CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.qc_photos CASCADE;
DROP TABLE IF EXISTS public.haul_items CASCADE;
DROP TABLE IF EXISTS public.hauls CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.suppliers CASCADE;
```

---

## 3. Conferir URL Configuration

Em **Authentication > URL Configuration**:
- **Site URL:** `https://www.abfitness.app`
- **Redirect URLs:** garantir que existem:
  - `https://www.abfitness.app/**`
  - `https://abfitness.app/**`
  - *(Opcional para testes locais)* `http://localhost:5173/**`

---

## 4. Segurança de Autenticação (Providers > Email / Security)

- [ ] **Confirm email:** ligado
- [ ] **Minimum password length:** `8`
- [ ] **Leaked Password Protection:** ativar (se disponível no teu plano)

> **ATENÇÃO — NÃO ligar o CAPTCHA (Cloudflare Turnstile) ainda!**  
> O código atual de login/registo em `src/context/AuthContext.jsx` (`signInWithEmail` e `signUpWithEmail`) ainda **não envia `captchaToken`**. Se ativares o Turnstile no Supabase antes de adicionarmos o widget no frontend, todos os logins e registos serão bloqueados pelo servidor.

---

## 5. Aplicar a Migration de Endurecimento RLS do Trainer Hub (`20261126_trainer_hub_rls_and_notes.sql`)

Ficheiro no repositório: `supabase/migrations/20261126_trainer_hub_rls_and_notes.sql`

Cola e executa no SQL Editor (`https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/sql/new`):

```sql
-- AB Fitness: Trainer Hub — Endurecimento de RLS, Privacidade de Notas e Ciclo de Vida do Vínculo
BEGIN;

REVOKE SELECT ON public.trainer_rosters FROM authenticated;
GRANT SELECT (id, trainer_id, athlete_id, status, created_at, updated_at) ON public.trainer_rosters TO authenticated;

DROP POLICY IF EXISTS trainer_rosters_update_party ON public.trainer_rosters;
CREATE POLICY trainer_rosters_update_party ON public.trainer_rosters FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) IN (trainer_id, athlete_id))
    WITH CHECK (
        (SELECT auth.uid()) IN (trainer_id, athlete_id)
        AND status = 'archived'
    );

CREATE OR REPLACE FUNCTION public.cascade_archive_assigned_programs()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION public.redeem_trainer_invite_code(p_code TEXT)
RETURNS TABLE (trainer_id UUID, trainer_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

CREATE OR REPLACE FUNCTION public.set_roster_note(p_athlete_id UUID, p_note TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
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
```

---

## 6. Aplicar a Migration Global de Segurança, RLS, Storage e Índices (`20261127_security_rls_and_indexes_hardening.sql`)

Ficheiro completo no repositório: `supabase/migrations/20261127_security_rls_and_indexes_hardening.sql`

Abre o ficheiro [20261127_security_rls_and_indexes_hardening.sql](../../supabase/migrations/20261127_security_rls_and_indexes_hardening.sql), copia o conteúdo integral e clica em **Run** no SQL Editor (`https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/sql/new`).

Esta migration aplica:
- Bloqueio de auto-promoção a `is_verified`, `is_pro` e `is_premium` no trigger `prevent_profile_role_change()`.
- Permissão `EXECUTE` segura em `public.are_friends(uuid, uuid)` para `authenticated` (desbloqueando as policies de `athlete_posts` e `friend_messages`).
- `FORCE ROW LEVEL SECURITY` e `REVOKE ALL FROM PUBLIC, anon` nas 6 tabelas pós-`20261112`.
- Restrição de `UPDATE` em `friend_messages` apenas à coluna `read_at` com `WITH CHECK` e limite de `2000` caracteres.
- Política `biometrics_delete_own` em `athlete_biometrics` e `WITH CHECK` explícito em `wearable_connections` / `athlete_biometrics`.
- Validação de amizade/sessão em `toggle_post_respect()`, filtro `s.is_shared = true` em `get_friend_feed()` e respeito por `show_history` em `get_public_athlete_pass()`.
- Restrição de listagem no bucket `'posts'` à pasta do próprio utilizador e criação dos 3 índices compostos (`friend_messages_receiver_sender_idx`, `exercise_logs_user_created_completed_idx`, `assigned_programs_athlete_idx`).
