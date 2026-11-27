/**
 * Prescrição por exercício: faixa de reps, descanso, RIR alvo, séries iniciais e incremento de carga,
 * a partir da classe do exercício (heavy/compound/isolation/timed), do objetivo e do nível.
 * Valores de partida calibráveis: docs/TRAINING_SCIENCE_AUDIT.md, secção 3.1.
 */

/** Objetivos do gerador antigo mapeados para os do perfil. */
const GOAL_ALIAS = { athlete: 'hypertrophy', health: 'fat_loss' };
export const normalizeGoal = (goal) => GOAL_ALIAS[goal] || goal || 'hypertrophy';

/** [reps mínimas, reps máximas, descanso em segundos] por objetivo e classe. */
const REP_TABLE = {
  hypertrophy: { heavy: [6, 10, 150], compound: [8, 12, 120], isolation: [10, 15, 75] },
  strength: { heavy: [5, 8, 180], compound: [6, 10, 150], isolation: [10, 15, 75] },
  fat_loss: { heavy: [6, 10, 120], compound: [8, 12, 90], isolation: [12, 20, 60] },
  conditioning: { heavy: [8, 12, 90], compound: [10, 15, 75], isolation: [12, 20, 45] }
};

/** RIR alvo base por nível e classe (semana 1 sem mesociclo). */
const RIR_TABLE = {
  beginner: { heavy: 3, compound: 2, isolation: 2, timed: 2 },
  intermediate: { heavy: 2, compound: 2, isolation: 1, timed: 1 },
  advanced: { heavy: 2, compound: 1, isolation: 1, timed: 1 }
};

/** RIR mínimo planeado: compostos nunca a 0; iniciantes nunca abaixo de 2. */
export function rirFloor(repClass, experience) {
  if (experience === 'beginner') return 2;
  return repClass === 'isolation' || repClass === 'timed' ? 0 : 1;
}

/** Séries iniciais antes do balanceamento de volume. */
const START_SETS = {
  beginner: { heavy: 3, compound: 3, isolation: 2, timed: 2 },
  intermediate: { heavy: 3, compound: 3, isolation: 3, timed: 3 },
  advanced: { heavy: 4, compound: 3, isolation: 3, timed: 3 }
};

/** Passo mínimo de carga e incremento relativo por tipo de carga. Sem carga: progride por reps. */
const INCREMENT = {
  barbell: { step: 2.5, pct: 0.025 },
  dumbbell: { step: 2, pct: 0.05 },
  machine: { step: 2.5, pct: 0.05 },
  cable: { step: 2.5, pct: 0.05 },
  bodyweight: { step: 0, pct: 0 },
  bands: { step: 0, pct: 0 }
};

export const incrementFor = (loadType) => INCREMENT[loadType] || INCREMENT.machine;

export const SET_LIMITS = { min: 2, max: 5 };

/** Tabelas de prescrição, exportadas para a função ab-coach (scripts/build_edge_engine.mjs). */
export const PRESCRIPTION_TABLES = { REP_TABLE, RIR_TABLE, START_SETS, INCREMENT, SET_LIMITS };

/**
 * @param {import('./exerciseMeta.js').ExerciseMeta|null} meta
 * @param {{ goal?: string, experience?: string, timedReps?: string }} ctx
 */
export function prescribe(meta, { goal, experience = 'intermediate', timedReps } = {}) {
  const level = RIR_TABLE[experience] ? experience : 'intermediate';
  const repClass = meta?.repClass || 'compound';
  const g = REP_TABLE[normalizeGoal(goal)] ? normalizeGoal(goal) : 'hypertrophy';
  const targetRir = RIR_TABLE[level][repClass];
  const sets = START_SETS[level][repClass];
  if (repClass === 'timed') {
    return { sets, reps: timedReps || '30-45s', repRange: null, restTime: 45, targetRir, rirFloor: rirFloor(repClass, level), increment: incrementFor('bodyweight'), repClass };
  }
  const [min, max, rest] = REP_TABLE[g][repClass];
  return {
    sets,
    reps: `${min}-${max}`,
    repRange: [min, max],
    restTime: rest,
    targetRir,
    rirFloor: rirFloor(repClass, level),
    increment: incrementFor(meta?.loadType),
    repClass
  };
}

/** Segundos de trabalho de uma série (para estimar a duração da sessão). */
export function workSecondsPerSet(exercise, meta) {
  if (meta?.repClass === 'timed') {
    const n = parseInt(String(exercise?.suggestedReps || ''), 10);
    return Number.isFinite(n) && n > 0 ? n : 40;
  }
  return meta?.unilateral ? 70 : 40;
}
