-- AB Fitness: mensagens diretas em tempo real.
-- DirectMessageSheet.jsx subscreve postgres_changes (INSERT) em public.friend_messages; sem a tabela na
-- publicação supabase_realtime o evento nunca chega e o chat fica no polling de 30 s.
-- O Realtime aplica a RLS de SELECT (friend_messages_select): cada utilizador só recebe as suas mensagens.
-- Idempotente: não falha se a tabela já tiver sido adicionada à mão no painel.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables
           WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'friend_messages'
       )
    THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_messages;
    END IF;
END $$;
