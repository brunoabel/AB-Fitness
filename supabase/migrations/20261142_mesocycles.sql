-- Motor de treino P1: mesociclos com data de início, avanço automático da semana e deload reativo.
-- Um mesociclo ativo por utilizador; os anteriores ficam com status 'completed'.

CREATE TABLE IF NOT EXISTS public.mesocycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    weeks SMALLINT NOT NULL CHECK (weeks BETWEEN 4 AND 6),
    deload_week SMALLINT CHECK (deload_week IS NULL OR deload_week BETWEEN 1 AND 6),
    deload_reasons TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, start_date)
);

CREATE INDEX IF NOT EXISTS mesocycles_user_status_idx ON public.mesocycles (user_id, status, start_date DESC);

ALTER TABLE public.mesocycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mesocycles_select_own" ON public.mesocycles;
CREATE POLICY "mesocycles_select_own" ON public.mesocycles
    FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "mesocycles_insert_own" ON public.mesocycles;
CREATE POLICY "mesocycles_insert_own" ON public.mesocycles
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "mesocycles_update_own" ON public.mesocycles;
CREATE POLICY "mesocycles_update_own" ON public.mesocycles
    FOR UPDATE USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "mesocycles_delete_own" ON public.mesocycles;
CREATE POLICY "mesocycles_delete_own" ON public.mesocycles
    FOR DELETE USING ((SELECT auth.uid()) = user_id);
