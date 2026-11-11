// Lógica de tempo pura (sem React), partilhada pelo calculateMetadata, pelos componentes
// e pelo script de storyboard em Node. A voz manda: cada cena dura o áudio dela + respiro.

export const sceneWords = (scene) => scene.lines.join(' ').split(/\s+/).filter(Boolean);
export const speechText = (scene) => scene.speech ?? scene.lines.join(' ');

// Estimativa de tempos palavra a palavra enquanto não existe MP3 (ritmo calmo para leigos).
export const estimateWords = (text) => {
  const words = text.split(/\s+/).filter(Boolean);
  let t = 120;
  return words.map((w) => {
    const letters = w.replace(/[^\p{L}\p{N}]/gu, '').length;
    const dur = 110 + letters * 58;
    const item = {text: w, startMs: t, endMs: t + dur, timestampMs: null, confidence: null};
    t += dur + 40;
    if (/[,;:]$/.test(w)) t += 200;
    if (/[.!?]$/.test(w)) t += 380;
    return item;
  });
};

export const wordsDurationMs = (words) => (words.length ? words[words.length - 1].endMs + 120 : 0);

// Constrói a linha temporal. Para cada cena:
//   start: frame absoluto em que a cena começa a entrar (início do fade)
//   duration: duração da <TransitionSeries.Sequence> (inclui a sobreposição de saída)
//   voiceOffset: frame, relativo à cena, em que a voz começa
export const buildTimeline = ({scenes, fps, transitionFrames, breathFrames, bpm}) => {
  const n = scenes.length;
  const beat = bpm ? (fps * 60) / bpm : 0;
  let start = 0;
  const out = scenes.map((s, i) => {
    const tIn = i === 0 ? 0 : transitionFrames;
    const voiceFrames = Math.ceil((s.voiceMs / 1000) * fps);
    let next = start + tIn + voiceFrames + breathFrames + (s.extraFrames ?? 0);
    if (beat && i < n - 1) {
      // O ponto médio do fade seguinte cai num tempo da música.
      const mid = next + transitionFrames / 2;
      next = Math.ceil(Math.ceil(mid / beat) * beat - transitionFrames / 2);
    }
    const tOut = i === n - 1 ? 0 : transitionFrames;
    const item = {
      ...s,
      index: i,
      start,
      duration: next - start + tOut,
      cut: next,
      voiceOffset: tIn,
      voiceFrames,
    };
    start = next;
    return item;
  });
  const last = out[n - 1];
  return {scenes: out, durationInFrames: last.start + last.duration, fps};
};

export const sceneAt = (timeline, frame) => {
  const list = timeline.scenes;
  for (let i = list.length - 1; i >= 0; i--) {
    if (frame >= list[i].start) return list[i];
  }
  return list[0];
};

// 1 enquanto há voz (palavras, com micro-pausas unidas), 0 em silêncio.
export const isSpeakingAt = (timeline, frame) => {
  const {fps} = timeline;
  return timeline.scenes.some((s) => {
    const local = ((frame - s.start - s.voiceOffset) / fps) * 1000;
    if (local < -60 || local > s.voiceMs + 60) return false;
    return s.words.some((w, k) => {
      const next = s.words[k + 1];
      const end = next && next.startMs - w.endMs < 260 ? next.startMs : w.endMs;
      return local >= w.startMs - 40 && local <= end + 40;
    });
  });
};

// Versão suavizada (média numa janela), para barras "a falar" e ducking da música.
export const speakingLevel = (timeline, frame, radius = 3) => {
  let sum = 0;
  for (let k = -radius; k <= radius; k++) sum += isSpeakingAt(timeline, frame + k) ? 1 : 0;
  return sum / (radius * 2 + 1);
};

// Frame (relativo à cena) em que a palavra k é dita.
export const wordFrame = (scene, k, fps) => {
  const w = scene.words[Math.max(0, Math.min(k, scene.words.length - 1))];
  return scene.voiceOffset + Math.round(((w?.startMs ?? 0) / 1000) * fps);
};

// Índice da primeira palavra que contém o texto dado (sem acentos nem pontuação).
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]/gu, '');
export const findWord = (scene, needle) => {
  const target = norm(needle);
  const idx = scene.words.findIndex((w) => norm(w.text).includes(target));
  return idx === -1 ? 0 : idx;
};
export const cueFrame = (scene, needle, fps) => wordFrame(scene, findWord(scene, needle), fps);
