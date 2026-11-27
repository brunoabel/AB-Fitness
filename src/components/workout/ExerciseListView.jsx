import React from 'react';
import { Check, Play, Eye, ChevronUp, ChevronDown, Plus, RefreshCw } from 'lucide-react';
import SetRow from '../SetRow';
import { getBestHistorical1RM, getBestHistoricalDuration, isTimedExercise } from '../../utils/strengthMetrics';
import { triggerHaptic } from '../../utils/audio';

import { displayLabel } from '../../utils/displayLabel.js';
/** Números das séries de trabalho; aquecimentos aparecem como "W". */
export function workingSetLabels(sets) {
  let n = 0;
  return sets.map((s) => (s.type === 'W' ? 'W' : ++n));
}

/** Visão geral do treino: todos os exercícios em acordeão (alternativa ao Modo Foco). */
export default function ExerciseListView({
  exercises, exercisesData, expandedId, onToggle, pastHistory, prevIndex, pastWeights,
  hasVideo, onOpenGuide, onOpenSwap, onSetUpdate, onRemoveSet, onAddSet
}) {
  return (
    <div className="space-y-3 animate-fadeIn">
      {exercises.map((exercise, exIndex) => {
        const sets = exercisesData[exercise.id] || [];
        const prevSets = prevIndex instanceof Map ? prevIndex.get(exercise.id) : prevIndex?.[exercise.id];
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
            className={`rounded-2xl border transition-colors duration-150 overflow-hidden ${
              exercise.supersetGroupId ? 'border-l-2 border-l-accent-hover ' : ''
            }${
              isExpanded ? 'bg-surface border-white/[0.12]' : 'bg-transparent border-white/[0.06]'
            }`}
          >
            <div className="p-4 flex items-center justify-between cursor-pointer transition-colors" onClick={() => onToggle(isExpanded ? null : exercise.id)}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-semibold text-sm shrink-0 tabular-nums ${
                  isCompletedAll ? 'text-emerald-400' : 'text-zinc-500'
                }`}>
                  {isCompletedAll ? <Check className="w-4 h-4 stroke-[2.25]" /> : exIndex + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-500">{displayLabel(exercise.target)}</span>
                    {exercise.supersetGroupId && (
                      <span className="px-1.5 py-0.5 rounded bg-accent/70 border border-accent-hover text-[9px] font-semibold uppercase tracking-wider text-white">
                        Bi-Set
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-semibold text-white leading-tight truncate">{exercise.name}</h2>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGuide(exercise);
                    triggerHaptic(10);
                  }}
                  className="px-3 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer min-h-[44px]"
                  title={withVideo ? 'Ver vídeo de execução técnica' : 'Ver guia biomecânico'}
                >
                  {withVideo ? (
                    <>
                      <Play className="w-3 h-3 fill-current stroke-[1.75]" />
                      <span>Vídeo</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Guia</span>
                    </>
                  )}
                </button>
                {onOpenSwap && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSwap(exercise);
                      triggerHaptic(10);
                    }}
                    aria-label="Trocar exercício"
                    title="Aparelho ocupado? Trocar exercício"
                    className="rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] active:scale-[0.98] transition-[background-color,color,transform] duration-150 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <RefreshCw className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                )}
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
                    prev={prevSets?.[setIdx] || (setIdx === 0 ? pastWeights[exercise.id]?.[0] : null)}
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
                    className="px-4 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 border border-white/[0.08] cursor-pointer min-h-[44px] active:scale-[0.98] transition-[background-color,transform] duration-150"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2]" />
                    <span>Adicionar série</span>
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
