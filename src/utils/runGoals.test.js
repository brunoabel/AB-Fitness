/**
 * runGoals.test.js — Testes Unitários para Metas Semanais, Objetivos e Conquistas da Corrida
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getRunTargetById,
  getNextWeeklyGoal,
  computeWeeklyRunProgress,
  computeTargetProgress,
  evaluateRunAchievements,
  formatRunRelativeDate
} from './runGoals.js';

describe('Corrida PRO MAX — Metas Semanais & Objetivos (runGoals)', () => {
  it('devolve alvo por ID com fallback seguro para Livre', () => {
    assert.equal(getRunTargetById('5km').value, 5);
    assert.equal(getRunTargetById('20min').type, 'time');
    assert.equal(getRunTargetById('inexistente').id, 'free');
  });

  it('roda as opções de meta semanal corretamente', () => {
    assert.equal(getNextWeeklyGoal(10), 15);
    assert.equal(getNextWeeklyGoal(42), 5);
    assert.equal(getNextWeeklyGoal(999), 10);
  });

  it('calcula o progresso semanal ignorando corridas de semanas anteriores', () => {
    // Quinta-feira 12 Nov 2026
    const now = new Date(2026, 10, 12, 18, 0, 0);
    const runs = [
      { id: '1', distanceKm: 4.2, timestamp: new Date(2026, 10, 10, 8, 0, 0).getTime() }, // Terça desta semana
      { id: '2', distanceKm: 3.0, timestamp: new Date(2026, 10, 12, 7, 30, 0).getTime() }, // Hoje
      { id: 'old', distanceKm: 18.0, timestamp: new Date(2026, 10, 2, 9, 0, 0).getTime() } // Semana passada
    ];

    const res = computeWeeklyRunProgress(runs, 10, now);
    assert.equal(res.weekKm, 7.2);
    assert.equal(res.weekRuns, 2);
    assert.equal(res.remainingKm, 2.8);
    assert.equal(res.pct, 72);
    assert.equal(res.goalReached, false);
    assert.match(res.motivationLine, /2\.8 km/);
  });

  it('gera mensagem acolhedora sem corridas na semana e celebra meta atingida', () => {
    const now = new Date(2026, 10, 12, 18, 0, 0);
    const empty = computeWeeklyRunProgress([], 10, now);
    assert.equal(empty.weekKm, 0);
    assert.match(empty.motivationLine, /15 minutos/);

    const done = computeWeeklyRunProgress([{ id: '1', distanceKm: 11.4, timestamp: now.getTime() }], 10, now);
    assert.equal(done.goalReached, true);
    assert.equal(done.pct, 100);
    assert.match(done.motivationLine, /batida/);
  });

  it('calcula progresso do objetivo da corrida atual (distância, tempo e livre)', () => {
    assert.equal(computeTargetProgress(getRunTargetById('free'), 3.2, 900), null);

    const distProg = computeTargetProgress(getRunTargetById('5km'), 2.5, 800);
    assert.equal(distProg.pct, 50);
    assert.equal(distProg.reached, false);
    assert.equal(distProg.currentLabel, '2.50 km');

    const timeProg = computeTargetProgress(getRunTargetById('20min'), 3.8, 1205);
    assert.equal(timeProg.pct, 100);
    assert.equal(timeProg.reached, true);
  });

  it('deteta maior distância pessoal e meta cumprida sem contar a própria corrida no histórico', () => {
    const current = { id: 'r_new', distanceKm: 5.5, durationSeconds: 1800 };
    const prev = [{ id: 'r_old', distanceKm: 4.1, durationSeconds: 1500 }];

    const record = evaluateRunAchievements(current, [current, ...prev], getRunTargetById('5km'));
    assert.equal(record.isDistanceRecord, true);
    assert.equal(record.badgeLabel, 'Maior Distância');

    const goalOnly = evaluateRunAchievements(
      { id: 'r_new2', distanceKm: 5.1, durationSeconds: 1700 },
      [{ id: 'r_old2', distanceKm: 10.0, durationSeconds: 3200 }],
      getRunTargetById('5km')
    );
    assert.equal(goalOnly.isDistanceRecord, false);
    assert.equal(goalOnly.targetCompleted, true);
    assert.equal(goalOnly.badgeLabel, 'Meta 5 km Cumprida');
  });

  it('formata data relativa humana (Hoje / Ontem)', () => {
    const now = new Date(2026, 10, 12, 18, 0, 0);
    assert.equal(formatRunRelativeDate(new Date(2026, 10, 12, 7, 15, 0).getTime(), now), 'Hoje');
    assert.equal(formatRunRelativeDate(new Date(2026, 10, 11, 19, 0, 0).getTime(), now), 'Ontem');
  });
});
