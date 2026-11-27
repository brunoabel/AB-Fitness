/**
 * Sincroniza o mesociclo (src/utils/mesocycleState.js) com public.mesocycles quando há sessão.
 * O estado local é a fonte da verdade no aparelho; a tabela guarda o histórico e permite retomar noutro aparelho.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MESO_STATE_KEY } from '../utils/mesocycleState';

const GUEST_ID = 'guest-local-user';
const canSync = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== GUEST_ID);

const toRow = (userId, m, status) => ({
  user_id: userId,
  start_date: m.startDate,
  weeks: m.weeks,
  deload_week: m.deloadWeek ?? null,
  deload_reasons: m.deloadReasons || [],
  status,
  updated_at: new Date().toISOString()
});

/** Envia o mesociclo atual (ativo) e os anteriores (concluídos). Falhas ficam só no aviso da consola. */
export async function syncMesocycle(userId, state) {
  if (!canSync(userId) || !state?.startDate) return { synced: false };
  const rows = [
    toRow(userId, state, 'active'),
    ...(state.history || []).map((h) => toRow(userId, { ...h, deloadWeek: h.reactive ? h.weeks : null }, 'completed'))
  ];
  const { error } = await supabase.from('mesocycles').upsert(rows, { onConflict: 'user_id,start_date' });
  if (error) {
    console.warn('Mesociclo guardado só localmente (Supabase):', error.message);
    return { synced: false, error: error.message };
  }
  return { synced: true };
}

/** Num aparelho novo (sem estado local), retoma o mesociclo ativo da conta. */
export async function restoreMesocycle(userId, storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!canSync(userId)) return false;
  try {
    if (storage?.getItem(MESO_STATE_KEY)) return false;
  } catch {
    return false;
  }
  const { data, error } = await supabase
    .from('mesocycles')
    .select('start_date, weeks, deload_week, deload_reasons')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return false;
  try {
    storage?.setItem(MESO_STATE_KEY, JSON.stringify({
      startDate: data.start_date,
      weeks: data.weeks,
      deloadWeek: data.deload_week,
      deloadReasons: data.deload_reasons || [],
      history: [],
      dismissedUntil: null
    }));
  } catch {
    return false;
  }
  return true;
}
