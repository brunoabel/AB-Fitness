import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  Trophy, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import ExerciseModal from './ExerciseModal';
import RestTimer from './RestTimer';
import CelebrationModal from './CelebrationModal';
import { sound, triggerHaptic } from '../utils/audio';
import { 
  getSavedWeights, 
  saveExerciseWeights, 
  markDayCompleted,
  saveActiveDraft,
  getActiveDraft
} from '../utils/storage';
import { recordWorkoutCompletion } from '../services/workoutService';
import { useAuth } from '../context/AuthContext';

export default function ActiveWorkout({ workout, onBackToDashboard }) {
  const { user } = useAuth();
  // Estado para armazenar as séries de cada exercício
  const [exercisesData, setExercisesData] = useState(() => {
    const saved = getSavedWeights();
    const draft = getActiveDraft();

    // Se houver um rascunho ativo do mesmo dia, recupera
    if (draft && draft.workoutDayId === workout.dayId) {
      return draft.exercisesData;
    }

    // Inicialização padrão com os exercícios do treino
    const initial = {};
    workout.exercises.forEach((ex) => {
      const prevSets = saved[ex.id];
      if (prevSets && prevSets.length > 0) {
        // Recupera cargas anteriores do utilizador
        initial[ex.id] = prevSets.map((s) => ({
          weight: s.weight ?? ex.suggestedWeight,
          reps: s.reps ?? ex.suggestedReps,
          completed: false,
        }));
      } else {
        // Gera as séries padrão (ex: 3 séries)
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

  // Mapa de histórico das cargas do último treino para comparativo de evolução
  const [pastWeights] = useState(() => getSavedWeights());

  // Cronômetro do tempo decorrido do treino
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Trigger para auto-iniciar o Rest Timer ao concluir uma série
  const [restTimerTrigger, setRestTimerTrigger] = useState(0);
  const [currentRestDefault, setCurrentRestDefault] = useState(60);

  // Modal de Demonstração do Exercício
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);

  // Modal de Celebração de Conclusão
  const [showCelebration, setShowCelebration] = useState(false);

  // Exercício atualmente expandido na visualização
  const [expandedExerciseId, setExpandedExerciseId] = useState(
    workout.exercises[0]?.id || null
  );

  // Relógio do treino
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Persistir rascunho a cada alteração
  useEffect(() => {
    saveActiveDraft({
      workoutDayId: workout.dayId,
      elapsedSeconds,
      exercisesData,
    });
  }, [workout.dayId, elapsedSeconds, exercisesData]);

  const formatElapsed = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Atualizar peso de uma série
  const handleWeightChange = (exId, setIndex, newWeight) => {
    const val = Math.max(0, parseFloat(newWeight) || 0);
    setExercisesData((prev) => {
      const next = { ...prev };
      next[exId] = [...next[exId]];
      next[exId][setIndex] = { ...next[exId][setIndex], weight: val };
      saveExerciseWeights(exId, next[exId]);
      return next;
    });
  };

  // Atualizar repetições de uma série
  const handleRepsChange = (exId, setIndex, newReps) => {
    const val = Math.max(0, parseInt(newReps, 10) || 0);
    setExercisesData((prev) => {
      const next = { ...prev };
      next[exId] = [...next[exId]];
      next[exId][setIndex] = { ...next[exId][setIndex], reps: val };
      saveExerciseWeights(exId, next[exId]);
      return next;
    });
  };

  // Alternar status de conclusão da série (com haptic e auto-start no timer)
  const toggleSetComplete = (exId, setIndex, suggestedRestTime = 60) => {
    setExercisesData((prev) => {
      const next = { ...prev };
      next[exId] = [...next[exId]];
      const isNowCompleted = !next[exId][setIndex].completed;
      next[exId][setIndex] = { ...next[exId][setIndex], completed: isNowCompleted };

      if (isNowCompleted) {
        sound.playTick();
        triggerHaptic(20);
        // Disparar o descanso automático
        setCurrentRestDefault(suggestedRestTime || 60);
        setRestTimerTrigger(Date.now());
      }

      saveExerciseWeights(exId, next[exId]);
      return next;
    });
  };

  // Adicionar nova série a um exercício
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

  // Remover uma série
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

  // Cálculos de progresso
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let totalVolumeKg = 0;

  workout.exercises.forEach((ex) => {
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

  // Finalizar treino completo
  const handleFinishWorkout = async () => {
    setIsTimerRunning(false);

    // Salvar no Supabase (se logado) e persistência local via serviço modular
    await recordWorkoutCompletion({
      userId: user?.id,
      workout,
      durationSeconds: elapsedSeconds,
      exercisesData,
      notes: `Treino finalizado com ${completedSetsCount} séries e volume de ${totalVolumeKg} kg.`
    });

    // Marcar o dia como concluído
    markDayCompleted(workout.dayId);

    // Limpar rascunho
    saveActiveDraft(null);

    // Abrir modal de celebração
    setShowCelebration(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/90 pb-36 animate-fadeIn transition-colors">
      {/* Top Bar Fixa / Glassmorphism */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 shadow-xs transition-colors pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-md mx-auto px-4 pt-3 pb-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Deseja pausar o treino? Seu progresso e cargas estão salvos!')) {
                onBackToDashboard();
              }
            }}
            className="flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-sky-200/70 dark:border-slate-700 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {/* Cronômetro Central do Treino */}
          <div className="flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
            <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-200">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          {/* Botão Finalizar Treino */}
          <button
            onClick={handleFinishWorkout}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-xs shadow-sm shadow-sky-400/30 active:scale-95 transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tá Pago!</span>
          </button>
        </div>

        {/* Barra de Progresso Global do Treino */}
        <div className="w-full bg-sky-100/50 dark:bg-slate-800 h-1.5">
          <div 
            className="bg-gradient-to-r from-sky-400 to-sky-500 h-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </header>

      {/* Conteúdo Principal do Treino */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Banner do Dia com estatísticas rápidas */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
          <div>
            <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Execução Ativa • {workout.name}
            </span>
            <h1 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
              {workout.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {workout.focus}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-sky-600 dark:text-sky-400">
              {completionPercentage}%
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              {completedSetsCount}/{totalSetsCount} séries
            </div>
          </div>
        </div>

        {/* Dica de Futebol / Atleta */}
        <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-slate-900 border border-sky-200/60 dark:border-slate-800 text-xs text-sky-900 dark:text-sky-300 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-sky-500 shrink-0 mt-0.5 fill-sky-500" />
          <div className="leading-relaxed">
            <strong className="font-extrabold text-sky-950 dark:text-sky-200">Ritmo de Jogo:</strong> Controle a descida do peso (2 seg) para proteger os tendões e articulações para os 4 treinos da semana no clube.
          </div>
        </div>

        {/* Lista Sequencial de Exercícios */}
        <div className="space-y-3.5">
          {workout.exercises.map((exercise, exIndex) => {
            const sets = exercisesData[exercise.id] || [];
            const isCompletedAll = sets.length > 0 && sets.every((s) => s.completed);
            const isExpanded = expandedExerciseId === exercise.id;

            return (
              <div
                key={exercise.id}
                className={`rounded-3xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
                  isCompletedAll 
                    ? 'border-emerald-300 dark:border-emerald-700/60 shadow-emerald-50 dark:shadow-none' 
                    : isExpanded 
                      ? 'border-sky-300 dark:border-sky-500/50 ring-2 ring-sky-100 dark:ring-sky-950' 
                      : 'border-sky-100 dark:border-slate-800'
                }`}
              >
                {/* Cabeçalho do Card do Exercício */}
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    isCompletedAll 
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20' 
                      : 'bg-white dark:bg-slate-900'
                  }`}
                  onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isCompletedAll
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300'
                    }`}>
                      {isCompletedAll ? <Check className="w-4 h-4 stroke-[3]" /> : exIndex + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                          {exercise.target}
                        </span>
                        {exercise.badge && (
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold">
                            {exercise.badge}
                          </span>
                        )}
                      </div>
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                        {exercise.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão Ver Execução */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExerciseForModal(exercise);
                        triggerHaptic(10);
                      }}
                      className="p-2 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-300 border border-sky-200/60 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
                      title="Ver demonstração e benefício no futebol"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline text-[11px]">Guia</span>
                    </button>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Corpo do Exercício: Tabela de Séries */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-fadeIn">
                    {/* Benefício específico no futebol */}
                    {exercise.soccerBenefit && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-sky-50/50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-sky-100 dark:border-slate-700/80 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-sky-800 dark:text-sky-300">Vantagem em Campo:</strong> {exercise.soccerBenefit}
                        </div>
                      </div>
                    )}

                    {/* Cabeçalho da Tabela de Séries */}
                    <div className="grid grid-cols-12 gap-2 text-center text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                      <div className="col-span-2 text-left">Série</div>
                      <div className="col-span-4">Carga (kg)</div>
                      <div className="col-span-3">Reps</div>
                      <div className="col-span-3">Concluir</div>
                    </div>

                    {/* Linhas de Séries */}
                    <div className="space-y-2">
                      {sets.map((set, setIdx) => (
                        <div
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition-all ${
                            set.completed
                              ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-200'
                          }`}
                        >
                          {/* Número da Série */}
                          <div className="col-span-2 flex items-center gap-1">
                            <span className="font-black text-xs text-slate-700 dark:text-slate-300">
                              #{setIdx + 1}
                            </span>
                            {sets.length > 1 && !set.completed && (
                              <button
                                onClick={() => handleRemoveSet(exercise.id, setIdx)}
                                className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors p-1"
                                title="Remover série"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Input de Carga (kg) & Comparativo com Último Treino */}
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
                                className={`w-full text-center font-bold text-sm py-2 px-1 rounded-xl border transition-all ${
                                  set.completed
                                    ? 'bg-white/80 dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-200 opacity-90'
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                                }`}
                              />
                              <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 pointer-events-none">
                                kg
                              </span>
                            </div>

                            {/* Dica Sutil de Dopamina & Evolução */}
                            {(() => {
                              const pastExercise = pastWeights[exercise.id];
                              const pastSet = pastExercise && pastExercise[setIdx];
                              const pastWeightVal = pastSet?.weight ?? exercise.suggestedWeight;
                              const currentWeightVal = Number(set.weight) || 0;
                              const diff = currentWeightVal - pastWeightVal;

                              if (diff > 0) {
                                return (
                                  <div className="flex items-center gap-0.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 mt-1 leading-none">
                                    <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                                    <span>+{diff}kg! Monstro 🔥</span>
                                  </div>
                                );
                              }

                              return (
                                <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-1 leading-none text-center truncate w-full" title={`Último: ${pastWeightVal} kg`}>
                                  Último: <strong className="font-bold text-slate-600 dark:text-slate-300">{pastWeightVal}kg</strong>
                                  <span className="hidden sm:inline text-sky-500 font-bold ml-0.5">(+2kg hoje?)</span>
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
                              className={`w-full text-center font-bold text-sm py-2 px-1 rounded-xl border transition-all ${
                                set.completed
                                  ? 'bg-white/80 dark:bg-slate-800 border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-200 opacity-90'
                                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                              }`}
                            />
                          </div>

                          {/* Botão de Checkbox / Conclusão */}
                          <div className="col-span-3 flex justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                toggleSetComplete(exercise.id, setIdx, exercise.restTime)
                              }
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                                set.completed
                                  ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-sky-400/30'
                                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-400 hover:text-sky-600 border border-slate-200 dark:border-slate-700'
                              }`}
                              title={set.completed ? 'Desmarcar série' : 'Concluir série e disparar descanso'}
                            >
                              <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : 'stroke-2'}`} />
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
                        className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-700 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border border-slate-200/80 dark:border-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nova Série</span>
                      </button>

                      <span className="text-[11px] text-slate-400 dark:text-slate-400">
                        Descanso ideal: <strong className="text-sky-600 dark:text-sky-400">{exercise.restTime}s</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão Finalizar Treino Grande */}
        <div className="pt-4">
          <button
            onClick={handleFinishWorkout}
            className="w-full py-4 rounded-3xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-base shadow-lg shadow-sky-400/30 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <Trophy className="w-5 h-5 text-amber-200" />
            <span>Finalizar Treino de Hoje • Tá Pago!</span>
          </button>
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
            Cargas salvas automaticamente. O shape vem na constância!
          </p>
        </div>
      </main>

      {/* Temporizador de Descanso Fixo na Base */}
      <RestTimer 
        initialTime={currentRestDefault} 
        autoStartTrigger={restTimerTrigger} 
      />

      {/* Modal de Demonstração Visual & Dicas Didáticas */}
      {selectedExerciseForModal && (
        <ExerciseModal
          exercise={selectedExerciseForModal}
          onClose={() => setSelectedExerciseForModal(null)}
        />
      )}

      {/* Modal de Celebração de Luxo com Confetes, Frase Frango & Resenha */}
      {showCelebration && (
        <CelebrationModal
          workout={workout}
          durationMinutes={Math.max(1, Math.round(elapsedSeconds / 60))}
          totalSetsCompleted={completedSetsCount}
          totalVolumeKg={totalVolumeKg}
          onClose={() => {
            setShowCelebration(false);
            onBackToDashboard();
          }}
        />
      )}
    </div>
  );
}
