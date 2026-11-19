/**
 * Atribuição de primeiro toque: de onde veio o visitante (utm_*, ?ref= de indicação,
 * referrer e página de entrada). Guardada uma vez por aparelho e enviada com o lead da waitlist.
 */
const ATTRIBUTION_KEY = 'ab_fitness_attribution_v1';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

/** Extrai a atribuição de um URL e de um referrer (função pura, testável). */
export function parseAttribution(href, referrer = '') {
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const out = {};
  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) out[key] = value.trim().slice(0, 100);
  }
  const ref = (url.searchParams.get('ref') || '').trim().toUpperCase();
  if (/^[A-Z0-9]{4,16}$/.test(ref)) out.ref = ref;
  // Referrer só conta quando vem de outro domínio (navegação interna não é origem)
  try {
    if (referrer && new URL(referrer).host !== url.host) out.referrer = referrer.slice(0, 300);
  } catch {}
  out.landing_path = `${url.pathname}${url.search}`.slice(0, 300);
  return out;
}

/** Grava a primeira atribuição com sinal (utm, ref ou referrer externo); toques seguintes não a substituem. */
export function captureAttribution(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  if (!storage || typeof window === 'undefined') return null;
  try {
    const current = parseAttribution(window.location.href, document.referrer);
    const hasSignal = current && (current.ref || current.referrer || UTM_KEYS.some((k) => current[k]));
    const saved = storage.getItem(ATTRIBUTION_KEY);
    if (hasSignal && !saved) {
      const first = { ...current, captured_at: new Date().toISOString() };
      storage.setItem(ATTRIBUTION_KEY, JSON.stringify(first));
      return first;
    }
    const parsed = saved ? JSON.parse(saved) : null;
    // Link de indicação aberto depois do primeiro toque: acrescenta o ref sem mexer na origem
    if (parsed && current?.ref && !parsed.ref) {
      const merged = { ...parsed, ref: current.ref };
      storage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed || current;
  } catch {
    return null;
  }
}

export function getAttribution(storage = typeof window !== 'undefined' ? window.localStorage : null) {
  try {
    const saved = storage?.getItem(ATTRIBUTION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}
