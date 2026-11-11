import React from 'react';
import {Audio} from '@remotion/media';
import {interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {audioLevels, colors, easeOut, radius, springConfig} from '../theme';
import {layouts, phoneRect} from '../layout';
import {PhoneMockup} from '../components/PhoneMockup';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
export const ease = {...clamp, easing: easeOut};

// Zona central do vídeo (por baixo do avatar no vertical, à direita no horizontal).
// Dentro, as medidas estão desenhadas para 920 px de largura e escalam com `k`.
export const useStage = (layout) => {
  const st = layouts[layout].stage;
  return {...st, k: st.w / 920};
};

export const Stage = ({layout, children, style}) => {
  const st = useStage(layout);
  return (
    <div style={{position: 'absolute', left: st.x, top: st.y, width: st.w, height: st.h, ...style}}>
      {children}
    </div>
  );
};

export const useSpring = (start, config = springConfig) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - start, fps, config});
};

// Telemóvel com entrada suave (mola) na posição do layout.
export const ScenePhone = ({layout, src, zoom, children, enterAt = 0}) => {
  const p = useSpring(enterAt);
  const r = phoneRect(layout);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [60, 0])}px`,
        scale: String(interpolate(p, [0, 1], [0.94, 1])),
        transformOrigin: `${r.x + r.width / 2}px ${r.y + r.height / 2}px`,
      }}
    >
      <PhoneMockup src={src} x={r.x} y={r.y} width={r.width} zoom={zoom}>
        {children}
      </PhoneMockup>
    </div>
  );
};

export const Card = ({children, style, active = false}) => (
  <div
    style={{
      background: active ? colors.accent : colors.navy2,
      border: `2px solid ${active ? colors.accentBorder : colors.border}`,
      borderRadius: radius.card,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

// Efeito sonoro local (video/public/sfx), sempre por baixo da voz.
export const Sfx = ({name, at, volume}) => {
  if (at < 0) return null;
  return <Audio src={staticFile(`sfx/${name}.wav`)} from={Math.round(at)} volume={volume} />;
};
export const sfxVolume = audioLevels.sfx;
