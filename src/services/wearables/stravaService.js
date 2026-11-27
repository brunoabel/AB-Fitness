/**
 * Serviço de Integração com a API Oficial da Strava.
 * Suporta OAuth 2.0, extração de Carga Relativa (Suffer Score / TRIMP) e modo Simulador.
 */

import { localDateKey } from '../../utils/dateKey.js';
import { buildWearableTokenHeaders } from './wearableAuthHeader.js';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

const SCOPES = 'read,activity:read_all,activity:write,profile:read_all';

export function getStravaClientId() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_STRAVA_CLIENT_ID || '';
  }
  return '';
}

export function buildStravaAuthUrl(redirectUri) {
  const clientId = getStravaClientId();
  if (!clientId) return null;

  const state = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('strava_oauth_state', state);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: SCOPES,
    state
  });

  return `${STRAVA_AUTH_URL}?${params.toString()}`;
}

export async function exchangeStravaCodeForToken(code, redirectUri) {
  const headers = await buildWearableTokenHeaders();
  const res = await fetch('/api/strava-token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ code, redirectUri })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Falha ao obter token da Strava (${res.status})`);
  }

  return res.json();
}

export async function refreshStravaToken(refreshToken) {
  const headers = await buildWearableTokenHeaders();
  const res = await fetch('/api/strava-token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ refreshToken })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Falha ao renovar token da Strava (${res.status})`);
  }

  return res.json();
}

/**
 * Consulta atividades recentes da Strava (últimas 48h) e converte a carga cardiovascular
 * (suffer_score / tempo em movimento / elevação) em Strain (0-21) e Prontidão estimada (0-100).
 */
export async function fetchLiveStravaBiometrics(accessToken, _today, { localSessions = [] } = {}) {
  if (!accessToken) throw new Error('Token de acesso Strava ausente');

  const afterEpoch = Math.floor((Date.now() - 48 * 3600 * 1000) / 1000);
  const res = await fetch(`${STRAVA_API_BASE}/athlete/activities?after=${afterEpoch}&per_page=10`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  }).catch(() => null);

  if (!res || !res.ok) {
    return {
      is_stale: true,
      recovery_score: null,
      sleep_score: null,
      day_strain: null,
      hrv_ms: null,
      resting_hr_bpm: null,
      calories_burned: null,
      raw_data: null
    };
  }

  const rawActivities = await res.json().catch(() => []);
  if (!Array.isArray(rawActivities)) {
    return {
      is_stale: true,
      recovery_score: null,
      sleep_score: null,
      day_strain: null,
      hrv_ms: null,
      resting_hr_bpm: null,
      calories_burned: null,
      raw_data: null
    };
  }

  // Sem duplicar carga: tira as atividades que a própria AB Fitness enviou e as que coincidem com
  // treinos/corridas registados no app (já contam no ACWR e no mapa de fadiga)
  const pushedIds = getPushedStravaActivityIds();
  const activities = deduplicateWearableActivities(
    rawActivities.filter((act) => !pushedIds.has(String(act?.id))),
    localSessions
  );

  let totalSuffer = 0;
  let totalMovingMin = 0;
  let totalDistanceKm = 0;
  let totalCalories = 0;

  for (const act of activities) {
    const suffer = Number(act.suffer_score) || 0;
    const movingMin = (Number(act.moving_time) || 0) / 60;
    const distKm = (Number(act.distance) || 0) / 1000;
    totalMovingMin += movingMin;
    totalDistanceKm += distKm;
    totalSuffer += suffer > 0 ? suffer : movingMin * 1.4;
    totalCalories += Number(act.kilojoules) ? Math.round(Number(act.kilojoules) * 0.24) : Math.round(movingMin * 9.5);
  }

  // Normaliza strain na escala 0..21 e prontidão inversa (100 - fadiga residual)
  const dayStrain = Math.min(21, Math.round((totalSuffer / 12) * 10) / 10);
  const recoveryScore = Math.max(25, Math.min(96, Math.round(92 - dayStrain * 2.8)));

  return {
    is_stale: false,
    recovery_score: recoveryScore,
    sleep_score: null,
    day_strain: dayStrain,
    hrv_ms: null,
    resting_hr_bpm: null,
    calories_burned: totalCalories || null,
    distance_km: Math.round(totalDistanceKm * 10) / 10,
    raw_data: { activitiesCount: activities.length, totalMovingMin: Math.round(totalMovingMin) }
  };
}

