// Propõe vozes masculinas jovens com sotaque de Portugal da Voice Library da ElevenLabs
// e gera a cena 1 com as 3 melhores, para escolheres de ouvido.
//
//   npm run voice:candidates                    -> procura e gera public/voiceover/candidates/*.mp3
//   npm run voice:candidates -- <id1> <id2> ... -> gera só com estas vozes
//   npm run voice:candidates -- --choose <id>   -> grava a voz escolhida no src/script.json
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const scriptPath = path.join(root, 'src/script.json');
const script = JSON.parse(readFileSync(scriptPath, 'utf8'));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Falta ELEVENLABS_API_KEY em video/.env');
  process.exit(1);
}
const api = (p, init = {}) =>
  fetch(`https://api.elevenlabs.io${p}`, {...init, headers: {'xi-api-key': key, 'Content-Type': 'application/json', ...(init.headers ?? {})}});

const args = process.argv.slice(2);
if (args[0] === '--choose') {
  const id = args[1];
  const res = await api(`/v1/voices/${id}`);
  const voice = res.ok ? await res.json() : null;
  script.voiceId = id;
  script.voiceName = voice?.name ?? null;
  writeFileSync(scriptPath, JSON.stringify(script, null, 2) + '\n');
  console.log(`Voz gravada no script.json: ${script.voiceName ?? ''} (${id}). Agora: npm run voice`);
  process.exit(0);
}

let picks = [];
if (args.length) {
  picks = args.map((id) => ({voice_id: id, name: id}));
} else {
  const res = await api('/v1/shared-voices?gender=male&age=young&language=pt&page_size=100');
  if (!res.ok) {
    console.error(`Erro ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const {voices} = await res.json();
  const european = voices.filter((v) => {
    const tags = `${v.accent} ${v.locale} ${v.description} ${v.name}`.toLowerCase();
    return /pt-pt|portugal|european|europeu|lisbo|porto/.test(tags) && !/brazil|brasil|pt-br/.test(tags);
  });
  const energetic = (v) => (/energ|upbeat|enthusias|confident|friendly|motiv|young/i.test(`${v.descriptive} ${v.description}`) ? 1 : 0);
  european.sort((a, b) => energetic(b) - energetic(a) || (b.cloned_by_count ?? 0) - (a.cloned_by_count ?? 0));
  console.log(`Encontradas ${european.length} vozes masculinas jovens com sotaque de Portugal:`);
  european.slice(0, 10).forEach((v) => console.log(`  ${v.voice_id}  ${v.name}  [${v.accent ?? ''} ${v.locale ?? ''}] ${v.descriptive ?? ''}`));
  picks = european.slice(0, 3);
  if (!picks.length) {
    console.error('Nenhuma voz encontrada com estes filtros. Escolhe na Voice Library e passa os ids como argumentos.');
    process.exit(1);
  }
}

// Vozes da biblioteca partilhada precisam de estar na tua conta para usar na API.
const ensureInLibrary = async (v) => {
  const own = await api(`/v1/voices/${v.voice_id}`);
  if (own.ok || !v.public_owner_id) return v.voice_id;
  const add = await api(`/v1/voices/add/${v.public_owner_id}/${v.voice_id}`, {
    method: 'POST',
    body: JSON.stringify({new_name: `AB Coach - ${v.name}`}),
  });
  if (!add.ok) throw new Error(`Não consegui adicionar ${v.name}: ${await add.text()}`);
  return (await add.json()).voice_id ?? v.voice_id;
};

const outDir = path.join(root, 'public/voiceover/candidates');
mkdirSync(outDir, {recursive: true});
const text = script.scenes[0].speech ?? script.scenes[0].lines.join(' ');
for (const v of picks) {
  const id = await ensureInLibrary(v);
  const res = await api(`/v1/text-to-speech/${id}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {Accept: 'audio/mpeg'},
    body: JSON.stringify({text, model_id: script.model, voice_settings: script.voiceSettings}),
  });
  if (!res.ok) {
    console.error(`Erro ${res.status} com ${v.name}: ${await res.text()}`);
    continue;
  }
  const file = path.join(outDir, `${v.name.replace(/[^\w-]+/g, '_')}-${id}.mp3`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`Gerado: ${path.relative(root, file)}`);
}
console.log('Ouve os ficheiros e escolhe: npm run voice:candidates -- --choose <voiceId>');
