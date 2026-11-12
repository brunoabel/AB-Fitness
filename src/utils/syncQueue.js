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

function readQueue(storageKey) {
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

/**
 * Tenta reenviar os jobs da fila (filtrados por `filterFn`) um a um via `sendFn`,
 * removendo da fila os que tiverem sucesso. Para no primeiro que falhar,
 * preservando a ordem para a próxima tentativa.
 */
export async function flushQueue(storageKey, { filterFn, sendFn } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  let sent = 0;
  for (const job of getQueuedJobs(storageKey, filterFn)) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await sendFn(job);
    if (!ok) break;
    writeQueue(storageKey, removeJobByKey(readQueue(storageKey), job.key));
    sent += 1;
  }
  return sent;
}
