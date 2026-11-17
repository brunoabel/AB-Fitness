import React from 'react';
import { Check, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

/** Barra horizontal de seleção rápida de exercícios e alternância de Modo Express 30m. */
export default function ExercisePillsBar({
  exercises,
  exercisesData,
  focusedExerciseId,
  isExpressMode,
  isFocusMode,
  onSelectExercise,
  onToggleExpressMode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest tabular-nums">
          Exercícios ({exercises.length})
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleExpressMode}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              isExpressMode
                ? 'bg-amber-500/15 border-amber-400/35 text-amber-300'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
            }`}
            title="Modo Express: intervalos rápidos de 45s para finalizar em 30 min"
          >
            <Zap className={`w-3 h-3 ${isExpressMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
            <span>{isExpressMode ? 'Express 30m ON' : 'Express 30m'}</span>
          </button>
          <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
            {isFocusMode ? 'Modo Foco' : 'Visão Geral'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {exercises.map((ex, idx) => {
          const sets = exercisesData[ex.id] || [];
          const isAllDone = sets.length > 0 && sets.every((s) => s.completed || s.done);
          const isCurrent = ex.id === (isFocusMode ? focusedExerciseId : null);
          const doneCount = sets.filter((s) => s.completed || s.done).length;

          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                onSelectExercise(ex.id);
                triggerHaptic(8);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer min-h-[44px] ${
                isCurrent
                  ? 'bg-white/10 text-white border-white/20 shadow-xs'
                  : isAllDone
                    ? 'bg-white/[0.03] text-emerald-400 border-emerald-500/30'
                    : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/[0.12]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center font-display text-[11px] font-semibold tabular-nums ${
                  isAllDone
                    ? 'bg-emerald-500 text-black'
                    : isCurrent
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.06] text-zinc-400'
                }`}
              >
                {isAllDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </div>
              <div className="text-left">
                <span className="block truncate max-w-[110px] leading-tight text-[11px]">
                  {ex.name}
                </span>
                <span className="text-[11px] text-zinc-400 font-normal tabular-nums block">
                  {doneCount}/{sets.length} séries
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
