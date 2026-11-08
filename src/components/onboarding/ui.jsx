import React from 'react';
import { motion } from 'motion/react';
import {
  Mars, Venus, CircleDashed, Dumbbell, Flame, Weight, HeartPulse, Sprout, TrendingUp, Trophy,
  Building2, House, PersonStanding, Sparkles, Layers, ArrowUpDown, Crown, Activity, Check, Minus, Plus
} from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

const ICONS = { Mars, Venus, CircleDashed, Dumbbell, Flame, Weight, HeartPulse, Sprout, TrendingUp, Trophy, Building2, House, PersonStanding, Sparkles, Layers, ArrowUpDown, Crown, Activity };

export function FieldLabel({ children, aside }) {
  return (
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{children}</span>
      {aside && <span className="text-[11px] text-zinc-500">{aside}</span>}
    </div>
  );
}

/** Cartão tátil de seleção (≥ 56px), com ícone, título e dica. */
export function SelectCard({ option, selected, onSelect, multi = false, badge }) {
  const Icon = ICONS[option.icon];
  return (
    <motion.button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        triggerHaptic(10);
        onSelect(option.id);
      }}
      className={`relative w-full min-h-[56px] flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-colors cursor-pointer select-none ${
        selected
          ? 'bg-accent/[0.08] border-accent/60 shadow-[0_0_0_1px_rgba(0,240,255,0.25),0_0_24px_-8px_rgba(0,240,255,0.5)]'
          : 'bg-surface/80 backdrop-blur-md border-white/10 hover:border-white/20'
      }`}
    >
      {Icon && (
        <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${selected ? 'bg-accent text-app border-accent' : 'bg-surface-2 text-zinc-300 border-white/10'}`}>
          <Icon className="w-5 h-5 stroke-[1.9]" />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className={`block text-sm font-semibold ${selected ? 'text-white' : 'text-zinc-100'}`}>{option.label}</span>
        {option.hint && <span className="block text-xs text-zinc-400 mt-0.5">{option.hint}</span>}
      </span>
      {badge && <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/30 rounded-md px-1.5 py-0.5">{badge}</span>}
      {selected && !badge && <Check className="w-4 h-4 text-accent shrink-0 stroke-[3]" />}
    </motion.button>
  );
}

/** Grupo de chips compactos (≥ 48px). `value` pode ser escalar ou array (multi). */
export function ChipGroup({ options, value, onToggle, label, columns = 4 }) {
  const isOn = (id) => (Array.isArray(value) ? value.includes(id) : value === id);
  return (
    <div role="group" aria-label={label} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <motion.button
          key={o.id}
          type="button"
          aria-pressed={isOn(o.id)}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerHaptic(10);
            onToggle(o.id);
          }}
          className={`min-h-[48px] px-2 rounded-xl border text-sm font-semibold tabular-nums transition-colors cursor-pointer select-none ${
            isOn(o.id) ? 'bg-accent/15 text-accent border-accent/50' : 'bg-surface/80 text-zinc-300 border-white/10 hover:border-white/20'
          }`}
        >
          {o.label}
        </motion.button>
      ))}
    </div>
  );
}

/** Slider com valor grande e passos ± de 48px para ajuste fino com o polegar. */
export function RangeField({ label, value, min, max, step = 1, unit, onChange }) {
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const bump = (d) => {
    triggerHaptic(8);
    onChange(clamp(value + d));
  };
  const pct = ((value - min) / (max - min)) * 100;
  const shown = step < 1 ? value.toLocaleString('pt-PT', { minimumFractionDigits: 1 }) : value;

  return (
    <div className="p-4 rounded-2xl bg-surface/80 backdrop-blur-md border border-white/10">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => bump(-step)} aria-label={`Diminuir ${label}`} className="w-12 h-12 shrink-0 rounded-xl bg-surface-2 border border-white/10 text-zinc-200 flex items-center justify-center active:scale-95 cursor-pointer">
          <Minus className="w-5 h-5" />
        </button>
        <output className="flex-1 text-center font-display font-bold text-5xl leading-none tabular-nums text-white" aria-live="polite">
          {shown}
          <span className="text-base font-sans font-semibold text-zinc-400 ml-1">{unit}</span>
        </output>
        <button type="button" onClick={() => bump(step)} aria-label={`Aumentar ${label}`} className="w-12 h-12 shrink-0 rounded-xl bg-surface-2 border border-white/10 text-zinc-200 flex items-center justify-center active:scale-95 cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        aria-label={label}
        className="ob-range w-full mt-4 h-2 rounded-full appearance-none cursor-pointer touch-pan-y"
        style={{ background: `linear-gradient(to right, #00f0ff ${pct}%, rgba(255,255,255,0.1) ${pct}%)`, accentColor: '#00f0ff' }}
      />
    </div>
  );
}
