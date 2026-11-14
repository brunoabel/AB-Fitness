import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import RunningShareModal from './RunningShareModal';
import BadgeCelebrationModal from './BadgeCelebrationModal';
import StreakMilestoneModal from './StreakMilestoneModal';
import {
  DEFAULT_TRACKING_CONFIG,
  haversineDistanceMeters,
  formatPace,
  calculateRunningCalories,
  estimateVO2Max,
  validateAndFilterGpsPoint,
  GpsKalmanFilter2D,
  calculateRollingPace,
  generateSimulatedStep,
  computeSplits,
  simplifyRoute
} from '../utils/runningService';
import {
  getRunsHistory,
  saveRunRecord,
  deleteRunRecord,
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
  getVoiceCuesPreference,
  unlockSpeechIOS
} from '../utils/speech';
import { syncRunToSupabase, syncUserRunsFromSupabase } from '../services/runningSyncService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { useAuth } from '../context';
import { useWakeLock } from '../hooks/useWakeLock';
import {
  AUTO_PAUSE_PREF_KEY,
  PERMISSION_EXPLAINED_KEY,
  WEEKLY_GOAL_PREF_KEY,
  RUN_TARGET_PREF_KEY
} from './running/runPrefs';
import { getRunTargetById, computeTargetProgress } from '../utils/runGoals';
import { selectGhostReference, evaluateGhostPacer } from '../utils/ghostPacer';
import RunHeader from './running/RunHeader';
import RunPermissionModal from './running/RunPermissionModal';
import RunLiveHud from './running/RunLiveHud';
import RunSummary from './running/RunSummary';
import RunHome from './running/RunHome';


