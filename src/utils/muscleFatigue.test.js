import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeLocalFatigue, setStimulusFactor, readinessHalfLifeMultiplier } from './muscleFatigue.js';

const NOW = Date.parse('2026-11-19T20:00:00Z');
// Exercício 1 do catálogo (supino reto): peito primário, ombros e tríceps secundários
const session = (sets) => [{ completedAt: '2026-11-19T12:00:00Z', exercisesData: { 1: sets } }];
const sets = (n, reps, rpe) => Array.from({ length: n }, () => ({ weight: 60, reps, rpe, type: 'N', completed: true }));

describe('setStimulusFactor', () => {
  it('esforço pelo RPE e intensidade pelas reps', () => {
    assert.equal(setStimulusFactor({ reps: 8 }), 1);
    assert.equal(setStimulusFactor({ reps: 8, rpe: 8 }), 1);
    assert.equal(setStimulusFactor({ reps: 8, rpe: 10 }), 1.15);
    assert.equal(setStimulusFactor({ reps: 5 }), 1.1);
    assert.ok(Math.abs(setStimulusFactor({ reps: 20, rpe: 6 }) - 0.765) < 1e-9);
    assert.equal(setStimulusFactor({ reps: 30, rpe: 2 }), 0.7 * 0.8);
  });

  it('séries de tempo não levam ajuste de intensidade', () => {
    assert.equal(setStimulusFactor({ reps: 60, seconds: 60 }), 1);
  });
});

describe('computeLocalFatigue ponderado', () => {
  it('3x5 pesado perto da falha cansa mais do que 3x20 leve longe da falha', () => {
    const heavy = computeLocalFatigue(session(sets(3, 5, 9)), NOW, []).muscles.peito.fatigue;
    const light = computeLocalFatigue(session(sets(3, 20, 6)), NOW, []).muscles.peito.fatigue;
    assert.ok(heavy > light, `${heavy} > ${light}`);
  });

  it('aquecimentos não contam', () => {
    const warm = sets(3, 10).map((s) => ({ ...s, type: 'W' }));
    assert.equal(computeLocalFatigue(session(warm), NOW, []).muscles.peito.fatigue, 0);
  });

  it('prontidão baixa abranda a recuperação, alta acelera', () => {
    const work = session(sets(5, 8, 9));
    const base = computeLocalFatigue(work, NOW, []).muscles.peito;
    const low = computeLocalFatigue(work, NOW, [], 40).muscles.peito;
    const high = computeLocalFatigue(work, NOW, [], 90).muscles.peito;
    assert.ok(low.fatigue > base.fatigue && base.fatigue > high.fatigue);
    assert.ok(low.hoursToRecovered >= base.hoursToRecovered);
  });

  it('multiplicador da meia-vida pela prontidão', () => {
    assert.equal(readinessHalfLifeMultiplier(null), 1);
    assert.equal(readinessHalfLifeMultiplier(54), 1.25);
    assert.equal(readinessHalfLifeMultiplier(60), 1.1);
    assert.equal(readinessHalfLifeMultiplier(75), 1);
    assert.equal(readinessHalfLifeMultiplier(85), 0.9);
  });
});
