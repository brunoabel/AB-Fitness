/**
 * workoutResultCard.js — Card de Conquista (AB Fitness)
 * Gera um card 9:16 (1080x1920) em Canvas com o resumo do treino concluído e,
 * quando existem, os novos Recordes Pessoais — pronto para Instagram Stories/WhatsApp.
 */

const W = 1080;
const H = 1920;
const ACCENT = '#ffffff';
const NAVY = '#2B4A7A';

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

/** Desenha o card 1080x1920 e devolve o PNG como Blob. */
export async function buildWorkoutResultCard(params) {
  const content = buildWorkoutCardContent(params);
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

  // Halo navy subtil no topo (marca de destaque, nunca ciano/laranja)
  const glow = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 560);
  glow.addColorStop(0, 'rgba(43, 74, 122, 0.22)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 900);

  // Cabeçalho
  label(ctx, content.eyebrow, W / 2, 150, { size: 28, weight: 800, color: ACCENT, align: 'center' });
  label(ctx, content.headline, W / 2, 245, { size: 64, weight: 900, color: '#ffffff', align: 'center' });
  label(ctx, content.title, W / 2, 300, { size: 32, weight: 700, color: 'rgba(255,255,255,0.65)', align: 'center' });

  let y = 390;

  // Destaques de PR (se existirem)
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
    y += 40;
  } else {
    y += 80;
  }

  // Estatísticas da sessão
  const colW = (W - 160 - 2 * 24) / 3;
  content.stats.forEach((s, i) => {
    const x = 80 + i * (colW + 24);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, x, y, colW, 190, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, colW, 190, 24);
    ctx.stroke();

    label(ctx, s.label, x + colW / 2, y + 54, { size: 22, weight: 700, color: '#a1a1aa', align: 'center' });
    label(ctx, s.value, x + colW / 2, y + 128, { size: 52, weight: 900, color: '#ffffff', align: 'center' });
    if (s.unit) {
      label(ctx, s.unit, x + colW / 2, y + 162, { size: 22, weight: 600, color: '#71717a', align: 'center' });
    }
  });

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
