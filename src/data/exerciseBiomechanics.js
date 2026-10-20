/**
 * exerciseBiomechanics.js — AB Fitness
 * Hub central de dados biomecânicos auditados e verificados para os 320 exercícios.
 * Consolida anatomia aplicada, técnica padrão ouro, fases de movimento e benefícios fisiológicos.
 */

import { CHEST_BIOMECHANICS } from './biomechanics/chest.js';
import { BACK_BIOMECHANICS } from './biomechanics/back.js';
import { SHOULDERS_BIOMECHANICS } from './biomechanics/shoulders.js';
import { ARMS_BIOMECHANICS } from './biomechanics/arms.js';
import { LEGS_BIOMECHANICS } from './biomechanics/legs.js';
import { CORE_FUNCTIONAL_BIOMECHANICS } from './biomechanics/core_functional.js';

// Tabela mestre indexada por ID numérico (1 a 320)
export const EXERCISE_BIOMECHANICS = {
  ...CHEST_BIOMECHANICS,
  ...BACK_BIOMECHANICS,
  ...SHOULDERS_BIOMECHANICS,
  ...ARMS_BIOMECHANICS,
  ...LEGS_BIOMECHANICS,
  ...CORE_FUNCTIONAL_BIOMECHANICS
};

// Mapeamento de apelidos históricos / slugs legados do app para IDs definitivos
export const LEGACY_ALIASES = {
  // Peitoral
  'supino-halteres-soccer': 2, // Supino com halteres (ID 2 = inclinado com halteres, ou 101 = reto com halteres)
  'supino-reto-halteres': 101,
  'incline-dumbbell-soccer': 2,
  'supino-reto-barra': 1,
  'supino-inclinado-halteres': 2,
  'crossover-polia-alta': 6,
  'voador-peck-deck': 9,
  'flexao-de-braco': 11,
  'paralelas-foco-peito': 12,

  // Costas
  'puxada-alta-soccer': 15,
  'puxada-frontal-aberta': 15,
  'remada-serrote-soccer': 19,
  'remada-unilateral-serrote': 19,
  'barra-fixa-pronada': 13,
  'remada-curvada-barra': 17,
  'remada-baixa-cabo': 20,
  'levantamento-terra': 24,

  // Ombros
  'desenvolvimento-halteres': 28,
  'desenvolvimento-com-halteres': 28,
  'desenvolvimento-militar': 27,
  'elevacao-lateral-speed': 30,
  'elevacao-lateral-halteres': 30,
  'elevacao-lateral-polia': 31,
  'face-pull': 37,
  'crucifixo-invertido-halteres': 34,

  // Braços
  'rosca-w-soccer': 45,
  'rosca-direta-barra-w': 45,
  'rosca-direta-barra': 41,
  'rosca-alternada-halteres': 42,
  'rosca-martelo-halteres': 44,
  'rosca-martelo-soccer': 44,
  'triceps-corda-soccer': 53,
  'triceps-pulley-corda': 53,
  'triceps-pulley-barra': 51,
  'triceps-testa-barra-w': 54,
  'triceps-frances-halteres': 57,
  'triceps-frances-soccer': 57,

  // Pernas
  'bulgaro-soccer': 64, // Agachamento búlgaro
  'agachamento-bulgaro': 64,
  'agachamento-livre': 61,
  'agachamento-livre-barra': 61,
  'leg-press-45': 63,
  'cadeira-extensora': 65,
  'rdl-halteres': 73, // Romanian Deadlift com halteres
  'stiff-halteres': 73,
  'stiff-barra': 71,
  'mesa-flexora': 74,
  'cadeira-flexora': 75,
  'elevacao-pelvica-soccer': 78,
  'elevacao-pelvica-barra': 78,
  'panturrilha-explosiva': 84, // Panturrilha em pé
  'panturrilha-em-pe': 84,
  'panturrilha-sentado': 85,
  'copenhague-leves': 271,
  'adutor-copenhagen': 271,

  // Core & Mobilidade
  'prancha-rotacional': 276,
  'prancha-isometrica': 90,
  'crunch-solo': 90,
  'abdominal-crunch-chute': 90,
  'infra-paralela': 93,
  'mobilidade-9090-soccer': 315,
  'mobilidade-quadril-90-90': 315,
  'alongamento-isquiotibiais-dinamico': 318,
  'cat-cow': 310,
  'alongamento-peitoral': 316
};

// Índices para busca ultra-rápida em O(1)
const BY_SLUG = new Map();
const BY_NAME_NORM = new Map();

