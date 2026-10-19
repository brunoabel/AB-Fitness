/**
 * AB Fitness — Sistema de Avaliação e Desbloqueio de Conquistas (Badges Engine)
 */

import { BADGES_CATALOG } from '../data/badges';
import { 
  getRunsHistory, 
  getWorkoutHistory, 
  getSavedWeights, 
  getCompletedDays 
} from './storage';

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
 * Avalia o histórico completo e desbloqueia qualquer nova conquista merecida.
 * Retorna array com as novas medalhas desbloqueadas nesta verificação (para toast/celebração).
 */
export const evaluateAndUnlockBadges = () => {
  const currentUnlocked = getUnlockedBadges();
  const newlyUnlocked = [];

  const runs = getRunsHistory() || [];
  const workouts = getWorkoutHistory() || [];
  const savedWeights = getSavedWeights() || {};
  const completedDays = getCompletedDays() || [];

  const totalRunKm = runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
  const now = Date.now();

  BADGES_CATALOG.forEach((badge) => {
    // Se já foi desbloqueada antes, pula
    if (currentUnlocked[badge.id]) return;

    let unlocked = false;

    switch (badge.id) {
      // 1. CORRIDAS
      case 'first_run':
        unlocked = runs.length >= 1;
        break;

      case 'club_5k':
        unlocked = runs.some((r) => Number(r.distanceKm) >= 5);
        break;

      case 'club_10k':
        unlocked = runs.some((r) => Number(r.distanceKm) >= 10);
        break;

      case 'pace_sub5':
        unlocked = runs.some((r) => {
          const dist = Number(r.distanceKm) || 0;
          const paceSec = Number(r.avgPaceSeconds) || 0;
          return dist >= 1 && paceSec > 0 && paceSec < 300; // < 5'00" /km
        });
        break;

      case 'speed_demon':
        unlocked = runs.some((r) => (Number(r.avgSpeedKmh) || 0) >= 14);
        break;

      case 'elevation_master':
        unlocked = runs.some((r) => (Number(r.elevationGainM) || 0) >= 30);
        break;

      case 'total_50k':
        unlocked = totalRunKm >= 50;
        break;

      // 2. MUSCULAÇÃO & FORÇA
      case 'first_workout':
        unlocked = workouts.length >= 1 || completedDays.length >= 1;
        break;

      case 'club_100kg_bench': {
        // Verifica exercícios de supino
        const isBench100 = Object.entries(savedWeights).some(([code, sets]) => {
          const isBench = code.toLowerCase().includes('supino') || code.toLowerCase().includes('bench');
          return isBench && sets.some((s) => Number(s.weight) >= 100);
        });
        unlocked = isBench100;
        break;
      }

      case 'club_100kg_squat': {
        const isSquat100 = Object.entries(savedWeights).some(([code, sets]) => {
          const isSquat = code.toLowerCase().includes('agachamento') || code.toLowerCase().includes('squat');
          return isSquat && sets.some((s) => Number(s.weight) >= 100);
        });
        unlocked = isSquat100;
        break;
      }

      case 'club_100kg_deadlift': {
        const isDeadlift100 = Object.entries(savedWeights).some(([code, sets]) => {
          const isDeadlift = code.toLowerCase().includes('terra') || code.toLowerCase().includes('deadlift');
          return isDeadlift && sets.some((s) => Number(s.weight) >= 100);
        });
        unlocked = isDeadlift100;
        break;
      }

      case 'tonnage_titan':
        unlocked = workouts.some((w) => (Number(w.totalVolumeKg) || 0) >= 5000);
        break;

      // 3. CONSTÂNCIA
      case 'streak_iron_week':
        unlocked = completedDays.length >= 7 || workouts.length >= 7;
        break;

      case 'streak_3_days':
        unlocked = completedDays.length >= 3 || workouts.length >= 3;
        break;

      case 'early_bird': {
        const checkTimestamps = [
          ...runs.map((r) => r.timestamp || (r.date ? new Date(r.date).getTime() : 0)),
          ...workouts.map((w) => w.completedAt ? new Date(w.completedAt).getTime() : 0)
        ].filter((t) => t > 0);

        unlocked = checkTimestamps.some((t) => {
          const hour = new Date(t).getHours();
          return hour >= 4 && hour < 9; // Entre 04:00 e 08:59
        });
        break;
      }

      case 'night_owl': {
        const checkTimestamps = [
          ...runs.map((r) => r.timestamp || (r.date ? new Date(r.date).getTime() : 0)),
          ...workouts.map((w) => w.completedAt ? new Date(w.completedAt).getTime() : 0)
        ].filter((t) => t > 0);

        unlocked = checkTimestamps.some((t) => {
          const hour = new Date(t).getHours();
          return hour >= 21 || hour < 4; // Após 21:00 ou de madrugada
        });
        break;
      }

      default:
        break;
    }

    if (unlocked) {
      currentUnlocked[badge.id] = {
        unlockedAt: now
      };
      newlyUnlocked.push(badge);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUnlockedBadges(currentUnlocked);
  }

  return newlyUnlocked;
};
