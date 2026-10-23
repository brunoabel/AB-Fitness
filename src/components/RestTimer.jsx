import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, ChevronUp, ChevronDown } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

export default function RestTimer({ 
  initialTime = 60, 
  autoStartTrigger = 0,
  onFinish 
}) {
  const [totalSeconds, setTotalSeconds] = useState(initialTime);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const prevTriggerRef = useRef(autoStartTrigger);

  // Início automático quando uma série é marcada como efetuada
  useEffect(() => {
    if (autoStartTrigger > 0 && autoStartTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = autoStartTrigger;
      setTimeLeft(totalSeconds);
      setIsActive(true);
      setIsAlerting(false);
      sound.playStartRest();
      triggerHaptic(20);
    }
  }, [autoStartTrigger, totalSeconds]);

  // Contagem decrescente
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setIsAlerting(true);
            sound.playTimerComplete();
            triggerHaptic([40, 100, 40, 120]);
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFinish]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(totalSeconds);
      setIsActive(true);
      setIsAlerting(false);
      sound.playStartRest();
      triggerHaptic(20);
    } else {
      setIsActive(!isActive);
      triggerHaptic(10);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(false);
    triggerHaptic(15);
  };

  const addTime = (seconds) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds));
    triggerHaptic(10);
  };

  const selectPreset = (seconds) => {
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsAlerting(false);
    sound.playStartRest();
    triggerHaptic(20);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 && timeLeft > 0 
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100 
    : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 transition-all duration-200">
      {/* Alerta de Fim de Descanso */}
      {isAlerting && (
        <div className="mx-auto max-w-xl px-4 pb-2">
          <div className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 p-4 rounded-xl shadow-xl flex items-center justify-between border border-zinc-800 dark:border-zinc-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 dark:bg-zinc-200 rounded-lg">
                <Bell className="w-5 h-5 text-amber-400 stroke-[2]" />
              </div>
              <div>
                <strong className="block text-sm font-semibold leading-tight">
                  Descanso Concluído
                </strong>
                <span className="text-xs text-zinc-300 dark:text-zinc-600 font-normal">
                  Inicia a série seguinte com postura neutra e cadência controlada.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAlerting(false)}
              className="px-3.5 py-2 bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white text-xs font-semibold rounded-lg shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer min-h-[40px]"
            >
              Iniciar Série
            </button>
          </div>
        </div>
      )}

      {/* Caixa do Temporizador de Descanso */}
      <div className="max-w-xl mx-auto px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
        <div className={`rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 ${
          isAlerting 
            ? 'bg-zinc-950 border-zinc-700 text-white' 
            : isActive 
              ? 'bg-white/95 dark:bg-[#141618]/95 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50' 
              : 'bg-white/95 dark:bg-[#141618]/95 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
        }`}>
          {/* Barra Fina de Progresso */}
          <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-xl overflow-hidden">
            <div 
              className="h-full bg-zinc-950 dark:bg-zinc-100 transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cabeçalho Compacto */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão Play / Pausa */}
              <button
                onClick={toggleTimer}
                className={`w-11 h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                } active:scale-95`}
                aria-label={isActive ? 'Pausar Descanso' : 'Iniciar Descanso'}
              >
                {isActive ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
                    {isActive ? 'A descansar...' : isAlerting ? 'Tempo concluído' : 'Descanso'}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                    {formatTime(timeLeft > 0 ? timeLeft : totalSeconds)}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums font-mono">
                    / {totalSeconds}s
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="flex items-center gap-1.5">
              {isActive && (
                <>
                  <button
                    onClick={() => addTime(15)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold tabular-nums active:scale-95 transition-all cursor-pointer"
                    title="+15 segundos"
                  >
                    +15s
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all cursor-pointer"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </>
              )}

              {/* Botão de Expandir / Recolher Presets */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 active:scale-95 transition-all cursor-pointer"
                aria-label="Opções do temporizador"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 stroke-[1.8]" />
                ) : (
                  <ChevronUp className="w-4 h-4 stroke-[1.8]" />
                )}
              </button>
            </div>
          </div>

          {/* Painel Desdobrável com Tempos Pré-Definidos */}
          {isExpanded && (
            <div className="px-4 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2">
                Tempos pré-definidos de descanso
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[30, 45, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => selectPreset(sec)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold tabular-nums transition-all cursor-pointer border ${
                      totalSeconds === sec
                        ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
