/**
 * Converte o perfil do Onboarding do AB Coach num plano semanal.
 * Usa o gerador científico existente e depois adapta: local de treino, lesões, músculos prioritários e condicionamento.
 */
import { generatePersonalizedWorkoutPlan } from './workoutGenerator.js';
import { EXERCISES_100, findExerciseIn100 } from './exercises100.js';
import { SPLIT_BY_DAYS, TRAINING_DAYS, WEEK_DAYS } from '../components/onboarding/profileSchema.js';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-_]+/g, ' ');

const GYM_EQUIPMENT = ['maquina', 'polia', 'cabo', 'corda', 'face pull', 'crossover', 'smith', 'leg press', 'cadeira', 'mesa', 'hack', 'pec deck', 'voador', 'graviton', 'puxada', 'pulldown', 'scott', 'landmine'];
// Exercícios que na prática exigem barra olímpica mesmo sem "barra" no nome
const BARBELL_IMPLIED = ['militar', 'levantamento terra', 'deadlift', 'good morning', 'arremesso', 'arranco', 'clean'];
const FREE_WEIGHTS = ['halter', 'serrote', 'kettlebell', 'anilha', 'elastico'];
const hasBarbell = (n) => (/\bbarra\b/.test(n) && !n.includes('barra fixa')) || BARBELL_IMPLIED.some((k) => n.includes(k));

const LOCATION_BLOCK = {
  gym: () => false,
  home_gym: (n) => hasBarbell(n) || GYM_EQUIPMENT.some((k) => n.includes(k)),
  bodyweight: (n) => hasBarbell(n) || [...GYM_EQUIPMENT, ...FREE_WEIGHTS].some((k) => n.includes(k))
};

const INJURY_BLOCK = {
  shoulder: ['desenvolvimento', 'militar', 'arnold', 'mergulho', 'paralelas', 'remada alta', 'push press', 'arranco'],
  lower_back: ['levantamento terra', 'terra ', 'stiff', 'good morning', 'bom dia', 'remada curvada', 'agachamento livre', 'agachamento com barra', 'arremesso'],
  knee: ['agachamento', 'afundo', 'avanco', 'passada', 'bulgaro', 'leg press', 'extensora', 'salto', 'pistol', 'sissy'],
  wrist_elbow: ['scott', 'testa', 'frances', 'skull', 'punho', 'supino fechado', 'mergulho'],
  hip: ['afundo', 'bulgaro', 'passada', 'sumo', 'abdutora', 'adutora', 'stiff', 'terra ']
};

const PRIORITY_GROUPS = {
  upper_chest: ['Peito'],
  back_vtaper: ['Costas'],
  glutes_hams: ['Glúteos', 'Posteriores'],
  arms: ['Bíceps', 'Tríceps'],
  shoulders: ['Ombros'],
  quads: ['Quadríceps']
};

const FOCUS_BY_PRIORITY = {
  upper_chest: 'arms_chest', arms: 'arms_chest', shoulders: 'arms_chest',
  back_vtaper: 'back_posture', glutes_hams: 'legs_glutes', quads: 'legs_glutes'
};

const GOAL_MAP = { hypertrophy: 'hypertrophy', fat_loss: 'fat_loss', strength: 'strength', conditioning: 'fat_loss' };
const DURATION_MAP = { 45: 'express', 60: 'standard', 75: 'high_volume' };
// Descanso máximo por meta (s): densidade maior para definição e condicionamento
const REST_CAP = { fat_loss: 75, conditioning: 60 };
const SPLIT_LABEL = { ppl: 'Push/Pull/Legs', upper_lower: 'Upper/Lower', full_body: 'Full Body', arnold: 'Arnold Split' };

function isBlocked(nameOrId, profile) {
  const n = ` ${norm(nameOrId)} `;
  if (LOCATION_BLOCK[profile.trainingLocation]?.(n)) return true;
  return profile.injuries.some((inj) => (INJURY_BLOCK[inj] || []).some((k) => n.includes(k)));
}

