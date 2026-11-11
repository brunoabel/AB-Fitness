import React, { forwardRef, useState } from 'react';

/**
 * Elemento <video> com espaço reservado (sem layout shift) e skeleton até ao primeiro frame.
 * `className` define o tamanho; o skeleton cobre exatamente a mesma área.
 */
const VideoSurface = forwardRef(function VideoSurface({ src, poster, playbackRate = 1, onError, className = '' }, ref) {
  const [readyFor, setReadyFor] = useState(null);
  const ready = readyFor === src;

  return (
    // `relative` só quando o chamador não posiciona o contentor (com `absolute` + `relative` o vídeo ficava com altura 0)
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden bg-surface ${className}`}>
      {!ready && (
        <div aria-hidden className="absolute inset-0 bg-surface">
          <div className="skeleton-shimmer" />
        </div>
      )}
      <video
        key={src}
        ref={ref}
        src={src}
        poster={poster || undefined}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        onLoadedData={(e) => {
          e.currentTarget.playbackRate = playbackRate;
          setReadyFor(src);
        }}
        onError={onError}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
});

export default VideoSurface;
