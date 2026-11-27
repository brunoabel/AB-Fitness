import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

/** Barra inferior translúcida dedicada à navegação entre exercícios (o CTA da série fica no palco principal). */
export default function WorkoutDock({
  index,
  total,
  exerciseName,
  onPrev,
  onNext
}) {
  const isLast = index >= total - 1;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/85 backdrop-blur-2xl border-t border-white/[0.08] px-3 sm:px-6 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            onPrev();
          }}
          disabled={index <= 0}
          className="px-3.5 py-2.5 rounded-full text-zinc-300 hover:text-white disabled:opacity-25 disabled:pointer-events-none font-medium text-xs active:scale-[0.97] transition-[color,transform] duration-150 ease-out cursor-pointer min-h-[44px] flex items-center gap-1 shrink-0"
        >
          <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
          <span>Anterior</span>
        </button>

        <div className="flex-1 text-center min-w-0 px-2">
          <span className="text-[11px] font-medium text-zinc-400 tabular-nums block">
            Exercício {index + 1} de {total}
          </span>
          <span className="text-xs font-semibold text-white truncate block max-w-[200px] sm:max-w-xs mx-auto">
            {exerciseName || ''}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onNext();
          }}
          className={`px-4 py-2.5 rounded-full font-semibold text-xs active:scale-[0.97] transition-[background-color,border-color,color,transform] duration-150 ease-out cursor-pointer min-h-[44px] flex items-center gap-1.5 shrink-0 ${
            isLast
              ? 'bg-primary text-app hover:bg-zinc-200'
              : 'bg-accent text-white border border-accent-hover hover:bg-accent-strong'
          }`}
        >
          {isLast ? (
            <>
              <Check className="w-4 h-4 stroke-[2.25]" />
              <span>Concluir</span>
            </>
          ) : (
            <>
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4 stroke-[1.75]" />
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
