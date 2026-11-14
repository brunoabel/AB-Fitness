import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WAITLIST_SYNC_QUEUE_KEY,
  flushWaitlistSyncQueue,
  getPendingWaitlistJobs,
  joinWaitlist
} from './waitlistService.js';

function createMemoryWindow() {
  const store = new Map();
  const storage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
    removeItem: (k) => { store.delete(k); }
  };
  return { localStorage: storage };
}

async function withMockBrowser(fn) {
  const prevWindow = globalThis.window;
  const prevStorage = globalThis.localStorage;
  const mockWin = createMemoryWindow();
  globalThis.window = mockWin;
  globalThis.localStorage = mockWin.localStorage;
  try {
    return await fn(mockWin);
  } finally {
    if (prevWindow === undefined) delete globalThis.window;
    else globalThis.window = prevWindow;
    if (prevStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = prevStorage;
  }
}

describe('waitlistService — captação resiliente e fila de retry local', () => {
  it('rejeita e-mails inválidos sem gravar', async () => {
    await withMockBrowser(async () => {
      const res = await joinWaitlist({ name: 'Ana', email: 'invalido' }, { configured: false, supabaseClient: null });
      assert.equal(res.data, null);
      assert.ok(res.error);
      assert.equal(getPendingWaitlistJobs().length, 0);
    });
  });

  it('devolve cloudSaved true quando o Supabase grava com sucesso', async () => {
    await withMockBrowser(async () => {
      const fakeClient = {
        from: () => ({
          insert: async () => ({ error: null })
        })
      };
      const res = await joinWaitlist(
        { name: 'Bruno', email: 'Bruno@Example.com', goal: 'hipertrofia' },
        { configured: true, supabaseClient: fakeClient }
      );
      assert.equal(res.error, null);
      assert.equal(res.cloudSaved, true);
      assert.equal(res.queuedForRetry, false);
      assert.equal(getPendingWaitlistJobs().length, 0);
    });
  });

  it('enfileira o lead para retry quando o Supabase falha e limpa ao sincronizar depois', async () => {
    await withMockBrowser(async () => {
      const failingClient = {
        from: () => ({
          insert: async () => ({ error: { message: 'timeout de rede' } })
        })
      };
      const res = await joinWaitlist(
        { name: 'Carla', email: 'carla@example.com', goal: 'corrida' },
        { configured: true, supabaseClient: failingClient }
      );

      assert.equal(res.error, null);
      assert.equal(res.cloudSaved, false);
      assert.equal(res.queuedForRetry, true);
      assert.match(res.syncError, /timeout/);

      const pending = getPendingWaitlistJobs();
      assert.equal(pending.length, 1);
      assert.equal(pending[0].key, 'waitlist:carla@example.com');
      assert.ok(globalThis.localStorage.getItem(WAITLIST_SYNC_QUEUE_KEY));

      const recoveredClient = {
        from: () => ({
          insert: async () => ({ error: null })
        })
      };
      const flushed = await flushWaitlistSyncQueue({
        configured: true,
        supabaseClient: recoveredClient
      });
      assert.equal(flushed, 1);
      assert.equal(getPendingWaitlistJobs().length, 0);
    });
  });
});
