import React from 'react';
import { Dumbbell, Footprints, UsersRound, CircleUserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { triggerHaptic } from '../utils/audio';

export default function Navigation({ activeTab, onTabChange }) {

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
      <div className="relative flex items-stretch justify-around h-[60px] rounded-full backdrop-blur-2xl backdrop-saturate-[190%] bg-black/60 sm:bg-[#07090E]/65 border border-white/[0.14] shadow-[0_12px_36px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.22)] px-2">
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
              className="relative flex flex-1 items-center justify-center min-h-[52px] min-w-[48px] cursor-pointer select-none"
            >
              {isActive && (
                <motion.span
                  layoutId="liquid-tab-pill"
                  className="absolute inset-1 rounded-full bg-white/[0.12] border border-white/[0.16] shadow-[0_2px_10px_rgba(255,255,255,0.06)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                />
              )}
              <motion.span
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="relative z-10"
              >
                <Icon
                  className={`w-[22px] h-[22px] ${isActive ? 'text-white' : 'text-zinc-500'}`}
                  strokeWidth={1.75}
                />
              </motion.span>
              <span className="sr-only">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
