import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';
import MuscleRecoveryMap from './MuscleRecoveryMap';


export default function WeeklyDashboard({ 
  completedDays = [], 
  onStartWorkout, 
  onViewExercise,
  onOpenGuide,
  onOpenCustomize,
  onNavigateTab,
  schedule = WEEKLY_SCHEDULE
}) {
  // Dia atual da semana (0 = Dom, 1 = Seg, ..., 6 = Sáb)
  const [currentJsDay] = useState(() => new Date().getDay());
  const [selectedDayId, setSelectedDayId] = useState(() => new Date().getDay());

  const selectedWorkout = schedule.find((d) => d.dayId === selectedDayId) || schedule[0];

  // Próximo dia com treino ativo se o selecionado for descanso
  const nextWorkoutDay = schedule.find((d) => !d.isRestDay && d.exercises && d.exercises.length > 0) || schedule[0];

  // Verificação de conclusão
  const isSelectedDayCompleted = completedDays.some((c) => (c?.dayId ?? c) === selectedDayId);
  const completedCount = completedDays.length;
  const weeklyProgressPercent = Math.min(100, Math.round((completedCount / 4) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn transition-colors">
      
      {/* Controlo de Segmento: Cronograma vs Criação de Treino */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold">
        <button
          type="button"
          className="flex-1 py-2 px-3 rounded-lg bg-white dark:bg-[#141618] text-zinc-950 dark:text-zinc-50 shadow-xs flex items-center justify-center gap-2 cursor-default font-semibold border border-zinc-200/80 dark:border-zinc-700/60"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 stroke-[2]" />
          <span>Cronograma Semanal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) onNavigateTab('custom-workouts');
            triggerHaptic(10);
          }}
          className="flex-1 py-2 px-3 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center gap-2 transition-all cursor-pointer font-medium"
        >
          <ListPlus className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Planear Treino Personalizado</span>
        </button>
      </div>

      {/* Grelha Adaptável: No tablet/desktop divide em 2 colunas ergonómicas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: Resumo Semanal & Seletor de Dias */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Cartão de Performance Semanal */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Desempenho Semanal
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onNavigateTab) onNavigateTab('custom-workouts');
                    triggerHaptic(15);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white px-2.5 py-1.5 rounded-lg border border-zinc-800 dark:border-zinc-200 shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Criar novo plano de treino"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Novo Treino</span>
                </button>

                {onOpenCustomize && (
                  <button
                    onClick={onOpenCustomize}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 active:scale-95 transition-all cursor-pointer"
                    title="Ajustar metas com IA"
                  >
                    <Target className="w-3 h-3 text-zinc-500 stroke-[2]" />
                    <span>Metas</span>
                  </button>
                )}
              </div>
            </div>

            <h1 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-snug">
              Sobrecarga Progressiva
            </h1>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Regista séries, ajusta cargas com rigor biomecânico e consolida a evolução semana a semana.
            </p>

            {/* Progresso Semanal com Numerais Tabulares */}
            <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-zinc-600 dark:text-zinc-400">Meta Semanal:</span>
                <span className="font-semibold text-zinc-950 dark:text-zinc-50 tabular-nums">
                  {completedCount} de 4 treinos efetuados
                </span>
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                {weeklyProgressPercent}%
              </span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-zinc-950 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Seletor Semanal de 7 Dias */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>Dias da Semana</span>
              </h2>
              <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                {currentJsDay === selectedDayId ? 'Hoje' : 'Dia selecionado'}
              </span>
            </div>

            {/* Grelha dos 7 Dias da Semana */}
            <div className="grid grid-cols-7 gap-1.5">
              {schedule.map((day) => {
                const isToday = day.dayId === currentJsDay;
                const isSelected = day.dayId === selectedDayId;
                const isDone = completedDays.some((c) => (c?.dayId ?? c) === day.dayId);

                return (
                  <button
                    key={day.dayId}
                    onClick={() => {
                      setSelectedDayId(day.dayId);
                      triggerHaptic(10);
                    }}
                    className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-between transition-all active:scale-95 border cursor-pointer min-h-[58px] ${
                      isSelected
                        ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 font-semibold shadow-xs'
                        : isToday
                          ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-100'
                          : 'bg-white dark:bg-[#141618] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <span className={`text-[10px] font-semibold uppercase tracking-tight ${
                      isSelected ? 'text-white dark:text-zinc-950' : isToday ? 'text-zinc-950 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-500'
                    }`}>
                      {day.shortName}
                    </span>

                    <div className="my-1">
                      {isDone ? (
                        <CheckCircle2 className={`w-4 h-4 stroke-[2.2] ${isSelected ? 'text-emerald-400 dark:text-emerald-600' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      ) : day.isRestDay ? (
                        <Coffee className={`w-3.5 h-3.5 stroke-[1.8] ${isSelected ? 'text-white/80 dark:text-zinc-900/80' : 'text-zinc-400'}`} />
                      ) : (
                        <Dumbbell className={`w-3.5 h-3.5 stroke-[1.8] ${isSelected ? 'text-white/80 dark:text-zinc-900/80' : 'text-zinc-400'}`} />
                      )}
                    </div>

                    <div className="h-1.5 flex items-center justify-center">
                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 dark:bg-zinc-100" />
                      )}
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-zinc-950" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Aviso Sóbrio se for Dia de Descanso */}
            {selectedWorkout.isRestDay && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300">
                <span className="font-normal flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-zinc-500 shrink-0 stroke-[1.8]" />
                  <span><b>{selectedWorkout.name}</b> é dia de recuperação.</span>
                </span>
                {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDayId(nextWorkoutDay.dayId);
                      triggerHaptic(10);
                    }}
                    className="text-[11px] font-semibold text-zinc-950 dark:text-zinc-100 underline shrink-0 hover:opacity-80 cursor-pointer"
                  >
                    Ver {nextWorkoutDay.shortName} →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Atalho ao Manual do Atleta */}
          {(() => {
            const userProfile = getSavedUserProfile();
            const userGoal = userProfile?.goal || 'athlete';
            const currentManual = ATHLETE_MANUALS[userGoal] || ATHLETE_MANUALS.athlete;

            return (
              <div 
                onClick={onOpenGuide}
                className="p-4 rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                    <BookOpen className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                      {currentManual.tag}
                    </span>
                    <h4 className="text-xs font-semibold text-zinc-950 dark:text-zinc-100 mt-0.5">
                      {currentManual.title}
                    </h4>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
              </div>
            );
          })()}

        </div>

        {/* COLUNA DIREITA: Detalhes do Treino do Dia Selecionado */}
        <div className="md:col-span-7">
          <div className="rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors shadow-xs">
            {/* Topo com Título do Treino */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-[#1a1d20]/50 flex items-start justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-[11px] uppercase tracking-wider border border-zinc-200 dark:border-zinc-700/60">
                    {selectedWorkout.name}
                  </span>
                  {selectedWorkout.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium text-[11px] border border-zinc-200 dark:border-zinc-700/60">
                      {selectedWorkout.badge}
                    </span>
                  )}
                  {currentJsDay === selectedWorkout.dayId && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-[11px]">
                      Hoje
                    </span>
                  )}
                  {isSelectedDayCompleted && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                      ✓ Efetuado
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 leading-tight">
                  {selectedWorkout.title}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                  {selectedWorkout.focus}
                </p>
              </div>

              {!selectedWorkout.isRestDay && (
                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold tabular-nums shrink-0">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 stroke-[1.8]" />
                  <span>{selectedWorkout.duration}</span>
                </div>
              )}
            </div>

            {/* Descrição & Conteúdo */}
            <div className="p-5 space-y-5">
              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                {selectedWorkout.description}
              </p>

              {/* Se for Dia de Descanso */}
              {selectedWorkout.isRestDay ? (
                <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-center space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-700">
                    <Coffee className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      Dia de Regeneração Neural e Muscular
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed mt-1">
                      A síntese proteica e a adaptação neuromuscular ocorrem prioritariamente na fase de repouso e nutrição.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                    {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
                      <button
                        onClick={() => {
                          setSelectedDayId(nextWorkoutDay.dayId);
                          triggerHaptic(15);
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Antecipar {nextWorkoutDay.name}: {nextWorkoutDay.title} ({nextWorkoutDay.exercises?.length || 0} exercícios)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('custom-workouts');
                        triggerHaptic(10);
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ListPlus className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>Iniciar Treino Personalizado</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Lista de Exercícios Prescritos */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider px-1">
                      <span>Exercícios ({selectedWorkout.exercises.length})</span>
                      <span>Séries & Carga</span>
                    </div>

                    <div className="space-y-1.5">
                      {selectedWorkout.exercises.map((ex, index) => (
                        <div
                          key={ex.id}
                          onClick={() => onViewExercise(ex)}
                          className="p-3 rounded-lg bg-zinc-50 dark:bg-[#1a1d20]/80 hover:bg-zinc-100 dark:hover:bg-[#22252a] border border-zinc-200 dark:border-zinc-800/80 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center border border-zinc-200 dark:border-zinc-700 tabular-nums shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-zinc-950 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                                {ex.name}
                              </h5>
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                <span className="font-medium">{ex.badge || ex.target}</span>
                                <span>•</span>
                                <span>{ex.equipment}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700 tabular-nums">
                              {ex.defaultSets} × {ex.suggestedReps}
                            </span>
                            <Eye className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ação Primária: Iniciar Treino */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        triggerHaptic(20);
                        onStartWorkout(selectedWorkout);
                      }}
                      className="w-full py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer min-h-[48px]"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {isSelectedDayCompleted ? 'Rever Treino Realizado' : 'Iniciar Treino'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Mapa Fisiológico de Recuperação Muscular do Atleta */}
      <MuscleRecoveryMap />

    </div>
  );
}

