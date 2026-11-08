import React from 'react';
import { Dumbbell, ListPlus, Footprints, Trophy, Users } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';

export default function Navigation({ activeTab, onTabChange }) {
  const { isAdmin } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Treino', icon: Dumbbell },
    { id: 'custom-workouts', label: 'Criar Treino', icon: ListPlus },
    { id: 'running', label: 'Corrida', icon: Footprints },
    { id: 'history', label: 'Histórico', icon: Trophy },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Users }] : []),
  ];

  return (
    <nav 
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-surface/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/10 transition-colors pb-[max(env(safe-area-inset-bottom,0px),8px)]"
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                triggerHaptic(10);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 sm:px-3 rounded-lg transition-all active:scale-95 cursor-pointer min-h-[48px] select-none ${
                isActive 
                  ? 'text-zinc-950 dark:text-zinc-50 font-semibold' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-normal'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${
                isActive 
                  ? 'text-zinc-950 dark:text-accent' 
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
              <span className={`text-[11px] leading-tight tracking-tight mt-0.5 ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-zinc-950 dark:bg-accent mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
