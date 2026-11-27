import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  DEFAULT_TRACKING_CONFIG,
  GpsKalmanFilter2D,
  calculateRollingPace,
  computeSplits,
  haversine,
  simplifyRoute
} from '../utils/runningService';
import { getLocalCustomPlan } from '../services/workoutService';
import {
  getRunsHistory,
  saveRunRecord,
  getActiveRunDraft,
  saveActiveRunDraft,
  clearActiveRunDraft,
  getRunDraftFromIDB,
  getCompletedDays
} from '../utils/storage';
import { computeStreak } from '../utils/streak';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { getStreakMilestoneInfo, shouldShowStreakCelebration, markStreakCelebrated } from '../utils/streakMilestones';
import { sound, triggerHaptic } from '../utils/audio';
import {
  announceSplit,
  announceStart,
  announcePause,
  announceResume,
  announceFinish,
  unlockSpeechIOS
} from '../utils/speech';
import { syncRunToSupabase } from '../services/runningSyncService';
import { pushWorkoutToConnectedWearables } from '../services/wearables/wearableManager';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { useAuth } from '../context';
import { useWakeLock } from '../hooks/useWakeLock';
import useRunPreferences from '../hooks/useRunPreferences';
import useRunGpsWatch from '../hooks/useRunGpsWatch';
import { PERMISSION_EXPLAINED_KEY } from './running/runPrefs';
import { computeTargetProgress } from '../utils/runGoals';
import { selectGhostReference, evaluateGhostPacer } from '../utils/ghostPacer';
import {
  advancePointTelemetry,
  buildCompletedRunRecord,
  getGpsSignalBadge
} from '../utils/runSessionHelpers';
import RunHeader from './running/RunHeader';
import RunOverlays from './running/RunOverlays';
import RunLiveHud from './running/RunLiveHud';
import RunSummary from './running/RunSummary';
import RunHome from './running/RunHome';

