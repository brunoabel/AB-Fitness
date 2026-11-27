/**
 * Deload reativo: sinais de fadiga acumulada nos últimos 7 dias (docs/TRAINING_SCIENCE_AUDIT.md, secção 4.3).
 * Recomenda antecipar o deload quando há 2 ou mais sinais. Os limiares são heurísticas iniciais, a afinar com dados reais.
 */
import { e1RM } from '../utils/strengthMetrics.js';
import { getExerciseMeta } from './exerciseMeta.js';
import { progressionConfigFor } from './progressionConfig.js';

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const SIGNAL_LABEL = {
  E1RM_DROP: 'a força estimada caiu em vários exercícios principais',
  FAIL_BELOW_RANGE: 'falhaste abaixo da faixa de repetições em vários exercícios',
  LOW_READINESS: 'a prontidão dos wearables esteve baixa vários dias',
  HIGH_EFFORT: 'marcaste treinos como "Demais" mais de uma vez',
  PAIN: 'registaste dor na mesma zona mais de uma vez'
};

const workingSets = (sets) => (Array.isArray(sets) ? sets.filter((s) => (s.done || s.completed) && s.type !== 'W' && Number(s.weight) > 0 && Number(s.reps) > 0) : []);
export const rirOf = (s) => (s.rpe !== null && s.rpe !== undefined && s.rpe !== '' ? Math.max(0, 10 - Number(s.rpe)) : s.type === 'F' ? 0 : null);
export const bestE1RM = (sets) => Math.max(0, ...workingSets(sets).map((s) => e1RM(Number(s.weight), Number(s.reps), rirOf(s) || 0) || 0));
export const timeOf = (session) => Number(session?.timestamp) || Date.parse(session?.completedAt || '') || 0;

/**
 * @param {{ history?: Array<object>, checkins?: Array<object>, readiness?: Array<{ date: string, score: number }>, profile?: object, now?: number }} input
 *   history: sessões { timestamp, exercisesData: { [id]: sets } }; checkins: { createdAt, effort (1-5), pain: string[] }
 * @returns {{ recommend: boolean, signals: Array<{ code: string, label: string, count: number }> }}
 */
export function evaluateDeloadSignals({ history = [], checkins = [], readiness = [], profile = null, now = Date.now() } = {}) {
  const since = now - WINDOW_MS;
  const sessions = history.filter((s) => s?.exercisesData).sort((a, b) => timeOf(b) - timeOf(a));
  const signals = [];

  // 1. Força estimada a cair ≥5% em ≥2 exercícios principais (sessão recente vs. a anterior do mesmo exercício)
  const byExercise = new Map();
  for (const session of sessions) {
    for (const [id, sets] of Object.entries(session.exercisesData)) {
      const best = bestE1RM(sets);
      if (!best) continue;
      if (!byExercise.has(id)) byExercise.set(id, []);
      byExercise.get(id).push({ t: timeOf(session), best });
    }
  }
  let drops = 0;
  for (const [id, list] of byExercise) {
    const meta = getExerciseMeta(id);
    if (!meta || (meta.repClass !== 'heavy' && meta.repClass !== 'compound') || list.length < 2) continue;
    if (list[0].t >= since && list[0].best < list[1].best * 0.95) drops += 1;
  }
  if (drops >= 2) signals.push({ code: 'E1RM_DROP', count: drops });

  // 2. Séries abaixo da faixa sem reserva em ≥3 exercícios
  const failed = new Set();
  for (const session of sessions.filter((s) => timeOf(s) >= since)) {
    for (const [id, sets] of Object.entries(session.exercisesData)) {
      const range = progressionConfigFor({ id }, profile).repRange;
      if (range && workingSets(sets).some((s) => rirOf(s) === 0 && Number(s.reps) < range[0])) failed.add(id);
    }
  }
  if (failed.size >= 3) signals.push({ code: 'FAIL_BELOW_RANGE', count: failed.size });

  // 3. Prontidão < 55 em ≥3 dias
  const lowDays = readiness.filter((r) => Date.parse(r.date) >= since - 24 * 60 * 60 * 1000 && Number(r.score) < 55).length;
  if (lowDays >= 3) signals.push({ code: 'LOW_READINESS', count: lowDays });

  // 4. Check-ins "Demais" (esforço 5) ≥2 vezes
  const recent = checkins.filter((c) => Date.parse(c.createdAt || '') >= since);
  const tooHard = recent.filter((c) => Number(c.effort) >= 5).length;
  if (tooHard >= 2) signals.push({ code: 'HIGH_EFFORT', count: tooHard });

  // 5. Dor na mesma zona ≥2 vezes
  const pain = new Map();
  recent.forEach((c) => (c.pain || []).forEach((zone) => pain.set(zone, (pain.get(zone) || 0) + 1)));
  const repeated = [...pain.values()].filter((n) => n >= 2).length;
  if (repeated) signals.push({ code: 'PAIN', count: repeated });

  return { recommend: signals.length >= 2, signals: signals.map((s) => ({ ...s, label: SIGNAL_LABEL[s.code] })) };
}
