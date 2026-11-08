/**
 * runningService.js — Motor de Rastreio & Métricas de Corrida (AB Fitness Running Club)
 * Cálculos precisos com Geolocation API, fórmula de Haversine, filtro de Kalman 2D,
 * validação anti-jitter/anti-salto, cálculo de Pace em janela móvel, splits interpolados
 * com coordenadas exatas, altimetria com histerese e compressão Ramer-Douglas-Peucker.
 */

const R = 6371000; // Raio médio da Terra em metros

/**
 * Configuração padrão de tracking GPS de alta precisão para corrida
 */
export const DEFAULT_TRACKING_CONFIG = {
  minIntervalMs: 1000,               // Intervalo alvo de atualização (1–2s)
  distanceFilterMeters: 3.0,         // Distância mínima para acumular deslocamento (3–5m)
  maxAccuracyMeters: 25,             // Precisão máxima aceite em corrida ativa (m)
  warmupAccuracyMeters: 30,          // Precisão máxima para considerar o fix inicial pronto (m)
  coarseLocationThresholdMeters: 100,// Limiar que indica localização aproximada no iOS 14+ / Android 12+
  maxSpeedMs: 12.0,                  // Velocidade máxima plausível para corrida (12 m/s = 43.2 km/h)
  autoPauseSpeedMs: 0.5,             // Velocidade abaixo da qual considera parado (~1.8 km/h)
  autoPauseDelayMs: 6000,            // Tempo parado antes de acionar Auto-Pause (6s)
  paceWindowSeconds: 20,             // Janela móvel para cálculo de pace atual (segundos)
  paceMinMeters: 15,                 // Distância mínima na janela para calcular pace estável
  elevationDeadbandMeters: 1.5,      // Histerese vertical para ignorar oscilação barométrica/GPS
  maxStoredPoints: 1000              // Limite de pontos após simplificação RDP para armazenamento
};

/**
 * Calcula a distância em metros entre dois pontos geográficos (Fórmula de Haversine)
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number' ||
    !isFinite(lat1) || !isFinite(lon1) || !isFinite(lat2) || !isFinite(lon2)
  ) {
    return 0;
  }
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  return R * c;
}

/**
 * Fórmula de Haversine entre dois objetos {lat, lng}
 */
export function haversine(a, b) {
  if (!a || !b) return 0;
  return haversineDistanceMeters(a.lat, a.lng, b.lat, b.lng);
}

/**
 * Formata duração em segundos para string (ex: '28:45' ou '1:02:15')
 */
