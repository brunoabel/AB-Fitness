import React, { useState } from 'react';
import {
  Trophy,
  Dumbbell,
  TrendingUp,
  Award,
  Scale
} from 'lucide-react';
import BodyPortfolio from './BodyPortfolio';
import { getWorkoutHistory } from '../utils/storage';
import ProgressionCharts from './ProgressionCharts';
import BadgesView from './BadgesView';
import { getUnlockedBadges } from '../utils/badgeService';
import { getPendingSyncCount } from '../services/workoutService';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';

function formatHistoryDate(item) {
  const raw = item.completedAt || item.date;
  if (!raw) return 'Recente';
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }).replace('.', '');
    }
  }
  return raw;
}

export default function HistoryView() {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('history'); // 'history' | 'charts' | 'badges' | 'body'
  const history = getWorkoutHistory();
  const pendingSyncCount = getPendingSyncCount(user?.id);
  const unlockedBadges = getUnlockedBadges();
  const unlockedCount = Object.keys(unlockedBadges).length;

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalMinutes = history.reduce(
    (acc, curr) => acc + (curr.durationMinutes || Math.round((curr.durationSeconds || 0) / 60) || 0),
    0
  );

  const formattedVolume = totalVolume >= 1000
    ? `${(totalVolume / 1000).toFixed(1).replace(/\.0$/, '')} t`
    : `${totalVolume} kg`;

  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-3 pb-10 space-y-6 animate-fadeIn">
      {/* Navegação por segmentos (pílulas limpas sobre OLED preto) */}
      <div className="p-1 rounded-full bg-white/[0.04] border border-white/[0.07]">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'history', label: `Sessões (${totalWorkouts})`, icon: Trophy },
            { id: 'charts', label: 'Evolução', icon: TrendingUp },
            { id: 'badges', label: `Medalhas (${unlockedCount})`, icon: Award },
            { id: 'body', label: 'Corpo', icon: Scale }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSubTab(tab.id);
                  triggerHaptic(10);
                }}
                className={`min-h-[40px] px-1.5 sm:px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none text-xs font-bold ${
                  active
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {subTab === 'body' && <BodyPortfolio />}
      {subTab === 'charts' && <ProgressionCharts />}
      {subTab === 'badges' && <BadgesView />}

      {subTab === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Resumo acumulado editorial diretamente sobre o preto */}
          <div className="flex items-center justify-between gap-4 py-2">
            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white tabular-nums block">
                {totalWorkouts}
              </span>
              <span className="text-xs text-zinc-400">Treinos</span>
            </div>

            <div className="w-px h-9 bg-white/[0.08]" aria-hidden />

            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white tabular-nums block">
                {formattedVolume}
              </span>
              <span className="text-xs text-zinc-400">Volume total</span>
            </div>

            <div className="w-px h-9 bg-white/[0.08]" aria-hidden />

            <div>
              <span className="font-display font-black text-2xl sm:text-3xl text-white tabular-nums block">
                {totalMinutes} min
              </span>
              <span className="text-xs text-zinc-400">Tempo ativo</span>
            </div>
          </div>

          {/* Lista editorial de sessões concluídas (sem grelha de caixas cinzentas) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-white tracking-tight">
                Histórico de sessões
              </h3>
              {pendingSyncCount > 0 && (
                <span className="text-xs font-medium text-amber-300 tabular-nums">
                  {pendingSyncCount} por sincronizar
                </span>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 border-t border-white/[0.06] text-center space-y-2">
                <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto stroke-[1.6]" />
                <p className="text-sm font-medium text-zinc-300">
                  Ainda sem treinos registados.
                </p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Conclui o teu primeiro treino para acompanhar cargas, séries e evolução aqui.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
                {history.map((item, index) => {
                  const displayName = item.dayName || item.workoutName || `Dia ${item.workoutDayId || index + 1}`;
                  const displayTitle = item.workoutTitle || item.dayTitle || item.title || 'Sessão de Treino';
                  const displayDate = formatHistoryDate(item);
                  const displayMinutes = item.durationMinutes || Math.max(1, Math.round((item.durationSeconds || 0) / 60));
                  const displaySets = item.totalSetsCompleted ?? item.totalSets ?? item.exerciseCount ?? 0;
                  const displayVolume = item.totalVolumeKg || 0;

                  return (
                    <li
                      key={item.id || `hist_${index}`}
                      className="py-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">
                            {displayTitle}
                          </h4>
                          <span className="text-xs text-zinc-500 truncate">
                            · {displayName}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 font-mono tabular-nums">
                          {displayMinutes} min · {displaySets} séries · {displayVolume} kg
                        </p>
                      </div>

                      <span className="text-xs text-zinc-500 tabular-nums shrink-0">
                        {displayDate}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
