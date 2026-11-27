/**
 * Volume por músculo guiado pela performance (docs/TRAINING_SCIENCE_AUDIT.md, secções 4.2 e 6/P2).
 * - Semana a semana: +1 série semanal por músculo só se a performance desse músculo se manteve ou subiu e não houve
 *   sinais de fadiga (check-in "Demais" ou dor numa articulação ligada ao músculo); nunca acima do teto.
 * - Entre mesociclos: calibração individual do mínimo (MEV) e do teto (MRV) a partir do que cada músculo respondeu.
 * Regras e limiares são heurísticas iniciais, a afinar com dados reais.
 */
import { getExerciseMeta } from './exerciseMeta.js';
import { MAJOR_MUSCLES, planVolume, addBlocker } from './volume.js';
import { bestE1RM, timeOf } from './deload.js';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Queda de performance que conta como descida (2,5%). [parâmetro] */
const DROP = 0.975;
/** Subida que conta como progresso (1%). [parâmetro] */
const RISE = 1.01;
/** Desvio máximo da calibração individual, em séries semanais. [parâmetro] */
const CALIBRATION_LIMIT = 4;

/** Zonas de dor do check-in pós-treino (SessionCheckin.jsx) para os músculos que as carregam. */
const PAIN_MUSCLES = {
  Ombro: ['chest', 'side_delt', 'front_delt', 'rear_delt', 'triceps'],
  Lombar: ['back', 'hamstrings', 'glutes', 'lower_back'],
  Joelho: ['quads', 'glutes'],
  'Punho / cotovelo': ['biceps', 'triceps', 'forearms'],
  Quadril: ['glutes', 'hamstrings', 'adductors', 'quads']
};

/** Performance de um exercício numa sessão: e1RM com carga; sem carga, as melhores reps. */
function performanceOf(sets) {
  const e = bestE1RM(sets);
  if (e > 0) return e;
  const reps = (Array.isArray(sets) ? sets : []).filter((s) => (s.done || s.completed) && s.type !== 'W').map((s) => Number(s.reps) || 0);
  return reps.length ? Math.max(...reps) : 0;
}

/**
 * Tendência de um músculo: para cada exercício que o treina diretamente, compara a última sessão da janela
 * anterior com a melhor da janela recente. Sem sessão anterior (início do primeiro mesociclo), compara a primeira
 * sessão da janela recente com as seguintes.
 * @returns {'up'|'flat'|'down'|null} null quando não há exercícios com as duas medidas
 */
export function muscleTrend(history, muscle, { earlyFrom, earlyTo, lateFrom, lateTo }) {
  const early = new Map();
  const late = new Map();
  const sessions = (history || []).filter((s) => s?.exercisesData).sort((a, b) => timeOf(a) - timeOf(b));
  for (const session of sessions) {
    const t = timeOf(session);
    for (const [id, sets] of Object.entries(session.exercisesData)) {
      if (getExerciseMeta(id)?.muscles?.[muscle] !== 1) continue;
      const p = performanceOf(sets);
      if (!p) continue;
      if (t >= earlyFrom && t < earlyTo) early.set(id, p);
      else if (t >= lateFrom && t < lateTo) late.set(id, [...(late.get(id) || []), p]);
    }
  }
  let up = 0;
  let down = 0;
  let compared = 0;
  for (const [id, list] of late) {
    const before = early.get(id) ?? (list.length >= 2 ? list[0] : null);
    if (!before) continue;
    const after = Math.max(...(early.has(id) ? list : list.slice(1)));
    compared += 1;
    if (after < before * DROP) down += 1;
    else if (after >= before * RISE) up += 1;
  }
  if (!compared) return null;
  if (down > up) return 'down';
  return up > 0 ? 'up' : 'flat';
}

/** Músculos com sinais de fadiga na janela: check-in "Demais" (todos) ou dor numa zona ligada ao músculo. */
export function fatiguedMuscles(checkins, from, to) {
  const out = new Set();
  for (const c of checkins || []) {
    const t = Date.parse(c?.createdAt || '');
    if (!(t >= from && t < to)) continue;
    if (Number(c.effort) >= 5) MAJOR_MUSCLES.forEach((m) => out.add(m));
    (c.pain || []).forEach((zone) => (PAIN_MUSCLES[zone] || []).forEach((m) => out.add(m)));
  }
  return out;
}

/**
 * Séries semanais extra por músculo para a semana que começa em `weekStart` (ms), a partir da semana anterior.
 * @param {{ offsets?: Record<string, number>, history: Array, checkins: Array, weekStart: number,
 *   baseWeekly: Record<string, number>, budget: Record<string, { start: number, cap: number }> }} input
 * @returns {{ offsets: Record<string, number>, added: string[] }}
 */
