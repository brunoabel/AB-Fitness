// Tokens STYLESEED do AB Fitness para o vídeo do AB Coach.
// Única fonte de cores, fontes, easing e molas. Nenhum componente usa hex próprio.
import {loadFont} from '@remotion/fonts';
import {Easing, staticFile} from 'remotion';

export const colors = {
  canvas: '#000000',
  surface: '#070709',
  navy: '#0A1128',
  navy2: '#0F172A',
  accent: '#1D3557',
  accentBorder: '#2B4A7A',
  white: '#FFFFFF',
  black: '#000000',
  text2: '#8E929F',
  muted: '#767A87',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',
  track: 'rgba(255,255,255,0.06)',
  gridLine: 'rgba(255,255,255,0.06)',
  success: '#73D083',
  dropSet: '#A78BFA',
  captionBg: 'rgba(7,7,9,0.85)',
  scrim: 'rgba(0,0,0,0.6)',
  tap: 'rgba(255,255,255,0.3)',
  transparent: 'rgba(0,0,0,0)',
};

export const fonts = {
  heading: 'Plus Jakarta Sans',
  display: 'Barlow Condensed',
  body: 'Inter',
};

// Ficheiros locais (copiados do Fontsource, licença OFL) para o render não depender da rede.
const fontFiles = [
  ['Plus Jakarta Sans', '600', 'fonts/plus-jakarta-sans-latin-600-normal.woff2'],
  ['Plus Jakarta Sans', '700', 'fonts/plus-jakarta-sans-latin-700-normal.woff2'],
  ['Plus Jakarta Sans', '800', 'fonts/plus-jakarta-sans-latin-800-normal.woff2'],
  ['Barlow Condensed', '600', 'fonts/barlow-condensed-latin-600-normal.woff2'],
  ['Barlow Condensed', '700', 'fonts/barlow-condensed-latin-700-normal.woff2'],
  ['Inter', '400', 'fonts/inter-latin-400-normal.woff2'],
  ['Inter', '500', 'fonts/inter-latin-500-normal.woff2'],
  ['Inter', '600', 'fonts/inter-latin-600-normal.woff2'],
  ['Inter', '700', 'fonts/inter-latin-700-normal.woff2'],
];

let fontsRequested = false;
export const loadFonts = () => {
  if (fontsRequested) return;
  fontsRequested = true;
  fontFiles.forEach(([family, weight, file]) => {
    loadFont({family, weight, url: staticFile(file)});
  });
};

// Easing de saída e molas do STYLESEED.
export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const springConfig = {stiffness: 300, damping: 28, mass: 1};

export const timing = {
  fps: 30,
  transitionFrames: 12, // fade entre cenas
  breathFrames: 12, // respiro depois da voz de cada cena
  tapLeadFrames: 6, // toque aparece 6 frames antes da mudança de ecrã
  poseCrossfadeFrames: 9,
  morphFrames: 14,
  breathCycleFrames: 90, // respiração do avatar, ciclo de ~3 s
};

export const audioLevels = {
  voice: 1,
  musicBase: 0.15,
  musicDucked: 0.06,
  musicFadeInFrames: 30,
  musicFadeOutFrames: 60,
  sfx: {whoosh: 0.25, tap: 0.35, tick: 0.25, ding: 0.4, unlock: 0.35, pageTurn: 0.3},
};

export const radius = {card: 28, chip: 14, pill: 999};

// Estilos de texto reutilizáveis.
export const type = {
  number: {fontFamily: fonts.display, fontWeight: 700, fontVariantNumeric: 'tabular-nums'},
  heading: {fontFamily: fonts.heading, fontWeight: 700, letterSpacing: '-0.02em'},
  body: {fontFamily: fonts.body, fontWeight: 500},
  micro: {fontFamily: fonts.body, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em'},
};
