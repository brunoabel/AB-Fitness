/**
 * Flag local de "ir com calma hoje": o utilizador aceita a sugestão do briefing diário e
 * o ActiveWorkout.jsx reduz 1 série dos exercícios que atacam esse músculo, só na primeira
 * vez que o treino de hoje é iniciado (nunca num rascunho já em curso).
 */
const KEY_PREFIX = 'ab_ease_mode_';

const todayKey = (today = new Date()) => `${KEY_PREFIX}${today.toISOString().slice(0, 10)}`;

/** `storage` é injetável (testes passam um mock); por omissão usa o localStorage do browser. */
function resolveStorage(storage) {
  if (storage) return storage;
  return typeof window !== 'undefined' ? window.localStorage : null;
}

export function setEaseModeToday(muscleId, { today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(todayKey(today), muscleId);
  } catch {}
}

export function getEaseModeToday({ today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    return store.getItem(todayKey(today));
  } catch {
    return null;
  }
}
