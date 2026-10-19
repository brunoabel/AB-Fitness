import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Database,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { getWorkoutHistory } from '../utils/storage';
import ProgressionCharts from './ProgressionCharts';
import BadgesView from './BadgesView';
import { getUnlockedBadges } from '../utils/badgeService';
import { exportAppDataAsJSON, exportAppDataAsCSV } from '../services/runningSyncService';
import { triggerHaptic } from '../utils/audio';

export default function HistoryView() {
  const [subTab, setSubTab] = useState('history'); // 'history' | 'charts' | 'badges'
  const history = getWorkoutHistory();
  const unlockedBadges = getUnlockedBadges();
  const unlockedCount = Object.keys(unlockedBadges).length;

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalMinutes = history.reduce(
    (acc, curr) => acc + (curr.durationMinutes || Math.round((curr.durationSeconds || 0) / 60) || 0), 
    0
  );

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fadeIn transition-colors">
      
      {/* Seletor Executivo de Sub-Abas */}
      <div className="flex rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-1 border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold shadow-xs">
        <button
          onClick={() => {
            setSubTab('history');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'history'
              ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Sessões ({totalWorkouts})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('charts');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'charts'
              ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          <span>Evolução</span>
        </button>

        <button
          onClick={() => {
            setSubTab('badges');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'badges'
              ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Medalhas ({unlockedCount})</span>
        </button>
      </div>

      {/* 1. MÓDULO DE GRÁFICOS DE PROGRESSÃO DE CARGA */}
      {subTab === 'charts' && (
        <ProgressionCharts />
      )}

      {/* 2. MÓDULO DE MEDALHAS & GAMIFICAÇÃO */}
      {subTab === 'badges' && (
        <BadgesView />
      )}

      {/* 3. MÓDULO DE HISTÓRICO TRADICIONAL DE SESSÕES */}
      {subTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Resumo de Conquistas */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Evolução Acumulada • AB Fitness</span>
            </div>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              A sua constância registrada
            </h2>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Treinos
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                  {totalWorkouts}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Volume Total
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                  {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Tempo Ativo
                </span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                  {totalMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Sessões Anteriores */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Registro de Treinos Concluídos ({totalWorkouts})
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800">
                <Dumbbell className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                  Nenhum treino salvo no histórico ainda.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                  Ao concluir uma sessão de musculação, ela aparecerá listada aqui com cargas e séries detalhadas!
                </p>
              </div>
            ) : (
              history.map((item, index) => {
                const displayName = item.dayName || `Dia ${item.workoutDayId || index + 1}`;
                const displayTitle = item.dayTitle || item.title || 'Sessão de Treino';
                const displayDate = item.date || (item.completedAt ? new Date(item.completedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : 'Recente');
                const displayMinutes = item.durationMinutes || Math.max(1, Math.round((item.durationSeconds || 0) / 60));
                const displaySets = item.totalSets || item.exerciseCount || 0;
                const displayVolume = item.totalVolumeKg || 0;

                return (
                  <div 
                    key={item.id || `hist_${index}`}
                    className="p-4 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                          {displayName}
                        </span>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {displayTitle}
                        </h4>
                      </div>

                      <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
                        {displayDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{displayMinutes} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{displaySets} séries</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{displayVolume} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Seção de Backup & Exportação de Dados */}
          <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                  Backup & Exportação dos Seus Treinos
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Exporte todo o seu histórico de musculação e corridas em formatos universais.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  exportAppDataAsCSV();
                  triggerHaptic(15);
                }}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Excel / CSV</span>
              </button>

              <button
                onClick={() => {
                  exportAppDataAsJSON();
                  triggerHaptic(15);
                }}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
