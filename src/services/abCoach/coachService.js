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
const CHAT_TIMEOUT_MS = 18000;

/** Pedido abortado por tempo (opção `timeout` do functions.invoke ou AbortController). */
function isTimeoutError(err) {
  if (!err) return false;
  const text = `${err.name || ''} ${err.message || ''} ${err.context?.name || ''} ${err.context?.message || ''}`.toLowerCase();
  return text.includes('abort') || text.includes('timeout') || text.includes('timed out');
}

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

  // 2. Invocar a Edge Function com retry automático para falhas transitórias
  let result = null;
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('ab-coach', {
        body: {
          messages,
          perfil: enrichedPerfil
        },
        timeout: CHAT_TIMEOUT_MS
      });

      if (!error && data) {
        result = data;
        lastError = null;
        break;
      }

      lastError = error;

      // Não faz retry se for erro de autenticação, rate limit ou tempo esgotado (evita esperas de 40s)
      const status = error?.status || error?.context?.status;
      if (status === 401 || status === 429 || isTimeoutError(error)) {
        break;
      }

      if (attempt < 2) {
        // Pausa breve e tenta novamente de forma silenciosa e resiliente
        await new Promise((r) => setTimeout(r, 1200));
      }
    } catch (err) {
      lastError = err;
      if (isTimeoutError(err)) break;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
  }

  if (lastError) {
    let friendlyMessage = 'O motor de IA está momentaneamente indisponível. Por favor, tenta novamente dentro de instantes.';
    
    // O SDK da Supabase armazena o objeto Response original em error.context
    if (lastError.context && typeof lastError.context.json === 'function') {
      try {
        const payload = await lastError.context.json();
        if (payload?.mensagem) {
          friendlyMessage = payload.mensagem;
        } else if (payload?.error) {
          friendlyMessage = payload.error;
        }
      } catch (_) {
        // Ignora se o corpo já tiver sido consumido ou não for JSON
      }
    }

    if (isTimeoutError(lastError)) {
      throw new Error('O AB Coach demorou demais a responder (rede fraca?). Tenta de novo; o teu treino não foi afetado.');
    }

    const status = lastError.status || lastError.context?.status;
    if (status === 401) {
      throw new Error('A tua sessão expirou ou não está autenticada. Por favor, inicia sessão novamente.');
    }
    if (status === 429) {
      throw new Error('Atingiste o limite temporário de pedidos por hora (20/hora). Aguarda alguns instantes.');
    }
    if (status >= 500 || friendlyMessage.includes('non-2xx')) {
      throw new Error('O motor de IA da Google está temporariamente com elevada procura. Por favor, aguarda alguns segundos e tenta novamente.');
    }
    throw new Error(friendlyMessage);
  }

  // 3. Validação pós-resposta de segurança no cliente
  const validated = validateAndSanitizeCoachResponse(result);
  if (!validated.isValid) {
    if (result && typeof result.mensagem === 'string') {
      return { mensagem: result.mensagem, treino: null };
    }
    throw new Error('A resposta recebida teve uma inconsistência de formatação. Por favor, tenta reformular a pergunta.');
  }

  return validated.data;
}
