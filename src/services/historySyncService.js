import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapCloudSession, HISTORY_CAP } from '../utils/historyMerge.js';
import { mergeCloudWorkouts } from '../utils/storage';

/**
 * Hidrata o histórico local a partir de workout_sessions (RPC get_my_workout_history).
 * Primeira vez neste aparelho: vai buscar até HISTORY_CAP treinos. Depois: só a página mais recente.
 * Sem a migration 20261134 a RPC não existe e o app continua só com o histórico local.
 */
const HYDRATED_KEY = 'ab_fitness_history_hydrated_v1';
const PAGE_SIZE = 50;

const readHydrated = () => {
  try {
    return JSON.parse(localStorage.getItem(HYDRATED_KEY) || '{}');
  } catch {
    return {};
  }
};

let running = null;

export function hydrateWorkoutHistory(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || userId === 'guest-local-user') return Promise.resolve(0);
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(0);
  if (running) return running;

  running = (async () => {
    const fullSync = !readHydrated()[userId];
    const maxRows = fullSync ? HISTORY_CAP : PAGE_SIZE;
    const records = [];
    let before = null;
    let failed = false;

    while (records.length < maxRows) {
      const { data, error } = await supabase.rpc('get_my_workout_history', { p_before: before, p_limit: PAGE_SIZE });
      if (error || !Array.isArray(data)) {
        if (error) console.warn('Histórico da nuvem indisponível:', error.message);
        failed = true;
        break;
      }
      records.push(...data.map(mapCloudSession));
      if (data.length < PAGE_SIZE) break;
      before = data[data.length - 1].completed_at;
    }

    const added = records.length ? mergeCloudWorkouts(records) : 0;
    // Só marca como hidratado quando a leitura completou; RPC em falta tenta de novo no próximo arranque
    if (!failed) {
      try {
        localStorage.setItem(HYDRATED_KEY, JSON.stringify({ ...readHydrated(), [userId]: Date.now() }));
      } catch {}
    }
    if (added > 0 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ab:history-updated', { detail: { added } }));
    return added;
  })().finally(() => {
    running = null;
  });
  return running;
}
