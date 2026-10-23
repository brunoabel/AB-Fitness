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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn transition-colors">
      
      {/* Controlo de Segmentos do Histórico */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold">
        <button
          onClick={() => {
            setSubTab('history');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[40px] ${
            subTab === 'history'
              ? 'bg-white dark:bg-[#141618] text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/60'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Sessões ({totalWorkouts})</span>
        </button>

        <button
          onClick={() => {
            setSubTab('charts');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[40px] ${
            subTab === 'charts'
              ? 'bg-white dark:bg-[#141618] text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/60'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Evolução</span>
        </button>

        <button
          onClick={() => {
            setSubTab('badges');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[40px] ${
            subTab === 'badges'
              ? 'bg-white dark:bg-[#141618] text-zinc-950 dark:text-zinc-50 shadow-xs border border-zinc-200/80 dark:border-zinc-700/60'
              : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>Medalhas ({unlockedCount})</span>
        </button>
      </div>

      {/* 1. MÓDULO DE GRÁFICOS DE PROGRESSÃO DE CARGA */}
      {subTab === 'charts' && (
        <ProgressionCharts />
      )}

      {/* 2. MÓDULO DE MEDALHAS & CONQUISTAS */}
      {subTab === 'badges' && (
        <BadgesView />
      )}

      {/* 3. MÓDULO DE HISTÓRICO DE SESSÕES */}
      {subTab === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Resumo Acumulado */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-4 h-4 stroke-[1.8]" />
              <span>Consistência e Histórico de Sessões</span>
            </div>

            <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
              Rendimento Acumulado
            </h2>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#1a1d20]/80 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Treinos
                </span>
                <span className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mt-0.5 block tabular-nums">
                  {totalWorkouts}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#1a1d20]/80 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Volume Total
                </span>
                <span className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mt-0.5 block tabular-nums">
                  {totalVolume > 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-[#1a1d20]/80 border border-zinc-200 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Tempo Ativo
                </span>
                <span className="text-xl font-bold text-zinc-950 dark:text-zinc-50 mt-0.5 block tabular-nums">
                  {totalMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Sessões Anteriores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Registo de Treinos Efetuados ({totalWorkouts})
              </h3>
            </div>

            {history.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800">
                <Dumbbell className="w-8 h-8 text-zinc-400 mx-auto mb-2 opacity-50 stroke-[1.8]" />
                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nenhum treino gravado no histórico até ao momento.
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Ao concluir uma sessão de musculação, ela surgirá detalhada aqui com registo de cargas, repetições e volume.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {history.map((item, index) => {
                  const displayName = item.dayName || `Dia ${item.workoutDayId || index + 1}`;
                  const displayTitle = item.dayTitle || item.title || 'Sessão de Treino';
                  const displayDate = item.date || (item.completedAt ? new Date(item.completedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : 'Recente');
                  const displayMinutes = item.durationMinutes || Math.max(1, Math.round((item.durationSeconds || 0) / 60));
                  const displaySets = item.totalSets || item.exerciseCount || 0;
                  const displayVolume = item.totalVolumeKg || 0;

                  return (
                    <div 
                      key={item.id || `hist_${index}`}
                      className="p-4 rounded-xl bg-white dark:bg-[#141618] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-2 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                            {displayName}
                          </span>
                          <h4 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                            {displayTitle}
                          </h4>
                        </div>

                        <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 tabular-nums">
                          {displayDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{displayMinutes} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
                          <span>{displaySets} séries</span>
                        </div>
                        <div className="flex items-center gap-1.5 tabular-nums">
                          <Dumbbell className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{displayVolume} kg</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secção de Cópia de Segurança & Exportação */}
          <div className="p-5 rounded-xl bg-zinc-50 dark:bg-[#1a1d20]/80 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-600 dark:text-zinc-400 stroke-[1.8]" />
              <div>
                <h4 className="text-xs font-semibold text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
                  Cópia de Segurança & Exportação de Dados
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Exporta todo o teu histórico de treinos e corridas em formatos abertos (CSV e JSON).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  exportAppDataAsCSV();
                  triggerHaptic(15);
                }}
                className="py-2.5 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs min-h-[40px]"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[1.8]" />
                <span>Exportar CSV</span>
              </button>

              <button
                onClick={() => {
                  exportAppDataAsJSON();
                  triggerHaptic(15);
                }}
                className="py-2.5 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs min-h-[40px]"
              >
                <Download className="w-4 h-4 text-zinc-600 dark:text-zinc-400 stroke-[1.8]" />
                <span>Cópia JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
