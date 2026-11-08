import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Share2, 
  Flame, 
  Timer, 
  Zap, 
  Navigation2, 
  Trophy, 
  Footprints, 
  Trash2,
  CheckCircle2,
  Smartphone,
  Volume2,
  VolumeX,
  Cloud,
  Satellite,
  Flag,
  Download,
  AlertTriangle,
  ShieldCheck,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import RunningMap from './RunningMap';
import RunningShareModal from './RunningShareModal';
import BadgeUnlockedToast from './BadgeUnlockedToast';
import { 
  DEFAULT_TRACKING_CONFIG,
  haversineDistanceMeters, 
  formatDuration, 
  formatPace, 
  calculateRunningCalories, 
  validateAndFilterGpsPoint,
  GpsKalmanFilter2D,
  calculateRollingPace,
  generateSimulatedStep,
  downloadGPX,
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
  getRunDraftFromIDB
} from '../utils/storage';
import { sound, triggerHaptic } from '../utils/audio';
import { 
  announceSplit, 
  announceStart, 
  announcePause, 
  announceResume, 
  announceFinish, 
  getVoiceCuesPreference, 
  saveVoiceCuesPreference,
  unlockSpeechIOS
} from '../utils/speech';
import { syncRunToSupabase, syncUserRunsFromSupabase } from '../services/runningSyncService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { useAuth } from '../context';
import { useWakeLock } from '../hooks/useWakeLock';

const AUTO_PAUSE_PREF_KEY = 'ab_fitness_autopause_v1';
const PERMISSION_EXPLAINED_KEY = 'ab_fitness_gps_explained_v1';

