/**
 * streakResultCard.js — Cartão de Partilha da Sequência (AB Fitness)
 * Gera um cartão 9:16 (1080x1920) em Canvas com o número de dias e a patente editorial do
 * marco atingido — mesmo formato e pipeline de partilha dos outros cartões (workout/badge).
 */

import { TIER_COLORS } from './streakMilestones';

const W = 1080;
const H = 1920;

function label(ctx, text, x, y, { size = 26, weight = 700, color = '#a1a1aa', align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/** Desenha o cartão 1080x1920 da sequência e devolve o PNG como Blob. */
export async function buildStreakResultCard({ streakDays, title, tier = 'base' } = {}) {
  const colors = TIER_COLORS[tier] || TIER_COLORS.base;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0d12');
  bg.addColorStop(1, '#050608');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = 620;

  const glow = ctx.createRadialGradient(cx, cy, 60, cx, cy, 640);
  glow.addColorStop(0, colors.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1200);

  label(ctx, 'AB FITNESS · SEQUÊNCIA', cx, 150, { size: 28, weight: 800, color: '#ffffff', align: 'center' });

  // Anel da sequência
  const outerR = 240;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = colors.primary;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 26, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.stroke();

  label(ctx, `${streakDays}`, cx, cy + 50, { size: 150, weight: 900, color: '#ffffff', align: 'center' });
  label(ctx, streakDays === 1 ? 'DIA SEGUIDO' : 'DIAS SEGUIDOS', cx, cy + 100, { size: 26, weight: 700, color: colors.primary, align: 'center' });

  if (title) {
    label(ctx, title.toUpperCase(), W / 2, 1060, { size: 54, weight: 900, color: '#ffffff', align: 'center' });
  }

  label(ctx, 'Sobrecarga progressiva · Consistência', W / 2, H - 140, {
    size: 24,
    weight: 600,
    color: 'rgba(255,255,255,0.35)',
    align: 'center'
  });
  label(ctx, 'www.abfitness.app', W / 2, H - 90, { size: 28, weight: 800, color: 'rgba(255,255,255,0.55)', align: 'center' });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Partilha nativa (Instagram Stories/WhatsApp) com fallback para download. */
export async function shareStreakResultCard(blob, { streakDays = 0 } = {}) {
  if (!blob) return;
  const file = new File([blob], 'ab-fitness-sequencia.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${streakDays} dias seguidos — AB Fitness`
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ab-fitness-sequencia-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
