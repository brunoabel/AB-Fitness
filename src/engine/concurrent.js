/**
 * Treino concorrente a partir das corridas registadas no app (docs/TRAINING_SCIENCE_AUDIT.md, secção 5).
 * Usa os km reais das últimas 4 semanas, não só o desporto declarado no onboarding.
 * Os limiares são parâmetros iniciais, a afinar com dados reais.
 */

/** Km por semana a partir dos quais o orçamento de quadríceps e posteriores desce. [parâmetro] */
export const RUN_KM_THRESHOLD = 25;
/** Fator aplicado ao orçamento semanal de quadríceps e posteriores acima do limiar. [parâmetro] */
export const LEG_BUDGET_SCALE = 0.8;

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 28;

const timeOf = (run) => Number(run?.timestamp) || Date.parse(run?.date || '') || 0;
/** Índice do dia da semana com segunda = 0 (igual a WEEK_DAYS do onboarding). */
const weekdayOf = (ts) => (new Date(ts).getDay() + 6) % 7;
const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Tipo de corrida inferido (o registo de corrida não guarda o tipo de sessão):
 * longa = distância de pelo menos 12 km e 1,5x a mediana; qualidade = ritmo 7% mais rápido que a mediana
 * (só com 5 ou mais corridas para ter referência); o resto é leve. Heurística, não medição.
 */
export function classifyRun(run, { medianKm, medianPace, sample }) {
  const km = Number(run.distanceKm) || 0;
  const pace = Number(run.avgPaceSeconds) || 0;
  if (km >= Math.max(12, medianKm * 1.5)) return 'long';
  if (sample >= 5 && pace > 0 && medianPace > 0 && pace <= medianPace * 0.93) return 'quality';
  return 'easy';
}

/**
 * Carga de corrida das últimas 4 semanas.
 * @param {Array<{ timestamp?: number, date?: string, distanceKm: number, avgPaceSeconds?: number, isSimulation?: boolean }>} runs
 * @returns {{ weeklyKm: number, runs: number, qualityDays: number[], longRunDays: number[], highVolume: boolean }}
 */
export function runningLoad(runs = [], now = Date.now()) {
  const since = now - WINDOW_DAYS * DAY_MS;
  const recent = (Array.isArray(runs) ? runs : []).filter((r) => !r?.isSimulation && Number(r?.distanceKm) > 0 && timeOf(r) >= since && timeOf(r) <= now);
  const weeklyKm = Math.round((recent.reduce((t, r) => t + Number(r.distanceKm), 0) / (WINDOW_DAYS / 7)) * 10) / 10;
  const ref = {
    medianKm: median(recent.map((r) => Number(r.distanceKm))),
    medianPace: median(recent.map((r) => Number(r.avgPaceSeconds) || 0).filter((p) => p > 0)),
    sample: recent.length
  };
  // Dia habitual: o mesmo dia da semana com corrida de qualidade (ou longa) em 2 ou mais semanas diferentes
  const weeksByDay = { quality: new Map(), long: new Map() };
  for (const run of recent) {
    const type = classifyRun(run, ref);
    if (type === 'easy') continue;
    const day = weekdayOf(timeOf(run));
    const week = Math.floor((now - timeOf(run)) / (7 * DAY_MS));
    if (!weeksByDay[type].has(day)) weeksByDay[type].set(day, new Set());
    weeksByDay[type].get(day).add(week);
  }
  const habitual = (map) => [...map.entries()].filter(([, weeks]) => weeks.size >= 2).map(([day]) => day).sort((a, b) => a - b);
  return {
    weeklyKm,
    runs: recent.length,
    qualityDays: habitual(weeksByDay.quality),
    longRunDays: habitual(weeksByDay.long),
    highVolume: weeklyKm > RUN_KM_THRESHOLD
  };
}

/**
 * Ajustes do plano para a carga de corrida.
 * - Acima do limiar: orçamento de quadríceps e posteriores x0,8.
 * - Sem pernas pesadas no dia de uma corrida de qualidade nem na véspera (24 h antes), nem no dia a seguir a uma longa.
 * @returns {{ budgetScale: Record<string, number>, blocked: Set<number>, eventDays: Set<number> }}
 */
export function concurrentAdjustments(load) {
  const blocked = new Set();
  const eventDays = new Set();
  if (!load) return { budgetScale: {}, blocked, eventDays };
  for (const d of load.qualityDays) {
    blocked.add(d);
    blocked.add((d + 6) % 7);
    eventDays.add(d);
  }
  for (const d of load.longRunDays) {
    blocked.add((d + 1) % 7);
    eventDays.add(d);
  }
  return {
    budgetScale: load.highVolume ? { quads: LEG_BUDGET_SCALE, hamstrings: LEG_BUDGET_SCALE } : {},
    blocked,
    eventDays
  };
}
