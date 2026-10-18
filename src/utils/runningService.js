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

/**
 * Filtro de ruído do GPS para rejeitar pontos espúrios
 */
export function isValidGpsPoint(newCoord, prevCoord) {
  if (!newCoord || isNaN(newCoord.lat) || isNaN(newCoord.lng)) return false;
  if (newCoord.accuracy && newCoord.accuracy > 40) {
    // Precisão muito baixa (>40 metros de margem de erro)
    return false;
  }
  if (!prevCoord) return true;

  const distM = haversineDistanceMeters(
    prevCoord.lat,
    prevCoord.lng,
    newCoord.lat,
    newCoord.lng
  );

  const timeDeltaSec = (newCoord.timestamp - prevCoord.timestamp) / 1000;
  if (timeDeltaSec <= 0) return false;

  const speedKmh = (distM / timeDeltaSec) * 3.6;
  // Limite biológico humano para corrida (~40 km/h)
  if (speedKmh > 42) return false;

  return distM >= 1.5; // Ignora jitter parado (< 1.5 metros)
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
