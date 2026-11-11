-- AB Fitness — Publicação de Fotos, Conversas Diretas (DMs) e 14 Temas de Capa
-- Suporte completo para partilha de fotos no perfil/feed, DMs entre amigos e personalização expandida.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolbypassrls OR rolsuper)) THEN
        RAISE EXCEPTION 'O papel % não tem BYPASSRLS; corre esta migration como postgres.', current_user;
    END IF;
END $$;

-- ==============================================================================
-- 1. ATUALIZAR CONSTRAINT DE TEMAS DE CAPA (14 Estilos de Luxo & Atleta)
-- ==============================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cover_style_valid;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_cover_style_valid
  CHECK (cover_style IN (
    'midnight', 'carbon', 'abyss', 'gold', 'titanium', 'cyberpunk', 'aurora', 'crimson',
    'emerald', 'amethyst', 'sunset', 'electric_blue', 'magma', 'monochrome_luxury'
  ));

-- ==============================================================================
-- 2. TABELA DE PUBLICAÇÃO DE FOTOS (Perfil & Feed)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.athlete_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  respect_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS athlete_posts_user_id_idx ON public.athlete_posts (user_id);
CREATE INDEX IF NOT EXISTS athlete_posts_created_at_idx ON public.athlete_posts (created_at DESC);

ALTER TABLE public.athlete_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athlete_posts_select" ON public.athlete_posts;
CREATE POLICY "athlete_posts_select" ON public.athlete_posts FOR SELECT
  USING (
    auth.uid() = user_id 
    OR are_friends(auth.uid(), user_id)
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'ceo')
  );

DROP POLICY IF EXISTS "athlete_posts_insert" ON public.athlete_posts;
CREATE POLICY "athlete_posts_insert" ON public.athlete_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "athlete_posts_delete" ON public.athlete_posts;
CREATE POLICY "athlete_posts_delete" ON public.athlete_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Respects nas fotos
CREATE TABLE IF NOT EXISTS public.post_respects (
  post_id UUID NOT NULL REFERENCES public.athlete_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_respects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "post_respects_all" ON public.post_respects;
CREATE POLICY "post_respects_all" ON public.post_respects FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RPC para dar/remover respect numa publicação
CREATE OR REPLACE FUNCTION public.toggle_post_respect(target_post UUID)
RETURNS INT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.post_respects WHERE post_id = target_post AND user_id = auth.uid()) THEN
    DELETE FROM public.post_respects WHERE post_id = target_post AND user_id = auth.uid();
  ELSE
    INSERT INTO public.post_respects (post_id, user_id) VALUES (target_post, auth.uid());
  END IF;

  UPDATE public.athlete_posts
  SET respect_count = (SELECT COUNT(*)::int FROM public.post_respects WHERE post_id = target_post)
  WHERE id = target_post;

  RETURN (SELECT respect_count FROM public.athlete_posts WHERE id = target_post);
END;
$$;

-- ==============================================================================
-- 3. MENSAGENS DIRETAS (DMs / Conversas com Amigos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.friend_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS friend_messages_pair_idx ON public.friend_messages (sender_id, receiver_id, created_at);

ALTER TABLE public.friend_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friend_messages_select" ON public.friend_messages;
CREATE POLICY "friend_messages_select" ON public.friend_messages FOR SELECT
  USING (auth.uid() IN (sender_id, receiver_id));

DROP POLICY IF EXISTS "friend_messages_insert" ON public.friend_messages;
CREATE POLICY "friend_messages_insert" ON public.friend_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND are_friends(sender_id, receiver_id));

DROP POLICY IF EXISTS "friend_messages_update" ON public.friend_messages;
CREATE POLICY "friend_messages_update" ON public.friend_messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ==============================================================================
-- 4. STORAGE BUCKET PARA FOTOS DE POSTS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('posts', 'posts', true, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/webp', 'image/jpeg', 'image/png'];

DROP POLICY IF EXISTS "posts_public_read" ON storage.objects;
CREATE POLICY "posts_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "posts_insert_own" ON storage.objects;
CREATE POLICY "posts_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "posts_delete_own" ON storage.objects;
CREATE POLICY "posts_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts' AND (storage.foldername(name))[1] = auth.uid()::text);

COMMIT;

