/**
 * Serviço de Integração com a API Garmin Connect Health.
 * Suporta OAuth 2.0, Body Battery, HRV Status, Sono e modo Simulador.
 */

import { localDateKey } from '../../utils/dateKey.js';
import { buildWearableTokenHeaders } from './wearableAuthHeader.js';

const GARMIN_AUTH_URL = 'https://connect.garmin.com/oauthConfirm';
const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest';

export function getGarminClientId() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GARMIN_CLIENT_ID || '';
  }
  return '';
}

export function buildGarminAuthUrl(redirectUri) {
  const clientId = getGarminClientId();
  if (!clientId) return null;

  const state = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('garmin_oauth_state', state);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state
  });

  return `${GARMIN_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGarminCodeForToken(code, redirectUri) {
  const headers = await buildWearableTokenHeaders();
  const res = await fetch('/api/garmin-token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, redirectUri })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Falha ao obter token da Garmin (${res.status})`);
  }

  return res.json();
}

export async function refreshGarminToken(refreshToken) {
  const headers = await buildWearableTokenHeaders();
  const res = await fetch('/api/garmin-token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Falha ao renovar token da Garmin (${res.status})`);
  }

  return res.json();
}

/**
 * Consulta resumos diários e sono da Garmin Health API (Body Battery, FC Repouso, HRV e Sono).
 */
export async function fetchLiveGarminBiometrics(accessToken) {
  if (!accessToken) throw new Error('Token de acesso Garmin ausente');

  const endEpoch = Math.floor(Date.now() / 1000);
  const startEpoch = endEpoch - 86400;
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [dailiesRes, sleepsRes] = await Promise.all([
    fetch(`${GARMIN_API_BASE}/dailies?uploadStartTimeInSeconds=${startEpoch}&uploadEndTimeInSeconds=${endEpoch}`, { headers }).catch(() => null),
    fetch(`${GARMIN_API_BASE}/sleeps?uploadStartTimeInSeconds=${startEpoch}&uploadEndTimeInSeconds=${endEpoch}`, { headers }).catch(() => null)
  ]);

  const dailies = dailiesRes && dailiesRes.ok ? await dailiesRes.json().catch(() => []) : [];
  const sleeps = sleepsRes && sleepsRes.ok ? await sleepsRes.json().catch(() => []) : [];

  const latestDaily = Array.isArray(dailies) && dailies.length > 0 ? dailies[dailies.length - 1] : null;
  const latestSleep = Array.isArray(sleeps) && sleeps.length > 0 ? sleeps[sleeps.length - 1] : null;

  const bodyBattery = latestDaily?.bodyBatteryHighestValue ?? latestDaily?.bodyBatteryChargedValue ?? null;
  const restingHr = latestDaily?.restingHeartRateInBeatsPerMinute ?? null;
  const activeKcal = latestDaily?.activeKilocalories ?? null;
  const sleepScore = latestSleep?.overallSleepScore?.value ?? null;
  const sleepDurationSec = latestSleep?.durationInSeconds ?? null;
  const hrvMs = latestSleep?.avgOvernightHrv ?? null;

  if (bodyBattery == null && sleepScore == null && restingHr == null) {
    return {
      is_stale: true,
      recovery_score: null,
      sleep_score: null,
      day_strain: null,
      hrv_ms: null,
      resting_hr_bpm: null,
      sleep_duration_seconds: null,
      calories_burned: null,
      raw_data: { dailies, sleeps }
    };
  }

  return {
    is_stale: false,
    recovery_score: bodyBattery != null ? Math.max(0, Math.min(100, Number(bodyBattery))) : sleepScore,
    sleep_score: sleepScore != null ? Math.max(0, Math.min(100, Number(sleepScore))) : null,
    day_strain: null,
    hrv_ms: hrvMs != null ? Math.round(Number(hrvMs)) : null,
    resting_hr_bpm: restingHr != null ? Math.round(Number(restingHr)) : null,
    sleep_duration_seconds: sleepDurationSec != null ? Number(sleepDurationSec) : null,
    calories_burned: activeKcal != null ? Math.round(Number(activeKcal)) : null,
    raw_data: { daily: latestDaily, sleep: latestSleep }
  };
}

export function generateSimulatedGarminData(dateIso = localDateKey()) {
  const seed = dateIso.split('-').reduce((acc, part) => acc + Number(part), 0);
  const bodyBattery = 78 + (seed % 18);
  const sleepScore = 82 + (seed % 12);
  const restingHr = 49 + (seed % 5);
  const hrv = 68 + (seed % 16);
  const sleepSecs = (440 + (seed % 45)) * 60;
  const calories = 2300 + (seed % 400);

  return {
    provider: 'garmin',
    date: dateIso,
    is_simulated: true,
    is_stale: false,
    recovery_score: bodyBattery,
    sleep_score: sleepScore,
    day_strain: null,
    hrv_ms: hrv,
    resting_hr_bpm: restingHr,
    sleep_duration_seconds: sleepSecs,
    calories_burned: calories,
    last_synced_at: new Date().toISOString()
  };
}
