/**
 * Template de Reel AB Fitness (1080x1920, 30fps). Estética Luxury Performance Dark Mode: preto #000, marinho do
 * design system, Plus Jakarta Sans, zero ciano/laranja, zero ilustração improvisada. Tudo vem das props
 * (gerado por tools/marketing/render-reel.mjs).
 *
 * Layout fixo em duas faixas, para nunca empilhar texto sobre a mídia:
 *   mídia   y ∈ [280, 1290]  (vídeo 3D real ou tela real do app)
 *   legenda y ∈ [1330, 1545] (uma única camada de texto, sem caixa)
 * Zonas seguras do Instagram (texto nunca entra): topo 250px, base 350px, borda direita 120px.
 *
 * props = {
 *   scenes: [{ seconds, kind: 'video3d'|'ui'|'image'|'title'|'cta', src?, startFrom?, zoom?: [de, para], focusX?,
 *              focusY?, tone?: 'muted', pan?: [y0, y1], rise?, kicker?, headline?, url?, line?, logo? }],
 *   captions: [{ start, end, text } | { start, end, words: [{ text, start, end }] }],  // segundos
 *   audio: 'narration.norm.wav' | null
 * }
 * Cenas 'cta' e 'title' escondem a legenda (o próprio texto da cena é a única camada).
 */
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

const C = {
  app: '#000000',
  surface: '#070709',
  navy: '#0a1128',
  navy2: '#0f172a',
  accent: '#1d3557',
  zinc400: '#8e929f',
  white: '#ffffff',
  hairline: 'rgba(255,255,255,0.08)'
};
const SAFE = { top: 250, bottom: 350, right: 120, left: 64 };
const MEDIA = { top: 280, height: 1010, inset: 40 };
const FONT = "'Plus Jakarta Sans', 'Inter', sans-serif";
const XFADE = 6; // frames de crossfade entre cenas
const EASE = (t) => 1 - Math.pow(1 - t, 3);

const fonts = `
@font-face{font-family:'Plus Jakarta Sans';font-weight:500 800;src:url('${staticFile('fonts/plus-jakarta-sans-latin.woff2')}') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC;}
@font-face{font-family:'Plus Jakarta Sans';font-weight:500 800;src:url('${staticFile('fonts/plus-jakarta-sans-latin-ext.woff2')}') format('woff2');unicode-range:U+0100-02BA,U+1E00-1EFF;}
@font-face{font-family:'Inter';font-weight:400 700;src:url('${staticFile('fonts/inter-latin.woff2')}') format('woff2');}
`;

const src = (s) => (/^https?:\/\//.test(s) ? s : staticFile(s));

export const reelMetadata = ({ props }) => {
  const fps = 30;
  const scenesFrames = (props.scenes || []).reduce((n, s) => n + Math.round((s.seconds || 3) * fps), 0);
  const capEnd = Math.ceil(Math.max(0, ...(props.captions || []).map((c) => c.end)) * fps) + 4;
  return { durationInFrames: Math.max(scenesFrames, capEnd, fps * 3) };
};

/** Progresso 0..1 da cena atual (linear), para zoom e pan contínuos. */
function useProgress() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames - 1)));
}

/** Painel de mídia comum: cantos arredondados, filete de 1px, nada de sombra colorida. */
function Panel({ children, background }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: MEDIA.inset,
        right: MEDIA.inset,
        top: MEDIA.top,
        height: MEDIA.height,
        borderRadius: 56,
        overflow: 'hidden',
        background,
        boxShadow: `inset 0 0 0 1px ${C.hairline}`
      }}
    >
      {children}
    </div>
  );
}

/**
 * Vídeo 3D real direto no fundo preto, sem cartão. Espera o arquivo tratado por grade-3d.mjs (fundo preto,
 * corpo marinho, músculo em destaque claro, 1080x1080). zoom [de, para] com origem em focusX/focusY (0..1).
 */
function Video3D({ scene }) {
  const t = useProgress();
  const [z0, z1] = scene.zoom || [1.05, 1.15];
  const zoom = z0 + (z1 - z0) * EASE(t);
  const fx = scene.focusX ?? 0.5;
  const fy = scene.focusY ?? 0.45;
  // tone 'muted': plano do erro mais escuro e dessaturado, contrastando com a execução correta em tom cheio
  const filter = scene.tone === 'muted' ? 'brightness(0.62) saturate(0.5)' : 'none';
  return (
    <AbsoluteFill style={{ background: C.app }}>
      <div style={{ position: 'absolute', left: 0, top: MEDIA.top, width: 1080, height: 1080, overflow: 'hidden' }}>
        <OffthreadVideo
          src={src(scene.src)}
          startFrom={scene.startFrom || 0}
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: `${fx * 100}% ${fy * 100}%`, filter }}
        />
      </div>
    </AbsoluteFill>
  );
}

