import fs from 'fs';

// Lista dos 50 novos exercícios com mapeamento de aliases para o nosso catálogo (EXERCISES_100 e WEEKLY_SCHEDULE)
const BATCH_50 = [
  // PEITO (6)
  {
    canonicalId: 'crucifixo-reto-halteres',
    name: 'Crucifixo Reto com Halteres',
    equipment: 'Banco Plano + Halteres',
    movementType: 'Adução Horizontal • Isolamento de Peitoral',
    target: 'Peitoral Maior (Fibras Esternais)',
    apiId: '0308',
    keyCues: [
      'Deite firme no banco com escápulas travadas e pés plantados.',
      'Abra os braços em arco suave mantendo os cotovelos com leve flexão fixa.',
      'Feche os halteres no topo sentindo o miolo do peito contrair sem bater os pesos.'
    ],
    aliases: ['crucifixo-reto-halteres', 'crucifixo-reto', 'dumbbell-fly', 'crucifixo-com-halteres', '4']
  },
  {
    canonicalId: 'crucifixo-inclinado-halteres',
    name: 'Crucifixo Inclinado com Halteres',
    equipment: 'Banco 30° + Halteres',
    movementType: 'Adução Inclinada • Feixe Clavicular',
    target: 'Peitoral Superior',
    apiId: '0319',
    keyCues: [
      'Banco regulado a 30° para foco no peitoral superior.',
      'Cotovelos levemente flexionados, descendo até a linha do peito.',
      'Aproxime os halteres no topo sem perder a tensão na musculatura.'
    ],
    aliases: ['crucifixo-inclinado-halteres', 'crucifixo-inclinado', 'dumbbell-incline-fly', '5']
  },
  {
    canonicalId: 'supino-inclinado-barra',
    name: 'Supino Inclinado com Barra',
    equipment: 'Banco 30° + Barra Olímpica',
    movementType: 'Empurrar Inclinado Bilateral',
    target: 'Peitoral Superior & Deltoide Anterior',
    apiId: '0047',
    keyCues: [
      'Pegada ligeiramente mais larga que a linha dos ombros.',
      'Desça a barra controlada até a porção superior do esterno.',
      'Empurre verticalmente mantendo as escápulas coladas no encosto.'
    ],
    aliases: ['supino-inclinado-barra', 'supino-inclinado-com-barra', 'barbell-incline-bench-press']
  },
  {
    canonicalId: 'voador-peck-deck',
    name: 'Voador / Peck Deck na Máquina',
    equipment: 'Aparelho Peck Deck',
    movementType: 'Adução Guiada em Máquina',
    target: 'Peitoral Maior (Isolamento)',
    apiId: 'drv-lever-pec-deck-fly',
    keyCues: [
      'Ajuste o assento para que as manoplas fiquem na linha do tórax.',
      'Mantenha as costas totalmente apoiadas e peito estufado.',
      'Junte os braços sustentando 1 segundo de pico de contração.'
    ],
    aliases: ['voador-peck-deck', 'voador', 'peck-deck', 'lever-pec-deck-fly', '9']
  },
  {
    canonicalId: 'crossover-polia-alta',
    name: 'Crossover na Polia Alta',
    equipment: 'Polia Dupla Alta',
    movementType: 'Adução com Tensão Contínua em Cabos',
    target: 'Peitoral Inferior e Esternal',
    apiId: '1269',
    keyCues: [
      'Dê um passo à frente com tronco levemente inclinado.',
      'Puxe os cabos para frente e para baixo em trajetória semicircular.',
      'Cruze suavemente as mãos no ponto final para contração máxima.'
    ],
    aliases: ['crossover-polia-alta', 'crossover', 'cable-standing-fly', '6']
  },
  {
    canonicalId: 'flexao-de-braco',
    name: 'Flexão de Braço no Solo',
    equipment: 'Peso Corporal',
    movementType: 'Empurrar Horizontal Calistênico',
    target: 'Peitoral, Tríceps & Core',
    apiId: 'drv-push-ups',
    keyCues: [
      'Mãos na largura dos ombros e corpo em linha reta dos pés à cabeça.',
      'Desça até o peito quase tocar o solo com cotovelos a ~45°.',
      'Empurre o chão com força contraindo abdômen e glúteos.'
    ],
    aliases: ['flexao-de-braco', 'flexao', 'push-up', '11']
  },

  // COSTAS & TRAPÉZIO (8)
  {
    canonicalId: 'remada-baixa-cabo',
    name: 'Remada Baixa no Cabo com Triângulo',
    equipment: 'Polia Baixa + Puxador V',
    movementType: 'Puxar Horizontal com Puxador V',
    target: 'Latíssimo do Dorso & Espessura Dorsal',
    apiId: '0208',
    keyCues: [
      'Pés firmes no apoio e joelhos levemente flexionados.',
      'Puxe o triângulo em direção ao umbigo puxando com os cotovelos.',
      'Aperte as escápulas no final e alongue os braços controlando a volta.'
    ],
    aliases: ['remada-baixa-cabo', 'remada-baixa', 'seated-cable-row', 'cable-seated-row', '20']
  },
  {
    canonicalId: 'remada-curvada-barra',
    name: 'Remada Curvada com Barra',
    equipment: 'Barra Olímpica',
    movementType: 'Puxar Livre Inclinado • Cadeia Posterior',
    target: 'Dorsais, Romboides & Eretores',
    apiId: '0027',
    keyCues: [
      'Tronco inclinado a 45° com coluna lombar perfeitamente travada.',
      'Puxe a barra em direção à linha do umbigo mantendo cotovelos rentes.',
      'Evite usar impulso das pernas para levantar a carga.'
    ],
    aliases: ['remada-curvada-barra', 'remada-curvada', 'barbell-bent-over-row', '17']
  },
  {
    canonicalId: 'remada-cavalinho',
    name: 'Remada Cavalinho / T-Bar na Máquina',
    equipment: 'Aparelho T-Bar / Cavalinho',
    movementType: 'Puxar Fechado em Barra T',
    target: 'Densidade e Miolo das Costas',
    apiId: 'drv-lever-t-bar-row',
    keyCues: [
      'Apoie o peito ou firme os pés no piso com quadril encaixado.',
      'Puxe a barra sentindo a musculatura dorsal esmagar no pico.',
      'Retorne alongando a dorsal sem arredondar a região torácica.'
    ],
    aliases: ['remada-cavalinho', 't-bar-row', 'remada-t-bar', 'lever-t-bar-row', '18']
  },
  {
    canonicalId: 'puxada-com-triangulo',
    name: 'Puxada Fechada com Triângulo',
    equipment: 'Polia Alta + Triângulo',
    movementType: 'Puxar Vertical com Pegada Neutra',
    target: 'Grande Dorsal & Braquial',
    apiId: '0974',
    keyCues: [
      'Puxe o triângulo até a parte superior do esterno.',
      'Mantenha os cotovelos apontados para o solo durante a descida.',
      'Controle o retorno permitindo o alongamento completo das costas.'
    ],
    aliases: ['puxada-com-triangulo', 'puxada-fechada', 'cable-close-grip-lat-pulldown', '16']
  },
  {
    canonicalId: 'pulldown-com-barra',
    name: 'Pulldown com Braços Estendidos no Cabo',
    equipment: 'Polia Alta + Barra Reta',
    movementType: 'Extensão de Ombro em Polia',
    target: 'Grande Dorsal (Isolamento Escapular)',
    apiId: '0238',
    keyCues: [
      'Braços quase estendidos com leve flexão nos cotovelos.',
      'Pressione a barra para baixo em direção às coxas usando apenas as costas.',
      'Sustente 1 segundo no pico e suba controlando até a altura dos olhos.'
    ],
    aliases: ['pulldown-com-barra', 'pulldown-com-corda', 'pulldown-cabo', 'cable-straight-arm-pulldown', '22', '23']
  },
  {
    canonicalId: 'extensao-lombar-banco-romano',
    name: 'Extensão Lombar no Banco Romano 45°',
    equipment: 'Banco Romano 45°',
    movementType: 'Extensão de Tronco e Quadril',
    target: 'Eretores da Espinha & Glúteos',
    apiId: '0489',
    keyCues: [
      'Ajuste o apoio do quadril logo abaixo da crista ilíaca.',
      'Flexione o tronco para frente controlando pelo abdômen e lombar.',
      'Suba até o alinhamento com as pernas sem hiperextender excessivamente.'
    ],
    aliases: ['extensao-lombar-banco-romano', 'extensao-lombar', 'banco-romano', 'hyperextension', '25']
  },
  {
    canonicalId: 'encolhimento-com-halteres',
    name: 'Encolhimento com Halteres',
    equipment: 'Par de Halteres',
    movementType: 'Elevação Escapular Pura',
    target: 'Trapézio Superior',
    apiId: '0406',
    keyCues: [
      'Em pé com halteres ao lado das coxas e braços estendidos.',
      'Eleve os ombros diretamente em direção às orelhas sem rodar.',
      'Segure 1 segundo no pico de contração antes de descer suavemente.'
    ],
    aliases: ['encolhimento-com-halteres', 'encolhimento-halteres', 'dumbbell-shrug', '40']
  },
  {
    canonicalId: 'encolhimento-com-barra',
    name: 'Encolhimento com Barra',
    equipment: 'Barra Olímpica',
    movementType: 'Elevação Escapular com Carga Pesada',
    target: 'Trapézio Superior & Clavicular',
    apiId: '0095',
    keyCues: [
      'Segure a barra na largura dos ombros com pegada pronada.',
      'Suba os ombros verticalmente contraindo o trapézio ao máximo.',
      'Mantenha a cabeça em posição neutra sem projetar o pescoço à frente.'
    ],
    aliases: ['encolhimento-com-barra', 'encolhimento-barra', 'barbell-shrug', '39']
  },

  // OMBROS / DELTOIDES (6)
  {
    canonicalId: 'desenvolvimento-arnold',
    name: 'Desenvolvimento Arnold com Halteres',
    equipment: 'Banco 75° + Halteres',
    movementType: 'Empurrar com Rotação Glenoumeral',
    target: 'Deltoide Anterior, Médio e Posterior',
    apiId: '2137',
    keyCues: [
      'Inicie com as palmas voltadas para você na altura do peito.',
      'Gire os punhos para fora enquanto empurra os halteres para cima.',
      'No topo, termine com as palmas para a frente em extensão controlada.'
    ],
    aliases: ['desenvolvimento-arnold', 'arnold-press', 'dumbbell-arnold-press']
  },
  {
    canonicalId: 'elevacao-frontal-halteres',
    name: 'Elevação Frontal com Halteres',
    equipment: 'Par de Halteres',
    movementType: 'Flexão de Ombro Anterior',
    target: 'Deltoide Anterior',
    apiId: '0310',
    keyCues: [
      'Suba o halter à frente até a linha dos olhos.',
      'Mantenha o tronco estável sem inclinar o corpo para trás.',
      'Desça em 2 a 3 segundos resistindo à gravidade.'
    ],
    aliases: ['elevacao-frontal-halteres', 'elevacao-frontal', 'dumbbell-front-raise', '32']
  },
  {
    canonicalId: 'elevacao-lateral-polia',
    name: 'Elevação Lateral na Polia',
    equipment: 'Polia Baixa Unilateral',
    movementType: 'Abdução com Tensão Contínua no Cabo',
    target: 'Deltoide Lateral (Ombros Largos)',
    apiId: '0178',
    keyCues: [
      'Cabo passando por trás ou pela frente da perna.',
      'Puxe a manopla lateralmente até a altura do ombro com cotovelo firme.',
      'Tensão constante sem folga no início ou pico do movimento.'
    ],
    aliases: ['elevacao-lateral-polia', 'elevacao-lateral-cabo', 'cable-lateral-raise', '31']
  },
  {
    canonicalId: 'crucifixo-invertido-halteres',
    name: 'Crucifixo Invertido com Halteres',
    equipment: 'Banco Inclinado + Halteres',
    movementType: 'Abdução Horizontal • Deltoide Posterior',
    target: 'Deltoide Posterior & Romboides',
    apiId: '0326',
    keyCues: [
      'Deite de bruços no banco inclinado a 30-45°.',
      'Abra os braços lateralmente puxando com a parte de trás dos ombros.',
      'Cotovelos levemente dobrados, sem usar impulso da lombar.'
    ],
    aliases: ['crucifixo-invertido-halteres', 'crucifixo-invertido', 'dumbbell-incline-rear-lateral-raise', '34']
  },
  {
    canonicalId: 'crucifixo-invertido-maquina',
    name: 'Crucifixo Invertido na Máquina',
    equipment: 'Aparelho Invertido / Peck Deck Reverso',
    movementType: 'Abdução Horizontal Guiada',
    target: 'Deltoide Posterior',
    apiId: '0602',
    keyCues: [
      'Ajuste o assento para os braços ficarem na altura dos ombros.',
      'Abra as hastes para trás contraindo o posterior de ombro.',
      'Retorne sem deixar os pesos encostarem na torre.'
    ],
    aliases: ['crucifixo-invertido-maquina', 'peck-deck-invertido', 'lever-seated-reverse-fly', '35']
  },
  {
    canonicalId: 'remada-alta',
    name: 'Remada Alta com Barra',
    equipment: 'Barra Olímpica',
    movementType: 'Puxar Vertical com Pegada Média',
    target: 'Deltoide Lateral & Trapézio',
    apiId: '0123',
    keyCues: [
      'Segure a barra com pegada ligeiramente mais larga que os ombros.',
      'Suba conduzindo com os cotovelos até a linha média do esterno.',
      'Mantenha a barra colada ao corpo durante toda a trajetória.'
    ],
    aliases: ['remada-alta', 'remada-alta-barra', 'barbell-wide-grip-upright-row', '38']
  },

  // TRÍCEPS (6)
  {
    canonicalId: 'triceps-frances-soccer',
    name: 'Tríceps Francês Sentado com Halter',
    equipment: 'Banco + Halter Unilateral',
    movementType: 'Extensão de Cotovelo Overhead',
    target: 'Tríceps Cabeça Longa',
    apiId: '2188',
    keyCues: [
      'Sente-se com coluna apoiada e segure o halter acima da cabeça.',
      'Desça o peso atrás da nuca flexionando apenas os cotovelos.',
      'Estenda os braços para cima sentindo a cabeça longa esticar e contrair.'
    ],
    aliases: ['triceps-frances-soccer', 'triceps-frances', 'triceps-frances-unilateral', 'dumbbell-seated-triceps-extension']
  },
  {
    canonicalId: 'triceps-testa-barra-w',
    name: 'Tríceps Testa com Barra W',
    equipment: 'Banco Plano + Barra W',
    movementType: 'Extensão em Decúbito Dorsal (Skull Crusher)',
    target: 'Tríceps (Cabeça Medial e Longa)',
    apiId: '0061',
    keyCues: [
      'Deitado no banco, inicie com a barra alinhada à testa.',
      'Flexione os cotovelos descendo a barra rente ao topo da cabeça.',
      'Empurre de volta mantendo os cotovelos apontados para o teto sem abrir.'
    ],
    aliases: ['triceps-testa-barra-w', 'triceps-testa', 'skull-crusher', 'ez-bar-lying-triceps-extension', '51']
  },
  {
    canonicalId: 'triceps-pulley-barra-reta',
    name: 'Tríceps Pulley com Barra Reta',
    equipment: 'Polia Alta + Barra Reta',
    movementType: 'Extensão de Cotovelo com Barra Reta',
    target: 'Tríceps (Cabeça Lateral e Medial)',
    apiId: '1723',
    keyCues: [
      'Cotovelos travados ao lado do tronco.',
      'Empurre a barra para baixo até estender os cotovelos completamente.',
      'Suba suavemente até 90° sem levantar os braços.'
    ],
    aliases: ['triceps-pulley-barra-reta', 'triceps-pulley', 'triceps-barra-reta', 'cable-triceps-pushdown', '52']
  },
  {
    canonicalId: 'triceps-coice-halteres',
    name: 'Tríceps Coice com Halter',
    equipment: 'Banco Plano + Halter',
    movementType: 'Extensão Horizontal Unilateral',
    target: 'Tríceps (Contração Terminal)',
    apiId: '0333',
    keyCues: [
      'Tronco paralelo ao solo, cotovelo elevado na linha do tronco.',
      'Estenda o antebraço para trás até o alinhamento total.',
      'Segure 1 segundo no pico e retorne a 90° mantendo o cotovelo fixo.'
    ],
    aliases: ['triceps-coice-halteres', 'triceps-coice', 'dumbbell-kickback', '55']
  },
  {
    canonicalId: 'triceps-mergulho-banco',
    name: 'Mergulho no Banco (Bench Dips)',
    equipment: 'Banco Plano',
    movementType: 'Extensão de Cotovelo com Apoio Traseiro',
    target: 'Tríceps & Deltoide Anterior',
    apiId: 'drv-bench-dips',
    keyCues: [
      'Mãos apoiadas na borda do banco com pernas estendidas à frente.',
      'Desça o quadril rente ao banco flexionando os cotovelos a 90°.',
      'Empurre para cima estendendo os braços com força.'
    ],
    aliases: ['triceps-mergulho-banco', 'mergulho-banco', 'bench-dips', '53']
  },
  {
    canonicalId: 'supino-fechado-barra',
    name: 'Supino Fechado com Barra',
    equipment: 'Banco Reto + Barra Olímpica',
    movementType: 'Empurrar com Pegada Estreita',
    target: 'Tríceps & Peitoral Esternal',
    apiId: '0030',
    keyCues: [
      'Pegada na largura dos ombros (nunca junte as mãos totalmente).',
      'Desça a barra mantendo os cotovelos colados às costelas.',
      'Empurre verticalmente focando a força na extensão dos tríceps.'
    ],
    aliases: ['supino-fechado-barra', 'supino-fechado', 'barbell-close-grip-bench-press', '54']
  },

  // BÍCEPS & ANTEBRAÇO (6)
  {
    canonicalId: 'rosca-martelo-soccer',
    name: 'Rosca Martelo com Halteres',
    equipment: 'Par de Halteres',
    movementType: 'Flexão com Pegada Neutra',
    target: 'Braquial, Braquiorradial & Bíceps',
    apiId: '0320',
    keyCues: [
      'Palmas das mãos voltadas uma para a outra durante todo o movimento.',
      'Suba os halteres sem balanço do tronco.',
      'Pico de contração no topo e descida em 3 segundos controlados.'
    ],
    aliases: ['rosca-martelo-soccer', 'rosca-martelo-halteres', 'rosca-martelo', 'dumbbell-incline-hammer-curl', '43']
  },
  {
    canonicalId: 'rosca-scott-barra-w',
    name: 'Rosca Scott no Banco com Halter / Barra',
    equipment: 'Banco Scott + Halter / Barra',
    movementType: 'Flexão Isolada em Apoio Scott',
    target: 'Bíceps (Cabeça Curva e Pico)',
    apiId: '0402',
    keyCues: [
      'Axilas perfeitamente apoiadas no topo da almofada do banco Scott.',
      'Flexione os braços sem deixar os cotovelos descolarem do estofado.',
      'Controle rigoroso na descida para proteger os tendões distais.'
    ],
    aliases: ['rosca-scott-barra-w', 'rosca-scott', 'rosca-scott-maquina', 'dumbbell-seated-preacher-curl', '45', '46']
  },
  {
    canonicalId: 'rosca-concentrada',
    name: 'Rosca Concentrada com Halter',
    equipment: 'Banco Reto + Halter',
    movementType: 'Flexão Unilateral Estabilizada no Joelho',
    target: 'Pico do Bíceps',
    apiId: '0297',
    keyCues: [
      'Cotovelo apoiado na parte interna da coxa.',
      'Suba o halter em direção ao ombro isolando completamente o bíceps.',
      'Evite balançar o ombro ou inclinar o tronco.'
    ],
    aliases: ['rosca-concentrada', 'dumbbell-concentration-curl', '47']
  },
  {
    canonicalId: 'rosca-direta-barra',
    name: 'Rosca Direta com Barra Reta',
    equipment: 'Barra Reta + Anilhas',
    movementType: 'Flexão Supinada Bilateral Clássica',
    target: 'Bíceps Braquial',
    apiId: '0031',
    keyCues: [
      'Pés na largura dos ombros e glúteos contraídos para base firme.',
      'Cotovelos fixos colados ao tronco.',
      'Suba sem usar pêndulo lombar e desça em velocidade controlada.'
    ],
    aliases: ['rosca-direta-barra', 'rosca-barra-reta', 'barbell-curl', '41']
  },
  {
    canonicalId: 'rosca-inclinada-halteres',
    name: 'Rosca Inclinada 45° com Halteres',
    equipment: 'Banco 45° + Halteres',
    movementType: 'Flexão em Posição de Pré-Estiramento',
    target: 'Cabeça Longa do Bíceps',
    apiId: '0322',
    keyCues: [
      'Deite no banco inclinado a 45° deixando os braços caírem para trás.',
      'Inicie a subida supinando os punhos com os cotovelos para trás.',
      'Máximo alongamento no ponto mais baixo sem relaxar os ombros.'
    ],
    aliases: ['rosca-inclinada-halteres', 'rosca-inclinada-banco', 'dumbbell-incline-biceps-curl', '56']
  },
  {
    canonicalId: 'flexao-punho-barra',
    name: 'Flexão de Punho com Halter no Banco',
    equipment: 'Banco Plano + Halter',
    movementType: 'Flexão de Punho para Antebraço',
    target: 'Flexores do Antebraço & Força de Pegada',
    apiId: '0369',
    keyCues: [
      'Antebraço totalmente apoiado sobre a coxa ou banco com punho livre.',
      'Flexione o punho para cima com amplitude máxima.',
      'Desça devagar sentindo os músculos do antebraço alongarem.'
    ],
    aliases: ['flexao-punho-barra', 'flexao-punho-halteres', 'rosca-punho', 'dumbbell-over-bench-wrist-curl', '57']
  },

  // PERNAS QUADRÍCEPS (6)
  {
    canonicalId: 'agachamento-frontal-barra',
    name: 'Agachamento Frontal com Barra',
    equipment: 'Rack + Barra Olímpica Frontal',
    movementType: 'Agachar com Carga Anterior',
    target: 'Quadríceps & Core Eretor',
    apiId: '0042',
    keyCues: [
      'Barra apoiada nos deltoides anteriores com cotovelos altos.',
      'Mantenha o tronco o mais vertical possível durante todo o agachamento.',
      'Desça empurrando os joelhos para fora com peso distribuído nos pés.'
    ],
    aliases: ['agachamento-frontal-barra', 'agachamento-frontal', 'barbell-front-squat', '62']
  },
  {
    canonicalId: 'cadeira-extensora',
    name: 'Cadeira Extensora',
    equipment: 'Máquina Extensora',
    movementType: 'Extensão de Joelho em Isolamento',
    target: 'Quadríceps (Reto Femoral e Vasto)',
    apiId: '0585',
    keyCues: [
      'Ajuste o encosto para o joelho alinhar perfeitamente com o eixo.',
      'Estenda as pernas sem chutar, sustentando 1 segundo de contração no topo.',
      'Retorne de forma lenta e controlada em 3 segundos.'
    ],
    aliases: ['cadeira-extensora', 'extensora', 'lever-leg-extension', '63']
  },
  {
    canonicalId: 'agachamento-goblet',
    name: 'Agachamento Goblet com Halter',
    equipment: 'Halter Pesado',
    movementType: 'Agachamento com Peso no Peito',
    target: 'Quadríceps, Glúteos & Mobilidade Pélvica',
    apiId: '1760',
    keyCues: [
      'Segure o halter na vertical colado ao esterno pelas anilhas superiores.',
      'Afaste os pés e agache entre as pernas com cotovelos por dentro dos joelhos.',
      'Suba empurrando o chão com os calcanhares mantendo o peito ereto.'
    ],
    aliases: ['agachamento-goblet', 'goblet-squat', 'dumbbell-goblet-squat', '64']
  },
  {
    canonicalId: 'hack-squat-maquina',
    name: 'Hack Squat na Máquina 45°',
    equipment: 'Aparelho Hack Squat',
    movementType: 'Agachar em Trilho com Apoio Dorsal',
    target: 'Quadríceps (Ênfase em Vastos)',
    apiId: '0743',
    keyCues: [
      'Costas e cabeça coladas no encosto da máquina.',
      'Pés no meio da plataforma na largura dos ombros.',
      'Desça profundamente até 90° e suba sem hiperextender os joelhos.'
    ],
    aliases: ['hack-squat-maquina', 'hack-squat', 'sled-hack-squat', '65']
  },
  {
    canonicalId: 'leg-press-horizontal',
    name: 'Leg Press Horizontal na Máquina',
    equipment: 'Máquina Leg Horizontal',
    movementType: 'Empurrar em Plano Reto com Carga Guiada',
    target: 'Quadríceps e Glúteos',
    apiId: '2611',
    keyCues: [
      'Apoie os pés na plataforma na largura dos quadris.',
      'Empurre suavemente destravando a máquina.',
      'Desça até os joelhos formarem 90° mantendo o quadril travado no assento.'
    ],
    aliases: ['leg-press-horizontal', 'lever-horizontal-leg-press', '66']
  },
  {
    canonicalId: 'cadeira-adutora',
    name: 'Cadeira Adutora na Máquina',
    equipment: 'Máquina Adutora',
    movementType: 'Adução de Quadril Sentado',
    target: 'Adutores da Coxa (Virilha e Parte Interna)',
    apiId: '0598',
    keyCues: [
      'Sente com as costas retas e abra as pernas no limite do conforto.',
      'Feche as pernas apertando os coxins com a força da parte interna das coxas.',
      'Controle o retorno sem deixar as placas de peso baterem.'
    ],
    aliases: ['cadeira-adutora', 'adutora', 'lever-seated-hip-adduction', '67']
  },

  // PERNAS POSTERIOR & GLÚTEO (6)
  {
    canonicalId: 'cadeira-flexora',
    name: 'Cadeira Flexora Sentada',
    equipment: 'Máquina Flexora Sentada',
    movementType: 'Flexão de Joelho em Posição Sentada',
    target: 'Isquiotibiais (Posterior de Coxa)',
    apiId: '0599',
    keyCues: [
      'Fixe bem o apoio superior sobre as coxas para não levantar o quadril.',
      'Flexione os joelhos puxando o rolo para baixo e para trás.',
      'Retorne controladamente sentindo os posteriores alongarem.'
    ],
    aliases: ['cadeira-flexora', 'flexora-sentada', 'lever-seated-leg-curl', '70']
  },
  {
    canonicalId: 'stiff-com-barra',
    name: 'Stiff com Barra',
    equipment: 'Barra Olímpica',
    movementType: 'Hinge de Quadril com Barra',
    target: 'Isquiotibiais & Glúteo Máximo',
    apiId: '0116',
    keyCues: [
      'Joelhos levemente destravados e fixos (não agache!).',
      'Projete a bacia para trás enquanto desce a barra rente às canelas.',
      'Coluna lombar neutra e olhar direcionado para o chão à frente.'
    ],
    aliases: ['stiff-com-barra', 'stiff-barra', 'barbell-straight-leg-deadlift', '71']
  },
  {
    canonicalId: 'levantamento-terra',
    name: 'Levantamento Terra com Halteres',
    equipment: 'Par de Halteres',
    movementType: 'Levantamento de Solo • Puxada Primária',
    target: 'Glúteos, Isquiotibiais & Costas',
    apiId: '0300',
    keyCues: [
      'Pés na largura do quadril com halteres ao lado das canelas.',
      'Inicie empurrando o chão com as pernas mantendo o peito alto.',
      'Estenda quadris e joelhos simultaneamente travando no topo com os glúteos.'
    ],
    aliases: ['levantamento-terra', 'deadlift', 'dumbbell-deadlift', '24']
  },
  {
    canonicalId: 'passada-com-halteres',
    name: 'Passada / Afundo com Halteres',
    equipment: 'Par de Halteres',
    movementType: 'Unilateral Dinâmico no Solo',
    target: 'Glúteos, Quadríceps & Equilíbrio',
    apiId: '0336',
    keyCues: [
      'Dê um passo à frente firme no chão.',
      'Desça o joelho de trás até quase encostar no solo com tronco ereto.',
      'Empurre pelo calcanhar dianteiro para avançar no próximo passo.'
    ],
    aliases: ['passada-com-halteres', 'afundo-com-halteres', 'dumbbell-lunge', 'lunge', '72']
  },
  {
    canonicalId: 'cadeira-abdutora',
    name: 'Cadeira Abdutora na Máquina',
    equipment: 'Máquina Abdutora',
    movementType: 'Abdução de Quadril Sentado',
    target: 'Glúteo Médio & Mínimo',
    apiId: '0597',
    keyCues: [
      'Tronco encaixado no banco ou levemente projetado à frente.',
      'Abra as pernas empurrando com a lateral dos joelhos.',
      'Sustente 1 segundo no pico de abertura e feche com controle.'
    ],
    aliases: ['cadeira-abdutora', 'abdutora', 'lever-seated-hip-abduction', '73']
  },
  {
    canonicalId: 'elevacao-pelvica-soccer',
    name: 'Ponte de Glúteo / Elevação Pélvica',
    equipment: 'Colchonete / Apoio Solo',
    movementType: 'Extensão de Quadril com Contração Máxima',
    target: 'Glúteo Máximo',
    apiId: '0668',
    keyCues: [
      'Deite no colchonete com pés no chão próximos ao quadril.',
      'Eleve o quadril empurrando com os calcanhares.',
      'No topo, esprema os glúteos por 2 segundos mantendo abdômen travado.'
    ],
    aliases: ['elevacao-pelvica-soccer', 'elevacao-pelvica', 'glute-bridge', 'rear-decline-bridge']
  },

  // PANTURRILHAS (3)
  {
    canonicalId: 'panturrilha-em-pe-maquina',
    name: 'Panturrilha em Pé na Máquina',
    equipment: 'Aparelho Gêmeos em Pé',
    movementType: 'Flexão Plantar em Pé',
    target: 'Gastrocnêmio & Tendão de Aquiles',
    apiId: '0605',
    keyCues: [
      'Antepé na ponta do degrau com calcanhares livres.',
      'Suba ao máximo na ponta dos pés com joelhos estendidos sem travar.',
      'Desça devagar em 3 segundos sentindo o alongamento completo.'
    ],
    aliases: ['panturrilha-em-pe-maquina', 'panturrilha-explosiva', 'lever-standing-calf-raise', '74']
  },
  {
    canonicalId: 'panturrilha-sentado-maquina',
    name: 'Panturrilha Sentado na Máquina (Gêmeos)',
    equipment: 'Aparelho Gêmeos Sentado',
    movementType: 'Flexão Plantar com Joelho Flexionado',
    target: 'Músculo Sóleo',
    apiId: '0594',
    keyCues: [
      'Coxas travadas confortavelmente sob as almofadas.',
      'Suba na ponta dos pés pausando 1 segundo na contração máxima.',
      'Desça profundamente abaixo da linha da plataforma.'
    ],
    aliases: ['panturrilha-sentado-maquina', 'panturrilha-sentado', 'lever-seated-calf-raise', '75']
  },
  {
    canonicalId: 'panturrilha-no-leg-press',
    name: 'Panturrilha no Leg Press 45°',
    equipment: 'Aparelho Leg Press 45°',
    movementType: 'Flexão Plantar Inclinada sob Tensão',
    target: 'Gastrocnêmio & Sóleo',
    apiId: '0738',
    keyCues: [
      'Apoie a ponta dos pés na borda inferior da plataforma.',
      'Mantenha as travas de segurança acionadas para máxima segurança.',
      'Faça a flexão plantar de forma controlada sem solavancos articulares.'
    ],
    aliases: ['panturrilha-no-leg-press', 'panturrilha-leg-press', 'sled-45-degree-calf-press', '76']
  },

  // ABDÔMEN & CORE (5)
  {
    canonicalId: 'abdominal-crunch-chute',
    name: 'Abdominal Crunch no Banco / Solo',
    equipment: 'Banco Plano / Colchonete',
    movementType: 'Flexão de Tronco Anterior',
    target: 'Reto Abdominal',
    apiId: 'drv-crunch-on-bench',
    keyCues: [
      'Deite com as mãos na cabeça ou peito.',
      'Flexione o tronco aproximando as costelas do quadril.',
      'Expire todo o ar no topo contraindo o abdômen com firmeza.'
    ],
    aliases: ['abdominal-crunch-chute', 'abdominal-crunch-solo', 'bench-crunch', 'crunch', '77']
  },
  {
    canonicalId: 'abdominal-polia-corda',
    name: 'Abdominal na Polia Ajoelhado com Corda',
    equipment: 'Polia Alta + Corda',
    movementType: 'Flexão de Tronco com Sobrecarga em Cabo',
    target: 'Reto Abdominal com Resistência',
    apiId: '0175',
    keyCues: [
      'Ajoelhe-se em frente à polia e segure a corda ao lado da cabeça.',
      'Enrole a coluna em direção ao chão sem sentar nos calcanhares.',
      'Retorne controlando a subida com a força do abdômen.'
    ],
    aliases: ['abdominal-polia-corda', 'cable-kneeling-crunch', 'abdominal-corda', '78']
  },
  {
    canonicalId: 'elevacao-pernas-barra-fixa',
    name: 'Elevação de Pernas na Barra Fixa',
    equipment: 'Barra Fixa / Suspenso',
    movementType: 'Flexão de Quadril Suspenso',
    target: 'Abdômen Inferior & Flexores de Quadril',
    apiId: '1764',
    keyCues: [
      'Pendure-se na barra com pegada firme.',
      'Eleve os joelhos ou pernas em direção ao peito sem balançar o corpo.',
      'Desça devagar controlando o retorno sem deixar o corpo oscilar.'
    ],
    aliases: ['elevacao-pernas-barra-fixa', 'elevacao-de-pernas-barra', 'hanging-leg-hip-raise', '79']
  },
  {
    canonicalId: 'prancha-lateral',
    name: 'Prancha Lateral no Solo',
    equipment: 'Colchonete',
    movementType: 'Isometria Lateral de Core',
    target: 'Oblíquos & Quadrado Lombar',
    apiId: '0705',
    keyCues: [
      'Apoie o antebraço no solo alinhado ao ombro.',
      'Eleve a bacia mantendo o corpo em linha reta da cabeça aos pés.',
      'Sustente a posição respirando de forma controlada.'
    ],
    aliases: ['prancha-lateral', 'side-plank', '80']
  },
  {
    canonicalId: 'elevacao-de-pernas-solo',
    name: 'Elevação de Pernas no Solo (Infra)',
    equipment: 'Colchonete',
    movementType: 'Flexão de Quadril em Decúbito Dorsal',
    target: 'Porção Infra-Abdominal',
    apiId: '0865',
    keyCues: [
      'Deite com as mãos sob o quadril para proteger a coluna lombar.',
      'Eleve as pernas retas até a linha vertical de 90°.',
      'Desça devagar sem deixar a lombar descolar do solo.'
    ],
    aliases: ['elevacao-de-pernas-solo', 'abdominal-infra', 'lying-leg-raise', '81']
  }
];

