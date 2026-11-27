import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey } from './dateKey.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
}

describe('buildInitialExercisesData — Ease Mode com histórico salvo', () => {
  it('reduz 1 série de trabalho mesmo quando já existem pesos salvos para o exercício', async () => {
    const prevWindow = globalThis.window;
    const prevStorage = globalThis.localStorage;
    const mockStorage = createMemoryStorage();
    mockStorage.setItem(
      'ab_fitness_weights_v1',
      JSON.stringify({
        'supino-reto': [
          { weight: 80, reps: 8, type: 'N' },
          { weight: 80, reps: 8, type: 'N' },
          { weight: 80, reps: 8, type: 'N' },
          { weight: 80, reps: 8, type: 'N' }
        ],
        'remada-baixa': [
          { weight: 60, reps: 10, type: 'N' },
          { weight: 60, reps: 10, type: 'N' },
          { weight: 60, reps: 10, type: 'N' }
        ]
      })
    );
    mockStorage.setItem(`ab_ease_mode_${localDateKey(new Date())}`, 'peito');

    globalThis.localStorage = mockStorage;
    globalThis.window = { localStorage: mockStorage };

    try {
      const { buildInitialExercisesData } = await import('./activeWorkoutHelpers.js');
      const workout = {
        exercises: [
          { id: 'supino-reto', name: 'Supino Reto', target: 'Peitoral Maior', secondary: 'Tríceps' },
          { id: 'remada-baixa', name: 'Remada Baixa', target: 'Dorsais', secondary: 'Bíceps' }
        ]
      };

      const initial = buildInitialExercisesData(workout, null, null);
      assert.equal(initial['supino-reto'].length, 3, 'Deve remover 1 série do grupo fatigado mesmo com pesos salvos');
      assert.equal(initial['remada-baixa'].length, 3, 'Não deve reduzir séries de grupos não fatigados');
    } finally {
      globalThis.window = prevWindow;
      globalThis.localStorage = prevStorage;
    }
  });
});
