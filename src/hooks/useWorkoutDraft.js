import { useEffect, useRef } from 'react';
import { saveActiveDraft } from '../utils/storage';

/**
 * Persistência do rascunho do treino ativo:
 * - grava 500ms depois de cada alteração de séries ou trocas do Modo Casa;
 * - grava de imediato quando a app vai para segundo plano ou é fechada (no iOS o atraso pode não correr);
 * - não grava depois de o treino ser concluído (`finishingRef`).
 * Devolve `dataRef`, sempre com as séries e trocas mais recentes (útil fora dos updaters de estado).
 */
export default function useWorkoutDraft({ workoutDayId, exercisesData, homeSwaps, computeElapsed, timerRef, finishingRef }) {
  const dataRef = useRef({ exercisesData, homeSwaps });
  dataRef.current = { exercisesData, homeSwaps };

  const snapshot = () => ({
    workoutDayId,
    elapsedSeconds: computeElapsed(),
    timerBaseSeconds: timerRef.current.base,
    timerRunningSince: timerRef.current.since,
    ...dataRef.current
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!finishingRef.current) saveActiveDraft(snapshot());
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutDayId, exercisesData, homeSwaps]);

  useEffect(() => {
    const flush = () => {
      if (!finishingRef.current) saveActiveDraft(snapshot());
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutDayId]);

  return dataRef;
}
