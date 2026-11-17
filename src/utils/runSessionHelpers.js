import {
  DEFAULT_TRACKING_CONFIG,
  calculateRunningCalories,
  estimateVO2Max,
  formatPace,
  haversineDistanceMeters
} from './runningService.js';

/** Classificação simples e humana da qualidade do sinal GPS. */
export function getGpsSignalBadge({ isSimulation, gpsErrorCode, permissionState, gpsAccuracy }) {
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
}

/** Calcula deslocamento horizontal, calorias e ganho de altimetria filtrando ruído vertical. */
export function advancePointTelemetry({
  smoothedPoint,
  prevPoint,
  distanceKm,
  elevationGainM,
  lastAltitudeAnchor
}) {
  let nextDistanceKm = distanceKm;
  let nextCalories = null;
  let nextElevationGainM = elevationGainM;
  let nextAltitudeAnchor = lastAltitudeAnchor;

  if (prevPoint) {
    const deltaMeters = haversineDistanceMeters(
      prevPoint.lat,
      prevPoint.lng,
      smoothedPoint.lat,
      smoothedPoint.lng
    );

    if (deltaMeters >= 1.5) {
      nextDistanceKm = distanceKm + deltaMeters / 1000;
      nextCalories = calculateRunningCalories(nextDistanceKm);

      if (typeof smoothedPoint.altitude === 'number' && smoothedPoint.altitude !== 0) {
        if (nextAltitudeAnchor === null) {
          nextAltitudeAnchor = smoothedPoint.altitude;
        } else {
          const elevDiff = smoothedPoint.altitude - nextAltitudeAnchor;
          if (Math.abs(elevDiff) >= DEFAULT_TRACKING_CONFIG.elevationDeadbandMeters) {
            if (elevDiff > 0) {
              nextElevationGainM = Math.round(elevationGainM + elevDiff);
            }
            nextAltitudeAnchor = smoothedPoint.altitude;
          }
        }
      }
    }
  } else if (typeof smoothedPoint.altitude === 'number' && smoothedPoint.altitude !== 0) {
    nextAltitudeAnchor = smoothedPoint.altitude;
  }

  return {
    nextDistanceKm,
    nextCalories,
    nextElevationGainM,
    nextAltitudeAnchor
  };
}

/** Constrói o registo final de corrida para armazenamento local e sincronização. */
export function buildCompletedRunRecord({
  finalDistance,
  finalSeconds,
  livePaceSeconds,
  calories,
  elevationGainM,
  splits,
  coordinates,
  targetId,
  isSimulation
}) {
  const computedAvgPaceSec = livePaceSeconds || (finalDistance > 0 ? Math.round(finalSeconds / finalDistance) : 0);
  const avgSpeed = finalDistance > 0 && finalSeconds > 0
    ? Number((finalDistance / (finalSeconds / 3600)).toFixed(1))
    : 0;

  return {
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
    elevationGainM,
    splits,
    coordinates,
    targetId: targetId || 'free',
    isSimulation
  };
}
