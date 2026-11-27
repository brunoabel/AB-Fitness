/**
 * Converte o perfil do Onboarding do AB Coach num plano semanal.
 * Os modelos de plano dão os slots (padrão de movimento + músculo + exercício-semente); o motor (src/engine/) escolhe
 * o exercício de cada slot para o equipamento, lesões e nível do utilizador, ajusta séries e valida o resultado.
 */
import { generatePersonalizedWorkoutPlan } from './workoutGenerator.js';
import { findExerciseIn100 } from './exercises100.js';
import { SPLIT_BY_DAYS, TRAINING_DAYS, WEEK_DAYS, HIGH_IMPACT_LEG_SPORTS, SPORT_PREVENTION_REGIONS } from '../components/onboarding/profileSchema.js';
import { DRILLS, REGION_PLANS } from './recoveryProtocols.js';
import { mesoWeekParams, mesoSetCount } from '../utils/mesocycleWeek.js';
import { getExerciseMeta, prescribe, buildContext, balancePlan, validatePlan, MUSCLE_LABEL } from '../engine/index.js';
import { slotFromExercise, candidatesFor, suggestForMuscle, inventoryFor } from '../engine/slots.js';
import { runningLoad, concurrentAdjustments } from '../engine/concurrent.js';


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
const SPLIT_LABEL = { ppl: 'Push/Pull/Legs', upper_lower: 'Upper/Lower', full_body: 'Full Body', arnold: 'Arnold Split' };

// Motor biomecânico do atleta híbrido: protege a cadeia inferior nos dias de desporto de alto impacto.
const LEG_GROUPS = new Set(['Quadríceps', 'Posteriores', 'Glúteos']);
const UPPER_GROUPS = new Set(['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps']);
/** Alta fadiga lombar/SNC (carga axial alta ou levantamentos de potência): sai nos dias de sessão dupla. */
const isHighCnsLumbar = (ex) => {
  const meta = getExerciseMeta(ex);
  return Boolean(meta && (meta.axial >= 4 || meta.pattern === 'power' || meta.pattern === 'hip_hinge'));
};

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

/** Dias de desporto de alto impacto (Moderate/Competitive) em que as pernas pesadas são proibidas: o próprio dia e a véspera. */
function sportLegRisk(profile) {
  const blocked = new Set();
  const eventDays = new Set();
  const highImpact = (profile.sports || []).some((s) => HIGH_IMPACT_LEG_SPORTS.includes(s));
  const risky = profile.sportIntensity === 'moderate' || profile.sportIntensity === 'competitive';
  if (!highImpact || !risky) return { blocked, eventDays };
  (profile.sportDays || []).forEach((s) => {
    blocked.add(s);
    blocked.add((s + 6) % 7); // véspera
    eventDays.add(s);
  });
  return { blocked, eventDays };
}

/**
 * Regra anti-fadiga de membros inferiores: proíbe pernas pesadas nos dias bloqueados (desporto de impacto e
 * corridas de qualidade/longas) e tenta mover esse treino para um dia com pelo menos 48h até ao próximo evento.
 */
