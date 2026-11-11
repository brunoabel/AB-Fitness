import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, timing, type} from '../theme';
import {cueFrame} from '../lib/timeline';
import {CountUp, TapRing} from '../components/Interaction';
import {ScenePhone, Sfx, clamp, ease, sfxVolume} from './common';

// Coordenadas no ecrã 4-running.png (espaço 390 x 844).
const START_BTN = {cx: 195, cy: 402};
const MAP_CARD = {x: 17, y: 470, w: 356, h: 250};

// Percurso de demonstração (não é um percurso real de ninguém).
const ROUTE = 'M 30 190 C 60 150, 70 120, 110 118 S 150 70, 190 74 S 240 120, 262 100 S 300 40, 326 52';

// Cena 7: toque em "Iniciar corrida", rota a desenhar-se no mapa, km a subir.
export const Scene07Running = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tapAt = Math.max(24, cueFrame(scene, 'correr', fps) - 4);
  const changeAt = tapAt + timing.tapLeadFrames;
  const routeEnd = Math.min(scene.duration - 14, changeAt + 90);
  const draw = interpolate(frame, [changeAt + 6, routeEnd], [1, 0], ease);
  const cardIn = interpolate(frame, [changeAt, changeAt + 10], [0, 1], ease);

  return (
    <>
      <ScenePhone layout={layout} src={scene.screen} zoom={{scale: interpolate(frame, [changeAt, changeAt + 24], [1, 1.12], ease), cx: 195, cy: 560}}>
        <TapRing x={START_BTN.cx} y={START_BTN.cy} at={tapAt} size={80} />
        <div
          style={{
            position: 'absolute',
            left: MAP_CARD.x,
            top: MAP_CARD.y,
            width: MAP_CARD.w,
            height: MAP_CARD.h,
            borderRadius: 18,
            overflow: 'hidden',
            background: colors.navy2,
            border: `1px solid ${colors.borderStrong}`,
            opacity: cardIn,
            translate: `0px ${(1 - cardIn) * 16}px`,
          }}
        >
          <svg width={MAP_CARD.w} height={MAP_CARD.h} viewBox="0 0 356 250" style={{position: 'absolute', inset: 0}}>
            {/* ruas genéricas */}
            {[40, 90, 140, 190].map((y) => (
              <line key={`h${y}`} x1={0} y1={y} x2={356} y2={y - 20} stroke={colors.gridLine} strokeWidth={6} />
            ))}
            {[60, 140, 220, 300].map((x) => (
              <line key={`v${x}`} x1={x} y1={0} x2={x + 30} y2={250} stroke={colors.gridLine} strokeWidth={6} />
            ))}
            <path d={ROUTE} stroke={colors.white} strokeWidth={5} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
            <circle cx={30} cy={190} r={7} fill={colors.white} />
          </svg>
          <div style={{position: 'absolute', left: 16, bottom: 12, display: 'flex', alignItems: 'baseline', gap: 6}}>
            <CountUp from={0} to={3.2} decimals={1} start={changeAt + 6} end={routeEnd} style={{...type.number, fontSize: 44, color: colors.white}} />
            <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 16, color: colors.text2}}>km</span>
          </div>
          <div style={{position: 'absolute', right: 16, bottom: 18, fontFamily: fonts.body, fontWeight: 600, fontSize: 14, color: colors.text2, opacity: interpolate(frame, [changeAt + 20, changeAt + 30], [0, 1], clamp)}}>
            Ritmo 6:10 por km
          </div>
        </div>
      </ScenePhone>
      <Sfx name="switch" at={tapAt} volume={sfxVolume.tap} />
    </>
  );
};
