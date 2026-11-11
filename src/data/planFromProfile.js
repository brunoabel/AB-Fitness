/**
 * Converte o perfil do Onboarding do AB Coach num plano semanal.
 * Usa o gerador científico existente e depois adapta: local de treino, lesões, músculos prioritários e condicionamento.
 */
import { generatePersonalizedWorkoutPlan } from './workoutGenerator.js';
import { EXERCISES_100, findExerciseIn100 } from './exercises100.js';
import { SPLIT_BY_DAYS, TRAINING_DAYS, WEEK_DAYS, HIGH_IMPACT_LEG_SPORTS, SPORT_PREVENTION_REGIONS } from '../components/onboarding/profileSchema.js';
import { DRILLS, REGION_PLANS } from './recoveryProtocols.js';

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

// Motor biomecânico do atleta híbrido: protege a cadeia inferior nos dias de desporto de alto impacto.
const LEG_GROUPS = new Set(['Quadríceps', 'Posteriores', 'Glúteos']);
const UPPER_GROUPS = new Set(['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps']);
// Exercícios de alta fadiga lombar/SNC a remover em dias de sessão dupla (ginásio + desporto no mesmo dia)
const HIGH_CNS_LUMBAR = ['levantamento terra', 'terra ', 'stiff', 'good morning', 'bom dia', 'arremesso', 'arranco', 'clean'];

function groupShareOf(day, groups) {
  if (!Array.isArray(day.exercises) || day.exercises.length === 0) return 0;
  const hits = day.exercises.filter((ex) => groups.has(findExerciseIn100(ex.id)?.grupo)).length;
  return hits / day.exercises.length;
}

/** Devolve quantos dias (1–7) faltam, a partir de `from`, até ao próximo dia de desporto. */
function daysUntilNextSport(from, sportDaySet) {
  for (let d = 1; d <= 7; d += 1) {
    if (sportDaySet.has((from + d) % 7)) return d;
  }
  return 7;
}

/**
 * Regra anti-fadiga de membros inferiores: em desportos de alto impacto (Futebol, Corrida, Padel, Basquete)
 * com intensidade Moderate/Competitive, proíbe pernas pesadas na véspera e no dia do desporto, e tenta
 * mover esse treino para um dia com pelo menos 48h de recuperação até à próxima partida.
 */
function applyLegFatigueProtection(remappedPlan, profile, notes) {
  const sportDaySet = new Set(profile.sportDays || []);
  const highImpact = (profile.sports || []).some((s) => HIGH_IMPACT_LEG_SPORTS.includes(s));
  const risky = profile.sportIntensity === 'moderate' || profile.sportIntensity === 'competitive';
  if (!sportDaySet.size || !highImpact || !risky) return remappedPlan;

  const blocked = new Set();
  sportDaySet.forEach((s) => {
    blocked.add(s);
    blocked.add((s + 6) % 7); // véspera
  });

  const dayStats = remappedPlan.map((day, idx) => ({
    idx,
    isTraining: !day.isRestDay && Array.isArray(day.exercises) && day.exercises.length > 0,
    isLegHeavy: groupShareOf(day, LEG_GROUPS) >= 0.5,
    isUpperHeavy: groupShareOf(day, UPPER_GROUPS) >= 0.5
  }));

  let swapped = 0;
  let capped = 0;
  blocked.forEach((b) => {
    const stat = dayStats[b];
    if (!stat.isTraining || !stat.isLegHeavy) return;

    const candidates = dayStats.filter((c) => c.isTraining && !blocked.has(c.idx) && !c.isLegHeavy && daysUntilNextSport(c.idx, sportDaySet) >= 2);
    const target = candidates.find((c) => c.isUpperHeavy) || candidates[0];

    if (target) {
      const a = remappedPlan[b];
      const t = remappedPlan[target.idx];
      const keys = ['title', 'focus', 'duration', 'intensity', 'badge', 'color', 'description', 'exercises'];
      const aCopy = {};
      const tCopy = {};
      keys.forEach((k) => {
        aCopy[k] = a[k];
        tCopy[k] = t[k];
      });
      keys.forEach((k) => {
        remappedPlan[b][k] = tCopy[k];
        remappedPlan[target.idx][k] = aCopy[k];
      });
      stat.isLegHeavy = false;
      target.isLegHeavy = true;
      swapped += 1;
    } else {
      remappedPlan[b].exercises = remappedPlan[b].exercises.map((ex) => {
        if (!LEG_GROUPS.has(findExerciseIn100(ex.id)?.grupo)) return ex;
        return { ...ex, defaultSets: Math.max(2, (Number(ex.defaultSets) || 3) - 1) };
      });
      capped += 1;
    }
  });

  if (swapped) notes.push(`Movi ${swapped} treino${swapped > 1 ? 's' : ''} de pernas para longe do desporto, com pelo menos 48h de recuperação até à próxima partida.`);
  if (capped) notes.push('Reduzi o volume de pernas nos dias sem alternativa segura de troca, perto do teu desporto.');
  return remappedPlan;
}

