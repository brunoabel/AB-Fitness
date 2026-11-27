import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateDeloadSignals } from './deload.js';

const NOW = Date.parse('2026-11-27T12:00:00Z');
const DAY = 24 * 60 * 60 * 1000;
const set = (weight, reps, extra = {}) => ({ weight, reps, completed: true, ...extra });
const session = (daysAgo, exercisesData) => ({ timestamp: NOW - daysAgo * DAY, exercisesData });

describe('deload reativo', () => {
  it('sem sinais não recomenda', () => {
    const r = evaluateDeloadSignals({ history: [session(2, { 'supino-reto-barra': [set(80, 8)] }), session(9, { 'supino-reto-barra': [set(80, 8)] })], now: NOW });
    assert.equal(r.recommend, false);
    assert.equal(r.signals.length, 0);
  });

  it('queda de força em 2 exercícios principais + 2 check-ins "Demais" recomenda deload', () => {
    const history = [
      session(1, { 'supino-reto-barra': [set(80, 5)], 'agachamento-livre': [set(100, 4)] }),
      session(8, { 'supino-reto-barra': [set(80, 8)], 'agachamento-livre': [set(100, 8)] })
    ];
    const checkins = [
      { createdAt: new Date(NOW - DAY).toISOString(), effort: 5, pain: [] },
      { createdAt: new Date(NOW - 3 * DAY).toISOString(), effort: 5, pain: [] }
    ];
    const r = evaluateDeloadSignals({ history, checkins, now: NOW });
    assert.deepEqual(r.signals.map((s) => s.code).sort(), ['E1RM_DROP', 'HIGH_EFFORT']);
    assert.equal(r.recommend, true);
  });

  it('isoladores não contam para a queda de força; dor repetida e prontidão baixa contam', () => {
    const history = [
      session(1, { 'rosca-direta-barra': [set(30, 5)], 'elevacao-lateral-halteres': [set(10, 5)] }),
      session(8, { 'rosca-direta-barra': [set(30, 12)], 'elevacao-lateral-halteres': [set(10, 15)] })
    ];
    const checkins = [
      { createdAt: new Date(NOW - DAY).toISOString(), effort: 3, pain: ['Ombro'] },
      { createdAt: new Date(NOW - 2 * DAY).toISOString(), effort: 3, pain: ['Ombro'] }
    ];
    const readiness = ['2026-11-25', '2026-11-26', '2026-11-27'].map((date) => ({ date, score: 40 }));
    const r = evaluateDeloadSignals({ history, checkins, readiness, now: NOW });
    assert.ok(!r.signals.some((s) => s.code === 'E1RM_DROP'));
    assert.deepEqual(r.signals.map((s) => s.code).sort(), ['LOW_READINESS', 'PAIN']);
  });

  it('falha abaixo da faixa sem reserva em 3 exercícios', () => {
    const fail = (w) => [set(w, 3, { type: 'F', rpe: 10 })];
    const r = evaluateDeloadSignals({ history: [session(1, { 'supino-reto-barra': fail(90), 'remada-curvada-barra': fail(80), 'agachamento-livre': fail(120) })], now: NOW });
    assert.ok(r.signals.some((s) => s.code === 'FAIL_BELOW_RANGE' && s.count === 3));
  });
});
