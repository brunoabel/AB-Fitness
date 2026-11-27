/**
 * Cartão de perfil partilhável: temas curados e métricas escolhidas pelo atleta (lógica pura).
 * O tema fica em profiles.cover_style (visível para amigos); as 3 métricas ficam neste aparelho.
 * Os mesmos valores de tema servem o ecrã (CSS) e a exportação em Canvas, para o print ficar igual.
 */

/**
 * Temas mostrados no seletor. Ids aceites em profiles.cover_style (constraint da base de dados).
 * `pattern` opcional: 'lines' (riscas finas), 'weave' (fibra de carbono) ou 'glow' (brilho no canto, cor em `glow`).
 */
export const CARD_THEMES = [
  { id: 'midnight', label: 'Meia-noite', top: '#141a28', bottom: '#05070c', accent: '#ffffff', line: 'rgba(255,255,255,0.12)' },
  { id: 'obsidian', label: 'Obsidiana', top: '#141416', bottom: '#000000', accent: '#ffffff', line: 'rgba(255,255,255,0.1)', pattern: 'lines' },
  { id: 'carbon', label: 'Carbono', top: '#1b1b1f', bottom: '#060607', accent: '#f4f4f5', line: 'rgba(255,255,255,0.12)' },
  { id: 'fiber', label: 'Fibra', top: '#1d1d20', bottom: '#060607', accent: '#f4f4f5', line: 'rgba(255,255,255,0.12)', pattern: 'weave' },
  { id: 'titanium', label: 'Titânio', top: '#2e2e30', bottom: '#0b0b0c', accent: '#ececec', line: 'rgba(255,255,255,0.16)' },
  { id: 'monochrome_luxury', label: 'Platina', top: '#3a3d45', bottom: '#0c0d10', accent: '#ffffff', line: 'rgba(255,255,255,0.2)' },
  { id: 'slate', label: 'Ardósia', top: '#2a3441', bottom: '#080a0d', accent: '#e2e8f0', line: 'rgba(226,232,240,0.16)' },
  { id: 'abyss', label: 'Abismo', top: '#10213d', bottom: '#030812', accent: '#c9d6ef', line: 'rgba(143,166,214,0.22)' },
  { id: 'electric_blue', label: 'Marinho', top: '#1d3557', bottom: '#060d1c', accent: '#ffffff', line: 'rgba(255,255,255,0.16)' },
  { id: 'sapphire', label: 'Safira', top: '#0c2a66', bottom: '#02061a', accent: '#d6e4ff', line: 'rgba(147,180,255,0.24)', pattern: 'glow', glow: 'rgba(96,140,255,0.38)' },
  { id: 'ink', label: 'Índigo', top: '#1e1b4b', bottom: '#05041a', accent: '#dcdcff', line: 'rgba(165,160,255,0.22)' },
  { id: 'amethyst', label: 'Ametista', top: '#2a1748', bottom: '#07030f', accent: '#e4d2ff', line: 'rgba(196,160,255,0.22)' },
  { id: 'aurora', label: 'Aurora', top: '#0a3326', bottom: '#020a07', accent: '#b9f3dc', line: 'rgba(110,231,183,0.22)' },
  { id: 'emerald', label: 'Esmeralda', top: '#065f46', bottom: '#01140e', accent: '#b5f5d8', line: 'rgba(110,231,183,0.25)', pattern: 'glow', glow: 'rgba(52,211,153,0.3)' },
  { id: 'crimson', label: 'Vinho', top: '#4a0d1f', bottom: '#0b0206', accent: '#ffd0dc', line: 'rgba(251,113,133,0.24)' },
  { id: 'rose', label: 'Rosé', top: '#47263a', bottom: '#0d0609', accent: '#ffdbe8', line: 'rgba(249,168,212,0.22)', pattern: 'glow', glow: 'rgba(244,114,182,0.24)' }
];

// Temas antigos continuam a ser desenhados para quem já os escolheu (não aparecem no seletor)
const LEGACY_THEMES = {
  gold: { id: 'gold', label: 'Ouro', top: '#3a2608', bottom: '#0a0603', accent: '#fcd77f', line: 'rgba(245,158,11,0.3)' },
  cyberpunk: { id: 'cyberpunk', label: 'Pulso', top: '#13284a', bottom: '#030812', accent: '#c9d6ef', line: 'rgba(143,166,214,0.25)' },
  sunset: { id: 'sunset', label: 'Solar', top: '#3a2a0c', bottom: '#0a0703', accent: '#fcd77f', line: 'rgba(217,158,42,0.3)' },
  magma: { id: 'magma', label: 'Magma', top: '#3a0d16', bottom: '#0a0204', accent: '#fecdd3', line: 'rgba(225,29,72,0.25)' }
};

