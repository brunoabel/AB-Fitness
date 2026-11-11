import React from 'react';
import {Audio} from '@remotion/media';
import {interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {audioLevels} from '../theme';
import {speakingLevel} from '../lib/timeline';

// Música de fundo: 0.15, fade in de 1 s, fade out de 2 s, ducking para 0.06 enquanto o Coach fala.
export const Music = ({src, timeline}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const duck = speakingLevel(timeline, frame, 8);
  const base = interpolate(duck, [0, 1], [audioLevels.musicBase, audioLevels.musicDucked]);
  const fade = interpolate(
    frame,
    [0, audioLevels.musicFadeInFrames, durationInFrames - audioLevels.musicFadeOutFrames, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  return <Audio src={staticFile(src)} volume={base * fade} loop />;
};