export function nextWeekOffsets({ offsets = {}, history, checkins, weekStart, baseWeekly, budget }) {
  const lateFrom = weekStart - 7 * DAY_MS;
  const window = { earlyFrom: weekStart - 35 * DAY_MS, earlyTo: lateFrom, lateFrom, lateTo: weekStart };
  const fatigued = fatiguedMuscles(checkins, lateFrom, weekStart);
  const next = { ...offsets };
  const added = [];
  for (const muscle of MAJOR_MUSCLES) {
    const base = baseWeekly[muscle] || 0;
    if (base <= 0 || fatigued.has(muscle)) continue;
    const trend = muscleTrend(history, muscle, window);
    if (trend !== 'up' && trend !== 'flat') continue;
    const current = next[muscle] || 0;
    if (base + current + 1 > (budget[muscle]?.cap ?? Infinity)) continue;
    next[muscle] = current + 1;
    added.push(muscle);
  }
  return { offsets: next, added };
}

/**
 * Distribui as séries extra pelos exercícios do plano sem violar teto por sessão, teto semanal, duração
 * ou limite de séries por exercício (mesmas regras do balanceamento).
 * @returns {{ bonus: Record<string, Record<string, number>>, unmet: Record<string, number> }} bonus[dayId][exerciseId]
 */
export function distributeOffsets(schedule, offsets, ctx) {
  const days = (schedule || []).map((d) => ({ ...d, exercises: (d.exercises || []).map((ex) => ({ ...ex, defaultSets: Number(ex.defaultSets) || 3 })) }));
  const bonus = {};
  const unmet = {};
  for (const [muscle, n] of Object.entries(offsets || {})) {
    for (let k = 0; k < n; k += 1) {
      const volume = planVolume(days);
      let pick = null;
      days.forEach((day, d) => {
        if (day.isRestDay) return;
        day.exercises.forEach((ex, i) => {
          if (getExerciseMeta(ex)?.muscles?.[muscle] !== 1 || addBlocker(days, d, i, ctx, volume)) return;
          const load = (volume.direct[d][muscle] || 0) * 10 + ex.defaultSets;
          if (!pick || load < pick.load) pick = { d, i, load };
        });
      });
      if (!pick) {
        unmet[muscle] = n - k;
        break;
      }
      const day = days[pick.d];
      const ex = day.exercises[pick.i];
      ex.defaultSets += 1;
      bonus[day.dayId] = bonus[day.dayId] || {};
      bonus[day.dayId][ex.id] = (bonus[day.dayId][ex.id] || 0) + 1;
    }
  }
  return { bonus, unmet };
}

/**
 * Registo de um mesociclo terminado, por músculo: séries semanais finais e tendência da performance
 * (primeiras 2 semanas contra as 2 últimas de acumulação).
 */
export function mesocycleRecord({ history, checkins, startMs, deloadStartMs, baseWeekly, offsets }) {
  const window = { earlyFrom: startMs, earlyTo: startMs + 14 * DAY_MS, lateFrom: Math.max(startMs + 14 * DAY_MS, deloadStartMs - 14 * DAY_MS), lateTo: deloadStartMs };
  const fatigued = fatiguedMuscles(checkins, startMs, deloadStartMs);
  const muscles = {};
  for (const muscle of MAJOR_MUSCLES) {
    const sets = (baseWeekly[muscle] || 0) + (offsets?.[muscle] || 0);
    if (sets <= 0) continue;
    muscles[muscle] = { sets: Math.round(sets * 2) / 2, trend: muscleTrend(history, muscle, window), fatigue: fatigued.has(muscle) };
  }
  return { startMs, muscles };
}

const clampAdj = (v) => Math.max(-CALIBRATION_LIMIT, Math.min(CALIBRATION_LIMIT, v));

/**
 * Calibração individual a partir dos 2 últimos mesociclos (records[0] = o mais recente):
 * - estagnou ou desceu perto do teto nos 2 → teto -2 (o volume recuperável é menor);
 * - estagnou com pouco volume e sem fadiga nos 2 → mínimo +2 (precisa de mais volume para progredir);
 * - progrediu no teto sem fadiga no último → teto +2.
 * @returns {{ calibration: Record<string, { start: number, cap: number }>, changes: Array<{ muscle: string, field: 'start'|'cap', delta: number }> }}
 */
export function calibrate(calibration = {}, records = [], budget = {}) {
  const next = JSON.parse(JSON.stringify(calibration || {}));
  const changes = [];
  const [last, prev] = records;
  if (!last) return { calibration: next, changes };
  for (const [muscle, r] of Object.entries(last.muscles || {})) {
    const b = budget[muscle];
    if (!b) continue;
    const c = next[muscle] || { start: 0, cap: 0 };
    const p = prev?.muscles?.[muscle];
    const stalled = (x) => x && (x.trend === 'flat' || x.trend === 'down');
    let field = null;
    let delta = 0;
    if (stalled(r) && stalled(p) && r.sets >= b.cap - 2 && p.sets >= b.cap - 2) [field, delta] = ['cap', -2];
    else if (stalled(r) && stalled(p) && !r.fatigue && !p.fatigue && r.sets <= b.start + 1 && p.sets <= b.start + 1) [field, delta] = ['start', 2];
    else if (r.trend === 'up' && !r.fatigue && r.sets >= b.cap - 1) [field, delta] = ['cap', 2];
    if (!field) continue;
    const value = clampAdj(c[field] + delta);
    if (value === c[field]) continue;
    next[muscle] = { ...c, [field]: value };
    changes.push({ muscle, field, delta: value - c[field] });
  }
  return { calibration: next, changes };
}
