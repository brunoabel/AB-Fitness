import React from 'react';
import { Dumbbell, Trophy, BookOpen } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export default function Navigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', label: 'Treino', icon: Dumbbell },
    { id: 'history', label: 'Histórico', icon: Trophy },
    { id: 'guide', label: 'Manual Atleta', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-sky-100 dark:border-slate-800 shadow-lg transition-colors pb-[max(env(safe-area-inset-bottom,0px),8px)]">
      <div className="max-w-md mx-auto px-6 pt-2 pb-1 flex items-center justify-around">
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
              className={`flex flex-col items-center py-1 px-4 rounded-2xl transition-all active:scale-95 ${
                isActive 
                  ? 'text-sky-600 dark:text-sky-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800' 
                  : 'text-slate-400'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-sky-500 dark:bg-sky-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
