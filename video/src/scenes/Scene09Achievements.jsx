import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, type} from '../theme';
import {phoneRect} from '../layout';
import {cueFrame} from '../lib/timeline';
import {CountUp, CheckMark} from '../components/Interaction';
import {useScreenUnit} from '../components/PhoneMockup';
import {Confetti} from '../components/Confetti';
import {Card, ScenePhone, Sfx, clamp, ease, sfxVolume, useSpring} from './common';

// Coordenadas no ecrã 5-badges.png (espaço 390 x 844).
const ROW = {x: 17, y: 362, w: 356, h: 78};
const LOCK = {cx: 56, cy: 401};

const Medal = ({p}) => {
  const unit = useScreenUnit();
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: ROW.x,
          top: ROW.y,
          width: ROW.w,
          height: ROW.h,
          borderRadius: 16,
          border: `${2 / unit}px solid ${colors.accentBorder}`,
          background: colors.accent,
          opacity: interpolate(p, [0, 0.3], [0, 0.55], clamp),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: LOCK.cx - 24,
          top: LOCK.cy - 24,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: colors.white,
          border: `3px solid ${colors.accentBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          scale: String(interpolate(p, [0, 1], [0.2, 1])),
          opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
        }}
      >
        <CheckMark size={30} progress={interpolate(p, [0.4, 1], [0, 1], clamp)} />
      </div>
    </>
  );
};

// Cena 9: medalha a desbloquear, recorde pessoal a subir, confettis brancos e marinho.
export const Scene09Achievements = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const unlockAt = Math.max(scene.voiceOffset + 8, cueFrame(scene, 'conquista', fps) - 6);
  const medal = useSpring(unlockAt);
  const recordAt = Math.max(unlockAt + 24, cueFrame(scene, 'recordes', fps) - 6);
  const rec = useSpring(recordAt);
  const r = phoneRect(layout);
  const vertical = layout === 'vertical';
  const cardW = vertical ? 520 : 470;
  const left = vertical ? 1020 - cardW : r.x - cardW + 90;
  const top = vertical ? 900 : 560;

  return (
    <>
      <ScenePhone layout={layout} src={scene.screen} zoom={{scale: interpolate(frame, [unlockAt - 10, unlockAt + 16], [1, 1.25], ease), cx: 195, cy: 380}}>
        <Medal p={medal} />
      </ScenePhone>
      <Card
        active
        style={{
          position: 'absolute',
          left,
          top,
          width: cardW,
          padding: '26px 30px',
          opacity: interpolate(rec, [0, 0.4], [0, 1], clamp),
          translate: `0px ${interpolate(rec, [0, 1], [40, 0])}px`,
        }}
      >
        <div style={{...type.micro, fontSize: 24, color: colors.white, opacity: 0.8}}>Recorde pessoal</div>
        <div style={{fontFamily: fonts.heading, fontWeight: 700, fontSize: 38, color: colors.white, marginTop: 4}}>Supino com halteres</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6}}>
          <CountUp from={20} to={22.5} decimals={1} start={recordAt + 6} end={recordAt + 36} style={{...type.number, fontSize: 108, lineHeight: 1, color: colors.white}} />
          <span style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 34, color: colors.white}}>kg</span>
          <span style={{fontFamily: fonts.body, fontWeight: 700, fontSize: 30, color: colors.success, marginLeft: 'auto', opacity: interpolate(frame, [recordAt + 36, recordAt + 44], [0, 1], clamp)}}>
            +2,5 kg
          </span>
        </div>
      </Card>
      <Confetti start={unlockAt + 4} count={90} seed="medalha" />
      <Sfx name="unlock" at={unlockAt} volume={sfxVolume.unlock} />
      <Sfx name="ding" at={recordAt + 36} volume={sfxVolume.ding} />
    </>
  );
};
