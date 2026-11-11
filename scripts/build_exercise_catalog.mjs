#!/usr/bin/env node
/**
 * Gera o catálogo padronizado de exercícios do AB Fitness.
 *
 *   node scripts/build_exercise_catalog.mjs [--dataset caminho/exercises.json]
 *
 * Entradas: src/data (exercícios, vídeos auditados, biomecânica) + dataset free-exercise-db-with-videos (MIT).
 * Saídas:   src/data/exerciseCatalog.js, src/data/homeExercises.js, scripts/out/catalog_report.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { HOME_BATCH } from './catalog/homeBatch.mjs';
import { MANUAL_MATCHES } from './catalog/manualMatches.mjs';
import { norm, classifyEquipment, classifyEnvironment, matchScore, shortCue } from './catalog/classify.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATASET_URL = 'https://raw.githubusercontent.com/harshvishu/free-exercise-db-with-videos/main/data/exercises.json';
const MEDIA = 'https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';
const SUGGEST_MIN = 0.75; // só para sugestões no relatório: nada entra no app sem revisão manual
const FIRST_HOME_ID = 1001;

async function loadDataset() {
  const i = process.argv.indexOf('--dataset');
  if (i > -1) return JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8'));
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Dataset indisponível (${res.status})`);
  return res.json();
}

async function loadAppData() {
  const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const ex = await vite.ssrLoadModule('/src/data/exercises100.js');
    const vid = await vite.ssrLoadModule('/src/data/exerciseVideos.js');
    const bio = await vite.ssrLoadModule('/src/data/exerciseBiomechanics.js');
    return { base: ex.EXERCISES_BASE || ex.EXERCISES_100, getVideo: vid.getVerifiedExerciseVideo, getBio: bio.getBiomechanicsForExercise };
  } finally {
    await vite.close();
  }
}

const fileKey = (url) => (url ? url.split('/').pop().replace(/\.(mp4|jpg)$/, '') : null);
const NO_MEDIA = { video_url: null, video_url_female: null, poster_url: null };
/** URLs reais de um item do dataset (alguns só têm versão feminina). */
const mediaFromDataset = (d) => {
  const male = d.videos?.male || d.videos?.female;
  const female = d.videos?.female || d.videos?.male;
  return male ? { video_url: male, video_url_female: female, poster_url: d.thumbnails?.male || d.thumbnails?.female || null } : NO_MEDIA;
};
const mediaFromVerified = (v) => ({ video_url: v.videoMale, video_url_female: v.videoFemale || v.videoMale, poster_url: v.poster || null });
const splitMuscles = (s) => String(s || '').split(/,| e |\/|&/).map((x) => x.replace(/\(.*?\)/g, '').trim()).filter(Boolean).slice(0, 4);
const cues3 = (list) => [...new Set((list || []).map(shortCue).filter(Boolean))].slice(0, 3);

