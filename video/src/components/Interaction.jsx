import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, easeOut} from '../theme';
import {SCREEN, useScreenUnit} from './PhoneMockup';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// Toque simulado: círculo branco a 30 % que encolhe e desaparece.
// `at` é o frame do toque; a mudança de ecrã deve acontecer em at + timing.tapLeadFrames.
export const TapRing = ({x, y, at, size = 70}) => {
  const frame = useCurrentFrame();
  const local = frame - at;
  if (local < -2 || local > 14) return null;
  const r = interpolate(local, [-2, 12], [size, size * 0.15], {...clamp, easing: easeOut});
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r / 2,
        top: y - r / 2,
        width: r,
        height: r,
        borderRadius: '50%',
        background: colors.tap,
        opacity: interpolate(local, [-2, 1, 12], [0, 1, 0], clamp),
      }}
    />
  );
};

// Foco guiado: escurece o ecrã a 60 % e desenha um retângulo branco de 2 px à volta do elemento.
export const FocusRing = ({rect, start, end = 99999, pad = 6, radius = 14}) => {
  const frame = useCurrentFrame();
  const unit = useScreenUnit();
  const x = rect.x - pad;
  const y = rect.y - pad;
  const w = rect.w + pad * 2;
  const h = rect.h + pad * 2;
  const perimeter = 2 * (w + h);
  const appear = interpolate(frame, [start, start + 8, end, end + 8], [0, 1, 1, 0], clamp);
  const draw = interpolate(frame, [start + 2, start + 18], [1, 0], {...clamp, easing: easeOut});
  if (appear <= 0) return null;
  return (
    <svg
      width={SCREEN.w}
      height={SCREEN.h}
      viewBox={`0 0 ${SCREEN.w} ${SCREEN.h}`}
      style={{position: 'absolute', left: 0, top: 0, opacity: appear}}
    >
      <defs>
        <mask id={`hole-${start}`}>
          <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} fill="white" />
          <rect x={x} y={y} width={w} height={h} rx={radius} fill="black" />
        </mask>
      </defs>
      <rect x={0} y={0} width={SCREEN.w} height={SCREEN.h} fill={colors.scrim} mask={`url(#hole-${start})`} />
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={radius}
        fill="none"
        stroke={colors.white}
        strokeWidth={2 / unit}
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter * draw}
        pathLength={perimeter}
      />
    </svg>
  );
};

// Números que contam sem tremer: interpolate + arredondamento, sempre tabular-nums.
export const formatNumber = (value, decimals = 0) => {
  const factor = 10 ** decimals;
  const v = Math.round(value * factor) / factor;
  return v.toFixed(decimals).replace('.', ',');
};

export const CountUp = ({from, to, start, end, decimals = 0, prefix = '', suffix = '', style}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [start, end], [from, to], {...clamp, easing: easeOut});
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {formatNumber(v, decimals)}
      {suffix}
    </span>
  );
};

// Visto branco desenhado por stroke-dashoffset.
export const CheckMark = ({size, progress, color = colors.black, strokeWidth = 3}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
    <path
      d="M5 12.5l4.2 4.2L19 7"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - progress}
    />
  </svg>
);
