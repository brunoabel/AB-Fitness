import { useEffect, useState } from 'react';

let mediaModule = null;
let loading = null;

/** Carrega o resolvedor de mídia (catálogo + biblioteca de vídeos, ~600 KB) só quando é preciso. */
export function loadExerciseMedia() {
  if (mediaModule) return Promise.resolve(mediaModule);
  if (!loading) {
    loading = import('../data/exerciseMedia').then((m) => {
      mediaModule = m;
      return m;
    });
  }
  return loading;
}

/**
 * Devolve `hasExerciseVideo` depois de carregar o módulo em segundo plano.
 * Até lá devolve sempre false (os ícones de vídeo aparecem um instante depois).
 */
export function useHasExerciseVideo() {
  const [mod, setMod] = useState(mediaModule);
  useEffect(() => {
    if (mod) return undefined;
    let alive = true;
    loadExerciseMedia().then((m) => {
      if (alive) setMod(m);
    });
    return () => {
      alive = false;
    };
  }, [mod]);
  return mod ? mod.hasExerciseVideo : () => false;
}