async function main() {
  const [dataset, app] = await Promise.all([loadDataset(), loadAppData()]);
  const dsByKey = new Map(dataset.map((d) => [fileKey(d.videos?.male || d.videos?.female), d]).filter(([k]) => k));
  const dsByName = new Map(dataset.map((d) => [d.name, d]));
  const usedKeys = new Set();
  const report = { verified: 0, auto: [], missing: [] };
  const catalog = {};

  // Regra: cada vídeo pertence a um único exercício. Os do lote de casa ficam reservados ao dono exato.
  for (const h of HOME_BATCH) usedKeys.add(h.source);

  // 1. Exercícios atuais
  for (const ex of app.base) {
    const bio = app.getBio(ex) || {};
    const text = `${ex.nome} ${bio.equipamento || ''}`;
    const equipment = classifyEquipment(text);
    const verified = app.getVideo(ex);
    const manual = dsByName.get(MANUAL_MATCHES[ex.slug]);
    let mediaFields = NO_MEDIA;
    let source = null;
    let cues = null;

    const takenKey = (m) => {
      const k = fileKey(m?.video_url);
      return k && usedKeys.has(k);
    };
    if (verified && takenKey(mediaFromVerified(verified))) {
      report.missing.push(`${ex.grupo} · ${ex.nome} _(vídeo já usado por outro exercício)_`);
    } else if (verified) {
      report.verified += 1;
      mediaFields = mediaFromVerified(verified);
      source = 'verified';
      cues = verified.keyCues;
    } else if (manual && !takenKey(mediaFromDataset(manual))) {
      mediaFields = mediaFromDataset(manual);
      source = 'dataset';
      cues = manual.formCues;
      report.auto.push(`${ex.nome} → ${manual.name}`);
    } else {
      let best = null;
      for (const d of dataset) {
        const s = matchScore(ex.nome, equipment, d);
        if (s >= SUGGEST_MIN && (!best || s > best.s)) best = { s, d };
      }
      report.missing.push(`${ex.grupo} · ${ex.nome}${best ? ` _(sugestão a rever: ${best.d.name})_` : ''}`);
    }
    const key = fileKey(mediaFields.video_url);
    if (key) usedKeys.add(key);

    catalog[ex.slug] = {
      id: ex.slug,
      legacy_id: ex.id,
      name: ex.nome,
      primary_muscle: ex.grupo,
      secondary_muscles: splitMuscles(bio.sinergistas),
      environment: classifyEnvironment(equipment, text),
      equipment,
      ...mediaFields,
      video_source: source,
      form_cues: cues3(bio.checkpoints?.length ? bio.checkpoints : cues),
      home_alternative_id: null
    };
  }

  // 2. Lote de casa
  const homeExercises = [];
  HOME_BATCH.forEach((h, i) => {
    const d = dsByKey.get(h.source);
    if (!d) return report.missing.push(`(lote casa ignorado) ${h.nome}`);
    const id = FIRST_HOME_ID + i;
    homeExercises.push({ id, nome: h.nome, grupo: h.grupo, mecanica: h.mecanica, series: 3, reps: h.mecanica === 'Composto' ? '8-12' : '12-15', descanso_seg: h.mecanica === 'Composto' ? 75 : 45, slug: h.slug });
    catalog[h.slug] = {
      id: h.slug, legacy_id: id, name: h.nome, primary_muscle: h.grupo,
      secondary_muscles: (d.secondaryMuscles || []).slice(0, 4),
      environment: h.environment, equipment: h.equipment, ...mediaFromDataset(d), video_source: 'verified',
      form_cues: h.cues || cues3(d.formCues), home_alternative_id: null
    };
  });

  // 3. Alternativa de casa: mesmo grupo, ambiente de casa, com vídeo, nome mais parecido
  const entries = Object.values(catalog);
  for (const e of entries) {
    if (e.environment !== 'gym') continue;
    const words = new Set(norm(e.name).split(' ').filter((w) => w.length > 3));
    const candidates = entries.filter((c) => c.primary_muscle === e.primary_muscle && c.environment !== 'gym' && c.video_url);
    candidates.sort((a, b) => {
      const sa = norm(a.name).split(' ').filter((w) => words.has(w)).length;
      const sb = norm(b.name).split(' ').filter((w) => words.has(w)).length;
      return sb - sa || (a.environment === 'home_minimal' ? -1 : 1);
    });
    e.home_alternative_id = candidates[0]?.id || null;
  }

  // 4. Escrita
  const header = '/* Gerado por scripts/build_exercise_catalog.mjs — não editar à mão. */\n';
  fs.writeFileSync(path.join(ROOT, 'src/data/exerciseCatalog.js'), `${header}export const EXERCISE_CATALOG = ${JSON.stringify(catalog, null, 1)};\n`);
  fs.writeFileSync(path.join(ROOT, 'src/data/homeExercises.js'), `${header}export const HOME_EXERCISES = ${JSON.stringify(homeExercises, null, 1)};\n`);

  const withVideo = entries.filter((e) => e.video_url).length;
  const noAlt = entries.filter((e) => e.environment === 'gym' && !e.home_alternative_id).length;
  const md = [
    '# Catálogo de exercícios — relatório', '',
    `- Total: ${entries.length} (${app.base.length} atuais + ${homeExercises.length} de casa)`,
    `- Com vídeo: ${withVideo} (${Math.round((withVideo / entries.length) * 100)}%) · auditados: ${report.verified} · ligados à mão: ${report.auto.length}`,
    `- Sem vídeo: ${entries.length - withVideo} · exercícios de ginásio sem alternativa de casa: ${noAlt}`, '',
    '## Vídeos do dataset ligados por revisão manual', ...report.auto.map((s) => `- ${s}`), '',
    '## Sem vídeo (lista de gravação)', ...report.missing.sort().map((s) => `- ${s}`), ''
  ].join('\n');
  fs.mkdirSync(path.join(ROOT, 'scripts/out'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'scripts/out/catalog_report.md'), md);
  console.log(md.split('\n').slice(0, 6).join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
