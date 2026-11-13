import React, { useState } from 'react';
import { AlertTriangle, Flame, Map as MapIcon, Navigation2, Pause, Play, Square, Timer, Volume2, VolumeX, Zap } from 'lucide-react';
import { formatDuration, formatPace } from '../../utils/runningService';
import { computeTargetProgress } from '../../utils/runGoals';
import { AUTO_PAUSE_PREF_KEY } from './runPrefs';
import { getVoiceCuesPreference, saveVoiceCuesPreference } from '../../utils/speech';
import RunningMap from '../RunningMap';
import { triggerHaptic } from '../../utils/audio';

/** HUD ao vivo: contraste solar para leitura em movimento e botões seguros ao toque. */
export default function RunLiveHud({
  autoPauseEnabled,
  avgPaceSeconds,
  calories,
  coordinates,
  currentFix,
  currentPaceSeconds,
  distanceKm,
  elapsedSeconds,
  elevationGainM,
  gpsError,
  gpsErrorCode,
  handleFinishRun,
  handlePause,
  handleResetSession,
  handleResume,
  isAutoPaused,
  isAutoPausedRef,
  isDark,
  isSimulation,
  livePaceSeconds,
  selectedTarget,
  sessionStatus,
  setAutoPauseEnabled,
  signalBadge,
  speedKmh,
  splits
}) {
  const [voiceEnabled, setVoiceEnabled] = useState(getVoiceCuesPreference);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);

  if (sessionStatus !== 'running' && sessionStatus !== 'paused') return null;

  const targetProgress = computeTargetProgress(selectedTarget, distanceKm, elapsedSeconds);

  return (
    <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start pb-8">
      {/* Mapa em tempo real (sempre visível em desktop; alternável em mobile para proteger o polegar) */}
      <div className={`md:col-span-6 ${showMobileMap ? 'block' : 'hidden md:block'}`}>
        <div className="rounded-3xl overflow-hidden border border-white/[0.1] shadow-lg">
          <RunningMap
            coordinates={coordinates}
            splits={splits}
            currentPosition={currentFix}
            isLive={sessionStatus === 'running' || sessionStatus === 'paused'}
            isDark={isDark}
            height="320px"
          />
        </div>
      </div>

      {/* Painel Principal do Corredor */}
      <div className="md:col-span-6 space-y-5">
        {/* Topo de controlo rápido */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              sessionStatus === 'running' && !isAutoPaused
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {sessionStatus === 'paused' ? 'Pausado' : isAutoPaused ? 'Auto-Pausa' : 'Em corrida'}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${signalBadge.color}`} />
              <span className="truncate">{signalBadge.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setShowMobileMap((v) => !v);
              }}
              className={`md:hidden min-h-[38px] px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showMobileMap
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.05] text-zinc-300 border-white/[0.08]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{showMobileMap ? 'Mapa' : 'Mapa'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                saveVoiceCuesPreference(next);
                triggerHaptic(8);
              }}
              className={`min-h-[38px] min-w-[38px] px-2.5 rounded-full border inline-flex items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.05] text-zinc-400 border-white/[0.08]'
              }`}
              title="Voz nos fones"
              aria-label="Alternar voz nos fones"
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !autoPauseEnabled;
                setAutoPauseEnabled(next);
                if (!next && isAutoPausedRef.current) {
                  handleResume();
                }
                try { localStorage.setItem(AUTO_PAUSE_PREF_KEY, String(next)); } catch {}
                triggerHaptic(8);
              }}
              className={`min-h-[38px] px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                autoPauseEnabled
                  ? 'bg-white/[0.12] text-white border-white/25'
                  : 'bg-white/[0.04] text-zinc-500 border-white/[0.08]'
              }`}
              title="Pausar automaticamente ao parar"
            >
              Auto-Pausa
            </button>
          </div>
        </div>

        {/* Alerta humano em caso de bloqueio GPS */}
        {gpsError && !isSimulation && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{gpsError}</p>
              {(gpsErrorCode === 'DENIED' || gpsErrorCode === 'COARSE') && (
                <p className="text-rose-200/80">
                  Ativa a &ldquo;Localização Precisa&rdquo; nas definições do navegador.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Distância Herói diretamente em destaque */}
        <div className="py-3 text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block">
            Distância
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-display font-bold text-6xl sm:text-7xl tracking-[-0.03em] text-white tabular-nums">
              {distanceKm.toFixed(2)}
            </span>
            <span className="text-xl font-medium text-zinc-400">km</span>
          </div>

          {targetProgress && (
            <div className="max-w-xs mx-auto pt-1 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-white/[0.1] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    targetProgress.reached ? 'bg-emerald-400' : 'bg-white'
                  }`}
                  style={{ width: `${Math.max(4, targetProgress.pct)}%` }}
                />
              </div>
              <p className={`text-xs font-mono tabular-nums ${targetProgress.reached ? 'text-emerald-300 font-bold' : 'text-zinc-400'}`}>
                {targetProgress.reached
                  ? `Objetivo ${targetProgress.targetLabel} cumprido`
                  : `${targetProgress.currentLabel} / ${targetProgress.targetLabel}`}
              </p>
            </div>
          )}
        </div>

        {/* 4 Métricas de leitura imediata ao correr (ergonomia de HUD desportivo) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] border border-white/[0.07] p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Ritmo</span>
            </div>
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white tabular-nums block">
              {sessionStatus === 'paused' || isAutoPaused
                ? (livePaceSeconds > 0 ? formatPace(livePaceSeconds) : '--:--')
                : formatPace(currentPaceSeconds || avgPaceSeconds)}
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5 font-display tabular-nums">
              Médio {formatPace(avgPaceSeconds)}
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Timer className="w-3.5 h-3.5 text-white" />
              <span>Tempo</span>
            </div>
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white tabular-nums block">
              {formatDuration(elapsedSeconds)}
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5 font-display tabular-nums">
              {speedKmh} <span className="text-zinc-500">km/h</span>
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Calorias</span>
            </div>
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white tabular-nums">
              {calories} <span className="text-xs font-medium text-zinc-400">kcal</span>
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] p-4 rounded-2xl">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subida</span>
            </div>
            <span className="font-display text-2xl font-semibold tracking-[-0.02em] text-white tabular-nums">
              +{elevationGainM} <span className="text-xs font-medium text-zinc-400">m</span>
            </span>
          </div>
        </div>

        {/* Parciais por km (limpo, sem texto técnico) */}
        {splits.length > 0 && (() => {
          const minSec = Math.min(...splits.map((s) => Number(s.durationSeconds) || 999999));
          const maxSec = Math.max(...splits.map((s) => Number(s.durationSeconds) || 1));
          return (
            <div className="pt-2 space-y-2 border-t border-white/[0.08]">
              <span className="text-xs font-semibold text-zinc-400 block">
                Parciais por km
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {splits.map((s) => {
                  const isFastest = (Number(s.durationSeconds) || 0) === minSec && splits.length > 1;
                  const barPct = maxSec > 0 ? Math.max(15, Math.min(100, (minSec / (Number(s.durationSeconds) || minSec)) * 100)) : 100;
                  return (
                    <div
                      key={s.km}
                      className="relative overflow-hidden py-1.5 px-3 rounded-xl bg-white/[0.03] text-xs font-mono tabular-nums"
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 pointer-events-none ${isFastest ? 'bg-emerald-400/20' : 'bg-white/[0.06]'}`}
                        style={{ width: `${barPct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">KM {s.km}</span>
                          {isFastest && (
                            <span className="text-[10px] font-sans font-bold text-emerald-300">Mais rápido</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white">{s.paceStr || s.pace}</span>
                          <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Controlos principais táteis (min-h 56px, anti-toque acidental no Fim) */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center gap-3">
            {sessionStatus === 'running' ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmFinish(false);
                  handlePause();
                }}
                className="flex-1 min-h-[56px] px-5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>Pausar</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmFinish(false);
                    handleResume();
                  }}
                  className="flex-1 min-h-[56px] px-5 rounded-full bg-white hover:bg-zinc-100 text-black font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Retomar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!confirmFinish) {
                      triggerHaptic(12);
                      setConfirmFinish(true);
                      return;
                    }
                    setConfirmFinish(false);
                    handleFinishRun();
                  }}
                  className={`min-h-[56px] px-6 rounded-full font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer ${
                    confirmFinish
                      ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_8px_24px_rgba(244,63,94,0.35)]'
                      : 'bg-white/[0.08] hover:bg-rose-600 text-white'
                  }`}
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>{confirmFinish ? 'Confirmar fim' : 'Terminar'}</span>
                </button>
              </>
            )}
          </div>

          {sessionStatus === 'paused' && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Descartar esta corrida?')) {
                  setConfirmFinish(false);
                  handleResetSession();
                }
              }}
              className="w-full py-2 text-center text-xs font-medium text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Descartar treino
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
