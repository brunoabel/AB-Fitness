import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, timing, type} from '../theme';
import {cueFrame} from '../lib/timeline';
import {CountUp, TapRing} from '../components/Interaction';
import {POSES} from '../components/CoachAvatar';
import {Card, Sfx, Stage, clamp, ease, sfxVolume, useSpring, useStage} from './common';

const Bubble = ({k, at, children, fromCoach = true}) => {
  const p = useSpring(at);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16 * k,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
        translate: `0px ${interpolate(p, [0, 1], [24 * k, 0])}px`,
      }}
    >
      {fromCoach ? (
        <Img src={staticFile(POSES.square)} style={{width: 72 * k, height: 72 * k, borderRadius: '50%', border: `2px solid ${colors.borderStrong}`}} />
      ) : null}
      <div
        style={{
          background: colors.navy2,
          border: `2px solid ${colors.border}`,
          borderRadius: `${28 * k}px ${28 * k}px ${28 * k}px ${8 * k}px`,
          padding: `${16 * k}px ${26 * k}px`,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 38 * k,
          color: colors.white,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Cena 8: o Coach pergunta como estás, tu respondes, o plano ajusta-se.
export const Scene08Checkin = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {k, w} = useStage(layout);
  const askAt = scene.voiceOffset + 4;
  const chipsAt = askAt + 14;
  const tapAt = Math.max(chipsAt + 22, cueFrame(scene, 'sentes', fps) + 8);
  const pick = tapAt + timing.tapLeadFrames;
  const replyAt = pick + 12;
  const adjustAt = Math.max(replyAt + 14, cueFrame(scene, 'ajusto', fps));
  const adjusted = interpolate(frame, [adjustAt, adjustAt + 14], [0, 1], ease);
  const options = ['Com energia', 'Normal', 'Cansado'];
  const chipX = [0, 0, 0];

  return (
    <Stage layout={layout}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, display: 'flex', flexDirection: 'column', gap: 18 * k}}>
        <Bubble k={k} at={askAt}>Como te sentes hoje?</Bubble>
        <div style={{position: 'relative', display: 'flex', gap: 14 * k, paddingLeft: 88 * k, opacity: interpolate(frame, [chipsAt, chipsAt + 8], [0, 1], clamp)}}>
          {options.map((o, i) => {
            const selected = i === 2 && frame >= pick;
            return (
              <div
                key={o}
                style={{
                  position: 'relative',
                  padding: `${14 * k}px ${24 * k}px`,
                  borderRadius: 999,
                  background: selected ? colors.accent : colors.surface,
                  border: `2px solid ${selected ? colors.accentBorder : colors.borderStrong}`,
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                  fontSize: 32 * k,
                  color: selected ? colors.white : colors.text2,
                  translate: `${chipX[i]}px 0px`,
                }}
              >
                {o}
                {i === 2 ? <TapRing x={90 * k} y={30 * k} at={tapAt} size={90 * k} /> : null}
              </div>
            );
          })}
        </div>
        <Bubble k={k} at={replyAt}>Combinado: hoje treinas mais leve.</Bubble>
      </div>

      {/* plano de hoje a mudar suavemente */}
      <Card
        style={{
          position: 'absolute',
          left: 88 * k,
          right: 0,
          bottom: 0,
          height: 120 * k,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${30 * k}px`,
          opacity: interpolate(frame, [replyAt + 4, replyAt + 14], [0, 1], clamp),
        }}
        active={adjusted > 0.5}
      >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span style={{...type.micro, fontSize: 22 * k, color: colors.text2}}>Treino de hoje</span>
          <span style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 36 * k, color: colors.white}}>Peito e ombros</span>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 26 * k}}>
          <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 30 * k, color: colors.text2}}>
            <CountUp from={4} to={3} start={adjustAt} end={adjustAt + 14} style={{...type.number, fontSize: 56 * k, color: colors.white}} /> séries
          </span>
          <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 30 * k, color: colors.text2}}>
            <CountUp from={40} to={30} start={adjustAt} end={adjustAt + 14} style={{...type.number, fontSize: 56 * k, color: colors.white}} /> min
          </span>
        </div>
      </Card>
      <Sfx name="switch" at={tapAt} volume={sfxVolume.tap} />
      <Sfx name="tick" at={adjustAt} volume={sfxVolume.tick} />
    </Stage>
  );
};
