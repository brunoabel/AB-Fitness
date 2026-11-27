import React, { useEffect, useState } from 'react';
import { ChevronLeft, Layers, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

export const formatElapsed = (sec) => {
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/** Relógio isolado para atualizar apenas os dígitos a cada 1s sem re-renderizar o treino inteiro. */
function WorkoutElapsedClock({ computeElapsed, isRunning }) {
  const [seconds, setSeconds] = useState(() => (computeElapsed ? computeElapsed() : 0));

  useEffect(() => {
    if (!computeElapsed) return undefined;
    const sync = () => setSeconds(computeElapsed());
    sync();
    if (!isRunning) return undefined;
    const interval = setInterval(sync, 1000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [computeElapsed, isRunning]);

  return (
    <span className={`font-display text-xs font-semibold tabular-nums tracking-tight ${isRunning ? 'text-white' : 'text-zinc-500'}`}>
      {formatElapsed(seconds)}
    </span>
  );
}

/** Barra superior fixa do treino ativo: pausar, cronómetro, modo foco, concluir e progresso. */
export default function WorkoutHeader({
  workoutTitle,
  computeElapsed,
  isTimerRunning = true,
  completionPercentage,
  completedWorkingSetsCount,
  totalWorkingSetsCount,
  isFocusMode,
  onToggleFocus,
  onPause,
  onFinish,
  isFinishing
}) {
  return (
    <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06] pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Esquerda: Pausar com alvo tátil */}
        <button
          type="button"
          onClick={onPause}
          className="flex items-center gap-0.5 text-xs font-semibold text-zinc-400 hover:text-white px-2 py-2 rounded-full active:scale-[0.97] transition-[color,transform] duration-150 ease-out cursor-pointer min-h-[44px]"
          title="Pausar e regressar ao painel"
        >
          <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
          <span className="hidden xs:inline sm:inline">Pausar</span>
        </button>

        {/* Centro: HUD compacto do treino */}
        <div className="flex flex-col items-center justify-center text-center min-w-0">
          <span className="text-zinc-400 text-[11px] font-medium truncate max-w-[175px] sm:max-w-xs tracking-tight">
            {workoutTitle || 'Sessão de Treino'}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 text-zinc-500 text-xs tabular-nums">
            <WorkoutElapsedClock computeElapsed={computeElapsed} isRunning={isTimerRunning} />
            {totalWorkingSetsCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {completedWorkingSetsCount}/{totalWorkingSetsCount} séries
                </span>
              </>
            )}
          </div>
        </div>

        {/* Direita: Alternar Foco + Concluir Treino */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onToggleFocus();
            }}
            className={`p-2 rounded-full border active:scale-[0.97] transition-[color,background-color,border-color,transform] duration-150 ease-out cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isFocusMode
                ? 'bg-accent text-white border-accent-hover'
                : 'bg-transparent text-zinc-400 border-white/[0.08] hover:text-white hover:border-white/[0.16]'
            }`}
            title={isFocusMode ? 'Modo Foco Ativo (Toque para ver lista completa)' : 'Mudar para Modo Foco'}
            aria-label="Alternar modo de visualização"
          >
            <Layers className="w-4 h-4 stroke-[1.75]" />
          </button>

          <button
            type="button"
            onClick={onFinish}
            disabled={isFinishing}
            aria-busy={isFinishing}
            className="px-4 py-2 rounded-full bg-primary text-app hover:bg-zinc-200 font-semibold text-xs active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out flex items-center gap-1.5 cursor-pointer min-h-[44px] disabled:opacity-60 disabled:cursor-default"
          >
            <Check className="w-4 h-4 stroke-[2.25]" />
            <span className="hidden sm:inline">Concluir</span>
          </button>
        </div>
      </div>

      {/* Linha fina de progresso no topo sem brilho */}
      <div className="w-full bg-white/[0.04] h-[2px] overflow-hidden">
        <div
          className="bg-white h-full transition-[width] duration-300 ease-out"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </header>
  );
}
