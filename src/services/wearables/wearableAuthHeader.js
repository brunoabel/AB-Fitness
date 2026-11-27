import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';

/**
 * Constrói os headers JSON + Authorization Bearer JWT do utilizador para chamar os endpoints /api/*-token.
 */
export async function buildWearableTokenHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (!isSupabaseConfigured() || !supabase) return headers;
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // Sem sessão ativa: o servidor responderá 401
  }
  return headers;
}
