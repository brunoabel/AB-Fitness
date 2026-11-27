/**
 * syncQueue.js — Fila de sincronização offline genérica, apoiada em localStorage.
 * Usada para dados que precisam de retry quando a escrita no Supabase falha sem
 * rede (ex.: biometria de wearables). Idempotente por `job.key`: um novo job com
 * a mesma key substitui o anterior em vez de duplicar.
 */

/** Substitui (por `key`) ou acrescenta `job` na lista — lógica pura, testável. */
export function upsertJob(list, job) {
  return [...(Array.isArray(list) ? list : []).filter((j) => j.key !== job.key), job];
}

/** Remove da lista o job com a `key` indicada — lógica pura, testável. */
export function removeJobByKey(list, key) {
  return (Array.isArray(list) ? list : []).filter((j) => j.key !== key);
}

export function readQueue(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeQueue(storageKey, list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(list));
  } catch {
    // quota excedida
  }
}

/** Adiciona/substitui um job na fila persistida (idempotente por `job.key`). */
export function enqueueJob(storageKey, job) {
  writeQueue(storageKey, upsertJob(readQueue(storageKey), job));
}

export function getQueuedJobs(storageKey, filterFn) {
  const list = readQueue(storageKey);
  return filterFn ? list.filter(filterFn) : list;
}

/** Tentativas com erro definitivo antes de o job sair para a dead-letter (`<storageKey>_deadletter`). */
export const MAX_PERMANENT_ATTEMPTS = 5;
export const SKIP_JOB = 'skip';
// Classificação de erros: src/utils/syncErrors.js (isPermanentSyncError)

/** Marca uma tentativa falhada definitiva; à 5.ª o job sai da fila para a dead-letter (lógica pura). */
export function registerPermanentFailure(list, deadLetter, key, error, now = Date.now()) {
  const queue = Array.isArray(list) ? list : [];
  const dead = Array.isArray(deadLetter) ? deadLetter : [];
  const job = queue.find((j) => j.key === key);
  if (!job) return { queue, deadLetter: dead };
  const attempts = (Number(job.attempts) || 0) + 1;
  const lastError = String(error || 'Erro desconhecido').slice(0, 300);
  if (attempts >= MAX_PERMANENT_ATTEMPTS) {
    return {
      queue: removeJobByKey(queue, key),
      deadLetter: [...dead.filter((j) => j.key !== key), { ...job, attempts, lastError, failedAt: now }]
    };
  }
  return {
    queue: queue.map((j) => (j.key === key ? { ...j, attempts, lastError } : j)),
    deadLetter: dead
  };
}

/**
 * Tenta reenviar os jobs da fila (filtrados por `filterFn`) um a um via `sendFn`, removendo os que
 * tiverem sucesso. `sendFn` devolve:
 * - `true`: enviado;
 * - `false`: falha transitória (rede): para aqui e preserva a ordem para a próxima tentativa;
 * - `'skip'` (SKIP_JOB) ou `{ skip: true, error }`: rejeitado pelo servidor. O job fica na fila com
 *   `attempts`+1 (sai para a dead-letter à 5.ª) e o envio continua com os seguintes, sem bloquear a fila.
 */
export async function flushQueue(storageKey, { filterFn, sendFn } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  let sent = 0;
  for (const job of getQueuedJobs(storageKey, filterFn)) {
    // eslint-disable-next-line no-await-in-loop
    const result = await sendFn(job);
    if (result === true) {
      writeQueue(storageKey, removeJobByKey(readQueue(storageKey), job.key));
      sent += 1;
      continue;
    }
    const isSkip = result === SKIP_JOB || (result && typeof result === 'object' && result.skip);
    if (!isSkip) break;
    const deadKey = `${storageKey}_deadletter`;
    const next = registerPermanentFailure(readQueue(storageKey), readQueue(deadKey), job.key, result?.error);
    writeQueue(storageKey, next.queue);
    writeQueue(deadKey, next.deadLetter);
  }
  return sent;
}
