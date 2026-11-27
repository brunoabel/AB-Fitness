#!/usr/bin/env node
/**
 * QA visual pós-render (skill video-frame-qa). Não altera o vídeo: só extrai frames e mede.
 *
 *   node tools/marketing/frame-qa.mjs tmp/marketing/current/reel.mp4 [--props tmp/marketing/current/reel.props.json]
 *
 * Saída em <pasta do vídeo>/qa/:
 *   frames/NN-<rótulo>.jpg   frames-chave em 540x960 (abertura, meio de cada cena, cada corte, CTA, fim (0,3s antes do último frame))
 *   sheet.jpg                grade 5 colunas na ordem da legenda impressa no terminal
 *   zones-sheet.jpg          a mesma grade com as faixas proibidas do Reels em vermelho
 *   report.json              legenda da grade + medições automáticas
 *
 * Medições automáticas (sem substituir o olho):
 *   - laranja/âmbar por frame (matiz 8° a 50°, saturação e brilho altos)   → falha acima de 0,1% da área
 *   - área quase branca por frame (cartão branco em volta de mídia)         → aviso acima de 6%
 *   - frames pretos fora do fade final (blackdetect)                         → falha
 *   - tela congelada por 1,2s ou mais (freezedetect)                         → falha
 *   - loudness integrado (ebur128), alvo -14 LUFS ± 1,5                      → aviso fora da faixa
 * Sai com código 2 se alguma falha for encontrada.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const argv = process.argv.slice(2);
const file = argv[0] && resolve(argv[0]);
if (!file || !existsSync(file)) {
  console.error('Uso: node tools/marketing/frame-qa.mjs <reel.mp4> [--props reel.props.json]');
  process.exit(1);
}
const pi = argv.indexOf('--props');
const propsPath = pi > -1 ? resolve(argv[pi + 1]) : join(dirname(file), 'reel.props.json');
const outDir = join(dirname(file), 'qa');
rmSync(outDir, { recursive: true, force: true });
mkdirSync(join(outDir, 'frames'), { recursive: true });

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);
const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }));

// 1. Momentos-chave: pelo reel.props.json quando existe (cortes exatos), senão por detecção de mudança de cena
const marks = [{ t: 0.1, label: 'abertura' }];
if (existsSync(propsPath)) {
  const { scenes = [] } = JSON.parse(readFileSync(propsPath, 'utf8'));
  let at = 0;
  scenes.forEach((s, i) => {
    const len = Math.round((s.seconds || 3) * 30) / 30;
    const end = i === scenes.length - 1 ? duration : at + len;
    if (i > 0) marks.push({ t: at, label: `corte-${i}-${i + 1}` });
    marks.push({ t: (at + end) / 2, label: `cena-${i + 1}-${s.kind || 'video3d'}` });
    at += len;
  });
} else {
  const out = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vf', "select='gt(scene,0.25)',showinfo", '-an', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const cuts = [...out.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
  let prev = 0;
  for (const c of cuts) {
    marks.push({ t: (prev + c) / 2, label: 'cena' }, { t: c, label: 'corte' });
    prev = c;
  }
  marks.push({ t: (prev + duration) / 2, label: 'cena-final' });
}
marks.push({ t: Math.max(0, duration - 0.3), label: 'fim' });
marks.sort((a, b) => a.t - b.t);

// 2. Extrai frames, mede cor e monta as grades
const W = 216, H = 384;
const zonesVf = 'drawbox=x=0:y=0:w=iw:h=250:color=red@0.3:t=fill,drawbox=x=0:y=ih-350:w=iw:h=350:color=red@0.3:t=fill,drawbox=x=iw-120:y=0:w=120:h=ih:color=red@0.3:t=fill';
const failures = [];
const warnings = [];
const frames = marks.map((m, i) => {
  const n = String(i + 1).padStart(2, '0');
  const at = m.t.toFixed(3);
  ff(['-ss', at, '-i', file, '-frames:v', '1', '-vf', 'scale=540:960', join(outDir, 'frames', `${n}-${m.label}.jpg`)]);
  ff(['-ss', at, '-i', file, '-frames:v', '1', '-vf', 'scale=216:384', join(outDir, `.g${n}.jpg`)]);
  ff(['-ss', at, '-i', file, '-frames:v', '1', '-vf', `${zonesVf},scale=216:384`, join(outDir, `.z${n}.jpg`)]);
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-ss', at, '-i', file, '-frames:v', '1', '-vf', `scale=${W}:${H}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  let orange = 0, white = 0;
  for (let p = 0; p < raw.length; p += 3) {
    const r = raw[p] / 255, g = raw[p + 1] / 255, b = raw[p + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (mn > 0.88) white++;
    if (d > 0.3 && mx > 0.45 && mx === r) {
      const hue = (60 * ((g - b) / d) + 360) % 360;
      if (hue >= 8 && hue <= 50) orange++;
    }
  }
  const px = W * H;
  const f = { n: i + 1, t: Number(at), label: m.label, orangePct: +((orange / px) * 100).toFixed(2), whitePct: +((white / px) * 100).toFixed(1) };
  if (f.orangePct > 0.1) failures.push(`${n} ${m.label} (${at}s): ${f.orangePct}% da área em laranja/âmbar`);
  if (f.whitePct > 6) warnings.push(`${n} ${m.label} (${at}s): ${f.whitePct}% da área quase branca (cartão branco?)`);
  return f;
});
const rows = Math.ceil(frames.length / 5);
ff(['-i', join(outDir, '.g%02d.jpg'), '-vf', `tile=5x${rows}:padding=6:color=0x222222`, '-frames:v', '1', join(outDir, 'sheet.jpg')]);
ff(['-i', join(outDir, '.z%02d.jpg'), '-vf', `tile=5x${rows}:padding=6:color=0x222222`, '-frames:v', '1', join(outDir, 'zones-sheet.jpg')]);
for (const f of frames) {
  const n = String(f.n).padStart(2, '0');
  rmSync(join(outDir, `.g${n}.jpg`));
  rmSync(join(outDir, `.z${n}.jpg`));
}

// 3. Vídeo inteiro: preto, congelamento e loudness
const probe = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vf', 'blackdetect=d=0.1:pix_th=0.02,freezedetect=n=0.001:d=1.2', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const blacks = [...probe.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
for (const [a, b] of blacks) {
  if (a < duration - 0.35) failures.push(`frame preto de ${a.toFixed(2)}s a ${b.toFixed(2)}s`);
}
const freezeStarts = [...probe.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const freezeEnds = [...probe.matchAll(/freeze_end: ([\d.]+)/g)].map((m) => Number(m[1]));
freezeStarts.forEach((a, i) => failures.push(`tela parada de ${a.toFixed(2)}s a ${(freezeEnds[i] ?? duration).toFixed(2)}s`));
const lufs = Number((probe.match(/Integrated loudness:\s+I:\s+(-?[\d.]+)/) || [])[1]);
if (!Number.isFinite(lufs)) warnings.push('sem áudio mensurável');
else if (Math.abs(lufs + 14) > 1.5) warnings.push(`loudness ${lufs} LUFS (alvo -14)`);

writeFileSync(join(outDir, 'report.json'), JSON.stringify({ file, duration, lufs, frames, failures, warnings }, null, 2));

console.log(`\n🔎  QA de frames: ${file} (${duration.toFixed(2)}s, ${Number.isFinite(lufs) ? lufs + ' LUFS' : 'sem áudio'})`);
console.log(`    Grade (5 por linha, leitura em Z): ${join(outDir, 'sheet.jpg')}`);
console.log(`    Zonas proibidas:                  ${join(outDir, 'zones-sheet.jpg')}`);
for (const f of frames) console.log(`    ${String(f.n).padStart(2, '0')}  ${f.t.toFixed(2).padStart(6)}s  ${f.label.padEnd(22)} laranja ${f.orangePct}%  branco ${f.whitePct}%`);
for (const w of warnings) console.log(`  ⚠️  ${w}`);
for (const e of failures) console.log(`  ❌ ${e}`);
if (!failures.length) console.log('  ✅ medições automáticas ok. Falta a inspeção visual da grade (skill video-frame-qa).');
if (failures.length) process.exit(2);
