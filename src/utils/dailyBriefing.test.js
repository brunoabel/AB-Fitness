/**
 * dailyBriefing.test.js — Testes Unitários da flag "ir com calma hoje"
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setEaseModeToday, getEaseModeToday } from './dailyBriefing.js';
import { exerciseTargetsRegion } from '../data/muscleRegions.js';
import { getBiomechanicalSubstitutes } from '../services/abCoach/catalog.js';

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

describe('exerciseTargetsRegion — matching semântico de regiões musculares', () => {
  it('mapeia corretamente nomes anatómicos do catálogo para IDs de fadiga', () => {
    assert.equal(exerciseTargetsRegion({ target: 'Peitoral Maior', secondary: 'Tríceps' }, 'peito'), true);
    assert.equal(exerciseTargetsRegion({ target: 'Peitoral Maior', secondary: 'Tríceps' }, 'triceps'), true);
    assert.equal(exerciseTargetsRegion({ target: 'Isquiotibiais', secondary: 'Glúteos' }, 'posteriores'), true);
    assert.equal(exerciseTargetsRegion({ target: 'Panturrilhas' }, 'gemeos'), true);
    assert.equal(exerciseTargetsRegion({ target: 'Peitoral Maior', secondary: 'Tríceps' }, 'quadriceps'), false);
  });
});

describe('getBiomechanicalSubstitutes — Smart Swap com excludeIds e pontuação', () => {
  it('exclui IDs já presentes na sessão e prioriza alternativas equivalentes', () => {
    const subsAll = getBiomechanicalSubstitutes('supino-reto-barra');
    assert.ok(subsAll.length > 0);
    assert.ok(!subsAll.some((s) => s.id === 'supino-reto-barra'));

    const excludedId = subsAll[0].id;
    const subsFiltered = getBiomechanicalSubstitutes('supino-reto-barra', [excludedId]);
    assert.ok(!subsFiltered.some((s) => s.id === excludedId));
    assert.ok(subsFiltered.every((s) => s.grupo === subsAll[0].grupo));
  });
});
