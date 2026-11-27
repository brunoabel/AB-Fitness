import React from 'react';
import { Dumbbell, Footprints, UsersRound, CircleUserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { triggerHaptic } from '../utils/audio';

export default function Navigation({ activeTab, onTabChange }) {
  const reducedMotion = useReducedMotion();

  // 4 destinos: treinar, correr, social, eu. Criar vive em Treino; Histórico e Admin no Perfil.
  const tabs = [
    { id: 'dashboard', label: 'Treino', icon: Dumbbell },
    { id: 'running', label: 'Corrida', icon: Footprints },
    { id: 'social', label: 'Amigos', icon: UsersRound },
    { id: 'profile', label: 'Perfil', icon: CircleUserRound },
  ];

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] max-w-[390px] mx-auto z-40 lg:hidden"
    >
      <div className="relative flex items-stretch justify-around h-[62px] rounded-full backdrop-blur-2xl backdrop-saturate-[190%] bg-black/80 border border-white/[0.1] px-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                onTabChange(tab.id);
                triggerHaptic(10);
              }}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 min-h-[52px] min-w-[48px] cursor-pointer select-none"
            >
              {isActive && (
                <motion.span
                  layoutId="liquid-tab-pill"
                  className="absolute inset-1 rounded-full bg-accent border border-accent-hover"
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <motion.span
                animate={{ scale: isActive && !reducedMotion ? 1.04 : 1 }}
                transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                className="relative z-10 flex flex-col items-center gap-0.5"
              >
                <Icon
                  className={`w-[20px] h-[20px] ${isActive ? 'text-white' : 'text-zinc-500'}`}
                  strokeWidth={1.75}
                />
                <span className={`text-[10px] font-medium leading-none tracking-tight ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {tab.label}
                </span>
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
