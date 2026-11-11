import React from 'react';
import { Dumbbell, Footprints, UsersRound, CircleUserRound, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';
import CoachAvatar from './coach/CoachAvatar';
import ABLogo from './ABLogo';

const TABS = [
  { id: 'dashboard', label: 'Treino', icon: Dumbbell },
  { id: 'running', label: 'Corrida', icon: Footprints },
  { id: 'social', label: 'Amigos', icon: UsersRound },
  { id: 'profile', label: 'Perfil', icon: CircleUserRound },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => {
        triggerHaptic(10);
        onClick();
      }}
      className={`w-full min-h-[44px] px-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors border-l-2 ${
        active ? 'bg-accent/10 border-l-accent text-white' : 'border-l-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]'
      }`}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
      <span className="text-[14px] font-semibold">{label}</span>
    </button>
  );
}

/**
 * Navegação de desktop (≥ lg): substitui a bottom nav, que vira lg:hidden. Mesmos 4 destinos de
 * Navigation.jsx, mais atalhos diretos pro Trainer Hub/Admin pra quem já precisa disso num clique
 * a mais hoje (Perfil → Definições) — exatamente o público (PT em computador) que motivou isto.
 */
export default function Sidebar({ activeTab, currentView, onTabChange, onOpenTrainerHub, onOpenAdmin, onOpenAICoach }) {
  const { isAdmin, isTrainer } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen border-r border-white/[0.08] bg-surface px-3 py-6">
      <div className="flex items-center gap-3 px-3 pb-5 mb-2 border-b border-white/[0.06]">
        <ABLogo size={36} showText={false} />
        <div className="flex flex-col">
          <span className="font-heading font-bold text-white text-[15px] leading-tight tracking-tight">AB Fitness</span>
          <span className="text-[11px] text-zinc-400 font-medium leading-none mt-0.5">Gestão de Treinos</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 mt-1">
        {TABS.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={currentView === 'dashboard' && activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}

        {(isTrainer || isAdmin) && <div className="my-3 border-t border-white/[0.06]" />}

        {isTrainer && (
          <NavItem icon={Dumbbell} label="Trainer Hub" active={currentView === 'trainer-hub'} onClick={onOpenTrainerHub} />
        )}
        {isAdmin && (
          <NavItem icon={ShieldCheck} label="Painel admin" active={currentView === 'admin'} onClick={onOpenAdmin} />
        )}
      </nav>

      <button
        type="button"
        onClick={() => {
          triggerHaptic(10);
          onOpenAICoach();
        }}
        className="w-full min-h-[48px] px-3 rounded-xl bg-accent border border-accent-hover flex items-center gap-2.5 cursor-pointer text-white"
      >
        <CoachAvatar size={28} alt="" />
        <span className="text-[13px] font-semibold flex-1 text-left">AB Coach</span>
        <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      </button>
    </aside>
  );
}
