import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTimedExercise,
  allowsAdditionalWeight,
  getDefaultDurationSeconds,
  formatDurationSeconds,
  getBestHistoricalDuration
} from './strengthMetrics.js';

describe('StrengthMetrics — Exercícios Isométricos e Temporizados', () => {
  it('deve identificar corretamente exercícios isométricos / temporizados', () => {
    // Casos positivos por nome / id
    assert.equal(isTimedExercise(null, 95), true); // Prancha Abdominal
    assert.equal(isTimedExercise({ id: 95, nome: 'Prancha Abdominal' }), true);
    assert.equal(isTimedExercise({ id: 'plank-1', name: 'Plank' }), true);
    assert.equal(isTimedExercise({ id: 'wall-sit', name: 'Wall Sit' }), true);
    assert.equal(isTimedExercise({ id: 'dead-hang', name: 'Dead Hang' }), true);
    assert.equal(isTimedExercise({ id: 'vacuum', name: 'Stomach Vacuum' }), true);
    assert.equal(isTimedExercise({ id: 'stretch-1', reps: '30s' }), true);
    assert.equal(isTimedExercise({ trackingType: 'time' }), true);
    assert.equal(isTimedExercise({ trackingType: 'time_weight' }), true);

    // Casos negativos (exercícios convencionais de repetição e peso)
    assert.equal(isTimedExercise(null, 1), false); // Supino Reto com Barra
    assert.equal(isTimedExercise({ id: 1, name: 'Supino Reto' }), false);
    assert.equal(isTimedExercise({ id: 2, name: 'Agachamento Livre' }), false);
    assert.equal(isTimedExercise({ id: 3, name: 'Levantamento Terra' }), false);
    assert.equal(isTimedExercise({ id: 4, name: 'Bíceps com Halteres' }), false);

    // Prancha dinâmica com repetições NÃO deve ser isometria pura
    assert.equal(isTimedExercise({ name: 'Prancha Spiderman' }), false);
    assert.equal(isTimedExercise({ name: 'Prancha com toque nos ombros' }), false);
  });

  it('deve determinar se aceita sobrecarga adicional (+kg)', () => {
    assert.equal(allowsAdditionalWeight({ nome: 'Prancha Abdominal' }), true);
    assert.equal(allowsAdditionalWeight({ nome: 'Wall Sit' }), true);
    assert.equal(allowsAdditionalWeight({ nome: 'Dead Hang' }), true);

    assert.equal(allowsAdditionalWeight({ nome: 'Alongamento de Isquiotibiais' }), false);
    assert.equal(allowsAdditionalWeight({ nome: 'Stomach Vacuum' }), false);
    assert.equal(allowsAdditionalWeight({ mecanica: 'Alongamento' }), false);
  });

  it('deve extrair duração padrão em segundos', () => {
    assert.equal(getDefaultDurationSeconds({ reps: '45s' }), 45);
    assert.equal(getDefaultDurationSeconds({ reps: '30s - 45s' }), 30);
    assert.equal(getDefaultDurationSeconds({ reps: '10 reps' }), 60);
  });

  it('deve formatar segundos de forma legível e atlética', () => {
    assert.equal(formatDurationSeconds(45), '45s');
    assert.equal(formatDurationSeconds(60), '1m');
    assert.equal(formatDurationSeconds(75), '1m 15s');
    assert.equal(formatDurationSeconds(120), '2m');
    assert.equal(formatDurationSeconds(150), '2m 30s');
  });

  it('deve encontrar a melhor duração histórica (Recorde Pessoal de Tempo)', () => {
    const history = [
      {
        exercisesData: {
          95: [
            { done: true, seconds: 45 },
            { done: true, seconds: 60 }
          ]
        }
      },
      {
        exercisesData: {
          95: [
            { done: true, seconds: 75 },
            { done: true, reps: 50 } // fallback reps
          ]
        }
      }
    ];

    const best = getBestHistoricalDuration(95, history);
    assert.equal(best, 75);
  });
});
