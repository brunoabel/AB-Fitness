/**
 * Streak de treino em dias, que respeita o plano: dias de descanso agendados não quebram nem somam.
 * Um dia de treino agendado sem treino quebra a sequência (hoje ainda não conta como falha).
 */
const iso = (d) => {
  // Mesmo formato (UTC) que markDayCompleted grava em storage.js
  return d.toISOString().slice(0, 10);
};

export function computeStreak(completedDays = [], schedule = [], runsHistory = [], today = new Date()) {
  const trained = new Set([
    ...completedDays.map((c) => c?.date),
    ...runsHistory.map((r) => (r?.date || '').slice(0, 10))
  ].filter(Boolean));
  const restDays = new Set(schedule.filter((d) => d?.isRestDay).map((d) => d.dayId));
  let streak = 0;
  const cursor = new Date(today);
  for (let i = 0; i < 366; i += 1) {
    const key = iso(cursor);
    if (trained.has(key)) streak += 1;
    else if (i === 0 || restDays.has(cursor.getDay())) {
      // hoje ainda está em aberto; descanso agendado não quebra
    } else break;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Treinos feitos nesta semana (segunda a domingo) e meta = dias de treino do plano. */
export function weekProgress(completedDays = [], schedule = [], today = new Date()) {
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const start = iso(monday);
  const done = new Set(completedDays.filter((c) => c?.date >= start).map((c) => c.date)).size;
  const target = schedule.filter((d) => !d?.isRestDay && d?.exercises?.length).length || 4;
  return { done, target };
}

/** Número da semana ISO (para o subtítulo "Semana 46"). */
export function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
