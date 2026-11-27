#!/usr/bin/env node
/**
 * Color grading dos vídeos 3D do R2 para a estética Dark Mode (mesmo tratamento do Slide 03 do carrossel):
 * fundo branco → preto, corpo/máquina em rampa Midnight Navy, músculos destacados (vermelho/laranja) → branco
 * azulado, mantendo o sombreamento. Sem caixa branca, sem âmbar.
 *
 *   node tools/marketing/grade-3d.mjs <entrada.mp4|url> <saida.mp4> [--crop w:h:x:y]
 *
 * Processa os frames em RGB cru via ffmpeg (sem dependências).
 */
import { spawn } from 'node:child_process';

const [input, output, ...rest] = process.argv.slice(2);
if (!input || !output) {
  console.error('Uso: node tools/marketing/grade-3d.mjs <entrada.mp4|url> <saida.mp4> [--crop w:h:x:y]');
  process.exit(1);
}
const ci = rest.indexOf('--crop');
const crop = ci > -1 ? rest[ci + 1] : '1080:1080:460:0';
const [W, H] = crop.split(':').map(Number);

const BG = [0, 0, 0];
const NAVY_DARK = [8, 13, 32]; // abaixo de #0a1128, para as sombras afundarem no preto
const NAVY_LIGHT = [80, 106, 168]; // azul do corpo nas áreas iluminadas
const MUSCLE = [218, 230, 252]; // branco azulado do destaque

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Fundo = região clara e sem saturação CONECTADA à borda do quadro (flood fill). Assim os brilhos claros do
// corpo (coluna, ombros) nunca viram buraco preto, mesmo tendo o mesmo tom do fundo.
const isBgCandidate = (buf, p) => {
  const r = buf[p], g = buf[p + 1], b = buf[p + 2];
  const mn = Math.min(r, g, b);
  return mn > 215 && Math.max(r, g, b) - mn < 26;
};
const region = new Uint8Array(W * H);
const stack = new Int32Array(W * H);
function floodBackground(buf) {
  region.fill(0);
  let sp = 0;
  const push = (x, y) => {
    const k = y * W + x;
    if (!region[k] && isBgCandidate(buf, k * 3)) {
      region[k] = 1;
      stack[sp++] = k;
    }
  };
  for (let x = 0; x < W; x++) push(x, 0), push(x, H - 1);
  for (let y = 0; y < H; y++) push(0, y), push(W - 1, y);
  while (sp) {
    const k = stack[--sp];
    const x = k % W, y = (k - x) / W;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }
  // Bolsões de fundo presos entre barras da máquina e braços: componentes quase brancos e chapados (média ~252).
  // O brilho da coluna também passa de 245, mas tem degradê e média mais baixa (~250,8): fica de fora pela média.
  const lvl = (k) => {
    const p = k * 3;
    return Math.min(buf[p], buf[p + 1], buf[p + 2]);
  };
  const white = (k) => lvl(k) >= 245;
  for (let s = 0; s < W * H; s++) {
    if (region[s] || !white(s)) continue;
    let n = 0, sum = 0;
    const start = sp;
    region[s] = 2;
    stack[sp++] = s;
    for (let q = start; q < sp; q++) {
      const k = stack[q];
      n++;
      sum += lvl(k);
      const x = k % W, y = (k - x) / W;
      for (const nk of [x > 0 ? k - 1 : -1, x < W - 1 ? k + 1 : -1, y > 0 ? k - W : -1, y < H - 1 ? k + W : -1]) {
        if (nk >= 0 && !region[nk] && white(nk)) {
          region[nk] = 2;
          stack[sp++] = nk;
        }
      }
    }
    const keep = (n >= 300 && sum / n >= 251.5) || (n >= 5000 && sum / n >= 251) ? 1 : 3; // 3 = visitado, mas é corpo
    for (let q = start; q < sp; q++) region[stack[q]] = keep;
    sp = start;
  }
}

function grade(buf) {
  floodBackground(buf);
  for (let i = 0, k = 0; i < buf.length; i += 3, k++) {
    const r = buf[i] / 255, g = buf[i + 1] / 255, b = buf[i + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx - mn;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const m = smooth(0.16, 0.38, sat); // destaque muscular
    const bg = region[k] === 1 ? smooth(0.84, 0.97, mn) : 0; // borda suave só dentro da região do fundo
    const tb = Math.pow(Math.min(1, Math.max(0, (lum - 0.12) / 0.8)), 1.5);
    const shade = Math.min(1, Math.max(0.4, 0.42 + 0.95 * (lum - 0.3)));
    for (let c = 0; c < 3; c++) {
      const body = NAVY_DARK[c] + (NAVY_LIGHT[c] - NAVY_DARK[c]) * tb;
      const col = body + (MUSCLE[c] * shade - body) * m;
      buf[i + c] = Math.round(col + (BG[c] - col) * bg);
    }
  }
}

const dec = spawn('ffmpeg', ['-v', 'error', '-i', input, '-vf', `crop=${crop}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
const enc = spawn('ffmpeg', [
  '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', '30000/1001', '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'medium', '-movflags', '+faststart', output
]);
dec.stderr.pipe(process.stderr);
enc.stderr.pipe(process.stderr);

const frameSize = W * H * 3;
let pending = Buffer.alloc(0);
let frames = 0;
dec.stdout.on('data', (chunk) => {
  pending = Buffer.concat([pending, chunk]);
  while (pending.length >= frameSize) {
    const frame = Buffer.from(pending.subarray(0, frameSize));
    pending = pending.subarray(frameSize);
    grade(frame);
    frames++;
    if (!enc.stdin.write(frame)) {
      dec.stdout.pause();
      enc.stdin.once('drain', () => dec.stdout.resume());
    }
  }
});
dec.stdout.on('end', () => enc.stdin.end());
enc.on('close', (code) => {
  if (code !== 0) process.exit(code);
  console.log(`🎨  ${output} (${W}x${H}, ${frames} frames)`);
});
