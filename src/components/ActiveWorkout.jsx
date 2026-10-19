import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import ExerciseModal from './ExerciseModal';
import RestTimer from './RestTimer';
import CelebrationModal from './CelebrationModal';
import BadgeUnlockedToast from './BadgeUnlockedToast';
import { sound, triggerHaptic } from '../utils/audio';
import { 
  getSavedWeights, 
  saveExerciseWeights, 
  markDayCompleted,
  saveActiveDraft,
  getActiveDraft
} from '../utils/storage';
import { recordWorkoutCompletion } from '../services/workoutService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { useAuth } from '../context';

export default function ActiveWorkout({ workout, onBackToDashboard }) {
  const { user } = useAuth();
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);

  // Recupera rascunho ativo se for do mesmo treino
  const currentWorkoutDayId = workout?.dayId || workout?.id;
  const [activeDraft] = useState(() => {
    const draft = getActiveDraft();
    return draft && draft.workoutDayId === currentWorkoutDayId ? draft : null;
  });
  const isResumed = Boolean(activeDraft);

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
          weight: s.weight ?? ex.suggestedWeight,
          reps: s.reps ?? ex.suggestedReps,
          completed: false,
        }));
      } else {
        const setsCount = ex.defaultSets || 3;
        initial[ex.id] = Array.from({ length: setsCount }, () => ({
          weight: ex.suggestedWeight,
          reps: ex.suggestedReps,
          completed: false,
        }));
      }
    });
    return initial;
  });

  // Histórico das cargas anteriores para comparativo discreto
  const [pastWeights] = useState(() => getSavedWeights());

  // Cronômetro do treino
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    return activeDraft ? (activeDraft.elapsedSeconds || 0) : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const elapsedRef = useRef(elapsedSeconds);

  // Trigger para auto-iniciar o Rest Timer ao concluir uma série
  const [restTimerTrigger, setRestTimerTrigger] = useState(0);
  const [currentRestDefault, setCurrentRestDefault] = useState(60);

  // Modais
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Exercício expandido
  const [expandedExerciseId, setExpandedExerciseId] = useState(
    workout?.exercises?.[0]?.id || null
  );

  // Mantém elapsedRef sincronizado sem provocar re-renders
  useEffect(() => {
    elapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Cronômetro (apenas atualiza estado numérico local)
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Debounced auto-save do rascunho quando as séries mudam (NÃO a cada segundo!)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveActiveDraft({
        workoutDayId: currentWorkoutDayId,
        elapsedSeconds: elapsedRef.current,
        exercisesData,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [currentWorkoutDayId, exercisesData]);

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

  // Atualizar carga
  const handleWeightChange = (exId, setIndex, newWeight) => {
    const val = Math.max(0, parseFloat(newWeight) || 0);
    setExercisesData((prev) => {
      const next = { ...prev };
      if (!next[exId] || !next[exId][setIndex]) return prev;
      next[exId] = [...next[exId]];
      next[exId][setIndex] = { ...next[exId][setIndex], weight: val };
      debouncedSaveWeights(exId, next[exId]);
      return next;
    });
  };

  // Atualizar repetições
  const handleRepsChange = (exId, setIndex, newReps) => {
    const val = Math.max(0, parseInt(newReps, 10) || 0);
    setExercisesData((prev) => {
      const next = { ...prev };
      if (!next[exId] || !next[exId][setIndex]) return prev;
      next[exId] = [...next[exId]];
      next[exId][setIndex] = { ...next[exId][setIndex], reps: val };
      debouncedSaveWeights(exId, next[exId]);
      return next;
    });
  };

  // Marcar série concluída (haptic + timer imediato)
  const toggleSetComplete = (exId, setIndex, suggestedRestTime = 60) => {
    setExercisesData((prev) => {
      const next = { ...prev };
      if (!next[exId] || !next[exId][setIndex]) return prev;
      next[exId] = [...next[exId]];
      const isNowCompleted = !next[exId][setIndex].completed;
      next[exId][setIndex] = { ...next[exId][setIndex], completed: isNowCompleted };

      if (isNowCompleted) {
        sound.playTick();
        triggerHaptic(20);
        setCurrentRestDefault(suggestedRestTime || 60);
        setRestTimerTrigger(Date.now());
      }

      saveExerciseWeights(exId, next[exId]);
      return next;
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
          { weight: lastSet.weight, reps: lastSet.reps, completed: false },
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

  // Métricas de progresso calculadas de forma leve
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let totalVolumeKg = 0;

  const currentExercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
  currentExercisesList.forEach((ex) => {
    const sets = exercisesData[ex.id] || [];
    sets.forEach((s) => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        totalVolumeKg += (s.weight || 0) * (s.reps || 0);
      }
    });
  });

  const completionPercentage = totalSetsCount > 0 
    ? Math.round((completedSetsCount / totalSetsCount) * 100) 
    : 0;

  // Finalização instantânea e otimista (Zero Lag)
  const handleFinishWorkout = () => {
    setIsTimerRunning(false);
    triggerHaptic([30, 80, 30]);

    // 1. Gravação local e disparo visual imediato em 0ms
    markDayCompleted(currentWorkoutDayId);
    saveActiveDraft(null);

    // Avaliação de Conquistas & Medalhas Gamificadas
    try {
      const unlocked = evaluateAndUnlockBadges() || [];
      if (unlocked.length > 0) {
        setNewlyUnlockedBadge(unlocked[0]);
      }
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas no treino:', badgeErr);
    }

    setShowCelebration(true);

    // 2. Sincronização em nuvem desacoplada em background (sem bloquear o modal)
    recordWorkoutCompletion({
      userId: user?.id,
      workout,
      durationSeconds: elapsedRef.current,
      exercisesData,
      notes: `Treino finalizado com ${completedSetsCount} séries e volume total de ${totalVolumeKg} kg.`
    }).catch((err) => {
      console.warn('Sincronização em nuvem executada com aviso:', err);
    });
  };

  const handlePauseAndExit = () => {
    // Salva o rascunho com o tempo atual e volta suavemente
    saveActiveDraft({
      workoutDayId: currentWorkoutDayId,
      elapsedSeconds: elapsedRef.current,
      exercisesData,
    });
    onBackToDashboard();
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-[#09090b] pb-36 transition-colors">
      {/* Top Bar Fixa / Design Executivo */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-colors pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={handlePauseAndExit}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all cursor-pointer"
            title="Pausar e voltar ao painel"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Pausar</span>
          </button>

          {/* Cronômetro Central Monospaçado */}
          <div className="flex items-center gap-2 bg-black dark:bg-zinc-900 text-white px-3.5 py-1.5 rounded-full border border-zinc-800 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-wider">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          {/* Botão Finalizar Treino */}
          <button
            onClick={handleFinishWorkout}
            className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Concluir</span>
          </button>
        </div>

        {/* Linha Fina de Progresso */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1">
          <div 
            className="bg-black dark:bg-white h-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </header>

      {/* Conteúdo Principal do Treino */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Sessão Ativa • {workout.name}
              </span>
              {isResumed && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Recuperado
                </span>
              )}
            </div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-white leading-tight mt-0.5">
              {workout.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              {workout.focus}
            </p>
          </div>

          <div className="text-right">
            <div className="text-lg font-black text-zinc-900 dark:text-white">
              {completionPercentage}%
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">
              {completedSetsCount}/{totalSetsCount} séries
            </div>
          </div>
        </div>

        {/* Dica Científica de Biomecânica */}
        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 fill-sky-400" />
          <div className="leading-relaxed text-[11px]">
            <strong className="font-bold text-zinc-900 dark:text-white">Biomecânica:</strong> Cadência excêntrica de 2 a 3 segundos com amplitude articular completa estimula maior resposta hipertrófica e previne lesões.
          </div>
        </div>

        {/* Lista Sequencial de Exercícios */}
        <div className="space-y-3">
          {currentExercisesList.map((exercise, exIndex) => {
            const sets = exercisesData[exercise.id] || [];
            const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed);
            const isExpanded = expandedExerciseId === exercise.id;

            return (
              <div
                key={exercise.id}
                className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-[#121215] shadow-xs overflow-hidden ${
                  isCompletedAll 
                    ? 'border-emerald-300 dark:border-emerald-900/50' 
                    : isExpanded 
                      ? 'border-zinc-400 dark:border-zinc-600 ring-1 ring-zinc-300/40 dark:ring-zinc-700/40' 
                      : 'border-zinc-200/80 dark:border-zinc-800'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div 
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isCompletedAll 
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/20' 
                      : 'bg-white dark:bg-[#121215]'
                  }`}
                  onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCompletedAll
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {isCompletedAll ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : exIndex + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {exercise.target}
                        </span>
                        {exercise.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[9px] font-medium">
                            {exercise.badge}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-tight">
                        {exercise.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExerciseForModal(exercise);
                        triggerHaptic(10);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer"
                      title="Ver demonstração técnica"
                    >
                      <Eye className="w-3.5 h-3.5 text-zinc-500" />
                      <span className="hidden sm:inline text-[10px]">Guia</span>
                    </button>

                    <div className="text-zinc-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Corpo do Exercício: Tabela de Séries */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2.5">
                    {/* Benefício Científico */}
                    {exercise.soccerBenefit && (
                      <div className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-zinc-900 dark:text-white font-semibold">Fisiologia:</strong> {exercise.soccerBenefit}
                        </div>
                      </div>
                    )}

                    {/* Cabeçalho da Tabela */}
                    <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                      <div className="col-span-2 text-left">Série</div>
                      <div className="col-span-4">Carga (kg)</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-3">Status</div>
                    </div>

                    {/* Linhas de Séries */}
                    <div className="space-y-1.5">
                      {sets.map((set, setIdx) => (
                        <div
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                            set.completed
                              ? 'bg-zinc-100/80 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700'
                              : 'bg-white dark:bg-[#121215] border-zinc-200/80 dark:border-zinc-800'
                          }`}
                        >
                          {/* Número da Série */}
                          <div className="col-span-2 flex items-center gap-1">
                            <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                              #{setIdx + 1}
                            </span>
                            {sets.length > 1 && !set.completed && (
                              <button
                                onClick={() => handleRemoveSet(exercise.id, setIdx)}
                                className="text-zinc-300 dark:text-zinc-600 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                                title="Remover série"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Input de Carga (kg) */}
                          <div className="col-span-4 flex flex-col items-center justify-center">
                            <div className="relative w-full">
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                value={set.weight}
                                onChange={(e) =>
                                  handleWeightChange(exercise.id, setIdx, e.target.value)
                                }
                                disabled={set.completed}
                                className={`w-full text-center font-bold text-sm py-1.5 px-1 rounded-lg border transition-all ${
                                  set.completed
                                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-90'
                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400'
                                }`}
                              />
                              <span className="absolute right-2 top-2 text-[10px] text-zinc-400 pointer-events-none">
                                kg
                              </span>
                            </div>

                            {/* Comparativo com Último Treino */}
                            {(() => {
                              const pastExercise = pastWeights[exercise.id];
                              const pastSet = pastExercise && pastExercise[setIdx];
                              const pastWeightVal = pastSet?.weight ?? exercise.suggestedWeight;
                              const currentWeightVal = Number(set.weight) || 0;
                              const diff = currentWeightVal - pastWeightVal;

                              if (diff > 0) {
                                return (
                                  <div className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
                                    <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                                    <span>+{diff}kg evolução</span>
                                  </div>
                                );
                              }

                              return (
                                <div className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 mt-0.5 leading-none text-center truncate w-full">
                                  Anterior: {pastWeightVal}kg
                                </div>
                              );
                            })()}
                          </div>

                          {/* Input de Repetições */}
                          <div className="col-span-3 flex items-center justify-center">
                            <input
                              type="number"
                              inputMode="numeric"
                              value={set.reps}
                              onChange={(e) =>
                                handleRepsChange(exercise.id, setIdx, e.target.value)
                              }
                              disabled={set.completed}
                              className={`w-full text-center font-bold text-sm py-1.5 px-1 rounded-lg border transition-all ${
                                set.completed
                                  ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 opacity-90'
                                  : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400'
                              }`}
                            />
                          </div>

                          {/* Botão de Checkbox */}
                          <div className="col-span-3 flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                toggleSetComplete(exercise.id, setIdx, exercise.restTime)
                              }
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                                set.completed
                                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                              }`}
                              title={set.completed ? 'Desmarcar série' : 'Concluir série e disparar descanso'}
                            >
                              <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3]' : 'stroke-2'}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botão Adicionar Série */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAddSet(exercise.id)}
                        className="py-1.5 px-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-zinc-200/80 dark:border-zinc-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Série</span>
                      </button>

                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                        Descanso recomendado: <strong className="text-zinc-700 dark:text-zinc-300">{exercise.restTime}s</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão Finalizar Treino */}
        <div className="pt-2">
          <button
            onClick={handleFinishWorkout}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finalizar Sessão de Treino</span>
          </button>
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 font-medium">
            Cargas e histórico salvos automaticamente.
          </p>
        </div>
      </main>

      {/* Temporizador de Descanso Fixo */}
      <RestTimer 
        initialTime={currentRestDefault} 
        autoStartTrigger={restTimerTrigger} 
      />

      {/* Modal de Demonstração Biomecânica */}
      {selectedExerciseForModal && (
        <ExerciseModal
          exercise={selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}

      {/* Modal de Celebração */}
      {showCelebration && (
        <CelebrationModal
          workout={workout}
          durationMinutes={Math.max(1, Math.round(elapsedSeconds / 60))}
          totalSetsCompleted={completedSetsCount}
          totalVolumeKg={totalVolumeKg}
          unlockedBadge={newlyUnlockedBadge}
          onClose={() => {
            setShowCelebration(false);
            onBackToDashboard();
          }}
        />
      )}

      {/* Toast de Conquista / Medalha Desbloqueada */}
      {newlyUnlockedBadge && (
        <BadgeUnlockedToast
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}
    </div>
  );

}
