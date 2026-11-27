#!/usr/bin/env node
/**
 * Auto-revisão técnica do Reel antes do gate de aprovação.
 *  1. ffprobe: H.264 + AAC, 1080x1920 (9:16), ~30fps, duração 3s a 90s, yuv420p.
 *  2. Extrai 5 frames (0.5s, 25%, 50%, 75%, final) em <pasta>/review/ e uma versão com as zonas proibidas
 *     marcadas (topo 250px, base 350px, borda direita 120px) para inspeção visual.
 *
 *   node tools/marketing/review-video.mjs tmp/marketing/current/reel.mp4
 * Sai com código 2 se a verificação técnica falhar.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const file = process.argv[2] && resolve(process.argv[2]);
if (!file || !existsSync(file)) {
  console.error('Uso: node tools/marketing/review-video.mjs <reel.mp4>');
  process.exit(1);
}

const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt:format=duration', '-of', 'json', file], {
    encoding: 'utf8'
  })
);
const v = probe.streams.find((s) => s.codec_type === 'video');
const a = probe.streams.find((s) => s.codec_type === 'audio');
const duration = Number(probe.format.duration);
const [num, den] = (v?.r_frame_rate || '0/1').split('/').map(Number);
const fps = num / (den || 1);

const checks = [
  ['vídeo H.264', v?.codec_name === 'h264', v?.codec_name],
  ['áudio AAC', a?.codec_name === 'aac', a?.codec_name || 'sem áudio'],
  ['1080x1920 (9:16)', v?.width === 1080 && v?.height === 1920, `${v?.width}x${v?.height}`],
  ['~30fps', Math.abs(fps - 30) < 0.5, fps.toFixed(2)],
  ['yuv420p', v?.pix_fmt === 'yuv420p', v?.pix_fmt],
  ['duração 3s–90s (Reels)', duration >= 3 && duration <= 90, `${duration.toFixed(2)}s`]
];
let ok = true;
console.log(`\nffprobe ${file}`);
for (const [label, pass, got] of checks) {
  ok &&= pass;
  console.log(`  ${pass ? '✅' : '❌'} ${label.padEnd(24)} ${got}`);
}

const outDir = join(dirname(file), 'review');
mkdirSync(outDir, { recursive: true });
const marks = [
  ['00-0.5s', 0.5],
  ['01-25pct', duration * 0.25],
  ['02-50pct', duration * 0.5],
  ['03-75pct', duration * 0.75],
  ['04-final', Math.max(0, duration - 0.1)]
];
const zones =
  "drawbox=x=0:y=0:w=iw:h=250:color=red@0.28:t=fill,drawbox=x=0:y=ih-350:w=iw:h=350:color=red@0.28:t=fill,drawbox=x=iw-120:y=0:w=120:h=ih:color=red@0.28:t=fill";
for (const [name, t] of marks) {
  const at = t.toFixed(3);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', at, '-i', file, '-frames:v', '1', join(outDir, `${name}.png`)]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', at, '-i', file, '-frames:v', '1', '-vf', `${zones},scale=540:-1`, join(outDir, `${name}-zones.jpg`)]);
}
console.log(`\n🖼   5 frames + versões com zonas proibidas em ${outDir}`);
console.log('    Inspecione cada *-zones.jpg: nenhum texto pode tocar as faixas vermelhas; nada cortado ou quebrado.');
if (!ok) process.exit(2);
