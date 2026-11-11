import React, { useRef } from 'react';
import { motion } from 'motion/react';
import {
  Mars, Venus, CircleDashed, Dumbbell, Flame, Weight, HeartPulse, Sprout, TrendingUp, Trophy,
  Building2, House, PersonStanding, Check
} from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

const ICONS = { Mars, Venus, CircleDashed, Dumbbell, Flame, Weight, HeartPulse, Sprout, TrendingUp, Trophy, Building2, House, PersonStanding };
const SPRING = { type: 'spring', stiffness: 300, damping: 28 };

export const MicroLabel = ({ children, className = '' }) => (
  <span className={`block text-micro uppercase tracking-wider text-zinc-400 font-medium ${className}`}>{children}</span>
);

/** Barras de carga 1–4 (intensidade do objetivo ou do nível). */
export function IntensityBars({ level, active }) {
  return (
    <span className="flex items-end gap-[3px] h-4" aria-label={`Intensidade ${level} de 4`}>
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-[4px] rounded-[1px] transition-colors ${i <= level ? (active ? 'bg-white' : 'bg-zinc-600') : 'bg-white/[0.08]'}`}
          style={{ height: `${4 + i * 3}px` }}
        />
      ))}
    </span>
  );
}

/** Cartão tátil em marinho elevado: ícone 36×36, título, dica, barras de intensidade opcionais. */
export function OptionCard({ option, selected, onSelect, meta }) {
  const Icon = ICONS[option.icon];
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      onClick={() => {
        triggerHaptic(10);
        onSelect(option.id);
      }}
      className={`w-full min-h-[72px] flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border text-left transition-colors cursor-pointer select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${
        selected ? 'bg-surface-3 border-accent-hover' : 'bg-surface-2 border-white/[0.07] hover:border-white/[0.14]'
      }`}
    >
      {Icon && (
        <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border ${selected ? 'bg-accent/70 border-accent-hover text-white' : 'bg-white/[0.04] border-white/[0.06] text-zinc-300'}`}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block font-heading text-section font-semibold text-zinc-100">{option.label}</span>
        {option.hint && <span className="block text-[13px] leading-snug text-zinc-400 mt-0.5">{option.hint}</span>}
        {meta && <span className="block text-micro uppercase tracking-wider text-zinc-500 mt-1 tabular-nums">{meta}</span>}
      </span>
      {option.intensity ? <IntensityBars level={option.intensity} active={selected} /> : selected && <Check className="w-4 h-4 text-white" strokeWidth={2.5} />}
    </motion.button>
  );
}

/** Segmentado compacto (≥ 48 px), p.ex. kg/lbs ou 45/60/75 min. */
export function Segmented({ options, value, onChange, label, size = 'md' }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex p-1 gap-1 rounded-2xl bg-surface-2 border border-white/[0.07]">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={String(o.id)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              triggerHaptic(8);
              onChange(o.id);
            }}
            className={`relative flex-1 rounded-xl font-semibold tabular-nums cursor-pointer select-none transition-colors ${size === 'lg' ? 'min-h-[56px] text-body' : 'min-h-[40px] text-[13px]'} ${on ? 'text-app' : 'text-zinc-300 hover:text-zinc-100'}`}
          >
            {on && <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-xl bg-primary" transition={SPRING} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Seletor de precisão: número grande, ajustes −5/−1/+1/+5 e régua horizontal arrastável.
 * Trabalha sempre na unidade de exibição; a conversão para kg/cm fica no passo.
 */
export function PrecisionPicker({ value, min, max, step = 1, unit, onChange, label, decimals = 0, format }) {
  const dragRef = useRef(null);
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const set = (v) => {
    const next = clamp(v);
    if (next !== value) {
      // Tique leve a cada passo, mais firme nas marcas maiores da régua
      triggerHaptic(Math.round(next / step) % 5 === 0 ? 12 : 5);
      onChange(next);
    }
  };
  const PX_PER_STEP = 12;
  const ticks = [];
  for (let d = -14; d <= 14; d += 1) ticks.push(d);

  const onPointerDown = (e) => {
    dragRef.current = { x: e.clientX, v: value };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    const delta = Math.round((dragRef.current.x - e.clientX) / PX_PER_STEP);
    set(dragRef.current.v + delta * step);
  };
  const end = () => {
    dragRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center" aria-live="polite">
        <motion.span
          key={value}
          initial={{ opacity: 0.5, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block font-display font-bold text-[64px] leading-none tracking-tight tabular-nums text-zinc-50"
        >
          {format ? format(value) : value.toFixed(decimals).replace('.', ',')}
        </motion.span>
        <span className="ml-2 font-heading text-section font-semibold text-zinc-400">{unit}</span>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${format ? format(value) : value} ${unit}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(value + step);
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(value - step);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        className="relative h-16 rounded-2xl bg-surface-2 border border-white/[0.07] overflow-hidden touch-none cursor-ew-resize select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        <div className="absolute inset-0 flex items-end justify-center">
          {ticks.map((d) => {
            const v = value + d * step;
            if (v < min || v > max) return <span key={d} style={{ width: PX_PER_STEP }} />;
            const major = Math.round(v / step) % 5 === 0;
            return (
              <span key={d} className="flex flex-col items-center justify-end h-full pb-3" style={{ width: PX_PER_STEP }}>
                <span className={`w-px ${major ? 'h-6 bg-zinc-400' : 'h-3 bg-zinc-600'}`} />
              </span>
            );
          })}
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-[2px] rounded-full bg-white" aria-hidden />
        <span className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-surface-2 to-transparent pointer-events-none" />
        <span className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-surface-2 to-transparent pointer-events-none" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[-5, -1, 1, 5].map((d) => (
          <motion.button
            key={d}
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.12 }}
            onClick={() => set(value + d)}
            aria-label={`${d > 0 ? 'Mais' : 'Menos'} ${Math.abs(d)} ${unit}`}
            className="min-h-[52px] rounded-2xl bg-surface-2 border border-white/[0.07] text-body font-semibold tabular-nums text-zinc-200 hover:border-white/[0.14] cursor-pointer select-none"
          >
            {d > 0 ? `+${d}` : `−${Math.abs(d)}`}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Chip de seleção múltipla (≥ 48 px). */
export function Chip({ label, selected, onToggle }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        triggerHaptic(8);
        onToggle();
      }}
      className={`min-h-[48px] px-4 rounded-2xl border text-[14px] font-semibold text-left flex items-center justify-between gap-2 cursor-pointer select-none transition-colors ${
        selected ? 'bg-accent/70 text-white border-accent-hover' : 'bg-surface-2 text-zinc-200 border-white/[0.07] hover:border-white/[0.14]'
      }`}
    >
      {label}
      {selected && <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />}
    </motion.button>
  );
}
