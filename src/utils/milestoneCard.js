/**
 * milestoneCard.js — Card de Marco do Portfólio Corporal (AB Fitness)
 * Gera um card 9:16 (1080x1920) com antes/depois, variação corporal e melhores marcas de força.
 */

import { formatDatePt } from './bodyPortfolio';

const W = 1080;
const H = 1920;
const ACCENT = '#ffffff';

function loadBlobImage(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar foto.'));
    };
    img.src = url;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Desenha a imagem em modo "cover" dentro do retângulo arredondado. */
function drawCover(ctx, img, x, y, w, h, r) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function label(ctx, text, x, y, { size = 26, weight = 700, color = '#a1a1aa', align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function signed(n, unit) {
  const v = Math.round(n * 10) / 10;
  return `${v > 0 ? '+' : ''}${v.toLocaleString('pt-PT')} ${unit}`;
}

/**
 * @param {object} p
 * @param {{blob: Blob, date: string}|null} p.before
 * @param {{blob: Blob, date: string}|null} p.after
 * @param {Array<{label: string, unit: string, first: number, last: number}>} p.deltas
 * @param {Array<{name: string, e1RM: number, weight: number, reps: number}>} p.lifts
 * @param {number} p.days
 */
export async function buildMilestoneCard({ before, after, deltas = [], lifts = [], days = 0 }) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0d12');
  bg.addColorStop(1, '#050608');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cabeçalho
  label(ctx, 'AB FITNESS  ·  PORTFÓLIO', 80, 130, { size: 28, weight: 800, color: ACCENT });
  label(ctx, days > 0 ? `${days} dias de evolução` : 'A minha evolução', 80, 215, { size: 68, weight: 900, color: '#ffffff' });

  let y = 280;

  // Antes / Depois
  const hasPhotos = before && after;
  if (hasPhotos) {
    const [imgA, imgB] = await Promise.all([loadBlobImage(before.blob), loadBlobImage(after.blob)]);
    const pw = 445;
    const ph = 740;
    drawCover(ctx, imgA, 80, y, pw, ph, 28);
    drawCover(ctx, imgB, 80 + pw + 30, y, pw, ph, 28);

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 4;
    roundRect(ctx, 80 + pw + 30, y, pw, ph, 28);
    ctx.stroke();

    const tag = (text, x, color, textColor) => {
      ctx.font = '800 26px system-ui, -apple-system, sans-serif';
      const tw = ctx.measureText(text).width + 36;
      ctx.fillStyle = color;
      roundRect(ctx, x, y + ph - 70, tw, 48, 24);
      ctx.fill();
      label(ctx, text, x + 18, y + ph - 37, { size: 26, weight: 800, color: textColor });
    };
    tag(`ANTES · ${formatDatePt(before.date)}`, 100, 'rgba(0,0,0,0.65)', '#ffffff');
    tag(`DEPOIS · ${formatDatePt(after.date)}`, 100 + pw + 30, ACCENT, '#050608');
    y += ph + 70;
  } else {
    y += 40;
  }

  // Variações corporais
  const shown = deltas.slice(0, 3);
  if (shown.length) {
    const colW = (W - 160 - (shown.length - 1) * 24) / shown.length;
    shown.forEach((d, i) => {
      const x = 80 + i * (colW + 24);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, x, y, colW, 190, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();
      label(ctx, d.label.toUpperCase(), x + 30, y + 52, { size: 24, weight: 700 });
      label(ctx, signed(d.last - d.first, d.unit), x + 30, y + 120, { size: 52, weight: 900, color: '#ffffff' });
      label(ctx, `${d.first.toLocaleString('pt-PT')} → ${d.last.toLocaleString('pt-PT')} ${d.unit}`, x + 30, y + 162, { size: 24, weight: 600, color: '#71717a' });
    });
    y += 250;
  }

  // Melhores marcas
  if (lifts.length) {
    label(ctx, 'MELHORES MARCAS (1RM EST.)', 80, y + 20, { size: 26, weight: 800, color: ACCENT });
    y += 60;
    lifts.slice(0, 3).forEach((l) => {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, 80, y, W - 160, 110, 22);
      ctx.fill();
      const name = l.name.length > 30 ? `${l.name.slice(0, 29)}…` : l.name;
      label(ctx, name, 115, y + 48, { size: 32, weight: 700, color: '#ffffff' });
      label(ctx, `${l.weight} kg × ${l.reps}`, 115, y + 86, { size: 24, weight: 600, color: '#71717a' });
      label(ctx, `${l.e1RM} kg`, W - 115, y + 70, { size: 44, weight: 900, color: ACCENT, align: 'right' });
      y += 130;
    });
  }

  // Rodapé
  label(ctx, 'www.abfitness.app', W / 2, H - 90, { size: 28, weight: 800, color: 'rgba(255,255,255,0.55)', align: 'center' });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Partilha nativa com fallback para download. */
export async function shareMilestoneCard(blob) {
  if (!blob) return;
  const file = new File([blob], 'ab-fitness-evolucao.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'A minha evolução no AB Fitness' });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ab-fitness-evolucao-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
