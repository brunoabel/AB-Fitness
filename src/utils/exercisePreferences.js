/**
 * Preferências de exercícios do utilizador (favoritos e a evitar), usadas como pesos na escolha por slots
 * (src/engine/slots.js). Guardadas neste aparelho.
 */
export const EXERCISE_PREFS_KEY = 'ab_exercise_prefs_v1';
const MAX_PER_LIST = 60;

const defaultStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

/** @returns {{ favorite: string[], avoid: string[] }} */
export function getExercisePreferences(storage = defaultStorage()) {
  try {
    const raw = JSON.parse(storage?.getItem(EXERCISE_PREFS_KEY) || 'null');
    const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
    return { favorite: list(raw?.favorite), avoid: list(raw?.avoid) };
  } catch {
    return { favorite: [], avoid: [] };
  }
}

/** 'favorite' | 'avoid' | null para um exercício. */
export function exercisePreferenceOf(id, storage = defaultStorage()) {
  const prefs = getExercisePreferences(storage);
  if (prefs.favorite.includes(id)) return 'favorite';
  if (prefs.avoid.includes(id)) return 'avoid';
  return null;
}

/** Marca um exercício como favorito, a evitar ou neutro (null). As duas listas são exclusivas. */
export function setExercisePreference(id, value, storage = defaultStorage()) {
  if (!id) return getExercisePreferences(storage);
  const prefs = getExercisePreferences(storage);
  const next = {
    favorite: prefs.favorite.filter((x) => x !== id),
    avoid: prefs.avoid.filter((x) => x !== id)
  };
  if (value === 'favorite' || value === 'avoid') next[value] = [id, ...next[value]].slice(0, MAX_PER_LIST);
  try {
    storage?.setItem(EXERCISE_PREFS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