/**
 * Envia um treino de força ou corrida concluído na AB Fitness para a Strava (sincronização bidirecional).
 */
export async function pushActivityToStrava(accessToken, {
  name,
  sportType = 'WeightTraining',
  startDateIso,
  elapsedSeconds,
  distanceMeters = 0,
  description = ''
} = {}) {
  if (!accessToken || !name || !elapsedSeconds) return { pushed: false, reason: 'missing_params' };

  const res = await fetch(`${STRAVA_API_BASE}/activities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name,
      sport_type: sportType,
      start_date_local: startDateIso || new Date().toISOString(),
      elapsed_time: Math.max(60, Math.round(elapsedSeconds)),
      distance: Math.max(0, Math.round(distanceMeters)),
      description: description || 'Registado com AB Fitness'
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { pushed: false, status: res.status, error: err?.message || `HTTP ${res.status}` };
  }

  const created = await res.json().catch(() => null);
  rememberPushedStravaActivity(created?.id);
  return { pushed: true, activityId: created?.id || null };
}

/**
 * Remove atividades externas (wearables) que se sobrepõem a sessões locais na mesma janela temporal,
 * evitando duplicação de calorias e carga interna entre AB Fitness e Strava/Garmin/WHOOP.
 * Compara intervalos reais: a sessão local guarda a hora de FIM (completedAt/timestamp) e a duração;
 * a atividade externa traz a hora de INÍCIO e o tempo decorrido. Há duplicado quando os intervalos
 * se sobrepõem, com `windowMinutes` de tolerância de cada lado.
 */
export function deduplicateWearableActivities(externalActivities = [], localSessions = [], windowMinutes = 25) {
  const windowMs = Math.max(5, Number(windowMinutes) || 25) * 60 * 1000;
  const localIntervals = (localSessions || [])
    .map((s) => {
      const end = Number(s?.timestamp) || new Date(s?.completedAt || s?.date || 0).getTime() || 0;
      if (!(end > 0)) return null;
      const durSec = Number(s?.durationSeconds) || (Number(s?.durationMinutes) || 0) * 60;
      return { start: end - Math.max(0, durSec) * 1000, end };
    })
    .filter(Boolean);

  const list = Array.isArray(externalActivities) ? externalActivities : [];
  if (localIntervals.length === 0) return list;

  return list.filter((act) => {
    const start = new Date(act?.start_date || act?.start_date_local || act?.timestamp || 0).getTime();
    if (!start) return true;
    const end = start + (Number(act?.elapsed_time) || Number(act?.moving_time) || 0) * 1000;
    return !localIntervals.some((li) => start <= li.end + windowMs && end >= li.start - windowMs);
  });
}

// Atividades criadas pelo write-back da AB Fitness: nunca contam como carga externa na leitura seguinte
const PUSHED_IDS_KEY = 'ab_strava_pushed_ids_v1';
const PUSHED_IDS_MAX = 60;

export function getPushedStravaActivityIds() {
  try {
    const list = JSON.parse(localStorage.getItem(PUSHED_IDS_KEY) || '[]');
    return new Set(Array.isArray(list) ? list.map(String) : []);
  } catch {
    return new Set();
  }
}

function rememberPushedStravaActivity(activityId) {
  if (!activityId) return;
  try {
    const list = JSON.parse(localStorage.getItem(PUSHED_IDS_KEY) || '[]');
    const next = [...(Array.isArray(list) ? list : []).filter((id) => String(id) !== String(activityId)), String(activityId)];
    localStorage.setItem(PUSHED_IDS_KEY, JSON.stringify(next.slice(-PUSHED_IDS_MAX)));
  } catch {}
}

export function generateSimulatedStravaData(dateIso = localDateKey()) {
  const seed = dateIso.split('-').reduce((acc, part) => acc + Number(part), 0);
  const strain = Number((11.2 + (seed % 6) * 0.8).toFixed(1));
  const recovery = Math.max(40, Math.min(95, Math.round(92 - strain * 2.5)));
  const calories = 620 + (seed % 280);

  return {
    provider: 'strava',
    date: dateIso,
    is_simulated: true,
    is_stale: false,
    recovery_score: recovery,
    sleep_score: null,
    day_strain: strain,
    hrv_ms: null,
    resting_hr_bpm: null,
    calories_burned: calories,
    last_synced_at: new Date().toISOString()
  };
}
