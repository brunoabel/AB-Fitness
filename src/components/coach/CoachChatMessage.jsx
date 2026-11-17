import React from 'react';
import { LogIn, RotateCcw } from 'lucide-react';
import CoachAvatar from './CoachAvatar';
import PrescribedWorkoutCard from './PrescribedWorkoutCard';

/** Item individual de mensagem (utilizador ou AB Coach) no chat. */
export default function CoachChatMessage({
  activeSwap,
  canSchedule,
  isExpanded,
  isLoading,
  isSaved,
  isSharing,
  msg,
  msgIndex,
  onAssignToDay,
  onClose,
  onOpenAuth,
  onRetry,
  onSaveToWorkouts,
  onShareCard,
  onStartWorkout,
  onSwapExercise,
  onToggleDayPicker,
  onToggleExpand,
  onToggleSwap,
  onViewExercise,
  scheduledDayLabel,
  showDayPicker
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <CoachAvatar size={28} alt="" className="mt-0.5" />}

      <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-accent/70 text-white font-medium'
              : msg.isError
                ? 'bg-rose-950/40 text-rose-300 border border-rose-800/60'
                : 'bg-surface-2 text-zinc-100 border border-white/10'
          }`}
        >
          {msg.content}

          {msg.isAuthError && (
            <div className="mt-3 pt-2 border-t border-rose-800/40">
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                  onClose();
                }}
                className="w-full py-2 px-3 rounded-lg bg-primary text-app font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 stroke-[2]" />
                <span>Iniciar Sessão no AB Fitness</span>
              </button>
            </div>
          )}

          {msg.isError && !msg.isAuthError && (
            <div className="mt-3 pt-2 border-t border-rose-800/40">
              <button
                type="button"
                onClick={onRetry}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-lg bg-primary text-app font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          )}
        </div>

        {msg.treino && (
          <PrescribedWorkoutCard
            activeSwap={activeSwap}
            canSchedule={canSchedule}
            isExpanded={isExpanded}
            isSaved={isSaved}
            isSharing={isSharing}
            msgIndex={msgIndex}
            onAssignToDay={onAssignToDay}
            onSaveToWorkouts={onSaveToWorkouts}
            onShareCard={onShareCard}
            onStartWorkout={onStartWorkout}
            onSwapExercise={onSwapExercise}
            onToggleDayPicker={onToggleDayPicker}
            onToggleExpand={onToggleExpand}
            onToggleSwap={onToggleSwap}
            onViewExercise={onViewExercise}
            scheduledDayLabel={scheduledDayLabel}
            showDayPicker={showDayPicker}
            workout={msg.treino}
          />
        )}
      </div>
    </div>
  );
}
