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
  if (text.includes('abdómen') || text.includes('core') || text.includes('oblíquo')) return 'core / abdómen';

  return alvo || grupo;
}

/**
 * Catálogo completo compacto com os 348 exercícios oficiais
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

const MOVEMENT_PATTERNS = [
  ['fly', /crucifix|voador|peck[\s-]*deck|cross[\s-]*over|abertura|fly/i],
  ['press', /supino|press|desenvolvimento|flex[aã]o de bra[çc]o|mergulho|paralelas|dip/i],
  ['pull_vert', /puxada|pulldown|barra fixa|pull[\s-]*up|chin[\s-]*up/i],
  ['pull_row', /remada|row|serrote|pullover|face[\s-]*pull/i],
  ['hinge', /terra|deadlift|stiff|bom[\s-]*dia|good[\s-]*morning|eleva[çc][aã]o p[ée]lvica|hip[\s-]*thrust|flexora|mesa flexora|cadeira flexora/i],
  ['squat', /agachamento|squat|leg[\s-]*press|hack|afundo|passada|b[úu]lgar|extensora|cadeira extensora/i],
  ['curl', /rosca|curl|b[íi]ceps/i],
  ['extension', /tr[íi]ceps|testa|franc[eê]s|corda|coice|extens[aã]o/i],
  ['raise', /eleva[çc][aã]o|abdu[çc][aã]o|adutor|abdutor|encolhimento/i],
  ['calf', /panturrilha|g[êe]meo|s[óo]leo|calf/i],
  ['core', /abdom|prancha|plank|crunch|infra|obl[íi]quo|roda/i]
];

export function inferMovementPattern(nome = '') {
  const n = String(nome || '');
  const hit = MOVEMENT_PATTERNS.find(([, re]) => re.test(n));
  return hit ? hit[0] : null;
}

/**
 * Retorna uma lista de exercícios equivalentes para substituição biomecânica rápida (swap).
 * Pontua mesma porção (+4), mesmo tipo composto/isolador (+3), equipamento alternativo (+2)
 * e mesmo padrão de movimento inferido (+2), excluindo exercícios já presentes na sessão.
 */
export function getBiomechanicalSubstitutes(exerciseIdentifier, excludeIds = new Set()) {
  const current = findExerciseInCatalog(exerciseIdentifier);
  if (!current) return [];

  const excluded = excludeIds instanceof Set ? excludeIds : new Set(excludeIds || []);
  const currentId = current.id;
  const currentGroup = (current.grupo || '').toLowerCase();
  const currentPorcao = (current.porcao || '').toLowerCase();
  const currentTipo = (current.tipo || '').toLowerCase();
  const currentEquip = (current.equipamento || '').toLowerCase();
  const currentPattern = inferMovementPattern(current.nome);

  const candidates = EXERCISE_CATALOG.filter(
    (e) => e.id !== currentId && !excluded.has(e.id) && (e.grupo || '').toLowerCase() === currentGroup
  );

  return candidates
    .map((e) => {
      let score = 0;
      if ((e.porcao || '').toLowerCase() === currentPorcao) score += 4;
      if (currentTipo && (e.tipo || '').toLowerCase() === currentTipo) score += 3;
      if (currentEquip && (e.equipamento || '').toLowerCase() !== currentEquip) score += 2;
      if (currentPattern && inferMovementPattern(e.nome) === currentPattern) score += 2;
      return { item: e, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((entry) => entry.item);
}

