/**
 * Persistência do perfil de treino do Onboarding do AB Coach.
 * Guarda sempre localmente (offline e modo convidado) e sincroniza com public.user_fitness_profiles quando há sessão.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveUserProfileLocal } from '../utils/storage';
import { toRow, toLegacyProfile } from '../components/onboarding/profileSchema';

const LOCAL_KEY = 'ab_fitness_fitness_profile_v1';
const GUEST_ID = 'guest-local-user';

const canSync = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== GUEST_ID);

export function getLocalFitnessProfile() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(profile) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  } catch {}
  saveUserProfileLocal(toLegacyProfile(profile));
}

/**
 * Envio único e atómico do perfil: um upsert por utilizador.
 * @returns {Promise<{ synced: boolean, error?: string }>}
 */
export async function saveFitnessProfile(userId, profile) {
  saveLocal(profile);
  if (!canSync(userId)) return { synced: false };

  const { error } = await supabase
    .from('user_fitness_profiles')
    .upsert(toRow(userId, profile), { onConflict: 'user_id' });

  if (error) {
    console.warn('Perfil guardado só localmente (Supabase):', error.message);
    return { synced: false, error: error.message };
  }
  return { synced: true };
}

/** Lê o perfil remoto (útil ao entrar num aparelho novo) e guarda-o localmente. */
export async function fetchFitnessProfile(userId) {
  if (!canSync(userId)) return null;
  const { data, error } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;

  const profile = {
    gender: data.gender,
    age: data.age,
    weightKg: Number(data.weight_kg),
    heightCm: data.height_cm,
    primaryGoal: data.primary_goal,
    experienceLevel: data.experience_level,
    trainingLocation: data.training_location,
    daysPerWeek: data.days_per_week,
    sessionMinutes: data.session_minutes,
    splitPreference: data.split_preference,
    injuries: data.injuries || [],
    priorityMuscles: data.priority_muscles || [],
    hasSport: Boolean(data.has_sport),
    sports: data.sports || [],
    otherSport: data.other_sport || '',
    sportDays: data.sport_days || [],
    sportIntensity: data.sport_intensity || null,
    sessionOrder: data.session_order || null
  };
  saveLocal(profile);
  return profile;
}
