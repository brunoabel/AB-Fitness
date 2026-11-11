/**
 * Check-in pós-treino ("Como foi o treino?"), pedido a cada 3 sessões concluídas.
 * Guardado localmente e enviado como contexto ao AB Coach (getAthleteContextSummary).
 */
const COUNTER_KEY = 'ab_checkin_counter_v1';
const STORE_KEY = 'ab_session_checkins_v1';
export const CHECKIN_EVERY = 3;
const MAX_STORED = 20;

const read = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/** Conta a sessão concluída e diz se é altura de pedir o check-in. */
export function registerSessionAndCheckDue() {
  const n = (Number(read(COUNTER_KEY, 0)) || 0) + 1;
  write(COUNTER_KEY, n);
  return n % CHECKIN_EVERY === 0;
}

export function getCheckins() {
  return read(STORE_KEY, []);
}

export function saveCheckin(entry) {
  const list = [{ ...entry, createdAt: new Date().toISOString() }, ...getCheckins()].slice(0, MAX_STORED);
  write(STORE_KEY, list);
  return list[0];
}

/** Resumo curto dos últimos check-ins para o prompt do AB Coach. */
export function getCheckinContext(limit = 3) {
  return getCheckins()
    .slice(0, limit)
    .map((c) => ({
      treino: c.workoutTitle,
      data: c.createdAt?.slice(0, 10),
      carga: c.effortLabel,
      desconforto: c.pain?.length ? c.pain.join(', ') : 'nenhum',
      mudar: c.changes?.length ? c.changes.join(', ') : 'nada',
      nota: c.note || undefined
    }));
}
