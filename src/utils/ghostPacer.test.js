import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { selectGhostReference, computeGhostTimeAtDistance, evaluateGhostPacer } from './ghostPacer.js';

describe('ghostPacer (comparação em tempo real contra corrida anterior / PR)', () => {
  const history = [
    {
      id: 'r1',
      distanceKm: 5.02,
      durationSeconds: 1500, // 300s/km = 5'00"/km
      avgPaceSeconds: 300,
      targetId: '5km',
      splits: [
        { km: 1, durationSeconds: 290 },
        { km: 2, durationSeconds: 300 },
        { km: 3, durationSeconds: 305 },
      ],
    },
    {
      id: 'r2',
      distanceKm: 5.0,
      durationSeconds: 1650, // 330s/km = 5'30"/km
      avgPaceSeconds: 330,
      targetId: '5km',
    },
    {
      id: 'sim1',
      distanceKm: 5.0,
      durationSeconds: 1000,
      avgPaceSeconds: 200,
      isSimulation: true,
    },
  ];

  it('seleciona o PR real mais próximo da meta atual e ignora simulações quando há corridas reais', () => {
    const ghost = selectGhostReference(history, { id: '5km', label: '5 km', type: 'distance', value: 5 });
    assert.equal(ghost.id, 'r1');
    assert.equal(ghost.avgPaceSeconds, 300);
    assert.equal(ghost.label, 'PR 5 km');
  });

  it('interpola tempo do fantasma usando splits por quilómetro', () => {
    const ghost = selectGhostReference(history, { id: '5km', label: '5 km', type: 'distance', value: 5 });
    // km 1 (290s) + meio km 2 (150s) = 440s
    assert.equal(computeGhostTimeAtDistance(1.5, ghost), 440);
  });

  it('identifica corredor à frente, atrás ou no ritmo e silencia antes de 50m/10s', () => {
    const ghost = selectGhostReference(history, null);
    assert.equal(evaluateGhostPacer({ distanceKm: 0.02, elapsedSeconds: 5, ghostRun: ghost }), null);

    const ahead = evaluateGhostPacer({ distanceKm: 1.5, elapsedSeconds: 420, ghostRun: ghost });
    assert.equal(ahead.status, 'ahead');
    assert.equal(ahead.deltaSeconds, 20);
    assert.equal(ahead.statusText, '+20s à frente');

    const behind = evaluateGhostPacer({ distanceKm: 1.5, elapsedSeconds: 460, ghostRun: ghost });
    assert.equal(behind.status, 'behind');
    assert.equal(behind.deltaSeconds, -20);
    assert.equal(behind.statusText, '-20s atrás');

    const even = evaluateGhostPacer({ distanceKm: 1.5, elapsedSeconds: 441, ghostRun: ghost });
    assert.equal(even.status, 'on_pace');
    assert.equal(even.statusText, 'No ritmo');
  });
});
