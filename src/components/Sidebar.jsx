import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Dumbbell,
  Footprints,
  UsersRound,
  CircleUserRound,
  Sparkles,
  ShieldCheck,
  Crown,
  Flame,
  SlidersHorizontal
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { useAthleteIdentity } from '../hooks/useAthleteIdentity';
import CoachAvatar from './coach/CoachAvatar';
import VerifiedBadge from './ui/VerifiedBadge';
import ABLogo from './ABLogo';

const TABS = [
  { id: 'dashboard', label: 'Treino', icon: Dumbbell },
  { id: 'running', label: 'Corrida', icon: Footprints },
  { id: 'social', label: 'Amigos', icon: UsersRound },
  { id: 'profile', label: 'Perfil', icon: CircleUserRound },
];

function NavItem({ icon: Icon, label, active, onClick, reducedMotion }) {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic(10);
        onClick?.();
      }}
      aria-current={active ? 'page' : undefined}
      className={`group relative w-full min-h-[46px] px-3.5 rounded-2xl flex items-center gap-3 cursor-pointer touch-manipulation transition-colors ${
        active ? 'text-white' : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
      }`}
    >
      {active && (
        <motion.span
          layoutId="sidebarActivePill"
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute inset-0 rounded-2xl bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          aria-hidden="true"
        />
      )}

      <span
        aria-hidden="true"
        className={`relative z-10 w-[3px] h-4 rounded-full transition-all duration-200 ${
          active
            ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.75)] opacity-100 scale-y-100'
            : 'bg-white/40 opacity-0 scale-y-50 group-hover:opacity-40'
        }`}
      />

      <Icon
        className={`relative z-10 w-[19px] h-[19px] shrink-0 transition-colors ${
          active ? 'text-white' : 'text-zinc-400 group-hover:text-white'
        }`}
        strokeWidth={active ? 2 : 1.75}
      />

      <span className={`relative z-10 text-[14px] tracking-tight ${active ? 'font-bold text-white' : 'font-medium'}`}>
        {label}
      </span>
    </button>
  );
}

/**
 * Navegação lateral de desktop (≥ lg): Luxury Command Rail OLED.
 * Fundo #000000 puro, cápsula magnética contínua (layoutId), módulo conversacional do
 * AB Coach e Athlete Command Dock com identidade, patente e sequência ativa no rodapé.
 */
export default function Sidebar({
  activeTab,
  currentView,
  onTabChange,
  onOpenTrainerHub,
  onOpenAdmin,
  onOpenAICoach,
  onOpenAccountDrawer,
  completedDays = null,
  schedule = []
}) {
  const reducedMotion = useReducedMotion();
  const {
    avatar,
    fullName,
    username,
    initials,
    ceo,
    pro,
    verified,
    isAdmin,
    isTrainer,
    streak,
    rank
  } = useAthleteIdentity({ refreshKey: true, completedDays, schedule });

  const handleDockAction = () => {
    triggerHaptic(10);
    if (onOpenAccountDrawer) {
      onOpenAccountDrawer();
    } else {
      onTabChange?.('profile');
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[272px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-[#000000] border-r border-white/[0.06] px-3.5 py-6 select-none">
      {/* Cabeçalho de Marca & Ritmo */}
      <div className="relative flex items-center gap-3 px-2.5 pb-6 mb-2 border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-2 left-1 w-14 h-14 rounded-full bg-white/[0.05] blur-xl"
        />
        <div className="relative shrink-0">
          <ABLogo size={38} showText={false} />
        </div>
        <div className="relative flex flex-col min-w-0">
          <span className="font-heading font-black text-white text-[17px] leading-none tracking-tight">
            AB Fitness
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400 leading-none mt-1.5 truncate">
            {ceo ? 'Founder Edition' : pro ? 'Pro Performance' : 'Performance Athletics'}
          </span>
        </div>
      </div>

      {/* Navegação Principal + Atalhos Executivos */}
      <nav
        role="navigation"
        aria-label="Navegação principal"
        className="flex-1 overflow-y-auto overscroll-contain space-y-1 pt-2 pr-0.5"
      >
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={currentView === 'dashboard' && activeTab === tab.id}
            onClick={() => onTabChange?.(tab.id)}
            reducedMotion={reducedMotion}
          />
        ))}

        {(isTrainer || isAdmin) && (
          <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-1">
            <p className="px-3.5 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
              Comando
            </p>
            {isTrainer && (
              <NavItem
                icon={Dumbbell}
                label="Trainer Hub"
                active={currentView === 'trainer-hub'}
                onClick={onOpenTrainerHub}
                reducedMotion={reducedMotion}
              />
            )}
            {isAdmin && (
              <NavItem
                icon={ceo ? Crown : ShieldCheck}
                label={ceo ? 'Painel Executivo CEO' : 'Painel Admin'}
                active={currentView === 'admin'}
                onClick={onOpenAdmin}
                reducedMotion={reducedMotion}
              />
            )}
          </div>
        )}
      </nav>

      {/* Módulo Conversacional: AB Coach Companion */}
      <div className="pt-3">
        <motion.button
          type="button"
          whileHover={reducedMotion ? undefined : { y: -1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.985 }}
          onClick={() => {
            triggerHaptic(10);
            onOpenAICoach?.();
          }}
          className="group relative w-full min-h-[54px] p-3 rounded-2xl overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.1] hover:border-white/[0.2] flex items-center gap-3 text-left cursor-pointer touch-manipulation transition-colors"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
          <span className="relative shrink-0 rounded-full p-0.5 ring-1 ring-white/[0.15]">
            <CoachAvatar size={32} alt="" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-white leading-tight">AB Coach</span>
            <span className="block text-[11px] text-zinc-400 truncate mt-0.5">
              Pronto para ajustar o treino
            </span>
          </span>
          <Sparkles
            className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors shrink-0"
            strokeWidth={1.75}
          />
        </motion.button>
      </div>

      {/* Athlete Command Dock */}
      <div className="mt-3 pt-3.5 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={handleDockAction}
          aria-label="Abrir dossiê e definições do atleta"
          className="group w-full min-h-[50px] px-2 py-1.5 rounded-2xl hover:bg-white/[0.04] flex items-center gap-3 text-left cursor-pointer touch-manipulation transition-colors"
        >
          <span className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-900 ring-1 ring-white/[0.16] flex items-center justify-center text-[13px] font-semibold text-white shrink-0">
            {avatar ? (
              <img src={avatar} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              initials
            )}
          </span>

          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold text-white truncate">{fullName}</span>
              {verified && <VerifiedBadge size={13} />}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-400 truncate mt-0.5">
              <span className="truncate">{username ? `@${username}` : rank.label}</span>
              {streak > 0 && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="inline-flex items-center gap-0.5 font-display tabular-nums font-bold text-amber-300 shrink-0">
                    <Flame className="w-3 h-3 text-amber-400" strokeWidth={2} />
                    {streak}d
                  </span>
                </>
              )}
            </span>
          </span>

          <SlidersHorizontal
            className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors shrink-0"
            strokeWidth={1.75}
          />
        </button>
      </div>
    </aside>
  );
}
