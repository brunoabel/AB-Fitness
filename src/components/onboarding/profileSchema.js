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

export const DAYS = [3, 4, 5, 6];
export const MINUTES = [45, 60, 75];

/** Split que o gerador aplica para cada frequência semanal. */
export const SPLIT_BY_DAYS = { 3: 'full_body', 4: 'upper_lower', 5: 'ppl', 6: 'ppl' };

export const SPLITS = [
  { id: 'auto', label: 'O AB Coach decide', hint: 'Melhor encaixe para os teus dias', icon: 'Sparkles' },
  { id: 'ppl', label: 'Push / Pull / Legs', hint: 'Ideal com 5–6 dias', icon: 'Layers' },
  { id: 'upper_lower', label: 'Upper / Lower', hint: 'Ideal com 4 dias', icon: 'ArrowUpDown' },
  { id: 'arnold', label: 'Arnold Split', hint: 'Peito+costas, ombros+braços, pernas · 6 dias', icon: 'Crown' },
  { id: 'full_body', label: 'Full Body', hint: 'Ideal com 3 dias', icon: 'Activity' }
];

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
  priorityMuscles: []
};

/** Uma etapa é válida quando todos os campos que exige estão preenchidos. */
export function fieldsFilled(profile, fields = []) {
  return fields.every((k) => profile[k] !== null && profile[k] !== undefined);
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
    onboarding_completed_at: new Date().toISOString()
  };
}

export const labelOf = (list, id) => list.find((o) => o.id === id)?.label || '—';
