/**
 * runningService.js — Motor de Rastreio & Métricas de Corrida (AB Fitness Running Club)
 * Cálculos precisos com Geolocation API, fórmula de Haversine, cálculo de Pace,
 * splits por km, estimativa calórica e gerador de trajeto.
 */

/**
 * Calcula a distância em metros entre dois pontos geográficos (Fórmula de Haversine)
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Raio da Terra em metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
 * Formata ritmo/pace (segundos por km) para visualização esportiva (ex: 5'18" ou 5:18 /km)
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

const R = 6371000; // Raio da Terra em metros

/**
 * Fórmula de Haversine entre dois pontos {lat, lng}
 */
export function haversine(a, b) {
  if (!a || !b) return 0;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Filtro rigoroso de pontos GPS:
 * - Rejeita precisão fraca (acc > 25m)
 * - Rejeita jitter parado (< 3m)
 * - Rejeita saltos impossíveis (> 12 m/s ou > 43.2 km/h)
 */
export function accept(p, last) {
  const acc = p.acc !== undefined ? p.acc : (p.accuracy ?? 0);
  if (acc > 25) return false; // precisão fraca
  if (!last) return true;
  const d = haversine(last, p);
  const pTime = p.t !== undefined ? p.t : (p.timestamp || Date.now());
  const lastTime = last.t !== undefined ? last.t : (last.timestamp || Date.now());
  const dt = (pTime - lastTime) / 1000;
  if (d < 3) return false; // jitter parado
  if (dt > 0 && d / dt > 12) return false; // salto impossível (> 43 km/h)
  return true;
}

/**
 * Alias retrocompatível com isValidGpsPoint
 */
export function isValidGpsPoint(newCoord, prevCoord) {
  return accept(newCoord, prevCoord);
}

/**
 * Interpolação precisa de Splits (parciais) por quilómetro
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
    const seg = haversine(normalized[i - 1], normalized[i]);
    while (dist + seg >= nextKm) {
      const f = (nextKm - dist) / seg;
      const t = normalized[i - 1].t + f * (normalized[i].t - normalized[i - 1].t);
      const splitMs = Math.max(1000, Math.round(t - lastT));
      const splitSec = Math.round(splitMs / 1000);
      splits.push({
        km: nextKm / 1000,
        ms: splitMs,
        durationSeconds: splitSec,
        paceStr: formatPace(splitSec)
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
 * Converte pontos para o formato padrão GPX 1.1 compatível com Strava, Garmin e Apple Health
 */
export function toGPX(points, name = 'Corrida AB Fitness') {
  if (!points || points.length === 0) return '';
  const pts = points.map((p) => {
    const timeISO = new Date(p.t !== undefined ? p.t : (p.timestamp || Date.now())).toISOString();
    const eleTag = p.altitude || p.alt ? `<ele>${(p.altitude || p.alt).toFixed(1)}</ele>` : '';
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
 * Gera um trajeto suave em loop/circuito em ritmo ~5:15 min/km
 */
export function generateSimulatedStep(stepIndex, prevCoord, baseOrigin) {
  const origin = baseOrigin || { lat: 38.7223, lng: -9.1393 }; // Lisboa como referência
  const t = stepIndex * 0.05;
  
  // Equação paramétrica de percurso esportivo com curvas naturais
  const latOffset = (Math.sin(t) * 0.0035 + Math.sin(t * 0.4) * 0.002);
  const lngOffset = (Math.cos(t * 0.8) * 0.0045 + Math.cos(t * 0.2) * 0.0015);

  return {
    lat: origin.lat + latOffset,
    lng: origin.lng + lngOffset,
    timestamp: Date.now(),
    accuracy: 5,
    altitude: 45 + Math.sin(t) * 12
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

  // Manter proporção real de aspecto geográfico
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
 * mesmo que o usuário tenha finalizado uma corrida de teste com poucos pontos.
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
