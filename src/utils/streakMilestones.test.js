/**
 * streakMilestones.test.js — Testes Unitários do Motion Graphic de Streak
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  STREAK_MILESTONES,
  getStreakTier,
  getStreakMilestoneInfo,
  shouldShowStreakCelebration,
  markStreakCelebrated
} from './streakMilestones.js';

describe('streakMilestones — getStreakTier', () => {
  it('classifica os 4 patamares pela sequência atual', () => {
    assert.equal(getStreakTier(5), 'base');
    assert.equal(getStreakTier(10), 'ferro');
    assert.equal(getStreakTier(29), 'ferro');
    assert.equal(getStreakTier(30), 'platina');
    assert.equal(getStreakTier(99), 'platina');
    assert.equal(getStreakTier(100), 'prisma');
    assert.equal(getStreakTier(365), 'prisma');
  });
});

describe('streakMilestones — getStreakMilestoneInfo', () => {
  it('deteta avanço diário normal sem marco', () => {
    const info = getStreakMilestoneInfo(5, 4);
    assert.equal(info.advanced, true);
    assert.equal(info.isMilestone, false);
    assert.equal(info.milestone, null);
    assert.equal(info.title, null);
  });

  it('deteta marco oficial exatamente no dia em que é atingido', () => {
    const info = getStreakMilestoneInfo(10, 9);
    assert.equal(info.isMilestone, true);
    assert.equal(info.milestone, 10);
    assert.equal(info.title, 'Ritmo de Ferro');
    assert.equal(info.tier, 'ferro');
  });

  it('não marca como marco se o número já tinha sido atingido antes (sem avanço)', () => {
    const info = getStreakMilestoneInfo(10, 10);
    assert.equal(info.advanced, false);
    assert.equal(info.isMilestone, false);
  });

  it('identifica corretamente o próximo marco', () => {
    assert.equal(getStreakMilestoneInfo(5, 4).nextMilestone, 7);
    assert.equal(getStreakMilestoneInfo(10, 9).nextMilestone, 14);
    assert.equal(getStreakMilestoneInfo(365, 364).nextMilestone, null);
  });

  it('o anel fecha a 100% exatamente no dia do marco, e reabre a seguir até ao próximo', () => {
    assert.equal(getStreakMilestoneInfo(7, 6).progressToNext, 1); // marco atingido: anel fecha
    assert.equal(getStreakMilestoneInfo(10, 9).progressToNext, 1); // outro marco: fecha de novo
    const logoDepois = getStreakMilestoneInfo(8, 7).progressToNext; // dia seguinte ao marco 7
    assert.ok(logoDepois > 0 && logoDepois < 1);
  });

  it('o progresso anterior corresponde ao valor antes do avanço, para animar a transição', () => {
    const info = getStreakMilestoneInfo(10, 9);
    const anterior = getStreakMilestoneInfo(9, 8).progressToNext;
    assert.equal(info.previousProgress, anterior);
  });

  it('todos os marcos oficiais têm título editorial definido', () => {
    STREAK_MILESTONES.forEach((m) => {
      const info = getStreakMilestoneInfo(m, m - 1);
      assert.equal(typeof info.title, 'string');
      assert.ok(info.title.length > 0);
    });
  });
});

/** Mock mínimo de Storage (Node não tem localStorage nativo no test runner). */
function createMockStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v))
  };
}

describe('streakMilestones — persistência (uma celebração por dia real)', () => {
  const today = new Date(2026, 10, 13);
  const amanha = new Date(2026, 10, 14);
  let storage;

  beforeEach(() => {
    storage = createMockStorage();
  });

  it('mostra a celebração na primeira vez que a sequência avança', () => {
    assert.equal(shouldShowStreakCelebration(5, { today, storage }), true);
  });

  it('não mostra novamente no mesmo dia depois de marcada', () => {
    markStreakCelebrated(5, { today, storage });
    assert.equal(shouldShowStreakCelebration(5, { today, storage }), false);
  });

  it('mostra de novo no dia seguinte se a sequência avançou', () => {
    markStreakCelebrated(5, { today, storage });
    assert.equal(shouldShowStreakCelebration(6, { today: amanha, storage }), true);
  });

  it('não mostra no dia seguinte se a sequência não avançou (quebrou e recomeçou igual)', () => {
    markStreakCelebrated(5, { today, storage });
    assert.equal(shouldShowStreakCelebration(5, { today: amanha, storage }), false);
  });

  it('nunca mostra para sequência zero', () => {
    assert.equal(shouldShowStreakCelebration(0, { today, storage }), false);
  });

  it('sem storage disponível (ambiente sem localStorage), nunca mostra', () => {
    assert.equal(shouldShowStreakCelebration(5, { today, storage: null }), false);
  });
});