export default function RunningHub({ isDark = true }) {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  // Preferência de áudio / locução por voz nos fones
  const [voiceEnabled, setVoiceEnabled] = useState(() => getVoiceCuesPreference());
  // Preferência de Auto-Pause inteligente quando parado em semáforos/cruzamentos
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_PAUSE_PREF_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);

  // Meta semanal e objetivo da corrida atual persistidos localmente
  const [weeklyGoalKm, setWeeklyGoalKm] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(WEEKLY_GOAL_PREF_KEY));
      return saved > 0 ? saved : 10;
    } catch {
      return 10;
    }
  });
  const [selectedTarget, setSelectedTarget] = useState(() => {
    try {
      return getRunTargetById(localStorage.getItem(RUN_TARGET_PREF_KEY));
    } catch {
      return getRunTargetById('free');
    }
  });
  const targetReachedNotifiedRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(WEEKLY_GOAL_PREF_KEY, String(weeklyGoalKm));
    } catch {}
  }, [weeklyGoalKm]);

  useEffect(() => {
    try {
      localStorage.setItem(RUN_TARGET_PREF_KEY, selectedTarget?.id || 'free');
    } catch {}
  }, [selectedTarget]);

  // Rascunho de corrida recuperado (caso o utilizador tenha pausado ou recarregado a app)
  const initialDraft = React.useMemo(() => getActiveRunDraft(), []);

  // Estados da Sessão de Corrida: 'idle' | 'countdown' | 'running' | 'paused' | 'completed'
  const [sessionStatus, setSessionStatus] = useState(() => (
    initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')
      ? 'paused'
      : 'idle'
  ));

  // Mantém o ecrã ligado durante a corrida ativa e na contagem regressiva
  useWakeLock(sessionStatus === 'running' || sessionStatus === 'countdown');

  const [countdown, setCountdown] = useState(3);
  const [isSimulation, setIsSimulation] = useState(() => initialDraft?.isSimulation ?? false);
  const [simulationMode, setSimulationMode] = useState('normal'); // 'normal' | 'noisy'

  // Métricas ao vivo inicializadas do rascunho se existente
  const [distanceKm, setDistanceKm] = useState(() => initialDraft?.distanceKm ?? 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => initialDraft?.elapsedSeconds ?? 0);
  const [currentPaceSeconds, setCurrentPaceSeconds] = useState(0);
  const [avgPaceSeconds, setAvgPaceSeconds] = useState(() => initialDraft?.avgPaceSeconds ?? 0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [calories, setCalories] = useState(() => initialDraft?.calories ?? 0);
  const [elevationGainM, setElevationGainM] = useState(() => initialDraft?.elevationGainM ?? 0);
  const [coordinates, setCoordinates] = useState(() => initialDraft?.coordinates ?? []);
  const [splits, setSplits] = useState(() => initialDraft?.splits ?? []);

  // Estado de Permissões, Aquecimento (Warm-up) e Diagnóstico GPS
  const [permissionState, setPermissionState] = useState(() =>
    typeof navigator === 'undefined' || !('geolocation' in navigator) ? 'unsupported' : 'prompt'
  ); // 'prompt' | 'granted' | 'denied' | 'unsupported'
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // Em metros
  const [gpsError, setGpsError] = useState(null);
  const [gpsErrorCode, setGpsErrorCode] = useState(null); // 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT' | 'COARSE'
  const [currentFix, setCurrentFix] = useState(null); // Posição atual mesmo antes de iniciar acumulação
  const [isGpsWarmedUp, setIsGpsWarmedUp] = useState(false);

  // Histórico e Modal de Partilha
  const [runsHistory, setRunsHistory] = useState(() => getRunsHistory());
  const [selectedRunForShare, setSelectedRunForShare] = useState(null);
  const [lastCompletedRun, setLastCompletedRun] = useState(null);

  // Refs de controlo de tempo monotónico (resistente a bloqueio de ecrã / segundo plano) e geolocalização
  const timerIntervalRef = useRef(null);
  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastCoordRef = useRef(null);
  const coordinatesRef = useRef(initialDraft?.coordinates ?? []);
  const distanceKmRef = useRef(initialDraft?.distanceKm ?? 0);
  const splitsRef = useRef(initialDraft?.splits ?? []);
  const elevationRef = useRef(initialDraft?.elevationGainM ?? 0);
  const lastAltitudeAnchorRef = useRef(null);
  const kalmanFilterRef = useRef(new GpsKalmanFilter2D(3.0));
  const consecutiveRejectionsRef = useRef(0);
  const lastValidMoveTimestampRef = useRef(Date.now());
  const isAutoPausedRef = useRef(false);

  // Controlo de tempo real por relógio monotónico (Date.now())
  const startTimestampRef = useRef(null);
  const accumulatedPausedMsRef = useRef(0);
  const pauseStartedAtRef = useRef(null);
  const elapsedSecondsRef = useRef(initialDraft?.elapsedSeconds ?? 0);
  const currentPaceRef = useRef(0);
  const lastDraftSaveTimeRef = useRef(0);

  const simStepRef = useRef(0);
  const countdownIntervalRef = useRef(null);
  const justResumedRef = useRef(false);
  const voiceEnabledRef = useRef(voiceEnabled);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Consultar estado da permissão de Geolocalização via Permissions API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return undefined;
    if (!('permissions' in navigator) || typeof navigator.permissions.query !== 'function') {
      return;
    }

    let permStatus = null;
    const handlePermChange = () => {
      if (permStatus) {
        setPermissionState(permStatus.state);
        if (permStatus.state === 'granted') {
          setGpsError(null);
          setGpsErrorCode(null);
        }
      }
    };

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permStatus = status;
        setPermissionState(status.state);
        status.addEventListener?.('change', handlePermChange);
      })
      .catch(() => {});

    return () => {
      permStatus?.removeEventListener?.('change', handlePermChange);
    };
  }, []);

  // Restaurar estado completo de um rascunho (LocalStorage ou IndexedDB)
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

    // Reconstrói a âncora temporal para que ao retomar o relógio continue exatamente de restoredElapsed
    const now = Date.now();
    startTimestampRef.current = now - restoredElapsed * 1000;
    accumulatedPausedMsRef.current = 0;
    pauseStartedAtRef.current = now;

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
    simStepRef.current = restoredCoords.length;
  }, []);

  // Hidratação na montagem
  useEffect(() => {
    if (initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')) {
      hydrateFromDraft(initialDraft);
      return;
    }

    getRunDraftFromIDB().then((draft) => {
      if (draft && (draft.sessionStatus === 'running' || draft.sessionStatus === 'paused')) {
        hydrateFromDraft(draft);
      }
    });
  }, [initialDraft, hydrateFromDraft]);

  // Limpeza geral ao desmontar componente
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Total acumulado de quilómetros
  const totalKmsAccumulated = runsHistory.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);

  const reloadHistory = () => {
    setRunsHistory(getRunsHistory());
  };

  // Celebra uma única vez por corrida quando o atleta cumpre o objetivo selecionado
  useEffect(() => {
    if (sessionStatus !== 'running' || targetReachedNotifiedRef.current) return;
    const prog = computeTargetProgress(selectedTarget, distanceKm, elapsedSeconds);
    if (prog?.reached) {
      targetReachedNotifiedRef.current = true;
      try { triggerHaptic([20, 40, 20]); } catch {}
      try { sound.playVictory(); } catch {}
    }
  }, [sessionStatus, selectedTarget, distanceKm, elapsedSeconds]);

  // Sincronizar corridas com o Supabase quando o utilizador estiver autenticado
  const syncUserId = user?.id;
  useEffect(() => {
    let active = true;
    if (syncUserId && syncUserId !== 'guest-local-user') {
      syncUserRunsFromSupabase(syncUserId)
        .then((merged) => {
          if (active && Array.isArray(merged) && merged.length > 0) {
            setRunsHistory(merged);
          }
        })
        .catch((err) => {
          console.warn('Sincronização de corridas da nuvem indisponível:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [syncUserId]);

  // 1. Cronómetro de Corrida Baseado em Timestamps Reais (Date.now())
  // Sobrevive a bloqueio de ecrã e suspensão de abas em segundo plano no iOS/Android
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

    // Verificar condição de Auto-Pause quando o utilizador fica parado (> 6s sem mover após já ter iniciado o percurso)
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
        accumulatedPausedMsRef.current += Math.max(0, Date.now() - pauseStartedAtRef.current);
        pauseStartedAtRef.current = null;
      }

      timerIntervalRef.current = setInterval(syncElapsedTime, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [sessionStatus, syncElapsedTime]);

  // Reconciliação imediata ao voltar do segundo plano / desbloquear o ecrã
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

  // 1b. Pace médio derivado (sem estado duplicado): com distância suficiente calcula ao vivo,
  // senão usa o último valor conhecido (ex.: hidratado do rascunho)
  const livePaceSeconds = distanceKm > 0.03 && elapsedSeconds > 0 ? Math.round(elapsedSeconds / distanceKm) : avgPaceSeconds;

  const ghostReference = useMemo(
    () => selectGhostReference(runsHistory, selectedTarget),
    [runsHistory, selectedTarget]
  );

  const ghostStatus = useMemo(() => {
    if (sessionStatus !== 'running' && sessionStatus !== 'paused') return null;
    return evaluateGhostPacer({ distanceKm, elapsedSeconds, ghostRun: ghostReference });
  }, [sessionStatus, distanceKm, elapsedSeconds, ghostReference]);

  // 1c. Persistência com Throttling no IndexedDB (grava imediatamente em mudanças de rota/estado ou a cada 5s)
  useEffect(() => {
    if (sessionStatus === 'running' || sessionStatus === 'paused') {
      const now = Date.now();
      const isStateTransition = sessionStatus === 'paused' || coordinates.length <= 2;
      if (isStateTransition || now - lastDraftSaveTimeRef.current >= 5000) {
        lastDraftSaveTimeRef.current = now;
        saveActiveRunDraft({
          sessionStatus,
          distanceKm,
          elapsedSeconds,
          avgPaceSeconds: livePaceSeconds,
          calories,
          elevationGainM,
          coordinates,
          splits,
          isSimulation,
          timestamp: now
        });
      }
    }
  }, [sessionStatus, distanceKm, elapsedSeconds, livePaceSeconds, calories, elevationGainM, coordinates, splits, isSimulation]);

  // Função central pura para processar um novo ponto válido (real ou simulado)
  const processAcceptedPoint = useCallback((rawPoint, gnssSpeedMs = null) => {
    const now = rawPoint.timestamp || Date.now();
    lastValidMoveTimestampRef.current = now;

    // Se estava em Auto-Pause e voltou a deslocar-se, retoma automaticamente e desconta o tempo parado
    if (isAutoPausedRef.current) {
      if (pauseStartedAtRef.current) {
        accumulatedPausedMsRef.current += Math.max(0, now - pauseStartedAtRef.current);
        pauseStartedAtRef.current = null;
      }
      isAutoPausedRef.current = false;
      setIsAutoPaused(false);
      lastCoordRef.current = rawPoint;
      kalmanFilterRef.current.process(rawPoint);
      return;
    }

    // Se acabou de retomar de uma pausa manual, estabelece nova âncora sem somar a reta da pausa
    if (justResumedRef.current) {
      justResumedRef.current = false;
      const smoothedAnchor = kalmanFilterRef.current.process(rawPoint);
      lastCoordRef.current = smoothedAnchor;
      const nextCoords = [...coordinatesRef.current, smoothedAnchor];
      coordinatesRef.current = nextCoords;
      setCoordinates(nextCoords);
      return;
    }

    // Aplica filtro de Kalman 2D para suavizar o traçado e eliminar zigue-zagues
    const smoothedPoint = kalmanFilterRef.current.process(rawPoint);
    const prevPoint = lastCoordRef.current;

    let nextDistanceKm = distanceKmRef.current;
    if (prevPoint) {
      const deltaMeters = haversineDistanceMeters(
        prevPoint.lat,
        prevPoint.lng,
        smoothedPoint.lat,
        smoothedPoint.lng
      );

      if (deltaMeters >= 1.5) {
        nextDistanceKm = distanceKmRef.current + deltaMeters / 1000;
        distanceKmRef.current = nextDistanceKm;
        setDistanceKm(nextDistanceKm);
        setCalories(calculateRunningCalories(nextDistanceKm));

        // Altimetria com banda morta (histerese de 1.5m) para evitar acumular ruído vertical do GPS
        if (typeof smoothedPoint.altitude === 'number' && smoothedPoint.altitude !== 0) {
          if (lastAltitudeAnchorRef.current === null) {
            lastAltitudeAnchorRef.current = smoothedPoint.altitude;
          } else {
            const elevDiff = smoothedPoint.altitude - lastAltitudeAnchorRef.current;
            if (Math.abs(elevDiff) >= DEFAULT_TRACKING_CONFIG.elevationDeadbandMeters) {
              if (elevDiff > 0) {
                elevationRef.current = Math.round(elevationRef.current + elevDiff);
                setElevationGainM(elevationRef.current);
              }
              lastAltitudeAnchorRef.current = smoothedPoint.altitude;
            }
          }
        }
      }
    } else if (typeof smoothedPoint.altitude === 'number' && smoothedPoint.altitude !== 0) {
      lastAltitudeAnchorRef.current = smoothedPoint.altitude;
    }

    lastCoordRef.current = smoothedPoint;
    const updatedCoords = [...coordinatesRef.current, smoothedPoint];
    coordinatesRef.current = updatedCoords;
    setCoordinates(updatedCoords);

    // Cálculo de Splits Interpolados Exatos (com coordenadas lat/lng de cada KM)
    const { splits: calculatedSplits } = computeSplits(updatedCoords);
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

    // Cálculo de Pace Atual com Janela Móvel (20s) + Doppler GNSS
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
  }, []);

  // 2. Rastreamento GPS Real via navigator.geolocation (Ativo tanto no Warm-up/Countdown como em Running)
  useEffect(() => {
    const shouldWatchGps = (sessionStatus === 'countdown' || sessionStatus === 'running') && !isSimulation;

    if (shouldWatchGps) {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        setGpsError('Geolocalização não suportada neste navegador/dispositivo.');
        setGpsErrorCode('UNAVAILABLE');
        return;
      }

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, speed } = position.coords;
          const roundedAcc = Math.round(accuracy || 0);
          setGpsAccuracy(roundedAcc);
          setPermissionState('granted');

          const incomingPoint = {
            lat: latitude,
            lng: longitude,
            timestamp: position.timestamp || Date.now(),
            accuracy: accuracy || 10,
            altitude: altitude || 0,
            speed: speed ?? null
          };

          // Atualiza sempre currentFix para centrar o mapa na posição real do utilizador
          setCurrentFix(incomingPoint);

          // Detetar Localização Aproximada (Android 12+ / iOS 14+)
          if (accuracy >= DEFAULT_TRACKING_CONFIG.coarseLocationThresholdMeters) {
            setIsGpsWarmedUp(false);
            setGpsErrorCode('COARSE');
            setGpsError(
              `Localização aproximada detetada (±${roundedAcc}m). Ative a "Localização Precisa" nas definições do navegador para medir a corrida.`
            );
            return;
          }

          setGpsError(null);
          setGpsErrorCode(null);

          if (accuracy <= DEFAULT_TRACKING_CONFIG.warmupAccuracyMeters) {
            setIsGpsWarmedUp(true);
          }

          // Durante a contagem regressiva, apenas pré-aquece o filtro de Kalman e posiciona o mapa
          if (sessionStatus === 'countdown') {
            if (accuracy <= DEFAULT_TRACKING_CONFIG.warmupAccuracyMeters) {
              const warmPt = kalmanFilterRef.current.process(incomingPoint);
              lastCoordRef.current = warmPt;
            }
            return;
          }

          // Em corrida ativa ('running'): validar ponto com filtro anti-ruído e anti-salto
          const validation = validateAndFilterGpsPoint(
            incomingPoint,
            lastCoordRef.current,
            DEFAULT_TRACKING_CONFIG
          );

          if (validation.accepted) {
            consecutiveRejectionsRef.current = 0;
            processAcceptedPoint(incomingPoint, speed);
          } else {
            // Se parado (jitter < 3m) e GNSS indica velocidade ~0, atualiza indicador de velocidade
            if (validation.reason === 'jitter_stationary' && (speed === null || speed < 0.5)) {
              setSpeedKmh(0);
            }

            // Proteção contra bloqueio de referência (ex: saída de túnel ou primeira âncora imprecisa):
            // Se 3 leituras consecutivas de alta precisão (<= 18m) forem rejeitadas por salto de velocidade,
            // re-ancora a referência para o novo ponto sem somar a distância do salto.
            if (validation.reason === 'speed_jump' && accuracy <= 18) {
              consecutiveRejectionsRef.current += 1;
              if (consecutiveRejectionsRef.current >= 3) {
                consecutiveRejectionsRef.current = 0;
                kalmanFilterRef.current.Reset();
                const reanchored = kalmanFilterRef.current.process(incomingPoint);
                lastCoordRef.current = reanchored;
              }
            }
          }
        },
        (err) => {
          console.warn('Erro de GPS:', err.code, err.message);
          if (err.code === 1) {
            setPermissionState('denied');
            setGpsErrorCode('DENIED');
            setGpsError(
              'Permissão de localização negada. Abra as definições do navegador/sistema e autorize o acesso à Localização Precisa.'
            );
          } else if (err.code === 2) {
            setGpsErrorCode('UNAVAILABLE');
            setGpsError(
              'Sinal de GPS indisponível. Verifique se os Serviços de Localização (GPS) estão ligados no dispositivo e se está ao ar livre.'
            );
          } else if (err.code === 3) {
            setGpsErrorCode('TIMEOUT');
            setGpsError('A adquirir satélites GPS... Mantenha-se em local aberto.');
          } else {
            setGpsError('Sinal de GPS fraco ou permissão pendente.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    } else {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation, processAcceptedPoint]);

  // 3. Simulação Realista (Para testes rápidos em casa ou corrida em passadeira)
  useEffect(() => {
    if (sessionStatus === 'running' && isSimulation) {
      if (!lastCoordRef.current) {
        const startCoord = generateSimulatedStep(0, null, currentFix, simulationMode);
        const smoothedStart = kalmanFilterRef.current.process(startCoord);
        lastCoordRef.current = smoothedStart;
        coordinatesRef.current = [smoothedStart];
        setCoordinates([smoothedStart]);
        setCurrentFix(smoothedStart);
        setGpsAccuracy(4);
      }

      simIntervalRef.current = setInterval(() => {
        simStepRef.current += 1;
        const simulatedRaw = generateSimulatedStep(
          simStepRef.current,
          lastCoordRef.current,
          null,
          simulationMode
        );

        setGpsAccuracy(simulatedRaw.accuracy);
        const check = validateAndFilterGpsPoint(simulatedRaw, lastCoordRef.current, DEFAULT_TRACKING_CONFIG);
        if (check.accepted) {
          processAcceptedPoint(simulatedRaw, simulatedRaw.speed);
        }
      }, 1000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation, simulationMode, currentFix, processAcceptedPoint]);

  // Pré-aquecer / Testar GPS manualmente no ecrã inicial
  const handlePrewarmGps = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Geolocalização não suportada neste dispositivo.');
      return;
    }
    triggerHaptic(10);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = Math.round(pos.coords.accuracy || 0);
        setGpsAccuracy(acc);
        setPermissionState('granted');
        const pt = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: pos.timestamp || Date.now(),
          accuracy: acc,
          altitude: pos.coords.altitude || 0
        };
        setCurrentFix(pt);
        if (acc < DEFAULT_TRACKING_CONFIG.coarseLocationThresholdMeters) {
          setIsGpsWarmedUp(acc <= DEFAULT_TRACKING_CONFIG.warmupAccuracyMeters);
          setGpsError(null);
          setGpsErrorCode(null);
        } else {
          setGpsErrorCode('COARSE');
          setGpsError(`Localização aproximada ativa (±${acc}m). Ative a Localização Precisa.`);
        }
      },
      (err) => {
        if (err.code === 1) {
          setPermissionState('denied');
          setGpsErrorCode('DENIED');
          setGpsError('Permissão negada. Autorize a localização nas definições do navegador.');
        } else {
          setGpsError('Não foi possível obter o sinal GPS. Verifique se a localização está ligada.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Iniciar Contagem Regressiva (com ecrã explicativo progressivo na primeira vez)
  const handleRequestStartRun = () => {
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
  };

  // Contagem regressiva 3, 2, 1, VAI!
  const handleStartCountdown = () => {
    setShowPermissionModal(false);
    try {
      localStorage.setItem(PERMISSION_EXPLAINED_KEY, 'true');
    } catch {}

    clearActiveRunDraft();
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
    consecutiveRejectionsRef.current = 0;
    simStepRef.current = 0;
    justResumedRef.current = false;
    isAutoPausedRef.current = false;
    setIsAutoPaused(false);
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
    pauseStartedAtRef.current = null;

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
  };

  // Saltar contagem regressiva e iniciar imediatamente
  const handleSkipCountdown = () => {
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
  };

  // Pausar Corrida Manualmente
  const handlePause = () => {
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
  };

  // Retomar Corrida (estabelece nova âncora de GPS e contabiliza pausa exata)
  const handleResume = () => {
    if (pauseStartedAtRef.current) {
      accumulatedPausedMsRef.current += Math.max(0, Date.now() - pauseStartedAtRef.current);
      pauseStartedAtRef.current = null;
    }
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
  };

  // Finalizar e Guardar Corrida
  const handleFinishRun = () => {
    try { triggerHaptic(50); } catch {}
    try { sound.playVictory(); } catch {}

    clearActiveRunDraft();

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (!reduceMotion) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    const finalDistance = Number(distanceKmRef.current.toFixed(2));
    const finalSeconds = elapsedSecondsRef.current;
    const computedAvgPaceSec = livePaceSeconds || (finalDistance > 0 ? Math.round(finalSeconds / finalDistance) : 0);
    const avgSpeed = finalDistance > 0 && finalSeconds > 0 
      ? Number((finalDistance / (finalSeconds / 3600)).toFixed(1))
      : 0;

    if (voiceEnabledRef.current) {
      try { announceFinish(finalDistance, finalSeconds); } catch {}
    }

    // Usa Ramer-Douglas-Peucker (simplifyRoute) em vez de .slice(0, 500) para preservar todo o trajeto
    const simplifiedCoords = simplifyRoute(coordinatesRef.current, 600, 2.0);

    const runRecord = {
      id: `run_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      distanceKm: finalDistance,
      durationSeconds: finalSeconds,
      avgPace: formatPace(computedAvgPaceSec),
      avgPaceSeconds: computedAvgPaceSec,
      calories: calories || calculateRunningCalories(finalDistance),
      vo2Max: estimateVO2Max(finalDistance, finalSeconds),
      avgSpeedKmh: avgSpeed,
      elevationGainM: elevationRef.current,
      splits: splitsRef.current,
      coordinates: simplifiedCoords,
      targetId: selectedTarget?.id || 'free',
      isSimulation
    };

    // Sequência consolidada (musculação + corrida): compara antes/depois de guardar a corrida,
    // para que corredores também desbloqueiem e celebrem o Motion Graphic de Sequência.
    const completedDaysForStreak = getCompletedDays();
    const prevStreak = computeStreak(completedDaysForStreak, WEEKLY_SCHEDULE, getRunsHistory());

    saveRunRecord(runRecord);
    reloadHistory();

    const nextStreak = computeStreak(completedDaysForStreak, WEEKLY_SCHEDULE, getRunsHistory());
    const streakInfoResult = getStreakMilestoneInfo(nextStreak, prevStreak);
    if (streakInfoResult.advanced && shouldShowStreakCelebration(nextStreak)) {
      setStreakInfo(streakInfoResult);
      markStreakCelebrated(nextStreak);
    }

    // 1. Sincronização em Nuvem (Supabase PostgreSQL)
    if (user?.id && user.id !== 'guest-local-user') {
      syncRunToSupabase(runRecord, user.id)
        .catch((err) => {
          console.warn('Erro ao guardar corrida na nuvem:', err);
        });
    }

    // 2. Avaliação de Conquistas & Medalhas Desbloqueadas
    try {
      const unlocked = evaluateAndUnlockBadges('run');
      if (unlocked && unlocked.length > 0) {
        setNewlyUnlockedBadge(unlocked[0]);
      }
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas:', badgeErr);
    }

    setLastCompletedRun(runRecord);
    setSelectedRunForShare(runRecord);
    setSessionStatus('completed');
  };

  // Resetar após fechar resumo do treino ou descartar
  const handleResetSession = () => {
    clearActiveRunDraft();
    targetReachedNotifiedRef.current = false;
    setSessionStatus('idle');
    setLastCompletedRun(null);
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
    simStepRef.current = 0;
    justResumedRef.current = false;
    isAutoPausedRef.current = false;
    setIsAutoPaused(false);
    startTimestampRef.current = null;
    accumulatedPausedMsRef.current = 0;
    pauseStartedAtRef.current = null;
  };

  const handleDeleteRun = (e, runId) => {
    e.stopPropagation();
    if (window.confirm('Deseja eliminar este registo de corrida?')) {
      deleteRunRecord(runId);
      reloadHistory();
      triggerHaptic(15);
    }
  };

  // Classificação simples e humana da qualidade do sinal GPS (sem jargões técnicos)
  const getGpsSignalBadge = () => {
    if (isSimulation) {
      return { label: 'Passadeira', color: 'bg-amber-400', text: 'text-amber-300' };
    }
    if (gpsErrorCode === 'DENIED' || permissionState === 'denied') {
      return { label: 'GPS bloqueado', color: 'bg-rose-500', text: 'text-rose-400' };
    }
    if (gpsErrorCode === 'COARSE') {
      return { label: 'Localização aproximada', color: 'bg-rose-500', text: 'text-rose-400' };
    }
    if (gpsAccuracy === null) {
      return { label: 'A localizar...', color: 'bg-amber-400', text: 'text-amber-300' };
    }
    if (gpsAccuracy <= DEFAULT_TRACKING_CONFIG.maxAccuracyMeters) {
      return { label: 'GPS pronto', color: 'bg-emerald-400', text: 'text-emerald-300' };
    }
    return { label: 'A ajustar sinal...', color: 'bg-amber-400', text: 'text-amber-300' };
  };

  const signalBadge = getGpsSignalBadge();

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
      <RunPermissionModal {...{ handleStartCountdown, setShowPermissionModal, showPermissionModal }} />

      {/* 2. Contagem regressiva limpa 3 · 2 · 1 em foco OLED */}
      {sessionStatus === 'countdown' && (
        <div
          onClick={handleSkipCountdown}
          className="py-20 text-center flex flex-col items-center justify-center animate-scaleUp cursor-pointer select-none"
        >
          <span className="font-display text-8xl sm:text-9xl font-semibold text-white tracking-[-0.04em] tabular-nums animate-pulse">
            {countdown}
          </span>
          <p className="text-sm font-medium text-zinc-300 mt-4">
            Prepara-te — a corrida vai começar
          </p>
          <span className="text-xs font-semibold text-zinc-500 hover:text-white mt-3 transition-colors">
            Tocar para arrancar já
          </span>
        </div>
      )}

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
      {/* 5. MODAL DE COMPARTILHAMENTO ESTILO STRAVA */}
      {selectedRunForShare && (
        <RunningShareModal
          runData={selectedRunForShare}
          isOpen={!!selectedRunForShare}
          onClose={() => {
            setSelectedRunForShare(null);
          }}
        />
      )}

      {/* Celebração Cinematográfica de Conquista / Medalha Desbloqueada */}
      {newlyUnlockedBadge && (
        <BadgeCelebrationModal
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}

      {/* Motion Graphic de Sequência (depois da medalha, se houver) */}
      {!newlyUnlockedBadge && streakInfo && (
        <StreakMilestoneModal
          streakInfo={streakInfo}
          onClose={() => setStreakInfo(null)}
        />
      )}

    </div>
  );
}
