import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeMotor, allowedExerciseIds, applyEngine } from '../../supabase/functions/ab-coach/engine.ts';
import { getExerciseMeta } from './exerciseMeta.js';

const ctx = sanitizeMotor({ experience: 'beginner', goal: 'strength', location: 'home_gym', equipment: ['dumbbell', 'bench'], injuries: ['shoulder'] });
const treino = {
  nome: 'Peito', duracao_min: 40, exercicios: [
    { id: 'supino-reto-barra', nome: 'Supino Reto com Barra', series: 5, reps: '3-5', descanso_seg: 300 },
    { id: 'desenvolvimento-militar', nome: 'Desenvolvimento Militar', series: 4, reps: '8', descanso_seg: 90 },
    { id: 'crossover-polia-alta', nome: 'Crossover Polia Alta', series: 5, reps: '15', descanso_seg: 60 },
    { id: 'triceps-corda', nome: 'Tríceps Corda', series: 4, reps: '12', descanso_seg: 60 }
  ]
};

describe('motor da função ab-coach', () => {
  it('rejeita perfis inválidos e filtra listas', () => {
    assert.equal(sanitizeMotor({ experience: 'x' }), null);
    assert.deepEqual(ctx.equipment, ['dumbbell', 'bench']);
  });

  it('ids permitidos respeitam equipamento e lesões', () => {
    for (const id of allowedExerciseIds(ctx)) {
      const m = getExerciseMeta(id);
      assert.ok(m.equipment.every((i) => ctx.equipment.includes(i)), id);
      assert.notEqual(m.contra.shoulder, 'avoid', id);
    }
  });

  it('troca exercícios proibidos, prescreve pela tabela e cabe no tempo', () => {
    const { treino: out, ajustes } = applyEngine(treino, ctx);
    assert.ok(ajustes.length > 0);
    const allowed = new Set(allowedExerciseIds(ctx));
    for (const ex of out.exercicios) {
      assert.ok(allowed.has(ex.id), ex.id);
      assert.equal(typeof ex.rir_alvo, 'number');
      assert.ok(ex.rir_alvo >= 2, 'iniciante nunca abaixo de RIR 2');
      assert.ok(ex.series >= 2 && ex.series <= 5);
    }
    assert.ok(out.duracao_min <= 40);
  });
});