function applyLegFatigueProtection(remappedPlan, blocked, sportDaySet, notes, where = 'do desporto') {
  if (!blocked.size) return remappedPlan;

  const dayStats = remappedPlan.map((day, idx) => {
    const legShare = groupShareOf(day, LEG_GROUPS);
    return {
      idx,
      isTraining: !day.isRestDay && Array.isArray(day.exercises) && day.exercises.length > 0,
      legShare,
      isLegHeavy: legShare >= 0.5,
      isUpperHeavy: groupShareOf(day, UPPER_GROUPS) >= 0.5
    };
  });

  let swapped = 0;
  let capped = 0;
  blocked.forEach((b) => {
    const stat = dayStats[b];
    if (!stat.isTraining) return;

    // Splits Full Body (legShare entre 0.2 e 0.5): não troca o dia inteiro, mas protege o volume de pernas
    if (!stat.isLegHeavy) {
      if (stat.legShare >= 0.2) {
        remappedPlan[b].exercises = remappedPlan[b].exercises.map((ex) => {
          if (!LEG_GROUPS.has(findExerciseIn100(ex.id)?.grupo)) return ex;
          return { ...ex, defaultSets: Math.max(2, (Number(ex.defaultSets) || 3) - 1) };
        });
        capped += 1;
      }
      return;
    }

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

  if (swapped) notes.push(`Movi ${swapped} treino${swapped > 1 ? 's' : ''} de pernas para longe ${where}, com pelo menos 48h de recuperação.`);
  if (capped) notes.push(`Reduzi o volume de pernas nos dias perto ${where} sem alternativa segura de troca.`);
  return remappedPlan;
}

/**
 * Sessão dupla (ginásio + desporto no mesmo dia): corta ~25% do volume acessório, remove exercícios
 * de alta fadiga lombar/SNC e adapta o volume de pernas consoante `profile.sessionOrder`
 * (`gym_first` preserva pernas para o desporto seguinte; `sport_first` reduz compostos de pernas fadigadas).
 */
function applyDoubleSessionLoad(exercises, profile, dayIdx) {
  const sportDaySet = new Set(profile.sportDays || []);
  if (!sportDaySet.has(dayIdx)) return { exercises, touched: false };

  const order = profile.sessionOrder || 'split_hours';
  let removed = 0;
  let reduced = 0;
  const next = exercises
    .filter((ex) => {
      const block = isHighCnsLumbar(ex);
      if (block) removed += 1;
      return !block;
    })
    .map((ex) => {
      const meta = findExerciseIn100(ex.id);
      const isLeg = LEG_GROUPS.has(meta?.grupo);
      const sets = Number(ex.defaultSets) || 3;

      if (order === 'sport_first' && isLeg) {
        const cut = Math.max(2, sets - 1);
        if (cut < sets) reduced += 1;
        return { ...ex, defaultSets: cut };
      }
      if (order === 'gym_first' && isLeg) {
        const cut = Math.max(2, sets - 1);
        if (cut < sets) reduced += 1;
        return { ...ex, defaultSets: cut };
      }
      if (meta?.mecanica !== 'Isolado') return ex;
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
    substitutedFrom: template.name
  };
}

/** Contexto do utilizador para a escolha de exercícios: equipamento, lesões, nível, objetivo e preferências. */
function selectionContext(profile, preferences = null) {
  return {
    inventory: inventoryFor(profile.trainingLocation, profile.equipment),
    injuries: profile.injuries || [],
    experience: profile.experienceLevel || 'beginner',
    goal: profile.primaryGoal || 'hypertrophy',
    favorite: new Set(preferences?.favorite || []),
    avoid: new Set(preferences?.avoid || [])
  };
}

/**
 * Escolhe o exercício de cada slot da sessão. Mantém a semente quando serve; senão, o melhor equivalente do slot.
 * Limita a carga axial: no máximo um exercício com carga axial 5 e soma até 8 por sessão.
 */
function fillSessionSlots(exercises, sel) {
  const used = new Set();
  let axialSum = 0;
  let heavyAxial = false;
  const out = [];
  let swapped = 0;
  let removed = 0;
  for (const ex of exercises) {
    const slot = slotFromExercise(ex);
    if (!slot.pattern) {
      out.push(ex);
      continue;
    }
    slot.axialBudget = heavyAxial ? 4 : Math.min(5, 8 - axialSum);
    const pick = candidatesFor(slot, sel, used)[0];
    if (!pick) {
      removed += 1;
      continue;
    }
    used.add(pick.id);
    axialSum += pick.meta.axial;
    if (pick.meta.axial >= 5) heavyAxial = true;
    if (pick.id === slot.seed) out.push(ex);
    else {
      swapped += 1;
      out.push(toPlanExercise(findExerciseIn100(pick.id), ex));
    }
  }
  return { exercises: out, swapped, removed };
}

/** Reps, descanso, RIR e incremento pelo motor, com o objetivo real do perfil. As séries ficam para o balanceamento. */
function prescribeForProfile(ex, profile) {
  const meta = getExerciseMeta(ex);
  const p = prescribe(meta, {
    goal: profile.primaryGoal || 'hypertrophy',
    experience: profile.experienceLevel || 'beginner',
    timedReps: meta?.repClass === 'timed' ? ex.suggestedReps : undefined
  });
  return {
    ...ex,
    suggestedReps: p.reps,
    restTime: p.restTime,
    repRange: p.repRange,
    targetRir: p.targetRir,
    rirFloor: p.rirFloor,
    progressionIncrement: p.increment,
    repClass: p.repClass
  };
}

/** Dias em que o motor não pode somar séries: dias de desporto e, em desporto de impacto, as vésperas. */
function lockedDays(profile) {
  const out = new Set(profile.sportDays || []);
  const highImpact = (profile.sports || []).some((s) => HIGH_IMPACT_LEG_SPORTS.includes(s));
  const risky = profile.sportIntensity === 'moderate' || profile.sportIntensity === 'competitive';
  if (highImpact && risky) (profile.sportDays || []).forEach((d) => out.add((d + 6) % 7));
  return out;
}

/**
 * @param {import('../components/onboarding/profileSchema').FitnessProfile} profile
 * @param {{ runs?: Array<object>, preferences?: { favorite?: string[], avoid?: string[] }, calibration?: Record<string, { start?: number, cap?: number }>, now?: number }} [extras]
 *   runs: corridas registadas (treino concorrente); preferences: exercícios favoritos/a evitar;
 *   calibration: desvios individuais do orçamento de volume (src/engine/muscleVolume.js).
 * @returns {{ plan: Array, notes: string[], appliedSplit: string, validation: Array, running: object|null }}
 */
export function buildPlanFromProfile(profile, extras = {}) {
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

  const running = Array.isArray(extras.runs) && extras.runs.length ? runningLoad(extras.runs, extras.now) : null;
  const concurrent = concurrentAdjustments(running);
  const sport = sportLegRisk(profile);
  const blocked = new Set([...sport.blocked, ...concurrent.blocked]);
  const eventDays = new Set([...sport.eventDays, ...concurrent.eventDays]);
  const where = sport.blocked.size && concurrent.blocked.size
    ? 'do desporto e das corridas fortes'
    : concurrent.blocked.size ? 'das tuas corridas de qualidade e longas' : 'do desporto';
  applyLegFatigueProtection(remappedPlan, blocked, eventDays, notes, where);
  if (running?.highVolume) notes.push(`Com ${running.weeklyKm} km por semana de corrida, baixei 20% o volume semanal de quadríceps e posteriores.`);

  const priorityGroups = new Set((profile.priorityMuscles || []).flatMap((m) => PRIORITY_GROUPS[m] || []));
  const sel = selectionContext(profile, extras.preferences);
  let swapped = 0;
  let removed = 0;
  let doubleSession = false;

  const adapted = remappedPlan.map((day, dayIdx) => {
    if (!Array.isArray(day.exercises) || day.exercises.length === 0) return day;
    const filled = fillSessionSlots(day.exercises, sel);
    swapped += filled.swapped;
    removed += filled.removed;
    const exercises = filled.exercises.map((ex) => prescribeForProfile(ex, profile));

    const doubled = applyDoubleSessionLoad(exercises, profile, dayIdx);
    if (doubled.touched) doubleSession = true;

    return { ...day, exercises: doubled.exercises, badge: profile.primaryGoal === 'conditioning' ? 'Condicionamento & Resistência' : day.badge };
  });

  // Motor de volume: ajusta séries ao orçamento semanal, ao teto por sessão e à duração; depois valida
  const ctx = buildContext({
    experience: profile.experienceLevel || 'beginner',
    sessionMinutes: Number(profile.sessionMinutes) || 60,
    priorityMuscles: profile.priorityMuscles || [],
    noAddDays: lockedDays(profile),
    location: profile.trainingLocation || 'gym',
    injuries: profile.injuries || [],
    inventory: sel.inventory,
    budgetAdjust: { scale: concurrent.budgetScale, calibration: extras.calibration || {} },
    // Quando falta volume e já não há onde somar séries: acessório novo para o músculo
    suggest: (muscle, exclude) => {
      const id = suggestForMuscle(muscle, sel, exclude);
      if (!id) return null;
      const lib = findExerciseIn100(id);
      return lib ? { ...prescribeForProfile({ ...toPlanExercise(lib, { suggestedReps: lib.reps, restTime: lib.descanso_seg }), substitutedFrom: undefined }, profile), defaultSets: 2 } : null;
    }
  });
  const balanced = balancePlan(adapted, ctx);
  balanced.days.forEach((day, idx) => { adapted[idx] = day; });
  const validation = validatePlan(adapted, { ...ctx, insertions: balanced.insertions });
  if (balanced.removed.length) notes.push(`Para caber em ${ctx.sessionMinutes} min, tirei ${balanced.removed.join(', ')}.`);
  if (balanced.added.length) notes.push(`Acrescentei ${balanced.added.join(', ')} para chegar ao volume semanal mínimo.`);
  if (balanced.trimmed.length) notes.push(`Tirei ${balanced.trimmed.join(', ')} para o volume semanal não passar do recomendado para o teu nível.`);
  const timeBound = validation.filter((i) => i.code === 'VOL_LOW' && i.reason === 'time').map((i) => MUSCLE_LABEL[i.muscle]);
  if (timeBound.length) notes.push(`Com ${ctx.sessionMinutes} min por sessão não cabe o volume mínimo para ${timeBound.join(', ')}. Mais tempo ou mais dias de treino resolvem isto.`);

  const sportDrills = profile.hasSport ? sportPreventionDrills(profile) : [];
  if (sportDrills.length) {
    const sportDaySet = new Set(profile.sportDays || []);
    adapted.forEach((day, idx) => {
      if (sportDaySet.has(idx)) day.sportPrevention = sportDrills;
    });
  }

  if (swapped) notes.push(`Troquei ${swapped} exercício${swapped > 1 ? 's' : ''} por alternativas seguras para o teu equipamento e articulações.`);
  if (removed) notes.push(removed > 1 ? `${removed} exercícios sem alternativa segura ficaram de fora.` : '1 exercício sem alternativa segura ficou de fora.');
  if (priorityGroups.size) notes.push('Dei mais volume semanal aos músculos prioritários.');
  if (doubleSession) notes.push('Nos dias de sessão dupla, reduzi o volume acessório e removi exercícios de alta fadiga lombar.');
  if (sportDrills.length) notes.push('Adicionei mobilidade e prevenção específicas para a tua modalidade nos dias de desporto.');

  return { plan: adapted, notes, appliedSplit, validation, running };
}

/**
 * Gera um Mesociclo periodizado (4 a 6 semanas) com sobrecarga progressiva (volume/RIR)
 * nas semanas de acumulação e semana final de Deload automático (-40% séries, -10% carga).
 */
export function generateMesocyclePlan(profile = {}, weeks = 5, extras = {}) {
  const totalWeeks = Math.max(4, Math.min(6, Number(weeks) || 5));
  const base = buildPlanFromProfile(profile, extras);

  const mesocycleWeeks = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const params = mesoWeekParams(w, totalWeeks);
    const { isDeload, targetRir, loadMultiplier } = params;

    const weekSchedule = base.plan.map((day) => {
      if (day.isRestDay || !Array.isArray(day.exercises) || day.exercises.length === 0) {
        return { ...day, weekNumber: w, isDeload };
      }

      const exercises = day.exercises.map((ex, idx, arr) => {
        const sets = mesoSetCount(ex.defaultSets, idx, params);

        // Agrupa os 2 últimos exercícios acessórios em Bi-Set se sessão curta (45m) ou condicionamento
        const shouldSuperset =
          (profile.sessionMinutes === 45 || profile.primaryGoal === 'conditioning') &&
          arr.length >= 4 &&
          idx >= arr.length - 2;

        return {
          ...ex,
          defaultSets: sets,
          // RIR da semana com piso por exercício: compostos nunca a 0, iniciantes nunca abaixo de 2
          targetRir: isDeload ? targetRir : Math.max(Number(ex.rirFloor) || 0, targetRir),
          loadMultiplier,
          isDeload,
          supersetGroupId: ex.supersetGroupId || (shouldSuperset ? `bi-${day.dayId}` : null)
        };
      });

      return {
        ...day,
        weekNumber: w,
        isDeload,
        targetRir,
        loadMultiplier,
        badge: isDeload ? 'Semana de Deload (-40% Vol)' : `Semana ${w}/${totalWeeks} · RIR ${targetRir}`,
        exercises
      };
    });

    mesocycleWeeks.push({
      weekNumber: w,
      isDeload,
      targetRir,
      loadMultiplier,
      label: isDeload ? `Semana ${w} · Deload Regenerativo` : `Semana ${w} · Acumulação Progressiva`,
      plan: weekSchedule
    });
  }

  return {
    totalWeeks,
    appliedSplit: base.appliedSplit,
    notes: [
      ...base.notes,
      `Mesociclo de ${totalWeeks} semanas estruturado com progressão RIR 3→1 e Deload automático na semana ${totalWeeks}.`
    ],
    weeks: mesocycleWeeks,
    plan: mesocycleWeeks[0].plan
  };
}

export { toLegacyProfile } from '../components/onboarding/profileSchema.js';