export default function RunningHub({ isDark = true }) {
  const { user } = useAuth();
  const userId = user?.id;
  const reduceMotion = useReducedMotion();

  const {
    voiceEnabled,
    setVoiceEnabled,
    voiceEnabledRef,
    autoPauseEnabled,
    setAutoPauseEnabled,
    weeklyGoalKm,
    setWeeklyGoalKm,
    selectedTarget,
    setSelectedTarget,
    runsHistory,
    reloadHistory,
    handleDeleteRun,
    totalKmsAccumulated
  } = useRunPreferences(userId);

  const [isAutoPaused, setIsAutoPaused] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const targetReachedNotifiedRef = useRef(false);

  const initialDraft = useMemo(() => getActiveRunDraft(), []);

  const [sessionStatus, setSessionStatus] = useState(() => (
    initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')
      ? 'paused'
      : 'idle'
  ));

  useWakeLock(sessionStatus === 'running' || sessionStatus === 'countdown');

  const [countdown, setCountdown] = useState(3);
  const [isSimulation, setIsSimulation] = useState(() => initialDraft?.isSimulation ?? false);
  const [simulationMode, setSimulationMode] = useState('normal');

  const [distanceKm, setDistanceKm] = useState(() => initialDraft?.distanceKm ?? 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => initialDraft?.elapsedSeconds ?? 0);
  const [currentPaceSeconds, setCurrentPaceSeconds] = useState(0);
  const [avgPaceSeconds, setAvgPaceSeconds] = useState(() => initialDraft?.avgPaceSeconds ?? 0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [calories, setCalories] = useState(() => initialDraft?.calories ?? 0);
  const [elevationGainM, setElevationGainM] = useState(() => initialDraft?.elevationGainM ?? 0);
  const [coordinates, setCoordinates] = useState(() => initialDraft?.coordinates ?? []);
  const [splits, setSplits] = useState(() => initialDraft?.splits ?? []);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRunForShare, setSelectedRunForShare] = useState(null);
  const [lastCompletedRun, setLastCompletedRun] = useState(null);

  const timerIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastCoordRef = useRef(null);
  const coordinatesRef = useRef(initialDraft?.coordinates ?? []);
  const distanceKmRef = useRef(initialDraft?.distanceKm ?? 0);
  const splitsRef = useRef(initialDraft?.splits ?? []);
  const elevationRef = useRef(initialDraft?.elevationGainM ?? 0);
  const lastAltitudeAnchorRef = useRef(null);
  const kalmanFilterRef = useRef(new GpsKalmanFilter2D(3.0));
  const lastValidMoveTimestampRef = useRef(0);
  const isAutoPausedRef = useRef(false);

  const startTimestampRef = useRef(null);
  const accumulatedPausedMsRef = useRef(0);
  const pauseStartedAtRef = useRef(null);
  const pausedIntervalsRef = useRef(Array.isArray(initialDraft?.pausedIntervals) ? initialDraft.pausedIntervals : []);
  const lowSpeedSinceRef = useRef(null);
  const latestDraftPayloadRef = useRef(null);
  const elapsedSecondsRef = useRef(initialDraft?.elapsedSeconds ?? 0);
  const currentPaceRef = useRef(0);
  const lastDraftSaveTimeRef = useRef(0);
  const justResumedRef = useRef(false);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const processAcceptedPoint = useCallback((rawPoint, gnssSpeedMs = null) => {
    const now = rawPoint.timestamp || Date.now();
    let instSpeedMs = gnssSpeedMs !== null && gnssSpeedMs !== undefined && gnssSpeedMs >= 0 ? gnssSpeedMs : null;
    if (instSpeedMs === null && lastCoordRef.current && now > (lastCoordRef.current.timestamp || 0)) {
      const dtSec = (now - lastCoordRef.current.timestamp) / 1000;
      if (dtSec > 0) instSpeedMs = haversine(lastCoordRef.current, rawPoint) / dtSec;
    }

    if (autoPauseEnabled && !isSimulation && distanceKmRef.current >= 0.02 && instSpeedMs !== null) {
      if (instSpeedMs < DEFAULT_TRACKING_CONFIG.autoPauseSpeedMs) {
        if (!lowSpeedSinceRef.current) lowSpeedSinceRef.current = now;
        if (!isAutoPausedRef.current && now - lowSpeedSinceRef.current >= DEFAULT_TRACKING_CONFIG.autoPauseDelayMs) {
          isAutoPausedRef.current = true;
          setIsAutoPaused(true);
          pauseStartedAtRef.current = now;
          setSpeedKmh(0);
          setCurrentPaceSeconds(0);
          currentPaceRef.current = 0;
          return;
        }
        if (isAutoPausedRef.current) return;
      } else if (instSpeedMs >= DEFAULT_TRACKING_CONFIG.autoPauseSpeedMs + 0.3) {
        lowSpeedSinceRef.current = null;
        lastValidMoveTimestampRef.current = now;
      } else if (isAutoPausedRef.current) {
        // Histerese: em pausa, só retoma acima de limiar + 0,3 m/s (o jitter do GPS parado fica nesta faixa)
        return;
      }
    } else {
      lowSpeedSinceRef.current = null;
      lastValidMoveTimestampRef.current = now;
    }

    if (isAutoPausedRef.current) {
      if (pauseStartedAtRef.current) {
        pausedIntervalsRef.current = [...pausedIntervalsRef.current, { start: pauseStartedAtRef.current, end: now }];
        accumulatedPausedMsRef.current += Math.max(0, now - pauseStartedAtRef.current);
        pauseStartedAtRef.current = null;
      }
      isAutoPausedRef.current = false;
      setIsAutoPaused(false);
      lastCoordRef.current = rawPoint;
      kalmanFilterRef.current.process(rawPoint);
      return;
    }

    if (justResumedRef.current) {
      justResumedRef.current = false;
      const smoothedAnchor = kalmanFilterRef.current.process(rawPoint);
      lastCoordRef.current = smoothedAnchor;
      const nextCoords = [...coordinatesRef.current, smoothedAnchor];
      coordinatesRef.current = nextCoords;
      setCoordinates(nextCoords);
      return;
    }

    const smoothedPoint = kalmanFilterRef.current.process(rawPoint);
    const telemetry = advancePointTelemetry({
      smoothedPoint,
      prevPoint: lastCoordRef.current,
      distanceKm: distanceKmRef.current,
      elevationGainM: elevationRef.current,
      lastAltitudeAnchor: lastAltitudeAnchorRef.current
    });

    if (telemetry.nextDistanceKm !== distanceKmRef.current) {
      distanceKmRef.current = telemetry.nextDistanceKm;
      setDistanceKm(telemetry.nextDistanceKm);
      if (telemetry.nextCalories !== null) setCalories(telemetry.nextCalories);
      if (telemetry.nextElevationGainM !== elevationRef.current) {
        elevationRef.current = telemetry.nextElevationGainM;
        setElevationGainM(telemetry.nextElevationGainM);
      }
    }
    lastAltitudeAnchorRef.current = telemetry.nextAltitudeAnchor;

    lastCoordRef.current = smoothedPoint;
    const updatedCoords = [...coordinatesRef.current, smoothedPoint];
    coordinatesRef.current = updatedCoords;
    setCoordinates(updatedCoords);

    const { splits: calculatedSplits } = computeSplits(updatedCoords, pausedIntervalsRef.current);
    if (calculatedSplits.length > splitsRef.current.length) {
      const latestSplit = calculatedSplits[calculatedSplits.length - 1];
      const prevSplit = calculatedSplits.length >= 2 ? calculatedSplits[calculatedSplits.length - 2] : null;
      splitsRef.current = calculatedSplits;
      setSplits(calculatedSplits);

      try { sound.playSuccess(); } catch {}
      try { triggerHaptic(25); } catch {}
      if (voiceEnabledRef.current && latestSplit) {
        try {
          announceSplit(
            latestSplit.km,
            latestSplit.durationSeconds,
            latestSplit.paceStr || latestSplit.pace,
            prevSplit?.durationSeconds || null
          );
        } catch {}
      }
    }

    const rollingPaceSec = calculateRollingPace({
      points: updatedCoords.slice(-25),
      nowTimestamp: now,
      gnssSpeedMs,
      previousPaceSec: currentPaceRef.current
    });

    currentPaceRef.current = rollingPaceSec;
    setCurrentPaceSeconds(rollingPaceSec);

    if (gnssSpeedMs !== null && gnssSpeedMs !== undefined && gnssSpeedMs >= 0.45) {
      setSpeedKmh(Number((gnssSpeedMs * 3.6).toFixed(1)));
    } else if (rollingPaceSec > 0) {
      setSpeedKmh(Number((3600 / rollingPaceSec).toFixed(1)));
    } else {
      setSpeedKmh(0);
    }
  }, [voiceEnabledRef]);

  const {
    permissionState,
    gpsAccuracy,
    gpsError,
    gpsErrorCode,
    currentFix,
    setCurrentFix,
    isGpsWarmedUp,
    handlePrewarmGps,
    stopSensors,
    resetCounters
  } = useRunGpsWatch({
    sessionStatus,
    isSimulation,
    simulationMode,
    lastCoordRef,
    coordinatesRef,
    kalmanFilterRef,
    setCoordinates,
    setSpeedKmh,
    onAcceptedPoint: processAcceptedPoint
  });

  const hydrateFromDraft = useCallback((draft) => {
    if (!draft || (draft.sessionStatus !== 'running' && draft.sessionStatus !== 'paused')) return;

    setSessionStatus('paused');
    setIsAutoPaused(false);
    isAutoPausedRef.current = false;

    const restoredDist = draft.distanceKm ?? 0;
    const restoredElapsed = draft.elapsedSeconds ?? 0;
    const restoredCoords = Array.isArray(draft.coordinates) ? draft.coordinates : [];
    const restoredSplits = Array.isArray(draft.splits) ? draft.splits : [];
    const restoredElev = draft.elevationGainM ?? 0;

    setDistanceKm(restoredDist);
    distanceKmRef.current = restoredDist;
    setElapsedSeconds(restoredElapsed);
    elapsedSecondsRef.current = restoredElapsed;

    const now = Date.now();
    startTimestampRef.current = now - restoredElapsed * 1000;
    accumulatedPausedMsRef.current = 0;
    pauseStartedAtRef.current = now;
    pausedIntervalsRef.current = Array.isArray(draft.pausedIntervals) ? draft.pausedIntervals : [];
    lowSpeedSinceRef.current = null;

    setAvgPaceSeconds(draft.avgPaceSeconds ?? 0);
    setCalories(draft.calories ?? 0);
    setElevationGainM(restoredElev);
    elevationRef.current = restoredElev;
    setCoordinates(restoredCoords);
    coordinatesRef.current = restoredCoords;
    setSplits(restoredSplits);
    splitsRef.current = restoredSplits;
    setIsSimulation(draft.isSimulation ?? false);

    if (restoredCoords.length > 0) {
      const lastPt = restoredCoords[restoredCoords.length - 1];
      lastCoordRef.current = lastPt;
      lastAltitudeAnchorRef.current = lastPt.altitude || null;
      setCurrentFix(lastPt);
    }
    resetCounters(restoredCoords.length);
  }, [resetCounters, setCurrentFix]);

  useEffect(() => {
    if (initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')) {
      queueMicrotask(() => hydrateFromDraft(initialDraft));
      return;
    }

    getRunDraftFromIDB().then((draft) => {
      if (draft && (draft.sessionStatus === 'running' || draft.sessionStatus === 'paused')) {
        hydrateFromDraft(draft);
      }
    });
  }, [initialDraft, hydrateFromDraft]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopSensors();
    };
  }, [stopSensors]);

  useEffect(() => {
    if (sessionStatus !== 'running' || targetReachedNotifiedRef.current) return;
    const prog = computeTargetProgress(selectedTarget, distanceKm, elapsedSeconds);
    if (prog?.reached) {
      targetReachedNotifiedRef.current = true;
      try { triggerHaptic([20, 40, 20]); } catch {}
      try { sound.playVictory(); } catch {}
    }
  }, [sessionStatus, selectedTarget, distanceKm, elapsedSeconds]);

  const syncElapsedTime = useCallback(() => {
    if (sessionStatus !== 'running' || isAutoPausedRef.current) return;
    if (!startTimestampRef.current) {
      startTimestampRef.current = Date.now() - elapsedSecondsRef.current * 1000;
    }
    const now = Date.now();
    const effectiveMs = Math.max(0, now - startTimestampRef.current - accumulatedPausedMsRef.current);
    const nextSec = Math.floor(effectiveMs / 1000);
    setElapsedSeconds(nextSec);
    elapsedSecondsRef.current = nextSec;

    if (
      autoPauseEnabled &&
      !isSimulation &&
      distanceKmRef.current >= 0.02 &&
      now - lastValidMoveTimestampRef.current > DEFAULT_TRACKING_CONFIG.autoPauseDelayMs
    ) {
      isAutoPausedRef.current = true;
      setIsAutoPaused(true);
      pauseStartedAtRef.current = now;
      setSpeedKmh(0);
      setCurrentPaceSeconds(0);
      currentPaceRef.current = 0;
    }
  }, [sessionStatus, autoPauseEnabled, isSimulation]);

  useEffect(() => {
    if (sessionStatus === 'running') {
      if (!startTimestampRef.current) {
        startTimestampRef.current = Date.now() - elapsedSecondsRef.current * 1000;
      }
      if (pauseStartedAtRef.current && !isAutoPausedRef.current) {
        const now = Date.now();
        pausedIntervalsRef.current = [...pausedIntervalsRef.current, { start: pauseStartedAtRef.current, end: now }];
        accumulatedPausedMsRef.current += Math.max(0, now - pauseStartedAtRef.current);
        pauseStartedAtRef.current = null;
      }
      timerIntervalRef.current = setInterval(syncElapsedTime, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [sessionStatus, syncElapsedTime]);

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && sessionStatus === 'running') {
        syncElapsedTime();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [sessionStatus, syncElapsedTime]);

  const livePaceSeconds = distanceKm > 0.03 && elapsedSeconds > 0 ? Math.round(elapsedSeconds / distanceKm) : avgPaceSeconds;

  const ghostReference = useMemo(
    () => selectGhostReference(runsHistory, selectedTarget),
    [runsHistory, selectedTarget]
  );

  const ghostStatus = useMemo(() => {
    if (sessionStatus !== 'running' && sessionStatus !== 'paused') return null;
    return evaluateGhostPacer({ distanceKm, elapsedSeconds, ghostRun: ghostReference });
  }, [sessionStatus, distanceKm, elapsedSeconds, ghostReference]);

  useEffect(() => {
    if (sessionStatus === 'running' || sessionStatus === 'paused') {
      const now = Date.now();
      const payload = {
        sessionStatus,
        distanceKm,
        elapsedSeconds,
        avgPaceSeconds: livePaceSeconds,
        calories,
        elevationGainM,
        coordinates,
        splits,
        pausedIntervals: pausedIntervalsRef.current,
        isSimulation,
        timestamp: now
      };
      latestDraftPayloadRef.current = payload;
      const isStateTransition = sessionStatus === 'paused' || coordinates.length <= 2;
      if (isStateTransition || now - lastDraftSaveTimeRef.current >= 5000) {
        lastDraftSaveTimeRef.current = now;
        saveActiveRunDraft(payload);
      }
    } else {
      latestDraftPayloadRef.current = null;
    }
  }, [sessionStatus, distanceKm, elapsedSeconds, livePaceSeconds, calories, elevationGainM, coordinates, splits, isSimulation]);

  useEffect(() => {
    const flushRunDraft = () => {
      if (latestDraftPayloadRef.current) {
        saveActiveRunDraft({ ...latestDraftPayloadRef.current, timestamp: Date.now() });
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushRunDraft();
    };
    window.addEventListener('pagehide', flushRunDraft);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flushRunDraft);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const resetMetricsState = useCallback(() => {
    targetReachedNotifiedRef.current = false;
    setDistanceKm(0);
    distanceKmRef.current = 0;
    setElapsedSeconds(0);
    elapsedSecondsRef.current = 0;
    setCurrentPaceSeconds(0);
    currentPaceRef.current = 0;
    setAvgPaceSeconds(0);
    setSpeedKmh(0);
    setCalories(0);
    setElevationGainM(0);
    elevationRef.current = 0;
    lastAltitudeAnchorRef.current = null;
    setCoordinates([]);
    coordinatesRef.current = [];
    setSplits([]);
    splitsRef.current = [];
    lastCoordRef.current = null;
    kalmanFilterRef.current.Reset();
    resetCounters(0);
    justResumedRef.current = false;
    isAutoPausedRef.current = false;
    setIsAutoPaused(false);
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
    pauseStartedAtRef.current = null;
    pausedIntervalsRef.current = [];
    lowSpeedSinceRef.current = null;
    latestDraftPayloadRef.current = null;
  }, [resetCounters]);

  const handleStartCountdown = useCallback(() => {
    setShowPermissionModal(false);
    try {
      localStorage.setItem(PERMISSION_EXPLAINED_KEY, 'true');
    } catch {}
    clearActiveRunDraft();
    resetMetricsState();

    setSessionStatus('countdown');
    setCountdown(3);
    try { unlockSpeechIOS(); } catch {}
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        try { sound.playTap(); } catch {}
        try { triggerHaptic(15); } catch {}
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        startTimestampRef.current = Date.now();
        lastValidMoveTimestampRef.current = Date.now();
        setSessionStatus('running');
        try { sound.playStart(); } catch {}
        try { triggerHaptic(40); } catch {}
        if (voiceEnabledRef.current) {
          try { announceStart(); } catch {}
        }
      }
    }, 1000);
  }, [resetMetricsState, voiceEnabledRef]);

  const handleRequestStartRun = useCallback(() => {
    if (!isSimulation && permissionState === 'prompt') {
      let alreadyExplained = false;
      try {
        alreadyExplained = localStorage.getItem(PERMISSION_EXPLAINED_KEY) === 'true';
      } catch {}
      if (!alreadyExplained) {
        setShowPermissionModal(true);
        return;
      }
    }
    handleStartCountdown();
  }, [isSimulation, permissionState, handleStartCountdown]);

  const handleSkipCountdown = useCallback(() => {
    try { unlockSpeechIOS(); } catch {}
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    startTimestampRef.current = Date.now();
    lastValidMoveTimestampRef.current = Date.now();
    setSessionStatus('running');
    try { sound.playStart(); } catch {}
    try { triggerHaptic(40); } catch {}
    if (voiceEnabledRef.current) {
      try { announceStart(); } catch {}
    }
  }, [voiceEnabledRef]);

  const handlePause = useCallback(() => {
    pauseStartedAtRef.current = Date.now();
    isAutoPausedRef.current = false;
    setIsAutoPaused(false);
    setSessionStatus('paused');
    setSpeedKmh(0);
    setCurrentPaceSeconds(0);
    currentPaceRef.current = 0;
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}
    if (voiceEnabledRef.current) {
      try { announcePause(); } catch {}
    }
  }, [voiceEnabledRef]);

  const handleResume = useCallback(() => {
    if (pauseStartedAtRef.current) {
      const now = Date.now();
      pausedIntervalsRef.current = [...pausedIntervalsRef.current, { start: pauseStartedAtRef.current, end: now }];
      accumulatedPausedMsRef.current += Math.max(0, now - pauseStartedAtRef.current);
      pauseStartedAtRef.current = null;
    }
    lowSpeedSinceRef.current = null;
    lastValidMoveTimestampRef.current = Date.now();
    isAutoPausedRef.current = false;
    setIsAutoPaused(false);
    justResumedRef.current = true;
    setSessionStatus('running');
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}
    if (voiceEnabledRef.current) {
      try { announceResume(); } catch {}
    }
  }, [voiceEnabledRef]);

  const handleFinishRun = useCallback(() => {
    try { triggerHaptic(50); } catch {}
    try { sound.playVictory(); } catch {}

    clearActiveRunDraft();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopSensors();

    if (!reduceMotion) {
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 }, ticks: 110, colors: ['#ffffff', '#c9d3e6'], disableForReducedMotion: true });
      } catch {}
    }

    const finalDistance = Number(distanceKmRef.current.toFixed(2));
    const finalSeconds = elapsedSecondsRef.current;

    if (voiceEnabledRef.current) {
      try { announceFinish(finalDistance, finalSeconds); } catch {}
    }

    const targetId = selectedTarget?.id;
    const runRecord = buildCompletedRunRecord({
      finalDistance,
      finalSeconds,
      livePaceSeconds,
      calories,
      elevationGainM: elevationRef.current,
      splits: splitsRef.current,
      coordinates: simplifyRoute(coordinatesRef.current, 600, 2.0),
      targetId,
      isSimulation
    });

    const completedDaysForStreak = getCompletedDays();
    const activeSchedule = getLocalCustomPlan() || WEEKLY_SCHEDULE;
    const prevStreak = computeStreak(completedDaysForStreak, activeSchedule, getRunsHistory());

    saveRunRecord(runRecord);
    reloadHistory();

    const nextStreak = computeStreak(completedDaysForStreak, activeSchedule, getRunsHistory());
    const streakInfoResult = getStreakMilestoneInfo(nextStreak, prevStreak);
    if (streakInfoResult.advanced && shouldShowStreakCelebration(nextStreak)) {
      setStreakInfo(streakInfoResult);
      markStreakCelebrated(nextStreak);
    }

    if (userId && userId !== 'guest-local-user') {
      syncRunToSupabase(runRecord, userId).catch((err) => {
        console.warn('Erro ao guardar corrida na nuvem:', err);
      });
    }

    if (!isSimulation && finalDistance >= 0.2) {
      pushWorkoutToConnectedWearables({
        name: `Corrida AB Fitness · ${finalDistance.toFixed(2)} km`,
        sportType: 'Run',
        // Início real da corrida (com pausas pelo meio), não "agora menos o tempo em movimento"
        startDateIso: new Date(startTimestampRef.current || Date.now() - finalSeconds * 1000).toISOString(),
        elapsedSeconds: finalSeconds,
        distanceMeters: Math.round(finalDistance * 1000),
        description: `Pace médio ${runRecord.avgPace} · +${Math.round(elevationRef.current)} m — AB Fitness`
      }, userId).catch(() => {});
    }

    try {
      const unlocked = evaluateAndUnlockBadges('run');
      if (unlocked && unlocked.length > 0) setNewlyUnlockedBadge(unlocked[0]);
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas:', badgeErr);
    }

    setLastCompletedRun(runRecord);
    setSelectedRunForShare(runRecord);
    setSessionStatus('completed');
  }, [calories, isSimulation, livePaceSeconds, reduceMotion, reloadHistory, selectedTarget, stopSensors, userId, voiceEnabledRef]);

  const handleResetSession = useCallback(() => {
    clearActiveRunDraft();
    setSessionStatus('idle');
    setLastCompletedRun(null);
    resetMetricsState();
  }, [resetMetricsState]);

  const signalBadge = useMemo(
    () => getGpsSignalBadge({ isSimulation, gpsErrorCode, permissionState, gpsAccuracy }),
    [isSimulation, gpsErrorCode, permissionState, gpsAccuracy]
  );

  return (
    <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-24 space-y-6 animate-fadeIn">
      <RunHeader
        {...{
          gpsAccuracy,
          gpsErrorCode,
          handlePrewarmGps,
          isGpsWarmedUp,
          isSimulation,
          permissionState,
          sessionStatus,
          setVoiceEnabled,
          voiceEnabled
        }}
      />

      <RunLiveHud
        {...{
          isDark,
          autoPauseEnabled,
          avgPaceSeconds,
          calories,
          coordinates,
          currentFix,
          currentPaceSeconds,
          distanceKm,
          elapsedSeconds,
          elevationGainM,
          ghostStatus,
          gpsError,
          gpsErrorCode,
          handleFinishRun,
          handlePause,
          handleResetSession,
          handleResume,
          isAutoPaused,
          isAutoPausedRef,
          isSimulation,
          livePaceSeconds,
          selectedTarget,
          sessionStatus,
          setAutoPauseEnabled,
          signalBadge,
          speedKmh,
          splits
        }}
      />
      <RunSummary
        {...{
          isDark,
          handleResetSession,
          lastCompletedRun,
          runsHistory,
          sessionStatus,
          setSelectedRunForShare
        }}
      />
      <RunHome
        {...{
          gpsError,
          handleDeleteRun,
          handleRequestStartRun,
          isSimulation,
          permissionState,
          runsHistory,
          selectedTarget,
          sessionStatus,
          setIsSimulation,
          setSelectedRunForShare,
          setSelectedTarget,
          setSimulationMode,
          setWeeklyGoalKm,
          simulationMode,
          totalKmsAccumulated,
          weeklyGoalKm
        }}
      />

      <RunOverlays
        countdown={countdown}
        handleSkipCountdown={handleSkipCountdown}
        handleStartCountdown={handleStartCountdown}
        newlyUnlockedBadge={newlyUnlockedBadge}
        onClearBadge={() => setNewlyUnlockedBadge(null)}
        onClearShare={() => setSelectedRunForShare(null)}
        onClearStreak={() => setStreakInfo(null)}
        selectedRunForShare={selectedRunForShare}
        sessionStatus={sessionStatus}
        setShowPermissionModal={setShowPermissionModal}
        showPermissionModal={showPermissionModal}
        streakInfo={streakInfo}
      />
    </div>
  );
}
