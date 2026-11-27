/**
 * Persistência do perfil de treino e métricas biométricas do atleta (Onboarding do AB Coach).
 * Guarda sempre localmente (offline e modo convidado), notifica consumidores reativos
 * (Hidratação, Manual do Atleta, Dashboard) e garante sincronização com public.user_fitness_profiles
 * com fila de retentativa automática quando a rede volta.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveUserProfileLocal } from '../utils/storage';
import { toRow, toLegacyProfile } from '../components/onboarding/profileSchema';

const LOCAL_KEY = 'ab_fitness_fitness_profile_v1';
const OWNER_KEY = 'ab_fitness_fitness_profile_owner_v1';
const PENDING_KEY = 'ab_fitness_fitness_profile_pending_v1';
const GUEST_ID = 'guest-local-user';
export const FITNESS_PROFILE_EVENT = 'ab:fitness-profile-updated';

const canSync = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== GUEST_ID);

function dispatchProfileUpdated(profile) {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(FITNESS_PROFILE_EVENT, { detail: profile }));
  } catch {}
}

export function subscribeFitnessProfile(listener) {
  if (typeof window === 'undefined' || typeof listener !== 'function') return () => {};
  const onEvent = (e) => listener(e?.detail ?? getLocalFitnessProfile());
  window.addEventListener(FITNESS_PROFILE_EVENT, onEvent);
  return () => window.removeEventListener(FITNESS_PROFILE_EVENT, onEvent);
}

export function getLocalFitnessProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getLocalOwner() {
  try {
    return localStorage.getItem(OWNER_KEY) || null;
  } catch {
    return null;
  }
}

function hasPendingSync() {
  try {
    return localStorage.getItem(PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

function setPendingSync(flag) {
  try {
    if (flag) localStorage.setItem(PENDING_KEY, '1');
    else localStorage.removeItem(PENDING_KEY);
  } catch {}
}

function saveLocal(profile, ownerId = null) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
    if (ownerId) localStorage.setItem(OWNER_KEY, ownerId);
  } catch {}
  saveUserProfileLocal(toLegacyProfile(profile));
  dispatchProfileUpdated(profile);
}

function clearLocalProfile() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    localStorage.removeItem(OWNER_KEY);
    localStorage.removeItem(PENDING_KEY);
  } catch {}
  dispatchProfileUpdated(null);
}

function fromRow(data) {
  return {
    gender: data.gender,
    age: Number(data.age),
    weightKg: Number(data.weight_kg),
    heightCm: Number(data.height_cm),
    primaryGoal: data.primary_goal,
    experienceLevel: data.experience_level,
    trainingLocation: data.training_location,
    equipment: Array.isArray(data.equipment) ? data.equipment : [],
    daysPerWeek: Number(data.days_per_week),
    sessionMinutes: Number(data.session_minutes),
    splitPreference: data.split_preference || 'auto',
    injuries: Array.isArray(data.injuries) ? data.injuries : [],
    priorityMuscles: Array.isArray(data.priority_muscles) ? data.priority_muscles : [],
    hasSport: Boolean(data.has_sport),
    sports: Array.isArray(data.sports) ? data.sports : [],
    otherSport: data.other_sport || '',
    sportDays: Array.isArray(data.sport_days) ? data.sport_days : [],
    sportIntensity: data.sport_intensity || null,
    sessionOrder: data.session_order || null
  };
}

/**
 * Envio único e atómico do perfil: upsert em public.user_fitness_profiles.
 * Se falhar por rede/offline, marca pendente para retentativa automática ao reconectar.
 * @returns {Promise<{ synced: boolean, error?: string }>}
 */
export async function saveFitnessProfile(userId, profile) {
  const owner = userId || GUEST_ID;
  saveLocal(profile, owner);
  if (!canSync(userId)) {
    // Em modo convidado fica marcado para sincronizar se criar conta a seguir
    setPendingSync(true);
    return { synced: false };
  }

  setPendingSync(true);
  const { error } = await supabase
    .from('user_fitness_profiles')
    .upsert(toRow(userId, profile), { onConflict: 'user_id' });

  if (error) {
    console.warn('Perfil guardado localmente (retentativa automática agendada):', error.message);
    return { synced: false, error: error.message };
  }

  setPendingSync(false);
  return { synced: true };
}

/** Reenvia perfil local pendente para a nuvem (no arranque ou ao voltar online). */
export async function flushFitnessProfileSync(userId) {
  if (!canSync(userId) || !hasPendingSync()) return { synced: false };
  const local = getLocalFitnessProfile();
  const owner = getLocalOwner();
  if (!local) {
    setPendingSync(false);
    return { synced: false };
  }
  // Só envia se o perfil local pertencer a este utilizador ou ao modo convidado pré-registo
  if (owner && owner !== userId && owner !== GUEST_ID) return { synced: false };
  return saveFitnessProfile(userId, local);
}

/** Lê o perfil remoto e atualiza a cache local reativamente. */
export async function fetchFitnessProfile(userId) {
  if (!canSync(userId)) return null;
  const { data, error } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;

  const profile = fromRow(data);
  saveLocal(profile, userId);
  setPendingSync(false);
  return profile;
}

/**
 * Sincronização completa ao autenticar:
 * 1) Se há alterações locais pendentes deste utilizador/convidado, envia primeiro para a nuvem;
 * 2) Lê a versão autoritativa do Supabase (garante métricas atualizadas em qualquer aparelho);
 * 3) Se não existe na nuvem mas existe em cache local de outra conta, limpa para evitar mistura de dados;
 * 4) Se não existe na nuvem mas existe em cache local de convidado/próprio, promove para a nuvem.
 */
export async function syncFitnessProfileOnAuth(userId) {
  if (!canSync(userId)) return getLocalFitnessProfile();

  await flushFitnessProfileSync(userId).catch(() => {});

  const remote = await fetchFitnessProfile(userId).catch(() => null);
  if (remote) return remote;

  const local = getLocalFitnessProfile();
  const owner = getLocalOwner();
  if (local && owner && owner !== userId && owner !== GUEST_ID) {
    clearLocalProfile();
    return null;
  }

  if (local) {
    await saveFitnessProfile(userId, local).catch(() => {});
    return local;
  }

  return null;
}
