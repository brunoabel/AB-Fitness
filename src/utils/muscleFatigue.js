/**
 * Motor de fadiga muscular (espelho exato de public.get_muscle_fatigue).
 *
 *   séries efetivas  S = Σ séries concluídas × peso (primário 1.0, secundário 0.5)
 *   fadiga inicial   F0 = 100 × (1 − e^(−S / K))           K = 6 → 6 séries ≈ 63%, 14 séries ≈ 90%
 *   decaimento       F(t) = F0 × 0.5^(t / h)                h = meia-vida da região (14 a 30 h)
 *   várias sessões   F = 100 × (1 − Π(1 − Fi / 100))         soma saturada, nunca passa de 100
 *   recuperado em    t* = h × log2(F / 35)                   horas até a fadiga descer do limiar
 *
 * Só entram sessões das últimas 72 h; depois disso a fadiga residual (<20%) já é "recuperado".
 */
import { MUSCLE_REGIONS, REGION_BY_ID, regionsForExercise } from '../data/muscleRegions';
import { getCatalogEntry } from '../data/exerciseMedia';

export const FATIGUE_K = 6;
export const WINDOW_H = 72;
export const FRESH_BELOW = 35;
export const FATIGUED_FROM = 70;

/**
 * @typedef {'fresh' | 'recovering' | 'fatigued'} FatigueStatus
 * @typedef {Object} MuscleFatigue
 * @property {string} id            região (ex.: 'peito')
 * @property {string} label
 * @property {'front'|'back'|'both'} view
 * @property {number} fatigue       0 a 100
 * @property {number} recovery      100 − fatigue
 * @property {FatigueStatus} status
 * @property {string|null} lastTrainedAt  ISO
 * @property {number} hoursToRecovered    0 quando já está fresco
 * @typedef {Object} MuscleFatigueState
 * @property {Record<string, MuscleFatigue>} muscles
 * @property {number} readiness     média de recuperação, 0 a 100
 * @property {'cloud'|'local'} source
 * @property {boolean} loading
 */

export const statusOf = (f) => (f >= FATIGUED_FROM ? 'fatigued' : f >= FRESH_BELOW ? 'recovering' : 'fresh');

const hoursToFresh = (f, h) => (f <= FRESH_BELOW ? 0 : Math.round(h * Math.log2(f / FRESH_BELOW)));

/** @returns {MuscleFatigueState} */
export function buildState(rows, source) {
  const muscles = {};
  let sum = 0;
  for (const r of MUSCLE_REGIONS) {
    const row = rows[r.id];
    const fatigue = Math.max(0, Math.min(100, Math.round(row?.fatigue || 0)));
    sum += 100 - fatigue;
    muscles[r.id] = {
      id: r.id,
      label: r.label,
      view: r.view,
      fatigue,
      recovery: 100 - fatigue,
      status: statusOf(fatigue),
      lastTrainedAt: row?.lastTrainedAt || null,
      hoursToRecovered: row?.hoursToRecovered ?? hoursToFresh(fatigue, r.halfLifeH)
    };
  }
  return { muscles, readiness: Math.round(sum / MUSCLE_REGIONS.length), source, loading: false };
}

const sessionTime = (s) => new Date(s.completedAt || s.timestamp || s.date || 0).getTime();
const isHardSet = (set) => (set?.completed || set?.done) && set.type !== 'W' && Number(set.reps) > 0;

/** Cálculo local a partir do histórico do aparelho (convidado, offline ou migration por aplicar). */
export function computeLocalFatigue(history = [], now = Date.now()) {
  const remaining = {}; // região → Π(1 − Fi/100)
  const last = {};
  for (const s of history) {
    const t = sessionTime(s);
    const ageH = (now - t) / 3600000;
    if (!t || ageH < 0 || ageH > WINDOW_H) continue;

    const stimulus = {};
    for (const [exId, sets] of Object.entries(s.exercisesData || {})) {
      const n = Array.isArray(sets) ? sets.filter(isHardSet).length : 0;
      if (!n) continue;
      for (const { region, weight } of regionsForExercise(getCatalogEntry(exId))) {
        stimulus[region] = (stimulus[region] || 0) + n * weight;
      }
    }
    for (const [region, S] of Object.entries(stimulus)) {
      const f = 100 * (1 - Math.exp(-S / FATIGUE_K)) * 0.5 ** (ageH / REGION_BY_ID[region].halfLifeH);
      remaining[region] = (remaining[region] ?? 1) * (1 - f / 100);
      if (!last[region] || t > last[region]) last[region] = t;
    }
  }
  const rows = {};
  for (const id of Object.keys(remaining)) {
    rows[id] = { fatigue: 100 * (1 - remaining[id]), lastTrainedAt: new Date(last[id]).toISOString() };
  }
  return buildState(rows, 'local');
}
