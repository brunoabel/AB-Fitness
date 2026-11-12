/**
 * AB Fitness — Sistema de Avaliação e Desbloqueio de Conquistas (Badges Engine)
 */

import {
  getRunsHistory,
  getWorkoutHistory,
  getSavedWeights,
  getCompletedDays
} from './storage';
import { computeNewlyUnlockedBadges } from './badgeRules.js';

export { computeNewlyUnlockedBadges };

const STORAGE_BADGES_KEY = 'ab_fitness_unlocked_badges_v1';

/**
 * Retorna o mapa de badges desbloqueadas pelo atleta:
 * { [badgeId]: { unlockedAt: timestamp } }
 */
export const getUnlockedBadges = () => {
  try {
    const raw = localStorage.getItem(STORAGE_BADGES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveUnlockedBadges = (badgesMap) => {
  try {
    localStorage.setItem(STORAGE_BADGES_KEY, JSON.stringify(badgesMap));
  } catch {}
};

/**
 * Avalia o histórico e desbloqueia qualquer nova conquista merecida, restrita ao `scope` da
 * ação que acabou de ocorrer ('run' ao terminar uma corrida, 'workout' ao terminar um treino
 * de musculação; omitido para reavaliar tudo, ex. no arranque da app). Retorna array com as
 * novas medalhas desbloqueadas nesta verificação (para toast/celebração).
 */
export const evaluateAndUnlockBadges = (scope) => {
  const currentUnlocked = getUnlockedBadges();

  const newlyUnlocked = computeNewlyUnlockedBadges({
    runs: getRunsHistory() || [],
    workouts: getWorkoutHistory() || [],
    savedWeights: getSavedWeights() || {},
    completedDays: getCompletedDays() || []
  }, currentUnlocked, scope);

  if (newlyUnlocked.length > 0) {
    const now = Date.now();
    newlyUnlocked.forEach((badge) => {
      currentUnlocked[badge.id] = { unlockedAt: now };
    });
    saveUnlockedBadges(currentUnlocked);
  }

  return newlyUnlocked;
};
