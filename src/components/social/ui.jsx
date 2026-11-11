import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import { findExerciseIn100 } from '../../data/exercises100';

export const SPRING = { type: 'spring', stiffness: 520, damping: 40 }; // assenta < 250 ms
export const TAP = { scale: 0.96 };

export const fmtInt = (n) => (n == null ? '–' : Math.round(Number(n)).toLocaleString('pt-PT'));
export const fmtKg = (n) => {
  if (n == null) return 'Privado';
  const v = Number(n);
  return v >= 10000 ? `${(v / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} t` : `${Math.round(v).toLocaleString('pt-PT')} kg`;
};
export const fmtDuration = (s) => {
  const m = Math.round((Number(s) || 0) / 60);
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`;
};
export const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `há ${Math.max(1, Math.round(diff / 60))} min`;
  if (diff < 86400) return `há ${Math.round(diff / 3600)} h`;
  const d = Math.round(diff / 86400);
  return d === 1 ? 'ontem' : `há ${d} dias`;
};
export const exerciseLabel = (code) => {
  const ex = findExerciseIn100(code);
  if (ex?.name) return ex.name;
  return String(code || '').replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

export function Avatar({ url, name, size = 44, className = '' }) {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-3 border border-white/[0.08] text-white font-heading font-semibold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {url ? <img src={url} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" /> : initials}
    </span>
  );
}

export function SectionTitle({ icon: Icon, children, aside }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 font-heading text-section font-semibold text-white">
        {Icon && (
          <span className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-300">
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </span>
        )}
        {children}
      </h2>
      {aside}
    </div>
  );
}

/** Switch tátil: o botão desliza com transform; trilho muda de cor (sem layout shift). */
export function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        triggerHaptic(8);
        onChange(!checked);
      }}
      className={`relative w-[50px] h-[30px] shrink-0 rounded-full border transition-colors duration-150 cursor-pointer ${checked ? 'bg-accent border-accent-hover' : 'bg-surface-3 border-white/[0.08]'}`}
    >
      <motion.span
        className="absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white"
        animate={{ x: checked ? 20 : 0 }}
        transition={SPRING}
      />
    </button>
  );
}

/** Folha inferior (thumb zone). Fecha com toque fora, botão ou Escape. Usar dentro de <AnimatePresence>. */
export function Sheet({ onClose, title, children, footer, label }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label || title}>
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md max-h-[92dvh] flex flex-col rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 will-change-transform"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 420, damping: 40 }}
      >
        <div className="shrink-0 flex items-center justify-between px-5 pt-3 pb-2">
          <span className="absolute left-1/2 top-2 -translate-x-1/2 w-9 h-1 rounded-full bg-white/15" aria-hidden />
          <h2 className="font-heading text-section font-semibold text-white mt-2">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-11 h-11 -mr-2.5 mt-1 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-6">{children}</div>
        {footer && <div className="shrink-0 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.06]">{footer}</div>}
      </motion.div>
    </div>
  );
}
