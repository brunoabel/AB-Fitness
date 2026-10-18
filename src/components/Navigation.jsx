import React from 'react';
import { Dumbbell, ListPlus, Footprints, Trophy, BookOpen, Users } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';

export default function Navigation({ activeTab, onTabChange }) {
  const { isAdmin } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Treino', icon: Dumbbell },
    { id: 'custom-workouts', label: 'Montar Treino', icon: ListPlus },
    { id: 'running', label: 'Corrida', icon: Footprints },
    { id: 'history', label: 'Histórico', icon: Trophy },
    { id: 'guide', label: 'Manual', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Users }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-lg border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-lg transition-colors pb-[max(env(safe-area-inset-bottom,0px),8px)]">
      <div className="max-w-md mx-auto px-2 sm:px-4 pt-2 pb-1 flex items-center justify-around">
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
              className={`flex flex-col items-center py-1 px-2 sm:px-3 rounded-2xl transition-all active:scale-95 cursor-pointer ${
                isActive 
                  ? 'text-zinc-900 dark:text-white font-bold' 
                  : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300/80 dark:border-zinc-700' 
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-sky-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

