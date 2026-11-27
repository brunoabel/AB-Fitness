/**
 * Configuração de progressão de um exercício do treino ativo. Usa o que o plano já trouxer
 * (repRange, targetRir, progressionIncrement) e completa com o motor para treinos personalizados,
 * de treinador ou antigos, que não têm esses campos.
 */
import { getExerciseMeta } from './exerciseMeta.js';
import { prescribe } from './prescription.js';

/**
 * @param {object} exercise exercício do treino
 * @param {{ primaryGoal?: string, experienceLevel?: string }|null} profile perfil local (opcional)
 * @returns {{ repRange: [number, number]|null, targetRir: number, increment: { step: number, pct: number } }}
 */
export function progressionConfigFor(exercise, profile = null) {
  const p = prescribe(getExerciseMeta(exercise), {
    goal: profile?.primaryGoal || 'hypertrophy',
    experience: profile?.experienceLevel || 'intermediate'
  });
  const legacyKg = Number(exercise?.progressionIncrementKg);
  return {
    repRange: Array.isArray(exercise?.repRange) && exercise.repRange.length === 2 ? exercise.repRange : p.repRange,
    targetRir: Number.isFinite(Number(exercise?.targetRir)) ? Number(exercise.targetRir) : p.targetRir,
    increment: exercise?.progressionIncrement || (legacyKg > 0 ? { step: legacyKg, pct: 0 } : p.increment)
  };
}
