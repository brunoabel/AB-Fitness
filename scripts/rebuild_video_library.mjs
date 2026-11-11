#!/usr/bin/env node
/**
 * Aplica a revisão manual à biblioteca de vídeos (src/data/exerciseVideos.js):
 *   1. remove os vídeos que mostram outro movimento (scripts/catalog/videoReview.mjs → REJECTED_VIDEO_IDS);
 *   2. garante que cada ficheiro de vídeo pertence a UM único exercício.
 *      Prioridade numa disputa: lote de casa (dono exato) → exercício base de id mais baixo (o "clássico").
 *
 *   node scripts/rebuild_video_library.mjs        (depois: node scripts/build_exercise_catalog.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { REJECTED_VIDEO_IDS, PRIORITY_VIDEO_IDS } from './catalog/videoReview.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FILE = path.join(ROOT, 'src/data/exerciseVideos.js');
const MEDIA = 'https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';

const { VERIFIED_EXERCISE_VIDEOS: current } = await import(`${FILE}?t=${Date.now()}`);
const fileKey = (url) => (url || '').split('/').pop().replace(/\.mp4$/, '');
const numericId = (v) => {
  const n = (v.aliases || []).map(Number).find((x) => Number.isInteger(x) && x > 0);
  return n ?? 100000;
};

// Vídeos com dono exato fora do catálogo de 320 (ids antigos dos planos)
const EXTRA = {
  'supino-reto-halteres': {
    canonicalId: 'supino-reto-halteres',
    name: 'Supino Reto com Halteres',
    englishName: 'Dumbbell Bench Press',
    category: 'chest',
    videoMale: `${MEDIA}/exercise-videos/male/dumbbell-bench-press.mp4`,
    videoFemale: `${MEDIA}/exercise-videos/female/dumbbell-bench-press.mp4`,
    poster: `${MEDIA}/exercise-posters/male/dumbbell-bench-press.jpg`,
    equipment: 'dumbbell',
    keyCues: ['Escápulas retraídas no banco', 'Cotovelos a 45–60°', 'Descida controlada até ao peito'],
    aliases: ['supino-reto-halteres', 'supino-halteres-soccer', 'Supino Reto com Halteres']
  },
  // Vídeo livre do dataset que é o par exato (só existe a versão feminina)
  'ponte-gluteos-barra-glute-bridge': {
    canonicalId: 'ponte-gluteos-barra-glute-bridge',
    name: 'Ponte de Glúteos no Solo com Barra (Glute Bridge)',
    englishName: 'Glute Bridge',
    category: 'glutes',
    videoMale: `${MEDIA}/exercise-videos/female/hip-raise-bridge.mp4`,
    videoFemale: `${MEDIA}/exercise-videos/female/hip-raise-bridge.mp4`,
    poster: `${MEDIA}/exercise-posters/female/hip-raise-bridge.jpg`,
    equipment: 'barbell',
    keyCues: ['Calcanhares perto dos glúteos', 'Suba até alinhar ombro, quadril e joelho', 'Aperte os glúteos no topo'],
    aliases: ['ponte-gluteos-barra-glute-bridge', 'Ponte de Glúteos no Solo com Barra (Glute Bridge)']
  }
};

const rejected = new Set(REJECTED_VIDEO_IDS);
const priority = new Map(PRIORITY_VIDEO_IDS.map((id, i) => [id, i]));
const candidates = [...Object.values(current).filter((v) => !rejected.has(v.canonicalId)), ...Object.values(EXTRA)]
  .filter((v, i, arr) => arr.findIndex((x) => x.canonicalId === v.canonicalId) === i)
  .sort((a, b) => {
    const pa = priority.has(a.canonicalId) ? priority.get(a.canonicalId) : Infinity;
    const pb = priority.has(b.canonicalId) ? priority.get(b.canonicalId) : Infinity;
    return pa - pb || numericId(a) - numericId(b);
  });

const owners = new Map();
const dropped = [];
for (const v of candidates) {
  const key = fileKey(v.videoMale);
  if (!key) continue;
  if (owners.has(key)) dropped.push(`${v.name} (vídeo já pertence a: ${owners.get(key).name})`);
  else owners.set(key, v);
}

const kept = Object.fromEntries([...owners.values()].map((v) => [v.canonicalId, v]));
const src = fs.readFileSync(FILE, 'utf8');
const start = src.indexOf('export const VERIFIED_EXERCISE_VIDEOS = {');
const end = src.indexOf('\n};\n', start) + 4;
const header = `/**
 * BANCO DE VÍDEOS DE EXECUÇÃO (Free Exercise DB with Videos, licença MIT · Cloudflare R2).
 * Regra: cada exercício mostra apenas o vídeo do próprio movimento e cada vídeo pertence a um só exercício.
 * Gerado/filtrado por scripts/rebuild_video_library.mjs a partir da revisão em scripts/catalog/videoReview.mjs.
 * Exercícios sem vídeo aqui mostram as dicas de execução no player (nunca o vídeo de outro exercício).
 */

`;
fs.writeFileSync(FILE, `${header}export const VERIFIED_EXERCISE_VIDEOS = ${JSON.stringify(kept, null, 2)};\n${src.slice(end)}`);

console.log(`Mantidos: ${owners.size} vídeos únicos · rejeitados pela revisão: ${rejected.size} · repetidos removidos: ${dropped.length}`);
dropped.forEach((d) => console.log(`  - ${d}`));
