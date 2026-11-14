import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, stagger, useAnimate, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

export const BOOT_SEEN_KEY = 'ab_boot_seen_v1';

// Saída expo para traços; "aterragem" com ligeiro overshoot para discos com peso
const EASE = [0.22, 1, 0.36, 1];
const LAND = [0.3, 1.35, 0.55, 1];
const TOTAL_KG = 105; // barra 20 + 2×25 + 2×15 + 2×2,5

/** Discos de cada lado, de dentro para fora como numa barra real. `offset` = distância ao centro (px). */
const PLATES = [
  { id: 'p25', offset: 108, className: 'w-[15px] h-[92px] bg-accent border border-white/15 rounded-[3px]' },
  { id: 'p15', offset: 124, className: 'w-[13px] h-[66px] bg-surface-3 border border-white/25 rounded-[3px]' },
  { id: 'clip', offset: 138, className: 'w-[7px] h-[24px] bg-white rounded-[2px]' }
];
const START_X = 190;

/** Disco centrado na sua posição final; a entrada lateral é animada só com `x` (GPU). */
function Plate({ plate, side }) {
  const dir = side === 'l' ? -1 : 1;
  return (
    <span className="absolute top-1/2 left-1/2" style={{ transform: `translate(calc(-50% + ${dir * plate.offset}px), -50%)` }}>
      <span className={`plate-${side}-${plate.id} block opacity-0 will-change-transform ${plate.className}`} />
    </span>
  );
}

/**
 * Abertura "Carregar a barra" (~2.4s): a barra risca o ecrã, os discos caem com peso
 * (a barra cede a cada impacto), a carga sobe como numa repetição e revela a marca,
 * e na saída a barra é arrumada e a marca desce. Toque para saltar. Uma vez por sessão.
 */
export default function BootSequence({ onFinish }) {
  const reduce = useReducedMotion();
  const [scope, run] = useAnimate();
  const [ready, setReady] = useState(false);
  const doneRef = useRef(false);
  const kg = useMotionValue(0);
  const kgText = useTransform(kg, (v) => `${Math.round(v)} kg na barra`);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(BOOT_SEEN_KEY, '1');
    } catch {}
    // Saída: a barra é arrumada para cima e a marca desce pela máscara (só transform/opacity)
    run([
      ['.rig', { y: -420, opacity: 0 }, { duration: 0.42, ease: [0.55, 0, 0.75, 0.2], at: 0 }],
      ['.glyph', { y: '108%' }, { duration: 0.32, ease: [0.55, 0, 0.75, 0.2], at: 0.04, delay: stagger(0.05) }],
      ['.word, .caption, .skip', { opacity: 0 }, { duration: 0.18, at: 0 }]
    ]);
    setTimeout(() => onFinish?.(), reduce ? 80 : 440);
  };

  useEffect(() => {
    const d = reduce ? 0 : 1;
    const land = (id, at) => [
      [`.plate-l-${id}`, { x: [-START_X, 0], opacity: [0, 1] }, { duration: 0.3 * d, ease: LAND, at }],
      [`.plate-r-${id}`, { x: [START_X, 0], opacity: [0, 1] }, { duration: 0.3 * d, ease: LAND, at }]
    ];
    const dip = (px, at) => ['.rig', { y: [0, px, 0] }, { duration: (0.14 + px * 0.025) * d, ease: 'easeOut', at }];

    // Timeline: cada disco aterra e a barra cede em proporção ao peso
    const controls = run([
      ['.bar', { scaleX: [0, 1] }, { duration: 0.5 * d, ease: EASE, at: 0.1 * d }],
      ...land('p25', 0.48 * d),
      dip(5, 0.74 * d),
      ...land('p15', 0.8 * d),
      dip(3, 1.06 * d),
      ...land('clip', 1.1 * d),
      dip(1.5, 1.36 * d),
      // A repetição: a carga sobe e afasta-se, a marca nasce por baixo
      ['.rig', { y: [0, -112], scale: [1, 0.78] }, { duration: 0.62 * d, ease: EASE, at: 1.46 * d }],
      ['.glyph', { y: ['108%', '0%'] }, { duration: 0.62 * d, ease: EASE, at: 1.52 * d, delay: stagger(0.07 * d) }],
      ['.word', { opacity: [0, 1], y: [10, 0] }, { duration: 0.42 * d, ease: EASE, at: 1.8 * d }]
    ]);
    const counter = animate(kg, TOTAL_KG, { duration: 0.95 * d, delay: 0.48 * d, ease: 'easeOut', onComplete: () => setReady(true) });
    const t = setTimeout(finish, reduce ? 700 : 2450);
    return () => {
      controls.stop();
      counter.stop();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={scope}
      role="presentation"
      onClick={finish}
      className="fixed inset-0 z-[100] bg-app text-white flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden"
    >
      <div className="relative w-[320px] h-[270px]">
        {/* A barra carregada */}
        <div className="rig absolute inset-x-0 top-[70px] h-[100px] will-change-transform">
          <span className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
            <span className="bar block w-[300px] h-[3px] rounded-full bg-white" style={{ transform: 'scaleX(0)' }} />
          </span>
          {/* Travões das mangas */}
          {[-1, 1].map((dir) => (
            <span key={dir} className="absolute top-1/2 left-1/2 w-[4px] h-[16px] rounded-[1px] bg-zinc-400" style={{ transform: `translate(calc(-50% + ${dir * 98}px), -50%)` }} />
          ))}
          {PLATES.map((p) => (
            <React.Fragment key={p.id}>
              <Plate plate={p} side="l" />
              <Plate plate={p} side="r" />
            </React.Fragment>
          ))}
        </div>

        {/* A marca: nasce por baixo da barra, como no topo de uma repetição */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="flex overflow-hidden pr-3" role="img" aria-label="AB Fitness">
            {['A', 'B'].map((g) => (
              <span key={g} className="glyph inline-block font-heading font-bold italic text-[118px] leading-[0.9] tracking-[-0.04em] text-white" style={{ transform: 'translateY(108%)' }}>
                {g}
              </span>
            ))}
          </span>
          <span className="word font-heading text-section font-semibold text-zinc-300 opacity-0">Fitness</span>
        </div>
      </div>

      <motion.p className="caption mt-10 h-6 text-body text-zinc-400 tabular-nums" aria-live="polite">
        {ready ? 'Pronto para treinar' : kgText}
      </motion.p>

      <p className="skip absolute bottom-[calc(env(safe-area-inset-bottom,0px)+28px)] text-[13px] text-zinc-500">Toque para saltar</p>
    </div>
  );
}
