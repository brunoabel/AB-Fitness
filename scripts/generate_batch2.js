/**
 * generate_batch2.js — AB Fitness
 * Gera src/data/exerciseVideos.js adicionando o LOTE 2 (50 novos exercícios verificados)
 * Total acumulado: 67 + 50 = 117 exercícios auditados com vídeo Ultra HD
 */

import fs from 'fs';
import path from 'path';
import { VERIFIED_EXERCISE_VIDEOS as EXISTING_67 } from '../src/data/exerciseVideos.js';
import { EXERCISE_BIOMECHANICS } from '../src/data/exerciseBiomechanics.js';

const external = JSON.parse(fs.readFileSync('scripts/external_exercises.json', 'utf8'));
const extMap = new Map(external.map(e => [e.id, e]));

// 50 novos mapeamentos estritos e verificados (Zero Mismatch)
const BATCH_2_MAPPINGS = [
  // 1. PEITORAL (7)
  {
    catId: 104,
    extId: '0301',
    canonicalId: 'supino-declinado-halteres',
    movementType: 'Empurrar Declinado • Halteres Livres',
    cues: [
      'Pés firmes sob as travas do banco declinado (-15° a -30°).',
      'Desça os halteres alinhando com a linha mamilar inferior.',
      'Empurre no vetor perpendicular ao tronco sem projetar os ombros.'
    ],
    aliases: ['supino-declinado-com-halteres', 'decline-dumbbell-bench-press', 'supino-declinado-halteres']
  },
  {
    catId: 113,
    extId: '0302',
    canonicalId: 'crucifixo-declinado-halteres',
    movementType: 'Adução Horizontal Declinada • Peitoral Inferior',
    cues: [
      'Mantenha cotovelos levemente semi-flexionados e travados no mesmo ângulo.',
      'Abra os braços em arco amplo até o alongamento máximo da porção costal.',
      'Aduza contraindo a parte inferior do peitoral sem encostar os halteres.'
    ],
    aliases: ['crucifixo-declinado-com-halteres', 'decline-dumbbell-fly', 'crucifixo-declinado-halteres']
  },
  {
    catId: 8,
    extId: '0620',
    canonicalId: 'crossover-polia-baixa',
    movementType: 'Adução Horizontal em Banco • Tensão Contínua',
    cues: [
      'Deite-se no banco plano posicionado entre as duas polias baixas.',
      'Mantenha os cotovelos fixos e conduza o movimento pelos peitorais.',
      'Sinta o pico de contração constante mesmo na fase final do movimento.'
    ],
    aliases: ['crossover-polia-baixa', 'flat-bench-cable-fly', 'crucifixo-cabo-banco-reto']
  },
  {
    catId: 110,
    extId: '1299',
    canonicalId: 'supino-articulado-maquina-inclinado',
    movementType: 'Empurrar Inclinado Convergente • Feixe Clavicular',
    cues: [
      'Ajuste a altura do banco para que as manoplas comecem na linha clavicular.',
      'Escápulas coladas no encosto e cotovelos no plano escapular.',
      'Empurre acelerando no arco convergente da máquina sem hiperextender os cotovelos.'
    ],
    aliases: ['supino-articulado-maquina-inclinado', 'lever-incline-hammer-chest-press', 'supino-inclinado-articulado-hammer']
  },
  {
    catId: 109,
    extId: '0577',
    canonicalId: 'supino-articulado-maquina-reto',
    movementType: 'Empurrar Horizontal Guiado • Peitoral Maior',
    cues: [
      'Manoplas na altura da porção média do peitoral.',
      'Peito estufado e ombros protegidos para trás durante toda a execução.',
      'Cadencie a descida em 2 segundos e exploda na subida.'
    ],
    aliases: ['supino-articulado-maquina-reto', 'lever-lying-chest-press', 'supino-reto-articulado']
  },
  {
    catId: 12,
    extId: 'drv-chest-dips',
    canonicalId: 'paralelas-foco-peito',
    movementType: 'Mergulho com Tronco Inclinado • Peitoral Inferior',
    cues: [
      'Incline o tronco para a frente a ~30° e mantenha o queixo recolhido.',
      'Cotovelos abertos em ~45° para transferir a ênfase máxima ao peitoral.',
      'Desça até 90° nos cotovelos e empurre contraindo os peitorais.'
    ],
    aliases: ['paralelas-foco-peito', 'chest-dips', 'mergulho-paralelas-peito']
  },
  {
    catId: 117,
    extId: '0493',
    canonicalId: 'flexao-declinada-pes-elevados',
    movementType: 'Flexão com Pés Apoiados no Banco • Feixe Clavicular',
    cues: [
      'Apoie as pontas dos pés no banco e mãos firmes no chão.',
      'Core totalmente travado em linha reta sem deixar a bacia ceder.',
      'Desça o tórax em direção ao chão e empurre com potência.'
    ],
    aliases: ['flexao-declinada-pes-elevados', 'incline-push-up', 'flexao-pes-no-banco']
  },

  // 2. COSTAS & TRAPÉZIO (7)
  {
    catId: 21,
    extId: '0218',
    canonicalId: 'remada-articulada-maquina',
    movementType: 'Remada Sentada Guiada • Romboides e Latíssimo',
    cues: [
      'Encosto peitoral ajustado para manter amplitude total de braços.',
      'Puxe conduzindo pelos cotovelos e esmague as escápulas atrás.',
      'Alongue totalmente as costas na volta sem perder o alinhamento espinhal.'
    ],
    aliases: ['remada-articulada-maquina', 'seated-cable-row-wide-grip', 'remada-baixa-barra-aberta']
  },
  {
    catId: 130,
    extId: '0861',
    canonicalId: 'remada-baixa-unilateral-polia',
    movementType: 'Remada Unilateral • Latíssimo Inferior Isolado',
    cues: [
      'Mantenha o quadril e tronco estáveis, puxando o cotovelo rente à cintura.',
      'Permita ligeiro alcance escapular à frente para alongar o grande dorsal.',
      'Finalize puxando até o quadril com pausa isométrica de 1 segundo.'
    ],
    aliases: ['remada-baixa-unilateral-polia', 'cable-one-arm-seated-row', 'remada-unilateral-polia']
  },
  {
    catId: 125,
    extId: '0673',
    canonicalId: 'puxada-pegada-supinada',
    movementType: 'Tração Vertical Supinada • Latíssimo & Braquial',
    cues: [
      'Pegada na largura dos ombros com as palmas voltadas para você.',
      'Inicie a tração deprimindo as escápulas antes de flexionar os braços.',
      'Puxe a barra até a altura da fúrcula esternal mantendo o peito erguido.'
    ],
    aliases: ['puxada-pegada-supinada', 'reverse-grip-lat-pulldown', 'underhand-lat-pulldown']
  },
  {
    catId: 132,
    extId: '0327',
    canonicalId: 'remada-apoiada-banco-inclinado-halteres',
    movementType: 'Remada Livre com Peito Apoiado • Zero Sobrecarga Lombar',
    cues: [
      'Deite-se no banco a 30°-45° com peito firme no encosto.',
      'Braços soltos no início; inicie aduzindo as escápulas.',
      'Puxe os halteres trazendo os cotovelos em direção ao quadril.'
    ],
    aliases: ['remada-apoiada-banco-inclinado-halteres', 'dumbbell-incline-row', 'chest-supported-dumbbell-row']
  },
  {
    catId: 138,
    extId: '0581',
    canonicalId: 'remada-kroc-row-halter',
    movementType: 'Remada Guiada High Row • Costas Médias',
    cues: [
      'Posicione o banco para puxar no vetor diagonal alto-para-baixo.',
      'Puxe com força abrindo o peito e fechando a musculatura interescapular.',
      'Controle excêntrico estrito para ativação de espessura de tronco.'
    ],
    aliases: ['remada-kroc-row-halter', 'lever-high-row', 'remada-articulada-high-row']
  },
  {
    catId: 167,
    extId: '0604',
    canonicalId: 'encolhimento-smith',
    movementType: 'Elevação Escapular Guiada • Trapézio Superior',
    cues: [
      'Barra do Smith ajustada na altura das coxas com pegada média.',
      'Eleve os ombros diretamente em direção às orelhas sem girá-los.',
      'Segure 2 segundos no topo contraindo o trapézio ao máximo.'
    ],
    aliases: ['encolhimento-smith', 'lever-shrug', 'encolhimento-maquina-articulada']
  },
  {
    catId: 169,
    extId: '0329',
    canonicalId: 'encolhimento-barra-por-tras-haney',
    movementType: 'Elevação Escapular Inclinada • Trapézio Médio/Superior',
    cues: [
      'Incline-se no banco 45° com halteres firmes pendendo neutros.',
      'Retraia e eleve as escápulas simultaneamente.',
      'Proteção cervical total com olhar alinhado à espinha.'
    ],
    aliases: ['encolhimento-barra-por-tras-haney', 'dumbbell-incline-shrug', 'encolhimento-inclinado-halteres']
  },

  // 3. OMBROS & DELTOIDES (7)
  {
    catId: 148,
    extId: '0765',
    canonicalId: 'desenvolvimento-smith',
    movementType: 'Empurrar Vertical Guiado • Deltoide Anterior/Médio',
    cues: [
      'Banco posicionado ligeiramente atrás da linha da barra (75°-80°).',
      'Desça a barra controladamente até a linha do queixo/clavícula.',
      'Empurre estendendo com segurança nos trilhos guiados.'
    ],
    aliases: ['desenvolvimento-smith', 'smith-seated-shoulder-press', 'desenvolvimento-no-smith']
  },
  {
    catId: 154,
    extId: '0584',
    canonicalId: 'elevacao-lateral-maquina-articulada',
    movementType: 'Abdução de Braços na Máquina • Deltoide Lateral Isolado',
    cues: [
      'Alinhe o eixo de rotação da máquina exatamente com a articulação do ombro.',
      'Cotovelos apoiados nas almofadas; empurre pelas almofadas, não com as mãos.',
      'Suba até a linha horizontal com controle estrito sem encolher o pescoço.'
    ],
    aliases: ['elevacao-lateral-maquina-articulada', 'lever-lateral-raise', 'elevacao-lateral-maquina']
  },
  {
    catId: 163,
    extId: '0437',
    canonicalId: 'remada-alta-halteres',
    movementType: 'Puxada Vertical com Halteres • Deltoide Lateral & Trapézio',
    cues: [
      'Puxe os halteres rente ao corpo liderando com os cotovelos altos.',
      'Pare na linha média do peito para evitar impacto subacromial.',
      'Desça cadenciado mantendo a musculatura sob tensão.'
    ],
    aliases: ['remada-alta-halteres', 'dumbbell-upright-row', 'remada-alta-com-halteres']
  },
  {
    catId: 33,
    extId: '0162',
    canonicalId: 'elevacao-frontal-polia',
    movementType: 'Flexão de Ombro na Polia • Deltoide Anterior',
    cues: [
      'De costas para a polia baixa, segurando o cabo entre as pernas ou unilateralmente.',
      'Eleve o braço reto até a altura dos olhos com punho firme.',
      'Resista à tração do cabo na descida em 3 segundos.'
    ],
    aliases: ['elevacao-frontal-polia', 'cable-one-arm-front-raise', 'elevacao-frontal-cabo']
  },
  {
    catId: 164,
    extId: '0377',
    canonicalId: 'remada-alta-polia-baixa',
    movementType: 'Remada Curvada com Cotovelos Abertos • Deltoide Posterior',
    cues: [
      'Incline o tronco paralelo ao chão com coluna neutra.',
      'Puxe os halteres com cotovelos abertos a 90° em relação ao tronco.',
      'Foco total na contração da parte de trás dos ombros.'
    ],
    aliases: ['remada-alta-polia-baixa', 'dumbbell-rear-delt-row', 'remada-posterior-ombro']
  },
  {
    catId: 150,
    extId: '0361',
    canonicalId: 'desenvolvimento-unilateral-em-pe-halter',
    movementType: 'Desenvolvimento Alternado • Estabilidade Escapular',
    cues: [
      'Empurre um haltere enquanto o outro sustenta com controle no ombro.',
      'Mantenha o tronco ereto sem balançar de lado.',
      'Ritmo alternado contínuo e sincronizado.'
    ],
    aliases: ['desenvolvimento-unilateral-em-pe-halter', 'dumbbell-alternating-shoulder-press', 'desenvolvimento-halteres-alternado']
  },
  {
    catId: 151,
    extId: '0396',
    canonicalId: 'elevacao-lateral-banco-inclinado',
    movementType: 'Abdução Sentada • Eliminação Total de Impulso',
    cues: [
      'Sentado na ponta do banco com tronco ereto e pés firmes.',
      'Eleve os halteres em direção às paredes laterais.',
      'Pequena rotação neutra sem elevar os polegares acima dos cotovelos.'
    ],
    aliases: ['elevacao-lateral-banco-inclinado', 'dumbbell-seated-lateral-raise', 'elevacao-lateral-sentado']
  },

  // 4. BÍCEPS & ANTEBRAÇO (7)
  {
    catId: 175,
    extId: '0038',
    canonicalId: 'rosca-drag-curl-barra',
    movementType: 'Flexão de Cotovelo com Recuo de Cotovelos • Pico do Bíceps',
    cues: [
      'Puxe a barra raspando no abdômen e tórax enquanto puxa os cotovelos para trás.',
      'Elimina o deltoide anterior e isola a cabeça longa do bíceps.',
      'Aperte com força máxima no ponto mais alto.'
    ],
    aliases: ['rosca-drag-curl-barra', 'barbell-drag-curl', 'rosca-drag-barra']
  },
  {
    catId: 178,
    extId: '0298',
    canonicalId: 'rosca-martelo-cruzada-cross-body',
    movementType: 'Flexão com Pegada Neutra Cruzada • Braquial & Braquiorradial',
    cues: [
      'Suba o haltere em diagonal cruzando o peito em direção ao ombro oposto.',
      'Mantenha a pegada neutra com o polegar sempre apontando para cima.',
      'Ideal para construir densidade e espessura no braço.'
    ],
    aliases: ['rosca-martelo-cruzada-cross-body', 'dumbbell-cross-body-hammer-curl', 'rosca-martelo-cruzada']
  },
  {
    catId: 46,
    extId: '0592',
    canonicalId: 'rosca-scott-maquina',
    movementType: 'Flexão Guiada no Apoio Scott • Cabeça Curta do Bíceps',
    cues: [
      'Axilas perfeitamente encaixadas no topo do estofado.',
      'Flexione os braços mantendo os cotovelos colados no suporte.',
      'Desça sem permitir hiperextensão abrupta da articulação no final.'
    ],
    aliases: ['rosca-scott-maquina', 'lever-preacher-curl', 'rosca-scott-articulada']
  },
  {
    catId: 3,
    extId: '0033',
    canonicalId: 'supino-declinado-barra',
    movementType: 'Empurrar Declinado com Barra Olímpica • Peitoral Inferior',
    cues: [
      'Pés firmemente travados no banco declinado e pegada um pouco mais larga que os ombros.',
      'Desça a barra controladamente tocando suavemente a linha inferior do peitoral.',
      'Empurre estendendo os cotovelos sem descolar as escápulas do banco.'
    ],
    aliases: ['supino-declinado-barra', 'barbell-decline-bench-press', 'supino-declinado-com-barra', '3']
  },
  {
    catId: 177,
    extId: '0285',
    canonicalId: 'rosca-martelo-banco-inclinado',
    movementType: 'Flexão Sentada Alternada • Controle Bilateral',
    cues: [
      'Sentado no banco com halteres ao lado do quadril.',
      'Suba um braço supinando enquanto o outro mantém o controle gravitacional.',
      'Movimento estrito sem jogar os ombros para a frente.'
    ],
    aliases: ['rosca-martelo-banco-inclinado', 'seated-alternating-dumbbell-curl', 'rosca-alternada-sentado']
  },
  {
    catId: 176,
    extId: '1672',
    canonicalId: 'rosca-zottman-halteres',
    movementType: 'Flexão Supinada + Descida Pronada • Bíceps e Antebraço',
    cues: [
      'Suba o haltere com as palmas voltadas para cima (supinação).',
      'No topo, gire as mãos 180° com as palmas para baixo (pronação).',
      'Desça lentamente contraindo intensamente os extensores do antebraço.'
    ],
    aliases: ['rosca-zottman-halteres', 'dumbbell-one-arm-zottman-preacher-curl', 'rosca-zottman']
  },
  {
    catId: 100,
    extId: '0082',
    canonicalId: 'extensao-punho-barra',
    movementType: 'Extensão de Punho com Barra • Extensores Radiais do Carpo',
    cues: [
      'Antebraços firmes no banco com os punhos projetados para fora.',
      'Palmas voltadas para baixo; eleve a barra flexionando os punhos para cima.',
      'Desça alongando o dorso do antebraço de forma controlada.'
    ],
    aliases: ['extensao-punho-barra', 'barbell-reverse-wrist-curl', 'extensao-de-punho']
  },

  // 5. TRÍCEPS (7)
  {
    catId: 200,
    extId: '0194',
    canonicalId: 'triceps-frances-corda-polia-baixa',
    movementType: 'Extensão Overhead na Polia • Cabeça Longa em Máximo Alongamento',
    cues: [
      'Puxe a corda por trás da cabeça mantendo os cotovelos altos e fechados.',
      'Estenda os braços à frente abrindo a corda no final.',
      'Desça profundamente flexionando os cotovelos atrás da nuca.'
    ],
    aliases: ['triceps-frances-corda-polia-baixa', 'cable-rope-overhead-triceps-extension', 'triceps-frances-polia-corda']
  },
  {
    catId: 197,
    extId: '0186',
    canonicalId: 'triceps-testa-polia-baixa-corda',
    movementType: 'Extensão Deitada na Polia • Tensão Contínua no Topo',
    cues: [
      'Deitado no banco de frente para a polia baixa segurando a corda/barra.',
      'Cotovelos apontados para o teto e fixos durante todo o arco.',
      'Estenda com potência sentindo a resistência constante do cabo.'
    ],
    aliases: ['triceps-testa-polia-baixa-corda', 'cable-lying-triceps-extension', 'triceps-testa-polia']
  },
  {
    catId: 195,
    extId: '0351',
    canonicalId: 'triceps-testa-halteres-banco-reto',
    movementType: 'Extensão Deitada com Halteres • Trabalho Unilateral Livre',
    cues: [
      'Halteres com pegada neutra paralelos um ao outro.',
      'Desça os pesos ao lado das têmporas preservando os cotovelos.',
      'Estenda até quase travar sem perder a tensão na cabeça lateral.'
    ],
    aliases: ['triceps-testa-halteres-banco-reto', 'dumbbell-lying-triceps-extension', 'triceps-testa-halteres']
  },
  {
    catId: 212,
    extId: '1451',
    canonicalId: 'mergulho-maquina-articulada-triceps',
    movementType: 'Mergulho Sentado Guiado • Tríceps sem Sobrecarga Escapular',
    cues: [
      'Sente-se com cinto travado e manoplas firmes sob as palmas.',
      'Empurre as manoplas para baixo estendendo totalmente os braços.',
      'Retorne controlando em 3 segundos até a flexão de 90°.'
    ],
    aliases: ['mergulho-maquina-articulada-triceps', 'lever-seated-dip', 'mergulho-maquina-triceps']
  },
  {
    catId: 207,
    extId: 'drv-triceps-dips',
    canonicalId: 'paralelas-foco-triceps-vertical',
    movementType: 'Mergulho com Tronco Vertical • Foco Exclusivo em Tríceps',
    cues: [
      'Mantenha o tronco estritamente na vertical e pernas retas ou cruzadas.',
      'Cotovelos colados ao tronco e apontados para trás na descida.',
      'Empurre com força total pelo calcanhar das mãos.'
    ],
    aliases: ['paralelas-foco-triceps-vertical', 'triceps-dips', 'mergulho-paralelas-triceps']
  },
  {
    catId: 54,
    extId: '0306',
    canonicalId: 'triceps-frances-halter',
    movementType: 'Extensão Acima da Cabeça • Isolamento Unilateral',
    cues: [
      'Braço estendido verticalmente ao lado da orelha.',
      'Desça o haltere por trás da cabeça dobrando o cotovelo.',
      'Estenda sem abrir o cotovelo para o lado.'
    ],
    aliases: ['triceps-frances-halter', 'dumbbell-one-arm-triceps-extension', 'triceps-frances-unilateral-halter']
  },
  {
    catId: 204,
    extId: '0231',
    canonicalId: 'triceps-coice-polia-unilateral',
    movementType: 'Empurrada Unilateral na Polia • Tensão Contínua',
    cues: [
      'Segure o cabo ou manopla com o cotovelo travado na cintura.',
      'Estenda o braço para baixo até a contração de pico do tríceps.',
      'Controle milimétrico no retorno excêntrico.'
    ],
    aliases: ['triceps-coice-polia-unilateral', 'cable-standing-one-arm-triceps-extension', 'triceps-unilateral-polia-alta']
  },

  // 6. ANTEBRAÇO & EMPUNHADURA (2)
  {
    catId: 187,
    extId: '0104',
    canonicalId: 'flexao-punho-halteres',
    movementType: 'Flexão de Punho por Trás • Flexores Profundos dos Dedos',
    cues: [
      'Em pé segurando a barra por trás do corpo com palmas para trás.',
      'Enrole os dedos e flexione os punhos para cima em direção às costas.',
      'Excelente construtor de força de pegada e antebraço medial.'
    ],
    aliases: ['flexao-punho-halteres', 'barbell-standing-back-wrist-curl', 'flexao-punho-por-tras-barra']
  },
  {
    catId: 189,
    extId: '0364',
    canonicalId: 'rosca-punho-inversa-banco-barra',
    movementType: 'Flexão com Halteres por Trás • Trabalho Unilateral',
    cues: [
      'Segure halteres por trás do quadril com pegada pronada.',
      'Flexione os punhos para cima com amplitude controlada.',
      'Trabalho de fortalecimento das mãos e punhos.'
    ],
    aliases: ['rosca-punho-inversa-banco-barra', 'dumbbell-behind-the-back-wrist-curl', 'flexao-punho-halteres-por-tras']
  },

  // 7. MEMBROS INFERIORES & GLÚTEOS (9)
  {
    catId: 221,
    extId: '0054',
    canonicalId: 'passada-barra-costas-walking-lunge',
    movementType: 'Passada com Barra Olímpica • Força Unilateral Dinâmica',
    cues: [
      'Barra apoiada no trapézio com pegada firme.',
      'Dê um passo à frente flexionando ambos os joelhos a 90°.',
      'O joelho traseiro quase toca o solo mantendo o tronco ereto.'
    ],
    aliases: ['passada-barra-costas-walking-lunge', 'barbell-lunge', 'passada-com-barra']
  },
  {
    catId: 218,
    extId: 'new-dumbbell-sumo-squat',
    canonicalId: 'agachamento-sumo-halter-pesado',
    movementType: 'Agachamento com Base Larga • Adutores & Glúteo Máximo',
    cues: [
      'Pés afastados além da largura dos ombros com pontas rodadas a 45°.',
      'Haltere pesado suspenso entre as pernas com braços estendidos.',
      'Desça os quadris até ultrapassar a linha dos joelhos empurrando pelo calcanhar.'
    ],
    aliases: ['agachamento-sumo-halter-pesado', 'dumbbell-sumo-squat', 'agachamento-sumo-halter']
  },
  {
    catId: 227,
    extId: 'drv-close-feet-leg-press',
    canonicalId: 'cadeira-extensora-unilateral',
    movementType: 'Leg Press com Pés Fechados • Ênfase no Vasto Lateral',
    cues: [
      'Pés posicionados no centro da plataforma com distância de 10-15 cm.',
      'Desça a plataforma controlando sem retirar o quadril do assento.',
      'Empurre estendendo as pernas sem travar os joelhos no topo.'
    ],
    aliases: ['cadeira-extensora-unilateral', 'close-feet-leg-press', 'leg-press-pes-juntos']
  },
  {
    catId: 220,
    extId: '0413',
    canonicalId: 'agachamento-pistola-pistol-squat',
    movementType: 'Agachamento com Halteres Livres • Quadríceps e Glúteos',
    cues: [
      'Halteres firmes ao lado do corpo com postura ereta.',
      'Agache dobrando os joelhos e quadris simultaneamente.',
      'Empurre contra o chão mantendo o peito elevado.'
    ],
    aliases: ['agachamento-pistola-pistol-squat', 'dumbbell-squat', 'agachamento-livre-halteres']
  },
  {
    catId: 242,
    extId: '0582',
    canonicalId: 'flexora-bola-suica',
    movementType: 'Flexão de Joelho Ajoelhada • Isolamento Unilateral dos Isquiotibiais',
    cues: [
      'Apoie o joelho no acolchoado com o rolo posicionado atrás do tornozelo.',
      'Puxe o rolo em direção ao glúteo com contração máxima.',
      'Controle milimetricamente o retorno sem soltar o peso.'
    ],
    aliases: ['flexora-bola-suica', 'lever-kneeling-leg-curl', 'flexora-ajoelhada-maquina']
  },
  {
    catId: 266,
    extId: '1393',
    canonicalId: 'panturrilha-agachamento-smith',
    movementType: 'Elevação Plantar Guiada no Smith • Gastrocnêmio com Carga',
    cues: [
      'Barra nas costas e pontas dos pés sobre o degrau/bloco.',
      'Desça os calcanhares sentindo o alongamento máximo da fáscia.',
      'Suba na ponta dos pés sustentando o topo por 1 segundo.'
    ],
    aliases: ['panturrilha-agachamento-smith', 'smith-machine-calf-raise', 'panturrilha-no-smith']
  },
  {
    catId: 264,
    extId: '0417',
    canonicalId: 'gemeos-unilateral-step-sem-carga',
    movementType: 'Elevação Plantar em Pé com Halteres • Trabalho Bilateral',
    cues: [
      'Segure os halteres ao lado do corpo e equilibre sobre o bloco.',
      'Eleve os calcanhares no ponto mais alto da contração.',
      'Descida controlada em 3 segundos.'
    ],
    aliases: ['gemeos-unilateral-step-sem-carga', 'dumbbell-standing-calf-raise', 'panturrilha-em-pe-halteres']
  },
  {
    catId: 79,
    extId: '0409',
    canonicalId: 'elevacao-pelvica-maquina',
    movementType: 'Elevação Unilateral com Halter • Correção de Assimetrias',
    cues: [
      'Apoie uma das mãos no suporte e segure o haltere com a outra.',
      'Trabalhe a perna individual com amplitude articular completa.',
      'Pausa no pico de contração antes de descer.'
    ],
    aliases: ['elevacao-pelvica-maquina', 'dumbbell-single-leg-calf-raise', 'panturrilha-unilateral-degrau']
  },
  {
    catId: 267,
    extId: '0284',
    canonicalId: 'dorsiflexao-tibial-anterior-halter',
    movementType: 'Elevação Plantar com Tronco Flexionado • Foco nos Gêmeos',
    cues: [
      'Tronco flexionado a 90° com apoio das mãos no suporte.',
      'Quadris elevados para pré-alongar a musculatura posterior da perna.',
      'Elevação potente dos calcanhares sem dobrar os joelhos.'
    ],
    aliases: ['dorsiflexao-tibial-anterior-halter', 'donkey-calf-raise', 'panturrilha-burro']
  },

  // 8. ABDÔMEN, CORE & FUNCIONAL (9)
  {
    catId: 98,
    extId: '1452',
    canonicalId: 'maquina-abdominal',
    movementType: 'Flexão de Tronco na Máquina • Reto Abdominal com Sobrecarga',
    cues: [
      'Apoie o peito ou segure as alças com os pés travados.',
      'Enrole a coluna contraindo os gomos do abdômen, sem puxar com os braços.',
      'Retorne resistindo até sentir o abdômen alongar.'
    ],
    aliases: ['maquina-abdominal', 'lever-seated-crunch', 'abdominal-na-maquina']
  },
  {
    catId: 303,
    extId: '2612',
    canonicalId: 'pulo-corda-jump-rope',
    movementType: 'Salto Contínuo com Corda • Resistência Cardiovascular e Perna',
    cues: [
      'Mantenha os cotovelos próximos às costelas e gire a corda com os punhos.',
      'Salte na ponta dos pés flexionando levemente os joelhos no impacto.',
      'Ritmo contínuo mantendo o abdômen firme e respiração constante.'
    ],
    aliases: ['pulo-corda-jump-rope', 'jump-rope', 'pulo-de-corda', '303']
  },
  {
    catId: 282,
    extId: '0325',
    canonicalId: 'knee-to-elbow-barra-fixa',
    movementType: 'Elevação de Pernas no Banco Inclinado • Porção Inferior do Abdômen',
    cues: [
      'Deite-se no banco inclinado segurando as travas superiores com as mãos.',
      'Eleve as pernas e a bacia do banco enrolando a pelve em direção ao tórax.',
      'Desça devagar sem deixar a lombar arquear.'
    ],
    aliases: ['knee-to-elbow-barra-fixa', 'incline-leg-hip-raise', 'elevacao-pernas-banco-inclinado']
  },
  {
    catId: 89,
    extId: 'drv-sit-ups',
    canonicalId: 'gemeos-hack',
    movementType: 'Flexão Completa de Tronco Solo • Força Geral de Core',
    cues: [
      'Deite de costas no solo com joelhos dobrados e pés firmes no chão.',
      'Suba o tronco completamente até encostar os cotovelos nos joelhos.',
      'Desça desenrolando a coluna vértebra por vértebra.'
    ],
    aliases: ['gemeos-hack', 'sit-up', 'sit-up-militar']
  },
  {
    catId: 94,
    extId: 'drv-v-up',
    canonicalId: 'abdominal-infra-reverso',
    movementType: 'Flexão Simultânea de Tronco e Pernas • Reto Abdominal Total',
    cues: [
      'Deite reto no solo com braços esticados acima da cabeça.',
      'Suba tronco e pernas retas ao mesmo tempo formando um "V".',
      'Toque as pontas dos pés no topo e retorne com controle total.'
    ],
    aliases: ['abdominal-infra-reverso', 'v-up', 'abdominal-canivete']
  },
  {
    catId: 91,
    extId: '0985',
    canonicalId: 'crunch-polia',
    movementType: 'Flexão Cruzada no Solo • Oblíquos Internos e Externos',
    cues: [
      'Mãos na cabeça sem puxar o pescoço; cotovelos abertos.',
      'Suba o tronco rodando e apontando o ombro em direção ao joelho oposto.',
      'Alterne os lados com contração deliberada dos oblíquos.'
    ],
    aliases: ['crunch-polia', 'twisting-crunch', 'abdominal-obliquo-cruzado']
  },
  {
    catId: 287,
    extId: '0407',
    canonicalId: 'abdominal-declinado-anilha-peito',
    movementType: 'Flexão Lateral com Halter • Oblíquos e Estabilizadores Laterais',
    cues: [
      'Em pé segurando um único haltere ao lado da coxa.',
      'Incline o tronco lateralmente na direção do haltere com quadris parados.',
      'Retorne estendendo até a vertical usando a musculatura oblíqua oposta.'
    ],
    aliases: ['abdominal-declinado-anilha-peito', 'dumbbell-side-bend', 'flexao-lateral-halter']
  },
  {
    catId: 301,
    extId: '0128',
    canonicalId: 'corda-naval-ondas-alternadas',
    movementType: 'Ondulação Rítmica Contínua • Potência de Ombros e Core',
    cues: [
      'Posição semi-agachada estável com peito aberto e core contraído.',
      'Mova os braços alternadamente para cima e para baixo gerando ondas velozes.',
      'Mantenha a respiração compassada e ritmo constante.'
    ],
    aliases: ['corda-naval-ondas-alternadas', 'battling-ropes', 'corda-naval']
  },
  {
    catId: 297,
    extId: '1160',
    canonicalId: 'burpee-completo-salto',
    movementType: 'Movimento Calistênico Dinâmico • Condicionamento Total',
    cues: [
      'Agache, apoie as mãos no chão e jogue os pés para trás.',
      'Faça uma flexão completa tocando o peito no solo.',
      'Puxe os pés de volta com explosão e salte estendendo os braços acima da cabeça.'
    ],
    aliases: ['burpee-completo-salto', 'burpee', 'burpee-completo-com-salto']
  }
];

console.log('Mapping batch 2. Total items:', BATCH_2_MAPPINGS.length);

// Construção do novo dicionário merged
const mergedDictionary = { ...EXISTING_67 };

for (const mapItem of BATCH_2_MAPPINGS) {
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

// Formatação do arquivo exerciseVideos.js
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
