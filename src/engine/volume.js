/**
 * Orçamento e contagem de volume semanal (séries fracionadas: alvo 1, sinergista 0.5),
 * teto por sessão e estimativa de duração. Ver docs/TRAINING_SCIENCE_AUDIT.md, secção 3.1.
 */
import { getExerciseMeta } from './exerciseMeta.js';
import { workSecondsPerSet, SET_LIMITS } from './prescription.js';

/** Músculos com mínimo semanal (VOL_LOW). Os outros só têm teto (VOL_HIGH). */
export const MAJOR_MUSCLES = ['chest', 'back', 'quads', 'hamstrings', 'glutes', 'side_delt', 'biceps', 'triceps'];
export const CAPPED_MUSCLES = ['front_delt', 'rear_delt', 'calves', 'abs', 'traps', 'forearms', 'adductors', 'lower_back'];

/** Séries semanais fracionadas: [início do mesociclo, teto]. Parâmetros de partida calibráveis. */
const BUDGET = {
  beginner: { start: 8, cap: 12, priority: 2 },
  intermediate: { start: 10, cap: 16, priority: 3 },
  advanced: { start: 12, cap: 20, priority: 4 }
};
/** Costas juntam dorsais e parte superior: um pouco mais de margem. */
const EXTRA = { back: 2 };

/** Músculos prioritários do onboarding para músculos do orçamento. */
export const PRIORITY_TO_MUSCLES = {
  upper_chest: ['chest'],
  back_vtaper: ['back'],
  glutes_hams: ['glutes', 'hamstrings'],
  arms: ['biceps', 'triceps'],
  shoulders: ['side_delt'],
  quads: ['quads']
};

/**
 * @param {{ scale?: Record<string, number>, calibration?: Record<string, { start?: number, cap?: number }> }} [adjust]
 *   scale: fator por músculo (treino concorrente, src/engine/concurrent.js);
 *   calibration: desvio individual em séries (src/engine/muscleVolume.js), aplicado antes do fator.
 * @returns {Record<string, { start: number, cap: number }>}
 */
export function weeklyBudget(experience = 'intermediate', priorityMuscles = [], { scale = {}, calibration = {} } = {}) {
  const b = BUDGET[experience] || BUDGET.intermediate;
  const prio = new Set(priorityMuscles.flatMap((p) => PRIORITY_TO_MUSCLES[p] || [p]));
  const out = {};
  for (const muscle of MAJOR_MUSCLES) {
    const bonus = (EXTRA[muscle] || 0) + (prio.has(muscle) ? b.priority : 0);
    out[muscle] = { start: b.start + bonus, cap: b.cap + bonus };
  }
  for (const muscle of CAPPED_MUSCLES) out[muscle] = { start: 0, cap: b.cap + 2 };
  for (const [muscle, c] of Object.entries(calibration || {})) {
    if (!out[muscle]) continue;
    const cap = out[muscle].cap + (Number(c?.cap) || 0);
    const start = Math.min(cap - 2, out[muscle].start + (Number(c?.start) || 0));
    out[muscle] = { start: Math.max(0, start), cap };
  }
  for (const [muscle, f] of Object.entries(scale || {})) {
    if (!out[muscle] || !(f > 0)) continue;
    out[muscle] = { start: Math.round(out[muscle].start * f), cap: Math.round(out[muscle].cap * f) };
  }
  return out;
}

/** Teto de séries diretas por músculo numa sessão. */
export function sessionCap(experience, isPriority) {
  return experience === 'advanced' && isPriority ? 10 : 8;
}

export const WARMUP_MIN = 5;
export const SETUP_MIN_PER_EXERCISE = 1;

const setsOf = (ex) => Number(ex.defaultSets) || 0;

/** Duração estimada de uma sessão, em minutos. */
export function sessionMinutes(exercises = []) {
  let sec = 0;
  for (const ex of exercises) {
    const meta = ex._meta || getExerciseMeta(ex);
    sec += setsOf(ex) * (workSecondsPerSet(ex, meta) + (Number(ex.restTime) || 60));
  }
  return exercises.length ? WARMUP_MIN + exercises.length * SETUP_MIN_PER_EXERCISE + sec / 60 : 0;
}

export function setCostMinutes(ex) {
  const meta = ex._meta || getExerciseMeta(ex);
  return (workSecondsPerSet(ex, meta) + (Number(ex.restTime) || 60)) / 60;
}

/**
 * Volume do plano.
 * @returns {{ weekly: Record<string, number>, direct: Array<Record<string, number>>, frequency: Record<string, number>, minutes: number[] }}
 */
export function planVolume(days = []) {
  const weekly = {};
  const frequency = {};
  const direct = [];
  const minutes = [];
  days.forEach((day) => {
    const d = {};
    for (const ex of day.exercises || []) {
      const meta = ex._meta || getExerciseMeta(ex);
      for (const [muscle, w] of Object.entries(meta?.muscles || {})) {
        weekly[muscle] = (weekly[muscle] || 0) + setsOf(ex) * w;
        if (w === 1) d[muscle] = (d[muscle] || 0) + setsOf(ex);
      }
    }
    Object.keys(d).forEach((muscle) => { frequency[muscle] = (frequency[muscle] || 0) + 1; });
    direct.push(d);
    minutes.push(sessionMinutes(day.exercises || []));
  });
  return { weekly, direct, frequency, minutes };
}

/**
 * Diz se é possível somar uma série ao exercício sem violar teto semanal, teto por sessão, duração ou limite de séries.
 * @returns {null | 'max_sets' | 'locked_day' | 'time' | 'session_cap' | 'weekly_cap'}
 */
export function addBlocker(days, dayIdx, exIdx, ctx, volume = planVolume(days)) {
  const ex = days[dayIdx].exercises[exIdx];
  const meta = ex._meta || getExerciseMeta(ex);
  // Músculo prioritário: até 6 séries no exercício que o treina diretamente
  const prioritized = Object.entries(meta?.muscles || {}).some(([muscle, w]) => w === 1 && ctx.priority?.has(muscle));
  if (setsOf(ex) >= SET_LIMITS.max + (prioritized ? 1 : 0)) return 'max_sets';
  if (ctx.noAddDays?.has(dayIdx)) return 'locked_day';
  if (volume.minutes[dayIdx] + setCostMinutes(ex) > ctx.sessionMinutes) return 'time';
  for (const [muscle, w] of Object.entries(meta?.muscles || {})) {
    if (w === 1 && (volume.direct[dayIdx][muscle] || 0) + 1 > sessionCap(ctx.experience, ctx.priority?.has(muscle))) return 'session_cap';
    if ((volume.weekly[muscle] || 0) + w > (ctx.budget[muscle]?.cap ?? Infinity)) return 'weekly_cap';
  }
  return null;
}
