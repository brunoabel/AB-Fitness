// Programa Fundamental: Alta Performance & Hipertrofia Funcional • AB Fitness
// Desenvolvido para aliar construção muscular com atletismo, força e longevidade

export const WEEKLY_SCHEDULE = [
  {
    dayId: 1,
    name: 'Segunda-feira',
    shortName: 'Seg',
    code: 'push-performance',
    title: 'Superior & Peitoral Funcional',
    focus: 'Força de Tronco, Peitoral & Estabilidade Escapular',
    duration: '40 min',
    intensity: 'Alta Potência',
    level: 'Atleta AB Fitness',
    badge: 'Força & Hipertrofia',
    color: 'from-sky-400 to-sky-500',
    description: 'Treino focado em desenvolvimento de membros superiores com estabilidade glenoumeral e ativação precisa de peitoral, ombros e tríceps.',
    isRestDay: false,
    exercises: [
      {
        id: 'supino-halteres-soccer',
        name: 'Supino Reto com Halteres',
        target: 'Peitoral Maior & Estabilidade',
        secondary: 'Tríceps e Deltoide Anterior',
        equipment: 'Banco Reto + Halteres',
        suggestedWeight: 10,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [6, 10],
        targetRir: 2,
        progressionIncrementKg: 2.5,
        badge: 'Estabilidade Escapular',
        soccerBenefit: 'Aumenta a estabilização articular do complexo do ombro e hipertrofia o peitoral maior com máxima amplitude e controle excêntrico.',
        steps: [
          'Deite firme no banco com escápulas aduzidas e pés plantados no chão para máxima base.',
          'Suba os halteres em trajetória convergente controlada sem colidir as anilhas no topo.',
          'Desça em 2 a 3 segundos sentindo o peitoral alongar até a linha média do tórax.'
        ],
        breathingTip: 'Solte o ar na força da subida; inspire na descida controlada.',
        beginnerMistake: 'Fazer com carga excessiva e balançar o corpo no banco. Pés firmes e escápulas travadas!',
        animationType: 'dumbbell-press'
      },
      {
        id: 'desenvolvimento-halteres',
        name: 'Desenvolvimento Militar com Halteres',
        target: 'Ombros (Deltoide Anterior e Médio)',
        secondary: 'Trapézio e Tríceps',
        equipment: 'Banco 75° + Halteres',
        suggestedWeight: 8,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [6, 10],
        targetRir: 2,
        progressionIncrementKg: 2.5,
        badge: 'Força Vertical',
        soccerBenefit: 'Desenvolve força de empurrar vertical e estabilidade escapular, fortalecendo deltoides e cadeia superior.',
        steps: [
          'Sente-se com as costas coladas no encosto e cotovelos a 75-80 graus no plano escapular.',
          'Empurre os halteres para cima de forma explosiva até quase estender os braços.',
          'Desça em 2 segundos mantendo o controle até a linha das orelhas.'
        ],
        breathingTip: 'Expire na subida concêntrica; inspire na descida excêntrica suave.',
        beginnerMistake: 'Arredondar a lombar descolando as costas do banco.',
        animationType: 'shoulder-press'
      },
      {
        id: 'elevacao-lateral-speed',
        name: 'Elevação Lateral Controlada',
        target: 'Deltoide Lateral (Ombros Largos)',
        secondary: 'Trapézio Superior',
        equipment: 'Par de Halteres Leves',
        suggestedWeight: 5,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 1,
        badge: 'Largura de Ombros',
        soccerBenefit: 'Isola o deltoide lateral proporcionando maior densidade e aspecto em V na silhueta atlética.',
        steps: [
          'Em pé, incline o tronco 5 graus à frente e segure os halteres ao lado da coxa.',
          'Abra os braços até a altura do ombro com cotovelos levemente flexionados.',
          'Segure 1 segundo no pico de contração e desça sem deixar o peso bater na coxa.'
        ],
        breathingTip: 'Solte o ar ao subir e puxe o ar ao descer.',
        beginnerMistake: 'Usar impulso com o quadril jogando o corpo para trás. Mantenha o tronco estável e isole os deltoides!',
        animationType: 'lateral-raise'
      },
      {
        id: 'triceps-corda-soccer',
        name: 'Tríceps Pulley na Corda',
        target: 'Tríceps Braquial',
        secondary: 'Antebraço e Pegada',
        equipment: 'Polia Alta + Corda',
        suggestedWeight: 12,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 1,
        badge: 'Extensão de Cotovelo',
        soccerBenefit: 'Desenvolve as três cabeças do tríceps com ênfase na contração terminal e proteção articular dos cotovelos.',
        steps: [
          'Cotovelos alinhados às costelas, incline ligeiramente o tronco à frente para estabilizar o centro de gravidade.',
          'Estenda os cotovelos para baixo abrindo as pontas da corda na máxima contração.',
          'Retorne de forma controlada até 90 graus mantendo os cotovelos fixos.'
        ],
        breathingTip: 'Solte o ar esticando para baixo; puxe o ar na subida controlada.',
        beginnerMistake: 'Mexer os ombros para frente e para trás. Cotovelo fica travado.',
        animationType: 'triceps-pushdown'
      },
      {
        id: 'prancha-rotacional',
        name: 'Prancha com Toque nos Ombros (Core Anti-Rotação)',
        target: 'Core Profundo & Oblíquos',
        secondary: 'Lombar e Ombros',
        equipment: 'Colchonete',
        suggestedWeight: 0,
        suggestedReps: 16,
        defaultSets: 3,
        restTime: 45,
        repRange: [12, 20],
        targetRir: 2,
        badge: 'Anti-Rotação',
        soccerBenefit: 'Ativação do core profundo e oblíquos para resistir a forças rotacionais e proteger a coluna vertebral.',
        steps: [
          'Posição de flexão com pés afastados na largura dos ombros para garantir estabilidade.',
          'Retire a mão direita e toque no ombro esquerdo sem rotacionar a bacia.',
          'Alterne os lados lentamente, mantendo a musculatura abdominal em contração isométrica rígida.'
        ],
        breathingTip: 'Respire continuamente sem travar o ar na barriga.',
        beginnerMistake: 'Ficar balançando o quadril de um lado para o outro. O corpo deve ficar 100% reto.',
        animationType: 'crunch'
      }
    ]
  },
  {
    dayId: 2,
    name: 'Terça-feira',
    shortName: 'Ter',
    code: 'legs-sprint',
    title: 'Membros Inferiores, Potência & Posterior',
    focus: 'Agachamento Unilateral, Isquiotibiais & Glúteos',
    duration: '45 min',
    intensity: 'Foco em Potência & Força',
    level: 'Atleta AB Fitness',
    badge: 'Potência & Cadeia Posterior',
    color: 'from-sky-500 to-sky-600',
    description: 'Treino focado em desenvolvimento de quadríceps, estabilidade unilateral e fortalecimento de isquiotibiais com cadência controlada e amplitude biomecânica.',
    isRestDay: false,
    exercises: [
      {
        id: 'bulgaro-soccer',
        name: 'Agachamento Búlgaro com Halteres',
        target: 'Quadríceps, Glúteos & Estabilidade de Joelho',
        secondary: 'Tornozelos e Core',
        equipment: 'Banco Reto + Halteres',
        suggestedWeight: 6,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [8, 12],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Estabilidade Unilateral',
        soccerBenefit: 'O agachamento unilateral corrige assimetrias de força entre os membros inferiores, ativa o glúteo médio e aumenta a estabilidade dinâmica do joelho.',
        steps: [
          'Apoie o peito do pé de trás no banco e dê um passo à frente com a outra perna.',
          'Desça o joelho de trás em direção ao chão mantendo o tronco levemente inclinado.',
          'Empurre o chão com o calcanhar da frente para subir com cadência controlada.'
        ],
        breathingTip: 'Inspire ao descer; solte o ar empurrando o chão na subida.',
        beginnerMistake: 'Deixar o joelho da frente desabar em valgo dinâmico. Joelho sempre alinhado com o segundo dedo do pé.',
        animationType: 'squat'
      },
      {
        id: 'rdl-halteres',
        name: 'RDL / Terra Romeno com Halteres',
        target: 'Isquiotibiais (Posterior de Coxa)',
        secondary: 'Glúteos e Lombar',
        equipment: 'Par de Halteres',
        suggestedWeight: 10,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [8, 12],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Cadeia Posterior',
        soccerBenefit: 'O RDL fortalece os isquiotibiais em posição de máximo alongamento sob tensão excêntrica, chave contra encurtamento e lesões musculares.',
        steps: [
          'Pés na largura do quadril, joelhos levemente destravados (flexão de 15 a 20 graus).',
          'Projete o quadril posteriormente mantendo a coluna em alinhamento neutro.',
          'Desça os halteres rentes à canela sentindo o alongamento dos isquiotibiais e retorne estendendo o quadril.'
        ],
        breathingTip: 'Inspire descendo com a coluna alinhada; expire na extensão de quadril.',
        beginnerMistake: 'Flexionar os joelhos em excesso transformando em agachamento. O movimento é um hinge de quadril!',
        animationType: 'leg-curl'
      },
      {
        id: 'elevacao-pelvica-soccer',
        name: 'Elevação Pélvica / Hip Thrust com Halter',
        target: 'Glúteo Máximo',
        secondary: 'Posterior e Core',
        equipment: 'Banco + Halter no Quadril',
        suggestedWeight: 12,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 90,
        repRange: [8, 12],
        targetRir: 2,
        progressionIncrementKg: 2.5,
        badge: 'Extensão de Quadril',
        soccerBenefit: 'Desenvolve força no pico de contração do glúteo máximo, fundamental para potência explosiva, velocidade e saúde lombar.',
        steps: [
          'Apoie a região escapular no banco e posicione o peso sobre a linha do quadril.',
          'Pés plantados no chão com tíbias verticais no topo do movimento.',
          'Estenda o quadril até a linha neutra, sustentando 1 segundo de contração isométrica no topo.'
        ],
        breathingTip: 'Solte o ar na subida apertando o glúteo; inspire no retorno.',
        beginnerMistake: 'Hiperestender a coluna lombar no topo. A força deve vir exclusivamente da extensão do quadril.',
        animationType: 'leg-press'
      },
      {
        id: 'panturrilha-explosiva',
        name: 'Panturrilha em Pé Explosiva',
        target: 'Gastrocnêmio & Tendão de Aquiles',
        secondary: 'Estabilidade de Tornozelo',
        equipment: 'Degrau ou Step + Halteres',
        suggestedWeight: 8,
        suggestedReps: 15,
        defaultSets: 4,
        restTime: 60,
        repRange: [12, 15],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Propulsão & Tornozelo',
        soccerBenefit: 'Fortalece a musculatura da panturrilha e tendão de Aquiles, aprimorando rigidez elástica, impulsão e estabilidade articular.',
        steps: [
          'Antepé na borda do step com calcanhares livres para máxima amplitude.',
          'Suba na ponta dos pés com flexão plantar máxima controlada.',
          'Desça devagar em 3 segundos permitindo alongamento completo abaixo do nível do step.'
        ],
        breathingTip: 'Expire na subida concêntrica e inspire na descida excêntrica profunda.',
        beginnerMistake: 'Ficar quicando sem controle de tempo. Priorize pausa de 1s no topo e descida lenta.',
        animationType: 'calf-raise'
      }
    ]
  },
  {
    dayId: 3,
    name: 'Quarta-feira',
    shortName: 'Qua',
    code: 'active-recovery',
    title: 'Pernas (Posterior) & Mobilidade de Quadril',
    focus: 'Isquiotibiais, Quadríceps e Mobilidade de Quadril',
    duration: '40 min',
    intensity: 'Volume Moderado',
    level: 'Atleta AB Fitness',
    badge: 'Segunda Sessão de Pernas',
    color: 'from-sky-300 to-sky-500',
    description: 'Segunda sessão de pernas da semana: isolamento de quadríceps e isquiotibiais pra completar o volume semanal, fechando com mobilidade de quadril e adutores.',
    isRestDay: false,
    exercises: [
      {
        id: 'cadeira-extensora-soccer',
        name: 'Cadeira Extensora',
        target: 'Quadríceps (Vasto Medial e Reto Femoral)',
        secondary: 'Estabilidade de Joelho',
        equipment: 'Máquina Cadeira Extensora',
        suggestedWeight: 15,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Isolamento de Quadríceps',
        soccerBenefit: 'Isola o quadríceps na extensão completa do joelho, fortalecendo o vasto medial e protegendo a articulação patelofemoral — o volume direto que o agachamento unilateral de terça sozinho não entrega.',
        steps: [
          'Ajuste o encosto para que o joelho fique alinhado ao eixo de rotação da máquina.',
          'Estenda os joelhos até quase a extensão total, sem travar bruscamente a articulação.',
          'Desça em 2 a 3 segundos controlando o peso até a flexão inicial, sem soltar a carga.'
        ],
        breathingTip: 'Expire na extensão; inspire na descida controlada.',
        beginnerMistake: 'Usar impulso do quadril pra arrancar o peso. O movimento deve vir só do joelho.',
        animationType: 'leg-extension'
      },
      {
        id: 'mesa-flexora-soccer',
        name: 'Mesa Flexora',
        target: 'Isquiotibiais (Posterior de Coxa)',
        secondary: 'Glúteos',
        equipment: 'Máquina Mesa Flexora',
        suggestedWeight: 15,
        suggestedReps: 12,
        defaultSets: 4,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Isolamento Posterior',
        soccerBenefit: 'Flexiona o joelho isolando os isquiotibiais sob tensão constante, complementando o RDL de terça com um segundo estímulo semanal — equilibra a força quadríceps/isquiotibiais e reduz risco de lesão muscular.',
        steps: [
          'Deite de bruços com os tornozelos sob o rolo acolchoado, joelhos alinhados ao eixo da máquina.',
          'Flexione os joelhos trazendo os calcanhares em direção ao glúteo com força controlada.',
          'Retorne em 2 a 3 segundos sem deixar o peso bater nas anilhas no fim do curso.'
        ],
        breathingTip: 'Expire na flexão; inspire no retorno excêntrico.',
        beginnerMistake: 'Elevar o quadril do banco pra compensar a carga. Mantenha o tronco fixo no apoio.',
        animationType: 'leg-curl'
      },
      {
        id: 'copenhague-leves',
        name: 'Prancha Copenhague com Joelho Flexionado',
        target: 'Adutores da Coxa (Virilha)',
        secondary: 'Core Lateral',
        equipment: 'Banco ou Colchonete',
        suggestedWeight: 0,
        suggestedReps: 15,
        defaultSets: 2,
        restTime: 30,
        badge: 'Fortalecimento Adutor',
        soccerBenefit: 'A prancha Copenhague fortalece os adutores e músculos estabilizadores da pelve, prevenindo pubalgia e desequilíbrios biomecânicos.',
        steps: [
          'Deite de lado em prancha lateral com o joelho da perna superior apoiado sobre o banco.',
          'Eleve o quadril mantendo alinhamento longitudinal neutro e a perna inferior em suspensão.',
          'Sustente a contração isométrica por 15 segundos em cada lado.'
        ],
        breathingTip: 'Mantenha respiração constante e diafragmática sem travar o ar.',
        beginnerMistake: 'Permitir a queda da pelve em direção ao chão. Mantenha o corpo perfeitamente alinhado.',
        animationType: 'mobility'
      },
      {
        id: 'mobilidade-9090-soccer',
        name: 'Mobilidade de Quadril 90/90 com Troca',
        target: 'Cápsula do Quadril & Glúteo Médio',
        secondary: 'Lombar',
        equipment: 'Colchonete',
        suggestedWeight: 0,
        suggestedReps: 10,
        defaultSets: 2,
        restTime: 30,
        badge: 'Mobilidade de Quadril',
        soccerBenefit: 'Aumenta a amplitude de rotação interna e externa da cabeça femoral, aliviando sobrecargas na coluna lombar e joelhos.',
        steps: [
          'Sente-se no solo com ambas as pernas flexionadas a 90 graus.',
          'Incline o tronco com coluna ereta sobre o fêmur dianteiro, ativando a cápsula articular.',
          'Transicione os membros para o lado oposto mantendo os calcanhares em contato com o solo.'
        ],
        breathingTip: 'Inspire profundamente e expire na flexão anterior relaxando os tecidos.',
        beginnerMistake: 'Arredondar excessivamente a coluna torácica. O movimento deve provir do quadril.',
        animationType: 'mobility'
      },
      {
        id: 'alongamento-isquiotibiais-dinamico',
        name: 'Alongamento Ativo de Posteriores & Tornozelo',
        target: 'Cadeia Posterior & Fáscia Plantar',
        secondary: 'Panturrilhas',
        equipment: 'Colchonete ou Elástico',
        suggestedWeight: 0,
        suggestedReps: 12,
        defaultSets: 2,
        restTime: 30,
        badge: 'Dorsiflexão & Isquiotibiais',
        soccerBenefit: 'Aumenta a complacência do tecido conectivo e melhora a dorsiflexão do tornozelo, essencial para amplitude em agachamentos e passadas.',
        steps: [
          'Em decúbito dorsal, eleve um membro estendido com suporte posterior manual ou elástico.',
          'Execute flexão e extensão do tornozelo (dorsiflexão e flexão plantar) de forma compassada.',
          'Alterne os membros focando no relaxamento da cadeia posterior sob tração leve.'
        ],
        breathingTip: 'Respire ritmicamente em cadência relaxante.',
        beginnerMistake: 'Aplicar tração excessiva gerando compensação na região lombar.',
        animationType: 'stretch'
      }
    ]
  },
  {
    dayId: 4,
    name: 'Quinta-feira',
    shortName: 'Qui',
    code: 'pull-power',
    title: 'Dorsais, Posterior de Ombros & Braços',
    focus: 'Dorsais, Bíceps & Estabilidade Escapular',
    duration: '42 min',
    intensity: 'Força & Hipertrofia',
    level: 'Atleta AB Fitness',
    badge: 'Dorsal em V & Tração',
    color: 'from-sky-400 to-sky-600',
    description: 'Construção de densidade dorsal com puxadas e remadas biomecanicamente alinhadas, estimulando bíceps e estabilizadores espinhais.',
    isRestDay: false,
    exercises: [
      {
        id: 'puxada-alta-soccer',
        name: 'Puxada Alta Frontal no Pulley',
        target: 'Latíssimo do Dorso (Asas)',
        secondary: 'Bíceps e Trapézio',
        equipment: 'Polia Alta + Barra Larga',
        suggestedWeight: 20,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [6, 10],
        targetRir: 2,
        progressionIncrementKg: 2.5,
        badge: 'Largura Dorsal',
        soccerBenefit: 'Estimula o grande dorsal em movimento de adução escapular, promovendo expansão da caixa torácica e postura alinhada.',
        steps: [
          'Ajuste o apoio dos joelhos para estabilização firme da pelve.',
          'Puxe a barra em direção à porção superior do esterno com depressão escapular ativa.',
          'Sustente 1 segundo no pico de contração dorsal e controle o retorno excêntrico em 2 a 3 segundos.'
        ],
        breathingTip: 'Inspire antes de iniciar; expire na fase concêntrica puxando ao peito.',
        beginnerMistake: 'Inclinar o tronco excessivamente para trás transformando em remada. Mantenha ligeira inclinação fixa de 10-15 graus.',
        animationType: 'lat-pulldown'
      },
      {
        id: 'remada-serrote-soccer',
        name: 'Remada Serrote Unilateral com Halter',
        target: 'Dorsal & Estabilizadores do Tronco',
        secondary: 'Core e Antebraço',
        equipment: 'Banco Reto + Halter',
        suggestedWeight: 10,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [8, 12],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Densidade Escapular',
        soccerBenefit: 'Promove espessura das costas e corrige desequilíbrios musculares bilaterais mantendo a coluna em alinhamento neutro.',
        steps: [
          'Apoie mão e joelho contralaterais no banco com coluna paralela ao solo.',
          'Puxe o halter em direção ao quadril conduzindo o movimento com o cotovelo rente ao tronco.',
          'Estenda completamente o braço na descida para alongamento seguro da fáscia dorsal.'
        ],
        breathingTip: 'Solte o ar na tração concêntrica; inspire no alongamento excêntrico.',
        beginnerMistake: 'Rotacionar excessivamente o tronco para compensar o peso. Isole o trabalho nas costas.',
        animationType: 'one-arm-row'
      },
      {
        id: 'rosca-w-soccer',
        name: 'Rosca Direta com Barra W',
        target: 'Bíceps Braquial',
        secondary: 'Antebraço',
        equipment: 'Barra W + Anilhas',
        suggestedWeight: 10,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 1,
        badge: 'Pico de Bíceps',
        soccerBenefit: 'A angulação semi-pronada da barra W reduz o estresse sobre as articulações radioulnares e isola as duas cabeças do bíceps.',
        steps: [
          'Em posição ortostática estável, segure a barra W nas empunhaduras anguladas.',
          'Flexione os cotovelos sem movimentação anterior dos ombros ou balanço do tronco.',
          'Sustente a contração máxima no topo por 1 segundo e desça em 2 a 3 segundos controlados.'
        ],
        breathingTip: 'Expire na flexão do cotovelo; inspire na extensão excêntrica.',
        beginnerMistake: 'Usar pêndulo lombar para impulsionar a barra. Reduza a carga e preserve o isolamento neuromuscular.',
        animationType: 'bicep-curl'
      },
      {
        id: 'abdominal-crunch-chute',
        name: 'Abdominal Crunch com Carga no Peito',
        target: 'Reto Abdominal',
        secondary: 'Oblíquos',
        equipment: 'Colchonete + Anilha de 5kg',
        suggestedWeight: 5,
        suggestedReps: 15,
        defaultSets: 3,
        restTime: 45,
        repRange: [12, 20],
        targetRir: 2,
        badge: 'Flexão de Tronco',
        soccerBenefit: 'Fortalece o reto abdominal com sobrecarga progressiva, aprimorando a transmissão de força do core e estabilidade pélvica.',
        steps: [
          'Em decúbito dorsal com joelhos flexionados a 90 graus, apoie a carga sobre o tórax superior.',
          'Flexione o tronco aproximando as costelas da crista ilíaca, promovendo expiração completa.',
          'Retorne controladamente sem relaxar a tensão muscular contra o solo.'
        ],
        breathingTip: 'Expire completamente o ar no topo da contração; inspire no retorno.',
        beginnerMistake: 'Puxar a região cervical. O movimento deve provir estritamente do encurtamento do abdômen.',
        animationType: 'crunch'
      }
    ]
  },
  {
    dayId: 5,
    name: 'Sexta-feira',
    shortName: 'Sex',
    code: 'upper-pump',
    title: 'Peitoral Superior & Braços',
    focus: 'Porção Clavicular, Bíceps & Tríceps com Sobrecarga Controlada',
    duration: '40 min',
    intensity: 'Hipertrofia & Volume',
    level: 'Atleta AB Fitness',
    badge: 'Hipertrofia Superior',
    color: 'from-sky-400 to-sky-500',
    description: 'Fechamento da semana focado no peitoral superior e braços com cadência controlada e máxima queima metabólica.',
    isRestDay: false,
    exercises: [
      {
        id: 'incline-dumbbell-soccer',
        name: 'Supino Inclinado com Halteres',
        target: 'Peitoral Superior',
        secondary: 'Ombro Anterior',
        equipment: 'Banco 30° + Halteres',
        suggestedWeight: 8,
        suggestedReps: 10,
        defaultSets: 4,
        restTime: 90,
        repRange: [6, 10],
        targetRir: 2,
        progressionIncrementKg: 2,
        badge: 'Peitoral Cheio',
        soccerBenefit: 'Estimula o feixe clavicular do peitoral superior, conferindo aspecto denso e atlético.',
        steps: [
          'Banco inclinado a 30 graus (não mais que isso).',
          'Suba os halteres alinhados ao peito com cotovelos em 45 graus.',
          'Desça com controle sentindo o peito esticar bem.'
        ],
        breathingTip: 'Expire na subida; inspire na descida.',
        beginnerMistake: 'Abrir os cotovelos a 90 graus forçando os ombros.',
        animationType: 'incline-press'
      },
      {
        id: 'rosca-martelo-soccer',
        name: 'Rosca Martelo com Halteres',
        target: 'Braquial & Antebraço',
        secondary: 'Bíceps',
        equipment: 'Par de Halteres',
        suggestedWeight: 6,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 1,
        badge: 'Pegada Forte',
        soccerBenefit: 'Desenvolve o músculo braquial e antebraços, gerando braços mais densos e pegada poderosa.',
        steps: [
          'Palmas viradas uma para a outra (pegada neutra de martelo).',
          'Suba os dois halteres juntos sem balançar o corpo.',
          'Segure 1 segundo no topo e desça controlando.'
        ],
        breathingTip: 'Solte o ar na subida; puxe na descida.',
        beginnerMistake: 'Soltar o peso rápido na descida.',
        animationType: 'hammer-curl'
      },
      {
        id: 'triceps-frances-soccer',
        name: 'Tríceps Francês Unilateral',
        target: 'Tríceps Cabeça Longa',
        secondary: 'Ombros',
        equipment: 'Halter Leve',
        suggestedWeight: 5,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        repRange: [10, 15],
        targetRir: 2,
        progressionIncrementKg: 1,
        badge: 'Braço Definido',
        soccerBenefit: 'Isola a cabeça longa do tríceps em máxima amplitude de alongamento.',
        steps: [
          'Segure o halter com o braço estendido acima da cabeça.',
          'Dobre o cotovelo descendo o halter atrás da cabeça.',
          'Estenda de volta para cima mantendo o cotovelo apontado pro teto.'
        ],
        breathingTip: 'Inspire ao descer; expire esticando o braço.',
        beginnerMistake: 'Abrir demais o cotovelo para o lado. Mantenha perto da cabeça.',
        animationType: 'overhead-triceps'
      }
    ]
  },
  {
    dayId: 6,
    name: 'Sábado',
    shortName: 'Sáb',
    code: 'active-weekend',
    title: 'Recuperação Ativa & Esportes',
    focus: 'Caminhada, Corrida Leve ou Prática Esportiva',
    duration: 'Livre',
    intensity: 'Recuperação Dinâmica',
    level: 'Atleta AB Fitness',
    badge: 'Recuperação Ativa',
    color: 'from-amber-400 to-amber-500',
    description: 'Dia ideal para atividade recreativa, caminhada ao ar livre ou soltura articular, mantendo a circulação ativa sem fadiga muscular.',
    isRestDay: true,
    exercises: []
  },
  {
    dayId: 0,
    name: 'Domingo',
    shortName: 'Dom',
    code: 'rest-pro',
    title: 'Regeneração & Descanso Estratégico',
    focus: 'Recarga Muscular, Sono & Síntese Proteica',
    duration: 'Recuperação Total',
    intensity: 'Zero Peso',
    level: 'Atleta AB Fitness',
    badge: 'Descanso de Elite',
    color: 'from-sky-300 to-sky-500',
    description: 'O músculo hipertrofia durante o repouso com síntese proteica adequada e sono profundo. Alimente-se com qualidade e recarregue para a próxima semana.',
    isRestDay: true,
    exercises: []
  }
];

