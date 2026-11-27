/**
 * Resolvedor único de mídia e metadados de exercício.
 * Vídeo: animação do Open Exercises Dataset (exerciseAnimations), servida pelo próprio app em /exercise-videos.
 * Sem animação fiel: o app mostra só as dicas.
 *
 * VITE_MEDIA_BASE_URL (opcional) serve os mesmos caminhos a partir de outro domínio, por exemplo um CDN.
 */
import { EXERCISE_CATALOG as GENERATED_CATALOG } from './exerciseCatalog.js';
import { getVerifiedExerciseVideo } from './exerciseVideos.js';
import { findExerciseIn100 } from './exercises100.js';
import { EXERCISE_ANIMATIONS, DRILL_ANIMATIONS } from './exerciseAnimations.js';
import { OPEN_CATALOG } from './openExercisesBatch.js';

/** Catálogo completo: o gerado por scripts/build_exercise_catalog.mjs + o lote de animações. */
export const EXERCISE_CATALOG = { ...GENERATED_CATALOG, ...OPEN_CATALOG };

const MEDIA_BASE = (import.meta.env?.VITE_MEDIA_BASE_URL || '').replace(/\/+$/, '');

/** Vídeo e capa de uma animação do dataset. */
export function animationMedia(animationId, base = MEDIA_BASE) {
  if (!animationId) return { video: null, poster: null };
  return { video: `${base}/exercise-videos/${animationId}.mp4`, poster: `${base}/exercise-posters/${animationId}.jpg` };
}

/** Entrada do catálogo para um exercício (id, slug ou nome). */
export function getCatalogEntry(exercise) {
  if (!exercise) return null;
  const id = typeof exercise === 'string' || typeof exercise === 'number' ? String(exercise) : exercise.slug || exercise.id;
  if (id && EXERCISE_CATALOG[id]) return EXERCISE_CATALOG[id];
  const found = findExerciseIn100(id) || (typeof exercise === 'object' ? findExerciseIn100(exercise.name || exercise.nome) : null);
  if (found && EXERCISE_CATALOG[found.slug]) return EXERCISE_CATALOG[found.slug];
  const verified = getVerifiedExerciseVideo(exercise);
  return verified?.canonicalId ? EXERCISE_CATALOG[verified.canonicalId] || null : null;
}

/**
 * @returns {{ video: string|null, poster: string|null, cues: string[], entry: object|null }}
 */
export function getExerciseMedia(exercise) {
  const entry = getCatalogEntry(exercise);
  const verified = getVerifiedExerciseVideo(exercise);
  return {
    ...animationMedia(entry ? EXERCISE_ANIMATIONS[entry.id] : null),
    cues: entry?.form_cues?.length ? entry.form_cues : (verified?.keyCues || []).slice(0, 3),
    entry
  };
}

export const hasExerciseVideo = (exercise) => Boolean(getExerciseMedia(exercise).video);

/** Exercício de recuperação: animação própria do drill ou, na falta, a do exercício do catálogo ligado. */
export function getDrillMedia(drill) {
  const own = drill?.id ? DRILL_ANIMATIONS[drill.id] : null;
  if (own) return animationMedia(own);
  return drill?.catalogId ? animationMedia(EXERCISE_ANIMATIONS[getCatalogEntry(drill.catalogId)?.id]) : animationMedia(null);
}

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
