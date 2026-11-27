/**
 * Dados locais por conta: privacidade em aparelhos partilhados (RGPD).
 * - `clearUserScopedData` apaga do aparelho o histórico, corridas, perfil, rascunhos, fotos do corpo,
 *   prontidão e restantes dados da conta. Mantém só preferências do aparelho (som, voz, mapa...).
 * - `claimLocalDataOwner` regista a conta dona dos dados locais; se entrar outra conta, limpa antes de
 *   misturar o histórico de duas pessoas.
 */

export const LOCAL_OWNER_KEY = 'ab_local_owner_v1';
export const GUEST_USER_ID = 'guest-local-user';

// Preferências do aparelho e dados sem identificação pessoal: sobrevivem à troca de conta
const DEVICE_KEYS = new Set([
  'ab_fitness_sound_enabled_v1',
  'ab_fitness_lockscreen_media_v1',
  'ab_fitness_autopause_v1',
  'ab_fitness_rest_voice_cues_v1',
  'ab_fitness_voice_cues_enabled_v1',
  'ab_fitness_map_layer',
  'ab_fitness_gps_explained_v1',
  'ab_fitness_video_precache_v2',
  'ab_fitness_attribution_v1',
  'ab_fitness_marketing_capture_v1',
  'ab_marketing_waitlist_v1',
  'ab_waitlist_sync_queue_v1',
  'la_pwa_dismissed'
]);

// Filas de treinos/corridas/plano ainda por enviar: filtradas por userId no envio, nunca aparecem a outra conta.
// Ficam no aparelho para não se perder um treino feito offline; só saem quando a conta é eliminada.
const PENDING_SYNC_KEYS = new Set([
  'ab_fitness_sync_queue_v1',
  'ab_fitness_sync_deadletter_v1',
  'ab_fitness_runs_sync_queue_v1',
  'ab_fitness_runs_sync_queue_v1_deadletter',
  'ab_fitness_plan_sync_queue_v1',
  'ab_fitness_plan_sync_queue_v1_deadletter'
]);

// Bases IndexedDB com dados da conta (rascunho da corrida e fotos do corpo)
const USER_IDB_DATABASES = ['ab_fitness_idb_v1', 'ab_fitness_body_v1'];

/** Decide se uma chave do localStorage pertence à conta (lógica pura, testável). */
export function isUserScopedKey(key, { keepPendingSync = true } = {}) {
  if (typeof key !== 'string') return false;
  if (!(key.startsWith('ab_') || key.startsWith('ab-'))) return false;
  if (DEVICE_KEYS.has(key) || key === LOCAL_OWNER_KEY) return false;
  if (keepPendingSync && PENDING_SYNC_KEYS.has(key)) return false;
  return true;
}

function resolveStorage(storage) {
  if (storage) return storage;
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

function deleteIdbDatabase(idb, name, timeoutMs) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    try {
      const req = idb.deleteDatabase(name);
      req.onsuccess = finish;
      req.onerror = finish;
      req.onblocked = finish;
    } catch {
      finish();
    }
    setTimeout(finish, timeoutMs);
  });
}

/**
 * Apaga os dados da conta guardados neste aparelho.
 * `keepPendingSync: false` (conta eliminada) apaga também as filas por sincronizar.
 * Devolve as chaves removidas.
 */
export async function clearUserScopedData({ keepPendingSync = true, storage, idb, timeoutMs = 1500 } = {}) {
  const store = resolveStorage(storage);
  const removed = [];
  if (store) {
    const keys = [];
    try {
      for (let i = 0; i < store.length; i++) keys.push(store.key(i));
    } catch {}
    for (const key of keys) {
      if (!isUserScopedKey(key, { keepPendingSync })) continue;
      try {
        store.removeItem(key);
        removed.push(key);
      } catch {}
    }
    try {
      store.removeItem(LOCAL_OWNER_KEY);
    } catch {}
  }

  const indexedDb = idb !== undefined ? idb : (typeof window !== 'undefined' ? window.indexedDB : null);
  if (indexedDb) {
    await Promise.all(USER_IDB_DATABASES.map((name) => deleteIdbDatabase(indexedDb, name, timeoutMs)));
  }
  return removed;
}

/**
 * Regista `userId` como dono dos dados locais. Devolve `true` quando os dados de OUTRA conta foram limpos
 * (o chamador deve recarregar a app para largar o estado em memória).
 * Instalações antigas sem dono e dados do modo convidado são adotados pela conta que entra.
 */
export async function claimLocalDataOwner(userId, { storage, idb } = {}) {
  const store = resolveStorage(storage);
  if (!store || !userId) return false;
  let owner = null;
  try {
    owner = store.getItem(LOCAL_OWNER_KEY);
  } catch {
    return false;
  }

  if (owner === userId) return false;
  const adopt = !owner || owner === GUEST_USER_ID;
  if (!adopt) {
    await clearUserScopedData({ keepPendingSync: true, storage: store, idb });
  }
  try {
    store.setItem(LOCAL_OWNER_KEY, userId);
  } catch {}
  return !adopt;
}
