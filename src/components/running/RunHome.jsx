import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, MoreHorizontal, Play, Share2, Trash2 } from 'lucide-react';
import { downloadGPX, formatDuration } from '../../utils/runningService';
import {
  RUN_TARGETS,
  computeWeeklyRunProgress,
  formatRunRelativeDate,
  getNextWeeklyGoal,
  recommendRunSessionType
} from '../../utils/runGoals';
import { triggerHaptic } from '../../utils/audio';
import useMuscleRecovery from '../../hooks/useMuscleRecovery';
import { getLocalCustomPlan } from '../../services/workoutService';
import { WEEKLY_SCHEDULE } from '../../data/workouts';
import { exerciseTargetsRegion } from '../../data/muscleRegions';

/** Ecrã inicial de Corrida: progresso semanal editorial, objetivo em 1 toque, arranque limpo e histórico sem caixas. */
export default function RunHome({
  gpsError,
  handleDeleteRun,
  handleRequestStartRun,
  isSimulation,
  permissionState,
  runsHistory,
  selectedTarget,
  sessionStatus,
  setIsSimulation,
  setSelectedRunForShare,
  setSelectedTarget,
  setSimulationMode,
  setWeeklyGoalKm,
  simulationMode,
  totalKmsAccumulated,
  weeklyGoalKm
}) {
  const [openMenuRunId, setOpenMenuRunId] = useState(null);
  const [confirmDeleteRunId, setConfirmDeleteRunId] = useState(null);
  const recovery = useMuscleRecovery();

  const hybridRunSuggestion = useMemo(() => {
    const legIds = ['quadriceps', 'posteriores', 'gemeos'];
    const legFatiguePct = legIds.reduce(
      (max, id) => Math.max(max, Number(recovery.muscles?.[id]?.fatigue) || 0),
      0
    );
    const schedule = getLocalCustomPlan() || WEEKLY_SCHEDULE;
    const todayPlan = schedule.find((d) => d.dayId === new Date().getDay());
    const exercises = Array.isArray(todayPlan?.exercises) ? todayPlan.exercises : [];
    const isLegDayToday = !todayPlan?.isRestDay && exercises.some((ex) =>
      legIds.some((id) => exerciseTargetsRegion(ex, id))
    );
    return {
      ...recommendRunSessionType({ legFatiguePct, isLegDayToday }),
      legFatiguePct: Math.round(legFatiguePct),
      isLegDayToday
    };
  }, [recovery.muscles]);

  if (sessionStatus !== 'idle') return null;

  const weekly = computeWeeklyRunProgress(runsHistory, weeklyGoalKm);

  return (
    <div className="space-y-8 pb-6">
      {/* 1. Progresso Semanal Editorial (diretamente no OLED preto, sem caixa SaaS) */}
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-zinc-400 block">
              Esta semana
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display font-bold text-4xl sm:text-5xl text-white tabular-nums tracking-[-0.03em]">
                {weekly.weekKm.toFixed(1)}
              </span>
              <span className="text-base font-medium text-zinc-400">
                km
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = getNextWeeklyGoal(weekly.goalKm);
              setWeeklyGoalKm(next);
              triggerHaptic(8);
            }}
            className="min-h-[38px] px-3.5 py-1.5 rounded-full bg-transparent border border-white/[0.1] hover:border-white/[0.2] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer shrink-0 tabular-nums"
            title="Tocar para ajustar a tua meta semanal"
          >
            Meta: {weekly.goalKm} km
          </button>
        </div>

        {/* Barra de progresso fina */}
        <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              weekly.goalReached ? 'bg-emerald-400' : 'bg-white'
            }`}
            style={{ width: `${Math.max(weekly.weekKm > 0 ? 4 : 0, weekly.pct)}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className={weekly.goalReached ? 'text-emerald-300 font-medium' : 'text-zinc-400'}>
            {weekly.motivationLine}
          </p>
          {totalKmsAccumulated > 0 && (
            <span className="text-zinc-500 tabular-nums">
              Total: {totalKmsAccumulated.toFixed(0)} km · {runsHistory.length} {runsHistory.length === 1 ? 'corrida' : 'corridas'}
            </span>
          )}
        </div>

        {/* Sugestão Híbrida (Força + Corrida sem conflito) */}
        {!recovery.loading && (
          <div className="pl-3 py-1 border-l-2 border-accent-hover space-y-0.5">
            <p className="text-[12px] font-semibold text-white">
              Sugestão híbrida hoje: {hybridRunSuggestion.label}
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {hybridRunSuggestion.desc}
            </p>
          </div>
        )}
      </div>

      {/* 2. Seletor de Objetivo + Botão Herói de Arranque */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar" role="radiogroup" aria-label="Objetivo da corrida">
          {RUN_TARGETS.map((t) => {
            const active = (selectedTarget?.id || 'free') === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  triggerHaptic(8);
                  setSelectedTarget(t);
                }}
                className={`min-h-[40px] px-4 rounded-full border text-xs font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-150 cursor-pointer ${
                  active
                    ? 'bg-accent border-accent-hover text-white'
                    : 'bg-transparent border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {(gpsError || permissionState === 'denied') && !isSimulation && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{gpsError || 'Localização bloqueada no navegador.'}</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              No iPhone: <em>Definições &gt; Privacidade &gt; Localização &gt; Safari</em> (ativar Localização Precisa). No Android: toca no cadeado junto ao endereço &gt; <em>Permissões &gt; Localização</em>.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleRequestStartRun}
          className="w-full min-h-[58px] py-4 px-6 rounded-full bg-primary text-app hover:bg-zinc-200 font-semibold text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>
            {selectedTarget && selectedTarget.type !== 'free'
              ? `Começar · ${selectedTarget.label}`
              : 'Começar Corrida'}
          </span>
        </button>
      </div>

      {/* 3. Histórico Recente (Editorial, sem paredes de caixas cinzentas) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold text-white tracking-tight">
            Últimas corridas
          </h2>
          {runsHistory.length > 0 && (
            <span className="text-xs text-zinc-500 tabular-nums">
              {runsHistory.length}
            </span>
          )}
        </div>

        {runsHistory.length === 0 ? (
          <p className="py-6 text-sm text-zinc-400 border-t border-white/[0.06]">
            Ainda sem registos. Escolhe um objetivo acima ou sai para correr 15 minutos — a tua primeira marca aparece aqui.
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {runsHistory.map((run) => {
              const menuOpen = openMenuRunId === run.id;
              return (
                <li
                  key={run.id}
                  onClick={() => setSelectedRunForShare(run)}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors cursor-pointer relative"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-semibold text-lg text-white tabular-nums tracking-[-0.02em]">
                        {Number(run.distanceKm).toFixed(2)}
                        <span className="text-xs font-medium text-zinc-400 ml-1">km</span>
                      </span>
                      <span className="text-xs text-zinc-500">
                        · {formatRunRelativeDate(run.date || run.timestamp)}
                      </span>
                      {run.isSimulation && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/50 border border-accent-hover text-zinc-200 font-medium">
                          Passadeira
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 tabular-nums">
                      <span>{run.avgPace}</span>
                      <span>·</span>
                      <span>{formatDuration(run.durationSeconds)}</span>
                      <span>·</span>
                      <span>{run.calories} kcal</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(10);
                        setSelectedRunForShare(run);
                      }}
                      className="min-h-[42px] min-w-[42px] rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Partilhar corrida"
                      title="Partilhar cartão da corrida"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(8);
                        setOpenMenuRunId(menuOpen ? null : run.id);
                      }}
                      className="min-h-[42px] min-w-[42px] rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Mais opções"
                      title="Mais opções"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {menuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-12 z-20 min-w-[170px] rounded-2xl bg-surface-2 border border-white/[0.12] p-1.5 space-y-0.5"
                    >
                      {run.coordinates && run.coordinates.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic(12);
                            setOpenMenuRunId(null);
                            downloadGPX(run.coordinates, `corrida_${run.date?.split('T')[0] || 'ab_fitness'}`);
                          }}
                          className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-zinc-200 hover:bg-white/[0.08] flex items-center gap-2 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Exportar GPX</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          if (confirmDeleteRunId !== run.id) {
                            triggerHaptic(8);
                            setConfirmDeleteRunId(run.id);
                            return;
                          }
                          setConfirmDeleteRunId(null);
                          setOpenMenuRunId(null);
                          handleDeleteRun(e, run.id);
                        }}
                        className="w-full min-h-[40px] px-3 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{confirmDeleteRunId === run.id ? 'Confirmar eliminação' : 'Eliminar registo'}</span>
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 4. Opção discreta de Passadeira / Simulação (fora do foco principal) */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <button
          type="button"
          onClick={() => {
            setIsSimulation(!isSimulation);
            triggerHaptic(10);
          }}
          className="hover:text-zinc-300 transition-colors cursor-pointer py-1"
        >
          {isSimulation ? 'Sair do modo passadeira (voltar ao GPS)' : 'Correr sem GPS (modo passadeira)'}
        </button>

        {isSimulation && (
          <button
            type="button"
            onClick={() => {
              setSimulationMode((prev) => (prev === 'normal' ? 'noisy' : 'normal'));
              triggerHaptic(8);
            }}
            className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer py-1"
          >
            Perfil: {simulationMode === 'noisy' ? 'Variação alta' : 'Estável'}
          </button>
        )}
      </div>
    </div>
  );
}
