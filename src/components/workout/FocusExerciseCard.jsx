import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dumbbell, Eye, CheckCircle2, Plus, MessageSquareText, Shuffle } from 'lucide-react';
import SetRow from '../SetRow';
import ExerciseVideoPlayer from '../video/ExerciseVideoPlayer';
import { workingSetLabels } from './ExerciseListView';
import { getBestHistorical1RM, getBestHistoricalDuration, formatDurationSeconds, isTimedExercise } from '../../utils/strengthMetrics';
import { getHomeAlternative } from '../../data/exerciseMedia';
import { triggerHaptic } from '../../utils/audio';

/** Card do exercício em foco: cabeçalho, vídeo com Modo Casa, séries e "Adicionar Série". */
const HINT_STYLE = {
  OVERLOAD: 'bg-[#73D083]/15 border-[#73D083]/40 text-[#73D083]',
  REP_BUMP: 'bg-accent/15 border-accent-hover/50 text-white',
  MAINTAIN: 'bg-white/[0.04] border-white/[0.08] text-zinc-300',
  DELOAD: 'bg-[#E1AD57]/15 border-[#E1AD57]/40 text-[#E1AD57]'
};

export default function FocusExerciseCard({
  exercise, index, total, sets, pastHistory, prevIndex, pastWeights,
  onOpenPlates, onOpenGuide, onToggleHome, onOpenSwap, onSetUpdate, onRemoveSet, onAddSet,
  progressionHint, onApplyProgressionHint
}) {
  const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed || s.done);
  const isTimed = isTimedExercise(exercise, exercise.id);
  const best1RM = !isTimed ? getBestHistorical1RM(exercise.id, pastHistory) : null;
  const bestDuration = isTimed ? getBestHistoricalDuration(exercise.id, pastHistory) : null;
  const labels = workingSetLabels(sets);
  const latestWeight = sets.find((s) => s.weight > 0)?.weight || exercise.suggestedWeight || 60;

  return (
    <div className={`rounded-2xl border transition-all duration-200 bg-surface shadow-md overflow-hidden ${isCompletedAll ? 'border-emerald-500/40' : 'border-white/10'}`}>
      <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              Exercício #{index + 1} de {total} • {exercise.target}
            </span>
            {exercise.badge && (
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-white/10">{exercise.badge}</span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white leading-tight">{exercise.name}</h2>
          {best1RM && (
            <p className="text-[11px] text-zinc-400 font-medium">
              Melhor 1RM Histórico: <strong className="text-zinc-200 font-mono">{best1RM} kg</strong>
            </p>
          )}
          {bestDuration && (
            <p className="text-[11px] text-zinc-400 font-medium">
              Recorde de Duração: <strong className="text-zinc-200 font-mono">{formatDurationSeconds(bestDuration)}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isTimed && (
            <button
              type="button"
              onClick={() => {
                onOpenPlates(latestWeight);
                triggerHaptic(10);
              }}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-white active:scale-90 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Abrir Calculadora de Anilhas para a Barra"
            >
              <Dumbbell className="w-4 h-4 stroke-[2]" />
            </button>
          )}
          {onOpenSwap && (
            <button
              type="button"
              onClick={() => {
                onOpenSwap(exercise);
                triggerHaptic(10);
              }}
              className="p-2.5 rounded-xl text-zinc-500 hover:text-white active:scale-90 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Trocar Aparelho (Máquina Ocupada)"
            >
              <Shuffle className="w-4 h-4 stroke-[2]" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onOpenGuide(exercise);
              triggerHaptic(10);
            }}
            className="px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08] active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 text-xs font-semibold"
            title="Ver guia biomecânico"
          >
            <Eye className="w-4 h-4 stroke-[1.8]" />
            <span>Guia</span>
          </button>
        </div>
      </div>

      {/* Vídeo de execução + Modo Casa (encolhe para mini-card ao rolar) */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={exercise.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="px-4 sm:px-5 pt-4">
          <ExerciseVideoPlayer
            exercise={exercise}
            sticky
            stickyTop={76}
            homeMode={Boolean(exercise.homeAlternativeOf)}
            canSwapHome={Boolean(exercise.homeAlternativeOf || getHomeAlternative(exercise))}
            onToggleHome={() => onToggleHome(exercise)}
          />
        </motion.div>
      </AnimatePresence>

      {exercise.soccerBenefit && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-zinc-900/70 border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2]" />
          <div className="leading-relaxed">
            <strong className="text-zinc-100 font-semibold">Fisiologia do Atleta:</strong> {exercise.soccerBenefit}
          </div>
        </div>
      )}

      {progressionHint && (
        <div className={`mx-4 sm:mx-5 mt-4 p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${HINT_STYLE[progressionHint.type] || HINT_STYLE.MAINTAIN}`}>
          <div className="min-w-0">
            <span className="font-bold tracking-wide">{progressionHint.badge}</span>
            <p className="text-[11px] opacity-90 leading-snug mt-0.5">{progressionHint.rationale}</p>
          </div>
          {progressionHint.type !== 'MAINTAIN' && (
            <button
              type="button"
              onClick={() => onApplyProgressionHint(progressionHint)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 font-semibold text-[11px] cursor-pointer transition-colors"
            >
              Aplicar
            </button>
          )}
        </div>
      )}

      {exercise.notes && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-accent/10 border border-accent-hover/40 flex items-start gap-2.5 text-xs text-zinc-200">
          <MessageSquareText className="w-4 h-4 text-white shrink-0 mt-0.5 stroke-[2]" />
          <div className="leading-relaxed">
            <strong className="text-white font-semibold">Nota do teu PT:</strong> {exercise.notes}
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-2.5">
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
            className="py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-white/10 cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Série</span>
          </button>
          <span className="text-[11px] text-zinc-500 font-mono">
            Descanso recomendado: <strong className="text-zinc-300 font-bold">{exercise.restTime || 60}s</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
