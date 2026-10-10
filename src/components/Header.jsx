import React from 'react';
import { Dumbbell, Flame, BookOpen, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

export default function Header({ 
  completedCount = 0, 
  onOpenGuide, 
  soundEnabled = true, 
  onToggleSound,
  isDark = true,
  onToggleTheme
}) {
  return (
    <header className="w-full bg-white/85 dark:bg-slate-900/95 backdrop-blur-md border-b border-sky-100 dark:border-slate-800 sticky top-0 z-20 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-md mx-auto px-4 pt-3 pb-3 flex items-center justify-between">
        {/* Marca / Logo LA Workout */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-400/20">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-slate-800 dark:text-white tracking-tight">
                LA Workout
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-[9px] font-black uppercase tracking-wider border border-sky-200/50 dark:border-sky-800">
                Sub-17 Atleta
              </span>
            </div>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
              Performance de Clube & Shape
            </p>
          </div>
        </div>

        {/* Indicadores do Header */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Dark / Light Mode */}
          <button
            onClick={() => {
              if (onToggleTheme) onToggleTheme();
              triggerHaptic(10);
            }}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-amber-300 border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-all"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Streak de Treinos */}
          <div 
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-1.5 rounded-2xl border border-amber-200/70 dark:border-amber-800/60 text-xs font-bold"
            title={`${completedCount} treinos concluídos`}
          >
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
            <span>{completedCount}</span>
          </div>

          {/* Toggle de Som */}
          <button
            onClick={() => {
              const next = sound.toggleSound();
              if (onToggleSound) onToggleSound(next);
              triggerHaptic(10);
            }}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-all"
            title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Botão Guia do Atleta */}
          <button
            onClick={() => {
              if (onOpenGuide) onOpenGuide();
              triggerHaptic(10);
            }}
            className="p-2 rounded-2xl bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 active:scale-95 transition-all"
            title="Manual do Atleta de Futebol"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
