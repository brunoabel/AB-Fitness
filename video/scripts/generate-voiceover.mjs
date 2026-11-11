// Gera a voz do AB Coach com a ElevenLabs: um MP3 por cena + tempos palavra a palavra.
// Uso (dentro de video/):  npm run voice
// Precisa de video/.env com ELEVENLABS_API_KEY=... e de "voiceId" no src/script.json
// (escolhido com scripts/voice-candidates.mjs). Só regenera cenas cujo texto/voz/definições mudaram.
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scriptPath = path.join(root, 'src/script.json');
const outDir = path.join(root, 'public/voiceover');
const manifestPath = path.join(outDir, 'manifest.json');

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Falta ELEVENLABS_API_KEY em video/.env');
  process.exit(1);
}
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
if (!script.voiceId) {
  console.error('Falta "voiceId" em src/script.json. Corre primeiro: npm run voice:candidates');
  process.exit(1);
}

mkdirSync(outDir, {recursive: true});
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {scenes: {}};
const only = process.argv.slice(2); // opcional: ids de cenas a forçar

const speech = (s) => s.speech ?? s.lines.join(' ');
const hashOf = (text) =>
  createHash('sha1').update(JSON.stringify({text, voice: script.voiceId, model: script.model, settings: script.voiceSettings})).digest('hex');

// Converte o alinhamento por carácter da ElevenLabs em palavras no formato Caption do @remotion/captions.
export const alignmentToWords = (alignment) => {
  const {characters, character_start_times_seconds: starts, character_end_times_seconds: ends} = alignment;
  const words = [];
  let cur = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (cur) words.push(cur);
      cur = null;
      return;
    }
    if (!cur) cur = {text: '', startMs: Math.round(starts[i] * 1000), endMs: 0, timestampMs: null, confidence: null};
    cur.text += ch;
    cur.endMs = Math.round(ends[i] * 1000);
  });
  if (cur) words.push(cur);
  return words;
};

const scenes = script.scenes;
for (let i = 0; i < scenes.length; i++) {
  const s = scenes[i];
  const text = speech(s);
  const hash = hashOf(text);
  const audio = `voiceover/${s.id}.mp3`;
  const captions = `voiceover/${s.id}.json`;
  const prev = manifest.scenes[s.id];
  const fresh = prev && prev.hash === hash && existsSync(path.join(root, 'public', audio)) && existsSync(path.join(root, 'public', captions));
  if (fresh && !only.includes(s.id)) {
    console.log(`= ${s.id} (sem alterações)`);
    continue;
  }
  console.log(`> ${s.id}: "${text}"`);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${script.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({
      text,
      model_id: script.model,
      voice_settings: script.voiceSettings,
      // contexto das cenas vizinhas para a entoação soar contínua
      previous_text: i > 0 ? speech(scenes[i - 1]) : undefined,
      next_text: i < scenes.length - 1 ? speech(scenes[i + 1]) : undefined,
    }),
  });
  if (!res.ok) {
    console.error(`Erro ${res.status} na cena ${s.id}: ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  writeFileSync(path.join(root, 'public', audio), Buffer.from(data.audio_base64, 'base64'));
  writeFileSync(path.join(root, 'public', captions), JSON.stringify(alignmentToWords(data.alignment), null, 2));
  manifest.scenes[s.id] = {text, hash, audio, captions, voiceId: script.voiceId};
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}
console.log('Voz pronta. Abre o Studio (npm run studio): as durações ajustam-se sozinhas ao áudio.');
