import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, type} from '../theme';
import {cueFrame} from '../lib/timeline';
import {CheckMark} from '../components/Interaction';
import {Sfx, Stage, clamp, ease, sfxVolume, useStage} from './common';

// Cena 6: o que é uma série (chips) e o temporizador de descanso a esvaziar.
export const Scene06Rest = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {k, w, h} = useStage(layout);
  const timerAt = cueFrame(scene, 'Entre', fps);
  const timerEnd = scene.duration - 6;
  const remaining = interpolate(frame, [timerAt, timerEnd], [60, 0], clamp);
  const progress = remaining / 60;
  const size = 300 * k;
  const r = 128;
  const circ = 2 * Math.PI * r;
  const shown = Math.ceil(remaining);
  const timerIn = interpolate(frame, [timerAt - 14, timerAt], [0, 1], ease);

  const chipsAt = scene.voiceOffset + 6;
  const chips = ['1.ª série', '2.ª série', '3.ª série'];
  const ticks = [10, 20, 30, 40, 50, 60].map((v) => interpolate(v, [0, 60], [timerAt, timerEnd]));

  return (
    <Stage layout={layout}>
      {/* séries: cada vez que repetes o exercício seguido */}
      <div style={{position: 'absolute', left: 0, width: w, top: 6 * k, display: 'flex', justifyContent: 'center', gap: 18 * k}}>
        {chips.map((c, i) => {
          const at = chipsAt + i * 8;
          const on = interpolate(frame, [at, at + 8], [0, 1], ease);
          const done = i === 0 ? interpolate(frame, [timerAt - 8, timerAt], [0, 1], ease) : 0;
          return (
            <div
              key={c}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * k,
                padding: `${14 * k}px ${24 * k}px`,
                borderRadius: 999,
                background: i === 0 ? colors.accent : colors.navy2,
                border: `2px solid ${i === 0 ? colors.accentBorder : colors.border}`,
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 36 * k,
                color: i === 0 ? colors.white : colors.text2,
                opacity: on,
                translate: `0px ${(1 - on) * 20}px`,
              }}
            >
              {done > 0 ? (
                <div style={{width: 34 * k, height: 34 * k, borderRadius: '50%', background: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <CheckMark size={26 * k} progress={done} />
                </div>
              ) : null}
              {c}
            </div>
          );
        })}
      </div>

      {/* temporizador circular branco a esvaziar */}
      <div
        style={{
          position: 'absolute',
          left: (w - size) / 2,
          top: 120 * k + (h - 120 * k - size) / 2,
          width: size,
          height: size,
          opacity: timerIn,
          scale: String(interpolate(timerIn, [0, 1], [0.9, 1])),
        }}
      >
        <svg width={size} height={size} viewBox="0 0 300 300" style={{position: 'absolute', inset: 0, rotate: '-90deg'}}>
          <circle cx={150} cy={150} r={r} stroke={colors.track} strokeWidth={16} fill="none" />
          <circle
            cx={150}
            cy={150}
            r={r}
            stroke={colors.white}
            strokeWidth={16}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
          />
        </svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{...type.micro, fontSize: 24 * k, color: colors.text2}}>Descanso</div>
          <div style={{...type.number, fontSize: 112 * k, lineHeight: 1, color: colors.white}}>
            {Math.floor(shown / 60)}:{String(shown % 60).padStart(2, '0')}
          </div>
        </div>
      </div>
      {ticks.map((t, i) => (
        <Sfx key={i} name="tick" at={t} volume={sfxVolume.tick} />
      ))}
    </Stage>
  );
};
