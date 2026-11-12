/**
 * runningService.test.js — Testes Unitários do Motor de Geolocalização, Filtragem Kalman e Pace
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  haversineDistanceMeters,
  haversine,
  formatDuration,
  formatPace,
  validateAndFilterGpsPoint,
  accept,
  isValidGpsPoint,
  GpsKalmanFilter2D,
  calculateRollingPace,
  computeSplits,
  simplifyRoute,
  generateSimulatedStep,
  estimateVO2Max
} from './runningService.js';

describe('AB Running Club — Motor GPS, Filtro de Ruído, Distância e Pace', () => {
  describe('1. Cálculo de Distância Haversine', () => {
    it('deve calcular 0 metros para coordenadas idênticas ou inválidas', () => {
      assert.equal(haversineDistanceMeters(38.7285, -9.153, 38.7285, -9.153), 0);
      assert.equal(haversineDistanceMeters(NaN, -9.153, 38.7285, -9.153), 0);
      assert.equal(haversine(null, { lat: 38.7, lng: -9.1 }), 0);
    });

    it('deve ter desvio inferior a 1% num segmento de referência de 1.000 metros', () => {
      // 1 grau de latitude ≈ 111.195 km -> 1.000 m ≈ 0.0089932 graus
      const start = { lat: 38.7200, lng: -9.1500 };
      const end = { lat: 38.7289932, lng: -9.1500 };
      const dist = haversine(start, end);
      assert.ok(Math.abs(dist - 1000) < 5, `Distância esperada ~1000m, obtida: ${dist.toFixed(2)}m`);
    });
  });

  describe('2. Filtragem de Qualidade GPS (validateAndFilterGpsPoint / accept)', () => {
    const basePoint = {
      lat: 38.7285,
      lng: -9.1530,
      accuracy: 6,
      timestamp: 1700000000000
    };

    it('deve aceitar o primeiro ponto (initial_fix) se a precisão for <= 25m', () => {
      const res = validateAndFilterGpsPoint(basePoint, null);
      assert.equal(res.accepted, true);
      assert.equal(res.reason, 'initial_fix');
    });

    it('deve rejeitar pontos com precisão fraca (> 25m) e detetar localização aproximada (>= 100m)', () => {
      const lowAcc = { ...basePoint, accuracy: 38 };
      const resLow = validateAndFilterGpsPoint(lowAcc, null);
      assert.equal(resLow.accepted, false);
      assert.equal(resLow.reason, 'low_accuracy');

      const coarseAcc = { ...basePoint, accuracy: 450 };
      const resCoarse = validateAndFilterGpsPoint(coarseAcc, null);
      assert.equal(resCoarse.accepted, false);
      assert.equal(resCoarse.reason, 'coarse_location');
    });

    it('deve rejeitar timestamps repetidos (dt = 0) ou fora de ordem (dt < 0)', () => {
      // Salto de ~10m mas com o mesmo timestamp (dt = 0)
      const sameTime = {
        lat: 38.72859,
        lng: -9.1530,
        accuracy: 5,
        timestamp: basePoint.timestamp
      };
      const resSame = validateAndFilterGpsPoint(sameTime, basePoint);
      assert.equal(resSame.accepted, false);
      assert.equal(resSame.reason, 'invalid_timestamp');

      // Timestamp mais antigo que o último ponto
      const olderTime = {
        ...sameTime,
        timestamp: basePoint.timestamp - 2000
      };
      const resOlder = validateAndFilterGpsPoint(olderTime, basePoint);
      assert.equal(resOlder.accepted, false);
      assert.equal(resOlder.reason, 'invalid_timestamp');
    });

    it('deve rejeitar jitter estático (< 3 metros)', () => {
      // Deslocamento de apenas ~1.1 metros em 2 segundos
      const jitterPt = {
        lat: basePoint.lat + 0.00001,
        lng: basePoint.lng,
        accuracy: 5,
        timestamp: basePoint.timestamp + 2000
      };
      const res = validateAndFilterGpsPoint(jitterPt, basePoint);
      assert.equal(res.accepted, false);
      assert.equal(res.reason, 'jitter_stationary');
    });

    it('deve rejeitar saltos impossíveis de velocidade (> 12 m/s)', () => {
      // Salto de ~111 metros em 2 segundos (~55.5 m/s = 200 km/h)
      const jumpPt = {
        lat: basePoint.lat + 0.001,
        lng: basePoint.lng,
        accuracy: 6,
        timestamp: basePoint.timestamp + 2000
      };
      const res = validateAndFilterGpsPoint(jumpPt, basePoint);
      assert.equal(res.accepted, false);
      assert.equal(res.reason, 'speed_jump');
      assert.equal(accept(jumpPt, basePoint), false);
      assert.equal(isValidGpsPoint(jumpPt, basePoint), false);
    });

    it('deve aceitar deslocamento válido de corrida (~3.5 m/s = 12.6 km/h)', () => {
      // ~7 metros em 2 segundos (3.5 m/s)
      const validRunPt = {
        lat: basePoint.lat + 0.000063,
        lng: basePoint.lng,
        accuracy: 5,
        timestamp: basePoint.timestamp + 2000
      };
      const res = validateAndFilterGpsPoint(validRunPt, basePoint);
      assert.equal(res.accepted, true);
      assert.equal(res.reason, 'valid');
      assert.ok(res.distanceMeters >= 3 && res.distanceMeters <= 10);
    });
  });

  describe('3. Suavização de Trajeto com Filtro de Kalman 2D (GpsKalmanFilter2D)', () => {
    it('deve atenuar desvios laterais bruscos num trajeto em linha reta', () => {
      const kf = new GpsKalmanFilter2D(3.0);
      const t0 = 1700000000000;

      const p1 = kf.process({ lat: 38.7200, lng: -9.1500, accuracy: 5, timestamp: t0, altitude: 50 });
      assert.equal(p1.lat, 38.7200);

      // Ponto 2 com desvio lateral artificial na longitude (ruído de 15m)
      const noisyLng = -9.1500 + 0.00018;
      const p2 = kf.process({ lat: 38.72005, lng: noisyLng, accuracy: 15, timestamp: t0 + 1000, altitude: 54 });

      // A longitude suavizada pelo Kalman deve ficar mais próxima da linha original (-9.1500) do que do ponto ruidoso
      assert.ok(Math.abs(p2.lng - (-9.1500)) < Math.abs(noisyLng - (-9.1500)));
      // A altitude deve ser suavizada (entre 50 e 54)
      assert.ok(p2.altitude > 50 && p2.altitude < 54);
    });
  });

  describe('4. Cálculo de Pace em Janela Móvel e Auto-Pause', () => {
    it('deve retornar 0 (--:--) quando a velocidade GNSS indica que o corredor parou (< 0.45 m/s)', () => {
      const pace = calculateRollingPace({
        points: [
          { lat: 38.7200, lng: -9.1500, timestamp: 1000 },
          { lat: 38.7201, lng: -9.1500, timestamp: 4000 }
        ],
        nowTimestamp: 4000,
        gnssSpeedMs: 0.1,
        previousPaceSec: 300
      });
      assert.equal(pace, 0);
      assert.equal(formatPace(pace), '--:--');
    });

    it('deve calcular pace estável (~300s/km = 5\'00" /km) para corrida a 3.33 m/s', () => {
      const points = [];
      const baseT = 1700000000000;
      // 10 pontos a cada 2s avançando 6.66m por passo (= 3.33 m/s -> 300 s/km)
      for (let i = 0; i <= 10; i++) {
        points.push({
          lat: 38.7200 + i * (6.66 / 111195),
          lng: -9.1500,
          timestamp: baseT + i * 2000
        });
      }

      const paceSec = calculateRollingPace({
        points,
        nowTimestamp: baseT + 20000,
        gnssSpeedMs: 3.33,
        previousPaceSec: 0
      });

      assert.ok(paceSec >= 295 && paceSec <= 305, `Pace esperado ~300s/km, obtido: ${paceSec}s/km`);
      assert.equal(formatPace(300), `5'00" /km`);
      assert.equal(formatDuration(300), '05:00');
    });
  });

  describe('5. Interpolação de Splits por KM com Coordenadas Exatas', () => {
    it('deve interpolar o tempo e a coordenada exata (lat, lng) da marca de 1 KM', () => {
      const t0 = 1700000000000;
      // Dois segmentos de 600m cada (total 1.200m) a 300s por km (180s por 600m)
      const dLat600m = 600 / 111195;
      const pts = [
        { lat: 38.7000, lng: -9.1500, timestamp: t0 },
        { lat: 38.7000 + dLat600m, lng: -9.1500, timestamp: t0 + 180000 },
        { lat: 38.7000 + dLat600m * 2, lng: -9.1500, timestamp: t0 + 360000 }
      ];

      const { splits, partial } = computeSplits(pts);
      assert.equal(splits.length, 1);
      assert.equal(splits[0].km, 1);
      assert.ok(Math.abs(splits[0].durationSeconds - 300) <= 2);
      assert.ok(typeof splits[0].lat === 'number' && typeof splits[0].lng === 'number');
      assert.ok(partial.meters >= 195 && partial.meters <= 205);
    });
  });

  describe('6. Simplificação de Rota Ramer-Douglas-Peucker (simplifyRoute)', () => {
    it('deve reduzir uma rota longa respeitando maxPoints mas preservando o início e o fim exatos', () => {
      const longRoute = [];
      let prev = null;
      for (let i = 0; i < 900; i++) {
        prev = generateSimulatedStep(i, prev, { lat: 38.7285, lng: -9.1530 }, 'normal');
        longRoute.push(prev);
      }

      const simplified = simplifyRoute(longRoute, 300, 2.0);
      assert.ok(simplified.length <= 300);
      assert.ok(simplified.length >= 10);
      assert.deepEqual(simplified[0], longRoute[0]);
      assert.deepEqual(simplified[simplified.length - 1], longRoute[longRoute.length - 1]);
    });

    it('o modo de simulação "noisy" deve injetar saltos no passo 15 que o filtro rejeita automaticamente', () => {
      let prev = generateSimulatedStep(0, null, null, 'noisy');
      for (let step = 1; step <= 14; step++) {
        const next = generateSimulatedStep(step, prev, null, 'noisy');
        assert.equal(validateAndFilterGpsPoint(next, prev).accepted, true);
        prev = next;
      }
      // O passo 15 no modo noisy injeta um salto de ~275m e accuracy 45m
      const spikeStep = generateSimulatedStep(15, prev, null, 'noisy');
      const validation = validateAndFilterGpsPoint(spikeStep, prev);
      assert.equal(validation.accepted, false);
    });
  });
});

describe('AB Running Club — Estimativa de VO2 Max (Daniels & Gilbert)', () => {
  it('estima um VO2 Max fisiologicamente plausível para 5km em 25 minutos', () => {
    const vo2Max = estimateVO2Max(5, 25 * 60);
    assert.ok(vo2Max > 35 && vo2Max < 42);
  });

  it('devolve um valor mais alto para um ritmo mais rápido na mesma distância', () => {
    const slow = estimateVO2Max(5, 30 * 60);
    const fast = estimateVO2Max(5, 20 * 60);
    assert.ok(fast > slow);
  });

  it('devolve null para corridas demasiado curtas (< 6 minutos) para validar a fórmula', () => {
    assert.equal(estimateVO2Max(1, 300), null);
  });

  it('devolve null sem distância ou duração', () => {
    assert.equal(estimateVO2Max(0, 1200), null);
    assert.equal(estimateVO2Max(5, 0), null);
    assert.equal(estimateVO2Max(null, 1200), null);
  });
});

