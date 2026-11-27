import React, { useState } from 'react';
import { 
  Trophy, 
  Crown, 
  Zap, 
  Flame, 
  Award, 
  Dumbbell, 
  Target, 
  Shield, 
  Activity, 
  Sparkles, 
  Sun, 
  Moon, 
  Lock, 
  CheckCircle2,
  Footprints,
  Mountain
} from 'lucide-react';
import { BADGES_CATALOG } from '../data/badges';
import { getUnlockedBadges } from '../utils/badgeService';
import { triggerHaptic } from '../utils/audio';

export const ICON_MAP = {
  Footprints,
  Trophy,
  Crown,
  Zap,
  Flame,
  Mountain,
  Award,
  Dumbbell,
  Target,
  Shield,
  Activity,
  Weight: Dumbbell,
  Sparkles,
  Sun,
  Moon
};

export default function BadgesView() {
  const [filter, setFilter] = useState('all'); // 'all' | 'running' | 'gym' | 'consistency'
  const unlockedMap = getUnlockedBadges();

  const totalBadges = BADGES_CATALOG.length;
  const unlockedCount = Object.keys(unlockedMap).length;
  const progressPercent = Math.round((unlockedCount / totalBadges) * 100);

  const filteredBadges = BADGES_CATALOG.filter((b) => {
    if (filter === 'all') return true;
    return b.category === filter;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* 1. Header de Conquistas & Barra de Progresso (Aberto no canvas OLED) */}
      <div className="pt-1 pb-5 border-b border-white/[0.06] text-white">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/50 text-white border border-accent-hover flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-[-0.015em]">
                Mural de Medalhas & Conquistas
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="font-display text-xl font-semibold text-white tabular-nums tracking-[-0.02em]">
              {unlockedCount}<span className="text-xs text-zinc-500 font-normal ml-0.5">/{totalBadges}</span>
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>Progresso de Conquistas</span>
            <span className="font-display text-white tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div 
              className="h-full bg-accent-hover rounded-full transition-[width] duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Filtros de Categoria */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-bold">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'running', label: 'Corrida' },
          { id: 'gym', label: 'Musculação' },
          { id: 'consistency', label: 'Disciplina' }
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              triggerHaptic(10);
            }}
            className={`min-h-[38px] px-4 rounded-full border transition-colors cursor-pointer shrink-0 ${
              filter === f.id
                ? 'bg-accent border-accent-hover text-white'
                : 'bg-surface border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3. Lista Aberta de Medalhas */}
      <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
        {filteredBadges.map((badge) => {
          const isUnlocked = Boolean(unlockedMap[badge.id]);
          const unlockedInfo = unlockedMap[badge.id];
          const IconComponent = ICON_MAP[badge.icon] || Trophy;

          return (
            <div
              key={badge.id}
              className={`py-3.5 flex items-center gap-3.5 ${
                isUnlocked ? '' : 'opacity-55'
              }`}
            >
              {/* Ícone */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                  isUnlocked
                    ? 'bg-accent/60 text-white border-accent-hover'
                    : 'bg-white/[0.03] text-zinc-600 border-white/[0.06]'
                }`}
              >
                {isUnlocked ? (
                  <IconComponent className="w-5 h-5 stroke-[2] animate-scaleUp" />
                ) : (
                  <Lock className="w-4 h-4 opacity-60" />
                )}
              </div>

              {/* Informações da Conquista */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h3 className={`text-[13px] font-bold truncate ${
                    isUnlocked ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {badge.title}
                  </h3>
                  
                  {isUnlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                <p className="text-[12px] text-zinc-400 leading-snug">
                  {badge.desc}
                </p>

                {isUnlocked && unlockedInfo?.unlockedAt && (
                  <span className="text-[11px] text-zinc-500 tabular-nums mt-1 block">
                    Conquistada em {new Date(unlockedInfo.unlockedAt).toLocaleDateString('pt-PT')}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
