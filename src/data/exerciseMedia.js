/**
 * Resolvedor único de mídia e metadados de exercício.
 * Ordem: vídeo auditado (exerciseVideos) → catálogo gerado (exerciseCatalog) → sem vídeo (diagrama + dicas).
 *
 * VITE_MEDIA_BASE_URL permite servir os vídeos a partir do teu próprio bucket R2 (ver scripts/mirror_exercise_media.mjs)
 * sem alterar nenhuma URL nos dados.
 */
import { EXERCISE_CATALOG } from './exerciseCatalog';
import { getVerifiedExerciseVideo } from './exerciseVideos';
import { findExerciseIn100 } from './exercises100';

const SOURCE_HOST = 'https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev';
const MEDIA_BASE = (import.meta.env?.VITE_MEDIA_BASE_URL || '').replace(/\/+$/, '');

/** Normaliza qualquer URL do bucket de origem para o host configurado. */
export function normalizeMediaUrl(url) {
  if (!url) return null;
  return MEDIA_BASE && url.startsWith(SOURCE_HOST) ? MEDIA_BASE + url.slice(SOURCE_HOST.length) : url;
}

/** Entrada do catálogo para um exercício (id, slug ou nome). */
export function getCatalogEntry(exercise) {
  if (!exercise) return null;
  const id = typeof exercise === 'string' ? exercise : exercise.slug || exercise.id;
  if (id && EXERCISE_CATALOG[id]) return EXERCISE_CATALOG[id];
  const found = findExerciseIn100(id) || (typeof exercise === 'object' ? findExerciseIn100(exercise.name || exercise.nome) : null);
  return found ? EXERCISE_CATALOG[found.slug] || null : null;
}

/**
 * @returns {{ videoMale: string|null, videoFemale: string|null, poster: string|null, cues: string[], source: 'verified'|'dataset'|null, entry: object|null }}
 */
export function getExerciseMedia(exercise) {
  const entry = getCatalogEntry(exercise);
  const verified = getVerifiedExerciseVideo(exercise);
  const videoMale = verified?.videoMale || entry?.video_url || null;
  return {
    videoMale: normalizeMediaUrl(videoMale),
    videoFemale: normalizeMediaUrl(verified?.videoFemale || entry?.video_url_female || videoMale),
    poster: normalizeMediaUrl(verified?.poster || entry?.poster_url || null),
    cues: entry?.form_cues?.length ? entry.form_cues : (verified?.keyCues || []).slice(0, 3),
    source: verified ? 'verified' : entry?.video_url ? entry.video_source : null,
    entry
  };
}

export const hasExerciseVideo = (exercise) => Boolean(getExerciseMedia(exercise).videoMale);

/** Carga inicial na troca: peso corporal/elástico = 0; barra ou máquina → halter por mão (~40%, múltiplos de 2 kg). */
function homeWeight(fromEquipment, toEquipment, weight) {
  if (toEquipment === 'bodyweight' || toEquipment === 'bands') return 0;
  if (toEquipment === 'dumbbell' && fromEquipment !== 'dumbbell') return Math.max(2, Math.round((weight * 0.4) / 2) * 2);
  return weight;
}

/**
 * Exercício equivalente de casa, já no formato usado pelos planos (sets/reps/descanso herdados).
 * @returns {object|null}
 */
export function getHomeAlternative(exercise) {
  const entry = getCatalogEntry(exercise);
  if (!entry || entry.environment !== 'gym' || !entry.home_alternative_id) return null;
  const alt = EXERCISE_CATALOG[entry.home_alternative_id];
  if (!alt) return null;
  return {
    id: alt.id,
    name: alt.name,
    target: alt.primary_muscle,
    equipment: alt.equipment,
    suggestedReps: exercise.suggestedReps,
    defaultSets: exercise.defaultSets,
    restTime: exercise.restTime,
    suggestedWeight: homeWeight(entry.equipment, alt.equipment, Number(exercise.suggestedWeight) || 0),
    homeAlternativeOf: exercise.id
  };
}
