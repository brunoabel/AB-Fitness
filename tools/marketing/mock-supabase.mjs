/**
 * Supabase simulado para capturas de marketing (capture-ui.mjs --mock-supabase <fixtures.json>).
 *
 * Intercepta TODAS as chamadas do navegador ao projeto Supabase e responde com os dados do arquivo de fixtures:
 * nada sai para o servidor real, nenhuma senha é usada e nenhum dado de produção aparece na tela.
 * Uma sessão local falsa (JWT sem assinatura válida, só lido pelo cliente) faz o app se comportar como logado.
 *
 * fixtures.json:
 *   {
 *     "user":   { "id": "...", "email": "...", "user_metadata": { "full_name": "..." } },
 *     "rpc":    { "<nome_da_rpc>": <resposta> },             // ex.: get_roster_overview → [ ... ]
 *     "tables": { "<tabela>": [ { ...linhas } ] }            // filtros eq. do PostgREST são aplicados
 *   }
 * Datas relativas: qualquer string "@now-<n>h" ou "@now-<n>d" vira ISO relativo ao momento da captura.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(new URL('.', import.meta.url).pathname, '../..');
const DEFAULT_URL = 'https://tegdtjmglvrvgerrtivx.supabase.co';

function supabaseUrl() {
  const envFile = resolve(ROOT, '.env');
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, 'utf8').split('\n').find((l) => /^\s*VITE_SUPABASE_URL\s*=/.test(l));
    const value = line?.split('=').slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    if (value && !value.includes('your-project') && !value.includes('placeholder')) return value.replace(/\/$/, '');
  }
  return DEFAULT_URL;
}

/** Resolve "@now-3h" / "@now-2d" em ISO, recursivamente. */
function resolveDates(value, now = Date.now()) {
  if (typeof value === 'string') {
    const m = value.match(/^@now(?:-(\d+(?:\.\d+)?)([hd]))?$/);
    if (!m) return value;
    const ms = m[1] ? Number(m[1]) * (m[2] === 'h' ? 3600000 : 86400000) : 0;
    return new Date(now - ms).toISOString();
  }
  if (Array.isArray(value)) return value.map((v) => resolveDates(v, now));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDates(v, now)]));
  return value;
}

const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

/** Aplica filtros simples do PostgREST (col=eq.valor, col=is.null, col=in.(a,b)) e limit. */
function applyFilters(rows, params) {
  let out = rows;
  for (const [key, raw] of params.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) continue;
    const [op, ...rest] = raw.split('.');
    const val = rest.join('.');
    if (op === 'eq') out = out.filter((r) => String(r[key]) === val);
    else if (op === 'neq') out = out.filter((r) => String(r[key]) !== val);
    else if (op === 'is') out = out.filter((r) => (val === 'null' ? r[key] == null : String(r[key]) === val));
    else if (op === 'in') {
      const set = new Set(val.replace(/^\(|\)$/g, '').split(','));
      out = out.filter((r) => set.has(String(r[key])));
    }
  }
  const limit = Number(params.get('limit'));
  return Number.isFinite(limit) && limit > 0 ? out.slice(0, limit) : out;
}

export async function installSupabaseMock(context, fixturesPath, now = Date.now()) {
  const base = supabaseUrl();
  const ref = new URL(base).hostname.split('.')[0];
  const fx = resolveDates(JSON.parse(readFileSync(resolve(fixturesPath), 'utf8')), now);
  const user = { aud: 'authenticated', role: 'authenticated', app_metadata: { provider: 'email' }, created_at: fx.user.created_at || new Date().toISOString(), ...fx.user };
  const exp = Math.floor(Math.max(now, Date.now()) / 1000) + 365 * 86400;
  const session = {
    access_token: `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub: user.id, role: 'authenticated', aud: 'authenticated', exp, email: user.email })}.mock`,
    token_type: 'bearer',
    expires_in: 365 * 86400,
    expires_at: exp,
    refresh_token: 'mock-refresh-token',
    user
  };

  await context.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: `sb-${ref}-auth-token`, value: JSON.stringify(session) }
  );

  const json = (route, status, body, headers = {}) =>
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', ...headers }, body: body === undefined ? '' : JSON.stringify(body) });

  await context.route(`${base}/**`, async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const method = req.method();
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    }
    if (u.pathname.startsWith('/auth/v1/')) {
      if (u.pathname.endsWith('/user')) return json(route, 200, user);
      if (u.pathname.endsWith('/token')) return json(route, 200, session);
      return json(route, 204);
    }
    const rpc = u.pathname.match(/^\/rest\/v1\/rpc\/([^/]+)/);
    if (rpc) {
      const has = fx.rpc && Object.prototype.hasOwnProperty.call(fx.rpc, rpc[1]);
      return json(route, 200, has ? fx.rpc[rpc[1]] : null);
    }
    const table = u.pathname.match(/^\/rest\/v1\/([^/?]+)/);
    if (table) {
      const rows = applyFilters(fx.tables?.[table[1]] || [], u.searchParams);
      const wantsObject = (req.headers()['accept'] || '').includes('vnd.pgrst.object');
      if (method === 'GET' || method === 'HEAD') {
        if (!wantsObject) return json(route, 200, rows, { 'content-range': `0-${Math.max(0, rows.length - 1)}/${rows.length}` });
        if (rows.length === 1) return json(route, 200, rows[0]);
        return json(route, 406, { code: 'PGRST116', details: 'The result contains 0 rows', hint: null, message: 'JSON object requested, multiple (or no) rows returned' });
      }
      // Escritas: aceita sem gravar nada (a captura nunca muda dados)
      return json(route, method === 'POST' ? 201 : 200, wantsObject ? rows[0] || {} : rows);
    }
    // Storage, functions e o resto do projeto: vazio, nunca o servidor real
    return json(route, 200, null);
  });
  return { base, ref };
}
