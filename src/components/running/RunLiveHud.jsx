import React from 'react';
import { AlertTriangle, Flame, Navigation2, Pause, Play, Square, Timer, Zap } from 'lucide-react';
import { formatDuration, formatPace } from '../../utils/runningService';
import { AUTO_PAUSE_PREF_KEY } from './runPrefs';
import RunningMap from '../RunningMap';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningHub.jsx (estado e handlers recebidos por props). */
export default function RunLiveHud({ isDark, autoPauseEnabled, avgPaceSeconds, calories, coordinates, currentFix, currentPaceSeconds, distanceKm, elapsedSeconds, elevationGainM, gpsError, gpsErrorCode, handleFinishRun, handlePause, handleResetSession, handleResume, isAutoPaused, isAutoPausedRef, isSimulation, livePaceSeconds, sessionStatus, setAutoPauseEnabled, signalBadge, speedKmh, splits }) {
  return (
    <>
      {/* 3. MODO AO VIVO (HUD DE CORRIDA ATIVA OU PAUSADA) */}
      {(sessionStatus === 'running' || sessionStatus === 'paused') && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">

          {/* Mapa em Tempo Real (mantém o trajeto e corredor ativos mesmo em pausa) */}
          <div className="md:col-span-6 rounded-2xl overflow-hidden border border-white/10 shadow-sm">
            <RunningMap 
              coordinates={coordinates} 
              splits={splits}
              currentPosition={currentFix}
              isLive={sessionStatus === 'running' || sessionStatus === 'paused'} 
              isDark={isDark} 
              height="340px" 
            />
          </div>

          {/* Painel Principal de Métricas */}
          <div className="md:col-span-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-white shadow-xl relative overflow-hidden">
            {/* Status do GPS e Auto-Pause no topo */}
            <div className="flex items-center justify-between mb-3 text-[11px] gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${signalBadge.color} animate-pulse`} />
                <span className={`font-bold truncate ${signalBadge.text}`}>
                  {signalBadge.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const next = !autoPauseEnabled;
                    setAutoPauseEnabled(next);
                    if (!next && isAutoPausedRef.current) {
                      handleResume();
                    }
                    try { localStorage.setItem(AUTO_PAUSE_PREF_KEY, String(next)); } catch {}
                    triggerHaptic(8);
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] border transition-colors cursor-pointer ${
                    autoPauseEnabled
                      ? 'bg-accent/70 text-white border-accent-hover'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title="Pausar automaticamente quando parado em semáforos"
                >
                  Auto-Pause: {autoPauseEnabled ? 'ON' : 'OFF'}
                </button>

                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wider ${
                  sessionStatus === 'running' && !isAutoPaused
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {sessionStatus === 'paused'
                    ? 'PAUSADO'
                    : isAutoPaused
                      ? 'AUTO-PAUSE'
                      : 'EM CORRIDA'}
                </span>
              </div>
            </div>

            {/* Alerta de Erro de Permissão / Localização Aproximada durante a corrida */}
            {gpsError && !isSimulation && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{gpsError}</p>
                  {(gpsErrorCode === 'DENIED' || gpsErrorCode === 'COARSE') && (
                    <p className="text-[11px] text-rose-300/80">
                      iOS: Definições &gt; Privacidade &gt; Serviços de Localização &gt; Safari (ativar Localização Precisa). Android: Cadeado na barra de endereço &gt; Permissões &gt; Localização.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Distância Gigante de Alta Visibilidade */}
            <div className="text-center py-2 bg-black/40 rounded-xl border border-zinc-800/60 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                Distância Percorrida
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-6xl font-black tracking-tighter text-white font-mono tabular-nums">
                  {distanceKm.toFixed(2)}
                </span>
                <span className="text-xl font-black text-white font-sans">
                  KM
                </span>
              </div>
            </div>

            {/* Grid 4 Métricas Técnicas */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Ritmo / Pace</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {sessionStatus === 'paused' || isAutoPaused
                    ? (livePaceSeconds > 0 ? formatPace(livePaceSeconds) : "--:--")
                    : formatPace(currentPaceSeconds || avgPaceSeconds)}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused' || isAutoPaused
                    ? 'Pausado (Pace Médio)'
                    : `Médio: ${formatPace(avgPaceSeconds)}`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Timer className="w-3.5 h-3.5 text-white" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Tempo</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused'
                    ? 'Treino Pausado'
                    : isAutoPaused
                      ? 'Auto-Pause (Parado)'
                      : `Velocidade: ${speedKmh} km/h`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Calorias</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Elevação</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  +{elevationGainM} <span className="text-xs font-normal text-zinc-400 font-sans">m</span>
                </span>
              </div>
            </div>

            {/* Splits / Parciais por KM com Barras Proporcionais e Destaque da Mais Rápida */}
            {splits.length > 0 && (() => {
              const minSec = Math.min(...splits.map((s) => Number(s.durationSeconds) || 999999));
              const maxSec = Math.max(...splits.map((s) => Number(s.durationSeconds) || 1));
              return (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Parciais por KM (Splits Interpolados)
                    </span>
                    <span className="text-[11px] text-white font-semibold">
                      Ritmo Proporcional
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {splits.map((s) => {
                      const isFastest = (Number(s.durationSeconds) || 0) === minSec && splits.length > 1;
                      const barPct = maxSec > 0 ? Math.max(15, Math.min(100, (minSec / (Number(s.durationSeconds) || minSec)) * 100)) : 100;
                      return (
                        <div 
                          key={s.km}
                          className={`relative overflow-hidden py-1.5 px-3 rounded-lg border text-xs font-mono tabular-nums transition-colors ${
                            isFastest
                              ? 'bg-accent/70 border-accent-hover text-white'
                              : 'bg-black/40 border-zinc-800/80 text-zinc-200'
                          }`}
                        >
                          <div 
                            className={`absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none ${
                              isFastest ? 'bg-accent' : 'bg-accent'
                            }`}
                            style={{ width: `${barPct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${isFastest ? 'text-white' : 'text-white'}`}>
                                KM {s.km}
                              </span>
                              {isFastest && (
                                <span className="text-[11px] px-1.5 py-0.2 rounded bg-accent/70 text-white font-bold uppercase tracking-tighter">
                                  Mais rápido
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold">{s.paceStr || s.pace}</span>
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

            {/* Controles Principais de Corrida */}
            <div className="mt-5 pt-3 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-3">
                {sessionStatus === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSAR</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>RETOMAR</span>
                  </button>
                )}

                <button
                  onClick={handleFinishRun}
                  className="min-h-[48px] py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>CONCLUIR</span>
                </button>
              </div>

              {sessionStatus === 'paused' && (
                <button
                  onClick={() => {
                    if (window.confirm('Deseja descartar este treino? Os dados da sessão atual serão cancelados.')) {
                      handleResetSession();
                    }
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Descartar e Cancelar Treino
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
