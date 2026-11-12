import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cronómetro do treino baseado no relógio: base acumulada + (agora - início da contagem).
 * Não mantém estado de tick a cada segundo aqui para não re-renderizar todo o ActiveWorkout:
 * quem precisa do relógio ao vivo (WorkoutElapsedClock no WorkoutHeader) subscreve isoladamente.
 * @param {{ timerBaseSeconds?: number, elapsedSeconds?: number, timerRunningSince?: number|null } | null} draft
 */
export default function useWorkoutTimer(draft) {
  const timerRef = useRef(null);
  if (timerRef.current === null) {
    timerRef.current = {
      base: draft ? (draft.timerBaseSeconds ?? draft.elapsedSeconds ?? 0) : 0,
      since: draft?.timerRunningSince ?? Date.now()
    };
  }

  const computeElapsed = useCallback(() => {
    const { base, since } = timerRef.current;
    return since ? base + Math.max(0, Math.floor((Date.now() - since) / 1000)) : base;
  }, []);

  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    if (!isTimerRunning) {
      timerRef.current = { base: computeElapsed(), since: null };
      return undefined;
    }
    if (!timerRef.current.since) {
      timerRef.current = { ...timerRef.current, since: Date.now() };
    }
    return undefined;
  }, [isTimerRunning, computeElapsed]);

  return { isTimerRunning, setIsTimerRunning, computeElapsed, timerRef };
}
