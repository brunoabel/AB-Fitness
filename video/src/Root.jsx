import React from 'react';
import {Composition} from 'remotion';
import {AbCoachVideo} from './AbCoachVideo';
import {calculateMetadata} from './lib/metadata';
import {timing} from './theme';

// Duas composições com o mesmo conteúdo; só o layout muda.
// A duração vem do calculateMetadata (áudio de cada cena + respiro), nunca escrita à mão.
export const RemotionRoot = () => (
  <>
    <Composition
      id="AbCoachVertical"
      component={AbCoachVideo}
      width={1080}
      height={1920}
      fps={timing.fps}
      durationInFrames={1}
      defaultProps={{layout: 'vertical'}}
      calculateMetadata={calculateMetadata}
    />
    <Composition
      id="AbCoachWide"
      component={AbCoachVideo}
      width={1920}
      height={1080}
      fps={timing.fps}
      durationInFrames={1}
      defaultProps={{layout: 'wide'}}
      calculateMetadata={calculateMetadata}
    />
  </>
);
