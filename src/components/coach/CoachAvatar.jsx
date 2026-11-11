import React from 'react';

/** Avatar oficial do AB Coach (recorte quadrado em /public/coach). Usa 256 px até 64 px de lado, 512 acima. */
export default function CoachAvatar({ size = 40, className = '', rounded = 'rounded-full', alt = 'AB Coach' }) {
  const src = size > 64 ? '/coach/ab-coach-512.jpg' : '/coach/ab-coach-256.jpg';
  return (
    <img
      src={src}
      srcSet={size > 64 ? undefined : '/coach/ab-coach-256.jpg 1x, /coach/ab-coach-512.jpg 2x'}
      width={size}
      height={size}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`shrink-0 object-cover bg-app border border-white/[0.08] ${rounded} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
