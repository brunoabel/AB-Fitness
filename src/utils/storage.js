// Gerenciamento de persistência local com LocalStorage para o AB Fitness
// Garante que o utilizador nunca perca as suas cargas nem o histórico

const KEYS = {
  WEIGHTS: 'ab_fitness_weights_v1',
  HISTORY: 'ab_fitness_history_v1',
  COMPLETED_DAYS: 'ab_fitness_completed_days_v1',
  ACTIVE_DRAFT: 'ab_fitness_active_draft_v1',
  TIMER_PREF: 'ab_fitness_timer_pref_v1',
  SOUND_ENABLED: 'ab_fitness_sound_enabled_v1',
  THEME_MODE: 'ab_fitness_theme_mode_v1',
  RUNS: 'ab_fitness_runs_v1',
  USER_PROFILE: 'ab_fitness_user_profile_v1',
  CUSTOM_WORKOUTS: 'ab_fitness_custom_workouts_v1'
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

// ==========================================
// HISTÓRICO DE CORRIDAS (AB RUNNING CLUB)
// ==========================================

export const getRunsHistory = () => {
  try {
    const raw = localStorage.getItem(KEYS.RUNS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveRunRecord = (runData) => {
  try {
    const runs = getRunsHistory();
    const newRecord = {
      id: runData.id || `run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: runData.timestamp || Date.now(),
      date: runData.date || new Date().toISOString(),
      distanceKm: Number(runData.distanceKm || 0),
      durationSeconds: Number(runData.durationSeconds || 0),
      avgPace: runData.avgPace || '--:--',
      avgPaceSeconds: Number(runData.avgPaceSeconds || 0),
      calories: Number(runData.calories || 0),
      avgSpeedKmh: Number(runData.avgSpeedKmh || 0),
      elevationGainM: Number(runData.elevationGainM || 0),
      splits: runData.splits || [],
      coordinates: runData.coordinates || [], // Trajeto GPS para redesenho do mapa
      isSimulation: !!runData.isSimulation,
      notes: runData.notes || ''
    };
    const updated = [newRecord, ...runs];
    localStorage.setItem(KEYS.RUNS, JSON.stringify(updated.slice(0, 100))); // Salva as últimas 100 corridas
    return updated;
  } catch (err) {
    console.error('Erro ao salvar corrida no storage:', err);
    return [];
  }
};

export const deleteRunRecord = (runId) => {
  try {
    const runs = getRunsHistory();
    const updated = runs.filter(r => r.id !== runId);
    localStorage.setItem(KEYS.RUNS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const getSavedUserProfile = () => {
  try {
    const raw = localStorage.getItem(KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUserProfileLocal = (profile) => {
  try {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {}
};

// ==========================================
// TREINOS PERSONALIZADOS (PARA TODOS OS NÍVEIS)
// ==========================================

export const DEFAULT_CUSTOM_WORKOUTS = [
  {
    id: 'template_iniciante_fullbody',
    dayId: 'template_iniciante_fullbody',
    name: 'Treino Personalizado',
    shortName: 'Inic',
    title: 'Treino Personal A — Adaptação & Força Básica',
    level: 'Iniciante',
    focus: 'Peito, Costas, Pernas & Core',
    duration: '40 min',
    intensity: 'Adaptação',
    badge: 'Iniciante',
    color: 'from-emerald-500 to-teal-600',
    description: 'Rotina ideal para quem está iniciando na academia ou seguindo prescrição inicial do personal. Movimentos fundamentais com ênfase na execução correta.',
    trainerNotes: 'Mantenha cargas moderadas, priorize a técnica e descanse 60s entre as séries.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'supino-reto-barra',
        name: 'Supino Reto com Barra',
        target: 'Peito',
        secondary: 'Tríceps e Ombros',
        equipment: 'Barra + Banco Reto',
        suggestedWeight: 15,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Composto',
        notes: 'Manter escápulas travadas contra o banco.'
      },
      {
        id: 'puxada-frontal-aberta',
        name: 'Puxada Frontal Aberta',
        target: 'Costas',
        secondary: 'Bíceps',
        equipment: 'Polia Alta (Lat Machine)',
        suggestedWeight: 25,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Composto',
        notes: 'Puxar até a altura da clavícula estufando o peito.'
      },
      {
        id: 'leg-press-45',
        name: 'Leg Press 45°',
        target: 'Quadríceps',
        secondary: 'Glúteos',
        equipment: 'Máquina Leg Press 45',
        suggestedWeight: 60,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 90,
        badge: 'Composto',
        notes: 'Pés alinhados à largura dos ombros, não travar os joelhos.'
      },
      {
        id: 'elevacao-lateral-halteres',
        name: 'Elevação Lateral com Halteres',
        target: 'Ombros',
        secondary: 'Trapézio',
        equipment: 'Halteres',
        suggestedWeight: 5,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 45,
        badge: 'Isolado',
        notes: 'Subir até a linha dos ombros com controle na descida.'
      },
      {
        id: 'prancha-isometrica',
        name: 'Prancha Isométrica',
        target: 'Abdômen',
        secondary: 'Lombar',
        equipment: 'Colchonete',
        suggestedWeight: 0,
        suggestedReps: '45s',
        defaultSets: 3,
        restTime: 45,
        badge: 'Core',
        notes: 'Abdômen e glúteos contraídos sem descer a lombar.'
      }
    ]
  },
  {
    id: 'template_intermediario_upper',
    dayId: 'template_intermediario_upper',
    name: 'Treino Personalizado',
    shortName: 'Inter',
    title: 'Treino Personal B — Upper Hipertrofia & Volume',
    level: 'Intermediário',
    focus: 'Peito, Dorsais, Deltoides & Braços',
    duration: '50 min',
    intensity: 'Alta',
    badge: 'Intermediário',
    color: 'from-sky-500 to-blue-600',
    description: 'Prescrição focada em sobrecarga progressiva nos principais grupos do tronco, balanceando exercícios compostos e isolados para máxima densidade muscular.',
    trainerNotes: 'Aumente as cargas quando atingir o topo das repetições com boa forma.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'supino-inclinado-halteres',
        name: 'Supino Inclinado com Halteres',
        target: 'Peito (Superior)',
        secondary: 'Deltoides e Tríceps',
        equipment: 'Banco 30° + Halteres',
        suggestedWeight: 18,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 75,
        badge: 'Composto',
        notes: 'Foco na porção clavicular com amplitude máxima.'
      },
      {
        id: 'remada-curvada-barra',
        name: 'Remada Curvada com Barra',
        target: 'Costas',
        secondary: 'Bíceps e Antebraço',
        equipment: 'Barra Olímpica',
        suggestedWeight: 30,
        suggestedReps: 8,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Tronco a 45 graus, puxar a barra no umbigo.'
      },
      {
        id: 'desenvolvimento-com-halteres',
        name: 'Desenvolvimento com Halteres',
        target: 'Ombros',
        secondary: 'Tríceps',
        equipment: 'Banco 75° + Halteres',
        suggestedWeight: 14,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Composto',
        notes: 'Empurrar para cima sem colidir os halteres.'
      },
      {
        id: 'triceps-corda',
        name: 'Tríceps Corda na Polia',
        target: 'Tríceps',
        secondary: 'Antebraço',
        equipment: 'Polia Alta + Corda',
        suggestedWeight: 15,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 45,
        badge: 'Isolado',
        notes: 'Abrir a corda no final do movimento para contração máxima.'
      },
      {
        id: 'rosca-direta-barra',
        name: 'Rosca Direta com Barra',
        target: 'Bíceps',
        secondary: 'Antebraço',
        equipment: 'Barra W / Barra Reta',
        suggestedWeight: 15,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Cotovelos junto ao corpo, sem balançar a lombar.'
      }
    ]
  },
  {
    id: 'template_avancado_push',
    dayId: 'template_avancado_push',
    name: 'Treino Personalizado',
    shortName: 'Avanç',
    title: 'Treino Personal C — Heavy Push & Cargas Máximas',
    level: 'Avançado',
    focus: 'Peito, Ombros & Tríceps (Alta Potência)',
    duration: '60 min',
    intensity: 'Muito Alta',
    badge: 'Avançado',
    color: 'from-amber-500 to-rose-600',
    description: 'Desenvolvido para atletas e praticantes experientes que buscam superação de marcas, trabalho pesado de força bruta e estímulo hipertrófico de ponta.',
    trainerNotes: 'Treino de alta demanda do SNC. Faça aquecimento específico antes das séries pesadas.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'supino-reto-barra',
        name: 'Supino Reto com Barra',
        target: 'Peito',
        secondary: 'Tríceps e Deltoides',
        equipment: 'Banco Reto + Barra Olímpica',
        suggestedWeight: 40,
        suggestedReps: 6,
        defaultSets: 4,
        restTime: 120,
        badge: 'Força Máxima',
        notes: 'Séries pesadas com controle rigoroso na descida.'
      },
      {
        id: 'desenvolvimento-militar',
        name: 'Desenvolvimento Militar com Barra',
        target: 'Ombros',
        secondary: 'Tríceps e Core',
        equipment: 'Barra em Pé',
        suggestedWeight: 25,
        suggestedReps: 8,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Tronco rígido, glúteos e abdômen ativos.'
      },
      {
        id: 'paralelas-foco-peito',
        name: 'Paralelas (Foco Peitoral)',
        target: 'Peito',
        secondary: 'Tríceps e Ombros',
        equipment: 'Barras Paralelas',
        suggestedWeight: 0,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 90,
        badge: 'Composto',
        notes: 'Corpo inclinado para frente para enfatizar peitoral.'
      },
      {
        id: 'elevacao-lateral-polia',
        name: 'Elevação Lateral na Polia',
        target: 'Ombros',
        secondary: 'Trapézio',
        equipment: 'Polia Baixa',
        suggestedWeight: 7.5,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Tensão contínua em toda a curva de resistência.'
      },
      {
        id: 'triceps-testa-barra-w',
        name: 'Tríceps Testa com Barra W',
        target: 'Tríceps',
        secondary: 'Cotovelos',
        equipment: 'Banco Reto + Barra W',
        suggestedWeight: 18,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Descer a barra na linha da testa sem abrir os cotovelos.'
      }
    ]
  }
];

export const getCustomWorkouts = () => {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    if (!raw) {
      // Salva os templates iniciais para primeiro uso
      localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(DEFAULT_CUSTOM_WORKOUTS));
      return DEFAULT_CUSTOM_WORKOUTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CUSTOM_WORKOUTS;
  } catch {
    return DEFAULT_CUSTOM_WORKOUTS;
  }
};

export const saveCustomWorkout = (workoutData) => {
  try {
    const workouts = getCustomWorkouts();
    const now = new Date().toISOString();
    const id = workoutData.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const formattedWorkout = {
      ...workoutData,
      id,
      dayId: id, // Garante compatibilidade transparente com ActiveWorkout e histórico
      name: workoutData.name || 'Treino Personalizado',
      shortName: (workoutData.title || 'Treino').slice(0, 5),
      title: workoutData.title || 'Meu Treino Personalizado',
      level: workoutData.level || 'Intermediário',
      focus: workoutData.focus || 'Geral',
      duration: workoutData.duration || '45 min',
      intensity: workoutData.intensity || 'Alta',
      badge: workoutData.level || 'Personalizado',
      color: workoutData.level === 'Iniciante' 
        ? 'from-emerald-500 to-teal-600'
        : workoutData.level === 'Avançado'
          ? 'from-amber-500 to-rose-600'
          : 'from-sky-500 to-blue-600',
      description: workoutData.description || 'Treino personalizado montado no AB Fitness.',
      trainerNotes: workoutData.trainerNotes || '',
      isRestDay: false,
      updatedAt: now,
      createdAt: workoutData.createdAt || now,
      exercises: (workoutData.exercises || []).map((ex, idx) => ({
        id: ex.id || `ex_${idx}_${Date.now()}`,
        name: ex.name || 'Exercício',
        target: ex.target || 'Geral',
        secondary: ex.secondary || '',
        equipment: ex.equipment || 'Equipamento livre / máquina',
        suggestedWeight: Number(ex.suggestedWeight) || 0,
        suggestedReps: ex.suggestedReps || 10,
        defaultSets: Number(ex.defaultSets) || 3,
        restTime: Number(ex.restTime) || 60,
        badge: ex.badge || 'Personal',
        notes: ex.notes || '',
        steps: ex.steps || (ex.notes ? [ex.notes] : ['Execute com postura firme e cadência controlada.'])
      }))
    };

    const existingIndex = workouts.findIndex(w => w.id === id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...workouts];
      updated[existingIndex] = formattedWorkout;
    } else {
      updated = [formattedWorkout, ...workouts];
    }

    localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(updated));
    return { workouts: updated, saved: formattedWorkout };
  } catch (err) {
    console.error('Erro ao salvar treino personalizado:', err);
    return { workouts: getCustomWorkouts(), saved: null };
  }
};

export const deleteCustomWorkout = (workoutId) => {
  try {
    const workouts = getCustomWorkouts();
    const updated = workouts.filter(w => w.id !== workoutId);
    localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const duplicateCustomWorkout = (workoutId) => {
  try {
    const workouts = getCustomWorkouts();
    const target = workouts.find(w => w.id === workoutId);
    if (!target) return workouts;

    const copy = {
      ...target,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: `${target.title} (Cópia)`,
      createdAt: new Date().toISOString()
    };
    copy.dayId = copy.id;

    const updated = [copy, ...workouts];
    localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(updated));
    return updated;
  } catch {
    return getCustomWorkouts();
  }
};


