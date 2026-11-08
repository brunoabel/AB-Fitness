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
  // Instante absoluto (ms) em que o descanso termina. A contagem deriva do relógio,
  // por isso não atrasa nem congela quando o iOS suspende a aba com o ecrã bloqueado.
  const endAtRef = useRef(null);
  const onFinishRef = useRef(onFinish);
  const finishedAtRef = useRef(null);
  const [, setNowTick] = useState(0);
  onFinishRef.current = onFinish;

  const startCountdown = (seconds) => {
    endAtRef.current = Date.now() + seconds * 1000;
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsAlerting(false);
    sound.playStartRest();
    triggerHaptic(20);
  };

  // Início automático quando uma série é marcada como efetuada (usa o descanso prescrito do exercício)
  useEffect(() => {
    if (autoStartTrigger > 0 && autoStartTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = autoStartTrigger;
      startCountdown(initialTime > 0 ? initialTime : totalSeconds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartTrigger]);

  // Contagem decrescente baseada em timestamp + ressincronização ao voltar à aba
  useEffect(() => {
    if (!isActive) return undefined;

    const tick = () => {
      if (!endAtRef.current) return;
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        // Instante real em que o descanso acabou (pode ter sido com a app em segundo plano)
        finishedAtRef.current = endAtRef.current;
        endAtRef.current = null;
        setIsActive(false);
        setIsAlerting(true);
        sound.playTimerComplete();
        triggerHaptic([40, 100, 40, 120]);
        if (onFinishRef.current) onFinishRef.current();
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isActive]);

  // Enquanto o aviso está visível, atualiza "terminou há Xs" a cada segundo
  useEffect(() => {
    if (!isAlerting) return undefined;
    const id = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [isAlerting]);

  const overdueSeconds = isAlerting && finishedAtRef.current ? Math.floor((Date.now() - finishedAtRef.current) / 1000) : 0;
  const overdueLabel = overdueSeconds >= 60
    ? `${Math.floor(overdueSeconds / 60)} min ${String(overdueSeconds % 60).padStart(2, '0')}s`
    : `${overdueSeconds}s`;

  const toggleTimer = () => {
    if (timeLeft === 0) {
      startCountdown(totalSeconds);
    } else if (isActive) {
      // Pausa: congela o tempo restante
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      endAtRef.current = null;
      setTimeLeft(remaining);
      setIsActive(false);
      triggerHaptic(10);
    } else {
      endAtRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
      triggerHaptic(10);
    }
  };

  const resetTimer = () => {
    endAtRef.current = null;
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(false);
    triggerHaptic(15);
  };

  const addTime = (seconds) => {
    if (isActive && endAtRef.current) {
      endAtRef.current += seconds * 1000;
      setTimeLeft(Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000)));
    } else {
      setTimeLeft((prev) => Math.max(0, prev + seconds));
    }
    triggerHaptic(10);
  };

  const selectPreset = (seconds) => {
    startCountdown(seconds);
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
            <div className="bg-surface text-white p-3.5 rounded-xl shadow-2xl flex items-center justify-between border border-amber-500/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg shrink-0">
                  <Bell className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <strong className="block text-xs font-bold leading-tight text-zinc-100">
                    Descanso Concluído!
                  </strong>
                  <span className="text-[11px] text-zinc-400 font-normal" aria-live="polite">
                    {overdueSeconds >= 5
                      ? `Terminou há ${overdueLabel}. Já podes fazer a próxima série.`
                      : 'Inicia a próxima série com carga e cadência controladas.'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAlerting(false)}
                className="ml-2 px-3.5 py-1.5 bg-accent text-zinc-950 text-xs font-bold rounded-lg shadow-xs hover:bg-accent-strong active:scale-95 transition-all cursor-pointer shrink-0 min-h-[44px]"
              >
                Pronto
              </button>
            </div>
          </div>
        )}

        {/* Temporizador Ativo / Em Contagem */}
        {(isActive || timeLeft > 0) && (
          <div className="rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-200 bg-surface/95 border-zinc-700/80 text-zinc-100 overflow-hidden animate-fadeIn">
            {/* Barra de Progresso Fina */}
            <div className="h-1 w-full bg-zinc-800 rounded-t-xl overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-1000"
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
                      ? 'bg-accent text-zinc-950 hover:bg-accent-strong'
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
                    <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
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
                  className="tap-44 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
                  title="Parar e ocultar temporizador"
                  aria-label="Ocultar temporizador"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Botão de Expandir / Recolher Presets */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="tap-44 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all cursor-pointer"
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
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                  Ajustar tempo de descanso
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[30, 45, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => selectPreset(sec)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-bold tabular-nums transition-all cursor-pointer border ${
                        totalSeconds === sec
                          ? 'bg-accent text-zinc-950 border-accent'
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
              className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-surface/90 hover:bg-surface-2 text-zinc-300 hover:text-white border border-white/[0.12] shadow-lg backdrop-blur-md text-xs font-semibold active:scale-95 transition-all cursor-pointer select-none"
              title="Iniciar descanso"
            >
              <Play className="w-3 h-3 text-accent fill-current" />
              <span>Descanso</span>
              <span className="font-mono text-zinc-400 font-normal">({totalSeconds}s)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
