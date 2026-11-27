import { registerRoot, Composition } from 'remotion';
import { Reel, reelMetadata } from './Reel.jsx';

const Root = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30 * 20}
    defaultProps={{ scenes: [], captions: [], audio: null }}
    calculateMetadata={reelMetadata}
  />
);

registerRoot(Root);
