/**
 * Escolha de exercícios por slots. Um slot é um padrão de movimento para um músculo, com um exercício-semente
 * (o do modelo de plano). Se a semente não serve ao utilizador (equipamento, lesão, nível), escolhe-se o melhor
 * equivalente do catálogo no mesmo slot. Substitui o bloqueio por palavras-chave no nome.
 */
import { EXERCISE_CATALOG } from '../data/exerciseMedia.js';
import { EXERCISES_100, findExerciseIn100 } from '../data/exercises100.js';
import { getExerciseMeta } from './exerciseMeta.js';

/** Inventário por omissão para "Casa com equipamento" quando o utilizador não indicou o seu (igual ao onboarding). */
export const DEFAULT_HOME_EQUIPMENT = ['dumbbell', 'bench', 'pull_up_bar', 'bands'];

const SKILL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };
const ORDER = new Map(EXERCISES_100.map((e, i) => [e.slug, i]));
const ALL_IDS = Object.keys(EXERCISE_CATALOG).sort((a, b) => (ORDER.get(a) ?? 9999) - (ORDER.get(b) ?? 9999));

/** Inventário efetivo: null = ginásio (tudo disponível). */
export function inventoryFor(location, equipment) {
  if (location === 'gym' || !location) return null;
  if (Array.isArray(equipment) && equipment.length) return new Set(equipment);
  return new Set(location === 'home_gym' ? DEFAULT_HOME_EQUIPMENT : []);
}

/** O utilizador pode fazer este exercício? (equipamento, lesões, nível) */
export function isAllowed(meta, ctx) {
  if (!meta) return false;
  if (ctx.inventory && meta.equipment.some((item) => !ctx.inventory.has(item))) return false;
  if ((ctx.injuries || []).some((joint) => meta.contra?.[joint] === 'avoid')) return false;
  return (SKILL_RANK[meta.skill] ?? 0) <= (SKILL_RANK[ctx.experience] ?? 1);
}

const primaryMuscle = (meta) => Object.keys(meta?.muscles || {}).find((k) => meta.muscles[k] === 1) || null;

/**
 * Pontuação de um candidato para um slot: sem cautela para a lesão > semente > mesma classe > ênfase em alongamento
 * > carga externa (progride melhor que peso corporal e elástico) > nível técnico igual ao do utilizador.
 * Desempate estável pela ordem da biblioteca.
 */
function score(id, meta, slot, ctx) {
  let s = 0;
  if (id === slot.seed) s += 100;
  if (meta.repClass === slot.repClass) s += 10;
  else if ((meta.repClass === 'heavy' && slot.repClass === 'compound') || (meta.repClass === 'compound' && slot.repClass === 'heavy')) s += 6;
  s += meta.lengthened * 2;
  // Cautela para a lesão do utilizador pesa mais que a semente: se houver equivalente sem cautela, ganha ele
  if ((ctx.injuries || []).some((joint) => meta.contra?.[joint] === 'caution')) s -= 150;
  if (meta.loadType !== 'bodyweight' && meta.loadType !== 'bands') s += 2;
  if (meta.loadType === 'bands') s -= 3;
  if ((SKILL_RANK[meta.skill] ?? 0) === (SKILL_RANK[ctx.experience] ?? 1)) s += 2;
  if (slot.axialBudget !== undefined && meta.axial > slot.axialBudget) s -= 50;
  return s;
}

/** Slot a partir de um exercício do modelo. */
export function slotFromExercise(exercise) {
  const meta = getExerciseMeta(exercise);
  return { seed: meta ? findExerciseIn100(exercise.id)?.slug || exercise.id : exercise.id, pattern: meta?.pattern, muscle: primaryMuscle(meta), repClass: meta?.repClass || 'compound' };
}

/**
 * Candidatos de um slot, do melhor para o pior. Relaxa por etapas: padrão + músculo, depois só o padrão.
 * @param {{ pattern: string, muscle: string|null, repClass: string, seed?: string, axialBudget?: number }} slot
 * @param {{ inventory: Set<string>|null, injuries: string[], experience: string }} ctx
 * @param {Set<string>} exclude ids já usados na sessão
 */
export function candidatesFor(slot, ctx, exclude = new Set()) {
  const pool = [];
  for (const id of ALL_IDS) {
    if (exclude.has(id)) continue;
    const meta = getExerciseMeta(id);
    if (!meta || meta.pattern !== slot.pattern || meta.repClass === 'timed' && slot.repClass !== 'timed') continue;
    if (!isAllowed(meta, ctx)) continue;
    pool.push({ id, meta, sameMuscle: primaryMuscle(meta) === slot.muscle });
  }
  const strict = pool.filter((c) => c.sameMuscle);
  const list = strict.length ? strict : pool;
  return list
    .map((c) => ({ ...c, score: score(c.id, c.meta, slot, ctx) }))
    .sort((a, b) => b.score - a.score || (ORDER.get(a.id) ?? 9999) - (ORDER.get(b.id) ?? 9999));
}

/**
 * Melhor exercício para dar volume direto a um músculo (usado quando falta volume e não há onde somar séries).
 * Prefere isoladores com ênfase em alongamento; evita repetir exercícios da sessão.
 */
export function suggestForMuscle(muscle, ctx, exclude = new Set()) {
  let best = null;
  for (const id of ALL_IDS) {
    if (exclude.has(id)) continue;
    const meta = getExerciseMeta(id);
    if (!meta || meta.muscles?.[muscle] !== 1 || meta.repClass === 'timed' || !isAllowed(meta, ctx)) continue;
    const s = (meta.repClass === 'isolation' ? 10 : 0) + meta.lengthened * 2 + (meta.axial <= 2 ? 3 : 0) + (meta.loadType !== 'bodyweight' ? 1 : 0);
    if (!best || s > best.s) best = { id, s };
  }
  return best?.id || null;
}

/** Algum exercício permitido cobre este padrão? (para distinguir falha do modelo de limite real do utilizador) */
export function patternAvailable(pattern, ctx) {
  return ALL_IDS.some((id) => {
    const meta = getExerciseMeta(id);
    return meta?.pattern === pattern && isAllowed(meta, ctx);
  });
}
