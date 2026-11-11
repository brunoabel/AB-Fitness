import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {colors, fonts, type} from '../theme';
import {Stage, clamp, useSpring, useStage} from './common';

// Cena 10: logo + o único CTA branco do vídeo, com pulsar subtil de escala.
export const Scene10Outro = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {k, h} = useStage(layout);
  const logoIn = useSpring(scene.voiceOffset + 2);
  const ctaAt = scene.voiceOffset + 18;
  const cta = useSpring(ctaAt);
  const pulse = 1 + 0.025 * Math.max(0, Math.sin(((frame - ctaAt - 20) / 30) * Math.PI * 2 * 0.6));
  return (
    <Stage layout={layout}>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.06, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 20 * k, opacity: interpolate(logoIn, [0, 0.4], [0, 1], clamp), translate: `0px ${(1 - logoIn) * 20}px`}}>
          <Img src={staticFile('ab-logo-white.png')} style={{width: 110 * k, height: 110 * k}} />
          <span style={{...type.heading, fontWeight: 800, fontSize: 56 * k, letterSpacing: '0.2em', color: colors.white}}>AB FITNESS</span>
        </div>
        <div
          style={{
            marginTop: 54 * k,
            padding: `${30 * k}px ${70 * k}px`,
            borderRadius: 999,
            background: colors.white,
            color: colors.black,
            fontFamily: fonts.heading,
            fontWeight: 800,
            fontSize: 56 * k,
            opacity: interpolate(cta, [0, 0.4], [0, 1], clamp),
            scale: String(interpolate(cta, [0, 1], [0.85, 1]) * (frame > ctaAt + 20 ? pulse : 1)),
          }}
        >
          {scene.cta}
        </div>
      </div>
    </Stage>
  );
};
