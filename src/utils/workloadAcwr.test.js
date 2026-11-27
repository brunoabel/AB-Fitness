import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeWorkloadACWR, workoutSessionLoadAU, runSessionLoadAU } from './workloadAcwr.js';
import {
  computeSubjectiveReadiness,
  saveSubjectiveReadinessToday,
  getSubjectiveReadinessToday,
  combineReadinessScores
} from './subjectiveReadiness.js';

const DAY = 86400000;

describe('workloadAcwr — Motor Determinístico ACWR (Força + Corrida)', () => {
  it('devolve insufficient_data quando há menos de 2 semanas de histórico', () => {
    const now = Date.UTC(2026, 10, 27);
    const res = computeWorkloadACWR({
      workouts: [{ completedAt: new Date(now - DAY).toISOString(), totalSets: 16 }],
      now
    });
    assert.equal(res.ready, false);
    assert.equal(res.status, 'insufficient_data');
  });

  it('classifica carga estável na zona ótima (0.80–1.30)', () => {
    const now = Date.UTC(2026, 10, 27);
    const workouts = [2, 5, 9, 12, 16, 19, 23, 26].map((d) => ({
      completedAt: new Date(now - d * DAY).toISOString(),
      totalSets: 16
    }));
    const res = computeWorkloadACWR({ workouts, now });
    assert.equal(res.ready, true);
    assert.equal(res.status, 'sweet_spot');
    assert.ok(res.ratio >= 0.8 && res.ratio <= 1.3);
    assert.equal(res.recommendDeload, false);
  });

  it('deteta risco elevado de sobrecarga quando a carga aguda dispara (> 1.5×)', () => {
    const now = Date.UTC(2026, 10, 27);
    const workouts = [
      // Semanas anteriores leves (~120 AU/semana)
      { completedAt: new Date(now - 9 * DAY).toISOString(), totalSets: 12 },
      { completedAt: new Date(now - 16 * DAY).toISOString(), totalSets: 12 },
      { completedAt: new Date(now - 23 * DAY).toISOString(), totalSets: 12 },
      // Última semana com pico abrupto (4 treinos pesados + 15km)
      { completedAt: new Date(now - 1 * DAY).toISOString(), totalSets: 24 },
      { completedAt: new Date(now - 2 * DAY).toISOString(), totalSets: 24 },
      { completedAt: new Date(now - 4 * DAY).toISOString(), totalSets: 24 }
    ];
    const runs = [{ date: new Date(now - 3 * DAY).toISOString(), distanceKm: 15, elevationGainM: 120 }];

    const res = computeWorkloadACWR({ workouts, runs, now });
    assert.equal(res.ready, true);
    assert.equal(res.status, 'high_risk');
    assert.equal(res.recommendDeload, true);
    assert.equal(res.lockOverload, true);
    assert.ok(res.ratio > 1.5);
    assert.ok(runSessionLoadAU(runs[0]) > 180);
    assert.ok(workoutSessionLoadAU(workouts[3]) > 100);
  });
});

describe('subjectiveReadiness — Prontidão Subjetiva Pré-Treino', () => {
  it('calcula score ponderado e combina com wearable quando ambos existem', () => {
    const low = computeSubjectiveReadiness({ sleep: 1, energy: 2, soreness: 2 });
    assert.equal(low.status, 'recovery');
    assert.ok(low.score < 55);

    const peak = computeSubjectiveReadiness({ sleep: 5, energy: 5, soreness: 4 });
    assert.equal(peak.status, 'peak');
    assert.ok(peak.score >= 90);

    assert.equal(combineReadinessScores(80, 60), 72);
    assert.equal(combineReadinessScores(null, 65), 65);
    assert.equal(combineReadinessScores(70, null), 70);
    assert.equal(combineReadinessScores(null, null), null);
  });

  it('persiste e lê por dia local sem cruzar dias', () => {
    const map = new Map();
    const storage = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
    const day1 = new Date(2026, 10, 27);
    const day2 = new Date(2026, 10, 28);

    saveSubjectiveReadinessToday({ sleep: 4, energy: 4, soreness: 5 }, { today: day1, storage });
    assert.equal(getSubjectiveReadinessToday({ today: day1, storage })?.score, 85);
    assert.equal(getSubjectiveReadinessToday({ today: day2, storage }), null);
  });
});
