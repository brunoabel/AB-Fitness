import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ChevronRight,
  Layers,
  Flame,
  ArrowRight,
  Play
} from 'lucide-react';
import ExerciseModal from './ExerciseModal';
import RestTimer from './RestTimer';
import CelebrationModal from './CelebrationModal';
import BadgeUnlockedToast from './BadgeUnlockedToast';
import PlateCalculatorModal from './PlateCalculatorModal';
import SetRow from './SetRow';
import { getHomeAlternative, hasExerciseVideo as hasVerifiedExerciseVideo } from '../data/exerciseMedia';
import ExerciseVideoPlayer from './video/ExerciseVideoPlayer';
import { AnimatePresence, motion } from 'motion/react';
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
import { recordWorkoutCompletion } from '../services/workoutService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import {
  buildPrevIndex,
  getBestHistorical1RM,
  e1RM
} from '../utils/strengthMetrics';
import {
  buildWorkoutInsights,
  fetchCoachNarrative
} from '../services/abCoach/coachInsightsService';
import { useAuth } from '../context';

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
      const prevSets = saved[ex.id];
      if (prevSets && prevSets.length > 0) {
        initial[ex.id] = prevSets.map((s) => ({
          weight: s.weight ?? ex.suggestedWeight ?? 10,
          reps: s.reps ?? ex.suggestedReps ?? 10,
          type: s.type || 'N',
          rpe: s.rpe || null,
          completed: false,
          done: false
        }));
      } else {
        const setsCount = ex.defaultSets || 3;
        initial[ex.id] = Array.from({ length: setsCount }, () => ({
          weight: ex.suggestedWeight ?? 10,
          reps: ex.suggestedReps ?? 10,
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

  // Cronómetro do treino baseado no relógio: base acumulada + (agora - início da contagem).
  // Não depende de setInterval contar segundos, por isso não perde tempo com o ecrã bloqueado.
  const timerRef = useRef(null);
  if (timerRef.current === null) {
    timerRef.current = {
      base: activeDraft ? (activeDraft.timerBaseSeconds ?? activeDraft.elapsedSeconds ?? 0) : 0,
      since: activeDraft?.timerRunningSince ?? Date.now()
    };
  }
  const computeElapsed = () => {
    const { base, since } = timerRef.current;
    return since ? base + Math.max(0, Math.floor((Date.now() - since) / 1000)) : base;
  };
  const [elapsedSeconds, setElapsedSeconds] = useState(computeElapsed);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const elapsedRef = useRef(elapsedSeconds);

  // Trigger para auto-iniciar o Rest Timer ao concluir uma série
  const [restTimerTrigger, setRestTimerTrigger] = useState(0);
  const [currentRestDefault, setCurrentRestDefault] = useState(60);

  // Modais
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionNewPRs, setSessionNewPRs] = useState([]);
  const [sessionFacts, setSessionFacts] = useState(null);
  const [coachNarrative, setCoachNarrative] = useState(null);

  // Concluir é idempotente: um duplo toque não pode gravar o treino duas vezes
  const finishingRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Modo Casa: id original → exercício equivalente de casa (persistido no rascunho)
  const [homeSwaps, setHomeSwaps] = useState(() => activeDraft?.homeSwaps || {});

  // Exercício atualmente focado
  const baseExercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const currentExercisesList = baseExercises.map((ex) => homeSwaps[ex.id] || ex);
  const [focusedExerciseId, setFocusedExerciseId] = useState(
    workout?.exercises?.[0]?.id || null
  );

  // Mantém elapsedRef sincronizado sem provocar re-renders
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Cronómetro: atualiza o ecrã a cada segundo e ressincroniza ao voltar à app
  useEffect(() => {
    if (!isTimerRunning) {
      timerRef.current = { base: computeElapsed(), since: null };
      return undefined;
    }
    if (!timerRef.current.since) timerRef.current = { ...timerRef.current, since: Date.now() };
    const tick = () => setElapsedSeconds(computeElapsed());
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning]);

  // Gravação automática do rascunho ativo
  useEffect(() => {
    const timer = setTimeout(() => {
      saveActiveDraft({
        workoutDayId: currentWorkoutDayId,
        elapsedSeconds: computeElapsed(),
        timerBaseSeconds: timerRef.current.base,
        timerRunningSince: timerRef.current.since,
        exercisesData,
        homeSwaps,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [currentWorkoutDayId, exercisesData, homeSwaps]);

  // Grava o rascunho de imediato quando a app vai para segundo plano ou é fechada
  // (o salvamento com atraso de 500ms pode não chegar a correr no iOS).
  const draftDataRef = useRef({ exercisesData, homeSwaps });
  draftDataRef.current = { exercisesData, homeSwaps };
  useEffect(() => {
    const flush = () => {
      if (finishingRef.current) return;
      saveActiveDraft({
        workoutDayId: currentWorkoutDayId,
        elapsedSeconds: computeElapsed(),
        timerBaseSeconds: timerRef.current.base,
        timerRunningSince: timerRef.current.since,
        ...draftDataRef.current
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkoutDayId]);

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

  // Debounce para gravação de cargas no LocalStorage ao digitar
  const weightsTimeoutRef = useRef({});
  const debouncedSaveWeights = (exId, sets) => {
    if (weightsTimeoutRef.current[exId]) {
      clearTimeout(weightsTimeoutRef.current[exId]);
    }
    weightsTimeoutRef.current[exId] = setTimeout(() => {
      saveExerciseWeights(exId, sets);
    }, 350);
  };

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Atualização unificada de série com suporte a SetRow
  const handleSetUpdate = (exId, setIdx, updates) => {
    setExercisesData((prev) => {
      const currentSets = prev[exId] || [];
      const updatedSets = [...currentSets];
      const prevSet = updatedSets[setIdx] || {};
      const newSet = { ...prevSet, ...updates };

      // Se passou para concluída/feita, dispara tick auditivo, haptic e inicia temporizador
      const wasCompleted = Boolean(prevSet.completed || prevSet.done);
      const isNowCompleted = Boolean(newSet.completed || newSet.done);

      if (!wasCompleted && isNowCompleted) {
        sound.playTick();
        const ex = currentExercisesList.find((e) => e.id === exId);
        setCurrentRestDefault(ex?.restTime || 60);
        setRestTimerTrigger(Date.now());
      }

      // Sincroniza os dois campos de conclusão para retrocompatibilidade
      if ('done' in updates && !('completed' in updates)) {
        newSet.completed = updates.done;
      }
      if ('completed' in updates && !('done' in updates)) {
        newSet.done = updates.completed;
      }

      updatedSets[setIdx] = newSet;
      debouncedSaveWeights(exId, updatedSets);
      return { ...prev, [exId]: updatedSets };
    });
  };

  // Adicionar série
  const handleAddSet = (exId) => {
    setExercisesData((prev) => {
      const current = prev[exId] || [];
      const lastSet = current[current.length - 1] || { weight: 10, reps: 10 };
      const next = {
        ...prev,
        [exId]: [
          ...current,
          {
            weight: lastSet.weight,
            reps: lastSet.reps,
            type: 'N',
            completed: false,
            done: false
          },
        ],
      };
      saveExerciseWeights(exId, next[exId]);
      return next;
    });
    triggerHaptic(10);
  };

  // Remover série
  const handleRemoveSet = (exId, setIndex) => {
    setExercisesData((prev) => {
      const current = prev[exId] || [];
      if (current.length <= 1) return prev;
      const filtered = current.filter((_, idx) => idx !== setIndex);
      const next = { ...prev, [exId]: filtered };
      saveExerciseWeights(exId, filtered);
      return next;
    });
    triggerHaptic(10);
  };

  // Métricas de progresso calculadas:
  // Volume efetivo e contagem de séries de trabalho EXCLUEM séries de aquecimento (type === 'W')
  let totalWorkingSetsCount = 0;
  let completedWorkingSetsCount = 0;
  let totalVolumeKg = 0;

  currentExercisesList.forEach((ex) => {
    const sets = exercisesData[ex.id] || [];
    sets.forEach((s) => {
      const isDone = Boolean(s.completed || s.done);
      if (s.type !== 'W') {
        totalWorkingSetsCount++;
        if (isDone) {
          completedWorkingSetsCount++;
          totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
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
    });
    setSessionNewPRs(detectedPRs);

    // 2. Criação do registo local permanente para histórico offline
    const finalSeconds = computeElapsed();
    const workoutRecord = {
      id: `workout_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      workoutDayId: currentWorkoutDayId,
      workoutTitle: workout?.title || workout?.name || 'Treino Concluído',
      durationMinutes: Math.max(1, Math.round(finalSeconds / 60)),
      durationSeconds: finalSeconds,
      totalSetsCompleted: completedWorkingSetsCount,
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

    // Sincronização com o Supabase (o histórico local já foi gravado acima)
    if (user?.id) {
      recordWorkoutCompletion({
        userId: user.id,
        workout: { ...workout, exercises: currentExercisesList },
        durationSeconds: finalSeconds,
        exercisesData,
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
      {/* Barra Superior Fixa de Controlo da Sessão */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-white/10 transition-colors pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={handlePauseAndExit}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 px-3 py-2 rounded-xl border border-white/10 active:scale-95 transition-all cursor-pointer min-h-[44px]"
            title="Pausar e regressar ao painel"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
            <span>Pausar</span>
          </button>

          {/* Cronómetro Central com Numerais Tabulares */}
          <div className="flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-1.5 rounded-xl border border-white/10 shadow-xs tabular-nums">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-wider tabular-nums text-zinc-100">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternar Modo Foco vs Lista Completa */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setIsFocusMode(!isFocusMode);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isFocusMode
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
              }`}
              title={isFocusMode ? 'Modo Foco Ativo (Toque para ver lista completa)' : 'Mudar para Modo Foco'}
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Botão Concluir Treino */}
            <button
              onClick={handleFinishWorkout}
              disabled={isFinishing}
              aria-busy={isFinishing}
              className="px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-strong text-zinc-950 font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] disabled:opacity-60 disabled:cursor-default"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Concluir</span>
            </button>
          </div>
        </div>

        {/* Linha Fina de Progresso da Sessão */}
        <div className="w-full bg-zinc-900 h-1">
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </header>

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
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                  Recuperado
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
            <div className="text-xl font-black text-accent font-mono tabular-nums">
              {completionPercentage}%
            </div>
            <div className="text-[11px] text-zinc-400 font-medium uppercase tabular-nums">
              {completedWorkingSetsCount}/{totalWorkingSetsCount} séries
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO RÁPIDA ENTRE EXERCÍCIOS (Carrossel Horizontal de Pílulas) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Sequência de Exercícios ({currentExercisesList.length})
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              {isFocusMode ? 'Modo Foco' : 'Visão Geral'}
            </span>
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
                        ? 'bg-accent text-zinc-950'
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

        {/* MODO FOCO: Mostra o exercício atual em evidência */}
        {isFocusMode && activeExercise && (
          <div className="space-y-4 animate-fadeIn">
            {(() => {
              const sets = exercisesData[activeExercise.id] || [];
              const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed || s.done);
              const best1RM = getBestHistorical1RM(activeExercise.id, pastHistory);

              // Calcula contagem sequencial para séries de trabalho excluindo warmups
              let workingCount = 0;
              const displayIndices = sets.map((s) => {
                if (s.type === 'W') return 'W';
                workingCount += 1;
                return workingCount;
              });

              // Peso atual mais recente para a calculadora de anilhas
              const latestWeight = sets.find(s => s.weight > 0)?.weight || activeExercise.suggestedWeight || 60;

              return (
                <div className={`rounded-2xl border transition-all duration-200 bg-surface shadow-md overflow-hidden ${
                  isCompletedAll ? 'border-emerald-500/40' : 'border-white/10'
                }`}>
                  {/* Cabeçalho do Exercício em Foco */}
                  <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                          Exercício #{currentFocusedIndex + 1} de {currentExercisesList.length} • {activeExercise.target}
                        </span>
                        {activeExercise.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-white/10">
                            {activeExercise.badge}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                        {activeExercise.name}
                      </h2>
                      {best1RM && (
                        <p className="text-[11px] text-zinc-400 font-medium">
                          Melhor 1RM Histórico: <strong className="text-zinc-200 font-mono">{best1RM} kg</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Calculadora de Anilhas */}
                      <button
                        type="button"
                        onClick={() => {
                          setPlateCalcWeight(latestWeight);
                          triggerHaptic(10);
                        }}
                        className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-accent border border-white/10 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Abrir Calculadora de Anilhas para a Barra"
                      >
                        <Dumbbell className="w-4 h-4 stroke-[2]" />
                      </button>

                      {/* Guia Biomecânico do Exercício / Vídeo de Execução */}
                      {(() => {
                        // No modo foco o vídeo já toca inline: este botão abre só o guia biomecânico
                        const hasVideo = false;
                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExerciseForModal(activeExercise);
                              triggerHaptic(10);
                            }}
                            className={`px-3 py-2 rounded-xl active:scale-95 transition-all cursor-pointer min-h-[44px] flex items-center gap-1.5 text-xs font-semibold border ${
                              hasVideo
                                ? 'bg-zinc-900 hover:bg-zinc-800 text-accent border-accent/30 shadow-xs'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/10'
                            }`}
                            title={hasVideo ? 'Ver vídeo de execução técnica' : 'Ver guia biomecânico'}
                          >
                            {hasVideo ? (
                              <>
                                <Play className="w-3.5 h-3.5 fill-accent text-accent" />
                                <span>Vídeo</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 stroke-[1.8]" />
                                <span>Guia</span>
                              </>
                            )}
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Vídeo de execução + Modo Casa (encolhe para mini-card ao rolar) */}
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeExercise.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="px-4 sm:px-5 pt-4"
                    >
                      <ExerciseVideoPlayer
                        exercise={activeExercise}
                        sticky
                        stickyTop={76}
                        homeMode={Boolean(activeExercise.homeAlternativeOf)}
                        canSwapHome={Boolean(activeExercise.homeAlternativeOf || getHomeAlternative(activeExercise))}
                        onToggleHome={() => toggleHomeMode(activeExercise)}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Benefício Anatómico / Desportivo */}
                  {activeExercise.soccerBenefit && (
                    <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-zinc-900/70 border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 stroke-[2]" />
                      <div className="leading-relaxed">
                        <strong className="text-zinc-100 font-semibold">Fisiologia do Atleta:</strong> {activeExercise.soccerBenefit}
                      </div>
                    </div>
                  )}

                  {/* Lista de Séries Ergonómicas */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {sets.map((set, setIdx) => {
                      const prevSet = prevIndex[activeExercise.id]?.[setIdx] || (setIdx === 0 ? pastWeights[activeExercise.id]?.[0] : null);

                      return (
                        <SetRow
                          key={setIdx}
                          exerciseId={activeExercise.id}
                          index={setIdx}
                          displayIndex={displayIndices[setIdx]}
                          set={set}
                          prev={prevSet}
                          bestHistorical1RM={best1RM}
                          onChange={(updates) => handleSetUpdate(activeExercise.id, setIdx, updates)}
                          onRemove={() => handleRemoveSet(activeExercise.id, setIdx)}
                          canRemove={sets.length > 1}
                        />
                      );
                    })}

                    {/* Botão de Adicionar Série */}
                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAddSet(activeExercise.id)}
                        className="py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-white/10 cursor-pointer min-h-[44px]"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Adicionar Série</span>
                      </button>

                      <span className="text-[11px] text-zinc-500 font-mono">
                        Descanso recomendado: <strong className="text-zinc-300 font-bold">{activeExercise.restTime || 60}s</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* VISÃO GERAL / LISTA COMPLETA: Mostra todos os exercícios em acordeão */}
        {!isFocusMode && (
          <div className="space-y-3 animate-fadeIn">
            {currentExercisesList.map((exercise, exIndex) => {
              const sets = exercisesData[exercise.id] || [];
              const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed || s.done);
              const isExpanded = focusedExerciseId === exercise.id;
              const best1RM = getBestHistorical1RM(exercise.id, pastHistory);

              let workingCount = 0;
              const displayIndices = sets.map((s) => {
                if (s.type === 'W') return 'W';
                workingCount += 1;
                return workingCount;
              });

              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl border transition-all duration-200 bg-surface shadow-xs overflow-hidden ${
                    isCompletedAll
                      ? 'border-emerald-500/40'
                      : isExpanded
                        ? 'border-zinc-500'
                        : 'border-white/10'
                  }`}
                >
                  {/* Cabeçalho */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer transition-colors"
                    onClick={() => setFocusedExerciseId(isExpanded ? null : exercise.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 tabular-nums ${
                        isCompletedAll
                          ? 'bg-emerald-500 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-200 border border-white/10'
                      }`}>
                        {isCompletedAll ? <Check className="w-4 h-4 stroke-[3]" /> : exIndex + 1}
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                          {exercise.target}
                        </span>
                        <h2 className="text-sm font-bold text-zinc-100 leading-tight">
                          {exercise.name}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const hasVideo = hasVerifiedExerciseVideo(exercise);
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedExerciseForModal(exercise);
                              triggerHaptic(10);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border active:scale-95 transition-all cursor-pointer min-h-[44px] ${
                              hasVideo
                                ? 'bg-zinc-900 hover:bg-zinc-800 text-accent border-accent/30 shadow-xs'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10'
                            }`}
                            title={hasVideo ? 'Ver vídeo de execução técnica' : 'Ver guia biomecânico'}
                          >
                            {hasVideo ? (
                              <>
                                <Play className="w-3 h-3 fill-accent text-accent" />
                                <span className="font-bold">Vídeo</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 stroke-[1.8]" />
                                <span>Guia</span>
                              </>
                            )}
                          </button>
                        );
                      })()}

                      <div className="text-zinc-500 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Tabela Aberta */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-2.5">
                      {sets.map((set, setIdx) => {
                        const prevSet = prevIndex[exercise.id]?.[setIdx] || (setIdx === 0 ? pastWeights[exercise.id]?.[0] : null);

                        return (
                          <SetRow
                            key={setIdx}
                            exerciseId={exercise.id}
                            index={setIdx}
                            displayIndex={displayIndices[setIdx]}
                            set={set}
                            prev={prevSet}
                            bestHistorical1RM={best1RM}
                            onChange={(updates) => handleSetUpdate(exercise.id, setIdx, updates)}
                            onRemove={() => handleRemoveSet(exercise.id, setIdx)}
                            canRemove={sets.length > 1}
                          />
                        );
                      })}

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleAddSet(exercise.id)}
                          className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer min-h-[40px]"
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
        )}
      </main>

      {/* Temporizador de Descanso Flutuante (Posicionado ACIMA da barra de navegação) */}
      <RestTimer
        initialTime={currentRestDefault}
        autoStartTrigger={restTimerTrigger}
      />

      {/* DOCK INFERIOR FIXO PARA O MODO FOCO & AVANÇAR EXERCÍCIO (SEMPRE DESOBSTRUÍDO) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] transition-all">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Botão Anterior */}
          <button
            type="button"
            onClick={handlePrevExercise}
            disabled={currentFocusedIndex <= 0}
            className="py-3 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs border border-white/10 active:scale-95 transition-all cursor-pointer min-h-[48px] flex items-center gap-1.5 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Anterior</span>
          </button>

          {/* Indicador Central: Exercício Atual e Total */}
          <div className="flex-1 text-center truncate px-1">
            <span className="text-[11px] font-bold text-zinc-300 font-mono tabular-nums block">
              Exercício {currentFocusedIndex + 1} de {currentExercisesList.length}
            </span>
            <span className="text-[11px] text-zinc-500 font-medium truncate block max-w-[200px] mx-auto">
              {activeExercise?.name || ''}
            </span>
          </div>

          {/* Botão Próximo ou Concluir */}
          <button
            type="button"
            onClick={handleNextExercise}
            className={`py-3 px-4 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer min-h-[48px] flex items-center gap-1.5 shadow-sm shrink-0 ${
              currentFocusedIndex >= currentExercisesList.length - 1
                ? 'bg-accent text-zinc-950 hover:bg-accent-strong'
                : 'bg-white text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <span>
              {currentFocusedIndex >= currentExercisesList.length - 1
                ? 'Concluir Treino'
                : 'Próximo Exercício'}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </footer>

      {/* Modal de Demonstração Biomecânica */}
      <AnimatePresence>
        {selectedExerciseForModal && (
          <ExerciseModal
            key="exercise-modal"
            exercise={selectedExerciseForModal}
            onClose={() => setSelectedExerciseForModal(null)}
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
