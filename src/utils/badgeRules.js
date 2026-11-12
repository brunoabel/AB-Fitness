/**
 * AB Fitness — Regras puras de desbloqueio de conquistas (sem I/O, testável isoladamente).
 * Extraído de badgeService.js para não arrastar a cadeia de imports de storage.js (localStorage)
 * para quem só quer avaliar as regras com dados já em memória.
 */

import { BADGES_CATALOG } from '../data/badges.js';

// Categorias de badge que cada ação pode legitimamente desbloquear. Corrigido para que
// concluir um treino de musculação nunca dispare uma medalha de "running" (ex. "Primeira
// Corrida") só porque existe uma corrida antiga no histórico ainda não marcada — e vice-versa.
const SCOPE_CATEGORIES = {
  run: ['running', 'consistency'],
  workout: ['gym', 'consistency']
};

/**
 * Lógica pura de avaliação: dado o estado (histórico + badges já desbloqueadas) e o escopo
 * da ação que acabou de ocorrer ('run' | 'workout' | undefined para avaliar tudo, ex. no
 * arranque da app), devolve a lista de badges do catálogo recém-merecidas.
 */
export function computeNewlyUnlockedBadges({ runs = [], workouts = [], savedWeights = {}, completedDays = [] } = {}, currentUnlocked = {}, scope) {
  const newlyUnlocked = [];
  const allowedCategories = scope ? SCOPE_CATEGORIES[scope] : null;
  const totalRunKm = runs.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);

  BADGES_CATALOG.forEach((badge) => {
    // Se já foi desbloqueada antes, pula
    if (currentUnlocked[badge.id]) return;
    // Fora do escopo da ação que disparou esta avaliação: não é esta corrida/treino que a merece
    if (allowedCategories && !allowedCategories.includes(badge.category)) return;

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
      newlyUnlocked.push(badge);
    }
  });

  return newlyUnlocked;
}
