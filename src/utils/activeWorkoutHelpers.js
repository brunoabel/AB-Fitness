import { getEaseModeToday } from './dailyBriefing.js';
import { getLocalBiometrics, getLocalConnections, computeReadinessIndex } from '../services/wearables/wearableManager.js';
import { getSavedWeights, getWorkoutHistory, getRunsHistory } from './storage.js';
import { applyMesoWeekToSets, addBonusSets } from './mesocycleWeek.js';
import { exerciseTargetsRegion } from '../data/muscleRegions.js';
import { getSubjectiveReadinessToday, combineReadinessScores } from './subjectiveReadiness.js';
import { computeWorkloadACWR } from './workloadAcwr.js';
import {
  e1RM,
  getBestHistorical1RM,
  getBestHistoricalDuration,
  getDefaultDurationSeconds,
  isTimedExercise
} from './strengthMetrics.js';
import { getExerciseMeta } from '../engine/exerciseMeta.js';

/** Carga da 1.ª sessão sem histórico: 0 em peso corporal/elástico; vazio nos outros, para o utilizador pôr a carga real. */
function firstSessionWeight(ex) {
  const loadType = getExerciseMeta(ex)?.loadType;
  return loadType === 'bodyweight' || loadType === 'bands' ? 0 : '';
}

/**
 * Devolve a prontidão atual (0-100) combinando wearable + check-in subjetivo de hoje,
 * e aplica trava de segurança se o ACWR indicar risco elevado de sobrecarga (> 1.5).
 * `applyLoadLock: false` devolve só a prontidão medida (wearable + check-in), sem a trava do ACWR:
 * é o valor que o deload reativo regista, para a carga não contar duas vezes como "prontidão baixa".
 */
export function getCurrentReadinessScore({ applyLoadLock = true } = {}) {
  let wearableScore = null;
  const conns = getLocalConnections();
  if (conns && Object.keys(conns).length > 0) {
    const bios = getLocalBiometrics();
    const readiness = computeReadinessIndex({
      whoop: conns.whoop ? bios.whoop : null,
      fitbit: conns.fitbit ? bios.fitbit : null,
      strava: conns.strava ? bios.strava : null,
      garmin: conns.garmin ? bios.garmin : null
    });
    if (readiness && !readiness.isStale) wearableScore = readiness.score;
  }

  const subjectiveScore = getSubjectiveReadinessToday()?.score ?? null;
  let combined = combineReadinessScores(wearableScore, subjectiveScore);
  if (!applyLoadLock) return combined;

  const acwr = computeWorkloadACWR({
    workouts: getWorkoutHistory(),
    runs: getRunsHistory()
  });
  if (acwr.lockOverload) {
    combined = combined !== null ? Math.min(combined, 50) : 50;
  }

  return combined;
}

/**
 * Constrói o estado inicial das séries a partir de um rascunho ativo, cargas prévias e briefing diário.
 * `mesoParams` (mesocycleWeek.mesoWeekParams): semana do mesociclo a aplicar; null quando não se aplica.
 */
export function buildInitialExercisesData(workout, activeDraft, mesoParams = null) {
  if (activeDraft && activeDraft.exercisesData) {
    return activeDraft.exercisesData;
  }

  const saved = getSavedWeights();
  const initial = {};
  const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const easeMuscleId = getEaseModeToday();
  const targetsEasedMuscle = (ex) =>
    Boolean(easeMuscleId) && (easeMuscleId === 'all' || exerciseTargetsRegion(ex, easeMuscleId));

  exercisesList.forEach((ex) => {
    const isTimed = isTimedExercise(ex, ex.id);
    const defaultDuration = isTimed ? getDefaultDurationSeconds(ex, ex.id) : 10;
    const prevSets = saved[ex.id];
    if (prevSets && prevSets.length > 0) {
      let mappedSets = prevSets.map((s) => ({
        weight: s.weight ?? (isTimed ? 0 : (ex.suggestedWeight ?? firstSessionWeight(ex))),
        reps: s.reps ?? (isTimed ? defaultDuration : (ex.suggestedReps ?? 10)),
        seconds: s.seconds ?? (isTimed ? (Number(s.reps) || defaultDuration) : undefined),
        type: s.type || 'N',
        rpe: s.rpe || null,
        completed: false,
        done: false
      }));
      if (targetsEasedMuscle(ex)) {
        const workingCount = mappedSets.filter((s) => s.type !== 'W').length;
        if (workingCount > 2) {
          let lastWorkingIdx = -1;
          for (let i = mappedSets.length - 1; i >= 0; i--) {
            if (mappedSets[i].type !== 'W') {
              lastWorkingIdx = i;
              break;
            }
          }
          if (lastWorkingIdx >= 0) {
            mappedSets = mappedSets.filter((_, idx) => idx !== lastWorkingIdx);
          }
        }
      }
      initial[ex.id] = mappedSets;
    } else {
      const baseSetsCount = ex.defaultSets || 3;
      const setsCount = targetsEasedMuscle(ex) ? Math.max(2, baseSetsCount - 1) : baseSetsCount;
      initial[ex.id] = Array.from({ length: setsCount }, () => ({
        weight: isTimed ? 0 : (ex.suggestedWeight ?? firstSessionWeight(ex)),
        reps: isTimed ? defaultDuration : (ex.suggestedReps ?? 10),
        seconds: isTimed ? defaultDuration : undefined,
        type: 'N',
        rpe: null,
        completed: false,
        done: false
      }));
    }
  });

  if (mesoParams) {
    exercisesList.forEach((ex, idx) => {
      initial[ex.id] = applyMesoWeekToSets(initial[ex.id], idx, mesoParams, { isTimed: isTimedExercise(ex, ex.id) });
      // Progressão de volume por músculo (src/engine/muscleVolume.js): séries extra desta semana
      const bonus = mesoParams.isDeload ? 0 : Number(mesoParams.setBonus?.[workout?.dayId]?.[ex.id]) || 0;
      if (bonus) initial[ex.id] = addBonusSets(initial[ex.id], bonus);
    });
  }

  return initial;
}