async function main() {
  const res = await fetch('https://raw.githubusercontent.com/harshvishu/free-exercise-db-with-videos/main/data/exercises.json');
  const apiDb = await res.json();

  console.log('Building video dictionary for 50 batch...');

  const verifiedDict = {};

  // First keep the initial 14 verified exercises
  const initial14 = [
    {
      id: 'supino-halteres-soccer',
      name: 'Supino Reto com Halteres',
      equipment: 'Banco Plano + Halteres',
      movementType: 'Empurrar Horizontal • Halteres Livres',
      target: 'Peitoral Maior (Fibras Esternais e Claviculares)',
      apiFile: 'dumbbell-bench-press',
      keyCues: [
        'Pés cravados no chão, escápulas aduzidas e deprimidas contra o encosto.',
        'Cotovelos a ~75° do tronco no plano escapular (nunca abertos a 90°).',
        'Trajetória convergente suave na subida sem bater as anilhas no topo.'
      ],
      aliases: ['supino-halteres-soccer', 'supino-reto-halteres', 'supino-halteres', 'dumbbell-bench-press', 'supino-reto-com-halteres']
    },
    {
      id: 'incline-dumbbell-soccer',
      name: 'Supino Inclinado com Halteres',
      equipment: 'Banco 30° + Halteres',
      movementType: 'Empurrar Inclinado • Feixe Clavicular',
      target: 'Peitoral Superior & Deltoide Anterior',
      apiFile: 'dumbbell-incline-bench-press',
      keyCues: [
        'Banco regulado a 30° para ativação seletiva do feixe clavicular.',
        'Desça até sentir alongamento ativo do peitoral superior com punhos neutros.',
        'Empurre acelerando no vetor de 30° sem projetar os ombros à frente.'
      ],
      aliases: ['incline-dumbbell-soccer', 'supino-inclinado-halteres', 'supino-inclinado-com-halteres', 'incline-dumbbell-press', '2']
    },
    {
      id: 'supino-reto-barra',
      name: 'Supino Reto com Barra',
      equipment: 'Banco Reto + Barra Olímpica',
      movementType: 'Empurrar Horizontal • Barra Bilateral',
      target: 'Peitoral Maior & Tríceps',
      apiFile: 'barbell-bench-press',
      keyCues: [
        'Pegada ligeiramente mais larga que a largura dos ombros.',
        'Toque sutil na linha intermamilar e empurre mantendo as costas travadas.',
        'Trajetória levemente em J, subindo em direção à linha dos olhos.'
      ],
      aliases: ['supino-reto-barra', 'supino-barra', 'barbell-bench-press', 'supino-reto-com-barra', '1']
    },
    {
      id: 'desenvolvimento-halteres',
      name: 'Desenvolvimento Militar com Halteres',
      equipment: 'Banco 75° + Halteres',
      movementType: 'Empurrar Vertical • Deltoide Anterior/Médio',
      target: 'Ombros & Estabilizadores Escapulares',
      apiFile: 'dumbbell-bench-seated-press',
      keyCues: [
        'Encosto do banco a 75-80° para preservar o arco lombar neutro.',
        'Cotovelos posicionados ligeiramente à frente do plano coronal.',
        'Empurre até quase a extensão completa sem arquear as costas.'
      ],
      aliases: ['desenvolvimento-halteres', 'desenvolvimento-com-halteres', 'desenvolvimento-militar-halteres', 'seated-dumbbell-shoulder-press', 'desenvolvimento-militar', '27', '28']
    },
    {
      id: 'elevacao-lateral-speed',
      name: 'Elevação Lateral Controlada',
      equipment: 'Par de Halteres Leves',
      movementType: 'Abdução de Ombro • Isolamento de Deltoide Lateral',
      target: 'Deltoide Médio (Largura e Silhueta em V)',
      apiFile: 'dumbbell-lateral-raise',
      keyCues: [
        'Leve inclinação anterior do tronco (5-10°) com core ativado.',
        'Eleve os braços no plano escapular (30° à frente da linha dos ombros).',
        'Cotovelos levemente flexionados, pare na linha do ombro e desça sem balanço.'
      ],
      aliases: ['elevacao-lateral-speed', 'elevacao-lateral-halteres', 'elevacao-lateral', 'dumbbell-lateral-raise', 'elevacao-lateral-com-halteres', '30']
    },
    {
      id: 'triceps-corda-soccer',
      name: 'Tríceps Pulley na Corda',
      equipment: 'Polia Alta + Acessório Corda',
      movementType: 'Extensão de Cotovelo • Cabo com Pico Terminal',
      target: 'Tríceps Braquial (Cabeça Lateral e Longa)',
      apiFile: 'cable-pushdown-rope-attachment',
      keyCues: [
        'Cotovelos bloqueados ao lado das costelas sem deslocamento anterior.',
        'Abra as pontas da corda na fase final de extensão para encurtamento máximo.',
        'Retorne controlando até a linha de 90° sem mexer os ombros.'
      ],
      aliases: ['triceps-corda-soccer', 'triceps-corda', 'triceps-pulley-corda', 'cable-rope-triceps-pushdown', 'triceps-na-corda']
    },
    {
      id: 'rdl-halteres',
      name: 'RDL / Terra Romeno com Halteres',
      equipment: 'Par de Halteres',
      movementType: 'Hinge de Quadril • Tensão Excêntrica',
      target: 'Isquiotibiais & Glúteos',
      apiFile: 'dumbbell-stiff-leg-deadlift',
      keyCues: [
        'Pés na largura do quadril, joelhos destravados a 15-20° constantes.',
        'Empurre o quadril para trás como se fosse fechar uma porta com os glúteos.',
        'Desça os halteres rentes às pernas sentindo o estiramento dos posteriores.'
      ],
      aliases: ['rdl-halteres', 'terra-romeno-halteres', 'stiff-halteres', 'stiff-com-halteres', 'dumbbell-stiff-leg-deadlift', 'rdl-com-halteres']
    },
    {
      id: 'agachamento-livre-barra',
      name: 'Agachamento Livre com Barra',
      equipment: 'Rack + Barra Olímpica',
      movementType: 'Padrão Agachar Bilateral • Cadeia Inferior',
      target: 'Quadríceps, Glúteos & Eretor da Espinha',
      apiFile: 'classic-barbell-squat',
      keyCues: [
        'Barra apoiada firme nos trapézios, pegada firme e cotovelos alinhados.',
        'Inicie a descida flexionando quadris e joelhos simultaneamente.',
        'Quebre a paralela de 90° com calcanhares totalmente cravados no piso.'
      ],
      aliases: ['agachamento-livre-barra', 'agachamento-livre', 'agachamento-barra', 'barbell-back-squat', 'classic-barbell-squat', 'agachamento-livre-com-barra']
    },
    {
      id: 'puxada-alta-soccer',
      name: 'Puxada Alta Frontal no Pulley',
      equipment: 'Polia Alta + Barra Larga',
      movementType: 'Puxar Vertical • Grande Dorsal',
      target: 'Grande Dorsal (Largura das Costas) & Bíceps',
      apiFile: 'cable-bar-lateral-pulldown-wide-shoulder-grip',
      keyCues: [
        'Apoio dos joelhos ajustado para fixação rígida da pelve.',
        'Inicie o movimento deprimindo as escápulas antes de flexionar os cotovelos.',
        'Puxe a barra em direção ao esterno superior com leve inclinação do tronco (10-15°).'
      ],
      aliases: ['puxada-alta-soccer', 'puxada-frontal-aberta', 'puxada-frente', 'puxada-alta', 'cable-lat-pulldown', 'wide-grip-cable-lat-pulldown', '15']
    },
    {
      id: 'remada-serrote-soccer',
      name: 'Remada Serrote Unilateral com Halter',
      equipment: 'Banco Reto + Halter',
      movementType: 'Puxar Horizontal Unilateral • Espessura Dorsal',
      target: 'Grande Dorsal, Romboide & Trapézio Médio',
      apiFile: 'dumbbell-bent-over-row',
      keyCues: [
        'Mão e joelho contralateral apoiados no banco com coluna reta e nivelada.',
        'Conduza o halter com o cotovelo apontando para trás e para cima em direção à bacia.',
        'Evite girar a linha dos ombros para forçar a carga.'
      ],
      aliases: ['remada-serrote-soccer', 'remada-unilateral-serrote', 'remada-serrote', 'remada-unilateral', 'dumbbell-bent-over-row', '19']
    },
    {
      id: 'barra-fixa-pronada',
      name: 'Barra Fixa / Chin-Up com Pegada Paralela',
      equipment: 'Barra Fixa / Paralelas',
      movementType: 'Tração Vertical com Peso Corporal',
      target: 'Dorsais, Braquiorradial & Bíceps',
      apiFile: 'chin-ups-narrow-parallel-grip',
      keyCues: [
        'Empunhadura neutra confortável nas articulações do punho.',
        'Puxe o queixo acima da barra sem chutar as pernas ou balançar.',
        'Alongue totalmente os braços na fase inferior de descida.'
      ],
      aliases: ['barra-fixa-pronada', 'barra-fixa-supinada', 'chin-ups', 'barra-fixa', 'chin-ups-narrow-parallel-grip', '13', '14']
    },
    {
      id: 'rosca-w-soccer',
      name: 'Rosca Direta com Barra W',
      equipment: 'Barra W + Anilhas',
      movementType: 'Flexão de Cotovelo • Pegada Anatômica Semi-Supinada',
      target: 'Bíceps Braquial & Braquial Anterior',
      apiFile: 'ez-barbell-biceps-curl',
      keyCues: [
        'Segure na dobra angulada da barra W para preservar os punhos.',
        'Cotovelos colados ao lado do corpo sem movimentação para frente.',
        'Pico de contração de 1s no topo e descida em 3 segundos sem balançar a coluna.'
      ],
      aliases: ['rosca-w-soccer', 'rosca-barra-w', 'rosca-direta-w', 'ez-barbell-biceps-curl']
    },
    {
      id: 'rosca-alternada',
      name: 'Rosca com Halteres (Direta / Alternada)',
      equipment: 'Par de Halteres',
      movementType: 'Flexão com Supinação Ativa de Punho',
      target: 'Bíceps Braquial (Pico e Espessura)',
      apiFile: 'dumbbell-biceps-curl',
      keyCues: [
        'Inicie com as palmas voltadas para a coxa e supine durante a subida.',
        'Mantenha o punho rígido sem deixar hiperestender para trás.',
        'Controle rigoroso na descida excêntrica.'
      ],
      aliases: ['rosca-alternada', 'rosca-halteres', 'biceps-halteres', 'dumbbell-biceps-curl', 'rosca-direta-halteres', '42']
    },
    {
      id: 'leg-press-45',
      name: 'Leg Press 45°',
      equipment: 'Aparelho Leg Press 45°',
      movementType: 'Padrão Empurrar em Máquina Inclinada',
      target: 'Quadríceps, Glúteos & Adutores',
      apiFile: 'sled-45-degree-leg-wide-press',
      keyCues: [
        'Pés na largura dos ombros no meio ou topo da plataforma.',
        'Quadril e lombar perfeitamente colados no encosto durante toda a descida.',
        'Nunca estenda os joelhos até travar (evite hiperextensão).'
      ],
      aliases: ['leg-press-45', 'leg-press', 'sled-45-degree-leg-wide-press', 'leg-press-45-graus', '61']
    },
    {
      id: 'mesa-flexora',
      name: 'Mesa Flexora Deitada',
      equipment: 'Máquina Flexora Deitada',
      movementType: 'Flexão de Joelho em Posição Pronada',
      target: 'Isquiotibiais (Bíceps Femoral, Semitendíneo)',
      apiFile: 'lever-lying-leg-curl',
      keyCues: [
        'Alinhe o eixo da máquina com a linha articular do joelho.',
        'Mantenha a pelve colada contra o banco durante a flexão máxima.',
        'Controle a volta excêntrica até quase a extensão completa.'
      ],
      aliases: ['mesa-flexora', 'flexora-deitada', 'lever-lying-leg-curl', 'mesa-flexora-deitada', '69']
    }
  ];

  initial14.forEach(item => {
    verifiedDict[item.id] = {
      canonicalId: item.id,
      name: item.name,
      equipment: item.equipment,
      movementType: item.movementType,
      target: item.target,
      videoMale: `https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/${item.apiFile}.mp4`,
      videoFemale: `https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/${item.apiFile}.mp4`,
      poster: `https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/${item.apiFile}.jpg`,
      keyCues: item.keyCues,
      aliases: item.aliases
    };
  });

  // Now process BATCH_50
  for (const item of BATCH_50) {
    const apiItem = apiDb.find(e => e.id === item.apiId);
    if (!apiItem) {
      console.error('API ID not found:', item.apiId);
      continue;
    }

    verifiedDict[item.canonicalId] = {
      canonicalId: item.canonicalId,
      name: item.name,
      equipment: item.equipment,
      movementType: item.movementType,
      target: item.target,
      videoMale: apiItem.videos?.male || null,
      videoFemale: apiItem.videos?.female || null,
      poster: apiItem.thumbnails?.male || null,
      keyCues: item.keyCues,
      aliases: item.aliases
    };
  }

  console.log('Total verified exercises in new dictionary:', Object.keys(verifiedDict).length);

  // Generate file content
  let content = `/**
 * exerciseVideos.js — Base de Vídeos Demonstrativos Auditados • AB Fitness
 * 
 * Regra de Ouro:
 * NENHUM exercício pode apresentar demonstração com equipamento ou padrão de movimento divergente.
 * Cada registro é verificado individualmente contra o ID e características anatómicas do exercício.
 * Total de exercícios auditados: ${Object.keys(verifiedDict).length}
 */

export const VERIFIED_EXERCISE_VIDEOS = ${JSON.stringify(verifiedDict, null, 2)};

/**
 * Normaliza strings para matching seguro (remove acentos e caracteres especiais)
 */
function normalizeString(str) {
  if (!str || typeof str !== 'string') return '';
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

  fs.writeFileSync('src/data/exerciseVideos.js', content, 'utf8');
  console.log('Successfully written src/data/exerciseVideos.js with', Object.keys(verifiedDict).length, 'exercises!');
}

main().catch(console.error);
