/**
 * Biomecânica de Costas e Dorsais — 38 Exercícios (IDs 13-26, 123-146)
 * Anatomia da cintura escapular, latíssimo do dorso, romboides, trapézio e eretores da espinha.
 */

export const BACK_BIOMECHANICS = {
  13: {
    id: 13,
    slug: 'barra-fixa-pronada',
    nome: 'Barra Fixa Pronada',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Largura em V) e Redondo Maior',
    sinergistas: 'Bíceps Braquial, Braquial, Romboides e Trapézio Inferior',
    equipamento: 'Barra Fixa Suspensa',
    posicao_inicial: 'Suspenso na barra fixa com pegada pronada (palmas voltadas para a frente) cerca de 1,5x a largura dos ombros. Corpo estendido, pernas cruzadas ou unidas, escápulas deprimidas antes de iniciar a tração.',
    concentrica: 'Puxe o corpo para cima levando o peito em direção à barra, conduzindo o movimento com os cotovelos para baixo e para os lados até o queixo ultrapassar a barra.',
    excentrica: 'Desça de forma controlada em 2 a 3 segundos até a extensão completa dos braços sem soltar o corpo bruscamente no fundo.',
    passos: [
      'Segure a barra com pegada pronada afastada e suspenda o corpo.',
      'Inicie deprimindo e aduzindo as escápulas (ativação escapular inicial).',
      'Puxe o corpo trazendo o peito para a barra com cotovelos apontando para o chão.',
      'Desça suavemente até estender os braços, preservando a tensão dorsal.'
    ],
    checkpoints: [
      'Iniciar a puxada pela depressão das escápulas e não pelos braços.',
      'Peito estufado com leve curvatura torácica superior.',
      'Evitar balanço ou "kipping" com as pernas.'
    ],
    respiracao: 'Inspire no início e expire forte durante a subida; inspire na descida controlada.',
    erro_comum: 'Fazer o movimento com impulsos e chutes das pernas ou encolher os ombros em direção às orelhas no topo.',
    beneficio: 'O teste definitivo de força relativa de puxada vertical, proporcionando grande largura para as dorsais e espessamento do redondo maior.'
  },
  14: {
    id: 14,
    slug: 'barra-fixa-supinada',
    nome: 'Barra Fixa Supinada',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Bíceps Braquial (Porção Curta e Longa)',
    sinergistas: 'Braquial, Redondo Maior e Romboides',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra com pegada supinada (palmas voltadas para você) na largura dos ombros. Corpo alinhado e core engajado.',
    concentrica: 'Puxe o corpo para cima flexionando os cotovelos junto ao tronco até que o queixo passe completamente a barra.',
    excentrica: 'Desça o corpo em 3 segundos controlados até a extensão total dos braços, aproveitando o alongamento dorsal e do bíceps.',
    passos: [
      'Segure a barra com pegada supinada na largura exata dos ombros.',
      'Puxe o corpo para cima concentrando na flexão de braço e adução dorsal.',
      'Sustente 1 segundo de contração no topo com o queixo acima da barra.',
      'Desça de maneira compassada resistindo à gravidade.'
    ],
    checkpoints: ['Pegada na largura dos ombros', 'Cotovelos descem rente ao corpo', 'Descida completa sem despencar'],
    respiracao: 'Inspire na descida; expire com força na subida.',
    erro_comum: 'Não estender os braços completamente na descida por cansaço, cortando metade da amplitude do movimento.',
    beneficio: 'Permite maior vantagem mecânica para o bíceps e recruta fortemente as fibras inferiores do latíssimo do dorso.'
  },
  15: {
    id: 15,
    slug: 'puxada-frontal-aberta',
    nome: 'Puxada Frontal Aberta',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Feixe Superior e Lateral)',
    sinergistas: 'Redondo Maior, Bíceps Braquial, Romboides e Trapézio Médio/Inferior',
    equipamento: 'Máquina Lat Pulldown + Barra Larga',
    posicao_inicial: 'Sentado com as coxas firmemente presas sob os rolos acolchoados. Pegada pronada aberta cerca de 1,5x a largura dos ombros. Tronco levemente inclinado para trás (10°-15°), peito estufado.',
    concentrica: 'Puxe a barra para baixo em direção à parte superior do esterno, conduzindo o movimento com a depressão e adução das escápulas e os cotovelos apontando para o solo.',
    excentrica: 'Retorne a barra suavemente em 2 a 3 segundos até a extensão completa dos braços permitindo que as escápulas se elevem de forma controlada.',
    passos: [
      'Ajuste o apoio de coxas para não levantar do banco.',
      'Pegue a barra com pegada aberta e sente-se mantendo o tronco levemente inclinado.',
      'Puxe a barra em direção à fúrcula esternal/clavícula sem balançar o tronco.',
      'Sustente a contração das costas por 1 segundo e suba controlando o peso.'
    ],
    checkpoints: [
      'Puxar a barra na frente do peito (nunca atrás da nuca).',
      'Cotovelos se movimentam para baixo e para dentro.',
      'Tronco com inclinação fixa de 10°-15° sem gangorra.'
    ],
    respiracao: 'Inspire no retorno dos braços; expire enquanto puxa a barra ao peito.',
    erro_comum: 'Inclinar o corpo 45° para trás e transformar a puxada vertical em uma remada horizontal usando o peso do corpo como pêndulo.',
    beneficio: 'Permite isolar a tração vertical do grande dorsal com cargas controladas, sendo o melhor exercício para construir o clássico físico em V.'
  },
  16: {
    id: 16,
    slug: 'puxada-com-triangulo',
    nome: 'Puxada com Triângulo',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Fibras Inferiores) e Romboides',
    sinergistas: 'Bíceps Braquial e Braquiorradial',
    equipamento: 'Máquina Lat Pulldown + Puxador Triângulo Neutro',
    posicao_inicial: 'Sentado na máquina com coxas presas. Segure o triângulo com pegada neutra e estenda os braços acima da cabeça.',
    concentrica: 'Puxe o triângulo para baixo até encostar na parte superior do peito, mantendo os cotovelos bem próximos ao tronco.',
    excentrica: 'Suba o peso em 3 segundos sentindo o alongamento na borda lateral das costas.',
    passos: [
      'Encaixe o triângulo na polia alta e sente-se travando as pernas.',
      'Puxe o triângulo até o peito alto mantendo os cotovelos fechados.',
      'Aperte as costas no topo do peito.',
      'Retorne devagar permitindo a extensão total das dorsais.'
    ],
    checkpoints: ['Pegada neutra confortável', 'Cotovelos descem colados às costelas', 'Sem reclinar demais o tronco'],
    respiracao: 'Inspire na subida dos braços; expire ao puxar ao peito.',
    erro_comum: 'Puxar com a força dos braços e arredondar os ombros para a frente no final do percurso.',
    beneficio: 'A pegada neutra coloca o bíceps e o latíssimo em ótimo plano de tração, permitindo movimentar boas cargas com conforto articular no punho.'
  },
  17: {
    id: 17,
    slug: 'remada-curvada-barra',
    nome: 'Remada Curvada com Barra',
    grupo: 'Costas',
    alvo: 'Dorsais, Romboides, Trapézio Médio e Eretores da Espinha',
    sinergistas: 'Bíceps Braquial e Deltoide Posterior',
    equipamento: 'Barra Olímpica + Anilhas',
    posicao_inicial: 'Pés na largura do quadril, joelhos ligeiramente destravados (flexão de 20°). Incline o tronco para a frente a cerca de 45° com a coluna lombar rigorosamente neutra. Segure a barra com pegada pronada na largura dos ombros.',
    concentrica: 'Puxe a barra em direção ao umbigo conduzindo o movimento pelos cotovelos para trás e aproximando as escápulas com força.',
    excentrica: 'Desça a barra em 2 a 3 segundos até a extensão dos braços sem perder a curvatura neutra da coluna lombar.',
    passos: [
      'Incline o tronco a 45° com coluna lombar travada e peito aberto.',
      'Segure a barra com pegada pronada e braços estendidos.',
      'Puxe a barra em direção ao umbigo puxando com as costas.',
      'Desça com cadência controlada até a extensão total dos braços.'
    ],
    checkpoints: [
      'Coluna lombar totalmente reta durante todo o exercício (sem curvar nem hiperestender).',
      'Barra puxada na altura do umbigo/linha da cintura.',
      'Manter os joelhos destravados para absorver a tensão na cadeia posterior.'
    ],
    respiracao: 'Inspire na descida da barra; expire forte na puxada ao umbigo.',
    erro_comum: 'Arredondar a coluna lombar (postura de corcunda) para puxar carga acima da capacidade, gerando alto risco de hérnia de disco.',
    beneficio: 'O exercício mais potente para espessura e densidade da musculatura das costas, além de desenvolver força isométrica na cadeia posterior.'
  },
  18: {
    id: 18,
    slug: 'remada-cavalinho',
    nome: 'Remada Cavalinho',
    grupo: 'Costas',
    alvo: 'Grande Dorsal, Romboides e Espessura Dorsal',
    sinergistas: 'Bíceps, Deltoide Posterior e Trapézio',
    equipamento: 'Barra T / Suporte Landmine + Puxador',
    posicao_inicial: 'Posicione-se sobre a barra T com uma perna de cada lado. Flexione os joelhos e incline o tronco a 45°. Segure o pegador triangular com braços estendidos e coluna neutra.',
    concentrica: 'Puxe o peso para cima em direção à base do abdômen, unindo as escápulas no topo.',
    excentrica: 'Desça o peso de forma controlada em 2 a 3 segundos estendendo os braços sem encostar as anilhas no solo.',
    passos: [
      'Fique sobre a barra com postura firme e pegue o suporte.',
      'Trave a coluna lombar e estufe o peito.',
      'Puxe a carga em direção ao estômago com os cotovelos apontando para trás.',
      'Controle a descida sentindo o alongamento da musculatura média das costas.'
    ],
    checkpoints: ['Tronco travado a 45°', 'Pés bem apoiados no piso', 'Escápulas fecham no topo'],
    respiracao: 'Inspire ao descer a barra; expire puxando a carga.',
    erro_comum: 'Ficar em pé e empurrar o quadril para frente para dar impulso à carga.',
    beneficio: 'Proporciona suporte angular muito favorável para gerar enorme sobrecarga na espessura dorsal e romboides.'
  },
  19: {
    id: 19,
    slug: 'remada-unilateral-serrote',
    nome: 'Remada Unilateral (Serrote)',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Isolamento Unilateral)',
    sinergistas: 'Romboides, Deltoide Posterior, Bíceps e Core',
    equipamento: 'Banco Reto + 1 Halter Pesado',
    posicao_inicial: 'Apoie o joelho e a mão do mesmo lado no banco reto, deixando a coluna paralela ao chão. O outro pé fica bem plantado no chão ao lado. Segure o halter com a mão livre e braço estendido para baixo.',
    concentrica: 'Puxe o halter em direção ao quadril (trajetória em formato de vírgula ou J), conduzindo o movimento com o cotovelo colado ao tronco até passar a linha das costas.',
    excentrica: 'Desça o halter em 3 segundos controlados até o braço ficar estendido, permitindo uma protração escapular segura para alongamento das fibras do dorsal.',
    passos: [
      'Apoie mão e joelho no banco mantendo as costas retas e paralelas ao chão.',
      'Segure o halter com o braço estendido e peito aberto.',
      'Puxe o peso em direção ao quadril, levando o cotovelo para cima e para trás.',
      'Desça de forma suave até sentir o dorsal esticar no ponto inferior.'
    ],
    checkpoints: [
      'Trajetória puxando para o quadril e não para o peito/ombro.',
      'Coluna horizontal reta sem girar o tronco na subida.',
      'Cotovelo sobe raspando o tronco.'
    ],
    respiracao: 'Inspire na descida com alongamento; expire na puxada até o quadril.',
    erro_comum: 'Girar o tronco para o lado como se estivesse puxando uma corda de barco para trapacear na subida.',
    beneficio: 'Permite corrigir assimetrias de força e volume entre os lados direito e esquerdo, além de proporcionar a maior amplitude de alongamento do latíssimo.'
  },
  20: {
    id: 20,
    slug: 'remada-baixa-cabo',
    nome: 'Remada Baixa no Cabo',
    grupo: 'Costas',
    alvo: 'Romboides, Grande Dorsal e Trapézio Médio',
    sinergistas: 'Bíceps Braquial, Braquial e Eretores da Espinha',
    equipamento: 'Máquina de Remada Baixa + Puxador Triângulo',
    posicao_inicial: 'Sentado na máquina com os pés nos apoios e joelhos levemente destravados. Segure o triângulo com os braços estendidos e tronco ereto.',
    concentrica: 'Puxe o triângulo em direção ao abdômen inferior retraindo as escápulas e estufando o peito, sustentando 1 segundo no pico.',
    excentrica: 'Retorne à posição inicial em 3 segundos estendendo os braços e permitindo que as escápulas se abram controladamente, sem inclinar o tronco excessivamente para a frente.',
    passos: [
      'Sente-se com pés firmes nos apoios e segure o triângulo.',
      'Estabilize o tronco reto com peito erguido.',
      'Puxe as mãos em direção à linha do umbigo, unindo as escápulas atrás.',
      'Controle o retorno em 3 segundos mantendo a coluna ereta.'
    ],
    checkpoints: ['Manter a coluna firme sem curvar', 'Puxar na altura do umbigo', 'Não balançar o tronco como se estivesse remando em barco de corrida'],
    respiracao: 'Inspire na volta dos braços; expire na contração ao abdômen.',
    erro_comum: 'Fazer o movimento como uma gangorra (hiperestender as costas para trás e dobrar para a frente no retorno).',
    beneficio: 'Excelente estímulo de tensão contínua na musculatura interescapular (romboides e trapézio médio), essencial para saúde postural.'
  },
  21: {
    id: 21,
    slug: 'remada-articulada-maquina',
    nome: 'Remada Articulada Máquina',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Romboides',
    sinergistas: 'Bíceps e Deltoide Posterior',
    equipamento: 'Máquina Articulada de Remada com Apoio no Peito',
    posicao_inicial: 'Sentado com o peito apoiado firmemente na almofada frontal. Ajuste a altura do banco para que as manoplas fiquem na linha do abdômen superior.',
    concentrica: 'Puxe as manoplas para trás aproximando as escápulas, mantendo o peito sempre colado no apoio.',
    excentrica: 'Retorne controladamente em 3 segundos estendendo os braços e sentindo a fáscia dorsal alongar.',
    passos: [
      'Ajuste o apoio do peito para permitir a extensão completa dos braços.',
      'Segure as manoplas e cole o esterno no encosto frontal.',
      'Puxe os cotovelos para trás espremendo as costas.',
      'Retorne devagar sem deixar o peito descolar da almofada.'
    ],
    checkpoints: ['Peito 100% apoiado durante toda a repetição', 'Puxada com os cotovelos', 'Retorno lento'],
    respiracao: 'Inspire no alongamento; expire na puxada.',
    erro_comum: 'Descolar o tórax da almofada para puxar o peso com impulso lombar.',
    beneficio: 'Elimina a sobrecarga e fadiga na coluna lombar, permitindo focar 100% da energia no dorsal e romboides.'
  },
  22: {
    id: 22,
    slug: 'pulldown-com-corda',
    nome: 'Pulldown com Corda',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Isolamento sem Bíceps)',
    sinergistas: 'Redondo Maior, Tríceps (Cabeça Longa) e Peitoral Menor',
    equipamento: 'Polia Alta + Corda',
    posicao_inicial: 'Em pé em frente à polia alta segurando a corda com as mãos. Afaste-se um passo, flexione os joelhos e incline o tronco cerca de 30° para a frente com os braços estendidos acima da cabeça.',
    concentrica: 'Puxe a corda para baixo em arco amplo até as mãos chegarem ao lado das coxas, abrindo levemente as pontas da corda na máxima contração.',
    excentrica: 'Retorne os braços para cima em 3 segundos controlados sentindo o grande dorsal alongar totalmente sob a tração do cabo.',
    passos: [
      'Segure a corda no ponto alto e dê um passo para trás.',
      'Incline o tronco 30° com cotovelos ligeiramente destravados (10° fixos).',
      'Desça as mãos em arco até a lateral do quadril, contraindo o dorsal.',
      'Suba de forma compassada até sentir as dorsais bem esticadas.'
    ],
    checkpoints: [
      'Cotovelos permanecem em leve flexão fixa (não dobre como extensão de tríceps).',
      'Movimento circular amplo de cima para baixo.',
      'Tronco permanece estável sem balanço.'
    ],
    respiracao: 'Inspire ao deixar os braços subirem; expire ao conduzir a corda para o quadril.',
    erro_comum: 'Dobrar e esticar os cotovelos transformando o exercício em um tríceps na corda.',
    beneficio: 'Isola o grande dorsal em extensão pura de ombro sem fadigar o bíceps braquial, ideal como pré-exaustão ou finalizador.'
  },
  23: {
    id: 23,
    slug: 'pulldown-com-barra',
    nome: 'Pulldown com Barra',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Redondo Maior',
    sinergistas: 'Tríceps (Cabeça Longa) e Peitoral Menor',
    equipamento: 'Polia Alta + Barra Reta ou Barra W',
    posicao_inicial: 'Em pé com tronco inclinado 30° segurando a barra com pegada pronada na largura dos ombros.',
    concentrica: 'Puxe a barra para baixo em arco até encostar suavemente na frente das coxas.',
    excentrica: 'Retorne em 3 segundos permitindo que a barra suba acima da linha dos olhos.',
    passos: [
      'Segure a barra com pegada pronada e afaste-se da polia.',
      'Mantenha cotovelos destravados e peito estufado.',
      'Traga a barra em direção às coxas em movimento circular.',
      'Controle o retorno até a extensão alta.'
    ],
    checkpoints: ['Braços quase retos', 'Descida até as coxas', 'Costas ativas'],
    respiracao: 'Inspire na subida da barra; expire ao puxar às coxas.',
    erro_comum: 'Usar o peso do corpo para empurrar a barra para baixo.',
    beneficio: 'Excelente para aprender a ativação consciente do latíssimo do dorso e conexão mente-músculo.'
  },
  24: {
    id: 24,
    slug: 'levantamento-terra',
    nome: 'Levantamento Terra (Deadlift)',
    grupo: 'Costas',
    alvo: 'Cadeia Posterior Completa (Eretores da Espinha, Glúteos, Isquiotibiais e Trapézio)',
    sinergistas: 'Grande Dorsal, Quadríceps, Antebraços e Core',
    equipamento: 'Barra Olímpica no Solo + Anilhas',
    posicao_inicial: 'Em pé com a barra sobre o meio dos pés (2-3 cm da canela). Pés na largura do quadril. Dobre o quadril e joelhos para segurar a barra por fora das pernas. Peito erguido, escápulas sobre a barra, coluna lombar neutra e ar travado no abdômen.',
    concentrica: 'Empurre o chão com os calcanhares estendendo simultaneamente joelhos e quadril, mantendo a barra raspando as canelas e coxas até a postura ereta.',
    excentrica: 'Inicie com a flexão do quadril levando o bumbum para trás até a barra passar os joelhos, então flexione os joelhos para pousar a barra no solo em 2 segundos.',
    passos: [
      'Posicione os pés sob a barra com canelas próximas ao metal.',
      'Segure a barra firme, estufe o peito e trave as dorsais como se estivesse entortando a barra.',
      'Faça o brace abdominal e empurre o chão com os pés.',
      'Fique ereto sem hiperestender a lombar para trás no topo.'
    ],
    checkpoints: [
      'Barra sobe em linha vertical reta rente ao corpo.',
      'Quadril e ombros sobem na mesma velocidade na saída do chão.',
      'Coluna lombar totalmente neutra durante todo o trajeto.'
    ],
    respiracao: 'Puxe o ar e faça brace abdominal no chão; solte o ar apenas ao travar no topo ou após descer.',
    erro_comum: 'Arredondar a coluna lombar na saída do solo ou puxar com os braços flexionados.',
    beneficio: 'O exercício de força mais completo da musculatura humana, construindo densidade óssea, espessura espinhal e potência atlética bruta.'
  },
  25: {
    id: 25,
    slug: 'extensao-lombar-banco-romano',
    nome: 'Extensão Lombar (Banco Romano)',
    grupo: 'Costas',
    alvo: 'Eretores da Espinha (Lombar)',
    sinergistas: 'Glúteo Máximo e Isquiotibiais',
    equipamento: 'Banco Romano / Hiperextensão 45°',
    posicao_inicial: 'Apoiado no banco romano com os tornozelos travados nos rolos e a almofada superior posicionada logo abaixo da crista ilíaca (permitindo livre flexão do quadril). Tronco alinhado com as pernas.',
    concentrica: 'Eleve o tronco estendendo a coluna e o quadril até formar uma linha reta com as pernas, sustentando 1 segundo.',
    excentrica: 'Desça o tronco flexionando o quadril em 3 segundos controlados até onde for confortável.',
    passos: [
      'Encaixe os pés e ajuste a almofada abaixo do quadril.',
      'Cruze os braços no peito ou atrás da cabeça.',
      'Desça o tronco suavemente em direção ao solo.',
      'Suba até a linha neutra sem arquear para trás em excesso.'
    ],
    checkpoints: ['Almofada abaixo da dobra do quadril', 'Subir até alinhar com as pernas (não hiperestender)', 'Movimento cadenciado'],
    respiracao: 'Inspire ao descer; expire ao subir alinhando o tronco.',
    erro_comum: 'Hiperestender violentamente a coluna lombar para trás no topo do movimento.',
    beneficio: 'Fortalecimento preventivo crucial dos eretores da coluna, prevenindo lombalgias e melhorando a estabilidade no agachamento e terra.'
  },
  26: {
    id: 26,
    slug: 'rack-pull',
    nome: 'Rack Pull',
    grupo: 'Costas',
    alvo: 'Trapézio Superior e Médio, Eretores da Espinha e Romboides',
    sinergistas: 'Glúteos, Grande Dorsal e Antebraços',
    equipamento: 'Barra Olímpica sobre Travas de Segurança da Gaiola (Altura do Joelho)',
    posicao_inicial: 'Barra posicionada nas travas da gaiola na altura logo abaixo ou acima dos joelhos. Postura igual à fase final do terra.',
    concentrica: 'Puxe a barra estendendo o quadril e puxando os ombros para trás em postura firme.',
    excentrica: 'Desça a barra controladamente pousando nas travas sem bater com impacto destrutivo.',
    passos: [
      'Ajuste as travas da gaiola na linha dos joelhos.',
      'Segure a barra com pegada firme e escápulas travadas.',
      'Estenda o quadril ficando ereto com os ombros para trás.',
      'Desça acompanhando a barra até o apoio.'
    ],
    checkpoints: ['Trava na altura dos joelhos', 'Coluna reta', 'Finalização com extensão de quadril'],
    respiracao: 'Inspire e faça brace antes de puxar; expire no topo.',
    erro_comum: 'Jogar o tronco excessivamente para trás no topo forçando as vértebras lombares.',
    beneficio: 'Permite sobrecarga supramáxima no trapézio e eretores da espinha com menor demanda de mobilidade dos quadris.'
  },
  123: {
    id: 123,
    slug: 'barra-fixa-pegada-neutra',
    nome: 'Barra Fixa com Pegada Neutra',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Braquial',
    sinergistas: 'Bíceps, Romboides e Peitoral Menor',
    equipamento: 'Barra Fixa com Pegadores Paralelos',
    posicao_inicial: 'Suspenso com as palmas voltadas uma para a outra nos pegadores paralelos.',
    concentrica: 'Puxe o corpo para cima até o peito se aproximar das manoplas, com cotovelos fechados.',
    excentrica: 'Desça em 3 segundos até a extensão total dos braços.',
    passos: [
      'Segure as manoplas paralelas.',
      'Deprima as escápulas e suba com força suave.',
      'Passe o queixo da linha dos pegadores.',
      'Retorne de forma contínua e controlada.'
    ],
    checkpoints: ['Palmas voltadas uma para a outra', 'Cotovelos junto ao corpo', 'Sem embalo'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Puxar apenas com os braços sem ativar a retração escapular.',
    beneficio: 'A variação mais anatômica e segura para quem sofre de dores nos punhos ou cotovelos na barra pronada.'
  },
  124: {
    id: 124,
    slug: 'barra-fixa-carga-adicional',
    nome: 'Barra Fixa com Carga Adicional',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Força Absoluta de Puxada',
    sinergistas: 'Bíceps, Antebraço e Romboides',
    equipamento: 'Cinto de Carga (Dip Belt) + Anilhas ou Halter entre as Pernas',
    posicao_inicial: 'Cinto com peso preso na cintura. Suba no apoio e segure a barra pronada ou neutra.',
    concentrica: 'Puxe o corpo e a carga adicional até o queixo ultrapassar a barra com aceleração concêntrica.',
    excentrica: 'Desça em 3 segundos controlando rigorosamente o peso suspenso.',
    passos: [
      'Prenda o cinto de carga com a anilha equilibrada.',
      'Segure a barra com pegada firme.',
      'Puxe o peso corporal + anilha em direção à barra.',
      'Desça suavemente até estender os braços.'
    ],
    checkpoints: ['Carga estável sem balançar', 'Subida completa do queixo', 'Descida sob controle'],
    respiracao: 'Inspire no fundo; expire na tração.',
    erro_comum: 'Adicionar peso excessivo e realizar apenas repetições parciais.',
    beneficio: 'Sobrecarga progressiva avançada quando o peso corporal já não é suficiente para gerar estímulo hipertrófico.'
  },
  125: {
    id: 125,
    slug: 'puxada-pegada-supinada',
    nome: 'Puxada com Pegada Supinada (Underhand)',
    grupo: 'Costas',
    alvo: 'Grande Dorsal Inferior e Bíceps',
    sinergistas: 'Redondo Maior e Braquial',
    equipamento: 'Polia Alta + Barra Reta',
    posicao_inicial: 'Sentado com coxas travadas segurando a barra com palmas voltadas para você na largura dos ombros.',
    concentrica: 'Puxe a barra para o peito alto conduzindo os cotovelos para baixo e para trás.',
    excentrica: 'Suba o peso em 3 segundos até a extensão total dos braços.',
    passos: [
      'Segure a barra em pegada supinada na largura dos ombros.',
      'Sente-se com o peito erguido.',
      'Puxe até encostar na parte superior do peitoral.',
      'Controle o retorno aproveitando o alongamento.'
    ],
    checkpoints: ['Pegada na largura dos ombros', 'Cotovelos descem rente ao corpo', 'Peito estufado'],
    respiracao: 'Inspire na subida; expire na puxada.',
    erro_comum: 'Usar pegada aberta demais na pegada supinada, forçando os punhos.',
    beneficio: 'Excelente recrutamento das fibras inferiores do dorsal com grande auxílio de flexores de cotovelo.'
  },
  126: {
    id: 126,
    slug: 'puxada-pegada-neutra-paralela',
    nome: 'Puxada com Pegada Neutra Paralela',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Romboides',
    sinergistas: 'Bíceps e Braquiorradial',
    equipamento: 'Polia Alta + Barra com Pegadas Neutras',
    posicao_inicial: 'Sentado na máquina segurando as empunhaduras paralelas na largura dos ombros.',
    concentrica: 'Puxe a barra até a altura da clavícula com cotovelos descendo no plano escapular.',
    excentrica: 'Suba em 3 segundos controlados mantendo a postura ereta.',
    passos: [
      'Segure as manoplas neutras.',
      'Sente-se e estabilize o tronco.',
      'Puxe de forma contínua até o peito.',
      'Retorne resistindo à carga.'
    ],
    checkpoints: ['Palmas paralelas', 'Movimento suave', 'Sem solavanco no início'],
    respiracao: 'Inspire subindo; expire puxando.',
    erro_comum: 'Inclinar o corpo muito para trás no momento da puxada.',
    beneficio: 'Proporciona conforto anatômico excepcional para os ombros enquanto maximiza a ativação do grande dorsal.'
  },
  127: {
    id: 127,
    slug: 'puxada-unilateral-polia-alta',
    nome: 'Puxada Unilateral na Polia Alta',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Isolamento Unilateral)',
    sinergistas: 'Bíceps e Redondo Maior',
    equipamento: 'Polia Alta + Pegador Simples (D-Handle)',
    posicao_inicial: 'Sentado ou ajoelhado lateralmente à polia segurando o pegador com uma das mãos, braço totalmente estendido no alto.',
    concentrica: 'Puxe o pegador para baixo conduzindo o cotovelo em direção ao quadril, sentindo o dorsal contrair intensamente.',
    excentrica: 'Retorne o braço para cima em 3 segundos acompanhando o alinhamento do cabo.',
    passos: [
      'Segure o pegador simples e posicione o joelho de apoio no solo.',
      'Inicie a puxada guiando o cotovelo rente ao corpo.',
      'Aperte o grande dorsal na linha do quadril por 1 segundo.',
      'Suba com cadência até o alongamento completo.'
    ],
    checkpoints: ['Cotovelo direcionado para o bolso da calça', 'Tronco firme sem inclinação lateral', 'Amplitude máxima'],
    respiracao: 'Inspire no topo; expire na puxada.',
    erro_comum: 'Torcer o tronco para o lado para conseguir puxar mais carga.',
    beneficio: 'Permite alinhar perfeitamente a linha de ação do cabo com a orientação das fibras do latíssimo do dorso de cada lado.'
  },
  128: {
    id: 128,
    slug: 'puxada-atras-nuca',
    nome: 'Puxada Atrás da Nuca na Polia',
    grupo: 'Costas',
    alvo: 'Trapézio Superior/Médio e Romboides',
    sinergistas: 'Grande Dorsal e Bíceps',
    equipamento: 'Lat Machine + Barra Larga',
    posicao_inicial: 'Sentado na máquina com tronco ligeiramente inclinado para frente e cabeça alinhada.',
    concentrica: 'Puxe a barra para baixo suavemente até a linha da nuca, sem bater no pescoço.',
    excentrica: 'Retorne em 3 segundos com velocidade controlada.',
    passos: [
      'Pegue a barra com pegada moderada.',
      'Sente-se com postura ereta e cabeça levemente à frente.',
      'Puxe a barra com calma até a altura da nuca.',
      'Suba controlando o peso.'
    ],
    checkpoints: ['Apenas para quem possui excelente mobilidade de ombro', 'Carga leve a moderada', 'Sem empurrar o pescoço para frente'],
    respiracao: 'Inspire ao subir; expire ao puxar.',
    erro_comum: 'Bater a barra com força nas vértebras cervicais ou usar carga excessiva que projeta a cabeça bruscamente.',
    beneficio: 'Trabalho de adução escapular com rotação externa de ombro, indicado para mobilidade e ativação de trapézio médio.'
  },
  129: {
    id: 129,
    slug: 'puxada-bracos-retos-straight-arm',
    nome: 'Puxada com Braços Retos na Polia (Straight-Arm)',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Redondo Maior',
    sinergistas: 'Tríceps (Cabeça Longa)',
    equipamento: 'Polia Alta + Barra Reta',
    posicao_inicial: 'Em pé com braços quase retos segurando a barra na polia alta.',
    concentrica: 'Puxe a barra para baixo em arco até a linha da coxa com os cotovelos travados em 10°.',
    excentrica: 'Retorne em 3 segundos permitindo que as dorsais se alongem no topo.',
    passos: [
      'Afaste-se um passo da polia e incline o tronco 25°.',
      'Desça a barra em arco firme até a frente das coxas.',
      'Sustente 1 segundo no pico de contração.',
      'Suba devagar até a altura dos olhos.'
    ],
    checkpoints: ['Cotovelos fixos', 'Movimento parte do ombro', 'Peito estufado'],
    respiracao: 'Inspire subindo; expire descendo.',
    erro_comum: 'Flexionar os braços durante o exercício.',
    beneficio: 'Isolamento completo do latíssimo do dorso sem exigir esforço dos flexores do cotovelo.'
  },
  130: {
    id: 130,
    slug: 'remada-baixa-unilateral-polia',
    nome: 'Remada Baixa Unilateral na Polia',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Porção Ilíaca)',
    sinergistas: 'Bíceps, Romboides e Core',
    equipamento: 'Polia Baixa + Pegador Simples',
    posicao_inicial: 'Sentado de frente para a polia baixa segurando o pegador com uma mão, tronco ereto.',
    concentrica: 'Puxe o pegador em direção ao quadril mantendo o cotovelo colado ao corpo.',
    excentrica: 'Retorne em 3 segundos permitindo que o braço estique e o dorsal alongue.',
    passos: [
      'Segure o pegador com uma mão e apoie os pés.',
      'Puxe até a cintura conduzindo com o cotovelo.',
      'Aperte o lado das costas.',
      'Retorne esticando o braço com controle.'
    ],
    checkpoints: ['Cotovelo rente às costelas', 'Tronco estável', 'Pico de contração de 1s'],
    respiracao: 'Inspire na extensão; expire na remada.',
    erro_comum: 'Girar a coluna excessivamente para compensar o peso.',
    beneficio: 'Permite rotação livre do punho para maior contração do feixe inferior do grande dorsal.'
  },
  131: {
    id: 131,
    slug: 'remada-curvada-halteres',
    nome: 'Remada Curvada com Halteres',
    grupo: 'Costas',
    alvo: 'Costas Completas (Dorsais e Romboides)',
    sinergistas: 'Bíceps, Deltoide Posterior e Lombar',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé, incline o tronco a 45° segurando os halteres com pegada neutra ou pronada.',
    concentrica: 'Puxe os halteres para cima e para trás aproximando as escápulas.',
    excentrica: 'Desça em 2 a 3 segundos até a extensão dos braços.',
    passos: [
      'Incline o tronco com joelhos destravados e coluna reta.',
      'Puxe os halteres em direção ao abdômen.',
      'Una as escápulas no topo.',
      'Desça de forma compassada.'
    ],
    checkpoints: ['Coluna neutra', 'Pescoço alinhado com a espinha', 'Cotovelos sobem para trás'],
    respiracao: 'Inspire na descida; expire ao puxar.',
    erro_comum: 'Arredondar a coluna lombar durante a execução.',
    beneficio: 'Maior liberdade articular para os ombros e punhos em comparação com a barra rígida.'
  },
  132: {
    id: 132,
    slug: 'remada-apoiada-banco-inclinado-halteres',
    nome: 'Remada Apoiada no Banco Inclinado com Halteres',
    grupo: 'Costas',
    alvo: 'Romboides, Trapézio Médio e Dorsais',
    sinergistas: 'Deltoide Posterior e Bíceps',
    equipamento: 'Banco Inclinado (30°-45°) + Halteres',
    posicao_inicial: 'Deitado de bruços com o peito apoiado no banco inclinado, segurando os halteres com braços estendidos para baixo.',
    concentrica: 'Puxe os halteres para cima e para trás unindo as escápulas com força.',
    excentrica: 'Desça em 3 segundos até os braços estenderem totalmente.',
    passos: [
      'Deite de bruços no banco inclinado.',
      'Segure os halteres com pegada neutra ou semi-pronada.',
      'Puxe os pesos pelos cotovelos espremendo as costas.',
      'Desça suavemente até o fundo.'
    ],
    checkpoints: ['Peito colado no banco', 'Zero impulso de pernas ou coluna', 'Escápulas se fecham'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Levantar o peito do banco usando a força lombar.',
    beneficio: 'Elimina completamente a fadiga e a estabilização lombar, isolando os romboides e o dorso.'
  },
  133: {
    id: 133,
    slug: 'remada-seal-row-banco',
    nome: 'Remada Seal Row no Banco Reto',
    grupo: 'Costas',
    alvo: 'Romboides, Trapézio Médio e Dorsal',
    sinergistas: 'Bíceps e Deltoide Posterior',
    equipamento: 'Banco Reto Elevado em Blocos + Barra ou Halteres',
    posicao_inicial: 'Deitado de bruços no banco horizontal elevado. Braços estendidos segurando a barra no chão.',
    concentrica: 'Puxe a barra para cima até encostar no fundo do banco, espremendo as costas.',
    excentrica: 'Desça a barra em 2 a 3 segundos até a extensão completa dos braços sem tocar o chão.',
    passos: [
      'Deite de bruços no banco elevado horizontal.',
      'Segure a barra com pegada pronada.',
      'Puxe com força dorsal até a barra bater suavemente na base do banco.',
      'Desça com controle mantendo a tensão.'
    ],
    checkpoints: ['Corpo horizontal estritamente apoiado', 'Puxada pura de costas', 'Sem embalo'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Tentar levantar a cabeça e o peito do banco.',
    beneficio: 'Padrão ouro de remada estrita que anula totalmente a trapaça corporal e protege 100% a lombar.'
  },
  134: {
    id: 134,
    slug: 'remada-pendlay-solo',
    nome: 'Remada Pendlay do Solo',
    grupo: 'Costas',
    alvo: 'Grande Dorsal, Romboides e Potência de Tração',
    sinergistas: 'Trapézio, Lombar e Bíceps',
    equipamento: 'Barra Olímpica no Solo + Anilhas',
    posicao_inicial: 'Tronco estritamente paralelo ao chão (90° com as pernas). Barra repousando imóvel no piso a cada repetição.',
    concentrica: 'Puxe a barra do chão de forma explosiva até encostar no abdômen superior/esterno.',
    excentrica: 'Desça a barra de volta ao chão e solte a tensão momentaneamente antes da próxima repetição.',
    passos: [
      'Incline o tronco 100% paralelo ao piso e pegue a barra.',
      'Trave as costas retas e puxe a barra do solo de forma potente até o peito.',
      'Desça e pouse a barra no chão por 1 segundo (dead stop).',
      'Inicie a próxima repetição do zero sem rebote.'
    ],
    checkpoints: ['Tronco paralelo ao chão', 'Barra pousa no solo em toda repetição', 'Puxada explosiva sem erguer o tronco'],
    respiracao: 'Inspire no chão travando o abdômen; expire forte na puxada explosiva.',
    erro_comum: 'Erguer o tronco para 45° durante a puxada perdendo a horizontalidade.',
    beneficio: 'Desenvolve potência de arrancada pura para as costas a partir da inércia zero (dead stop).'
  },
  135: {
    id: 135,
    slug: 'remada-yates-supinada',
    nome: 'Remada Yates Supinada com Barra',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Feixe Inferior) e Trapézio',
    sinergistas: 'Bíceps e Romboides',
    equipamento: 'Barra Olímpica + Anilhas',
    posicao_inicial: 'Tronco inclinado a apenas cerca de 60°-70° (mais ereto que o convencional). Pegada supinada na largura dos ombros.',
    concentrica: 'Puxe a barra rente às coxas em direção ao umbigo inferior, contraindo fortemente as dorsais.',
    excentrica: 'Desça a barra controladamente em 2 a 3 segundos até a linha dos joelhos.',
    passos: [
      'Fique mais ereto com tronco a cerca de 60°-70°.',
      'Segure a barra com pegada supinada.',
      'Puxe a barra em direção ao púbis/umbigo inferior.',
      'Sustente a contração e retorne devagar.'
    ],
    checkpoints: ['Tronco mais ereto reduzindo estresse lombar', 'Pegada supinada firme', 'Puxada rente às coxas'],
    respiracao: 'Inspire descendo; expire puxando.',
    erro_comum: 'Usar carga excessiva e dobrar demais a coluna.',
    beneficio: 'Criada pelo 6x Mr. Olympia Dorian Yates, permite manipular cargas imensas com foco nas fibras inferiores do dorsal.'
  },
  136: {
    id: 136,
    slug: 'remada-curvada-smith',
    nome: 'Remada Curvada no Smith',
    grupo: 'Costas',
    alvo: 'Costas e Romboides',
    sinergistas: 'Bíceps e Trapézio',
    equipamento: 'Smith Machine',
    posicao_inicial: 'Em pé no Smith, tronco inclinado 45°, segurando a barra com pegada pronada.',
    concentrica: 'Puxe a barra para cima nos trilhos até o abdômen.',
    excentrica: 'Desça em 3 segundos controlando a trajetória linear do aparelho.',
    passos: [
      'Destrave a barra do Smith e incline o tronco.',
      'Puxe com as costas guiado pelo trilho.',
      'Aperte as escápulas no topo.',
      'Desça de forma suave.'
    ],
    checkpoints: ['Trilho alinhado ao umbigo', 'Coluna neutra', 'Movimento contínuo'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Posicionar os pés muito atrás forçando a curvatura lombar.',
    beneficio: 'Permite treinar com foco na contração sem se preocupar com o balanço horizontal da barra.'
  },
  137: {
    id: 137,
    slug: 'remada-cavalinho-unilateral',
    nome: 'Remada Cavalinho Unilateral',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Unilateral com Landmine)',
    sinergistas: 'Bíceps e Core',
    equipamento: 'Barra Landmine + Halter ou Pegador',
    posicao_inicial: 'Posicione-se ao lado da barra, tronco inclinado, segurando a ponta da barra com uma mão.',
    concentrica: 'Puxe a ponta da barra em direção ao quadril com o cotovelo rente.',
    excentrica: 'Desça em 3 segundos até estender o braço.',
    passos: [
      'Fique de lado para a ponta da barra landmine.',
      'Incline o tronco com base sólida.',
      'Puxe a barra para a lateral do quadril.',
      'Retorne esticando o braço com controle.'
    ],
    checkpoints: ['Base ampla de pernas', 'Cotovelo sobe rente', 'Coluna alinhada'],
    respiracao: 'Inspire descendo; expire puxando.',
    erro_comum: 'Girar o quadril durante a remada.',
    beneficio: 'Arco natural do landmine que acompanha a mecânica perfeita do grande dorsal.'
  },
  138: {
    id: 138,
    slug: 'remada-kroc-row-halter',
    nome: 'Remada Kroc com Halter Pesado',
    grupo: 'Costas',
    alvo: 'Grande Dorsal, Trapézio, Romboides e Pegada',
    sinergistas: 'Bíceps e Core',
    equipamento: '1 Halter Muito Pesado + Banco ou Apoio',
    posicao_inicial: 'Apoiado em um banco ou suporte alto com tronco inclinado 45°. Segure o halter pesado com braço estendido.',
    concentrica: 'Puxe o halter de forma vigorosa e pesada em direção ao quadril, permitindo leve uso natural do tronco sem desleixo postural.',
    excentrica: 'Desça o halter em 2 segundos sentindo o peso esticar o dorsal e a escápula no fundo.',
    passos: [
      'Apoie a mão livre em uma superfície firme.',
      'Segure o halter pesado com pegada firme.',
      'Puxe com agressividade até a linha da cintura.',
      'Desça controladamente aproveitando o peso para alongar a escápula.'
    ],
    checkpoints: ['Séries de alta repetição pesada (15-25 reps)', 'Pegada poderosa', 'Controle da descida'],
    respiracao: 'Respire ritmicamente em cadência alta.',
    erro_comum: 'Deixar o peso cair sem frear a descida com as costas.',
    beneficio: 'Popularizada por Matt Kroc, desenvolve força de pegada colossal e espessura brutal nas costas.'
  },
  139: {
    id: 139,
    slug: 'remada-meadows-barra-t',
    nome: 'Remada Meadows com Barra T',
    grupo: 'Costas',
    alvo: 'Grande Dorsal e Redondo Maior',
    sinergistas: 'Deltoide Posterior e Bíceps',
    equipamento: 'Barra Landmine com Anilha na Ponta',
    posicao_inicial: 'Em pé perpendicular à ponta da barra landmine. Segure a ponta com pegada pronada (sobre a ponta da barra).',
    concentrica: 'Puxe a ponta da barra para cima abrindo o cotovelo ligeiramente para fora, sentindo a contração do dorsal lateral.',
    excentrica: 'Desça esticando o braço e permitindo que o dorsal se abra em alongamento profundo.',
    passos: [
      'Fique em pé transversalmente à ponta da barra.',
      'Incline o tronco com mão de apoio no joelho.',
      'Puxe a ponta da barra conduzindo o cotovelo para cima e para fora.',
      'Desça devagar até o alongamento máximo.'
    ],
    checkpoints: ['Corpo perpendicular à barra', 'Pegada pronada na extremidade', 'Alongamento profundo'],
    respiracao: 'Inspire descendo; expire puxando.',
    erro_comum: 'Ficar alinhado com a barra em vez de perpendicular.',
    beneficio: 'Criada pelo lendário John Meadows, isola a porção externa do dorsal com estímulo único de alongamento.'
  },
  140: {
    id: 140,
    slug: 'remada-articulada-pegada-neutra',
    nome: 'Remada Articulada Pegada Neutra',
    grupo: 'Costas',
    alvo: 'Grande Dorsal',
    sinergistas: 'Bíceps e Braquial',
    equipamento: 'Máquina Articulada com Manoplas Verticais',
    posicao_inicial: 'Sentado com peito apoiado, segurando as manoplas verticais (palmas para dentro).',
    concentrica: 'Puxe as manoplas para trás mantendo os cotovelos colados ao corpo.',
    excentrica: 'Retorne em 3 segundos até a extensão dos braços.',
    passos: [
      'Ajuste o assento para que as manoplas fiquem no meio do tronco.',
      'Segure com pegada neutra e cole o peito no apoio.',
      'Puxe conduzindo com os cotovelos.',
      'Retorne devagar sem bater os pesos.'
    ],
    checkpoints: ['Cotovelos rentes ao tronco', 'Peito apoiado', 'Contração de 1s'],
    respiracao: 'Inspire voltando; expire puxando.',
    erro_comum: 'Afastar os cotovelos para os lados.',
    beneficio: 'Foco exclusivo na ativação do latíssimo do dorso com conforto articular ideal.'
  },
  141: {
    id: 141,
    slug: 'remada-articulada-pegada-aberta',
    nome: 'Remada Articulada Pegada Aberta',
    grupo: 'Costas',
    alvo: 'Trapézio Médio, Romboides e Deltoide Posterior',
    sinergistas: 'Grande Dorsal e Bíceps',
    equipamento: 'Máquina Articulada com Manoplas Horizontais Largas',
    posicao_inicial: 'Sentado com peito apoiado segurando as manoplas horizontais abertas com pegada pronada.',
    concentrica: 'Puxe as manoplas para trás com os cotovelos apontando para fora a 70°-80° do tronco.',
    excentrica: 'Retorne em 3 segundos estendendo os braços.',
    passos: [
      'Segure as manoplas abertas pronadas.',
      'Apoie o peito firmemente.',
      'Puxe abrindo os cotovelos e juntando as escápulas.',
      'Volte com controle.'
    ],
    checkpoints: ['Cotovelos altos e abertos', 'Foco no centro das costas', 'Peito firme no encosto'],
    respiracao: 'Inspire no retorno; expire na tração.',
    erro_comum: 'Encolher os ombros para cima em direção às orelhas.',
    beneficio: 'Direciona a sobrecarga para a musculatura que dá espessura e densidade ao centro das costas.'
  },
  142: {
    id: 142,
    slug: 'puxada-articulada-unilateral-maquina',
    nome: 'Puxada Articulada Unilateral na Máquina',
    grupo: 'Costas',
    alvo: 'Grande Dorsal (Unilateral)',
    sinergistas: 'Bíceps e Redondo Maior',
    equipamento: 'Máquina de Puxada Articulada com Braços Independentes',
    posicao_inicial: 'Sentado com coxas travadas segurando uma das manoplas altas.',
    concentrica: 'Puxe a manopla para baixo em arco convergente até o nível da clavícula/ombro.',
    excentrica: 'Retorne em 3 segundos até a extensão alta.',
    passos: [
      'Trave as pernas e segure a manopla com uma das mãos.',
      'Puxe de forma contínua até o ombro.',
      'Aperte o grande dorsal no final.',
      'Suba com cadência uniforme.'
    ],
    checkpoints: ['Movimento convergente da máquina', 'Tronco reto', 'Foco unilateral'],
    respiracao: 'Inspire subindo; expire puxando.',
    erro_comum: 'Inclinar o tronco para o lado para completar a repetição.',
    beneficio: 'Permite focar toda a concentração neural em cada lado individualmente sem assimetrias.'
  },
  143: {
    id: 143,
    slug: 'levantamento-terra-sumo',
    nome: 'Levantamento Terra Sumô',
    grupo: 'Costas',
    alvo: 'Glúteos, Adutores, Quadríceps e Eretores da Espinha',
    sinergistas: 'Trapézio, Isquiotibiais e Core',
    equipamento: 'Barra Olímpica no Solo + Anilhas',
    posicao_inicial: 'Pés bem afastados (além da largura dos ombros) com pontas dos pés apontando a 45° para fora. Canelas encostadas na barra. Pegada na barra com braços verticais por dentro das pernas. Tronco ereto e quadril rebaixado.',
    concentrica: 'Empurre o chão afastando o solo com os pés, mantendo o tronco ereto até a extensão completa dos quadris e joelhos.',
    excentrica: 'Desça a barra rente às pernas flexionando o quadril e joelhos de forma controlada.',
    passos: [
      'Abra a base com pés apontados para fora.',
      'Segure a barra por dentro dos joelhos com braços retos.',
      'Abra o peito, abaixe o quadril e empurre o chão com os calcanhares.',
      'Trave o quadril no topo sem reclinar o tronco para trás.'
    ],
    checkpoints: [
      'Tronco muito mais ereto que no terra convencional.',
      'Joelhos acompanham exatamente a linha dos dedos dos pés.',
      'Braços verticais pendendo diretamente dos ombros.'
    ],
    respiracao: 'Inspire no solo travando o abdômen; expire ao ficar de pé.',
    erro_comum: 'Deixar os joelhos desabarem para dentro (valgo) na saída do solo.',
    beneficio: 'Reduz significativamente o braço de momento sobre a coluna lombar, aumentando a ativação dos glúteos e adutores com máxima força.'
  },
  144: {
    id: 144,
    slug: 'terra-trap-bar-hexagonal',
    nome: 'Levantamento Terra com Barra Hexagonal (Trap Bar)',
    grupo: 'Costas',
    alvo: 'Quadríceps, Glúteos, Eretores da Espinha e Trapézio',
    sinergistas: 'Isquiotibiais, Antebraços e Core',
    equipamento: 'Barra Hexagonal (Trap Bar) + Anilhas',
    posicao_inicial: 'Em pé dentro do centro da barra hexagonal. Pés na largura do quadril. Agache segurando as empunhaduras laterais neutras. Coluna neutra e peito aberto.',
    concentrica: 'Empurre o chão com os pés subindo em linha reta até ficar completamente ereto com ombros estáveis.',
    excentrica: 'Desça flexionando o quadril e joelhos até os pesos tocarem o chão suavemente.',
    passos: [
      'Posicione-se no centro exato da barra hexagonal.',
      'Segure as pegadas laterais neutras.',
      'Estufe o peito e empurre o chão com firmeza.',
      'Fique ereto e controle a descida de volta ao piso.'
    ],
    checkpoints: [
      'Pegada neutra nas laterais alinhada com o centro de gravidade.',
      'Distribuição perfeita de carga entre quadríceps e cadeia posterior.',
      'Tensão lombar drasticamente reduzida.'
    ],
    respiracao: 'Inspire no chão com brace; expire ao ficar ereto.',
    erro_comum: 'Ficar muito à frente ou muito atrás do centro da barra, gerando inclinação.',
    beneficio: 'A biomecânica mais segura do levantamento terra para atletas, com o centro de massa alinhado ao corpo em vez de à frente das canelas.'
  },
  145: {
    id: 145,
    slug: 'barra-australiana-inverted-row',
    nome: 'Barra Australiana Invertida (Inverted Row)',
    grupo: 'Costas',
    alvo: 'Romboides, Trapézio Médio e Grande Dorsal',
    sinergistas: 'Bíceps, Deltoide Posterior e Core',
    equipamento: 'Barra no Smith / Fita de Suspensão TRX',
    posicao_inicial: 'Posicione a barra na altura da cintura. Deite sob a barra, segure com pegada pronada aberta, apoie os calcanhares no chão e mantenha o corpo em prancha rígida.',
    concentrica: 'Puxe o peito em direção à barra até encostar, unindo as escápulas com vigor.',
    excentrica: 'Desça o corpo em 2 a 3 segundos até a extensão completa dos braços.',
    passos: [
      'Segure a barra com braços estendidos e corpo em linha reta suspensa.',
      'Trave os glúteos e o core.',
      'Puxe o peito contra a barra conduzindo os cotovelos para trás.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Corpo como uma tábua rígida', 'Peito toca na barra', 'Escápulas se fecham atrás'],
    respiracao: 'Inspire na descida; expire ao puxar o corpo.',
    erro_comum: 'Deixar o quadril ceder ou impulsionar com a pelve.',
    beneficio: 'Padrão fundamental de calistenia para espessura das costas e saúde dos ombros, ideal para todos os níveis.'
  },
  146: {
    id: 146,
    slug: 'hiperextensao-lombar-45-peso',
    nome: 'Hiperextensão Lombar no Banco 45° com Peso',
    grupo: 'Costas',
    alvo: 'Eretores da Espinha e Cadeia Posterior',
    sinergistas: 'Glúteo Máximo e Isquiotibiais',
    equipamento: 'Banco de Hiperextensão 45° + Anilha ou Halter no Peito',
    posicao_inicial: 'Apoiado no banco 45° com pés travados e anilha segurada firme contra o peito.',
    concentrica: 'Eleve o tronco até alinhar com as pernas, mantendo a contração por 1 segundo.',
    excentrica: 'Desça de forma suave em 3 segundos flexionando o quadril.',
    passos: [
      'Acomode-se no banco 45° e segure a anilha no peito.',
      'Desça o tronco em direção ao chão controlando o peso.',
      'Suba estendendo a coluna e quadril até formar uma linha reta.',
      'Mantenha 1 segundo no topo sem hiperestender.'
    ],
    checkpoints: ['Anilha colada no peito', 'Subida alinhada sem arco excessivo', 'Cadência de 3 segundos'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Usar carga pesada demais e quicar o tronco na subida.',
    beneficio: 'Sobrecarga progressiva para os eretores espinhais para suportar cargas brutas de agachamento e levantamento terra.'
  }
};
