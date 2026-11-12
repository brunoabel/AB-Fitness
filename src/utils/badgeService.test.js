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
});
