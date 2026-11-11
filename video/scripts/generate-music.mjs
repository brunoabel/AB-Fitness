// Música de fundo com a ElevenLabs Music: instrumental, eletrónica leve e motivadora, ~110 BPM.
// Só corre com --confirm-commercial, depois de confirmares que o teu plano permite uso comercial.
//   npm run music -- --confirm-commercial [segundos]
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scriptPath = path.join(root, 'src/script.json');
const args = process.argv.slice(2);
if (!args.includes('--confirm-commercial')) {
  console.error('Confirma primeiro que o teu plano ElevenLabs permite uso comercial da música e corre com --confirm-commercial.');
  process.exit(1);
}
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Falta ELEVENLABS_API_KEY em video/.env');
  process.exit(1);
}
const seconds = Number(args.find((a) => /^\d+$/.test(a)) ?? 75);
const res = await fetch('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128', {
  method: 'POST',
  headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
  body: JSON.stringify({
    prompt:
      'Light, modern, motivating electronic instrumental for a fitness app explainer. 110 BPM, steady four-on-the-floor pulse, soft plucks and warm pads, clean mix that leaves room for a voiceover. No vocals.',
    music_length_ms: seconds * 1000,
    force_instrumental: true,
  }),
});
if (!res.ok) {
  console.error(`Erro ${res.status}: ${await res.text()}`);
  process.exit(1);
}
mkdirSync(path.join(root, 'public/music'), {recursive: true});
writeFileSync(path.join(root, 'public/music/bg.mp3'), Buffer.from(await res.arrayBuffer()));
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
script.music = {...script.music, file: 'music/bg.mp3', bpm: 110};
writeFileSync(scriptPath, JSON.stringify(script, null, 2) + '\n');
console.log('Música gravada em public/music/bg.mp3 e ligada no script.json.');
