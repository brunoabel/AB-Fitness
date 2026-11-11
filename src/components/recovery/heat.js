/** Rampa térmica em 3 segmentos (0–35–70–100) sobre os tokens --color-heat-*. */
const STOPS = ['var(--color-heat-0)', 'var(--color-heat-1)', 'var(--color-heat-2)', 'var(--color-heat-3)'];
const EDGES = [0, 35, 70, 100];

export function heatColor(fatigue) {
  const f = Math.max(0, Math.min(100, fatigue));
  const i = f >= 70 ? 2 : f >= 35 ? 1 : 0;
  const t = Math.round(((f - EDGES[i]) / (EDGES[i + 1] - EDGES[i])) * 100);
  return `color-mix(in oklab, ${STOPS[i + 1]} ${t}%, ${STOPS[i]})`;
}

export const HEAT_GRADIENT = `linear-gradient(90deg, ${STOPS[0]}, ${STOPS[1]} 35%, ${STOPS[2]} 70%, ${STOPS[3]})`;

export const STATUS_LABEL = { fresh: 'Fresco', recovering: 'A recuperar', fatigued: 'Fadiga alta' };

export function sinceLabel(iso) {
  if (!iso) return null;
  const h = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 3600000));
  if (h < 1) return 'há menos de 1 h';
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
}
