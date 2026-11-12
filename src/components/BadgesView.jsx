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
    <div className="space-y-4 animate-fadeIn">
      
      {/* 1. Header de Conquistas & Barra de Progresso */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-amber-400 border border-zinc-700/60 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 block">
                CONQUISTAS • AB FITNESS
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Mural de Medalhas & Conquistas
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
              {unlockedCount}<span className="text-xs text-zinc-500 font-normal">/{totalBadges}</span>
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span>Progresso de Conquistas</span>
            <span className="text-amber-400 font-mono tabular-nums">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Filtros de Categoria */}
      <div className="flex rounded-xl bg-zinc-900 p-1 border border-white/10 text-xs font-bold shadow-xs">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'running', label: 'Corrida' },
          { id: 'gym', label: 'Musculação' },
          { id: 'consistency', label: 'Disciplina' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFilter(f.id);
              triggerHaptic(10);
            }}
            className={`flex-1 min-h-[44px] py-1.5 px-2 rounded-lg transition-all cursor-pointer text-center ${
              filter === f.id
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 3. Grid de Medalhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredBadges.map((badge) => {
          const isUnlocked = Boolean(unlockedMap[badge.id]);
          const unlockedInfo = unlockedMap[badge.id];
          const IconComponent = ICON_MAP[badge.icon] || Trophy;

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-xl border transition-all relative overflow-hidden flex items-start gap-3 ${
                isUnlocked
                  ? 'bg-zinc-900 border-zinc-700 shadow-sm'
                  : 'bg-zinc-900/40 border-zinc-800/80 opacity-70'
              }`}
            >
              {/* Ícone */}
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isUnlocked
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-600 border-zinc-700'
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
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className={`text-xs font-bold truncate ${
                    isUnlocked ? 'text-white' : 'text-zinc-400'
                  }`}>
                    {badge.title}
                  </h3>
                  
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      OK
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400 leading-tight">
                  {badge.desc}
                </p>

                {isUnlocked && unlockedInfo?.unlockedAt && (
                  <span className="text-[11px] text-zinc-500 font-mono tabular-nums mt-1.5 block">
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
