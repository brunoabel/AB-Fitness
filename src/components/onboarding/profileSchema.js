/**
 * Schema do perfil de treino recolhido pelo Onboarding do AB Coach.
 * Espelha a tabela public.user_fitness_profiles (supabase/migrations/20261108_user_fitness_profiles.sql).
 *
 * @typedef {'male'|'female'|'other'} Gender
 * @typedef {'hypertrophy'|'fat_loss'|'strength'|'conditioning'} PrimaryGoal
 * @typedef {'beginner'|'intermediate'|'advanced'} ExperienceLevel
 * @typedef {'gym'|'home_gym'|'bodyweight'} TrainingLocation
 * @typedef {'ppl'|'upper_lower'|'arnold'|'full_body'|'auto'} SplitPreference
 * @typedef {'shoulder'|'lower_back'|'knee'|'wrist_elbow'|'hip'} Injury
 * @typedef {'upper_chest'|'back_vtaper'|'glutes_hams'|'arms'|'shoulders'|'quads'} PriorityMuscle
 * @typedef {'futebol_futsal'|'corrida'|'padel_tenis'|'boxe_lutas'|'basquetebol'|'natacao'|'ciclismo'|'outro'} Sport
 * @typedef {'recreational'|'moderate'|'competitive'} SportIntensity
 * @typedef {'gym_first'|'sport_first'|'split_hours'} SessionOrder
 *
 * @typedef {Object} FitnessProfile
 * @property {Gender} gender
 * @property {number} age
 * @property {number} weightKg
 * @property {number} heightCm
 * @property {PrimaryGoal} primaryGoal
 * @property {ExperienceLevel} experienceLevel
 * @property {TrainingLocation} trainingLocation
 * @property {3|4|5|6} daysPerWeek
 * @property {45|60|75} sessionMinutes
 * @property {SplitPreference} splitPreference
 * @property {Injury[]} injuries
 * @property {PriorityMuscle[]} priorityMuscles
 * @property {boolean|null} hasSport
 * @property {Sport[]} sports
 * @property {number[]} sportDays
 * @property {SportIntensity|null} sportIntensity
 * @property {SessionOrder|null} sessionOrder
 */

export const GENDERS = [
  { id: 'male', label: 'Masculino', icon: 'Mars' },
  { id: 'female', label: 'Feminino', icon: 'Venus' },
  { id: 'other', label: 'Prefiro não dizer', icon: 'CircleDashed' }
];

/** `intensity` (1–4) alimenta as barras de carga dos cartões. */
export const GOALS = [
  { id: 'hypertrophy', label: 'Hipertrofia', hint: 'Massa muscular e volume de treino', icon: 'Dumbbell', intensity: 3 },
  { id: 'strength', label: 'Força', hint: 'Cargas máximas nos movimentos básicos', icon: 'Weight', intensity: 4 },
  { id: 'fat_loss', label: 'Recomposição', hint: 'Perder gordura e manter músculo', icon: 'Flame', intensity: 2 },
  { id: 'conditioning', label: 'Condicionamento', hint: 'Fôlego, densidade e resistência', icon: 'HeartPulse', intensity: 3 }
];

export const LEVELS = [
  { id: 'beginner', label: 'Iniciante', hint: 'Menos de 6 meses de treino consistente', icon: 'Sprout', intensity: 1 },
  { id: 'intermediate', label: 'Intermédio', hint: '6 meses a 2 anos', icon: 'TrendingUp', intensity: 2 },
  { id: 'advanced', label: 'Avançado', hint: 'Mais de 2 anos, técnica sólida', icon: 'Trophy', intensity: 4 }
];

/** `environments`: ambientes do catálogo de exercícios disponíveis em cada local. */
export const LOCATIONS = [
  { id: 'gym', label: 'Ginásio completo', hint: 'Máquinas, barras, cabos e halteres', icon: 'Building2', environments: ['gym', 'home_minimal', 'home_no_equip'] },
  { id: 'home_gym', label: 'Casa com equipamento', hint: 'Halteres, elásticos e barra fixa', icon: 'House', environments: ['home_minimal', 'home_no_equip'] },
  { id: 'bodyweight', label: 'Só peso corporal', hint: 'Calistenia, sem equipamento', icon: 'PersonStanding', environments: ['home_no_equip'] }
];

/** Dias de treino por frequência, segundo o gerador (0 = segunda … 6 = domingo). */
export const TRAINING_DAYS = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 3, 4], 6: [0, 1, 2, 3, 4, 5] };

