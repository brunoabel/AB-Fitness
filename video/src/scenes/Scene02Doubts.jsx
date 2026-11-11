import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {colors, fonts, springConfig, type} from '../theme';
import {Card, Sfx, Stage, clamp, sfxVolume, useStage} from './common';

// Posições finais da pilha (partilhadas com a cena 3, que as dissolve).
export const doubtCardLayout = (k, h) => {
  const cardH = 124 * k;
  const gap = 26 * k;
  const total = cardH * 3 + gap * 2;
  const top = (h - total) / 2;
  return [0, 1, 2].map((i) => ({
    top: top + i * (cardH + gap),
    x: [-34, 30, -8][i] * k,
    rotate: [-3, 2.5, -1.5][i],
    cardH,
  }));
};

export const DoubtCard = ({label, k, style}) => (
  <Card style={{position: 'absolute', left: '50%', width: 660 * k, marginLeft: -330 * k, display: 'flex', alignItems: 'center', gap: 26 * k, padding: `0 ${30 * k}px`, ...style}}>
    <div
      style={{
        width: 76 * k,
        height: 76 * k,
        borderRadius: 18 * k,
        background: colors.accent,
        border: `2px solid ${colors.accentBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...type.number,
        fontSize: 58 * k,
        color: colors.white,
      }}
    >
      ?
    </div>
    <div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 50 * k, color: colors.white}}>{label}</div>
  </Card>
);

// Cena 2: três dúvidas em cartões a cair e empilhar.
export const Scene02Doubts = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {k, h} = useStage(layout);
  const slots = doubtCardLayout(k, h);
  const first = scene.voiceOffset + 10;
  return (
    <Stage layout={layout}>
      {scene.cards.map((label, i) => {
        const at = first + i * 11;
        const p = spring({frame: frame - at, fps, config: springConfig});
        const s = slots[i];
        return (
          <DoubtCard
            key={label}
            label={label}
            k={k}
            style={{
              top: s.top,
              height: s.cardH,
              opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
              translate: `${s.x}px ${interpolate(p, [0, 1], [-320 * k, 0])}px`,
              rotate: `${interpolate(p, [0, 1], [i % 2 ? -12 : 10, s.rotate])}deg`,
            }}
          />
        );
      })}
      {scene.cards.map((_, i) => (
        <Sfx key={i} name="click" at={first + i * 11 + 7} volume={sfxVolume.tap} />
      ))}
    </Stage>
  );
};
