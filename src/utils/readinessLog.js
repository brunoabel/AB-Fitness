/**
 * Registo diário do Índice de Prontidão dos wearables (um valor por dia, últimos 14 dias),
 * usado pelo deload reativo (src/engine/deload.js) para detetar vários dias seguidos de prontidão baixa.
 */
import { localDateKey } from './dateKey.js';

const KEY = 'ab_fitness_readiness_log_v1';
const MAX_DAYS = 14;

export function getReadinessLog(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    const raw = storage?.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Guarda a prontidão de hoje (substitui o valor do mesmo dia). */
export function recordReadiness(score, now = new Date(), storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (typeof score !== 'number' || !Number.isFinite(score)) return getReadinessLog(storage);
  const date = localDateKey(now);
  const next = [{ date, score: Math.round(score) }, ...getReadinessLog(storage).filter((r) => r.date !== date)].slice(0, MAX_DAYS);
  try {
    storage?.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
