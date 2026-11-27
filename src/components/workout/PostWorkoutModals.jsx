import React, { lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import SessionCheckin from '../coach/SessionCheckin';
import PostWorkoutCheckin from '../trainer/PostWorkoutCheckin';

const ExerciseModal = lazy(() => import('../ExerciseModal'));
const SwapExerciseModal = lazy(() => import('./SwapExerciseModal'));
const CelebrationModal = lazy(() => import('../CelebrationModal'));
const BadgeCelebrationModal = lazy(() => import('../BadgeCelebrationModal'));
const StreakMilestoneModal = lazy(() => import('../StreakMilestoneModal'));
const PlateCalculatorModal = lazy(() => import('../PlateCalculatorModal'));

/** Orquestrador de modais durante e após a sessão ativa de treino. */
export default function PostWorkoutModals({
  checkin,
  checkinSessionId,
  coachNarrative,
  completedWorkingSetsCount,
  finalDurationMinutes,
  newlyUnlockedBadge,
  onClearBadge,
  onClearStreak,
  onCloseCelebration,
  onCloseExerciseGuide,
  onClosePlates,
  onCloseSwap,
  onDoneCheckin,
  onSelectSubstitute,
  pastWeights,
  plateCalcWeight,
  prevIndex,
  selectedExerciseForModal,
  sessionFacts,
  sessionNewPRs,
  showCelebration,
  streakInfo,
  swapExcludeIds,
  swappingExercise,
  totalVolumeKg,
  workout
}) {
  return (
    <>
      <AnimatePresence>
        {selectedExerciseForModal && (
          <Suspense key="exercise-modal" fallback={null}>
            <ExerciseModal exercise={selectedExerciseForModal} onClose={onCloseExerciseGuide} />
          </Suspense>
        )}
        {swappingExercise && (
          <Suspense key="swap-exercise-modal" fallback={null}>
            <SwapExerciseModal
              exercise={swappingExercise}
              excludeIds={swapExcludeIds}
              prevIndex={prevIndex}
              pastWeights={pastWeights}
              onSelectSubstitute={onSelectSubstitute}
              onClose={onCloseSwap}
            />
          </Suspense>
        )}
      </AnimatePresence>

      {plateCalcWeight !== null && (
        <Suspense fallback={null}>
          <PlateCalculatorModal initialWeight={plateCalcWeight} onClose={onClosePlates} />
        </Suspense>
      )}

      <AnimatePresence>
        {showCelebration && (
          <Suspense key="celebration-modal" fallback={null}>
            <CelebrationModal
              workout={workout}
              durationMinutes={finalDurationMinutes}
              totalSetsCompleted={completedWorkingSetsCount}
              totalVolumeKg={totalVolumeKg}
              unlockedBadge={newlyUnlockedBadge}
              newPRs={sessionNewPRs}
              insights={sessionFacts}
              coachNarrative={coachNarrative}
              onClose={onCloseCelebration}
            />
          </Suspense>
        )}
        {checkin === 'open' && (
          <SessionCheckin key="session-checkin" workout={workout} onDone={onDoneCheckin} />
        )}
        {checkin === 'open-assigned' && (
          <PostWorkoutCheckin key="post-workout-checkin" sessionId={checkinSessionId} onDone={onDoneCheckin} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showCelebration && newlyUnlockedBadge && (
          <Suspense key="badge-celebration" fallback={null}>
            <BadgeCelebrationModal badge={newlyUnlockedBadge} onClose={onClearBadge} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!showCelebration && !newlyUnlockedBadge && streakInfo && (
          <Suspense key="streak-milestone" fallback={null}>
            <StreakMilestoneModal streakInfo={streakInfo} onClose={onClearStreak} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
