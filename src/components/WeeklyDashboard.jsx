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
  ListPlus,
  Plus
} from 'lucide-react';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';

export default function WeeklyDashboard({ 
  completedDays = [], 
  onStartWorkout, 
  onViewExercise,
  onOpenGuide,
  onOpenCustomize,
  onNavigateTab,
  schedule = WEEKLY_SCHEDULE
}) {
  // Detecta o dia da semana atual (0 = Dom, 1 = Seg, ..., 6 = Sáb)
  const [currentJsDay] = useState(() => new Date().getDay());
  const [selectedDayId, setSelectedDayId] = useState(() => new Date().getDay());

  const selectedWorkout = schedule.find((d) => d.dayId === selectedDayId) || schedule[0];

  // Identifica o próximo dia da semana com treino válido caso o dia selecionado seja descanso
  const nextWorkoutDay = schedule.find((d) => !d.isRestDay && d.exercises && d.exercises.length > 0) || schedule[0];

  // Verifica se o dia selecionado já foi completado hoje
  const isSelectedDayCompleted = completedDays.some((c) => (c?.dayId ?? c) === selectedDayId);

  // Quantos treinos da semana foram feitos
  const completedCount = completedDays.length;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fadeIn transition-colors">
      
      {/* Seletor Rápido: Cronograma da Semana vs Treinos Personalizados */}
      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold shadow-xs">
        <button
          type="button"
          className="flex-1 py-2 px-2.5 rounded-xl bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs flex items-center justify-center gap-1.5 cursor-default font-extrabold"
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Cronograma Semanal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigateTab) onNavigateTab('custom-workouts');
            triggerHaptic(10);
          }}
          className="flex-1 py-2 px-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold"
        >
          <ListPlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Montar Treino Personalizado</span>
        </button>
      </div>

      {/* Cabeçalho Executivo de Performance */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Painel de Performance
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (onNavigateTab) onNavigateTab('custom-workouts');
                triggerHaptic(15);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-3 py-1.5 rounded-xl border border-black dark:border-white shadow-xs active:scale-95 transition-all cursor-pointer"
              title="Criar e gerenciar treinos personalizados"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Montar Treino</span>
            </button>

            {onOpenCustomize && (
              <button
                onClick={onOpenCustomize}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer"
                title="Ajustar Metas com IA"
              >
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Metas IA</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
          Consistência e Sobrecarga Progressiva
        </h1>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
          Monitore séries, ajuste cargas com precisão biomecânica e acompanhe sua evolução semanal.
        </p>

        {/* Progresso Semanal Limpo */}
        <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Meta Semanal:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {completedCount} de 4 treinos concluídos
            </span>
          </div>
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            {Math.min(100, Math.round((completedCount / 4) * 100))}%
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
          <div 
            className="bg-black dark:bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (completedCount / 4) * 100)}%` }}
          />
        </div>
      </div>

      {/* OCULTO: Módulo Whoop/Arnold desativado a pedido do utilizador
      <div 
        onClick={() => {
          if (onNavigateTab) onNavigateTab('history');
          triggerHaptic(10);
        }}
        className="p-4 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${whoopBio.recoveryScore >= 67 ? 'bg-emerald-500' : whoopBio.recoveryScore >= 34 ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>WHOOP RECOVERY</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${whoopBio.recoveryScore >= 67 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : whoopBio.recoveryScore >= 34 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                {whoopBio.recoveryScore}%
              </span>
            </span>
          </div>

          <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Ver Biometria & Gráficos →
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex-1">
            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-[11px] leading-snug">
              {whoopRec.actionTitle}: <span className="font-normal text-zinc-500 dark:text-zinc-400">{whoopRec.description.split('.')[0]}.</span>
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] text-zinc-400 uppercase font-semibold block">Day Strain</span>
            <span className="text-xs font-black text-zinc-900 dark:text-white">{whoopBio.strain} / 21</span>
          </div>
        </div>
      </div>
      */}

      {/* Seletor dos Dias da Semana */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cronograma Semanal</span>
          </h2>
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">
            {currentJsDay === selectedDayId ? 'Hoje' : 'Dia Selecionado'}
          </span>
        </div>

        {/* Pílulas de Navegação por Dia da Semana */}
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
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-between transition-all active:scale-95 border cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm font-bold'
                    : isToday
                      ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white'
                      : 'bg-white dark:bg-[#121215] border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                }`}
              >
                <span className={`text-[10px] font-bold ${
                  isSelected ? 'text-white dark:text-black' : isToday ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                }`}>
                  {day.shortName}
                </span>

                <div className="my-1">
                  {isDone ? (
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-white dark:text-black' : 'text-emerald-500'}`} />
                  ) : day.isRestDay ? (
                    <Coffee className={`w-3.5 h-3.5 ${isSelected ? 'text-white/80 dark:text-black/80' : 'text-zinc-400'}`} />
                  ) : (
                    <Dumbbell className={`w-3.5 h-3.5 ${isSelected ? 'text-white/80 dark:text-black/80' : 'text-zinc-400'}`} />
                  )}
                </div>

                {isToday && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                )}
                {!isToday && !isSelected && (
                  <span className="w-1.5 h-1.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Alerta Explicativo se o dia selecionado for Descanso */}
        {selectedWorkout.isRestDay && (
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
            <span className="font-semibold flex items-center gap-1.5">
              <span>☕</span>
              <span><b>{selectedWorkout.name}</b> é descanso. Toque em <b>Seg</b>, <b>Ter</b>, etc. para ver os treinos.</span>
            </span>
            {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDayId(nextWorkoutDay.dayId);
                  triggerHaptic(10);
                }}
                className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-amber-500 text-black shrink-0 hover:bg-amber-400 cursor-pointer transition-all"
              >
                Ver {nextWorkoutDay.shortName} →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Banner de Acesso Rápido a Treinos Personalizados */}
      <div 
        onClick={() => {
          if (onNavigateTab) onNavigateTab('custom-workouts');
          triggerHaptic(10);
        }}
        className="p-3.5 rounded-3xl bg-linear-to-r from-sky-500/10 via-emerald-500/10 to-transparent border border-sky-500/20 dark:border-sky-500/30 hover:border-sky-500/50 shadow-xs cursor-pointer transition-all flex items-center justify-between group active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 text-sky-500 flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            <ListPlus className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Treino Personalizado
              </span>
              <span className="w-1 h-1 rounded-full bg-zinc-400" />
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                Iniciante • Médio • Avançado
              </span>
            </div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-0.5">
              Monte seu treino ou siga a planilha do seu Personal
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
              Grave séries, cargas e repetições na sua rotina sob medida.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>

      {/* Cartão de Detalhes do Treino do Dia Selecionado */}
      <div className="rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
        {/* Topo do Card com Título e Foco */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-start justify-between bg-zinc-50/70 dark:bg-zinc-900/40">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-[10px] uppercase tracking-wider border border-zinc-200/80 dark:border-zinc-700">
                {selectedWorkout.name}
              </span>
              {selectedWorkout.badge && (
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-[10px] border border-zinc-200/60 dark:border-zinc-700">
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

            <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
              {selectedWorkout.title}
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
              {selectedWorkout.focus}
            </p>
          </div>

          {!selectedWorkout.isRestDay && (
            <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold shrink-0">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>{selectedWorkout.duration}</span>
            </div>
          )}
        </div>

        {/* Descrição e Lista de Exercícios */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            {selectedWorkout.description}
          </p>

          {/* Se for Dia de Descanso */}
          {selectedWorkout.isRestDay ? (
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 text-amber-500 flex items-center justify-center mx-auto shadow-xs border border-zinc-200/60 dark:border-zinc-700">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  {selectedWorkout.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed mt-1">
                  Hoje está agendado como descanso no cronograma padrão. A hipertrofia e a regeneração neural acontecem durante a pausa.
                </p>
              </div>

              {/* Ações Rápidas para quem quer treinar hoje */}
              <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Deseja treinar hoje mesmo?
                </span>

                {nextWorkoutDay && nextWorkoutDay.dayId !== selectedWorkout.dayId && (
                  <button
                    onClick={() => {
                      setSelectedDayId(nextWorkoutDay.dayId);
                      triggerHaptic(15);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all cursor-pointer"
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
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ListPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Montar ou Iniciar Treino Personalizado</span>
                </button>
              </div>

              <button
                onClick={onOpenGuide}
                className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:underline cursor-pointer block mx-auto"
              >
                Ver diretrizes de recuperação e hipertrofia →
              </button>
            </div>
          ) : (
            <>
              {/* Lista Prévia dos Exercícios */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider px-1">
                  <span>Exercícios ({selectedWorkout.exercises.length})</span>
                  <span>Séries Sugeridas</span>
                </div>

                {selectedWorkout.exercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    onClick={() => onViewExercise(ex)}
                    className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 shadow-xs">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                          {ex.name}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-400">{ex.badge || ex.target}</span>
                          <span>•</span>
                          <span>{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
                        {ex.defaultSets}x {ex.suggestedReps}
                      </span>
                      <Eye className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors" />
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
                  className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
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
            className="p-4 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700 shadow-xs shrink-0">
                <Sparkles className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                  {currentManual.tag}
                </span>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 mt-0.5">
                  {currentManual.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {currentManual.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
          </div>
        );
      })()}
    </div>
  );

}
