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
  ACTIVE_RUN_DRAFT: 'ab_fitness_active_run_draft_v1',
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

// Rascunho / Sessão Ativa de Corrida (armazenado em IndexedDB para alta performance com milhares de pontos GPS)
import { getRunDraftFromIDB, saveRunDraftToIDB, clearRunDraftFromIDB } from './idbDraft';
export { getRunDraftFromIDB, saveRunDraftToIDB, clearRunDraftFromIDB };

export const getActiveRunDraft = () => {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_RUN_DRAFT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveActiveRunDraft = (draft) => {
  try {
    saveRunDraftToIDB(draft);
  } catch (err) {
    console.warn('Erro ao delegar gravação de rascunho de corrida:', err);
  }
};

export const clearActiveRunDraft = () => {
  try {
    clearRunDraftFromIDB();
  } catch {}
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
    id: 'template_push_hipertrofia',
    dayId: 'template_push_hipertrofia',
    name: 'Treino Personalizado',
    shortName: 'Push',
    title: 'Push Day — Peito, Deltoides & Tríceps',
    level: 'Intermediário',
    focus: 'Peitoral Maior, Deltoide Anterior/Lateral e Tríceps',
    duration: '50 min',
    intensity: 'Alta',
    badge: 'Push Hipertrofia',
    color: 'from-sky-500 to-blue-600',
    description: 'Divisão Push focada em desenvolvimento da cadeia anterior de empurrar. Combina sobrecarga progressiva com alta ativação do peitoral e ombros 3D.',
    trainerNotes: 'Inicie com o supino inclinado aproveitando o sistema neuromuscular descansado para construir o peitoral superior.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'supino-inclinado-halteres',
        name: 'Supino Inclinado com Halteres',
        target: 'Peito (Superior)',
        secondary: 'Deltoide Anterior e Tríceps',
        equipment: 'Banco 30° + Halteres',
        suggestedWeight: 18,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 75,
        badge: 'Composto',
        notes: 'Banco a 30 graus para foco máximo no feixe clavicular do peitoral.'
      },
      {
        id: 'supino-reto-barra',
        name: 'Supino Reto com Barra',
        target: 'Peito',
        secondary: 'Tríceps e Deltoides',
        equipment: 'Banco Reto + Barra',
        suggestedWeight: 35,
        suggestedReps: 8,
        defaultSets: 3,
        restTime: 90,
        badge: 'Composto',
        notes: 'Pés plantados no chão gerando leg drive estável.'
      },
      {
        id: 'crossover-polia-alta',
        name: 'Crossover na Polia Alta',
        target: 'Peito (Inferior/Médio)',
        secondary: 'Deltoides',
        equipment: 'Polia Alta Dupla',
        suggestedWeight: 15,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Cruzar levemente as mãos no final da contração concêntrica.'
      },
      {
        id: 'desenvolvimento-com-halteres',
        name: 'Desenvolvimento com Halteres',
        target: 'Ombros',
        secondary: 'Tríceps e Trapézio',
        equipment: 'Banco 75° + Halteres',
        suggestedWeight: 14,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 75,
        badge: 'Composto',
        notes: 'Cotovelos a 75 graus no plano escapular.'
      },
      {
        id: 'elevacao-lateral-polia',
        name: 'Elevação Lateral na Polia',
        target: 'Deltoide Lateral',
        secondary: 'Trapézio',
        equipment: 'Polia Baixa',
        suggestedWeight: 7.5,
        suggestedReps: 14,
        defaultSets: 4,
        restTime: 45,
        badge: 'Isolado',
        notes: 'Tensão contínua em todo o curso do movimento.'
      },
      {
        id: 'triceps-corda-soccer',
        name: 'Tríceps Pulley na Corda',
        target: 'Tríceps',
        secondary: 'Antebraço',
        equipment: 'Polia Alta + Corda',
        suggestedWeight: 15,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 45,
        badge: 'Isolado',
        notes: 'Abrir as pontas da corda na contração máxima.'
      }
    ]
  },
  {
    id: 'template_pull_hipertrofia',
    dayId: 'template_pull_hipertrofia',
    name: 'Treino Personalizado',
    shortName: 'Pull',
    title: 'Pull Day — Dorsais, Deltoide Posterior & Bíceps',
    level: 'Intermediário',
    focus: 'Dorsais (Largura & Espessura), Bíceps e Trapézio',
    duration: '50 min',
    intensity: 'Alta',
    badge: 'Pull Hipertrofia',
    color: 'from-sky-500 to-indigo-600',
    description: 'Treino de tração completo para construção de costas em formato V, deltoides posteriores 3D e braços densos.',
    trainerNotes: 'Puxe com os cotovelos e faça adução e depressão escapular consciente antes de dobrar os braços.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'puxada-frontal-aberta',
        name: 'Puxada Frontal Aberta',
        target: 'Costas (Latíssimo)',
        secondary: 'Bíceps e Trapézio',
        equipment: 'Polia Alta (Lat Machine)',
        suggestedWeight: 35,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 75,
        badge: 'Composto',
        notes: 'Puxar até a altura da clavícula estufando o peito.'
      },
      {
        id: 'remada-curvada-barra',
        name: 'Remada Curvada com Barra',
        target: 'Costas (Espessura)',
        secondary: 'Bíceps e Antebraço',
        equipment: 'Barra Olímpica',
        suggestedWeight: 35,
        suggestedReps: 8,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Coluna travada a 45 graus, puxar em direção ao umbigo.'
      },
      {
        id: 'remada-unilateral-serrote',
        name: 'Remada Serrote Unilateral',
        target: 'Costas',
        secondary: 'Core e Antebraço',
        equipment: 'Banco Reto + Halter',
        suggestedWeight: 16,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Composto',
        notes: 'Movimento linear com o cotovelo rente ao tronco.'
      },
      {
        id: 'face-pull',
        name: 'Face Pull com Corda',
        target: 'Deltoide Posterior & Manguito',
        secondary: 'Trapézio e Romboides',
        equipment: 'Polia Alta + Corda',
        suggestedWeight: 12.5,
        suggestedReps: 14,
        defaultSets: 4,
        restTime: 45,
        badge: 'Saúde Articular',
        notes: 'Puxar em direção aos olhos rotacionando externamente os ombros.'
      },
      {
        id: 'rosca-direta-barra-w',
        name: 'Rosca Direta com Barra W',
        target: 'Bíceps',
        secondary: 'Braquial e Antebraço',
        equipment: 'Barra W + Anilhas',
        suggestedWeight: 14,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Cotovelos fixos sem balanço de tronco.'
      },
      {
        id: 'rosca-martelo-halteres',
        name: 'Rosca Martelo com Halteres',
        target: 'Braquial & Antebraço',
        secondary: 'Bíceps',
        equipment: 'Par de Halteres',
        suggestedWeight: 10,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 45,
        badge: 'Pegada Forte',
        notes: 'Pegada neutra controlando a descida em 3 segundos.'
      }
    ]
  },
  {
    id: 'template_legs_completo',
    dayId: 'template_legs_completo',
    name: 'Treino Personalizado',
    shortName: 'Legs',
    title: 'Legs Day — Quadríceps, Isquiotibiais & Panturrilhas',
    level: 'Intermediário',
    focus: 'Membros Inferiores Completos & Cadeia Posterior',
    duration: '55 min',
    intensity: 'Alta Potência',
    badge: 'Leg Day Pesado',
    color: 'from-sky-500 to-teal-600',
    description: 'Treino de pernas completo combinando movimentos multiarticulares pesados, agachamento búlgaro unilateral e isolamento de posteriores.',
    trainerNotes: 'Priorize profundidade e alinhamento do joelho com a ponta dos pés em todas as repetições.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'agachamento-livre-barra',
        name: 'Agachamento Livre com Barra',
        target: 'Quadríceps & Glúteos',
        secondary: 'Core e Isquiotibiais',
        equipment: 'Gaiola + Barra Olímpica',
        suggestedWeight: 40,
        suggestedReps: 8,
        defaultSets: 4,
        restTime: 120,
        badge: 'Composto',
        notes: 'Descer até as coxas quebrarem a linha paralela com o chão.'
      },
      {
        id: 'leg-press-45',
        name: 'Leg Press 45°',
        target: 'Quadríceps',
        secondary: 'Glúteos e Adutores',
        equipment: 'Máquina Leg Press 45',
        suggestedWeight: 100,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Não estender totalmente os joelhos no topo para manter a tensão.'
      },
      {
        id: 'agachamento-bulgaro',
        name: 'Agachamento Búlgaro com Halteres',
        target: 'Quadríceps & Glúteo Médio',
        secondary: 'Equilíbrio e Core',
        equipment: 'Banco + Halteres',
        suggestedWeight: 10,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Unilateral',
        notes: 'Tronco ligeiramente inclinado à frente para ativação glútea profunda.'
      },
      {
        id: 'mesa-flexora',
        name: 'Mesa Flexora',
        target: 'Isquiotibiais (Posterior de Coxa)',
        secondary: 'Panturrilha',
        equipment: 'Máquina Mesa Flexora',
        suggestedWeight: 30,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Pausa de 1 segundo na contração máxima mantendo a bacia colada no banco.'
      },
      {
        id: 'stiff-halteres',
        name: 'Stiff / RDL com Halteres',
        target: 'Isquiotibiais & Glúteo Máximo',
        secondary: 'Lombar',
        equipment: 'Par de Halteres',
        suggestedWeight: 16,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 75,
        badge: 'Cadeia Posterior',
        notes: 'Quadril para trás com joelhos semiflexionados, coluna 100% neutra.'
      },
      {
        id: 'panturrilha-em-pe',
        name: 'Panturrilha em Pé no Step',
        target: 'Gastrocnêmio & Tendão de Aquiles',
        secondary: 'Sóleo',
        equipment: 'Degrau / Step + Halteres',
        suggestedWeight: 15,
        suggestedReps: 15,
        defaultSets: 4,
        restTime: 45,
        badge: 'Isolado',
        notes: 'Alongamento profundo no fundo e 1 segundo de pico no topo.'
      }
    ]
  },
  {
    id: 'template_gluteos_posterior',
    dayId: 'template_gluteos_posterior',
    name: 'Treino Personalizado',
    shortName: 'Glúteo',
    title: 'Glúteos & Cadeia Posterior — Escultura & Força',
    level: 'Intermediário',
    focus: 'Glúteo Máximo, Glúteo Médio & Isquiotibiais',
    duration: '48 min',
    intensity: 'Alta',
    badge: 'Glúteos & Posterior',
    color: 'from-amber-500 to-rose-600',
    description: 'Protocolo desenhado para maximizar a hipertrofia do glúteo máximo e cadeia posterior com Hip Thrust pesado, flexões de joelho e estabilização pélvica.',
    trainerNotes: 'Aperte os glúteos conscientemente no topo do Hip Thrust e controle rigorosamente a descida do Stiff.',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'elevacao-pelvica-barra',
        name: 'Elevação Pélvica / Hip Thrust com Barra',
        target: 'Glúteo Máximo',
        secondary: 'Isquiotibiais e Core',
        equipment: 'Banco + Barra Olímpica + Espuma',
        suggestedWeight: 40,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        badge: 'Extensão de Quadril',
        notes: 'Tíbias verticais no topo e retroversão pélvica sem hiperestender a coluna.'
      },
      {
        id: 'stiff-barra',
        name: 'Stiff com Barra',
        target: 'Isquiotibiais & Glúteo',
        secondary: 'Eretores da Espinha',
        equipment: 'Barra Olímpica',
        suggestedWeight: 30,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 75,
        badge: 'Cadeia Posterior',
        notes: 'Descer rente às pernas sentindo o alongamento dos posteriores.'
      },
      {
        id: 'agachamento-bulgaro',
        name: 'Agachamento Búlgaro com Halteres',
        target: 'Glúteo Máximo & Quadríceps',
        secondary: 'Estabilizadores',
        equipment: 'Banco + Halteres',
        suggestedWeight: 10,
        suggestedReps: 10,
        defaultSets: 3,
        restTime: 60,
        badge: 'Unilateral',
        notes: 'Passo mais longo para direcionar a sobrecarga para os glúteos.'
      },
      {
        id: 'cadeira-flexora',
        name: 'Cadeira Flexora',
        target: 'Isquiotibiais',
        secondary: 'Gastrocnêmio',
        equipment: 'Máquina Cadeira Flexora',
        suggestedWeight: 25,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 60,
        badge: 'Isolado',
        notes: 'Músculo sob alongamento com o quadril flexionado a 90°.'
      },
      {
        id: 'adutor-copenhagen',
        name: 'Prancha Adutora Copenhagen',
        target: 'Adutores da Coxa',
        secondary: 'Core Lateral',
        equipment: 'Banco ou Colchonete',
        suggestedWeight: 0,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 45,
        badge: 'Estabilidade',
        notes: 'Corpo reto e suspensão do quadril sem girar a pelve.'
      }
    ]
  },
  {
    id: 'template_forca_5x5',
    dayId: 'template_forca_5x5',
    name: 'Treino Personalizado',
    shortName: 'Força',
    title: 'Força Bruta 5x5 — Sobrecarga Neural',
    level: 'Avançado',
    focus: 'Levantamentos Básicos, Cargas Máximas & Densidade',
    duration: '60 min',
    intensity: 'Muito Alta',
    badge: 'Força 5x5',
    color: 'from-amber-600 to-rose-700',
    description: 'Protocolo clássico baseado no método 5x5 para elevação exponencial de cargas nos exercícios compostos soberanos.',
    trainerNotes: 'Descanse 2 a 3 minutos completos entre séries para recuperação total do sistema fosfagênio (ATP-CP).',
    isRestDay: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    exercises: [
      {
        id: 'supino-reto-barra',
        name: 'Supino Reto com Barra',
        target: 'Peito',
        secondary: 'Tríceps e Deltoides',
        equipment: 'Banco Reto + Barra Olímpica',
        suggestedWeight: 45,
        suggestedReps: 5,
        defaultSets: 5,
        restTime: 120,
        badge: 'Força Pura',
        notes: 'Séries de força máxima com pausa controlada no peito.'
      },
      {
        id: 'agachamento-livre-barra',
        name: 'Agachamento Livre com Barra',
        target: 'Quadríceps & Glúteos',
        secondary: 'Core',
        equipment: 'Gaiola de Agachamento',
        suggestedWeight: 50,
        suggestedReps: 5,
        defaultSets: 5,
        restTime: 120,
        badge: 'Força Pura',
        notes: 'Respiração diafragmática e abdômen pressurizado.'
      },
      {
        id: 'levantamento-terra',
        name: 'Levantamento Terra (Deadlift)',
        target: 'Cadeia Posterior & Costas',
        secondary: 'Glúteos e Trapézio',
        equipment: 'Barra Olímpica no Solo',
        suggestedWeight: 60,
        suggestedReps: 5,
        defaultSets: 4,
        restTime: 150,
        badge: 'Poder Absoluto',
        notes: 'Puxar com a barra colada na canela e estender o quadril.'
      },
      {
        id: 'desenvolvimento-militar',
        name: 'Desenvolvimento Militar com Barra',
        target: 'Ombros',
        secondary: 'Tríceps e Core',
        equipment: 'Barra Olímpica em Pé',
        suggestedWeight: 25,
        suggestedReps: 6,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Corpo rígido sem inclinar a lombar para trás.'
      },
      {
        id: 'remada-curvada-barra',
        name: 'Remada Curvada com Barra',
        target: 'Costas',
        secondary: 'Bíceps e Lombar',
        equipment: 'Barra Olímpica',
        suggestedWeight: 40,
        suggestedReps: 6,
        defaultSets: 4,
        restTime: 90,
        badge: 'Composto',
        notes: 'Pegada pronada com puxada explosiva.'
      }
    ]
  },
  {
    id: 'template_iniciante_fullbody',
    dayId: 'template_iniciante_fullbody',
    name: 'Treino Personalizado',
    shortName: 'Inic',
    title: 'Full Body 3x — Adaptação & Eficiência',
    level: 'Iniciante',
    focus: 'Corpo Inteiro, Coordenação & Padrões Motores',
    duration: '40 min',
    intensity: 'Adaptação',
    badge: 'Full Body Base',
    color: 'from-emerald-500 to-teal-600',
    description: 'Rotina completa para quem está iniciando ou possui pouco tempo na semana. Estimula todos os grandes grupos musculares com técnica impecável.',
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
  }
];

export const getCustomWorkouts = () => {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOM_WORKOUTS);
    if (!raw) {
      localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(DEFAULT_CUSTOM_WORKOUTS));
      return DEFAULT_CUSTOM_WORKOUTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(DEFAULT_CUSTOM_WORKOUTS));
      return DEFAULT_CUSTOM_WORKOUTS;
    }

    // Incorpora suavemente novos templates padrão sem apagar os treinos criados pelo usuário
    const existingIds = new Set(parsed.map(w => w.id));
    const missingDefaults = DEFAULT_CUSTOM_WORKOUTS.filter(d => !existingIds.has(d.id));
    if (missingDefaults.length > 0) {
      const merged = [...parsed, ...missingDefaults];
      localStorage.setItem(KEYS.CUSTOM_WORKOUTS, JSON.stringify(merged));
      return merged;
    }

    return parsed;
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


