// Programa de Treino Especializado: Atleta de Futebol Sub-17 & Shape (16 Anos)
// Desenvolvido para conciliar alta performance no clube (4x/sem) com hipertrofia e força de arrancada

export const WEEKLY_SCHEDULE = [
  {
    dayId: 1,
    name: 'Segunda-feira',
    shortName: 'Seg',
    code: 'push-soccer',
    title: 'Blindagem Superior & Ombro a Ombro',
    focus: 'Força de Tronco, Peito & Disputa de Bola',
    duration: '40 min',
    intensity: 'Alta Potência',
    level: 'Atleta Sub-17',
    badge: 'Foco: Divididas Fortes',
    color: 'from-sky-400 to-sky-500',
    description: 'Treino para criar tronco forte e braços firmes. Quem não tem força de membros superiores perde todas as disputas no ombro a ombro na ponta e no meio-campo.',
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
        beginnerMistake: 'Usar impulso com o quadril jogando o corpo pra trás. Mexa só os braços, frango!',
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
    title: 'Arranque, Salto & Prevenção de Lesões',
    focus: 'Pernas de Jogador: Búlgaro & Isquiotibiais',
    duration: '45 min',
    intensity: 'Foco em Potência',
    level: 'Atleta Sub-17',
    badge: 'Sprint & Aceleração',
    color: 'from-sky-500 to-sky-600',
    description: 'Como você joga 4x na semana, o foco aqui NÃO É fadigar a perna até não conseguir andar, mas sim criar arrancada rápida e blindar os músculos de trás da coxa contra estiramentos.',
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
    title: 'Recuperação de Craque & Adutores',
    focus: 'Mobilidade de Quadril, Prevenção de Pubalgia & Soltura',
    duration: '30 min',
    intensity: 'Recuperação Regenerativa',
    level: 'Atleta Sub-17',
    badge: 'Anti-Pubalgia & Soltura',
    color: 'from-sky-300 to-sky-500',
    description: 'Quarta é dia chave se você treinou no clube ou vai treinar. Zero sobrecarga pesada: soltamos o quadril, ativamos adutores para prevenir pubalgia e recuperamos as pernas.',
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
    title: 'Tração, Costas Largas & Chute Forte',
    focus: 'Dorsais, Bíceps & Rotação de Tronco',
    duration: '42 min',
    intensity: 'Força & Hipertrofia',
    level: 'Atleta Sub-17',
    badge: 'Costas em V & Chute',
    color: 'from-sky-400 to-sky-600',
    description: 'Postura de atacante e zagueiro de elite. Costas fortes aumentam a velocidade da corrida e o abdômen rotacional aumenta a potência de finalização no gol.',
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
        beginnerMistake: 'Dar tranco com a coluna. Se tiver que balançar o corpo, abaixa o peso, frango!',
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
    title: 'Peito Superior, Braços & Perna Fresca',
    focus: 'Shape de Atleta & Pernas 100% Prontas para o Fim de Semana',
    duration: '40 min',
    intensity: 'Hipertrofia Moderada',
    level: 'Atleta Sub-17',
    badge: 'Sexta de Pump',
    color: 'from-sky-400 to-sky-500',
    description: 'Na sexta o foco é deixar as pernas 100% descansadas para o jogo do clube no final de semana, enquanto você mete bronca no peito, ombros e braços.',
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
        soccerBenefit: 'Constrói a parte de cima do peito, dando postura atlética na camisa de jogo.',
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
        soccerBenefit: 'Engrossa o braço e fortalece o antebraço para agarrar e afastar adversários.',
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
        badge: 'Braço Trincado',
        soccerBenefit: 'Completa o desenvolvimento do braço deixando a musculatura definida.',
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
    code: 'matchday-active',
    title: 'Dia de Jogo no Clube / Ativação',
    focus: 'Performance no Campo ou Descanso Estratégico',
    duration: 'Dia do Clube',
    intensity: 'Foco Total no Jogo',
    level: 'Atleta Sub-17',
    badge: 'Matchday / Resenha',
    color: 'from-amber-400 to-amber-500',
    description: 'Dia sagrado de botar a chuteira e jogar bola pelo clube! Se não tiver jogo hoje, faça apenas caminhada leve, hidratação pesada e alimentação de atleta.',
    isRestDay: true,
    exercises: []
  },
  {
    dayId: 0,
    name: 'Domingo',
    shortName: 'Dom',
    code: 'rest-pro',
    title: 'Regeneração & Descanso de Titular',
    focus: 'Recarga Muscular, Sono & Proteína',
    duration: 'Recuperação',
    intensity: 'Zero Peso',
    level: 'Atleta Sub-17',
    badge: 'Descanso de Craque',
    color: 'from-sky-300 to-sky-500',
    description: 'O músculo não cresce na academia, cresce no descanso! Coma bem, beba água e durma cedo para começar a semana voando no campo e no treino.',
    isRestDay: true,
    exercises: []
  }
];

// Frases motivacionais personalizadas para o irmão adolescente (16 anos, atleta de clube)
export const MOTIVATIONAL_QUOTES = [
  {
    quote: 'bom treino frango, nos vemos amanha',
    author: 'LA Workout • Modo Atleta'
  },
  {
    quote: 'Treino concluído, monstro! O shape tá vindo e no ombro a ombro do clube ninguém mais te derruba. Nos vemos amanhã!',
    author: 'LA Workout'
  },
  {
    quote: 'Tá pago, craque! A titularidade no clube e a carcaça de atleta não se constroem com preguiça. Descanse e até amanhã!',
    author: 'LA Workout'
  }
];

// Dicas do Manual do Atleta de Futebol (Especial para quem joga 4x por semana)
export const BEGINNER_GUIDE = [
  {
    title: 'Como treinar perna sem cansar pro treino do clube?',
    tag: 'Futebol & Academia',
    content: 'O segredo é QUALIDADE e não quantidade excessiva de peso. No futebol você precisa de potência e equilíbrio (Búlgaro e RDL). Nunca treine pernas até a falha total no dia anterior a um jogo ou treino tático pesado do clube. Guarde sempre 2 repetições na reserva!'
  },
  {
    title: 'Prevenção de Lesões: O terror do posterior e da virilha',
    tag: 'Prevenção de Atleta',
    content: 'Adolescentes no futebol sofrem muito com estiramento de posterior e pubalgia porque a perna cresce rápido. O RDL com halteres e a Prancha Copenhague da nossa planilha são as melhores vacinas do mundo para você não ficar no departamento médico.'
  },
  {
    title: 'Por que treinar peito e costas melhora seu futebol?',
    tag: 'Vantagem no Campo',
    content: 'Quando você disputa a bola ombro a ombro na ponta ou na zaga, quem tem o tronco fraco é jogado pra longe. Tronco forte permite proteger a bola de costas pro marcador e ganhar as disputas de cabeça no alto.'
  },
  {
    title: 'Alimentação para quem tem 16 anos e gasta muita energia',
    tag: 'Shape & Energia',
    content: 'Você treina no clube 4x e faz academia: seu metabolismo está voando! Coma bastante arroz, feijão, frango, ovos, frutas e beba no mínimo 3 litros de água por dia. Sem comida suficiente você não ganha músculo e perde rendimento no campo.'
  },
  {
    title: 'Quanto tempo descansar entre as séries?',
    tag: 'Temporizador',
    content: 'Para atleta de futebol, 60 segundos entre as séries é ideal para treinar a recuperação da frequência cardíaca. Em exercícios unilaterais como o búlgaro, 60 a 90 segundos garante energia máxima para a outra perna.'
  }
];
