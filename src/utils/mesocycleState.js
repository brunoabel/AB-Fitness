/**
 * Estado do mesociclo com data de início: a semana avança pelo calendário (segunda a domingo), o deload planeado
 * é a última semana e um deload reativo pode antecipá-lo. No fim do deload começa um novo mesociclo.
 * Guardado localmente; sincronizado com public.mesocycles por src/services/mesocycleService.js.
 * Ver docs/TRAINING_SCIENCE_AUDIT.md, secções 4.2 e 4.3.
 */
import { MESO_WEEK_KEY, MESO_TOTAL_WEEKS, mesoWeekParams } from './mesocycleWeek.js';
import { localDateKey } from './dateKey.js';

export const MESO_STATE_KEY = 'ab_fitness_mesocycle_v2';
const DAY_MS = 24 * 60 * 60 * 1000;

const defaultStorage = () => (typeof window !== 'undefined' ? window.localStorage : null);

/** Segunda-feira (00:00 local) da semana de `date`. */
export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dow);
  return d;
}

export const parseKey = (key) => {
  const [y, m, d] = String(key).split('-').map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

function read(storage) {
  try {
    const raw = storage?.getItem(MESO_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(state, storage) {
  try {
    storage?.setItem(MESO_STATE_KEY, JSON.stringify(state));
  } catch {}
}

/** Estado novo, a começar na segunda-feira desta semana. Migra a semana que antes era escolhida à mão. */
function createState(now, storage) {
  let manualWeek = 1;
  try {
    manualWeek = Number(storage?.getItem(MESO_WEEK_KEY)) || 1;
  } catch {}
  const start = addDays(mondayOf(now), -7 * (Math.min(Math.max(manualWeek, 1), MESO_TOTAL_WEEKS) - 1));
  return { startDate: localDateKey(start), weeks: MESO_TOTAL_WEEKS, deloadWeek: null, deloadReasons: [], history: [], dismissedUntil: null };
}

/**
 * Semana atual do mesociclo. Avança o estado quando o mesociclo (ou o deload reativo) já terminou.
 * @returns {{ state: object, weekNumber: number, totalWeeks: number, isDeload: boolean, reactive: boolean, changed: boolean }}
 */
export function resolveMesocycle(state, now = new Date()) {
  let s = { ...state, history: [...(state.history || [])] };
  let changed = false;
  for (let guard = 0; guard < 60; guard += 1) {
    const start = parseKey(s.startDate);
    const week = Math.floor((mondayOf(now) - mondayOf(start)) / (7 * DAY_MS)) + 1;
    const lastWeek = s.deloadWeek || s.weeks;
    if (week <= lastWeek) {
      return { state: s, weekNumber: Math.max(1, week), totalWeeks: s.weeks, isDeload: week === lastWeek, reactive: Boolean(s.deloadWeek), changed };
    }
    // Mesociclo terminado: arquiva e começa o seguinte na segunda-feira a seguir ao deload
    s.history = [{ startDate: s.startDate, weeks: lastWeek, deloadReasons: s.deloadReasons || [], reactive: Boolean(s.deloadWeek) }, ...s.history].slice(0, 12);
    s = { ...s, startDate: localDateKey(addDays(start, lastWeek * 7)), deloadWeek: null, deloadReasons: [] };
    changed = true;
  }
  return { state: s, weekNumber: 1, totalWeeks: s.weeks, isDeload: false, reactive: false, changed };
}

/** Lê (ou cria) o estado e devolve a semana atual, guardando o avanço quando houver. */
export function loadMesocycle(now = new Date(), storage = defaultStorage()) {
  const stored = read(storage);
  const base = stored || createState(now, storage);
  const resolved = resolveMesocycle(base, now);
  if (!stored || resolved.changed) write(resolved.state, storage);
  return resolved;
}

/** Guarda o estado completo (usado por src/utils/muscleVolumeState.js). */
export const saveMesocycleState = (state, storage = defaultStorage()) => write(state, storage);

/**
 * Parâmetros da semana (séries, RIR, carga) a partir do estado: o deload reativo usa os parâmetros do deload.
 * `setBonus[dayId][exerciseId]`: séries extra da progressão de volume por músculo, só se calculadas para esta semana.
 */
export function mesoParamsFor(resolved) {
  if (!resolved) return null;
  if (resolved.isDeload) return { ...mesoWeekParams(resolved.totalWeeks, resolved.totalWeeks), weekNumber: resolved.weekNumber, isDeload: true };
  const vol = resolved.state?.volume;
  const current = vol && vol.mesoStart === resolved.state.startDate && vol.week === resolved.weekNumber;
  return { ...mesoWeekParams(resolved.weekNumber, resolved.totalWeeks), setBonus: current ? vol.bonus || {} : {} };
}

/** Parâmetros da semana de hoje (para o treino ativo). */
export const currentMesoParams = (now = new Date(), storage = defaultStorage()) => mesoParamsFor(loadMesocycle(now, storage));

/** Antecipa o deload para a semana atual. */
export function startReactiveDeload(reasons = [], now = new Date(), storage = defaultStorage()) {
  const { state, weekNumber } = loadMesocycle(now, storage);
  const next = { ...state, deloadWeek: weekNumber, deloadReasons: reasons };
  write(next, storage);
  return resolveMesocycle(next, now);
}

/** Esconde a recomendação de deload durante 7 dias. */
export function dismissDeloadRecommendation(now = new Date(), storage = defaultStorage()) {
  const { state } = loadMesocycle(now, storage);
  write({ ...state, dismissedUntil: localDateKey(addDays(now, 7)) }, storage);
}

export function isDeloadRecommendationDismissed(now = new Date(), storage = defaultStorage()) {
  const state = read(storage);
  return Boolean(state?.dismissedUntil && localDateKey(now) < state.dismissedUntil);
}

/** Datas de início e fim (domingo) da semana atual do mesociclo, para o texto do painel. */
export function weekRange(resolved) {
  const start = addDays(parseKey(resolved.state.startDate), (resolved.weekNumber - 1) * 7);
  return { start, end: addDays(start, 6) };
}