/** Tela real do app (captura 1170x2532) recortada no painel, com pan vertical suave entre pan[0] e pan[1] (px da captura). */
function UiShot({ scene }) {
  const t = useProgress();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = scene.rise ? spring({ frame, fps, config: { damping: 200, mass: 0.7 } }) : 1;
  const panelW = 1080 - MEDIA.inset * 2;
  const scale = panelW / 1170;
  const [y0, y1] = scene.pan || [0, 0];
  const y = y0 + (y1 - y0) * EASE(t);
  // zoom [de, para] com origem em focusX/focusY (0..1 do painel): close no dado que a fala cita
  const [z0, z1] = scene.zoom || [1, 1];
  const zoom = z0 + (z1 - z0) * EASE(t);
  return (
    <AbsoluteFill style={{ background: C.app, transform: `translateY(${(1 - rise) * 140}px)` }}>
      <Panel background={C.surface}>
        <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: `${(scene.focusX ?? 0.5) * 100}% ${(scene.focusY ?? 0.5) * 100}%` }}>
          <Img src={src(scene.src)} style={{ position: 'absolute', left: 0, top: -y * scale, width: panelW, height: 2532 * scale }} />
        </div>
      </Panel>
    </AbsoluteFill>
  );
}

/**
 * Encerramento em movimento até o último frame: o 3D (scene.src) continua rodando atrás, escurecido, e o lockup
 * (logo + domínio) sobe na faixa da legenda. A linha do CTA acende palavra a palavra no tempo da narração
 * (captions recebidas do Reel), então o texto falado não aparece duas vezes.
 */
function Cta({ scene, captions = [], offset = 0 }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = useProgress();
  const a = spring({ frame: frame - 1, fps, config: { damping: 200, mass: 0.6 } });
  const now = offset + frame / fps;
  const words = captions.flatMap((c) => c.words || []).filter((w) => w.start >= offset - 0.05);
  return (
    <AbsoluteFill style={{ background: C.app }}>
      {scene.src && (
        <div style={{ position: 'absolute', left: 0, top: MEDIA.top, width: 1080, height: 1080, overflow: 'hidden', opacity: 0.38 }}>
          <OffthreadVideo
            src={src(scene.src)}
            startFrom={scene.startFrom || 0}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.25 - 0.15 * EASE(t)})`, transformOrigin: '50% 40%' }}
          />
        </div>
      )}
      <div style={{ position: 'absolute', left: SAFE.left, right: SAFE.right, top: MEDIA.top + MEDIA.height - 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
          {scene.logo && <Img src={src(scene.logo)} style={{ width: 104, height: 104, flexShrink: 0 }} />}
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 100, lineHeight: 1, letterSpacing: -3, color: C.white }}>{scene.url || 'abfitness.app'}</div>
        </div>
        {words.length > 0 && (
          <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 700, fontSize: 52, lineHeight: 1.15, letterSpacing: -0.8, wordSpacing: 4 }}>
            {words.map((w, i) => {
              const on = Math.min(1, Math.max(0, (now - w.start) / 0.08));
              const shown = Math.min(1, Math.max(0, (now - w.start + 0.25) / 0.2));
              return (
                <span key={i} style={{ color: `rgba(255,255,255,${0.4 + 0.6 * on})`, opacity: shown }}>
                  {w.text}
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

/** Imagem real (poster, coach, foto) no mesmo painel das outras mídias. */
function ImageScene({ scene }) {
  const t = useProgress();
  return (
    <AbsoluteFill style={{ background: C.app }}>
      <Panel background={C.surface}>
        <Img src={src(scene.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + 0.06 * EASE(t)})` }} />
      </Panel>
    </AbsoluteFill>
  );
}

