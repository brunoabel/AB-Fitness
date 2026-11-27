#!/usr/bin/env node
/**
 * Busca os vídeos 3D reais de exercícios do app (Cloudflare R2, dataset MIT free-exercise-db-with-videos).
 * Fonte: src/data/exerciseVideos.js (170 vídeos auditados, 1 vídeo = 1 exercício) e src/data/exerciseCatalog.js.
 * Os vídeos são renders anatômicos 3D com fundo BRANCO, 1920x1080 (16:9), ~6s, sem áudio.
 *
 *   node tools/marketing/find-exercise-media.mjs agachamento
 *   node tools/marketing/find-exercise-media.mjs "remada" --json
 *   node tools/marketing/find-exercise-media.mjs squat --download tmp/marketing/current   (baixa o vídeo masculino do 1º resultado)
 */
import { VERIFIED_EXERCISE_VIDEOS } from '../../src/data/exerciseVideos.js';
import { EXERCISE_CATALOG } from '../../src/data/exerciseCatalog.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const argv = process.argv.slice(2);
const term = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--download');
if (!term) {
  console.error('Uso: node tools/marketing/find-exercise-media.mjs <termo> [--json] [--download <pasta>]');
  process.exit(1);
}
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const q = norm(term);

const results = [];
const seen = new Set();
for (const v of Object.values(VERIFIED_EXERCISE_VIDEOS)) {
  const hay = norm([v.name, v.englishName, v.canonicalId, v.category, ...(v.targetMuscles || [])].join(' '));
  if (hay.includes(q) && v.videoMale) {
    seen.add(v.videoMale);
    results.push({ source: 'verified', name: v.name, english: v.englishName, muscles: v.targetMuscles, male: v.videoMale, female: v.videoFemale, poster: v.poster, cues: v.keyCues });
  }
}
for (const e of Object.values(EXERCISE_CATALOG)) {
  if (!e.video_url || seen.has(e.video_url)) continue;
  const hay = norm([e.name, e.id, e.primary_muscle, ...(e.secondary_muscles || [])].join(' '));
  if (hay.includes(q)) {
    seen.add(e.video_url);
    results.push({ source: 'catalog', name: e.name, muscles: [e.primary_muscle, ...(e.secondary_muscles || [])], male: e.video_url, female: e.video_url_female || null, poster: e.poster_url || null, cues: e.form_cues || [] });
  }
}

if (argv.includes('--json')) console.log(JSON.stringify(results, null, 2));
else {
  console.log(`${results.length} resultado(s) para "${term}"\n`);
  for (const r of results.slice(0, 25)) {
    console.log(`• ${r.name}  [${r.source}]  ${(r.muscles || []).join(', ')}`);
    console.log(`    male:   ${r.male}`);
    if (r.female && r.female !== r.male) console.log(`    female: ${r.female}`);
    if (r.cues?.length) console.log(`    cues:   ${r.cues.slice(0, 3).join(' · ')}`);
  }
}

const di = argv.indexOf('--download');
if (di > -1 && results[0]) {
  const dir = argv[di + 1];
  mkdirSync(dir, { recursive: true });
  const res = await fetch(results[0].male);
  if (!res.ok) throw new Error(`Download falhou (${res.status}): ${results[0].male}`);
  const file = join(dir, basename(new URL(results[0].male).pathname));
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`\n⬇️  ${file}`);
}
