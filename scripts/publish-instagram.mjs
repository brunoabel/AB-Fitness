#!/usr/bin/env node
/**
 * AB Fitness — Instagram Graph API Publisher
 * Usage:
 *   node --env-file=.env scripts/publish-instagram.mjs --check
 *   node --env-file=.env scripts/publish-instagram.mjs --check-storage
 *   node --env-file=.env scripts/publish-instagram.mjs --insights [--limit 10] [--out arquivo.json]
 *
 *   Post único (legado, legenda inline):
 *   node --env-file=.env scripts/publish-instagram.mjs "path/to/file.mp4" "Legenda do post"
 *   node --env-file=.env scripts/publish-instagram.mjs "path/to/file.png" "Legenda do post"
 *
 *   Legenda via arquivo (recomendado: emojis, aspas e quebras de linha intactos):
 *   node --env-file=.env scripts/publish-instagram.mjs tmp/marketing/current/reel.mp4 --caption-file tmp/marketing/current/caption.txt
 *
 *   Carrossel (2 a 10 imagens .png/.jpg, na ordem dada):
 *   node --env-file=.env scripts/publish-instagram.mjs tmp/marketing/current/slide-01.png ... slide-07.png --caption-file caption.txt
 *
 *   Só validar (arquivos, ffprobe, legenda), sem upload nem publicação:
 *   node --env-file=.env scripts/publish-instagram.mjs <arquivos...> --caption-file caption.txt --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync, statSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { extname, basename, join } from 'path';
import { tmpdir } from 'os';
import { execFileSync } from 'child_process';

const TOKEN = process.env.IG_ACCESS_TOKEN;
const USER_ID = process.env.IG_USER_ID;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = 'marketing-temp';
const IG_API = 'https://graph.facebook.com/v21.0';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg'];
const VIDEO_EXT = ['.mp4'];

// ── helpers ──────────────────────────────────────────────────────────────────

function die(msg) {
  console.error(`\n❌  ${msg}`);
  process.exit(1);
}

function requireToken() {
  if (!TOKEN) die('IG_ACCESS_TOKEN não encontrado no .env');
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const json = await res.json();
  if (json.error) throw new Error(`[Graph API ${json.error.code}] ${json.error.message}`);
  return json;
}

// ── TAREFA 1: --check ─────────────────────────────────────────────────────────

async function checkConnection() {
  requireToken();
  console.log('\n🔍  Verificando conexão com Instagram Graph API...\n');

  // Tenta Instagram Basic Display
  let me;
  try {
    me = await apiFetch(`https://graph.instagram.com/v21.0/me?fields=id,username&access_token=${TOKEN}`);
    console.log(`✅  Instagram Basic Display API`);
    console.log(`    @${me.username}  (id: ${me.id})`);
    updateEnvUserId(me.id);
    return;
  } catch (e1) {
    console.log(`⚠️   Instagram Basic Display: ${e1.message}`);
  }

  // Tenta Facebook Graph - Business
  try {
    const pages = await apiFetch(
      `${IG_API}/me/accounts?fields=name,instagram_business_account{id,username}&access_token=${TOKEN}`
    );
    const page = pages.data?.find(p => p.instagram_business_account);
    if (page) {
      const ig = page.instagram_business_account;
      console.log(`✅  Facebook Business — Página: ${page.name}`);
      console.log(`    @${ig.username}  (id: ${ig.id})`);
      updateEnvUserId(ig.id);
      return;
    }
    console.log('⚠️   Facebook Graph: nenhuma página com conta IG conectada encontrada.');
  } catch (e2) {
    console.log(`⚠️   Facebook Graph: ${e2.message}`);
  }

  // Token inválido / expirado
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️   O token parece expirado ou sem permissões suficientes.

Para renovar:
  1. Acesse https://developers.facebook.com/tools/explorer/
  2. Selecione o app → gere um User Token com os scopes:
       instagram_basic, instagram_content_publish,
       pages_show_list, pages_read_engagement
  3. Troque o valor de IG_ACCESS_TOKEN no .env
  4. Volte a correr: node --env-file=.env scripts/publish-instagram.mjs --check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  process.exit(1);
}

function updateEnvUserId(id) {
  const envPath = new URL('../.env', import.meta.url).pathname;
  if (!existsSync(envPath)) return;
  let content = readFileSync(envPath, 'utf8');
  if (/^IG_USER_ID=/m.test(content)) {
    content = content.replace(/^IG_USER_ID=.*/m, `IG_USER_ID="${id}"`);
  } else {
    content += `\nIG_USER_ID="${id}"\n`;
  }
  import('fs').then(({ writeFileSync }) => writeFileSync(envPath, content));
  console.log(`\n✅  IG_USER_ID="${id}" guardado no .env`);
}

