import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Camera, 
  Copy, 
  Check, 
  Sparkles, 
  MapPin, 
  Flame, 
  Timer, 
  Zap,
  Edit2,
  Layers,
  Map as MapIcon,
  Palette
} from 'lucide-react';
import { getNormalizedRoutePath, formatDuration, formatPace } from '../utils/runningService';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';

// Temas visuais esportivos estilo Strava / AB Fitness
const THEMES = {
  'ab-cyan': {
    id: 'ab-cyan',
    name: 'AB Electric',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.75)',
    bgGrad: ['#0d1117', '#05070a'],
    badge: '⚡ Cyan'
  },
  'strava-orange': {
    id: 'strava-orange',
    name: 'Strava Orange',
    accent: '#fc5200',
    glow: 'rgba(252, 82, 0, 0.75)',
    bgGrad: ['#160e0a', '#0a0503'],
    badge: '🧡 Strava'
  },
  'satellite-map': {
    id: 'satellite-map',
    name: 'Google Satélite',
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.75)',
    bgGrad: ['#0f1715', '#060a08'],
    badge: '🛰️ Satélite'
  }
};

export default function RunningShareModal({ 
  runData, 
  isOpen, 
  onClose 
}) {
  const [aspectRatio, setAspectRatio] = useState('story'); // 'story' (9:16) | 'post' (1:1)
  const [themeId, setThemeId] = useState('ab-cyan');
  const [bgMode, setBgMode] = useState('map'); // 'map' | 'custom-photo'
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('Sessão de Treino de Hoje');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const cardPreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !runData) return null;

  const currentTheme = THEMES[themeId] || THEMES['ab-cyan'];
  const distanceKm = Number(runData.distanceKm || 0).toFixed(2);
  const durationStr = formatDuration(runData.durationSeconds);
  const paceStr = runData.avgPace || formatPace(runData.avgPaceSeconds);
  const calories = runData.calories || 0;
  const coordinates = runData.coordinates || [];

  // Gera o traçado vetorial normalizado da rota (proporcional para o minimapa)
  const isStory = aspectRatio === 'story';
  const minimapWidth = isStory ? 300 : 260;
  const minimapHeight = isStory ? 200 : 160;

  const routeData = getNormalizedRoutePath(
    coordinates, 
    minimapWidth, 
    minimapHeight, 
    20
  );

  // Formatar data em português
  const dateFormatted = new Date(runData.timestamp || Date.now()).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = new Date(runData.timestamp || Date.now()).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Upload de Foto Própria
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setBgMode('custom-photo');
      triggerHaptic(15);
    }
  };

  // Copiar resumo em texto para a legenda do Instagram / WhatsApp
  const handleCopyCaption = () => {
    const text = `🏃 ${sessionTitle.toUpperCase()} • AB FITNESS\n📍 Distância: ${distanceKm} km\n⚡ Ritmo Médio: ${paceStr}\n⏱️ Tempo: ${durationStr}\n🔥 Calorias: ${calories} kcal\n\nTreinado com a plataforma @ABFitness #ABFitness #RunningClub #Strava`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    triggerHaptic(10);
    setTimeout(() => setCopied(false), 2500);
  };

  // Carregar imagem de logo como Promise
  const loadLogoImage = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = '/ab-logo.png';
    });
  };

  // Gerar e renderizar imagem em altíssima resolução (1080x1920 ou 1080x1080)
  const generateHiResCanvas = async () => {
    return new Promise(async (resolve) => {
      const canvasWidth = 1080;
      const canvasHeight = isStory ? 1920 : 1080;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      const logoImg = await loadLogoImage();

      // 1. Fundo Base (Foto do Usuário ou Gradiente Esportivo)
      if (bgMode === 'custom-photo' && customPhotoUrl) {
        const photoImg = new Image();
        photoImg.crossOrigin = 'anonymous';
        photoImg.onload = () => {
          const scale = Math.max(canvasWidth / photoImg.width, canvasHeight / photoImg.height);
          const x = (canvasWidth - photoImg.width * scale) / 2;
          const y = (canvasHeight - photoImg.height * scale) / 2;
          ctx.drawImage(photoImg, x, y, photoImg.width * scale, photoImg.height * scale);

          // Gradiente cinematográfico escuro para contraste profissional
          const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
          grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.45)');
          grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg);
          resolve(canvas);
        };
        photoImg.onerror = () => {
          drawDefaultBackground(ctx, canvasWidth, canvasHeight);
          drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg);
          resolve(canvas);
        };
        photoImg.src = customPhotoUrl;
      } else {
        drawDefaultBackground(ctx, canvasWidth, canvasHeight);
        drawGraphicOverlays(ctx, canvasWidth, canvasHeight, logoImg);
        resolve(canvas);
      }
    });
  };

  // Fundo Esportivo com Linhas Tecnológicas Sutis
  const drawDefaultBackground = (ctx, w, h) => {
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.9);
    bgGrad.addColorStop(0, currentTheme.bgGrad[0]);
    bgGrad.addColorStop(1, currentTheme.bgGrad[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid sutil de coordenadas GPS
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1.5;
    const gridSize = 80;
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
  };

  // Renderização Completa dos Elementos Gráficos no Canvas
  const drawGraphicOverlays = (ctx, w, h, logoImg) => {
    const isStoryMode = aspectRatio === 'story';
    const paddingX = 80;

    // 1. CABEÇALHO: LOGO OFICIAL + TEXTO DA MARCA
    const logoSize = 100;
    const logoX = paddingX;
    const logoY = isStoryMode ? 100 : 70;

    // Box Preto do Logo com Borda Fina
    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 2.5;
    const r = 24;
    ctx.beginPath();
    ctx.roundRect(logoX, logoY, logoSize, logoSize, r);
    ctx.fill();
    ctx.stroke();

    if (logoImg) {
      const imgPad = 16;
      ctx.drawImage(logoImg, logoX + imgPad, logoY + 10, logoSize - imgPad * 2, (logoSize - imgPad * 2) * 0.75);
    }
    // "FITNESS" no logo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FITNESS', logoX + logoSize / 2, logoY + logoSize - 14);
    ctx.restore();

    // Texto da Marca ao lado do logo
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px system-ui, -apple-system, sans-serif';
    ctx.fillText('AB FITNESS', logoX + logoSize + 24, logoY + 44);

    ctx.fillStyle = currentTheme.accent;
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('RUNNING CLUB • PERFORMANCE', logoX + logoSize + 24, logoY + 76);

    // Data no Topo Direito
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${dateFormatted} • ${timeFormatted}`, w - paddingX, logoY + 44);
    ctx.textAlign = 'left';

    // 2. TÍTULO: SESSÃO DE TREINO DE HOJE
    const titleY = logoY + logoSize + (isStoryMode ? 60 : 40);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('ATIVIDADE REGISTRADA', paddingX, titleY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 44px system-ui, -apple-system, sans-serif';
    ctx.fillText(sessionTitle, paddingX, titleY + 46);

    // 3. MAPINHA DA CORRIDA (CONTAINER DEDICADO DO PERCURSO)
    const mapBoxY = titleY + 80;
    const mapBoxW = w - paddingX * 2;
    const mapBoxH = isStoryMode ? 520 : 360;

    // Fundo do Minimapa com Glassmorphism
    ctx.save();
    ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(paddingX, mapBoxY, mapBoxW, mapBoxH, 32);
    ctx.fill();
    ctx.stroke();

    // Selo do Mapa dentro da caixa
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '700 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('GOOGLE MAPS • ROTA GPS AO VIVO', paddingX + 24, mapBoxY + 36);

    // Traçado da Rota GPS dentro do Minimapa
    if (coordinates && coordinates.length > 1) {
      const innerW = mapBoxW - 80;
      const innerH = mapBoxH - 90;
      const innerNorm = getNormalizedRoutePath(coordinates, innerW, innerH, 30);

      if (innerNorm && innerNorm.points) {
        ctx.translate(paddingX + 40, mapBoxY + 50);

        // Brilho Neon Externo da Rota
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

        // Linha Interna Nítida
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ponto de Partida Verde
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

        // Ponto de Chegada Branco/Xadrez
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
    } else {
      // Percurso ilustrativo se não houver coordenadas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '600 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Circuito Treinado • AB Running Tracker', paddingX + mapBoxW / 2, mapBoxY + mapBoxH / 2);
      ctx.textAlign = 'left';
    }
    ctx.restore();

    // 4. BLOCO DE MÉTRICAS STRAVA: DISTÂNCIA GIGANTE + PACE + TEMPO
    const statsY = mapBoxY + mapBoxH + (isStoryMode ? 70 : 40);

    // Rótulo Distância
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('DISTÂNCIA TOTAL', paddingX, statsY);

    // Número da Distância
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 144px system-ui, -apple-system, sans-serif';
    ctx.fillText(distanceKm, paddingX, statsY + 125);

    // Unidade KM
    ctx.fillStyle = currentTheme.accent;
    ctx.font = '900 52px system-ui, -apple-system, sans-serif';
    const distWidth = ctx.measureText(distanceKm).width;
    ctx.fillText('KM', paddingX + distWidth + 24, statsY + 125);

    // Linha Divisória de Alta Classe
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, statsY + 175);
    ctx.lineTo(w - paddingX, statsY + 175);
    ctx.stroke();

    // Bloco Duplo: Ritmo (Pace) & Tempo Total
    const metricsRowY = statsY + 230;
    const colWidth = (w - paddingX * 2) / 3;

    // Card 1: Pace Médio
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('RITMO MÉDIO', paddingX, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, -apple-system, sans-serif';
    ctx.fillText(paceStr, paddingX, metricsRowY + 68);

    // Card 2: Tempo Total
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('TEMPO TOTAL', paddingX + colWidth, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, -apple-system, sans-serif';
    ctx.fillText(durationStr, paddingX + colWidth, metricsRowY + 68);

    // Card 3: Calorias
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('CALORIAS', paddingX + colWidth * 2, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${calories} kcal`, paddingX + colWidth * 2, metricsRowY + 68);

    // 5. RODAPÉ DE ASSINATURA EXECUTIVA
    const footerY = h - (isStoryMode ? 70 : 40);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('abfitness.app • AB Fitness Running Club', w / 2, footerY);
    ctx.textAlign = 'left';
  };

  // Download Direto da Imagem HD (PNG)
  const handleDownload = async () => {
    setIsExporting(true);
    triggerHaptic(20);
    try {
      const canvas = await generateHiResCanvas();
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `AB_Fitness_${sessionTitle.replace(/\s+/g, '_')}_${distanceKm}km.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Compartilhar Nativo no Instagram Stories / WhatsApp
  const handleShare = async () => {
    setIsExporting(true);
    triggerHaptic(20);
    try {
      const canvas = await generateHiResCanvas();
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          return;
        }

        const file = new File([blob], `ab_fitness_run_${Date.now()}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `${sessionTitle}: ${distanceKm} km`,
              text: `🏃 ${sessionTitle}: Fechei ${distanceKm} km com pace de ${paceStr} no @ABFitness Running Club!`
            });
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              handleDownload();
            }
          }
        } else {
          handleDownload();
          handleCopyCaption();
        }
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">Compartilhar Corrida</h2>
              <p className="text-[11px] text-zinc-400">Card executivo para Instagram Stories e Feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customização: Título da Sessão */}
        <div className="px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
              Título:
            </span>
            {isEditingTitle ? (
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
                className="w-full px-2 py-1 rounded-lg bg-zinc-800 border border-sky-500/50 text-white text-xs font-bold outline-none"
              />
            ) : (
              <span 
                onClick={() => setIsEditingTitle(true)}
                className="text-xs font-bold text-white hover:text-sky-400 transition-colors cursor-pointer truncate flex items-center gap-1.5"
                title="Clique para editar título"
              >
                <span>{sessionTitle}</span>
                <Edit2 className="w-3 h-3 text-zinc-500" />
              </span>
            )}
          </div>

          {/* Atalhos Rápidos de Título */}
          <button
            onClick={() => {
              setSessionTitle(sessionTitle === 'Sessão de Treino de Hoje' ? 'Corrida Matinal' : 'Sessão de Treino de Hoje');
              triggerHaptic(8);
            }}
            className="text-[10px] text-sky-400 hover:underline font-bold shrink-0 cursor-pointer"
          >
            Alternar Nome
          </button>
        </div>

        {/* Controles de Customização (Proporção, Estilo e Foto) */}
        <div className="p-3 bg-zinc-950/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Seletor de Aspect Ratio */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => { setAspectRatio('story'); triggerHaptic(8); }}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                aspectRatio === 'story' 
                  ? 'bg-white text-black shadow' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Story 9:16
            </button>
            <button
              onClick={() => { setAspectRatio('post'); triggerHaptic(8); }}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                aspectRatio === 'post' 
                  ? 'bg-white text-black shadow' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Feed 1:1
            </button>
          </div>

          {/* Paleta / Estilo da Rota */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {Object.values(THEMES).map((th) => (
              <button
                key={th.id}
                onClick={() => { setThemeId(th.id); setBgMode('map'); triggerHaptic(8); }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  themeId === th.id && bgMode === 'map'
                    ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={th.name}
              >
                {th.badge}
              </button>
            ))}

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                bgMode === 'custom-photo'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Carregar Foto Própria"
            >
              <Camera className="w-3 h-3" />
              <span>Foto</span>
            </button>
          </div>
        </div>

        {/* Pré-visualização Elegante do Card */}
        <div className="p-4 flex items-center justify-center bg-black/60 overflow-y-auto">
          <div 
            ref={cardPreviewRef}
            className={`relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col justify-between select-none transition-all ${
              aspectRatio === 'story' ? 'w-[250px] h-[444px]' : 'w-[250px] h-[250px]'
            }`}
            style={{
              backgroundColor: currentTheme.bgGrad[1],
              backgroundImage: bgMode === 'custom-photo' && customPhotoUrl ? `url(${customPhotoUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Gradiente Escuro de Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95 pointer-events-none" />

            {/* Cabeçalho do Card: Logo Oficial AB Fitness + Marca + Data */}
            <div className="relative z-10 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ABLogo size={32} showText={true} />
                <div>
                  <span className="text-[10px] font-black tracking-tight text-white block leading-none">
                    AB FITNESS
                  </span>
                  <span className="text-[7.5px] font-bold tracking-wider" style={{ color: currentTheme.accent }}>
                    RUNNING CLUB
                  </span>
                </div>
              </div>
              <span className="text-[7.5px] font-mono text-zinc-400">
                {dateFormatted}
              </span>
            </div>

            {/* Título: Sessão de Treino de Hoje */}
            <div className="relative z-10 px-3.5 -mt-1">
              <span className="text-[7px] uppercase font-bold text-zinc-400 block tracking-wider">
                Atividade Registrada
              </span>
              <h3 className="text-[11px] font-black text-white tracking-tight truncate leading-tight">
                {sessionTitle}
              </h3>
            </div>

            {/* O MAPINHA DA CORRIDA (CONTAINER ELEGANTE) */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-3.5 my-1.5">
              <div className="w-full h-full max-h-[140px] rounded-2xl bg-zinc-950/70 border border-white/10 p-2 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {/* Rótulo de canto do Minimapa */}
                <div className="absolute top-1.5 left-2 text-[6.5px] font-mono text-zinc-400/80 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <span>Google Maps GPS</span>
                </div>

                {routeData?.svgPath ? (
                  <svg 
                    viewBox={`0 0 ${minimapWidth} ${minimapHeight}`} 
                    className="w-full h-full max-h-28"
                    style={{
                      filter: `drop-shadow(0 0 8px ${currentTheme.glow})`
                    }}
                  >
                    <path
                      d={routeData.svgPath}
                      fill="none"
                      stroke={currentTheme.accent}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {routeData.startPoint && (
                      <circle cx={routeData.startPoint.x} cy={routeData.startPoint.y} r="5" fill="#10b981" />
                    )}
                    {routeData.endPoint && (
                      <circle cx={routeData.endPoint.x} cy={routeData.endPoint.y} r="5.5" fill="#ffffff" stroke={currentTheme.accent} strokeWidth="2" />
                    )}
                  </svg>
                ) : (
                  <div className="flex flex-col items-center text-zinc-500 py-3">
                    <MapPin className="w-6 h-6 stroke-1 text-sky-400/50" />
                    <span className="text-[8px] mt-1 font-mono">Circuito Ativo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Métricas Strava no Rodapé: Distância, Pace e Tempo */}
            <div className="relative z-10 p-3.5 pt-1 bg-gradient-to-t from-black via-black/85 to-transparent">
              <div className="mb-1.5">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-zinc-400 block leading-none">
                  Distância Total
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-white tracking-tighter">
                    {distanceKm}
                  </span>
                  <span className="text-xs font-black" style={{ color: currentTheme.accent }}>
                    KM
                  </span>
                </div>
              </div>

              {/* Grid 3 Colunas: Pace, Tempo e Calorias */}
              <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-white/10">
                <div>
                  <span className="text-[7.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                    Pace
                  </span>
                  <span className="text-[11px] font-black text-white tracking-tight">
                    {paceStr.replace('/km', '')}
                  </span>
                </div>
                <div>
                  <span className="text-[7.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                    Tempo
                  </span>
                  <span className="text-[11px] font-black text-white tracking-tight">
                    {durationStr}
                  </span>
                </div>
                <div>
                  <span className="text-[7.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                    Kcal
                  </span>
                  <span className="text-[11px] font-black text-white tracking-tight">
                    {calories}
                  </span>
                </div>
              </div>

              <div className="mt-1.5 text-center">
                <span className="text-[7px] font-mono text-zinc-400/80">
                  abfitness.app • Bruno Abel
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação Principais */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-2">
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>{isExporting ? 'Processando Imagem HD...' : 'Compartilhar nos Stories / Redes'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Imagem HD</span>
            </button>

            <button
              onClick={handleCopyCaption}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Legenda'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
