/**
 * Pós-build: gera HTML estático das páginas legais (dist/termos/index.html, ...) com o texto completo no HTML,
 * metadados próprios e JSON-LD, mais dist/sitemap.xml e dist/robots.txt. O React substitui o conteúdo ao carregar.
 * Uso: node scripts/prerender_legal.mjs  (corre depois de `vite build`)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { LEGAL_DOCS } from '../src/legal/index.js';
import { SITE_URL as DEFAULT_SITE, formatDatePt, LAST_UPDATED } from '../src/legal/config.js';
import { tokenize } from '../src/legal/markup.js';

const SITE = (process.env.SITE_URL || DEFAULT_SITE).replace(/\/$/, '');
const template = readFileSync('dist/index.html', 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (text) =>
  tokenize(text)
    .map((t) => (t.t === 'b' ? `<strong>${esc(t.text)}</strong>` : t.t === 'a' ? `<a href="${esc(t.href)}"${/^https?:/.test(t.href) ? ' rel="noopener noreferrer"' : ''}>${esc(t.text)}</a>` : esc(t.text)))
    .join('');

function block(b) {
  if (typeof b === 'string') return `<p>${inline(b)}</p>`;
  if (b.ul) return `<ul>${b.ul.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`;
  if (b.note) return `<p><em>${inline(b.note)}</em></p>`;
  if (b.table) {
    const head = b.table.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('');
    const rows = b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
    return `<table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  }
  return '';
}

const STYLE = `<style>.prerender{max-width:68ch;margin:0 auto;padding:32px 20px 80px;font:16px/1.7 Inter,system-ui,sans-serif;color:#b9bcc6}.prerender h1,.prerender h2{font-family:'Plus Jakarta Sans',Inter,sans-serif;color:#f1f2f4;line-height:1.15}.prerender h2{margin-top:2.5rem;font-size:1.35rem}.prerender a{color:#fff}.prerender strong{color:#f1f2f4}.prerender table{width:100%;border-collapse:collapse;font-size:14px}.prerender th,.prerender td{border:1px solid #2c2e35;padding:8px;text-align:left;vertical-align:top}</style>`;

function setTag(html, re, replacement) {
  if (!re.test(html)) throw new Error(`Marcador não encontrado em dist/index.html: ${re}`);
  return html.replace(re, replacement);
}

const pages = [];
for (const [path, doc] of Object.entries(LEGAL_DOCS)) {
  const url = `${SITE}${path}`;
  const title = `${doc.title} · AB Fitness`;
  let html = template;
  html = setTag(html, /<title>.*?<\/title>/s, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${esc(doc.description)}" />`);
  html = setTag(html, /<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/(<link rel="alternate" hreflang="[^"]+" href=")[^"]*(" \/>)/g, `$1${url}$2`);
  html = setTag(html, /<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${esc(doc.description)}" />`);
  html = setTag(html, /<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = setTag(html, /<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${esc(doc.description)}" />`);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: doc.title,
    description: doc.description,
    inLanguage: 'pt',
    dateModified: doc.updated,
    isPartOf: { '@id': `${SITE}/#app` },
    publisher: { '@id': `${SITE}/#organization` }
  };
  html = html.replace('</head>', `${STYLE}\n    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>\n  </head>`);

  const body = `<main class="prerender"><p><a href="/">AB Fitness</a></p><h1>${esc(doc.title)}</h1><p>Última atualização: <time datetime="${doc.updated}">${formatDatePt(doc.updated)}</time></p><p>${esc(doc.intro)}</p>${doc.sections
    .map((s) => `<section id="${s.id}"><h2>${esc(s.title)}</h2>${s.blocks.map(block).join('')}</section>`)
    .join('')}</main>`;
  html = setTag(html, /<div id="root">[\s\S]*?<\/div>\s*(<noscript>)/, `<div id="root">${body}</div>\n    $1`);

  mkdirSync(`dist${path}`, { recursive: true });
  writeFileSync(`dist${path}/index.html`, html);
  pages.push(path);
}

const urls = ['/', ...pages]
  .map((p) => {
    const isHome = p === '/';
    return `  <url>
    <loc>${SITE}${isHome ? '/' : p}</loc>
    <lastmod>${LAST_UPDATED}</lastmod>
    <changefreq>${isHome ? 'weekly' : 'monthly'}</changefreq>
    <priority>${isHome ? '1.0' : '0.6'}</priority>
  </url>`;
  })
  .join('\n');

const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
const robotsContent = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /dashboard\nDisallow: /profile\n\nSitemap: ${SITE}/sitemap.xml\n`;

writeFileSync('dist/sitemap.xml', sitemapContent);
writeFileSync('dist/robots.txt', robotsContent);
writeFileSync('public/sitemap.xml', sitemapContent);
writeFileSync('public/robots.txt', robotsContent);

console.log(`Prerender: ${pages.join(', ')} + sitemap.xml + robots.txt`);
