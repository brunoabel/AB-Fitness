import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mesoWeekParams, mesoSetCount, applyMesoWeekToSets, applyMesoWeekToHint, mesoWeekLabel } from './mesocycleWeek.js';

const sets = (n, weight = 60) => Array.from({ length: n }, () => ({ weight, reps: 10, type: 'N', completed: false, done: false }));

describe('mesoWeekParams', () => {
  it('RIR 3, 2, 1, 0 nas semanas de acumulação e deload na última', () => {
    assert.deepEqual([1, 2, 3, 4].map((w) => mesoWeekParams(w).targetRir), [3, 2, 1, 0]);
    const deload = mesoWeekParams(5);
    assert.equal(deload.isDeload, true);
    assert.equal(deload.loadMultiplier, 0.9);
    assert.equal(mesoWeekParams(4).isPeakWeek, true);
  });

  it('limita a semana ao intervalo do ciclo', () => {
    assert.equal(mesoWeekParams(0).weekNumber, 1);
    assert.equal(mesoWeekParams(9).weekNumber, 5);
  });
});

describe('aplicação ao treino', () => {
  it('deload corta 40% das séries e põe a carga a 90%', () => {
    const out = applyMesoWeekToSets(sets(4, 62.5), 0, mesoWeekParams(5));
    assert.equal(out.length, 2);
    assert.equal(out[0].weight, 56.5);
  });

  it('semana de pico soma uma série aos 2 primeiros exercícios, sem mexer na carga', () => {
    const peak = mesoWeekParams(4);
    assert.equal(applyMesoWeekToSets(sets(3), 0, peak).length, 4);
    assert.equal(applyMesoWeekToSets(sets(3), 2, peak).length, 3);
    assert.equal(applyMesoWeekToSets(sets(3), 0, peak)[3].completed, false);
    assert.equal(mesoSetCount(5, 0, peak), 5);
  });

  it('exercício de tempo no deload só perde séries', () => {
    const timed = [{ weight: 0, reps: 45, seconds: 45 }, { weight: 0, reps: 45, seconds: 45 }, { weight: 0, reps: 45, seconds: 45 }];
    const out = applyMesoWeekToSets(timed, 0, mesoWeekParams(5), { isTimed: true });
    assert.equal(out.length, 2);
    assert.equal(out[0].seconds, 45);
  });

  it('sem semana ativa devolve as séries intactas', () => {
    const base = sets(3);
    assert.equal(applyMesoWeekToSets(base, 0, null), base);
  });
});

describe('applyMesoWeekToHint', () => {
  const hint = { type: 'OVERLOAD', suggestedWeight: 62.5, suggestedReps: 8, badge: 'SUBIR +2.5KG', rationale: 'Bateste o topo da faixa.' };

  it('no deload troca a sugestão por 90% da carga da última sessão', () => {
    const out = applyMesoWeekToHint(hint, mesoWeekParams(5), 60);
    assert.equal(out.type, 'MESO_DELOAD');
    assert.equal(out.suggestedWeight, 54);
  });

  it('nas semanas de acumulação junta o alvo de esforço sem mudar a carga', () => {
    const out = applyMesoWeekToHint(hint, mesoWeekParams(2), 60);
    assert.equal(out.suggestedWeight, 62.5);
    assert.match(out.rationale, /2 repetições em reserva/);
    assert.match(applyMesoWeekToHint(hint, mesoWeekParams(4)).rationale, /perto da falha/);
  });

  it('rótulo da semana', () => {
    assert.match(mesoWeekLabel(mesoWeekParams(5)), /Deload/);
    assert.match(mesoWeekLabel(mesoWeekParams(1)), /Semana 1 de 5/);
  });
});
