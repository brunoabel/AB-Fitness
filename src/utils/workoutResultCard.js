/**
 * workoutResultCard.js — Card de Conquista (AB Fitness)
 * Gera um card 9:16 (1080x1920) em Canvas com o resumo do treino concluído e, quando existem,
 * os novos Recordes Pessoais — pronto para Instagram Stories/WhatsApp.
 *
 * Três variantes (`variant`):
 * - 'card': fundo OLED opaco, para partilhar isolado (sem foto por baixo).
 * - 'sticker-white': fundo 100% transparente, texto branco com sombra escura — para colar
 *   sobre uma foto no editor de Stories/Reels.
 * - 'sticker-dark': igual, mas texto escuro com sombra clara — para fotos de fundo claro.
 */

const W = 1080;
const H = 1920;
const ACCENT = '#ffffff';
const NAVY = '#2B4A7A';

const VARIANTS = {
  card: { transparent: false },
  'sticker-white': { transparent: true, ink: '#ffffff', sub: 'rgba(255,255,255,0.75)', shadow: 'rgba(0,0,0,0.65)' },
  'sticker-dark': { transparent: true, ink: '#0a0a0c', sub: 'rgba(10,10,12,0.75)', shadow: 'rgba(255,255,255,0.55)' }
};

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

/**
 * Deriva o conteúdo textual do card a partir dos dados do treino — lógica pura,
 * sem Canvas, para poder ser testada isoladamente.
 */
export function buildWorkoutCardContent({
  workoutName,
  durationMinutes = 0,
  totalSetsCompleted = 0,
  totalVolumeKg = 0,
  newPRs = []
} = {}) {
  const hasPRs = Array.isArray(newPRs) && newPRs.length > 0;
  const eyebrow = hasPRs ? 'AB FITNESS · NOVO RECORDE' : 'AB FITNESS · TREINO CONCLUÍDO';
  const headline = !hasPRs
    ? 'Treino Concluído'
    : newPRs.length === 1
      ? 'Novo Recorde Pessoal'
      : `${newPRs.length} Novos Recordes Pessoais`;
  const title = (workoutName || '').trim() || 'Sessão de Treino';

  const prLines = hasPRs
    ? newPRs.slice(0, 3).map((p) => {
        const rawName = p?.exerciseName || 'Exercício';
        return {
          name: rawName.length > 28 ? `${rawName.slice(0, 26)}…` : rawName,
          value: p?.isTimed ? `${p.duration}s` : `${p?.e1RM ?? 0} kg`,
          sub: p?.isTimed ? 'Melhor tempo' : '1RM estimado'
        };
      })
    : [];

  const stats = [
    { label: 'TEMPO', value: `${durationMinutes}`, unit: 'min' },
    { label: 'SÉRIES', value: `${totalSetsCompleted}`, unit: '' },
    { label: 'VOLUME', value: `${totalVolumeKg}`, unit: 'kg' }
  ];

  return { hasPRs, eyebrow, headline, title, prLines, stats };
}

