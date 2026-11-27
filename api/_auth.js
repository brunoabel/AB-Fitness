import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

/**
 * Valida o Bearer JWT emitido pelo Supabase Auth nas rotas serverless.
 */
export async function requireSupabaseUser(req) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { user: null, error: 'Autenticação necessária' };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null, error: 'Sessão inválida ou expirada' };
  }
  return { user: data.user, error: null };
}
