#!/usr/bin/env node
/**
 * Copia todos os vídeos e posters usados pelo catálogo para uma pasta local, com a mesma estrutura de caminhos,
 * pronta para enviar para um bucket R2 teu. A origem é o dataset free-exercise-db-with-videos (licença MIT).
 *
 *   node scripts/mirror_exercise_media.mjs [--out media] [--concurrency 6]
 *
 * Depois:
 *   1. Envia a pasta para o teu bucket, por exemplo com rclone:
 *        rclone copy media r2:<teu-bucket> --progress
 *   2. No painel do R2, aplica a política de CORS de scripts/r2-cors.json (permite cache offline no service worker).
 *   3. Define no .env / Vercel:  VITE_MEDIA_BASE_URL=https://<teu-dominio-ou-pub-url>
 *      O app passa a servir tudo a partir daí, sem alterar dados (ver src/data/exerciseMedia.js).
 */
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
};
const OUT = path.resolve(ROOT, arg('--out', 'media'));
const CONCURRENCY = Number(arg('--concurrency', 6));

async function collectUrls() {
  const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { EXERCISE_CATALOG } = await vite.ssrLoadModule('/src/data/exerciseCatalog.js');
    const { VERIFIED_EXERCISE_VIDEOS } = await vite.ssrLoadModule('/src/data/exerciseVideos.js');
    const urls = new Set();
    for (const e of Object.values(EXERCISE_CATALOG)) [e.video_url, e.video_url_female, e.poster_url].forEach((u) => u && urls.add(u));
    for (const v of Object.values(VERIFIED_EXERCISE_VIDEOS)) [v.videoMale, v.videoFemale, v.poster].forEach((u) => u && urls.add(u));
    return [...urls];
  } finally {
    await vite.close();
  }
}

async function download(url) {
  const rel = new URL(url).pathname.replace(/^\/+/, '');
  const dest = path.join(OUT, rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 'skip';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(`${dest}.part`));
  fs.renameSync(`${dest}.part`, dest);
  return 'ok';
}

async function main() {
  const urls = await collectUrls();
  console.log(`${urls.length} ficheiros → ${OUT}`);
  const stats = { ok: 0, skip: 0, fail: [] };
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < urls.length) {
        const url = urls[next++];
        try {
          stats[await download(url)] += 1;
        } catch (err) {
          stats.fail.push(err.message);
        }
        if ((stats.ok + stats.skip) % 50 === 0) process.stdout.write(`  ${stats.ok + stats.skip}/${urls.length}\n`);
      }
    })
  );
  console.log(`Concluído: ${stats.ok} descarregados, ${stats.skip} já existiam, ${stats.fail.length} falharam.`);
  if (stats.fail.length) console.log(stats.fail.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
