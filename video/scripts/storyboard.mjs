// Renderiza um still do frame-chave de cada cena (storyboard) e junta-os numa folha.
// Uso: node scripts/storyboard.mjs [vertical|wide] [--browser-executable=/caminho/chrome]
// Usa os mesmos tempos do vídeo: com voz gerada mede os MP3; sem voz usa a estimativa.
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const {buildTimeline, estimateWords, speechText, wordsDurationMs} = await import(path.join(root, 'src/lib/timeline.js'));
const script = JSON.parse(readFileSync(path.join(root, 'src/script.json'), 'utf8'));

const layout = process.argv[2] === 'wide' ? 'wide' : 'vertical';
const extra = process.argv.slice(3);
const comp = layout === 'wide' ? 'AbCoachWide' : 'AbCoachVertical';

const manifestPath = path.join(root, 'public/voiceover/manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
const probe = (file) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const scenes = script.scenes.map((s) => {
  const text = speechText(s);
  const entry = manifest?.scenes?.[s.id];
  if (entry && entry.text === text) {
    const words = JSON.parse(readFileSync(path.join(root, 'public', entry.captions), 'utf8'));
    return {...s, words, voiceMs: probe(path.join(root, 'public', entry.audio)) * 1000};
  }
  const words = estimateWords(text);
  return {...s, words, voiceMs: wordsDurationMs(words)};
});
const tl = buildTimeline({scenes, fps: 30, transitionFrames: 12, breathFrames: 12, bpm: script.music?.bpm});

const outDir = path.join(root, 'out/storyboard', layout);
mkdirSync(outDir, {recursive: true});
const bundle = path.join(root, 'build');
execFileSync('npx', ['remotion', 'bundle', '--out-dir', bundle], {cwd: root, stdio: 'inherit'});

const files = [];
for (const s of tl.scenes) {
  const frame = Math.min(s.start + s.voiceOffset + s.voiceFrames + 6, s.start + s.duration - 14);
  const file = path.join(outDir, `${s.id}.png`);
  console.log(`${s.id}: frame ${frame}`);
  execFileSync('npx', ['remotion', 'still', bundle, comp, file, `--frame=${frame}`, ...extra], {cwd: root, stdio: 'ignore'});
  files.push(file);
}
console.log(`Total: ${tl.durationInFrames} frames (${(tl.durationInFrames / 30).toFixed(1)} s)`);
console.log(`Stills em ${outDir}`);
