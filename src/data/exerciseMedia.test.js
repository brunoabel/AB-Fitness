import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { animationMedia, getExerciseMedia, getDrillMedia, hasExerciseVideo, EXERCISE_CATALOG } from './exerciseMedia.js';
import { EXERCISE_ANIMATIONS, DRILL_ANIMATIONS, SHARED_ANIMATIONS } from './exerciseAnimations.js';
import { OPEN_EXERCISES_BATCH, OPEN_EXERCISES } from './openExercisesBatch.js';
import { EXERCISES_100, findExerciseIn100 } from './exercises100.js';
import { getBiomechanicsForExercise } from './exerciseBiomechanics.js';
import { DRILLS } from './recoveryProtocols.js';

const PUBLIC = new URL('../../public/', import.meta.url);

describe('animationMedia', () => {
  it('vídeo e capa servidos pelo próprio app, ou por outro host se configurado', () => {
    assert.deepEqual(animationMedia('push-up', ''), { video: '/exercise-videos/push-up.mp4', poster: '/exercise-posters/push-up.jpg' });
    assert.equal(animationMedia('push-up', 'https://cdn.x').video, 'https://cdn.x/exercise-videos/push-up.mp4');
    assert.deepEqual(animationMedia(null), { video: null, poster: null });
  });
});

describe('getExerciseMedia', () => {
  it('cada exercício recebe a sua animação; sem animação fiel fica sem vídeo', () => {
    assert.equal(getExerciseMedia('supino-reto-barra').video, '/exercise-videos/barbell-bench-press.mp4');
    assert.equal(hasExerciseVideo('supino-reto-barra'), true);
    assert.equal(getExerciseMedia('larsen-press-sem-pes').video, null);
    assert.equal(hasExerciseVideo('larsen-press-sem-pes'), false);
  });

  it('drills de recuperação usam a animação própria ou a do exercício ligado', () => {
    assert.equal(getDrillMedia({ id: 'cat-cow', ...DRILLS['cat-cow'] }).video, '/exercise-videos/cat-cow.mp4');
    assert.equal(getDrillMedia({ id: 'ankle-wall', ...DRILLS['ankle-wall'] }).video, '/exercise-videos/knee-to-wall-ankle-mobilization.mp4');
  });

  it('todos os drills de recuperação têm vídeo', () => {
    for (const [id, d] of Object.entries(DRILLS)) assert.ok(getDrillMedia({ id, ...d }).video, `drill sem vídeo: ${id}`);
  });
});

describe('exerciseAnimations', () => {
  it('só referencia exercícios e drills que existem', () => {
    for (const id of Object.keys(EXERCISE_ANIMATIONS)) assert.ok(EXERCISE_CATALOG[id], `catálogo sem ${id}`);
    for (const id of Object.keys(DRILL_ANIMATIONS)) assert.ok(DRILLS[id], `drill inexistente ${id}`);
  });

  it('todas as animações têm vídeo e capa em public/', () => {
    for (const id of new Set([...Object.values(EXERCISE_ANIMATIONS), ...Object.values(DRILL_ANIMATIONS)])) {
      assert.ok(fs.existsSync(new URL(`exercise-videos/${id}.mp4`, PUBLIC)), `vídeo em falta: ${id}`);
      assert.ok(fs.existsSync(new URL(`exercise-posters/${id}.jpg`, PUBLIC)), `capa em falta: ${id}`);
    }
  });

  it('animação repetida só quando declarada como variante do mesmo movimento', () => {
    const count = {};
    for (const a of Object.values(EXERCISE_ANIMATIONS)) count[a] = (count[a] || 0) + 1;
    const repeated = Object.keys(count).filter((a) => count[a] > 1).sort();
    assert.deepEqual(repeated, [...SHARED_ANIMATIONS].sort());
  });
});

describe('lote de 133 exercícios com animação', () => {
  it('entra na biblioteca, no catálogo e na ficha técnica com ids únicos', () => {
    assert.equal(OPEN_EXERCISES_BATCH.length, 133);
    const ids = EXERCISES_100.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length);
    const slugs = EXERCISES_100.map((e) => e.slug);
    assert.equal(new Set(slugs).size, slugs.length);
    for (const e of OPEN_EXERCISES) {
      assert.equal(findExerciseIn100(e.slug)?.id, e.id);
      assert.ok(EXERCISE_CATALOG[e.slug], `catálogo sem ${e.slug}`);
      assert.equal(getBiomechanicsForExercise(e).slug, e.slug, `ficha errada para ${e.slug}`);
      assert.ok(hasExerciseVideo(e), `sem vídeo: ${e.slug}`);
    }
  });
});
