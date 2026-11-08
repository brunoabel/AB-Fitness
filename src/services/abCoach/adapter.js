/**
 * adapter.js — AB Coach
 * Converte o objeto de treino gerado pelo AB Coach (JSON da IA)
 * para o formato NATIVO exato consumido pelo CustomWorkoutsHub, ActiveWorkout e storage.js.
 */

import { findExerciseInCatalog } from './catalog.js';
import { EXERCISE_BIOMECHANICS } from '../../data/exerciseBiomechanics.js';

/**
 * Converte um treino gerado pela IA no formato nativo do AB Fitness
 * @param {Object} treinoIA Objeto validado retornado pelo AB Coach
 * @returns {Object|null} Objeto no formato compatível com CustomWorkoutsHub e ActiveWorkout
 */
export function toAppWorkout(treinoIA) {
  if (!treinoIA || typeof treinoIA !== 'object') {
    return null;
  }

  const rawExercicios = Array.isArray(treinoIA.exercicios) ? treinoIA.exercicios : [];
  if (rawExercicios.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const uniqueId = `coach_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const title = String(treinoIA.nome || 'Treino Personalizado AB Coach').trim();
  const focus = String(treinoIA.foco || 'Hipertrofia & Biomecânica').trim();
  const duracaoMin = Number(treinoIA.duracao_min) || 45;

  const exercises = rawExercicios.map((ex, idx) => {
    const catalogItem = findExerciseInCatalog(ex.id) || findExerciseInCatalog(ex.nome) || {};
    const bio = (catalogItem.numericId ? EXERCISE_BIOMECHANICS[catalogItem.numericId] : null) || {};

    const defaultSets = Math.max(1, Math.min(6, Number(ex.series) || 3));
    const restTime = Math.max(20, Math.min(240, Number(ex.descanso_seg) || 60));
    const suggestedReps = ex.reps ? String(ex.reps).trim() : '8-12';

    // Monta notas técnicas combinando cadência, dica da IA e benefício biomecânico
    const notesParts = [];
    if (ex.cadencia) notesParts.push(`Cadência: ${ex.cadencia}`);
    if (ex.dica) notesParts.push(`Dica: ${ex.dica}`);
    if (bio.beneficio && notesParts.length === 0) notesParts.push(bio.beneficio);
    const notes = notesParts.join(' • ');

    const steps = (bio.passos && Array.isArray(bio.passos) && bio.passos.length > 0)
      ? bio.passos
      : (ex.dica ? [ex.dica] : ['Execute com postura firme, escápulas travadas e cadência controlada.']);

    return {
      id: catalogItem.id || ex.id || `ex_${idx}_${Date.now()}`,
      name: catalogItem.nome || ex.nome || 'Exercício',
      target: catalogItem.porcao || catalogItem.grupo || 'Geral',
      secondary: bio.sinergistas || '',
      equipment: catalogItem.equipamento || bio.equipamento || 'Equipamento livre / máquina',
      suggestedWeight: 0,
      suggestedReps,
      defaultSets,
      restTime,
      badge: (catalogItem.tipo === 'composto' || bio.tipo === 'composto') ? 'Composto' : 'Isolado',
      notes,
      steps
    };
  });

  return {
    id: uniqueId,
    dayId: uniqueId, // Essencial: dayId precisa ser idêntico ao id para o ActiveWorkout e histórico
    name: 'Treino Personalizado',
    shortName: title.slice(0, 6).trim(),
    title,
    level: 'Intermediário',
    focus,
    duration: `${duracaoMin} min`,
    intensity: 'Alta',
    badge: 'AB Coach IA',
    color: 'from-sky-500 to-blue-600',
    description: `Treino prescrito pelo AB Coach com foco em ${focus}.`,
    trainerNotes: treinoIA.observacoes
      ? String(treinoIA.observacoes).trim()
      : 'Siga a cadência excêntrica recomendada e respeite o descanso entre séries para máxima resposta hipertrófica.',
    isRestDay: false,
    createdAt: now,
    updatedAt: now,
    exercises
  };
}
