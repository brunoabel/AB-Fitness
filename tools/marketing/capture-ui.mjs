#!/usr/bin/env node
/**
 * Captura telas reais do app (iPhone 390x844, deviceScaleFactor 3 → 1170x2532) com Playwright, em modo convidado
 * com perfil já preenchido (pula o onboarding). Requer o dev server rodando (preview "ab-fitness-dev", porta 5173):
 * o bypass do gate de lançamento privado só existe em `vite dev`, nunca no build de produção.
 *
 *   node tools/marketing/capture-ui.mjs --out tmp/marketing/current/ui-home.png
 *   node tools/marketing/capture-ui.mjs --url http://localhost:5173/ --click "Seg" --click "Supino" --scroll 400 --out ...
 *   node tools/marketing/capture-ui.mjs --out ui.mp4 --record 6   (grava 6s de vídeo da tela, útil para B-roll do Reel)
 *
 * Flags: --url, --out (obrigatório), --click "texto" (repetível, clica no 1º botão/link/elemento com esse texto),
 *        --scroll px, --wait ms (após carregar, padrão 4000 para o splash), --dsf 3, --record segundos,
 *        --storage arquivo.json (chaves de localStorage de uma sessão real a injetar antes de carregar),
 *        --mock-supabase fixtures.json (telas que dependem de conta: Trainer Hub, vínculo PT; ver mock-supabase.mjs),
 *        --now ISO (relógio fixo), --replace textos.json (troca de textos só na captura), --settle ms,
 *        --viewport LxA.
 */
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join, extname } from 'node:path';

const argv = process.argv.slice(2);
const one = (name, def) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : def;
};
const many = (name) => argv.flatMap((a, i) => (a === name ? [argv[i + 1]] : []));

const url = one('--url', 'http://localhost:5173/');
const out = one('--out');
if (!out) {
  console.error('Uso: node tools/marketing/capture-ui.mjs --out <arquivo.png|.mp4> [--url] [--click texto] [--scroll px] [--wait ms] [--record s]');
  process.exit(1);
}
const outPath = resolve(out);
const record = Number(one('--record', 0));
const dsf = Number(one('--dsf', 3));
mkdirSync(dirname(outPath), { recursive: true });

