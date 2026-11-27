import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prescribe, getExerciseMeta, planVolume, rirFloor, incrementFor } from './index.js';
import { buildPlanFromProfile, generateMesocyclePlan } from '../data/planFromProfile.js';

const BASE = { gender: 'male', age: 28, weightKg: 78, heightCm: 178, splitPreference: 'auto', hasSport: false, sports: [], sportDays: [], injuries: [], priorityMuscles: [] };
const profile = (over) => ({ ...BASE, experienceLevel: 'intermediate', primaryGoal: 'hypertrophy', daysPerWeek: 4, trainingLocation: 'gym', sessionMinutes: 60, ...over });
const totalSets = (plan) => plan.reduce((a, d) => a + (d.exercises || []).reduce((b, e) => b + e.defaultSets, 0), 0);

describe('prescrição', () => {
  it('força usa reps baixas nos compostos pesados e hipertrofia não', () => {
    const squat = getExerciseMeta('agachamento-livre');
    assert.deepEqual(prescribe(squat, { goal: 'strength' }).repRange, [5, 8]);
    assert.deepEqual(prescribe(squat, { goal: 'hypertrophy' }).repRange, [6, 10]);
    assert.ok(prescribe(squat, { goal: 'strength' }).restTime >= 150);
  });

  it('RIR: iniciante nunca abaixo de 2, compostos nunca a 0, isoladores podem ir a 0', () => {
    assert.equal(rirFloor('heavy', 'beginner'), 2);
    assert.equal(rirFloor('heavy', 'advanced'), 1);
    assert.equal(rirFloor('isolation', 'advanced'), 0);
  });

  it('incremento relativo por tipo de carga; peso corporal progride por reps', () => {
    assert.deepEqual(incrementFor('barbell'), { step: 2.5, pct: 0.025 });
    assert.equal(incrementFor('bodyweight').step, 0);
  });
});

describe('plano do perfil', () => {
  it('nível muda o plano (antes iniciante e avançado recebiam o mesmo)', () => {
    const beginner = buildPlanFromProfile(profile({ experienceLevel: 'beginner' })).plan;
    const advanced = buildPlanFromProfile(profile({ experienceLevel: 'advanced', sessionMinutes: 75 })).plan;
    assert.ok(totalSets(advanced) > totalSets(beginner));
  });

  it('objetivo muda as reps (antes força recebia 8-12)', () => {
    const day = (goal) => buildPlanFromProfile(profile({ primaryGoal: goal })).plan.find((d) => !d.isRestDay);
    assert.equal(day('strength').exercises[0].suggestedReps, '5-8');
    assert.equal(day('hypertrophy').exercises[0].suggestedReps, '6-10');
  });

  it('Upper/Lower treina quadríceps e posteriores 2x e respeita o teto por sessão', () => {
    const { plan } = buildPlanFromProfile(profile());
    const v = planVolume(plan);
    assert.ok(v.frequency.quads >= 2);
    assert.ok(v.frequency.hamstrings >= 2);
    for (const d of v.direct) for (const sets of Object.values(d)) assert.ok(sets <= 8);
  });

  it('cada exercício leva faixa de reps, RIR alvo e incremento para a progressão', () => {
    const { plan } = buildPlanFromProfile(profile());
    for (const ex of plan.flatMap((d) => d.exercises || [])) {
      assert.ok(typeof ex.targetRir === 'number', ex.id);
      assert.ok(ex.progressionIncrement, ex.id);
      if (ex.repClass !== 'timed') assert.equal(ex.repRange.length, 2, ex.id);
      assert.equal(ex.suggestedWeight, undefined, `${ex.id} não deve ter carga inventada`);
    }
  });

  it('mesociclo: compostos nunca com RIR alvo 0', () => {
    const meso = generateMesocyclePlan(profile({ experienceLevel: 'advanced' }), 5);
    for (const week of meso.weeks.filter((w) => !w.isDeload)) {
      for (const ex of week.plan.flatMap((d) => d.exercises || [])) {
        if (ex.repClass === 'heavy' || ex.repClass === 'compound') assert.ok(ex.targetRir >= 1, `${ex.id} semana ${week.weekNumber}`);
      }
    }
  });
});