export default function RunningHub({ isDark = true }) {
  const { user } = useAuth();

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

  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);

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
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt' | 'granted' | 'denied' | 'unsupported'
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
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setPermissionState('unsupported');
      return;
    }
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

  // Totais Acumulados
  const totalKmsAccumulated = runsHistory.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
  const totalRunsCount = runsHistory.length;

  const reloadHistory = () => {
    setRunsHistory(getRunsHistory());
  };

  // Sincronizar corridas com o Supabase quando o utilizador estiver autenticado
  useEffect(() => {
    let active = true;
    if (user && user.id && user.id !== 'guest-local-user') {
      syncUserRunsFromSupabase(user.id)
        .then((merged) => {
          if (active && Array.isArray(merged) && merged.length > 0) {
            setRunsHistory(merged);
            setIsCloudSynced(true);
          }
        })
        .catch((err) => {
          console.warn('Sincronização de corridas da nuvem indisponível:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [user?.id]);

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

  // 1b. Cálculo Reativo e Estável do Pace Médio Geral
  useEffect(() => {
    if (distanceKm > 0.03 && elapsedSeconds > 0) {
      const avg = Math.round(elapsedSeconds / distanceKm);
      setAvgPaceSeconds(avg);
    }
  }, [elapsedSeconds, distanceKm]);

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
          avgPaceSeconds,
          calories,
          elevationGainM,
          coordinates,
          splits,
          isSimulation,
          timestamp: now
        });
      }
    }
  }, [sessionStatus, distanceKm, elapsedSeconds, avgPaceSeconds, calories, elevationGainM, coordinates, splits, isSimulation]);

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
      splitsRef.current = calculatedSplits;
      setSplits(calculatedSplits);

      try { sound.playSuccess(); } catch {}
      try { triggerHaptic(25); } catch {}
      if (voiceEnabledRef.current && latestSplit) {
        try {
          announceSplit(latestSplit.km, latestSplit.durationSeconds, latestSplit.paceStr || latestSplit.pace);
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

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const finalDistance = Number(distanceKmRef.current.toFixed(2));
    const finalSeconds = elapsedSecondsRef.current;
    const computedAvgPaceSec = avgPaceSeconds || (finalDistance > 0 ? Math.round(finalSeconds / finalDistance) : 0);
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
      avgSpeedKmh: avgSpeed,
      elevationGainM: elevationRef.current,
      splits: splitsRef.current,
      coordinates: simplifiedCoords,
      isSimulation
    };

    saveRunRecord(runRecord);
    reloadHistory();

    // 1. Sincronização em Nuvem (Supabase PostgreSQL)
    if (user?.id && user.id !== 'guest-local-user') {
      syncRunToSupabase(runRecord, user.id)
        .then(() => {
          setIsCloudSynced(true);
        })
        .catch((err) => {
          console.warn('Erro ao guardar corrida na nuvem:', err);
        });
    }

    // 2. Avaliação de Conquistas & Medalhas Desbloqueadas
    try {
      const unlocked = evaluateAndUnlockBadges();
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

  // Classificação da qualidade do sinal GPS para feedback visual claro
  const getGpsSignalBadge = () => {
    if (isSimulation) {
      return { label: `Simulação (${simulationMode === 'noisy' ? 'Filtro Ruído' : 'Normal'})`, color: 'bg-amber-400', text: 'text-amber-400' };
    }
    if (gpsErrorCode === 'DENIED' || permissionState === 'denied') {
      return { label: 'Permissão GPS Negada', color: 'bg-rose-500', text: 'text-rose-400' };
    }
    if (gpsErrorCode === 'COARSE') {
      return { label: `GPS Aproximado (±${gpsAccuracy}m)`, color: 'bg-rose-500', text: 'text-rose-400' };
    }
    if (gpsAccuracy === null) {
      return { label: 'A adquirir satélites GPS...', color: 'bg-amber-400', text: 'text-amber-400' };
    }
    if (gpsAccuracy <= 12) {
      return { label: `GPS Alta Precisão (±${gpsAccuracy}m)`, color: 'bg-emerald-400', text: 'text-emerald-400' };
    }
    if (gpsAccuracy <= DEFAULT_TRACKING_CONFIG.maxAccuracyMeters) {
      return { label: `GPS Ativo (±${gpsAccuracy}m)`, color: 'bg-emerald-400', text: 'text-zinc-200' };
    }
    return { label: `A calibrar precisão (±${gpsAccuracy}m)...`, color: 'bg-amber-400', text: 'text-amber-400' };
  };

  const signalBadge = getGpsSignalBadge();

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn pb-24">
      
      {/* 1. Header do AB Running Club */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-accent">
              AB FITNESS • RUNNING CLUB
            </span>
            {isCloudSynced && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                <Cloud className="w-2.5 h-2.5" />
                Nuvem OK
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
            Running Club
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Rastreio GPS com filtro de Kalman 2D, janela móvel de pace e Auto-Pause inteligente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle de Locução por Voz nos Fones */}
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              saveVoiceCuesPreference(next);
              triggerHaptic(10);
            }}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              voiceEnabled 
                ? 'bg-accent/15 text-accent border-accent/30' 
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-white/10'
            }`}
            title={voiceEnabled ? 'Locução por voz ativada nos fones' : 'Locução por voz desativada'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-accent" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Badges de Totais Acumulados */}
          <div className="text-right bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 px-3.5 py-2 rounded-xl">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total ({totalRunsCount} {totalRunsCount === 1 ? 'sessão' : 'sessões'})
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums">
              {totalKmsAccumulated.toFixed(1)} <span className="text-[11px] text-accent font-sans">KM</span>
            </span>
          </div>
        </div>
      </div>

      {/* Modal Explicativo de Permissão Progressiva */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                  Permissão de Geolocalização
                </span>
                <h3 className="text-lg font-black text-white">
                  Ativar GPS de Alta Precisão
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Para desenhar o seu percurso em tempo real, medir cada quilómetro com precisão e calcular o seu ritmo (pace), o <strong>AB Fitness</strong> precisa de acesso à sua <strong>Localização Precisa</strong> durante o treino.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Selecione &ldquo;Permitir durante o uso da app&rdquo;</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mantenha a opção &ldquo;Localização Precisa&rdquo; ligada (iOS/Android)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Agora Não
              </button>
              <button
                onClick={handleStartCountdown}
                className="flex-1 py-3 px-4 rounded-xl bg-accent hover:bg-accent text-zinc-950 font-black text-xs cursor-pointer transition-colors"
              >
                Continuar e Permitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONTAGEM REGRESSIVA 3.. 2.. 1.. (COM PRÉ-AQUECIMENTO DE GPS ATIVO) */}
      {sessionStatus === 'countdown' && (
        <div 
          onClick={handleSkipCountdown}
          className="rounded-2xl bg-zinc-950 border border-accent/30 p-12 text-center flex flex-col items-center justify-center animate-scaleUp shadow-xl cursor-pointer"
        >
          <span className="text-xs font-bold text-accent uppercase tracking-widest">
            A PREPARAR E PRÉ-AQUECER GPS...
          </span>
          <span className="text-7xl font-black text-white mt-2 tracking-tighter animate-pulse font-mono tabular-nums">
            {countdown}
          </span>
          <span className="text-xs text-zinc-400 mt-2">
            {gpsAccuracy ? `Sinal GPS detetado (±${gpsAccuracy}m)` : 'A sincronizar satélites GNSS e filtro Kalman 2D'}
          </span>
          <span className="text-xs text-accent mt-4 underline font-semibold">
            Tocar para iniciar imediatamente
          </span>
        </div>
      )}

      {/* 3. MODO AO VIVO (HUD DE CORRIDA ATIVA OU PAUSADA) */}
      {(sessionStatus === 'running' || sessionStatus === 'paused') && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
          
          {/* Mapa em Tempo Real (mantém o trajeto e corredor ativos mesmo em pausa) */}
          <div className="md:col-span-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm">
            <RunningMap 
              coordinates={coordinates} 
              splits={splits}
              currentPosition={currentFix}
              isLive={sessionStatus === 'running' || sessionStatus === 'paused'} 
              isDark={isDark} 
              height="340px" 
            />
          </div>

          {/* Painel Principal de Métricas */}
          <div className="md:col-span-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-white shadow-xl relative overflow-hidden">
            {/* Status do GPS e Auto-Pause no topo */}
            <div className="flex items-center justify-between mb-3 text-[11px] gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${signalBadge.color} animate-pulse`} />
                <span className={`font-bold truncate ${signalBadge.text}`}>
                  {signalBadge.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const next = !autoPauseEnabled;
                    setAutoPauseEnabled(next);
                    if (!next && isAutoPausedRef.current) {
                      handleResume();
                    }
                    try { localStorage.setItem(AUTO_PAUSE_PREF_KEY, String(next)); } catch {}
                    triggerHaptic(8);
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] border transition-colors cursor-pointer ${
                    autoPauseEnabled
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                  title="Pausar automaticamente quando parado em semáforos"
                >
                  Auto-Pause: {autoPauseEnabled ? 'ON' : 'OFF'}
                </button>

                <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wider ${
                  sessionStatus === 'running' && !isAutoPaused
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {sessionStatus === 'paused'
                    ? 'PAUSADO'
                    : isAutoPaused
                      ? 'AUTO-PAUSE'
                      : 'EM CORRIDA'}
                </span>
              </div>
            </div>

            {/* Alerta de Erro de Permissão / Localização Aproximada durante a corrida */}
            {gpsError && !isSimulation && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">{gpsError}</p>
                  {(gpsErrorCode === 'DENIED' || gpsErrorCode === 'COARSE') && (
                    <p className="text-[11px] text-rose-300/80">
                      iOS: Definições &gt; Privacidade &gt; Serviços de Localização &gt; Safari (ativar Localização Precisa). Android: Cadeado na barra de endereço &gt; Permissões &gt; Localização.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Distância Gigante de Alta Visibilidade */}
            <div className="text-center py-2 bg-black/40 rounded-xl border border-zinc-800/60 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                Distância Percorrida
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-6xl font-black tracking-tighter text-white font-mono tabular-nums">
                  {distanceKm.toFixed(2)}
                </span>
                <span className="text-xl font-black text-accent font-sans">
                  KM
                </span>
              </div>
            </div>

            {/* Grid 4 Métricas Técnicas */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-accent" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Ritmo / Pace</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {sessionStatus === 'paused' || isAutoPaused
                    ? (avgPaceSeconds > 0 ? formatPace(avgPaceSeconds) : "--:--")
                    : formatPace(currentPaceSeconds || avgPaceSeconds)}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused' || isAutoPaused
                    ? 'Pausado (Pace Médio)'
                    : `Médio: ${formatPace(avgPaceSeconds)}`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Timer className="w-3.5 h-3.5 text-accent" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Tempo</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused'
                    ? 'Treino Pausado'
                    : isAutoPaused
                      ? 'Auto-Pause (Parado)'
                      : `Velocidade: ${speedKmh} km/h`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Calorias</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Elevação</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  +{elevationGainM} <span className="text-xs font-normal text-zinc-400 font-sans">m</span>
                </span>
              </div>
            </div>

            {/* Splits / Parciais por KM com Barras Proporcionais e Destaque da Mais Rápida */}
            {splits.length > 0 && (() => {
              const minSec = Math.min(...splits.map((s) => Number(s.durationSeconds) || 999999));
              const maxSec = Math.max(...splits.map((s) => Number(s.durationSeconds) || 1));
              return (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Parciais por KM (Splits Interpolados)
                    </span>
                    <span className="text-[11px] text-accent font-semibold">
                      Ritmo Proporcional
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {splits.map((s) => {
                      const isFastest = (Number(s.durationSeconds) || 0) === minSec && splits.length > 1;
                      const barPct = maxSec > 0 ? Math.max(15, Math.min(100, (minSec / (Number(s.durationSeconds) || minSec)) * 100)) : 100;
                      return (
                        <div 
                          key={s.km}
                          className={`relative overflow-hidden py-1.5 px-3 rounded-lg border text-xs font-mono tabular-nums transition-colors ${
                            isFastest
                              ? 'bg-accent/10 border-accent/40 text-accent'
                              : 'bg-black/40 border-zinc-800/80 text-zinc-200'
                          }`}
                        >
                          <div 
                            className={`absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none ${
                              isFastest ? 'bg-accent' : 'bg-accent'
                            }`}
                            style={{ width: `${barPct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${isFastest ? 'text-accent' : 'text-accent'}`}>
                                KM {s.km}
                              </span>
                              {isFastest && (
                                <span className="text-[11px] px-1.5 py-0.2 rounded bg-accent/20 text-accent font-bold uppercase tracking-tighter">
                                  Mais rápido
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold">{s.paceStr || s.pace}</span>
                              <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Controles Principais de Corrida */}
            <div className="mt-5 pt-3 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-3">
                {sessionStatus === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSAR</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>RETOMAR</span>
                  </button>
                )}

                <button
                  onClick={handleFinishRun}
                  className="min-h-[48px] py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>CONCLUIR</span>
                </button>
              </div>

              {sessionStatus === 'paused' && (
                <button
                  onClick={() => {
                    if (window.confirm('Deseja descartar este treino? Os dados da sessão atual serão cancelados.')) {
                      handleResetSession();
                    }
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Descartar e Cancelar Treino
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TELA DE PÓS-CORRIDA / RESUMO CELEBRATÓRIO (COMPLETED) */}
      {sessionStatus === 'completed' && lastCompletedRun && (
        <div className="space-y-4 animate-fadeIn pb-12">
          {/* Header de Celebração */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TREINO CONCLUÍDO • RUNNING CLUB
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Excelente Corrida, Atleta!
                </h2>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O seu percurso suavizado, ritmo médio e parciais foram guardados com sucesso no seu perfil do Running Club.
            </p>

            {/* Ações Rápidas no Topo */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRunForShare(lastCompletedRun);
                  triggerHaptic(15);
                }}
                className="w-full sm:flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-accent text-app hover:bg-accent-hover font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>PARTILHAR CARTÃO (INSTAGRAM)</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  downloadGPX(lastCompletedRun.coordinates, `corrida_${lastCompletedRun.date?.split('T')[0] || 'ab_fitness'}`);
                }}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                title="Descarregar ficheiro GPX compatível com Strava e Garmin"
              >
                <Download className="w-4 h-4 text-accent" />
                <span>Exportar GPX</span>
              </button>

              <button
                onClick={handleResetSession}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span>Nova Corrida</span>
              </button>
            </div>
          </div>

          {/* Grid de Mapa e Estatísticas */}
          <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
            {/* Mapa do Percurso Percorrido */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Trajeto Oficial do Treino
                </span>
                <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="flex items-center gap-1"><Satellite className="w-3 h-3 text-accent" /> Satélite HD</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-emerald-400" /> Chegada</span>
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
                <RunningMap 
                  coordinates={lastCompletedRun.coordinates} 
                  splits={lastCompletedRun.splits}
                  isLive={false} 
                  isDark={isDark} 
                  height="300px" 
                />
              </div>
            </div>

            {/* Painel de Estatísticas Finais */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl space-y-4">
              {/* Distância Gigante */}
              <div className="text-center py-3 bg-black/40 rounded-xl border border-zinc-800/60">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                  Distância Total
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white font-mono tabular-nums">
                    {Number(lastCompletedRun.distanceKm).toFixed(2)}
                  </span>
                  <span className="text-lg font-black text-accent font-sans">
                    KM
                  </span>
                </div>
              </div>

              {/* Grid 4 Métricas */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Zap className="w-3.5 h-3.5 text-accent" />
                    <span>Ritmo Médio</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgPace}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Ritmo geral</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Timer className="w-3.5 h-3.5 text-accent" />
                    <span>Tempo Total</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {formatDuration(lastCompletedRun.durationSeconds)}
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Tempo decorrido</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Calorias</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Energia queimada</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[11px] uppercase font-bold mb-1">
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Velocidade</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgSpeedKmh} <span className="text-xs font-normal text-zinc-400 font-sans">km/h</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 block">Média horária</span>
                </div>
              </div>

              {/* Splits / KM a KM */}
              {lastCompletedRun.splits && lastCompletedRun.splits.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Parciais por KM (Splits Registados)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {lastCompletedRun.splits.map((s) => (
                      <div 
                        key={s.km}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800/60 font-mono tabular-nums"
                      >
                        <span className="font-bold text-accent">KM {s.km}</span>
                        <span className="text-zinc-200">{s.pace || s.paceStr}</span>
                        <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TELA INICIAL (PRONTO PARA CORRER) */}
      {sessionStatus === 'idle' && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
          
          {/* Card Principal: Iniciar Nova Corrida */}
          <div className="md:col-span-7 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-xl bg-zinc-800 text-accent border border-zinc-700/60">
                  <Footprints className="w-5 h-5" />
                </span>

                {/* Botão de Calibrar / Pré-aquecer GPS antes de correr */}
                {!isSimulation && (
                  <button
                    onClick={handlePrewarmGps}
                    className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      isGpsWarmedUp
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                    }`}
                    title="Verificar permissão e adquirir sinal de satélite antes de iniciar"
                  >
                    <Satellite className="w-3.5 h-3.5" />
                    <span>
                      {isGpsWarmedUp && gpsAccuracy
                        ? `GPS Pronto (±${gpsAccuracy}m)`
                        : 'Calibrar Sinal GPS'}
                    </span>
                  </button>
                )}
              </div>

              {/* Botões de Simulação de Teste / Debug */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsSimulation(!isSimulation);
                    triggerHaptic(10);
                  }}
                  className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isSimulation 
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isSimulation ? 'Simulação Ativa' : 'Simulação de Teste'}</span>
                </button>

                {isSimulation && (
                  <button
                    onClick={() => {
                      setSimulationMode((prev) => (prev === 'normal' ? 'noisy' : 'normal'));
                      triggerHaptic(8);
                    }}
                    className="min-h-[44px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-bold cursor-pointer"
                    title="Alternar entre simulação limpa ou com picos de ruído GPS para testar o filtro"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{simulationMode === 'noisy' ? 'Modo: Com Ruído' : 'Modo: Limpo'}</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pronto para Correr?
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
              O motor GPS de alta precisão aplica filtragem Kalman 2D contra desvios, janela móvel de ritmo, Auto-Pause inteligente e guarda rascunhos locais automaticamente.
            </p>

            {/* Diagnóstico de Erro de GPS / Permissões com guia de resolução */}
            {(gpsError || permissionState === 'denied') && !isSimulation && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{gpsError || 'Permissão de localização bloqueada no navegador.'}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  <strong>Como ativar nas definições:</strong> No iPhone (Safari), aceda a <em>Definições &gt; Privacidade e Segurança &gt; Serviços de Localização &gt; Sites do Safari</em> e ative a <strong>Localização Precisa</strong>. No Android (Chrome), toque no ícone de cadeado ao lado do URL &gt; <em>Permissões &gt; Localização</em>.
                </p>
              </div>
            )}

            {/* Botão de Começar Corrida */}
            <button
              onClick={handleRequestStartRun}
              className="w-full min-h-[48px] py-4 px-6 rounded-xl bg-accent text-app hover:bg-accent-hover font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INICIAR CORRIDA</span>
            </button>
          </div>

          {/* Histórico Recente de Corridas */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Corridas Concluídas ({runsHistory.length})
              </h3>
            </div>

            {runsHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 p-8 text-center text-zinc-400 dark:text-zinc-500">
                <Footprints className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Nenhuma corrida registada ainda.</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Faça a sua primeira corrida para desbloquear cartões exclusivos de partilha!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runsHistory.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunForShare(run)}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                        <Footprints className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums">
                            {Number(run.distanceKm).toFixed(2)} km
                          </span>
                          {run.isSimulation && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Teste
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono tabular-nums">
                          <span>{run.avgPace}</span>
                          <span>•</span>
                          <span>{formatDuration(run.durationSeconds)}</span>
                          <span>•</span>
                          <span>{run.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão de Exportar GPX */}
                      {run.coordinates && run.coordinates.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic(12);
                            downloadGPX(run.coordinates, `corrida_${run.date?.split('T')[0] || 'ab_fitness'}`);
                          }}
                          className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-accent transition-colors flex items-center justify-center cursor-pointer"
                          title="Exportar GPX para Strava / Garmin"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botão de Partilhar / Gerar Cartão */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunForShare(run);
                        }}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-accent transition-colors flex items-center justify-center cursor-pointer"
                        title="Gerar Cartão para o Instagram"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Botão de Eliminar */}
                      <button
                        onClick={(e) => handleDeleteRun(e, run.id)}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
