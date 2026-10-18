import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Bell, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [soundOn, setSoundOn] = useState(true);

  const prevTriggerRef = useRef(autoStartTrigger);

  // Auto-início quando autoStartTrigger muda (ex: usuário marcou série concluída)
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

  // Contagem regressiva
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
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isAlerting ? 'animate-bounce-subtle' : ''
    }`}>
      {/* Alerta Visual de Fim de Descanso */}
      {isAlerting && (
        <div className="mx-auto max-w-md px-4 pb-2 animate-fadeIn">
          <div className="bg-black dark:bg-white text-white dark:text-black p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-zinc-700/60 dark:border-zinc-300">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-zinc-800 dark:bg-zinc-200 rounded-xl">
                <Bell className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <strong className="block text-sm font-black leading-tight">
                  Descanso Concluído! 🔔
                </strong>
                <span className="text-xs text-zinc-300 dark:text-zinc-600 font-medium">
                  Hora da próxima série. Foco na execução técnica.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAlerting(false)}
              className="px-3 py-1.5 bg-white dark:bg-black text-black dark:text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Iniciar
            </button>
          </div>
        </div>
      )}

      {/* Caixa do Temporizador */}
      <div className="max-w-md mx-auto px-3 pb-[max(env(safe-area-inset-bottom,0px),12px)]">
        <div className={`rounded-3xl border shadow-xl backdrop-blur-xl transition-all duration-300 ${
          isAlerting 
            ? 'bg-zinc-900 border-zinc-700 text-white shadow-2xl' 
            : isActive 
              ? 'bg-white/95 dark:bg-[#121215]/95 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white' 
              : 'bg-white/90 dark:bg-[#121215]/90 border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
        }`}>
          {/* Barra de Progresso Superior */}
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-3xl overflow-hidden">
            <div 
              className="h-full bg-black dark:bg-white transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cabeçalho Compacto do Timer */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão Play / Pause */}
              <button
                onClick={toggleTimer}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
                  <span className="text-[11px] font-bold tracking-wider uppercase opacity-75">
                    {isActive ? 'Recuperação...' : isAlerting ? 'Tempo Finalizado' : 'Descanso entre Séries'}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black tracking-tight">
                    {formatTime(timeLeft > 0 ? timeLeft : totalSeconds)}
                  </span>
                  <span className="text-xs opacity-60">
                    / {totalSeconds}s
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas no Modo Compacto */}
            <div className="flex items-center gap-1.5">
              {isActive && (
                <>
                  <button
                    onClick={() => addTime(15)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                    title="+15 segundos"
                  >
                    +15s
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all cursor-pointer"
                    title="Zerar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Botão de Expandir / Recolher Presets */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all cursor-pointer"
                aria-label="Opções do timer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Área Expandida com Presets e Controles */}
          {isExpanded && (
            <div className="px-4 pb-3 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Tempo de Descanso Recomendado:</span>
                <button
                  onClick={() => {
                    const next = sound.toggleSound();
                    setSoundOn(next);
                  }}
                  className="flex items-center gap-1 text-[11px] text-zinc-800 dark:text-zinc-200 font-bold hover:underline cursor-pointer"
                >
                  {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  {soundOn ? 'Sons ON' : 'Mudo'}
                </button>
              </div>

              {/* Botões de Presets rápidos */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30s', val: 30, desc: 'Rápido' },
                  { label: '45s', val: 45, desc: 'Braços' },
                  { label: '60s', val: 60, desc: 'Padrão' },
                  { label: '90s', val: 90, desc: 'Pernas/RDL' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => selectPreset(item.val)}
                    className={`py-2 px-1 rounded-2xl text-center border transition-all active:scale-95 cursor-pointer ${
                      totalSeconds === item.val
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-bold shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] opacity-70">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Botões de micro-ajustes */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addTime(-15)}
                    disabled={timeLeft <= 15}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 disabled:opacity-40 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Minus className="w-3 h-3" /> 15s
                  </button>
                  <button
                    onClick={() => addTime(15)}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 15s
                  </button>
                </div>
                <button
                  onClick={resetTimer}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold cursor-pointer"
                >
                  Resetar Timer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
