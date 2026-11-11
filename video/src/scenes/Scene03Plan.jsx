import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {colors, fonts, springConfig, type} from '../theme';
import {cueFrame} from '../lib/timeline';
import {CheckMark} from '../components/Interaction';
import {Card, Sfx, Stage, clamp, ease, sfxVolume, useStage} from './common';
import {DoubtCard, doubtCardLayout} from './Scene02Doubts';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const TRAIN = [0, 2, 4];

// Cena 3: as dúvidas dissolvem-se e viram um plano semanal; vistos brancos dia a dia.
export const Scene03Plan = ({scene, layout, cards}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {k, w, h} = useStage(layout);
  const slots = doubtCardLayout(k, h);
  const dissolve = interpolate(frame, [scene.voiceOffset, scene.voiceOffset + 14], [0, 1], ease);

  const gap = 12 * k;
  const cellW = (w - gap * 6) / 7;
  const cellH = 220 * k;
  const gridTop = (h - cellH) / 2 - 40 * k;
  const gridAt = scene.voiceOffset + 10;
  const checkAt = Math.max(gridAt + 24, cueFrame(scene, 'plano', fps));
  const clockTo = 45;

  return (
    <Stage layout={layout}>
      {dissolve < 1
        ? cards.map((label, i) => (
            <DoubtCard
              key={label}
              label={label}
              k={k}
              style={{
                top: slots[i].top,
                height: slots[i].cardH,
                translate: `${slots[i].x}px 0px`,
                rotate: `${slots[i].rotate}deg`,
                opacity: 1 - dissolve,
                scale: String(1 - dissolve * 0.12),
                filter: `blur(${dissolve * 14}px)`,
              }}
            />
          ))
        : null}

      {DAYS.map((d, i) => {
        const p = spring({frame: frame - (gridAt + i * 3), fps, config: springConfig});
        const train = TRAIN.indexOf(i);
        const cp = train >= 0 ? interpolate(frame, [checkAt + train * 9, checkAt + train * 9 + 10], [0, 1], ease) : 0;
        return (
          <Card
            key={d}
            active={train >= 0 && cp > 0}
            style={{
              position: 'absolute',
              left: i * (cellW + gap),
              top: gridTop,
              width: cellW,
              height: cellH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${24 * k}px 0`,
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
              translate: `0px ${interpolate(p, [0, 1], [40 * k, 0])}px`,
            }}
          >
            <div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 36 * k, color: train >= 0 ? colors.white : colors.text2}}>{d}</div>
            {train >= 0 ? (
              <div
                style={{
                  width: 72 * k,
                  height: 72 * k,
                  borderRadius: '50%',
                  background: colors.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: interpolate(cp, [0, 0.2], [0, 1], clamp),
                  scale: String(interpolate(cp, [0, 1], [0.6, 1])),
                }}
              >
                <CheckMark size={50 * k} progress={cp} />
              </div>
            ) : (
              <div style={{width: 40 * k, height: 6 * k, borderRadius: 3, background: colors.track, marginBottom: 33 * k}} />
            )}
          </Card>
        );
      })}

      {/* cronómetro: o plano fica pronto em menos de um minuto */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: gridTop + cellH + 40 * k,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: 18 * k,
          opacity: interpolate(frame, [gridAt + 12, gridAt + 22], [0, 1], clamp),
        }}
      >
        <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 40 * k, color: colors.text2}}>Plano pronto em</span>
        <span style={{...type.number, fontSize: 72 * k, color: colors.white}}>
          0:{String(Math.round(interpolate(frame, [gridAt + 12, checkAt + 30], [0, clockTo], ease))).padStart(2, '0')}
        </span>
      </div>

      <Sfx name="page-turn" at={gridAt} volume={sfxVolume.pageTurn} />
      {TRAIN.map((_, j) => (
        <Sfx key={j} name="tick" at={checkAt + j * 9} volume={sfxVolume.tick} />
      ))}
    </Stage>
  );
};
