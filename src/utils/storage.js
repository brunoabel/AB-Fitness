// Gerenciamento de persistência local com LocalStorage para o LA Workout
// Garante que o utilizador nunca perca as suas cargas nem o histórico

const KEYS = {
  WEIGHTS: 'la_workout_weights_v1',
  HISTORY: 'la_workout_history_v1',
  COMPLETED_DAYS: 'la_workout_completed_days_v1',
  ACTIVE_DRAFT: 'la_workout_active_draft_v1',
  TIMER_PREF: 'la_workout_timer_pref_v1',
  SOUND_ENABLED: 'la_workout_sound_enabled_v1',
  THEME_MODE: 'la_workout_theme_mode_v1'
};

export const getSavedWeights = () => {
  try {
    const raw = localStorage.getItem(KEYS.WEIGHTS);
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
    const raw = localStorage.getItem(KEYS.HISTORY);
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
    const raw = localStorage.getItem(KEYS.COMPLETED_DAYS);
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
    const raw = localStorage.getItem(KEYS.ACTIVE_DRAFT);
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
    const raw = localStorage.getItem(KEYS.TIMER_PREF);
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
    const raw = localStorage.getItem(KEYS.SOUND_ENABLED);
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
    const raw = localStorage.getItem(KEYS.THEME_MODE);
    return raw || 'dark'; // Padrão 'dark' moderno para adolescente ou o que estiver salvo
  } catch {
    return 'dark';
  }
};

export const saveThemePreference = (theme) => {
  try {
    localStorage.setItem(KEYS.THEME_MODE, theme);
  } catch {}
};
