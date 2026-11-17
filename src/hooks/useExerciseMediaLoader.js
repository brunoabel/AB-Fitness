import { useEffect, useState } from 'react';

let mediaModule = null;
let loading = null;
const listeners = new Set();

/** Carrega o resolvedor de mídia (catálogo + biblioteca de vídeos) só sob procura ou em idle. */
export function loadExerciseMedia() {
  if (mediaModule) return Promise.resolve(mediaModule);
  if (!loading) {
    loading = import('../data/exerciseMedia').then((m) => {
      mediaModule = m;
      listeners.forEach((cb) => cb(m));
      listeners.clear();
      return m;
    });
  }
  return loading;
}

/**
 * Devolve `hasExerciseVideo` sem descarregar 416 KB na montagem inicial do painel:
 * usa o módulo se já estiver em memória (ou carrega em idle com timeout longo / ao interagir).
 */
export function useHasExerciseVideo() {
  const [mod, setMod] = useState(mediaModule);

  useEffect(() => {
    if (mod) return undefined;
    let alive = true;
    const onLoaded = (m) => {
      if (alive) setMod(m);
    };
    listeners.add(onLoaded);

    let idleId = null;
    let timerId = null;
    const startIdle = () => {
      if (alive) loadExerciseMedia().catch(() => {});
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(startIdle, { timeout: 6000 });
    } else {
      timerId = setTimeout(startIdle, 4500);
    }

    return () => {
      alive = false;
      listeners.delete(onLoaded);
      if (idleId !== null && typeof window !== 'undefined' && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [mod]);

  return mod ? mod.hasExerciseVideo : () => false;
}
