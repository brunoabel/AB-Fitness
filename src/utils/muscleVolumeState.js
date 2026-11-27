/**
 * Liga a progressão de volume por músculo e a calibração individual (src/engine/muscleVolume.js) ao estado do
 * mesociclo (src/utils/mesocycleState.js). Corre no painel uma vez por semana: no início de cada semana de
 * acumulação decide as séries extra; no fim de cada mesociclo regista o resultado e recalibra o orçamento.
 * Importado de forma dinâmica: o motor puxa o catálogo de exercícios.
 */
import { loadMesocycle, saveMesocycleState, parseKey, mondayOf } from './mesocycleState.js';
import { buildContext, planVolume } from '../engine/index.js';
import { planSignature } from './planInputs.js';
import { nextWeekOffsets, distributeOffsets, mesocycleRecord, calibrate } from '../engine/muscleVolume.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RECORDS = 4;

/** As séries extra recalculam-se quando o plano semanal muda a meio da semana. */
const scheduleSig = planSignature;

const contextFor = (profile, calibration) =>
  buildContext({
    experience: profile?.experienceLevel || 'beginner',
    sessionMinutes: Number(profile?.sessionMinutes) || 60,
    priorityMuscles: profile?.priorityMuscles || [],
    budgetAdjust: { calibration }
  });

/**
 * @param {{ history: Array, checkins: Array, schedule: Array, profile: object, now?: Date, storage?: Storage }} input
 * @returns {{ volume: object, calibration: object, added: string[], calibrationChanges: Array, changed: boolean }}
 */
export function updateMuscleVolume({ history = [], checkins = [], schedule = [], profile = null, now = new Date(), storage } = {}) {
  const resolved = loadMesocycle(now, storage);
  const state = resolved.state;
  const vol = state.volume || null;
  const sig = scheduleSig(schedule);
  const sameWeek = Boolean(vol && vol.mesoStart === state.startDate && vol.week === resolved.weekNumber && vol.isDeload === resolved.isDeload);
  if (sameWeek && vol.scheduleSig === sig) {
    return { volume: vol, calibration: state.calibration || {}, added: [], calibrationChanges: [], changed: false };
  }

  const baseWeekly = planVolume(schedule).weekly;
  let calibration = state.calibration || {};
  let records = state.volumeRecords || [];
  let offsets = vol?.offsets || {};
  let added = [];
  let calibrationChanges = [];

  // Na mesma semana só o plano mudou: redistribui as mesmas séries extra
  if (!sameWeek && vol && vol.mesoStart !== state.startDate) {
    // Mesociclo anterior terminou: regista o resultado, recalibra e recomeça sem séries extra
    const archived = (state.history || []).find((h) => h.startDate === vol.mesoStart);
    const startMs = parseKey(vol.mesoStart).getTime();
    const deloadStartMs = startMs + ((archived?.weeks || state.weeks) - 1) * 7 * DAY_MS;
    records = [mesocycleRecord({ history, checkins, startMs, deloadStartMs, baseWeekly, offsets }), ...records].slice(0, MAX_RECORDS);
    ({ calibration, changes: calibrationChanges } = calibrate(calibration, records, contextFor(profile, calibration).budget));
    offsets = {};
  } else if (!sameWeek && vol && !resolved.isDeload && resolved.weekNumber > (vol.week || 1)) {
    ({ offsets, added } = nextWeekOffsets({
      offsets,
      history,
      checkins,
      weekStart: mondayOf(now).getTime(),
      baseWeekly,
      budget: contextFor(profile, calibration).budget
    }));
  }

  // unmet: séries extra que não cabem (tempo da sessão, teto por sessão ou limite de séries)
  const { bonus, unmet } = resolved.isDeload ? { bonus: {}, unmet: {} } : distributeOffsets(schedule, offsets, contextFor(profile, calibration));
  const volume = { mesoStart: state.startDate, week: resolved.weekNumber, isDeload: resolved.isDeload, offsets, bonus, unmet, added: sameWeek ? vol.added || [] : added, scheduleSig: sig };
  saveMesocycleState({ ...state, volume, calibration, volumeRecords: records }, storage);
  return { volume, calibration, added, calibrationChanges, changed: true };
}
