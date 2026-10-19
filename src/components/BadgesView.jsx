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

const ICON_MAP = {
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
      <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-black border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                HALL DA FAMA • AB FITNESS
              </span>
              <h2 className="text-base font-black text-white">
                Mural de Medalhas & Conquistas
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-amber-400 font-mono">
              {unlockedCount}<span className="text-xs text-zinc-500 font-normal">/{totalBadges}</span>
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-1.5 mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
            <span>Progresso de Conquistas</span>
            <span className="text-amber-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Filtros de Categoria */}
      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold shadow-xs">
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
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer text-center ${
              filter === f.id
                ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
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
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden flex items-start gap-3 ${
                isUnlocked
                  ? 'bg-white dark:bg-[#121215] border-amber-500/40 dark:border-amber-500/30 shadow-md shadow-amber-500/5'
                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 opacity-70'
              }`}
            >
              {/* Ícone com Efeito Metálico */}
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/20 via-zinc-800 to-black text-amber-400 border-amber-500/40 shadow-inner'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {isUnlocked ? (
                  <IconComponent className="w-6 h-6 stroke-[2.2] animate-scaleUp" />
                ) : (
                  <Lock className="w-5 h-5 opacity-60" />
                )}
              </div>

              {/* Informações da Conquista */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className={`text-xs font-black truncate ${
                    isUnlocked ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {badge.title}
                  </h3>
                  
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-md border border-amber-500/20 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      OK
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight">
                  {badge.desc}
                </p>

                {isUnlocked && unlockedInfo?.unlockedAt && (
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 block">
                    Conquistada em {new Date(unlockedInfo.unlockedAt).toLocaleDateString('pt-BR')}
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