// --viewport LxA (ex.: 390x1600 para pegar a tela inteira sem rolar um contêiner interno; ≥768 de largura = layout tablet)
const [vw, vh] = (one('--viewport', '390x844') || '390x844').split('x').map(Number);
const viewport = { width: vw || 390, height: vh || 844 };
const videoDir = join(dirname(outPath), '.capture-video');
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport,
  deviceScaleFactor: dsf,
  isMobile: viewport.width < 768,
  hasTouch: viewport.width < 768,
  colorScheme: 'dark',
  locale: 'pt-BR',
  ...(record ? { recordVideo: { dir: videoDir, size: { width: viewport.width * 2, height: viewport.height * 2 } } } : {})
});
// --storage arquivo.json: injeta chaves de localStorage gravadas de uma sessão real no app (ex.: treino concluído).
const storageFile = one('--storage');
if (storageFile) {
  const { readFileSync } = await import('node:fs');
  const entries = JSON.parse(readFileSync(resolve(storageFile), 'utf8'));
  await context.addInitScript((data) => {
    if (sessionStorage.getItem('__ab_capture_seeded')) return;
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
    sessionStorage.setItem('__ab_capture_seeded', '1');
  }, entries);
}
// --now 2026-11-26T18:30:00: relógio fixo no navegador (o dia da semana muda o plano, a saudação e a sequência).
// Os "@now-..." das fixtures do --mock-supabase usam o mesmo instante.
const nowIso = one('--now');
const nowMs = nowIso ? new Date(nowIso).getTime() : Date.now();
if (nowIso) {
  // install + resume: o relógio começa no instante pedido e anda normalmente (timers e animações seguem funcionando)
  await context.clock.install({ time: new Date(nowMs) });
  await context.clock.resume();
}
// --mock-supabase fixtures.json: sessão local falsa + Supabase interceptado (ver mock-supabase.mjs). Sem modo convidado.
const mockFile = one('--mock-supabase');
if (mockFile) {
  const { installSupabaseMock } = await import('./mock-supabase.mjs');
  await installSupabaseMock(context, mockFile, nowMs);
}
// --replace textos.json ({ "de": "para" }): troca textos da tela só na captura (ex.: PT-PT → PT-BR em peça de marketing).
// Nunca altera o app; o relatório deve dizer quais textos foram trocados e onde eles vivem no código.
const replaceFile = one('--replace');
if (replaceFile) {
  const { readFileSync } = await import('node:fs');
  const pairs = Object.entries(JSON.parse(readFileSync(resolve(replaceFile), 'utf8')));
  await context.addInitScript((list) => {
    const swap = (s) => list.reduce((acc, [from, to]) => (acc.includes(from) ? acc.split(from).join(to) : acc), s);
    const fix = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const next = swap(n.nodeValue);
        if (next !== n.nodeValue) n.nodeValue = next;
      }
      root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach((el) => {
        for (const attr of ['placeholder', 'aria-label', 'title']) {
          const v = el.getAttribute(attr);
          if (v && swap(v) !== v) el.setAttribute(attr, swap(v));
        }
      });
    };
    const start = () => {
      fix(document.body);
      new MutationObserver((muts) => muts.forEach((m) => {
        if (m.type === 'characterData') fix(m.target.parentNode || document.body);
        m.addedNodes.forEach((node) => (node.nodeType === 1 ? fix(node) : node.nodeType === 3 && fix(node.parentNode)));
      })).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start);
  }, pairs);
}
await context.addInitScript((guest) => {
  if (guest) localStorage.setItem('ab_fitness_guest_mode_v1', 'true');
  else localStorage.removeItem('ab_fitness_guest_mode_v1');
  // Bypass do gate de lançamento privado, aceito apenas em `vite dev` (ver src/App.jsx).
  localStorage.setItem('ab_fitness_marketing_capture_v1', 'true');
  if (!localStorage.getItem('ab_fitness_user_profile_v1')) {
    localStorage.setItem(
      'ab_fitness_user_profile_v1',
      JSON.stringify({ name: 'Atleta AB', goal: 'hipertrofia', level: 'intermediario', daysPerWeek: 4 })
    );
  }
}, !mockFile);

const page = await context.newPage();
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
} catch (e) {
  console.error(`Não consegui abrir ${url}. O dev server está rodando? (${e.message.split('\n')[0]})`);
  await browser.close();
  process.exit(1);
}
await page.waitForTimeout(Number(one('--wait', 4000)));
// CAPTURE_EVAL='expr' imprime o resultado de uma expressão na página (depuração da captura)
if (process.env.CAPTURE_EVAL) console.log(JSON.stringify(await page.evaluate(process.env.CAPTURE_EVAL)));

for (const text of many('--click')) {
  const target = page.getByRole('button', { name: text }).or(page.getByRole('link', { name: text })).or(page.getByText(text, { exact: false }));
  try {
    // Só elementos visíveis: no layout de celular o app mantém cópias ocultas (sidebar, roster) com o mesmo texto
    await target.filter({ visible: true }).first().click({ timeout: 5000 });
    await page.waitForTimeout(900);
  } catch {
    console.warn(`⚠️  Não encontrei elemento clicável com "${text}"`);
  }
}
// --settle ms: espera depois dos cliques (animações e confetes terminarem antes da foto)
const settle = Number(one('--settle', 0));
if (settle) await page.waitForTimeout(settle);
const scroll = Number(one('--scroll', 0));
if (scroll) {
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scroll);
  await page.waitForTimeout(600);
}

if (record) {
  await page.mouse.wheel(0, 0);
  await page.waitForTimeout(record * 1000);
  const video = page.video();
  await context.close();
  const webm = await video.path();
  const { execFileSync } = await import('node:child_process');
  const target = extname(outPath) === '.mp4' ? outPath : `${outPath}.mp4`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', '-an', target]);
  rmSync(videoDir, { recursive: true, force: true });
  console.log(`✅  Gravação da UI: ${target}`);
} else {
  await page.screenshot({ path: outPath });
  console.log(`✅  Captura da UI: ${outPath} (${viewport.width * dsf}x${viewport.height * dsf})`);
}
await browser.close();
