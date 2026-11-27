import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import useMuscleRecovery from '../hooks/useMuscleRecovery';
import { FATIGUED_FROM, FRESH_BELOW } from '../utils/muscleFatigue';
import { BODY } from './recovery/bodyPaths';
import { HEAT_GRADIENT, STATUS_LABEL, heatColor, statusTextColor } from './recovery/heat';
import RecoverySheet from './recovery/RecoverySheet';
import { triggerHaptic } from '../utils/audio';

const MIRROR = 'matrix(-1 0 0 1 120 0)';

const VIEW_MODES = [
  { id: 'both', label: 'Ambos' },
  { id: 'front', label: 'Frente' },
  { id: 'back', label: 'Costas' }
];

function Mirrored({ paths }) {
  return (
    <>
      {paths.map((d, i) => <path key={`l${i}`} d={d} />)}
      <g transform={MIRROR}>{paths.map((d, i) => <path key={`r${i}`} d={d} />)}</g>
    </>
  );
}

/** Silhueta anatómica detalhada com degradê de pronto (verde) a crítico (vermelho) e pulsação por estado. */
function BodyFigure({ view, muscles, highlighted, onHover, onSelect, reduce }) {
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
    <svg
      viewBox="0 0 120 270"
      className="w-full h-auto overflow-visible select-none"
      role="group"
      aria-label={view === 'front' ? 'Corpo, vista de frente' : 'Corpo, vista de costas'}
    >
      <defs>
        <filter id={`heat-glow-${view}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4.2" />
        </filter>
        <linearGradient id={`muscle-sheen-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </linearGradient>
      </defs>

      {/* Eixo anatómico neutro */}
      <g fill="var(--color-surface-3)" stroke="var(--color-app)" strokeWidth="0.8">
        {axis.map((p, i) => <path key={i} d={p.d} />)}
        <Mirrored paths={neutral} />
      </g>

      {/* Linha axial sutil de precisão biomecânica */}
      <line
        x1="60"
        y1="30"
        x2="60"
        y2="122"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="0.6"
        strokeDasharray="1.5 2.5"
        aria-hidden="true"
      />

      {/* Halo térmico: respiração âmbar em recuperação e pulsação vermelha em estado crítico */}
      <g filter={`url(#heat-glow-${view})`} aria-hidden="true">
        {regions.map(([id, paths]) => {
          const f = muscles[id]?.fatigue || 0;
          if (f < FRESH_BELOW) return null;
          const isCritical = f >= FATIGUED_FROM;
          const haloFill = isCritical ? 'var(--color-heat-3)' : 'var(--color-heat-2)';
          const baseOpacity = isCritical ? 0.56 : 0.24;
          const animateOpacity = reduce
            ? baseOpacity
            : isCritical
              ? [0.28, 0.72, 0.28]
              : [0.14, 0.32, 0.14];

          return (
            <motion.g
              key={id}
              fill={haloFill}
              initial={{ opacity: 0 }}
              animate={{ opacity: animateOpacity }}
              transition={
                reduce
                  ? { duration: 0.3 }
                  : {
                      duration: isCritical ? 2.1 : 3.4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
              }
            >
              <Mirrored paths={paths} />
            </motion.g>
          );
        })}
      </g>

      {/* Grupos musculares interativos */}
      {regions.map(([id, paths], idx) => {
        const m = muscles[id];
        const on = highlighted === id;
        return (
          <motion.g
            key={id}
            onMouseEnter={() => onHover?.(id)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onSelect(id)}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: on ? 1.035 : 1 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={{
              opacity: { duration: 0.35, delay: Math.min(idx * 0.025, 0.25), ease: [0.22, 1, 0.36, 1] },
              scale: { type: 'spring', stiffness: 520, damping: 32 }
            }}
            className="cursor-pointer"
            style={{ transformBox: 'fill-box', transformOrigin: 'center', fill: heatColor(m.fatigue) }}
            stroke={on ? 'var(--color-primary)' : 'var(--color-app)'}
            strokeWidth={on ? 1.3 : 0.8}
          >
            <g
              role="button"
              tabIndex={0}
              aria-label={`${m.label}, fadiga ${m.fatigue}% (${STATUS_LABEL[m.status] || ''})`}
              onFocus={() => onHover?.(id)}
              onBlur={() => onHover?.(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
              className="outline-none focus-visible:[&>path]:stroke-white"
            >
              {paths.map((d, i) => <path key={`l${i}`} d={d} />)}
            </g>
            <g transform={MIRROR} aria-hidden="true">
              {paths.map((d, i) => <path key={`r${i}`} d={d} />)}
            </g>
            <g style={{ fill: `url(#muscle-sheen-${view})`, pointerEvents: 'none' }} aria-hidden="true">
              <Mirrored paths={paths} />
            </g>
          </motion.g>
        );
      })}
    </svg>
  );
}

/**
 * Mapa de Recuperação Muscular aberto no canvas preto:
 * degradê de Verde (Pronto) -> Âmbar (Em recuperação) -> Vermelho (Crítico), sem caixas fechadas.
 */
export default function MuscleRecoveryMap() {
  const state = useMuscleRecovery();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [viewMode, setViewMode] = useState('both');

  const ranked = useMemo(
    () =>
      Object.values(state.muscles)
        .filter((m) => m.fatigue >= FRESH_BELOW)
        .sort((a, b) => b.fatigue - a.fatigue),
    [state.muscles]
  );

  const open = (id) => {
    triggerHaptic(12);
    setSelected(id);
  };

  const activeId = hovered || selected;
  const activeMuscle = activeId ? state.muscles[activeId] : null;
  const visibleViews = viewMode === 'both' ? ['front', 'back'] : [viewMode];

  return (
    <section aria-labelledby="recovery-title" className="pt-2 space-y-4">
      <header className="flex items-end justify-between gap-4 px-1">
        <div className="min-w-0 space-y-2">
          <div>
            <h3 id="recovery-title" className="font-heading text-section font-semibold text-white">
              Recuperação muscular
            </h3>
            <p className="text-[13px] text-zinc-400">
              {ranked.length
                ? `${ranked.length} ${ranked.length === 1 ? 'grupo em recuperação' : 'grupos em recuperação'}`
                : 'Todos os grupos prontos a treinar'}
            </p>
          </div>

          <div className="inline-flex items-center gap-1" role="group" aria-label="Vista do mapa muscular">
            {VIEW_MODES.map((mode) => {
              const active = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    setViewMode(mode.id);
                  }}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-accent text-white border-accent-hover'
                      : 'bg-transparent text-zinc-400 border-white/[0.08] hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-right shrink-0">
          <span className="font-display font-semibold text-[36px] leading-none tracking-[-0.03em] text-white tabular-nums">
            {state.readiness}
            <span className="text-[16px] font-medium text-zinc-400 ml-0.5">%</span>
          </span>
          <span className="block text-[12px] text-zinc-400">prontidão</span>
        </p>
      </header>

      <div
        className={`relative grid gap-3 px-4 pt-2 ${
          visibleViews.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-[230px] mx-auto'
        }`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,var(--color-surface-2),transparent_70%)]"
        />
        {visibleViews.map((view) => (
          <figure key={view} className="relative">
            <BodyFigure
              view={view}
              muscles={state.muscles}
              highlighted={activeId}
              onHover={setHovered}
              onSelect={open}
              reduce={reduce}
            />
            <figcaption className="mt-1 text-center text-[12px] text-zinc-500">
              {view === 'front' ? 'Frente' : 'Costas'}
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Telemetria ao vivo do músculo focado */}
      <div className="flex items-center justify-between gap-3 px-2 py-2.5 border-y border-white/[0.06] text-xs min-h-[42px]">
        {activeMuscle ? (
          <>
            <span className="font-semibold text-white truncate">{activeMuscle.label}</span>
            <span className="flex items-center gap-2 shrink-0 tabular-nums">
              <span className={`font-semibold ${statusTextColor(activeMuscle.status)}`}>
                {STATUS_LABEL[activeMuscle.status]}
              </span>
              <span className="font-display font-semibold text-white">{activeMuscle.fatigue}%</span>
            </span>
          </>
        ) : (
          <span className="text-zinc-400">
            Toca num músculo para ver fadiga, mobilidade e plano de recuperação.
          </span>
        )}
      </div>

      {/* Legenda térmica de 3 estados */}
      <div className="space-y-1.5 px-1" aria-hidden="true">
        <div className="h-1.5 rounded-full" style={{ background: HEAT_GRADIENT }} />
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-emerald-400">Pronto a treinar</span>
          <span className="text-amber-400">Em recuperação</span>
          <span className="text-red-400">Crítico</span>
        </div>
      </div>

      {ranked.length > 0 && (
        <ul className="divide-y divide-white/[0.06]">
          {ranked.slice(0, 4).map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => open(m.id)}
                className="w-full min-h-[52px] flex items-center gap-3 px-1 text-left cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: heatColor(m.fatigue) }}
                  aria-hidden="true"
                />
                <span className="flex-1 min-w-0 text-body font-medium text-white truncate">{m.label}</span>
                <span className={`text-[12px] font-medium shrink-0 ${statusTextColor(m.status)}`}>
                  {STATUS_LABEL[m.status]}
                </span>
                <span className="w-10 text-right text-body font-semibold text-white tabular-nums">
                  {m.fatigue}%
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {selected && <RecoverySheet key={selected} muscle={state.muscles[selected]} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}
