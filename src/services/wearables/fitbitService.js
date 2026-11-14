/**
 * Serviço de Integração com a API Oficial da Fitbit / Google.
 * Suporta OAuth 2.0 e modo Simulador de Atleta para demonstrações.
 */

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_API_BASE = 'https://api.fitbit.com';

const SCOPES = [
  'activity',
  'heartrate',
  'sleep',
  'profile'
].join(' ');

/**
 * Obtém o Client ID configurado nas variáveis de ambiente.
 */
export function getFitbitClientId() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_FITBIT_CLIENT_ID || '';
  }
  return '';
}

/**
 * Gera o link de autenticação OAuth 2.0 da Fitbit.
 */
export function buildFitbitAuthUrl(redirectUri) {
  const clientId = getFitbitClientId();
  if (!clientId) return null;

  const state = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('fitbit_oauth_state', state);
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state
  });

  return `${FITBIT_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca o código de autorização pelo token de acesso via endpoint serverless seguro.
 */
export async function exchangeFitbitCodeForToken(code, redirectUri) {
  const res = await fetch('/api/fitbit-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirectUri })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error_description || errData.error || `Falha ao obter token da Fitbit (${res.status})`);
  }

  return res.json();
}

/**
 * Consulta a biometria mais recente da Fitbit (Frequência Cardíaca e Sono).
 */
export async function fetchLiveFitbitBiometrics(accessToken, dateIso = 'today') {
  if (!accessToken) throw new Error('Token de acesso Fitbit ausente');

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [heartRes, sleepRes] = await Promise.all([
    fetch(`${FITBIT_API_BASE}/1/user/-/activities/heart/date/${dateIso}/1d.json`, { headers }).catch(() => null),
    fetch(`${FITBIT_API_BASE}/1.2/user/-/sleep/date/${dateIso}.json`, { headers }).catch(() => null)
  ]);

  const heartData = heartRes && heartRes.ok ? await heartRes.json() : null;
  const sleepData = sleepRes && sleepRes.ok ? await sleepRes.json() : null;

  const restingHeartRate = heartData?.['activities-heart']?.[0]?.value?.restingHeartRate ?? null;
  const mainSleep = sleepData?.sleep?.find((s) => s.isMainSleep) || sleepData?.sleep?.[0];
  const sleepMinutes = mainSleep?.minutesAsleep ?? null;
  const sleepScore = mainSleep?.efficiency ?? null;

  if (restingHeartRate == null && sleepScore == null) {
    return {
      is_stale: true,
      resting_hr_bpm: null,
      sleep_score: null,
      sleep_duration_seconds: null,
      calories_burned: null,
      raw_data: { heart: heartData, sleep: sleepData }
    };
  }

  return {
    is_stale: sleepScore == null,
    resting_hr_bpm: restingHeartRate,
    sleep_score: sleepScore,
    sleep_duration_seconds: sleepMinutes != null ? sleepMinutes * 60 : null,
    calories_burned: null,
    raw_data: { heart: heartData, sleep: sleepData }
  };
}

/**
 * Gera dados simulados da Fitbit para o atleta.
 */
export function generateSimulatedFitbitData(dateIso = new Date().toISOString().slice(0, 10)) {
  const seed = dateIso.split('-').reduce((acc, part) => acc + Number(part), 0);
  const restingHr = 51 + (seed % 5);
  const sleepEfficiency = 84 + (seed % 10);
  const sleepMins = 450 + (seed % 50); // ~7.5 a 8.3 horas
  const steps = 9500 + (seed % 4000);
  const calories = 2450 + (seed % 350);

  return {
    provider: 'fitbit',
    date: dateIso,
    resting_hr_bpm: restingHr,
    sleep_score: Math.min(100, sleepEfficiency),
    sleep_duration_seconds: sleepMins * 60,
    calories_burned: calories,
    steps,
    is_simulated: true,
    last_synced_at: new Date().toISOString()
  };
}

