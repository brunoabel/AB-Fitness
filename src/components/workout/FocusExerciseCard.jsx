import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Check,
  Dumbbell,
  Minus,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Shuffle,
  Square,
  Trash2,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import ExerciseVideoPlayer from '../video/ExerciseVideoPlayer';
import { workingSetLabels } from './ExerciseListView';
import RirPicker, { rirFromSet, rpeFromRir } from './RirPicker';
import {
  SET_TYPES,
  SET_TYPE_ORDER,
  allowsAdditionalWeight,
  e1RM,
  formatDurationSeconds,
  getBestHistorical1RM,
  getBestHistoricalDuration,
  getDefaultDurationSeconds,
  isTimedExercise
} from '../../utils/strengthMetrics';
import { getHomeAlternative } from '../../data/exerciseMedia';
import { triggerHaptic } from '../../utils/audio';
import { getLocalFitnessProfile } from '../../services/fitnessProfileService';
import { isBeginnerProfile } from '../onboarding/profileSchema';

const HUMAN_HINT_LABEL = {
  OVERLOAD: 'Meta de hoje: Subir carga',
  REP_BUMP: 'Meta de hoje: +1 repetição',
  MAINTAIN: 'Meta de hoje: Consolidar carga',
  DELOAD: 'Ajuste: Aliviar carga (-5%)',
  MESO_DELOAD: 'Semana de deload: carga a 90%'
};

const isEmpty = (v) => v === '' || v === null || v === undefined || Number.isNaN(Number(v));

function firePrConfetti(targetEl) {
  try {
    const rect = targetEl?.getBoundingClientRect?.();
    confetti({
      particleCount: 36,
      spread: 55,
      startVelocity: 32,
      ticks: 90,
      colors: ['#ffffff', '#ffffff', '#c9d3e6'],
      origin: rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          }
        : { x: 0.5, y: 0.65 },
      disableForReducedMotion: true
    });
  } catch {}
}

