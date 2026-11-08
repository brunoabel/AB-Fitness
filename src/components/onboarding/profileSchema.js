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

export const GOALS = [
  { id: 'hypertrophy', label: 'Hipertrofia', hint: 'Ganhar massa muscular', icon: 'Dumbbell' },
  { id: 'fat_loss', label: 'Definição', hint: 'Perder gordura e manter músculo', icon: 'Flame' },
  { id: 'strength', label: 'Força pura', hint: 'Subir cargas nos básicos', icon: 'Weight' },
  { id: 'conditioning', label: 'Condicionamento', hint: 'Fôlego e resistência', icon: 'HeartPulse' }
];

export const LEVELS = [
  { id: 'beginner', label: 'Iniciante', hint: 'Menos de 6 meses', icon: 'Sprout' },
  { id: 'intermediate', label: 'Intermediário', hint: '6 meses a 2 anos', icon: 'TrendingUp' },
  { id: 'advanced', label: 'Avançado', hint: 'Mais de 2 anos', icon: 'Trophy' }
];

export const LOCATIONS = [
  { id: 'gym', label: 'Ginásio completo', hint: 'Máquinas, barras e cabos', icon: 'Building2' },
  { id: 'home_gym', label: 'Home gym', hint: 'Halteres e elásticos', icon: 'House' },
  { id: 'bodyweight', label: 'Peso corporal', hint: 'Calistenia, sem equipamento', icon: 'PersonStanding' }
];

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
  sessionMinutes: null,
  splitPreference: 'auto',
  injuries: [],
  priorityMuscles: []
};

/** Campos obrigatórios por etapa (as etapas sem campos são sempre válidas). */
export const STEP_REQUIREMENTS = [
  ['gender', 'age', 'weightKg', 'heightCm'],
  ['primaryGoal'],
  ['experienceLevel'],
  ['trainingLocation', 'daysPerWeek', 'sessionMinutes'],
  ['splitPreference'],
  [],
  []
];

export function isStepValid(profile, step) {
  return (STEP_REQUIREMENTS[step] || []).every((k) => profile[k] !== null && profile[k] !== undefined);
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
