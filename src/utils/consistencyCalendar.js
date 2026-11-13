/**
 * consistencyCalendar.js — Agregação pura para o Calendário de Consistência do Perfil.
 * Junta musculação (completedDays/workoutHistory) e corrida (runsHistory) por dia do mês,
 * usando a mesma convenção de data (UTC via toISOString) que utils/streak.js já usa para o
 * streak e a meta semanal — para o calendário nunca discordar visualmente desses números.
 */

export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/** Letras de cabeçalho da semana, Segunda a Domingo. */
export const WEEKDAY_LETTERS_PT = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const isoDateKey = (date) => date.toISOString().slice(0, 10);

/** Segunda=0 ... Domingo=6, a partir do getDay() nativo (Domingo=0 ... Sábado=6). */
const mondayFirstIndex = (jsDay) => (jsDay + 6) % 7;

/**
 * Constrói a matriz de um mês: um array de células (semanas vazias à esquerda/direita
 * ficam `null`) com `{ day, dateKey, status, detail }`.
 *
 * `status`: 'trained_gym' | 'trained_run' | 'trained_both' | 'rest_planned' | 'missed' |
 *           'today_pending' | 'future'
 */
export function buildMonthCalendarMatrix(year, month, {
  workoutHistory = [],
  runsHistory = [],
  completedDays = [],
  schedule = [],
  today = new Date()
} = {}) {
  const todayKey = isoDateKey(today);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const gymDates = new Set((completedDays || []).map((c) => c?.date).filter(Boolean));
  const runDates = new Set((runsHistory || []).map((r) => (r?.date || '').slice(0, 10)).filter(Boolean));
  const restWeekdays = new Set((schedule || []).filter((d) => d?.isRestDay).map((d) => d.dayId));

  // Indexa o registo mais recente de cada dia (musculação e corrida) para o detalhe ao toque
  const workoutByDate = new Map();
  for (const w of workoutHistory || []) {
    const key = (w?.completedAt || '').slice(0, 10);
    if (key && !workoutByDate.has(key)) workoutByDate.set(key, w);
  }
  const runByDate = new Map();
  for (const r of runsHistory || []) {
    const key = (r?.date || '').slice(0, 10);
    if (key && !runByDate.has(key)) runByDate.set(key, r);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekdayIndex = mondayFirstIndex(new Date(year, month, 1).getDay());

  const cells = [];
  for (let i = 0; i < firstWeekdayIndex; i += 1) cells.push(null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cellDate = new Date(year, month, day);
    const key = isoDateKey(cellDate);
    const trainedGym = gymDates.has(key);
    const trainedRun = runDates.has(key);

    let status;
    if (cellDate > todayMidnight) {
      status = 'future';
    } else if (trainedGym && trainedRun) {
      status = 'trained_both';
    } else if (trainedGym) {
      status = 'trained_gym';
    } else if (trainedRun) {
      status = 'trained_run';
    } else if (key === todayKey) {
      status = 'today_pending';
    } else if (restWeekdays.has(cellDate.getDay())) {
      status = 'rest_planned';
    } else {
      status = 'missed';
    }

    cells.push({
      day,
      dateKey: key,
      status,
      workout: workoutByDate.get(key) || null,
      run: runByDate.get(key) || null
    });
  }

  return cells;
}

/** Texto corrido de resumo do mês — nunca em caixinhas KPI. */
export function buildMonthSummary(cells) {
  const past = (cells || []).filter((c) => c && (c.status === 'trained_gym' || c.status === 'trained_run' || c.status === 'trained_both'));
  const gymCount = past.filter((c) => c.status === 'trained_gym' || c.status === 'trained_both').length;
  const runCount = past.filter((c) => c.status === 'trained_run' || c.status === 'trained_both').length;
  const activeDays = past.length;

  if (activeDays === 0) return 'Ainda sem treinos registados neste mês.';

  const parts = [`${activeDays} ${activeDays === 1 ? 'dia ativo' : 'dias ativos'}`];
  if (gymCount > 0) parts.push(`${gymCount} ${gymCount === 1 ? 'treino' : 'treinos'}`);
  if (runCount > 0) parts.push(`${runCount} ${runCount === 1 ? 'corrida' : 'corridas'}`);
  return parts.join(' · ');
}

/** Linha de detalhe de um dia, para revelar sob o calendário ao tocar numa célula. */
export function buildDayDetailLine(cell) {
  if (!cell) return '';
  const dateLabel = `${cell.day}`;

  if (cell.status === 'rest_planned') return `Dia ${dateLabel} · Descanso planeado`;
  if (cell.status === 'future') return `Dia ${dateLabel} · Ainda por vir`;
  if (cell.status === 'today_pending') return `Dia ${dateLabel} · Ainda sem treino hoje`;
  if (cell.status === 'missed') return `Dia ${dateLabel} · Sem registo de treino`;

  const lines = [];
  if (cell.workout) {
    const title = cell.workout.workoutTitle || cell.workout.title || cell.workout.dayTitle || 'Treino';
    const mins = cell.workout.durationMinutes;
    const vol = cell.workout.totalVolumeKg;
    lines.push(`${title}${mins ? ` · ${mins} min` : ''}${vol ? ` · ${vol} kg` : ''}`);
  }
  if (cell.run) {
    const km = Number(cell.run.distanceKm || 0).toFixed(1);
    lines.push(`Corrida ${km} km${cell.run.avgPace ? ` · ${cell.run.avgPace}` : ''}`);
  }
  return `Dia ${dateLabel} · ${lines.join(' · ')}`;
}
