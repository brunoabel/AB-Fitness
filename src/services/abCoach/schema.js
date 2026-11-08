/**
 * schema.js — AB Coach
 * Schema JSON e funções de validação estrita para as respostas do AB Coach.
 */

import { findExerciseInCatalog, findNearestExercise } from './catalog.js';

/**
 * Schema compatível com a API do Google Gemini (responseSchema com responseMimeType: "application/json")
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    mensagem: {
      type: 'STRING',
      description: 'Resposta amigável, motivadora, em português do Brasil, curta e didática explicando o raciocínio biomecânico.'
    },
    treino: {
      type: 'OBJECT',
      nullable: true,
      description: 'Objeto estruturado do treino. Deve ser null se o usuário apenas fez uma pergunta teórica ou conversa.',
      properties: {
        nome: {
          type: 'STRING',
          description: 'Nome do treino (ex: Peitoral Inferior & Tríceps Hipertrofia).'
        },
        foco: {
          type: 'STRING',
          description: 'Foco muscular principal (ex: Porção Costal do Peitoral e Tríceps).'
        },
        duracao_min: {
          type: 'INTEGER',
          description: 'Duração estimada em minutos (geralmente entre 35 e 60).'
        },
        observacoes: {
          type: 'STRING',
          description: 'Dica do treinador ou observação sobre o treino.'
        },
        exercicios: {
          type: 'ARRAY',
          description: 'Lista de 3 a 9 exercícios rigorosamente selecionados a partir do catálogo.',
          items: {
            type: 'OBJECT',
            properties: {
              id: {
                type: 'STRING',
                description: 'ID exato (slug) do exercício presente no catálogo fornecido.'
              },
              nome: {
                type: 'STRING',
                description: 'Nome oficial do exercício correspondente ao ID.'
              },
              series: {
                type: 'INTEGER',
                description: 'Número de séries de trabalho (entre 2 e 5).'
              },
              reps: {
                type: 'STRING',
                description: 'Faixa de repetições alvo (ex: "8-10", "10-12", "12-15").'
              },
              descanso_seg: {
                type: 'INTEGER',
                description: 'Tempo de descanso em segundos (entre 45 e 120).'
              },
              cadencia: {
                type: 'STRING',
                description: 'Cadência excêntrica recomendada (ex: "3s descida controlada").'
              },
              dica: {
                type: 'STRING',
                description: 'Instrução técnica rápida de 1 frase para o movimento.'
              }
            },
            required: ['id', 'nome', 'series', 'reps', 'descanso_seg']
          }
        }
      },
      required: ['nome', 'foco', 'duracao_min', 'exercicios']
    }
  },
  required: ['mensagem']
};

/**
 * Validação e higienização pós-resposta (server-side & client-side fallback)
 * Garante que:
 * 1. O JSON possui 'mensagem'.
 * 2. Se houver 'treino', nenhum ID inventado chega ao frontend:
 *    - Se o ID existir, o nome é padronizado pelo catálogo oficial.
 *    - Se o ID for inválido, substitui pelo exercício mais próximo do mesmo grupo ou remove.
 * 3. Faz clamp de valores (séries 1-6, descanso 20-240s, 3-9 exercícios).
 */
export function validateAndSanitizeCoachResponse(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      error: 'Resposta inválida (não é um objeto JSON).'
    };
  }

  // 1. Mensagem obrigatória
  const mensagem = typeof parsed.mensagem === 'string' && parsed.mensagem.trim() !== ''
    ? parsed.mensagem.trim()
    : 'Aqui está sua orientação biomecânica do AB Fitness.';

  // 2. Se treino for nulo, indefinido ou vazio
  if (!parsed.treino || typeof parsed.treino !== 'object') {
    return {
      isValid: true,
      data: {
        mensagem,
        treino: null
      }
    };
  }

  const rawTreino = parsed.treino;
  const rawExercicios = Array.isArray(rawTreino.exercicios) ? rawTreino.exercicios : [];

  if (rawExercicios.length === 0) {
    return {
      isValid: true,
      data: {
        mensagem,
        treino: null
      }
    };
  }

  // 3. Sanitizar e validar exercícios
  const sanitizedExercicios = [];
  const seenIds = new Set();

  for (const rawEx of rawExercicios) {
    if (!rawEx || typeof rawEx !== 'object') continue;

    // Verificar se o ID existe no catálogo
    let matchedCatalog = findExerciseInCatalog(rawEx.id) || findExerciseInCatalog(rawEx.nome);

    // Se a IA inventou um id ou nome inexistente, busca o exercício mais próximo que ainda não foi adicionado
    if (!matchedCatalog) {
      matchedCatalog = findNearestExercise(rawTreino.foco || 'Geral', '', seenIds);
    }

    if (!matchedCatalog) continue;

    // Evita exercícios duplicados no mesmo treino buscando alternativa no mesmo grupo
    if (seenIds.has(matchedCatalog.id)) {
      matchedCatalog = findNearestExercise(rawTreino.foco || matchedCatalog.grupo || 'Geral', '', seenIds);
      if (!matchedCatalog || seenIds.has(matchedCatalog.id)) continue;
    }
    seenIds.add(matchedCatalog.id);

    // Clamp de valores
    const series = Math.max(1, Math.min(6, Number(rawEx.series) || 3));
    const descanso_seg = Math.max(20, Math.min(240, Number(rawEx.descanso_seg) || 60));
    const reps = typeof rawEx.reps === 'string' && rawEx.reps.trim() !== ''
      ? rawEx.reps.trim()
      : (typeof rawEx.reps === 'number' ? String(rawEx.reps) : '8-12');

    sanitizedExercicios.push({
      id: matchedCatalog.id,
      nome: matchedCatalog.nome, // Sobrescreve com o nome oficial do catálogo
      grupo: matchedCatalog.grupo,
      porcao: matchedCatalog.porcao,
      equipamento: matchedCatalog.equipamento,
      series,
      reps,
      descanso_seg,
      cadencia: rawEx.cadencia ? String(rawEx.cadencia).trim() : '2-3s excêntrica',
      dica: rawEx.dica ? String(rawEx.dica).trim() : ''
    });

    if (sanitizedExercicios.length >= 9) break; // Máximo 9 exercícios
  }

  // Se após sanitização restarem menos de 2 exercícios válidos, anula o treino para evitar treino quebrado
  if (sanitizedExercicios.length < 2) {
    return {
      isValid: true,
      data: {
        mensagem,
        treino: null
      }
    };
  }

  const duracao_min = Math.max(15, Math.min(120, Number(rawTreino.duracao_min) || 45));

  return {
    isValid: true,
    data: {
      mensagem,
      treino: {
        nome: String(rawTreino.nome || 'Treino Personalizado AB Coach').trim(),
        foco: String(rawTreino.foco || 'Hipertrofia & Biomecânica').trim(),
        duracao_min,
        observacoes: rawTreino.observacoes ? String(rawTreino.observacoes).trim() : '',
        exercicios: sanitizedExercicios
      }
    }
  };
}