function toPlanExercise(ex100, template) {
  return {
    id: ex100.slug,
    name: ex100.nome,
    target: `${ex100.grupo} (${ex100.mecanica})`,
    equipment: ex100.mecanica,
    executionSteps: ['Posicione-se com alinhamento articular e estabilidade.', 'Fase excêntrica controlada em 2 a 3 segundos.', 'Concêntrica com aceleração e contração no pico.'],
    postureCheckpoints: ['Coluna neutra e abdômen ativado.', 'Controle articular completo, sem impulsos.'],
    suggestedReps: template.suggestedReps,
    defaultSets: template.defaultSets,
    restTime: template.restTime,
    suggestedWeight: template.suggestedWeight,
    substitutedFrom: template.name
  };
}

function adaptExercise(ex, profile, usedIds) {
  const meta = findExerciseIn100(ex.id);
  if (!isBlocked(`${ex.id} ${ex.name} ${ex.equipment || ''}`, profile)) return { ...ex, _group: meta?.grupo };
  const candidates = EXERCISES_100.filter(
    (c) => c.grupo === meta?.grupo && !usedIds.has(c.slug) && !usedIds.has(norm(c.nome)) && !isBlocked(`${c.slug} ${c.nome}`, profile)
  );
  const pick = candidates.find((c) => c.mecanica === meta?.mecanica) || candidates[0];
  return pick ? { ...toPlanExercise(pick, ex), _group: pick.grupo } : null;
}

/**
 * @param {import('../components/onboarding/profileSchema').FitnessProfile} profile
 * @returns {{ plan: Array, notes: string[], appliedSplit: string }}
 */