function normalizeStr(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

// Inicializa os índices
Object.values(EXERCISE_BIOMECHANICS).forEach((bio) => {
  if (bio.slug) {
    BY_SLUG.set(bio.slug.toLowerCase().trim(), bio);
  }
  if (bio.nome) {
    BY_NAME_NORM.set(normalizeStr(bio.nome), bio);
  }
});

/**
 * Retorna os dados biomecânicos completos de qualquer exercício.
 * Aceita: ID numérico (ex: 1), string de ID (ex: "64"), slug (ex: "agachamento-livre"),
 * alias histórico (ex: "bulgaro-soccer"), ou objeto do exercício completo.
 *
 * @param {number|string|object} exerciseOrId
 * @returns {object} Dados biomecânicos padrão ouro
 */
export function getBiomechanicsForExercise(exerciseOrId) {
  if (!exerciseOrId) {
    return getFallbackBiomechanics({ nome: 'Exercício', grupo: 'Geral' });
  }

  // 1. Se for um número direto
  if (typeof exerciseOrId === 'number') {
    if (EXERCISE_BIOMECHANICS[exerciseOrId]) {
      return EXERCISE_BIOMECHANICS[exerciseOrId];
    }
  }

  // 2. Se for uma string
  if (typeof exerciseOrId === 'string') {
    const rawStr = exerciseOrId.trim();
    const cleanLower = rawStr.toLowerCase();

    // 2a. Verifica apelido legado primeiro
    if (LEGACY_ALIASES[cleanLower]) {
      const targetId = LEGACY_ALIASES[cleanLower];
      if (EXERCISE_BIOMECHANICS[targetId]) {
        return EXERCISE_BIOMECHANICS[targetId];
      }
    }

    // 2b. Verifica se é um número serializado (ex: "61")
    const parsedNum = parseInt(cleanLower, 10);
    if (!isNaN(parsedNum) && String(parsedNum) === cleanLower && EXERCISE_BIOMECHANICS[parsedNum]) {
      return EXERCISE_BIOMECHANICS[parsedNum];
    }

    // 2c. Busca por slug exato
    if (BY_SLUG.has(cleanLower)) {
      return BY_SLUG.get(cleanLower);
    }

    // 2d. Busca por nome normalizado exato
    const norm = normalizeStr(rawStr);
    if (BY_NAME_NORM.has(norm)) {
      return BY_NAME_NORM.get(norm);
    }

    // 2e. Busca inteligente por inclusão
    for (const [keyNorm, bio] of BY_NAME_NORM.entries()) {
      if (keyNorm.includes(norm) || norm.includes(keyNorm)) {
        return bio;
      }
    }
  }

  // 3. Se for um objeto de exercício
  if (typeof exerciseOrId === 'object') {
    const ex = exerciseOrId;

    // 3a. Se tiver biomechanicsId explícito
    if (ex.biomechanicsId && EXERCISE_BIOMECHANICS[ex.biomechanicsId]) {
      return EXERCISE_BIOMECHANICS[ex.biomechanicsId];
    }

    // 3b. Se tiver id numérico
    if (typeof ex.id === 'number' && EXERCISE_BIOMECHANICS[ex.id]) {
      return EXERCISE_BIOMECHANICS[ex.id];
    }

    // 3c. Se tiver id string
    if (typeof ex.id === 'string') {
      const match = getBiomechanicsForExercise(ex.id);
      if (match && match.id) return match;
    }

    // 3d. Se tiver slug
    if (ex.slug) {
      const match = getBiomechanicsForExercise(ex.slug);
      if (match && match.id) return match;
    }

    // 3e. Se tiver nome ou name
    const exerciseName = ex.nome || ex.name;
    if (exerciseName) {
      const match = getBiomechanicsForExercise(exerciseName);
      if (match && match.id) return match;
    }

    return getFallbackBiomechanics(ex);
  }

  return getFallbackBiomechanics({ nome: 'Exercício', grupo: 'Geral' });
}

/**
 * Fallback seguro caso um exercício personalizado sem cadastro seja criado
 */
function getFallbackBiomechanics(exercise) {
  const nome = exercise.nome || exercise.name || 'Exercício Personalizado';
  const grupo = exercise.grupo || exercise.target || 'Musculatura Alvo';

  return {
    id: 0,
    slug: 'exercicio-personalizado',
    nome: nome,
    grupo: grupo,
    alvo: `${grupo} (Ativação Principal)`,
    sinergistas: 'Cadeia cinemática de estabilização e core',
    equipamento: exercise.equipment || 'Equipamento Livre / Máquina',
    posicao_inicial: 'Posicione-se com alinhamento articular neutro, pés bem apoiados e postura estável antes de iniciar o movimento.',
    concentrica: 'Aplique força contra a carga estendendo/flexionando a articulação alvo de forma consciente até o pico de contração.',
    excentrica: 'Retorne à posição inicial de forma lenta e controlada em 2 a 3 segundos, resistindo ao peso com o músculo sob tensão.',
    passos: [
      'Ajuste o equipamento ou posicione o peso com pegada firme e confortável.',
      'Estabilize a coluna vertebral, contraia o abdômen e respire adequadamente.',
      'Execute a fase concêntrica empurrando ou puxando a carga com aceleração constante.',
      'Controle a descida excêntrica sem deixar o peso despencar nem usar impulsos.'
    ],
    checkpoints: [
      'Coluna mantida em curvatura fisiológica natural (sem hiperextensão ou flexão excessiva).',
      'Articulações adjacentes estáveis sem desvios laterais descontrolados.',
      'Amplitude de movimento completa e sem rebote no final da trajetória.'
    ],
    respiracao: 'Inspire profundamente na fase excêntrica (ao resistir ao peso); expire vigorosamente na fase concêntrica (ao vencer a resistência).',
    erro_comum: 'Usar carga excessiva que sacrifique a técnica e obrigue o corpo a realizar balanços e compensações articulares perigosas.',
    beneficio: 'Promove sobrecarga mecânica progressiva com alta ativação das fibras musculares, estimulando síntese proteica e adaptação neural segura.'
  };
}
