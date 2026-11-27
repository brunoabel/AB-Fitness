import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Bell, ChevronUp, ChevronDown, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';
import { restMediaSessionService } from '../services/restMediaSessionService';
import {
  isSpeechSupported,
  getRestVoiceCuesPreference,
  saveRestVoiceCuesPreference,
  unlockSpeechIOS,
  announceRestCountdown,
  announceRestComplete
} from '../utils/speech';

// Física de mola nativa da Apple: compacta ↔ expandida, snappy e com ligeiro overshoot
const ISLAND_SPRING = { type: 'spring', stiffness: 500, damping: 32 };
const ISLAND_AUTO_COLLAPSE_MS = 4000;
// A Dynamic Island simulada na UI web fica oculta por agora (na web/PWA pode parecer
// artificial sem o ActivityKit do iOS). Reativar quando o app for empacotado para a App Store.
const ENABLE_SIMULATED_DYNAMIC_ISLAND = false;

export default function RestTimer({
  initialTime = 60,
  autoStartTrigger = 0,
  exerciseName,
  nextSetInfo,
  initialRestState = null,
  onRestStateChange,
  onFinish
}) {
  const [totalSeconds, setTotalSeconds] = useState(() => {
    if (initialRestState?.totalSeconds > 0) return initialRestState.totalSeconds;
    return initialTime;
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    if (initialRestState?.endAt && initialRestState.endAt > Date.now()) {
      return Math.max(1, Math.ceil((initialRestState.endAt - Date.now()) / 1000));
    }
    if (initialRestState?.pausedRemaining > 0) {
      return initialRestState.pausedRemaining;
    }
    return 0;
  });
  const [isActive, setIsActive] = useState(() => Boolean(initialRestState?.endAt && initialRestState.endAt > Date.now()));
  const [isAlerting, setIsAlerting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [restVoiceEnabled, setRestVoiceEnabled] = useState(() => getRestVoiceCuesPreference());
  // Estado da Dynamic Island: cápsula compacta ↔ expandida (toque para abrir detalhe)
  const [islandExpanded, setIslandExpanded] = useState(false);
  const islandCollapseTimerRef = useRef(null);

  const prevTriggerRef = useRef(autoStartTrigger);
  // Instante absoluto (ms) em que o descanso termina. A contagem deriva do relógio,
  // por isso não atrasa nem congela quando o iOS suspende a aba com o ecrã bloqueado.
  const endAtRef = useRef(initialRestState?.endAt && initialRestState.endAt > Date.now() ? initialRestState.endAt : null);
  const onFinishRef = useRef(onFinish);
  const onRestStateChangeRef = useRef(onRestStateChange);
  const finishedAtRef = useRef(null);
  const lastReportedSecondRef = useRef(null);
  const announcedTenRef = useRef(false);
  const restVoiceEnabledRef = useRef(restVoiceEnabled);
  const [, setNowTick] = useState(0);
  onFinishRef.current = onFinish;
  onRestStateChangeRef.current = onRestStateChange;
  restVoiceEnabledRef.current = restVoiceEnabled;

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
    announcedTenRef.current = false;
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(true);
    setIslandExpanded(false);
    sound.playTimerComplete();
    triggerHaptic([40, 100, 40, 120]);
    if (restVoiceEnabledRef.current) {
      announceRestComplete(nextSetInfoRef.current);
    }
    onRestStateChangeRef.current?.(null);
    restMediaSessionService.markFinished({ exerciseName: exerciseNameRef.current });
    if (onFinishRef.current) onFinishRef.current();
  };
  const finishNowRef = useRef(finishNow);
  finishNowRef.current = finishNow;

  const startCountdown = (seconds) => {
    const endAt = Date.now() + seconds * 1000;
    endAtRef.current = endAt;
    announcedTenRef.current = false;
    setTotalSeconds(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsAlerting(false);
    sound.playStartRest();
    triggerHaptic(20);
    onRestStateChangeRef.current?.({ endAt, totalSeconds: seconds, pausedRemaining: null });

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
      if (remaining === 10 && !announcedTenRef.current && restVoiceEnabledRef.current) {
        announcedTenRef.current = true;
        announceRestCountdown(10);
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
      setIslandExpanded(false);
      triggerHaptic(10);
      onRestStateChangeRef.current?.({ endAt: null, totalSeconds, pausedRemaining: remaining });
      restMediaSessionService.updateRestSession({
        timeLeft: remaining,
        totalSeconds,
        exerciseName: exerciseNameRef.current,
        nextSetInfo: nextSetInfoRef.current,
        paused: true
      });
    } else {
      const endAt = Date.now() + timeLeft * 1000;
      endAtRef.current = endAt;
      setIsActive(true);
      triggerHaptic(10);
      onRestStateChangeRef.current?.({ endAt, totalSeconds, pausedRemaining: null });
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
    announcedTenRef.current = false;
    setIsActive(false);
    setTimeLeft(0);
    setIsAlerting(false);
    setIslandExpanded(false);
    triggerHaptic(15);
    onRestStateChangeRef.current?.(null);
    restMediaSessionService.clearRestSession();
  };

  // Auto-colapsa a Dynamic Island alguns segundos depois de expandida (como o iOS faz)
  useEffect(() => {
    if (!islandExpanded) return undefined;
    islandCollapseTimerRef.current = setTimeout(() => setIslandExpanded(false), ISLAND_AUTO_COLLAPSE_MS);
    return () => clearTimeout(islandCollapseTimerRef.current);
  }, [islandExpanded]);

  const toggleIsland = () => {
    triggerHaptic(10);
    setIslandExpanded((v) => !v);
  };

  const addTime = (seconds) => {
    if (isActive && endAtRef.current) {
      endAtRef.current += seconds * 1000;
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      if (remaining > 10) announcedTenRef.current = false;
      setTimeLeft(remaining);
      lastReportedSecondRef.current = remaining;
      onRestStateChangeRef.current?.({ endAt: endAtRef.current, totalSeconds, pausedRemaining: null });
      restMediaSessionService.updateRestSession({
        timeLeft: remaining,
        totalSeconds,
        exerciseName: exerciseNameRef.current,
        nextSetInfo: nextSetInfoRef.current
      });
    } else {
      setTimeLeft((prev) => {
        const nextVal = Math.max(0, prev + seconds);
        onRestStateChangeRef.current?.(nextVal > 0 ? { endAt: null, totalSeconds, pausedRemaining: nextVal } : null);
        return nextVal;
      });
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
  const ringRadius = 8;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const bigRingRadius = 14;
  const bigRingCircumference = 2 * Math.PI * bigRingRadius;

  return (
    <>
      {/* Dynamic Island: cápsula líquida no topo (oculta até deploy na App Store) */}
      {ENABLE_SIMULATED_DYNAMIC_ISLAND && isActive && (
        <div className="fixed top-[calc(env(safe-area-inset-top,0px)+10px)] inset-x-4 z-40 flex justify-center">
          <motion.div
            layout
            onClick={toggleIsland}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleIsland();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={islandExpanded ? 'Recolher descanso' : 'Expandir descanso'}
            transition={ISLAND_SPRING}
            className={`overflow-hidden bg-black border border-white/[0.14] shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.14)] cursor-pointer select-none ${
              islandExpanded ? 'w-[300px] rounded-[28px]' : 'w-[192px] rounded-full'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {islandExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  className="p-3"
                >
                  <div className="flex items-center gap-3">
                    <svg width="34" height="34" viewBox="0 0 34 34" className="-rotate-90 shrink-0" aria-hidden>
                      <circle cx="17" cy="17" r={bigRingRadius} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="3" />
                      <circle
                        cx="17" cy="17" r={bigRingRadius} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={bigRingCircumference}
                        strokeDashoffset={bigRingCircumference * (1 - progressPercent / 100)}
                        style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-[22px] font-bold tabular-nums text-white leading-none">{formatTime(timeLeft)}</span>
                        <span className="text-[11px] text-white/50 font-medium">Descanso</span>
                      </div>
                      {(nextSetInfo || exerciseName) && (
                        <p className="text-[12px] text-white/55 truncate mt-0.5">{nextSetInfo || exerciseName}</p>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/40 shrink-0" strokeWidth={2} />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); addTime(15); }}
                      className="flex-1 min-h-[36px] rounded-full bg-white/10 hover:bg-white/15 text-white text-[12px] font-bold active:scale-95 transition-all cursor-pointer"
                    >
                      +15s
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); finishNow(); }}
                      aria-label="Terminar descanso agora"
                      className="min-h-[36px] min-w-[36px] px-3 rounded-full bg-white/10 hover:bg-white/15 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="compact"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.12 } }}
                  exit={{ opacity: 0, transition: { duration: 0.06 } }}
                  className="h-11 flex items-center gap-2 pl-2.5 pr-1.5"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90 shrink-0" aria-hidden>
                    <circle cx="9" cy="9" r={ringRadius} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2.5" />
                    <circle
                      cx="9" cy="9" r={ringRadius} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringCircumference * (1 - progressPercent / 100)}
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                    />
                  </svg>
                  <span className="flex-1 min-w-0 text-center font-mono text-[13px] font-bold tabular-nums text-white truncate">
                    {formatTime(timeLeft)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); addTime(15); }}
                    aria-label="Adicionar 15 segundos de descanso"
                    className="shrink-0 w-11 h-11 -my-1 rounded-full bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold tabular-nums touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 cursor-pointer flex items-center justify-center"
                  >
                    +15
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] left-0 right-0 z-30 pointer-events-none px-3">
      <div className="max-w-md mx-auto pointer-events-auto">
        {/* Alerta de Fim de Descanso */}
        {isAlerting && (
          <div className="mb-2 animate-fadeIn">
            <div className="bg-surface-2/95 backdrop-blur-2xl text-white p-3.5 rounded-3xl flex items-center justify-between gap-3 border border-accent-hover">
              <div className="flex items-center gap-3 min-w-0">
                <Bell className="w-4 h-4 text-white shrink-0" strokeWidth={1.75} />
                <div className="min-w-0">
                  <strong className="block text-xs font-semibold leading-tight text-white">
                    Descanso concluído
                  </strong>
                  <span className="text-[11px] text-zinc-300 font-normal block truncate" aria-live="polite">
                    {overdueSeconds >= 5 ? `Há ${overdueLabel}` : 'Próxima série'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlerting(false)}
                className="px-4 py-2 bg-primary text-app text-xs font-semibold rounded-full hover:bg-zinc-200 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer shrink-0 min-h-[44px]"
              >
                Pronto
              </button>
            </div>
          </div>
        )}

        {/* Temporizador Ativo / Em Contagem */}
        {(isActive || timeLeft > 0) && (
          <div className="rounded-3xl border backdrop-blur-2xl bg-black/85 border-accent-hover/80 text-zinc-100 overflow-hidden animate-fadeIn">
            {/* Cabeçalho Compacto do Temporizador */}
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center touch-manipulation transition-[background-color,border-color,transform] duration-150 ease-out cursor-pointer select-none shrink-0 active:scale-[0.95] ${
                    isActive
                      ? 'bg-accent text-white border-accent-hover hover:bg-accent-strong'
                      : 'bg-white/[0.06] text-zinc-100 border-white/[0.1] hover:bg-white/[0.12]'
                  }`}
                  aria-label={isActive ? 'Pausar descanso' : 'Retomar descanso'}
                >
                  {isActive ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <div className="relative flex items-center justify-center shrink-0">
                  <svg width="36" height="36" viewBox="0 0 34 34" className="-rotate-90" aria-hidden="true">
                    <circle cx="17" cy="17" r={bigRingRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                    <circle
                      cx="17"
                      cy="17"
                      r={bigRingRadius}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={bigRingCircumference}
                      strokeDashoffset={bigRingCircumference * (1 - progressPercent / 100)}
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-zinc-400 block leading-none mb-1">
                    {isActive ? 'Descanso' : 'Em pausa'}
                  </span>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="font-display text-2xl font-bold tracking-[-0.02em] text-white tabular-nums">
                      {formatTime(timeLeft > 0 ? timeLeft : totalSeconds)}
                    </span>
                    <span className="text-[11px] text-zinc-500 tabular-nums font-display">
                      / {totalSeconds}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center gap-1 shrink-0">
                {isActive && (
                  <button
                    type="button"
                    onClick={() => addTime(15)}
                    className="px-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-100 text-xs font-semibold tabular-nums touch-manipulation active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out cursor-pointer min-h-[44px]"
                    title="+15 segundos"
                  >
                    +15s
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetTimer}
                  className="tap-44 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.95] transition-[color,background-color,transform] duration-150 ease-out cursor-pointer"
                  title="Parar e ocultar temporizador"
                  aria-label="Ocultar temporizador"
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="tap-44 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-[0.95] transition-[color,background-color,transform] duration-150 ease-out cursor-pointer"
                  aria-label={isExpanded ? 'Fechar tempos de descanso' : 'Tempos de descanso'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {/* Painel Desdobrável com Tempos Pré-Definidos */}
            {isExpanded && (
              <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-zinc-400">
                    Tempo de descanso
                  </span>
                  {isSpeechSupported() && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !restVoiceEnabled;
                        setRestVoiceEnabled(next);
                        saveRestVoiceCuesPreference(next);
                        if (next) unlockSpeechIOS();
                        triggerHaptic(8);
                      }}
                      aria-pressed={restVoiceEnabled}
                      className={`min-h-[36px] px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                        restVoiceEnabled
                          ? 'bg-accent/70 text-white border-accent-hover'
                          : 'bg-transparent text-zinc-400 border-white/[0.08] hover:text-zinc-200'
                      }`}
                    >
                      {restVoiceEnabled ? (
                        <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      ) : (
                        <VolumeX className="w-3.5 h-3.5" strokeWidth={1.75} />
                      )}
                      <span>Voz {restVoiceEnabled ? 'ativa' : 'desligada'}</span>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[30, 45, 60, 90, 120].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => selectPreset(sec)}
                      className={`min-h-[44px] px-1 rounded-full text-xs font-semibold tabular-nums touch-manipulation transition-colors cursor-pointer border ${
                        totalSeconds === sec
                          ? 'bg-accent text-white border-accent-hover'
                          : 'bg-transparent hover:bg-white/[0.06] text-zinc-300 border-white/[0.08]'
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

        {/* Estado Ocioso: Pílula discreta */}
        {!isActive && !isAlerting && timeLeft === 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleTimer}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-black/80 hover:bg-surface-2 text-zinc-200 hover:text-white border border-white/[0.1] backdrop-blur-xl text-xs font-semibold active:scale-[0.97] transition-[background-color,color,transform] duration-150 ease-out cursor-pointer select-none"
              title="Iniciar descanso"
            >
              <Play className="w-3 h-3 text-white fill-current" />
              <span>Descanso</span>
              <span className="font-display tabular-nums text-zinc-400 font-normal">{totalSeconds}s</span>
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
