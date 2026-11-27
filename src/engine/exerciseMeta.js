/**
 * Metadados de treino de cada exercício do catálogo (508): padrão de movimento, classe de prescrição, tipo de carga,
 * carga axial, músculos com peso fracionado (1 = alvo, 0.5 = sinergista), ênfase em comprimento longo, nível técnico,
 * contraindicações por articulação, equipamento necessário e grupo de substituição.
 *
 * Duas fontes: regras por grupo muscular e nome (deriveMeta) para todo o catálogo, e entradas escritas à mão (META)
 * que se sobrepõem nos campos que definem. Revisão: scripts/review_exercise_meta.mjs lista tudo para conferir.
 * Ver docs/TRAINING_SCIENCE_AUDIT.md, secção 2.
 */
import { getCatalogEntry } from '../data/exerciseMedia.js';
import { findExerciseIn100 } from '../data/exercises100.js';

/** @typedef {'heavy'|'compound'|'isolation'|'timed'} RepClass */
/** @typedef {'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'bands'} LoadType */
/** @typedef {'shoulder'|'lower_back'|'knee'|'wrist_elbow'|'hip'} Joint */
/**
 * @typedef {Object} ExerciseMeta
 * @property {string|null} pattern
 * @property {RepClass} repClass
 * @property {LoadType} loadType
 * @property {number} axial 1 (sem carga na coluna) a 5 (agachamento/terra com barra)
 * @property {Record<string, number>} muscles
 * @property {boolean} unilateral
 * @property {0|1|2} lengthened 2 = tensão máxima com o músculo alongado
 * @property {'beginner'|'intermediate'|'advanced'} skill
 * @property {Partial<Record<Joint, 'avoid'|'caution'>>} contra
 * @property {string[]} equipment itens do inventário necessários
 * @property {string|null} group grupo de substituição (padrão:músculo principal)
 */

/** Músculos usados no orçamento de volume. */
export const MUSCLES = ['chest', 'back', 'front_delt', 'side_delt', 'rear_delt', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'abs', 'lower_back', 'traps'];

export const MUSCLE_LABEL = {
  chest: 'Peito', back: 'Costas', front_delt: 'Deltoide anterior', side_delt: 'Deltoide lateral', rear_delt: 'Deltoide posterior',
  biceps: 'Bíceps', triceps: 'Tríceps', forearms: 'Antebraços', quads: 'Quadríceps', hamstrings: 'Posteriores', glutes: 'Glúteos',
  adductors: 'Adutores', calves: 'Gêmeos', abs: 'Abdômen', lower_back: 'Lombar', traps: 'Trapézio'
};

/** Itens de equipamento do inventário (onboarding "Casa com equipamento"). */
export const EQUIPMENT_ITEMS = ['dumbbell', 'kettlebell', 'bench', 'pull_up_bar', 'bands', 'barbell', 'box', 'stability_ball', 'medicine_ball', 'foam_roller', 'rings', 'ab_wheel', 'jump_rope'];

const m = (pattern, repClass, loadType, axial, muscles, unilateral = false) => ({ pattern, repClass, loadType, axial, muscles, unilateral });

