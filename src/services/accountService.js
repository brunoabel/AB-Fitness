import { supabase } from '../lib/supabase';
import { canUseSocial } from './socialService';

/** Apaga os dados guardados neste aparelho (localStorage com prefixo ab_/la_, IndexedDB e caches). */
export async function wipeLocalData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('ab_') || k.startsWith('la_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch { /* armazenamento indisponível */ }
  try {
    await new Promise((resolve) => {
      const req = indexedDB.deleteDatabase('ab_fitness_idb_v1');
      req.onsuccess = req.onerror = req.onblocked = () => resolve();
    });
  } catch { /* sem IndexedDB */ }
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } catch { /* sem Cache API */ }
}

/**
 * Elimina a conta: remove as fotografias do bucket, chama o RPC (apaga a conta e tudo o que depende dela)
 * e limpa o aparelho. Devolve { ok, error }. O chamador termina a sessão local depois de ok.
 */
export async function deleteMyAccount(userId) {
  if (!canUseSocial(userId)) return { ok: false, error: 'Sem sessão iniciada.' };
  try {
    const { data: files } = await supabase.storage.from('avatars').list(userId, { limit: 100 });
    if (files?.length) await supabase.storage.from('avatars').remove(files.map((f) => `${userId}/${f.name}`));

    const { error } = await supabase.rpc('delete_user_account_and_data', { p_confirm: 'ELIMINAR' });
    if (error) return { ok: false, error: error.message };

    await wipeLocalData();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Falha de ligação. Tente novamente.' };
  }
}
