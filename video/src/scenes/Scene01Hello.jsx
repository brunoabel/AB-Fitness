import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {colors, fonts, type} from '../theme';
import {Stage, ease, useStage} from './common';

// Cena 1: o logo AB desenha-se em branco (revelação com "caneta"), o avatar entra com mola.
export const Scene01Hello = ({layout}) => {
  const frame = useCurrentFrame();
  const {k, h} = useStage(layout);
  const wipe = interpolate(frame, [10, 40], [0, 100], ease);
  const sub = interpolate(frame, [32, 48], [0, 1], ease);
  const logo = 230 * k;
  return (
    <Stage layout={layout}>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.08, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', width: logo, height: logo}}>
          <Img
            src={staticFile('ab-logo-white.png')}
            style={{width: logo, height: logo, clipPath: `inset(0% ${100 - wipe}% 0% 0%)`}}
          />
          {/* ponta da caneta que acompanha o desenho */}
          <div
            style={{
              position: 'absolute',
              top: logo * 0.2,
              left: (logo * wipe) / 100 - 2,
              width: 4,
              height: logo * 0.6,
              borderRadius: 2,
              background: colors.white,
              opacity: interpolate(wipe, [0, 5, 92, 100], [0, 1, 1, 0]),
            }}
          />
        </div>
        <div
          style={{
            ...type.heading,
            fontWeight: 800,
            fontSize: 64 * k,
            letterSpacing: '0.22em',
            color: colors.white,
            marginTop: 18 * k,
            opacity: sub,
            translate: `0px ${(1 - sub) * 16}px`,
          }}
        >
          AB FITNESS
        </div>
        <div style={{fontFamily: fonts.body, fontWeight: 500, fontSize: 40 * k, color: colors.text2, marginTop: 10 * k, opacity: sub}}>
          O teu treinador no telemóvel
        </div>
      </div>
    </Stage>
  );
};
