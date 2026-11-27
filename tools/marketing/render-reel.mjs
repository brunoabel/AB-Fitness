#!/usr/bin/env node
/**
 * Renderiza o Reel (1080x1920, 30fps, H.264 + AAC) com o template Remotion de tools/marketing/reel-template/Reel.jsx.
 *
 *   node tools/marketing/render-reel.mjs tmp/marketing/current/reel.props.json [--out tmp/marketing/current/reel.mp4] [--draft]
 *
 * reel.props.json (caminhos relativos à pasta do próprio JSON, que vira o public dir do Remotion):
 *   {
 *     "scenes": [
 *       { "kind": "video3d", "seconds": 3,   "src": "https://pub-...r2.dev/exercise-videos/male/barbell-full-squat.mp4", "zoom": [1.4, 1.2] },
 *       { "kind": "ui",      "seconds": 2.5, "src": "ui-home.png", "pan": [150, 700] },
 *       { "kind": "cta",     "seconds": 2.2, "logo": "ab-logo-white.png", "url": "abfitness.app", "line": "Salva e manda pro seu parceiro." }
 *     ],
 *     "audio": "narration.wav",                   // normalizado aqui com loudnorm (-14 LUFS, -1.5 dBTP) antes do render
 *     "captionsJson": "narration.captions.json"   // do narrate.py (tempo real por palavra); ou "captionsFile" com SRT/VTT do CLI
 *   }
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const argv = process.argv.slice(2);
const propsPath = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
if (!propsPath || !existsSync(propsPath)) {
  console.error('Uso: node tools/marketing/render-reel.mjs <reel.props.json> [--out reel.mp4] [--draft]');
  process.exit(1);
}
const oi = argv.indexOf('--out');
const publicDir = dirname(resolve(propsPath));
const out = resolve(oi > -1 ? argv[oi + 1] : join(publicDir, 'reel.mp4'));
const props = JSON.parse(readFileSync(propsPath, 'utf8'));

/** Converte "00:00:02,480" ou "00:02.480" em segundos. */
const toSec = (ts) => {
  const parts = ts.trim().replace(',', '.').split(':').map(Number);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

/** Lê SRT ou WebVTT (o edge-tts 7.x grava SRT mesmo com extensão .vtt). */
export function parseCaptions(text) {
  const cues = [];
  for (const block of text.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n').filter(Boolean);
    const timeIdx = lines.findIndex((l) => l.includes('-->'));
    if (timeIdx < 0) continue;
    const [a, b] = lines[timeIdx].split('-->');
    const textLines = lines.slice(timeIdx + 1).join(' ').trim();
    if (textLines) cues.push({ start: toSec(a), end: toSec(b.trim().split(/\s+/)[0]), text: textLines });
  }
  // Evita sobreposição (edge-tts às vezes encavala 50ms entre frases)
  for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);
  return cues;
}

if (props.captionsJson) {
  // narration.captions.json do narrate.py: blocos com tempo real por palavra
  props.captions = JSON.parse(readFileSync(join(publicDir, props.captionsJson), 'utf8'));
  console.log(`📝  ${props.captions.length} bloco(s) de legenda com tempo por palavra de ${props.captionsJson}`);
} else if (props.captionsFile) {
  props.captions = parseCaptions(readFileSync(join(publicDir, props.captionsFile), 'utf8'));
  console.log(`📝  ${props.captions.length} legenda(s) lidas de ${props.captionsFile}`);
}

if (props.audio && !/^https?:/.test(props.audio)) {
  const raw = join(publicDir, props.audio);
  if (!existsSync(raw)) throw new Error(`Áudio não encontrado: ${raw}`);
  const norm = 'narration.norm.wav';
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2', join(publicDir, norm)]);
  props.audio = norm;
  console.log('🔊  Narração normalizada (loudnorm -14 LUFS / -1.5 dBTP)');
}

// Fontes reais do app servidas pelo public dir do Remotion
mkdirSync(join(publicDir, 'fonts'), { recursive: true });
for (const f of ['plus-jakarta-sans-latin.woff2', 'plus-jakarta-sans-latin-ext.woff2', 'inter-latin.woff2']) {
  copyFileSync(join(ROOT, 'public/fonts', f), join(publicDir, 'fonts', f));
}

const resolvedProps = join(publicDir, '.reel.resolved.json');
writeFileSync(resolvedProps, JSON.stringify(props, null, 2));

const raw = join(publicDir, '.reel.raw.mp4');
const args = [
  'render',
  join(HERE, 'reel-template/index.jsx'),
  'Reel',
  raw,
  `--props=${resolvedProps}`,
  `--public-dir=${publicDir}`,
  '--codec=h264',
  '--audio-codec=aac',
  '--pixel-format=yuv420p',
  `--crf=${argv.includes('--draft') ? 28 : 18}`,
  '--log=error'
];
if (process.env.REMOTION_LICENSE_KEY) args.push(`--license-key=${process.env.REMOTION_LICENSE_KEY}`);
// O chrome-headless-shell que o Remotion baixa trava em "Waiting for root component" neste macOS (Darwin 25);
// o Chrome for Testing do Playwright renderiza normalmente. REMOTION_BROWSER=bundled volta ao padrão do Remotion.
if (process.env.REMOTION_BROWSER !== 'bundled') {
  const { chromium } = await import('playwright');
  if (existsSync(chromium.executablePath())) args.push(`--browser-executable=${chromium.executablePath()}`);
}
console.log('🎬  Renderizando com Remotion...');
execFileSync(join(HERE, 'node_modules/.bin/remotion'), args, { cwd: HERE, stdio: 'inherit' });
// O Remotion entrega yuvj420p (full range). O Instagram espera yuv420p limitado + moov no início (faststart).
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', raw,
  '-vf', 'scale=in_range=full:out_range=tv,format=yuv420p',
  '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'medium', '-crf', argv.includes('--draft') ? '26' : '18',
  '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out
]);
rmSync(raw);
console.log(`✅  Reel: ${out}`);
console.log(`    Próximo passo: node tools/marketing/review-video.mjs ${out}`);