// Frases motivacionais de alta performance e mentalidade de atleta
export const MOTIVATIONAL_QUOTES = [
  {
    quote: 'Excelente treino hoje! Cada repetição concluída constrói o seu melhor físico e performance máxima.',
    author: 'AB Fitness • Performance Pro'
  },
  {
    quote: 'Mais um treino pago com maestria. A consistência diária e a técnica impecável são os segredos dos melhores.',
    author: 'AB Fitness'
  },
  {
    quote: 'Disciplina supera o cansaço. Parabéns pela dedicação ao treino de hoje, nos vemos amanhã!',
    author: 'AB Fitness'
  }
];

// Diretrizes Científicas de Fisiologia e Treinamento • AB Fitness
export const BEGINNER_GUIDE = [
  {
    title: 'Sobrecarga Progressiva: O motor da Hipertrofia',
    tag: 'Ciência do Treino',
    content: 'O corpo só desenvolve novas fibras musculares quando exposto a um estímulo progressivo. Anote todas as suas cargas no AB Fitness. Adicionar 1kg ou completar 1 repetição a mais na semana mantendo a técnica impecável é o maior preditor de hipertrofia segundo estudos de Brad Schoenfeld.'
  },
  {
    title: 'RIR: Repetições em Reserva e Proximidade da Falha',
    tag: 'Intensidade Ideal',
    content: 'Treinar com 1 a 2 repetições em reserva (RIR 1-2) proporciona estímulo hipertrófico idêntico à falha concêntrica absoluta, porém com recuperação articular e neural 40% mais rápida. Guarde a última repetição para garantir consistência e zero lesões.'
  },
  {
    title: 'Amplitude Completa e Tensão no Alongamento',
    tag: 'Biomecânica',
    content: 'A hipertrofia mediada pelo estiramento ocorre com maior intensidade na porção alongada do movimento (ex: descida do supino, RDL e búlgaro). Controle a fase excêntrica em 2 a 3 segundos com amplitude articular completa e sem rebotes.'
  },
  {
    title: 'Nutrição, Síntese Proteica & Superávit',
    tag: 'Nutrição Esportiva',
    content: 'Consuma entre 1,6g e 2,2g de proteína por quilo de peso corporal ao longo do dia, fracionada em 3 a 5 refeições. Beba de 35 a 45ml de água por quilo e garanta carboidratos estratégicos antes e após o treino para máxima reposição de glicogênio.'
  },
  {
    title: 'Intervalos de Descanso Inter-Séries',
    tag: 'Fisiologia & ATP',
    content: 'Para exercícios multiarticulares pesados, descansar de 90 a 120 segundos permite restaurar até 95% do fosfagênio (ATP-CP), permitindo sustentar alto volume de trabalho. Em exercícios isoladores, intervalos de 60 a 75 segundos maximizam o estresse metabólico.'
  }
];