/** Sessão dupla (ginásio + desporto no mesmo dia): corta ~25% do volume acessório e remove exercícios de alta fadiga lombar/SNC. */
function applyDoubleSessionLoad(exercises, profile, dayIdx) {
  const sportDaySet = new Set(profile.sportDays || []);
  if (!sportDaySet.has(dayIdx)) return { exercises, touched: false };

  let removed = 0;
  let reduced = 0;
  const next = exercises
    .filter((ex) => {
      const n = ` ${norm(`${ex.id} ${ex.name}`)} `;
      const block = HIGH_CNS_LUMBAR.some((k) => n.includes(k));
      if (block) removed += 1;
      return !block;
    })
    .map((ex) => {
      const meta = findExerciseIn100(ex.id);
      if (meta?.mecanica !== 'Isolado') return ex;
      const sets = Number(ex.defaultSets) || 3;
      const cut = Math.max(2, Math.round(sets * 0.75));
      if (cut < sets) reduced += 1;
      return { ...ex, defaultSets: cut };
    });

  return { exercises: next, touched: removed > 0 || reduced > 0 };
}

/** Injeta a rotina de mobilidade/prevenção (src/data/recoveryProtocols.js) específica do desporto nos dias em que é praticado. */
function sportPreventionDrills(profile) {
  const regions = [...new Set((profile.sports || []).flatMap((s) => SPORT_PREVENTION_REGIONS[s] || []))];
  const ids = [...new Set(regions.flatMap((r) => REGION_PLANS[r]?.prevent || []))];
  return ids.slice(0, 4).map((id) => ({ id, ...DRILLS[id] }));
}

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

  applyLegFatigueProtection(remappedPlan, profile, notes);

  const priorityGroups = new Set((profile.priorityMuscles || []).flatMap((m) => PRIORITY_GROUPS[m] || []));
  let swapped = 0;
  let removed = 0;
  let doubleSession = false;

  const adapted = remappedPlan.map((day, dayIdx) => {
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

    const doubled = applyDoubleSessionLoad(exercises, profile, dayIdx);
    if (doubled.touched) doubleSession = true;

    return { ...day, exercises: doubled.exercises, badge: profile.primaryGoal === 'conditioning' ? 'Condicionamento & Resistência' : day.badge };
  });

  const sportDrills = profile.hasSport ? sportPreventionDrills(profile) : [];
  if (sportDrills.length) {
    const sportDaySet = new Set(profile.sportDays || []);
    adapted.forEach((day, idx) => {
      if (sportDaySet.has(idx)) day.sportPrevention = sportDrills;
    });
  }

  if (swapped) notes.push(`Troquei ${swapped} exercício${swapped > 1 ? 's' : ''} por alternativas seguras para o teu equipamento e articulações.`);
  if (removed) notes.push(removed > 1 ? `${removed} exercícios sem alternativa segura ficaram de fora.` : '1 exercício sem alternativa segura ficou de fora.');
  if (priorityGroups.size && profile.sessionMinutes !== 45) notes.push('Acrescentei uma série nos músculos prioritários.');
  if (doubleSession) notes.push('Nos dias de sessão dupla, reduzi o volume acessório e removi exercícios de alta fadiga lombar.');
  if (sportDrills.length) notes.push('Adicionei mobilidade e prevenção específicas para a tua modalidade nos dias de desporto.');

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
