#!/usr/bin/env node
/**
 * Renderiza slides de carrossel 1080x1350 (4:5) a partir de um HTML com <section class="slide">...</section>.
 *
 * - Tokens reais do app: extrai o bloco @theme e as @font-face de src/index.css (fontes de public/fonts).
 * - Compila Tailwind v4 só com as classes usadas no HTML (bg-app, bg-surface-2, text-primary, font-display...).
 * - Captura com Playwright (deviceScaleFactor 2) e reduz para 1080x1350 com ffmpeg (lanczos).
 * - Auto-revisão: aponta texto/imagens fora da margem segura e elementos com overflow. Use data-bleed num
 *   elemento decorativo que pode sangrar até a borda.
 *
 *   node tools/marketing/render-slides.mjs tmp/marketing/current/slides.html [--out tmp/marketing/current] [--safe 72] [--strict]
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const W = 1080;
const H = 1350;

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : def;
};
const input = argv.find((a, i) => !a.startsWith('--') && !['--out', '--safe'].includes(argv[i - 1]));
if (!input) {
  console.error('Uso: node tools/marketing/render-slides.mjs <slides.html> [--out dir] [--safe 72] [--strict]');
  process.exit(1);
}
const src = resolve(input);
if (!existsSync(src)) {
  console.error(`Arquivo não encontrado: ${src}`);
  process.exit(1);
}
const outDir = resolve(flag('--out', dirname(src)));
const SAFE = Number(flag('--safe', 72));
const STRICT = argv.includes('--strict');
mkdirSync(outDir, { recursive: true });

/** Bloco CSS com chaves balanceadas a partir do índice de abertura. */
function blockAt(css, start) {
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error('Bloco CSS sem fecho em src/index.css');
}

function brandCss() {
  const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8');
  const themeAt = css.indexOf('@theme');
  if (themeAt < 0) throw new Error('@theme não encontrado em src/index.css');
  const theme = blockAt(css, themeAt);
  const fonts = [];
  for (let at = css.indexOf('@font-face'); at > -1; at = css.indexOf('@font-face', at + 1)) {
    fonts.push(blockAt(css, at));
  }
  const fontsDir = pathToFileURL(join(ROOT, 'public/fonts')).href;
  return { theme, fonts: fonts.join('\n').replaceAll("url('/fonts", `url('${fontsDir}`) };
}

function compileTailwind(theme) {
  const cache = join(HERE, '.cache');
  mkdirSync(cache, { recursive: true });
  const inCss = join(cache, 'slides.in.css');
  const outCss = join(cache, 'slides.out.css');
  writeFileSync(inCss, `@import "tailwindcss" source(none);\n@source "${src}";\n${theme}\n`);
  execFileSync(join(HERE, 'node_modules/.bin/tailwindcss'), ['-i', inCss, '-o', outCss, '--minify'], {
    cwd: HERE,
    stdio: ['ignore', 'ignore', 'pipe']
  });
  return readFileSync(outCss, 'utf8');
}

const { theme, fonts } = brandCss();
const tw = compileTailwind(theme);
const base = `html,body{margin:0;padding:0;background:var(--color-app,#000)}
.slide{width:${W}px;height:${H}px;overflow:hidden;position:relative;box-sizing:border-box;
  font-family:var(--font-sans,Inter,sans-serif);color:#fff;background:var(--color-app,#000);-webkit-font-smoothing:antialiased}`;
const inject = `<base href="${pathToFileURL(dirname(src)).href}/"><style>${fonts}\n${tw}\n${base}</style>`;

let html = readFileSync(src, 'utf8');
html = /<head[^>]*>/i.test(html)
  ? html.replace(/<head[^>]*>/i, (m) => `${m}${inject}`)
  : `<!doctype html><html><head><meta charset="utf-8">${inject}</head><body>${html}</body></html>`;
const rendered = join(HERE, '.cache', 'slides.rendered.html');
writeFileSync(rendered, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(rendered).href, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
});

const slides = page.locator('.slide');
const count = await slides.count();
if (count === 0) {
  console.error('Nenhum <section class="slide"> encontrado.');
  await browser.close();
  process.exit(1);
}

const report = [];
for (let i = 0; i < count; i++) {
  const n = String(i + 1).padStart(2, '0');
  const slide = slides.nth(i);
  const issues = await slide.evaluate((el, safe) => {
    const box = el.getBoundingClientRect();
    const out = [];
    const label = (node) => {
      const t = (node.innerText || node.alt || node.tagName).trim().replace(/\s+/g, ' ');
      return `${node.tagName.toLowerCase()} "${t.slice(0, 40)}"`;
    };
    for (const node of el.querySelectorAll('*')) {
      if (node.closest('[data-bleed]')) continue;
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) continue;
      const hasText = [...node.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
      const isMedia = ['IMG', 'VIDEO', 'svg', 'CANVAS'].includes(node.tagName);
      if (!hasText && !isMedia) continue;
      const r = node.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const x0 = r.left - box.left, y0 = r.top - box.top, x1 = r.right - box.left, y1 = r.bottom - box.top;
      if (x0 < safe - 0.5 || y0 < safe - 0.5 || x1 > box.width - safe + 0.5 || y1 > box.height - safe + 0.5) {
        out.push(`fora da margem segura (${safe}px): ${label(node)} [${Math.round(x0)},${Math.round(y0)} → ${Math.round(x1)},${Math.round(y1)}]`);
      }
      if (hasText && (node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1) && style.overflow !== 'visible') {
        out.push(`texto com overflow: ${label(node)}`);
      }
    }
    return out;
  }, SAFE);

  const hi = join(HERE, '.cache', `slide-${n}@2x.png`);
  const final = join(outDir, `slide-${n}.png`);
  await slide.screenshot({ path: hi });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', hi, '-vf', `scale=${W}:${H}:flags=lanczos`, final]);
  rmSync(hi);
  report.push({ slide: `slide-${n}.png`, issues });
}
await browser.close();

console.log(`\n${count} slide(s) renderizados em ${outDir} (${W}x${H}, captura 2x reduzida com lanczos)`);
if (count < 2 || count > 10) console.log(`⚠️  Carrossel do Instagram aceita 2 a 10 slides (encontrados: ${count}).`);
let total = 0;
for (const r of report) {
  total += r.issues.length;
  console.log(`  ${r.issues.length ? '⚠️ ' : '✅'} ${r.slide}${r.issues.length ? '' : '  margens e overflow OK'}`);
  for (const issue of r.issues) console.log(`       - ${issue}`);
}
if (total && STRICT) process.exit(2);
