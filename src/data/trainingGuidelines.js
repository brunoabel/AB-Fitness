/**
 * trainingGuidelines.js — fonte única de verdade para os parâmetros de prescrição do AB Fitness.
 * Consumido pelo WEEKLY_SCHEDULE estático e espelhado em supabase/functions/_shared/trainingGuidelines.ts
 * para o prompt do AB Coach — os dois caminhos de geração de treino usam os mesmos números.
 *
 * Fontes: Schoenfeld, Ogborn & Krieger 2017 (volume-resposta); Baz-Valle et al. 2022 (faixa ótima
 * de séries/semana); Schoenfeld, Grgic & Krieger 2019 (frequência mínima); Helms et al. 2018/2020
 * (RIR/RPE e autorregulação); Singer/Schoenfeld 2024 (descanso).
 */

// Séries por grupo muscular por semana, por nível de experiência.
export const VOLUME_TARGETS_SETS_PER_WEEK = {
  beginner: { min: 8, max: 12 },
  intermediate: { min: 12, max: 18 },
  advanced: { min: 14, max: 20 }
};

// Faixa de repetições por tipo de exercício.
export const REP_RANGES = {
  heavyCompound: [6, 10],
  secondaryCompound: [8, 12],
  isolation: [10, 15]
};

// RIR alvo (reps in reserve) — evitar falha sistemática nas primeiras séries.
export const TARGET_RIR = { min: 1, max: 3 };

// Descanso entre séries, em segundos.
export const REST_SECONDS = {
  compound: [90, 120],
  isolation: [60, 75]
};

// Frequência mínima recomendada por grupo muscular grande.
export const MIN_FREQUENCY_PER_WEEK = 2;

// Incrementos de progressão de carga.
export const PROGRESSION = {
  overloadPercent: { min: 2.5, max: 5 },
  deloadPercent: 5,
  // Incremento mínimo em kg quando a carga é pequena (halteres/isoladores) ou o % fica abaixo do menor disco.
  smallestIncrementKg: { compound: 2.5, isolation: 1 }
};

/** Texto curto pra interpolar no prompt do AB Coach e manter os dois caminhos sincronizados. */
export function describeGuidelinesForPrompt() {
  return `Prescrição de referência (ajuste ao nível): ${VOLUME_TARGETS_SETS_PER_WEEK.intermediate.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.intermediate.max} séries semanais por grupo muscular para intermediários, ${VOLUME_TARGETS_SETS_PER_WEEK.beginner.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.beginner.max} para iniciantes, ${VOLUME_TARGETS_SETS_PER_WEEK.advanced.min} a ${VOLUME_TARGETS_SETS_PER_WEEK.advanced.max} para avançados; ${REP_RANGES.heavyCompound[0]}-${REP_RANGES.isolation[1]} reps (compostos ${REP_RANGES.heavyCompound[0]}-${REP_RANGES.secondaryCompound[1]}, isoladores ${REP_RANGES.isolation[0]}-${REP_RANGES.isolation[1]}); descanso de ${REST_SECONDS.compound[0]}-${REST_SECONDS.compound[1]}s em compostos e ${REST_SECONDS.isolation[0]}-${REST_SECONDS.isolation[1]}s em isoladores; proximidade da falha de ${TARGET_RIR.min}-${TARGET_RIR.max} RIR; frequência mínima de ${MIN_FREQUENCY_PER_WEEK}x/semana por grupo muscular grande.`;
}
