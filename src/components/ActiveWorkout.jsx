import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Info, Users, X } from 'lucide-react';
import RestTimer from './RestTimer';
import WorkoutHeader from './workout/WorkoutHeader';
import WorkoutDock from './workout/WorkoutDock';
import ExerciseListView, { workingSetLabels } from './workout/ExerciseListView';
import ExercisePillsBar from './workout/ExercisePillsBar';
import FocusExerciseCard from './workout/FocusExerciseCard';
import PostWorkoutModals from './workout/PostWorkoutModals';
import LiveBuddySheet from './workout/LiveBuddySheet';
import {
  joinLiveWorkoutRoom,
  broadcastLiveUpdate,
  leaveLiveWorkoutRoom
} from '../services/realtimeSessionService';
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
import { recordWorkoutCompletion, newSessionId, getLocalCustomPlan } from '../services/workoutService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { computeStreak } from '../utils/streak';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { exerciseTargetsRegion } from '../data/muscleRegions';
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
import { pushWorkoutToConnectedWearables } from '../services/wearables/wearableManager';
import { useAuth } from '../context';
import { canAccessFeature } from '../utils/userVerification';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { progressionConfigFor } from '../engine/progressionConfig';
import { applyMesoWeekToHint, mesoWeekLabel } from '../utils/mesocycleWeek';
import { currentMesoParams } from '../utils/mesocycleState';
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
    // Semana do mesociclo pelo calendário (avança sozinha; deload reativo incluído)
    return currentMesoParams();
  });

  // Perfil local: objetivo e nível completam a faixa de reps e o RIR de exercícios sem prescrição (treinos personalizados)
  const [localProfile] = useState(() => getLocalFitnessProfile());

  const [homeSwaps, setHomeSwaps] = useState(() => activeDraft?.homeSwaps || {});
  const [swappingExercise, setSwappingExercise] = useState(null);
  const [liveSwaps, setLiveSwaps] = useState(() => activeDraft?.liveSwaps || {});
  const [isExpressMode, setIsExpressMode] = useState(() => Boolean(activeDraft?.isExpressMode));
  const [restTimerState, setRestTimerState] = useState(() => activeDraft?.restTimerState || null);

  const baseExercises = useMemo(() => (Array.isArray(workout?.exercises) ? workout.exercises : []), [workout?.exercises]);
  const currentExercisesList = useMemo(
    () => baseExercises.map((ex) => liveSwaps[ex.id] || homeSwaps[ex.id] || ex),
    [baseExercises, liveSwaps, homeSwaps]
  );

  const progressionHints = useMemo(() => {
    const hints = {};
    currentExercisesList.forEach((ex) => {
      const prevSets = prevIndex.get(ex.id);
      if (!prevSets) return;
      const hint = calculateNextSessionPrescription(prevSets, progressionConfigFor(ex, localProfile), readinessScore);
      if (!hint) return;
      const lastWorking = prevSets.find((s) => (s.completed || s.done) && s.type !== 'W' && Number(s.weight) > 0);
      hints[ex.id] = applyMesoWeekToHint(hint, mesoParams, lastWorking?.weight);
    });
    return hints;
  }, [prevIndex, currentExercisesList, readinessScore, mesoParams, localProfile]);

  const [isFocusMode, setIsFocusMode] = useState(() => activeDraft?.isFocusMode ?? true);
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
  const [showContextSheet, setShowContextSheet] = useState(false);

  // Sessão partilhada em tempo real (Supabase Realtime Presence + Broadcast)
  const [showLiveBuddySheet, setShowLiveBuddySheet] = useState(false);
  const [liveRoomCode, setLiveRoomCode] = useState('');
  const [liveMembers, setLiveMembers] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);
  const liveChannelRef = useRef(null);
  const canUseRealtime = Boolean(user?.id && user.id !== 'guest-local-user' && isSupabaseConfigured());
  const athleteDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta';

  const handleJoinLiveRoom = (code) => {
    if (!canUseRealtime) return;
    if (liveChannelRef.current) leaveLiveWorkoutRoom(liveChannelRef.current);
    const ch = joinLiveWorkoutRoom({
      roomCode: code,
      userId: user.id,
      displayName: athleteDisplayName,
      activityType: 'workout',
      onPresenceChange: setLiveMembers,
      onEvent: (ev) => setLiveEvents((prev) => [ev, ...prev].slice(0, 20))
    });
    liveChannelRef.current = ch;
    setLiveRoomCode(code);
    setLiveEvents([]);
  };

  const handleLeaveLiveRoom = () => {
    if (liveChannelRef.current) {
      leaveLiveWorkoutRoom(liveChannelRef.current);
      liveChannelRef.current = null;
    }
    setLiveRoomCode('');
    setLiveMembers([]);
    setLiveEvents([]);
  };

  useEffect(() => () => {
    if (liveChannelRef.current) {
      leaveLiveWorkoutRoom(liveChannelRef.current);
      liveChannelRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (!showContextSheet) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowContextSheet(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showContextSheet]);
  useEffect(() => {
    let active = true;
    if (!user?.id || user.id === 'guest-local-user' || !isSupabaseConfigured() || !supabase) return undefined;
    supabase.rpc('get_muscle_fatigue').then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      const fatigued = data.filter((m) => Number(m.fatigue) >= 75);
      if (fatigued.length === 0) return;
      const exercisesList = Array.isArray(workout?.exercises) ? workout.exercises : [];
      const hit = fatigued.find((m) =>
        exercisesList.some((ex) => exerciseTargetsRegion(ex, m.muscle_id))
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

  const [focusedExerciseId, setFocusedExerciseId] = useState(() => {
    const candidate = activeDraft?.focusedExerciseId;
    if (candidate && currentExercisesList.some((e) => e.id === candidate)) return candidate;
    return currentExercisesList[0]?.id || null;
  });

  const draftDataRef = useWorkoutDraft({
    workoutDayId: currentWorkoutDayId,
    exercisesData,
    homeSwaps,
    liveSwaps,
    focusedExerciseId,
    isFocusMode,
    isExpressMode,
    restTimerState,
    workoutSnapshot: workout?.assignedProgramId ? workout : undefined,
    computeElapsed,
    timerRef,
    finishingRef
  });

  const handleSwapExercise = (originalEx, substitute) => {
    if (!originalEx || !substitute) return;
    const subHistory = prevIndex.get(substitute.id) || pastWeights[substitute.id] || [];
    const fallbackWeight = substitute.suggestedWeight ?? '';
    setExercisesData((prev) => {
      const existing = prev[originalEx.id] || [];
      const setsCount = Math.max(1, existing.length || 3);
      const nextSubSets = Array.from({ length: setsCount }, (_, idx) => {
        const histSet = subHistory[idx] || subHistory[0] || null;
        return {
          ...(existing[idx] || {}),
          set: idx + 1,
          weight: histSet?.weight ?? fallbackWeight,
          reps: histSet?.reps ?? existing[idx]?.reps ?? 10,
          type: existing[idx]?.type || 'N',
          rpe: null,
          done: false,
          completed: false
        };
      });
      const nextState = { ...prev, [substitute.id]: nextSubSets };
      if (!existing.some((s) => s.completed || s.done)) {
        delete nextState[originalEx.id];
      }
      return nextState;
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
      if (liveChannelRef.current && ex) {
        broadcastLiveUpdate(liveChannelRef.current, {
          type: 'set_done',
          displayName: athleteDisplayName,
          exerciseName: ex.name,
          weight: Number(nextSets[setIdx]?.weight) || 0,
          reps: Number(nextSets[setIdx]?.reps) || 0
        });
      }
      const groupId = ex?.supersetGroupId;
      if (groupId) {
        const groupMembers = currentExercisesList.filter((e) => e.supersetGroupId === groupId);
        if (groupMembers.length > 1) {
          const memberIdx = groupMembers.findIndex((e) => e.id === exId);
          const nextPartner = groupMembers[(memberIdx + 1) % groupMembers.length];
          const partnerSets = draftDataRef.current.exercisesData[nextPartner.id] || [];
          const partnerSetDone = Boolean(partnerSets[setIdx]?.completed || partnerSets[setIdx]?.done);
          if (!partnerSetDone) {
            setFocusedExerciseId(nextPartner.id);
            return;
          }
          setFocusedExerciseId(groupMembers[0].id);
        }
      }
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
    const activeSchedule = getLocalCustomPlan() || WEEKLY_SCHEDULE;
    const prevStreak = computeStreak(getCompletedDays(), activeSchedule, runsForStreak);
    markDayCompleted(currentWorkoutDayId);
    const nextStreak = computeStreak(getCompletedDays(), activeSchedule, runsForStreak);
    const info = getStreakMilestoneInfo(nextStreak, prevStreak);
    if (info.advanced && shouldShowStreakCelebration(nextStreak)) {
      setStreakInfo(info);
      markStreakCelebrated(nextStreak);
    }
    saveActiveDraft(null);

    const activeIds = new Set(currentExercisesList.map((e) => e.id));
    const cleanedExercisesData = Object.fromEntries(
      Object.entries(exercisesData).filter(([exId, sets]) =>
        activeIds.has(exId) || (Array.isArray(sets) && sets.some((s) => s.completed || s.done))
      )
    );

    setSessionNewPRs(detectSessionPRs(currentExercisesList, cleanedExercisesData, pastHistory));

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
      exercisesData: cleanedExercisesData,
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
        exercisesData: cleanedExercisesData,
        assignedProgramId: workout?.assignedProgramId || null,
        sessionId: pendingSessionId,
        persistLocally: false
      }).then((res) => {
        if (!res.synced && res.error) console.warn('Treino guardado só localmente:', res.error);
      });
    }

    pushWorkoutToConnectedWearables({
      name: workoutTitle,
      sportType: 'WeightTraining',
      startDateIso: new Date(Date.now() - finalSeconds * 1000).toISOString(),
      elapsedSeconds: finalSeconds,
      description: `${completedWorkingSetsCount} séries · ${Math.round(totalVolumeKg)} kg — AB Fitness`
    }).catch(() => {});
  };

  const handlePauseAndExit = () => {
    const pausedAt = computeElapsed();
    saveActiveDraft({
      workoutDayId: currentWorkoutDayId,
      elapsedSeconds: pausedAt,
      timerBaseSeconds: pausedAt,
      timerRunningSince: null,
      exercisesData,
      homeSwaps,
      liveSwaps,
      focusedExerciseId,
      isFocusMode,
      isExpressMode,
      restTimerState,
      workoutSnapshot: workout?.assignedProgramId ? workout : undefined
    });
    triggerHaptic(15);
    onBackToDashboard();
  };

  const activeExerciseSets = exercisesData[activeExercise?.id] || [];
  const activeSetLabels = workingSetLabels(activeExerciseSets);
  const isActiveExerciseTimed = activeExercise ? isTimedExercise(activeExercise, activeExercise.id) : false;
  const nextPendingSetIdx = activeExerciseSets.findIndex((s) => !(s.completed || s.done));
  const nextPendingSet = nextPendingSetIdx >= 0 ? activeExerciseSets[nextPendingSetIdx] : null;
  const nextSetLabel = nextPendingSet ? `Série ${activeSetLabels[nextPendingSetIdx]}` : '';
  const nextSetSummary = nextPendingSet
    ? (isActiveExerciseTimed
        ? formatDurationSeconds(nextPendingSet.seconds ?? nextPendingSet.reps)
        : `${nextPendingSet.weight || 0} kg`)
    : '';
  const nextSetInfo = nextPendingSet ? `${nextSetLabel} · ${nextSetSummary}` : undefined;
  const hasFatigueAlert = Boolean(fatigueWarning && !fatigueDismissed);
  const contextItemCount = (hasFatigueAlert ? 1 : 0) + (mesoParams ? 1 : 0) + (workout?.coachNotes ? 1 : 0);

  const advancePostCelebration = () => {
    if (checkin === 'due') setCheckin('open');
    else if (checkin === 'assigned') setCheckin('open-assigned');
    else onBackToDashboard();
  };

  return (
    <div className="min-h-screen bg-app text-zinc-100 pb-40">
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-3 pb-48 space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {contextItemCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                setShowContextSheet(true);
                triggerHaptic(8);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/40 border border-accent-hover text-xs font-medium text-zinc-100 hover:bg-accent/60 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-zinc-200 stroke-[1.75]" />
              <span>
                {hasFatigueAlert
                  ? 'Alerta de recuperação e notas'
                  : 'Notas da sessão'}
              </span>
              {contextItemCount > 1 && (
                <span className="text-[11px] text-zinc-300 tabular-nums">({contextItemCount})</span>
              )}
            </button>
          ) : <span />}

          {canUseRealtime && (
            <button
              type="button"
              onClick={() => {
                setShowLiveBuddySheet(true);
                triggerHaptic(8);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium active:scale-[0.97] transition-[background-color,border-color,transform] duration-150 cursor-pointer ${
                liveRoomCode
                  ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:text-white hover:border-white/[0.16]'
              }`}
            >
              <Users className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>
                {liveRoomCode ? `Ao vivo · ${Math.max(1, liveMembers.length)}` : 'Em dupla'}
              </span>
            </button>
          )}
        </div>

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
          <div className="space-y-4">
            <FocusExerciseCard
              key={activeExercise.id}
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
              isExpressMode={isExpressMode}
              onToggleExpressMode={toggleExpressMode}
              onNextExercise={() => {
                if (currentFocusedIndex < currentExercisesList.length - 1) {
                  setFocusedExerciseId(currentExercisesList[currentFocusedIndex + 1].id);
                } else {
                  handleFinishWorkout();
                }
              }}
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
            onOpenSwap={setSwappingExercise}
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
        initialRestState={activeDraft?.restTimerState || null}
        onRestStateChange={setRestTimerState}
      />

      <WorkoutDock
        index={currentFocusedIndex}
        total={currentExercisesList.length}
        exerciseName={activeExercise?.name}
        onPrev={() => {
          if (currentFocusedIndex > 0) {
            setFocusedExerciseId(currentExercisesList[currentFocusedIndex - 1].id);
          }
        }}
        onNext={() => {
          if (currentFocusedIndex < currentExercisesList.length - 1) {
            setFocusedExerciseId(currentExercisesList[currentFocusedIndex + 1].id);
          } else {
            handleFinishWorkout();
          }
        }}
      />

      {showContextSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowContextSheet(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Notas da sessão"
            className="bg-surface border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Notas da Sessão</h3>
              <button
                type="button"
                onClick={() => setShowContextSheet(false)}
                aria-label="Fechar notas da sessão"
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {hasFatigueAlert && (
              <div className="p-3.5 rounded-2xl bg-surface-2/80 border-l-2 border-accent-hover flex items-center justify-between gap-3 text-xs">
                <p className="text-zinc-200 leading-relaxed">
                  <strong className="text-white font-semibold">Músculo em recuperação:</strong> Treina com margem de segurança e preserva a técnica hoje.
                </p>
                <button
                  type="button"
                  onClick={() => setFatigueDismissed(true)}
                  className="text-[11px] font-semibold text-white bg-accent border border-accent-hover px-3 py-1.5 rounded-full shrink-0 cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            {mesoParams && (
              <div className="p-3.5 rounded-2xl bg-surface-2/60 border-l-2 border-accent-hover text-xs text-zinc-200 leading-relaxed">
                <strong className="text-white font-semibold">Mesociclo:</strong> {mesoWeekLabel(mesoParams)}
              </div>
            )}

            {workout?.coachNotes && (
              <div className="p-3.5 rounded-2xl bg-surface-2/60 border-l-2 border-accent-hover text-xs text-zinc-200 leading-relaxed">
                <strong className="text-white font-semibold">
                  Instruções de {workout.trainerName || 'o teu PT'}:
                </strong>{' '}
                {workout.coachNotes}
              </div>
            )}
          </div>
        </div>
      )}

      <LiveBuddySheet
        isOpen={showLiveBuddySheet}
        onClose={() => setShowLiveBuddySheet(false)}
        roomCode={liveRoomCode}
        members={liveMembers}
        events={liveEvents}
        canUseRealtime={canUseRealtime}
        onJoinRoom={handleJoinLiveRoom}
        onLeaveRoom={handleLeaveLiveRoom}
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
        pastWeights={pastWeights}
        plateCalcWeight={plateCalcWeight}
        prevIndex={prevIndex}
        selectedExerciseForModal={selectedExerciseForModal}
        sessionFacts={sessionFacts}
        sessionNewPRs={sessionNewPRs}
        showCelebration={showCelebration}
        streakInfo={streakInfo}
        swapExcludeIds={currentExercisesList.map((e) => e.id)}
        swappingExercise={swappingExercise}
        totalVolumeKg={totalVolumeKg}
        workout={workout}
      />
    </div>
  );
}
