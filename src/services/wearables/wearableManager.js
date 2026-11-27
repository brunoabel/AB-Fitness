/**
 * Gerenciador Central de Wearables e Biometria do AB Fitness.
 * Orquestra conexões com Whoop e Fitbit, persistência na nuvem/local
 * e cálculo do Índice de Prontidão Fisiológica com parecer do AB Coach.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import {
  generateSimulatedWhoopData,
  fetchLiveWhoopBiometrics,
  refreshWhoopToken
} from './whoopService.js';
import {
  generateSimulatedFitbitData,
  fetchLiveFitbitBiometrics,
  refreshFitbitToken
} from './fitbitService.js';
import {
  generateSimulatedStravaData,
  fetchLiveStravaBiometrics,
  refreshStravaToken,
  pushActivityToStrava,
  deduplicateWearableActivities
} from './stravaService.js';
import {
  generateSimulatedGarminData,
  fetchLiveGarminBiometrics,
  refreshGarminToken
} from './garminService.js';
import { enqueueJob, flushQueue } from '../../utils/syncQueue.js';
import { localDateKey } from '../../utils/dateKey.js';

const STORAGE_KEY_CONNECTIONS = 'ab_wearable_connections_v1';
const STORAGE_KEY_BIOMETRICS = 'ab_wearable_biometrics_v1';
// Fila de retry: conexões e biometria de wearables que falharam a sincronizar com o
// Supabase (sem rede no ginásio) ficam aqui até haver ligação, em vez de se perderem.
const SYNC_QUEUE_KEY = 'ab_wearable_sync_queue_v1';
const canSyncUser = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== 'guest-local-user');

/**
 * Lê conexões salvas localmente (cache ou modo convidado/offline).
 */
export function getLocalConnections() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Salva conexões no localStorage.
 */
export function saveLocalConnections(connections) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
  } catch {
    // quota exceeded
  }
}

/**
 * Lê biometria salva localmente.
 */
export function getLocalBiometrics() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BIOMETRICS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Salva biometria no localStorage.
 */
