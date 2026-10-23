/**
 * idbDraft.js — Gestor Nativo de Rascunhos em IndexedDB (AB Fitness)
 * 
 * Substitui o LocalStorage para dados de alta frequência (como coordenadas de GPS),
 * evitando bloquear a thread principal em corridas longas (~3600 pontos/hora).
 * Sem dependências externas. Inclui migração retrocompatível única a partir do LocalStorage.
 */

const DB_NAME = 'ab_fitness_idb_v1';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const RUN_DRAFT_KEY = 'active_run_draft';
const LEGACY_STORAGE_KEY = 'ab_fitness_active_run_draft_v1';

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('IndexedDB inacessível, a recorrer a fallback local.');
          resolve(null);
        };
      } catch (err) {
        console.warn('Exceção ao abrir IndexedDB:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Lê o rascunho de corrida ativo. Executa migração única caso exista rascunho antigo no LocalStorage.
 */
export async function getRunDraftFromIDB() {
  try {
    const db = await getDB();
    if (!db) {
      // Fallback síncrono retrocompatível se o IndexedDB falhar
      const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    }

    const draft = await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(RUN_DRAFT_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });

    if (draft) return draft;

    // Migração única a partir do LocalStorage antigo
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw);
        await saveRunDraftToIDB(parsed);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return parsed;
      } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    return null;
  } catch (err) {
    console.warn('Erro ao obter rascunho de corrida no IDB:', err);
    return null;
  }
}

/**
 * Guarda o rascunho de corrida no IndexedDB de forma assíncrona.
 */
export async function saveRunDraftToIDB(draft) {
  try {
    // Garante que o LocalStorage legado não acumula duplicados
    localStorage.removeItem(LEGACY_STORAGE_KEY);

    const db = await getDB();
    if (!db) {
      if (draft) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(draft));
      } else {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
      return;
    }

    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        if (!draft) {
          store.delete(RUN_DRAFT_KEY);
        } else {
          store.put(draft, RUN_DRAFT_KEY);
        }
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch (err) {
    console.warn('Erro ao guardar rascunho de corrida no IDB:', err);
  }
}

/**
 * Limpa o rascunho de corrida de forma definitiva (IDB e LocalStorage).
 */
export async function clearRunDraftFromIDB() {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  try {
    const db = await getDB();
    if (!db) return;

    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(RUN_DRAFT_KEY);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch (err) {}
}
