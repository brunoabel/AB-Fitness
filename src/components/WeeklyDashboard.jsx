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
      {/* Banner de Boas-Vindas & Foco de Atleta */}
      <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-white dark:from-slate-900 via-sky-50/80 dark:via-slate-900/90 to-sky-100/40 dark:to-sky-950/30 border border-sky-100 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span className="text-[11px] font-black text-sky-700 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                AB Fitness • Treino Inteligente
              </span>
            </div>

            {onOpenCustomize && (
              <button
                onClick={onOpenCustomize}
                className="inline-flex items-center gap-1 text-[10px] font-extrabold text-sky-700 dark:text-sky-300 bg-white/90 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-sky-200/80 dark:border-slate-700 shadow-xs hover:bg-sky-50 active:scale-95 transition-all"
                title="Personalizar seu plano de acordo com suas metas"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>Personalizar</span>
              </button>
            )}
          </div>

          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-snug">
            Constância gera excelência. O seu melhor treino começa agora!
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            Exercícios com biomecânica de precisão, progressão de carga planejada e descanso científico para resultados máximos.
          </p>

          {/* Barra de Meta Semanal */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Meta Semanal:</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-black text-[11px] border border-sky-200/60 dark:border-sky-800">
                {completedCount} dias concluídos
              </span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Evolução Ativa
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-sky-400 to-sky-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (completedCount / 4) * 100)}%` }}
            />
          </div>
        </div>

        {/* Efeito decorativo de fundo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-300/20 dark:bg-sky-600/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Seletor dos Dias da Semana (Seg a Dom) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Escalação da Semana</span>
          </h2>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
            {currentJsDay === selectedDayId ? 'Hoje (No Campo & Ferro)' : 'Dia Selecionado'}
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
                    ? 'bg-gradient-to-b from-sky-400 to-sky-500 text-white border-sky-400 shadow-md shadow-sky-400/30 font-bold'
                    : isToday
                      ? 'bg-sky-50 dark:bg-slate-800 border-sky-300 dark:border-sky-500/50 text-sky-800 dark:text-sky-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-200'
                }`}
              >
                <span className={`text-[10px] font-black ${
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
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {/* Topo do Card com Cor e Título */}
        <div className="p-5 bg-gradient-to-r from-sky-50/70 dark:from-slate-800/80 via-white dark:via-slate-900 to-sky-50/40 dark:to-slate-900 border-b border-sky-100 dark:border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-black text-[10px] uppercase tracking-wider border border-sky-200/50 dark:border-sky-800">
                {selectedWorkout.name}
              </span>
              {selectedWorkout.badge && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200/50 dark:border-amber-800">
                  {selectedWorkout.badge}
                </span>
              )}
              {currentJsDay === selectedWorkout.dayId && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                  Treino de Hoje
                </span>
              )}
              {isSelectedDayCompleted && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                  ✓ Tá Pago!
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">
              {selectedWorkout.title}
            </h3>

            <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
              {selectedWorkout.focus}
            </p>
          </div>

          {!selectedWorkout.isRestDay && (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>{selectedWorkout.duration}</span>
            </div>
          )}
        </div>

        {/* Descrição e Lista de Exercícios */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {selectedWorkout.description}
          </p>

          {/* Se for Dia de Descanso / Matchday */}
          {selectedWorkout.isRestDay ? (
            <div className="p-6 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 border border-sky-100 dark:border-slate-700 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-700 text-sky-500 dark:text-sky-400 flex items-center justify-center mx-auto shadow-sm">
                <Coffee className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-slate-800 dark:text-white">
                {selectedWorkout.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                Músculo cresce no descanso e no sono anabólico! Beba pelo menos 3L de água, carboidratos limpos e durma 8 horas pra voar no gramado.
              </p>
              <button
                onClick={onOpenGuide}
                className="mt-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Ver manual de nutrição e descanso para atletas de 16 anos →
              </button>
            </div>
          ) : (
            <>
              {/* Lista Prévia dos Exercícios */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  <span>Exercícios do Dia ({selectedWorkout.exercises.length})</span>
                  <span>Séries Sugeridas</span>
                </div>

                {selectedWorkout.exercises.map((ex, index) => (
                  <div
                    key={ex.id}
                    onClick={() => onViewExercise(ex)}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 hover:bg-sky-50/60 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-sky-200 dark:hover:border-sky-500/40 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center border border-sky-100 dark:border-slate-600 shadow-xs">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {ex.name}
                          </h5>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-400">
                          <span className="font-semibold text-sky-600 dark:text-sky-400">{ex.badge || ex.target}</span>
                          <span>•</span>
                          <span>{ex.equipment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200/50 dark:border-sky-800">
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
                  className="w-full py-4 rounded-3xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-base shadow-lg shadow-sky-400/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {isSelectedDayCompleted ? 'Refazer / Alterar Cargas' : 'Iniciar Treino Agora • Bora!'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Rápido: Guia para Atleta de Futebol */}
      <div 
        onClick={onOpenGuide}
        className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-100 dark:border-slate-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Manual do Atleta: Hipertrofia & Ciência
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Diretrizes de fisiologia, periodização e sobrecarga progressiva.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}
