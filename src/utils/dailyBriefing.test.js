/**
 * dailyBriefing.test.js — Testes Unitários da flag "ir com calma hoje"
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setEaseModeToday, getEaseModeToday } from './dailyBriefing.js';

const createMockStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v))
  };
};

describe('dailyBriefing — setEaseModeToday / getEaseModeToday', () => {
  it('não há nada por omissão', () => {
    const storage = createMockStorage();
    assert.equal(getEaseModeToday({ storage }), null);
  });

  it('guarda e lê o músculo marcado para hoje', () => {
    const storage = createMockStorage();
    setEaseModeToday('peito', { storage });
    assert.equal(getEaseModeToday({ storage }), 'peito');
  });

  it('a chave é por dia: um dia diferente não vê a marca de outro', () => {
    const storage = createMockStorage();
    setEaseModeToday('peito', { today: new Date(2026, 10, 10), storage });
    assert.equal(getEaseModeToday({ today: new Date(2026, 10, 11), storage }), null);
    assert.equal(getEaseModeToday({ today: new Date(2026, 10, 10), storage }), 'peito');
  });

  it('sem storage disponível, nunca rebenta', () => {
    assert.doesNotThrow(() => setEaseModeToday('peito', { storage: null }));
    assert.equal(getEaseModeToday({ storage: null }), null);
  });
});
