import React from 'react';
import { Trophy, Clock, Dumbbell, CheckCircle2 } from 'lucide-react';
import { getWorkoutHistory } from '../utils/storage';

export default function HistoryView() {
  const history = getWorkoutHistory();

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalMinutes = history.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fadeIn transition-colors">
      {/* Resumo de Conquistas */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Evolução • AB Fitness</span>
        </div>

        <h2 className="text-xl font-black text-slate-800 dark:text-white">
          A sua constância registrada
        </h2>

        {/* 3 Cartões de métricas acumuladas */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700">
            <div className="text-lg font-black text-sky-700 dark:text-sky-300">{totalWorkouts}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Treinos</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700">
            <div className="text-lg font-black text-sky-700 dark:text-sky-300">{totalMinutes}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Minutos</div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700">
            <div className="text-lg font-black text-sky-700 dark:text-sky-300">{totalVolume.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Kg Totais</div>
          </div>
        </div>
      </div>

      {/* Lista de Treinos Concluídos */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Treinos Concluídos
        </h3>

        {history.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-sky-200 dark:border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-500 dark:text-sky-400 flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-700 dark:text-slate-200">Nenhum treino concluído ainda</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
              Bora pro primeiro treino da semana! Registre as cargas para acompanhar a sua força no campo.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                    {item.workoutName}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    {item.workoutTitle}
                  </h4>
                </div>

                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  {item.date}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span>{item.durationMinutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{item.totalSets} séries</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>{item.totalVolumeKg} kg</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
