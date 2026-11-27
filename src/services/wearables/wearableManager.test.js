import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeReadinessIndex, syncWearableData } from './wearableManager.js';
import { generateSimulatedWhoopData } from './whoopService.js';
import { generateSimulatedFitbitData } from './fitbitService.js';
import { generateSimulatedStravaData } from './stravaService.js';
import { generateSimulatedGarminData } from './garminService.js';
import { canAccessFeature } from '../../utils/userVerification.js';
import { computeLocalFatigue, parseSessionTime } from '../../utils/muscleFatigue.js';

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

  it('sinaliza isStale e score null quando a leitura do wearable está em falta ou marcada como stale', () => {
    const staleWhoop = { is_stale: true, recovery_score: null, hrv_ms: null };
    const resWhoop = computeReadinessIndex({ whoop: staleWhoop });
    assert.equal(resWhoop.isStale, true);
    assert.equal(resWhoop.score, null);
    assert.equal(resWhoop.status, 'stale');
    assert.equal(resWhoop.label, 'Sem dados recentes');

    const incompleteFitbit = { sleep_score: null, resting_hr_bpm: 55 };
    const resFitbit = computeReadinessIndex({ fitbit: incompleteFitbit });
    assert.equal(resFitbit.isStale, true);
    assert.equal(resFitbit.score, null);
    assert.equal(resFitbit.providerUsed, 'fitbit');
  });

  it('usa apenas o wearable com dados válidos quando um deles está stale', () => {
    const staleWhoop = { is_stale: true, recovery_score: null };
    const freshFitbit = { is_stale: false, sleep_score: 76, resting_hr_bpm: 53 };
    const res = computeReadinessIndex({ whoop: staleWhoop, fitbit: freshFitbit });
    assert.equal(res.isStale, false);
    assert.equal(res.score, 76);
    assert.equal(res.providerUsed, 'fitbit');
    assert.equal(res.status, 'moderate');
  });

  it('syncWearableData usa o fetcher live (e renova token expirado) em vez de sobrescrever conexão real com simulação', async () => {
    let refreshedWith = null;
    let fetchedWithToken = null;
    const expiredIso = new Date(Date.now() - 120000).toISOString();

    const bio = await syncWearableData('guest-local-user', 'whoop', {
      connectionOverride: {
        provider: 'whoop',
        status: 'connected',
        access_token: 'old_token',
        refresh_token: 'ref_123',
        expires_at: expiredIso
      },
      refreshFn: async (rt) => {
        refreshedWith = rt;
        return { access_token: 'new_live_token', expires_in: 3600 };
      },
      liveFetcher: async (tok) => {
        fetchedWithToken = tok;
        return { is_stale: false, recovery_score: 77, hrv_ms: 68.5, resting_hr_bpm: 51 };
      }
    });

    assert.equal(refreshedWith, 'ref_123');
    assert.equal(fetchedWithToken, 'new_live_token');
    assert.equal(bio.is_simulated, false);
    assert.equal(bio.recovery_score, 77);
    assert.equal(bio.hrv_ms, 68.5);
  });

  it('renovação guarda o novo refresh_token e o expires_at em segundos da Strava', async () => {
    const conn = { provider: 'strava', status: 'connected', access_token: 'a0', refresh_token: 'r0', expires_at: new Date(Date.now() - 1000).toISOString() };
    const expiresEpoch = Math.floor(Date.now() / 1000) + 21600;
    await syncWearableData('guest-local-user', 'strava', {
      connectionOverride: conn,
      refreshFn: async () => ({ access_token: 'a1', refresh_token: 'r1', expires_at: expiresEpoch, expires_in: 21600 }),
      liveFetcher: async () => ({ is_stale: false })
    });
    assert.equal(conn.access_token, 'a1');
    assert.equal(conn.refresh_token, 'r1');
    assert.equal(new Date(conn.expires_at).getTime(), expiresEpoch * 1000);
  });

  it('suporta normalização de prontidão com Strava e Garmin isolados ou compostos', () => {
    const strava = generateSimulatedStravaData('2026-11-22');
    const garmin = generateSimulatedGarminData('2026-11-22');

    const resStrava = computeReadinessIndex({ strava });
    assert.equal(resStrava.providerUsed, 'strava');
    assert.equal(resStrava.score, strava.recovery_score);
    assert.equal(resStrava.strain, strava.day_strain);

    const resGarmin = computeReadinessIndex({ garmin });
    assert.equal(resGarmin.providerUsed, 'garmin');
    assert.equal(resGarmin.score, garmin.recovery_score);
    assert.equal(resGarmin.hrv, garmin.hrv_ms);

    const resCombo = computeReadinessIndex({ strava, garmin });
    assert.equal(resCombo.providerUsed, 'composite');
    assert.ok(resCombo.score >= 40 && resCombo.score <= 100);
  });

  it('canAccessFeature distingue Free, PRO, Trial ativo e Trial expirado', () => {
    const freeProfile = { is_pro: false, is_premium: false };
    assert.equal(canAccessFeature('coach_unlimited', freeProfile), false);
    assert.equal(canAccessFeature('mesocycles', freeProfile), false);
    assert.equal(canAccessFeature('basic_workout', freeProfile), true);

    const proProfile = { is_pro: true };
    assert.equal(canAccessFeature('coach_unlimited', proProfile), true);
    assert.equal(canAccessFeature('mesocycles', proProfile), true);

    const activeTrial = { is_pro: false, trial_ends_at: new Date(Date.now() + 86400000).toISOString() };
    assert.equal(canAccessFeature('coach_unlimited', activeTrial), true);

    const expiredTrial = { is_pro: false, trial_ends_at: new Date(Date.now() - 86400000).toISOString() };
    assert.equal(canAccessFeature('coach_unlimited', expiredTrial), false);
  });

  it('computeLocalFatigue e parseSessionTime injetam corridas GPS nos membros inferiores e ignoram string de data PT', () => {
    const now = Date.now();
    const recentTs = now - 2 * 3600000;
    assert.equal(parseSessionTime({ timestamp: recentTs, date: '18 de nov.' }), recentTs);
    assert.equal(parseSessionTime({ date: '18 de nov.' }), 0);

    const fatigue = computeLocalFatigue([], now, [
      { timestamp: recentTs, date: '18 de nov.', distanceKm: 10, elevationGainM: 150 }
    ]);

    assert.ok(fatigue.muscles.quadriceps.fatigue > 25);
    assert.ok(fatigue.muscles.posteriores.fatigue > 20);
    assert.ok(fatigue.muscles.gemeos.fatigue > 30);
    assert.equal(fatigue.muscles.peito.fatigue, 0);
  });
});

