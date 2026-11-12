import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell, ChevronUp, ChevronDown } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';
import { restMediaSessionService } from '../services/restMediaSessionService';

export default function RestTimer({
  initialTime = 60,
  autoStartTrigger = 0,
  exerciseName,
  nextSetInfo,
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
  const lastReportedSecondRef = useRef(null);
  const [, setNowTick] = useState(0);
  onFinishRef.current = onFinish;

  // Refs sempre atualizados: usados pelos handlers remotos (lock screen / auscultadores),
  // que são registados uma única vez e não podem depender de closures desatualizadas.
  const exerciseNameRef = useRef(exerciseName);
  exerciseNameRef.current = exerciseName;
  const nextSetInfoRef = useRef(nextSetInfo);
  nextSetInfoRef.current = nextSetInfo;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  // Finaliza o descanso imediatamente (fim natural da contagem ou skip remoto)
  const finishNow = () => {
    finishedAtRef.current = Date.now();
    endAtRef.current = null;
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(true);
    sound.playTimerComplete();
    triggerHaptic([40, 100, 40, 120]);
    restMediaSessionService.markFinished({ exerciseName: exerciseNameRef.current });
    if (onFinishRef.current) onFinishRef.current();
  };
  const finishNowRef = useRef(finishNow);
  finishNowRef.current = finishNow;

  const startCountdown = (seconds) => {
    endAtRef.current = Date.now() + seconds * 1000;
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsAlerting(false);
    sound.playStartRest();
    triggerHaptic(20);

    lastReportedSecondRef.current = seconds;
    restMediaSessionService.primeAudio();
    restMediaSessionService.setActionHandlers({
      onSkipRest: () => finishNowRef.current(),
      onAddRest: (secs) => addTimeRef.current(secs ?? 30),
      onTogglePause: (pause) => {
        if (pause && isActiveRef.current) toggleTimerRef.current();
        else if (!pause && !isActiveRef.current && timeLeftRef.current > 0) toggleTimerRef.current();
      }
    });
    restMediaSessionService.updateRestSession({
      timeLeft: seconds,
      totalSeconds: seconds,
      exerciseName: exerciseNameRef.current,
      nextSetInfo: nextSetInfoRef.current
    });
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
        finishNowRef.current();
        return;
      }
      // Media Session: só atualiza quando o segundo exibido muda (evita trabalho a cada 250ms)
      if (remaining !== lastReportedSecondRef.current) {
        lastReportedSecondRef.current = remaining;
        restMediaSessionService.updateRestSession({
          timeLeft: remaining,
          totalSeconds,
          exerciseName: exerciseNameRef.current,
          nextSetInfo: nextSetInfoRef.current
        });
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isActive, totalSeconds]);

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
      restMediaSessionService.updateRestSession({
        timeLeft: remaining,
        totalSeconds,
        exerciseName: exerciseNameRef.current,
        nextSetInfo: nextSetInfoRef.current,
        paused: true
      });
    } else {
      endAtRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
      triggerHaptic(10);
      restMediaSessionService.updateRestSession({
        timeLeft,
        totalSeconds,
        exerciseName: exerciseNameRef.current,
        nextSetInfo: nextSetInfoRef.current
      });
    }
  };
  const toggleTimerRef = useRef(toggleTimer);
  toggleTimerRef.current = toggleTimer;

  const resetTimer = () => {
    endAtRef.current = null;
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(false);
    triggerHaptic(15);
    restMediaSessionService.clearRestSession();
  };

  const addTime = (seconds) => {
    if (isActive && endAtRef.current) {
      endAtRef.current += seconds * 1000;
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      lastReportedSecondRef.current = remaining;
      restMediaSessionService.updateRestSession({
        timeLeft: remaining,
        totalSeconds,
        exerciseName: exerciseNameRef.current,
        nextSetInfo: nextSetInfoRef.current
      });
    } else {
      setTimeLeft((prev) => Math.max(0, prev + seconds));
    }
    triggerHaptic(10);
  };
  const addTimeRef = useRef(addTime);
  addTimeRef.current = addTime;

  const selectPreset = (seconds) => {
    startCountdown(seconds);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Para o áudio de fundo e limpa a media session quando o temporizador desmonta
  // (ex.: o atleta fecha o treino) — nunca deixa nada a correr em segundo plano.
  useEffect(() => () => restMediaSessionService.clearRestSession(), []);

  const progressPercent = totalSeconds > 0 && timeLeft > 0
    ? ((totalSeconds - timeLeft) / totalSeconds) * 100
    : 0;
  const ringRadius = 9;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <>
      {/* Dynamic Island: cápsula flutuante no topo, visível durante toda a contagem */}
      {isActive && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+80px)] inset-x-4 max-w-[280px] mx-auto z-20 animate-fadeIn">
          <div className="flex items-center gap-2 min-h-[44px] pl-2.5 pr-1.5 rounded-full backdrop-blur-2xl bg-black/80 border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90 shrink-0" aria-hidden>
              <circle cx="11" cy="11" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5" />
              <circle
                cx="11" cy="11" r={ringRadius} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - progressPercent / 100)}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <span className="flex-1 min-w-0 text-center font-mono text-[13px] font-bold tabular-nums text-white truncate">
              {formatTime(timeLeft)} <span className="text-white/50 font-normal">· Descanso</span>
            </span>
            <button
              type="button"
              onClick={() => addTime(15)}
              aria-label="Adicionar 15 segundos de descanso"
              className="shrink-0 min-h-[40px] min-w-[40px] px-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
            >
              +15s
            </button>
          </div>
        </div>
      )}

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
                className="ml-2 px-3.5 py-1.5 bg-primary text-app text-xs font-bold rounded-lg shadow-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer shrink-0 min-h-[44px]"
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
                      ? 'bg-accent text-white hover:bg-accent-strong'
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

                <img src="/coach/ab-coach-rest-128.jpg" alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-white/[0.08] shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                      {isActive ? 'A descansar · bebe água' : 'Em pausa'}
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
                          ? 'bg-accent text-white border-accent'
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
              <Play className="w-3 h-3 text-white fill-current" />
              <span>Descanso</span>
              <span className="font-mono text-zinc-400 font-normal">({totalSeconds}s)</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