export default function FocusExerciseCard({
  exercise,
  index,
  total,
  sets,
  pastHistory,
  prevIndex,
  pastWeights,
  onOpenPlates,
  onOpenGuide,
  onToggleHome,
  onOpenSwap,
  onSetUpdate,
  onRemoveSet,
  onAddSet,
  progressionHint,
  onApplyProgressionHint,
  isExpressMode = false,
  onToggleExpressMode = null,
  onNextExercise = null
}) {
  const reducedMotion = useReducedMotion();
  const [showVideo, setShowVideo] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [selectedSetIdx, setSelectedSetIdx] = useState(null);
  const [invalidWeight, setInvalidWeight] = useState(false);

  // Cronómetro ao vivo de isometria
  const [isHoldingTimer, setIsHoldingTimer] = useState(false);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(0);
  const holdIntervalRef = useRef(null);
  const holdSecRef = useRef(0);
  const weightInputRef = useRef(null);

  const isSimpleMode = isBeginnerProfile(getLocalFitnessProfile());
  const isTimed = isTimedExercise(exercise, exercise.id);
  const allowsWeight = isTimed ? allowsAdditionalWeight(exercise, exercise.id) : true;
  const defaultDuration = isTimed ? getDefaultDurationSeconds(exercise, exercise.id) : 10;
  const best1RM = !isTimed ? getBestHistorical1RM(exercise.id, pastHistory) : null;
  const bestDuration = isTimed ? getBestHistoricalDuration(exercise.id, pastHistory) : null;
  const labels = workingSetLabels(sets);
  // Última série de trabalho concluída sem registo de falha: pede quantas reps ficaram em reserva
  const rirSetIdx = isTimed
    ? -1
    : sets.reduce((last, s, i) => ((s.done || s.completed) && s.type !== 'W' && s.type !== 'F' ? i : last), -1);
  const latestWeight = sets.find((s) => s.weight > 0)?.weight || exercise.suggestedWeight || 60;
  const isLastExercise = index >= total - 1;

  // Limpeza do intervalo no unmount (o estado local reinicia por key={exercise.id})
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Fecha menu (...) com Escape
  useEffect(() => {
    if (!showMoreSheet) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowMoreSheet(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showMoreSheet]);

  const firstPendingIdx = sets.findIndex((s) => !(s.completed || s.done));
  const isAllDone = sets.length > 0 && firstPendingIdx === -1;
  const activeIdx =
    selectedSetIdx !== null && sets[selectedSetIdx]
      ? selectedSetIdx
      : firstPendingIdx >= 0
        ? firstPendingIdx
        : Math.max(0, sets.length - 1);

  const activeSet = sets[activeIdx] || null;
  const activeIsDone = Boolean(activeSet && (activeSet.completed || activeSet.done));
  const activeType = activeSet?.type || 'N';
  const activeTypeConfig = SET_TYPES[activeType] || SET_TYPES.N;

  const prevSetsForExercise = prevIndex instanceof Map ? prevIndex.get(exercise.id) : prevIndex?.[exercise.id];
  const getPrevForSet = (idx) =>
    prevSetsForExercise?.[idx] || (idx === 0 ? pastWeights[exercise.id]?.[0] : null);

  const activePrev = getPrevForSet(activeIdx);

  const formatPrevLabel = (prev) => {
    if (!prev) return null;
    if (isTimed) {
      const dur = formatDurationSeconds(prev.seconds ?? prev.reps);
      return allowsWeight && Number(prev.weight) > 0 ? `${dur} +${prev.weight}kg` : dur;
    }
    return `${prev.weight}×${prev.reps}`;
  };

  const stopHoldTimer = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHoldingTimer(false);
  };

  const toggleHoldTimer = () => {
    if (!activeSet || activeIsDone) return;
    if (isHoldingTimer) {
      stopHoldTimer();
      triggerHaptic(15);
      return;
    }
    triggerHaptic(15);
    holdSecRef.current = 0;
    setHoldTimerSeconds(0);
    setIsHoldingTimer(true);
    holdIntervalRef.current = setInterval(() => {
      holdSecRef.current += 1;
      const nextSec = holdSecRef.current;
      setHoldTimerSeconds(nextSec);
      onSetUpdate(exercise.id, activeIdx, { seconds: nextSec, reps: nextSec });
    }, 1000);
  };

  const adjustWeight = (delta) => {
    if (!activeSet || activeIsDone) return;
    triggerHaptic(8);
    setInvalidWeight(false);
    const curr = Number(activeSet.weight) || (Number(activePrev?.weight) || 0);
    const nextVal = Math.max(0, +(curr + delta).toFixed(1));
    onSetUpdate(exercise.id, activeIdx, { weight: nextVal });
  };

  const adjustReps = (delta) => {
    if (!activeSet || activeIsDone) return;
    triggerHaptic(8);
    const curr = Number(activeSet.reps) || (Number(activePrev?.reps) || 0);
    onSetUpdate(exercise.id, activeIdx, { reps: Math.max(1, curr + delta) });
  };

  const adjustDuration = (delta) => {
    if (!activeSet || activeIsDone) return;
    triggerHaptic(8);
    const rawVal = activeSet.seconds !== undefined ? activeSet.seconds : activeSet.reps;
    const curr = Number(rawVal) || (Number(activePrev?.seconds ?? activePrev?.reps) || defaultDuration);
    const nextVal = Math.max(5, curr + delta);
    onSetUpdate(exercise.id, activeIdx, { seconds: nextVal, reps: nextVal });
  };

  const cycleSetType = () => {
    if (!activeSet || activeIsDone) return;
    triggerHaptic(12);
    const nextIdx = (SET_TYPE_ORDER.indexOf(activeType) + 1) % SET_TYPE_ORDER.length;
    const nextType = SET_TYPE_ORDER[nextIdx];
    const updates = { type: nextType };

    if (nextType === 'D' && activePrev) {
      if (isTimed) {
        const prevDur = Number(activePrev.seconds !== undefined ? activePrev.seconds : activePrev.reps) || defaultDuration;
        const dropDur = Math.max(10, Math.round((prevDur * 0.8) / 5) * 5);
        updates.seconds = dropDur;
        updates.reps = dropDur;
      } else if (activePrev.weight) {
        updates.weight = Math.round((Number(activePrev.weight) * 0.8) * 2) / 2;
      }
    }
    if (nextType === 'F') updates.rpe = 10;
    onSetUpdate(exercise.id, activeIdx, updates);
  };

  const applyPreviousToActive = () => {
    if (!activePrev || activeIsDone) return;
    triggerHaptic(15);
    setInvalidWeight(false);
    if (isTimed) {
      const prevDur = activePrev.seconds !== undefined ? activePrev.seconds : activePrev.reps;
      onSetUpdate(exercise.id, activeIdx, {
        weight: allowsWeight ? (activePrev.weight ?? 0) : 0,
        seconds: prevDur,
        reps: prevDur
      });
    } else {
      onSetUpdate(exercise.id, activeIdx, {
        weight: activePrev.weight,
        reps: activePrev.reps
      });
    }
  };

  const handleToggleSetDone = (targetIdx, event) => {
    const targetSet = sets[targetIdx];
    if (!targetSet) return;
    const targetDone = Boolean(targetSet.done || targetSet.completed);
    const targetType = targetSet.type || 'N';
    const targetPrev = getPrevForSet(targetIdx);

    if (targetDone) {
      triggerHaptic(10);
      onSetUpdate(exercise.id, targetIdx, { done: false, completed: false });
      return;
    }

    if (targetIdx === activeIdx && isHoldingTimer) {
      stopHoldTimer();
    }

    if (isTimed) {
      const prevSec = targetPrev?.seconds !== undefined ? targetPrev?.seconds : targetPrev?.reps;
      const rawSec = targetSet.seconds !== undefined ? targetSet.seconds : targetSet.reps;
      const duration =
        isEmpty(rawSec) || Number(rawSec) < 1
          ? Number(prevSec || defaultDuration)
          : Number(rawSec);
      const finalWeight = allowsWeight
        ? isEmpty(targetSet.weight)
          ? targetPrev?.weight !== undefined
            ? Number(targetPrev.weight)
            : 0
          : Number(targetSet.weight)
        : 0;

      const willBePR =
        targetType !== 'W' && duration && bestDuration && duration > bestDuration;
      if (willBePR) {
        triggerHaptic([20, 40, 20, 40, 60]);
        firePrConfetti(event?.currentTarget);
      } else {
        triggerHaptic(25);
      }

      onSetUpdate(exercise.id, targetIdx, {
        weight: finalWeight,
        seconds: duration,
        reps: duration,
        done: true,
        completed: true
      });
      setSelectedSetIdx(null);
      return;
    }

    const weight = isEmpty(targetSet.weight) ? targetPrev?.weight : targetSet.weight;
    const reps = isEmpty(targetSet.reps) || Number(targetSet.reps) < 1 ? targetPrev?.reps : targetSet.reps;

    if (isEmpty(weight) || isEmpty(reps) || Number(reps) < 1) {
      triggerHaptic([30, 60, 30]);
      setSelectedSetIdx(targetIdx);
      setInvalidWeight(true);
      requestAnimationFrame(() => weightInputRef.current?.focus());
      return;
    }

    const finalWeight = Number(weight);
    const finalReps = Number(reps);
    const finalE1RM = e1RM(finalWeight, finalReps, targetSet.rpe ? 10 - targetSet.rpe : 0);
    const willBePR = targetType !== 'W' && finalE1RM && best1RM && finalE1RM > best1RM;

    if (willBePR) {
      triggerHaptic([20, 40, 20, 40, 60]);
      firePrConfetti(event?.currentTarget);
    } else {
      triggerHaptic(25);
    }

    setInvalidWeight(false);
    onSetUpdate(exercise.id, targetIdx, {
      weight: finalWeight,
      reps: finalReps,
      done: true,
      completed: true
    });
    setSelectedSetIdx(null);
  };

  // Limpa jargões de laboratório como RIR das explicações automáticas
  const cleanRationale = progressionHint?.rationale
    ? progressionHint.rationale
        .replace(/\(RIR \d+(\.\d+)?\)/g, '(com reserva de força)')
        .replace(/\(RIR 0\)/g, '(no limite)')
        .replace(/RIR 0/g, 'sem reserva')
    : '';

  const showActionableHint = Boolean(progressionHint && progressionHint.type !== 'MAINTAIN');
  const activeDurationValue =
    activeSet?.seconds !== undefined ? activeSet.seconds : activeSet?.reps ?? '';
  const showCompletedSummaryHero = isAllDone && selectedSetIdx === null;

  return (
    <div className="space-y-5">
      {/* 1. CABEÇALHO EDITORIAL ABERTO NO FUNDO PRETO PURO */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="space-y-1 min-w-0">
          {exercise.target && (
            <span className="block text-xs font-medium text-zinc-400 truncate">{exercise.target}</span>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            {exercise.name}
          </h2>

          {(best1RM || bestDuration) && (
            <div className="flex items-center gap-3 pt-0.5 text-xs text-zinc-400">
              {best1RM && (
                <span>
                  Recorde pessoal:{' '}
                  <strong className="text-white font-display tabular-nums">{best1RM} kg</strong>
                </span>
              )}
              {bestDuration && (
                <span>
                  Recorde de tempo:{' '}
                  <strong className="text-white font-display tabular-nums">
                    {formatDurationSeconds(bestDuration)}
                  </strong>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={() => {
              setShowVideo((prev) => !prev);
              triggerHaptic(8);
            }}
            aria-expanded={showVideo}
            className={`px-3 py-2 rounded-full border active:scale-[0.97] transition-[color,background-color,border-color,transform] duration-150 ease-out cursor-pointer min-h-[44px] flex items-center gap-1.5 text-xs font-semibold ${
              showVideo
                ? 'bg-accent text-white border-accent-hover'
                : 'bg-white/[0.04] text-zinc-200 border-white/[0.08] hover:border-white/[0.16]'
            }`}
            title={showVideo ? 'Ocultar vídeo de execução' : 'Ver vídeo de execução'}
          >
            <Play className="w-3.5 h-3.5 fill-current stroke-[1.75]" />
            <span>Vídeo</span>
          </button>

          {onOpenSwap && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                onOpenSwap(exercise);
              }}
              aria-label="Trocar exercício"
              title="Aparelho ocupado? Trocar exercício"
              className="p-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16] active:scale-[0.97] transition-[color,border-color,transform] duration-150 ease-out cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 stroke-[1.75]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowMoreSheet(true);
              triggerHaptic(8);
            }}
            aria-label="Mais ferramentas do exercício"
            title="Ferramentas e opções"
            className="p-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16] active:scale-[0.97] transition-[color,border-color,transform] duration-150 ease-out cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <MoreHorizontal className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      </div>

      {/* 2. GAVETA RETRÁTIL DE VÍDEO */}
      <AnimatePresence initial={false}>
        {showVideo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
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

      {/* 3. DIRETRIZES ACIONÁVEIS E NOTA DO PT */}
      {showActionableHint && (
        <div className="bg-surface-2/80 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <span className="font-semibold text-white">
              {HUMAN_HINT_LABEL[progressionHint.type] || progressionHint.badge}
            </span>
            {cleanRationale && (
              <p className="text-[11px] text-zinc-300 leading-snug mt-0.5">{cleanRationale}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onApplyProgressionHint(progressionHint)}
            className="shrink-0 min-h-[36px] px-3.5 rounded-full bg-primary text-app font-semibold text-xs cursor-pointer hover:bg-zinc-200 active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out tap-44"
          >
            Aplicar
          </button>
        </div>
      )}

      {exercise.notes && (
        <div className="border-l-2 border-accent-hover pl-3 py-0.5 text-xs text-zinc-300 leading-relaxed">
          <strong className="text-white font-semibold">Nota do treinador:</strong> {exercise.notes}
        </div>
      )}

      {/* 4. PALCO DA SÉRIE ATIVA (ACTIVE SET STAGE ESTILO MOTRA) */}
      {showCompletedSummaryHero ? (
        <div className="rounded-3xl bg-surface-2/70 border border-accent-hover p-5 text-center space-y-3.5">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
            <Check className="w-4 h-4 stroke-[2.25]" />
            Séries concluídas
          </p>
          <p className="text-xs text-zinc-400">Toca numa série para a ajustar.</p>
          {onNextExercise && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(12);
                onNextExercise();
              }}
              className="w-full py-3.5 rounded-full bg-primary text-app hover:bg-zinc-200 font-semibold text-sm active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out cursor-pointer min-h-[52px]"
            >
              {isLastExercise ? 'Concluir treino' : 'Próximo exercício'}
            </button>
          )}
        </div>
      ) : (
        activeSet && (
          <div className="rounded-3xl bg-surface-2/70 border border-accent-hover p-5 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeIdx}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: reducedMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                {/* Linha de topo do Hero */}
                <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-white tabular-nums">
                  Série {labels[activeIdx]} de {sets.length}
                </span>
                {!isSimpleMode && (
                  <button
                    type="button"
                    onClick={cycleSetType}
                    disabled={activeIsDone}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.06] border border-white/[0.1] text-zinc-200 hover:border-white/25 disabled:opacity-50 cursor-pointer transition-colors tap-44"
                    title={`Tipo: ${activeTypeConfig.title}`}
                  >
                    {activeType === 'N'
                      ? 'Normal'
                      : activeType === 'W'
                        ? 'Aquec.'
                        : activeType === 'D'
                          ? 'Drop'
                          : 'Falha'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activePrev && !activeIsDone && (
                  <button
                    type="button"
                    onClick={applyPreviousToActive}
                    className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-medium text-zinc-300 hover:text-white tabular-nums cursor-pointer active:scale-[0.98] transition-[background-color,color,transform] duration-150 ease-out tap-44"
                  >
                    Última: {formatPrevLabel(activePrev)}
                  </button>
                )}
                {sets.length > 1 && !activeIsDone && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      onRemoveSet(exercise.id, activeIdx);
                      setSelectedSetIdx(null);
                    }}
                    aria-label="Eliminar série"
                    title="Eliminar série"
                    className="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-full text-zinc-500 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                  </button>
                )}
              </div>
            </div>

            {/* Mostradores numéricos limpos lado a lado */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 items-end">
              {/* Coluna Carga */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  {isTimed && !allowsWeight ? 'Modalidade' : `Carga (${isTimed ? '+kg' : 'kg'})`}
                </span>
                {isTimed && !allowsWeight ? (
                  <div className="h-12 flex items-center justify-center text-lg font-display font-semibold text-zinc-300">
                    Peso Livre
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => adjustWeight(-2.5)}
                      disabled={activeIsDone}
                      aria-label="Diminuir 2,5 kg"
                      className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4 stroke-[2]" />
                    </button>
                    <input
                      ref={weightInputRef}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={500}
                      step="0.5"
                      disabled={activeIsDone}
                      value={activeSet.weight ?? ''}
                      placeholder={
                        activePrev?.weight !== undefined ? String(activePrev.weight) : isTimed ? '0' : '—'
                      }
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        setInvalidWeight(false);
                        onSetUpdate(exercise.id, activeIdx, { weight: e.target.value });
                      }}
                      aria-label="Carga em quilogramas"
                      className={`w-full max-w-[92px] h-12 bg-transparent text-center font-display text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white placeholder:text-zinc-600 focus:outline-none rounded-xl ${
                        invalidWeight ? 'ring-2 ring-red-500' : 'focus:bg-white/[0.04]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => adjustWeight(2.5)}
                      disabled={activeIsDone}
                      aria-label="Aumentar 2,5 kg"
                      className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                )}
              </div>

              {/* Coluna Reps ou Tempo */}
              <div className="flex flex-col items-center space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                  {isTimed ? 'Tempo (seg)' : 'Repetições'}
                </span>
                {isTimed ? (
                  <div className="flex flex-col items-center gap-1.5 w-full">
                    <div className="flex items-center justify-center gap-1.5 w-full">
                      <button
                        type="button"
                        onClick={() => adjustDuration(-5)}
                        disabled={activeIsDone}
                        aria-label="Diminuir 5 segundos"
                        className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                      >
                        <Minus className="w-4 h-4 stroke-[2]" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={3600}
                        step="5"
                        disabled={activeIsDone}
                        value={activeDurationValue}
                        placeholder={
                          activePrev?.seconds !== undefined
                            ? String(activePrev.seconds)
                            : activePrev?.reps !== undefined
                              ? String(activePrev.reps)
                              : String(defaultDuration)
                        }
                        onFocus={(e) => e.target.select()}
                        onChange={(e) =>
                          onSetUpdate(exercise.id, activeIdx, {
                            seconds: e.target.value,
                            reps: e.target.value
                          })
                        }
                        aria-label="Duração em segundos"
                        className="w-full max-w-[92px] h-12 bg-transparent text-center font-display text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white placeholder:text-zinc-600 focus:outline-none focus:bg-white/[0.04] rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => adjustDuration(5)}
                        disabled={activeIsDone}
                        aria-label="Aumentar 5 segundos"
                        className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                      >
                        <Plus className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                    {!activeIsDone && (
                      <button
                        type="button"
                        onClick={toggleHoldTimer}
                        className={`inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full text-xs font-semibold border cursor-pointer transition-[background-color,border-color] duration-150 ease-out ${
                          isHoldingTimer
                            ? 'bg-accent border-accent-hover text-white'
                            : 'bg-transparent border-white/[0.1] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {isHoldingTimer ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-white" />
                            <span className="tabular-nums">{holdTimerSeconds}s · Parar</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Cronometrar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => adjustReps(-1)}
                      disabled={activeIsDone}
                      aria-label="Diminuir 1 repetição"
                      className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                    >
                      <Minus className="w-4 h-4 stroke-[2]" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={200}
                      disabled={activeIsDone}
                      value={activeSet.reps ?? ''}
                      placeholder={activePrev?.reps !== undefined ? String(activePrev.reps) : '—'}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onSetUpdate(exercise.id, activeIdx, { reps: e.target.value })}
                      aria-label="Repetições"
                      className="w-full max-w-[92px] h-12 bg-transparent text-center font-display text-3xl sm:text-4xl font-bold tracking-tight tabular-nums text-white placeholder:text-zinc-600 focus:outline-none focus:bg-white/[0.04] rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => adjustReps(1)}
                      disabled={activeIsDone}
                      aria-label="Aumentar 1 repetição"
                      className="w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 flex items-center justify-center shrink-0 touch-manipulation active:scale-[0.94] transition-[background-color,transform] duration-150 ease-out cursor-pointer disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

                {/* UM único CTA primário no Hero */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSetDone(activeIdx, e)}
                  className={`w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 min-h-[52px] active:scale-[0.98] transition-[background-color,border-color,color,transform] duration-150 ease-out cursor-pointer ${
                    activeIsDone
                      ? 'bg-accent/50 border border-accent-hover text-white hover:bg-accent/70'
                      : 'bg-primary text-app hover:bg-zinc-200'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.25]" />
                  <span>
                    {activeIsDone
                      ? `Desmarcar série ${labels[activeIdx]}`
                      : `Concluir série ${labels[activeIdx]}`}
                  </span>
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        )
      )}

      {rirSetIdx !== -1 && (
        <div className="border-t border-white/[0.06] pt-4">
          <RirPicker
            label={`Série ${labels[rirSetIdx]}: quantas reps mais conseguias fazer?`}
            value={rirFromSet(sets[rirSetIdx])}
            target={Number.isFinite(Number(exercise.targetRir)) ? Number(exercise.targetRir) : null}
            onChange={(rir) => onSetUpdate(exercise.id, rirSetIdx, { rpe: rpeFromRir(rir) })}
          />
        </div>
      )}

      {/* 5. LISTA AGRUPADA ESTILO IOS (COMPACTA E ESCANEÁVEL) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Séries
          </span>
          <span className="text-[11px] text-zinc-400 tabular-nums">
            Descanso {exercise.restTime || 60}s
          </span>
        </div>

        <div className="bg-surface border border-white/[0.06] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
          {sets.map((set, idx) => {
            const isRowDone = Boolean(set.done || set.completed);
            const isSelected = !showCompletedSummaryHero && idx === activeIdx;
            const rowPrev = getPrevForSet(idx);
            const rowType = set.type || 'N';
            const rowDur = set.seconds !== undefined ? set.seconds : set.reps;
            const rowE1RM = !isTimed ? e1RM(set.weight, set.reps, set.rpe ? 10 - set.rpe : 0) : null;
            const isRowPR = Boolean(
              isRowDone &&
                rowType !== 'W' &&
                ((!isTimed && rowE1RM && best1RM && rowE1RM > best1RM) ||
                  (isTimed && Number(rowDur) > 0 && bestDuration && Number(rowDur) > bestDuration))
            );

            const hasWeight = !isEmpty(set.weight);
            const hasRepsOrDur = isTimed
              ? !isEmpty(rowDur) && Number(rowDur) > 0
              : !isEmpty(set.reps) && Number(set.reps) > 0;

            const metricText = isTimed
              ? hasRepsOrDur
                ? `${formatDurationSeconds(Number(rowDur))}${allowsWeight && Number(set.weight) > 0 ? ` +${set.weight}kg` : ''}`
                : rowPrev
                  ? `Ant: ${formatPrevLabel(rowPrev)}`
                  : `${formatDurationSeconds(defaultDuration)}`
              : hasWeight || hasRepsOrDur
                ? `${hasWeight ? set.weight : rowPrev?.weight ?? '—'} kg × ${hasRepsOrDur ? set.reps : rowPrev?.reps ?? '—'}`
                : rowPrev
                  ? `Ant: ${formatPrevLabel(rowPrev)}`
                  : 'A preencher';

            return (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedSetIdx(idx);
                  setInvalidWeight(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedSetIdx(idx);
                  }
                }}
                className={`min-h-[52px] px-4 py-2 flex items-center justify-between gap-3 cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? 'bg-accent/20 border-l-2 border-accent-hover'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 text-xs font-display font-semibold tabular-nums ${
                      isRowDone ? 'text-white' : isSelected ? 'text-zinc-200' : 'text-zinc-500'
                    }`}
                  >
                    {labels[idx]}
                  </span>
                  {!isSimpleMode && rowType !== 'N' && (
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-semibold text-zinc-300">
                      {rowType === 'W' ? 'Aquec.' : rowType === 'D' ? 'Drop' : 'Falha'}
                    </span>
                  )}
                  {isRowPR && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/60 border border-accent-hover text-[10px] font-semibold text-white">
                      <Trophy className="w-2.5 h-2.5" />
                      <span>PR</span>
                    </span>
                  )}
                </div>

                <span
                  className={`text-sm font-display tabular-nums ${
                    isRowDone || hasWeight || hasRepsOrDur ? 'text-white font-semibold' : 'text-zinc-500'
                  }`}
                >
                  {metricText}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSetDone(idx, e);
                  }}
                  aria-label={isRowDone ? `Desmarcar série ${labels[idx]}` : `Concluir série ${labels[idx]}`}
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center cursor-pointer"
                >
                  <span
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-[background-color,border-color] duration-150 ease-out ${
                      isRowDone
                        ? 'bg-accent border-accent-hover text-white'
                        : 'bg-transparent border-white/25 text-transparent hover:border-white/60'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onAddSet(exercise.id);
              setSelectedSetIdx(sets.length);
            }}
            className="w-full min-h-[48px] px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.03] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2]" />
            <span>Adicionar série</span>
          </button>
        </div>
      </div>

      {/* 6. ACTION SHEET ESTILO IOS PARA FERRAMENTAS SECUNDÁRIAS */}
      <AnimatePresence>
        {showMoreSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16, ease: 'easeOut' }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowMoreSheet(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Ferramentas para ${exercise.name}`}
              initial={{ y: reducedMotion ? 0 : 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reducedMotion ? 0 : 20, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] space-y-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-1">
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Ferramentas
                  </span>
                  <h3 className="text-base font-bold text-white truncate">{exercise.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMoreSheet(false)}
                  aria-label="Fechar ferramentas"
                  className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreSheet(false);
                    onOpenGuide(exercise);
                    triggerHaptic(10);
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-white/[0.06] text-left flex items-center gap-3 text-sm font-medium text-white cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out"
                >
                  <BookOpen className="w-4 h-4 text-zinc-300 stroke-[1.75] shrink-0" />
                  <span>Ver guia técnico completo</span>
                </button>

                {!isTimed && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreSheet(false);
                      onOpenPlates(latestWeight);
                      triggerHaptic(10);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-white/[0.06] text-left flex items-center gap-3 text-sm font-medium text-white cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out"
                  >
                    <Dumbbell className="w-4 h-4 text-zinc-300 stroke-[1.75] shrink-0" />
                    <span>Calculadora de anilhas ({latestWeight} kg)</span>
                  </button>
                )}

                {onOpenSwap && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreSheet(false);
                      onOpenSwap(exercise);
                      triggerHaptic(10);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-white/[0.06] text-left flex items-center gap-3 text-sm font-medium text-white cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150 ease-out"
                  >
                    <Shuffle className="w-4 h-4 text-zinc-300 stroke-[1.75] shrink-0" />
                    <span>Aparelho ocupado? Trocar exercício</span>
                  </button>
                )}

                {onToggleExpressMode && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleExpressMode();
                      triggerHaptic(10);
                      setShowMoreSheet(false);
                    }}
                    className={`w-full px-4 py-3 rounded-2xl border text-left flex items-center justify-between gap-3 text-sm font-medium cursor-pointer active:scale-[0.98] transition-[background-color,border-color,transform] duration-150 ease-out ${
                      isExpressMode
                        ? 'bg-accent/60 border-accent-hover text-white'
                        : 'bg-surface-2 hover:bg-surface-3 border-white/[0.06] text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-zinc-300 stroke-[1.75] shrink-0" />
                      <span>Modo Express 30m (45s de descanso)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-zinc-300">
                      {isExpressMode ? 'Ativo' : 'Desativado'}
                    </span>
                  </button>
                )}
              </div>

              {exercise.soccerBenefit && (
                <div className="pt-2 border-t border-white/[0.06] text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-white font-semibold">Benefício atlético:</strong>{' '}
                  {exercise.soccerBenefit}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
