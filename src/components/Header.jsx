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
  ChevronRight,
  Dumbbell,
  ListPlus,
  Footprints,
  Trophy
} from 'lucide-react';
import ABLogo from './ABLogo';
import { sound, triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';

export default function Header({ 
  activeTab = 'dashboard',
  currentView = 'dashboard',
  onNavigateTab,
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

  const handleNavigate = (tabId) => {
    setIsMenuOpen(false);
    if (tabId === 'guide' && onOpenGuide) {
      onOpenGuide();
    } else if (tabId === 'admin' && onOpenAdmin) {
      onOpenAdmin();
    } else if (onNavigateTab) {
      onNavigateTab(tabId);
    }
    triggerHaptic(12);
  };

  // Itens de navegação central do aplicativo
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Treino Principal',
      subtitle: 'Painel diário & sobrecarga',
      icon: Dumbbell,
      isActive: currentView !== 'admin' && activeTab === 'dashboard'
    },
    {
      id: 'custom-workouts',
      label: 'Criar Treino',
      subtitle: 'Planeamento personalizado',
      icon: ListPlus,
      isActive: currentView !== 'admin' && activeTab === 'custom-workouts'
    },
    {
      id: 'running',
      label: 'Corrida & Cardio',
      subtitle: 'Tracking de ritmo & GPS',
      icon: Footprints,
      isActive: currentView !== 'admin' && activeTab === 'running'
    },
    {
      id: 'history',
      label: 'Histórico & Conquistas',
      subtitle: 'Sessões e recordes anteriores',
      icon: Trophy,
      isActive: currentView !== 'admin' && activeTab === 'history'
    },
    {
      id: 'guide',
      label: 'Manuais do Atleta',
      subtitle: 'Biomecânica, execução e nutrição',
      icon: BookOpen,
      badge: 'Guias Oficiais',
      highlight: true
    }
  ];

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
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Menu principal de navegação e ajustes">
          {/* Fundo Escuro com Backdrop Blur */}
          <div 
            onClick={() => {
              setIsMenuOpen(false);
              triggerHaptic(8);
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200 cursor-pointer animate-backdrop-in"
            aria-hidden="true"
          />

          {/* Painel do Menu Lateral com Safe Area Generosa no Topo (Evita entalhes e ilhas dinâmicas) */}
          <aside 
            className="relative z-10 w-full max-w-[340px] sm:max-w-sm h-full bg-[#fbfbfc] dark:bg-[#111114] text-zinc-900 dark:text-zinc-100 border-l border-zinc-200 dark:border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto animate-drawer-in"
            style={{
              paddingTop: 'max(calc(env(safe-area-inset-top, 0px) + 14px), 24px)',
              paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 14px), 24px)'
            }}
          >
            {/* Conteúdo Superior e Rolável */}
            <div className="space-y-4">
              
              {/* Topo do Drawer: Identificação & Botão Fechar com Margens Seguras */}
              <div className="px-5 pb-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ABLogo size={32} showText={false} />
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 uppercase leading-none">
                      AB Fitness
                    </h2>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Menu & Navegação
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    triggerHaptic(10);
                  }}
                  className="w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700/60"
                  title="Fechar Menu"
                  aria-label="Fechar Menu"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Cartão de Identificação do Atleta */}
              <div className="mx-4 p-3.5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0">
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

                <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isConfigured ? 'Sincronizado na Nuvem' : 'Armazenamento Local Seguro'}</span>
                </div>
              </div>

              {/* AB Coach IA — Botão Especial em Destaque */}
              <div className="px-4">
                <button
                  onClick={() => handleAction(onOpenAICoach)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-zinc-950 to-zinc-900 text-white dark:from-[#151518] dark:to-[#1c1c22] border border-[#c6f432]/40 hover:border-[#c6f432]/70 shadow-md flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer group"
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
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-[#c6f432]/25 text-[#c6f432] border border-[#c6f432]/40">
                          IA
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5 font-normal">
                        Assistente Biomecânico de Treinos
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#c6f432] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Seção 1: Navegação Central do Aplicativo */}
              <div className="px-4">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block mb-2 px-1">
                  Navegação Principal
                </span>

                <div className="space-y-1.5">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99] border ${
                          item.isActive 
                            ? 'bg-[#c6f432]/10 dark:bg-[#c6f432]/10 text-zinc-950 dark:text-zinc-50 border-[#c6f432]/50 font-semibold' 
                            : item.highlight
                              ? 'bg-amber-500/5 dark:bg-amber-500/10 text-zinc-900 dark:text-zinc-100 border-amber-500/25 hover:border-amber-500/40'
                              : 'bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.isActive 
                              ? 'bg-[#c6f432] text-zinc-950 font-bold' 
                              : item.highlight
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                          }`}>
                            <Icon className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs leading-tight block">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                  {item.badge}
                                </span>
                              )}
                              {item.isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal leading-tight block mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                      </button>
                    );
                  })}

                  {/* Painel de Gestão Admin (Se for Administrador) */}
                  {isAdmin && (
                    <button
                      onClick={() => handleNavigate('admin')}
                      className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group active:scale-[0.99] border ${
                        currentView === 'admin'
                          ? 'bg-[#c6f432]/10 text-zinc-950 dark:text-zinc-50 border-[#c6f432]/50 font-semibold'
                          : 'bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs leading-tight block">
                              Painel de Gestão (Admin)
                            </span>
                            {currentView === 'admin' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432]" />
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal leading-tight block mt-0.5">
                            Gerir atletas, treinos e permissões
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </button>
                  )}
                </div>
              </div>

              {/* Seção 2: Preferências & Ajustes */}
              <div className="px-4 pt-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider block mb-2 px-1">
                  Preferências & Ajustes
                </span>

                <div className="space-y-1.5">
                  {/* Alternador de Modo Noturno */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                        {isDark ? (
                          <Moon className="w-4 h-4 text-amber-400 stroke-[2]" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500 stroke-[2]" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50 block leading-tight">
                          Modo Noturno
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
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

                  {/* Controlo de Efeitos Sonoros */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center shrink-0">
                        {soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-zinc-800 dark:text-zinc-200 stroke-[2]" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-zinc-400 stroke-[2]" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50 block leading-tight">
                          Sons & Avisos
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                          {soundEnabled ? 'Sons do timer ativos' : 'Silenciado'}
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

                  {/* Personalizar Metas de Treino */}
                  {onOpenCustomize && (
                    <button
                      onClick={() => handleAction(onOpenCustomize)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-left active:scale-[0.99] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                          <Target className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block leading-tight">
                            Metas & Frequência
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">
                            Personalizar objetivos semanais
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Rodapé do Drawer: Terminar Sessão & Créditos */}
            <div className="px-5 pt-3 pb-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2 mt-4">
              <button
                onClick={() => handleAction(signOut)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2]" />
                <span>Terminar Sessão</span>
              </button>

              <div className="text-center pt-1">
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
