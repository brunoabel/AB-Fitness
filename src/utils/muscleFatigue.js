/**
 * Motor de fadiga muscular (espelho exato de public.compute_muscle_fatigue, migration 20261137).
 *
 *   séries efetivas  S = Σ séries de trabalho × fator da série × peso (primário 1.0, secundário 0.5)
 *   fator da série   esforço × intensidade (ver setStimulusFactor)
 *   fadiga inicial   F0 = 100 × (1 − e^(−S / K))           K = 6 → 6 séries ≈ 63%, 14 séries ≈ 90%
 *   decaimento       F(t) = F0 × 0.5^(t / (h × m))          h = meia-vida da região (14 a 30 h)
 *                                                          m = ajuste pela prontidão do wearable
 *   várias sessões   F = 100 × (1 − Π(1 − Fi / 100))         soma saturada, nunca passa de 100
 *   recuperado em    t* = h × m × log2(F / 35)               horas até a fadiga descer do limiar
 *
 * Só entram sessões das últimas 72 h; depois disso a fadiga residual (<20%) já é "recuperado".
 */
import { MUSCLE_REGIONS, REGION_BY_ID, regionsForExercise } from '../data/muscleRegions.js';
import { getCatalogEntry } from '../data/exerciseMedia.js';
import { getRunsHistory } from './storage.js';

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

export function parseSessionTime(s) {
  if (!s) return 0;
  if (typeof s.timestamp === 'number' && Number.isFinite(s.timestamp)) return s.timestamp;
  const iso = s.completedAt || s.created_at;
  if (iso) {
    const t = new Date(iso).getTime();
    if (Number.isFinite(t)) return t;
  }
  if (s.date) {
    const t = new Date(s.date).getTime();
    if (Number.isFinite(t)) return t;
  }
  return 0;
}

const isHardSet = (set) => (set?.completed || set?.done) && set.type !== 'W' && Number(set.reps) > 0;

/**
 * Peso de uma série no estímulo.
 * Esforço: RPE registado → RIR = 10 − RPE; RIR 2 vale 1.0, cada rep a menos de reserva +7.5%,
 * cada rep a mais −7.5% (limites 0.7 a 1.15). Sem RPE conta 1.0.
 * Intensidade pelas reps: ≤5 reps 1.1 (carga alta), 6 a 15 1.0, 16 a 25 0.9, mais de 25 0.8.
 * Séries de tempo (pranchas, isometrias) não levam ajuste de intensidade.
 */
export function setStimulusFactor(set) {
  const rpe = set?.rpe === null || set?.rpe === undefined || set?.rpe === '' ? NaN : Number(set.rpe);
  const effort = rpe >= 1 && rpe <= 10 ? Math.min(1.15, Math.max(0.7, 1 + 0.075 * (2 - (10 - rpe)))) : 1;
  const isTimed = set?.seconds !== undefined && set?.seconds !== null;
  const reps = Number(set?.reps) || 0;
  const intensity = isTimed ? 1 : reps <= 5 ? 1.1 : reps <= 15 ? 1 : reps <= 25 ? 0.9 : 0.8;
  return effort * intensity;
}

/**
 * Multiplicador da meia-vida pela prontidão do wearable (0 a 100): abaixo de 55 (mesmo limiar de
 * "Fadiga Elevada") recupera 25% mais devagar, abaixo de 70 10%, a partir de 85 10% mais depressa.
 */
export function readinessHalfLifeMultiplier(readinessScore) {
  if (typeof readinessScore !== 'number' || !Number.isFinite(readinessScore)) return 1;
  if (readinessScore < 55) return 1.25;
  if (readinessScore < 70) return 1.1;
  if (readinessScore >= 85) return 0.9;
  return 1;
}

/** Cálculo local a partir do histórico do aparelho (convidado, offline ou migration por aplicar). */
export function computeLocalFatigue(history = [], now = Date.now(), runs = null, readinessScore = null) {
  const m = readinessHalfLifeMultiplier(readinessScore);
  const remaining = {}; // região → Π(1 − Fi/100)
  const last = {};
  for (const s of history) {
    const t = parseSessionTime(s);
    const ageH = (now - t) / 3600000;
    if (!t || ageH < 0 || ageH > WINDOW_H) continue;

    const stimulus = {};
    for (const [exId, sets] of Object.entries(s.exercisesData || {})) {
      const n = Array.isArray(sets) ? sets.filter(isHardSet).reduce((sum, set) => sum + setStimulusFactor(set), 0) : 0;
      if (!n) continue;
      for (const { region, weight } of regionsForExercise(getCatalogEntry(exId))) {
        stimulus[region] = (stimulus[region] || 0) + n * weight;
      }
    }
    for (const [region, S] of Object.entries(stimulus)) {
      const f = 100 * (1 - Math.exp(-S / FATIGUE_K)) * 0.5 ** (ageH / (REGION_BY_ID[region].halfLifeH * m));
      remaining[region] = (remaining[region] ?? 1) * (1 - f / 100);
      if (!last[region] || t > last[region]) last[region] = t;
    }
  }

  // Fusão com corridas GPS das últimas 72h (estímulo em membros inferiores)
  const runList = Array.isArray(runs) ? runs : (typeof window !== 'undefined' ? (getRunsHistory() || []) : []);
  const RUN_TARGETS = [
    { region: 'quadriceps', weight: 0.7 },
    { region: 'posteriores', weight: 0.6 },
    { region: 'gemeos', weight: 0.9 }
  ];

  for (const r of runList) {
    const t = parseSessionTime(r);
    const ageH = (now - t) / 3600000;
    if (!t || ageH < 0 || ageH > WINDOW_H) continue;

    const distKm = Number(r.distanceKm ?? r.distance_km ?? 0);
    if (distKm <= 0) continue;
    const elevM = Number(r.elevationGainM ?? r.elevation_gain_m ?? 0);
    const sRun = (distKm / 2.5) * (1 + (elevM > 0 ? elevM / 300.0 : 0));

    for (const { region, weight } of RUN_TARGETS) {
      const S = sRun * weight;
      const halfLife = REGION_BY_ID[region]?.halfLifeH || 24;
      const f = 100 * (1 - Math.exp(-S / FATIGUE_K)) * (0.5 ** (ageH / (halfLife * m)));
      remaining[region] = (remaining[region] ?? 1) * (1 - f / 100);
      if (!last[region] || t > last[region]) last[region] = t;
    }
  }

  const rows = {};
  for (const id of Object.keys(remaining)) {
    const fatigue = 100 * (1 - remaining[id]);
    rows[id] = {
      fatigue,
      lastTrainedAt: new Date(last[id]).toISOString(),
      hoursToRecovered: hoursToFresh(fatigue, (REGION_BY_ID[id]?.halfLifeH || 24) * m)
    };
  }
  return buildState(rows, 'local');
}
