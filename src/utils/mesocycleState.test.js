import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadMesocycle, resolveMesocycle, startReactiveDeload, mesoParamsFor, mondayOf, MESO_STATE_KEY } from './mesocycleState.js';
import { MESO_WEEK_KEY } from './mesocycleWeek.js';

const memory = (init = {}) => {
  const data = { ...init };
  return { getItem: (k) => (k in data ? data[k] : null), setItem: (k, v) => { data[k] = String(v); }, data };
};
const day = (s) => new Date(`${s}T12:00:00`);

describe('mesociclo com data de início', () => {
  it('começa na segunda-feira desta semana e avança pelo calendário', () => {
    const storage = memory();
    const first = loadMesocycle(day('2026-11-26'), storage); // quinta
    assert.equal(first.weekNumber, 1);
    assert.equal(first.state.startDate, '2026-11-23');
    assert.equal(loadMesocycle(day('2026-12-01'), storage).weekNumber, 2);
    assert.equal(loadMesocycle(day('2026-12-21'), storage).weekNumber, 5);
    assert.equal(loadMesocycle(day('2026-12-21'), storage).isDeload, true);
  });

  it('depois do deload começa um mesociclo novo e arquiva o anterior', () => {
    const storage = memory();
    loadMesocycle(day('2026-11-23'), storage);
    const next = loadMesocycle(day('2026-12-29'), storage);
    assert.equal(next.weekNumber, 1);
    assert.equal(next.state.startDate, '2026-12-28');
    assert.equal(next.state.history.length, 1);
  });

  it('migra a semana que antes era escolhida à mão', () => {
    const storage = memory({ [MESO_WEEK_KEY]: '3' });
    const r = loadMesocycle(day('2026-11-26'), storage);
    assert.equal(r.weekNumber, 3);
  });

  it('deload reativo antecipa o deload para a semana atual e o ciclo seguinte começa a seguir', () => {
    const storage = memory();
    loadMesocycle(day('2026-11-23'), storage);
    const r = startReactiveDeload(['E1RM_DROP', 'HIGH_EFFORT'], day('2026-12-02'), storage);
    assert.equal(r.weekNumber, 2);
    assert.equal(r.isDeload, true);
    assert.equal(mesoParamsFor(r).isDeload, true);
    assert.equal(mesoParamsFor(r).loadMultiplier, 0.9);
    const after = loadMesocycle(day('2026-12-08'), storage);
    assert.equal(after.weekNumber, 1);
    assert.equal(after.state.startDate, '2026-12-07');
    assert.equal(JSON.parse(storage.data[MESO_STATE_KEY]).history[0].reactive, true);
  });

  it('segunda-feira é o início da semana', () => {
    assert.equal(mondayOf(day('2026-11-29')).getDate(), 23);
    assert.equal(resolveMesocycle({ startDate: '2026-11-23', weeks: 5, history: [] }, day('2026-11-29')).weekNumber, 1);
  });
});
