/**
 * Evolução de força do corpo inteiro (lógica pura, sem dependências de UI nem do catálogo).
 *
 * Por exercício:  base = melhor 1RM estimado até ao início do período (ou a 1.ª sessão dentro dele);
 *                 atual = melhor 1RM estimado até hoje. Ganho = atual / base − 1.
 * Força total:    média dos ganhos dos exercícios com pelo menos uma sessão depois da base.
 * Por músculo:    média dos ganhos ponderada pelo papel do músculo no exercício (primário 1, secundário 0,5),
 *                 através de `regionsFor(exerciseId)`, injetado pelo chamador (catálogo de exercícios).
 * Série semanal:  índice 100 no início do período; cada ponto usa o melhor 1RM acumulado até essa semana.
 */

import { e1RM } from './strengthMetrics.js';

const DAY_MS = 86400000;
const GAIN_MIN = -0.5;
const GAIN_MAX = 1.5;

function sessionTime(s) {
  if (!s) return 0;
  if (typeof s.timestamp === 'number' && Number.isFinite(s.timestamp)) return s.timestamp;
  const t = new Date(s.completedAt || s.created_at || s.date || 0).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Melhor 1RM estimado de uma sessão para um exercício (séries de trabalho concluídas e com carga). */
function bestSessionE1rm(sets) {
  if (!Array.isArray(sets)) return 0;
  let best = 0;
  for (const s of sets) {
    if (!(s?.done || s?.completed) || s?.type === 'W') continue;
    const weight = Number(s.weight) || 0;
    const reps = Number(s.reps) || 0;
    if (weight <= 0 || reps <= 0) continue;
    const est = e1RM(weight, reps, s.rpe ? 10 - Number(s.rpe) : 0) || 0;
    if (est > best) best = est;
  }
  return best;
}

const clampGain = (g) => Math.min(GAIN_MAX, Math.max(GAIN_MIN, g));

export function computeStrengthEvolution(history = [], { regionsFor = () => [], now = Date.now(), windowDays = 90 } = {}) {
  const start = now - windowDays * DAY_MS;
  const sessions = (Array.isArray(history) ? history : [])
    .map((s) => ({ t: sessionTime(s), data: s?.exercisesData || {} }))
    .filter((s) => s.t > 0 && s.t <= now + DAY_MS)
    .sort((a, b) => a.t - b.t);

  // Pontos (tempo, melhor 1RM da sessão) por exercício
  const points = new Map();
  for (const s of sessions) {
    for (const [exId, sets] of Object.entries(s.data)) {
      const best = bestSessionE1rm(sets);
      if (best <= 0) continue;
      if (!points.has(exId)) points.set(exId, []);
      points.get(exId).push({ t: s.t, v: best });
    }
  }

  const exercises = [];
  for (const [exId, list] of points) {
    const before = list.filter((p) => p.t < start);
    const inside = list.filter((p) => p.t >= start);
    if (inside.length === 0) continue;
    let base;
    let baseT;
    let after;
    if (before.length > 0) {
      base = Math.max(...before.map((p) => p.v));
      baseT = start;
      after = inside;
    } else {
      if (inside.length < 2) continue;
      base = inside[0].v;
      baseT = inside[0].t;
      after = inside.slice(1);
    }
    const current = Math.max(base, ...after.map((p) => p.v));
    exercises.push({ id: exId, base, baseT, current, gain: clampGain(current / base - 1), points: list });
  }

  const empty = { ready: false, totalGainPct: 0, series: [], regions: [], exercisesCount: 0, windowDays, startedAt: start };
  if (exercises.length === 0) return empty;

  const totalGain = exercises.reduce((acc, ex) => acc + ex.gain, 0) / exercises.length;

  // Por músculo
  const regionAcc = new Map();
  for (const ex of exercises) {
    for (const { region, weight } of regionsFor(ex.id) || []) {
      if (!region || !(weight > 0)) continue;
      const acc = regionAcc.get(region) || { sum: 0, w: 0, count: 0 };
      acc.sum += ex.gain * weight;
      acc.w += weight;
      acc.count += 1;
      regionAcc.set(region, acc);
    }
  }
  const regions = [...regionAcc]
    .map(([id, acc]) => ({ id, gainPct: Math.round((acc.sum / acc.w) * 100), exercises: acc.count }))
    .sort((a, b) => b.gainPct - a.gainPct);

  // Série semanal do índice de força total (100 = início do período)
  const weeks = Math.max(2, Math.ceil(windowDays / 7));
  const series = [];
  for (let i = 0; i <= weeks; i++) {
    const t = Math.min(now, start + i * 7 * DAY_MS);
    const ratios = exercises.map((ex) => {
      let best = ex.base;
      for (const p of ex.points) {
        if (p.t <= t && p.t >= ex.baseT && p.v > best) best = p.v;
      }
      return best / ex.base;
    });
    const value = (ratios.reduce((a, r) => a + r, 0) / ratios.length) * 100;
    series.push({ t, value: Math.round(value * 10) / 10 });
    if (t === now) break;
  }

  return {
    ready: true,
    totalGainPct: Math.round(totalGain * 100),
    series,
    regions,
    exercisesCount: exercises.length,
    windowDays,
    startedAt: start
  };
}

/** Cor de crescimento para o corpo: marinho (sem ganho) até branco (≥ 25 %); sem dados fica neutro. */
export function growthFill(gainPct) {
  if (gainPct === null || gainPct === undefined || !Number.isFinite(gainPct)) return 'var(--color-surface-3)';
  const t = Math.max(0, Math.min(1, gainPct / 25));
  const pct = Math.round(15 + t * 85);
  return `color-mix(in oklab, #ffffff ${pct}%, var(--color-accent))`;
}

/** "+14%" / "−3%" / "0%" com sinal explícito. */
export function formatGain(gainPct) {
  const n = Math.round(Number(gainPct) || 0);
  if (n > 0) return `+${n}%`;
  if (n < 0) return `−${Math.abs(n)}%`;
  return '0%';
}
