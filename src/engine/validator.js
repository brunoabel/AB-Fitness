/**
 * Validador pós-geração. Cada regra devolve um problema com código, severidade e mensagem.
 * `error` = o plano viola uma regra que o motor devia ter resolvido; `warning` = limite real do utilizador
 * (tempo, equipamento, dias de desporto) que o motor não consegue contornar e que é explicado ao utilizador.
 */
import { getExerciseMeta, MUSCLE_LABEL } from './exerciseMeta.js';
import { MAJOR_MUSCLES, planVolume, sessionCap, addBlocker } from './volume.js';
import { patternAvailable } from './slots.js';
import { findInsertion } from './balancer.js';

/** Padrões que um plano semanal deve cobrir. */
export const ESSENTIAL_PATTERNS = ['horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'knee_dominant', 'hip_hinge'];
const PATTERN_LABEL = {
  horizontal_push: 'empurrar horizontal', vertical_push: 'empurrar vertical', horizontal_pull: 'puxar horizontal',
  vertical_pull: 'puxar vertical', knee_dominant: 'dominante de joelho', hip_hinge: 'dobradiça de quadril'
};
/** Tolerância no mínimo semanal: o início do orçamento é um ponto de partida, não um limiar exato. */
const VOL_LOW_TOLERANCE = 1;

const round = (n) => Math.round(n * 10) / 10;

/** Porque é que não dá para somar volume a um músculo. */
function deficitReason(days, muscle, ctx, volume) {
  const reasons = new Set();
  days.forEach((day, d) => (day.exercises || []).forEach((ex, i) => {
    const w = (ex._meta || getExerciseMeta(ex))?.muscles?.[muscle] || 0;
    if (w >= 0.5) reasons.add(addBlocker(days, d, i, ctx, volume) || 'free');
  }));
  if (!reasons.size) return 'no_exercise';
  if (reasons.has('free')) return 'free';
  if (reasons.has('time') || reasons.has('locked_day')) return 'time';
  return [...reasons][0];
}

/**
 * @param {Array<{ exercises: Array<object> }>} days
 * @param {ReturnType<import('./balancer.js').buildContext>} ctx
 * @returns {Array<{ code: string, severity: 'error'|'warning', message: string, muscle?: string, day?: number }>}
 */
export function validatePlan(days, ctx) {
  const issues = [];
  const volume = planVolume(days);
  const trainingDays = days.filter((d) => (d.exercises || []).length > 0).length;

  for (const muscle of MAJOR_MUSCLES) {
    const have = volume.weekly[muscle] || 0;
    const { start } = ctx.budget[muscle];
    if (have >= start - VOL_LOW_TOLERANCE) continue;
    const reason = deficitReason(days, muscle, ctx, volume);
    // Aviso quando o limite é real (tempo, dias bloqueados ou nenhum exercício possível com o equipamento e lesões);
    // erro quando existiam exercícios e o motor não os usou.
    // Erro só se havia onde acrescentar um acessório para o músculo e o motor não o fez
    const limited = reason === 'time' || reason === 'no_exercise' || !findInsertion(days, muscle, ctx, volume);
    issues.push({
      code: 'VOL_LOW',
      severity: limited ? 'warning' : 'error',
      muscle,
      reason,
      message: reason === 'time'
        ? `${MUSCLE_LABEL[muscle]}: ${round(have)} de ${start} séries por semana; não cabe mais no tempo disponível.`
        : reason === 'no_exercise'
          ? `${MUSCLE_LABEL[muscle]}: sem exercício disponível com o teu equipamento.`
          : `${MUSCLE_LABEL[muscle]}: ${round(have)} de ${start} séries por semana com os exercícios disponíveis (${reason}).`
    });
  }

  for (const [muscle, b] of Object.entries(ctx.budget)) {
    const have = volume.weekly[muscle] || 0;
    if (have > b.cap + 1e-9) {
      issues.push({ code: 'VOL_HIGH', severity: 'error', muscle, message: `${MUSCLE_LABEL[muscle]}: ${round(have)} séries por semana, acima do teto de ${b.cap}.` });
    }
  }

  volume.direct.forEach((direct, d) => {
    for (const [muscle, sets] of Object.entries(direct)) {
      const cap = sessionCap(ctx.experience, ctx.priority.has(muscle));
      if (sets > cap) issues.push({ code: 'SESSION_CAP', severity: 'error', muscle, day: d, message: `${MUSCLE_LABEL[muscle]}: ${sets} séries diretas numa sessão (máximo ${cap}).` });
    }
    if (volume.minutes[d] > ctx.sessionMinutes + 0.5) {
      issues.push({ code: 'DURATION', severity: 'error', day: d, message: `Sessão estimada em ${Math.round(volume.minutes[d])} min para ${ctx.sessionMinutes} min disponíveis.` });
    }
  });

  const patterns = new Set();
  days.forEach((day) => (day.exercises || []).forEach((ex) => {
    const p = (ex._meta || getExerciseMeta(ex))?.pattern;
    if (p) patterns.add(p);
  }));
  for (const p of ESSENTIAL_PATTERNS) {
    if (patterns.has(p)) continue;
    const limited = !patternAvailable(p, { inventory: ctx.inventory ?? null, injuries: ctx.injuries || [], experience: ctx.experience });
    issues.push({ code: 'PATTERN_GAP', severity: limited ? 'warning' : 'error', message: `Falta o padrão ${PATTERN_LABEL[p]} na semana.` });
  }

  if (trainingDays >= 3) {
    for (const muscle of ['chest', 'back', 'quads', 'hamstrings']) {
      if ((volume.frequency[muscle] || 0) === 1) {
        issues.push({ code: 'FREQ_1X', severity: 'warning', muscle, message: `${MUSCLE_LABEL[muscle]} treinado só 1x por semana.` });
      }
    }
  }

  return issues;
}
