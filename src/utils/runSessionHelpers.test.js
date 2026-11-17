import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePointTelemetry,
  buildCompletedRunRecord,
  getGpsSignalBadge
} from './runSessionHelpers.js';

describe('runSessionHelpers — telemetria e registo de corrida', () => {
  it('classifica o sinal GPS em linguagem humana sem jargão técnico', () => {
    assert.equal(getGpsSignalBadge({ isSimulation: true }).label, 'Passadeira');
    assert.equal(getGpsSignalBadge({ gpsErrorCode: 'DENIED', permissionState: 'denied' }).label, 'GPS bloqueado');
    assert.equal(getGpsSignalBadge({ gpsErrorCode: 'COARSE', permissionState: 'granted' }).label, 'Localização aproximada');
    assert.equal(getGpsSignalBadge({ gpsAccuracy: null }).label, 'A localizar...');
    assert.equal(getGpsSignalBadge({ gpsAccuracy: 12 }).label, 'GPS pronto');
    assert.equal(getGpsSignalBadge({ gpsAccuracy: 45 }).label, 'A ajustar sinal...');
  });

  it('calcula distância e filtra ruído vertical abaixo da banda morta de altimetria', () => {
    const first = advancePointTelemetry({
      smoothedPoint: { lat: 38.7223, lng: -9.1393, altitude: 50 },
      prevPoint: null,
      distanceKm: 0,
      elevationGainM: 0,
      lastAltitudeAnchor: null
    });
    assert.equal(first.nextDistanceKm, 0);
    assert.equal(first.nextAltitudeAnchor, 50);

    // Pequena oscilação de 0.5m não deve somar altimetria
    const step1 = advancePointTelemetry({
      smoothedPoint: { lat: 38.7226, lng: -9.1393, altitude: 50.5 },
      prevPoint: { lat: 38.7223, lng: -9.1393, altitude: 50 },
      distanceKm: 0,
      elevationGainM: 0,
      lastAltitudeAnchor: 50
    });
    assert.ok(step1.nextDistanceKm > 0.02);
    assert.equal(step1.nextElevationGainM, 0);
    assert.equal(step1.nextAltitudeAnchor, 50);

    // Subida real de 4m acima da banda morta deve somar altimetria
    const step2 = advancePointTelemetry({
      smoothedPoint: { lat: 38.7230, lng: -9.1393, altitude: 54 },
      prevPoint: { lat: 38.7226, lng: -9.1393, altitude: 50.5 },
      distanceKm: step1.nextDistanceKm,
      elevationGainM: 0,
      lastAltitudeAnchor: 50
    });
    assert.equal(step2.nextElevationGainM, 4);
    assert.equal(step2.nextAltitudeAnchor, 54);
  });

  it('constrói registo completo de corrida com pace médio e velocidade coerentes', () => {
    const rec = buildCompletedRunRecord({
      finalDistance: 5,
      finalSeconds: 1500,
      livePaceSeconds: 300,
      calories: 320,
      elevationGainM: 42,
      splits: [],
      coordinates: [],
      targetId: '5km',
      isSimulation: false
    });
    assert.equal(rec.distanceKm, 5);
    assert.equal(rec.durationSeconds, 1500);
    assert.equal(rec.avgPaceSeconds, 300);
    assert.equal(rec.avgSpeedKmh, 12);
    assert.equal(rec.elevationGainM, 42);
    assert.equal(rec.targetId, '5km');
    assert.equal(rec.isSimulation, false);
  });
});