/** Entradas escritas à mão (exercícios dos modelos de plano). Sobrepõem-se às regras. */
const META = {
  'supino-reto-barra': m('horizontal_push', 'heavy', 'barbell', 1, { chest: 1, front_delt: 0.5, triceps: 0.5 }),
  'supino-inclinado-halteres': m('horizontal_push', 'compound', 'dumbbell', 1, { chest: 1, front_delt: 0.5, triceps: 0.5 }),
  'paralelas-foco-peito': m('horizontal_push', 'compound', 'bodyweight', 1, { chest: 1, triceps: 0.5, front_delt: 0.5 }),
  'crossover-polia-alta': m('chest_fly', 'isolation', 'cable', 1, { chest: 1 }),
  'crucifixo-inclinado-halteres': m('chest_fly', 'isolation', 'dumbbell', 1, { chest: 1 }),

  'puxada-frontal-aberta': m('vertical_pull', 'compound', 'cable', 1, { back: 1, biceps: 0.5 }),
  'puxada-com-triangulo': m('vertical_pull', 'compound', 'cable', 1, { back: 1, biceps: 0.5 }),
  'barra-fixa-pronada': m('vertical_pull', 'compound', 'bodyweight', 1, { back: 1, biceps: 0.5 }),
  'pulldown-com-corda': m('shoulder_extension', 'isolation', 'cable', 1, { back: 1 }),
  'remada-curvada-barra': m('horizontal_pull', 'compound', 'barbell', 3, { back: 1, biceps: 0.5, rear_delt: 0.5 }),
  'remada-cavalinho': m('horizontal_pull', 'compound', 'barbell', 3, { back: 1, biceps: 0.5, rear_delt: 0.5 }),
  'remada-baixa-cabo': m('horizontal_pull', 'compound', 'cable', 1, { back: 1, biceps: 0.5, rear_delt: 0.5 }),
  'remada-unilateral-serrote': m('horizontal_pull', 'compound', 'dumbbell', 1, { back: 1, biceps: 0.5, rear_delt: 0.5 }, true),

  'desenvolvimento-militar': m('vertical_push', 'heavy', 'barbell', 3, { front_delt: 1, side_delt: 0.5, triceps: 0.5 }),
  'desenvolvimento-com-halteres': m('vertical_push', 'compound', 'dumbbell', 2, { front_delt: 1, side_delt: 0.5, triceps: 0.5 }),
  'elevacao-lateral-halteres': m('shoulder_abduction', 'isolation', 'dumbbell', 1, { side_delt: 1 }),
  'elevacao-lateral-polia': m('shoulder_abduction', 'isolation', 'cable', 1, { side_delt: 1 }),
  'face-pull': m('shoulder_horizontal_abduction', 'isolation', 'cable', 1, { rear_delt: 1, traps: 0.5 }),
  'crucifixo-invertido-maquina': m('shoulder_horizontal_abduction', 'isolation', 'machine', 1, { rear_delt: 1 }),

  'rosca-direta-barra': m('elbow_flexion', 'isolation', 'barbell', 1, { biceps: 1 }),
  'rosca-martelo-cruzada-cross-body': m('elbow_flexion', 'isolation', 'dumbbell', 1, { biceps: 1, forearms: 0.5 }),
  'rosca-scott-maquina': m('elbow_flexion', 'isolation', 'machine', 1, { biceps: 1 }),
  'rosca-concentrada': m('elbow_flexion', 'isolation', 'dumbbell', 1, { biceps: 1 }, true),
  'triceps-testa-barra-w': m('elbow_extension', 'isolation', 'barbell', 1, { triceps: 1 }),
  'triceps-corda': m('elbow_extension', 'isolation', 'cable', 1, { triceps: 1 }),
  'triceps-pulley-barra-reta': m('elbow_extension', 'isolation', 'cable', 1, { triceps: 1 }),

  'agachamento-livre': m('knee_dominant', 'heavy', 'barbell', 5, { quads: 1, glutes: 0.5, adductors: 0.5 }),
  'leg-press-45': m('knee_dominant', 'compound', 'machine', 1, { quads: 1, glutes: 0.5, adductors: 0.5 }),
  'passada-walking-lunges': m('knee_dominant', 'compound', 'dumbbell', 2, { quads: 1, glutes: 0.5, adductors: 0.5 }, true),
  'agachamento-bulgaro': m('knee_dominant', 'compound', 'dumbbell', 2, { quads: 1, glutes: 0.5, adductors: 0.5 }, true),
  'cadeira-extensora': m('knee_extension', 'isolation', 'machine', 1, { quads: 1 }),
  'stiff-com-barra': m('hip_hinge', 'heavy', 'barbell', 4, { hamstrings: 1, glutes: 0.5, lower_back: 0.5 }),
  'stiff-com-halteres': m('hip_hinge', 'compound', 'dumbbell', 3, { hamstrings: 1, glutes: 0.5, lower_back: 0.5 }),
  'ponte-gluteos-barra-glute-bridge': m('hip_extension', 'compound', 'barbell', 2, { glutes: 1, hamstrings: 0.5 }),
  'mesa-flexora': m('knee_flexion', 'isolation', 'machine', 1, { hamstrings: 1 }),
  'cadeira-flexora': m('knee_flexion', 'isolation', 'machine', 1, { hamstrings: 1 }),
  'cadeira-abdutora': m('hip_abduction', 'isolation', 'machine', 1, { glutes: 0.5 }),
  'gemeos-em-pe-maquina': m('calf', 'isolation', 'machine', 2, { calves: 1 }),
  'gemeos-sentado': m('calf', 'isolation', 'machine', 1, { calves: 1 }),

  'prancha-isometrica': m('core_anti_extension', 'timed', 'bodyweight', 1, { abs: 1 }),
  'crunch-polia': m('core_flexion', 'isolation', 'cable', 1, { abs: 1 })
};

