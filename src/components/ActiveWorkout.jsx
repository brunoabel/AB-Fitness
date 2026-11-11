import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Check,
  Zap
} from 'lucide-react';
import ExerciseModal from './ExerciseModal';
import RestTimer from './RestTimer';
import WorkoutHeader from './workout/WorkoutHeader';
import WorkoutDock from './workout/WorkoutDock';
import ExerciseListView from './workout/ExerciseListView';
import FocusExerciseCard from './workout/FocusExerciseCard';
import SwapExerciseModal from './workout/SwapExerciseModal';
import useWorkoutTimer from '../hooks/useWorkoutTimer';
import useWorkoutDraft from '../hooks/useWorkoutDraft';
import CelebrationModal from './CelebrationModal';
import SessionCheckin from './coach/SessionCheckin';
import { registerSessionAndCheckDue } from '../utils/sessionCheckin';
import BadgeUnlockedToast from './BadgeUnlockedToast';
import PlateCalculatorModal from './PlateCalculatorModal';
import { getHomeAlternative, hasExerciseVideo as hasVerifiedExerciseVideo } from '../data/exerciseMedia';
import { AnimatePresence } from 'motion/react';
import { useWakeLock } from '../hooks/useWakeLock';
import { sound, triggerHaptic } from '../utils/audio';
import {
  getSavedWeights,
  saveExerciseWeights,
  markDayCompleted,
  saveActiveDraft,
  getActiveDraft,
  getWorkoutHistory,
  addWorkoutToHistory
} from '../utils/storage';
import { recordWorkoutCompletion, newSessionId } from '../services/workoutService';
import PostWorkoutCheckin from './trainer/PostWorkoutCheckin';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import {
  buildPrevIndex,
  getBestHistorical1RM,
  getBestHistoricalDuration,
  isTimedExercise,
  getDefaultDurationSeconds,
  e1RM,
  calculateNextSessionPrescription
} from '../utils/strengthMetrics';
import {
  buildWorkoutInsights,
  fetchCoachNarrative
} from '../services/abCoach/coachInsightsService';
import { useAuth } from '../context';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function ActiveWorkout({ workout, onBackToDashboard }) {
  const { user } = useAuth();
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);

  // Mantém ecrã ativo durante toda a sessão de treino
  useWakeLock(true);

  // Recupera rascunho ativo se for do mesmo treino
  const currentWorkoutDayId = workout?.dayId || workout?.id;
  const [activeDraft] = useState(() => {
    const draft = getActiveDraft();
    return draft && draft.workoutDayId === currentWorkoutDayId ? draft : null;
  });
  const isResumed = Boolean(activeDraft);

  // Histórico de treinos anteriores para cálculo de PRs e valores fantasma
  const [pastHistory] = useState(() => getWorkoutHistory());
  const prevIndex = useMemo(() => buildPrevIndex(pastHistory), [pastHistory]);

  // Progressão RIR/dupla progressão: uma sugestão por exercício, calculada da última sessão
  const progressionHints = useMemo(() => {
    const hints = {};
    const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
    exercisesList.forEach((ex) => {
      const prevSets = prevIndex.get(ex.id);
      if (!prevSets) return;
      const hint = calculateNextSessionPrescription(prevSets, {
        repRange: ex.repRange,
        progressionIncrementKg: ex.progressionIncrementKg
      });
      if (hint) hints[ex.id] = hint;
    });
    return hints;
  }, [prevIndex, workout]);

  // Modo Foco (ativo por defeito para máxima concentração desportiva)
  const [isFocusMode, setIsFocusMode] = useState(true);

  // Estado para armazenar as séries de cada exercício
  const [exercisesData, setExercisesData] = useState(() => {
    if (activeDraft && activeDraft.exercisesData) {
      return activeDraft.exercisesData;
    }

    const saved = getSavedWeights();
    const initial = {};
    const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
    exercisesList.forEach((ex) => {
      const isTimed = isTimedExercise(ex, ex.id);
      const defaultDuration = isTimed ? getDefaultDurationSeconds(ex, ex.id) : 10;
      const prevSets = saved[ex.id];
      if (prevSets && prevSets.length > 0) {
        initial[ex.id] = prevSets.map((s) => ({
          weight: s.weight ?? (isTimed ? 0 : (ex.suggestedWeight ?? 10)),
          reps: s.reps ?? (isTimed ? defaultDuration : (ex.suggestedReps ?? 10)),
          seconds: s.seconds ?? (isTimed ? (Number(s.reps) || defaultDuration) : undefined),
          type: s.type || 'N',
          rpe: s.rpe || null,
          completed: false,
          done: false
        }));
      } else {
        const setsCount = ex.defaultSets || 3;
        initial[ex.id] = Array.from({ length: setsCount }, () => ({
          weight: isTimed ? 0 : (ex.suggestedWeight ?? 10),
          reps: isTimed ? defaultDuration : (ex.suggestedReps ?? 10),
          seconds: isTimed ? defaultDuration : undefined,
          type: 'N',
          rpe: null,
          completed: false,
          done: false
        }));
      }
    });
    return initial;
  });

  // Histórico das cargas anteriores imediatas
  const [pastWeights] = useState(() => getSavedWeights());

  // Cronómetro do treino (ver hooks/useWorkoutTimer.js)
  const { elapsedSeconds, setIsTimerRunning, computeElapsed, timerRef } = useWorkoutTimer(activeDraft);

  // Trigger para auto-iniciar o Rest Timer ao concluir uma série
  const [restTimerTrigger, setRestTimerTrigger] = useState(0);
  const [currentRestDefault, setCurrentRestDefault] = useState(60);

  // Modais
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  // Check-in do AB Coach a cada 3 sessões: null | 'due' | 'open'
  const [checkin, setCheckin] = useState(null); // null | 'due' | 'assigned' | 'open' | 'open-assigned'
  const [checkinSessionId, setCheckinSessionId] = useState(null);

  // Aviso de fadiga muscular: se um grupo que este treino ataca ainda está >=75% fadigado
  // (get_muscle_fatigue, meia-vida por grupo), sugere +1 RIR em vez de bloquear o treino.
  const [fatigueWarning, setFatigueWarning] = useState(null);
  const [fatigueDismissed, setFatigueDismissed] = useState(false);
  useEffect(() => {
    let active = true;
    if (!user?.id || user.id === 'guest-local-user' || !isSupabaseConfigured() || !supabase) return undefined;
    supabase.rpc('get_muscle_fatigue').then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      const fatigued = data.filter((m) => Number(m.fatigue) >= 75);
      if (fatigued.length === 0) return;
      const normalize = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
      const hit = fatigued.find((m) =>
        exercisesList.some((ex) => normalize(`${ex.target || ''} ${ex.secondary || ''}`).includes(normalize(m.muscle_id)))
      );
      if (hit) setFatigueWarning(hit);
    }).catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  const [sessionNewPRs, setSessionNewPRs] = useState([]);
  const [sessionFacts, setSessionFacts] = useState(null);
  const [coachNarrative, setCoachNarrative] = useState(null);

  // Concluir é idempotente: um duplo toque não pode gravar o treino duas vezes
  const finishingRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Modo Casa: id original → exercício equivalente de casa (persistido no rascunho)
  const [homeSwaps, setHomeSwaps] = useState(() => activeDraft?.homeSwaps || {});
  // Adaptação Imediata (Máquina Ocupada)
  const [swappingExercise, setSwappingExercise] = useState(null);
  const [liveSwaps, setLiveSwaps] = useState(() => activeDraft?.liveSwaps || {});
  const [isExpressMode, setIsExpressMode] = useState(false);

  // Exercício atualmente focado
  const baseExercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const currentExercisesList = baseExercises.map((ex) => liveSwaps[ex.id] || homeSwaps[ex.id] || ex);
  const [focusedExerciseId, setFocusedExerciseId] = useState(
    workout?.exercises?.[0]?.id || null
  );

  // Rascunho do treino ativo (ver hooks/useWorkoutDraft.js)
  const draftDataRef = useWorkoutDraft({ workoutDayId: currentWorkoutDayId, exercisesData, homeSwaps, computeElapsed, timerRef, finishingRef });

  // Troca de Aparelho Ocupado (Adaptação ao Vivo com mesma porção e padrão motor)
  const handleSwapExercise = (originalEx, substitute) => {
    if (!originalEx || !substitute) return;
    setExercisesData((prev) => {
      const existing = prev[originalEx.id] || [];
      return {
        ...prev,
        [substitute.id]: existing.length > 0
          ? existing.map((s) => ({ ...s, weight: substitute.suggestedWeight || s.weight, done: false, completed: false }))
          : [{ set: 1, weight: substitute.suggestedWeight || 20, reps: 10, done: false, completed: false }]
      };
    });
    setLiveSwaps((prev) => ({ ...prev, [originalEx.id]: substitute }));
    setFocusedExerciseId(substitute.id);
    setSwappingExercise(null);
    triggerHaptic(20);
    try { sound.playSuccess(); } catch {}
  };

  const toggleExpressMode = () => {
    const next = !isExpressMode;
    setIsExpressMode(next);
    setCurrentRestDefault(next ? 45 : (activeExercise?.restTime || 60));
    triggerHaptic(15);
  };

  // Troca 1 toque entre o exercício de ginásio e o equivalente de casa (e volta)
  const toggleHomeMode = (exercise) => {
    const originalId = exercise.homeAlternativeOf;
    if (originalId) {
      setHomeSwaps(({ [originalId]: _removed, ...rest }) => rest);
      setFocusedExerciseId(originalId);
      return;
    }
    const alt = getHomeAlternative(exercise);
    if (!alt) return;
    setExercisesData((prev) => {
      if (prev[alt.id]) return prev;
      const source = prev[exercise.id] || [];
      return { ...prev, [alt.id]: source.map((s) => ({ ...s, weight: alt.suggestedWeight, done: false, completed: false })) };
    });
    setHomeSwaps((prev) => ({ ...prev, [exercise.id]: alt }));
    setFocusedExerciseId(alt.id);
  };

  // Atualização unificada de série com suporte a SetRow
  const handleSetUpdate = (exId, setIdx, updates) => {
    // Normaliza os dois campos de conclusão (retrocompatibilidade done/completed)
    const normalized = { ...updates };
    if ('done' in updates && !('completed' in updates)) normalized.completed = updates.done;
    if ('completed' in updates && !('done' in updates)) normalized.done = updates.completed;

    // Estado atual lido fora do updater: o updater tem de ser puro (o StrictMode executa-o duas vezes)
    const currentSets = draftDataRef.current.exercisesData[exId] || [];
    const prevSet = currentSets[setIdx] || {};
    const nextSets = [...currentSets];
    nextSets[setIdx] = { ...prevSet, ...normalized };

    setExercisesData((prev) => {
      const sets = [...(prev[exId] || [])];
      sets[setIdx] = { ...sets[setIdx], ...normalized };
      return { ...prev, [exId]: sets };
    });

    // Efeitos colaterais uma única vez por toque
    const wasCompleted = Boolean(prevSet.completed || prevSet.done);
    const isNowCompleted = Boolean(nextSets[setIdx].completed || nextSets[setIdx].done);
    if (!wasCompleted && isNowCompleted) {
      sound.playTick();
      const ex = currentExercisesList.find((e) => e.id === exId);
      setCurrentRestDefault(isExpressMode ? 45 : (ex?.restTime || 60));
      setRestTimerTrigger(Date.now());
    }
  };

  // Adicionar / remover série: updaters funcionais e puros (dois toques rápidos não se perdem).
  // A gravação das cargas no LocalStorage acontece no efeito de persistência abaixo.
  const handleAddSet = (exId) => {
    const ex = currentExercisesList.find((e) => e.id === exId);
    const isTimed = isTimedExercise(ex, exId);
    const defaultDuration = isTimed ? getDefaultDurationSeconds(ex, exId) : 10;

    setExercisesData((prev) => {
      const current = prev[exId] || [];
      const lastSet = current[current.length - 1];
      const newSet = {
        weight: lastSet ? (lastSet.weight ?? 0) : (isTimed ? 0 : 10),
        reps: lastSet ? (lastSet.seconds ?? lastSet.reps ?? defaultDuration) : (isTimed ? defaultDuration : 10),
        seconds: isTimed ? (lastSet?.seconds ?? lastSet?.reps ?? defaultDuration) : undefined,
        type: 'N',
        completed: false,
        done: false
      };
      return { ...prev, [exId]: [...current, newSet] };
    });
    triggerHaptic(10);
  };

  const handleRemoveSet = (exId, setIndex) => {
    setExercisesData((prev) => {
      const current = prev[exId] || [];
      if (current.length <= 1) return prev;
      return { ...prev, [exId]: current.filter((_, idx) => idx !== setIndex) };
    });
    triggerHaptic(10);
  };

  // Persistência das cargas por exercício (debounce): substitui as gravações dentro dos updaters
  const savedSetsRef = useRef(exercisesData);
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.entries(exercisesData).forEach(([exId, sets]) => {
        if (savedSetsRef.current[exId] !== sets) saveExerciseWeights(exId, sets);
      });
      savedSetsRef.current = exercisesData;
    }, 400);
    return () => clearTimeout(timer);
  }, [exercisesData]);

  // Métricas de progresso calculadas:
  // Volume efetivo e contagem de séries de trabalho EXCLUEM séries de aquecimento (type === 'W')
  // Exercícios isométricos/temporizados não multiplicam segundos por peso no volume de carga (kg)
  let totalWorkingSetsCount = 0;
  let completedWorkingSetsCount = 0;
  let totalVolumeKg = 0;

  currentExercisesList.forEach((ex) => {
    const sets = exercisesData[ex.id] || [];
    const isTimed = isTimedExercise(ex, ex.id);
    sets.forEach((s) => {
      const isDone = Boolean(s.completed || s.done);
      if (s.type !== 'W') {
        totalWorkingSetsCount++;
        if (isDone) {
          completedWorkingSetsCount++;
          if (!isTimed) {
            totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
          }
        }
      }
    });
  });

  const completionPercentage = totalWorkingSetsCount > 0
    ? Math.round((completedWorkingSetsCount / totalWorkingSetsCount) * 100)
    : 0;

  // Finalização do treino
  const handleFinishWorkout = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setIsFinishing(true);
    setIsTimerRunning(false);
    triggerHaptic([30, 80, 30]);

    markDayCompleted(currentWorkoutDayId);
    saveActiveDraft(null);

    // 1. Deteção de Novos Recordes Pessoais (PR)
    const detectedPRs = [];
    currentExercisesList.forEach((ex) => {
      const sets = exercisesData[ex.id] || [];
      const isTimed = isTimedExercise(ex, ex.id);

      if (isTimed) {
        const bestHistoricalDur = getBestHistoricalDuration(ex.id, pastHistory);
        let sessionBestDur = 0;
        let sessionBestSet = null;

        sets.forEach((s) => {
          if ((s.completed || s.done) && s.type !== 'W') {
            const dur = Number(s.seconds !== undefined ? s.seconds : s.reps) || 0;
            if (dur > sessionBestDur) {
              sessionBestDur = dur;
              sessionBestSet = s;
            }
          }
        });

        if (sessionBestDur > 0 && bestHistoricalDur && sessionBestDur > bestHistoricalDur) {
          detectedPRs.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            isTimed: true,
            duration: sessionBestDur,
            previousDuration: bestHistoricalDur,
            weight: sessionBestSet?.weight,
            reps: sessionBestDur
          });
        }
      } else {
        const bestHistorical = getBestHistorical1RM(ex.id, pastHistory);
        let sessionBestE1RM = 0;
        let sessionBestSet = null;

        sets.forEach((s) => {
          if ((s.completed || s.done) && s.type !== 'W') {
            const calc1RM = e1RM(s.weight, s.reps, s.rpe ? 10 - s.rpe : 0);
            if (calc1RM && calc1RM > sessionBestE1RM) {
              sessionBestE1RM = calc1RM;
              sessionBestSet = s;
            }
          }
        });

        if (sessionBestE1RM > 0 && bestHistorical && sessionBestE1RM > bestHistorical) {
          detectedPRs.push({
            exerciseId: ex.id,
            exerciseName: ex.name,
            e1RM: sessionBestE1RM,
            previous1RM: bestHistorical,
            weight: sessionBestSet?.weight,
            reps: sessionBestSet?.reps
          });
        }
      }
    });
    setSessionNewPRs(detectedPRs);

    // 2. Criação do registo local permanente para histórico offline
    const finalSeconds = computeElapsed();
    const now = new Date();
    const workoutTitle = workout?.title || workout?.name || 'Treino Concluído';
    const dayName = workout?.name || workout?.shortName || 'Treino';
    const workoutRecord = {
      id: `workout_${Date.now()}`,
      timestamp: Date.now(),
      completedAt: now.toISOString(),
      date: now.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      workoutDayId: currentWorkoutDayId,
      dayName,
      dayTitle: workoutTitle,
      title: workoutTitle,
      workoutTitle,
      durationMinutes: Math.max(1, Math.round(finalSeconds / 60)),
      durationSeconds: finalSeconds,
      totalSets: completedWorkingSetsCount,
      totalSetsCompleted: completedWorkingSetsCount,
      exerciseCount: currentExercisesList.length,
      totalVolumeKg,
      exercisesData,
      targetGroup: workout?.focus || 'Geral'
    };
    addWorkoutToHistory(workoutRecord);

    // 3. Cálculo Determinístico de Insights Pós-Treino
    const facts = buildWorkoutInsights(workoutRecord, pastHistory);
    setSessionFacts(facts);

    // 4. Chamada rápida à narrativa da IA do AB Coach (2 frases objetivas)
    fetchCoachNarrative(facts, workout?.title || 'Treino').then((narrative) => {
      if (narrative) setCoachNarrative(narrative);
    }).catch(() => {});

    // 5. Avaliação de medalhas
    try {
      const unlocked = evaluateAndUnlockBadges() || [];
      if (unlocked.length > 0) {
        setNewlyUnlockedBadge(unlocked[0]);
      }
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas no treino:', badgeErr);
    }

    setShowCelebration(true);
    const isAssigned = Boolean(workout?.assignedProgramId);
    if (isAssigned) {
      setCheckin('assigned');
    } else if (registerSessionAndCheckDue()) {
      setCheckin('due');
    }

    // Sincronização com o Supabase (o histórico local já foi gravado acima)
    if (user?.id) {
      const pendingSessionId = newSessionId();
      if (isAssigned) setCheckinSessionId(pendingSessionId);
      recordWorkoutCompletion({
        userId: user.id,
        workout: { ...workout, exercises: currentExercisesList },
        durationSeconds: finalSeconds,
        exercisesData,
        assignedProgramId: workout?.assignedProgramId || null,
        sessionId: pendingSessionId,
        persistLocally: false
      }).then((res) => {
        if (!res.synced && res.error) console.warn('Treino guardado só localmente:', res.error);
      });
    }
  };

  const handlePauseAndExit = () => {
    // Pausa real: congela o cronómetro (o tempo fora da app não conta) e guarda as trocas do Modo Casa
    const pausedAt = computeElapsed();
    saveActiveDraft({
      workoutDayId: currentWorkoutDayId,
      elapsedSeconds: pausedAt,
      timerBaseSeconds: pausedAt,
      timerRunningSince: null,
      exercisesData,
      homeSwaps,
    });
    triggerHaptic(15);
    onBackToDashboard();
  };

  // Navegação entre exercícios no Modo Foco
  const currentFocusedIndex = currentExercisesList.findIndex((e) => e.id === focusedExerciseId);
  const activeExercise = currentExercisesList[currentFocusedIndex] || currentExercisesList[0];

  const handlePrevExercise = () => {
    if (currentFocusedIndex > 0) {
      triggerHaptic(10);
      setFocusedExerciseId(currentExercisesList[currentFocusedIndex - 1].id);
    }
  };

  const handleNextExercise = () => {
    if (currentFocusedIndex < currentExercisesList.length - 1) {
      triggerHaptic(10);
      setFocusedExerciseId(currentExercisesList[currentFocusedIndex + 1].id);
    } else {
      handleFinishWorkout();
    }
  };

  return (
    <div className="min-h-screen bg-app text-zinc-100 pb-40 transition-colors">
      <WorkoutHeader
        elapsedSeconds={elapsedSeconds}
        completionPercentage={completionPercentage}
        isFocusMode={isFocusMode}
        onToggleFocus={() => setIsFocusMode(!isFocusMode)}
        onPause={handlePauseAndExit}
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />

      {/* Conteúdo Principal do Treino */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-48 space-y-4">
        {/* Cartão de Identificação da Sessão */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Sessão Ativa • {workout?.name || 'Treino'}
              </span>
              {isResumed && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-accent/70 text-white border border-accent-hover uppercase tracking-wider">
                  Recuperado
                </span>
              )}
              {workout?.assignedProgramId && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-accent text-white border border-accent-hover uppercase tracking-wider">
                  Prescrito por {workout.trainerName || 'o teu PT'}
                </span>
              )}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-50 leading-tight">
              {workout?.title || 'Treino do Atleta'}
            </h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              {workout?.focus || 'Sobrecarga Progressiva'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-white font-mono tabular-nums">
              {completionPercentage}%
            </div>
            <div className="text-[11px] text-zinc-400 font-medium uppercase tabular-nums">
              {completedWorkingSetsCount}/{totalWorkingSetsCount} séries
            </div>
          </div>
        </div>

        {fatigueWarning && !fatigueDismissed && (
          <div className="p-3.5 rounded-2xl bg-[#E1AD57]/10 border border-[#E1AD57]/40 flex items-start gap-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-zinc-200 leading-relaxed">
                <strong className="text-[#E1AD57] font-semibold">
                  Grupo ainda fadigado ({Math.round(fatigueWarning.fatigue)}%):
                </strong>{' '}
                este treino ataca uma zona que ainda não recuperou de uma sessão recente. Considera deixar +1 RIR nas primeiras séries.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFatigueDismissed(true)}
              className="shrink-0 text-[11px] font-semibold text-[#E1AD57] cursor-pointer"
            >
              Entendi
            </button>
          </div>
        )}

        {/* NAVEGAÇÃO RÁPIDA ENTRE EXERCÍCIOS (Carrossel Horizontal de Pílulas) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Sequência de Exercícios ({currentExercisesList.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleExpressMode}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                  isExpressMode
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
                title="Modo Express: intervalos rápidos de 45s para finalizar em 30 min"
              >
                <Zap className={`w-3 h-3 ${isExpressMode ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'}`} />
                <span>{isExpressMode ? 'Express 30m ON' : 'Express 30m'}</span>
              </button>
              <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                {isFocusMode ? 'Modo Foco' : 'Visão Geral'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {currentExercisesList.map((ex, idx) => {
              const sets = exercisesData[ex.id] || [];
              const isAllDone = sets.length > 0 && sets.every((s) => s.completed || s.done);
              const isCurrent = ex.id === (isFocusMode ? focusedExerciseId : null);
              const doneCount = sets.filter((s) => s.completed || s.done).length;

              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => {
                    setFocusedExerciseId(ex.id);
                    triggerHaptic(8);
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer min-h-[44px] ${
                    isCurrent
                      ? 'bg-zinc-800 text-white border-accent shadow-xs'
                      : isAllDone
                        ? 'bg-zinc-900/80 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-zinc-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black ${
                    isAllDone
                      ? 'bg-emerald-500 text-zinc-950'
                      : isCurrent
                        ? 'bg-accent text-white'
                        : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isAllDone ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <div className="text-left">
                    <span className="block truncate max-w-[110px] leading-tight text-[11px]">
                      {ex.name}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono block">
                      {doneCount}/{sets.length} séries
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODO FOCO: o exercício atual em evidência */}
        {isFocusMode && activeExercise && (
          <div className="space-y-4 animate-fadeIn">
            <FocusExerciseCard
              exercise={activeExercise}
              index={currentFocusedIndex}
              total={currentExercisesList.length}
              sets={exercisesData[activeExercise.id] || []}
              pastHistory={pastHistory}
              prevIndex={prevIndex}
              pastWeights={pastWeights}
              onOpenPlates={setPlateCalcWeight}
              onOpenGuide={setSelectedExerciseForModal}
              onOpenSwap={setSwappingExercise}
              onToggleHome={toggleHomeMode}
              onSetUpdate={handleSetUpdate}
              onRemoveSet={handleRemoveSet}
              onAddSet={handleAddSet}
              progressionHint={progressionHints[activeExercise.id]}
              onApplyProgressionHint={(hint) => {
                (exercisesData[activeExercise.id] || []).forEach((_, idx) => {
                  handleSetUpdate(activeExercise.id, idx, { weight: hint.suggestedWeight, reps: hint.suggestedReps });
                });
              }}
            />
          </div>
        )}

        {/* VISÃO GERAL / LISTA COMPLETA: todos os exercícios em acordeão */}
        {!isFocusMode && (
          <ExerciseListView
            exercises={currentExercisesList}
            exercisesData={exercisesData}
            expandedId={focusedExerciseId}
            onToggle={setFocusedExerciseId}
            pastHistory={pastHistory}
            prevIndex={prevIndex}
            pastWeights={pastWeights}
            hasVideo={hasVerifiedExerciseVideo}
            onOpenGuide={setSelectedExerciseForModal}
            onSetUpdate={handleSetUpdate}
            onRemoveSet={handleRemoveSet}
            onAddSet={handleAddSet}
          />
        )}
      </main>

      {/* Temporizador de Descanso Flutuante (Posicionado ACIMA da barra de navegação) */}
      <RestTimer
        initialTime={currentRestDefault}
        autoStartTrigger={restTimerTrigger}
      />

      <WorkoutDock
        index={currentFocusedIndex}
        total={currentExercisesList.length}
        exerciseName={activeExercise?.name}
        onPrev={handlePrevExercise}
        onNext={handleNextExercise}
      />

      {/* Modal de Demonstração Biomecânica */}
      <AnimatePresence>
        {selectedExerciseForModal && (
          <ExerciseModal
            key="exercise-modal"
            exercise={selectedExerciseForModal}
            onClose={() => setSelectedExerciseForModal(null)}
          />
        )}
        {swappingExercise && (
          <SwapExerciseModal
            key="swap-exercise-modal"
            exercise={swappingExercise}
            onSelectSubstitute={handleSwapExercise}
            onClose={() => setSwappingExercise(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal da Calculadora de Anilhas */}
      {plateCalcWeight !== null && (
        <PlateCalculatorModal
          initialWeight={plateCalcWeight}
          onClose={() => setPlateCalcWeight(null)}
        />
      )}

      {/* Modal de Celebração e Conclusão de Treino com AB Coach */}
      <AnimatePresence>
      {showCelebration && (
        <CelebrationModal
          key="celebration-modal"
          workout={workout}
          durationMinutes={Math.max(1, Math.round(elapsedSeconds / 60))}
          totalSetsCompleted={completedWorkingSetsCount}
          totalVolumeKg={totalVolumeKg}
          unlockedBadge={newlyUnlockedBadge}
          newPRs={sessionNewPRs}
          insights={sessionFacts}
          coachNarrative={coachNarrative}
          onClose={() => {
            setShowCelebration(false);
            if (checkin === 'due') setCheckin('open');
            else if (checkin === 'assigned') setCheckin('open-assigned');
            else onBackToDashboard();
          }}
        />
      )}
      {checkin === 'open' && (
        <SessionCheckin
          key="session-checkin"
          workout={workout}
          onDone={() => {
            setCheckin(null);
            onBackToDashboard();
          }}
        />
      )}
      {checkin === 'open-assigned' && (
        <PostWorkoutCheckin
          key="post-workout-checkin"
          sessionId={checkinSessionId}
          onDone={() => {
            setCheckin(null);
            onBackToDashboard();
          }}
        />
      )}
      </AnimatePresence>

      {/* Notificação de Conquista Desbloqueada */}
      {newlyUnlockedBadge && (
        <BadgeUnlockedToast
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}
    </div>
  );
}
