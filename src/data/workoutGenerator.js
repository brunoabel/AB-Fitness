/**
 * AB FITNESS — GERADOR CIENTÍFICO DE TREINOS & BANCO DE DADOS ANATÔMICO
 * Baseado na literatura de ponta em fisiologia do exercício:
 * - Brad Schoenfeld, PhD (Science and Development of Muscle Hypertrophy)
 * - Dr. Mike Israetel / Renaissance Periodization (Volume Landmarks - MEV / MAV / MRV)
 * - Eric Helms, PhD (The Muscle and Strength Pyramids)
 * - Menno Henselmans (Scientific Bodybuilding & Optimal Rest Intervals)
 * - NSCA (National Strength and Conditioning Association)
 */

import { findExerciseIn100 } from './exercises100.js';

// ==============================================================================
// 1. BANCO DE DADOS MESTRE DE EXERCÍCIOS (ANATOMIA, EXECUÇÃO E SEGURANÇA)
// ==============================================================================
export const EXERCISE_DATABASE = {
  // --- PEITORAL ---
  'supino-reto-halteres': {
    id: 'supino-reto-halteres',
    name: 'Supino Reto com Halteres',
    category: 'chest',
    target: 'Peitoral Maior (Fibras Médias)',
    secondary: 'Tríceps Braquial & Deltoide Anterior',
    equipment: 'Banco Reto + Halteres',
    diagramType: 'bench-press',
    postureCheckpoints: [
      'Pés completamente firmes e apoiados no chão',
      'Escápulas aduzidas (fechadas) e deprimidas coladas no banco',
      'Cotovelos a 45° a 60° em relação ao tronco (nunca abertos a 90°)',
      'Leve curvatura natural lombar preservada (sem hiperlordose)'
    ],
    executionSteps: [
      'Deite-se no banco com os halteres na linha do peitoral médio.',
      'Inicie a descida (fase excêntrica) de forma controlada em 2 a 3 segundos até sentir um bom alongamento do peito.',
      'Empurre os halteres para cima convergindo levemente no topo sem bater os pesos.',
      'Mantenha a contração do peitoral no pico por 1 segundo antes de iniciar a próxima repetição.'
    ],
    breathing: 'Inspire controladamente na descida; expire com força na subida.',
    commonMistake: 'Abrir demais os cotovelos em cruz (90°), sobrecarregando a articulação do ombro e o manguito rotador.',
    evidenceTip: 'O uso de halteres permite maior amplitude de alongamento do que a barra fixa, recrutando até 14% mais fibras do peitoral no ponto inferior (Schoenfeld, 2020).'
  },
  'supino-inclinado-halteres': {
    id: 'supino-inclinado-halteres',
    name: 'Supino Inclinado com Halteres (30° a 45°)',
    category: 'chest',
    target: 'Peitoral Superior (Porção Clavicular)',
    secondary: 'Deltoide Anterior & Tríceps',
    equipment: 'Banco Inclinado (30°-45°) + Halteres',
    diagramType: 'incline-press',
    postureCheckpoints: [
      'Inclinação ideal do banco entre 30° e 45° (acima de 45° o foco vira ombro)',
      'Cabeça apoiada no encosto, sem projetar o pescoço à frente',
      'Punhos alinhados sobre os antebraços'
    ],
    executionSteps: [
      'Posicione os halteres acima do peitoral superior com pegada neutra ou pronada.',
      'Desça os halteres suavemente abrindo o peito até a linha da clavícula.',
      'Empurre em linha vertical em direção ao teto com aceleração controlada.'
    ],
    breathing: 'Puxe o ar na descida profunda; solte o ar na extensão dos braços.',
    commonMistake: 'Inclinar o banco em 60°, transferindo quase todo o esforço para os deltoides anteriores.',
    evidenceTip: 'Estudos eletromiográficos comprovam que 30° de inclinação é o ponto ótimo de ativação da cabeça clavicular sem fadiga excessiva do deltoide.'
  },
  'crucifixo-reto-cabos': {
    id: 'crucifixo-reto-cabos',
    name: 'Crucifixo no Crossover / Cabos',
    category: 'chest',
    target: 'Peitoral Maior (Isolamento & Pico de Contração)',
    secondary: 'Deltoide Anterior',
    equipment: 'Polia Dupla / Crossover',
    diagramType: 'cable-fly',
    postureCheckpoints: [
      'Um pé à frente do outro para estabilidade do tronco',
      'Leve flexão fixa dos cotovelos (15°) durante todo o trajeto',
      'Tronco inclinado cerca de 15° à frente com abdômen contraído'
    ],
    executionSteps: [
      'Abra os braços controlando o peso até sentir o alongamento peitoral.',
      'Traga os cabos à frente como se estivesse abraçando uma árvore larga.',
      'Aperte o peito firmemente no ponto de encontro por 1 a 2 segundos.'
    ],
    breathing: 'Inspire ao abrir os cabos; expire ao unir as mãos à frente.',
    commonMistake: 'Flexionar e estender os cotovelos como se fosse um supino, perdendo a tensão contínua do cabo.',
    evidenceTip: 'Os cabos mantêm tensão mecânica constante mesmo no pico de contração, ao contrário dos halteres livres onde a gravidade zera a tensão no topo.'
  },

  // --- DORSAL & COSTAS ---
  'puxada-frontal-aberta': {
    id: 'puxada-frontal-aberta',
    name: 'Puxada Frontal na Polia (Lat Pulldown)',
    category: 'back',
    target: 'Grande Dorsal (Largura das Costas)',
    secondary: 'Bíceps Braquial, Braquial & Redondo Maior',
    equipment: 'Polia Alta (Lat Machine) + Barra Larga',
    diagramType: 'lat-pulldown',
    postureCheckpoints: [
      'Coxas bem travadas sob os rolos acolchoados',
      'Pegada 1.5x a largura dos ombros',
      'Tronco ligeiramente inclinado (10° a 15° para trás)',
      'Peito estufado e olhar voltado ligeiramente para cima'
    ],
    executionSteps: [
      'Inicie o movimento puxando pelas escápulas (depressão escapular).',
      'Puxe a barra em direção ao peito superior (linha do esterno), levando os cotovelos para baixo e para trás.',
      'Evite balançar a coluna; segure 1 segundo na contração máxima.',
      'Retorne estendendo os braços e sentindo as dorsais alongarem completamente.'
    ],
    breathing: 'Expire ao puxar a barra ao queixo/peito; inspire na subida controlada.',
    commonMistake: 'Puxar a barra por trás do pescoço (risco à coluna cervical) ou dar solavancos para trás com a lombar.',
    evidenceTip: 'A puxada pela frente ativa 20% mais o grande dorsal com segurança anatômica articular total.'
  },
  'remada-curvada-halteres': {
    id: 'remada-curvada-halteres',
    name: 'Remada Curvada com Halteres / Barra',
    category: 'back',
    target: 'Costas Médias (Espessura, Trapézio & Romboides)',
    secondary: 'Grande Dorsal, Bíceps & Lombar Estabilizadora',
    equipment: 'Halteres ou Barra',
    diagramType: 'barbell-row',
    postureCheckpoints: [
      'Coluna neutra alinhada do quadril à cabeça (tronco inclinado a 45°)',
      'Joelhos levemente destravados',
      'Quadril posicionado para trás para ancorar o centro de gravidade'
    ],
    executionSteps: [
      'Segure os pesos com os braços estendidos abaixo do peito.',
      'Puxe os halteres em direção ao umbigo / quadril, raspando os cotovelos perto das costelas.',
      'Esmague as escápulas uma contra a outra no topo.',
      'Desça com controle estendendo as dorsais.'
    ],
    breathing: 'Expire na subida da carga; inspire na descida.',
    commonMistake: 'Arredondar a coluna toracolombar em arco, arriscando hérnias de disco.',
    evidenceTip: 'A remada com tronco a 45° é a melhor construtora de densidade muscular e espessura escapular.'
  },
  'remada-baixa-triangulo': {
    id: 'remada-baixa-triangulo',
    name: 'Remada Baixa no Cabo com Triângulo',
    category: 'back',
    target: 'Dorsal Inferior & Romboides',
    secondary: 'Bíceps & Antebraços',
    equipment: 'Polia Baixa + Puxador Triângulo',
    diagramType: 'seated-cable-row',
    postureCheckpoints: [
      'Pés firmes na plataforma de apoio com joelhos semi-flexionados',
      'Tronco ereto e perpendicular ao solo',
      'Ombros para baixo e peito aberto'
    ],
    executionSteps: [
      'Puxe o triângulo em direção ao abdômen inferior.',
      'Traga os cotovelos para trás o máximo possível sem tombar o tronco.',
      'Segure 1 segundo no pico de contração e solte lentamente.'
    ],
    breathing: 'Solte o ar ao puxar contra o tronco; puxe o ar ao estender os braços.',
    commonMistake: 'Jogar o corpo excessivamente para trás e para frente utilizando inércia em vez de força muscular.',
    evidenceTip: 'A pegada neutra em triângulo preserva os punhos e permite maior carga efetiva de trabalho nas costas.'
  },

  // --- MEMBROS INFERIORES (PERNAS & GLÚTEOS) ---
  'agachamento-livre-ou-goblet': {
    id: 'agachamento-livre-ou-goblet',
    name: 'Agachamento Goblet / Livre com Haltere',
    category: 'legs',
    target: 'Quadríceps & Glúteo Máximo',
    secondary: 'Isquiotibiais, Panturrilhas & Core',
    equipment: 'Haltere pesado ou Barra',
    diagramType: 'squat',
    postureCheckpoints: [
      'Pés na largura dos ombros, pontas apontadas ligeiramente para fora (15° a 30°)',
      'Haltere seguro colado ao esterno na altura do peito',
      'Joelhos seguindo rigorosamente a direção da ponta dos pés',
      'Coluna neutra e peito aberto'
    ],
    executionSteps: [
      'Inicie flexionando os joelhos e o quadril simultaneamente como se fosse sentar num banco baixo.',
      'Desça até as coxas ficarem paralelas ao chão (ou abaixo se tiver boa mobilidade).',
      'Empurre o chão através dos calcanhares e do meio do pé com força explosiva para subir.'
    ],
    breathing: 'Inspire antes de descer travando o ar no abdômen (Manobra de Valsalva); expire ao passar do ponto crítico da subida.',
    commonMistake: 'Deixar os joelhos colapsarem para dentro (valgo dinâmico) ao fazer esforço na subida.',
    evidenceTip: 'O agachamento profundo estimula até 3x mais os glúteos e quadríceps do que o agachamento curto (Hartmann et al., 2013).'
  },
  'agachamento-bulgaro': {
    id: 'agachamento-bulgaro',
    name: 'Agachamento Búlgaro (Unilateral)',
    category: 'legs',
    target: 'Quadríceps, Glúteo & Estabilidade Pélvica',
    secondary: 'Isquiotibiais & Core',
    equipment: 'Banco + Halteres',
    diagramType: 'bulgarian-split-squat',
    postureCheckpoints: [
      'Peito do pé traseiro apoiado com conforto sobre o banco',
      'Pé dianteiro afastado o suficiente para permitir descida vertical de 90°',
      'Tronco levemente inclinado para frente (foco glúteo) ou reto (foco quadríceps)'
    ],
    executionSteps: [
      'Desça o joelho de trás em direção ao chão de forma suave até quase encostar.',
      'O joelho da frente deve se manter alinhado com o segundo dedo do pé.',
      'Suba com força gerada unicamente pela perna da frente.'
    ],
    breathing: 'Inspire na descida; expire na subida.',
    commonMistake: 'Colocar o pé dianteiro muito perto do banco, esmagando a patela no joelho.',
    evidenceTip: 'Exercício rei para correção de assimetrias entre pernas e ganho de força de arrancada atlética.'
  },
  'stiff-romeno-halteres': {
    id: 'stiff-romeno-halteres',
    name: 'Levantamento Romeno (RDL / Stiff)',
    category: 'legs',
    target: 'Isquiotibiais (Posterior de Coxa) & Glúteos',
    secondary: 'Eretores da Espinha & Antebraço',
    equipment: 'Halteres ou Barra',
    diagramType: 'romanian-deadlift',
    postureCheckpoints: [
      'Pés na largura do quadril com joelhos levemente destravados (não hiperestendidos)',
      'Halteres deslizando colados às coxas e canelas',
      'Movimento focado em projetar o bumbum para a parede de trás (dobradiça de quadril)'
    ],
    executionSteps: [
      'Mantenha as costas travadas e empurre o quadril para trás enquanto os halteres descem.',
      'Desça até sentir um alongamento potente no posterior das coxas (geralmente abaixo do joelho).',
      'Contraia os glúteos e empurre o quadril para frente para retornar à posição ereta.'
    ],
    breathing: 'Inspire fundo no topo; desça segurando a postura; expire ao contrair os glúteos na subida.',
    commonMistake: 'Flexionar a coluna torácica para tentar alcançar o chão com os pesos.',
    evidenceTip: 'O RDL com foco excêntrico lento reduz em até 65% a incidência de estiramentos nos isquiotibiais.'
  },
  'elevacao-pelvica-quadril': {
    id: 'elevacao-pelvica-quadril',
    name: 'Elevação Pélvica com Carga (Hip Thrust)',
    category: 'legs',
    target: 'Glúteo Máximo (Pico de Tensão Máxima)',
    secondary: 'Isquiotibiais & Core',
    equipment: 'Banco + Haltere / Barra com proteção',
    diagramType: 'hip-thrust',
    postureCheckpoints: [
      'Escápulas apoiadas no banco na linha média das costas',
      'Pés plantados no chão de forma que a canela fique vertical a 90° no topo',
      'Queixo encaixado olhando para frente durante toda a subida'
    ],
    executionSteps: [
      'Posicione o peso confortavelmente sobre a linha do quadril com almofada protetora.',
      'Empurre pelos calcanhares e suba a pelve até alinhar coxa e tronco horizontalmente.',
      'Esmague os glúteos no topo por 1.5 a 2 segundos antes de descer.'
    ],
    breathing: 'Inspire na descida; expire com força máxima no topo da extensão pélvica.',
    commonMistake: 'Hiperextender a lombar no topo em vez de contrair a bacia em retroversão pélvica.',
    evidenceTip: 'Estudos de Contreras et al. mostram que a elevação pélvica gera a maior ativação eletromiográfica de glúteo de todo o treinamento resistido.'
  },

  // --- OMBROS & DELTOIDES ---
  'desenvolvimento-militar-halteres': {
    id: 'desenvolvimento-militar-halteres',
    name: 'Desenvolvimento com Halteres Sentado',
    category: 'shoulders',
    target: 'Deltoide Anterior & Médio',
    secondary: 'Tríceps & Trapézio Superior',
    equipment: 'Banco 75°-80° + Halteres',
    diagramType: 'shoulder-press',
    postureCheckpoints: [
      'Banco regulado a cerca de 75° (evita compressão na lombar)',
      'Cotovelos posicionados ligeiramente à frente do plano escapular (30° à frente)',
      'Pés no chão e abdômen ativado'
    ],
    executionSteps: [
      'Erga os halteres até a linha das orelhas.',
      'Empurre para cima em arco suave até quase estender os cotovelos.',
      'Desça de maneira controlada em 2 segundos até a altura do queixo.'
    ],
    breathing: 'Expire na fase de empurrar para cima; inspire na descida controlada.',
    commonMistake: 'Descer o peso rápido demais ou bater os halteres no alto.',
    evidenceTip: 'O plano escapular (cotovelos levemente à frente) protege a cabeça do úmero contra impacto com o acrômio.'
  },
  'elevacao-lateral-halteres': {
    id: 'elevacao-lateral-halteres',
    name: 'Elevação Lateral com Halteres / Cabos',
    category: 'shoulders',
    target: 'Deltoide Lateral (Ombros Largos em V)',
    secondary: 'Trapézio Superior',
    equipment: 'Halteres Leves / Cabos',
    diagramType: 'lateral-raise',
    postureCheckpoints: [
      'Tronco com inclinação sutil de 5° para frente',
      'Braços quase retos com leve destravamento de cotovelos',
      'Polegares nivelados ou ligeiramente para baixo (sem girar os ombros)'
    ],
    executionSteps: [
      'Erga os halteres lateralmente pelos cotovelos até a linha dos ombros.',
      'Segure 1 segundo no ponto mais alto sem encolher o pescoço.',
      'Desça devagar em 3 segundos sentindo o ombro segurar a gravidade.'
    ],
    breathing: 'Expire ao subir os braços lateralmente; inspire na descida.',
    commonMistake: 'Usar pesos excessivos e balançar o corpo com impulso das pernas.',
    evidenceTip: 'O deltoide lateral responde melhor a cadências controladas e repetições mais altas (12 a 18 reps).'
  },
  'face-pull-corda': {
    id: 'face-pull-corda',
    name: 'Face Pull com Corda no Cabo',
    category: 'shoulders',
    target: 'Deltoide Posterior, Romboides & Manguito Rotador',
    secondary: 'Trapézio Médio/Inferior',
    equipment: 'Polia Alta + Corda',
    diagramType: 'face-pull',
    postureCheckpoints: [
      'Polia regulada na altura dos olhos ou ligeiramente acima',
      'Pegada neutra com polegares voltados para você',
      'Cotovelos altos na linha das orelhas'
    ],
    executionSteps: [
      'Puxe a corda em direção à testa/olhos, abrindo as duas pontas da corda para os lados.',
      'Rotacione os ombros externamente no final, mostrando o peito.',
      'Aperte a parte de trás dos ombros por 2 segundos antes de soltar.'
    ],
    breathing: 'Expire ao puxar; inspire ao voltar.',
    commonMistake: 'Puxar para o queixo como remada alta, perdendo a rotação externa do ombro.',
    evidenceTip: 'Exercício primordial para longevidade articular e combate da postura curvada moderna de smartphone/computador.'
  },

  // --- BRAÇOS (BÍCEPS & TRÍCEPS) ---
  'rosca-direta-halteres': {
    id: 'rosca-direta-halteres',
    name: 'Rosca Biceps com Halteres (Supinada)',
    category: 'arms',
    target: 'Bíceps Braquial (Pico e Volume)',
    secondary: 'Braquial Anterior & Antebraço',
    equipment: 'Halteres',
    diagramType: 'bicep-curl',
    postureCheckpoints: [
      'Cotovelos colados e travados nas laterais do tronco',
      'Sem balanço de quadril ou tronco',
      'Rotação (supinação) do punho completa'
    ],
    executionSteps: [
      'Inicie com os halteres neutros e rotacione as palmas para cima durante a subida.',
      'Contraia o bíceps no topo sem avançar os cotovelos para frente.',
      'Desça controladamente estendendo quase todo o braço.'
    ],
    breathing: 'Expire na subida; inspire na descida.',
    commonMistake: 'Jogar os cotovelos para frente no topo, transferindo a tensão para o deltoide anterior.',
    evidenceTip: 'A supinação do punho é a função anatômica de pico do bíceps além da flexão de cotovelo.'
  },
  'triceps-corda-polia': {
    id: 'triceps-corda-polia',
    name: 'Tríceps na Polia com Corda',
    category: 'arms',
    target: 'Tríceps Braquial (Cabeça Lateral e Medial)',
    secondary: 'Antebraços',
    equipment: 'Polia Alta + Corda',
    diagramType: 'tricep-rope',
    postureCheckpoints: [
      'Cotovelos colados nas costelas sem avançar',
      'Leve inclinação do tronco para permitir que a corda abra no final',
      'Ombros para baixo e relaxados'
    ],
    executionSteps: [
      'Empurre a corda para baixo estendendo os cotovelos.',
      'No final do movimento, afaste as pontas da corda para fora para máxima contração.',
      'Segure 1 segundo e retorne até o antebraço formar 90° com o braço.'
    ],
    breathing: 'Expire ao empurrar a corda; inspire na subida até 90°.',
    commonMistake: 'Deixar os cotovelos subirem junto com a corda, transformando em puxada.',
    evidenceTip: 'O tríceps compõe 60% do volume total do braço; treiná-lo com boa técnica é o segredo para braços fortes.'
  },

  // --- ABDÔMEN & CORE ---
  'prancha-frontal-ativa': {
    id: 'prancha-frontal-ativa',
    name: 'Prancha Frontal com Contração Ativa',
    category: 'core',
    target: 'Transverso do Abdômen & Reto Abdominal',
    secondary: 'Glúteos & Ombros Estabilizadores',
    equipment: 'Colchonete',
    diagramType: 'plank',
    postureCheckpoints: [
      'Cotovelos alinhados diretamente sob os ombros',
      'Corpo em linha reta dos calcanhares à cabeça',
      'Glúteos apertados com força e abdômen puxado para dentro'
    ],
    executionSteps: [
      'Posicione-se em prancha isométrica.',
      'Imagine que quer puxar os cotovelos em direção aos pés com força (prancha RKC).',
      'Mantenha respiração constante sem prender o ar por 30 a 45 segundos.'
    ],
    breathing: 'Respiração curta e ritmada pelo diafragma mantendo a parede abdominal rígida.',
    commonMistake: 'Deixar o quadril despencar em direção ao chão, sobrecarregando a coluna lombar.',
    evidenceTip: 'A prancha com contração ativa gera até 4x mais recrutamento de fibras do core profundo do que pranchas passivas longas.'
  }
};

