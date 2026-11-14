import React, { useState, useRef } from 'react';
import { THEMES } from './share/themes';
import ShareTitleEditor from './share/ShareTitleEditor';
import ShareThemePicker from './share/ShareThemePicker';
import CardRouteMap from './share/CardRouteMap';
import { generateRunShareCanvas } from './share/runShareCanvas';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import { createPortal } from 'react-dom';
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
  getCoordinatesWithFallback, 
  formatDuration, 
  formatPace 
} from '../utils/runningService';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';

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

  // Gerar e renderizar imagem em altíssima resolução (1080x1920 ou 1080x1080)
  const generateHiResCanvas = () =>
    generateRunShareCanvas({
      aspectRatio,
      currentTheme,
      bgMode,
      customPhotoUrl,
      sessionTitle,
      effectiveCoordinates,
      dateFormatted,
      timeFormatted,
      distanceKm,
      paceStr,
      durationStr,
      calories
    });

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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl animate-scaleUp flex items-center gap-1.5 pointer-events-none">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cabeçalho Sticky do Modal */}
        <div className="shrink-0 flex items-center justify-between p-3.5 border-b border-white/[0.06] bg-zinc-950/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Compartilhar Corrida</h2>
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
              style={currentTheme.transparent ? {
                backgroundImage: 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: '#18181b'
              } : {
                backgroundColor: currentTheme.bgGrad[1],
                backgroundImage: bgMode === 'custom-photo' && customPhotoUrl ? `url(${customPhotoUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Fundo transparente: rótulo a explicar o xadrez. Fundo opaco: gradiente de contraste. */}
              {currentTheme.transparent ? (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-semibold text-zinc-500 text-center px-4 pointer-events-none z-0">
                  Fundo transparente · Pronto para colar sobre fotos
                </span>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95 pointer-events-none" />
              )}

              {/* Cabeçalho do Card */}
              <div className="relative z-10 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ABLogo size={26} showText={true} />
                  <div>
                    <span className="text-[11px] font-bold tracking-tight text-white block leading-none">
                      AB FITNESS
                    </span>
                    <span className="text-[7px] font-semibold tracking-wider" style={{ color: currentTheme.accent }}>
                      RUNNING CLUB
                    </span>
                  </div>
                </div>
                <span className="text-[7px] font-display tabular-nums text-zinc-400">
                  {dateFormatted}
                </span>
              </div>

              {/* Título: Sessão de Treino de Hoje */}
              <div className="relative z-10 px-2.5 -mt-1">
                <span className="text-[6.5px] uppercase font-semibold text-zinc-400 block tracking-wider">
                  Atividade Registrada
                </span>
                <h3 className="text-[11px] font-bold text-white tracking-tight truncate leading-tight">
                  {sessionTitle}
                </h3>
              </div>

              {/* O MAPA REAL DA CORRIDA (Sem Watermark) */}
              <div className="relative z-10 flex-1 flex items-center justify-center px-2.5 my-1 min-h-[90px] max-h-[145px]">
                <div className="w-full h-full rounded-xl bg-zinc-950 border border-white/10 relative overflow-hidden shadow-inner">
                  {/* Selo do Mapa */}
                  <div className="absolute top-1 left-1.5 z-10 text-[6px] font-display tabular-nums text-zinc-300 bg-black/75 backdrop-blur-sm px-1.5 py-0.2 rounded border border-white/10 uppercase tracking-wider flex items-center gap-1 pointer-events-none">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>GPS Percurso</span>
                  </div>

                  <CardRouteMap 
                    coordinates={effectiveCoordinates} 
                    themeId={themeId} 
                  />
                </div>
              </div>

              {/* Métricas do Card */}
              <div className="relative z-10 p-2.5 pt-1 bg-gradient-to-t from-black via-black/85 to-transparent">
                <div className="mb-0.5">
                  <span className="text-[7px] uppercase tracking-wider font-semibold text-zinc-400 block leading-none">
                    Distância Total
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-display text-xl font-bold text-white tracking-[-0.025em] tabular-nums">
                      {distanceKm}
                    </span>
                    <span className="font-display text-[11px] font-semibold" style={{ color: currentTheme.accent }}>
                      KM
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/10">
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-semibold text-zinc-400 block">
                      Pace
                    </span>
                    <span className="font-display text-[11px] font-semibold text-white tracking-[-0.015em] tabular-nums">
                      {paceStr.replace('/km', '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-semibold text-zinc-400 block">
                      Tempo
                    </span>
                    <span className="font-display text-[11px] font-semibold text-white tracking-[-0.015em] tabular-nums">
                      {durationStr}
                    </span>
                  </div>
                  <div>
                    <span className="text-[6.5px] uppercase tracking-wider font-semibold text-zinc-400 block">
                      Kcal
                    </span>
                    <span className="font-display text-[11px] font-semibold text-white tracking-[-0.015em] tabular-nums">
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
