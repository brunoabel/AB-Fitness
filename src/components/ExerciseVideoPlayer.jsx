import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Gauge, 
  ShieldCheck, 
  Users, 
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function ExerciseVideoPlayer({ videoData, exerciseName }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Estados do reprodutor
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0); // 1.0x ou 0.5x (câmara lenta biomecânica)
  const [gender, setGender] = useState('male'); // 'male' | 'female'
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!videoData) return null;

  const currentVideoUrl = gender === 'female' && videoData.videoFemale 
    ? videoData.videoFemale 
    : videoData.videoMale;

  // Atualiza taxa de reprodução no elemento video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, currentVideoUrl]);

  // Ao trocar de género ou URL, reinicia e reproduz
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentVideoUrl]);

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle Velocidade (1.0x vs 0.5x Biomecânica)
  const toggleSpeed = (e) => {
    e.stopPropagation();
    const newRate = playbackRate === 1.0 ? 0.5 : 1.0;
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  };

  // Toggle Género (Masculino / Feminino)
  const toggleGender = (e) => {
    e.stopPropagation();
    setGender((prev) => (prev === 'male' ? 'female' : 'male'));
  };

  // Atualização da barra de progresso do loop
  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setProgress((current / dur) * 100);
  };

  // Tela Cheia nativa
  const handleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {
        // Fallback para iOS WebKit
        if (videoRef.current?.webkitEnterFullscreen) {
          videoRef.current.webkitEnterFullscreen();
        }
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.1] shadow-xl group select-none transition-all"
    >
      {/* Container de Vídeo Proporcional 16:9 */}
      <div 
        className="relative w-full aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={currentVideoUrl}
          poster={videoData.poster}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          webkit-playsinline="true"
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Gradiente sutil para legibilidade dos overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />

        {/* Badge Superior Esquerdo: Selo de Auditoria Técnica AB */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-[#c6f432]/30 text-white shadow-xs pointer-events-none z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-[#c6f432]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-100">
            Técnica Auditada AB
          </span>
        </div>

        {/* Badge Superior Direito: Equipamento Obrigatório */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-zinc-200 shadow-xs pointer-events-none z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {videoData.equipment}
          </span>
        </div>

        {/* Ícone Central de Play quando pausado */}
        {!isPlaying && !isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-scaleIn">
              <Play className="w-6 h-6 fill-white ml-1 text-white" />
            </div>
          </div>
        )}

        {/* Spinner de Carregamento */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none bg-black/30 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#c6f432] animate-spin" />
          </div>
        )}

        {/* Mensagem de Erro de Conexão */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-zinc-950/90 text-center">
            <p className="text-xs text-zinc-400 mb-2">Vídeo indisponível temporariamente.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setHasError(false);
                setIsLoading(true);
                videoRef.current?.load();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {/* Barra de Progresso do Loop */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
          <div 
            className="h-full bg-[#c6f432] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Barra de Controles Inferior */}
      <div className="px-3.5 py-2.5 bg-zinc-900/95 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-300 gap-2">
        {/* Esquerda: Play/Pause + Indicador de Movimento */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer active:scale-95"
            title={isPlaying ? 'Pausar execução' : 'Reproduzir vídeo'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
          </button>

          <span className="text-[11px] font-bold text-zinc-200 hidden sm:inline">
            Loop Contínuo
          </span>
        </div>

        {/* Direita: Controles de Engenharia Biomecânica */}
        <div className="flex items-center gap-1.5">
          {/* Botão de Velocidade: 1.0x vs 0.5x Câmara Lenta */}
          <button
            onClick={toggleSpeed}
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              playbackRate === 0.5
                ? 'bg-[#c6f432] text-zinc-950 border-[#c6f432] shadow-xs'
                : 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
            }`}
            title="Alternar velocidade normal e câmara lenta (0.5x)"
          >
            <Gauge className="w-3 h-3" />
            <span>{playbackRate === 0.5 ? '0.5x Slow' : '1.0x'}</span>
          </button>

          {/* Botão de Género: ♂ / ♀ */}
          {videoData.videoFemale && (
            <button
              onClick={toggleGender}
              className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                gender === 'female'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-zinc-800 text-zinc-300 border-white/10 hover:bg-zinc-700'
              }`}
              title="Alternar demonstração entre atleta masculino e feminino"
            >
              <Users className="w-3 h-3" />
              <span>{gender === 'female' ? 'Atleta ♀' : 'Atleta ♂'}</span>
            </button>
          )}

          {/* Tela Cheia */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Ecrã completo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dica Biomecânica Rápida do Vídeo */}
      {videoData.keyCues && videoData.keyCues[0] && (
        <div className="px-3.5 py-2 bg-black/40 border-t border-white/[0.04] text-[11px] text-zinc-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#c6f432] shrink-0" />
          <p className="truncate leading-tight">
            <strong className="text-zinc-200 font-semibold">Ponto-chave:</strong> {videoData.keyCues[0]}
          </p>
        </div>
      )}
    </div>
  );
}