/** Desenha a variante 'card': fundo OLED opaco, estatísticas em texto corrido com divisores. */
function drawOpaqueCard(ctx, content) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b0d12');
  bg.addColorStop(1, '#050608');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 560);
  glow.addColorStop(0, 'rgba(43, 74, 122, 0.22)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 900);

  label(ctx, content.eyebrow, W / 2, 150, { size: 28, weight: 800, color: ACCENT, align: 'center' });
  label(ctx, content.headline, W / 2, 245, { size: 64, weight: 900, color: '#ffffff', align: 'center' });
  label(ctx, content.title, W / 2, 300, { size: 32, weight: 700, color: 'rgba(255,255,255,0.65)', align: 'center' });

  let y = 390;

  if (content.hasPRs) {
    content.prLines.forEach((pr) => {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      roundRect(ctx, 80, y, W - 160, 150, 26);
      ctx.fill();
      ctx.strokeStyle = `${NAVY}80`;
      ctx.lineWidth = 2;
      roundRect(ctx, 80, y, W - 160, 150, 26);
      ctx.stroke();

      label(ctx, pr.sub.toUpperCase(), 115, y + 48, { size: 22, weight: 700, color: '#a1a1aa' });
      label(ctx, pr.name, 115, y + 96, { size: 36, weight: 800, color: '#ffffff' });
      label(ctx, pr.value, W - 115, y + 90, { size: 48, weight: 900, color: ACCENT, align: 'right' });
      y += 170;
    });
    y += 60;
  } else {
    y += 100;
  }

  // Estatísticas em texto corrido com divisores finos (sem caixas KPI)
  const segW = (W - 160) / 3;
  content.stats.forEach((s, i) => {
    const cx = 80 + segW * i + segW / 2;
    label(ctx, s.label, cx, y, { size: 22, weight: 700, color: '#71717a', align: 'center' });
    label(ctx, s.unit ? `${s.value} ${s.unit}` : s.value, cx, y + 66, { size: 50, weight: 900, color: '#ffffff', align: 'center' });
    if (i > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80 + segW * i, y - 30);
      ctx.lineTo(80 + segW * i, y + 50);
      ctx.stroke();
    }
  });

  label(ctx, 'Sobrecarga progressiva · Consistência', W / 2, H - 140, {
    size: 24,
    weight: 600,
    color: 'rgba(255,255,255,0.35)',
    align: 'center'
  });
  label(ctx, 'www.abfitness.app', W / 2, H - 90, { size: 28, weight: 800, color: 'rgba(255,255,255,0.55)', align: 'center' });
}

/** Desenha um sticker transparente: sem fundo, sem caixas — só tipografia com sombra para legibilidade sobre qualquer foto. */
function drawTransparentSticker(ctx, content, { ink, sub, shadow }) {
  ctx.clearRect(0, 0, W, H);
  ctx.shadowColor = shadow;
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  const top = H / 2 - 420;

  label(ctx, 'AB FITNESS', W / 2, top, { size: 34, weight: 900, color: ink, align: 'center' });
  label(ctx, content.title, W / 2, top + 64, { size: 30, weight: 700, color: sub, align: 'center' });

  label(ctx, content.headline, W / 2, top + 170, { size: 56, weight: 900, color: ink, align: 'center' });

  let y = top + 280;

  if (content.hasPRs) {
    const pr = content.prLines[0];
    label(ctx, `${pr.name} · ${pr.value}`, W / 2, y, { size: 38, weight: 800, color: ink, align: 'center' });
    y += 90;
  }

  const segW = (W - 160) / 3;
  content.stats.forEach((s, i) => {
    const cx = 80 + segW * i + segW / 2;
    label(ctx, s.label, cx, y, { size: 22, weight: 700, color: sub, align: 'center' });
    label(ctx, s.unit ? `${s.value} ${s.unit}` : s.value, cx, y + 64, { size: 46, weight: 900, color: ink, align: 'center' });
  });

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/** Desenha o card no formato pedido por `variant` e devolve o PNG como Blob (canal alfa preservado nas variantes sticker). */
export async function buildWorkoutResultCard(params, variant = 'card') {
  const content = buildWorkoutCardContent(params);
  const config = VARIANTS[variant] || VARIANTS.card;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  if (config.transparent) {
    drawTransparentSticker(ctx, content, config);
  } else {
    drawOpaqueCard(ctx, content);
  }

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Partilha nativa (Instagram Stories/WhatsApp) com fallback para download. */
export async function shareWorkoutResultCard(blob, { hasPRs = false } = {}) {
  if (!blob) return;
  const file = new File([blob], 'ab-fitness-treino.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: hasPRs ? 'Novo Recorde Pessoal — AB Fitness' : 'Treino Concluído — AB Fitness'
      });
      return;
    } catch (err) {
      if (err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ab-fitness-treino-${Date.now()}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Copia a imagem diretamente para a área de transferência (colar no editor de Stories). Devolve `true` em sucesso. */
export async function copyWorkoutResultCardToClipboard(blob) {
  if (!blob || !navigator.clipboard || !window.ClipboardItem) return false;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
