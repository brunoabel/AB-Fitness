/**
 * Exportação do cartão de perfil em PNG (Canvas), com o mesmo tema, métricas e hierarquia do ecrã.
 * Formatos: 'story' 1080×1920 (Stories, com resumo da evolução por baixo) e 'feed' 1080×1350 (4:5).
 */

const SIZES = { story: { w: 1080, h: 1920 }, feed: { w: 1080, h: 1350 } };
const FONT = 'system-ui, -apple-system, "SF Pro Display", "Plus Jakarta Sans", sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, { size = 32, weight = 600, color = '#ffffff', align = 'left', maxWidth } = {}) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  let str = String(value ?? '');
  if (maxWidth) {
    while (str.length > 1 && ctx.measureText(str).width > maxWidth) str = str.slice(0, -1);
    if (str !== String(value ?? '')) str = `${str.slice(0, -1)}…`;
  }
  ctx.fillText(str, x, y);
  return ctx.measureText(str).width;
}

function wrapLines(ctx, value, maxWidth, maxLines, size) {
  ctx.font = `400 ${size}px ${FONT}`;
  const words = String(value || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, '')}…`;
  }
  return lines;
}

function loadImage(url) {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 2500);
    img.onload = () => { clearTimeout(timer); resolve(img); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = url;
  });
}

/** Textura opcional do tema (mesmas camadas de themeBackground em profileCard.js, à escala do Canvas). */
function drawPattern(ctx, theme, x, y, w, h, r) {
  if (!theme?.pattern) return;
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  const diagonal = (angleDeg, spacing, width, color) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate((angleDeg * Math.PI) / 180);
    const reach = Math.hypot(w, h);
    ctx.fillStyle = color;
    for (let o = -reach; o < reach; o += spacing) ctx.fillRect(o, -reach, width, reach * 2);
    ctx.restore();
  };
  if (theme.pattern === 'lines') {
    diagonal(45, 19, 3, 'rgba(255,255,255,0.04)');
  } else if (theme.pattern === 'weave') {
    diagonal(-45, 11, 5.5, 'rgba(255,255,255,0.035)');
    diagonal(45, 11, 5.5, 'rgba(0,0,0,0.3)');
  } else if (theme.pattern === 'glow') {
    const radius = Math.max(w, h) * 0.85;
    const g = ctx.createRadialGradient(x + w, y, 0, x + w, y, radius);
    g.addColorStop(0, theme.glow || 'rgba(255,255,255,0.12)');
    g.addColorStop(0.62, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/** Desenha o cartão em (x, y) com largura w. Devolve a altura usada. */
function drawCard(ctx, { x, y, w, theme, profile, metrics, rankLabel, avatar }) {
  const pad = 64;
  const name = (profile?.full_name || '').trim() || 'Atleta AB';
  const handle = profile?.username ? `@${profile.username}` : 'Atleta AB Fitness';
  const bioLines = profile?.bio ? wrapLines(ctx, profile.bio, w - pad * 2, 2, 34) : [];
  const h = 560 + bioLines.length * 46;

  const grad = ctx.createLinearGradient(x, y, x + w * 0.45, y + h);
  grad.addColorStop(0, theme.top);
  grad.addColorStop(1, theme.bottom);
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, 56);
  ctx.fill();
  drawPattern(ctx, theme, x, y, w, h, 56);
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 56);
  ctx.stroke();

  // Avatar recortado (ou iniciais)
  const av = 148;
  const ax = x + pad;
  const ay = y + pad;
  ctx.save();
  roundRect(ctx, ax, ay, av, av, 40);
  ctx.clip();
  if (avatar) {
    const side = Math.min(avatar.width, avatar.height);
    ctx.drawImage(avatar, (avatar.width - side) / 2, (avatar.height - side) / 2, side, side, ax, ay, av, av);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(ax, ay, av, av);
    const initials = name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
    text(ctx, initials, ax + av / 2, ay + av / 2 + 20, { size: 56, weight: 700, align: 'center' });
  }
  ctx.restore();

  const tx = ax + av + 36;
  const tw = w - (tx - x) - pad;
  text(ctx, name, tx, ay + 72, { size: 58, weight: 800, maxWidth: tw });
  text(ctx, rankLabel ? `${handle} · ${rankLabel}` : handle, tx, ay + 124, { size: 32, weight: 500, color: 'rgba(255,255,255,0.55)', maxWidth: tw });

  let cy = ay + av + 40;
  for (const line of bioLines) {
    cy += 40;
    text(ctx, line, x + pad, cy, { size: 34, weight: 400, color: 'rgba(255,255,255,0.78)' });
  }

  // 3 métricas
  const top = cy + 120;
  const colW = (w - pad * 2) / 3;
  metrics.slice(0, 3).forEach((m, i) => {
    const cx = x + pad + i * colW + (i > 0 ? 36 : 0);
    if (i > 0) {
      ctx.fillStyle = theme.line;
      ctx.fillRect(x + pad + i * colW, top - 96, 2, 150);
    }
    const vw = text(ctx, m.value, cx, top, { size: 96, weight: 700, color: theme.accent, maxWidth: colW - 70 });
    if (m.unit) text(ctx, m.unit, cx + vw + 8, top, { size: 36, weight: 500, color: 'rgba(255,255,255,0.55)' });
    text(ctx, m.label, cx, top + 50, { size: 30, weight: 500, color: 'rgba(255,255,255,0.55)', maxWidth: colW - 40 });
  });

  // Assinatura
  const fy = y + h - 64;
  ctx.fillStyle = theme.line;
  ctx.fillRect(x + pad, fy - 52, w - pad * 2, 2);
  text(ctx, 'AB FITNESS', x + pad, fy, { size: 26, weight: 800, color: 'rgba(255,255,255,0.6)' });
  text(ctx, 'abfitness.app', x + w - pad, fy, { size: 26, weight: 500, color: 'rgba(255,255,255,0.45)', align: 'right' });
  return h;
}

/** Linha da força total (índice 100 = início do período), branca sobre trilho discreto. */
function drawEvolution(ctx, { x, y, w, evolution }) {
  const gain = evolution.totalGainPct;
  const label = gain > 0 ? `+${gain}%` : gain < 0 ? `−${Math.abs(gain)}%` : '0%';
  const vw = text(ctx, label, x, y + 150, { size: 168, weight: 800 });
  text(ctx, 'mais forte', x + vw + 24, y + 96, { size: 38, weight: 600, color: 'rgba(255,255,255,0.85)' });
  text(ctx, `em ${evolution.windowDays} dias`, x + vw + 24, y + 146, { size: 38, weight: 500, color: 'rgba(255,255,255,0.5)' });

  const series = evolution.series || [];
  if (series.length < 2) return;
  const cy = y + 230;
  const ch = 200;
  const values = series.map((p) => p.value);
  const min = Math.min(100, ...values);
  const max = Math.max(...values, min + 1);
  const px = (i) => x + (i / (series.length - 1)) * w;
  const py = (v) => cy + ch - ((v - min) / (max - min)) * ch;

  ctx.beginPath();
  series.forEach((p, i) => (i === 0 ? ctx.moveTo(px(i), py(p.value)) : ctx.lineTo(px(i), py(p.value))));
  ctx.lineTo(px(series.length - 1), cy + ch);
  ctx.lineTo(px(0), cy + ch);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fill();

  ctx.beginPath();
  series.forEach((p, i) => (i === 0 ? ctx.moveTo(px(i), py(p.value)) : ctx.lineTo(px(i), py(p.value))));
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  const last = series[series.length - 1];
  ctx.beginPath();
  ctx.arc(px(series.length - 1), py(last.value), 12, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

/**
 * Gera o PNG do cartão.
 * @param {{ profile, metrics, theme, rankLabel?, evolution?, format?: 'story'|'feed' }} opts
 */
export async function renderProfileCardBlob({ profile = {}, metrics = [], theme, rankLabel = '', evolution = null, format = 'story' } = {}) {
  const { w: W, h: H } = SIZES[format] || SIZES.story;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  const avatar = await loadImage(profile?.avatar_url);
  const cardX = 72;
  const cardW = W - 144;
  const showEvolution = format === 'story' && evolution?.ready;
  const cardY = format === 'story' ? (showEvolution ? 260 : 560) : 150;

  text(ctx, 'AB FITNESS', W / 2, format === 'story' ? 170 : 96, { size: 26, weight: 800, color: 'rgba(255,255,255,0.5)', align: 'center' });
  const cardH = drawCard(ctx, { x: cardX, y: cardY, w: cardW, theme, profile, metrics, rankLabel, avatar });

  if (showEvolution) {
    drawEvolution(ctx, { x: cardX + 8, y: cardY + cardH + 110, w: cardW - 16, evolution });
  }

  const invite = profile?.username ? `abfitness.app/?u=${profile.username}` : 'abfitness.app';
  text(ctx, invite, W / 2, H - (format === 'story' ? 150 : 90), { size: 30, weight: 600, color: 'rgba(255,255,255,0.6)', align: 'center' });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
