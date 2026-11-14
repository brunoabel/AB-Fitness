import { formatPace } from './runningService.js';

function getRunAvgPace(run) {
  const explicit = Number(run?.avgPaceSeconds || 0);
  if (explicit > 0 && Number.isFinite(explicit)) return explicit;
  const dist = Number(run?.distanceKm || 0);
  const dur = Number(run?.durationSeconds || 0);
  if (dist > 0.05 && dur > 0) return Math.round(dur / dist);
  return 0;
}

/**
 * Seleciona a corrida de referência (Ghost Pacer) mais adequada no histórico:
 * prioriza o melhor ritmo (PR) numa distância comparável ao alvo atual.
 */
export function selectGhostReference(runsHistory = [], selectedTarget = null) {
  if (!Array.isArray(runsHistory) || runsHistory.length === 0) return null;

  const valid = runsHistory.filter((r) => {
    const dist = Number(r?.distanceKm || 0);
    const dur = Number(r?.durationSeconds || 0);
    const pace = getRunAvgPace(r);
    return dist >= 0.3 && dur >= 30 && pace >= 120 && pace <= 1500;
  });

  if (valid.length === 0) return null;

  const realRuns = valid.filter((r) => !r?.isSimulation);
  const pool = realRuns.length > 0 ? realRuns : valid;

  let chosen = null;
  let modeLabel = 'Melhor ritmo';

  if (selectedTarget?.type === 'distance' && Number(selectedTarget?.value) > 0) {
    const targetKm = Number(selectedTarget.value);
    const tolerance = Math.max(0.5, targetKm * 0.25);
    const matching = pool.filter(
      (r) => r?.targetId === selectedTarget.id || Math.abs(Number(r.distanceKm) - targetKm) <= tolerance
    );
    if (matching.length > 0) {
      chosen = [...matching].sort((a, b) => getRunAvgPace(a) - getRunAvgPace(b))[0];
      modeLabel = `PR ${selectedTarget.label}`;
    }
  }

  if (!chosen) {
    const longer = pool.filter((r) => Number(r.distanceKm) >= 0.5);
    const candidates = longer.length > 0 ? longer : pool;
    chosen = [...candidates].sort((a, b) => getRunAvgPace(a) - getRunAvgPace(b))[0];
  }

  const pace = getRunAvgPace(chosen);
  if (!pace) return null;

  return {
    id: chosen.id || chosen.date || 'ghost',
    label: modeLabel,
    distanceKm: Number(chosen.distanceKm),
    durationSeconds: Number(chosen.durationSeconds),
    avgPaceSeconds: pace,
    splits: Array.isArray(chosen.splits) ? chosen.splits : [],
  };
}

function getSplitDurationSeconds(split, fallbackPaceSeconds) {
  const val = Number(split?.durationSeconds ?? split?.splitSeconds ?? split?.paceSeconds ?? 0);
  if (val >= 120 && val <= 1500 && Number.isFinite(val)) return val;
  return fallbackPaceSeconds;
}

/**
 * Calcula o tempo esperado do Ghost até `distanceKm` com interpolação por split.
 */
export function computeGhostTimeAtDistance(distanceKm, ghostRun) {
  if (!ghostRun || !ghostRun.avgPaceSeconds || distanceKm <= 0) return 0;
  const splits = Array.isArray(ghostRun.splits) ? ghostRun.splits : [];
  if (splits.length === 0) {
    return distanceKm * ghostRun.avgPaceSeconds;
  }

  const fullKms = Math.floor(distanceKm);
  const partialKm = distanceKm - fullKms;
  let totalSec = 0;

  for (let i = 0; i < fullKms; i++) {
    const splitPace = i < splits.length ? getSplitDurationSeconds(splits[i], ghostRun.avgPaceSeconds) : ghostRun.avgPaceSeconds;
    totalSec += splitPace;
  }

  if (partialKm > 0) {
    const nextPace = fullKms < splits.length ? getSplitDurationSeconds(splits[fullKms], ghostRun.avgPaceSeconds) : ghostRun.avgPaceSeconds;
    totalSec += partialKm * nextPace;
  }

  return totalSec;
}

export function formatGhostDelta(deltaSeconds) {
  const abs = Math.abs(Math.round(deltaSeconds));
  const prefix = deltaSeconds >= 0 ? '+' : '-';
  if (abs < 60) return `${prefix}${abs}s`;
  const mins = Math.floor(abs / 60);
  const secs = abs % 60;
  return `${prefix}${mins}m${String(secs).padStart(2, '0')}s`;
}

/**
 * Avalia em tempo real a vantagem ou atraso face ao fantasma de referência.
 */
export function evaluateGhostPacer({ distanceKm = 0, elapsedSeconds = 0, ghostRun = null } = {}) {
  if (!ghostRun || !ghostRun.avgPaceSeconds) return null;
  if (distanceKm < 0.05 || elapsedSeconds < 10) return null;

  const ghostTime = computeGhostTimeAtDistance(distanceKm, ghostRun);
  const deltaSeconds = Math.round(ghostTime - elapsedSeconds);
  const absDeltaSeconds = Math.abs(deltaSeconds);

  let status = 'on_pace';
  let statusText = 'No ritmo';
  if (deltaSeconds > 2) {
    status = 'ahead';
    statusText = `${formatGhostDelta(deltaSeconds)} à frente`;
  } else if (deltaSeconds < -2) {
    status = 'behind';
    statusText = `${formatGhostDelta(deltaSeconds)} atrás`;
  }

  const distanceDeltaMeters = Math.round((deltaSeconds / ghostRun.avgPaceSeconds) * 1000);

  return {
    status,
    deltaSeconds,
    absDeltaSeconds,
    distanceDeltaMeters,
    ghostPaceSeconds: ghostRun.avgPaceSeconds,
    ghostPaceFormatted: formatPace(ghostRun.avgPaceSeconds),
    label: ghostRun.label || 'Ghost',
    statusText,
  };
}
