/**
 * streakMilestones.js — Lógica pura do Motion Graphic de Streak (celebração de sequência).
 * Sem Canvas, sem localStorage no corpo das funções de cálculo, para ser testável isoladamente.
 */

export const STREAK_MILESTONES = [3, 7, 10, 14, 21, 30, 45, 60, 90, 100, 180, 365];

/** Título editorial por marco atingido — nunca emojis, sempre em português corrido. */
export const MILESTONE_TITLES = {
  3: 'Ignição',
  7: 'Uma Semana de Fogo',
  10: 'Ritmo de Ferro',
  14: 'Duas Semanas Sólidas',
  21: 'Hábito em Formação',
  30: 'Hábito Inabalável',
  45: 'Disciplina de Elite',
  60: 'Dois Meses de Guerra',
  90: 'Trimestre Perfeito',
  100: 'Centurião AB',
  180: 'Meio Ano Lendário',
  365: 'Um Ano Inteiro'
};

/**
 * Patamar visual conforme a sequência atual — define a paleta da aura no motion graphic.
 * 'base' (branco/âmbar suave) < 'ferro' (âmbar/cobre, >=10d) < 'platina' (>=30d) < 'prisma' (>=100d).
 */
export function getStreakTier(streakDays) {
  if (streakDays >= 100) return 'prisma';
  if (streakDays >= 30) return 'platina';
  if (streakDays >= 10) return 'ferro';
  return 'base';
}

/** Paleta por patamar — fonte única usada pelo modal (CSS/SVG) e pelo cartão de partilha (Canvas). */
export const TIER_COLORS = {
  base: { primary: '#ffffff', secondary: '#e4e4e7', glow: 'rgba(255,255,255,0.18)' },
  ferro: { primary: '#f59e0b', secondary: '#c17a4f', glow: 'rgba(245,158,11,0.22)' },
  platina: { primary: '#eab308', secondary: '#f4e5a3', glow: 'rgba(234,179,8,0.25)' },
  prisma: { primary: '#ffffff', secondary: '#a78bfa', glow: 'rgba(167,139,250,0.22)' }
};

/**
 * Progresso (0-1) do anel: ao atingir exatamente um marco, o anel fecha a 100% (celebra esse
 * troço da jornada); nos dias a seguir, reabre a 0% e enche de novo até ao marco seguinte.
 */
function progressForStreak(streakDays) {
  if (streakDays <= 0) return 0;
  const prevThreshold = [0, ...STREAK_MILESTONES].filter((m) => m < streakDays).pop() ?? 0;
  const isAtMilestone = STREAK_MILESTONES.includes(streakDays);
  const nextGoal = isAtMilestone ? streakDays : (STREAK_MILESTONES.find((m) => m > streakDays) ?? null);
  if (!nextGoal) return 1;
  if (nextGoal === prevThreshold) return 1;
  return Math.max(0, Math.min(1, (streakDays - prevThreshold) / (nextGoal - prevThreshold)));
}

/**
 * Informação completa para o motion graphic: se avançou, se cruzou um marco oficial hoje,
 * o próximo marco, o progresso do anel (antes e depois, para animar a transição) e a
 * patente/título editorial correspondente.
 */
export function getStreakMilestoneInfo(streakDays, previousStreakDays = 0) {
  const advanced = streakDays > previousStreakDays;
  const isMilestone = advanced && STREAK_MILESTONES.includes(streakDays);
  const nextMilestone = STREAK_MILESTONES.find((m) => m > streakDays) ?? null;

  return {
    streakDays,
    previousStreakDays,
    advanced,
    isMilestone,
    milestone: isMilestone ? streakDays : null,
    nextMilestone,
    previousProgress: progressForStreak(previousStreakDays),
    progressToNext: progressForStreak(streakDays),
    title: MILESTONE_TITLES[streakDays] || null,
    tier: getStreakTier(streakDays)
  };
}

const LAST_DATE_KEY = 'ab_last_celebrated_streak_date';
const LAST_VALUE_KEY = 'ab_last_celebrated_streak_value';

const isoDay = (date) => date.toISOString().slice(0, 10);

/** `storage` é injetável (testes passam um mock); por omissão usa o localStorage do browser. */
function resolveStorage(storage) {
  if (storage) return storage;
  return typeof window !== 'undefined' ? window.localStorage : null;
}

/**
 * Verdadeiro só quando a sequência avançou desde a última vez que foi celebrada E ainda não
 * houve celebração hoje — garante que o motion graphic toca uma única vez por dia real.
 */
export function shouldShowStreakCelebration(streakDays, { today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store || !streakDays) return false;
  try {
    const todayKey = isoDay(today);
    const lastDate = store.getItem(LAST_DATE_KEY);
    const lastValue = Number(store.getItem(LAST_VALUE_KEY) || 0);
    if (lastDate === todayKey) return false;
    return streakDays > lastValue;
  } catch {
    return false;
  }
}

/** Regista a celebração para não voltar a tocar no mesmo dia nem para o mesmo valor. */
export function markStreakCelebrated(streakDays, { today = new Date(), storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(LAST_DATE_KEY, isoDay(today));
    store.setItem(LAST_VALUE_KEY, String(streakDays));
  } catch {}
}
