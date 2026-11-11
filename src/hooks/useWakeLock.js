// hooks/useWakeLock.js
import { useEffect, useState } from 'react';

/**
 * useWakeLock — Mantém o ecrã ligado durante sessões ativas (treino de força e corrida).
 * Corrige race conditions assíncronas caso o componente desmonte durante o pedido
 * e reativa automaticamente quando o utilizador regressa à aba/app.
 */
export function useWakeLock(active) {
  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!active || !isSupported) return undefined;

    let cancelled = false;
    let currentLock = null;

    const acquire = async () => {
      if (cancelled || (currentLock && !currentLock.released)) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        // Se o efeito já foi limpo enquanto aguardava a Promise, liberta imediatamente
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        currentLock = sentinel;
        setIsLocked(true);

        sentinel.addEventListener('release', () => {
          if (!cancelled) {
            setIsLocked(false);
          }
        });
      } catch {
        // Ignora silenciosamente se o sistema/modo poupança de bateria recusar o bloqueio
        if (!cancelled) {
          setIsLocked(false);
        }
      }
    };

    acquire();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cancelled) {
        acquire();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (currentLock && !currentLock.released && typeof currentLock.release === 'function') {
        currentLock.release().catch(() => {});
      }
      currentLock = null;
      setIsLocked(false);
    };
  }, [active, isSupported]);

  // Inativo ou sem suporte: nunca reporta bloqueio (derivado, sem setState no efeito)
  return { isSupported, isLocked: Boolean(active && isSupported && isLocked) };
}