/** Calcula séries de trabalho totais/concluídas, volume efetivo (kg) e percentagem de conclusão. */
export function computeWorkoutProgress(exercisesList, exercisesData) {
  let totalWorkingSetsCount = 0;
  let completedWorkingSetsCount = 0;
  let totalVolumeKg = 0;

  exercisesList.forEach((ex) => {
    const sets = exercisesData[ex.id] || [];
    const isTimed = isTimedExercise(ex, ex.id);
    sets.forEach((s) => {
      const isDone = Boolean(s.completed || s.done);
      if (s.type !== 'W') {
        totalWorkingSetsCount++;
        if (isDone) {
          completedWorkingSetsCount++;
          if (!isTimed) {
            totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        }
      }
    });
  });

  const completionPercentage = totalWorkingSetsCount > 0
    ? Math.round((completedWorkingSetsCount / totalWorkingSetsCount) * 100)
    : 0;

  return {
    totalWorkingSetsCount,
    completedWorkingSetsCount,
    totalVolumeKg,
    completionPercentage
  };
}

/** Deteta recordes pessoais (e1RM ou duração em isometria) face ao histórico anterior. */
export function detectSessionPRs(exercisesList, exercisesData, pastHistory) {
  const detectedPRs = [];

  exercisesList.forEach((ex) => {
    const sets = exercisesData[ex.id] || [];
    const isTimed = isTimedExercise(ex, ex.id);

    if (isTimed) {
      const bestHistoricalDur = getBestHistoricalDuration(ex.id, pastHistory);
      let sessionBestDur = 0;
      let sessionBestSet = null;

      sets.forEach((s) => {
        if ((s.completed || s.done) && s.type !== 'W') {
          const dur = Number(s.seconds !== undefined ? s.seconds : s.reps) || 0;
          if (dur > sessionBestDur) {
            sessionBestDur = dur;
            sessionBestSet = s;
          }
        }
      });

      if (sessionBestDur > 0 && bestHistoricalDur && sessionBestDur > bestHistoricalDur) {
        detectedPRs.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          isTimed: true,
          duration: sessionBestDur,
          previousDuration: bestHistoricalDur,
          weight: sessionBestSet?.weight,
          reps: sessionBestDur
        });
      }
      return;
    }

    const bestHistorical = getBestHistorical1RM(ex.id, pastHistory);
    let sessionBestE1RM = 0;
    let sessionBestSet = null;

    sets.forEach((s) => {
      if ((s.completed || s.done) && s.type !== 'W') {
        const calc1RM = e1RM(s.weight, s.reps, s.rpe ? 10 - s.rpe : 0);
        if (calc1RM && calc1RM > sessionBestE1RM) {
          sessionBestE1RM = calc1RM;
          sessionBestSet = s;
        }
      }
    });

    if (sessionBestE1RM > 0 && bestHistorical && sessionBestE1RM > bestHistorical) {
      detectedPRs.push({
        exerciseId: ex.id,
        exerciseName: ex.name,
        e1RM: sessionBestE1RM,
        previous1RM: bestHistorical,
        weight: sessionBestSet?.weight,
        reps: sessionBestSet?.reps
      });
    }
  });

  return detectedPRs;
}