/** Correções pontuais às regras, conferidas na revisão (só os campos indicados). */
const OVERRIDES = {
  'rack-pull': { pattern: 'hip_hinge', axial: 4 },
  'remada-alta-halteres': { pattern: 'upright_row' },
  'remada-alta-polia-baixa': { pattern: 'upright_row' },
  'remada-alta-sentada-v': { pattern: 'horizontal_pull' },
  'remada-alta-argolas': { pattern: 'horizontal_pull' },
  'remada-alta-deltoide-posterior-elastico': { pattern: 'shoulder_horizontal_abduction' },
  'abertura-elastico-pull-apart': { pattern: 'shoulder_horizontal_abduction' },
  'remada-deltoide-posterior-halteres': { pattern: 'shoulder_horizontal_abduction' },
  'remada-deltoide-posterior-polia': { pattern: 'shoulder_horizontal_abduction' },
  'elevacoes-ytw-deitado': { pattern: 'shoulder_horizontal_abduction' },
  'svend-press-anilha': { pattern: 'chest_fly' },
  'pullover-halter': { pattern: 'shoulder_extension' },
  'pullover-barra': { pattern: 'shoulder_extension' },
  'pullover-maquina': { pattern: 'shoulder_extension' },
  'puxada-bracos-retos-straight-arm': { pattern: 'shoulder_extension' },
  'pulldown-com-barra': { pattern: 'shoulder_extension' },
  'thruster-halteres': { pattern: 'power' },
  'thruster-barra': { pattern: 'power' },
  'push-press-barra': { pattern: 'vertical_push' },
  'push-press-halteres': { pattern: 'vertical_push' },
  'flexao-pike-ombros': { pattern: 'vertical_push' },
  'landmine-press': { pattern: 'vertical_push', axial: 2, repClass: 'compound', contra: { shoulder: 'caution' } },
  'barra-supinada-assistida-maquina': { pattern: 'vertical_pull' },
  'sissy-squat-carga-peito': { axial: 1, loadType: 'dumbbell' },
  'agachamento-landmine': { axial: 2, repClass: 'compound' },
  'flexao-deficit-blocos': { loadType: 'bodyweight', repClass: 'compound' },
  'rosca-drag-curl-barra': { loadType: 'barbell' },
  'remada-alta': { pattern: 'upright_row', loadType: 'barbell' },
  'pulo-corda-jump-rope': { loadType: 'bodyweight', equipment: ['jump_rope'] },
  'empurrar-treno-sled-push': { equipment: ['gym'] },
  'remada-cavalinho-maquina-apoiada': { contra: {} },
  'remada-cavalinho-unilateral': { equipment: ['gym'] },
  'toes-to-bar-pes-barra': { loadType: 'bodyweight' },
  'limpador-para-brisa-barra-wipers': { loadType: 'bodyweight' },
  'abdominal-russo-russian-twist': { loadType: 'bodyweight' }
};

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const has = (n, re) => re.test(n);

const GROUP_MUSCLE = {
  Peito: 'chest', Costas: 'back', 'Bíceps': 'biceps', 'Tríceps': 'triceps', 'Quadríceps': 'quads', Posteriores: 'hamstrings',
  'Glúteos': 'glutes', Panturrilhas: 'calves', 'Abdômen': 'abs', 'Antebraços': 'forearms', 'Trapézio': 'traps', Adutores: 'adductors'
};