export function buildPlanFromProfile(profile) {
  const notes = [];
  const defaultSplit = SPLIT_BY_DAYS[profile.daysPerWeek];
  const appliedSplit =
    profile.splitPreference === 'arnold' && profile.daysPerWeek === 6
      ? 'arnold'
      : defaultSplit;

  const rawPlan = generatePersonalizedWorkoutPlan({
    goal: GOAL_MAP[profile.primaryGoal] || 'hypertrophy',
    experience: profile.experienceLevel || 'beginner',
    frequencyDays: profile.daysPerWeek,
    focusMuscle: FOCUS_BY_PRIORITY[profile.priorityMuscles?.[0]] || 'balanced',
    duration: DURATION_MAP[profile.sessionMinutes] || 'standard',
    splitPreference: appliedSplit
  });

  if (profile.splitPreference !== 'auto' && profile.splitPreference !== appliedSplit) {
    notes.push(`Com ${profile.daysPerWeek} dias por semana, ${SPLIT_LABEL[appliedSplit]} distribui melhor o volume do que ${SPLIT_LABEL[profile.splitPreference]}, por isso usei-o.`);
  }

  // Se o utilizador personalizou os dias de treino, remapeamos as sessões ativas para esses dias
  const activeSessions = rawPlan.filter((d) => !d.isRestDay && Array.isArray(d.exercises) && d.exercises.length > 0);
  const targetIndices =
    Array.isArray(profile.trainingDays) && profile.trainingDays.length === profile.daysPerWeek
      ? [...profile.trainingDays].sort((a, b) => a - b)
      : (TRAINING_DAYS[profile.daysPerWeek] || [0, 2, 4]);

  const restDayTemplates = [
    {
      title: 'Recuperação Ativa & Mobilidade',
      focus: 'Regeneração Muscular & Descanso',
      duration: '20 min',
      intensity: 'Baixa',
      badge: 'Regeneração',
      color: 'from-emerald-400 to-teal-500',
      description: 'O músculo cresce durante o descanso. Hidrate-se e faça uma caminhada leve.'
    },
    {
      title: 'Descanso e Síntese Proteica',
      focus: 'Recuperação Neuromuscular',
      duration: '20 min',
      intensity: 'Baixa',
      badge: 'Descanso',
      color: 'from-emerald-400 to-teal-500',
      description: 'Priorize sono de qualidade e ingestão proteica para reconstrução muscular.'
    },
    {
      title: 'Regeneração & Preparação',
      focus: 'Mobilidade Articular',
      duration: '15 min',
      intensity: 'Baixa',
      badge: 'Mobilidade',
      color: 'from-teal-400 to-emerald-500',
      description: 'Alongamento suave e descanso mental para a próxima sessão.'
    }
  ];

  let restCount = 0;
  const remappedPlan = WEEK_DAYS.map((w, idx) => {
    const isTraining = targetIndices.includes(idx);
    if (isTraining) {
      const sessionIdx = targetIndices.indexOf(idx);
      const session = activeSessions[sessionIdx] || activeSessions[0] || rawPlan[idx];
      return {
        ...session,
        dayId: w.dayId,
        name: w.name,
        shortName: w.short,
        isRestDay: false
      };
    }
    const tpl = restDayTemplates[restCount % restDayTemplates.length];
    restCount += 1;
    return {
      dayId: w.dayId,
      name: w.name,
      shortName: w.short,
      title: tpl.title,
      focus: tpl.focus,
      duration: tpl.duration,
      intensity: tpl.intensity,
      badge: tpl.badge,
      color: tpl.color,
      description: tpl.description,
      isRestDay: true,
      exercises: []
    };
  });

  const priorityGroups = new Set((profile.priorityMuscles || []).flatMap((m) => PRIORITY_GROUPS[m] || []));
  let swapped = 0;
  let removed = 0;

  const adapted = remappedPlan.map((day) => {
    if (!Array.isArray(day.exercises) || day.exercises.length === 0) return day;
    const usedIds = new Set(day.exercises.flatMap((e) => [e.id, norm(e.name)]));
    const exercises = day.exercises
      .map((ex) => {
        const out = adaptExercise(ex, profile, usedIds);
        if (!out) removed += 1;
        else if (out.substitutedFrom) {
          swapped += 1;
          usedIds.add(out.id);
          usedIds.add(norm(out.name));
        }
        return out;
      })
      .filter(Boolean)
      .map(({ _group, ...ex }) => {
        const next = { ...ex };
        if (priorityGroups.has(_group)) next.defaultSets = Math.min(5, (Number(ex.defaultSets) || 3) + 1);
        const restCap = REST_CAP[profile.primaryGoal];
        if (restCap) next.restTime = Math.min(Number(next.restTime) || restCap, restCap);
        if (profile.primaryGoal === 'conditioning') next.suggestedReps = '12-15';
        if (profile.sessionMinutes === 45) next.defaultSets = Math.min(Number(next.defaultSets) || 3, 3);
        return next;
      });
    return { ...day, exercises, badge: profile.primaryGoal === 'conditioning' ? 'Condicionamento & Resistência' : day.badge };
  });

  if (swapped) notes.push(`Troquei ${swapped} exercício${swapped > 1 ? 's' : ''} por alternativas seguras para o teu equipamento e articulações.`);
  if (removed) notes.push(removed > 1 ? `${removed} exercícios sem alternativa segura ficaram de fora.` : '1 exercício sem alternativa segura ficou de fora.');
  if (priorityGroups.size && profile.sessionMinutes !== 45) notes.push('Acrescentei uma série nos músculos prioritários.');

  return { plan: adapted, notes, appliedSplit };
}

/** Formato antigo do perfil (ab_fitness_user_profile_v1), lido pelo AB Coach e pelo dashboard. */
export function toLegacyProfile(profile) {
  return {
    goal: GOAL_MAP[profile.primaryGoal] || 'hypertrophy',
    experience: profile.experienceLevel,
    frequencyDays: profile.daysPerWeek,
    trainingDays: profile.trainingDays,
    focusMuscle: FOCUS_BY_PRIORITY[profile.priorityMuscles?.[0]] || 'balanced',
    createdAt: new Date().toISOString(),
    fitnessProfile: profile
  };
}
