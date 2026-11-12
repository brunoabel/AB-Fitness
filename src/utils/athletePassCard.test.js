/**
 * athletePassCard.test.js — Testes Unitários da Lógica do Athlete Pass
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAthleteRank,
  sanitizeUsername,
  buildAthletePassContent
} from './athletePassCard.js';

describe('AB Athlete Pass — Patente Atlética (getAthleteRank)', () => {
  it('retorna Starter para utilizador iniciante com poucos treinos', () => {
    const rank = getAthleteRank({ totalWorkouts: 2, streak: 1 });
    assert.equal(rank.id, 'starter');
    assert.equal(rank.label, 'Starter');
  });

  it('promove para Consistente aos 5 treinos ou streak >= 3', () => {
    assert.equal(getAthleteRank({ totalWorkouts: 5, streak: 0 }).id, 'consistent');
    assert.equal(getAthleteRank({ totalWorkouts: 2, streak: 3 }).id, 'consistent');
  });

  it('promove para Veterano aos 20 treinos ou streak >= 7', () => {
    assert.equal(getAthleteRank({ totalWorkouts: 20, streak: 0 }).id, 'veteran');
    assert.equal(getAthleteRank({ totalWorkouts: 4, streak: 7 }).id, 'veteran');
  });

  it('promove para Elite AB aos 50 treinos ou streak >= 14', () => {
    assert.equal(getAthleteRank({ totalWorkouts: 50, streak: 0 }).id, 'elite');
    assert.equal(getAthleteRank({ totalWorkouts: 10, streak: 14 }).id, 'elite');
  });

  it('atribui Founder quando isCeo é verdadeiro', () => {
    const rank = getAthleteRank({ totalWorkouts: 1, streak: 0, isCeo: true });
    assert.equal(rank.id, 'founder');
    assert.equal(rank.label, 'Founder');
  });
});

describe('AB Athlete Pass — Sanitização & Conteúdo (buildAthletePassContent)', () => {
  it('sanitiza @username removendo arrobas iniciais, espaços e maiúsculas', () => {
    assert.equal(sanitizeUsername('  @@Bruno.Abel_01! '), 'bruno.abel_01');
    assert.equal(sanitizeUsername(''), '');
    assert.equal(sanitizeUsername(null), '');
  });

  it('gera inviteUrl ?u=username e footerCallout quando username existe', () => {
    const pass = buildAthletePassContent({
      profile: { full_name: 'Bruno Abel', username: '@bruno_abel', featured_stat: 'total_workouts' },
      stats: { total_workouts: 34, streak: 8, monthly_volume_kg: 12400 }
    });

    assert.equal(pass.handle, '@bruno_abel');
    assert.equal(pass.inviteUrl, 'https://www.abfitness.app/?u=bruno_abel');
    assert.equal(pass.footerCallout, 'Segue @bruno_abel em abfitness.app');
    assert.equal(pass.heroStat.id, 'total_workouts');
    assert.equal(pass.heroStat.value, '34');
    assert.equal(pass.secondaryStats.length, 2);
    assert.ok(pass.secondaryStats.every((s) => s.id !== pass.heroStat.id));
  });

  it('formata volume >= 1000kg em toneladas limpas e fallback sem username', () => {
    const pass = buildAthletePassContent({
      profile: { featured_stat: 'monthly_volume' },
      stats: { total_workouts: 12, streak: 2, monthly_volume_kg: 15500 }
    });

    assert.equal(pass.fullName, 'Atleta AB');
    assert.equal(pass.handle, '');
    assert.equal(pass.inviteUrl, 'https://www.abfitness.app');
    assert.equal(pass.heroStat.value, '15.5 t');
    assert.ok(!pass.secondaryStats.some((s) => s.id === 'monthly_volume'));
  });
});