describe('validador em todos os perfis', () => {
  it('nenhum perfil gera erro (nível × objetivo × dias 2-6 × local × duração × lesão × prioritários)', () => {
    const failures = [];
    for (const experienceLevel of ['beginner', 'intermediate', 'advanced'])
      for (const primaryGoal of ['hypertrophy', 'strength', 'fat_loss', 'conditioning'])
        for (const daysPerWeek of [2, 3, 4, 5, 6])
          for (const trainingLocation of ['gym', 'home_gym', 'bodyweight'])
            for (const sessionMinutes of [45, 60, 75])
              for (const injuries of [[], ['knee'], ['shoulder'], ['lower_back'], ['hip']])
                for (const priorityMuscles of [[], ['glutes_hams', 'arms']]) {
                  const p = profile({ experienceLevel, primaryGoal, daysPerWeek, trainingLocation, sessionMinutes, injuries, priorityMuscles });
                  const errors = buildPlanFromProfile(p).validation.filter((i) => i.severity === 'error');
                  if (errors.length) failures.push(`${experienceLevel} ${primaryGoal} ${daysPerWeek}d ${trainingLocation} ${sessionMinutes}m [${injuries}] [${priorityMuscles}]: ${errors.map((e) => e.message).join(' | ')}`);
                }
    assert.equal(failures.length, 0, failures.slice(0, 10).join('\n'));
  });

  it('Arnold e atletas com desporto também passam', () => {
    const failures = [];
    for (const experienceLevel of ['beginner', 'intermediate', 'advanced'])
      for (const sessionMinutes of [45, 60, 75]) {
        const variants = [
          profile({ experienceLevel, sessionMinutes, daysPerWeek: 6, splitPreference: 'arnold' }),
          profile({ experienceLevel, sessionMinutes, daysPerWeek: 4, hasSport: true, sports: ['futebol_futsal'], sportDays: [2, 5], sportIntensity: 'competitive' }),
          profile({ experienceLevel, sessionMinutes, daysPerWeek: 5, hasSport: true, sports: ['corrida'], sportDays: [1, 3, 6], sportIntensity: 'moderate' })
        ];
        for (const p of variants) {
          const errors = buildPlanFromProfile(p).validation.filter((i) => i.severity === 'error');
          if (errors.length) failures.push(`${experienceLevel} ${sessionMinutes}m ${p.splitPreference} ${p.sports}: ${errors.map((e) => e.message).join(' | ')}`);
        }
      }
    assert.equal(failures.length, 0, failures.join('\n'));
  });
});

describe('inventário de equipamento e 2 dias', () => {
  it('2 dias: cobre os 6 padrões e cada músculo grande 2x', () => {
    const { plan, validation } = buildPlanFromProfile(profile({ daysPerWeek: 2, sessionMinutes: 75 }));
    assert.equal(plan.filter((d) => d.exercises?.length).length, 2);
    assert.equal(validation.filter((i) => i.code === 'PATTERN_GAP').length, 0);
    const v = planVolume(plan);
    for (const m of ['chest', 'back', 'quads', 'hamstrings']) assert.equal(v.frequency[m], 2, m);
  });

  it('só usa o equipamento que o utilizador tem em casa', () => {
    const { plan } = buildPlanFromProfile(profile({ trainingLocation: 'home_gym', equipment: ['dumbbell', 'bands'] }));
    for (const ex of plan.flatMap((d) => d.exercises || [])) {
      const items = getExerciseMeta(ex).equipment;
      assert.ok(items.every((i) => ['dumbbell', 'bands'].includes(i)), `${ex.id}: ${items}`);
    }
  });

  it('lesão no ombro troca o desenvolvimento por um equivalente sem contraindicação', () => {
    const { plan } = buildPlanFromProfile(profile({ injuries: ['shoulder'] }));
    for (const ex of plan.flatMap((d) => d.exercises || [])) assert.notEqual(getExerciseMeta(ex).contra.shoulder, 'avoid', ex.id);
  });
});
