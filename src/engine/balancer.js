/**
 * Ajusta as séries de um plano semanal para cumprir, por esta ordem: duração da sessão, teto de séries
 * diretas por músculo e sessão, teto semanal por músculo e, por fim, o mínimo semanal dos músculos grandes.
 * Só mexe em séries (entre SET_LIMITS.min e .max); a escolha e a ordem dos exercícios vêm do modelo.
 */
import { getExerciseMeta } from './exerciseMeta.js';
import { SET_LIMITS } from './prescription.js';
import { MAJOR_MUSCLES, PRIORITY_TO_MUSCLES, weeklyBudget, sessionCap, planVolume, addBlocker, setCostMinutes, SETUP_MIN_PER_EXERCISE } from './volume.js';

const ISO_FIRST = { isolation: 0, timed: 1, compound: 2, heavy: 3 };
const UPPER = new Set(['chest', 'back', 'front_delt', 'side_delt', 'rear_delt', 'biceps', 'triceps', 'traps', 'forearms']);
const LOWER = new Set(['quads', 'hamstrings', 'glutes', 'adductors', 'calves']);
const setsOf = (ex) => Number(ex.defaultSets) || 0;

/** Contexto comum ao balanceamento e ao validador. */
export function buildContext({ experience = 'intermediate', sessionMinutes = 60, priorityMuscles = [], noAddDays = new Set(), location = 'gym', injuries = [], inventory = null, suggest = null, budgetAdjust = {} } = {}) {
  return {
    experience,
    sessionMinutes,
    location,
    injuries,
    inventory,
    suggest,
    noAddDays,
    budget: weeklyBudget(experience, priorityMuscles, budgetAdjust),
    priority: new Set(priorityMuscles.flatMap((p) => PRIORITY_TO_MUSCLES[p] || [p]))
  };
}

/** Escolhe o exercício a reduzir: o que menos prejudica músculos grandes abaixo do mínimo, isoladores primeiro. */
function pickToReduce(candidates, volume, ctx) {
  const harm = ({ ex }) => {
    let h = 0;
    for (const [muscle, w] of Object.entries(ex._meta?.muscles || {})) {
      const b = ctx.budget[muscle];
      if (b && MAJOR_MUSCLES.includes(muscle) && (volume.weekly[muscle] || 0) - w < b.start) h += w;
    }
    return h;
  };
  return candidates.sort((a, b) => harm(a) - harm(b) || ISO_FIRST[a.ex._meta?.repClass] - ISO_FIRST[b.ex._meta?.repClass] || setsOf(b.ex) - setsOf(a.ex))[0] || null;
}

function reduceStep(days, ctx, volume) {
  // 1. Duração
  for (let d = 0; d < days.length; d += 1) {
    if (volume.minutes[d] <= ctx.sessionMinutes) continue;
    const list = days[d].exercises.map((ex, i) => ({ ex, d, i })).filter((c) => setsOf(c.ex) > SET_LIMITS.min);
    const pick = pickToReduce(list, volume, ctx);
    if (pick) {
      pick.ex.defaultSets = setsOf(pick.ex) - 1;
      return true;
    }
    if (days[d].exercises.length > 1) {
      // Sem séries para cortar: sai o último isolador (ou o último exercício)
      const exs = days[d].exercises;
      let idx = exs.map((ex) => ex._meta?.repClass).lastIndexOf('isolation');
      if (idx < 0) idx = exs.length - 1;
      ctx.removed.push(exs[idx].name);
      exs.splice(idx, 1);
      return true;
    }
  }
  // 2. Teto por sessão
  for (let d = 0; d < days.length; d += 1) {
    for (const [muscle, sets] of Object.entries(volume.direct[d])) {
      if (sets <= sessionCap(ctx.experience, ctx.priority.has(muscle))) continue;
      const list = days[d].exercises.map((ex, i) => ({ ex, d, i })).filter((c) => c.ex._meta?.muscles?.[muscle] === 1 && setsOf(c.ex) > SET_LIMITS.min);
      const pick = list.sort((a, b) => ISO_FIRST[a.ex._meta?.repClass] - ISO_FIRST[b.ex._meta?.repClass] || setsOf(b.ex) - setsOf(a.ex))[0];
      if (pick) {
        pick.ex.defaultSets = setsOf(pick.ex) - 1;
        return true;
      }
    }
  }
  // 3. Teto semanal
  for (const [muscle, b] of Object.entries(ctx.budget)) {
    if ((volume.weekly[muscle] || 0) <= b.cap) continue;
    const list = [];
    days.forEach((day, d) => day.exercises.forEach((ex, i) => {
      if ((ex._meta?.muscles?.[muscle] || 0) > 0 && setsOf(ex) > SET_LIMITS.min) list.push({ ex, d, i });
    }));
    const pick = pickToReduce(list, volume, ctx);
    if (pick) {
      pick.ex.defaultSets = setsOf(pick.ex) - 1;
      return true;
    }
    // Todos no mínimo de séries: sai um exercício desse músculo (isoladores primeiro), do dia com mais séries diretas dele
    const iso = [];
    days.forEach((day, d) => day.exercises.forEach((ex, i) => {
      if (ex._meta?.muscles?.[muscle] === 1) iso.push({ d, i, ex });
    }));
    iso.sort((a, b) => ISO_FIRST[a.ex._meta?.repClass] - ISO_FIRST[b.ex._meta?.repClass] || (volume.direct[b.d][muscle] || 0) - (volume.direct[a.d][muscle] || 0));
    if (iso[0] && days[iso[0].d].exercises.length > 1) {
      ctx.trimmed.push(iso[0].ex.name);
      days[iso[0].d].exercises.splice(iso[0].i, 1);
      return true;
    }
  }
  return false;
}

