import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import useMuscleRecovery from '../hooks/useMuscleRecovery';
import { FATIGUED_FROM, FRESH_BELOW } from '../utils/muscleFatigue';
import { BODY } from './recovery/bodyPaths';
import { HEAT_GRADIENT, heatColor } from './recovery/heat';
import RecoverySheet from './recovery/RecoverySheet';
import { triggerHaptic } from '../utils/audio';

const MIRROR = 'matrix(-1 0 0 1 120 0)';

function Mirrored({ paths }) {
  return (
    <>
      {paths.map((d, i) => <path key={`l${i}`} d={d} />)}
      <g transform={MIRROR}>{paths.map((d, i) => <path key={`r${i}`} d={d} />)}</g>
    </>
  );
}

/** Uma vista do corpo. Cada região é um grupo (lado esquerdo + espelho) com fill pela rampa térmica. */
function BodyFigure({ view, muscles, selected, onSelect, reduce }) {
  const { axis, half } = BODY[view];
  const { neutral, regions } = useMemo(() => {
    const byRegion = new Map();
    const rest = [];
    for (const p of half) {
      if (!p.region) rest.push(p.d);
      else byRegion.set(p.region, [...(byRegion.get(p.region) || []), p.d]);
    }
    return { neutral: rest, regions: [...byRegion] };
  }, [half]);

  return (
    <svg viewBox="0 0 120 270" className="w-full h-auto overflow-visible select-none" role="group" aria-label={view === 'front' ? 'Corpo, vista de frente' : 'Corpo, vista de costas'}>
      <defs>
        <filter id={`heat-glow-${view}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3.4" />
        </filter>
      </defs>

      <g fill="var(--color-surface-3)" stroke="var(--color-app)" strokeWidth="0.8">
        {axis.map((p, i) => <path key={i} d={p.d} />)}
        <Mirrored paths={neutral} />
      </g>

      {/* Halo térmico: só nos grupos com fadiga; pulsa devagar acima de 70% */}
      <g filter={`url(#heat-glow-${view})`} fill="var(--color-heat-3)" aria-hidden>
        {regions.map(([id, paths]) => {
          const f = muscles[id]?.fatigue || 0;
          if (f < FRESH_BELOW) return null;
          const hi = 0.12 + 0.5 * ((f - FRESH_BELOW) / (100 - FRESH_BELOW));
          const pulse = f >= FATIGUED_FROM && !reduce;
          return (
            <motion.g
              key={id}
              initial={{ opacity: 0 }}
              animate={{ opacity: pulse ? [hi * 0.55, hi, hi * 0.55] : hi }}
              transition={pulse ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
            >
              <Mirrored paths={paths} />
            </motion.g>
          );
        })}
      </g>

      {regions.map(([id, paths]) => {
        const m = muscles[id];
        const on = selected === id;
        return (
          <motion.g
            key={id}
            role="button"
            tabIndex={0}
            aria-label={`${m.label}, fadiga ${m.fatigue}%`}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(id);
              }
            }}
            whileTap={{ scale: 0.93 }}
            animate={{ scale: on ? 1.03 : 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 32 }}
            className="cursor-pointer outline-none focus-visible:[&>path]:stroke-white"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', fill: heatColor(m.fatigue) }}
            stroke={on ? 'var(--color-primary)' : 'var(--color-app)'}
            strokeWidth={on ? 1.2 : 0.8}
          >
            <Mirrored paths={paths} />
          </motion.g>
        );
      })}
    </svg>
  );
}

/**
 * Mapa de Recuperação Muscular: heatmap frente/costas da fadiga das últimas 72 h.
 * Tocar num músculo abre o plano de recuperação (ou de prevenção, se estiver fresco).
 */
export default function MuscleRecoveryMap() {
  const state = useMuscleRecovery();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(null);

  const ranked = useMemo(
    () => Object.values(state.muscles).filter((m) => m.fatigue >= FRESH_BELOW).sort((a, b) => b.fatigue - a.fatigue),
    [state.muscles]
  );

  const open = (id) => {
    triggerHaptic(12);
    setSelected(id);
  };

  return (
    <section aria-labelledby="recovery-title" className="rounded-3xl bg-app border border-white/[0.08] overflow-hidden">
      <header className="flex items-end justify-between gap-4 px-5 pt-5">
        <div className="min-w-0">
          <h3 id="recovery-title" className="font-heading text-section font-semibold text-white">Recuperação muscular</h3>
          <p className="text-[13px] text-zinc-400">
            {ranked.length ? `${ranked.length} ${ranked.length === 1 ? 'grupo' : 'grupos'} a recuperar` : 'Todos os grupos frescos'}
          </p>
        </div>
        <p className="text-right shrink-0">
          <span className="font-display font-semibold text-[36px] leading-none tracking-[-0.03em] text-white tabular-nums">
            {state.readiness}
            <span className="text-[16px] font-medium text-zinc-400 ml-0.5">%</span>
          </span>
          <span className="block text-[12px] text-zinc-400">prontidão</span>
        </p>
      </header>

      <div className="relative grid grid-cols-2 gap-3 px-6 pt-5">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,var(--color-surface-2),transparent_70%)]" />
        {['front', 'back'].map((view) => (
          <figure key={view} className="relative">
            <BodyFigure view={view} muscles={state.muscles} selected={selected} onSelect={open} reduce={reduce} />
            <figcaption className="mt-1 text-center text-[12px] text-zinc-500">{view === 'front' ? 'Frente' : 'Costas'}</figcaption>
          </figure>
        ))}
      </div>

      <div className="flex items-center gap-2.5 px-5 pt-4 text-[12px] text-zinc-400" aria-hidden>
        <span>Fresco</span>
        <span className="flex-1 h-1.5 rounded-full" style={{ background: HEAT_GRADIENT }} />
        <span>Fadigado</span>
      </div>

      <div className="px-3 pt-3 pb-3">
        {ranked.length ? (
          <ul className="divide-y divide-white/[0.06]">
            {ranked.slice(0, 4).map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => open(m.id)} className="w-full min-h-[52px] flex items-center gap-3 px-2 text-left cursor-pointer rounded-xl active:bg-white/[0.03]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: heatColor(m.fatigue) }} aria-hidden />
                  <span className="flex-1 min-w-0 text-body font-medium text-white truncate">{m.label}</span>
                  <span className="text-[13px] text-zinc-400 tabular-nums">{m.hoursToRecovered > 0 ? `fresco em ${m.hoursToRecovered} h` : 'quase fresco'}</span>
                  <span className="w-10 text-right text-body font-semibold text-white tabular-nums">{m.fatigue}%</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-2 pb-2 text-[13px] text-zinc-400 leading-relaxed">Toca num músculo para ver exercícios de mobilidade e prevenção de lesões.</p>
        )}
      </div>

      <AnimatePresence>
        {selected && <RecoverySheet key={selected} muscle={state.muscles[selected]} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
