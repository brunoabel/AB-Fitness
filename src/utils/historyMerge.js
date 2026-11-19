/**
 * historyMerge.js: funções puras para juntar o histórico da nuvem (get_my_workout_history)
 * ao histórico local, sem duplicar o mesmo treino.
 */
import { toLocalDateKey } from './dateKey.js';

export const HISTORY_CAP = 200;
// Treinos locais antigos não têm sessionId: mesmo treino se terminaram a menos de 15 min
const SAME_WORKOUT_WINDOW_MS = 15 * 60 * 1000;

/** Converte uma linha da RPC no formato de registo que o app grava em addWorkoutToHistory. */
export function mapCloudSession(row) {
  const completedAt = row.completed_at;
  const time = Date.parse(completedAt);
  const exercisesData = {};
  let totalSets = 0;
  let totalVolumeKg = 0;

  for (const log of Array.isArray(row.logs) ? row.logs : []) {
    const code = log.exercise_code;
    if (!code) continue;
    const type = log.set_type || 'N';
    const completed = Boolean(log.completed);
    const set = {
      weight: Number(log.weight_kg) || 0,
      reps: Number(log.reps_completed) || 0,
      type,
      rpe: log.rpe !== null && log.rpe !== undefined ? Number(log.rpe) : null,
      completed,
      done: completed
    };
    if (log.duration_seconds !== null && log.duration_seconds !== undefined) set.seconds = Number(log.duration_seconds);
    const index = Math.max(0, (Number(log.set_number) || 1) - 1);
    (exercisesData[code] ||= [])[index] = set;
    if (completed && type !== 'W') {
      totalSets += 1;
      totalVolumeKg += set.weight * set.reps;
    }
  }
  // set_number com buracos deixaria posições vazias no array
  for (const code of Object.keys(exercisesData)) exercisesData[code] = exercisesData[code].filter(Boolean);

  const title = row.workout_title || row.workout_day_name || 'Treino';
  const durationSeconds = Number(row.duration_seconds) || 0;
  return {
    id: `cloud_${row.id}`,
    sessionId: row.id,
    source: 'cloud',
    timestamp: Number.isNaN(time) ? Date.now() : time,
    completedAt,
    date: Number.isNaN(time) ? '' : new Date(time).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
    workoutDayId: null,
    dayName: row.workout_day_name || title,
    workoutName: row.workout_day_name || title,
    dayTitle: title,
    title,
    workoutTitle: title,
    durationSeconds,
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    totalSets,
    totalSetsCompleted: totalSets,
    exerciseCount: Object.keys(exercisesData).length,
    totalVolumeKg: Math.round(totalVolumeKg),
    exercisesData,
    notes: row.notes || '',
    assignedProgramId: row.assigned_program_id || null
  };
}

const timeOf = (r) => {
  const t = Date.parse(r?.completedAt || '');
  return Number.isNaN(t) ? Number(r?.timestamp) || 0 : t;
};

/**
 * Junta registos da nuvem ao histórico local. O registo local ganha sempre (tem workoutDayId e
 * detalhes que a nuvem não guarda). Devolve { merged, added }.
 */
export function mergeHistory(local = [], cloudRecords = [], cap = HISTORY_CAP) {
  const bySession = new Set(local.map((r) => r?.sessionId).filter(Boolean));
  const legacyTimes = local.filter((r) => !r?.sessionId).map(timeOf);
  const added = [];

  for (const record of cloudRecords) {
    if (!record?.sessionId || bySession.has(record.sessionId)) continue;
    const t = timeOf(record);
    if (legacyTimes.some((lt) => Math.abs(lt - t) < SAME_WORKOUT_WINDOW_MS)) continue;
    bySession.add(record.sessionId);
    added.push(record);
  }

  const merged = [...local, ...added].sort((a, b) => timeOf(b) - timeOf(a)).slice(0, cap);
  return { merged, added: added.length };
}

/** Dias (chave local) com treino na nuvem que ainda faltam em completedDays, para o streak. */
export function missingCompletedDays(completedDays = [], cloudRecords = []) {
  const known = new Set(completedDays.map((c) => c?.date).filter(Boolean));
  const out = [];
  for (const record of cloudRecords) {
    const date = toLocalDateKey(record?.completedAt);
    if (!date || known.has(date)) continue;
    known.add(date);
    out.push({ dayId: null, date, timestamp: timeOf(record), source: 'cloud' });
  }
  return out;
}
