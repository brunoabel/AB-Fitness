import React, { useState, useRef, useEffect } from 'react';
import { THEMES } from './share/themes';
import ShareTitleEditor from './share/ShareTitleEditor';
import ShareThemePicker from './share/ShareThemePicker';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getNormalizedRoutePath, 
  getCoordinatesWithFallback, 
  formatDuration, 
  formatPace 
} from '../utils/runningService';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';

// Temas visuais desportivos de alto impacto

// Componente de Minimapa Real (100% livre de marcas d'água de API KEY)
function CardRouteMap({ coordinates, themeId }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    const container = mapRef.current;
    if (!container) return;

    // Prevenir conflito de mapa já inicializado
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }
    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const coords = getCoordinatesWithFallback(coordinates);
    const center = coords[Math.floor(coords.length / 2)] || { lat: 38.7285, lng: -9.1530 };

    // Camada limpa sem restrições ou marcas d'água
    const tileUrl = themeId === 'satellite-map'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    let map = null;
    try {
      map = L.map(container, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        attributionControl: false
      });
      mapInstanceRef.current = map;
    } catch (e) {
      console.warn('Erro ao criar mapa no card:', e);
      return;
    }

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      crossOrigin: true
    }).addTo(map);

    const latLngs = coords.map(c => [c.lat, c.lng]);

    // Contorno escuro para contraste garantido
    L.polyline(latLngs, {
      color: '#000000',
      weight: 7,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    // Linha neon principal
    const lineColor = themeId === 'strava-orange' ? '#fc5200' : themeId === 'satellite-map' ? '#34d399' : '#ffffff';
    const poly = L.polyline(latLngs, {
      color: lineColor,
      weight: 4.5,
      opacity: 1,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);

    // Marcadores de início e fim
    if (coords.length > 0) {
      const startPos = [coords[0].lat, coords[0].lng];
      const endPos = [coords[coords.length - 1].lat, coords[coords.length - 1].lng];

      L.marker(startPos, {
        icon: L.divIcon({
          className: 'card-start-pin',
          html: '<div style="width:14px;height:14px;background:#10b981;border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 0 10px #10b981;"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      L.marker(endPos, {
        icon: L.divIcon({
          className: 'card-end-pin',
          html: `<div style="width:14px;height:14px;background:${lineColor};border:2.5px solid #ffffff;border-radius:50%;box-shadow:0 0 10px ${lineColor};"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(map);
    }

    try {
      const bounds = poly.getBounds();
      if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [16, 16], maxZoom: 16 });
      }
    } catch {}

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (container) {
        container._leaflet_id = null;
      }
    };
  }, [coordinates, themeId]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden bg-zinc-950" />;
}

export default function RunningShareModal({ 
  runData, 
  isOpen, 
  onClose 
}) {
  const [aspectRatio, setAspectRatio] = useState('story'); // 'story' (9:16) | 'post' (1:1)
  const [themeId, setThemeId] = useState('strava-orange');
  const [bgMode, setBgMode] = useState('map'); // 'map' | 'custom-photo'
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);
  const [sessionTitle, setSessionTitle] = useState('Sessão de Treino de Hoje');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const cardPreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen || !runData) return null;

  const currentTheme = THEMES[themeId] || THEMES['strava-orange'];
  const distanceKm = Number(runData.distanceKm || 0).toFixed(2);
  const durationStr = formatDuration(runData.durationSeconds);
  const paceStr = runData.avgPace || formatPace(runData.avgPaceSeconds);
  const calories = runData.calories || 0;

  // Garante coordenadas válidas com fallback para circuito realista
  const effectiveCoordinates = getCoordinatesWithFallback(runData.coordinates, runData.distanceKm);

  // Formatar data em português de forma estável
  const runDateObj = runData.timestamp ? new Date(runData.timestamp) : (runData.date ? new Date(runData.date) : null);
  const dateFormatted = runDateObj 
    ? runDateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Hoje';
  const timeFormatted = runDateObj 
    ? runDateObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Exibir toast temporário
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Upload de Foto Própria
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhotoUrl(url);
      setBgMode('custom-photo');
      triggerHaptic(15);
      showToast('Foto adicionada ao fundo!');
    }
  };

  // Texto formatado de partilha
  const getShareText = () => {
    return `${sessionTitle.toUpperCase()} • AB FITNESS RUNNING CLUB\nDistância: ${distanceKm} km\nRitmo médio: ${paceStr}\nTempo: ${durationStr}\nCalorias: ${calories} kcal\n\nTreinado com a plataforma @ABFitness #ABFitness #RunningClub`;
  };

  // Copiar legenda para o Instagram / WhatsApp
  const handleCopyCaption = () => {
    const text = getShareText();
    navigator.clipboard?.writeText(text);
    setCopied(true);
    triggerHaptic(10);
    showToast('Legenda copiada para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Partilhar direto no WhatsApp
  const handleWhatsAppShare = () => {
    triggerHaptic(15);
    const text = getShareText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
    const isStory = aspectRatio === 'story';
    const canvasWidth = 1080;
    const canvasHeight = isStory ? 1920 : 1080;
    const logoImg = await loadLogoImage();

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      // Fundo Base
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

  const drawDefaultBackground = (ctx, w, h) => {
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, w * 0.9);
    bgGrad.addColorStop(0, currentTheme.bgGrad[0]);
    bgGrad.addColorStop(1, currentTheme.bgGrad[1]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid atlético sutil
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
  };

  const drawGraphicOverlays = (ctx, w, h, logoImg) => {
    const isStoryMode = aspectRatio === 'story';
    const paddingX = 80;

    // 1. Cabeçalho com Logo Oficial
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
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px system-ui, sans-serif';
    ctx.fillText('AB FITNESS', logoX + logoSize + 24, logoY + 44);

    ctx.fillStyle = currentTheme.accent;
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.fillText('RUNNING CLUB', logoX + logoSize + 24, logoY + 76);

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.fillText(`${dateFormatted} • ${timeFormatted}`, w - paddingX, logoY + 44);
    ctx.textAlign = 'left';

    // 2. Título da Atividade
    const titleY = logoY + logoSize + (isStoryMode ? 55 : 35);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '800 18px system-ui, sans-serif';
    ctx.fillText('ATIVIDADE REGISTRADA', paddingX, titleY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 44px system-ui, sans-serif';
    ctx.fillText(sessionTitle, paddingX, titleY + 46);

    // 3. Mapinha do Percurso
    const mapBoxY = titleY + 75;
    const mapBoxW = w - paddingX * 2;
    const mapBoxH = isStoryMode ? 520 : 360;

    ctx.save();
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

    if (effectiveCoordinates && effectiveCoordinates.length > 1) {
      const innerW = mapBoxW - 80;
      const innerH = mapBoxH - 90;
      const innerNorm = getNormalizedRoutePath(effectiveCoordinates, innerW, innerH, 30);

      if (innerNorm && innerNorm.points) {
        ctx.translate(paddingX + 40, mapBoxY + 50);

        // Brilho Neon
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

        // Ponto de Início
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

        // Ponto de Fim
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

    // 4. Métricas Strava
    const statsY = mapBoxY + mapBoxH + (isStoryMode ? 65 : 35);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('DISTÂNCIA TOTAL', paddingX, statsY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 144px system-ui, sans-serif';
    ctx.fillText(distanceKm, paddingX, statsY + 125);

    ctx.fillStyle = currentTheme.accent;
    ctx.font = '900 52px system-ui, sans-serif';
    const distWidth = ctx.measureText(distanceKm).width;
    ctx.fillText('KM', paddingX + distWidth + 24, statsY + 125);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(paddingX, statsY + 175);
    ctx.lineTo(w - paddingX, statsY + 175);
    ctx.stroke();

    const metricsRowY = statsY + 230;
    const colWidth = (w - paddingX * 2) / 3;

    // Pace
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('RITMO MÉDIO', paddingX, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, sans-serif';
    ctx.fillText(paceStr, paddingX, metricsRowY + 68);

    // Tempo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('TEMPO TOTAL', paddingX + colWidth, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, sans-serif';
    ctx.fillText(durationStr, paddingX + colWidth, metricsRowY + 68);

    // Calorias
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 22px system-ui, sans-serif';
    ctx.fillText('CALORIAS', paddingX + colWidth * 2, metricsRowY);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px system-ui, sans-serif';
    ctx.fillText(`${calories} kcal`, paddingX + colWidth * 2, metricsRowY + 68);

    // 5. Rodapé
    const footerY = h - (isStoryMode ? 70 : 40);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('abfitness.app • AB Fitness Running Club', w / 2, footerY);
    ctx.textAlign = 'left';
  };

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
      showToast('Cartão descarregado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      showToast('Erro ao descarregar imagem.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copiar Imagem Diretamente (para colar no WhatsApp Web / Instagram)
  const handleCopyImage = async () => {
    setIsExporting(true);
    triggerHaptic(15);
    try {
      const canvas = await generateHiResCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) {
          handleDownload();
          return;
        }
        try {
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setImageCopied(true);
            showToast('Imagem copiada! Podes colar no WhatsApp / Instagram');
            setTimeout(() => setImageCopied(false), 2500);
          } else {
            handleDownload();
          }
        } catch {
          handleDownload();
        } finally {
          setIsExporting(false);
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
      setIsExporting(false);
    }
  };

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
              text: `${sessionTitle}: Fechei ${distanceKm} km com pace de ${paceStr} no @ABFitness Running Club!`
            });
            showToast('Partilhado com sucesso!');
          } catch (shareErr) {
            if (shareErr.name !== 'AbortError') {
              handleDownload();
              handleCopyCaption();
            }
          }
        } else {
          // Fallback para dispositivos sem suporte direto a envio de arquivos via Share API
          handleDownload();
          handleCopyCaption();
          showToast('Imagem baixada e legenda copiada para partilhar!');
        }
        setIsExporting(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      setIsExporting(false);
    }
  };

  // Render via React Portal diretamente no document.body para garantir isolamento total de z-index
  return createPortal(
    <ModalBackdrop className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <ModalPanel className="w-full max-w-sm sm:max-w-md bg-surface border border-white/[0.06] rounded-3xl shadow-2xl flex flex-col my-auto max-h-[94vh] overflow-hidden">
        
        {/* Toast Notificação de Feedback */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-black shadow-xl animate-scaleUp flex items-center gap-1.5 pointer-events-none">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cabeçalho Sticky do Modal */}
        <div className="shrink-0 flex items-center justify-between p-3.5 border-b border-white/[0.06] bg-zinc-950/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">Compartilhar Corrida</h2>
              <p className="text-[11px] text-zinc-400">Card executivo para Instagram Stories e Feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tap-44 w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo Scrollável do Modal */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
          
          <ShareTitleEditor {...{ isEditingTitle, sessionTitle, setIsEditingTitle, setSessionTitle }} />
          <ShareThemePicker {...{ aspectRatio, bgMode, fileInputRef, handlePhotoUpload, setAspectRatio, setBgMode, setThemeId, themeId }} />
          {/* Pré-visualização do Card Compacto e Escalado */}
          <div className="flex items-center justify-center p-2 bg-black/50 rounded-2xl border border-white/[0.06] overflow-hidden">
            <div 
              ref={cardPreviewRef}
              className={`relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl flex flex-col justify-between select-none transition-all ${
                aspectRatio === 'story' 
                  ? 'w-[230px] h-[375px]' 
                  : 'w-[230px] h-[230px]'
              }`}
              style={{
                backgroundColor: currentTheme.bgGrad[1],
                backgroundImage: bgMode === 'custom-photo' && customPhotoUrl ? `url(${customPhotoUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Gradiente Escuro de Proteção de Contraste */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95 pointer-events-none" />

              {/* Cabeçalho do Card */}
              <div className="relative z-10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ABLogo size={26} showText={true} />
                  <div>
                    <span className="text-[11px] font-black tracking-tight text-white block leading-none">
                      AB FITNESS
                    </span>
                    <span className="text-[7px] font-bold tracking-wider" style={{ color: currentTheme.accent }}>
                      RUNNING CLUB
                    </span>
                  </div>
                </div>
                <span className="text-[7px] font-mono text-zinc-400">
                  {dateFormatted}
                </span>
              </div>

              {/* Título: Sessão de Treino de Hoje */}
              <div className="relative z-10 px-2.5 -mt-1">
                <span className="text-[6.5px] uppercase font-bold text-zinc-400 block tracking-wider">
                  Atividade Registrada
                </span>
                <h3 className="text-[11px] font-black text-white tracking-tight truncate leading-tight">
                  {sessionTitle}
                </h3>
              </div>

              {/* O MAPA REAL DA CORRIDA (Sem Watermark) */}
              <div className="relative z-10 flex-1 flex items-center justify-center px-2.5 my-1 min-h-[90px] max-h-[145px]">
                <div className="w-full h-full rounded-xl bg-zinc-950 border border-white/10 relative overflow-hidden shadow-inner">
                  {/* Selo do Mapa */}
                  <div className="absolute top-1 left-1.5 z-10 text-[6px] font-mono text-zinc-300 bg-black/75 backdrop-blur-sm px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider flex items-center gap-1 pointer-events-none">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>GPS Percurso</span>
                  </div>

                  <CardRouteMap 
                    coordinates={effectiveCoordinates} 
                    themeId={themeId} 
                  />
                </div>
              </div>

              {/* Métricas Strava */}
              <div className="relative z-10 p-2.5 pt-1 bg-gradient-to-t from-black via-black/85 to-transparent">
                <div className="mb-0.5">
                  <span className="text-[7px] uppercase tracking-wider font-extrabold text-zinc-400 block leading-none">
                    Distância Total
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-black text-white tracking-tighter">
                      {distanceKm}
                    </span>
                    <span className="text-[11px] font-black" style={{ color: currentTheme.accent }}>
                      KM
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                      Pace
                    </span>
                    <span className="text-[11px] font-black text-white tracking-tight">
                      {paceStr.replace('/km', '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                      Tempo
                    </span>
                    <span className="text-[11px] font-black text-white tracking-tight">
                      {durationStr}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-bold text-zinc-400 block">
                      Kcal
                    </span>
                    <span className="text-[11px] font-black text-white tracking-tight">
                      {calories}
                    </span>
                  </div>
                </div>

                <div className="mt-1 text-center">
                  <span className="text-[6px] font-mono text-zinc-400/80">
                    abfitness.app • Bruno Abel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé Sticky com Botões de Ação */}
        <div className="shrink-0 p-3 bg-zinc-950/95 backdrop-blur-md border-t border-white/[0.06] flex flex-col gap-2">
          {/* Botão Primário: Partilhar Cartão */}
          <button
            onClick={handleShare}
            disabled={isExporting}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{isExporting ? 'A Gerar Imagem HD...' : 'Partilhar Cartão (Instagram / Redes)'}</span>
          </button>

          {/* Grid Ações Rápidas: WhatsApp, Descarregar e Copiar */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleWhatsAppShare}
              className="min-h-[40px] py-2 px-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Partilhar no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="min-h-[40px] py-2 px-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Descarregar Imagem HD"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descarregar HD</span>
            </button>

            {window.ClipboardItem ? (
              <button
                onClick={handleCopyImage}
                disabled={isExporting}
                className="min-h-[40px] py-2 px-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Copiar Imagem para a Área de Transferência"
              >
                {imageCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ImageIcon className="w-3.5 h-3.5" />}
                <span>{imageCopied ? 'Copiada!' : 'Copiar Foto'}</span>
              </button>
            ) : (
              <button
                onClick={handleCopyCaption}
                className="min-h-[40px] py-2 px-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Copiar Legenda"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Legenda'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ao Resumo do Treino</span>
          </button>
        </div>
      </ModalPanel>
    </ModalBackdrop>,
    document.body
  );
}
