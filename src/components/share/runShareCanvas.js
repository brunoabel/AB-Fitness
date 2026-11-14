import { getNormalizedRoutePath } from '../../utils/runningService';

export function loadLogoImage() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = '/ab-logo.png';
  });
}

function drawDefaultBackground(ctx, w, h, currentTheme) {
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.9);
  bgGrad.addColorStop(0, currentTheme.bgGrad[0]);
  bgGrad.addColorStop(1, currentTheme.bgGrad[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1.5;
  const gridSize = 70;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawGraphicOverlays(ctx, w, h, logoImg, params) {
  const {
    aspectRatio,
    currentTheme,
    dateFormatted,
    timeFormatted,
    sessionTitle,
    effectiveCoordinates,
    distanceKm,
    paceStr,
    durationStr,
    calories
  } = params;

  const isStoryMode = aspectRatio === 'story';
  const paddingX = 80;
  const isSticker = Boolean(currentTheme.transparent);
  const ink = isSticker ? currentTheme.ink : '#FFFFFF';
  const sub = isSticker
    ? (currentTheme.ink === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(10,10,12,0.6)')
    : null;
  if (isSticker) {
    ctx.shadowColor = currentTheme.shadow;
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 3;
  }

  const logoSize = 100;
  const logoX = paddingX;
  const logoY = isStoryMode ? 110 : 70;

  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(logoX, logoY, logoSize, logoSize, 24);
  ctx.fill();
  ctx.stroke();

  if (logoImg) {
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
  }
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = ink;
  ctx.font = '700 36px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('AB FITNESS', logoX + logoSize + 24, logoY + 44);

  ctx.fillStyle = currentTheme.accent;
  ctx.font = '600 18px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('RUNNING CLUB', logoX + logoSize + 24, logoY + 76);

  ctx.textAlign = 'right';
  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.55)';
  ctx.font = '500 20px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(`${dateFormatted} • ${timeFormatted}`, w - paddingX, logoY + 44);
  ctx.textAlign = 'left';

  const titleY = logoY + logoSize + (isStoryMode ? 55 : 35);
  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.45)';
  ctx.font = '600 18px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('ATIVIDADE REGISTRADA', paddingX, titleY);

  ctx.fillStyle = ink;
  ctx.font = '700 44px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(sessionTitle, paddingX, titleY + 46);

  const mapBoxY = titleY + 75;
  const mapBoxW = w - paddingX * 2;
  const mapBoxH = isStoryMode ? 520 : 360;

  ctx.save();
  if (!isSticker) {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(paddingX, mapBoxY, mapBoxW, mapBoxH, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '700 16px system-ui, sans-serif';
    ctx.fillText('MAPA DO PERCURSO • GPS AO VIVO', paddingX + 24, mapBoxY + 36);
  }

  if (effectiveCoordinates && effectiveCoordinates.length > 1) {
    const innerW = mapBoxW - 80;
    const innerH = mapBoxH - 90;
    const innerNorm = getNormalizedRoutePath(effectiveCoordinates, innerW, innerH, 30);

    if (innerNorm && innerNorm.points) {
      ctx.translate(paddingX + 40, mapBoxY + 50);

      ctx.shadowColor = currentTheme.glow;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = currentTheme.accent;
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      ctx.beginPath();
      innerNorm.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (innerNorm.startPoint) {
        ctx.fillStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(innerNorm.startPoint.x, innerNorm.startPoint.y, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(innerNorm.startPoint.x, innerNorm.startPoint.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (innerNorm.endPoint) {
        ctx.fillStyle = currentTheme.accent;
        ctx.shadowColor = currentTheme.accent;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(innerNorm.endPoint.x, innerNorm.endPoint.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(innerNorm.endPoint.x, innerNorm.endPoint.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();

  const statsY = mapBoxY + mapBoxH + (isStoryMode ? 65 : 35);

  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.55)';
  ctx.font = '600 22px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('DISTÂNCIA TOTAL', paddingX, statsY);

  ctx.fillStyle = ink;
  ctx.font = '700 144px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(distanceKm, paddingX, statsY + 125);

  ctx.fillStyle = currentTheme.accent;
  ctx.font = '600 52px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  const distWidth = ctx.measureText(distanceKm).width;
  ctx.fillText('KM', paddingX + distWidth + 24, statsY + 125);

  if (!isSticker) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, statsY + 175);
    ctx.lineTo(w - paddingX, statsY + 175);
    ctx.stroke();
  }

  const metricsRowY = statsY + 230;
  const colWidth = (w - paddingX * 2) / 3;

  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.5)';
  ctx.font = '600 22px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('RITMO MÉDIO', paddingX, metricsRowY);
  ctx.fillStyle = ink;
  ctx.font = '600 60px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(paceStr, paddingX, metricsRowY + 68);

  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.5)';
  ctx.font = '600 22px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('TEMPO TOTAL', paddingX + colWidth, metricsRowY);
  ctx.fillStyle = ink;
  ctx.font = '600 60px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(durationStr, paddingX + colWidth, metricsRowY + 68);

  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.5)';
  ctx.font = '600 22px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText('CALORIAS', paddingX + colWidth * 2, metricsRowY);
  ctx.fillStyle = ink;
  ctx.font = '600 60px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.fillText(`${calories} kcal`, paddingX + colWidth * 2, metricsRowY + 68);

  const footerY = h - (isStoryMode ? 70 : 40);
  ctx.fillStyle = isSticker ? sub : 'rgba(255, 255, 255, 0.4)';
  ctx.font = '500 20px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('abfitness.app • AB Fitness Running Club', w / 2, footerY);
  ctx.textAlign = 'left';

  if (isSticker) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}

/**
 * Gera canvas de alta resolução (1080x1920 ou 1080x1080) para partilha da corrida.
 */
export async function generateRunShareCanvas(params) {
  const { aspectRatio, currentTheme, bgMode, customPhotoUrl } = params;
  const isStory = aspectRatio === 'story';
  const canvasWidth = 1080;
  const canvasHeight = isStory ? 1920 : 1080;
  const logoImg = await loadLogoImage();

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (currentTheme.transparent) {
      drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg, params);
      resolve(canvas);
      return;
    }

    if (bgMode === 'custom-photo' && customPhotoUrl) {
      const photoImg = new Image();
      photoImg.crossOrigin = 'anonymous';
      photoImg.onload = () => {
        const scale = Math.max(canvasWidth / photoImg.width, canvasHeight / photoImg.height);
        const x = (canvasWidth - photoImg.width * scale) / 2;
        const y = (canvasHeight - photoImg.height * scale) / 2;
        ctx.drawImage(photoImg, x, y, photoImg.width * scale, photoImg.height * scale);

        const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
        grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.45)');
        grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg, params);
        resolve(canvas);
      };
      photoImg.onerror = () => {
        drawDefaultBackground(ctx, canvasWidth, canvasHeight, currentTheme);
        drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg, params);
        resolve(canvas);
      };
      photoImg.src = customPhotoUrl;
    } else {
      drawDefaultBackground(ctx, canvasWidth, canvasHeight, currentTheme);
      drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg, params);
      resolve(canvas);
    }
  });
}
