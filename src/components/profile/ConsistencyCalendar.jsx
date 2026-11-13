import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWorkoutHistory, getRunsHistory, getCompletedDays } from '../../utils/storage';
import { WEEKLY_SCHEDULE } from '../../data/workouts';
import { buildMonthCalendarMatrix, buildMonthSummary, buildDayDetailLine, MONTH_NAMES_PT, WEEKDAY_LETTERS_PT } from '../../utils/consistencyCalendar';
import { triggerHaptic } from '../../utils/audio';

const DOT_CLASS = {
  trained_gym: 'bg-white text-black',
  trained_run: 'bg-white text-black',
  trained_both: 'bg-white text-black ring-2 ring-white/30 ring-offset-2 ring-offset-app'
};

/** Calendário de consistência: um olhar sobre os dias treinados, descansados e em falta. */
export default function ConsistencyCalendar() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);

  const today = useMemo(() => new Date(), []);
  const viewDate = useMemo(() => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1), [today, monthOffset]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const cells = useMemo(() => buildMonthCalendarMatrix(year, month, {
    workoutHistory: getWorkoutHistory(),
    runsHistory: getRunsHistory(),
    completedDays: getCompletedDays(),
    schedule: WEEKLY_SCHEDULE,
    today
  }), [year, month, today]);

  const summary = useMemo(() => buildMonthSummary(cells), [cells]);
  const selectedCell = cells.find((c) => c && c.dateKey === selectedKey) || null;

  const isCurrentMonth = monthOffset === 0;

  return (
    <div className="rounded-2xl bg-surface border border-white/[0.08] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-bold text-base text-white">
          {MONTH_NAMES_PT[month]} <span className="text-zinc-500 font-normal">{year}</span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setSelectedKey(null);
              setMonthOffset((m) => m - 1);
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={isCurrentMonth}
            onClick={() => {
              triggerHaptic(8);
              setSelectedKey(null);
              setMonthOffset((m) => Math.min(0, m + 1));
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
            aria-label="Mês seguinte"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-zinc-500 mb-3">{summary}</p>

      <div className="grid grid-cols-7 gap-y-1.5 text-center">
        {WEEKDAY_LETTERS_PT.map((letter, i) => (
          <span key={i} className="text-[11px] uppercase tracking-widest text-zinc-500">{letter}</span>
        ))}

        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} />;
          const trained = cell.status === 'trained_gym' || cell.status === 'trained_run' || cell.status === 'trained_both';
          const isToday = cell.status === 'today_pending';
          const isSelected = selectedKey === cell.dateKey;

          return (
            <button
              key={cell.dateKey}
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setSelectedKey(isSelected ? null : cell.dateKey);
              }}
              disabled={cell.status === 'future'}
              className="h-9 flex flex-col items-center justify-center gap-0.5 cursor-pointer disabled:cursor-default"
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums transition-all ${
                  trained
                    ? `${DOT_CLASS[cell.status]} ${isSelected ? 'scale-110' : ''}`
                    : isToday
                      ? `ring-1 ring-white/50 text-white ${isSelected ? 'bg-white/[0.08]' : ''}`
                      : cell.status === 'future'
                        ? 'text-zinc-700'
                        : `text-zinc-600 ${isSelected ? 'bg-white/[0.06]' : ''}`
                }`}
              >
                {cell.day}
              </span>
              {cell.status === 'rest_planned' && <span className="w-1 h-1 rounded-full bg-zinc-600" aria-hidden />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedCell && (
          <motion.p
            key={selectedCell.dateKey}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-zinc-300"
          >
            {buildDayDetailLine(selectedCell)}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
