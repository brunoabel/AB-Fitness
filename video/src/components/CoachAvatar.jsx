import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, easeOut, springConfig, timing} from '../theme';
import {layouts} from '../layout';
import {sceneAt, speakingLevel} from '../lib/timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

export const POSES = {
  hello: 'coach/ab-coach-hello.jpg',
  wide: 'coach/ab-coach-wide.jpg',
  thinking: 'coach/ab-coach-thinking.jpg',
  checkin: 'coach/ab-coach-checkin.jpg',
  celebrate: 'coach/ab-coach-celebrate.jpg',
  rest: 'coach/ab-coach-rest.jpg',
  square: 'coach/ab-coach-512.jpg',
};

const lerp = (a, b, t) => a + (b - a) * t;
const lerpRect = (a, b, t) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  round: lerp(a.round, b.round, t),
});

// Uma pose com Ken Burns subtil (push-in de ~5 % e deriva lateral ao longo da cena).
const PoseLayer = ({scene, frame, opacity, faceZoom}) => {
  const p = interpolate(frame, [scene.start, scene.start + scene.duration], [0, 1], clamp);
  const dir = scene.index % 2 === 0 ? 1 : -1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity}}>
      <Img
        src={staticFile(POSES[scene.pose])}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transformOrigin: '50% 30%',
          scale: String((1 + 0.05 * p) * faceZoom),
          translate: `${dir * 1.4 * p}% 0%`,
        }}
      />
    </div>
  );
};

// Avatar persistente: respira, faz Ken Burns, troca de pose com crossfade + pequeno salto,
// e passa de plano médio (16:9) a medalhão redondo quando a cena mostra o telemóvel.
export const CoachAvatarTrack = ({timeline, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = layouts[layout];
  const cur = sceneAt(timeline, frame);
  const prev = timeline.scenes[cur.index - 1];
  const local = frame - cur.start;

  const fromRect = L.avatar[(prev ?? cur).avatar];
  const toRect = L.avatar[cur.avatar];
  const m = interpolate(local, [0, timing.morphFrames], [0, 1], {...clamp, easing: easeOut});
  const rect = lerpRect(fromRect, toRect, m);

  // Entrada: máscara a revelar de baixo para cima, com mola.
  const enter = spring({frame, fps, config: springConfig, delay: 2});
  const reveal = interpolate(enter, [0, 1], [100, 0], clamp);

  // Respiração: 1.00 a 1.015, ciclo de ~3 s.
  const breath = 1 + 0.015 * (0.5 - 0.5 * Math.cos((2 * Math.PI * frame) / timing.breathCycleFrames));

  // Troca de pose: crossfade de 9 frames e um salto de escala com mola.
  const poseChanged = Boolean(prev) && prev.pose !== cur.pose;
  const xf = poseChanged ? interpolate(local, [0, timing.poseCrossfadeFrames], [0, 1], clamp) : 1;
  const bumpP = poseChanged ? spring({frame: local, fps, config: springConfig}) : 1;
  const bump = 1 + Math.sin(Math.min(1, bumpP) * Math.PI) * 0.035;

  const faceZoom = interpolate(rect.round, [0, 1], [1, 1.75]);
  const hero = 1 - rect.round;

  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        scale: String(breath * bump * interpolate(enter, [0, 1], [0.96, 1])),
        clipPath: `inset(${reveal}% 0% 0% 0%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: `${rect.round * 50}%`,
          background: colors.canvas,
        }}
      >
        {poseChanged && xf < 1 ? <PoseLayer scene={prev} frame={frame} opacity={1} faceZoom={faceZoom} /> : null}
        <PoseLayer scene={cur} frame={frame} opacity={xf} faceZoom={faceZoom} />
        {/* Vinheta radial preta: funde as bordas do JPG com o canvas, sem retângulo visível. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: hero,
            background: `radial-gradient(ellipse 58% 72% at 50% 40%, ${colors.transparent} 58%, ${colors.canvas} 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: hero,
            background: `linear-gradient(to bottom, ${colors.transparent} 72%, ${colors.canvas} 100%)`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `2px solid ${colors.borderStrong}`,
          opacity: interpolate(rect.round, [0.6, 1], [0, 1], clamp),
        }}
      />
    </div>
  );
};

// Indicador "a falar": 3 barras brancas que só oscilam quando há voz.
export const SpeakingBars = ({timeline, layout}) => {
  const frame = useCurrentFrame();
  const L = layouts[layout];
  const cur = sceneAt(timeline, frame);
  const prev = timeline.scenes[cur.index - 1];
  const m = interpolate(frame - cur.start, [0, timing.morphFrames], [0, 1], {...clamp, easing: easeOut});
  const a = L.bars[(prev ?? cur).avatar];
  const b = L.bars[cur.avatar];
  const x = lerp(a.x, b.x, m);
  const y = lerp(a.y, b.y, m);
  const level = speakingLevel(timeline, frame, 3);
  const enter = interpolate(frame, [10, 20], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 7, height: 44, opacity: enter * (0.4 + 0.6 * level)}}>
      {[0, 1, 2].map((k) => {
        const wave = 0.5 + 0.5 * Math.sin(frame * 0.55 + k * 1.9) * Math.cos(frame * 0.21 + k);
        const h = 10 + level * 30 * Math.abs(wave);
        return <div key={k} style={{width: 8, height: h, borderRadius: 4, background: colors.white}} />;
      })}
    </div>
  );
};