/** Padrão de movimento a partir do grupo e do nome normalizado. */
function patternOf(group, n, compound) {
  if (group === 'Mobilidade') return 'mobility';
  if (group === 'Funcional & Cardio') {
    if (has(n, /swing|snatch|arranque|clean|thruster|turco|get-up/)) return 'power';
    if (has(n, /fazendeiro|mala|carry/)) return 'carry';
    return 'conditioning';
  }
  if (group === 'Peito') {
    if (has(n, /crucifixo|crossover|voador|peck|fly|svend/)) return 'chest_fly';
    return 'horizontal_push';
  }
  if (group === 'Costas') {
    if (has(n, /bracos retos|straight|pullover|pulldown com/)) return 'shoulder_extension';
    if (has(n, /puxada|barra fixa|barra supinada|chin|pull-up|pulldown/)) return 'vertical_pull';
    if (has(n, /terra|deadlift|rack pull|good morning/)) return 'hip_hinge';
    if (has(n, /hiperextensao|extensao lombar|super-homem|superman/)) return 'back_extension';
    if (has(n, /encolhimento/)) return 'shrug';
    return 'horizontal_pull';
  }
  if (group === 'Ombros') {
    if (has(n, /rotacao (externa|interna)|manguito|halo/)) return 'shoulder_rotation';
    if (has(n, /invertido|posterior|face pull|passaro|pull-apart|abertura|y-t-w/)) return 'shoulder_horizontal_abduction';
    if (has(n, /remada alta/)) return 'upright_row';
    if (has(n, /(^|[^a-z])lateral|iron cross|elevacao y|y-raise/)) return 'shoulder_abduction';
    if (has(n, /frontal|front raise|plate raise/)) return 'shoulder_flexion';
    return 'vertical_push';
  }
  if (group === 'Bíceps') return 'elbow_flexion';
  if (group === 'Tríceps') {
    if (compound) return has(n, /paralela|mergulho/) ? 'horizontal_push' : 'horizontal_push';
    return 'elbow_extension';
  }
  if (group === 'Antebraços') {
    if (has(n, /fazendeiro|caminhada/)) return 'carry';
    if (has(n, /suspensao|dead hang|pincamento|pinch/)) return 'grip';
    return 'wrist';
  }
  if (group === 'Quadríceps') {
    if (has(n, /extensora|extensao terminal|nordico reverso/)) return 'knee_extension';
    return 'knee_dominant';
  }
  if (group === 'Posteriores') {
    if (has(n, /flexora|nordic|glute ham|deslizante/)) return 'knee_flexion';
    return 'hip_hinge';
  }
  if (group === 'Glúteos') {
    if (has(n, /abdu|clamshell|ostra|hidrante|monster|fire hydrant/)) return 'hip_abduction';
    if (has(n, /cruzado|curtsy|bulgaro|agachamento|sumo|leg press/)) return 'knee_dominant';
    if (has(n, /stiff|terra/)) return 'hip_hinge';
    return 'hip_extension';
  }
  if (group === 'Panturrilhas') return has(n, /tibial|dorsiflex/) ? 'tibialis' : 'calf';
  if (group === 'Adutores') return has(n, /sumo/) ? 'knee_dominant' : 'hip_adduction';
  if (group === 'Trapézio') return has(n, /encolhimento|shrug/) ? 'shrug' : 'scapular';
  if (group === 'Abdômen') {
    if (has(n, /prancha lateral|flexao lateral|mala|suitcase/)) return 'core_lateral';
    if (has(n, /pallof/)) return 'core_anti_rotation';
    if (has(n, /russo|twist|lenhador|woodchop|rotacao|moinho|landmine|limpador|wiper|bicicleta|obliquo/)) return 'core_rotation';
    if (has(n, /prancha|roda|rollout|dead ?bug|hollow|bird|vacuo|stir|caminhada do urso/)) return 'core_anti_extension';
    return 'core_flexion';
  }
  return null;
}

