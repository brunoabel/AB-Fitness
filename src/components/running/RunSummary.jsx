import React from 'react';
import { Award, Download, RotateCcw, Share2 } from 'lucide-react';
import { downloadGPX, formatDuration } from '../../utils/runningService';
import { evaluateRunAchievements, formatRunRelativeDate, getRunTargetById } from '../../utils/runGoals';
import RunningMap from '../RunningMap';
import { triggerHaptic } from '../../utils/audio';

/** Resumo pós-corrida estilo Nike Run Club / Strava: mapa-herói, zero caixas redundantes, partilha em 1 toque. */
export default function RunSummary({
  handleResetSession,
  isDark,
  lastCompletedRun,
  runsHistory,
  sessionStatus,
  setSelectedRunForShare
}) {
  if (sessionStatus !== 'completed' || !lastCompletedRun) return null;

  const target = getRunTargetById(lastCompletedRun.targetId);
  const achievement = evaluateRunAchievements(lastCompletedRun, runsHistory, target);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Mapa do Percurso em Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-xl">
        <RunningMap
          coordinates={lastCompletedRun.coordinates}
          splits={lastCompletedRun.splits}
          isLive={false}
          isDark={isDark}
          height="280px"
        />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/[0.1] text-xs font-semibold text-white">
          Corrida concluída · {formatRunRelativeDate(lastCompletedRun.date || lastCompletedRun.timestamp)}
        </div>
      </div>

      {/* Conquista + Distância Herói sobre OLED preto */}
      <div className="space-y-2">
        {achievement.badgeLabel && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            {achievement.badgeLabel}
          </span>
        )}

        <div className="flex items-baseline gap-2">
          <span className="font-display font-black text-5xl sm:text-6xl tracking-tight text-white tabular-nums">
            {Number(lastCompletedRun.distanceKm).toFixed(2)}
          </span>
          <span className="text-xl font-bold text-zinc-400">km</span>
        </div>
      </div>

      {/* Métricas em texto corrido tabular (sem caixas aninhadas) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-6 py-4 border-y border-white/[0.08]">
        <div>
          <span className="text-xs text-zinc-400 block">Ritmo médio</span>
          <span className="text-xl font-black text-white font-mono tabular-nums mt-0.5 block">
            {lastCompletedRun.avgPace}
          </span>
        </div>

        <div>
          <span className="text-xs text-zinc-400 block">Tempo</span>
          <span className="text-xl font-black text-white font-mono tabular-nums mt-0.5 block">
            {formatDuration(lastCompletedRun.durationSeconds)}
          </span>
        </div>

        <div>
          <span className="text-xs text-zinc-400 block">Calorias</span>
          <span className="text-xl font-black text-white font-mono tabular-nums mt-0.5 block">
            {lastCompletedRun.calories} <span className="text-xs font-normal text-zinc-500 font-sans">kcal</span>
          </span>
        </div>

        <div>
          <span className="text-xs text-zinc-400 block">Velocidade</span>
          <span className="text-xl font-black text-white font-mono tabular-nums mt-0.5 block">
            {lastCompletedRun.avgSpeedKmh} <span className="text-xs font-normal text-zinc-500 font-sans">km/h</span>
          </span>
        </div>

        {Boolean(lastCompletedRun.vo2Max) && (
          <div className="col-span-2 sm:col-span-4 pt-3 border-t border-white/[0.06] flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Capacidade aeróbica estimada (VO2 Max)</span>
            <span className="text-base font-black text-white font-mono tabular-nums">
              {lastCompletedRun.vo2Max} <span className="text-xs font-normal text-zinc-500 font-sans">ml/kg/min</span>
            </span>
          </div>
        )}
      </div>

      {/* Parciais por km (lista limpa) */}
      {lastCompletedRun.splits && lastCompletedRun.splits.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 block">
            Parciais por km
          </span>
          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] max-h-44 overflow-y-auto">
            {lastCompletedRun.splits.map((s) => (
              <div
                key={s.km}
                className="flex items-center justify-between text-xs py-2.5 font-mono tabular-nums"
              >
                <span className="font-bold text-white">KM {s.km}</span>
                <span className="text-zinc-200">{s.pace || s.paceStr}</span>
                <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações finais */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => {
            setSelectedRunForShare(lastCompletedRun);
            triggerHaptic(15);
          }}
          className="w-full min-h-[54px] px-5 rounded-full bg-white text-black hover:bg-zinc-100 font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg"
        >
          <Share2 className="w-4 h-4" />
          <span>Partilhar Corrida</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleResetSession}
            className="min-h-[48px] px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
            <span>Nova Corrida</span>
          </button>

          {lastCompletedRun.coordinates && lastCompletedRun.coordinates.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                downloadGPX(lastCompletedRun.coordinates, `corrida_${lastCompletedRun.date?.split('T')[0] || 'ab_fitness'}`);
              }}
              className="min-h-[48px] px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar GPX</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetSession}
              className="min-h-[48px] px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-semibold text-sm cursor-pointer"
            >
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
