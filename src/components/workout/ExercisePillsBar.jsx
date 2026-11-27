import React from 'react';
import { Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

/** Barra compacta de progresso segmentado e seleção rápida de exercícios. */
export default function ExercisePillsBar({
  exercises,
  exercisesData,
  focusedExerciseId,
  isExpressMode,
  isFocusMode,
  onSelectExercise
}) {
  return (
    <div className="space-y-2">
      {/* Trilha segmentada ultrafina de progresso */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {exercises.map((ex) => {
          const sets = exercisesData[ex.id] || [];
          const isAllDone = sets.length > 0 && sets.every((s) => s.completed || s.done);
          const isCurrent = ex.id === (isFocusMode ? focusedExerciseId : null);
          return (
            <div
              key={ex.id}
              className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${
                isAllDone
                  ? 'bg-emerald-400'
                  : isCurrent
                    ? 'bg-accent-hover'
                    : 'bg-white/[0.08]'
              }`}
            />
          );
        })}
      </div>

      {/* Pílulas numéricas compactas com realce em Azul Marinho */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scroll-smooth">
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
              aria-label={`${ex.name} (${doneCount}/${sets.length} séries)`}
              title={`${ex.name} · ${doneCount}/${sets.length} séries`}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[40px] ${
                isCurrent
                  ? 'bg-accent text-white border-accent-hover'
                  : isAllDone
                    ? 'bg-white/[0.04] text-emerald-400 border-emerald-500/30'
                    : 'bg-transparent text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/[0.16]'
              }`}
            >
              <span className="font-display tabular-nums">
                {isAllDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : idx + 1}
              </span>
              {isCurrent && (
                <span className="truncate max-w-[130px] font-medium text-[11px]">
                  {ex.name}
                </span>
              )}
            </button>
          );
        })}
        {isExpressMode && (
          <span className="shrink-0 ml-auto px-2.5 py-1 rounded-full bg-accent/40 border border-accent-hover text-[11px] font-medium text-zinc-200">
            Express 45s
          </span>
        )}
      </div>
    </div>
  );
}
