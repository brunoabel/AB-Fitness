import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, ListPlus } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

const MODES = [
  { id: 'plan', label: 'Plano da semana', icon: CalendarDays },
  { id: 'custom', label: 'Meus treinos', icon: ListPlus }
];

/** Alterna o separador Treino entre o plano semanal e os treinos personalizados (antigo separador Criar). */
export default function TrainModeSwitch({ mode, onChange }) {
  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6">
      <div role="tablist" aria-label="Modo de treino" className="flex p-1 gap-1 rounded-2xl bg-surface-2 border border-white/[0.08]">
        {MODES.map(({ id, label, icon: Icon }) => {
          const on = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                if (on) return;
                triggerHaptic(10);
                onChange(id);
                window.scrollTo({ top: 0 });
              }}
              className={`relative flex-1 min-h-[42px] rounded-xl text-[14px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${on ? 'text-app' : 'text-zinc-400 hover:text-white'}`}
            >
              {on && <motion.span layoutId="train-mode-pill" className="absolute inset-0 rounded-xl bg-primary" transition={{ type: 'spring', stiffness: 520, damping: 40 }} />}
              <Icon className="relative w-4 h-4" strokeWidth={1.75} />
              <span className="relative">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
