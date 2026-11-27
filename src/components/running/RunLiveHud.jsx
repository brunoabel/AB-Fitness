import React, { useState, memo, lazy, Suspense } from 'react';
import { AlertTriangle, Flame, Map as MapIcon, Navigation2, Pause, Play, Square, Timer, Volume2, VolumeX, Zap } from 'lucide-react';
import { formatDuration, formatPace } from '../../utils/runningService';
import { computeTargetProgress } from '../../utils/runGoals';
import { AUTO_PAUSE_PREF_KEY } from './runPrefs';
import { getVoiceCuesPreference, saveVoiceCuesPreference } from '../../utils/speech';
import { triggerHaptic } from '../../utils/audio';

const RunningMap = lazy(() => import('../RunningMap'));

/** HUD ao vivo: contraste solar para leitura em movimento e botões seguros ao toque. */
function RunLiveHudComponent({
  autoPauseEnabled,
  avgPaceSeconds,
  calories,
  coordinates,
  currentFix,
  currentPaceSeconds,
  distanceKm,
  elapsedSeconds,
  elevationGainM,
  ghostStatus,
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  if (sessionStatus !== 'running' && sessionStatus !== 'paused') return null;

  const targetProgress = computeTargetProgress(selectedTarget, distanceKm, elapsedSeconds);

  return (
    <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start pb-8">
      {/* Mapa em tempo real (sempre visível em desktop; alternável em mobile para proteger o polegar) */}
      <div className={`md:col-span-6 ${showMobileMap ? 'block' : 'hidden md:block'}`}>
        <div className="rounded-3xl overflow-hidden border border-white/[0.1]">
          <Suspense fallback={<div className="h-[320px] w-full bg-surface-2 animate-pulse" />}>
            <RunningMap
              coordinates={coordinates}
              splits={splits}
              currentPosition={currentFix}
              isLive={sessionStatus === 'running' || sessionStatus === 'paused'}
              isDark={isDark}
              height="320px"
            />
          </Suspense>
        </div>
      </div>

      {/* Painel Principal do Corredor */}
      <div className="md:col-span-6 space-y-5">
        {/* Topo de controlo rápido */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-semibold ${
              sessionStatus === 'running' && !isAutoPaused ? 'text-emerald-300' : 'text-white'
            }`}>
              {sessionStatus === 'paused' ? 'Em pausa' : isAutoPaused ? 'Pausa automática' : 'Em corrida'}
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
              className={`md:hidden min-h-[44px] px-3.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                showMobileMap
                  ? 'bg-accent text-white border-accent-hover'
                  : 'bg-transparent text-zinc-300 border-white/[0.1]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Mapa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                saveVoiceCuesPreference(next);
                triggerHaptic(8);
              }}
              className={`min-h-[44px] min-w-[44px] px-2.5 rounded-full border inline-flex items-center justify-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'bg-accent text-white border-accent-hover'
                  : 'bg-transparent text-zinc-400 border-white/[0.1]'
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
              className={`min-h-[44px] px-3.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                autoPauseEnabled
                  ? 'bg-accent/60 text-white border-accent-hover'
                  : 'bg-transparent text-zinc-500 border-white/[0.08]'
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
              <p className={`text-xs tabular-nums ${targetProgress.reached ? 'text-emerald-300 font-bold' : 'text-zinc-400'}`}>
                {targetProgress.reached
                  ? `Objetivo ${targetProgress.targetLabel} cumprido`
                  : `${targetProgress.currentLabel} / ${targetProgress.targetLabel}`}
              </p>
            </div>
          )}

          {ghostStatus && (
            <div className="pt-1 flex justify-center">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border tabular-nums ${
                  ghostStatus.status === 'ahead'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : ghostStatus.status === 'behind'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-white/[0.06] border-white/[0.12] text-zinc-200'
                }`}
              >
                <span className="font-semibold tracking-tight">{ghostStatus.label}</span>
                <span className="text-white/30" aria-hidden>·</span>
                <span className="font-bold">{ghostStatus.statusText}</span>
                <span className="text-[11px] opacity-75">({ghostStatus.ghostPaceFormatted})</span>
              </div>
            </div>
          )}
        </div>

        {/* Grelha aberta 2×2 sobre preto puro OLED (sem cartões empilhados) */}
        <div className="grid grid-cols-2 border-y border-white/[0.08] divide-y divide-white/[0.06]">
          <div className="py-4 pr-4 border-r border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Zap className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
              <span>Ritmo</span>
            </div>
            <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-white tabular-nums block">
              {sessionStatus === 'paused' || isAutoPaused
                ? (livePaceSeconds > 0 ? formatPace(livePaceSeconds) : '--:--')
                : formatPace(currentPaceSeconds || avgPaceSeconds)}
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5 font-display tabular-nums">
              Médio {formatPace(avgPaceSeconds)}
            </span>
          </div>

          <div className="py-4 pl-4">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Timer className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
              <span>Tempo</span>
            </div>
            <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-white tabular-nums block">
              {formatDuration(elapsedSeconds)}
            </span>
            <span className="text-[11px] text-zinc-400 block mt-0.5 font-display tabular-nums">
              {speedKmh} <span className="text-zinc-500">km/h</span>
            </span>
          </div>

          <div className="py-4 pr-4 border-r border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Flame className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
              <span>Calorias</span>
            </div>
            <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-white tabular-nums">
              {calories} <span className="text-xs font-medium text-zinc-400">kcal</span>
            </span>
          </div>

          <div className="py-4 pl-4">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
              <Navigation2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Subida</span>
            </div>
            <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-white tabular-nums">
              +{elevationGainM} <span className="text-xs font-medium text-zinc-400">m</span>
            </span>
          </div>
        </div>

        {/* Parciais por km */}
        {splits.length > 0 && (() => {
          const minSec = Math.min(...splits.map((s) => Number(s.durationSeconds) || 999999));
          const maxSec = Math.max(...splits.map((s) => Number(s.durationSeconds) || 1));
          return (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 block">
                Parciais por km
              </span>
              <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] max-h-36 overflow-y-auto pr-1">
                {splits.map((s) => {
                  const isFastest = (Number(s.durationSeconds) || 0) === minSec && splits.length > 1;
                  const barPct = maxSec > 0 ? Math.max(15, Math.min(100, (minSec / (Number(s.durationSeconds) || minSec)) * 100)) : 100;
                  return (
                    <div
                      key={s.km}
                      className="relative overflow-hidden py-2 px-2 text-xs tabular-nums"
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 pointer-events-none ${isFastest ? 'bg-emerald-400/15' : 'bg-accent/30'}`}
                        style={{ width: `${barPct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">KM {s.km}</span>
                          {isFastest && (
                            <span className="text-[11px] font-sans font-semibold text-emerald-300">Mais rápido</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-white">{s.paceStr || s.pace}</span>
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

        {/* Controlos principais táteis */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center gap-3">
            {sessionStatus === 'running' ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmFinish(false);
                  handlePause();
                }}
                className="flex-1 min-h-[56px] px-5 rounded-full bg-accent/60 hover:bg-accent text-white border border-accent-hover font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
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
                  className="flex-1 min-h-[56px] px-5 rounded-full bg-primary hover:bg-zinc-200 text-app font-semibold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
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
                  className={`min-h-[56px] px-6 rounded-full font-semibold text-base border flex items-center justify-center gap-2 active:scale-[0.98] transition-[background-color,border-color,transform] duration-150 ease-out cursor-pointer ${
                    confirmFinish
                      ? 'bg-red-500 hover:bg-red-400 border-red-400 text-white'
                      : 'bg-transparent hover:bg-red-500/20 border-white/[0.14] hover:border-red-400/50 text-white'
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
                if (!confirmDiscard) {
                  triggerHaptic(10);
                  setConfirmDiscard(true);
                  return;
                }
                setConfirmDiscard(false);
                setConfirmFinish(false);
                handleResetSession();
              }}
              className={`w-full py-2 text-center text-xs font-medium transition-colors cursor-pointer ${
                confirmDiscard ? 'text-rose-400 font-bold' : 'text-zinc-500 hover:text-rose-400'
              }`}
            >
              {confirmDiscard ? 'Toca novamente para descartar a corrida' : 'Descartar treino'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const RunLiveHud = memo(RunLiveHudComponent);
export default RunLiveHud;
