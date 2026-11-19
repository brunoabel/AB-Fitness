/**
 * Chave de dia (YYYY-MM-DD) no fuso local do aparelho.
 * Substitui toISOString().slice(0, 10), que vira o dia às 21h no Brasil (UTC-3)
 * e à meia-noite errada em Portugal no verão (UTC+1).
 */
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Converte ISO completo, timestamp ou Date numa chave de dia local; 'YYYY-MM-DD' passa intacto. */
export function toLocalDateKey(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : localDateKey(date);
}
