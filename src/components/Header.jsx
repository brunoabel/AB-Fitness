import React, { useState, useEffect } from 'react';
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
  Bot, 
  Users,
  Menu,
  X,
  Target,
  Sparkles,
  ChevronRight
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta';

  // Fechar menu com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleAction = (callback) => {
    setIsMenuOpen(false);
    if (callback) callback();
    triggerHaptic(12);
  };

  return (
    <>
      <header className="w-full bg-white/95 dark:bg-[#141618]/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 transition-colors pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Marca / Identidade AB Fitness */}
          <div className="flex items-center gap-3">
            <ABLogo size={38} showText={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-zinc-50 uppercase leading-none">
                  AB <span className="text-zinc-500 dark:text-zinc-400 font-medium">FITNESS</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal truncate max-w-[140px] sm:max-w-[180px] leading-tight mt-0.5">
                {userName}
              </p>
            </div>
          </div>

          {/* Topo Direito Limpo: Contador Compacto + Botão Hambúrguer */}
          <div className="flex items-center gap-2.5">
            {/* Contador de Treinos Concluídos (Badge Compacto e Discreto) */}
            <div 
              className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-200 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold tabular-nums select-none"
              title={`${completedCount} treinos concluídos`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-[1.8]" />
              <span className="tabular-numbers">{completedCount}</span>
            </div>

            {/* Botão Hambúrguer Principal */}
            <button
              onClick={() => {
                setIsMenuOpen((prev) => !prev);
                triggerHaptic(12);
              }}
              className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs select-none"
              title="Menu Principal"
              aria-label="Abrir menu de opções"
              aria-expanded={isMenuOpen}
            >
              <Menu className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer / Menu Hambúrguer Lateral Deslizante */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fundo Escuro com Backdrop Blur */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 cursor-pointer animate-fadeIn"
            aria-hidden="true"
          />

          {/* Painel do Menu Lateral */}
          <aside 
            role="dialog"
            aria-label="Menu principal de configurações e recursos"
            className="relative z-10 w-full max-w-sm h-full bg-white dark:bg-[#111114] text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slideInRight"
          >
            {/* Topo do Drawer: Identificação & Fechar */}
            <div>
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ABLogo size={32} showText={false} />
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
                      AB Fitness
                    </h2>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Painel & Ajustes
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    triggerHaptic(10);
                  }}
                  className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  title="Fechar Menu"
                  aria-label="Fechar Menu"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Cartão de Identificação do Atleta */}
              <div className="p-4 mx-4 mt-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
                      <User className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="font-bold text-xs text-zinc-950 dark:text-zinc-50 truncate">
                      {userName}
                    </span>
                  </div>

                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-[#c6f432] text-zinc-950 text-[9px] font-black uppercase tracking-wider shrink-0">
                      ADMIN
                    </span>
                  )}
                </div>

                <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 truncate pl-9">
                  {user?.email || 'Atleta Convidado'}
                </span>

                <div className="mt-2.5 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isConfigured ? 'Sincronizado na Nuvem' : 'Armazenamento Local Seguro'}</span>
                </div>
              </div>

              {/* Seção Principal: Atalhos & Ações */}
              <div className="p-4 space-y-2">
                
                {/* 1. AB COACH IA (Destaque Especial) */}
                <button
                  onClick={() => handleAction(onOpenAICoach)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 text-white dark:from-[#17171c] dark:to-[#1e1e24] border border-[#c6f432]/30 hover:border-[#c6f432]/60 shadow-md flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#c6f432] text-zinc-950 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">
                          AB Coach IA
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-[#c6f432]/20 text-[#c6f432] border border-[#c6f432]/30">
                          IA
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5 font-normal">
                        Assistente Biomecânico de Treinos
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </button>

                {/* 2. PAINEL DE GESTÃO ADMIN (Se Administrador) */}
                {isAdmin && (
                  <button
                    onClick={() => handleAction(onOpenAdmin)}
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-zinc-950 dark:text-zinc-50 block">
                          Painel de Gestão (Admin)
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          Gerir atletas, treinos e permissões
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  </button>
                )}

                {/* 3. ALTERNADOR DE MODO ESCURO / MODO NOTURNO */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                      {isDark ? (
                        <Moon className="w-4 h-4 text-amber-400 stroke-[2]" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500 stroke-[2]" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-zinc-950 dark:text-zinc-50 block">
                        Modo Noturno
                      </span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {isDark ? 'Tema Escuro Ativado' : 'Tema Claro Ativado'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onToggleTheme) onToggleTheme();
                      triggerHaptic(10);
                    }}
                    className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer select-none p-0.5 ${
                      isDark ? 'bg-[#c6f432]' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                    aria-label="Alternar Modo Noturno"
                  >
                    <div 
                      className={`w-5.5 h-5.5 rounded-full bg-zinc-950 dark:bg-zinc-900 shadow-md transform transition-transform flex items-center justify-center ${
                        isDark ? 'translate-x-5.5' : 'translate-x-0 bg-white'
                      }`}
                    >
                      {isDark ? (
                        <Moon className="w-3 h-3 text-[#c6f432] stroke-[2]" />
                      ) : (
                        <Sun className="w-3 h-3 text-amber-500 stroke-[2]" />
                      )}
                    </div>
                  </button>
                </div>

                {/* 4. CONTROLO DE EFEITOS SONOROS */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-zinc-800 dark:text-zinc-200 stroke-[2]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-zinc-400 stroke-[2]" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-zinc-950 dark:text-zinc-50 block">
                        Sons & Avisos
                      </span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {soundEnabled ? 'Sons de timer ativos' : 'Silenciado'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const next = sound.toggleSound();
                      if (onToggleSound) onToggleSound(next);
                      triggerHaptic(10);
                    }}
                    className={`relative w-12 h-6.5 rounded-full transition-colors cursor-pointer select-none p-0.5 ${
                      soundEnabled ? 'bg-[#c6f432]' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                    aria-label="Alternar Efeitos Sonoros"
                  >
                    <div 
                      className={`w-5.5 h-5.5 rounded-full bg-zinc-950 dark:bg-zinc-900 shadow-md transform transition-transform flex items-center justify-center ${
                        soundEnabled ? 'translate-x-5.5' : 'translate-x-0 bg-white'
                      }`}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-3 h-3 text-[#c6f432] stroke-[2]" />
                      ) : (
                        <VolumeX className="w-3 h-3 text-zinc-400 stroke-[2]" />
                      )}
                    </div>
                  </button>
                </div>

                {/* 5. PERSONALIZAR METAS DE TREINO */}
                {onOpenCustomize && (
                  <button
                    onClick={() => handleAction(onOpenCustomize)}
                    className="w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                        <Target className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Metas & Frequência
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          Personalizar objetivos semanais
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  </button>
                )}

                {/* 6. MANUAIS DO ATLETA */}
                {onOpenGuide && (
                  <button
                    onClick={() => handleAction(onOpenGuide)}
                    className="w-full p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 stroke-[2]" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                          Manuais do Atleta
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          Guias de biomecânica e nutrição
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                  </button>
                )}
              </div>
            </div>

            {/* Rodapé do Drawer: Terminar Sessão & Créditos */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
              <button
                onClick={() => handleAction(signOut)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
                <span>Terminar Sessão</span>
              </button>

              <div className="text-center">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wide font-medium">
                  AB Fitness • Bruno Abel
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
