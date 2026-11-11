import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import {staticFile} from 'remotion';
import script from '../script.json';
import {timing} from '../theme';
import {buildTimeline, estimateWords, speechText, wordsDurationMs} from './timeline';

// Duração de um ficheiro de áudio (skill get-audio-duration do Remotion).
export const getAudioDuration = async (src) => {
  const input = new Input({formats: ALL_FORMATS, source: new UrlSource(src)});
  const seconds = await input.computeDuration();
  input.dispose();
  return seconds;
};

const fetchJson = async (path) => {
  try {
    const res = await fetch(staticFile(path));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const fileExists = async (path) => {
  try {
    const res = await fetch(staticFile(path), {method: 'HEAD'});
    return res.ok;
  } catch {
    return false;
  }
};

// Lê o manifesto da voz (gerado por scripts/generate-voiceover.mjs) e mede cada MP3.
// Cena sem voz gerada (ou com texto alterado): usa tempos estimados até se regenerar.
export const resolveScenes = async () => {
  const manifest = await fetchJson('voiceover/manifest.json');
  return Promise.all(
    script.scenes.map(async (s) => {
      const text = speechText(s);
      const entry = manifest?.scenes?.[s.id];
      if (entry && entry.text === text) {
        const [seconds, words] = await Promise.all([getAudioDuration(staticFile(entry.audio)), fetchJson(entry.captions)]);
        return {...s, voiceMs: seconds * 1000, words: words ?? estimateWords(text), audio: entry.audio, estimated: false};
      }
      const words = estimateWords(text);
      return {...s, voiceMs: wordsDurationMs(words), words, audio: null, estimated: true};
    }),
  );
};

export const calculateMetadata = async ({props}) => {
  const scenes = await resolveScenes();
  const music = script.music?.file && (await fileExists(script.music.file)) ? script.music.file : null;
  const timeline = buildTimeline({
    scenes,
    fps: timing.fps,
    transitionFrames: timing.transitionFrames,
    breathFrames: timing.breathFrames,
    bpm: script.music?.bpm ?? null,
  });
  return {durationInFrames: timeline.durationInFrames, props: {...props, timeline, music}};
};
