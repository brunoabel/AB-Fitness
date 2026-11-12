import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dumbbell, Eye, CheckCircle2, Plus, MessageSquareText, Shuffle, Play, ChevronUp, ChevronDown } from 'lucide-react';
import SetRow from '../SetRow';
import ExerciseVideoPlayer from '../video/ExerciseVideoPlayer';
import { workingSetLabels } from './ExerciseListView';
import { getBestHistorical1RM, getBestHistoricalDuration, formatDurationSeconds, isTimedExercise } from '../../utils/strengthMetrics';
import { getHomeAlternative } from '../../data/exerciseMedia';
import { triggerHaptic } from '../../utils/audio';

/** Estilo de destaque para as orientações de meta do treino */
const HINT_STYLE = {
  OVERLOAD: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  REP_BUMP: 'bg-white/10 border-white/20 text-white',
  MAINTAIN: 'bg-white/[0.04] border-white/[0.08] text-zinc-300',
  DELOAD: 'bg-amber-500/10 border-amber-500/30 text-amber-300'
};

const HUMAN_HINT_LABEL = {
  OVERLOAD: 'Meta de hoje: Subir carga',
  REP_BUMP: 'Meta de hoje: +1 repetição',
  MAINTAIN: 'Meta de hoje: Consolidar carga',
  DELOAD: 'Ajuste: Aliviar carga (-5%)'
};

export default function FocusExerciseCard({
  exercise, index, total, sets, pastHistory, prevIndex, pastWeights,
  onOpenPlates, onOpenGuide, onToggleHome, onOpenSwap, onSetUpdate, onRemoveSet, onAddSet,
  progressionHint, onApplyProgressionHint
}) {
  const [showVideo, setShowVideo] = useState(false);
  const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed || s.done);
  const isTimed = isTimedExercise(exercise, exercise.id);
  const best1RM = !isTimed ? getBestHistorical1RM(exercise.id, pastHistory) : null;
  const bestDuration = isTimed ? getBestHistoricalDuration(exercise.id, pastHistory) : null;
  const labels = workingSetLabels(sets);
  const latestWeight = sets.find((s) => s.weight > 0)?.weight || exercise.suggestedWeight || 60;

  // Limpa jargões de laboratório como RIR das explicações automáticas
  const cleanRationale = progressionHint?.rationale
    ? progressionHint.rationale
        .replace(/\(RIR \d+(\.\d+)?\)/g, '(com reserva de força)')
        .replace(/\(RIR 0\)/g, '(no limite)')
        .replace(/RIR 0/g, 'sem reserva')
    : '';

  return (
    <div className={`rounded-3xl border transition-all duration-200 bg-surface shadow-xl overflow-hidden ${
      isCompletedAll ? 'border-emerald-500/40' : 'border-white/[0.08]'
    }`}>
      {/* 1. CABEÇALHO DO EXERCÍCIO (HERO DO TREINO) */}
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-zinc-400">
              Exercício {index + 1} de {total} · {exercise.target}
            </span>
            {exercise.badge && (
              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 text-[10px] font-semibold border border-white/[0.08]">
                {exercise.badge}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
            {exercise.name}
          </h2>

          <div className="flex items-center gap-3 pt-0.5 text-xs text-zinc-400">
            {best1RM && (
              <span className="font-medium">
                Recorde pessoal: <strong className="text-white font-mono">{best1RM} kg</strong>
              </span>
            )}
            {bestDuration && (
              <span className="font-medium">
                Recorde de tempo: <strong className="text-white font-mono">{formatDurationSeconds(bestDuration)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Ferramentas do Atleta (Anilhas, Troca e Guia) */}
        <div className="flex items-center gap-1 shrink-0">
          {!isTimed && (
            <button
              type="button"
              onClick={() => {
                onOpenPlates(latestWeight);
                triggerHaptic(10);
              }}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-90 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Calculadora de anilhas na barra"
              aria-label="Calculadora de anilhas"
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
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] active:scale-90 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Aparelho ocupado? Trocar exercício"
              aria-label="Trocar exercício"
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
            title="Ver guia técnico completo"
          >
            <Eye className="w-4 h-4 stroke-[1.8]" />
            <span>Guia</span>
          </button>
        </div>
      </div>

      {/* 2. GAVETA INTELIGENTE DE VÍDEO (NÃO BLOQUEIA AS SÉRIES) */}
      <div className="border-b border-white/[0.06] bg-black/40">
        <button
          type="button"
          onClick={() => {
            setShowVideo(!showVideo);
            triggerHaptic(8);
          }}
          className="w-full px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-white">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </span>
            <span className="font-semibold text-zinc-300">
              {showVideo ? 'Ocultar vídeo de execução' : 'Ver vídeo de execução e postura'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-zinc-500">
            <span>{showVideo ? 'Recolher' : 'Expandir'}</span>
            {showVideo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        <AnimatePresence>
          {showVideo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden px-4 sm:px-5 pb-4 pt-1"
            >
              <ExerciseVideoPlayer
                exercise={exercise}
                sticky={false}
                homeMode={Boolean(exercise.homeAlternativeOf)}
                canSwapHome={Boolean(exercise.homeAlternativeOf || getHomeAlternative(exercise))}
                onToggleHome={() => onToggleHome(exercise)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. DIRETRIZES E METAS (DISCRETAS E HUMANAS) */}
      {progressionHint && (
        <div className={`mx-4 sm:mx-5 mt-3.5 p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${HINT_STYLE[progressionHint.type] || HINT_STYLE.MAINTAIN}`}>
          <div className="min-w-0">
            <span className="font-bold tracking-wide">
              {HUMAN_HINT_LABEL[progressionHint.type] || progressionHint.badge}
            </span>
            <p className="text-[11px] opacity-90 leading-snug mt-0.5">{cleanRationale}</p>
          </div>
          {progressionHint.type !== 'MAINTAIN' && (
            <button
              type="button"
              onClick={() => onApplyProgressionHint(progressionHint)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white text-black font-bold text-[11px] cursor-pointer hover:bg-zinc-200 active:scale-95 transition-all shadow-xs"
            >
              Aplicar
            </button>
          )}
        </div>
      )}

      {exercise.soccerBenefit && (
        <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2]" />
          <div className="leading-relaxed">
            <strong className="text-white font-semibold">Benefício atlético:</strong> {exercise.soccerBenefit}
          </div>
        </div>
      )}

      {exercise.notes && (
        <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-2xl bg-accent/15 border border-accent-hover/30 flex items-start gap-2.5 text-xs text-zinc-200">
          <MessageSquareText className="w-4 h-4 text-white shrink-0 mt-0.5 stroke-[2]" />
          <div className="leading-relaxed">
            <strong className="text-white font-semibold">Nota do treinador:</strong> {exercise.notes}
          </div>
        </div>
      )}

      {/* 4. LISTA DE SÉRIES (A AÇÃO PRINCIPAL NO ALCANCE DO POLEGAR) */}
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

        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onAddSet(exercise.id)}
            className="py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-white/[0.08] cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Adicionar Série</span>
          </button>

          <span className="text-[11px] text-zinc-400 font-mono">
            Descanso sugerido: <strong className="text-white font-bold">{exercise.restTime || 60}s</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
