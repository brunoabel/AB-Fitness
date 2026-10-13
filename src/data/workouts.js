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
        defaultSets: 3,
        restTime: 60,
        badge: 'Ombro a Ombro',
        soccerBenefit: 'Garante que quando o zagueiro ou lateral bater de lado, você não perde o equilíbrio nem a posse da bola.',
        steps: [
          'Deite firme no banco, pés plantados no chão como se estivesse travando uma dividida.',
          'Suba os halteres em movimento reto e controlado, sem bater um no outro no topo.',
          'Desça devagar sentindo o peitoral abrir até o nível da linha do tórax.'
        ],
        breathingTip: 'Solte o ar na força da subida; inspire na descida controlada.',
        beginnerMistake: 'Fazer com peso pesado demais e balançar as pernas no banco. Pés no chão firmes!',
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
        defaultSets: 3,
        restTime: 60,
        badge: 'Força de Impulsão',
        soccerBenefit: 'Melhora o posicionamento corporal nas bolas aéreas e nas disputas de cabeceio.',
        steps: [
          'Sente-se com as costas coladas no encosto e cotovelos a 90 graus na altura dos olhos.',
          'Empurre os halteres para cima de forma explosiva até quase estender os braços.',
          'Desça em 2 segundos segurando o peso na linha da orelha.'
        ],
        breathingTip: 'Expire rápido na subida explosiva; inspire na descida suave.',
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
        restTime: 45,
        badge: 'Shape Atlético',
        soccerBenefit: 'Alarga a linha dos ombros, dando presença física imponente no gramado.',
        steps: [
          'Em pé, incline o tronco 5 graus à frente e segure os halteres ao lado da coxa.',
          'Abra os braços até a altura do ombro com cotovelos levemente dobrados.',
          'Segure 1 segundo no topo e desça sem deixar o peso bater na coxa.'
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
        restTime: 45,
        badge: 'Proteção de Braço',
        soccerBenefit: 'Braço forte para usar na barreira e para proteger a bola com o braço estendido.',
        steps: [
          'Cotovelos colados nas costelas, incline um pouco o tronco à frente.',
          'Estique o braço para baixo abrindo as pontas da corda no final.',
          'Volte devagar até a altura do peito mantendo os cotovelos travados no lugar.'
        ],
        breathingTip: 'Solte o ar esticando para baixo; puxe o ar na subida controlada.',
        beginnerMistake: 'Mexer os ombros para frente e para trás. Cotovelo fica colado.',
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
        badge: 'Core Blindado',
        soccerBenefit: 'Estabilidade rotacional pura: impede que o tronco gire quando você leva um tranco correndo.',
        steps: [
          'Posição de flexão com pés afastados na largura dos ombros para dar base.',
          'Tire a mão direita e toque no ombro esquerdo sem mexer nem rebolar o quadril.',
          'Alterne os lados lentamente, mantendo o abdômen travado como uma pedra.'
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
        defaultSets: 3,
        restTime: 60,
        badge: 'O Rei do Futebol',
        soccerBenefit: 'O futebol é jogado em uma perna por vez (chute, salto, sprint). O búlgaro é o melhor exercício do mundo pra arranque e estabilidade de joelho.',
        steps: [
          'Apoie o peito do pé de trás no banco e dê um passo à frente com a outra perna.',
          'Desça o joelho de trás em direção ao chão mantendo o tronco levemente inclinado.',
          'Empurre o chão com o calcanhar da frente para subir forte.'
        ],
        breathingTip: 'Inspire ao descer; solte o ar empurrando o chão na subida.',
        beginnerMistake: 'Deixar o joelho da frente desabar para dentro. Joelho sempre alinhado com a ponta do pé.',
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
        defaultSets: 3,
        restTime: 60,
        badge: 'Vacina Anti-Estiramento',
        soccerBenefit: 'Fortalece o posterior na fase excêntrica. 80% das lesões de arrancada no futebol são no posterior — esse exercício evita isso.',
        steps: [
          'Pés na largura do quadril, joelhos levemente destravados (não dobre muito).',
          'Jogue o quadril para trás como se fosse fechar a porta de um carro com a bunda.',
          'Desça os halteres raspando rente à canela até sentir alongar a parte de trás da coxa e volte apertando os glúteos.'
        ],
        breathingTip: 'Inspire descendo com a coluna reta; expire subindo firme.',
        beginnerMistake: 'Arredondar as costas ou dobrar os joelhos como agachamento. O movimento é no quadril!',
        animationType: 'leg-curl'
      },
      {
        id: 'elevacao-pelvica-soccer',
        name: 'Elevação Pélvica / Hip Thrust com Halter',
        target: 'Glúteo Máximo (Motor do Sprint)',
        secondary: 'Posterior e Core',
        equipment: 'Banco + Halter no Quadril',
        suggestedWeight: 12,
        suggestedReps: 12,
        defaultSets: 3,
        restTime: 60,
        badge: 'Motor da Arrancada',
        soccerBenefit: 'Glúteo forte é o que gera aceleração máxima nos primeiros 5 metros de arrancada e potência no salto.',
        steps: [
          'Apoie as costas no banco logo abaixo das escápulas e coloque o halter sobre o quadril.',
          'Pés firmes no chão na largura dos ombros.',
          'Empurre o quadril para o alto até alinhar com o joelho, espremendo o glúteo por 1 segundo no topo.'
        ],
        breathingTip: 'Solte o ar na subida apertando a bunda; inspire na descida.',
        beginnerMistake: 'Hiperestender a coluna lombar no topo. Quem faz a força é o glúteo, não a lombar.',
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
        defaultSets: 3,
        restTime: 45,
        badge: 'Pernas de Mola',
        soccerBenefit: 'Dá elasticidade para saltar de cabeça e agilidade rápida para mudanças de direção curtas.',
        steps: [
          'Ponta dos pés na beira do degrau com calcanhares para fora.',
          'Suba na ponta do pé o mais alto possível de forma rápida e explosiva.',
          'Desça devagar em 3 segundos alongando bem o calcanhar abaixo da borda.'
        ],
        breathingTip: 'Expire na subida rápida e inspire na descida lenta.',
        beginnerMistake: 'Ficar quicando rápido sem amplitude. Faça subida rápida e descida lenta.',
        animationType: 'calf-raise'
      }
    ]
  },
  {
    dayId: 3,
    name: 'Quarta-feira',
    shortName: 'Qua',
    code: 'active-recovery',
    title: 'Mobilidade Ativa & Core Funcional',
    focus: 'Mobilidade de Quadril, Prevenção Articular & Core',
    duration: '30 min',
    intensity: 'Recuperação Ativa',
    level: 'Atleta AB Fitness',
    badge: 'Mobilidade & Longevidade',
    color: 'from-sky-300 to-sky-500',
    description: 'Sessão estratégica de alívio articular, fortalecimento da musculatura adutora e estabilização de core para sustentar o rendimento nos treinos pesados.',
    isRestDay: false,
    exercises: [
      {
        id: 'copenhague-leves',
        name: 'Prancha Copenhague com Joelho Flexionado',
        target: 'Adutores da Coxa (Virilha)',
        secondary: 'Core Lateral',
        equipment: 'Banco ou Colchonete',
        suggestedWeight: 0,
        suggestedReps: 15,
        defaultSets: 3,
        restTime: 45,
        badge: 'Escudo Anti-Pubalgia',
        soccerBenefit: 'A lesão que mais afasta adolescentes no futebol é a dor no púbis/adutor (pubalgia). Esse exercício protege a virilha.',
        steps: [
          'Deite de lado em prancha lateral, com o joelho da perna de cima apoiado no banco.',
          'Eleve o quadril mantendo o corpo reto e a perna de baixo suspensa.',
          'Segure a posição por 15 segundos de cada lado com firmeza.'
        ],
        breathingTip: 'Mantenha respiração constante e suave.',
        beginnerMistake: 'Deixar o quadril cair em direção ao chão. Mantenha o corpo reto como uma tábua.',
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
        defaultSets: 3,
        restTime: 30,
        badge: 'Giro Rápido',
        soccerBenefit: 'Aumenta a facilidade de girar o corpo para driblar e chutar sem travar a bacia.',
        steps: [
          'Sente-se no chão com as duas pernas dobradas em 90 graus.',
          'Incline o peito ereto à frente sobre o joelho dianteiro sentindo o glúteo alongar.',
          'Gire os joelhos para o lado oposto sem tirar os calcanhares do chão.'
        ],
        breathingTip: 'Inspire fundo e solte todo o ar na descida relaxando a musculatura.',
        beginnerMistake: 'Ter pressa. Faça o movimento suave sentindo cada articulação destravar.',
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
        defaultSets: 3,
        restTime: 30,
        badge: 'Pernas Leves',
        soccerBenefit: 'Tira a rigidez dos treinos com chuteira e melhora a flexão do tornozelo.',
        steps: [
          'Deitado de costas, eleve uma perna estendida para o alto segurando atrás da coxa.',
          'Faça movimentos de ponta de pé (para cima e para baixo) 10 vezes.',
          'Troque a perna e repita sentindo a perna ficar leve.'
        ],
        breathingTip: 'Respire com calma, oxigenando o corpo todo.',
        beginnerMistake: 'Puxar com força excessiva a ponto de tremer. Deve ser um alongamento confortável.',
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
        defaultSets: 3,
        restTime: 60,
        badge: 'Postura Imponente',
        soccerBenefit: 'Abre o peito, melhora a postura na corrida e dá aquele visual em V de atleta.',
        steps: [
          'Ajuste o apoio da coxa para ficar bem preso.',
          'Puxe a barra em direção ao peitoral superior estufando o peito.',
          'Aperte as costas por 1 segundo e deixe a barra subir devagar alongando as asas.'
        ],
        breathingTip: 'Puxe o ar antes; solte o ar puxando a barra ao peito.',
        beginnerMistake: 'Jogar o tronco 45 graus para trás como se estivesse deitado. Mantenha tronco firme!',
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
        defaultSets: 3,
        restTime: 60,
        badge: 'Equilíbrio de Força',
        soccerBenefit: 'Elimina assimetria entre o lado direito e esquerdo do corpo, evitando desvios na passada.',
        steps: [
          'Apoie mão e joelho no banco, mantendo as costas retas paralelas ao chão.',
          'Puxe o halter com o cotovelo apontando para o teto, raspando perto da cintura.',
          'Desça devagar até o braço esticar sentindo alongar a dorsal.'
        ],
        breathingTip: 'Solte o ar na subida do halter; inspire na descida.',
        beginnerMistake: 'Girar o tronco todo para puxar o peso. Só o braço se mexe!',
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
        badge: 'Braço de Respeito',
        soccerBenefit: 'Bíceps fortes protegem as articulações do cotovelo e dão imponência física.',
        steps: [
          'Em pé, segure a barra W nas curvas com pegada firme.',
          'Suba a barra dobrando os cotovelos sem mexer o quadril nem balançar o corpo.',
          'Aperte o bíceps no topo e desça em 2 segundos controlados.'
        ],
        breathingTip: 'Expire na subida da barra; inspire ao descer.',
        beginnerMistake: 'Dar tranco com a coluna. Se precisar balançar o tronco, reduza a carga para preservar a técnica impecável e isolar o bíceps!',
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
        badge: 'Potência do Chute',
        soccerBenefit: 'O chicote do chute começa na flexão do abdômen. Abdômen forte = bomba no gol.',
        steps: [
          'Deitado de costas, segure a anilha junto ao peito.',
          'Suba o tronco enrolando as costelas em direção ao umbigo, esvaziando o ar dos pulmões.',
          'Desça devagar sem deixar a cabeça bater no chão.'
        ],
        breathingTip: 'Solte TODO o ar na subida apertando a barriga; inspire ao descer.',
        beginnerMistake: 'Subir puxando o pescoço com as mãos. Mantenha o olhar no teto.',
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
        defaultSets: 3,
        restTime: 60,
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
        restTime: 45,
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
        restTime: 45,
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

