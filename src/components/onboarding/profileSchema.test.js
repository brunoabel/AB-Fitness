/**
 * profileSchema.test.js — Testes Unitários do Modo Iniciante (progressive disclosure)
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBeginnerProfile } from './profileSchema.js';

describe('profileSchema — isBeginnerProfile (modo simples da interface)', () => {
  it('é verdadeiro quando o onboarding diz "Iniciante"', () => {
    assert.equal(isBeginnerProfile({ experienceLevel: 'beginner' }), true);
  });

  it('é falso para intermédio e avançado', () => {
    assert.equal(isBeginnerProfile({ experienceLevel: 'intermediate' }), false);
    assert.equal(isBeginnerProfile({ experienceLevel: 'advanced' }), false);
  });

  it('por omissão é verdadeiro sem perfil (convidado que ainda não fez onboarding)', () => {
    assert.equal(isBeginnerProfile(null), true);
    assert.equal(isBeginnerProfile(undefined), true);
  });
});
