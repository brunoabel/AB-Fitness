import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTimedExercise,
  allowsAdditionalWeight,
  getDefaultDurationSeconds,
  formatDurationSeconds,
  getBestHistoricalDuration,
  calculateNextSessionPrescription
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

  it('alongamento/mobilidade é sempre temporizado, nunca peso+reps de máquina (bug relatado)', () => {
    // Exercício vindo de data/workouts.js: só tem `name`, sem mecanica/grupo nem reps em "s"
    assert.equal(isTimedExercise({ name: 'Alongamento Ativo de Posteriores & Tornozelo' }), true);
    assert.equal(isTimedExercise({ name: 'Stretch de Isquiotibiais' }), true);
    assert.equal(isTimedExercise({ name: 'Mobilidade de Quadril 90/90' }), true);

    // Exercício vindo do catálogo (exercises100.js): mecanica/grupo presentes, reps SEM "s"
    // (ex: reps: "10"), que antes do fix fazia isTimedExercise devolver false
    assert.equal(isTimedExercise({ mecanica: 'Alongamento', reps: '10' }), true);
    assert.equal(isTimedExercise({ grupo: 'Mobilidade', reps: '12' }), true);
    assert.equal(isTimedExercise({ mecanica: 'Alongamento', reps: '60s' }), true);
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

describe('StrengthMetrics — Autorregulação da Prescrição por Prontidão Wearable', () => {
  const repRange = [8, 12];
  const overloadSets = [{ weight: 100, reps: 12, rpe: 7, completed: true }];
  const repBumpSets = [{ weight: 50, reps: 10, rpe: 8, completed: true }];
  const deloadSets = [{ weight: 80, reps: 6, rpe: 10, completed: true }];

  it('sugere OVERLOAD normalmente quando não há dados de prontidão (readinessScore null)', () => {
    const hint = calculateNextSessionPrescription(overloadSets, { repRange, progressionIncrementKg: 2.5 });
    assert.equal(hint.type, 'OVERLOAD');
    assert.equal(hint.suggestedWeight, 102.5);
  });

  it('trava o OVERLOAD para MANTER quando a prontidão wearable está baixa (<55%)', () => {
    const hint = calculateNextSessionPrescription(overloadSets, { repRange, progressionIncrementKg: 2.5 }, 40);
    assert.equal(hint.type, 'MAINTAIN');
    assert.equal(hint.suggestedWeight, 100);
    assert.match(hint.rationale, /40%/);
  });

  it('não trava o OVERLOAD quando a prontidão está no limiar (55, não é "baixa")', () => {
    const hint = calculateNextSessionPrescription(overloadSets, { repRange, progressionIncrementKg: 2.5 }, 55);
    assert.equal(hint.type, 'OVERLOAD');
  });

  it('trava o REP_BUMP para MANTER quando a prontidão wearable está baixa', () => {
    const hint = calculateNextSessionPrescription(repBumpSets, { repRange }, 30);
    assert.equal(hint.type, 'MAINTAIN');
    assert.equal(hint.suggestedWeight, 50);
  });

  it('sugere REP_BUMP normalmente com boa prontidão', () => {
    const hint = calculateNextSessionPrescription(repBumpSets, { repRange }, 90);
    assert.equal(hint.type, 'REP_BUMP');
    assert.equal(hint.suggestedReps, 11);
  });

  it('nunca trava o DELOAD — baixa prontidão não deve agravar uma falha já detetada', () => {
    const hint = calculateNextSessionPrescription(deloadSets, { repRange }, 20);
    assert.equal(hint.type, 'DELOAD');
  });
});

