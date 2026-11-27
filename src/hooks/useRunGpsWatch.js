import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DEFAULT_TRACKING_CONFIG,
  validateAndFilterGpsPoint,
  generateSimulatedStep,
  haversineDistanceMeters
} from '../utils/runningService';
import { triggerHaptic } from '../utils/audio';

/** Gere permissões GPS, watcher de geolocalização e modo simulação de passadeira. */
export default function useRunGpsWatch({
  sessionStatus,
  isSimulation,
  simulationMode,
  lastCoordRef,
  coordinatesRef,
  kalmanFilterRef,
  setCoordinates,
  setSpeedKmh,
  onAcceptedPoint
}) {
  const [permissionState, setPermissionState] = useState(() =>
    typeof navigator === 'undefined' || !('geolocation' in navigator) ? 'unsupported' : 'prompt'
  );
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gpsErrorCode, setGpsErrorCode] = useState(null);
  const [currentFix, setCurrentFix] = useState(null);
  const [isGpsWarmedUp, setIsGpsWarmedUp] = useState(false);

  const watchIdRef = useRef(null);
  const simIntervalRef = useRef(null);
  const simStepRef = useRef(0);
  const consecutiveRejectionsRef = useRef(0);
  const lastEmittedFixRef = useRef(null);
  const currentFixRef = useRef(null);

  useEffect(() => {
    currentFixRef.current = currentFix;
  }, [currentFix]);

  const stopSensors = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const resetCounters = useCallback((step = 0) => {
    consecutiveRejectionsRef.current = 0;
    simStepRef.current = step;
    lastEmittedFixRef.current = null;
  }, []);

  // Consultar estado da permissão via Permissions API
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return undefined;
    if (!('permissions' in navigator) || typeof navigator.permissions.query !== 'function') {
      return undefined;
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

  // Rastreamento GPS real em contagem regressiva e corrida ativa
  useEffect(() => {
    const shouldWatchGps = (sessionStatus === 'countdown' || sessionStatus === 'running') && !isSimulation;

    if (!shouldWatchGps) {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return undefined;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      queueMicrotask(() => {
        setGpsError('Geolocalização não suportada neste navegador/dispositivo.');
        setGpsErrorCode('UNAVAILABLE');
      });
      return undefined;
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

        // Throttling de currentFix quando parado para evitar re-renders por ruído GNSS no RunLiveHud/Mapa
        const prevFix = lastEmittedFixRef.current;
        const movedMeters = prevFix
          ? haversineDistanceMeters(prevFix.lat, prevFix.lng, incomingPoint.lat, incomingPoint.lng)
          : Infinity;
        if (!prevFix || movedMeters >= 3 || (incomingPoint.timestamp - prevFix.timestamp >= 4000 && movedMeters >= 1)) {
          lastEmittedFixRef.current = incomingPoint;
          setCurrentFix(incomingPoint);
        }

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

        if (sessionStatus === 'countdown') {
          if (accuracy <= DEFAULT_TRACKING_CONFIG.warmupAccuracyMeters) {
            lastCoordRef.current = kalmanFilterRef.current.process(incomingPoint);
          }
          return;
        }

        const validation = validateAndFilterGpsPoint(
          incomingPoint,
          lastCoordRef.current,
          DEFAULT_TRACKING_CONFIG
        );

        if (validation.accepted) {
          consecutiveRejectionsRef.current = 0;
          onAcceptedPoint(incomingPoint, speed);
        } else {
          if (validation.reason === 'jitter_stationary' && (speed === null || speed < 0.5)) {
            setSpeedKmh(0);
          }

          if (validation.reason === 'speed_jump' && accuracy <= 18) {
            consecutiveRejectionsRef.current += 1;
            if (consecutiveRejectionsRef.current >= 3) {
              consecutiveRejectionsRef.current = 0;
              kalmanFilterRef.current.Reset();
              lastCoordRef.current = kalmanFilterRef.current.process(incomingPoint);
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
          setGpsError('A procurar satélites GPS. Fica num local aberto.');
        } else {
          setGpsError('Sinal de GPS fraco ou permissão pendente.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
    );

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation, onAcceptedPoint, lastCoordRef, kalmanFilterRef, setSpeedKmh]);

  // Simulação realista (testes em casa ou corrida em passadeira)
  useEffect(() => {
    if (sessionStatus !== 'running' || !isSimulation) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return undefined;
    }

    if (!lastCoordRef.current) {
      const startCoord = generateSimulatedStep(0, null, currentFixRef.current, simulationMode);
      const smoothedStart = kalmanFilterRef.current.process(startCoord);
      lastCoordRef.current = smoothedStart;
      coordinatesRef.current = [smoothedStart];
      setCoordinates([smoothedStart]);
      setCurrentFix(smoothedStart);
      currentFixRef.current = smoothedStart;
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
        onAcceptedPoint(simulatedRaw, simulatedRaw.speed);
      }
    }, 1000);

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation, simulationMode, onAcceptedPoint, lastCoordRef, coordinatesRef, kalmanFilterRef, setCoordinates]);

  const handlePrewarmGps = useCallback(() => {
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
  }, []);

  return {
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
  };
}
