/**
 * coachService.js — AB Coach
 * Serviço cliente para comunicação com a Supabase Edge Function 'ab-coach'.
 * NUNCA armazena ou expõe chaves de API no frontend.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { validateAndSanitizeCoachResponse } from './schema';

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

  // 2. Invocar a Edge Function com o JWT na sessão
  const { data, error } = await supabase.functions.invoke('ab-coach', {
    body: {
      messages,
      perfil
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