export function saveLocalBiometrics(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BIOMETRICS, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

/**
 * Lista conexões ativas do utilizador.
 */
export async function getConnectedWearables(userId) {
  const local = getLocalConnections();

  if (!userId || userId === 'guest-local-user' || !isSupabaseConfigured() || !supabase) {
    return local;
  }

  try {
    const { data, error } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return local;

    const remoteMap = {};
    data.forEach((row) => {
      remoteMap[row.provider] = row;
    });

    const merged = { ...local, ...remoteMap };
    saveLocalConnections(merged);
    return merged;
  } catch {
    return local;
  }
}

/** Escreve a conexão de um wearable no Supabase. Devolve `false` em caso de falha (sem lançar). */
async function pushConnectionToCloud(job) {
  try {
    const { error } = await supabase.from('wearable_connections').upsert(
      {
        user_id: job.userId,
        provider: job.provider,
        status: job.status,
        access_token: job.access_token,
        refresh_token: job.refresh_token,
        expires_at: job.expires_at,
        connected_at: job.connected_at,
        last_synced_at: job.last_synced_at,
        metadata: job.metadata
      },
      { onConflict: 'user_id,provider' }
    );
    return !error;
  } catch {
    return false;
  }
}

/** Treinos e corridas registados no app (últimas 72 h) para não contar a mesma sessão duas vezes na Strava. */
function readLocalSessionsForDedupe() {
  if (typeof localStorage === 'undefined') return [];
  const since = Date.now() - 72 * 3600 * 1000;
  const read = (key) => {
    try {
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };
  return [...read('ab_fitness_history_v1'), ...read('ab_fitness_runs_v1')].filter((s) => {
    const t = Number(s?.timestamp) || new Date(s?.completedAt || 0).getTime() || 0;
    return t >= since;
  });
}

/**
 * Conecta ou simula a conexão de um wearable.
 */
export async function connectWearable(userId, provider, mode = 'simulated', tokens = {}) {
  const now = new Date().toISOString();
  const connRecord = {
    provider,
    status: mode,
    access_token: tokens.accessToken || null,
    refresh_token: tokens.refreshToken || null,
    expires_at: tokens.expiresAt || null,
    connected_at: now,
    last_synced_at: now,
    metadata: { is_simulated: mode === 'simulated' }
  };

  // 1. Atualizar localmente
  const current = getLocalConnections();
  current[provider] = connRecord;
  saveLocalConnections(current);

  // 2. Gerar dados biométricos iniciais
  await syncWearableData(userId, provider);

  // 3. Sincronizar com Supabase se aplicável — se falhar (sem rede no ginásio), fica
  // em fila e é reenviado automaticamente quando a ligação voltar (ver flushWearableSyncQueue).
  if (canSyncUser(userId)) {
    const job = { key: `conn:${userId}:${provider}`, type: 'connection', userId, provider, ...connRecord };
    const ok = await pushConnectionToCloud(job);
    if (!ok) enqueueJob(SYNC_QUEUE_KEY, job);
  }

  return connRecord;
}

/**
 * Desconecta um wearable.
 */
export async function disconnectWearable(userId, provider) {
  const current = getLocalConnections();
  delete current[provider];
  saveLocalConnections(current);

  const bio = getLocalBiometrics();
  delete bio[provider];
  saveLocalBiometrics(bio);

  if (canSyncUser(userId)) {
    try {
      await Promise.all([
        supabase
          .from('wearable_connections')
          .delete()
          .eq('user_id', userId)
          .eq('provider', provider),
        supabase
          .from('athlete_biometrics')
          .delete()
          .eq('user_id', userId)
          .eq('provider', provider)
      ]);
    } catch (e) {
      console.warn('Falha ao apagar wearable da nuvem:', e);
    }
  }

  return true;
}

/** Escreve a biometria diária de um wearable no Supabase. Devolve `false` em caso de falha. */
async function pushBiometricsToCloud(job) {
  try {
    const { error } = await supabase.from('athlete_biometrics').upsert(
      {
        user_id: job.userId,
        date: job.date,
        provider: job.provider,
        recovery_score: job.bioData.recovery_score,
        hrv_ms: job.bioData.hrv_ms,
        resting_hr_bpm: job.bioData.resting_hr_bpm,
        sleep_score: job.bioData.sleep_score,
        sleep_duration_seconds: job.bioData.sleep_duration_seconds,
        day_strain: job.bioData.day_strain,
        calories_burned: job.bioData.calories_burned,
        raw_data: job.bioData
      },
      { onConflict: 'user_id,date,provider' }
    );
    return !error;
  } catch {
    return false;
  }
}

/** Calcula `expires_at` (ISO) a partir da resposta OAuth: `expires_at` em segundos (Strava) ou `expires_in`. */
function expiryFromTokenResponse(refreshed, fallback) {
  if (Number.isFinite(Number(refreshed?.expires_at)) && Number(refreshed.expires_at) > 1e9) {
    return new Date(Number(refreshed.expires_at) * 1000).toISOString();
  }
  if (Number.isFinite(Number(refreshed?.expires_in)) && Number(refreshed.expires_in) > 0) {
    return new Date(Date.now() + Number(refreshed.expires_in) * 1000).toISOString();
  }
  return fallback || null;
}

/**
 * Renova o token de uma ligação e grava o resultado no aparelho e na nuvem (com fila offline).
 * A Strava troca o refresh_token a cada renovação: gravar só localmente deixava o antigo na nuvem,
 * e getConnectedWearables voltava a pô-lo por cima do novo. Devolve a ligação atualizada ou `null`.
 */
async function refreshAndPersistConnection(userId, provider, conn, refreshFn) {
  if (!conn?.refresh_token || typeof refreshFn !== 'function') return null;
  const refreshed = await refreshFn(conn.refresh_token);
  if (!refreshed?.access_token) return null;

  const next = {
    ...conn,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token || conn.refresh_token,
    expires_at: expiryFromTokenResponse(refreshed, conn.expires_at)
  };

  const conns = getLocalConnections();
  if (conns[provider]) {
    conns[provider] = { ...conns[provider], ...next };
    saveLocalConnections(conns);
  }

  const owner = userId || conn.user_id;
  if (canSyncUser(owner)) {
    const job = {
      key: `conn:${owner}:${provider}`,
      type: 'connection',
      userId: owner,
      provider,
      status: next.status || 'connected',
      access_token: next.access_token,
      refresh_token: next.refresh_token,
      expires_at: next.expires_at,
      connected_at: next.connected_at || null,
      last_synced_at: next.last_synced_at || null,
      metadata: next.metadata || {}
    };
    const ok = await pushConnectionToCloud(job);
    if (!ok) enqueueJob(SYNC_QUEUE_KEY, job);
  }
  return next;
}

/**
 * Sincroniza dados biométricos do wearable:
 * - Se a ligação estiver em modo 'connected' com access_token real, consulta a API oficial
 *   (renovando o token via refresh_token se tiver expirado) e nunca inventa valores simulados.
 * - Só usa gerador simulado quando a conexão está em modo 'simulated'.
 */
export async function syncWearableData(userId, provider, options = {}) {
  const today = localDateKey();
  const currentConns = getLocalConnections();
  const conn = options.connectionOverride || currentConns[provider] || null;
  let bioData = null;

  if (conn && conn.status === 'connected' && conn.access_token) {
    let activeToken = conn.access_token;
    const isExpired = conn.expires_at
      ? new Date(conn.expires_at).getTime() <= Date.now() + 60000
      : false;

    if (isExpired && conn.refresh_token) {
      try {
        const refreshMap = {
          whoop: refreshWhoopToken,
          fitbit: refreshFitbitToken,
          strava: refreshStravaToken,
          garmin: refreshGarminToken
        };
        const refreshFn = options.refreshFn || refreshMap[provider] || refreshFitbitToken;
        const next = await refreshAndPersistConnection(userId, provider, conn, refreshFn);
        if (next) {
          activeToken = next.access_token;
          Object.assign(conn, next);
          if (currentConns[provider]) currentConns[provider] = { ...currentConns[provider], ...next };
        }
      } catch {
        // Se o refresh falhar, tenta ainda a leitura ou devolverá is_stale
      }
    }

    try {
      const fetcherMap = {
        whoop: fetchLiveWhoopBiometrics,
        fitbit: fetchLiveFitbitBiometrics,
        strava: fetchLiveStravaBiometrics,
        garmin: fetchLiveGarminBiometrics
      };
      const liveFetcher = options.liveFetcher || fetcherMap[provider] || fetchLiveFitbitBiometrics;
      const live = await liveFetcher(activeToken, today, { localSessions: readLocalSessionsForDedupe() });
      bioData = {
        ...live,
        provider,
        date: today,
        is_simulated: false,
        last_synced_at: new Date().toISOString()
      };
    } catch {
      bioData = {
        is_stale: true,
        provider,
        date: today,
        recovery_score: null,
        hrv_ms: null,
        resting_hr_bpm: null,
        sleep_score: null,
        sleep_duration_seconds: null,
        day_strain: null,
        calories_burned: null,
        is_simulated: false,
        last_synced_at: new Date().toISOString()
      };
    }
  } else if (conn?.status === 'simulated') {
    if (provider === 'whoop') {
      bioData = generateSimulatedWhoopData(today);
    } else if (provider === 'fitbit') {
      bioData = generateSimulatedFitbitData(today);
    } else if (provider === 'strava') {
      bioData = generateSimulatedStravaData(today);
    } else if (provider === 'garmin') {
      bioData = generateSimulatedGarminData(today);
    }
  } else {
    bioData = {
      is_stale: true,
      provider,
      date: today,
      recovery_score: null,
      hrv_ms: null,
      resting_hr_bpm: null,
      sleep_score: null,
      sleep_duration_seconds: null,
      day_strain: null,
      calories_burned: null,
      is_simulated: false,
      last_synced_at: new Date().toISOString()
    };
  }

  if (!bioData) return null;

  // Atualizar cache local
  const currentBio = getLocalBiometrics();
  currentBio[provider] = bioData;
  saveLocalBiometrics(currentBio);

  // Atualizar last_synced_at na conexão
  if (currentConns[provider]) {
    currentConns[provider].last_synced_at = new Date().toISOString();
    saveLocalConnections(currentConns);
  }

  // Persistir no Supabase se disponível — se falhar (sem rede), fica em fila e é
  // reenviado automaticamente quando a ligação voltar (ver flushWearableSyncQueue).
  if (canSyncUser(userId)) {
    const job = { key: `bio:${userId}:${provider}:${today}`, type: 'biometrics', userId, provider, date: today, bioData };
    const ok = await pushBiometricsToCloud(job);
    if (!ok) enqueueJob(SYNC_QUEUE_KEY, job);
  }

  return bioData;
}

/**
 * Reenvia conexões e biometria de wearables pendentes deste utilizador — chamado
 * no arranque da app e quando o evento `online` dispara (ver App.jsx).
 */
export function flushWearableSyncQueue(userId) {
  if (!canSyncUser(userId)) return Promise.resolve(0);
  return flushQueue(SYNC_QUEUE_KEY, {
    filterFn: (job) => job.userId === userId,
    sendFn: (job) => (job.type === 'connection' ? pushConnectionToCloud(job) : pushBiometricsToCloud(job))
  });
}

/**
 * Calcula o Índice de Prontidão Fisiológica com parecer tático do AB Coach.
 */
export function computeReadinessIndex(biometrics = {}) {
  if (!biometrics || typeof biometrics !== 'object') {
    return null;
  }
  const whoop = biometrics.whoop;
  const fitbit = biometrics.fitbit;
  const strava = biometrics.strava;
  const garmin = biometrics.garmin;

  const connectedKeys = ['whoop', 'fitbit', 'strava', 'garmin'].filter((k) => Boolean(biometrics[k]));
  if (connectedKeys.length === 0) {
    return null;
  }

  const whoopValid = Boolean(whoop && !whoop.is_stale && typeof whoop.recovery_score === 'number');
  const fitbitValid = Boolean(fitbit && !fitbit.is_stale && typeof fitbit.sleep_score === 'number');
  const stravaValid = Boolean(strava && !strava.is_stale && typeof strava.recovery_score === 'number');
  const garminScoreVal = garmin?.recovery_score ?? garmin?.sleep_score ?? null;
  const garminValid = Boolean(garmin && !garmin.is_stale && typeof garminScoreVal === 'number');

  const validEntries = [
    whoopValid && { id: 'whoop', val: whoop.recovery_score, weight: 0.6 },
    garminValid && { id: 'garmin', val: garminScoreVal, weight: 0.55 },
    fitbitValid && { id: 'fitbit', val: fitbit.sleep_score, weight: 0.4 },
    stravaValid && { id: 'strava', val: strava.recovery_score, weight: 0.35 }
  ].filter(Boolean);

  if (validEntries.length === 0) {
    return {
      score: null,
      isStale: true,
      status: 'stale',
      label: 'Sem dados recentes',
      color: '#8E929F',
      advice: 'Sem leitura recente dos sensores. Abre os dispositivos e toca em sincronizar para atualizar.',
      providerUsed: connectedKeys.length > 1 ? 'composite' : connectedKeys[0],
      hrv: null,
      restingHr: null,
      strain: null,
      sleepScore: null
    };
  }

  let score = 80;
  let providerUsed = validEntries[0].id;

  if (validEntries.length > 1) {
    const totalWeight = validEntries.reduce((acc, e) => acc + e.weight, 0);
    const weightedSum = validEntries.reduce((acc, e) => acc + e.val * e.weight, 0);
    score = Math.round(weightedSum / totalWeight);
    providerUsed = 'composite';
  } else {
    score = validEntries[0].val;
    providerUsed = validEntries[0].id;
  }

  score = Math.max(0, Math.min(100, score));

  let status = 'optimal'; // 'optimal' | 'moderate' | 'recovery'
  let label = 'Prontidão Máxima';
  let color = '#73D083'; // Emerald Sucesso
  let advice = '';

  if (score >= 80) {
    status = 'optimal';
    label = 'Prontidão Máxima';
    color = '#73D083';
    advice = 'Sistema nervoso e muscular 100% recuperados. Excelente dia para progressão de carga ou bater Recorde Pessoal (PR).';
  } else if (score >= 55) {
    status = 'moderate';
    label = 'Recuperação Estável';
    color = '#E1AD57'; // Amber Atenção
    advice = 'Recuperação fisiológica equilibrada. Treino planeado pode ser executado normalmente mantendo a cadência controlada.';
  } else {
    status = 'recovery';
    label = 'Fadiga Elevada';
    color = '#FF968A'; // Red Atenção
    advice = 'Fadiga acumulada detetada pelos sensores. Recomendado moderar a intensidade, focar na técnica ou encurtar séries acessórias.';
  }

  return {
    score,
    isStale: false,
    status,
    label,
    color,
    advice,
    providerUsed,
    hrv: (whoopValid ? whoop?.hrv_ms : null) ?? (garminValid ? garmin?.hrv_ms : null) ?? null,
    restingHr:
      (whoopValid ? whoop?.resting_hr_bpm : null) ??
      (garminValid ? garmin?.resting_hr_bpm : null) ??
      (fitbitValid ? fitbit?.resting_hr_bpm : null) ??
      null,
    strain: (whoopValid ? whoop?.day_strain : null) ?? (stravaValid ? strava?.day_strain : null) ?? null,
    sleepScore:
      (whoopValid ? whoop?.sleep_score : null) ??
      (garminValid ? garmin?.sleep_score : null) ??
      (fitbitValid ? fitbit?.sleep_score : null) ??
      null
  };
}

export { deduplicateWearableActivities };

/**
 * Envia uma atividade concluída na AB Fitness (treino de força ou corrida) para wearables
 * conectados com suporte a escrita (atualmente Strava `activity:write`). Falha silenciosa.
 */
export async function pushWorkoutToConnectedWearables(activity, userId = null) {
  const conns = getLocalConnections();
  const strava = conns?.strava;
  if (!strava || strava.mode === 'simulated' || !strava.access_token) {
    return { pushed: false, reason: 'no_live_provider' };
  }

  try {
    let token = strava.access_token;
    const expired = strava.expires_at ? new Date(strava.expires_at).getTime() <= Date.now() + 60000 : false;
    if (expired && strava.refresh_token) {
      const next = await refreshAndPersistConnection(userId, 'strava', strava, refreshStravaToken).catch(() => null);
      if (next) token = next.access_token;
    }
    let res = await pushActivityToStrava(token, activity);
    if (!res.pushed && res.status === 401 && strava.refresh_token) {
      const next = await refreshAndPersistConnection(userId, 'strava', strava, refreshStravaToken);
      if (next) res = await pushActivityToStrava(next.access_token, activity);
    }
    return res;
  } catch (err) {
    console.warn('Write-back Strava ignorado:', err?.message || err);
    return { pushed: false, error: err?.message || 'network_error' };
  }
}
