/**
 * mesocycleWeek.js: parâmetros de cada semana do mesociclo e a forma de os aplicar ao treino.
 * Fonte única para generateMesocyclePlan (planFromProfile.js) e para o treino ativo.
 */
export const MESO_WEEK_KEY = 'ab_fitness_meso_week_v1';
export const MESO_TOTAL_WEEKS = 5;

/** Semana N de M: acumulação com RIR 3 -> 1, pico na penúltima, deload na última (-40% séries, -10% carga). */
export function mesoWeekParams(weekNumber, totalWeeks = MESO_TOTAL_WEEKS) {
  const total = Math.max(4, Math.min(6, Number(totalWeeks) || MESO_TOTAL_WEEKS));
  const w = Math.min(Math.max(Math.round(Number(weekNumber) || 1), 1), total);
  const isDeload = w === total;
  return {
    weekNumber: w,
    totalWeeks: total,
    isDeload,
    isPeakWeek: w === total - 1,
    targetRir: isDeload ? 4 : Math.max(0, 3 - (w - 1)),
    loadMultiplier: isDeload ? 0.9 : Number((1 + (w - 1) * 0.025).toFixed(3))
  };
}

/** Séries de uma semana a partir das séries base do exercício (mesma regra do plano gerado). */
export function mesoSetCount(baseSets, exerciseIndex, params) {
  const base = Number(baseSets) || 3;
  if (params.isDeload) return Math.max(1, Math.round(base * 0.6));
  if (params.isPeakWeek && exerciseIndex < 2) return Math.min(5, base + 1);
  return base;
}

export function readSelectedMesoWeek(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    return Number(storage?.getItem(MESO_WEEK_KEY)) || 1;
  } catch {
    return 1;
  }
}

const roundToHalf = (kg) => Math.round(kg * 2) / 2;

/**
 * Ajusta as séries iniciais de um exercício à semana: número de séries e, no deload, carga a 90%.
 * Nas semanas de acumulação a carga não muda aqui: a progressão vem do histórico real.
 */
export function applyMesoWeekToSets(sets, exerciseIndex, params, { isTimed = false } = {}) {
  if (!params || !Array.isArray(sets) || sets.length === 0) return sets;
  const target = mesoSetCount(sets.length, exerciseIndex, params);
  let out = sets.slice(0, target);
  while (out.length < target) out = [...out, { ...out[out.length - 1], completed: false, done: false }];
  if (params.isDeload && !isTimed) {
    out = out.map((s) => (Number(s.weight) > 0 ? { ...s, weight: roundToHalf(Number(s.weight) * params.loadMultiplier) } : s));
  }
  return out;
}

/** Séries extra da progressão de volume por músculo (cópias da última série, por concluir). */
export function addBonusSets(sets, n) {
  if (!Array.isArray(sets) || !sets.length || !(n > 0)) return sets;
  const last = sets[sets.length - 1];
  return [...sets, ...Array.from({ length: n }, () => ({ ...last, completed: false, done: false }))];
}

const reserveText = (rir) =>
  rir <= 0 ? 'leva as séries de trabalho até perto da falha técnica' : `termina cada série com ${rir} ${rir === 1 ? 'repetição' : 'repetições'} em reserva`;

/** Sugestão de progressão ajustada à semana: no deload substitui por -10% de carga; nas outras junta o alvo de esforço. */
export function applyMesoWeekToHint(hint, params, prevWeight = null) {
  if (!params || !hint) return hint;
  if (params.isDeload) {
    // Base = carga da última sessão (a mesma que pré-preenche as séries), não a progressão sugerida
    const base = Number(prevWeight) || Number(hint.suggestedWeight) || 0;
    return {
      ...hint,
      type: 'MESO_DELOAD',
      suggestedWeight: base > 0 ? roundToHalf(base * params.loadMultiplier) : base,
      badge: 'DELOAD -10%',
      rationale: `Semana ${params.weekNumber} do mesociclo é de deload: menos séries e carga a 90% para recuperar antes do próximo ciclo.`
    };
  }
  return {
    ...hint,
    rationale: `${hint.rationale} Semana ${params.weekNumber} do mesociclo: ${reserveText(params.targetRir)}.`
  };
}

/** Texto curto da semana para o cabeçalho do treino. */
export function mesoWeekLabel(params) {
  if (!params) return '';
  return params.isDeload
    ? `Semana ${params.weekNumber} · Deload: -40% séries e -10% carga`
    : `Semana ${params.weekNumber} de ${params.totalWeeks} · ${reserveText(params.targetRir)}`;
}
