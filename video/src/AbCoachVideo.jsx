import React from 'react';
import {Audio} from '@remotion/media';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {AbsoluteFill, staticFile} from 'remotion';
import {audioLevels, colors, easeOut, loadFonts, timing} from './theme';
import {CoachAvatarTrack, SpeakingBars} from './components/CoachAvatar';
import {SpeechBubble} from './components/SpeechBubble';
import {Music} from './components/Music';
import {Sfx} from './scenes/common';
import {Scene01Hello} from './scenes/Scene01Hello';
import {Scene02Doubts} from './scenes/Scene02Doubts';
import {Scene03Plan} from './scenes/Scene03Plan';
import {Scene04Workout} from './scenes/Scene04Workout';
import {Scene05Biomechanics} from './scenes/Scene05Biomechanics';
import {Scene06Rest} from './scenes/Scene06Rest';
import {Scene07Running} from './scenes/Scene07Running';
import {Scene08Checkin} from './scenes/Scene08Checkin';
import {Scene09Achievements} from './scenes/Scene09Achievements';
import {Scene10Outro} from './scenes/Scene10Outro';

loadFonts();

const SCENES = {
  Hello: Scene01Hello,
  Doubts: Scene02Doubts,
  Plan: Scene03Plan,
  Workout: Scene04Workout,
  Biomechanics: Scene05Biomechanics,
  Rest: Scene06Rest,
  Running: Scene07Running,
  Checkin: Scene08Checkin,
  Achievements: Scene09Achievements,
  Outro: Scene10Outro,
};

// Uma família de transições para o vídeo todo: fade de 12 frames.
const transition = linearTiming({durationInFrames: timing.transitionFrames, easing: easeOut});

export const AbCoachVideo = ({layout, timeline, music}) => {
  if (!timeline) return <AbsoluteFill style={{background: colors.canvas}} />;
  const doubts = timeline.scenes.find((s) => s.component === 'Doubts');
  return (
    <AbsoluteFill style={{background: colors.canvas, overflow: 'hidden'}}>
      <CoachAvatarTrack timeline={timeline} layout={layout} />

      <TransitionSeries name="Cenas">
        {timeline.scenes.map((scene, i) => {
          const Scene = SCENES[scene.component];
          return (
            <React.Fragment key={scene.id}>
              {i > 0 ? <TransitionSeries.Transition presentation={fade()} timing={transition} /> : null}
              <TransitionSeries.Sequence name={scene.id} durationInFrames={scene.duration}>
                <Scene scene={scene} layout={layout} cards={doubts?.cards} />
                {scene.audio ? <Audio src={staticFile(scene.audio)} from={scene.voiceOffset} volume={audioLevels.voice} /> : null}
                {i > 0 ? <Sfx name="whoosh" at={0} volume={audioLevels.sfx.whoosh} /> : null}
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      <SpeakingBars timeline={timeline} layout={layout} />
      <SpeechBubble timeline={timeline} layout={layout} />
      {music ? <Music src={music} timeline={timeline} /> : null}
    </AbsoluteFill>
  );
};