/** Músculos com peso fracionado por padrão (o músculo principal vem do grupo). */
function musclesOf(pattern, primary) {
  const out = primary ? { [primary]: 1 } : {};
  const add = (k, w) => { if (!out[k]) out[k] = w; };
  switch (pattern) {
    case 'horizontal_push': add('chest', primary === 'chest' ? 1 : 0.5); add('front_delt', 0.5); add('triceps', 0.5); break;
    case 'vertical_push': add('front_delt', 1); add('side_delt', 0.5); add('triceps', 0.5); break;
    case 'horizontal_pull': add('back', 1); add('biceps', 0.5); add('rear_delt', 0.5); break;
    case 'vertical_pull': add('back', 1); add('biceps', 0.5); break;
    case 'upright_row': add('side_delt', 1); add('traps', 0.5); break;
    case 'knee_dominant': add('quads', 1); add('glutes', 0.5); add('adductors', 0.5); break;
    case 'hip_hinge': add('hamstrings', 1); add('glutes', 0.5); add('lower_back', 0.5); break;
    case 'hip_extension': add('glutes', 1); add('hamstrings', 0.5); break;
    case 'back_extension': return { lower_back: 1, glutes: 0.5, hamstrings: 0.5 };
    case 'hip_abduction': return { glutes: 0.5 };
    case 'carry': add('forearms', 1); add('traps', 0.5); add('abs', 0.5); break;
    case 'power': add('glutes', 0.5); add('quads', 0.5); add('hamstrings', 0.5); break;
    case 'mobility': case 'conditioning': return {};
    default: break;
  }
  return out;
}

function shoulderMuscle(pattern) {
  if (pattern === 'shoulder_horizontal_abduction' || pattern === 'shoulder_rotation') return 'rear_delt';
  if (pattern === 'shoulder_abduction' || pattern === 'upright_row') return 'side_delt';
  return 'front_delt';
}

const TIMED = /\d\s*s\b|seg|metros|\bm\b|\d+m\b|passos|subidas|tiro/i;

function axialOf(pattern, loadType, n) {
  if (loadType === 'barbell') {
    if (pattern === 'knee_dominant' && !has(n, /afundo|passada|bulgaro|step|lunge/)) return 5;
    if (pattern === 'hip_hinge' && has(n, /terra|deadlift|rack/) && !has(n, /romeno|rdl/)) return 5;
    if (pattern === 'hip_hinge') return 4;
    if (pattern === 'horizontal_pull' && has(n, /curvada|pendlay|yates|cavalinho|meadows/)) return 3;
    if (pattern === 'vertical_push' || pattern === 'power' || pattern === 'knee_dominant') return 3;
    if (pattern === 'shrug' || pattern === 'carry') return 3;
    return 1;
  }
  if (has(n, /smith/) && pattern === 'knee_dominant') return 3;
  if ((pattern === 'hip_hinge' && (loadType === 'dumbbell' || loadType === 'machine')) || has(n, /fazendeiro|hexagonal/)) return 3;
  if (pattern === 'knee_dominant' && loadType === 'dumbbell') return 2;
  if (has(n, /hack|treno|sled/)) return 2;
  return 1;
}

function lengthenedOf(pattern, n) {
  if (has(n, /frances|katana|overhead|acima da cabeca|incline.*triceps|triceps.*inclinad/)) return 2;
  if (has(n, /cadeira flexora|nordic|nordico|bayesian|bayesiana|banco inclinado 45|rosca direta inclinada|inclinado com halteres$|por tras|pullover|sissy|bulgaro|deficit|donkey|burrinho|step com halteres|crucifixo|paralelas|mergulho|good morning|stiff|rdl|romeno/)) return 2;
  if (has(n, /testa|scott|preacher|crossover|mesa flexora|agachamento livre|frontal|pausa|leg press|extensora|gemeos|panturrilha|puxada|aranha|spider|y no banco|alongamento/)) return 1;
  if (pattern === 'mobility') return 2;
  return 0;
}

