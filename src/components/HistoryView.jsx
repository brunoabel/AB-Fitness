import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { getWorkoutHistory } from '../utils/storage';
import { getPendingSyncCount, getFailedSyncJobs, retryFailedSyncJob, discardFailedSyncJob } from '../services/workoutService';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { isBeginnerProfile } from './onboarding/profileSchema';

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

const PAGE = 20;

/** Ecrã Sessões do painel do perfil: resumo acumulado e lista de treinos concluídos. */
export default function HistoryView() {
  const { user } = useAuth();
  const isSimpleMode = isBeginnerProfile(getLocalFitnessProfile());
  const [visible, setVisible] = useState(PAGE);
  const history = getWorkoutHistory();
  const [, setSyncTick] = useState(0);
  const refreshSync = () => setSyncTick((t) => t + 1);
  const pendingSyncCount = getPendingSyncCount(user?.id);
  const failedSyncJobs = getFailedSyncJobs(user?.id);

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalMinutes = history.reduce(
    (acc, curr) => acc + (curr.durationMinutes || Math.round((curr.durationSeconds || 0) / 60) || 0),
    0
  );

  const volumeNumber = totalVolume >= 1000
    ? (totalVolume / 1000).toFixed(1).replace(/\.0$/, '')
    : String(totalVolume);
  const volumeUnit = totalVolume >= 1000 ? 't' : 'kg';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumo acumulado aberto em 3 colunas */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.08] py-3 border-b border-white/[0.06]">
        <div className="pr-3">
          <span className="font-display font-semibold text-2xl sm:text-[28px] text-white tabular-nums tracking-[-0.025em] leading-tight block">
            {totalWorkouts}
          </span>
          <span className="text-xs text-zinc-400">Treinos</span>
        </div>

        <div className="px-3">
          <span className="font-display font-semibold text-2xl sm:text-[28px] text-white tabular-nums tracking-[-0.025em] leading-tight block">
            {volumeNumber}
            <span className="text-sm font-medium text-zinc-400 ml-1">{volumeUnit}</span>
          </span>
          <span className="text-xs text-zinc-400">{isSimpleMode ? 'Carga total' : 'Volume total'}</span>
        </div>

        <div className="pl-3">
          <span className="font-display font-semibold text-2xl sm:text-[28px] text-white tabular-nums tracking-[-0.025em] leading-tight block">
            {totalMinutes}
            <span className="text-sm font-medium text-zinc-400 ml-1">min</span>
          </span>
          <span className="text-xs text-zinc-400">Tempo ativo</span>
        </div>
      </div>

      {/* Lista editorial de sessões concluídas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
            Últimas sessões
          </h3>
          {pendingSyncCount > 0 && (
            <span className="text-xs font-medium text-zinc-400 tabular-nums">
              {pendingSyncCount} por sincronizar
            </span>
          )}
        </div>

        {failedSyncJobs.map((job) => (
          <div key={job.sessionId} className="bg-surface-2 border-l-2 border-accent-hover rounded-r-xl px-3 py-2.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{job.workoutTitle || job.workoutName || 'Treino'} não sincronizado</p>
              <p className="text-xs text-zinc-400">O servidor recusou este treino. Continua guardado neste aparelho.</p>
            </div>
            <button
              type="button"
              onClick={() => retryFailedSyncJob(job.sessionId, user?.id).finally(refreshSync)}
              className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-full border border-white/[0.1] hover:bg-white/[0.06] cursor-pointer"
            >
              Tentar de novo
            </button>
            <button
              type="button"
              onClick={() => {
                discardFailedSyncJob(job.sessionId);
                refreshSync();
              }}
              className="shrink-0 text-xs font-medium text-zinc-400 px-2 py-1.5 hover:text-white cursor-pointer"
            >
              Descartar
            </button>
          </div>
        ))}

        {history.length === 0 ? (
          <div className="py-8 border-t border-white/[0.06] text-center space-y-2">
            <Dumbbell className="w-6 h-6 text-zinc-600 mx-auto stroke-[1.6]" />
            <p className="text-sm font-medium text-zinc-300">Ainda sem treinos.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {history.slice(0, visible).map((item, index) => {
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
                    <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
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

        {history.length > visible && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setVisible((v) => v + PAGE);
            }}
            className="w-full min-h-[44px] text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
          >
            Mostrar mais ({history.length - visible})
          </button>
        )}
      </div>
    </div>
  );
}
