import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUserScopedKey, clearUserScopedData, claimLocalDataOwner, LOCAL_OWNER_KEY } from './userDataReset.js';

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    get length() { return map.size; },
    key: (i) => Array.from(map.keys())[i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    dump: () => Object.fromEntries(map)
  };
}

describe('Dados locais por conta (privacidade em aparelho partilhado)', () => {
  it('classifica dados da conta vs preferências do aparelho', () => {
    assert.equal(isUserScopedKey('ab_fitness_history_v1'), true);
    assert.equal(isUserScopedKey('ab_subjective_readiness_2026-11-27'), true);
    assert.equal(isUserScopedKey('ab_fitness_sound_enabled_v1'), false);
    assert.equal(isUserScopedKey('sb-xyz-auth-token'), false);
    assert.equal(isUserScopedKey('ab_fitness_runs_sync_queue_v1'), false);
    assert.equal(isUserScopedKey('ab_fitness_runs_sync_queue_v1', { keepPendingSync: false }), true);
  });

  it('logout apaga histórico e mantém preferências e filas por enviar', async () => {
    const store = memoryStorage({
      ab_fitness_history_v1: '[1]',
      ab_fitness_runs_v1: '[1]',
      ab_fitness_sound_enabled_v1: 'true',
      ab_fitness_sync_queue_v1: '[1]',
      [LOCAL_OWNER_KEY]: 'user-a'
    });
    await clearUserScopedData({ storage: store, idb: null });
    assert.deepEqual(store.dump(), { ab_fitness_sound_enabled_v1: 'true', ab_fitness_sync_queue_v1: '[1]' });
  });

  it('conta eliminada apaga também as filas', async () => {
    const store = memoryStorage({ ab_fitness_sync_queue_v1: '[1]', ab_fitness_sound_enabled_v1: 'true' });
    await clearUserScopedData({ storage: store, idb: null, keepPendingSync: false });
    assert.deepEqual(store.dump(), { ab_fitness_sound_enabled_v1: 'true' });
  });

  it('outra conta no mesmo aparelho: limpa os dados da anterior e pede recarga', async () => {
    const store = memoryStorage({ ab_fitness_history_v1: '[1]', [LOCAL_OWNER_KEY]: 'user-a' });
    assert.equal(await claimLocalDataOwner('user-b', { storage: store, idb: null }), true);
    assert.equal(store.getItem('ab_fitness_history_v1'), null);
    assert.equal(store.getItem(LOCAL_OWNER_KEY), 'user-b');
  });

  it('instalação antiga sem dono e dados do convidado são adotados sem apagar', async () => {
    const legacy = memoryStorage({ ab_fitness_history_v1: '[1]' });
    assert.equal(await claimLocalDataOwner('user-a', { storage: legacy, idb: null }), false);
    assert.equal(legacy.getItem('ab_fitness_history_v1'), '[1]');

    const guest = memoryStorage({ ab_fitness_history_v1: '[1]', [LOCAL_OWNER_KEY]: 'guest-local-user' });
    assert.equal(await claimLocalDataOwner('user-a', { storage: guest, idb: null }), false);
    assert.equal(guest.getItem('ab_fitness_history_v1'), '[1]');
  });
});
