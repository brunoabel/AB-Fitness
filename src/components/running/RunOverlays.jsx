import React, { lazy, Suspense } from 'react';
import RunPermissionModal from './RunPermissionModal';

const RunningShareModal = lazy(() => import('../RunningShareModal'));
const BadgeCelebrationModal = lazy(() => import('../BadgeCelebrationModal'));
const StreakMilestoneModal = lazy(() => import('../StreakMilestoneModal'));

/** Sobreposições visuais da corrida: permissões, contagem regressiva 3·2·1 e modais pós-corrida. */
export default function RunOverlays({
  countdown,
  handleSkipCountdown,
  handleStartCountdown,
  newlyUnlockedBadge,
  onClearBadge,
  onClearShare,
  onClearStreak,
  selectedRunForShare,
  sessionStatus,
  setShowPermissionModal,
  showPermissionModal,
  streakInfo
}) {
  return (
    <>
      <RunPermissionModal {...{ handleStartCountdown, setShowPermissionModal, showPermissionModal }} />

      {sessionStatus === 'countdown' && (
        <div
          onClick={handleSkipCountdown}
          className="py-20 text-center flex flex-col items-center justify-center animate-scaleUp cursor-pointer select-none"
        >
          <span className="font-display text-8xl sm:text-9xl font-semibold text-white tracking-[-0.04em] tabular-nums animate-pulse">
            {countdown}
          </span>
          <p className="text-sm font-medium text-zinc-300 mt-4">
            Prepara-te — a corrida vai começar
          </p>
          <span className="text-xs font-semibold text-zinc-500 hover:text-white mt-3 transition-colors">
            Tocar para arrancar já
          </span>
        </div>
      )}

      {selectedRunForShare && (
        <Suspense fallback={null}>
          <RunningShareModal
            runData={selectedRunForShare}
            isOpen={!!selectedRunForShare}
            onClose={onClearShare}
          />
        </Suspense>
      )}

      {newlyUnlockedBadge && (
        <Suspense fallback={null}>
          <BadgeCelebrationModal badge={newlyUnlockedBadge} onClose={onClearBadge} />
        </Suspense>
      )}

      {!newlyUnlockedBadge && streakInfo && (
        <Suspense fallback={null}>
          <StreakMilestoneModal streakInfo={streakInfo} onClose={onClearStreak} />
        </Suspense>
      )}
    </>
  );
}
