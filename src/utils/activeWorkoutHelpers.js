import { getEaseModeToday } from './dailyBriefing';
import { getLocalBiometrics, getLocalConnections, computeReadinessIndex } from '../services/wearables/wearableManager';
import { getSavedWeights } from './storage';
import { applyMesoWeekToSets } from './mesocycleWeek.js';
import {
  e1RM,
  getBestHistorical1RM,
  getBestHistoricalDuration,
  getDefaultDurationSeconds,
  isTimedExercise
} from './strengthMetrics';

/** Devolve a prontidão wearable atual (0-100) ou null se não houver dispositivo ligado. */
export function getCurrentReadinessScore() {
  const conns = getLocalConnections();
  if (!conns || Object.keys(conns).length === 0) return null;
  const bios = getLocalBiometrics();
  const readiness = computeReadinessIndex({
    whoop: conns.whoop ? bios.whoop : null,
    fitbit: conns.fitbit ? bios.fitbit : null
  });
  return readiness ? readiness.score : null;
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
  const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const targetsEasedMuscle = (ex) => {
    if (!easeMuscleId) return false;
    return normalize(`${ex.target || ''} ${ex.secondary || ''}`).includes(normalize(easeMuscleId));
  };

  exercisesList.forEach((ex) => {
    const isTimed = isTimedExercise(ex, ex.id);
    const defaultDuration = isTimed ? getDefaultDurationSeconds(ex, ex.id) : 10;
    const prevSets = saved[ex.id];
    if (prevSets && prevSets.length > 0) {
      initial[ex.id] = prevSets.map((s) => ({
        weight: s.weight ?? (isTimed ? 0 : (ex.suggestedWeight ?? 10)),
        reps: s.reps ?? (isTimed ? defaultDuration : (ex.suggestedReps ?? 10)),
        seconds: s.seconds ?? (isTimed ? (Number(s.reps) || defaultDuration) : undefined),
        type: s.type || 'N',
        rpe: s.rpe || null,
        completed: false,
        done: false
      }));
    } else {
      const baseSetsCount = ex.defaultSets || 3;
      const setsCount = targetsEasedMuscle(ex) ? Math.max(2, baseSetsCount - 1) : baseSetsCount;
      initial[ex.id] = Array.from({ length: setsCount }, () => ({
        weight: isTimed ? 0 : (ex.suggestedWeight ?? 10),
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
