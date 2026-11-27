/**
 * Motor de prescrição de treino (P0 de docs/TRAINING_SCIENCE_AUDIT.md).
 * JavaScript puro, sem dependências de UI: usado pelo plano do onboarding e pelo treino ativo.
 */
export { getExerciseMeta, MUSCLES, MUSCLE_LABEL } from './exerciseMeta.js';
export { prescribe, rirFloor, incrementFor, normalizeGoal, SET_LIMITS } from './prescription.js';
export { weeklyBudget, planVolume, sessionMinutes, MAJOR_MUSCLES } from './volume.js';
export { buildContext, balancePlan } from './balancer.js';
export { validatePlan, ESSENTIAL_PATTERNS } from './validator.js';
export { progressionConfigFor } from './progressionConfig.js';