/** Metadados dos 7 dias da semana (0 = segunda ... 6 = domingo; dayId espelha Date.getDay()). */
export const WEEK_DAYS = [
  { index: 0, dayId: 1, letter: 'S', short: 'Seg', name: 'Segunda-feira' },
  { index: 1, dayId: 2, letter: 'T', short: 'Ter', name: 'Terça-feira' },
  { index: 2, dayId: 3, letter: 'Q', short: 'Qua', name: 'Quarta-feira' },
  { index: 3, dayId: 4, letter: 'Q', short: 'Qui', name: 'Quinta-feira' },
  { index: 4, dayId: 5, letter: 'S', short: 'Sex', name: 'Sexta-feira' },
  { index: 5, dayId: 6, letter: 'S', short: 'Sáb', name: 'Sábado' },
  { index: 6, dayId: 0, letter: 'D', short: 'Dom', name: 'Domingo' }
];

export const formatTrainingDays = (days) => {
  if (!Array.isArray(days) || days.length === 0) return '';
  return [...days]
    .sort((a, b) => a - b)
    .map((idx) => WEEK_DAYS.find((w) => w.index === idx)?.short)
    .filter(Boolean)
    .join(' · ');
};

export const SPLIT_SUMMARY = {
  3: 'Full Body A / B / C',
  4: 'Upper / Lower · Upper / Lower',
  5: 'Push / Pull / Legs / Upper / Lower',
  6: 'Push / Pull / Legs × 2'
};

/** Mesma divisão que SPLIT_SUMMARY, em português simples — usada para quem é iniciante. */
export const SPLIT_SUMMARY_SIMPLE = {
  3: 'Corpo inteiro, 3 treinos diferentes',
  4: 'Metade de cima e metade de baixo do corpo, 2 vezes por semana',
  5: 'Empurrar, puxar e pernas, mais um dia de cima e um de baixo',
  6: 'Empurrar, puxar e pernas, 2 vezes por semana'
};

export const DAYS = [3, 4, 5, 6];
export const MINUTES = [45, 60, 75];

/** Split que o gerador aplica para cada frequência semanal. */
export const SPLIT_BY_DAYS = { 3: 'full_body', 4: 'upper_lower', 5: 'ppl', 6: 'ppl' };

export const INJURIES = [
  { id: 'shoulder', label: 'Ombro' },
  { id: 'lower_back', label: 'Lombar' },
  { id: 'knee', label: 'Joelho' },
  { id: 'wrist_elbow', label: 'Punho / cotovelo' },
  { id: 'hip', label: 'Quadril' }
];

export const PRIORITY_MUSCLES = [
  { id: 'upper_chest', label: 'Peitoral superior' },
  { id: 'back_vtaper', label: 'Dorsal / V-taper' },
  { id: 'glutes_hams', label: 'Glúteos / posterior' },
  { id: 'arms', label: 'Braços' },
  { id: 'shoulders', label: 'Ombros' },
  { id: 'quads', label: 'Quadríceps' }
];
export const MAX_PRIORITY = 2;

/** Catálogo de modalidades do screening de atleta híbrido. */
export const SPORTS = [
  { id: 'futebol_futsal', label: 'Futebol / Futsal' },
  { id: 'corrida', label: 'Corrida / Running' },
  { id: 'padel_tenis', label: 'Padel / Ténis' },
  { id: 'boxe_lutas', label: 'Boxe / Lutas' },
  { id: 'basquetebol', label: 'Basquetebol' },
  { id: 'natacao', label: 'Natação' },
  { id: 'ciclismo', label: 'Ciclismo' },
  { id: 'outro', label: 'Outro' }
];

export const SPORT_INTENSITIES = [
  { id: 'recreational', label: 'Lazer / Recreativo' },
  { id: 'moderate', label: 'Moderado' },
  { id: 'competitive', label: 'Competitivo / Alta Performance' }
];

export const SESSION_ORDERS = [
  { id: 'gym_first', label: 'Antes do desporto' },
  { id: 'sport_first', label: 'Depois do desporto' },
  { id: 'split_hours', label: 'Em momentos totalmente separados' }
];

/** Desportos de alto impacto nos membros inferiores: disparam a regra anti-fadiga de pernas. */
export const HIGH_IMPACT_LEG_SPORTS = ['futebol_futsal', 'corrida', 'padel_tenis', 'basquetebol'];

