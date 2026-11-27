import React, { useEffect, useState, Suspense, lazy } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Play,
  Clock,
  ChevronRight,
  Coffee,
  ListPlus,
  BookOpen,
  Check,
  Lock
} from 'lucide-react';
import { weekProgress } from '../utils/streak';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { ATHLETE_MANUAL_HEADERS } from '../data/athleteManualHeaders';
import { getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { loadExerciseMedia, useHasExerciseVideo } from '../hooks/useExerciseMediaLoader';
import WearableReadinessCard from './wearables/WearableReadinessCard';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { useAuth } from '../context';
import { canAccessFeature } from '../utils/userVerification';

const ProUpgradeSheet = lazy(() => import('./pro/ProUpgradeSheet'));

import { loadMesocycle, startReactiveDeload, dismissDeloadRecommendation, isDeloadRecommendationDismissed, weekRange } from '../utils/mesocycleState';
import { getWorkoutHistory } from '../utils/storage';
import { getCheckins } from '../utils/sessionCheckin';
import { recordReadiness } from '../utils/readinessLog';
import { syncMesocycle, restoreMesocycle } from '../services/mesocycleService';
import { precacheWorkoutVideos } from '../services/videoPrecache';
import { localDateKey } from '../utils/dateKey';

// Lazy: evita arrastar o catálogo de 348 exercícios (227KB) para o chunk inicial —
// DailyBriefing usa useMuscleRecovery, que também depende do catálogo (getCatalogEntry).
const MuscleRecoveryMap = lazy(() => import('./MuscleRecoveryMap'));
const DailyBriefing = lazy(() => import('./DailyBriefing'));

export default function WeeklyDashboard({ 
  completedDays = [], 
  onStartWorkout, 
  onViewExercise,
  onOpenGuide,
  onOpenCustomize,
  onNavigateTab,
  schedule = WEEKLY_SCHEDULE
}) {
  const hasVerifiedExerciseVideo = useHasExerciseVideo();
  const [currentJsDay] = useState(() => new Date().getDay());
  const [selectedDayId, setSelectedDayId] = useState(() => new Date().getDay());
  const [mesocycle, setMesocycle] = useState(null);
  const [showMesoPicker, setShowMesoPicker] = useState(false);
  const { user, isGuest, isPro, isTrialActive, trialEndsAt, trialDaysLeft } = useAuth();
  const [upgradeReason, setUpgradeReason] = useState(null);
  const hasAccount = Boolean(user && !isGuest);
  // Mesociclo é PRO: assinantes e quem está no período de teste (trial do vínculo ao PT)
  const canUseMesocycle = canAccessFeature('mesocycles', { is_pro: isPro, trial_ends_at: isTrialActive ? trialEndsAt : null });
  const trialNotice = !hasAccount || isPro
    ? null
    : isTrialActive && trialDaysLeft !== null && trialDaysLeft <= 3
      ? 'trial_ending'
      : !isTrialActive && trialEndsAt
        ? 'trial_ended'
        : null;
  // Semana do mesociclo pelo calendário (src/utils/mesocycleState.js): avança sozinha, deload planeado ou reativo
  const [meso, setMeso] = useState(() => loadMesocycle());
  const [deloadAdvice, setDeloadAdvice] = useState(null);

  // Mesociclo real (generateMesocyclePlan) só para quem tem perfil de onboarding; import dinâmico mantém o catálogo fora do chunk inicial
  useEffect(() => {
    const fitnessProfile = getLocalFitnessProfile();
    if (!fitnessProfile) return undefined;
    let alive = true;
    import('../data/planFromProfile')
      .then(({ generateMesocyclePlan }) => {
        if (alive) setMesocycle(generateMesocyclePlan(fitnessProfile, 5));
      })
      .catch(() => {});
    // Prontidão de hoje para o histórico e sinais de deload reativo (import dinâmico: o motor puxa o catálogo)
    Promise.all([import('../utils/activeWorkoutHelpers'), import('../engine/deload')])
      .then(([{ getCurrentReadinessScore }, { evaluateDeloadSignals }]) => {
        const readiness = recordReadiness(getCurrentReadinessScore());
        if (!alive || isDeloadRecommendationDismissed()) return;
        const advice = evaluateDeloadSignals({ history: getWorkoutHistory(), checkins: getCheckins(), readiness, profile: fitnessProfile });
        if (advice.recommend) setDeloadAdvice(advice);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Conta com sessão: num aparelho novo retoma o mesociclo da conta; depois mantém a tabela atualizada
  useEffect(() => {
    if (!hasAccount) return;
    restoreMesocycle(user.id)
      .then((restored) => {
        const current = restored ? loadMesocycle() : meso;
        if (restored) setMeso(current);
        return syncMesocycle(user.id, current.state);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccount, user?.id]);

  const acceptDeload = () => {
    triggerHaptic(12);
    const next = startReactiveDeload((deloadAdvice?.signals || []).map((s) => s.code));
    setMeso(next);
    setDeloadAdvice(null);
    if (hasAccount) syncMesocycle(user.id, next.state).catch(() => {});
  };
  const dismissDeload = () => {
    triggerHaptic(8);
    dismissDeloadRecommendation();
    setDeloadAdvice(null);
  };

  const activeMesoWeek = mesocycle
    ? {
        ...mesocycle.weeks[(meso.isDeload ? mesocycle.totalWeeks : Math.min(meso.weekNumber, mesocycle.totalWeeks)) - 1],
        weekNumber: meso.weekNumber,
        isDeload: meso.isDeload
      }
    : null;
  const mesoRange = weekRange(meso);
  const fmtDay = (d) => d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });

  const selectedWorkout = schedule.find((d) => d.dayId === selectedDayId) || schedule[0];
  const nextWorkoutDay = schedule.find((d) => !d.isRestDay && d.exercises && d.exercises.length > 0) || schedule[0];

  // Vídeos 3D do treino de hoje guardados em segundo plano (Wi-Fi), para tocarem sem rede no ginásio
  const todayWorkout = schedule.find((d) => d.dayId === currentJsDay);
  useEffect(() => {
    if (!todayWorkout || todayWorkout.isRestDay) return undefined;
    const run = () => precacheWorkoutVideos(todayWorkout, localDateKey()).catch(() => {});
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 8000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(run, 4000);
    return () => clearTimeout(t);
  }, [todayWorkout]);

  const isSelectedDayCompleted = completedDays.some((c) => (c?.dayId ?? c) === selectedDayId);
  const { done: completedCount, target: weeklyTarget } = weekProgress(completedDays, schedule);
  const weeklyProgressPercent = Math.min(100, Math.round((completedCount / weeklyTarget) * 100));

  const totalExercisesCount = Array.isArray(selectedWorkout?.exercises) ? selectedWorkout.exercises.length : 0;
  const totalSetsCount = Array.isArray(selectedWorkout?.exercises)
    ? selectedWorkout.exercises.reduce((acc, ex) => acc + (Number(ex.defaultSets) || 3), 0)
    : 0;

  const isToday = currentJsDay === selectedDayId;

  return (
    <div data-boot-stagger className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-3 pb-14 space-y-7">
      {/* 1. SELETOR DE 7 DIAS — ABERTO SOBRE PRETO PURO */}
      <section aria-label="Seletor Semanal de Treino">
        <div className="grid grid-cols-7 gap-1">
          {schedule.map((day) => {
            const isDayToday = day.dayId === currentJsDay;
            const isDaySelected = day.dayId === selectedDayId;
            const isDone = completedDays.some((c) => (c?.dayId ?? c) === day.dayId);

            return (
              <button
                key={day.dayId}
                type="button"
                onClick={() => {
                  setSelectedDayId(day.dayId);
                  triggerHaptic(10);
                }}
                className="py-1.5 px-1 flex flex-col items-center gap-1.5 cursor-pointer select-none group"
                aria-label={`${day.name} - ${day.title}`}
                aria-pressed={isDaySelected}
              >
                <span
                  className={`text-[11px] font-semibold uppercase tracking-tight transition-colors ${
                    isDaySelected ? 'text-white' : isDayToday ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                >
                  {day.shortName}
                </span>

                <span
                  className={`w-9 h-9 rounded-full border flex items-center justify-center transition-[background-color,border-color,transform] duration-150 ease-out active:scale-95 ${
                    isDaySelected
                      ? 'bg-accent text-white border-accent-hover'
                      : isDayToday
                        ? 'bg-white/[0.05] text-white border-white/25'
                        : 'bg-transparent text-zinc-500 border-white/[0.06] group-hover:border-white/[0.14]'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4 stroke-[2.5] text-emerald-400" />
                  ) : day.isRestDay ? (
                    <span
                      className={`w-2.5 h-[2px] rounded-full ${
                        isDaySelected ? 'bg-white/75' : 'bg-zinc-600'
                      }`}
                    />
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDaySelected
                          ? 'bg-white'
                          : isDayToday
                            ? 'bg-accent-hover'
                            : 'bg-zinc-600'
                      }`}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Aviso discreto do fim do teste PRO */}
      {trialNotice && (
        <section
          aria-label="Teste PRO"
          className="flex items-center justify-between gap-3 bg-surface-2/80 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-2.5"
        >
          <p className="text-[13px] text-white min-w-0">
            {trialNotice === 'trial_ending'
              ? `O teu teste PRO termina ${trialDaysLeft <= 1 ? 'hoje' : `em ${trialDaysLeft} dias`}.`
              : 'O teu teste PRO terminou.'}
          </p>
          <button
            type="button"
            onClick={() => setUpgradeReason(trialNotice)}
            className="shrink-0 text-xs font-semibold bg-primary text-app hover:bg-zinc-200 rounded-full px-3.5 py-1.5 cursor-pointer"
          >
            {trialNotice === 'trial_ending' ? 'Manter PRO' : 'Assinar PRO'}
          </button>
        </section>
      )}

      {/* 2. ÚNICO PROTAGONISTA EM DESTAQUE — PALCO DO TREINO DO DIA */}
      <section aria-label="Treino em Destaque" className="space-y-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-2/85 to-surface-2/25 border border-accent-hover/70 p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 mb-3">
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-zinc-300 truncate">
                {isToday ? 'Treino de hoje' : selectedWorkout.name} · {selectedWorkout.badge || 'Musculação'}
              </span>
              {isSelectedDayCompleted && (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Concluído
                </span>
              )}
            </span>

            {!selectedWorkout.isRestDay && selectedWorkout.duration && (
              <span className="flex items-center gap-1.5 tabular-nums shrink-0 text-zinc-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
                {selectedWorkout.duration}
              </span>
            )}
          </div>

          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-[-0.025em] leading-[1.08]">
            {selectedWorkout.title}
          </h1>

          <p className="text-sm text-zinc-300 font-normal mt-2 max-w-xl leading-relaxed">
            {selectedWorkout.focus || selectedWorkout.description}
          </p>

          {!selectedWorkout.isRestDay ? (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-5 text-sm text-zinc-400">
                <span className="inline-flex items-baseline gap-1.5">
                  <strong className="font-display font-semibold text-white text-[17px] tabular-nums tracking-[-0.02em]">
                    {totalExercisesCount}
                  </strong>
                  <span className="text-[13px] font-medium text-zinc-400">exercícios</span>
                </span>
                <span className="w-px h-4 bg-white/[0.12]" aria-hidden />
                <span className="inline-flex items-baseline gap-1.5">
                  <strong className="font-display font-semibold text-white text-[17px] tabular-nums tracking-[-0.02em]">
                    {totalSetsCount}
                  </strong>
                  <span className="text-[13px] font-medium text-zinc-400">séries</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  onStartWorkout(selectedWorkout);
                }}
                className="w-full min-h-[54px] py-3.5 px-6 rounded-full bg-primary text-app hover:bg-zinc-200 font-semibold text-[15px] active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out flex items-center justify-center gap-2.5 cursor-pointer select-none"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isSelectedDayCompleted ? 'Rever Treino Concluído' : 'Iniciar Treino Agora'}</span>
              </button>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-zinc-300 stroke-[1.75] shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-white">Regeneração biomecânica ativa</h4>
                  <p className="text-[12px] text-zinc-400 mt-0.5">
                    O músculo sintetiza fibras durante o repouso. Hidrata-te e foca no sono.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayId(nextWorkoutDay.dayId);
                      triggerHaptic(12);
                    }}
                    className="flex-1 min-h-[48px] px-4 rounded-full bg-primary text-app font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Antecipar {nextWorkoutDay.name}: {nextWorkoutDay.title}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('custom-workouts');
                    triggerHaptic(10);
                  }}
                  className="min-h-[48px] px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-100 font-semibold text-xs active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Treino Personalizado</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Briefing diário editorial sem caixa */}
        {isToday && (
          <Suspense fallback={null}>
            <DailyBriefing todayWorkout={selectedWorkout} />
          </Suspense>
        )}
      </section>

      {/* 3. TELEMETRIA ABERTA EM 3 COLUNAS SEM CAIXA */}
      <section aria-label="Resumo Semanal" className="space-y-3">
        <div className="grid grid-cols-3 divide-x divide-white/[0.08] py-3.5 border-y border-white/[0.06]">
          <button
            type="button"
            onClick={() => {
              if (onOpenCustomize) onOpenCustomize();
              triggerHaptic(8);
            }}
            className="py-1 px-2 text-center cursor-pointer group select-none"
          >
            <span className="block text-[11px] font-medium text-zinc-400">Meta semanal</span>
            <span
              className={`block font-display font-semibold text-xl tabular-nums mt-0.5 ${
                weeklyProgressPercent >= 100 ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {completedCount}/{weeklyTarget}
            </span>
            <span className="block text-[11px] text-zinc-500 group-hover:text-zinc-300 truncate transition-colors">
              {weeklyProgressPercent >= 100 ? 'Batida' : 'Ajustar'}
            </span>
          </button>

          <WearableReadinessCard compact />

          {activeMesoWeek ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                if (!canUseMesocycle) {
                  setUpgradeReason('mesocycles');
                  return;
                }
                setShowMesoPicker((prev) => !prev);
              }}
              aria-expanded={canUseMesocycle ? showMesoPicker : undefined}
              className="py-1 px-2 text-center cursor-pointer group select-none"
            >
              <span className="block text-[11px] font-medium text-zinc-400">Mesociclo</span>
              <span className="inline-flex items-center justify-center gap-1 font-display font-semibold text-xl tabular-nums text-white mt-0.5">
                {canUseMesocycle ? (
                  `Sem. ${activeMesoWeek.weekNumber}`
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
                    <span>PRO</span>
                  </>
                )}
              </span>
              <span className="block text-[11px] text-zinc-500 group-hover:text-zinc-300 truncate transition-colors">
                {canUseMesocycle
                  ? activeMesoWeek.isDeload
                    ? 'Deload'
                    : `RIR ${activeMesoWeek.targetRir}`
                  : 'Desbloquear'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onOpenGuide();
              }}
              className="py-1 px-2 text-center cursor-pointer group select-none"
            >
              <span className="block text-[11px] font-medium text-zinc-400">Biblioteca</span>
              <span className="inline-flex items-center justify-center font-display font-semibold text-xl text-white mt-0.5">
                Guia
              </span>
              <span className="block text-[11px] text-zinc-500 group-hover:text-zinc-300 truncate transition-colors">
                Manual do atleta
              </span>
            </button>
          )}
        </div>

        {/* Semana do mesociclo (avança pelo calendário; aberta sob demanda) */}
        {activeMesoWeek && canUseMesocycle && showMesoPicker && (
          <div className="flex items-center justify-between gap-3 px-1 pb-2 border-b border-white/[0.06]">
            <p className="text-xs text-zinc-300 tabular-nums truncate">
              {activeMesoWeek.isDeload
                ? `Semana ${activeMesoWeek.weekNumber} · Deload (${fmtDay(mesoRange.start)} a ${fmtDay(mesoRange.end)})`
                : `Semana ${activeMesoWeek.weekNumber} de ${mesocycle.totalWeeks} · RIR ${activeMesoWeek.targetRir} (${fmtDay(mesoRange.start)} a ${fmtDay(mesoRange.end)})`}
            </p>
            <ol className="flex items-center gap-1 shrink-0" aria-label="Semanas do mesociclo">
              {mesocycle.weeks.map((w) => {
                const isCurrent = activeMesoWeek.isDeload ? w.isDeload : w.weekNumber === activeMesoWeek.weekNumber;
                const isPast = !activeMesoWeek.isDeload && w.weekNumber < activeMesoWeek.weekNumber;
                return (
                  <li
                    key={w.weekNumber}
                    aria-current={isCurrent ? 'step' : undefined}
                    aria-label={w.isDeload ? 'Semana de deload' : `Semana ${w.weekNumber}`}
                    className={`w-8 h-8 rounded-full border text-[12px] font-semibold tabular-nums flex items-center justify-center ${
                      isCurrent
                        ? 'bg-accent text-white border-accent-hover'
                        : isPast
                          ? 'border-white/[0.08] text-zinc-500'
                          : 'border-white/[0.08] text-zinc-400'
                    }`}
                  >
                    {w.isDeload ? 'D' : w.weekNumber}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Deload reativo: sinais de fadiga acumulada nos últimos 7 dias */}
        {activeMesoWeek && canUseMesocycle && deloadAdvice && !meso.isDeload && (
          <div className="rounded-2xl bg-surface-2 border border-white/[0.08] p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Sinais de fadiga acumulada</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nos últimos 7 dias {deloadAdvice.signals.map((sig) => sig.label).join(' e ')}. Antecipar o deload agora (menos séries e carga a 90%) ajuda a recuperar antes de continuar a progredir.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={acceptDeload}
                className="min-h-[44px] px-4 rounded-xl bg-primary text-app text-xs font-semibold cursor-pointer active:scale-[0.98] transition-transform"
              >
                Fazer deload esta semana
              </button>
              <button
                type="button"
                onClick={dismissDeload}
                className="min-h-[44px] px-3 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Agora não
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. SEQUÊNCIA DO TREINO — ABERTA DIRETAMENTE NO PRETO PURO */}
      {!selectedWorkout.isRestDay && totalExercisesCount > 0 && (
        <section aria-label="Sequência de Exercícios" className="space-y-2">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Sequência do treino
            </h2>
            <span className="text-[11px] text-zinc-400 tabular-nums">
              {totalExercisesCount} exercícios · {totalSetsCount} séries
            </span>
          </div>

          <div
            className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]"
            onPointerEnter={() => loadExerciseMedia()}
          >
            {selectedWorkout.exercises.map((ex, index) => {
              const formattedIndex = String(index + 1).padStart(2, '0');
              const hasVideo = hasVerifiedExerciseVideo(ex);

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    onViewExercise(ex);
                  }}
                  className="w-full min-h-[56px] py-3 px-1 hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between text-left group select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-display text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 tabular-nums shrink-0 transition-colors">
                      {formattedIndex}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                          {ex.name}
                        </h3>
                        {hasVideo && (
                          <span className="inline-flex items-center text-zinc-400 shrink-0">
                            <Play className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {ex.badge || ex.target || 'Geral'} · {ex.equipment || 'Livre'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 pl-3">
                    <span className="font-display font-semibold text-sm text-zinc-300 tabular-nums tracking-[-0.01em]">
                      {ex.defaultSets} × {ex.suggestedReps}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. MAPA FISIOLÓGICO DE RECUPERAÇÃO MUSCULAR */}
      <Suspense fallback={<div className="h-[340px]" />}>
        <MuscleRecoveryMap />
      </Suspense>

      {/* Link discreto sem caixa para o Manual do Atleta quando Mesociclo ocupa a barra superior */}
      {activeMesoWeek && (() => {
        const userProfile = getSavedUserProfile();
        const userGoal = userProfile?.goal || 'athlete';
        const currentManual = ATHLETE_MANUAL_HEADERS[userGoal] || ATHLETE_MANUAL_HEADERS.athlete;

        return (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenGuide();
            }}
            className="w-full py-3.5 px-1 border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer flex items-center justify-between text-left select-none group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-white stroke-[1.75] shrink-0 transition-colors" />
              <div>
                <span className="text-[11px] text-zinc-500 block">{currentManual.tag}</span>
                <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {currentManual.title}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0 transition-colors" />
          </button>
        );
      })()}

      <Suspense fallback={null}>
        <AnimatePresence>
          {upgradeReason && <ProUpgradeSheet key="pro-upgrade" reason={upgradeReason} onClose={() => setUpgradeReason(null)} />}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