function skillOf(pattern, n, loadType) {
  if (has(n, /snatch|arranque|clean|turco|get-up|pistol|dragon flag|toes to bar|arqueiro|archer|salto em profundidade|depth|overhead squat|agachamento overhead|zercher|larsen|spoto|jm press|california|moinho|windmill|em pe \(advanced|kroc|meadows|nordico|nordic|reverse nordic|carga adicional|copenhagen|pendlay/)) return 'advanced';
  if (loadType === 'barbell' && ['knee_dominant', 'hip_hinge', 'horizontal_pull', 'vertical_push', 'power'].includes(pattern)) return 'intermediate';
  if (has(n, /barra fixa|paralelas|salto|box jump|swing|landmine|bulgaro|kettlebell|burpee|v-up|canivete|suspensao|knee to elbow|limpador|pike|renegada|roda abdominal|hollow|good morning|trap bar|hexagonal/)) return 'intermediate';
  return 'beginner';
}

function contraOf(pattern, n, axial, loadType) {
  const c = {};
  if (pattern === 'mobility') return c;
  // Ombro: empurrar acima da cabeça, remada alta, mergulhos e movimentos atrás da nuca
  if (pattern === 'vertical_push' || pattern === 'upright_row' || has(n, /atras da nuca|\bparalelas\b|mergulho|arnold|push press|snatch|arranque|agachamento overhead|haney|barra por tras/)) c.shoulder = 'avoid';
  else if (pattern === 'horizontal_push' && loadType === 'barbell') c.shoulder = 'caution';
  // Lombar: carga axial alta, remadas curvadas, good morning e levantamentos olímpicos
  const barbellBend = loadType === 'barbell' && has(n, /good morning|remada curvada|pendlay|yates|cavalinho|meadows/);
  if (axial >= 4 || barbellBend || has(n, /clean|snatch|arranque|thruster com barra|swing|hiperextensao.*peso|jefferson/)) c.lower_back = 'avoid';
  else if (has(n, /good morning|remada curvada|cavalinho/)) c.lower_back = 'caution';
  else if (pattern === 'hip_hinge' || axial === 3 || has(n, /abdominal completo|sit-up|canivete|v-up/)) c.lower_back = 'caution';
  // Joelho: impacto, flexão profunda unilateral e cisalhamento alto
  if (has(n, /salto|jump|pliometr|pistol|sissy|afundo|passada|lunge|bulgaro|split|cocoras|deep squat|nordico reverso|reverse nordic|skater|patinador|tuck|burpee|polichinelo|pulo de corda/)) c.knee = 'avoid';
  else if (pattern === 'knee_dominant' || pattern === 'knee_extension' || has(n, /step-up|step up/)) c.knee = 'caution';
  // Punho/cotovelo: extensões com barra, Scott, pegadas fechadas, mergulhos e punho
  if (has(n, /testa|scott|preacher|supino fechado|jm press|california|punho|wrist|mergulho|\bparalelas\b|diamante|tate/)) c.wrist_elbow = 'avoid';
  else if (has(n, /rosca direta com barra|rosca 21|barra reta/)) c.wrist_elbow = 'caution';
  // Quadril: afundos, abertura ampla e adução/abdução com carga
  if (has(n, /afundo|passada|lunge|bulgaro|split|sumo|cossack|abdutora|adutora|abducao|aducao|pistol|copenhagen|90\/90|borboleta/)) c.hip = 'avoid';
  else if (pattern === 'hip_hinge' || pattern === 'knee_dominant') c.hip = 'caution';
  return c;
}

function equipmentOf(n, loadType, pattern) {
  const out = new Set();
  if (loadType === 'machine' || loadType === 'cable') out.add('gym');
  if (has(n, /smith|leg press|maquina|cadeira (extensora|flexora|abdutora|adutora)|mesa flexora|hack|pendulo|treno|sled|assault|remo seco|polia|cabo|crossover|cadeira romana/)) out.add('gym');
  // Anilha conta como halter: quem tem halteres ajustáveis tem anilhas
  if (loadType === 'barbell') out.add(has(n, /anilha|plate/) && !has(n, /barra/) ? 'dumbbell' : 'barbell');
  if (has(n, /kettlebell/) && !has(n, /halter ou kettlebell/)) out.add('kettlebell');
  else if (loadType === 'dumbbell' || has(n, /halter|halteres|anilha/)) out.add('dumbbell');
  const flyOnBench = has(n, /crucifixo/) && (loadType === 'dumbbell' || has(n, /banco/));
  if ((flyOnBench || has(n, /supino|banco|apoiada|seal row|hip thrust|elevacao pelvica|scott|tate|reclinado|rosca aranha|spider curl/)) && !has(n, /chao|solo|maquina|smith|romano|45/)) out.add('bench');
  if (has(n, /banco romano|hiperextensao|extensao lombar \(banco/)) out.add('gym');
  if (has(n, /barra fixa|suspensao|knee to elbow|toes to bar|limpador|elevacao de pernas em suspensao|escapular na barra|dead hang/)) out.add('pull_up_bar');
  if (has(n, /elastico|mini band|\bbands?\b/)) out.add('bands');
  if (has(n, /caixa|step-up|step up|salto na caixa|no step|degrau/)) out.add('box');
  if (has(n, /bola medicinal|medicine|slam ball|wall ball/)) out.add('medicine_ball');
  if (has(n, /bola suica/)) out.add('stability_ball');
  if (has(n, /rolo/) && !has(n, /punho/)) out.add('foam_roller');
  if (has(n, /rolo de punho|wrist roller/)) out.add('gym');
  if (has(n, /argola/)) out.add('rings');
  if (has(n, /roda abdominal|ab wheel/)) out.add('ab_wheel');
  if (has(n, /hexagonal|trap bar/)) out.add('gym');
  if (has(n, /landmine|corda naval|battle/)) out.add('gym');
  if (has(n, /pulo de corda|jump rope/)) out.add('jump_rope');
  if (has(n, /paralelas/) && !has(n, /cadeira/)) out.add('gym');
  if (pattern === 'mobility' && has(n, /bastao/)) out.add('bands');
  if (out.has('box')) out.delete('bench');
  if (out.has('stability_ball')) out.delete('bench');
  return [...out];
}

/**
 * Metadados derivados do catálogo por regras.
 * @returns {ExerciseMeta|null}
 */
export function deriveMeta(entry, libraryEntry, manual = null) {
  if (!entry) return null;
  const n = norm(entry.name);
  const group = entry.primary_muscle;
  const compound = libraryEntry?.mecanica === 'Composto' || libraryEntry?.mecanica === 'Funcional';
  const pattern = OVERRIDES[entry.id]?.pattern || patternOf(group, n, compound);
  const primary = group === 'Ombros' ? shoulderMuscle(pattern) : GROUP_MUSCLE[group] || null;
  const ov = OVERRIDES[entry.id] || {};
  const dip = has(n, /\bparalelas\b|mergulho/) && !has(n, /maquina/);
  const loadType = ov.loadType || manual?.loadType || (dip ? 'bodyweight' : entry.equipment || 'bodyweight');
  const timed = TIMED.test(String(libraryEntry?.reps || '')) || ['mobility', 'conditioning', 'carry', 'grip'].includes(pattern) || has(n, /isometri|prancha|hollow|wall sit|parede \(wall|vacuo|hold/);
  const heavyPatterns = ['knee_dominant', 'hip_hinge', 'horizontal_push', 'vertical_push', 'horizontal_pull'];
  const unilateral = has(n, /unilateral|serrote|bulgaro|passada|afundo|single|kroc|pistol|alternad|step-up|step up/);
  const repClass = ov.repClass || (timed ? 'timed' : compound ? (loadType === 'barbell' && heavyPatterns.includes(pattern) && !unilateral ? 'heavy' : 'compound') : 'isolation');
  const axial = ov.axial ?? manual?.axial ?? axialOf(pattern, loadType, n);
  return {
    pattern,
    repClass,
    loadType,
    axial,
    muscles: musclesOf(pattern, primary),
    unilateral,
    lengthened: lengthenedOf(pattern, n),
    skill: skillOf(pattern, n, loadType),
    contra: ov.contra || contraOf(pattern, n, axial, loadType),
    equipment: ov.equipment || equipmentOf(n, loadType, pattern),
    group: pattern ? `${pattern}:${primary || group}` : null
  };
}

const cache = new Map();

/**
 * Metadados de um exercício (objeto do plano, slug ou id).
 * @returns {ExerciseMeta|null}
 */
export function getExerciseMeta(exercise) {
  const entry = getCatalogEntry(exercise);
  const key = entry?.id || (typeof exercise === 'object' ? exercise?.id : exercise);
  if (key && cache.has(key)) return cache.get(key);
  let meta = null;
  if (entry) {
    const manual = META[entry.id];
    const derived = deriveMeta(entry, findExerciseIn100(entry.id), manual);
    meta = manual ? { ...derived, ...manual, group: `${manual.pattern}:${Object.keys(manual.muscles).find((k) => manual.muscles[k] === 1) || derived.group}` } : derived;
  }
  if (key) cache.set(key, meta);
  return meta;
}

export const hasManualMeta = (id) => Boolean(META[id]);
