import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanFromProfile, toLegacyProfile } from './planFromProfile.js';
import { formatTrainingDays } from '../components/onboarding/profileSchema.js';

describe('Plano a partir do perfil Onboarding (planFromProfile)', () => {
  const baseProfile = {
    primaryGoal: 'hypertrophy',
    experienceLevel: 'intermediate',
    trainingLocation: 'gym',
    daysPerWeek: 4,
    trainingDays: null,
    sessionMinutes: 60,
    splitPreference: 'auto',
    injuries: [],
    priorityMuscles: []
  };

  it('formata os dias da semana ordenados com formatTrainingDays', () => {
    assert.equal(formatTrainingDays([0, 2, 4]), 'Seg · Qua · Sex');
    assert.equal(formatTrainingDays([6, 1, 3, 5]), 'Ter · Qui · Sáb · Dom');
    assert.equal(formatTrainingDays([]), '');
    assert.equal(formatTrainingDays(null), '');
  });

  it('distribui o plano pelos dias predefinidos quando trainingDays não é indicado', () => {
    const { plan } = buildPlanFromProfile(baseProfile);
    assert.equal(plan.length, 7);

    // 4 dias predefinidos: Seg(0), Ter(1), Qui(3), Sex(4)
    assert.equal(plan[0].isRestDay, false, 'Segunda deve ser treino');
    assert.equal(plan[0].dayId, 1);
    assert.equal(plan[1].isRestDay, false, 'Terça deve ser treino');
    assert.equal(plan[1].dayId, 2);
    assert.equal(plan[2].isRestDay, true, 'Quarta deve ser descanso');
    assert.equal(plan[2].dayId, 3);
    assert.equal(plan[3].isRestDay, false, 'Quinta deve ser treino');
    assert.equal(plan[3].dayId, 4);
    assert.equal(plan[4].isRestDay, false, 'Sexta deve ser treino');
    assert.equal(plan[4].dayId, 5);
    assert.equal(plan[5].isRestDay, true, 'Sábado deve ser descanso');
    assert.equal(plan[5].dayId, 6);
    assert.equal(plan[6].isRestDay, true, 'Domingo deve ser descanso');
    assert.equal(plan[6].dayId, 0);

    const activeDays = plan.filter((d) => !d.isRestDay);
    assert.equal(activeDays.length, 4);
  });

  it('distribui o plano com precisão nos dias customizados pelo utilizador', () => {
    // Exemplo do amigo: quer treinar Terça, Quinta, Sábado e Domingo
    const customDays = [1, 3, 5, 6];
    const profile = {
      ...baseProfile,
      daysPerWeek: 4,
      trainingDays: customDays
    };

    const { plan } = buildPlanFromProfile(profile);
    assert.equal(plan.length, 7);

    // Segunda (idx 0, dayId 1) = Descanso
    assert.equal(plan[0].isRestDay, true);
    assert.equal(plan[0].exercises.length, 0);
    assert.equal(plan[0].dayId, 1);

    // Terça (idx 1, dayId 2) = Treino Ativo 1
    assert.equal(plan[1].isRestDay, false);
    assert.ok(plan[1].exercises.length > 0);
    assert.equal(plan[1].dayId, 2);

    // Quarta (idx 2, dayId 3) = Descanso
    assert.equal(plan[2].isRestDay, true);
    assert.equal(plan[2].exercises.length, 0);
    assert.equal(plan[2].dayId, 3);

    // Quinta (idx 3, dayId 4) = Treino Ativo 2
    assert.equal(plan[3].isRestDay, false);
    assert.ok(plan[3].exercises.length > 0);
    assert.equal(plan[3].dayId, 4);

    // Sexta (idx 4, dayId 5) = Descanso
    assert.equal(plan[4].isRestDay, true);
    assert.equal(plan[4].exercises.length, 0);
    assert.equal(plan[4].dayId, 5);

    // Sábado (idx 5, dayId 6) = Treino Ativo 3
    assert.equal(plan[5].isRestDay, false);
    assert.ok(plan[5].exercises.length > 0);
    assert.equal(plan[5].dayId, 6);

    // Domingo (idx 6, dayId 0) = Treino Ativo 4
    assert.equal(plan[6].isRestDay, false);
    assert.ok(plan[6].exercises.length > 0);
    assert.equal(plan[6].dayId, 0);

    const activeDays = plan.filter((d) => !d.isRestDay);
    assert.equal(activeDays.length, 4);
  });

  it('toLegacyProfile inclui trainingDays', () => {
    const legacy = toLegacyProfile({ ...baseProfile, trainingDays: [0, 2, 4] });
    assert.deepEqual(legacy.trainingDays, [0, 2, 4]);
    assert.equal(legacy.frequencyDays, 4);
  });
});

