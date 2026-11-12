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
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] font-mono text-xs font-bold tabular-nums text-white">
      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
      <span>{formatElapsed(seconds)}</span>
    </div>
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
    <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-xl border-b border-white/[0.08] transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Esquerda: Pausar com alvo tátil */}
        <button
          onClick={onPause}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white px-2.5 py-2 rounded-xl active:scale-95 transition-all cursor-pointer min-h-[44px]"
          title="Pausar e regressar ao painel"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2]" />
          <span className="hidden xs:inline sm:inline">Pausar</span>
        </button>

        {/* Centro: HUD Dinâmico do Treino (Tempo + Progresso de Séries) */}
        <div className="flex flex-col items-center justify-center text-center min-w-0">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium truncate max-w-[170px] sm:max-w-xs">
            <span className="truncate">{workoutTitle || 'Sessão de Treino'}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <WorkoutElapsedClock computeElapsed={computeElapsed} isRunning={isTimerRunning} />
            {totalWorkingSetsCount > 0 && (
              <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                {completedWorkingSetsCount}/{totalWorkingSetsCount} séries
              </span>
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
            className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
              isFocusMode
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
            }`}
            title={isFocusMode ? 'Modo Foco Ativo (Toque para ver lista completa)' : 'Mudar para Modo Foco'}
            aria-label="Alternar modo de visualização"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={onFinish}
            disabled={isFinishing}
            aria-busy={isFinishing}
            className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-100 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] shadow-sm disabled:opacity-60 disabled:cursor-default"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Concluir</span>
          </button>
        </div>
      </div>

      {/* Linha fina de progresso no topo */}
      <div className="w-full bg-white/[0.04] h-[2px] overflow-hidden">
        <div
          className="bg-white h-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </header>
  );
}
