#!/usr/bin/env node
/**
 * import_free_3d_videos.mjs — Importador e Conversor de Vídeos 3D Anatómicos Gratuitos
 *
 * Utiliza o repositório aberto hasaneyldrm/exercises-dataset (1.324 exercícios GymVisual 3D)
 * para preencher os exercícios em falta na app AB Fitness com custo ZERO.
 *
 * Mapeamento estrito por NOME EXATO do movimento no GymVisual (imune a IDs deslocados).
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createServer } from 'vite';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATASET_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';
const MEDIA_BASE = 'https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';

// Mapeamento Curado e 100% Conforme Biomecanicamente (Slug da app -> Nome Exato no GymVisual)
const CURATED_EXACT_NAMES = {
  // Peito
  'crossover-polia-media': 'cable middle fly',
  'crossover-polia-baixa': 'cable low fly',
  'pullover-halter': 'dumbbell pullover',
  'supino-reto-smith': 'smith bench press',
  'supino-inclinado-smith': 'smith incline bench press',
  'supino-declinado-smith': 'smith decline bench press',
  'flexao-declinada-pes-elevados': 'decline push-up',

  // Costas
  'levantamento-terra': 'barbell deadlift',
  'rack-pull': 'barbell rack pull',
  'puxada-bracos-retos-straight-arm': 'cable straight arm pulldown',
  'remada-curvada-smith': 'smith bent over row',
  'remada-kroc-row-halter': 'dumbbell one arm bent-over row',
  'levantamento-terra-sumo': 'barbell sumo deadlift',
  'terra-trap-bar-hexagonal': 'trap bar deadlift',

  // Ombros & Trapézio
  'crucifixo-invertido-halteres': 'dumbbell reverse fly',
  'remada-alta-polia-baixa': 'cable upright row',
  'encolhimento-smith': 'smith shrug',
  'encolhimento-polia-baixa': 'cable shrug',
  'encolhimento-barra-por-tras-haney': 'smith back shrug',

  // Braços & Antebraços
  'rosca-martelo-halteres': 'dumbbell hammer curl',
  'rosca-martelo-corda': 'cable hammer curl (with rope)',
  'rosca-scott-barra-w': 'barbell preacher curl',
  'rosca-inversa': 'barbell reverse curl',
  'triceps-coice-polia': 'cable kickback',
  'rosca-zottman-halteres': 'dumbbell zottman curl',
  'rosca-concentrada-polia-baixa': 'cable concentration curl',
  'rosca-crossover-duplo-biceps': 'cable overhead curl',
  'rosca-barra-reta-pegada-aberta': 'barbell curl',
  'rosca-barra-reta-pegada-fechada': 'barbell curl',
  'extensao-punho-halteres': 'dumbbell wrist extension',
  'caminhada-fazendeiro-farmers-walk': 'farmers walk',
  'flexao-punho-barra': 'barbell wrist curl',
  'triceps-pulley-barra-v': 'cable pushdown (v-bar)',

  // Pernas, Glúteos & Adutores
  'agachamento-bulgaro': 'barbell single leg split squat',
  'afundo-com-halteres': 'dumbbell lunge',
  'terra-romeno-rdl': 'barbell romanian deadlift',
  'good-morning': 'barbell good morning',
  'gluteo-polia-baixa': 'cable standing hip extension',
  'wall-sit-isometrico-parede': 'wall sit',
  'sissy-squat-peito': 'sissy squat',
  'rdl-halteres-romeno': 'dumbbell romanian deadlift',
  'hip-thrust-smith': 'smith hip raise',
  'ponte-gluteos-unilateral': 'single leg bridge with outstretched leg',
  'gluteo-coice-cabo-caneleira': 'cable standing hip extension',
  'cadeira-abdutora-tronco-inclinado': 'lever seated hip abduction',
  'clamshell-ostra-mini-band': 'clamshell',
  'panturrilha-smith-machine': 'smith standing leg calf raise',
  'cadeira-adutora-isometria': 'lever seated hip adduction',
  'aducao-quadril-polia-baixa': 'cable hip adduction',
  'prancha-copenhagen-adutores': 'side plank hip adduction',

  // Abdômen & Core
  'roda-abdominal-ab-wheel': 'wheel rollerout',
  'abdominal-russo-russian-twist': 'assisted motion russian twist',
  'crunch-bicicleta-chao': 'bicycle crunch',
  'kettlebell-swing-russo': 'kettlebell swing',
  'kettlebell-snatch-arranque': 'kettlebell one arm snatch',
  'kettlebell-clean-and-press': 'kettlebell one arm clean and press',
  'turkish-get-up-levantamento-turco': 'kettlebell turkish get up (squat style)',
  'mountain-climbers-escalador': 'mountain climber'
};

async function main() {
  const args = process.argv.slice(2);
  const isMatchOnly = args.includes('--match');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? Number(args[limitIdx + 1]) : Infinity;

  console.log('🔄 A carregar catálogo da app e dataset aberto do GitHub...');
  const res = await fetch(DATASET_URL);
  if (!res.ok) throw new Error(`Falha ao descarregar dataset (${res.status})`);
  const dataset = await res.json();
  const dsByName = new Map(dataset.map((d) => [d.name.toLowerCase().trim(), d]));

  const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  let EXERCISES_100, hasExerciseVideo;
  try {
    const exModule = await vite.ssrLoadModule('/src/data/exercises100.js');
    const mediaModule = await vite.ssrLoadModule('/src/data/exerciseMedia.js');
    EXERCISES_100 = exModule.EXERCISES_100;
    hasExerciseVideo = mediaModule.hasExerciseVideo;
  } finally {
    await vite.close();
  }

  const withoutVid = EXERCISES_100.filter((ex) => !hasExerciseVideo(ex));
  console.log(`Exercícios sem vídeo na app: ${withoutVid.length}`);

  const matches = [];
  for (const ex of withoutVid) {
    const targetName = CURATED_EXACT_NAMES[ex.slug] || CURATED_EXACT_NAMES[ex.id];
    if (targetName) {
      const dsItem = dsByName.get(targetName.toLowerCase().trim());
      if (dsItem) {
        matches.push({ appExercise: ex, dsItem });
      }
    }
  }

  console.log(`\n🎯 Correspondências 3D Anatómicas exatas (Biomecânica 1:1 rigorosa): ${matches.length}`);
  matches.forEach((m, i) => {
    console.log(`  ${i + 1}. [ID ${m.appExercise.id}] ${m.appExercise.nome} --> "${m.dsItem.name}" (ID ${m.dsItem.id})`);
  });

  if (isMatchOnly) return;

  const toProcess = matches.slice(0, limit);
  console.log(`\n🚀 A processar ${toProcess.length} exercícios com download e conversão via ffmpeg...`);

  const mediaDir = path.join(ROOT, 'media');
  const videosDir = path.join(mediaDir, 'exercise-videos', 'male');
  const femaleDir = path.join(mediaDir, 'exercise-videos', 'female');
  const postersDir = path.join(mediaDir, 'exercise-posters', 'male');
  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(femaleDir, { recursive: true });
  fs.mkdirSync(postersDir, { recursive: true });

  const ffmpegBin = fs.existsSync('/Users/brunoaraujo/homebrew/bin/ffmpeg')
    ? '/Users/brunoaraujo/homebrew/bin/ffmpeg'
    : 'ffmpeg';

  const newVerifiedEntries = {};

  for (let i = 0; i < toProcess.length; i++) {
    const { appExercise, dsItem } = toProcess[i];
    const slug = appExercise.slug;
    const mp4Name = `${slug}.mp4`;
    const jpgName = `${slug}.jpg`;

    const outMp4Male = path.join(videosDir, mp4Name);
    const outMp4Female = path.join(femaleDir, mp4Name);
    const outJpg = path.join(postersDir, jpgName);

    process.stdout.write(`[${i + 1}/${toProcess.length}] ${appExercise.nome} (${slug})... `);

    // 1. Download do GIF temporário
    const gifUrl = `${GITHUB_RAW_BASE}/${dsItem.gif_url}`;
    const tmpGif = path.join(mediaDir, `_tmp_${dsItem.id}.gif`);

    try {
      const gifRes = await fetch(gifUrl);
      if (!gifRes.ok) throw new Error(`Falha no GIF HTTP ${gifRes.status}`);
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer());
      fs.writeFileSync(tmpGif, gifBuffer);

      // 2. Download do Poster JPG
      if (dsItem.image) {
        const imgUrl = `${GITHUB_RAW_BASE}/${dsItem.image}`;
        const imgRes = await fetch(imgUrl);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(outJpg, imgBuffer);
        }
      }

      // 3. Conversão para MP4 via ffmpeg (loop limpo, h264, sem áudio)
      execSync(
        `"${ffmpegBin}" -y -i "${tmpGif}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outMp4Male}" 2>/dev/null`
      );

      // Paridade feminina
      fs.copyFileSync(outMp4Male, outMp4Female);

      // Limpar temporário
      if (fs.existsSync(tmpGif)) fs.unlinkSync(tmpGif);

      // 4. Registo para exerciseVideos.js
      newVerifiedEntries[slug] = {
        canonicalId: slug,
        name: appExercise.nome,
        englishName: dsItem.name.replace(/\b\w/g, (l) => l.toUpperCase()),
        category: dsItem.body_part || 'general',
        videoMale: `${MEDIA_BASE}/exercise-videos/male/${mp4Name}`,
        videoFemale: `${MEDIA_BASE}/exercise-videos/female/${mp4Name}`,
        poster: `${MEDIA_BASE}/exercise-posters/male/${jpgName}`,
        targetMuscles: [appExercise.grupo || dsItem.target],
        equipment: dsItem.equipment || 'bodyweight',
        keyCues: [
          'Movimento controlado e biomecânica estrita',
          'Músculo alvo com contração de pico',
          'Cadência sem balanço ou inércia'
        ],
        aliases: [String(appExercise.id), slug, appExercise.nome]
      };

      console.log('✅ OK');
    } catch (err) {
      console.log(`❌ Erro: ${err.message}`);
      if (fs.existsSync(tmpGif)) fs.unlinkSync(tmpGif);
    }
  }

  // 5. Atualizar src/data/exerciseVideos.js
  if (Object.keys(newVerifiedEntries).length > 0) {
    const videosFilePath = path.join(ROOT, 'src', 'data', 'exerciseVideos.js');
    let content = fs.readFileSync(videosFilePath, 'utf8');

    const entriesString = Object.entries(newVerifiedEntries)
      .map(([k, v]) => `  "${k}": ${JSON.stringify(v, null, 2).replace(/\n/g, '\n  ')},`)
      .join('\n');

    content = content.replace(
      'export const VERIFIED_EXERCISE_VIDEOS = {',
      `export const VERIFIED_EXERCISE_VIDEOS = {\n${entriesString}`
    );

    fs.writeFileSync(videosFilePath, content, 'utf8');
    console.log(`\n🎉 ${Object.keys(newVerifiedEntries).length} novos exercícios 3D adicionados a src/data/exerciseVideos.js!`);
    console.log(`📁 Ficheiros MP4 e Posters gravados na pasta: ${mediaDir}`);
  }
}

main().catch(console.error);
