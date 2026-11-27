/**
 * Dados do aparelho que o plano do perfil usa além do onboarding (src/data/planFromProfile.js, extras):
 * corridas registadas (treino concorrente), preferências de exercícios e calibração individual do volume.
 */
import { getRunsHistory } from './storage.js';
import { getExercisePreferences } from './exercisePreferences.js';
import { loadMesocycle } from './mesocycleState.js';

export function planExtrasFromStorage() {
  return {
    runs: getRunsHistory(),
    preferences: getExercisePreferences(),
    calibration: loadMesocycle().state.calibration || {}
  };
}

/** Assinatura de um plano semanal (exercícios e séries por dia), para saber se o recalculado é diferente. */
export const planSignature = (plan) =>
  (plan || []).map((d) => `${d.dayId}:${(d.exercises || []).map((ex) => `${ex.id}x${ex.defaultSets}`).join(',')}`).join('|');

const DISMISS_KEY = 'ab_plan_update_dismissed_v1';

export function isPlanUpdateDismissed(sig) {
  try {
    return localStorage.getItem(DISMISS_KEY) === sig;
  } catch {
    return false;
  }
}

export function dismissPlanUpdate(sig) {
  try {
    localStorage.setItem(DISMISS_KEY, sig);
  } catch {}
}