/** Fundo CSS do cartão (gradiente do tema + textura opcional). O Canvas replica as mesmas camadas. */
export function themeBackground(theme) {
  const base = `linear-gradient(160deg, ${theme.top} 0%, ${theme.bottom} 100%)`;
  switch (theme.pattern) {
    case 'lines':
      return `repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 7px), ${base}`;
    case 'weave':
      return `repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 4px), ${base}`;
    case 'glow':
      return `radial-gradient(120% 85% at 100% 0%, ${theme.glow || 'rgba(255,255,255,0.12)'} 0%, transparent 62%), ${base}`;
    default:
      return base;
  }
}

export function getCardTheme(id) {
  return CARD_THEMES.find((t) => t.id === id) || LEGACY_THEMES[id] || CARD_THEMES[0];
}

/** Métricas disponíveis. `server`: vem de get_my_card_stats (amigos também a veem). */
export const CARD_METRICS = [
  { id: 'total_workouts', label: 'Treinos', server: true },
  { id: 'streak', label: 'Sequência', server: true },
  { id: 'monthly_volume', label: 'Volume do mês', server: true },
  { id: 'strength_gain', label: 'Força (90 dias)', server: false },
  { id: 'top_lift', label: 'Melhor recorde', server: false },
  { id: 'run_km', label: 'Km corridos', server: false }
];

export const DEFAULT_CARD_METRICS = ['total_workouts', 'streak', 'strength_gain'];
const PREFS_KEY = 'ab_profile_card_v1';

/** Normaliza a escolha: 3 ids válidos, sem repetidos, completando com os de omissão. */
export function normalizeMetricIds(ids) {
  const valid = new Set(CARD_METRICS.map((m) => m.id));
  const out = [];
  for (const id of Array.isArray(ids) ? ids : []) {
    if (valid.has(id) && !out.includes(id)) out.push(id);
    if (out.length === 3) return out;
  }
  for (const id of DEFAULT_CARD_METRICS) {
    if (!out.includes(id)) out.push(id);
    if (out.length === 3) break;
  }
  return out;
}

export function readCardMetricIds(storage) {
  try {
    const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    const raw = store?.getItem(PREFS_KEY);
    return normalizeMetricIds(raw ? JSON.parse(raw)?.metrics : null);
  } catch {
    return [...DEFAULT_CARD_METRICS];
  }
}

export function saveCardMetricIds(ids, storage) {
  const metrics = normalizeMetricIds(ids);
  try {
    const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
    store?.setItem(PREFS_KEY, JSON.stringify({ metrics }));
  } catch {}
  return metrics;
}

function formatVolume(kg) {
  const n = Math.max(0, Math.round(Number(kg) || 0));
  if (n >= 1000) return { value: String(Math.round(n / 100) / 10).replace('.', ','), unit: 't' };
  return { value: String(n), unit: 'kg' };
}

/**
 * Valores das métricas escolhidas.
 * `extra`: dados locais { strengthGainPct, topLift: { name, e1RM }, runKm } calculados pelo chamador.
 */
export function buildCardMetrics(ids, stats = {}, extra = {}) {
  return normalizeMetricIds(ids).map((id) => {
    const meta = CARD_METRICS.find((m) => m.id === id);
    switch (id) {
      case 'total_workouts':
        return { id, label: meta.label, value: String(Math.max(0, Number(stats?.total_workouts) || 0)), unit: '' };
      case 'streak': {
        const n = Math.max(0, Number(stats?.streak) || 0);
        return { id, label: meta.label, value: String(n), unit: n === 1 ? 'dia' : 'dias' };
      }
      case 'monthly_volume': {
        const v = formatVolume(stats?.monthly_volume_kg);
        return { id, label: meta.label, ...v };
      }
      case 'strength_gain': {
        const g = extra?.strengthGainPct;
        if (g === null || g === undefined || !Number.isFinite(g)) return { id, label: meta.label, value: '–', unit: '' };
        const n = Math.round(g);
        return { id, label: meta.label, value: n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0', unit: '%' };
      }
      case 'top_lift': {
        const lift = extra?.topLift;
        if (!lift?.e1RM) return { id, label: meta.label, value: '–', unit: '' };
        return { id, label: lift.name ? String(lift.name).slice(0, 18) : meta.label, value: String(Math.round(lift.e1RM)), unit: 'kg' };
      }
      case 'run_km': {
        const km = Math.max(0, Number(extra?.runKm) || 0);
        return { id, label: meta.label, value: km >= 100 ? String(Math.round(km)) : km.toFixed(1).replace('.', ','), unit: 'km' };
      }
      default:
        return { id, label: meta?.label || id, value: '–', unit: '' };
    }
  });
}
