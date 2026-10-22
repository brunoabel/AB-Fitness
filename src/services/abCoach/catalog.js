/**
 * catalog.js — AB Coach
 * Catálogo compacto de exercícios gerado a partir dos dados biomecânicos oficiais do AB Fitness.
 * Cada exercício possui apenas campos essenciais para o raciocínio da IA:
 * { id, nome, grupo, porcao, equipamento, tipo }
 */

import { EXERCISE_BIOMECHANICS } from '../../data/exerciseBiomechanics.js';
import { EXERCISES_100 } from '../../data/exercises100.js';

// Mapa auxiliar de mecânica (Composto / Isolado) a partir do EXERCISES_100
const EX100_MAP = new Map(EXERCISES_100.map((ex) => [ex.id, ex]));

/**
 * Normaliza a porção muscular com base no campo 'alvo' anatômico e 'grupo'
 */
function normalizePorcao(alvo = '', grupo = '') {
  const text = alvo.toLowerCase();

  // Peitoral
  if (text.includes('clavicular') || (text.includes('superior') && grupo === 'Peito')) return 'clavicular';
  if (text.includes('costal') || (text.includes('inferior') && grupo === 'Peito')) return 'costal';
  if (text.includes('esternal') || text.includes('esternocostal') || text.includes('média')) return 'esternocostal';

  // Membros Inferiores
  if (text.includes('quadríceps') || text.includes('vasto') || text.includes('reto femoral')) return 'quadríceps';
  if (text.includes('isquiotibiais') || text.includes('bíceps femoral') || text.includes('posterior')) return 'posteriores';
  if (text.includes('glúteo')) return 'glúteos';
  if (text.includes('panturrilha') || text.includes('gastrocnêmio') || text.includes('sóleo')) return 'panturrilhas';
  if (text.includes('adutor')) return 'adutores';

  // Ombros
  if (text.includes('deltoide lateral')) return 'deltoide lateral';
  if (text.includes('deltoide posterior') || text.includes('manguito')) return 'deltoide posterior';
  if (text.includes('deltoide anterior')) return 'deltoide anterior';

  // Costas
  if (text.includes('latíssimo') || text.includes('largura')) return 'latíssimo';
  if (text.includes('espessura') || text.includes('romboide') || text.includes('trapézio')) return 'romboides / espessura';
  if (text.includes('lombar') || text.includes('ereto')) return 'lombar';

  // Braços
  if (text.includes('bíceps') || text.includes('braquial')) return 'bíceps';
  if (text.includes('tríceps')) return 'tríceps';
  if (text.includes('antebraço')) return 'antebraço';

  // Core & Funcional
  if (text.includes('abdômen') || text.includes('core') || text.includes('oblíquo')) return 'core / abdômen';

  return alvo || grupo;
}

/**
 * Catálogo completo compacto com os 320 exercícios oficiais
 */
export const EXERCISE_CATALOG = Object.values(EXERCISE_BIOMECHANICS).map((item) => {
  const meta = EX100_MAP.get(item.id) || {};
  return {
    id: item.slug || String(item.id),
    numericId: item.id,
    nome: item.nome,
    grupo: item.grupo,
    porcao: normalizePorcao(item.alvo, item.grupo),
    equipamento: item.equipamento || 'Livre / Máquina',
    tipo: meta.mecanica === 'Composto' ? 'composto' : 'isolador'
  };
});

/**
 * Índices para buscas em O(1)
 */
export const CATALOG_BY_ID = new Map();
export const CATALOG_BY_NUMERIC_ID = new Map();
export const CATALOG_BY_NAME_LOWER = new Map();

EXERCISE_CATALOG.forEach((ex) => {
  CATALOG_BY_ID.set(ex.id, ex);
  if (ex.numericId) {
    CATALOG_BY_NUMERIC_ID.set(ex.numericId, ex);
    CATALOG_BY_ID.set(String(ex.numericId), ex);
  }
  CATALOG_BY_NAME_LOWER.set(ex.nome.toLowerCase().trim(), ex);
});

/**
 * Localiza um exercício no catálogo por ID (slug), ID numérico ou nome
 */
export function findExerciseInCatalog(identifier) {
  if (!identifier) return null;

  // 1. Busca por slug ou string id
  if (CATALOG_BY_ID.has(identifier)) {
    return CATALOG_BY_ID.get(identifier);
  }

  // 2. Busca por ID numérico
  const asNumber = Number(identifier);
  if (!isNaN(asNumber) && CATALOG_BY_NUMERIC_ID.has(asNumber)) {
    return CATALOG_BY_NUMERIC_ID.get(asNumber);
  }

  // 3. Busca por nome (case-insensitive)
  const asName = String(identifier).toLowerCase().trim();
  if (CATALOG_BY_NAME_LOWER.has(asName)) {
    return CATALOG_BY_NAME_LOWER.get(asName);
  }

  return null;
}

/**
 * Encontra o exercício mais próximo dentro do mesmo grupo/porção caso um id seja inválido,
 * garantindo que não retorne um exercício que já está no treino.
 */
export function findNearestExercise(grupo = '', porcao = '', excludeIds = new Set()) {
  const g = (grupo || '').toLowerCase();
  const p = (porcao || '').toLowerCase();

  const matchBoth = EXERCISE_CATALOG.find(
    (e) => !excludeIds.has(e.id) && e.grupo?.toLowerCase() === g && e.porcao?.toLowerCase() === p
  );
  if (matchBoth) return matchBoth;

  const matchGroup = EXERCISE_CATALOG.find(
    (e) => !excludeIds.has(e.id) && e.grupo?.toLowerCase() === g
  );
  if (matchGroup) return matchGroup;

  return EXERCISE_CATALOG.find((e) => !excludeIds.has(e.id)) || EXERCISE_CATALOG[0];
}

/**
 * Formata o catálogo de forma ultracompacta para injeção no prompt do Gemini
 */
export function formatCatalogForPrompt() {
  return EXERCISE_CATALOG.map(
    (e) => `${e.id}|${e.nome}|${e.grupo}|${e.porcao}|${e.equipamento}|${e.tipo}`
  ).join('\n');
}
