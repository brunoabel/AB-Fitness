import React, { useState, useEffect, useRef, useMemo } from 'react';
import RestTimer from './RestTimer';
import WorkoutHeader from './workout/WorkoutHeader';
import WorkoutDock from './workout/WorkoutDock';
import ExerciseListView, { workingSetLabels } from './workout/ExerciseListView';
import ExercisePillsBar from './workout/ExercisePillsBar';
import FocusExerciseCard from './workout/FocusExerciseCard';
import PostWorkoutModals from './workout/PostWorkoutModals';
import useWorkoutTimer from '../hooks/useWorkoutTimer';
import useWorkoutDraft from '../hooks/useWorkoutDraft';
import { registerSessionAndCheckDue } from '../utils/sessionCheckin';
import { getHomeAlternative, hasExerciseVideo as hasVerifiedExerciseVideo } from '../data/exerciseMedia';
import { useWakeLock } from '../hooks/useWakeLock';
import { sound, triggerHaptic } from '../utils/audio';
import {
  getSavedWeights,
  saveExerciseWeights,
  markDayCompleted,
  saveActiveDraft,
  getActiveDraft,
  getWorkoutHistory,
  addWorkoutToHistory,
  getCompletedDays,
  getRunsHistory
} from '../utils/storage';
import { recordWorkoutCompletion, newSessionId } from '../services/workoutService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { computeStreak } from '../utils/streak';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { getStreakMilestoneInfo, shouldShowStreakCelebration, markStreakCelebrated } from '../utils/streakMilestones';
import {
  buildPrevIndex,
  isTimedExercise,
  getDefaultDurationSeconds,
  formatDurationSeconds,
  calculateNextSessionPrescription
} from '../utils/strengthMetrics';
import {
  buildInitialExercisesData,
  computeWorkoutProgress,
  detectSessionPRs,
  getCurrentReadinessScore
} from '../utils/activeWorkoutHelpers';
import { buildWorkoutInsights, fetchCoachNarrative } from '../services/abCoach/coachInsightsService';
import { useAuth } from '../context';
import { canAccessFeature } from '../utils/userVerification';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { mesoWeekParams, readSelectedMesoWeek, applyMesoWeekToHint, mesoWeekLabel } from '../utils/mesocycleWeek';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function ActiveWorkout({ workout, onBackToDashboard }) {
  const { user, isPro, isTrialActive, trialEndsAt } = useAuth();
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);

  useWakeLock(true);

  const currentWorkoutDayId = workout?.dayId || workout?.id;
  const [activeDraft] = useState(() => {
    const draft = getActiveDraft();
    return draft && draft.workoutDayId === currentWorkoutDayId ? draft : null;
  });

  const [pastHistory] = useState(() => getWorkoutHistory());
  const prevIndex = useMemo(() => buildPrevIndex(pastHistory), [pastHistory]);
  const [readinessScore] = useState(() => getCurrentReadinessScore());

  // Semana do mesociclo: só PRO/teste com perfil de onboarding e só nos treinos do plano semanal
  // (dayId 0-6). Programas do PT e treinos personalizados ficam como foram prescritos.
  const [mesoParams] = useState(() => {
    const isPlanWorkout = Number.isInteger(workout?.dayId) && !workout?.assignedProgramId;
    const canUse = canAccessFeature('mesocycles', { is_pro: isPro, trial_ends_at: isTrialActive ? trialEndsAt : null });
    if (!isPlanWorkout || !canUse || !getLocalFitnessProfile()) return null;
    return mesoWeekParams(readSelectedMesoWeek());
  });

  const progressionHints = useMemo(() => {
    const hints = {};
    const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
    exercisesList.forEach((ex) => {
      const prevSets = prevIndex.get(ex.id);
      if (!prevSets) return;
      const hint = calculateNextSessionPrescription(prevSets, {
        repRange: ex.repRange,
        progressionIncrementKg: ex.progressionIncrementKg
      }, readinessScore);
      if (!hint) return;
      const lastWorking = prevSets.find((s) => (s.completed || s.done) && s.type !== 'W' && Number(s.weight) > 0);
      hints[ex.id] = applyMesoWeekToHint(hint, mesoParams, lastWorking?.weight);
    });
    return hints;
  }, [prevIndex, workout, readinessScore, mesoParams]);

  const [isFocusMode, setIsFocusMode] = useState(true);
  const [exercisesData, setExercisesData] = useState(() => buildInitialExercisesData(workout, activeDraft, mesoParams));
  const [pastWeights] = useState(() => getSavedWeights());

  const { isTimerRunning, setIsTimerRunning, computeElapsed, timerRef } = useWorkoutTimer(activeDraft);
  const [finalDurationMinutes, setFinalDurationMinutes] = useState(1);

  const [restTimerTrigger, setRestTimerTrigger] = useState(0);
  const [currentRestDefault, setCurrentRestDefault] = useState(60);

  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [checkin, setCheckin] = useState(null);
  const [checkinSessionId, setCheckinSessionId] = useState(null);

  const [fatigueWarning, setFatigueWarning] = useState(null);
  const [fatigueDismissed, setFatigueDismissed] = useState(false);
  useEffect(() => {
    let active = true;
    if (!user?.id || user.id === 'guest-local-user' || !isSupabaseConfigured() || !supabase) return undefined;
    supabase.rpc('get_muscle_fatigue').then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      const fatigued = data.filter((m) => Number(m.fatigue) >= 75);
      if (fatigued.length === 0) return;
      const normalize = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
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

  const finishingRef = useRef(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const [homeSwaps, setHomeSwaps] = useState(() => activeDraft?.homeSwaps || {});
  const [swappingExercise, setSwappingExercise] = useState(null);
  const [liveSwaps, setLiveSwaps] = useState(() => activeDraft?.liveSwaps || {});
  const [isExpressMode, setIsExpressMode] = useState(false);

  const baseExercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  const currentExercisesList = baseExercises.map((ex) => liveSwaps[ex.id] || homeSwaps[ex.id] || ex);
  const [focusedExerciseId, setFocusedExerciseId] = useState(workout?.exercises?.[0]?.id || null);

  const draftDataRef = useWorkoutDraft({
    workoutDayId: currentWorkoutDayId,
    exercisesData,
    homeSwaps,
    computeElapsed,
    timerRef,
    finishingRef
  });

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

  const currentFocusedIndex = currentExercisesList.findIndex((e) => e.id === focusedExerciseId);
  const activeExercise = currentExercisesList[currentFocusedIndex] || currentExercisesList[0];

  const toggleExpressMode = () => {
    const next = !isExpressMode;
    setIsExpressMode(next);
    setCurrentRestDefault(next ? 45 : (activeExercise?.restTime || 60));
    triggerHaptic(15);
  };

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

  const handleSetUpdate = (exId, setIdx, updates) => {
    const normalized = { ...updates };
    if ('done' in updates && !('completed' in updates)) normalized.completed = updates.done;
    if ('completed' in updates && !('done' in updates)) normalized.done = updates.completed;

    const currentSets = draftDataRef.current.exercisesData[exId] || [];
    const prevSet = currentSets[setIdx] || {};
    const nextSets = [...currentSets];
    nextSets[setIdx] = { ...prevSet, ...normalized };

    setExercisesData((prev) => {
      const sets = [...(prev[exId] || [])];
      sets[setIdx] = { ...sets[setIdx], ...normalized };
      return { ...prev, [exId]: sets };
    });

    const wasCompleted = Boolean(prevSet.completed || prevSet.done);
    const isNowCompleted = Boolean(nextSets[setIdx].completed || nextSets[setIdx].done);
    if (!wasCompleted && isNowCompleted) {
      sound.playTick();
      const ex = currentExercisesList.find((e) => e.id === exId);
      setCurrentRestDefault(isExpressMode ? 45 : (ex?.restTime || 60));
      setRestTimerTrigger(Date.now());
    }
  };

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

  const {
    totalWorkingSetsCount,
    completedWorkingSetsCount,
    totalVolumeKg,
    completionPercentage
  } = computeWorkoutProgress(currentExercisesList, exercisesData);

  const handleFinishWorkout = () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setIsFinishing(true);
    setIsTimerRunning(false);
    triggerHaptic([30, 80, 30]);

    const runsForStreak = getRunsHistory();
    const prevStreak = computeStreak(getCompletedDays(), WEEKLY_SCHEDULE, runsForStreak);
    markDayCompleted(currentWorkoutDayId);
    const nextStreak = computeStreak(getCompletedDays(), WEEKLY_SCHEDULE, runsForStreak);
    const info = getStreakMilestoneInfo(nextStreak, prevStreak);
    if (info.advanced && shouldShowStreakCelebration(nextStreak)) {
      setStreakInfo(info);
      markStreakCelebrated(nextStreak);
    }
    saveActiveDraft(null);

    setSessionNewPRs(detectSessionPRs(currentExercisesList, exercisesData, pastHistory));

    const finalSeconds = computeElapsed();
    const computedMinutes = Math.max(1, Math.round(finalSeconds / 60));
    setFinalDurationMinutes(computedMinutes);
    const now = new Date();
    const workoutTitle = workout?.title || workout?.name || 'Treino Concluído';
    // Mesmo id local e na nuvem: o histórico hidratado do servidor faz merge sem duplicar
    const pendingSessionId = newSessionId();
    const workoutRecord = {
      id: `workout_${Date.now()}`,
      sessionId: pendingSessionId,
      timestamp: Date.now(),
      completedAt: now.toISOString(),
      date: now.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      workoutDayId: currentWorkoutDayId,
      dayName: workout?.name || workout?.shortName || 'Treino',
      dayTitle: workoutTitle,
      title: workoutTitle,
      workoutTitle,
      durationMinutes: computedMinutes,
      durationSeconds: finalSeconds,
      totalSets: completedWorkingSetsCount,
      totalSetsCompleted: completedWorkingSetsCount,
      exerciseCount: currentExercisesList.length,
      totalVolumeKg,
      exercisesData,
      targetGroup: workout?.focus || 'Geral'
    };
    addWorkoutToHistory(workoutRecord);

    const facts = buildWorkoutInsights(workoutRecord, pastHistory);
    setSessionFacts(facts);
    fetchCoachNarrative(facts, workout?.title || 'Treino').then((narrative) => {
      if (narrative) setCoachNarrative(narrative);
    }).catch(() => {});

    try {
      const unlocked = evaluateAndUnlockBadges('workout') || [];
      if (unlocked.length > 0) setNewlyUnlockedBadge(unlocked[0]);
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas no treino:', badgeErr);
    }

    setShowCelebration(true);
    const isAssigned = Boolean(workout?.assignedProgramId);
    if (isAssigned) setCheckin('assigned');
    else if (registerSessionAndCheckDue()) setCheckin('due');

    if (user?.id) {
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
    const pausedAt = computeElapsed();
    saveActiveDraft({
      workoutDayId: currentWorkoutDayId,
      elapsedSeconds: pausedAt,
      timerBaseSeconds: pausedAt,
      timerRunningSince: null,
      exercisesData,
      homeSwaps
    });
    triggerHaptic(15);
    onBackToDashboard();
  };

  const activeExerciseSets = exercisesData[activeExercise?.id] || [];
  const activeSetLabels = workingSetLabels(activeExerciseSets);
  const isActiveExerciseTimed = activeExercise ? isTimedExercise(activeExercise, activeExercise.id) : false;
  const nextPendingSetIdx = activeExerciseSets.findIndex((s) => !(s.completed || s.done));
  const nextPendingSet = nextPendingSetIdx >= 0 ? activeExerciseSets[nextPendingSetIdx] : null;
  const nextSetInfo = nextPendingSet
    ? `Série ${activeSetLabels[nextPendingSetIdx]} · ${
        isActiveExerciseTimed
          ? formatDurationSeconds(nextPendingSet.seconds ?? nextPendingSet.reps)
          : `${nextPendingSet.weight || 0} kg`
      }`
    : undefined;

  const advancePostCelebration = () => {
    if (checkin === 'due') setCheckin('open');
    else if (checkin === 'assigned') setCheckin('open-assigned');
    else onBackToDashboard();
  };

  return (
    <div className="min-h-screen bg-app text-zinc-100 pb-40 transition-colors">
      <WorkoutHeader
        workoutTitle={workout?.title || workout?.name}
        computeElapsed={computeElapsed}
        isTimerRunning={isTimerRunning}
        completionPercentage={completionPercentage}
        completedWorkingSetsCount={completedWorkingSetsCount}
        totalWorkingSetsCount={totalWorkingSetsCount}
        isFocusMode={isFocusMode}
        onToggleFocus={() => setIsFocusMode(!isFocusMode)}
        onPause={handlePauseAndExit}
        onFinish={handleFinishWorkout}
        isFinishing={isFinishing}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-48 space-y-3.5">
        {fatigueWarning && !fatigueDismissed && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <p className="text-zinc-200 truncate">
                <strong className="text-amber-400 font-semibold">Músculo em recuperação:</strong> Treina com margem de segurança e preserva a técnica hoje.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFatigueDismissed(true)}
              className="text-[11px] font-bold text-amber-400 hover:text-white shrink-0 px-2 py-1 rounded cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {mesoParams && (
          <div className="border-l-2 border-accent-hover pl-3.5 py-1.5 text-xs text-zinc-200 leading-relaxed">
            <strong className="text-white font-semibold">Mesociclo:</strong> {mesoWeekLabel(mesoParams)}
          </div>
        )}

        {workout?.coachNotes && (
          <div className="border-l-2 border-accent-hover pl-3.5 py-1.5 text-xs text-zinc-200 leading-relaxed">
            <strong className="text-white font-semibold">
              Instruções de {workout.trainerName || 'o teu PT'}:
            </strong>{' '}
            {workout.coachNotes}
          </div>
        )}

        <ExercisePillsBar
          exercises={currentExercisesList}
          exercisesData={exercisesData}
          focusedExerciseId={focusedExerciseId}
          isExpressMode={isExpressMode}
          isFocusMode={isFocusMode}
          onSelectExercise={setFocusedExerciseId}
          onToggleExpressMode={toggleExpressMode}
        />

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

      <RestTimer
        initialTime={currentRestDefault}
        autoStartTrigger={restTimerTrigger}
        exerciseName={activeExercise?.name}
        nextSetInfo={nextSetInfo}
      />

      <WorkoutDock
        index={currentFocusedIndex}
        total={currentExercisesList.length}
        exerciseName={activeExercise?.name}
        onPrev={() => {
          if (currentFocusedIndex > 0) {
            triggerHaptic(10);
            setFocusedExerciseId(currentExercisesList[currentFocusedIndex - 1].id);
          }
        }}
        onNext={() => {
          if (currentFocusedIndex < currentExercisesList.length - 1) {
            triggerHaptic(10);
            setFocusedExerciseId(currentExercisesList[currentFocusedIndex + 1].id);
          } else {
            handleFinishWorkout();
          }
        }}
      />

      <PostWorkoutModals
        checkin={checkin}
        checkinSessionId={checkinSessionId}
        coachNarrative={coachNarrative}
        completedWorkingSetsCount={completedWorkingSetsCount}
        finalDurationMinutes={finalDurationMinutes}
        newlyUnlockedBadge={newlyUnlockedBadge}
        onClearBadge={() => {
          setNewlyUnlockedBadge(null);
          if (!streakInfo) advancePostCelebration();
        }}
        onClearStreak={() => {
          setStreakInfo(null);
          advancePostCelebration();
        }}
        onCloseCelebration={() => {
          setShowCelebration(false);
          if (!newlyUnlockedBadge && !streakInfo) advancePostCelebration();
        }}
        onCloseExerciseGuide={() => setSelectedExerciseForModal(null)}
        onClosePlates={() => setPlateCalcWeight(null)}
        onCloseSwap={() => setSwappingExercise(null)}
        onDoneCheckin={() => {
          setCheckin(null);
          onBackToDashboard();
        }}
        onSelectSubstitute={handleSwapExercise}
        plateCalcWeight={plateCalcWeight}
        selectedExerciseForModal={selectedExerciseForModal}
        sessionFacts={sessionFacts}
        sessionNewPRs={sessionNewPRs}
        showCelebration={showCelebration}
        streakInfo={streakInfo}
        swappingExercise={swappingExercise}
        totalVolumeKg={totalVolumeKg}
        workout={workout}
      />
    </div>
  );
}
