import React from 'react';
import { Check, Play, Eye, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import SetRow from '../SetRow';
import { getBestHistorical1RM, getBestHistoricalDuration, isTimedExercise } from '../../utils/strengthMetrics';
import { triggerHaptic } from '../../utils/audio';

/** Números das séries de trabalho; aquecimentos aparecem como "W". */
export function workingSetLabels(sets) {
  let n = 0;
  return sets.map((s) => (s.type === 'W' ? 'W' : ++n));
}

/** Visão geral do treino: todos os exercícios em acordeão (alternativa ao Modo Foco). */
export default function ExerciseListView({
  exercises, exercisesData, expandedId, onToggle, pastHistory, prevIndex, pastWeights,
  hasVideo, onOpenGuide, onSetUpdate, onRemoveSet, onAddSet
}) {
  return (
    <div className="space-y-3 animate-fadeIn">
      {exercises.map((exercise, exIndex) => {
        const sets = exercisesData[exercise.id] || [];
        const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed || s.done);
        const isExpanded = expandedId === exercise.id;
        const isTimed = isTimedExercise(exercise, exercise.id);
        const best1RM = !isTimed ? getBestHistorical1RM(exercise.id, pastHistory) : null;
        const bestDuration = isTimed ? getBestHistoricalDuration(exercise.id, pastHistory) : null;
        const labels = workingSetLabels(sets);
        const withVideo = hasVideo(exercise);

        return (
          <div
            key={exercise.id}
            className={`rounded-2xl border transition-all duration-200 bg-surface shadow-xs overflow-hidden ${
              isCompletedAll ? 'border-emerald-500/40' : isExpanded ? 'border-zinc-500' : 'border-white/10'
            }`}
          >
            <div className="p-4 flex items-center justify-between cursor-pointer transition-colors" onClick={() => onToggle(isExpanded ? null : exercise.id)}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm shrink-0 tabular-nums ${
                  isCompletedAll ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-500'
                }`}>
                  {isCompletedAll ? <Check className="w-4 h-4 stroke-[3]" /> : exIndex + 1}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">{exercise.target}</span>
                  <h2 className="text-sm font-bold text-zinc-100 leading-tight">{exercise.name}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGuide(exercise);
                    triggerHaptic(10);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border active:scale-95 transition-all cursor-pointer min-h-[44px] ${
                    withVideo ? 'bg-zinc-900 hover:bg-zinc-800 text-white border-accent-hover shadow-xs' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
                  }`}
                  title={withVideo ? 'Ver vídeo de execução técnica' : 'Ver guia biomecânico'}
                >
                  {withVideo ? (
                    <>
                      <Play className="w-3 h-3 fill-accent text-white" />
                      <span className="font-bold">Vídeo</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                      <span>Guia</span>
                    </>
                  )}
                </button>
                <div className="text-zinc-500 p-1">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-2.5">
                {sets.map((set, setIdx) => (
                  <SetRow
                    key={setIdx}
                    exerciseId={exercise.id}
                    exercise={exercise}
                    index={setIdx}
                    displayIndex={labels[setIdx]}
                    set={set}
                    prev={prevIndex[exercise.id]?.[setIdx] || (setIdx === 0 ? pastWeights[exercise.id]?.[0] : null)}
                    bestHistorical1RM={best1RM}
                    bestHistoricalDuration={bestDuration}
                    onChange={(updates) => onSetUpdate(exercise.id, setIdx, updates)}
                    onRemove={() => onRemoveSet(exercise.id, setIdx)}
                    canRemove={sets.length > 1}
                  />
                ))}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onAddSet(exercise.id)}
                    className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer min-h-[44px]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Adicionar Série</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
