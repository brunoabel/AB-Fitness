import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAttribution } from './attribution.js';

describe('parseAttribution', () => {
  it('lê utm, ref de indicação e página de entrada', () => {
    const a = parseAttribution('https://abfitness.app/?utm_source=instagram&utm_medium=bio&ref=ab12cd34', 'https://l.instagram.com/');
    assert.equal(a.utm_source, 'instagram');
    assert.equal(a.utm_medium, 'bio');
    assert.equal(a.ref, 'AB12CD34');
    assert.equal(a.referrer, 'https://l.instagram.com/');
    assert.equal(a.landing_path, '/?utm_source=instagram&utm_medium=bio&ref=ab12cd34');
  });

  it('ignora referrer do próprio domínio e ref com formato inválido', () => {
    const a = parseAttribution('https://abfitness.app/?ref=<script>', 'https://abfitness.app/termos');
    assert.equal(a.referrer, undefined);
    assert.equal(a.ref, undefined);
  });

  it('URL inválido devolve null', () => {
    assert.equal(parseAttribution('não é url'), null);
  });
});