/** Regiões do módulo de alongamentos/prevenção (src/data/recoveryProtocols.js) relevantes por desporto. */
export const SPORT_PREVENTION_REGIONS = {
  futebol_futsal: ['adutores', 'gemeos', 'posteriores', 'quadriceps'],
  corrida: ['gemeos', 'posteriores', 'quadriceps'],
  padel_tenis: ['ombros', 'trapezio', 'adutores'],
  boxe_lutas: ['ombros', 'trapezio', 'triceps'],
  basquetebol: ['gemeos', 'quadriceps', 'posteriores', 'adutores'],
  natacao: ['ombros', 'trapezio', 'costas'],
  ciclismo: ['quadriceps', 'posteriores', 'gemeos'],
  outro: ['quadriceps', 'posteriores']
};

/** Dias (0–6) em que há desporto e também ginásio agendado. */
export function overlapSportDays(profile) {
  const gymDays = new Set(profile.trainingDays || []);
  return (profile.sportDays || []).filter((d) => gymDays.has(d));
}

/** Veredito dinâmico do AB Coach para o screening de atleta híbrido. */
export function sportVerdict(profile) {
  if (profile.hasSport !== true) return null;
  if (!profile.sports?.length || !profile.sportDays?.length || !profile.sportIntensity) {
    return 'Escolhe a modalidade, os dias e o nível para o AB Coach calibrar a tua semana.';
  }
  const highImpact = profile.sports.some((s) => HIGH_IMPACT_LEG_SPORTS.includes(s));
  const risky = profile.sportIntensity !== 'recreational';
  const overlap = overlapSportDays(profile);

  if (highImpact && risky) {
    return 'Vou proteger os teus joelhos e tornozelos: nada de pernas pesadas na véspera ou no dia do desporto, com pelo menos 48h de recuperação até à próxima partida.';
  }
  if (overlap.length > 0) {
    return 'Sessão dupla detetada: reduzo o volume acessório e removo exercícios de alta fadiga lombar nos dias partilhados.';
  }
  if (profile.sportIntensity === 'competitive') {
    return 'Nível competitivo registado: vou equilibrar a carga de musculação com a tua rotina de alta performance.';
  }
  return 'Vou ajustar o teu plano com mobilidade e prevenção específicas para a tua modalidade.';
}

/** @type {FitnessProfile} */
export const DEFAULT_PROFILE = {
  gender: null,
  age: 25,
  weightKg: 75,
  heightCm: 175,
  primaryGoal: null,
  experienceLevel: null,
  trainingLocation: null,
  daysPerWeek: null,
  trainingDays: null,
  sessionMinutes: null,
  splitPreference: 'auto',
  injuries: [],
  priorityMuscles: [],
  hasSport: null,
  sports: [],
  otherSport: '',
  sportDays: [],
  sportIntensity: null,
  sessionOrder: null
};

/** Uma etapa é válida quando todos os campos que exige estão preenchidos (arrays exigem pelo menos 1 item). */
export function fieldsFilled(profile, fields = []) {
  return fields.every((k) => {
    const v = profile[k];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined;
  });
}

/** Converte para uma linha da tabela user_fitness_profiles (snake_case). */
export function toRow(userId, p) {
  return {
    user_id: userId,
    gender: p.gender,
    age: Math.round(p.age),
    weight_kg: Math.round(p.weightKg * 10) / 10,
    height_cm: Math.round(p.heightCm),
    primary_goal: p.primaryGoal,
    experience_level: p.experienceLevel,
    training_location: p.trainingLocation,
    days_per_week: p.daysPerWeek,
    session_minutes: p.sessionMinutes,
    split_preference: p.splitPreference,
    injuries: p.injuries,
    priority_muscles: p.priorityMuscles,
    has_sport: Boolean(p.hasSport),
    sports: p.sports || [],
    other_sport: p.otherSport || null,
    sport_days: p.sportDays || [],
    sport_intensity: p.sportIntensity || null,
    session_order: p.sessionOrder || null,
    onboarding_completed_at: new Date().toISOString()
  };
}

export const labelOf = (list, id) => list.find((o) => o.id === id)?.label || '—';

/**
 * Modo simples: esconde jargão de treino avançado (tipo de série, 1RM estimado, etc.) da
 * interface para quem respondeu "Iniciante" no onboarding. Sem perfil guardado (convidado
 * que ainda não passou pelo onboarding), assume-se o modo simples por omissão — mais seguro
 * para quem nunca treinou do que mostrar jargão logo de início.
 */
export const isBeginnerProfile = (profile) => !profile || profile.experienceLevel === 'beginner';
