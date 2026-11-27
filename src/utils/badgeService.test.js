/**
 * badgeService.test.js — Testes Unitários do Motor de Conquistas (escopo por ação)
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeNewlyUnlockedBadges } from './badgeRules.js';

describe('BadgeService — Escopo por Ação (run vs workout)', () => {
  it('reproduz o bug relatado: concluir um treino não deve desbloquear "Primeira Corrida" só porque há uma corrida antiga por marcar', () => {
    const state = { runs: [{ distanceKm: 3 }], workouts: [{ id: 'w1' }] };
    const unlocked = computeNewlyUnlockedBadges(state, {}, 'workout');
    assert.ok(!unlocked.some((b) => b.id === 'first_run'), 'não deve incluir first_run ao concluir um treino');
    assert.ok(unlocked.some((b) => b.id === 'first_workout'), 'deve incluir first_workout, que é da ação certa');
  });

  it('o inverso também vale: concluir uma corrida não desbloqueia medalhas de musculação', () => {
    const state = { runs: [{ distanceKm: 3 }], workouts: [{ id: 'w1' }] };
    const unlocked = computeNewlyUnlockedBadges(state, {}, 'run');
    assert.ok(!unlocked.some((b) => b.id === 'first_workout'), 'não deve incluir first_workout ao concluir uma corrida');
    assert.ok(unlocked.some((b) => b.id === 'first_run'), 'deve incluir first_run, que é da ação certa');
  });

  it('medalhas de constância (category "consistency") são elegíveis em ambos os escopos', () => {
    const state = { completedDays: ['d1', 'd2', 'd3'] };
    const asWorkout = computeNewlyUnlockedBadges(state, {}, 'workout');
    const asRun = computeNewlyUnlockedBadges({ ...state, runs: [{}] }, {}, 'run');
    assert.ok(asWorkout.some((b) => b.id === 'streak_3_days'));
    assert.ok(asRun.some((b) => b.id === 'streak_3_days'));
  });

  it('sem escopo (ex. arranque da app) reavalia todas as categorias', () => {
    const state = { runs: [{ distanceKm: 3 }], workouts: [{ id: 'w1' }] };
    const unlocked = computeNewlyUnlockedBadges(state, {});
    assert.ok(unlocked.some((b) => b.id === 'first_run'));
    assert.ok(unlocked.some((b) => b.id === 'first_workout'));
  });

  it('nunca repete uma badge já desbloqueada, independentemente do escopo', () => {
    const state = { runs: [{ distanceKm: 3 }] };
    const alreadyUnlocked = { first_run: { unlockedAt: 1 } };
    const unlocked = computeNewlyUnlockedBadges(state, alreadyUnlocked, 'run');
    assert.ok(!unlocked.some((b) => b.id === 'first_run'));
  });

  it('desbloqueia marcos de força relativa (× BW) e tonelagem vitalícia', () => {
    const state = {
      bodyWeightKg: 80,
      savedWeights: {
        'supino-reto-barra': [{ weight: 80, reps: 5 }],
        'agachamento-livre': [{ weight: 120, reps: 5 }],
        'levantamento-terra': [{ weight: 160, reps: 3 }]
      },
      workouts: [
        { totalVolumeKg: 30000 },
        { totalVolumeKg: 25000 }
      ]
    };
    const unlocked = computeNewlyUnlockedBadges(state, {}, 'workout');
    const ids = unlocked.map((b) => b.id);
    assert.ok(ids.includes('rel_bench_1x'));
    assert.ok(ids.includes('rel_squat_1_5x'));
    assert.ok(ids.includes('rel_deadlift_2x'));
    assert.ok(ids.includes('lifetime_50t'));
    assert.ok(!ids.includes('lifetime_100t'));
  });

  it('usa currentStreak real quando fornecido para badges de constância', () => {
    const unlockedLow = computeNewlyUnlockedBadges({ completedDays: ['d1', 'd2', 'd3', 'd4'], currentStreak: 2 }, {}, 'workout');
    assert.ok(!unlockedLow.some((b) => b.id === 'streak_3_days'));

    const unlockedHigh = computeNewlyUnlockedBadges({ completedDays: ['d1'], currentStreak: 7 }, {}, 'workout');
    assert.ok(unlockedHigh.some((b) => b.id === 'streak_3_days'));
    assert.ok(unlockedHigh.some((b) => b.id === 'streak_iron_week'));
  });
});
