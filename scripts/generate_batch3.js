/**
 * generate_batch3.js — AB Fitness
 * Gera src/data/exerciseVideos.js adicionando o LOTE 3 (37 novos exercícios verificados)
 * Total acumulado: 122 + 37 = 159 exercícios auditados com vídeo Ultra HD
 */

import fs from 'fs';
import path from 'path';
import { VERIFIED_EXERCISE_VIDEOS as EXISTING_122 } from '../src/data/exerciseVideos.js';
import { EXERCISE_BIOMECHANICS } from '../src/data/exerciseBiomechanics.js';

const external = JSON.parse(fs.readFileSync('scripts/external_exercises.json', 'utf8'));
const extMap = new Map(external.map(e => [e.id, e]));

// 37 novos mapeamentos estritos e verificados (Zero Mismatch)
const BATCH_3_MAPPINGS = [
  // 1. PEITORAL (3)
  {
    catId: 108,
    extId: '0340',
    canonicalId: 'supino-pegada-neutra-halteres',
    movementType: 'Empurrar Horizontal com Pegada Neutra • Alívio Articular no Ombro',
    cues: [
      'Halteres paralelos com palmas voltadas uma para a outra.',
      'Desça mantendo os cotovelos a ~45° do tronco.',
      'Excelente variação para proteção do manguito rotador e ativação esternal.'
    ],
    aliases: ['supino-pegada-neutra-halteres', 'dumbbell-lying-hammer-press', 'supino-neutro-halteres']
  },
  {
    catId: 112,
    extId: '0296',
    canonicalId: 'supino-fechado-halteres',
    movementType: 'Empurrar com Halteres Unidos • Miolo do Peitoral e Tríceps',
    cues: [
      'Pressione os halteres um contra o outro no centro do peito durante todo o movimento.',
      'Desça os pesos unidos até encostar no esterno.',
      'Empurre estendendo os braços mantendo a pressão adutora contínua.'
    ],
    aliases: ['supino-fechado-halteres', 'dumbbell-close-grip-press', 'crush-press-halteres']
  },
  {
    catId: 119,
    extId: '1274',
    canonicalId: 'flexao-deficit-blocos',
    movementType: 'Flexão com Maior Amplitude • Máximo Alongamento do Peitoral',
    cues: [
      'Mãos apoiadas sobre blocos, steps ou pegadores de flexão.',
      'Desça o tórax ultrapassando a linha das mãos para amplitude profunda.',
      'Empurre contraindo o peitoral com o core rigidamente travado.'
    ],
    aliases: ['flexao-deficit-blocos', 'deep-push-up', 'flexao-profunda-solo']
  },

  // 2. COSTAS & PUXADAS (5)
  {
    catId: 14,
    extId: '2327',
    canonicalId: 'barra-fixa-supinada-chin-up',
    movementType: 'Tração Vertical Supinada • Latíssimo e Flexores do Cotovelo',
    cues: [
      'Pegada com as palmas voltadas para você na largura dos ombros.',
      'Puxe trazendo o peito em direção à barra com grande ativação de bíceps.',
      'Desça com controle até a extensão quase completa dos braços.'
    ],
    aliases: ['barra-fixa-supinada-chin-up', 'reverse-grip-pull-up', 'chin-up-barra-fixa']
  },
  {
    catId: 145,
    extId: '0498',
    canonicalId: 'barra-australiana-inverted-row',
    movementType: 'Remada Invertida com Fitas / Barra • Romboides e Latíssimo',
    cues: [
      'Corpo reto em prancha apoiando os calcanhares no chão.',
      'Puxe o peito em direção às manoplas ou barra retraindo as escápulas.',
      'Excelente exercício para construção de força de puxada horizontal.'
    ],
    aliases: ['barra-australiana-inverted-row', 'inverted-row-with-straps', 'remada-australiana']
  },
  {
    catId: 133,
    extId: '1349',
    canonicalId: 'remada-cavalinho-apoiada-peito',
    movementType: 'Remada T-Bar Guiada com Apoio Peitoral • Densidade Dorsal',
    cues: [
      'Peito totalmente apoiado na almofada inclinada da máquina.',
      'Puxe as manoplas em direção ao abdômen fechando as costas.',
      'Zero sobrecarga na região lombar.'
    ],
    aliases: ['remada-cavalinho-apoiada-peito', 'lever-reverse-t-bar-row', 'remada-t-bar-apoiada']
  },
  {
    catId: 25,
    extId: '0573',
    canonicalId: 'extensao-lombar-banco-romano',
    movementType: 'Extensão de Coluna Guiada • Eretor da Espinha',
    cues: [
      'Ajuste o rolo na altura da escápula média.',
      'Estenda a coluna empurrando o encosto para trás com suavidade.',
      'Retorne controladamente sem perder a postura neutra lombar.'
    ],
    aliases: ['extensao-lombar-banco-romano', 'lever-back-extension', 'lombar-na-maquina']
  },
  {
    catId: 146,
    extId: '0489',
    canonicalId: 'hiperextensao-lombar-45-peso',
    movementType: 'Extensão de Quadril e Lombar • Cadeia Posterior e Glúteo',
    cues: [
      'Apoie a bacia na almofada superior com os tornozelos bem travados.',
      'Desça o tronco flexionando o quadril com coluna alinhada.',
      'Suba até a linha do corpo contraindo glúteos e paravertebrais.'
    ],
    aliases: ['hiperextensao-lombar-45-peso', '45-degree-hyperextension', 'banco-romano-45']
  },

  // 3. OMBROS & DELTOIDES (4)
  {
    catId: 27,
    extId: '0553',
    canonicalId: 'desenvolvimento-militar-em-pe-barra',
    movementType: 'Empurrar Vertical Estrito • Força Bruta de Ombros e Core',
    cues: [
      'Em pé com pés na largura dos quadris, glúteos e abdômen contraídos.',
      'Barra sai da clavícula e sobe em linha reta, passando rente ao rosto.',
      'Bloqueie no topo com a cabeça passando levemente à frente da barra.'
    ],
    aliases: ['desenvolvimento-militar-em-pe-barra', 'military-press', 'overhead-press-barra']
  },
  {
    catId: 156,
    extId: '0355',
    canonicalId: 'elevacao-lateral-unilateral-halter',
    movementType: 'Abdução Unilateral com Halter • Foco Puro no Deltoide Lateral',
    cues: [
      'Segure um suporte estável com uma mão e o haltere com a outra.',
      'Incline o tronco levemente na direção do movimento para melhor alinhamento.',
      'Eleve o haltere no plano escapular até a altura do ombro.'
    ],
    aliases: ['elevacao-lateral-unilateral-halter', 'dumbbell-one-arm-lateral-raise', 'elevacao-lateral-1-braco']
  },
  {
    catId: 157,
    extId: '0392',
    canonicalId: 'elevacao-frontal-sentado-halteres',
    movementType: 'Flexão de Ombro Sentado • Deltoide Anterior Estrito',
    cues: [
      'Sentado no banco com as costas firmes no encosto vertical.',
      'Eleve os halteres à frente sem usar o balanço do tronco.',
      'Desça resistindo à gravidade em 2 segundos.'
    ],
    aliases: ['elevacao-frontal-sentado-halteres', 'dumbbell-seated-front-raise', 'elevacao-frontal-sentado']
  },
  {
    catId: 161,
    extId: '0332',
    canonicalId: 'iron-cross-halteres',
    movementType: 'Sustentação e Abdução Isométrica • Deltoide Lateral e Manguito',
    cues: [
      'Eleve os halteres lateralmente e sustente os braços em cruz.',
      'Mantenha as escápulas deprimidas e postura ereta impecável.',
      'Excelente construtor de estabilidade e resistência articular.'
    ],
    aliases: ['iron-cross-halteres', 'dumbbell-iron-cross', 'cruz-de-ferro-halteres']
  },

  // 4. BÍCEPS & TRÍCEPS (5)
  {
    catId: 171,
    extId: '0350',
    canonicalId: 'rosca-biceps-deitado-halteres',
    movementType: 'Flexão Deitado no Banco • Tensão Contínua no Pico',
    cues: [
      'Deite-se no banco plano segurando os halteres com braços estendidos.',
      'Flexione os cotovelos sem permitir que eles se movam para a frente.',
      'Contração de pico intensa no bíceps.'
    ],
    aliases: ['rosca-biceps-deitado-halteres', 'supine-dumbbell-biceps-curl', 'rosca-deitado-banco']
  },
  {
    catId: 173,
    extId: '0374',
    canonicalId: 'rosca-spider-inclinada-halteres',
    movementType: 'Flexão no Banco Inclinado com Peito Apoiado • Braquial e Bíceps',
    cues: [
      'Deite de bruços no banco inclinado a 45° com braços pendendo verticais.',
      'Flexione os braços mantendo os cotovelos absolutamente estáticos.',
      'Eliminação completa de qualquer auxílio dos deltoides ou lombar.'
    ],
    aliases: ['rosca-spider-inclinada-halteres', 'dumbbell-prone-incline-curl', 'rosca-spider-halteres']
  },
  {
    catId: 198,
    extId: '1729',
    canonicalId: 'triceps-testa-alternado-halteres',
    movementType: 'Extensão Deitada Alternada • Equilíbrio de Força entre os Braços',
    cues: [
      'Deite-se no banco reto e estenda um braço enquanto o outro desce o haltere.',
      'Mantenha o cotovelo apontado verticalmente para o teto.',
      'Alterne com ritmo fluído e controle articular seguro.'
    ],
    aliases: ['triceps-testa-alternado-halteres', 'dumbbell-lying-alternate-extension', 'triceps-testa-alternado']
  },
  {
    catId: 209,
    extId: '0607',
    canonicalId: 'triceps-extensao-maquina-articulada',
    movementType: 'Extensão Sentada na Máquina • Cabeça Medial e Lateral do Tríceps',
    cues: [
      'Apoie os cotovelos nas almofadas da máquina ajustando o eixo anatômico.',
      'Estenda os braços para a frente empurrando as manoplas.',
      'Controle excêntrico estrito sentindo o tríceps arder.'
    ],
    aliases: ['triceps-extensao-maquina-articulada', 'lever-triceps-extension', 'triceps-maquina']
  },
  {
    catId: 240,
    extId: '0343',
    canonicalId: 'mesa-flexora-halteres',
    movementType: 'Flexão de Joelho com Haltere entre os Pés • Isquiotibiais',
    cues: [
      'Deite de bruços no banco plano segurando um haltere preso entre os pés.',
      'Flexione os joelhos trazendo o haltere em direção aos glúteos.',
      'Desça controladamente sem deixar o haltere escapar.'
    ],
    aliases: ['mesa-flexora-halteres', 'dumbbell-lying-leg-curl', 'flexora-com-halter']
  },

  // 5. PERNAS, GLÚTEOS & SMITH (8)
  {
    catId: 61,
    extId: 'drv-squat',
    canonicalId: 'agachamento-livre-peso-corporal-air-squat',
    movementType: 'Agachamento com Peso do Corpo • Padrão Motor Fundamental',
    cues: [
      'Pés na largura dos ombros com pontas ligeiramente para fora.',
      'Desça os quadris para trás e para baixo mantendo o peito erguido.',
      'Quebre a paralela de 90° e empurre com os calcanhares.'
    ],
    aliases: ['agachamento-livre-peso-corporal-air-squat', 'squat', 'air-squat-solo']
  },
  {
    catId: 222,
    extId: '0750',
    canonicalId: 'agachamento-smith-pes-avancados',
    movementType: 'Agachamento no Smith com Pés à Frente • Ênfase em Quadríceps',
    cues: [
      'Posicione os pés 20 a 30 cm à frente da linha vertical da barra.',
      'Desça mantendo o tronco ereto e estável apoiado na barra guiada.',
      'Isolamento potente de quadríceps sem sobrecarga excessiva na lombar.'
    ],
    aliases: ['agachamento-smith-pes-avancados', 'smith-chair-squat', 'agachamento-hack-smith']
  },
  {
    catId: 234,
    extId: '0752',
    canonicalId: 'levantamento-terra-smith',
    movementType: 'Puxada do Solo Guiada no Smith • Força de Cadeia Posterior',
    cues: [
      'Barra posicionada na altura dos joelhos ou canelas na trava de segurança.',
      'Quadris para trás, coluna travada e empurre o solo com as pernas.',
      'Estenda o quadril no topo travando os glúteos com segurança guiada.'
    ],
    aliases: ['levantamento-terra-smith', 'smith-machine-deadlift', 'terra-no-smith']
  },
  {
    catId: 236,
    extId: '1757',
    canonicalId: 'stiff-unilateral-halter',
    movementType: 'Stiff Unilateral • Correção de Assimetrias nos Isquiotibiais',
    cues: [
      'Segure o haltere em uma mão e apoie o peso na perna oposta.',
      'Estenda a perna livre para trás enquanto inclina o tronco à frente.',
      'Sinta o alongamento potente do posterior da coxa de apoio antes de retornar.'
    ],
    aliases: ['stiff-unilateral-halter', 'single-dumbbell-stiff-leg-deadlift', 'rdl-unilateral-halter']
  },
  {
    catId: 257,
    extId: '2286',
    canonicalId: 'extensao-quadril-em-pe-maquina-gluteo',
    movementType: 'Extensão de Quadril em Pé • Isolamento do Glúteo Máximo',
    cues: [
      'Apoie a perna de trabalho no rolo acolchoado da máquina de glúteo.',
      'Empurre o rolo para trás e para cima contraindo o glúteo no topo.',
      'Evite hiperarquear a lombar para compensar o movimento.'
    ],
    aliases: ['extensao-quadril-em-pe-maquina-gluteo', 'lever-standing-hip-extension', 'gluteo-coice-maquina']
  },
  {
    catId: 259,
    extId: '0593',
    canonicalId: 'hiperextensao-reversa-maquina',
    movementType: 'Elevação de Pernas com Pelve Apoiada • Glúteos e Descompressão Lombar',
    cues: [
      'Tronco apoiado na mesa da máquina segurando as manoplas.',
      'Eleve as pernas para trás e para cima acionando os glúteos.',
      'Ajuda na descompressão dos discos lombares e hipertrofia da cadeia posterior.'
    ],
    aliases: ['hiperextensao-reversa-maquina', 'lever-reverse-hyperextension', 'reverse-hyper']
  },
  {
    catId: 265,
    extId: '1379',
    canonicalId: 'panturrilha-sentado-halteres-joelhos',
    movementType: 'Elevação Plantar Sentado com Halteres • Sóleo Isolado',
    cues: [
      'Sente-se no banco com as pontas dos pés sobre o bloco e halteres apoiados nas coxas.',
      'Desça os calcanhares sentindo o alongamento profundo do sóleo.',
      'Eleve na ponta dos pés sustentando a contração por 1 segundo.'
    ],
    aliases: ['panturrilha-sentado-halteres-joelhos', 'dumbbell-seated-calf-raise', 'panturrilha-sentado-halter']
  },
  {
    catId: 294,
    extId: 'drv-kettlebell-deadlift',
    canonicalId: 'levantamento-terra-kettlebell',
    movementType: 'Puxada do Solo com Kettlebell • Padrão de Dobradiça de Quadril',
    cues: [
      'Kettlebell posicionado entre os pés com pegada firme na alça.',
      'Projete os quadris para trás mantendo as costas totalmente retas.',
      'Fique ereto estendendo quadris e joelhos simultaneamente.'
    ],
    aliases: ['levantamento-terra-kettlebell', 'kettlebell-deadlift', 'terra-com-kettlebell']
  },

  // 6. CORE & ABDÔMEN (4)
  {
    catId: 88,
    extId: '0826',
    canonicalId: 'elevacao-pernas-cadeira-capitao',
    movementType: 'Elevação de Pernas com Apoio nos Antebraços • Reto Abdominal e Infra',
    cues: [
      'Apoie os antebraços nas almofadas da cadeira do capitão mantendo as costas no encosto.',
      'Eleve as pernas retas ou joelhos flexionados até a linha da cintura.',
      'Enrole a pelve para cima no topo para máxima ativação muscular.'
    ],
    aliases: ['elevacao-pernas-cadeira-capitao', 'vertical-leg-raise', 'paralelas-elevacao-pernas']
  },
  {
    catId: 90,
    extId: '1002',
    canonicalId: 'elevacao-pernas-deitado-solo',
    movementType: 'Elevação de Pernas Deitado no Chão • Reto Abdominal Inferior',
    cues: [
      'Deite de costas no solo com as mãos ao lado do quadril para estabilização.',
      'Eleve as pernas juntas até a vertical mantendo a lombar colada no chão.',
      'Desça lentamente sem permitir que a lombar descole do solo.'
    ],
    aliases: ['elevacao-pernas-deitado-solo', 'lying-straight-leg-raise', 'elevacao-pernas-solo']
  },
  {
    catId: 93,
    extId: '0796',
    canonicalId: 'roda-abdominal-em-pe',
    movementType: 'Rollout com Roda Abdominal em Pé • Força Máxima de Core',
    cues: [
      'Comece em pé com a roda no chão e pernas ligeiramente afastadas.',
      'Role a roda para a frente estendendo o corpo com core ultra travado.',
      'Puxe de volta flexionando o abdômen sem deixar o quadril cair.'
    ],
    aliases: ['roda-abdominal-em-pe', 'standing-wheel-rollout', 'ab-wheel-em-pe']
  },
  {
    catId: 288,
    extId: '0562',
    canonicalId: 'landmine-rotational-twist-180',
    movementType: 'Rotação Diagonal com Barra Ancorada • Oblíquos e Transverso',
    cues: [
      'Segure a ponta da barra com os braços semi-estendidos na altura do peito.',
      'Gire a barra em arco de um quadril ao outro usando a rotação do tronco.',
      'Gire o pé de apoio acompanhando o movimento para proteger o joelho.'
    ],
    aliases: ['landmine-rotational-twist-180', 'landmine-180', 'rotacao-landmine']
  },

  // 7. CARDIO & CONDICIONAMENTO ERGOMÉTRICO (4)
  {
    catId: 298,
    extId: 'drv-running',
    canonicalId: 'corrida-estacionaria-joelho-alto-trote',
    movementType: 'Corrida Estacionária Rítmica • Condicionamento Cardiovascular',
    cues: [
      'Corra no lugar elevando os joelhos e coordenando o movimento dos braços.',
      'Aterrissagem suave sobre o antepé.',
      'Excelente para aquecimento sistêmico ou blocos de HIIT.'
    ],
    aliases: ['corrida-estacionaria-joelho-alto-trote', 'running', 'corrida-estacionaria']
  },
  {
    catId: 311,
    extId: '2138',
    canonicalId: 'bicicleta-ergometrica-spinning',
    movementType: 'Pedalagem Contínua / Intervalada • Zero Impacto Articular',
    cues: [
      'Ajuste a altura do selim para que a perna fique levemente flexionada no ponto mais baixo.',
      'Coluna neutra e empunhadura firme no guidão.',
      'Cadência constante mantendo a frequência cardíaca na zona desejada.'
    ],
    aliases: ['bicicleta-ergometrica-spinning', 'stationary-bike', 'bicicleta-ergometrica']
  },
  {
    catId: 312,
    extId: 'drv-treadmill-running',
    canonicalId: 'esteira-ergometrica-inclinada-caminhada',
    movementType: 'Caminhada ou Corrida na Esteira • Gasto Calórico e Resistência',
    cues: [
      'Mantenha a postura ereta olhando para a frente sem se apoiar nas barras laterais.',
      'Passada natural com braços ritmados a 90°.',
      'Inclinação regulável para proteção articular dos joelhos e maior recrutamento glúteo.'
    ],
    aliases: ['esteira-ergometrica-inclinada-caminhada', 'treadmill-running', 'esteira-ergometrica']
  },
  {
    catId: 313,
    extId: '2141',
    canonicalId: 'simulador-eliptico-transport',
    movementType: 'Movimento Cíclico Elíptico • Cardio Total sem Choque Mecânico',
    cues: [
      'Pés firmes nas plataformas sem levantar os calcanhares excessivamente.',
      'Empurre e puxe as hastes sincronizando membros superiores e inferiores.',
      'Excelente para queima calórica sem impacto articular na coluna e joelhos.'
    ],
    aliases: ['simulador-eliptico-transport', 'elliptical-trainer', 'eliptico-transport']
  },

  // 8. MOBILIDADE ARTICULAR & ALONGAMENTO (4)
  {
    catId: 316,
    extId: '1259',
    canonicalId: 'alongamento-peitoral-ombros-parede',
    movementType: 'Alongamento Estático de Peitoral • Abertura da Caixa Torácica',
    cues: [
      'Apoie o antebraço ou mão na parede na altura dos ombros.',
      'Gire o tronco suavemente para o lado oposto até sentir o estiramento do peitoral.',
      'Respire fundo sustentando por 20 a 30 segundos.'
    ],
    aliases: ['alongamento-peitoral-ombros-parede', 'overhead-chest-stretch', 'alongamento-peitoral']
  },
  {
    catId: 317,
    extId: 'drv-stretching-ceiling-look-stretch',
    canonicalId: 'alongamento-flexores-quadril-psoas-solo',
    movementType: 'Alongamento de Psoas e Ilíaco • Alívio da Tensão Lombar',
    cues: [
      'Posição de afundo com o joelho traseiro apoiado no chão.',
      'Projete o quadril suavemente à frente mantendo o tronco ereto.',
      'Libera a fáscia dos flexores de quadril encurtados por horas sentado.'
    ],
    aliases: ['alongamento-flexores-quadril-psoas-solo', 'standing-hip-flexor-stretch', 'alongamento-psoas']
  },
  {
    catId: 318,
    extId: '1511',
    canonicalId: 'alongamento-isquiotibiais-em-pe',
    movementType: 'Alongamento dos Posteriores de Coxa • Mobilidade da Cadeia Posterior',
    cues: [
      'Uma perna estendida à frente com o calcanhar no solo e ponta do pé para cima.',
      'Incline o tronco reto dobrando a partir do quadril sem curvar as costas.',
      'Sinta o alongamento limpo da musculatura isquiotibial.'
    ],
    aliases: ['alongamento-isquiotibiais-em-pe', 'standing-hamstring-stretch', 'alongamento-posterior-pe']
  },
  {
    catId: 320,
    extId: 'drv-stretching-stairs-calf-stretch',
    canonicalId: 'alongamento-panturrilha-tornozelo-degrau',
    movementType: 'Alongamento da Fáscia Plantar e Tríceps Sural • Dorsiflexão de Tornozelo',
    cues: [
      'Apoie o antepé na beirada de um degrau e deixe o calcanhar descer suavemente.',
      'Joelho estendido para foco nos gastrocnêmios.',
      'Melhora crucial na mobilidade de tornozelo para agachamentos profundos.'
    ],
    aliases: ['alongamento-panturrilha-tornozelo-degrau', 'stairs-calf-stretch', 'alongamento-panturrilha-degrau']
  }
];

