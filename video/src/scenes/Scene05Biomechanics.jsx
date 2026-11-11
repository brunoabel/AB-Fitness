import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, type} from '../theme';
import {phoneRect} from '../layout';
import {cueFrame} from '../lib/timeline';
import {Card, ScenePhone, clamp, ease, useSpring} from './common';

// Desenho esquemático do supino inclinado: banco, corpo, trajetória dos halteres e setas de postura.
const lerp = (a, b, t) => a + (b - a) * t;
const MovementDiagram = ({scene, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drawAt = cueFrame(scene, 'movimento', fps);
  const path = interpolate(frame, [drawAt, drawAt + 30], [1, 0], ease);
  const arrows = interpolate(frame, [drawAt + 26, drawAt + 38], [0, 1], ease);
  const t = interpolate(frame, [drawAt, drawAt + 30], [0, 1], ease);
  const shoulder = {x: 262, y: 156};
  const elbow = {x: lerp(226, 262, t), y: lerp(186, 104, t)};
  const hand = {x: lerp(266, 258, t), y: lerp(122, 46, t)};
  const body = {stroke: colors.white, strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none'};
  const thin = {stroke: colors.white, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none'};
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 400 320">
      {/* chão, assento e encosto inclinado */}
      <line x1={20} y1={294} x2={380} y2={294} stroke={colors.borderStrong} strokeWidth={3} />
      <path d="M 130 294 L 130 244 M 250 294 L 250 244" stroke={colors.text2} strokeWidth={6} strokeLinecap="round" />
      <line x1={110} y1={244} x2={200} y2={244} stroke={colors.text2} strokeWidth={14} strokeLinecap="round" />
      <line x1={170} y1={244} x2={312} y2={138} stroke={colors.text2} strokeWidth={14} strokeLinecap="round" />
      {/* corpo deitado no encosto: cabeça, tronco, pernas */}
      <circle cx={296} cy={124} r={19} {...body} />
      <path d={`M ${shoulder.x} ${shoulder.y} L 176 226 L 104 236 L 96 292`} {...body} />
      {/* braço e halter */}
      <path d={`M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${hand.x} ${hand.y}`} {...body} />
      <rect x={hand.x - 26} y={hand.y - 9} width={52} height={18} rx={6} fill={colors.white} />
      {/* trajetória a desenhar-se, com seta no topo */}
      <path d="M 300 122 Q 312 84 296 46" {...thin} pathLength={1} strokeDasharray={1} strokeDashoffset={path} />
      <path d="M 286 54 L 296 44 L 304 58" {...thin} opacity={path < 0.05 ? 1 : 0} />
      {/* setas de postura: costas apoiadas e pés no chão */}
      <g opacity={arrows}>
        <path d="M 96 128 L 196 200" {...thin} />
        <path d="M 178 200 L 198 202 L 192 184" {...thin} />
        <path d="M 30 246 L 82 284" {...thin} />
        <path d="M 64 286 L 84 286 L 80 268" {...thin} />
      </g>
    </svg>
  );
};

// Cena 5: ecrã do guia técnico e um esquema do movimento certo a traçar-se.
export const Scene05Biomechanics = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = phoneRect(layout);
  const vertical = layout === 'vertical';
  const cardAt = cueFrame(scene, 'movimento', fps) - 10;
  const p = useSpring(cardAt);
  const push = interpolate(frame, [0, scene.duration], [1, 1.12], clamp);
  const cardW = vertical ? 520 : 520;
  const cardLeft = vertical ? 1020 - cardW : r.x - cardW + 60;
  const cardTop = vertical ? 770 : 290;
  const labelsIn = interpolate(frame, [cardAt + 50, cardAt + 62], [0, 1], ease);
  return (
    <>
      <ScenePhone layout={layout} src={scene.screen} zoom={{scale: push, cx: 195, cy: 560}} />
      <Card
        style={{
          position: 'absolute',
          left: cardLeft,
          top: cardTop,
          width: cardW,
          padding: 24,
          background: colors.surface,
          border: `2px solid ${colors.borderStrong}`,
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          translate: `0px ${interpolate(p, [0, 1], [50, 0])}px`,
        }}
      >
        <div style={{...type.micro, fontSize: 26, color: colors.text2, marginBottom: 6}}>Movimento certo</div>
        <MovementDiagram scene={scene} size={cardW - 48} />
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: colors.white, opacity: labelsIn}}>
          <span>Costas no banco</span>
          <span>Pés no chão</span>
        </div>
      </Card>
    </>
  );
};
