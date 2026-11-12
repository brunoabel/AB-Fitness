import React, { useState, Suspense, lazy } from 'react';
import { 
  Play, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Dumbbell, 
  Coffee, 
  Eye, 
  ListPlus, 
  Plus,
  Target,
  BookOpen,
  Check,
  Flame,
  Sparkles,
  Layers
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
    <div data-boot-stagger className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-3 pb-12 space-y-5 transition-colors">
      
      {/* 1. SELETOR DE 7 DIAS (HORIZON STRIP) — Flutuante, tátil e minimalista */}
      <section aria-label="Seletor Semanal de Treino">
        <div className="p-1.5 rounded-2xl bg-surface-2/60 border border-white/[0.06] backdrop-blur-xl shadow-xs">
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
                  className={`py-2 px-1 rounded-xl flex flex-col items-center justify-between transition-all duration-150 active:scale-[0.94] cursor-pointer min-h-[58px] select-none ${
                    isDaySelected
                      ? 'bg-white text-black font-bold shadow-md'
                      : isDayToday
                        ? 'bg-white/[0.08] text-white border border-white/[0.12]'
                        : 'bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
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
                      <CheckCircle2 className={`w-4 h-4 stroke-[2.2] ${isDaySelected ? 'text-emerald-700' : 'text-emerald-400'}`} />
                    ) : day.isRestDay ? (
                      <Coffee className={`w-3.5 h-3.5 stroke-[1.8] ${isDaySelected ? 'text-black/60' : 'text-zinc-500'}`} />
                    ) : (
                      <Dumbbell className={`w-3.5 h-3.5 stroke-[1.8] ${isDaySelected ? 'text-black/60' : 'text-zinc-500'}`} />
                    )}
                  </div>

                  <div className="h-1.5 flex items-center justify-center">
                    {isDayToday && !isDaySelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                    {isDaySelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. THE HERO WORKOUT CARD — O Protagonista Imediato da App */}
      <section aria-label="Treino em Destaque">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-2/90 via-surface-2/60 to-surface-1 border border-white/[0.08] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
          
          {/* Luz Ambiente Sutil de Alta Performance no Canto Superior */}
          <div 
            aria-hidden 
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" 
          />

          {/* Cabeçalho do Treino: Eyebrow + Status */}
          <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wider mb-2">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">
                {isToday ? 'Hoje' : selectedWorkout.name} · {selectedWorkout.badge || 'Musculação'}
              </span>
              {isSelectedDayCompleted && (
                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Check className="w-3 h-3 stroke-[2.5]" /> Concluído
                </span>
              )}
            </div>

            {!selectedWorkout.isRestDay && selectedWorkout.duration && (
              <span className="flex items-center gap-1 text-zinc-400 tabular-nums font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.8} />
                {selectedWorkout.duration}
              </span>
            )}
          </div>

          {/* Título Principal de Impacto */}
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            {selectedWorkout.title}
          </h1>

          <p className="text-sm text-zinc-400 font-medium mt-1 max-w-xl leading-relaxed">
            {selectedWorkout.focus || selectedWorkout.description}
          </p>

          {/* Se for Dia de Treino Ativo */}
          {!selectedWorkout.isRestDay ? (
            <div className="mt-5 space-y-4">
              
              {/* Métricas Rápidas do Treino */}
              <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Exercícios</span>
                  <span className="font-display font-black text-lg text-white tabular-nums">{totalExercisesCount}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Séries Totais</span>
                  <span className="font-display font-black text-lg text-white tabular-nums">{totalSetsCount}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Método</span>
                  <span className="font-display font-bold text-sm text-zinc-300 truncate block mt-0.5">Sobrecarga</span>
                </div>
              </div>

              {/* Botão Primário Hero: Tátil, Alto Contraste, Padrão Apple */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  onStartWorkout(selectedWorkout);
                }}
                className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-white text-black hover:bg-zinc-100 font-bold text-[15px] shadow-[0_10px_25px_rgba(255,255,255,0.18)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isSelectedDayCompleted ? 'Rever Treino Concluído' : 'Iniciar Treino Agora'}</span>
              </button>
            </div>
          ) : (
            /* Se for Dia de Descanso */
            <div className="mt-5 pt-4 border-t border-white/[0.06] space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Regeneração Biomecânica Ativa</h4>
                  <p className="text-[12px] text-zinc-400 mt-0.5">O músculo sintetiza fibras durante o repouso. Hidrata-te e foca no sono.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayId(nextWorkoutDay.dayId);
                      triggerHaptic(12);
                    }}
                    className="flex-1 min-h-[46px] px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  className="min-h-[46px] px-4 rounded-xl bg-surface-3 hover:bg-surface-3/80 border border-white/[0.08] text-zinc-200 font-semibold text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Treino Personalizado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. TWIN HUD: Prontidão Biomecânica + Consistência Semanal */}
      <section aria-label="Painel de Prontidão e Consistência" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Card A: Wearable Readiness HUD */}
        <div className="flex flex-col justify-center">
          <WearableReadinessCard />
        </div>

        {/* Card B: Meta e Consistência da Semana */}
        <div className="p-4 rounded-2xl bg-surface-2/60 border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
              <span>Consistência Semanal</span>
            </span>
            <span className="font-mono text-xs font-bold text-white tabular-nums">
              {completedCount} / {weeklyTarget} treinos
            </span>
          </div>

          <div className="my-2.5">
            <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>{weeklyProgressPercent >= 100 ? 'Meta semanal batida!' : `${weeklyTarget - completedCount} sessões para a meta`}</span>
            {onOpenCustomize && (
              <button
                type="button"
                onClick={() => {
                  onOpenCustomize();
                  triggerHaptic(8);
                }}
                className="text-[11px] font-semibold text-zinc-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <Target className="w-3 h-3 text-zinc-500" />
                <span>Ajustar Metas</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 4. LISTA DE EXERCÍCIOS DA SESSÃO — Design Suíço de Precisão */}
      {!selectedWorkout.isRestDay && totalExercisesCount > 0 && (
        <section aria-label="Sequência de Exercícios" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white/40" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Sequência do Treino ({totalExercisesCount})
              </h2>
            </div>
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {totalSetsCount} séries previstas
            </span>
          </div>

          <div className="space-y-1.5">
            {selectedWorkout.exercises.map((ex, index) => {
              const formattedIndex = String(index + 1).padStart(2, '0');
              const hasVideo = hasVerifiedExerciseVideo(ex);

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    triggerHaptic(8);
                    onViewExercise(ex);
                  }}
                  className="p-3.5 rounded-2xl bg-surface-2/50 hover:bg-surface-2 border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-zinc-500 tabular-nums shrink-0">
                      {formattedIndex}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition-colors truncate">
                          {ex.name}
                        </h3>
                        {hasVideo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/[0.08] text-zinc-300 border border-white/[0.1] flex items-center gap-0.5 shrink-0">
                            <Play className="w-2 h-2 fill-current" />
                            Guia
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {ex.badge || ex.target || 'Geral'} · {ex.equipment || 'Livre'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-3">
                    <span className="font-mono text-xs font-bold text-zinc-300 tabular-nums bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      {ex.defaultSets} × {ex.suggestedReps}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. ATALHO: MANUAL DO ATLETA (Discreto, ao estilo Apple Support) */}
      {(() => {
        const userProfile = getSavedUserProfile();
        const userGoal = userProfile?.goal || 'athlete';
        const currentManual = ATHLETE_MANUALS[userGoal] || ATHLETE_MANUALS.athlete;

        return (
          <div 
            onClick={() => {
              triggerHaptic(8);
              onOpenGuide();
            }}
            className="p-3.5 rounded-2xl bg-surface-2/40 border border-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  {currentManual.tag}
                </span>
                <h4 className="text-xs font-bold text-zinc-200 mt-0.5">
                  {currentManual.title}
                </h4>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
          </div>
        );
      })()}

      {/* 6. MAPA FISIOLÓGICO DE RECUPERAÇÃO MUSCULAR (LAZY) */}
      <Suspense fallback={<div className="rounded-3xl bg-surface-2 border border-white/[0.06] h-[340px] animate-pulse" />}>
        <MuscleRecoveryMap />
      </Suspense>

    </div>
  );
}
