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

  // Auto-início quando autoStartTrigger muda (ex: utilizador marcou uma série como concluída)
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
    } else {
      setIsActive(!isActive);
    }
    triggerHaptic(15);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Cálculo da porcentagem da barra de progresso
  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, ((totalSeconds - timeLeft) / totalSeconds) * 100))
    : 0;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isAlerting ? 'animate-bounce-subtle' : ''
    }`}>
      {/* Alerta Visual de Fim de Descanso */}
      {isAlerting && (
        <div className="mx-auto max-w-md px-4 pb-2 animate-fadeIn">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between border-2 border-white/50 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-white/20 rounded-xl animate-pulse">
                <Bell className="w-5 h-5 text-white" />
              </span>
              <div>
                <strong className="block text-sm font-black leading-tight">
                  Descanso Concluído! 🔔
                </strong>
                <span className="text-xs text-sky-100 font-medium">
                  Hora da próxima série, monstro! Vai pra cima.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsAlerting(false)}
              className="px-3 py-1.5 bg-white text-sky-600 text-xs font-black rounded-xl shadow-sm hover:bg-sky-50 active:scale-95 transition-all"
            >
              Iniciar
            </button>
          </div>
        </div>
      )}

      {/* Caixa do Temporizador */}
      <div className="max-w-md mx-auto px-3 pb-3">
        <div className={`rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-300 ${
          isAlerting 
            ? 'bg-sky-500/95 border-sky-300 text-white shadow-sky-400/40' 
            : isActive 
              ? 'bg-white/95 dark:bg-slate-900/95 border-sky-300 dark:border-sky-500/50 shadow-sky-400/20 text-slate-800 dark:text-white' 
              : 'bg-white/90 dark:bg-slate-900/90 border-sky-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}>
          {/* Barra de Progresso Superior */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-t-3xl overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                isAlerting 
                  ? 'bg-white' 
                  : 'bg-gradient-to-r from-sky-400 to-sky-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Cabeçalho Compacto do Timer (sempre visível) */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão Play / Pause */}
              <button
                onClick={toggleTimer}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                  isAlerting
                    ? 'bg-white text-sky-600'
                    : isActive
                      ? 'bg-sky-500 text-white shadow-sky-400/30'
                      : 'bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 hover:bg-sky-200'
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
                    {isActive ? 'Recuperando Fôlego...' : isAlerting ? 'Tempo Zerado' : 'Descanso entre Séries'}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
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
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold active:scale-95 transition-all"
                    title="+15 segundos"
                  >
                    +15s
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
                    title="Zerar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Botão de Expandir / Recolher Presets */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-all"
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
            <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300">Tempo de Descanso Recomendado:</span>
                <button
                  onClick={() => {
                    const next = sound.toggleSound();
                    setSoundOn(next);
                  }}
                  className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-bold hover:underline"
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
                  { label: '90s', val: 90, desc: 'Búlgaro/RDL' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => selectPreset(item.val)}
                    className={`py-2 px-1 rounded-2xl text-center border transition-all active:scale-95 ${
                      totalSeconds === item.val
                        ? 'bg-sky-500 text-white border-sky-500 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-black">{item.label}</div>
                    <div className="text-[10px] opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>

              {/* Botões de micro-ajustes */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addTime(-15)}
                    disabled={timeLeft <= 15}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold"
                  >
                    <Minus className="w-3 h-3" /> 15s
                  </button>
                  <button
                    onClick={() => addTime(15)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" /> 15s
                  </button>
                </div>
                <button
                  onClick={resetTimer}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
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
