import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { House, Gauge, Users, ImageOff } from 'lucide-react';
import VideoSurface from './VideoSurface';
import useStickyMini from './useStickyMini';
import { getExerciseMedia } from '../../data/exerciseMedia';
import { triggerHaptic } from '../../utils/audio';

const pill = 'h-9 px-3 rounded-full text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border transition-colors cursor-pointer select-none';

/**
 * Player de execução: carrega sem saltos, mostra as dicas sobre o vídeo e encolhe para um mini-card fixo ao rolar.
 * @param {{ exercise: object, sticky?: boolean, stickyTop?: number, homeMode?: boolean, canSwapHome?: boolean, onToggleHome?: Function }} props
 */
export default function ExerciseVideoPlayer({ exercise, sticky = false, stickyTop = 72, homeMode = false, canSwapHome = false, onToggleHome }) {
  const media = getExerciseMedia(exercise);
  const videoRef = useRef(null);
  const [gender, setGender] = useState('male');
  const [slow, setSlow] = useState(false);
  const [failedSrc, setFailedSrc] = useState(null);
  const { anchorRef, isMini } = useStickyMini(sticky && Boolean(media.videoMale), stickyTop);

  const src = gender === 'female' ? media.videoFemale : media.videoMale;
  const hasVideo = Boolean(src) && failedSrc !== src;
  const name = exercise?.name || exercise?.nome || '';

  const setRate = (isSlow) => {
    setSlow(isSlow);
    if (videoRef.current) videoRef.current.playbackRate = isSlow ? 0.5 : 1;
  };

  const homeButton = canSwapHome && (
    <button
      type="button"
      onClick={() => {
        triggerHaptic(15);
        onToggleHome?.();
      }}
      aria-pressed={homeMode}
      className={`${pill} ${homeMode ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/50 text-zinc-100 border-white/15'}`}
    >
      <House className="w-3.5 h-3.5" />
      {homeMode ? 'Modo casa' : 'Sem ginásio hoje?'}
    </button>
  );

  if (!hasVideo) {
    return (
      <div className="rounded-2xl bg-surface/80 backdrop-blur-md border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <ImageOff className="w-4 h-4" /> Vídeo deste exercício ainda não disponível
          </span>
          {homeButton}
        </div>
        <ul className="flex flex-wrap gap-2">
          {media.cues.map((c) => (
            <li key={c} className="px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent text-xs font-semibold">{c}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="relative w-full aspect-video">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        style={isMini ? { top: `calc(env(safe-area-inset-top, 0px) + ${stickyTop}px)` } : undefined}
        className={
          isMini
            ? 'fixed left-3 right-3 z-30 h-[76px] flex items-center gap-3 p-2 pr-3 rounded-2xl bg-surface/85 backdrop-blur-md border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] max-w-md mx-auto'
            : 'absolute inset-0 rounded-2xl overflow-hidden border border-white/10 bg-surface'
        }
      >
        <VideoSurface
          ref={videoRef}
          src={src}
          poster={media.poster}
          playbackRate={slow ? 0.5 : 1}
          onError={() => setFailedSrc(src)}
          className={isMini ? 'h-full aspect-video rounded-xl shrink-0' : 'absolute inset-0'}
        />

        {isMini ? (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white truncate">{name}</p>
            <p className="text-xs text-accent truncate">{media.cues[0]}</p>
          </div>
        ) : (
          <>
            <div className="absolute inset-x-0 top-0 p-2.5 flex items-center justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setGender((g) => (g === 'male' ? 'female' : 'male'))} aria-label="Alternar atleta" className={`${pill} bg-black/50 text-zinc-100 border-white/15`}>
                  <Users className="w-3.5 h-3.5" />
                  {gender === 'male' ? '♂' : '♀'}
                </button>
                <button type="button" onClick={() => setRate(!slow)} aria-pressed={slow} className={`${pill} ${slow ? 'bg-accent/20 text-accent border-accent/50' : 'bg-black/50 text-zinc-100 border-white/15'}`}>
                  <Gauge className="w-3.5 h-3.5" />
                  {slow ? '0.5x' : '1x'}
                </button>
              </div>
              {homeButton}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-app via-app/70 to-transparent">
              <AnimatePresence mode="wait" initial={false}>
                <motion.ul
                  key={src}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-1.5 overflow-x-auto -mx-3 px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {media.cues.map((c) => (
                    <li key={c} className="shrink-0 whitespace-nowrap px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white">{c}</li>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
