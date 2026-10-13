// Gerenciamento de persistência local com LocalStorage para o AB Fitness
// Garante que o utilizador nunca perca as suas cargas nem o histórico

const KEYS = {
  WEIGHTS: 'ab_fitness_weights_v1',
  HISTORY: 'ab_fitness_history_v1',
  COMPLETED_DAYS: 'ab_fitness_completed_days_v1',
  ACTIVE_DRAFT: 'ab_fitness_active_draft_v1',
  TIMER_PREF: 'ab_fitness_timer_pref_v1',
  SOUND_ENABLED: 'ab_fitness_sound_enabled_v1',
  THEME_MODE: 'ab_fitness_theme_mode_v1'
};

// Fallback para chaves anteriores garantindo zero perda de dados
const getWithLegacyFallback = (key, legacyKey) => {
  return localStorage.getItem(key) || (legacyKey ? localStorage.getItem(legacyKey) : null);
};

export const getSavedWeights = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.WEIGHTS, 'la_workout_weights_v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveExerciseWeights = (exerciseId, setsData) => {
  try {
    const weights = getSavedWeights();
    weights[exerciseId] = setsData;
    localStorage.setItem(KEYS.WEIGHTS, JSON.stringify(weights));
  } catch {}
};

export const getWorkoutHistory = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.HISTORY, 'la_workout_history_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addWorkoutToHistory = (workoutRecord) => {
  try {
    const history = getWorkoutHistory();
    const updated = [workoutRecord, ...history];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated.slice(0, 50))); // Guarda os últimos 50 treinos
    return updated;
  } catch {
    return [];
  }
};

export const getCompletedDays = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.COMPLETED_DAYS, 'la_workout_completed_days_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markDayCompleted = (dayId) => {
  try {
    const completed = getCompletedDays();
    const todayStr = new Date().toISOString().split('T')[0];
    const item = { dayId, date: todayStr, timestamp: Date.now() };
    const updated = [item, ...completed.filter(c => c.date !== todayStr || c.dayId !== dayId)];
    localStorage.setItem(KEYS.COMPLETED_DAYS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const getActiveDraft = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.ACTIVE_DRAFT, 'la_workout_active_draft_v1');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveActiveDraft = (draft) => {
  try {
    if (!draft) {
      localStorage.removeItem(KEYS.ACTIVE_DRAFT);
    } else {
      localStorage.setItem(KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
    }
  } catch {}
};

export const getTimerPreference = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.TIMER_PREF, 'la_workout_timer_pref_v1');
    return raw ? Number(raw) : 60;
  } catch {
    return 60;
  }
};

export const saveTimerPreference = (sec) => {
  try {
    localStorage.setItem(KEYS.TIMER_PREF, String(sec));
  } catch {}
};

export const getSoundPreference = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.SOUND_ENABLED, 'la_workout_sound_enabled_v1');
    return raw !== null ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
};

export const saveSoundPreference = (enabled) => {
  try {
    localStorage.setItem(KEYS.SOUND_ENABLED, JSON.stringify(enabled));
  } catch {}
};

export const getThemePreference = () => {
  try {
    const raw = getWithLegacyFallback(KEYS.THEME_MODE, 'la_workout_theme_mode_v1');
    return raw || 'light';
  } catch {
    return 'light';
  }
};

export const saveThemePreference = (theme) => {
  try {
    localStorage.setItem(KEYS.THEME_MODE, theme);
  } catch {}
};
