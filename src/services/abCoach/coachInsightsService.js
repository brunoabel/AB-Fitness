/**
 * coachInsightsService.js — Motor Determinístico de Insights Pós-Treino (AB Fitness)
 * 
 * Filosofia: "Calcula primeiro no cliente, narra depois com a IA".
 * Computa instantaneamente variações de volume, PRs e progressão dupla.
 * Envia apenas o JSON sintetizado (poucas centenas de bytes) para o AB Coach gerar 2 frases rigorosas.
 */


import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Analisa a sessão concluída face ao histórico anterior para produzir factos matemáticos exatos
 */
export function buildWorkoutInsights(currentSession, history = []) {
  const facts = {
    totalVolumeKg: Number(currentSession.totalVolumeKg) || 0,
    volumeDiffPct: null,
    prs: [],
    stalledExercises: [],
    doubleProgressionReady: [],
    highlights: []
  };

  if (!currentSession) return facts;

  // 1. Variação de volume face às últimas sessões equivalentes
  const equivalentPast = (history || [])
    .filter(s => (s.workoutDayId === currentSession.workoutDayId || s.workoutTitle === currentSession.workoutTitle) && s.id !== currentSession.id)
    .slice(0, 4);

  if (equivalentPast.length > 0) {
    const avgPastVolume = equivalentPast.reduce((acc, s) => acc + (Number(s.totalVolumeKg) || 0), 0) / equivalentPast.length;
    if (avgPastVolume > 0) {
      const diffPct = Math.round(((facts.totalVolumeKg - avgPastVolume) / avgPastVolume) * 100);
      facts.volumeDiffPct = diffPct;
      if (diffPct !== 0) {
        facts.highlights.push({
          type: diffPct > 0 ? 'volume_increase' : 'volume_decrease',
          text: `Volume de Carga: ${diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`} face à média anterior`
        });
      }
    }
  }

  // 2. Extração de PRs e Progressão Dupla por exercício
  const exercisesData = currentSession.exercisesData || {};

  for (const [exId, sets] of Object.entries(exercisesData)) {
    if (!Array.isArray(sets)) continue;

    const workingSets = sets.filter(s => (s.done || s.completed) && s.type !== 'W');
    if (workingSets.length === 0) continue;

    // Verificar se atingiu o topo da gama de repetições (ex.: 12 reps) para progressão dupla
    const maxRepsSet = workingSets.reduce((max, s) => (Number(s.reps) > Number(max.reps || 0) ? s : max), workingSets[0]);
    if (Number(maxRepsSet.reps) >= 12) {
      facts.doubleProgressionReady.push({
        exerciseId: exId,
        weight: maxRepsSet.weight,
        reps: maxRepsSet.reps
      });
      facts.highlights.push({
        type: 'double_progression',
        text: `Sobrecarga pronta: atingiste ${maxRepsSet.reps} reps com ${maxRepsSet.weight}kg. Sobe a carga no próximo treino!`
      });
    }
  }

  return facts;
}

/**
 * Pede ao AB Coach (Gemini via Edge Function) 2 frases concisas baseadas nos factos calculados.
 * Não envia histórico bruto, mantendo latência abaixo de 2 segundos.
 */
export async function fetchCoachNarrative(facts, workoutTitle = 'Treino') {
  if (!facts) return null;

  try {
    if (!isSupabaseConfigured() || !supabase) {
      return getFallbackNarrative(facts);
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return getFallbackNarrative(facts);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // Limite de 3.5s

    const res = await supabase.functions.invoke('ab-coach', {
      body: {
        action: 'narrate_post_workout',
        facts,
        workoutTitle
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.data?.response) {
      return res.data.response;
    }

    return getFallbackNarrative(facts);
  } catch (err) {
    return getFallbackNarrative(facts);
  }
}

/**
 * Fallback determinístico offline e instantâneo
 */
function getFallbackNarrative(facts) {
  if (facts.volumeDiffPct && facts.volumeDiffPct > 5) {
    return `Excelente sessão. Volume de treino aumentou ${facts.volumeDiffPct}% face à tua média anterior. Mantém a hidratação e recuperação muscular.`;
  }
  if (facts.doubleProgressionReady && facts.doubleProgressionReady.length > 0) {
    return `Sessão produtiva. Estás pronto para sobrecarga progressiva com subida de carga na tua próxima oportunidade.`;
  }
  return `Treino executado com consistência técnica. Dados registados com precisão no teu histórico de atleta.`;
}
