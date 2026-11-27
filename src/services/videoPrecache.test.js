import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPrecacheVideos, collectVideoUrls } from './videoPrecache.js';

describe('shouldPrecacheVideos', () => {
  it('Wi-Fi e cabo sim, dados móveis e poupança de dados não', () => {
    assert.equal(shouldPrecacheVideos({ type: 'wifi' }), true);
    assert.equal(shouldPrecacheVideos({ type: 'ethernet' }), true);
    assert.equal(shouldPrecacheVideos({ type: 'cellular', effectiveType: '4g' }), false);
    assert.equal(shouldPrecacheVideos({ type: 'wifi', saveData: true }), false);
  });

  it('sem tipo de ligação (desktop) decide pela qualidade; sem API (iOS) segue', () => {
    assert.equal(shouldPrecacheVideos({ effectiveType: '4g' }), true);
    assert.equal(shouldPrecacheVideos({ effectiveType: '3g' }), false);
    assert.equal(shouldPrecacheVideos(undefined), true);
  });
});

describe('collectVideoUrls', () => {
  it('ignora exercícios sem vídeo e repetidos, no máximo 12', () => {
    const media = { a: 'https://m/a.mp4', b: null, c: 'https://m/a.mp4', d: 'https://m/d.mp4' };
    const urls = collectVideoUrls([{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], (ex) => ({ video: media[ex.id] }));
    assert.deepEqual(urls, ['https://m/a.mp4', 'https://m/d.mp4']);
    const many = Array.from({ length: 20 }, (_, i) => ({ id: String(i) }));
    assert.equal(collectVideoUrls(many, (ex) => ({ video: `https://m/${ex.id}.mp4` })).length, 12);
  });

  it('caminhos do próprio app ficam absolutos', () => {
    const urls = collectVideoUrls([{ id: 'a' }], () => ({ video: '/exercise-videos/a.mp4' }), 'https://app.test');
    assert.deepEqual(urls, ['https://app.test/exercise-videos/a.mp4']);
  });
});
