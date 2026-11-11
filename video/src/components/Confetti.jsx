import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../theme';

// Confettis brancos e marinho (sem dourado). Determinístico: random() com semente fixa.
const palette = [colors.white, colors.white, colors.accent, colors.accentBorder];

export const Confetti = ({start, count = 80, originY = -40, seed = 'ab'}) => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const t = (frame - start) / fps;
  if (t < 0 || t > 5) return null;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      {new Array(count).fill(true).map((_, i) => {
        const r = (k) => random(`${seed}-${i}-${k}`);
        const x0 = r('x') * width;
        const vx = (r('vx') - 0.5) * 260;
        const vy = 140 + r('vy') * 380;
        const delay = r('d') * 0.5;
        const tt = Math.max(0, t - delay);
        const gravity = 520;
        const x = x0 + vx * tt + Math.sin(tt * 3 + r('p') * 6) * 30;
        const y = originY + vy * tt + 0.5 * gravity * tt * tt;
        if (y > height + 40 || tt <= 0) return null;
        const w = 10 + r('w') * 10;
        const h = 16 + r('h') * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 3,
              background: palette[Math.floor(r('c') * palette.length)],
              rotate: `${r('r') * 360 + tt * (r('s') - 0.5) * 720}deg`,
              opacity: Math.min(1, tt * 6) * (1 - Math.max(0, tt - 3.5) / 1.5),
            }}
          />
        );
      })}
    </div>
  );
};
