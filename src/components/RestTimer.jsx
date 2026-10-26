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
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] left-0 right-0 z-30 pointer-events-none px-3 transition-all duration-200">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Alerta de Fim de Descanso */}
        {isAlerting && (
          <div className="mb-2 animate-fadeIn">
            <div className="bg-[#111114] text-white p-3.5 rounded-xl shadow-2xl flex items-center justify-between border border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg shrink-0">
                  <Bell className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-xs font-bold leading-tight text-zinc-100">
                    Descanso Concluído!
                  </strong>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    Inicia a próxima série com carga e cadência controladas.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAlerting(false)}
                className="ml-2 px-3 py-1.5 bg-[#c6f432] text-zinc-950 text-xs font-bold rounded-lg shadow-xs hover:bg-[#b5e028] active:scale-95 transition-all cursor-pointer shrink-0 min-h-[36px]"
              >
                Pronto
              </button>
            </div>
          </div>
        )}

        {/* Temporizador Ativo / Em Contagem */}
        {(isActive || timeLeft > 0) && (
          <div className="rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 bg-[#141618]/95 border-zinc-700/80 text-zinc-100 overflow-hidden animate-fadeIn">
            {/* Barra de Progresso Fina */}
            <div className="h-1 w-full bg-zinc-800 rounded-t-xl overflow-hidden">
              <div 
                className="h-full bg-[#c6f432] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Cabeçalho Compacto do Temporizador */}
            <div className="px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Botão Play / Pausa */}
                <button
                  onClick={toggleTimer}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${
                    isActive
                      ? 'bg-[#c6f432] text-zinc-950 hover:bg-[#b5e028]'
                      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  } active:scale-95`}
                  aria-label={isActive ? 'Pausar Descanso' : 'Iniciar Descanso'}
                >
                  {isActive ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                      {isActive ? 'A descansar...' : 'Em pausa'}
                    </span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="font-mono text-xl font-black text-white tabular-nums">
                      {formatTime(timeLeft > 0 ? timeLeft : totalSeconds)}
                    </span>
                    <span className="text-[11px] text-zinc-500 tabular-nums font-mono">
                      / {totalSeconds}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-1">
                {isActive && (
                  <button
                    onClick={() => addTime(15)}
                    className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold tabular-nums active:scale-95 transition-all cursor-pointer"
                    title="+15 segundos"
                  >
                    +15s
                  </button>
                )}

                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
                  title="Parar e ocultar temporizador"
                  aria-label="Ocultar temporizador"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Botão de Expandir / Recolher Presets */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
                  aria-label="Opções de presets"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Painel Desdobrável com Tempos Pré-Definidos */}
            {isExpanded && (
              <div className="px-3 pb-3 pt-1 border-t border-zinc-800/80">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Ajustar tempo de descanso
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[30, 45, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => selectPreset(sec)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold tabular-nums transition-all cursor-pointer border ${
                        totalSeconds === sec
                          ? 'bg-[#c6f432] text-zinc-950 border-[#c6f432]'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado Ocioso: Pílula elegante e discreta que não obstrui nada */}
        {!isActive && !isAlerting && timeLeft === 0 && (
          <div className="flex justify-center">
            <button
              onClick={toggleTimer}
              className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#111114]/90 hover:bg-[#17171c] text-zinc-300 hover:text-white border border-white/[0.12] shadow-lg backdrop-blur-md text-xs font-semibold active:scale-95 transition-all cursor-pointer select-none"
              title="Iniciar descanso"
            >
              <Play className="w-3 h-3 text-[#c6f432] fill-current" />
              <span>Descanso</span>
              <span className="font-mono text-zinc-400 font-normal">({totalSeconds}s)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
