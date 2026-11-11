/**
 * trainingGuidelines.ts — espelho Deno de src/data/trainingGuidelines.js.
 * Edge Functions não importam o bundle do frontend, por isso os valores são duplicados aqui —
 * ao atualizar um lado, atualizar o outro (os dois são a mesma fonte de verdade em espírito,
 * só não podem ser o mesmo módulo entre runtimes diferentes).
 */

export const VOLUME_TARGETS_SETS_PER_WEEK = {
  beginner: { min: 8, max: 12 },
  intermediate: { min: 12, max: 18 },
  advanced: { min: 14, max: 20 }
};

export const REP_RANGES = {
  heavyCompound: [6, 10],
  secondaryCompound: [8, 12],
  isolation: [10, 15]
};

export const TARGET_RIR = { min: 1, max: 3 };

export const REST_SECONDS = {
  compound: [90, 120],
  isolation: [60, 75]
};

export const MIN_FREQUENCY_PER_WEEK = 2;

export function describeGuidelinesForPrompt(): string {
  return `Prescrição de referência (ajuste ao nível): ${VOLUME_TARGETS_SETS_PER_WEEK.intermediate.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.intermediate.max} séries semanais por grupo muscular para intermediários, ${VOLUME_TARGETS_SETS_PER_WEEK.beginner.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.beginner.max} para iniciantes, ${VOLUME_TARGETS_SETS_PER_WEEK.advanced.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.advanced.max} para avançados; ${REP_RANGES.heavyCompound[0]}-${REP_RANGES.isolation[1]} reps (compostos ${REP_RANGES.heavyCompound[0]}-${REP_RANGES.secondaryCompound[1]}, isoladores ${REP_RANGES.isolation[0]}-${REP_RANGES.isolation[1]}); descanso de ${REST_SECONDS.compound[0]}-${REST_SECONDS.compound[1]}s em compostos e ${REST_SECONDS.isolation[0]}-${REST_SECONDS.isolation[1]}s em isoladores; proximidade da falha de ${TARGET_RIR.min}-${TARGET_RIR.max} RIR; frequência mínima de ${MIN_FREQUENCY_PER_WEEK}x/semana por grupo muscular grande.`;
}
