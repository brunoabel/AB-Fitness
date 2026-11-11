import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, timing} from '../theme';
import {cueFrame} from '../lib/timeline';
import {CheckMark, FocusRing, TapRing} from '../components/Interaction';
import {ScenePhone, Sfx, ease, sfxVolume} from './common';

// Coordenadas no ecrã 3-workout.png (espaço 390 x 844).
const EXERCISE = {cx: 220, cy: 478};
const SET_ROW = {x: 32, y: 476, w: 326, h: 61};
const CHECK = {x: 296, y: 489, w: 36, h: 36};

// Cena 4: telemóvel com o treino, zoom no exercício, toque no visto da 1.ª série.
export const Scene04Workout = ({scene, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoomAt = cueFrame(scene, 'mostro', fps) - 6;
  const tapAt = Math.max(zoomAt + 40, cueFrame(scene, 'visto', fps));
  const changeAt = tapAt + timing.tapLeadFrames;
  const zoom = interpolate(frame, [zoomAt, zoomAt + 26], [1, 1.4], ease);
  const done = interpolate(frame, [changeAt, changeAt + 10], [0, 1], ease);

  return (
    <>
      <ScenePhone layout={layout} src={scene.screen} zoom={{scale: zoom, ...EXERCISE}}>
        <FocusRing rect={SET_ROW} start={tapAt - 22} end={changeAt + 34} radius={12} />
        {done > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: CHECK.x,
              top: CHECK.y,
              width: CHECK.w,
              height: CHECK.h,
              borderRadius: 10,
              background: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scale: String(interpolate(done, [0, 1], [0.7, 1])),
            }}
          >
            <CheckMark size={28} progress={done} />
          </div>
        ) : null}
        <TapRing x={CHECK.x + CHECK.w / 2} y={CHECK.y + CHECK.h / 2} at={tapAt} size={64} />
      </ScenePhone>
      <Sfx name="switch" at={tapAt} volume={sfxVolume.tap} />
    </>
  );
};
