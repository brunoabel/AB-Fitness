import React, { useState } from 'react';
import { 
  Trophy, 
  Clock, 
  Dumbbell, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { getWorkoutHistory } from '../utils/storage';
import ProgressionCharts from './ProgressionCharts';
import { triggerHaptic } from '../utils/audio';

export default function HistoryView() {
  const [subTab, setSubTab] = useState('history'); // 'history' | 'charts'
  const history = getWorkoutHistory();

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
          <span>Evolução Cargas</span>
        </button>

        {/* OCULTO: Módulo Whoop & Sono desativado a pedido do utilizador
        <button
          onClick={() => {
            setSubTab('whoop');
            triggerHaptic(10);
          }}
          className={`flex-1 py-2 px-1 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'whoop'
              ? 'bg-white dark:bg-[#18181b] text-zinc-900 dark:text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Whoop & Sono</span>
        </button>
        */}
      </div>

      {/* 1. MÓDULO DE GRÁFICOS DE PROGRESSÃO DE CARGA */}
      {subTab === 'charts' && (
        <ProgressionCharts />
      )}

      {/* 2. MÓDULO DE BIOMETRIA & WEARABLES WHOOP (OCULTO A PEDIDO DO UTILIZADOR) */}
      {/* {subTab === 'whoop' && (
        <WhoopRecoveryHub />
      )} */}

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

            {/* 3 Cartões de métricas acumuladas */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">{totalWorkouts}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Treinos</div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">{totalMinutes}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Minutos</div>
              </div>

              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                <div className="text-lg font-bold text-zinc-900 dark:text-white">{totalVolume.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold uppercase">Kg Totais</div>
              </div>
            </div>
          </div>

          {/* Lista de Treinos Concluídos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
              Treinos Concluídos
            </h3>

            {history.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#121215] border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Nenhum treino concluído ainda</h4>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                  Bora pro primeiro treino da semana! Registre as cargas para acompanhar a sua evolução constante.
                </p>
              </div>
            ) : (
              history.map((item, index) => {
                const displayName = item.workoutName || item.dayName || `Treino #${history.length - index}`;
                const displayTitle = item.workoutTitle || 'Treino Concluído';
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
        </div>
      )}

    </div>
  );
}
