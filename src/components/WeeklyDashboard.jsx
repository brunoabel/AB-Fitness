import React, { useState } from 'react';
import { 
  Play, 
  Calendar, 
  Clock, 
  Sparkles,
  CheckCircle2, 
  ChevronRight, 
  Dumbbell, 
  Coffee, 
  Eye,
  Flame,
  Zap
} from 'lucide-react';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile } from './OnboardingModal';
import { triggerHaptic } from '../utils/audio';

export default function WeeklyDashboard({ 
  completedDays = [], 
  onStartWorkout, 
  onViewExercise,
  onOpenGuide,
  onOpenCustomize,
  schedule = WEEKLY_SCHEDULE
}) {
  // Detecta o dia da semana atual (0 = Dom, 1 = Seg, ..., 6 = Sáb)
  const [currentJsDay] = useState(() => new Date().getDay());
  const [selectedDayId, setSelectedDayId] = useState(() => new Date().getDay());

  // Encontra o treino do dia selecionado
  const selectedWorkout = schedule.find((d) => d.dayId === selectedDayId) || schedule[0];

  // Verifica se o dia selecionado já foi completado hoje
  const isSelectedDayCompleted = completedDays.some((c) => c.dayId === selectedDayId);

  // Quantos treinos da semana foram feitos
  const completedCount = completedDays.length;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fadeIn transition-colors">
      {/* Cabeçalho Executivo de Performance */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Painel de Performance
            </span>
          </div>

          {onOpenCustomize && (
            <button
              onClick={onOpenCustomize}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-sky-100 dark:border-slate-700 active:scale-95 transition-all"
              title="Personalizar seu plano de acordo com suas metas"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>Personalizar</span>
            </button>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
          Consistência e Sobrecarga Progressiva
        </h1>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Monitore séries, ajuste cargas com precisão biomecânica e acompanhe sua evolução semanal.
        </p>

        {/* Progresso Semanal Limpo */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Meta Semanal:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {completedCount} de 4 treinos concluídos
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {Math.min(100, Math.round((completedCount / 4) * 100))}%
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (completedCount / 4) * 100)}%` }}
          />
        </div>
      </div>

      {/* Seletor dos Dias da Semana */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Cronograma Semanal</span>
          </h2>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
            {currentJsDay === selectedDayId ? 'Hoje' : 'Dia Selecionado'}
          </span>
        </div>

        {/* Pílulas de Navegação por Dia da Semana */}
        <div className="grid grid-cols-7 gap-1.5">
          {schedule.map((day) => {
            const isToday = day.dayId === currentJsDay;
            const isSelected = day.dayId === selectedDayId;
            const isDone = completedDays.some((c) => c.dayId === day.dayId);

            return (
              <button
                key={day.dayId}
                onClick={() => {
                  setSelectedDayId(day.dayId);
                  triggerHaptic(10);
                }}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-between transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm font-bold'
                    : isToday
                      ? 'bg-sky-50/80 dark:bg-slate-800 border-sky-300 dark:border-sky-500/50 text-sky-800 dark:text-sky-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-200'
                }`}
              >
                <span className={`text-[10px] font-bold ${
                  isSelected ? 'text-white' : isToday ? 'text-sky-700 dark:text-sky-300' : 'text-slate-400'
                }`}>
                  {day.shortName}
                </span>

                <div className="my-1">
                  {isDone ? (
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                  ) : day.isRestDay ? (
                    <Coffee className={`w-3.5 h-3.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`} />
                  ) : (
                    <Dumbbell className={`w-3.5 h-3.5 ${isSelected ? 'text-white/80' : 'text-sky-400'}`} />
                  )}
                </div>

                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
                {!isToday && !isSelected && (
                  <span className="w-1.5 h-1.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão de Detalhes do Treino do Dia Selecionado */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Topo do Card com Título e Foco */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/60">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] uppercase tracking-wider border border-sky-200/60 dark:border-sky-800">
                {selectedWorkout.name}
              </span>
              {selectedWorkout.badge && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px] border border-slate-200/60 dark:border-slate-700">
                  {selectedWorkout.badge}
                </span>
              )}
              {currentJsDay === selectedWorkout.dayId && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200/60 dark:border-emerald-800">
                  Treino de Hoje
                </span>
              )}
              {isSelectedDayCompleted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  ✓ Concluído
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {selectedWorkout.title}
            </h3>

            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
              {selectedWorkout.focus}
            </p>
          </div>

          {!selectedWorkout.isRestDay && (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>{selectedWorkout.duration}</span>
            </div>
          )}
        </div>

        {/* Descrição e Lista de Exercícios */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {selectedWorkout.description}
          </p>

          {/* Se for Dia de Descanso */}
          {selectedWorkout.isRestDay ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 text-sky-500 dark:text-sky-400 flex items-center justify-center mx-auto shadow-xs border border-slate-200/60 dark:border-slate-600">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedWorkout.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                A regeneração muscular e adaptação neural ocorrem durante o descanso. Priorize nutrição equilibrada, hidratação constante e 7 a 9 horas de sono de qualidade.
              </p>
              <button
                onClick={onOpenGuide}
                className="mt-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Ver diretrizes de recuperação e hipertrofia →
              </button>
            </div>
          ) : (
            <>
              {/* Lista Prévia dos Exercícios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider px-1">
                  <span>Exercícios ({selectedWorkout.exercises.length})</span>
                  <span>Séries Sugeridas</span>
                </div>

                {selectedWorkout.exercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    onClick={() => onViewExercise(ex)}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center border border-slate-200/80 dark:border-slate-600 shadow-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {ex.name}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                          <span className="font-semibold text-sky-600 dark:text-sky-400">{ex.badge || ex.target}</span>
                          <span>•</span>
                          <span>{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        {ex.defaultSets}x {ex.suggestedReps}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão Principal: Iniciar Treino */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    onStartWorkout(selectedWorkout);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {isSelectedDayCompleted ? 'Revisar Treino' : 'Iniciar Treino'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Rápido: Manual Personalizado do Atleta / Objetivo */}
      {(() => {
        const userProfile = getSavedUserProfile();
        const userGoal = userProfile?.goal || 'athlete';
        const currentManual = ATHLETE_MANUALS[userGoal] || ATHLETE_MANUALS.athlete;

        return (
          <div 
            onClick={onOpenGuide}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-100 dark:border-slate-700 shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">
                  {currentManual.tag}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200 mt-0.5">
                  {currentManual.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {currentManual.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        );
      })()}
    </div>
  );
}
