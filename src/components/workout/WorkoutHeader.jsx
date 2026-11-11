import React from 'react';
import { ChevronLeft, Layers, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

export const formatElapsed = (sec) => {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/** Barra superior fixa do treino ativo: pausar, cronómetro, modo foco, concluir e progresso. */
export default function WorkoutHeader({ elapsedSeconds, completionPercentage, isFocusMode, onToggleFocus, onPause, onFinish, isFinishing }) {
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-white/10 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={onPause}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 px-3 py-2 rounded-xl border border-white/10 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          title="Pausar e regressar ao painel"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
          <span>Pausar</span>
        </button>

        {/* Cronómetro central com numerais tabulares */}
        <div className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs tabular-nums">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider tabular-nums text-zinc-100">{formatElapsed(elapsedSeconds)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onToggleFocus();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isFocusMode ? 'bg-accent/70 text-white border-accent-hover' : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
            }`}
            title={isFocusMode ? 'Modo Foco Ativo (Toque para ver lista completa)' : 'Mudar para Modo Foco'}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={onFinish}
            disabled={isFinishing}
            aria-busy={isFinishing}
            className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-app font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] disabled:opacity-60 disabled:cursor-default"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Concluir</span>
          </button>
        </div>
      </div>

      {/* Linha fina de progresso da sessão */}
      <div className="w-full bg-zinc-900 h-1">
        <div className="bg-accent h-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
      </div>
    </header>
  );
}