console.log('Mapping batch 3. Total items to add:', BATCH_3_MAPPINGS.length);

const mergedDictionary = { ...EXISTING_122 };

for (const mapItem of BATCH_3_MAPPINGS) {
  const bio = EXERCISE_BIOMECHANICS[mapItem.catId];
  const ext = extMap.get(mapItem.extId);

  if (!bio || !ext) {
    console.error('FAILED TO MAP:', mapItem.canonicalId, { bio: !!bio, ext: !!ext });
    continue;
  }

  mergedDictionary[mapItem.canonicalId] = {
    canonicalId: mapItem.canonicalId,
    name: bio.nome,
    equipment: bio.equipamento,
    movementType: mapItem.movementType,
    target: bio.alvo,
    videoMale: ext.videos.male,
    videoFemale: ext.videos.female || null,
    poster: ext.thumbnails?.male || null,
    keyCues: mapItem.cues,
    aliases: Array.from(new Set([
      mapItem.canonicalId,
      bio.slug,
      String(bio.id),
      ...mapItem.aliases
    ]))
  };
}

console.log('Total verified exercises in combined dictionary:', Object.keys(mergedDictionary).length);

const fileHeader = `/**
 * exerciseVideos.js — Base de Vídeos Demonstrativos Auditados • AB Fitness
 * 
 * Regra de Ouro:
 * NENHUM exercício pode apresentar demonstração com equipamento ou padrão de movimento divergente.
 * Cada registro é verificado individualmente contra o ID e características anatómicas do exercício.
 * Total de exercícios auditados: ${Object.keys(mergedDictionary).length}
 */

export const VERIFIED_EXERCISE_VIDEOS = ${JSON.stringify(mergedDictionary, null, 2)};

/**
 * Função utilitária de normalização para busca case-insensitive e sem acentos
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Índice invertido de aliases para busca instantânea O(1)
const ALIAS_INDEX = new Map();
Object.values(VERIFIED_EXERCISE_VIDEOS).forEach((item) => {
  if (item.canonicalId) {
    ALIAS_INDEX.set(normalizeString(item.canonicalId), item);
  }
  if (item.name) {
    ALIAS_INDEX.set(normalizeString(item.name), item);
  }
  if (Array.isArray(item.aliases)) {
    item.aliases.forEach((alias) => {
      ALIAS_INDEX.set(normalizeString(alias), item);
    });
  }
});

/**
 * Recupera o vídeo verificado e auditado para um exercício.
 * Retorna null se não houver correspondência exata para evitar qualquer mismatch.
 * 
 * @param {Object|string} exercise - Objeto de exercício ou ID/slug
 * @returns {Object|null} Dados do vídeo ou null
 */
export function getVerifiedExerciseVideo(exercise) {
  if (!exercise) return null;

  // 1. Identificadores diretos
  const rawId = typeof exercise === 'string' ? exercise : (exercise.id || exercise.slug || '');
  if (rawId) {
    const directMatch = ALIAS_INDEX.get(normalizeString(rawId));
    if (directMatch) return directMatch;
  }

  // 2. Busca por nome oficial
  const name = typeof exercise === 'object' ? (exercise.name || exercise.nome || '') : '';
  if (name) {
    const nameMatch = ALIAS_INDEX.get(normalizeString(name));
    if (nameMatch) return nameMatch;
  }

  // 3. Fallback estrito: nenhuma inferência duvidosa permitida
  return null;
}

/**
 * Verifica se um exercício possui vídeo oficial auditado
 */
export function hasVerifiedExerciseVideo(exercise) {
  return Boolean(getVerifiedExerciseVideo(exercise));
}
`;

fs.writeFileSync('src/data/exerciseVideos.js', fileHeader, 'utf8');
console.log('Successfully generated src/data/exerciseVideos.js with', Object.keys(mergedDictionary).length, 'exercises!');