/** Cartela de texto (kicker + headline). Como a cta, esconde a legenda: é a única camada de texto da cena. */
function Title({ scene }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 2, fps, config: { damping: 200, mass: 0.6 } });
  return (
    <AbsoluteFill style={{ background: C.app, justifyContent: 'center', padding: `0 ${SAFE.right}px 0 ${SAFE.left}px` }}>
      {scene.kicker && (
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, letterSpacing: 4, textTransform: 'uppercase', color: C.zinc400, opacity: p, marginBottom: 28 }}>{scene.kicker}</div>
      )}
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 116, lineHeight: 0.95, letterSpacing: -3, color: C.white, opacity: p, transform: `translateY(${(1 - p) * 50}px)` }}>
        {scene.headline}
      </div>
    </AbsoluteFill>
  );
}

const SCENES = { video3d: Video3D, ui: UiShot, cta: Cta, image: ImageScene, title: Title };
const TEXT_SCENES = new Set(['cta', 'title']);

/** Legenda editorial sem caixa: bloco curto, palavra falada em branco, próximas em branco 38%. */
function Captions({ captions, hiddenRanges }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (hiddenRanges.some(([a, b]) => t >= a && t < b)) return null;
  const cue = captions.find((c) => t >= c.start && t < c.end);
  if (!cue) return null;
  const words = cue.words || cue.text.split(/\s+/).filter(Boolean).map((text) => ({ text }));
  // Sem tempo por palavra (SRT do CLI): estima o início de cada palavra pelo tamanho
  if (!cue.words) {
    const total = words.reduce((n, w) => n + w.text.length + 1, 0);
    let acc = 0;
    for (const w of words) {
      w.start = cue.start + (acc / total) * (cue.end - cue.start);
      acc += w.text.length + 1;
    }
  }
  const enter = spring({ frame: Math.round((t - cue.start) * fps), fps, config: { damping: 200, mass: 0.4 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        right: SAFE.right,
        top: MEDIA.top + MEDIA.height + 80,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 70,
        lineHeight: 1.06,
        letterSpacing: -1.2,
        wordSpacing: 6,
        opacity: enter,
        transform: `translateY(${(1 - enter) * 18}px)`
      }}
    >
      {words.map((w, i) => {
        const on = Math.min(1, Math.max(0, (t - w.start) / 0.08));
        return (
          <span key={i} style={{ color: `rgba(255,255,255,${0.38 + 0.62 * on})` }}>
            {/* Ponto final some no fim do bloco (o ponto da Plus Jakarta abre um vão visual); vírgulas ficam */}
            {i === words.length - 1 ? w.text.replace(/\.$/, '') : w.text}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </div>
  );
}

/** Cena com entrada em crossfade (as cenas seguintes renderizam por cima da anterior). */
function SceneWrap({ Comp, scene, fadeIn, fadeOut, captions, offset }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = fadeIn ? interpolate(frame, [0, XFADE], [0, 1], { extrapolateRight: 'clamp' }) : 1;
  // Último frame da peça: fecha em preto em vez de congelar
  const out = fadeOut ? interpolate(frame, [durationInFrames - 7, durationInFrames - 1], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
  const s = fadeIn ? interpolate(frame, [0, XFADE * 2], [1.03, 1], { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ opacity: o * out, transform: `scale(${s})` }}>
      <Comp scene={scene} captions={captions} offset={offset} />
    </AbsoluteFill>
  );
}

export const Reel = ({ scenes = [], captions = [], audio = null }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const lengths = scenes.map((s) => Math.round((s.seconds || 3) * fps));
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  const hiddenRanges = scenes
    .map((s, i) => (TEXT_SCENES.has(s.kind) ? [(offsets[i] - XFADE / 2) / fps, i === scenes.length - 1 ? Infinity : (offsets[i] + lengths[i] + XFADE / 2) / fps] : null))
    .filter(Boolean);
  return (
    <AbsoluteFill style={{ background: C.app }}>
      <style>{fonts}</style>
      {scenes.map((scene, i) => {
        // Cada cena entra XFADE/2 antes do corte nominal e a anterior sai XFADE/2 depois: crossfade centrado no corte.
        // A última cena se estende até o fim do vídeo.
        const from = Math.max(0, offsets[i] - (i ? XFADE / 2 : 0));
        const end = i === scenes.length - 1 ? durationInFrames : offsets[i] + lengths[i] + XFADE / 2;
        const Comp = SCENES[scene.kind] || Video3D;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, end - from)}>
            <SceneWrap Comp={Comp} scene={scene} fadeIn={i > 0} fadeOut={i === scenes.length - 1} captions={captions} offset={from / fps} />
          </Sequence>
        );
      })}
      <Captions captions={captions} hiddenRanges={hiddenRanges} />
      {audio && <Audio src={src(audio)} />}
    </AbsoluteFill>
  );
};