// ── --insights: últimos posts + métricas (alimenta a pesquisa do /marketing-man) ─────────

const INSIGHT_METRICS = ['reach', 'saved', 'shares', 'views'];

/** Busca as métricas em lote; se a Graph API recusar alguma para este tipo de media, tenta uma a uma. */
async function mediaInsights(mediaId) {
  const url = (metrics) => `${IG_API}/${mediaId}/insights?metric=${metrics.join(',')}&access_token=${TOKEN}`;
  const values = Object.fromEntries(INSIGHT_METRICS.map(m => [m, null]));
  const errors = {};
  const absorb = (data) => {
    for (const row of data || []) {
      values[row.name] = row.values?.[0]?.value ?? row.total_value?.value ?? null;
    }
  };
  try {
    absorb((await apiFetch(url(INSIGHT_METRICS))).data);
    return { values, errors: null };
  } catch {
    for (const metric of INSIGHT_METRICS) {
      try {
        absorb((await apiFetch(url([metric]))).data);
      } catch (e) {
        errors[metric] = e.message;
      }
    }
  }
  return { values, errors: Object.keys(errors).length ? errors : null };
}

async function fetchInsights(limit) {
  requireToken();
  if (!USER_ID) die('IG_USER_ID não encontrado no .env — corra com --check primeiro');

  let account = null;
  try {
    account = await apiFetch(`${IG_API}/${USER_ID}?fields=username,followers_count,media_count&access_token=${TOKEN}`);
    delete account.id;
  } catch (e) {
    account = { error: e.message };
  }

  const fields = 'id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count';
  const media = await apiFetch(`${IG_API}/${USER_ID}/media?fields=${fields}&limit=${limit}&access_token=${TOKEN}`);

  const posts = [];
  for (const m of media.data || []) {
    const { values, errors } = await mediaInsights(m.id);
    const engagement = (m.like_count || 0) + (m.comments_count || 0) + (values.saved || 0) + (values.shares || 0);
    posts.push({
      id: m.id,
      timestamp: m.timestamp,
      media_type: m.media_type,
      product_type: m.media_product_type || null,
      permalink: m.permalink || null,
      caption: (m.caption || '').trim(),
      like_count: m.like_count ?? null,
      comments_count: m.comments_count ?? null,
      insights: values,
      engagement_rate_on_reach: values.reach ? Number((engagement / values.reach).toFixed(4)) : null,
      ...(errors ? { insights_errors: errors } : {})
    });
  }

  const rank = (key) =>
    [...posts]
      .filter(p => typeof key(p) === 'number')
      .sort((a, b) => key(b) - key(a))
      .slice(0, 3)
      .map(p => ({ id: p.id, media_type: p.media_type, value: key(p), hook: p.caption.slice(0, 90) }));

  return {
    fetched_at: new Date().toISOString(),
    account,
    count: posts.length,
    posts,
    top: {
      by_reach: rank(p => p.insights.reach),
      by_saved: rank(p => p.insights.saved),
      by_shares: rank(p => p.insights.shares),
      by_engagement_rate: rank(p => p.engagement_rate_on_reach)
    }
  };
}

// ── validação pré-upload ──────────────────────────────────────────────────────

