import React, { useState } from 'react';
import { 
  Flame, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import ABLogo from './ABLogo';
import { sound, triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';

export default function Header({ 
  completedCount = 0, 
  onOpenGuide, 
  onOpenCustomize,
  onOpenAdmin,
  onOpenAICoach,
  soundEnabled = true, 
  onToggleSound,
  isDark = true,
  onToggleTheme
}) {
  const { user, signOut, isConfigured, isAdmin } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta';

  return (
    <header className="w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-20 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-md mx-auto px-4 pt-3 pb-3 flex items-center justify-between">
        
        {/* Marca / Logo AB Fitness */}
        <div className="flex items-center gap-2.5">
          <ABLogo size={42} showText={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                AB <span className="text-zinc-500 dark:text-zinc-400 font-semibold">FITNESS</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[130px] leading-tight mt-0.5">
              {userName}
            </p>
          </div>
        </div>

        {/* Indicadores & Ações do Header */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Dark / Light Mode */}
          <button
            onClick={() => {
              if (onToggleTheme) onToggleTheme();
              triggerHaptic(10);
            }}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 active:scale-95 transition-all cursor-pointer"
            title={isDark ? 'Modo Claro' : 'Modo Escuro'}
            aria-label="Alternar tema"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Botão AB Coach (IA) */}
          <button
            onClick={() => {
              if (onOpenAICoach) onOpenAICoach();
              triggerHaptic(15);
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500/15 via-cyan-500/10 to-indigo-500/15 hover:from-sky-500/25 hover:to-indigo-500/25 text-sky-500 dark:text-sky-300 border border-sky-500/40 px-2.5 py-1.5 rounded-xl text-xs font-extrabold active:scale-95 transition-all cursor-pointer group shadow-xs"
            title="Abrir AB Coach (IA Especialista em Biomecânica)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400 group-hover:rotate-12 transition-transform animate-pulse" />
            <span className="text-[11px] font-extrabold tracking-tight">Coach</span>
          </button>

          {/* Streak de Treinos */}
          <div 
            className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-2.5 py-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold"
            title={`${completedCount} treinos concluídos`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{completedCount}</span>
          </div>

          {/* Toggle de Som */}
          <button
            onClick={() => {
              const next = sound.toggleSound();
              if (onToggleSound) onToggleSound(next);
              triggerHaptic(10);
            }}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 active:scale-95 transition-all cursor-pointer"
            title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Botão Admin para o Treinador Bruno Abel */}
          {isAdmin && (
            <button
              onClick={() => {
                if (onOpenAdmin) onOpenAdmin();
                triggerHaptic(15);
              }}
              className="flex items-center gap-1.5 bg-black text-white dark:bg-white dark:text-black px-2.5 py-1.5 rounded-xl text-xs font-black shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              title="Abrir Painel do Treinador (Admin)"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Admin</span>
            </button>
          )}

          {/* Menu Perfil / Usuário */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                triggerHaptic(10);
              }}
              className="p-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white hover:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-800 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer"
              title="Perfil e Configurações"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Dropdown de Perfil & Configurações */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121215] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 z-50 animate-fadeIn text-xs">
                <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="block font-bold text-zinc-900 dark:text-white truncate">
                      {userName}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full bg-black text-white dark:bg-white dark:text-black text-[8px] font-extrabold uppercase">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {user?.email || 'Modo Convidado'}
                  </span>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isConfigured ? 'Supabase Sincronizado' : 'Armazenamento Seguro'}</span>
                  </div>
                </div>

                <div className="py-1">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (onOpenAdmin) onOpenAdmin();
                        triggerHaptic(15);
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold flex items-center gap-2 mb-1 cursor-pointer transition-colors"
                    >
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>Painel do Treinador (Admin)</span>
                    </button>
                  )}

                  {onOpenCustomize && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenCustomize();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Personalizar Meu Treino</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (onOpenGuide) onOpenGuide();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Manual de Performance</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 mt-1 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair da Conta</span>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                    Desenvolvido por Bruno Abel
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

