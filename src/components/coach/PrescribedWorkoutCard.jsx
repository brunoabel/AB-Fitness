import React from 'react';
import {
  Bookmark,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Play,
  RefreshCw,
  Share2
} from 'lucide-react';
import { getBiomechanicalSubstitutes } from '../../services/abCoach/catalog';
import { triggerHaptic } from '../../utils/audio';

const WEEKDAYS = [
  { day: 1, label: 'Seg' },
  { day: 2, label: 'Ter' },
  { day: 3, label: 'Qua' },
  { day: 4, label: 'Qui' },
  { day: 5, label: 'Sex' },
  { day: 6, label: 'Sáb' },
  { day: 0, label: 'Dom' }
];

/** Cartão de treino prescrito pelo AB Coach com substituição biomecânica inline e ações rápidas. */
export default function PrescribedWorkoutCard({
  activeSwap,
  canSchedule,
  isExpanded,
  isSaved,
  isSharing,
  msgIndex,
  onAssignToDay,
  onSaveToWorkouts,
  onShareCard,
  onStartWorkout,
  onSwapExercise,
  onToggleDayPicker,
  onToggleExpand,
  onToggleSwap,
  onViewExercise,
  scheduledDayLabel,
  showDayPicker,
  workout
}) {
  const exercises = workout.exercicios || [];
  const visibleExercises = isExpanded ? exercises : exercises.slice(0, 3);
  const usedIds = new Set(exercises.map((item) => item.id));

  return (
    <div className="w-full bg-surface border border-white/[0.08] rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Prescrição do Treinador
          </p>
          <h4 className="text-sm font-bold text-zinc-50 leading-tight">
            {workout.nome}
          </h4>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Foco: {workout.foco}
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-300 shrink-0 tabular-nums">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{workout.duracao_min} min</span>
        </div>
      </div>

      {workout.observacoes && (
        <div className="pt-2.5 border-t border-white/[0.06] text-[11px] text-zinc-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 stroke-[2]" />
          <span>{workout.observacoes}</span>
        </div>
      )}

      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1 uppercase tracking-wider">
          <span>{exercises.length} Exercícios</span>
          <button
            type="button"
            onClick={() => onToggleExpand(msgIndex)}
            className="text-zinc-300 hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
          >
            {isExpanded ? (
              <>Menos <ChevronUp className="w-3 h-3 stroke-[2]" /></>
            ) : (
              <>Ver Detalhes <ChevronDown className="w-3 h-3 stroke-[2]" /></>
            )}
          </button>
        </div>

        <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
          {visibleExercises.map((ex, exIdx) => {
            const isThisSwapping = activeSwap?.msgIndex === msgIndex && activeSwap?.exIndex === exIdx;
            const substitutes = isThisSwapping
              ? getBiomechanicalSubstitutes(ex.id || ex.nome, usedIds)
              : [];

            return (
              <div
                key={ex.id || exIdx}
                onClick={() => onViewExercise && onViewExercise(ex)}
                className={`py-2.5 px-1 transition-all cursor-pointer ${
                  isThisSwapping ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 text-[11px] font-semibold text-zinc-500 shrink-0 tabular-nums text-center">
                      {exIdx + 1}
                    </span>
                    <span className="text-xs font-semibold text-zinc-100 truncate">
                      {ex.nome}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {ex.porcao && (
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {ex.porcao}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(10);
                        onToggleSwap(isThisSwapping ? null : { msgIndex, exIndex: exIdx, exercise: ex });
                      }}
                      title="Substituir por exercício biomecanicamente equivalente"
                      className={`tap-44 p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isThisSwapping
                          ? 'bg-accent/70 text-white border-accent-hover'
                          : 'bg-white/[0.04] hover:bg-white text-zinc-300 hover:text-black border-white/[0.08]'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 stroke-[1.8] ${isThisSwapping ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 pl-6 tabular-nums">
                  <span className="font-semibold text-zinc-200">
                    {ex.series} séries × {ex.reps} reps
                  </span>
                  <span>·</span>
                  <span>{ex.descanso_seg}s descanso</span>
                </div>

                {isThisSwapping && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2.5 pl-6 pr-1 py-2 border-l-2 border-accent-hover space-y-2 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200">
                        <RefreshCw className="w-3 h-3 stroke-[2]" />
                        <span>Substitutos Equivalentes:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleSwap(null)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded cursor-pointer"
                      >
                        Fechar
                      </button>
                    </div>

                    {substitutes.length === 0 ? (
                      <p className="text-[11px] text-zinc-400 italic py-1">
                        Não existem alternativas biomecânicas no catálogo para este perfil de movimento.
                      </p>
                    ) : (
                      <div className="divide-y divide-white/[0.06]">
                        {substitutes.map((sub) => (
                          <div key={sub.id} className="py-2 flex items-center justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-semibold text-zinc-100">
                                {sub.nome}
                              </h5>
                              <p className="text-[11px] text-zinc-400">
                                {sub.porcao || sub.grupo} · {sub.mecanica || 'Isolado'}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => onSwapExercise(msgIndex, exIdx, sub)}
                              className="px-2.5 py-1 rounded-lg bg-primary text-app text-[11px] font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                              Substituir
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações do Plano Prescrito */}
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onStartWorkout(workout)}
            className="w-full py-2.5 px-3 rounded-lg bg-primary text-app hover:bg-primary-hover font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Treino Agora</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveToWorkouts(workout, msgIndex)}
            disabled={isSaved}
            className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer min-h-[40px] ${
              isSaved
                ? 'text-zinc-500 cursor-default'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Guardado com Sucesso</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>Guardar nos Meus Treinos</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onShareCard(workout)}
          disabled={isSharing}
          className="w-full py-2 px-3 rounded-lg text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
        >
          <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>{isSharing ? 'A gerar Stories...' : 'Partilhar Treino (Stories 9:16)'}</span>
        </button>

        {canSchedule && (
          <div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onToggleDayPicker(showDayPicker ? null : msgIndex);
              }}
              className="w-full py-2 px-3 rounded-lg text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
            >
              <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>
                {scheduledDayLabel
                  ? `Associado a ${scheduledDayLabel} (alterar)`
                  : (showDayPicker ? 'Fechar Seletor de Dia' : 'Aplicar no Cronograma Semanal')}
              </span>
            </button>

            {showDayPicker && (
              <div className="mt-2 p-2.5 rounded-lg bg-surface border border-white/10 space-y-2 animate-fadeIn">
                <p className="text-[11px] font-medium text-zinc-500 text-center">
                  Aplicar em que dia da semana?
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => onAssignToDay(workout, d.day, d.label, msgIndex)}
                      className="py-1.5 text-center rounded-lg bg-white/[0.04] hover:bg-white hover:text-black border border-white/[0.08] text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
