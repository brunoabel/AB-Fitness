import React from 'react';
import { motion } from 'motion/react';
import { CalendarDays, ListPlus } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

const MODES = [
  { id: 'plan', label: 'Plano da semana', icon: CalendarDays },
  { id: 'custom', label: 'Meus treinos', icon: ListPlus }
];

/** Alterna o separador Treino entre o plano semanal e os treinos personalizados (abas editoriais abertas). */
export default function TrainModeSwitch({ mode, onChange }) {
  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-1">
      <div
        role="tablist"
        aria-label="Modo de treino"
        className="flex items-center gap-6 border-b border-white/[0.08]"
      >
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
              className={`relative min-h-[44px] pb-3 pt-1.5 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer touch-manipulation transition-colors ${
                on ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              <span>{label}</span>
              {on && (
                <motion.span
                  layoutId="train-mode-underline"
                  className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-accent-hover"
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