export function formatDuration(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Formata ritmo/pace (segundos por km) para visualização desportiva (ex: 5'18" /km)
 */
export function formatPace(secondsPerKm, suffix = '/km') {
  if (!secondsPerKm || !isFinite(secondsPerKm) || secondsPerKm <= 0 || secondsPerKm > 1800) {
    return `--:--`;
  }
  const mins = Math.floor(secondsPerKm / 60);
  const secs = Math.floor(secondsPerKm % 60);
  const padSecs = String(secs).padStart(2, '0');
  return `${mins}'${padSecs}" ${suffix}`.trim();
}

/**
 * Calcula calorias queimadas com base no peso corporal e distância
 * Média metabólica MET de corrida moderada (~1.036 kcal/kg/km)
 */
export function calculateRunningCalories(distanceKm, userWeightKg = 72) {
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.round(distanceKm * (userWeightKg || 72) * 1.036);
}

/**
 * Validação detalhada de ponto GPS com diagnóstico da causa de rejeição:
 * - Verifica coordenadas válidas e precisão (accuracy <= maxAccuracyMeters)
 * - Deteta localização aproximada (Android 12+ / iOS 14+ com accuracy >= 100m)
 * - Rejeita timestamps repetidos, antigos ou fora de ordem (dt <= 0)
 * - Rejeita jitter estático (d < distanceFilterMeters)
 * - Rejeita saltos implausíveis de velocidade (d / dt > maxSpeedMs)
 */
export function validateAndFilterGpsPoint(p, last, config = DEFAULT_TRACKING_CONFIG) {
  if (!p || typeof p.lat !== 'number' || typeof p.lng !== 'number' || !isFinite(p.lat) || !isFinite(p.lng)) {
    return { accepted: false, reason: 'invalid_coords', distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }

  if (Math.abs(p.lat) > 90 || Math.abs(p.lng) > 180) {
    return { accepted: false, reason: 'out_of_bounds', distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }

  const maxAcc = config?.maxAccuracyMeters ?? DEFAULT_TRACKING_CONFIG.maxAccuracyMeters;
  const coarseThreshold = config?.coarseLocationThresholdMeters ?? DEFAULT_TRACKING_CONFIG.coarseLocationThresholdMeters;
  const minDist = config?.distanceFilterMeters ?? DEFAULT_TRACKING_CONFIG.distanceFilterMeters;
  const maxSpeed = config?.maxSpeedMs ?? DEFAULT_TRACKING_CONFIG.maxSpeedMs;

  const acc = p.acc !== undefined ? p.acc : (p.accuracy ?? 0);
  if (acc < 0) {
    return { accepted: false, reason: 'invalid_accuracy', distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }
  if (acc >= coarseThreshold) {
    return { accepted: false, reason: 'coarse_location', accuracy: acc, distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }
  if (acc > maxAcc) {
    return { accepted: false, reason: 'low_accuracy', accuracy: acc, distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }

  if (!last) {
    return { accepted: true, reason: 'initial_fix', distanceMeters: 0, dtSeconds: 0, speedMs: 0 };
  }

  const pTime = p.t !== undefined ? p.t : p.timestamp;
  const lastTime = last.t !== undefined ? last.t : last.timestamp;

  // Se ambos os pontos possuem timestamp, exigir estritamente ordem cronológica positiva (dt > 0)
  if (pTime !== undefined && lastTime !== undefined) {
    const dt = (pTime - lastTime) / 1000;
    if (dt <= 0) {
      return { accepted: false, reason: 'invalid_timestamp', distanceMeters: 0, dtSeconds: dt, speedMs: 0 };
    }

    const d = haversine(last, p);
    const speedMs = d / dt;

    if (d < minDist) {
      return { accepted: false, reason: 'jitter_stationary', distanceMeters: d, dtSeconds: dt, speedMs };
    }

    if (speedMs > maxSpeed) {
      return { accepted: false, reason: 'speed_jump', distanceMeters: d, dtSeconds: dt, speedMs };
    }

    return { accepted: true, reason: 'valid', distanceMeters: d, dtSeconds: dt, speedMs };
  }

  // Fallback caso algum ponto de teste não traga timestamp explícito
  const d = haversine(last, p);
  if (d < minDist) {
    return { accepted: false, reason: 'jitter_stationary', distanceMeters: d, dtSeconds: 1, speedMs: d };
  }
  if (d > maxSpeed * 5) {
    return { accepted: false, reason: 'speed_jump', distanceMeters: d, dtSeconds: 1, speedMs: d };
  }

  return { accepted: true, reason: 'valid', distanceMeters: d, dtSeconds: 1, speedMs: d };
}

/**
 * Filtro booleano de pontos GPS (retrocompatível):
 * - Rejeita precisão fraca (acc > 25m)
 * - Rejeita timestamps repetidos ou fora de ordem (dt <= 0)
 * - Rejeita jitter parado (< 3m)
 * - Rejeita saltos impossíveis (> 12 m/s ou > 43.2 km/h)
 */
export function accept(p, last, config = DEFAULT_TRACKING_CONFIG) {
  return validateAndFilterGpsPoint(p, last, config).accepted;
}

/**
 * Alias retrocompatível com isValidGpsPoint
 */
export function isValidGpsPoint(newCoord, prevCoord, config = DEFAULT_TRACKING_CONFIG) {
  return validateAndFilterGpsPoint(newCoord, prevCoord, config).accepted;
}

/**
 * Filtro de Kalman 2D leve otimizado para trajetos GPS de corrida.
 * Suaviza oscilações laterais (multipath em prédios/árvores) ponderando a variância
 * da precisão do satélite (accuracy) com a incerteza dinâmica do movimento (Q = 3 m/s).
 */
export class GpsKalmanFilter2D {
  constructor(processNoiseMetersPerSec = 3.0) {
    this.qMetersPerSec = processNoiseMetersPerSec;
    this.Reset();
  }

  Reset() {
    this.lat = null;
    this.lng = null;
    this.altitude = null;
    this.variance = -1; // Variância em m²
    this.timestamp = null;
  }

  /**
   * Processa um novo ponto GPS válido e retorna o ponto suavizado
   */
  process(point) {
    const accuracy = Math.max(point.accuracy || point.acc || 5, 2.5);
    const timestamp = point.timestamp || point.t || Date.now();
    const alt = typeof point.altitude === 'number' && isFinite(point.altitude) ? point.altitude : null;

    if (this.variance < 0 || this.lat === null || this.lng === null) {
      this.lat = point.lat;
      this.lng = point.lng;
      this.altitude = alt;
      this.variance = accuracy * accuracy;
      this.timestamp = timestamp;
      return {
        ...point,
        lat: this.lat,
        lng: this.lng,
        altitude: this.altitude ?? 0,
        rawLat: point.lat,
        rawLng: point.lng
      };
    }

    const dtSec = Math.max(0.1, (timestamp - this.timestamp) / 1000);
    // Aumenta a incerteza do estado proporcionalmente ao tempo decorrido
    this.variance += dtSec * this.qMetersPerSec * this.qMetersPerSec;
    this.timestamp = timestamp;

    // Ganho de Kalman K = P / (P + R)
    const measurementVariance = accuracy * accuracy;
    const K = this.variance / (this.variance + measurementVariance);

    this.lat += K * (point.lat - this.lat);
    this.lng += K * (point.lng - this.lng);
    this.variance = (1 - K) * this.variance;

    // Suavização exponencial de altimetria para eliminar picos verticais do GPS
    if (alt !== null) {
      if (this.altitude === null || this.altitude === 0) {
        this.altitude = alt;
      } else {
        this.altitude = this.altitude + 0.25 * (alt - this.altitude);
      }
    }

    return {
      ...point,
      lat: Number(this.lat.toFixed(7)),
      lng: Number(this.lng.toFixed(7)),
      altitude: this.altitude !== null ? Number(this.altitude.toFixed(1)) : 0,
      rawLat: point.lat,
      rawLng: point.lng
    };
  }
}

/**
 * Calcula o Pace Atual (segundos por km) usando uma janela móvel dos últimos N segundos
 * combinada com a velocidade instantânea do chip GNSS (quando fiável) e média exponencial,
 * evitando oscilações bruscas na UI.
 */
export function calculateRollingPace({
  points = [],
  nowTimestamp = Date.now(),
  gnssSpeedMs = null,
  previousPaceSec = 0,
  windowSeconds = DEFAULT_TRACKING_CONFIG.paceWindowSeconds,
  minDistanceMeters = DEFAULT_TRACKING_CONFIG.paceMinMeters
}) {
  // Se o sensor GNSS informa explicitamente velocidade quase zero (< 0.5 m/s), corredor está parado
  if (gnssSpeedMs !== null && gnssSpeedMs !== undefined && gnssSpeedMs >= 0 && gnssSpeedMs < 0.45) {
    return 0;
  }

  let windowPaceSec = 0;

  if (points && points.length >= 2) {
    const latest = points[points.length - 1];
    const latestTime = latest.t !== undefined ? latest.t : (latest.timestamp || nowTimestamp);

    // Se o último ponto aceite tem mais de 12 segundos, o corredor parou ou perdeu sinal
    if (nowTimestamp - latestTime > 12000 && (gnssSpeedMs === null || gnssSpeedMs < 0.6)) {
      return 0;
    }

    let accDistMeters = 0;
    let earliestTime = latestTime;

    for (let i = points.length - 1; i > 0; i--) {
      const curr = points[i];
      const prev = points[i - 1];
      const currT = curr.t !== undefined ? curr.t : (curr.timestamp || latestTime);
      const prevT = prev.t !== undefined ? prev.t : (prev.timestamp || latestTime);

      accDistMeters += haversine(prev, curr);
      earliestTime = prevT;

      const spanSec = (latestTime - earliestTime) / 1000;
      if (spanSec >= windowSeconds && accDistMeters >= minDistanceMeters) {
        break;
      }
    }

    const totalSpanSec = (latestTime - earliestTime) / 1000;
    if (totalSpanSec >= 1.5 && accDistMeters >= 5) {
      const speedMs = accDistMeters / totalSpanSec;
      if (speedMs >= 0.5 && speedMs <= DEFAULT_TRACKING_CONFIG.maxSpeedMs) {
        windowPaceSec = Math.round(1000 / speedMs);
      }
    }
  }

  // Pace derivado do efeito Doppler do chip GNSS (quando disponível)
  let dopplerPaceSec = 0;
  if (gnssSpeedMs !== null && gnssSpeedMs !== undefined && gnssSpeedMs >= 0.6 && gnssSpeedMs <= DEFAULT_TRACKING_CONFIG.maxSpeedMs) {
    dopplerPaceSec = Math.round(1000 / gnssSpeedMs);
  }

  let candidatePace = 0;
  if (windowPaceSec > 0 && dopplerPaceSec > 0) {
    // Combina 65% janela móvel geográfica + 35% Doppler GNSS
    candidatePace = Math.round(windowPaceSec * 0.65 + dopplerPaceSec * 0.35);
  } else {
    candidatePace = windowPaceSec || dopplerPaceSec;
  }

  // Limita a faixa fisiológica de corrida/caminhada (2:00/km a 20:00/km)
  if (candidatePace < 120 || candidatePace > 1200) {
    return 0;
  }

  // Suavização exponencial (EMA) face ao valor anterior para transições suaves no ecrã
  if (previousPaceSec >= 120 && previousPaceSec <= 1200) {
    return Math.round(previousPaceSec * 0.4 + candidatePace * 0.6);
  }

  return candidatePace;
}

/**
 * Interpolação precisa de Splits (parciais) por quilómetro, incluindo a coordenada exata (lat, lng)
 * onde cada quilómetro foi concluído para posicionamento fiel dos marcadores no mapa.
 */
export function computeSplits(points) {
  if (!points || points.length < 2) {
    return { splits: [], partial: { meters: 0, ms: 0 } };
  }

  const normalized = points.map((p) => ({
    lat: p.lat,
    lng: p.lng,
    t: p.t !== undefined ? p.t : (p.timestamp || Date.now())
  }));

  const splits = [];
  let dist = 0;
  let nextKm = 1000;
  let lastT = normalized[0].t;

  for (let i = 1; i < normalized.length; i++) {
    const p0 = normalized[i - 1];
    const p1 = normalized[i];
    const seg = haversine(p0, p1);
    if (seg <= 0) continue;

    while (dist + seg >= nextKm) {
      const f = (nextKm - dist) / seg;
      const t = p0.t + f * (p1.t - p0.t);
      const lat = p0.lat + f * (p1.lat - p0.lat);
      const lng = p0.lng + f * (p1.lng - p0.lng);
      const splitMs = Math.max(1000, Math.round(t - lastT));
      const splitSec = Math.round(splitMs / 1000);
      const paceFormatted = formatPace(splitSec);

      splits.push({
        km: nextKm / 1000,
        ms: splitMs,
        durationSeconds: splitSec,
        pace: paceFormatted,
        paceStr: paceFormatted,
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6))
      });
      lastT = t;
      nextKm += 1000;
    }
    dist += seg;
  }

  const lastPoint = normalized[normalized.length - 1];
  return {
    splits,
    partial: {
      meters: Math.max(0, Math.round(dist - (nextKm - 1000))),
      ms: Math.max(0, lastPoint.t - lastT)
    }
  };
}

/**
 * Distância perpendicular (em metros aproximados) de um ponto P a um segmento AB
 * Usado pelo algoritmo Ramer-Douglas-Peucker para simplificação de trajetória.
 */
function perpendicularDistanceMeters(pt, lineStart, lineEnd) {
  const latScale = 111320;
  const lngScale = 111320 * Math.cos(((lineStart.lat + lineEnd.lat) / 2) * (Math.PI / 180));

  const x = (pt.lng - lineStart.lng) * lngScale;
  const y = (pt.lat - lineStart.lat) * latScale;
  const dx = (lineEnd.lng - lineStart.lng) * lngScale;
  const dy = (lineEnd.lat - lineStart.lat) * latScale;

  const magSq = dx * dx + dy * dy;
  if (magSq === 0) {
    return Math.hypot(x, y);
  }

  const u = Math.max(0, Math.min(1, (x * dx + y * dy) / magSq));
  const projX = u * dx;
  const projY = u * dy;
  return Math.hypot(x - projX, y - projY);
}

/**
 * Simplifica uma rota GPS usando o algoritmo Ramer-Douglas-Peucker (RDP),
 * preservando o ponto inicial, o ponto final e todas as curvas relevantes sem truncar o fim do percurso.
 */
export function simplifyRoute(points, maxPoints = 500, toleranceMeters = 2.0) {
  if (!Array.isArray(points) || points.length <= maxPoints) {
    return points || [];
  }

  const rdp = (pts, epsilon) => {
    if (pts.length <= 2) return pts;
    let maxDist = 0;
    let index = 0;
    const start = pts[0];
    const end = pts[pts.length - 1];

    for (let i = 1; i < pts.length - 1; i++) {
      const d = perpendicularDistanceMeters(pts[i], start, end);
      if (d > maxDist) {
        index = i;
        maxDist = d;
      }
    }

    if (maxDist > epsilon) {
      const left = rdp(pts.slice(0, index + 1), epsilon);
      const right = rdp(pts.slice(index), epsilon);
      return left.slice(0, left.length - 1).concat(right);
    }
    return [start, end];
  };

  let currentTolerance = toleranceMeters;
  let simplified = rdp(points, currentTolerance);

  // Caso a corrida seja muito longa (ex: maratona), ajusta a tolerância até caber em maxPoints
  let attempts = 0;
  while (simplified.length > maxPoints && attempts < 6) {
    currentTolerance *= 1.8;
    simplified = rdp(simplified, currentTolerance);
    attempts++;
  }

  // Garantia final por amostragem uniforme preservando início e fim exatos
  if (simplified.length > maxPoints) {
    const sampled = [simplified[0]];
    const step = (simplified.length - 1) / (maxPoints - 1);
    for (let i = 1; i < maxPoints - 1; i++) {
      sampled.push(simplified[Math.round(i * step)]);
    }
    sampled.push(simplified[simplified.length - 1]);
    return sampled;
  }

  return simplified;
}

/**
 * Converte pontos para o formato padrão GPX 1.1 compatível com Strava, Garmin e Apple Health
 */
export function toGPX(points, name = 'Corrida AB Fitness') {
  if (!points || points.length === 0) return '';
  const pts = points.map((p) => {
    const timeISO = new Date(p.t !== undefined ? p.t : (p.timestamp || Date.now())).toISOString();
    const eleTag = p.altitude || p.alt ? `<ele>${Number(p.altitude || p.alt).toFixed(1)}</ele>` : '';
    return `<trkpt lat="${p.lat}" lon="${p.lng}">${eleTag}<time>${timeISO}</time></trkpt>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="AB Fitness - https://ba-fitness.vercel.app"
xmlns="http://www.topografix.com/GPX/1/1"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
<metadata>
  <name>${name}</name>
  <time>${new Date().toISOString()}</time>
</metadata>
<trk>
  <name>${name}</name>
  <type>running</type>
  <trkseg>${pts}</trkseg>
</trk>
</gpx>`;
}

/**
 * Dispara o download direto do ficheiro .gpx no browser
 */
export function downloadGPX(points, name = 'corrida-ab-fitness') {
  try {
    const xml = toGPX(points, name);
    const blob = new Blob([xml], { type: 'application/gpx+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Erro ao gerar download de GPX:', err);
  }
}

/**
 * Gerador de coordenadas realistas para simulação indoor / teste em desktop
 * Gera um trajeto contínuo e físicamente coerente (~3.25 m/s = ~11.7 km/h, pace ~5:08 /km).
 * Suporta modos de teste:
 * - 'normal': deslocamento limpo com curvas suaves
 * - 'noisy': injeta picos de erro / saltos GPS a cada 15 passos para testar o filtro Kalman/Outlier
 */
export function generateSimulatedStep(stepIndex, prevCoord, baseOrigin, mode = 'normal') {
  const origin = baseOrigin || { lat: 38.7285, lng: -9.1530 }; // Parque Eduardo VII, Lisboa
  const now = Date.now();

  if (stepIndex === 0 || !prevCoord) {
    return {
      lat: origin.lat,
      lng: origin.lng,
      timestamp: now,
      accuracy: 4,
      altitude: 48,
      speed: 3.25
    };
  }

  // Avança ~3.25 metros por passo ao longo de um circuito fechado realista (~1.2 km por volta)
  const headingRad = (stepIndex / 180) * Math.PI * 2 + Math.sin(stepIndex * 0.07) * 0.25;
  const stepMeters = 3.25;
  const dLat = (stepMeters * Math.cos(headingRad)) / 111320;
  const dLng = (stepMeters * Math.sin(headingRad)) / (111320 * Math.cos((prevCoord.lat * Math.PI) / 180));

  let lat = prevCoord.lat + dLat;
  let lng = prevCoord.lng + dLng;
  let accuracy = 4 + Math.round(Math.abs(Math.sin(stepIndex * 0.3)) * 4);

  // Modo de teste com ruído sintético para validar rejeição de saltos e suavização
  if (mode === 'noisy' && stepIndex % 15 === 0) {
    lat += 0.0025; // Salto falso de ~275m (deve ser rejeitado pelo filtro de velocidade)
    accuracy = 45;
  }

  return {
    lat: Number(lat.toFixed(7)),
    lng: Number(lng.toFixed(7)),
    timestamp: Math.max(now, (prevCoord.timestamp || now) + 1000),
    accuracy,
    altitude: Number((48 + Math.sin(stepIndex * 0.04) * 10).toFixed(1)),
    speed: 3.25
  };
}

/**
 * Converte um array de coordenadas [ {lat, lng}, ... ] em um path SVG normalizado
 * para renderização nítida em qualquer tamanho de Canvas / SVG card do Strava
 */
export function getNormalizedRoutePath(coordinates, width = 300, height = 200, padding = 24) {
  if (!coordinates || coordinates.length < 2) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  coordinates.forEach((pt) => {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lng < minLng) minLng = pt.lng;
    if (pt.lng > maxLng) maxLng = pt.lng;
  });

  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;

  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  // Manter proporção real de aspeto geográfico
  const scale = Math.min(usableW / lngRange, usableH / latRange);

  const points = coordinates.map((pt) => {
    const x = padding + (pt.lng - minLng) * scale + (usableW - lngRange * scale) / 2;
    // Inverter Y porque latitude cresce para o norte
    const y = height - padding - (pt.lat - minLat) * scale - (usableH - latRange * scale) / 2;
    return { x, y };
  });

  let svgPath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    svgPath += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }

  return {
    svgPath,
    points,
    startPoint: points[0],
    endPoint: points[points.length - 1],
    bounds: { minLat, maxLat, minLng, maxLng }
  };
}

/**
 * Garante que sempre haja coordenadas válidas para renderizar o trajeto no mapa,
 * mesmo que o utilizador tenha finalizado uma corrida de teste com poucos pontos.
 */
export function getCoordinatesWithFallback(coordinates, distanceKm = 3.5) {
  if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
    return coordinates;
  }

  // Circuito realista em Lisboa (Parque Eduardo VII / Marquês de Pombal)
  const baseLat = 38.7285;
  const baseLng = -9.1530;
  const numPoints = 40;
  const fallback = [];
  const scale = Math.min(1.5, Math.max(0.6, (Number(distanceKm) || 3.5) / 3.5));

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const lat = baseLat + (Math.sin(angle) * 0.0032 + Math.sin(angle * 2) * 0.0008) * scale;
    const lng = baseLng + (Math.cos(angle) * 0.0042 + Math.cos(angle * 3) * 0.0006) * scale;
    fallback.push({
      lat,
      lng,
      timestamp: Date.now() - (numPoints - i) * 10000,
      altitude: 48 + Math.sin(angle) * 12
    });
  }

  return fallback;
}
