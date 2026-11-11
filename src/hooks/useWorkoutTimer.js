import { useEffect, useRef, useState } from 'react';

/**
 * Cronómetro do treino baseado no relógio: base acumulada + (agora - início da contagem).
 * Não depende de setInterval contar segundos, por isso não perde tempo com o ecrã bloqueado.
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

  const computeElapsed = () => {
    const { base, since } = timerRef.current;
    return since ? base + Math.max(0, Math.floor((Date.now() - since) / 1000)) : base;
  };

  const [elapsedSeconds, setElapsedSeconds] = useState(computeElapsed);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Atualiza o ecrã a cada segundo e ressincroniza ao voltar à app
  useEffect(() => {
    if (!isTimerRunning) {
      timerRef.current = { base: computeElapsed(), since: null };
      return undefined;
    }
    if (!timerRef.current.since) timerRef.current = { ...timerRef.current, since: Date.now() };
    const tick = () => setElapsedSeconds(computeElapsed());
    tick();
    const interval = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning]);

  return { elapsedSeconds, isTimerRunning, setIsTimerRunning, computeElapsed, timerRef };
}
