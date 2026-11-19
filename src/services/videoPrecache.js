/**
 * Pré-cache dos vídeos 3D do treino do dia: o service worker descarrega-os em segundo plano
 * para tocarem sem rede no ginásio. Só em Wi-Fi/cabo, nunca com poupança de dados ativa.
 */
const PRECACHE_DAY_KEY = 'ab_fitness_video_precache_v1';
const MAX_VIDEOS = 12;

/**
 * Network Information API: Android expõe `type`; desktop só `effectiveType`; iOS não expõe nada.
 * Sem API (iOS) segue em frente: são poucos MB do treino de hoje, uma vez por dia.
 */
export function shouldPrecacheVideos(connection = typeof navigator !== 'undefined' ? navigator.connection : undefined) {
  if (!connection) return true;
  if (connection.saveData) return false;
  if (connection.type) return connection.type === 'wifi' || connection.type === 'ethernet';
  return connection.effectiveType === '4g';
}

/** URLs únicas dos vídeos (versão masculina, a que o leitor abre por omissão). */
export function collectVideoUrls(exercises = [], getMedia) {
  const urls = [];
  for (const ex of exercises) {
    const url = getMedia(ex)?.videoMale;
    if (url && !urls.includes(url)) urls.push(url);
    if (urls.length >= MAX_VIDEOS) break;
  }
  return urls;
}

export async function precacheWorkoutVideos(workout, dayKey) {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return 0;
  const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];
  if (!exercises.length || !shouldPrecacheVideos()) return 0;
  const marker = `${dayKey}|${workout.dayId}`;
  try {
    if (localStorage.getItem(PRECACHE_DAY_KEY) === marker) return 0;
  } catch {}

  // Import dinâmico: o catálogo de média não entra no chunk inicial
  const { getExerciseMedia } = await import('../data/exerciseMedia');
  const urls = collectVideoUrls(exercises, getExerciseMedia);
  if (!urls.length) return 0;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: 'PRECACHE_VIDEOS', urls });
  try {
    localStorage.setItem(PRECACHE_DAY_KEY, marker);
  } catch {}
  return urls.length;
}
