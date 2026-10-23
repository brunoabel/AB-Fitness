// hooks/useWakeLock.js
import { useEffect } from 'react';

/**
 * useWakeLock — Mantém o ecrã ligado durante sessões ativas (treino de força e corrida).
 * Reativa automaticamente caso o utilizador mude de aba e regresse à app.
 */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    
    let lock = null;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch (err) {
        // Ignora silenciosamente se o utilizador ou dispositivo recusar o bloqueio
      }
    };

    acquire();

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        acquire();
      }
    };

    document.addEventListener('visibilitychange', onVis);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (lock && typeof lock.release === 'function') {
        lock.release().catch(() => {});
      }
    };
  }, [active]);
}