/**
 * Onde cabe um exercício novo (2 séries) para o músculo: dia com tempo livre e menos séries diretas dele,
 * sem passar o teto por sessão nem o teto semanal de nenhum músculo. Máximo de 2 acessórios novos por músculo.
 * @returns {{ d: number, ex: object, meta: object } | null}
 */
export function findInsertion(days, muscle, ctx, volume = planVolume(days)) {
  if (!ctx.suggest || ((ctx.insertions || {})[muscle] || 0) >= 2) return null;
  // Prefere um dia da mesma metade do corpo (um acessório de ombro vai para um dia de tronco, não de pernas)
  const half = UPPER.has(muscle) ? UPPER : LOWER.has(muscle) ? LOWER : null;
  const affinity = (d) => (half ? days[d].exercises.filter((ex) => half.has(Object.keys(getExerciseMeta(ex)?.muscles || {}).find((k) => getExerciseMeta(ex).muscles[k] === 1))).length : 0);
  const options = days
    .map((day, d) => ({ d, spare: ctx.sessionMinutes - volume.minutes[d], direct: volume.direct[d][muscle] || 0 }))
    .filter(({ d }) => (days[d].exercises || []).length > 0 && !ctx.noAddDays?.has(d))
    .map((o) => ({ ...o, affinity: affinity(o.d) }))
    .sort((a, b) => Math.sign(b.affinity) - Math.sign(a.affinity) || a.direct - b.direct || b.spare - a.spare);
  for (const { d, spare } of options) {
    const ex = ctx.suggest(muscle, new Set(days[d].exercises.map((e) => e.id)));
    if (!ex) return null;
    const meta = getExerciseMeta(ex);
    if (SETUP_MIN_PER_EXERCISE + 2 * setCostMinutes(ex) > spare) continue;
    if ((volume.direct[d][muscle] || 0) + 2 > sessionCap(ctx.experience, ctx.priority.has(muscle))) continue;
    if (Object.entries(meta?.muscles || {}).some(([k, w]) => (volume.weekly[k] || 0) + 2 * w > (ctx.budget[k]?.cap ?? Infinity))) continue;
    return { d, ex, meta };
  }
  return null;
}

function insertAccessory(days, muscle, ctx, volume) {
  const spot = findInsertion(days, muscle, ctx, volume);
  if (!spot) return false;
  days[spot.d].exercises.push({ ...spot.ex, defaultSets: 2, _meta: spot.meta });
  ctx.insertions[muscle] = (ctx.insertions[muscle] || 0) + 1;
  ctx.added.push(spot.ex.name);
  return true;
}

function addStep(days, ctx, volume) {
  const deficits = MAJOR_MUSCLES
    .map((muscle) => ({ muscle, gap: ctx.budget[muscle].start - (volume.weekly[muscle] || 0) }))
    .filter((x) => x.gap > 0)
    .sort((a, b) => b.gap - a.gap);
  for (const { muscle } of deficits) {
    const list = [];
    days.forEach((day, d) => day.exercises.forEach((ex, i) => {
      const w = ex._meta?.muscles?.[muscle] || 0;
      if (w >= 0.5 && !addBlocker(days, d, i, ctx, volume)) list.push({ ex, d, i, w });
    }));
    if (!list.length) {
      if (insertAccessory(days, muscle, ctx, volume)) return true;
      continue;
    }
    // Alvo direto primeiro; depois o dia com menos séries desse músculo (espalha a frequência) e o exercício com menos séries
    list.sort((a, b) => b.w - a.w || (volume.direct[a.d][muscle] || 0) - (volume.direct[b.d][muscle] || 0) || setsOf(a.ex) - setsOf(b.ex));
    list[0].ex.defaultSets = setsOf(list[0].ex) + 1;
    return true;
  }
  return false;
}

/**
 * @param {Array<{ exercises: Array<object> }>} days plano semanal (dias de descanso com exercises vazio)
 * @param {ReturnType<typeof buildContext>} ctx
 * @returns {{ days: Array<object>, removed: string[], trimmed: string[], added: string[] }} removed: saíram por tempo; trimmed: por excesso de volume; added: acessórios novos
 */
export function balancePlan(days, ctx) {
  const work = days.map((day) => ({
    ...day,
    exercises: (day.exercises || []).map((ex) => ({ ...ex, _meta: getExerciseMeta(ex) }))
  }));
  const state = { ...ctx, removed: [], trimmed: [], added: [], insertions: {} };
  for (let guard = 0; guard < 2000; guard += 1) {
    const volume = planVolume(work);
    if (reduceStep(work, state, volume)) continue;
    if (addStep(work, state, volume)) continue;
    break;
  }
  return {
    days: work.map((day) => ({ ...day, exercises: day.exercises.map(({ _meta, ...ex }) => ex) })),
    removed: state.removed,
    trimmed: state.trimmed,
    added: state.added,
    insertions: state.insertions
  };
}
