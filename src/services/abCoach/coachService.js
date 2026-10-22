/**
 * coachService.js — AB Coach
 * Serviço cliente para comunicação com a Supabase Edge Function 'ab-coach'.
 * NUNCA armazena ou expõe chaves de API no frontend.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { validateAndSanitizeCoachResponse } from './schema';
import { getSavedWeights, getWorkoutHistory } from '../../utils/storage';

/**
 * Monta o contexto biométrico do atleta (cargas e histórico recente) para o AB Coach
 */
export function getAthleteContextSummary(perfil = null) {
  try {
    const weightsRaw = getSavedWeights() || {};
    const historyRaw = getWorkoutHistory() || [];

    // Top 10 exercícios recentes com cargas registradas
    const recentWeights = Object.entries(weightsRaw)
      .filter(([_, sets]) => Array.isArray(sets) && sets.some((s) => Number(s.weight) > 0))
      .slice(0, 10)
      .map(([exId, sets]) => {
        const bestSet = sets.reduce((max, s) => (Number(s.weight) > Number(max?.weight || 0) ? s : max), sets[0]);
        return `${exId}: ${bestSet.weight}kg (${bestSet.reps || 10} reps)`;
      });

    // Últimos 3 treinos concluídos para gestão de fadiga
    const recentWorkouts = historyRaw.slice(0, 3).map((h) => ({
      treino: h.title || h.name || 'Treino',
      data: h.completedAt ? new Date(h.completedAt).toLocaleDateString('pt-BR') : 'recente'
    }));

    return {
      ...(perfil || {}),
      recentWeights,
      recentWorkouts
    };
  } catch (err) {
    console.warn('Erro ao montar contexto do atleta para o coach:', err);
    return perfil;
  }
}

/**
 * Envia o histórico da conversa e perfil do atleta para o AB Coach
 * @param {Array<{role: string, content: string}>} messages Histórico de mensagens
 * @param {Object} [perfil] Dados de treino do atleta (nível, objetivo, lesões, etc.)
 * @returns {Promise<{mensagem: string, treino: Object|null}>}
 */
export async function sendMessageToCoach(messages, perfil = null) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Servidor não configurado. Por favor, verifique a conexão com o Supabase.');
  }

  // 1. Obter sessão ativa para garantir que há um token válido
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session || !session.access_token) {
    throw new Error('Você precisa estar conectado à sua conta para conversar com o AB Coach.');
  }

  const enrichedPerfil = getAthleteContextSummary(perfil);

  // 2. Invocar a Edge Function com o JWT na sessão
  const { data, error } = await supabase.functions.invoke('ab-coach', {
    body: {
      messages,
      perfil: enrichedPerfil
    }
  });

  if (error) {
    // Tratar erros HTTP específicos retornados pela Edge Function
    const status = error.status || error.context?.status;
    if (status === 401) {
      throw new Error('Sua sessão expirou. Por favor, faça login novamente.');
    }
    if (status === 429) {
      throw new Error('Você atingiu o limite de 20 perguntas por hora. Aguarde alguns instantes.');
    }
    const errorMsg = error.message || 'Falha na comunicação com o assistente virtual.';
    throw new Error(errorMsg);
  }

  // 3. Validação pós-resposta de segurança no client
  const validated = validateAndSanitizeCoachResponse(data);
  if (!validated.isValid) {
    throw new Error('Resposta recebida em formato inconsistente. Tente novamente.');
  }

  return validated.data;
}
