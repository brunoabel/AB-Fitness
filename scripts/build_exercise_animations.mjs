#!/usr/bin/env node
/**
 * Gera os vídeos e capas dos exercícios a partir da cópia local do Open Exercises Dataset (Laurent Wu, CC BY 4.0).
 *
 *   node scripts/build_exercise_animations.mjs [--src media/open-exercises-dataset/media] [--force]
 *
 * Cópia local completa (todas as animações, fora do git):
 *   curl -L -o media/oed.tar.gz https://codeload.github.com/laurentwu/open-exercises-dataset/tar.gz/<commit>
 *   mkdir -p media/open-exercises-dataset && tar -xzf media/oed.tar.gz -C media/open-exercises-dataset --strip-components=1
 *
 * Só converte as animações usadas em src/data/exerciseAnimations.js:
 *   public/exercise-videos/<id>.mp4  (H.264, sem áudio, faststart)
 *   public/exercise-posters/<id>.jpg (primeiro frame)
 * Requer ffmpeg com libx264.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { EXERCISE_ANIMATIONS, DRILL_ANIMATIONS } from '../src/data/exerciseAnimations.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
};
const SRC = path.resolve(ROOT, arg('--src', 'media/open-exercises-dataset/media'));
const FORCE = process.argv.includes('--force');
const VIDEO_DIR = path.join(ROOT, 'public/exercise-videos');
const POSTER_DIR = path.join(ROOT, 'public/exercise-posters');

if (!fs.existsSync(SRC)) {
  console.error(`Pasta de origem em falta: ${SRC}`);
  process.exit(1);
}
fs.mkdirSync(VIDEO_DIR, { recursive: true });
fs.mkdirSync(POSTER_DIR, { recursive: true });

const ids = [...new Set([...Object.values(EXERCISE_ANIMATIONS), ...Object.values(DRILL_ANIMATIONS)])].sort();
const ffmpeg = (args) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const stats = { ok: 0, skip: 0, missing: [] };

for (const id of ids) {
  const src = ['gif', 'webp'].map((ext) => path.join(SRC, `${id}.${ext}`)).find((f) => fs.existsSync(f));
  if (!src) {
    stats.missing.push(id);
    continue;
  }
  const video = path.join(VIDEO_DIR, `${id}.mp4`);
  const poster = path.join(POSTER_DIR, `${id}.jpg`);
  if (!FORCE && fs.existsSync(video) && fs.existsSync(poster)) {
    stats.skip += 1;
    continue;
  }
  ffmpeg(['-i', src, '-vf', 'fps=25,format=yuv420p,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-movflags', '+faststart', '-an', video]);
  ffmpeg(['-i', video, '-frames:v', '1', '-q:v', '4', poster]);
  stats.ok += 1;
}

console.log(`${ids.length} animações: ${stats.ok} geradas, ${stats.skip} já existiam, ${stats.missing.length} em falta.`);
if (stats.missing.length) {
  console.log(stats.missing.join('\n'));
  process.exit(1);
}
