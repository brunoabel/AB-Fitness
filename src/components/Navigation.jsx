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
      className="fixed bottom-0 left-0 right-0 z-30 bg-app/75 backdrop-blur-xl backdrop-saturate-150 border-t border-white/[0.07] pb-[max(env(safe-area-inset-bottom,0px),8px)] lg:hidden"
    >
      <div className="max-w-5xl mx-auto px-2 sm:px-6 flex items-stretch justify-around h-16">
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
              className={`relative flex flex-col items-center justify-center flex-1 px-1 min-h-[48px] cursor-pointer select-none transition-colors active:scale-[0.98] ${
                isActive ? 'text-zinc-50' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute top-0 h-[2px] w-8 rounded-full bg-white"
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
              <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-white' : ''}`} strokeWidth={1.75} />
              <span className={`text-micro leading-tight mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
