/**
 * shareCard.js — AB Fitness
 * Gera um card cinematográfico 9:16 (1080x1920) em Canvas otimizado para Instagram Stories e WhatsApp.
 */

export async function generateAndShareWorkoutCard(treino) {
  if (!treino) return;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // 1. Fundo Gradiente Escuro
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
  bgGrad.addColorStop(0, '#0b0d12');
  bgGrad.addColorStop(0.5, '#050608');
  bgGrad.addColorStop(1, '#050608');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Brilho Ciano no Topo
  const glow = ctx.createRadialGradient(540, 250, 50, 540, 250, 500);
  glow.addColorStop(0, 'rgba(43, 74, 122, 0.18)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1080, 800);

  // 3. Moldura e Linhas Estéticas
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, 960, 1800);

  // 4. Marca Superior AB Fitness
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AB FITNESS  •  COACH IA', 540, 170);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '600 24px sans-serif';
  ctx.fillText('PRESCRIÇÃO BIOMECÂNICA DE ALTA PERFORMANCE', 540, 215);

  // 5. Card Central de Destaque
  ctx.fillStyle = 'rgba(11, 13, 18, 0.85)';
  ctx.strokeStyle = 'rgba(43, 74, 122, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(100, 280, 880, 240, 32);
  ctx.fill();
  ctx.stroke();

  // Título do Treino
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px sans-serif';
  ctx.fillText(treino.nome || 'Treino Personalizado', 540, 375);

  // Metadados (Foco & Duração)
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 28px sans-serif';
  ctx.fillText(`FOCO: ${(treino.foco || 'Hipertrofia').toUpperCase()}`, 540, 435);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 26px sans-serif';
  ctx.fillText(`⏱️ ${treino.duracao_min || 45} MINUTOS  •  ⚡ ${treino.exercicios?.length || 0} EXERCÍCIOS`, 540, 480);

  // 6. Lista de Exercícios
  let startY = 590;
  const exercicios = (treino.exercicios || []).slice(0, 7);

  exercicios.forEach((ex, idx) => {
    // Fundo do Item
    ctx.fillStyle = 'rgba(17, 20, 27, 0.92)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(100, startY, 880, 130, 20);
    ctx.fill();
    ctx.stroke();

    // Número
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${idx + 1}.`, 135, startY + 58);

    // Nome do Exercício
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 32px sans-serif';
    const cleanName = ex.nome.length > 28 ? ex.nome.slice(0, 26) + '...' : ex.nome;
    ctx.fillText(cleanName, 185, startY + 58);

    // Porção Muscular Badge
    if (ex.porcao) {
      ctx.fillStyle = 'rgba(43, 74, 122, 0.12)';
      ctx.beginPath();
      ctx.roundRect(760, startY + 28, 190, 42, 10);
      ctx.fill();

      ctx.fillStyle = '#c9d3e6';
      ctx.font = '700 20px sans-serif';
      ctx.textAlign = 'center';
      const porcaoText = ex.porcao.length > 12 ? ex.porcao.slice(0, 10) + '..' : ex.porcao;
      ctx.fillText(porcaoText.toUpperCase(), 855, startY + 56);
    }

    // Séries & Repetições
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = '600 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${ex.series} séries × ${ex.reps} reps  •  ${ex.descanso_seg}s descanso`, 185, startY + 98);

    startY += 150;
  });

  // 7. Rodapé com Branding & Mensagem
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '600 24px sans-serif';
  ctx.fillText('SOBRECARGA PROGRESSIVA  •  EXECUÇÃO CONTROLADA  •  CONSISTÊNCIA', 540, 1750);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px sans-serif';
  ctx.fillText('www.abfitness.app', 540, 1800);

  // 8. Compartilhar ou Baixar
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], 'treino-ab-coach.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Treino AB Coach: ${treino.nome}`,
          text: `Confira meu treino prescrito pelo AB Coach IA no AB Fitness! ⚡`
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') console.warn('Erro ao compartilhar nativamente:', err);
      }
    }

    // Fallback: Download da imagem
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `treino-ab-coach-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
