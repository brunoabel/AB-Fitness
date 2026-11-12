/**
 * badgeResultCard.js — Card de Conquista Desbloqueada (AB Fitness)
 * Gera um card 9:16 (1080x1920) em Canvas com o troféu da medalha — mesmo formato e
 * pipeline de partilha do card de treino (workoutResultCard.js), para a celebração de
 * uma medalha ter o mesmo nível de produção que um Recorde Pessoal.
 */

const W = 1080;
const H = 1920;

const TIER_LABEL = { gold: 'OURO', silver: 'PRATA', bronze: 'BRONZE' };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, text, x, y, { size = 26, weight = 700, color = '#a1a1aa', align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

/** Quebra `text` em linhas que cabem em `maxWidth`, devolvendo no máximo `maxLines`. */
function wrapLines(ctx, text, maxWidth, maxLines) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

/** Desenha o card 1080x1920 da medalha e devolve o PNG como Blob. */
export async function buildBadgeResultCard(badge) {
  const color = badge?.color || '#ffffff';
  const tierLabel = TIER_LABEL[badge?.tier] || 'CONQUISTA';

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

  // Halo na cor do tier da medalha, centrado no medalhão
  const glow = ctx.createRadialGradient(W / 2, 560, 60, W / 2, 560, 620);
  glow.addColorStop(0, `${color}33`);
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 1100);

  label(ctx, 'AB FITNESS · CONQUISTA DESBLOQUEADA', W / 2, 150, { size: 28, weight: 800, color: '#ffffff', align: 'center' });

  // Medalhão circular com anel na cor do tier
  const cx = W / 2;
  const cy = 560;
  const outerR = 220;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, outerR - 22, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.stroke();

  label(ctx, tierLabel, cx, cy - 10, { size: 34, weight: 800, color, align: 'center' });
  label(ctx, '★', cx, cy + 90, { size: 72, weight: 900, color, align: 'center' });

  // Título e descrição da medalha
  label(ctx, (badge?.title || 'Conquista').toUpperCase(), W / 2, 980, { size: 58, weight: 900, color: '#ffffff', align: 'center' });

  ctx.font = '600 32px system-ui, -apple-system, sans-serif';
  const descLines = wrapLines(ctx, badge?.desc || '', W - 220, 3);
  let y = 1060;
  descLines.forEach((line) => {
    label(ctx, line, W / 2, y, { size: 32, weight: 600, color: 'rgba(255,255,255,0.65)', align: 'center' });
    y += 46;
  });

  // Selo inferior
  roundRect(ctx, W / 2 - 220, H - 320, 440, 100, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  roundRect(ctx, W / 2 - 220, H - 320, 440, 100, 24);
  ctx.stroke();
  label(ctx, 'DESBLOQUEADA HOJE', W / 2, H - 258, { size: 24, weight: 700, color: '#a1a1aa', align: 'center' });

  // Rodapé
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
export async function shareBadgeResultCard(blob, badge) {
  if (!blob) return;
  const file = new File([blob], 'ab-fitness-medalha.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${badge?.title || 'Nova Conquista'} — AB Fitness`
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ab-fitness-medalha-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
