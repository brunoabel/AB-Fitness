/**
 * strengthMetrics.js — Motor de Métricas de Força e Sobrecarga (AB Fitness)
 * 
 * Benchmark: Hevy, Strong & RP Hypertrophy
 * - Previous Set Hints indexados
 * - Estimativa de 1RM com fórmula de Epley e suporte opcional a RIR
 * - Deteção de novos Recordes Pessoais (PR)
 * - Calculadora gráfica de anilhas (Plate Calculator)
 */

export const SET_TYPES = {
  N: { code: 'N', label: '', title: 'Normal', cls: 'text-zinc-500 hover:text-zinc-300' },
  W: { code: 'W', label: 'W', title: 'Aquecimento (Warm-up)', cls: 'text-amber-400 font-bold' },
  D: { code: 'D', label: 'D', title: 'Drop-set', cls: 'text-violet-300 font-bold' },
  F: { code: 'F', label: 'F', title: 'Falha Muscular', cls: 'text-red-400 font-bold' },
};

export const SET_TYPE_ORDER = ['N', 'W', 'D', 'F'];

/**
 * Fórmula de Epley com RIR integrado (limitada a 12 reps para manter validade biomecânica)
 */
export function e1RM(weight, reps, rir = 0) {
  const w = Number(weight) || 0;
  const r = (Number(reps) || 0) + (Number(rir) || 0);
  if (w <= 0 || r <= 0 || r > 12) return null;
  return r === 1 ? w : Math.round(w * (1 + r / 30) * 10) / 10;
}

/**
 * Indexa a última performance por exercício para usar como valor fantasma (hint)
 * Ordenado do mais recente para o mais antigo.
 */
export function buildPrevIndex(history = [], fallbackWeights = {}) {
  const idx = new Map();

  // 1. Extrair de sessões do histórico
  for (const session of history) {
    // Suporta formato direto ou exercisesData
    if (session.exercisesData) {
      for (const [exId, sets] of Object.entries(session.exercisesData)) {
        if (!idx.has(exId) && Array.isArray(sets)) {
          const valid = sets.filter(s => (s.done || s.completed) && s.type !== 'W');
          if (valid.length > 0) idx.set(exId, valid);
        }
      }
    }
    if (Array.isArray(session.exercises)) {
      for (const ex of session.exercises) {
        if (!idx.has(ex.id) && Array.isArray(ex.sets)) {
          const valid = ex.sets.filter(s => (s.done || s.completed) && s.type !== 'W');
          if (valid.length > 0) idx.set(ex.id, valid);
        }
      }
    }
  }

  // 2. Se algum exercício ainda não estiver no mapa, preenche com savedWeights
  for (const [exId, sets] of Object.entries(fallbackWeights || {})) {
    if (!idx.has(exId) && Array.isArray(sets)) {
      const valid = sets.filter(s => s.type !== 'W' && (Number(s.weight) > 0 || Number(s.reps) > 0));
      if (valid.length > 0) idx.set(exId, valid);
    }
  }

  return idx;
}

/**
 * Procura o melhor 1RM histórico de um exercício
 */
export function getBestHistorical1RM(exId, history = [], fallbackWeights = {}) {
  let max1RM = 0;

  const testSets = (sets) => {
    if (!Array.isArray(sets)) return;
    for (const s of sets) {
      if ((s.done || s.completed) && s.type !== 'W') {
        const est = e1RM(s.weight, s.reps, s.rpe ? (10 - s.rpe) : 0);
        if (est && est > max1RM) max1RM = est;
      }
    }
  };

  for (const session of history) {
    if (session.exercisesData?.[exId]) {
      testSets(session.exercisesData[exId]);
    }
    if (Array.isArray(session.exercises)) {
      const found = session.exercises.find(e => e.id === exId);
      if (found) testSets(found.sets);
    }
  }

  if (fallbackWeights?.[exId]) {
    testSets(fallbackWeights[exId]);
  }

  return max1RM > 0 ? max1RM : null;
}

/**
 * Calculadora de anilhas por lado para barra
 * Devolve lista de anilhas a colocar em cada lado e o remanescente se não for atingível
 */
export function platesPerSide(targetWeight, barWeight = 20, availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]) {
  const target = Number(targetWeight) || 0;
  const bar = Number(barWeight) || 20;

  let rest = (target - bar) / 2;
  if (rest < 0) return null;

  const plates = [...availablePlates].sort((a, b) => b - a);
  const out = [];

  for (const p of plates) {
    while (rest + 1e-9 >= p) {
      out.push(p);
      rest -= p;
    }
  }

  return {
    plates: out,
    remainder: +(rest * 2).toFixed(2), // se > 0, sobrou peso que não é atingível com as anilhas disponíveis
    perSideKg: +(plates.reduce((sum, p) => sum + p, 0)).toFixed(2)
  };
}
