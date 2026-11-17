import React from 'react';
import {Composition, Still} from 'remotion';
import {Main, FPS, TOTAL} from './Video';
import {Thumbnail} from './Thumbnail';

export const Root: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Still id="Thumb" component={Thumbnail} width={1280} height={720} />
  </>
);
