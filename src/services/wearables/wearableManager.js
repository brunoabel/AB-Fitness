/**
 * Gerenciador Central de Wearables e Biometria do AB Fitness.
 * Orquestra conexões com Whoop e Fitbit, persistência na nuvem/local
 * e cálculo do Índice de Prontidão Fisiológica com parecer do AB Coach.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { generateSimulatedWhoopData } from './whoopService.js';
import { generateSimulatedFitbitData } from './fitbitService.js';

const STORAGE_KEY_CONNECTIONS = 'ab_wearable_connections_v1';
const STORAGE_KEY_BIOMETRICS = 'ab_wearable_biometrics_v1';

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

  // 3. Sincronizar com Supabase se aplicável
  if (userId && userId !== 'guest-local-user' && isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('wearable_connections').upsert(
        {
          user_id: userId,
          provider,
          status: mode,
          access_token: connRecord.access_token,
          refresh_token: connRecord.refresh_token,
          expires_at: connRecord.expires_at,
          connected_at: connRecord.connected_at,
          last_synced_at: connRecord.last_synced_at,
          metadata: connRecord.metadata
        },
        { onConflict: 'user_id,provider' }
      );
    } catch (e) {
      console.warn('Falha ao sincronizar conexão wearable com a nuvem:', e);
    }
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

  if (userId && userId !== 'guest-local-user' && isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('wearable_connections')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);
    } catch (e) {
      console.warn('Falha ao apagar wearable da nuvem:', e);
    }
  }

  return true;
}

/**
 * Sincroniza dados biométricos do wearable (real ou simulado).
 */
export async function syncWearableData(userId, provider) {
  const today = new Date().toISOString().slice(0, 10);
  let bioData = null;

  if (provider === 'whoop') {
    bioData = generateSimulatedWhoopData(today);
  } else if (provider === 'fitbit') {
    bioData = generateSimulatedFitbitData(today);
  }

  if (!bioData) return null;

  // Atualizar cache local
  const currentBio = getLocalBiometrics();
  currentBio[provider] = bioData;
  saveLocalBiometrics(currentBio);

  // Atualizar last_synced_at na conexão
  const currentConns = getLocalConnections();
  if (currentConns[provider]) {
    currentConns[provider].last_synced_at = new Date().toISOString();
    saveLocalConnections(currentConns);
  }

  // Persistir no Supabase se disponível
  if (userId && userId !== 'guest-local-user' && isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('athlete_biometrics').upsert(
        {
          user_id: userId,
          date: today,
          provider,
          recovery_score: bioData.recovery_score,
          hrv_ms: bioData.hrv_ms,
          resting_hr_bpm: bioData.resting_hr_bpm,
          sleep_score: bioData.sleep_score,
          sleep_duration_seconds: bioData.sleep_duration_seconds,
          day_strain: bioData.day_strain,
          calories_burned: bioData.calories_burned,
          raw_data: bioData
        },
        { onConflict: 'user_id,date,provider' }
      );
    } catch (e) {
      console.warn('Falha ao persistir biometria no Supabase:', e);
    }
  }

  return bioData;
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

  if (!whoop && !fitbit) {
    return null;
  }

  let score = 80;
  let providerUsed = 'whoop';

  if (whoop && fitbit) {
    // Whoop tem peso 60%, Fitbit 40%
    const fitbitScore = fitbit.sleep_score || 80;
    score = Math.round((whoop.recovery_score * 0.6) + (fitbitScore * 0.4));
    providerUsed = 'composite';
  } else if (whoop) {
    score = whoop.recovery_score || 80;
    providerUsed = 'whoop';
  } else if (fitbit) {
    score = fitbit.sleep_score || 80;
    providerUsed = 'fitbit';
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
    status,
    label,
    color,
    advice,
    providerUsed,
    hrv: whoop?.hrv_ms || null,
    restingHr: whoop?.resting_hr_bpm || fitbit?.resting_hr_bpm || null,
    strain: whoop?.day_strain || null,
    sleepScore: whoop?.sleep_score || fitbit?.sleep_score || null
  };
}
