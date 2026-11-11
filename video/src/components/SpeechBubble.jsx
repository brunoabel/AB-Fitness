import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, easeOut, fonts, radius} from '../theme';
import {formats, layouts} from '../layout';
import {sceneAt} from '../lib/timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');

// Divide as palavras cronometradas da cena pelas linhas da legenda (máx. 12 palavras cada).
const splitLines = (scene) => {
  const out = [];
  let k = 0;
  scene.lines.forEach((line) => {
    const n = line.split(/\s+/).filter(Boolean).length;
    out.push(scene.words.slice(k, k + n));
    k += n;
  });
  return out;
};

const keywordRange = (words, keyword) => {
  if (!keyword) return null;
  const target = keyword.split(/\s+/).map(norm);
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, j) => norm(words[i + j].text) === t)) return [i, i + target.length - 1];
  }
  return null;
};

// Balão de fala do Coach, que é também a legenda: sempre visível, palavra a palavra,
// sincronizado com a voz, com a palavra-chave num chip marinho.
export const SpeechBubble = ({timeline, layout}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const C = layouts[layout].caption;

  // A legenda de uma cena fica até a voz da cena seguinte começar.
  const scene = (() => {
    const s = sceneAt(timeline, frame);
    const voiceStart = s.start + s.voiceOffset;
    return frame < voiceStart - 3 && s.index > 0 ? timeline.scenes[s.index - 1] : s;
  })();
  const voiceStart = scene.start + scene.voiceOffset;
  const t = frame - voiceStart; // frames desde o início da voz
  const wf = (w) => Math.round((w.startMs / 1000) * fps);

  const lines = splitLines(scene);
  let li = 0;
  lines.forEach((ws, i) => {
    if (ws.length && t >= wf(ws[0]) - 3) li = i;
  });
  const words = lines[li] ?? [];
  const lineStart = words.length ? wf(words[0]) : 0;
  const range = keywordRange(words, scene.keyword);

  const sceneIn = interpolate(t, [-3, 6], [0, 1], {...clamp, easing: easeOut});
  const lineIn = li === 0 ? 1 : interpolate(t, [lineStart - 3, lineStart + 3], [0.2, 1], clamp);

  const reveal = (w) => interpolate(t, [wf(w) - 1, wf(w) + 4], [0, 1], {...clamp, easing: easeOut});

  const tokens = [];
  for (let i = 0; i < words.length; i++) {
    if (range && i === range[0]) {
      const group = words.slice(range[0], range[1] + 1);
      tokens.push(
        <span
          key={`k${i}`}
          style={{
            display: 'inline-block',
            background: colors.accent,
            border: `2px solid ${colors.accentBorder}`,
            borderRadius: radius.chip,
            padding: '0 14px',
            margin: '0 6px',
            opacity: reveal(group[0]),
            scale: String(interpolate(reveal(group[0]), [0, 1], [0.9, 1])),
          }}
        >
          {group.map((w, j) => (
            <span key={j} style={{opacity: j === 0 ? 1 : reveal(w)}}>
              {j > 0 ? ' ' : ''}
              {w.text}
            </span>
          ))}
        </span>,
      );
      i = range[1];
      continue;
    }
    const r = reveal(words[i]);
    tokens.push(
      <span key={i} style={{display: 'inline-block', margin: '0 6px', opacity: r, translate: `0px ${(1 - r) * 10}px`}}>
        {words[i].text}
      </span>,
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: C.x,
        width: C.w,
        bottom: formats[layout].height - C.bottom,
        display: 'flex',
        justifyContent: 'center',
        opacity: sceneIn,
        translate: `0px ${(1 - sceneIn) * 24}px`,
      }}
    >
      <div
        style={{
          background: colors.captionBg,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.card,
          padding: `${C.fontSize * 0.42}px ${C.fontSize * 0.5}px`,
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: C.fontSize,
          lineHeight: 1.3,
          color: colors.white,
          textAlign: 'center',
          opacity: lineIn,
        }}
      >
        {tokens}
      </div>
    </div>
  );
};