function ffprobe(file) {
  try {
    return JSON.parse(
      execFileSync('ffprobe', [
        '-v', 'error',
        '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt:stream_tags=rotate:format=duration,size',
        '-of', 'json', file
      ], { encoding: 'utf8' })
    );
  } catch (e) {
    throw new Error(`ffprobe falhou em ${file} (ffmpeg instalado?): ${e.message.split('\n')[0]}`);
  }
}

/** Reels via Graph API: H.264 + AAC, 9:16, 3s a 15min, até 300 MB, 23–60 fps. */
function validateVideo(file) {
  const probe = ffprobe(file);
  const v = probe.streams.find(s => s.codec_type === 'video');
  const a = probe.streams.find(s => s.codec_type === 'audio');
  const duration = Number(probe.format?.duration || 0);
  const sizeMb = Number(probe.format?.size || statSync(file).size) / 1024 / 1024;
  const errors = [];
  const warnings = [];
  if (!v) errors.push('sem stream de vídeo');
  else {
    if (v.codec_name !== 'h264') errors.push(`codec de vídeo ${v.codec_name} (precisa H.264)`);
    const ratio = v.width / v.height;
    if (Math.abs(ratio - 9 / 16) > 0.01) errors.push(`proporção ${v.width}x${v.height} (precisa 9:16, ex.: 1080x1920)`);
    else if (v.width < 720) warnings.push(`resolução baixa ${v.width}x${v.height} (ideal 1080x1920)`);
    const [n, d] = (v.r_frame_rate || '0/1').split('/').map(Number);
    const fps = n / (d || 1);
    if (fps < 23 || fps > 60) errors.push(`${fps.toFixed(2)} fps (Reels aceita 23–60)`);
    if (v.pix_fmt && v.pix_fmt !== 'yuv420p') warnings.push(`pix_fmt ${v.pix_fmt} (recomendado yuv420p)`);
  }
  if (a && a.codec_name !== 'aac') errors.push(`codec de áudio ${a.codec_name} (precisa AAC)`);
  if (!a) warnings.push('sem faixa de áudio (Reel mudo)');
  if (duration < 3) errors.push(`duração ${duration.toFixed(2)}s (mínimo 3s)`);
  if (duration > 900) errors.push(`duração ${duration.toFixed(0)}s (máximo 15 min)`);
  else if (duration > 90) warnings.push(`duração ${duration.toFixed(0)}s (acima de 90s perde alcance na aba Reels)`);
  if (sizeMb > 300) errors.push(`${sizeMb.toFixed(0)} MB (máximo 300 MB)`);
  return { errors, warnings, summary: v ? `${v.codec_name}/${a?.codec_name || 'sem áudio'} ${v.width}x${v.height} ${duration.toFixed(2)}s ${sizeMb.toFixed(1)}MB` : '' };
}

/** Feed/carrossel: proporção entre 4:5 e 1.91:1, até 8 MB depois da conversão para JPEG. */
function validateImage(file) {
  const v = ffprobe(file).streams.find(s => s.codec_type === 'video');
  const errors = [];
  const warnings = [];
  if (!v?.width) return { errors: ['não foi possível ler as dimensões da imagem'], warnings, ratio: null, summary: '' };
  const ratio = v.width / v.height;
  if (ratio < 0.8 - 0.005 || ratio > 1.91 + 0.005) errors.push(`proporção ${v.width}x${v.height} fora de 4:5 a 1.91:1`);
  if (v.width < 1080) warnings.push(`largura ${v.width}px (ideal 1080px)`);
  return { errors, warnings, ratio, summary: `${v.width}x${v.height}` };
}

