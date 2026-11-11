import React from 'react';
import { CheckCircle2, Download, Flag, Flame, Navigation2, RotateCcw, Satellite, Share2, Timer, Trophy, Zap } from 'lucide-react';
import { downloadGPX, formatDuration } from '../../utils/runningService';
import RunningMap from '../RunningMap';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningHub.jsx (estado e handlers recebidos por props). */
export default function RunSummary({ isDark, handleResetSession, lastCompletedRun, sessionStatus, setSelectedRunForShare }) {
  return (
    <>
      {/* 4. TELA DE PÓS-CORRIDA / RESUMO CELEBRATÓRIO (COMPLETED) */}
      {sessionStatus === 'completed' && lastCompletedRun && (
        <div className="space-y-4 animate-fadeIn pb-12">
          {/* Header de Celebração */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TREINO CONCLUÍDO • RUNNING CLUB
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Excelente Corrida, Atleta!
                </h2>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              O seu percurso suavizado, ritmo médio e parciais foram guardados com sucesso no seu perfil do Running Club.
            </p>

            {/* Ações Rápidas no Topo */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRunForShare(lastCompletedRun);
                  triggerHaptic(15);
                }}
                className="w-full sm:flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>PARTILHAR CARTÃO (INSTAGRAM)</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  downloadGPX(lastCompletedRun.coordinates, `corrida_${lastCompletedRun.date?.split('T')[0] || 'ab_fitness'}`);
                }}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                title="Descarregar ficheiro GPX compatível com Strava e Garmin"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Exportar GPX</span>
              </button>

              <button
                onClick={handleResetSession}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span>Nova Corrida</span>
              </button>
            </div>
          </div>

          {/* Grid de Mapa e Estatísticas */}
          <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
            {/* Mapa do Percurso Percorrido */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Trajeto Oficial do Treino
                </span>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="flex items-center gap-1"><Satellite className="w-3 h-3 text-white" /> Satélite HD</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-emerald-400" /> Chegada</span>
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
                <RunningMap 
                  coordinates={lastCompletedRun.coordinates} 
                  splits={lastCompletedRun.splits}
                  isLive={false} 
                  isDark={isDark} 
                  height="300px" 
                />
              </div>
            </div>

            {/* Painel de Estatísticas Finais */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl space-y-4">
              {/* Distância Gigante */}
              <div className="text-center py-3 bg-black/40 rounded-xl border border-zinc-800/60">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                  Distância Total
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white font-mono tabular-nums">
                    {Number(lastCompletedRun.distanceKm).toFixed(2)}
                  </span>
                  <span className="text-lg font-black text-white font-sans">
                    KM
                  </span>
                </div>
              </div>

              {/* Grid 4 Métricas */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span>Ritmo Médio</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgPace}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Ritmo geral</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Timer className="w-3.5 h-3.5 text-white" />
                    <span>Tempo Total</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {formatDuration(lastCompletedRun.durationSeconds)}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Tempo decorrido</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Calorias</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Energia queimada</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Velocidade</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgSpeedKmh} <span className="text-xs font-normal text-zinc-400 font-sans">km/h</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Média horária</span>
                </div>
              </div>

              {/* Splits / KM a KM */}
              {lastCompletedRun.splits && lastCompletedRun.splits.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Parciais por KM (Splits Registados)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {lastCompletedRun.splits.map((s) => (
                      <div 
                        key={s.km}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800/60 font-mono tabular-nums"
                      >
                        <span className="font-bold text-white">KM {s.km}</span>
                        <span className="text-zinc-200">{s.pace || s.paceStr}</span>
                        <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
