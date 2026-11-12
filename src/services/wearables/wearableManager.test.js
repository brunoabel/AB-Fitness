import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeReadinessIndex } from './wearableManager.js';
import { generateSimulatedWhoopData } from './whoopService.js';
import { generateSimulatedFitbitData } from './fitbitService.js';

describe('AB Wearables Engine — Gestão de Biometria e Prontidão Fisiológica', () => {
  it('retorna null quando nenhum wearable está conectado', () => {
    assert.equal(computeReadinessIndex({}), null);
    assert.equal(computeReadinessIndex(null), null);
  });

  it('calcula prontidão ótima (verde) para Whoop com score >= 80%', () => {
    const whoop = {
      recovery_score: 92,
      hrv_ms: 84.5,
      resting_hr_bpm: 48,
      sleep_score: 90
    };
    const res = computeReadinessIndex({ whoop });
    assert.ok(res);
    assert.equal(res.score, 92);
    assert.equal(res.status, 'optimal');
    assert.equal(res.label, 'Prontidão Máxima');
    assert.equal(res.providerUsed, 'whoop');
    assert.equal(res.hrv, 84.5);
    assert.match(res.advice, /Recorde Pessoal/);
  });

  it('calcula recuperação moderada (amarela) para score entre 55% e 79%', () => {
    const whoop = {
      recovery_score: 64,
      hrv_ms: 61.2,
      resting_hr_bpm: 54
    };
    const res = computeReadinessIndex({ whoop });
    assert.equal(res.score, 64);
    assert.equal(res.status, 'moderate');
    assert.equal(res.label, 'Recuperação Estável');
  });

  it('calcula fadiga elevada (vermelha) para score < 55%', () => {
    const whoop = {
      recovery_score: 41,
      hrv_ms: 45.0,
      resting_hr_bpm: 62
    };
    const res = computeReadinessIndex({ whoop });
    assert.equal(res.score, 41);
    assert.equal(res.status, 'recovery');
    assert.equal(res.label, 'Fadiga Elevada');
    assert.match(res.advice, /Fadiga acumulada/);
  });

  it('calcula índice composto quando Whoop e Fitbit estão ambos conectados', () => {
    const whoop = { recovery_score: 90 };
    const fitbit = { sleep_score: 80 };
    const res = computeReadinessIndex({ whoop, fitbit });
    // 90 * 0.6 + 80 * 0.4 = 54 + 32 = 86
    assert.equal(res.score, 86);
    assert.equal(res.providerUsed, 'composite');
    assert.equal(res.status, 'optimal');
  });

  it('gera dados simulados da Whoop dentro dos limites biológicos válidos', () => {
    const data = generateSimulatedWhoopData('2026-11-22');
    assert.equal(data.provider, 'whoop');
    assert.ok(data.recovery_score >= 0 && data.recovery_score <= 100);
    assert.ok(data.hrv_ms > 20 && data.hrv_ms < 200);
    assert.ok(data.resting_hr_bpm > 35 && data.resting_hr_bpm < 120);
    assert.ok(data.day_strain >= 0 && data.day_strain <= 21);
    assert.ok(data.sleep_duration_seconds > 0);
  });

  it('gera dados simulados da Fitbit com passos e frequência cardíaca válidos', () => {
    const data = generateSimulatedFitbitData('2026-11-22');
    assert.equal(data.provider, 'fitbit');
    assert.ok(data.resting_hr_bpm > 35 && data.resting_hr_bpm < 120);
    assert.ok(data.sleep_score >= 0 && data.sleep_score <= 100);
    assert.ok(data.steps > 1000);
    assert.ok(data.calories_burned > 1500);
  });
});