function validateCaption(caption) {
  const errors = [];
  const warnings = [];
  const hashtags = caption.match(/(^|\s)#[\p{L}\p{N}_]+/gu) || [];
  const mentions = caption.match(/(^|\s)@[\w.]+/g) || [];
  if (!caption.trim()) errors.push('legenda vazia');
  if (caption.length > 2200) errors.push(`legenda com ${caption.length} caracteres (máximo 2200)`);
  if (hashtags.length > 30) errors.push(`${hashtags.length} hashtags (máximo 30)`);
  else if (hashtags.length > 5) warnings.push(`${hashtags.length} hashtags (estratégia AB Fitness: no máximo 5)`);
  if (mentions.length > 20) errors.push(`${mentions.length} menções (máximo 20)`);
  return { errors, warnings };
}

/** Valida tudo antes de qualquer upload. Devolve o tipo de post. */
function validateInputs(files, caption) {
  const problems = [];
  const report = [];

  if (!files.length) die('Nenhum arquivo informado.');
  for (const f of files) {
    if (/[*?[\]{}]/.test(f)) die(`Caminho com wildcard literal não é aceito: "${f}". Passe os caminhos explícitos (ex.: slide-01.png slide-02.png).`);
    if (!existsSync(f)) die(`Arquivo não encontrado: ${f}`);
    if (!statSync(f).isFile() || statSync(f).size === 0) die(`Não é um arquivo válido (ou está vazio): ${f}`);
    const ext = extname(f).toLowerCase();
    if (![...IMAGE_EXT, ...VIDEO_EXT].includes(ext)) die(`Formato não suportado: ${ext} (use .mp4, .png ou .jpg)`);
  }

  const videos = files.filter(f => VIDEO_EXT.includes(extname(f).toLowerCase()));
  let kind;
  if (files.length === 1) kind = videos.length ? 'reel' : 'image';
  else {
    if (videos.length) die('Carrossel deste script aceita apenas imagens (.png/.jpg). Para vídeo, publique um Reel único.');
    if (files.length > 10) die(`Carrossel com ${files.length} imagens (máximo 10).`);
    kind = 'carousel';
  }

  const ratios = [];
  for (const f of files) {
    const r = kind === 'reel' ? validateVideo(f) : validateImage(f);
    if (r.ratio) ratios.push(r.ratio);
    report.push(`    ${r.errors.length ? '❌' : '✅'} ${basename(f)}  ${r.summary}`);
    for (const e of r.errors) problems.push(`${basename(f)}: ${e}`);
    for (const w of r.warnings) report.push(`       ⚠️  ${w}`);
  }
  if (kind === 'carousel' && ratios.some(r => Math.abs(r - ratios[0]) > 0.01)) {
    report.push('       ⚠️  slides com proporções diferentes: o Instagram recorta todos para a proporção do 1º');
  }

  const c = validateCaption(caption);
  report.push(`    ${c.errors.length ? '❌' : '✅'} legenda  ${caption.length} caracteres`);
  for (const w of c.warnings) report.push(`       ⚠️  ${w}`);
  problems.push(...c.errors.map(e => `legenda: ${e}`));

  console.log(`\n🔎  Validação pré-upload (${kind === 'reel' ? 'Reel 9:16' : kind === 'carousel' ? `Carrossel ${files.length} slides` : 'Post único'})`);
  console.log(report.join('\n'));
  if (problems.length) die(`Validação falhou:\n   - ${problems.join('\n   - ')}`);
  return kind;
}

/** A Graph API só aceita JPEG em image_url: converte PNG para JPEG de alta qualidade num diretório temporário. */
function toJpeg(file, workDir) {
  const ext = extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return file;
  const out = join(workDir, `${basename(file, ext)}.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-q:v', '2', '-pix_fmt', 'yuvj420p', out]);
  if (statSync(out).size > 8 * 1024 * 1024) throw new Error(`${basename(out)} passou de 8 MB após conversão`);
  return out;
}

// ── TAREFA 2: upload para Supabase Storage ────────────────────────────────────

function supabaseClient() {
  if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL não configurado no .env');
  }
  if (!SUPABASE_KEY || SUPABASE_KEY.includes('your-')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado no .env');
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function ensureBucket(supabase) {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Supabase Storage inacessível: ${error.message}`);
  if (!buckets?.some(b => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error(`Erro ao criar bucket "${BUCKET}": ${createError.message}`);
    console.log(`✅  Bucket "${BUCKET}" criado`);
  }
}

async function uploadToSupabase(filePath) {
  const supabase = supabaseClient();
  await ensureBucket(supabase);

  const ext = extname(filePath).toLowerCase();
  const filename = `${Date.now()}-${basename(filePath)}`;
  const fileBuffer = readFileSync(filePath);
  const contentType = ext === '.mp4' ? 'video/mp4'
    : ext === '.png' ? 'image/png'
    : 'image/jpeg';

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, { contentType, upsert: false });
  if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  console.log(`✅  Upload OK → ${publicUrl}`);
  return { publicUrl, filename };
}

async function deleteFromSupabase(filenames) {
  const list = [].concat(filenames).filter(Boolean);
  if (!list.length) return;
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { error } = await supabase.storage.from(BUCKET).remove(list);
  if (error) console.warn(`⚠️   Falha ao limpar temp: ${error.message}`);
  else console.log(`🗑   ${list.length} arquivo(s) temporário(s) removido(s) do bucket`);
}

/** --check-storage: confirma que o bucket aceita upload, serve URL pública e permite remoção. */
async function checkStorage() {
  console.log(`\n🔍  Verificando Supabase Storage (bucket "${BUCKET}")...\n`);
  try {
    const supabase = supabaseClient();
    await ensureBucket(supabase);
    const name = `healthcheck-${Date.now()}.txt`;
    const { error } = await supabase.storage.from(BUCKET).upload(name, Buffer.from('ok'), { contentType: 'text/plain' });
    if (error) throw new Error(`upload de teste falhou: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(name);
    const res = await fetch(publicUrl);
    await supabase.storage.from(BUCKET).remove([name]);
    if (!res.ok) throw new Error(`URL pública respondeu ${res.status} (o bucket precisa ser público para a Graph API baixar)`);
    console.log(`✅  Bucket "${BUCKET}" acessível: upload, URL pública e remoção OK`);
  } catch (e) {
    die(`Supabase Storage: ${e.message}`);
  }
}

// ── TAREFA 2: publicar no Instagram ───────────────────────────────────────────

async function pollUntilFinished(containerId, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const data = await apiFetch(
      `${IG_API}/${containerId}?fields=status_code&access_token=${TOKEN}`
    );
    console.log(`   polling [${i + 1}/${maxAttempts}] status: ${data.status_code}`);
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error(`Container com erro: ${JSON.stringify(data)}`);
    await new Promise(r => setTimeout(r, 4000));
  }
  throw new Error('Timeout no polling do container de media');
}

async function createContainer(fields) {
  return apiFetch(`${IG_API}/${USER_ID}/media`, {
    method: 'POST',
    body: new URLSearchParams({ access_token: TOKEN, ...fields }),
  });
}

async function publishContainer(containerId) {
  const publish = await apiFetch(`${IG_API}/${USER_ID}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({ creation_id: containerId, access_token: TOKEN }),
  });
  console.log(`\n🎉  Publicado com sucesso! post_id: ${publish.id}`);
  return publish.id;
}

async function publishPost(filePath, caption, workDir) {
  const isVideo = extname(filePath).toLowerCase() === '.mp4';

  console.log(`\n📤  Iniciando publicação...`);
  console.log(`    Arquivo : ${filePath}`);
  console.log(`    Tipo    : ${isVideo ? 'Reel (9:16)' : 'Post (4:5)'}`);

  // 1. Upload para Supabase Storage (imagens vão como JPEG, único formato aceito pela Graph API)
  const { publicUrl, filename } = await uploadToSupabase(isVideo ? filePath : toJpeg(filePath, workDir));
  try {
    // 2. Criar container de media
    const fields = { caption };
    if (isVideo) {
      fields.media_type = 'REELS';
      fields.video_url = publicUrl;
      fields.share_to_feed = 'true';
    } else {
      fields.image_url = publicUrl;
    }
    const container = await createContainer(fields);
    console.log(`✅  Container criado: ${container.id}`);

    // 3. Polling até FINISHED
    if (isVideo) {
      console.log(`⏳  Aguardando processamento do vídeo...`);
      await pollUntilFinished(container.id);
    }

    // 4. Publicar
    return await publishContainer(container.id);
  } finally {
    // 5. Limpar arquivo temporário
    await deleteFromSupabase(filename);
  }
}

async function publishCarousel(files, caption, workDir) {
  console.log(`\n📤  Iniciando publicação de carrossel (${files.length} slides)...`);
  const uploaded = [];
  try {
    const children = [];
    for (const [i, file] of files.entries()) {
      console.log(`\n  Slide ${i + 1}/${files.length}: ${file}`);
      const { publicUrl, filename } = await uploadToSupabase(toJpeg(file, workDir));
      uploaded.push(filename);
      const child = await createContainer({ image_url: publicUrl, is_carousel_item: 'true' });
      await pollUntilFinished(child.id, 10);
      console.log(`  ✅  Container filho: ${child.id}`);
      children.push(child.id);
    }

    const parent = await createContainer({ media_type: 'CAROUSEL', children: children.join(','), caption });
    console.log(`\n✅  Container CAROUSEL criado: ${parent.id}`);
    await pollUntilFinished(parent.id);
    return await publishContainer(parent.id);
  } finally {
    await deleteFromSupabase(uploaded);
  }
}

// ── entry point ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = { positionals: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--caption-file' || a === '--limit' || a === '--out') opts[a.slice(2)] = argv[++i];
    else if (a.startsWith('--')) opts[a.slice(2)] = true;
    else opts.positionals.push(a);
  }
  return opts;
}

