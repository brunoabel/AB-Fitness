import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Dock inferior fixo: exercício anterior / atual / próximo (ou concluir no último). */
export default function WorkoutDock({ index, total, exerciseName, onPrev, onNext }) {
  const isLast = index >= total - 1;
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={index <= 0}
          className="py-3 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs border border-white/10 active:scale-95 transition-all cursor-pointer min-h-[48px] flex items-center gap-1.5 shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Anterior</span>
        </button>

        <div className="flex-1 text-center truncate px-1">
          <span className="text-[11px] font-bold text-zinc-300 font-mono tabular-nums block">
            Exercício {index + 1} de {total}
          </span>
          <span className="text-[11px] text-zinc-500 font-medium truncate block max-w-[200px] mx-auto">{exerciseName || ''}</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          className={`py-3 px-4 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer min-h-[48px] flex items-center gap-1.5 shadow-sm shrink-0 ${
            isLast ? 'bg-accent text-white hover:bg-accent-strong' : 'bg-white text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <span>{isLast ? 'Concluir Treino' : 'Próximo Exercício'}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </footer>
  );
}