// ==============================================================================
// 2. GERADOR CIENTÍFICO DE PLANO SEMANAL DE TREINOS
// ==============================================================================

export function generatePersonalizedWorkoutPlan({
  goal = 'hypertrophy', // 'hypertrophy' | 'fat_loss' | 'strength' | 'athlete' | 'health'
  experience = 'beginner', // 'beginner' | 'intermediate' | 'advanced'
  frequencyDays = 4, // 3 | 4 | 5 | 6
  focusMuscle = 'balanced', // 'balanced' | 'arms_chest' | 'legs_glutes' | 'back_posture'
  duration = 'standard', // 'express' (30-40) | 'standard' (45-60) | 'high_volume' (60-75)
  splitPreference = 'auto' // 'auto' | 'ppl' | 'upper_lower' | 'arnold' | 'full_body'
}) {
  // Ajuste de parâmetros científicos por objetivo
  const goalParams = {
    hypertrophy: {
      reps: experience === 'beginner' ? 10 : 8,
      sets: experience === 'advanced' ? 4 : 3,
      rest: 90,
      intensity: 'Volume Alto & Tensão Mecânica',
      quote: 'Foco na contração muscular e progressão contínua de cargas.',
      badge: 'Hipertrofia Padrão Ouro'
    },
    fat_loss: {
      reps: 12,
      sets: 3,
      rest: 60,
      intensity: 'Alta Densidade & Gasto Calórico',
      quote: 'Preservação de massa magra com alta queima metabólica.',
      badge: 'Definição & Queima'
    },
    strength: {
      reps: 5,
      sets: experience === 'beginner' ? 3 : 5,
      rest: 150,
      intensity: 'Carga Máxima & Recrutamento Neural',
      quote: 'Força nos movimentos básicos constrói a base de tudo.',
      badge: 'Força Pura'
    },
    athlete: {
      reps: 8,
      sets: 3,
      rest: 90,
      intensity: 'Potência, Agilidade & Prevenção',
      quote: 'Equilíbrio unilateral e explosão para performance máxima.',
      badge: 'Performance de Atleta'
    },
    health: {
      reps: 12,
      sets: 3,
      rest: 60,
      intensity: 'Postura, Equilíbrio & Longevidade',
      quote: 'Corpo funcional, articulações saudáveis e energia diária.',
      badge: 'Saúde & Longevidade'
    }
  }[goal] || {
    reps: 10, sets: 3, rest: 90, intensity: 'Equilibrada', quote: 'Constância diária.', badge: 'Fitness'
  };

  // Ajuste por duração da sessão
  if (duration === 'express') {
    goalParams.sets = Math.max(2, goalParams.sets - 1);
  } else if (duration === 'high_volume') {
    goalParams.sets = goalParams.sets + 1;
  }

  // Identificação do foco muscular
  const focusLabels = {
    arms_chest: 'Foco: Braços & Peitoral',
    legs_glutes: 'Foco: Pernas & Glúteos',
    back_posture: 'Foco: Costas & Postura',
    balanced: 'Foco: Equilibrado Geral'
  };
  if (focusMuscle && focusLabels[focusMuscle]) {
    goalParams.badge = `${goalParams.badge} • ${focusLabels[focusMuscle]}`;
  }

  const getEx = (key, customReps = null, customSets = null, customRest = null) => {
    // 1. Busca no banco de 100 exercícios oficiais
    const found100 = findExerciseIn100(key);
    // 2. Busca no banco de dados detalhado existente
    const base = EXERCISE_DATABASE[key] || (found100 ? {
      id: found100.slug,
      name: found100.nome,
      target: `${found100.grupo} (${found100.mecanica})`,
      equipment: found100.mecanica,
      executionSteps: [
        'Posicione-se com alinhamento articular adequado e máxima estabilidade postural.',
        'Execute a fase excêntrica de forma controlada em 2 a 3 segundos.',
        'Finalize a fase concêntrica com aceleração e contração no pico.'
      ],
      postureCheckpoints: [
        'Manter coluna vertebral neutra e abdômen ativado.',
        'Controle articular completo sem impulsos.'
      ]
    } : null);

    if (!base) return null;
    return {
      ...base,
      suggestedReps: customReps || found100?.reps || goalParams.reps,
      defaultSets: customSets || found100?.series || goalParams.sets,
      restTime: customRest || found100?.descanso_seg || goalParams.rest,
      suggestedWeight: experience === 'advanced' ? 16 : experience === 'intermediate' ? 12 : 8
    };
  };

  // -------------------------------------------------------------
  // DIVISÃO DE 3 DIAS NA SEMANA (FULL BODY A / B / C CIENTÍFICO)
  // -------------------------------------------------------------
  if (frequencyDays === 3) {
    return [
      {
        dayId: 1,
        name: 'Segunda-feira',
        shortName: 'Seg',
        title: 'Full Body A: Base de Força & Tronco',
        focus: 'Peitoral, Quadríceps, Costas & Core',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: goalParams.badge,
        color: 'from-sky-400 to-sky-500',
        description: 'Primeira sessão da semana ativando grandes grupos musculares com máxima eficiência e estímulo sistêmico.',
        isRestDay: false,
        exercises: [
          getEx('supino-reto-barra'),
          getEx('agachamento-livre-barra'),
          getEx('puxada-frontal-aberta'),
          getEx('desenvolvimento-militar'),
          getEx('cadeira-extensora'),
          getEx('prancha-abdominal-frontal')
        ].filter(Boolean)
      },
      {
        dayId: 2,
        name: 'Terça-feira',
        shortName: 'Ter',
        title: 'Recuperação Ativa & Mobilidade',
        focus: 'Regeneração Muscular & Descanso',
        duration: '20 min',
        intensity: 'Baixa',
        badge: 'Regeneração',
        color: 'from-emerald-400 to-teal-500',
        description: 'O músculo cresce durante o descanso. Hidrate-se e faça uma caminhada leve.',
        isRestDay: true,
        exercises: []
      },
      {
        dayId: 3,
        name: 'Quarta-feira',
        shortName: 'Qua',
        title: 'Full Body B: Cadeia Posterior & Puxadas',
        focus: 'Dorsal, Isquiotibiais & Braços',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Espessura & Posterior',
        color: 'from-sky-500 to-blue-600',
        description: 'Sessão focada na cadeia posterior, postura e força de puxada.',
        isRestDay: false,
        exercises: [
          getEx('levantamento-terra'),
          getEx('remada-curvada-barra'),
          getEx('supino-inclinado-halteres'),
          getEx('elevacao-lateral-halteres'),
          getEx('rosca-direta-barra'),
          getEx('triceps-testa-barra-w')
        ].filter(Boolean)
      },
      {
        dayId: 4,
        name: 'Quinta-feira',
        shortName: 'Qui',
        title: 'Descanso e Síntese Proteica',
        focus: 'Recuperação Neuromuscular',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Off Day',
        color: 'from-slate-400 to-slate-500',
        description: 'Alimentação adequada e sono de qualidade para preparar a última sessão da semana.',
        isRestDay: true,
        exercises: []
      },
      {
        dayId: 5,
        name: 'Sexta-feira',
        shortName: 'Sex',
        title: 'Full Body C: Unilateral & Hipertrofia Pura',
        focus: 'Glúteos, Ombros & Isolamento',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Fechamento de Semana',
        color: 'from-sky-400 to-indigo-500',
        description: 'Correção de assimetrias com movimentos unilaterais e volume nos deltoides.',
        isRestDay: false,
        exercises: [
          getEx('agachamento-bulgaro'),
          getEx('elevacao-pelvica-barra'),
          getEx('crossover-polia-media'),
          getEx('remada-unilateral-serrote'),
          getEx('face-pull'),
          getEx('rosca-martelo-halteres'),
          getEx('triceps-corda')
        ].filter(Boolean)
      },
      {
        dayId: 6,
        name: 'Sábado',
        shortName: 'Sáb',
        title: 'Fim de Semana Ativo',
        focus: 'Lazer, Esportes ou Caminhada',
        duration: 'Livre',
        intensity: 'Lazer',
        badge: 'Ativo',
        color: 'from-zinc-400 to-zinc-500',
        description: 'Aproveite o fim de semana com a sensação de missão cumprida.',
        isRestDay: true,
        exercises: []
      },
      {
        dayId: 0,
        name: 'Domingo',
        shortName: 'Dom',
        title: 'Planejamento & Descanso Total',
        focus: 'Preparação para a Próxima Semana',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Mentalidade Pro',
        color: 'from-slate-400 to-slate-500',
        description: 'Organize suas refeições e prepare-se mentalmente para bater novos recordes na segunda.',
        isRestDay: true,
        exercises: []
      }
    ];
  }

  // -------------------------------------------------------------
  // DIVISÃO DE 4 DIAS NA SEMANA (UPPER / LOWER A/B - PADRÃO OURO)
  // -------------------------------------------------------------
  if (frequencyDays === 4) {
    return [
      {
        dayId: 1,
        name: 'Segunda-feira',
        shortName: 'Seg',
        title: 'Superior A: Empurrar & Puxar (Força)',
        focus: 'Peitoral, Costas, Ombros & Braços',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Upper Power',
        color: 'from-sky-400 to-sky-500',
        description: 'Estímulo primário da parte superior com supino reto, puxada aberta e braços.',
        isRestDay: false,
        exercises: [
          getEx('supino-reto-barra'),
          getEx('puxada-frontal-aberta'),
          getEx('desenvolvimento-militar'),
          getEx('remada-baixa-cabo'),
          getEx('triceps-corda'),
          getEx('rosca-direta-barra')
        ].filter(Boolean)
      },
      {
        dayId: 2,
        name: 'Terça-feira',
        shortName: 'Ter',
        title: 'Inferior A: Quadríceps & Core',
        focus: 'Membros Inferiores com Foco Anterior',
        duration: '45 min',
        intensity: goalParams.intensity,
        badge: 'Legs A',
        color: 'from-sky-500 to-blue-600',
        description: 'Construção de base forte nos membros inferiores com foco em quadríceps e estabilidade.',
        isRestDay: false,
        exercises: [
          getEx('agachamento-livre-barra'),
          getEx('leg-press-45'),
          getEx('agachamento-bulgaro'),
          getEx('cadeira-extensora'),
          getEx('panturrilha-em-pe-maquina'),
          getEx('prancha-abdominal-frontal')
        ].filter(Boolean)
      },
      {
        dayId: 3,
        name: 'Quarta-feira',
        shortName: 'Qua',
        title: 'Recuperação Metabólica',
        focus: 'Descanso e Síntese Muscular',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Recuperação',
        color: 'from-teal-400 to-emerald-500',
        description: 'Dia para regenerar glicogênio muscular e relaxar a musculatura.',
        isRestDay: true,
        exercises: []
      },
      {
        dayId: 4,
        name: 'Quinta-feira',
        shortName: 'Qui',
        title: 'Superior B: Espessura & Deltoides',
        focus: 'Peitoral Superior, Remadas & Braços',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Upper Hypertrophy',
        color: 'from-sky-400 to-indigo-500',
        description: 'Volume focado no peitoral superior e formato em V dos ombros.',
        isRestDay: false,
        exercises: [
          getEx('supino-inclinado-halteres'),
          getEx('remada-curvada-barra'),
          getEx('crucifixo-inclinado-halteres'),
          getEx('elevacao-lateral-polia'),
          getEx('rosca-scott-barra-w'),
          getEx('triceps-pulley-barra-reta')
        ].filter(Boolean)
      },
      {
        dayId: 5,
        name: 'Sexta-feira',
        shortName: 'Sex',
        title: 'Inferior B: Cadeia Posterior & Glúteos',
        focus: 'Isquiotibiais, Glúteos & Postura',
        duration: '45 min',
        intensity: goalParams.intensity,
        badge: 'Posterior Power',
        color: 'from-blue-500 to-sky-600',
        description: 'Fechamento da semana com posterior de coxa e glúteo máximo protegendo joelhos e lombar.',
        isRestDay: false,
        exercises: [
          getEx('levantamento-terra'),
          getEx('stiff-com-halteres'),
          getEx('elevacao-pelvica-barra'),
          getEx('mesa-flexora'),
          getEx('panturrilha-sentado-gemeos'),
          getEx('abdominal-polia-rope-crunch')
        ].filter(Boolean)
      },
      {
        dayId: 6,
        name: 'Sábado',
        shortName: 'Sáb',
        title: 'Descanso & Mobilidade',
        focus: 'Regeneração',
        duration: '0 min',
        intensity: 'Livre',
        badge: 'Off Day',
        color: 'from-slate-400 to-slate-500',
        description: 'Descanso merecido após 4 treinos de alta produtividade.',
        isRestDay: true,
        exercises: []
      },
      {
        dayId: 0,
        name: 'Domingo',
        shortName: 'Dom',
        title: 'Preparação Semanal',
        focus: 'Estratégia e Sono',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Foco Mental',
        color: 'from-slate-400 to-slate-500',
        description: 'Recarregue as baterias para a nova semana de treinos no AB Fitness.',
        isRestDay: true,
        exercises: []
      }
    ];
  }

  // -------------------------------------------------------------
  // DIVISÃO DE 6 DIAS NA SEMANA — ARNOLD SPLIT (PEITO+COSTAS / OMBROS+BRAÇOS / PERNAS 2X)
  // -------------------------------------------------------------
  if (frequencyDays === 6 && splitPreference === 'arnold') {
    return [
      {
        dayId: 1,
        name: 'Segunda-feira',
        shortName: 'Seg',
        title: 'Arnold A1: Peitoral & Dorsais (Antagonistas)',
        focus: 'Peito Completo, Grande Dorsal & Espessura',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Torso A',
        color: 'from-sky-400 to-sky-500',
        description: 'Combinação clássica antagonista de peitoral e costas para máximo fluxo sanguíneo e densidade de tronco.',
        isRestDay: false,
        exercises: [
          getEx('supino-reto-barra'),
          getEx('barra-fixa-pronada'),
          getEx('supino-inclinado-halteres'),
          getEx('remada-curvada-barra'),
          getEx('crossover-polia-media'),
          getEx('puxada-com-triangulo')
        ].filter(Boolean)
      },
      {
        dayId: 2,
        name: 'Terça-feira',
        shortName: 'Ter',
        title: 'Arnold B1: Deltoides 3D & Braços Completos',
        focus: 'Ombros (3 Cabeças), Bíceps & Tríceps',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Arms & Delts',
        color: 'from-sky-500 to-blue-600',
        description: 'Sessão dedicada a ombros largos e braços densos com os músculos frescos.',
        isRestDay: false,
        exercises: [
          getEx('desenvolvimento-militar'),
          getEx('elevacao-lateral-halteres'),
          getEx('face-pull'),
          getEx('rosca-direta-barra'),
          getEx('triceps-testa-barra-w'),
          getEx('rosca-martelo-halteres'),
          getEx('triceps-corda')
        ].filter(Boolean)
      },
      {
        dayId: 3,
        name: 'Quarta-feira',
        shortName: 'Qua',
        title: 'Arnold C1: Pernas Completas (Foco Quadríceps)',
        focus: 'Quadríceps, Glúteos, Panturrilhas & Core',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Legs A',
        color: 'from-blue-600 to-indigo-600',
        description: 'Base pesada de membros inferiores com agachamento livre, leg press e estabilidade.',
        isRestDay: false,
        exercises: [
          getEx('agachamento-livre-barra'),
          getEx('leg-press-45'),
          getEx('agachamento-bulgaro'),
          getEx('cadeira-extensora'),
          getEx('panturrilha-em-pe-maquina'),
          getEx('abdominal-polia-rope-crunch')
        ].filter(Boolean)
      },
      {
        dayId: 4,
        name: 'Quinta-feira',
        shortName: 'Qui',
        title: 'Arnold A2: Peitoral Superior & Costas Densidade',
        focus: 'Porção Clavicular, Remadas & Dorsal',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Torso B',
        color: 'from-sky-400 to-indigo-500',
        description: 'Segundo estímulo semanal de tronco priorizando ângulos inclinados e remadas apoiadas.',
        isRestDay: false,
        exercises: [
          getEx('supino-inclinado-halteres'),
          getEx('puxada-frontal-aberta'),
          getEx('crucifixo-inclinado-halteres'),
          getEx('remada-cavalinho'),
          getEx('paralelas-foco-peito'),
          getEx('remada-unilateral-serrote')
        ].filter(Boolean)
      },
      {
        dayId: 5,
        name: 'Sexta-feira',
        shortName: 'Sex',
        title: 'Arnold B2: Ombros & Braços (Hipertrofia Metabólica)',
        focus: 'Deltoide Lateral/Posterior, Bíceps & Tríceps',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Pump',
        color: 'from-zinc-400 to-zinc-500',
        description: 'Tensão contínua em polias e halteres para detalhamento de deltoides e braços.',
        isRestDay: false,
        exercises: [
          getEx('desenvolvimento-com-halteres'),
          getEx('elevacao-lateral-polia'),
          getEx('crucifixo-invertido-halteres'),
          getEx('rosca-scott-barra-w'),
          getEx('triceps-pulley-barra-reta'),
          getEx('rosca-concentrada')
        ].filter(Boolean)
      },
      {
        dayId: 6,
        name: 'Sábado',
        shortName: 'Sáb',
        title: 'Arnold C2: Cadeia Posterior, Glúteos & Core',
        focus: 'Isquiotibiais, Glúteo Máximo & Abdômen',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Arnold Legs B',
        color: 'from-indigo-500 to-sky-500',
        description: 'Construção da cadeia posterior com stiff, elevação pélvica e flexoras.',
        isRestDay: false,
        exercises: [
          getEx('stiff-com-halteres'),
          getEx('elevacao-pelvica-barra'),
          getEx('mesa-flexora'),
          getEx('cadeira-abdutora'),
          getEx('panturrilha-sentado-gemeos'),
          getEx('prancha-abdominal-frontal')
        ].filter(Boolean)
      },
      {
        dayId: 0,
        name: 'Domingo',
        shortName: 'Dom',
        title: 'Recuperação Ativa & Descanso',
        focus: 'Regeneração Neuromuscular',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Off Day',
        color: 'from-slate-400 to-slate-500',
        description: 'Descanso total para supercompensação após 6 sessões do Arnold Split.',
        isRestDay: true,
        exercises: []
      }
    ];
  }

  // -------------------------------------------------------------
  // DIVISÃO DE 6 DIAS NA SEMANA (PUSH / PULL / LEGS 2X - ATLETA AVANÇADO)
  // -------------------------------------------------------------
  if (frequencyDays === 6) {
    return [
      {
        dayId: 1,
        name: 'Segunda-feira',
        shortName: 'Seg',
        title: 'Push A: Peitoral Força & Deltoides',
        focus: 'Peito, Ombros e Tríceps',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Push Power',
        color: 'from-sky-400 to-sky-500',
        description: 'Construção de força no plano horizontal com supino reto, desenvolvimento e trabalho acessório de tríceps.',
        isRestDay: false,
        exercises: [
          getEx('supino-reto-barra'),
          getEx('supino-inclinado-halteres'),
          getEx('desenvolvimento-militar'),
          getEx('elevacao-lateral-halteres'),
          getEx('triceps-testa-barra-w'),
          getEx('triceps-corda')
        ].filter(Boolean)
      },
      {
        dayId: 2,
        name: 'Terça-feira',
        shortName: 'Ter',
        title: 'Pull A: Largura de Dorsais & Bíceps',
        focus: 'Costas, Trapézio e Bíceps',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Pull Power',
        color: 'from-sky-500 to-blue-600',
        description: 'Foco na abertura de dorsais em V e força de pegada com remadas e roscas pesadas.',
        isRestDay: false,
        exercises: [
          getEx('barra-fixa-pronada'),
          getEx('remada-curvada-barra'),
          getEx('puxada-com-triangulo'),
          getEx('face-pull'),
          getEx('rosca-direta-barra'),
          getEx('rosca-martelo-halteres')
        ].filter(Boolean)
      },
      {
        dayId: 3,
        name: 'Quarta-feira',
        shortName: 'Qua',
        title: 'Legs A: Quadríceps & Panturrilha',
        focus: 'Membros Inferiores & Cadeia Anterior',
        duration: '55 min',
        intensity: goalParams.intensity,
        badge: 'Legs Power',
        color: 'from-blue-600 to-indigo-600',
        description: 'Agachamento com barra e cadeia anterior pesada construindo força nas pernas.',
        isRestDay: false,
        exercises: [
          getEx('agachamento-livre-barra'),
          getEx('leg-press-45'),
          getEx('agachamento-bulgaro'),
          getEx('cadeira-extensora'),
          getEx('panturrilha-em-pe-maquina'),
          getEx('abdominal-polia-rope-crunch')
        ].filter(Boolean)
      },
      {
        dayId: 4,
        name: 'Quinta-feira',
        shortName: 'Qui',
        title: 'Push B: Peitoral Superior & Isolamentos',
        focus: 'Peitoral Superior, Ombros e Tríceps',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Push Hypertrophy',
        color: 'from-sky-400 to-indigo-500',
        description: 'Estímulo metabólico focado no peitoral superior, crossover e cabeça lateral do deltoide.',
        isRestDay: false,
        exercises: [
          getEx('supino-inclinado-halteres'),
          getEx('crossover-polia-media'),
          getEx('desenvolvimento-com-halteres'),
          getEx('elevacao-lateral-polia'),
          getEx('paralelas-foco-peito'),
          getEx('triceps-pulley-barra-reta')
        ].filter(Boolean)
      },
      {
        dayId: 5,
        name: 'Sexta-feira',
        shortName: 'Sex',
        title: 'Pull B: Espessura de Costas & Bíceps',
        focus: 'Dorsal Média, Posterior de Ombro e Bíceps',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Pull Density',
        color: 'from-zinc-400 to-zinc-500',
        description: 'Densidade dorsal com remada cavalinho, serrote e pico de contração no bíceps.',
        isRestDay: false,
        exercises: [
          getEx('remada-cavalinho'),
          getEx('remada-unilateral-serrote'),
          getEx('pulldown-com-corda'),
          getEx('crucifixo-invertido-halteres'),
          getEx('rosca-scott-barra-w'),
          getEx('rosca-concentrada')
        ].filter(Boolean)
      },
      {
        dayId: 6,
        name: 'Sábado',
        shortName: 'Sáb',
        title: 'Legs B: Posterior, Glúteos & Core',
        focus: 'Isquiotibiais, Glúteos & Abdômen',
        duration: '50 min',
        intensity: goalParams.intensity,
        badge: 'Posterior & Glutes',
        color: 'from-indigo-500 to-sky-500',
        description: 'Cadeia posterior profunda protegendo a coluna lombar e joelhos com elevação pélvica e stiff.',
        isRestDay: false,
        exercises: [
          getEx('stiff-com-halteres'),
          getEx('elevacao-pelvica-barra'),
          getEx('mesa-flexora'),
          getEx('cadeira-abdutora'),
          getEx('panturrilha-sentado-gemeos'),
          getEx('prancha-abdominal-frontal')
        ].filter(Boolean)
      },
      {
        dayId: 0,
        name: 'Domingo',
        shortName: 'Dom',
        title: 'Recuperação Ativa & Descanso',
        focus: 'Regeneração Neuromuscular',
        duration: '0 min',
        intensity: 'Repouso',
        badge: 'Off Day',
        color: 'from-slate-400 to-slate-500',
        description: 'Descanso total para absorver as adaptações de 6 dias de treinamento intenso.',
        isRestDay: true,
        exercises: []
      }
    ];
  }

  // -------------------------------------------------------------
  // DIVISÃO DE 5 DIAS NA SEMANA (PADRÃO: PUSH / PULL / LEGS / UPPER / LOWER)
  // -------------------------------------------------------------
  return [
    {
      dayId: 1,
      name: 'Segunda-feira',
      shortName: 'Seg',
      title: 'Empurrar (Push): Peitoral, Ombros & Tríceps',
      focus: 'Músculos de Empurrada',
      duration: '50 min',
      intensity: goalParams.intensity,
      badge: 'Push Day',
      color: 'from-sky-400 to-sky-500',
      description: 'Dia dedicado a empurrar cargas pesadas com peito, deltoides e tríceps.',
      isRestDay: false,
      exercises: [
        getEx('supino-reto-barra'),
        getEx('supino-inclinado-halteres'),
        getEx('crossover-polia-media'),
        getEx('desenvolvimento-militar'),
        getEx('elevacao-lateral-halteres'),
        getEx('triceps-corda')
      ].filter(Boolean)
    },
    {
      dayId: 2,
      name: 'Terça-feira',
      shortName: 'Ter',
      title: 'Puxar (Pull): Dorsal, Trapézio & Bíceps',
      focus: 'Músculos de Puxada e Espessura',
      duration: '50 min',
      intensity: goalParams.intensity,
      badge: 'Pull Day',
      color: 'from-sky-500 to-blue-600',
      description: 'Costas completas com puxadas verticais, remadas densas e flexores do cotovelo.',
      isRestDay: false,
      exercises: [
        getEx('puxada-frontal-aberta'),
        getEx('remada-curvada-barra'),
        getEx('remada-unilateral-serrote'),
        getEx('face-pull'),
        getEx('rosca-direta-barra'),
        getEx('rosca-martelo-halteres')
      ].filter(Boolean)
    },
    {
      dayId: 3,
      name: 'Quarta-feira',
      shortName: 'Qua',
      title: 'Pernas & Core (Legs Focus)',
      focus: 'Quadríceps, Isquiotibiais & Glúteos',
      duration: '50 min',
      intensity: goalParams.intensity,
      badge: 'Leg Day',
      color: 'from-blue-600 to-sky-500',
      description: 'Treino potente para os membros inferiores construindo base inabalável.',
      isRestDay: false,
      exercises: [
        getEx('agachamento-livre-barra'),
        getEx('leg-press-45'),
        getEx('agachamento-bulgaro'),
        getEx('stiff-com-halteres'),
        getEx('panturrilha-em-pe-maquina'),
        getEx('prancha-abdominal-frontal')
      ].filter(Boolean)
    },
    {
      dayId: 4,
      name: 'Quinta-feira',
      shortName: 'Qui',
      title: 'Superior Foco (Upper Hypertrophy)',
      focus: 'Peitoral & Dorsal com Isolamentos',
      duration: '45 min',
      intensity: goalParams.intensity,
      badge: 'Upper Fit',
      color: 'from-sky-400 to-indigo-500',
      description: 'Volume complementar para peito, dorsais, ombros e braços.',
      isRestDay: false,
      exercises: [
        getEx('crucifixo-inclinado-halteres'),
        getEx('puxada-com-triangulo'),
        getEx('elevacao-lateral-polia'),
        getEx('rosca-scott-barra-w'),
        getEx('triceps-pulley-barra-reta')
      ].filter(Boolean)
    },
    {
      dayId: 5,
      name: 'Sexta-feira',
      shortName: 'Sex',
      title: 'Inferior Posterior & Glúteos',
      focus: 'Glúteos, Unilateral & Mobilidade',
      duration: '45 min',
      intensity: goalParams.intensity,
      badge: 'Posterior & Power',
      color: 'from-zinc-400 to-zinc-500',
      description: 'Finalize a semana com posterior blindado e glúteos ativos.',
      isRestDay: false,
      exercises: [
        getEx('elevacao-pelvica-barra'),
        getEx('mesa-flexora'),
        getEx('cadeira-extensora'),
        getEx('cadeira-abdutora'),
        getEx('abdominal-polia-rope-crunch')
      ].filter(Boolean)
    },
    {
      dayId: 6,
      name: 'Sábado',
      shortName: 'Sáb',
      title: 'Descanso e Regeneração',
      focus: 'Recuperação',
      duration: '0 min',
      intensity: 'Repouso',
      badge: 'Off Day',
      color: 'from-slate-400 to-slate-500',
      description: 'Dia de descanso completo.',
      isRestDay: true,
      exercises: []
    },
    {
      dayId: 0,
      name: 'Domingo',
      shortName: 'Dom',
      title: 'Planejamento e Foco',
      focus: 'Recuperação Total',
      duration: '0 min',
      intensity: 'Repouso',
      badge: 'Off Day',
      color: 'from-slate-400 to-slate-500',
      description: 'Amanhã começa outro ciclo de evolução no AB Fitness.',
      isRestDay: true,
      exercises: []
    }
  ];
}
