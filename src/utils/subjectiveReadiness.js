/**
 * AB Fitness — Check-in Subjetivo Pré-Treino (Readiness Score sem depender de wearable)
 * 3 métricas rápidas (1..5): sono, energia e estado muscular/dor -> score 0..100.
 */

import { localDateKey } from './dateKey.js';

const KEY_PREFIX = 'ab_subjective_readiness_';

function resolveStorage(storage) {
  if (storage) return storage;
  return typeof window !== 'undefined' ? window.localStorage : null;
}

/**
 * Converte sono (1-5), energia (1-5) e corpo/dor (1-5, onde 5 = sem dor/fresco) em score 0..100.
 * Pesos: Sono 40%, Energia 35%, Corpo/Dor 25%.
 */
export function computeSubjectiveReadiness({ sleep, energy, soreness } = {}) {
  const clamp = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 3;
    return Math.min(5, Math.max(1, n));
  };
  const s = clamp(sleep);
  const e = clamp(energy);
  const m = clamp(soreness);
  // Mapeia 1..5 -> 20..100 (1 = 20%, 3 = 60%, 5 = 100%)
  const weighted = s * 0.4 + e * 0.35 + m * 0.25;
  const score = Math.round(weighted * 20);
  const status = score >= 75 ? 'peak' : score >= 55 ? 'moderate' : 'recovery';
  return { score, status, sleep: s, energy: e, soreness: m };
}

export function saveSubjectiveReadinessToday(entry, { today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return null;
  const computed = computeSubjectiveReadiness(entry);
  const payload = { ...computed, savedAt: new Date(today).toISOString() };
  try {
    store.setItem(`${KEY_PREFIX}${localDateKey(today)}`, JSON.stringify(payload));
  } catch {}
  return payload;
}

export function getSubjectiveReadinessToday({ today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const raw = store.getItem(`${KEY_PREFIX}${localDateKey(today)}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.score === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

/** Combina prontidão de wearable (quando fresca) e check-in subjetivo de hoje. */
export function combineReadinessScores(wearableScore, subjectiveScore) {
  const hasW = typeof wearableScore === 'number' && Number.isFinite(wearableScore);
  const hasS = typeof subjectiveScore === 'number' && Number.isFinite(subjectiveScore);
  if (hasW && hasS) return Math.round(wearableScore * 0.6 + subjectiveScore * 0.4);
  if (hasW) return Math.round(wearableScore);
  if (hasS) return Math.round(subjectiveScore);
  return null;
}
