import React, { useState, Suspense, lazy } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Dumbbell, 
  Coffee, 
  ListPlus, 
  Target,
  BookOpen,
  Check,
  Flame
} from 'lucide-react';
import { weekProgress } from '../utils/streak';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import { useHasExerciseVideo } from '../hooks/useExerciseMediaLoader';
import WearableReadinessCard from './wearables/WearableReadinessCard';

// Lazy: evita arrastar o catálogo de 348 exercícios (227KB) para o chunk inicial
const MuscleRecoveryMap = lazy(() => import('./MuscleRecoveryMap'));

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

  const selectedWorkout = schedule.find((d) => d.dayId === selectedDayId) || schedule[0];
  const nextWorkoutDay = schedule.find((d) => !d.isRestDay && d.exercises && d.exercises.length > 0) || schedule[0];

  const isSelectedDayCompleted = completedDays.some((c) => (c?.dayId ?? c) === selectedDayId);
  const { done: completedCount, target: weeklyTarget } = weekProgress(completedDays, schedule);
  const weeklyProgressPercent = Math.min(100, Math.round((completedCount / weeklyTarget) * 100));

  const totalExercisesCount = Array.isArray(selectedWorkout?.exercises) ? selectedWorkout.exercises.length : 0;
  const totalSetsCount = Array.isArray(selectedWorkout?.exercises)
    ? selectedWorkout.exercises.reduce((acc, ex) => acc + (Number(ex.defaultSets) || 3), 0)
    : 0;

  const isToday = currentJsDay === selectedDayId;

  return (
    <div data-boot-stagger className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-3 pb-14 space-y-7 transition-colors">
      
      {/* 1. SELETOR DE 7 DIAS (HORIZON STRIP) — Pílulas soltas diretamente no preto OLED, sem caixa envolvente */}
      <section aria-label="Seletor Semanal de Treino">
        <div className="grid grid-cols-7 gap-1.5">
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
                className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-between transition-all duration-150 active:scale-[0.94] cursor-pointer min-h-[60px] select-none ${
                  isDaySelected
                    ? 'bg-white text-black font-bold shadow-[0_8px_24px_rgba(255,255,255,0.16)]'
                    : isDayToday
                      ? 'bg-white/[0.07] text-white'
                      : 'bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
                aria-label={`${day.name} - ${day.title}`}
                aria-pressed={isDaySelected}
              >
                <span className={`text-[11px] font-bold uppercase tracking-tight ${
                  isDaySelected ? 'text-black' : isDayToday ? 'text-white' : 'text-zinc-500'
                }`}>
                  {day.shortName}
                </span>

                <div className="my-0.5">
                  {isDone ? (
                    <CheckCircle2 className={`w-4 h-4 stroke-[2.3] ${isDaySelected ? 'text-emerald-700' : 'text-emerald-400'}`} />
                  ) : day.isRestDay ? (
                    <Coffee className={`w-3.5 h-3.5 stroke-[1.8] ${isDaySelected ? 'text-black/60' : 'text-zinc-600'}`} />
                  ) : (
                    <Dumbbell className={`w-3.5 h-3.5 stroke-[1.8] ${isDaySelected ? 'text-black/70' : 'text-zinc-500'}`} />
                  )}
                </div>

                <div className="h-1.5 flex items-center justify-center">
                  {isDayToday && !isDaySelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                  {isDaySelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. THE HERO WORKOUT CARD — O Único Protagonista Elevado do Ecrã */}
      <section aria-label="Treino em Destaque">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#10182E] via-[#070B14] to-[#030508] border border-white/[0.12] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)]">
          
          {/* Iluminação Volumétrica Sutil */}
          <div 
            aria-hidden 
            className="absolute -top-28 -right-20 w-72 h-72 rounded-full bg-white/[0.06] blur-3xl pointer-events-none" 
          />

          {/* Linha de Estado */}
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-400 mb-3 relative">
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-zinc-300 truncate">{isToday ? 'Treino de hoje' : selectedWorkout.name} · {selectedWorkout.badge || 'Musculação'}</span>
              {isSelectedDayCompleted && (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Concluído
                </span>
              )}
            </span>

            {!selectedWorkout.isRestDay && selectedWorkout.duration && (
              <span className="flex items-center gap-1.5 tabular-nums shrink-0 text-zinc-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.8} />
                {selectedWorkout.duration}
              </span>
            )}
          </div>

          {/* Título Editorial de Autoridade */}
          <h1 className="relative font-heading font-bold text-3xl sm:text-4xl text-white tracking-[-0.025em] leading-[1.08]">
            {selectedWorkout.title}
          </h1>

          <p className="relative text-sm text-zinc-400 font-normal mt-2 max-w-xl leading-relaxed">
            {selectedWorkout.focus || selectedWorkout.description}
          </p>

          {/* Se for Dia de Treino Ativo */}
          {!selectedWorkout.isRestDay ? (
            <div className="relative mt-6 space-y-5">

              {/* Métricas de Volume sem caixilhos */}
              <div className="flex items-center gap-5 text-sm text-zinc-400">
                <span className="inline-flex items-baseline gap-1.5">
                  <strong className="font-display font-semibold text-white text-[17px] tabular-nums tracking-[-0.02em]">{totalExercisesCount}</strong>
                  <span className="text-[13px] font-medium text-zinc-400">exercícios</span>
                </span>
                <span className="w-px h-4 bg-white/[0.12]" aria-hidden />
                <span className="inline-flex items-baseline gap-1.5">
                  <strong className="font-display font-semibold text-white text-[17px] tabular-nums tracking-[-0.02em]">{totalSetsCount}</strong>
                  <span className="text-[13px] font-medium text-zinc-400">séries</span>
                </span>
              </div>

              {/* Botão Primário Hero: Tátil, Alto Contraste, Padrão Apple */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  onStartWorkout(selectedWorkout);
                }}
                className="w-full min-h-[54px] py-4 px-6 rounded-2xl bg-white text-black hover:bg-zinc-100 font-bold text-[15px] shadow-[0_12px_32px_rgba(255,255,255,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isSelectedDayCompleted ? 'Rever Treino Concluído' : 'Iniciar Treino Agora'}</span>
              </button>
            </div>
          ) : (
            /* Se for Dia de Descanso */
            <div className="relative mt-6 pt-5 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-amber-400 stroke-[1.8] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Regeneração biomecânica ativa</h4>
                  <p className="text-[12px] text-zinc-400 mt-0.5">O músculo sintetiza fibras durante o repouso. Hidrata-te e foca no sono.</p>
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
                    className="flex-1 min-h-[48px] px-4 rounded-2xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="min-h-[48px] px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-zinc-100 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Treino Personalizado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. PRONTIDÃO & CONSISTÊNCIA SEMANAL — Anel visual + Pips em vez de barra SaaS */}
      <section aria-label="Painel de Prontidão e Consistência" className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        
        {/* Card A: Wearable Readiness HUD */}
        <div className="flex flex-col justify-center">
          <WearableReadinessCard />
        </div>

        {/* Bloco B: Anel de Consistência da Semana (sem caixa pesada) */}
        <div className="px-2 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Anel SVG estilo Apple Fitness */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44" aria-hidden>
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="4"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke={weeklyProgressPercent >= 100 ? '#34d399' : '#ffffff'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={(2 * Math.PI * 18) * (1 - weeklyProgressPercent / 100)}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-display font-semibold text-white tabular-nums tracking-[-0.01em]">
                {completedCount}/{weeklyTarget}
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
                <span>Consistência semanal</span>
              </div>
              <p className="text-[12px] text-zinc-400 mt-0.5 truncate">
                {weeklyProgressPercent >= 100
                  ? 'Meta semanal batida!'
                  : `${weeklyTarget - completedCount} ${weeklyTarget - completedCount === 1 ? 'treino restante' : 'treinos restantes'} para a meta`}
              </p>
            </div>
          </div>

          {onOpenCustomize && (
            <button
              type="button"
              onClick={() => {
                onOpenCustomize();
                triggerHaptic(8);
              }}
              className="shrink-0 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-zinc-400" />
              <span>Metas</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. LISTA DE EXERCÍCIOS DA SESSÃO — Editorial Limpo sem caixilhos empilhados */}
      {!selectedWorkout.isRestDay && totalExercisesCount > 0 && (
        <section aria-label="Sequência de Exercícios" className="space-y-3">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-base font-heading font-bold text-white tracking-tight">
              Sequência do Treino
            </h2>
            <span className="text-xs text-zinc-500 tabular-nums">
              {totalExercisesCount} exercícios · {totalSetsCount} séries
            </span>
          </div>

          <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
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
                  className="w-full py-3.5 px-2 hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors cursor-pointer flex items-center justify-between text-left group select-none"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-xs font-semibold text-zinc-600 group-hover:text-zinc-400 tabular-nums shrink-0 transition-colors">
                      {formattedIndex}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors truncate">
                          {ex.name}
                        </h3>
                        {hasVideo && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-400 shrink-0">
                            <Play className="w-2.5 h-2.5 fill-current text-zinc-300" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5 truncate">
                        {ex.badge || ex.target || 'Geral'} · {ex.equipment || 'Livre'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pl-3">
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

      {/* 5. ATALHO: MANUAL DO ATLETA (Linha limpa sem caixa cinzenta) */}
      {(() => {
        const userProfile = getSavedUserProfile();
        const userGoal = userProfile?.goal || 'athlete';
        const currentManual = ATHLETE_MANUALS[userGoal] || ATHLETE_MANUALS.athlete;

        return (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onOpenGuide();
            }}
            className="w-full py-3.5 px-2 hover:bg-white/[0.03] rounded-2xl transition-colors cursor-pointer flex items-center justify-between text-left select-none group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-white/[0.05] text-zinc-300 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <BookOpen className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block">
                  {currentManual.tag}
                </span>
                <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white mt-0.5 transition-colors">
                  {currentManual.title}
                </h4>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 shrink-0 transition-colors" />
          </button>
        );
      })()}

      {/* 6. MAPA FISIOLÓGICO DE RECUPERAÇÃO MUSCULAR (LAZY) */}
      <Suspense fallback={<div className="rounded-3xl bg-white/[0.02] h-[340px] animate-pulse" />}>
        <MuscleRecoveryMap />
      </Suspense>

    </div>
  );
}