const usage = `
AB Fitness — Instagram Publisher

Uso:
  node --env-file=.env scripts/publish-instagram.mjs --check
  node --env-file=.env scripts/publish-instagram.mjs --check-storage
  node --env-file=.env scripts/publish-instagram.mjs --insights [--limit 10] [--out insights.json]
  node --env-file=.env scripts/publish-instagram.mjs "arquivo.mp4" "Legenda"
  node --env-file=.env scripts/publish-instagram.mjs "arquivo.png" "Legenda"
  node --env-file=.env scripts/publish-instagram.mjs reel.mp4 --caption-file caption.txt
  node --env-file=.env scripts/publish-instagram.mjs slide-01.png slide-02.png ... --caption-file caption.txt
  Acrescente --dry-run para só validar (sem upload nem publicação).
`;

const opts = parseArgs(process.argv.slice(2));

try {
  if (opts.check) {
    await checkConnection();
  } else if (opts['check-storage']) {
    await checkStorage();
  } else if (opts.insights) {
    const limit = Math.min(50, Math.max(1, Number(opts.limit) || 10));
    const result = await fetchInsights(limit);
    const json = JSON.stringify(result, null, 2);
    if (opts.out) {
      writeFileSync(opts.out, json);
      console.error(`✅  Insights de ${result.count} posts gravados em ${opts.out}`);
    }
    console.log(json);
  } else if (opts.positionals.length >= 1 && (opts['caption-file'] || opts.positionals.length >= 2)) {
    let files;
    let caption;
    if (opts['caption-file']) {
      if (!existsSync(opts['caption-file'])) die(`Arquivo de legenda não encontrado: ${opts['caption-file']}`);
      caption = readFileSync(opts['caption-file'], 'utf8').replace(/\r\n/g, '\n').trim();
      files = opts.positionals;
    } else {
      // Modo legado: o último argumento é a legenda
      caption = opts.positionals.at(-1);
      files = opts.positionals.slice(0, -1);
    }

    const kind = validateInputs(files, caption);
    if (opts['dry-run']) {
      console.log('\n✅  Dry-run: tudo válido. Nada foi enviado nem publicado.');
      process.exit(0);
    }

    requireToken();
    if (!USER_ID) die('IG_USER_ID não encontrado no .env — corra com --check primeiro');
    const workDir = mkdtempSync(join(tmpdir(), 'ab-ig-'));
    try {
      if (kind === 'carousel') await publishCarousel(files, caption, workDir);
      else await publishPost(files[0], caption, workDir);
    } finally {
      rmSync(workDir, { recursive: true, force: true });
    }
  } else {
    console.log(usage);
    process.exit(0);
  }
} catch (e) {
  die(e.message);
}
