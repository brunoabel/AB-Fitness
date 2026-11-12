/**
 * runGoals.js — Metas semanais, objetivos de sessão, progresso e conquistas da Corrida.
 * Lógica pura e determinística, sem dependências de DOM/browser.
 */

import { formatDuration } from './runningService.js';

export const RUN_TARGETS = [
  { id: 'free', label: 'Livre', type: 'free', value: 0 },
  { id: '3km', label: '3 km', type: 'distance', value: 3 },
  { id: '5km', label: '5 km', type: 'distance', value: 5 },
  { id: '10km', label: '10 km', type: 'distance', value: 10 },
  { id: '20min', label: '20 min', type: 'time', value: 20 * 60 }
];

export const WEEKLY_GOAL_OPTIONS = [5, 10, 15, 21, 30, 42];

export function getRunTargetById(targetId) {
  return RUN_TARGETS.find((t) => t.id === targetId) || RUN_TARGETS[0];
}

export function getNextWeeklyGoal(currentKm) {
  const idx = WEEKLY_GOAL_OPTIONS.indexOf(Number(currentKm));
  if (idx === -1) return WEEKLY_GOAL_OPTIONS[1]; // 10 km
  return WEEKLY_GOAL_OPTIONS[(idx + 1) % WEEKLY_GOAL_OPTIONS.length];
}

/** Devolve o timestamp (ms) de segunda-feira às 00:00:00 locais da semana atual. */
export function getWeekStartTimestamp(now = new Date()) {
  const d = new Date(now);
  const day = d.getDay(); // 0 = domingo, 1 = segunda...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Calcula distância semanal, progresso percentual e frase motivadora curta. */
export function computeWeeklyRunProgress(runs = [], goalKm = 10, now = new Date()) {
  const safeGoal = Math.max(1, Number(goalKm) || 10);
  const weekStart = getWeekStartTimestamp(now);
  const list = Array.isArray(runs) ? runs : [];

  let weekKm = 0;
  let weekRuns = 0;

  for (const run of list) {
    const ts = Number(run?.timestamp) || new Date(run?.date || 0).getTime() || 0;
    if (ts >= weekStart) {
      weekKm += Math.max(0, Number(run?.distanceKm) || 0);
      weekRuns += 1;
    }
  }

  const roundedWeekKm = Number(weekKm.toFixed(1));
  const remainingKm = Number(Math.max(0, safeGoal - weekKm).toFixed(1));
  const goalReached = weekKm >= safeGoal;
  const pct = Math.min(100, Math.round((weekKm / safeGoal) * 100));

  let motivationLine = 'Primeira corrida da semana: 15 minutos já contam.';
  if (goalReached) {
    motivationLine = 'Meta semanal batida — todo o extra agora é bónus.';
  } else if (weekRuns > 0) {
    motivationLine = `Faltam ${remainingKm.toFixed(1)} km para fechar a tua meta semanal.`;
  }

  return {
    weekKm: roundedWeekKm,
    weekRuns,
    goalKm: safeGoal,
    pct,
    remainingKm,
    goalReached,
    motivationLine
  };
}

/** Calcula o progresso da corrida atual face ao objetivo escolhido (Livre retorna null). */
export function computeTargetProgress(target, distanceKm = 0, elapsedSeconds = 0) {
  if (!target || target.type === 'free' || !target.value) return null;

  if (target.type === 'distance') {
    const dist = Math.max(0, Number(distanceKm) || 0);
    const pct = Math.min(100, Math.round((dist / target.value) * 100));
    return {
      pct,
      reached: dist >= target.value,
      currentLabel: `${dist.toFixed(2)} km`,
      targetLabel: `${target.value} km`
    };
  }

  if (target.type === 'time') {
    const sec = Math.max(0, Math.round(Number(elapsedSeconds) || 0));
    const pct = Math.min(100, Math.round((sec / target.value) * 100));
    return {
      pct,
      reached: sec >= target.value,
      currentLabel: formatDuration(sec),
      targetLabel: formatDuration(target.value)
    };
  }

  return null;
}

/** Deteta marcos reais alcançados ao terminar uma corrida (recorde de distância ou meta). */
export function evaluateRunAchievements(run, history = [], target = null) {
  if (!run) return { badgeLabel: null, isDistanceRecord: false, targetCompleted: false };

  const previous = (Array.isArray(history) ? history : []).filter((r) => r && r.id !== run.id);
  const runDist = Number(run.distanceKm) || 0;
  const prevMax = previous.reduce((max, r) => Math.max(max, Number(r?.distanceKm) || 0), 0);

  const isDistanceRecord = previous.length > 0 && runDist >= 0.5 && runDist > prevMax;
  const targetProgress = computeTargetProgress(target, runDist, run.durationSeconds);
  const targetCompleted = Boolean(targetProgress?.reached);

  let badgeLabel = null;
  if (isDistanceRecord) {
    badgeLabel = 'Maior Distância';
  } else if (targetCompleted) {
    badgeLabel = `Meta ${target.label} Cumprida`;
  }

  return { badgeLabel, isDistanceRecord, targetCompleted };
}

/** Formata data da corrida de forma humana ("Hoje", "Ontem" ou "12 Nov"). */
export function formatRunRelativeDate(dateInput, now = new Date()) {
  const ts = typeof dateInput === 'number' ? dateInput : new Date(dateInput || 0).getTime();
  if (!ts || Number.isNaN(ts)) return 'Recente';

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTarget = new Date(ts);
  startOfTarget.setHours(0, 0, 0, 0);

  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / 86400000);
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';

  return new Date(ts).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }).replace('.', '');
}
