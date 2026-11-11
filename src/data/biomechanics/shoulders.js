/**
 * Biomecânica de Ombros e Trapézio — 38 Exercícios (IDs 27-40, 147-170)
 * Deltoide Anterior, Lateral, Posterior, Manguito Rotador e Trapézio.
 */

export const SHOULDERS_BIOMECHANICS = {
  27: {
    id: 27,
    slug: 'desenvolvimento-militar',
    nome: 'Desenvolvimento Militar',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Médio (Cabeça Clavicular e Acromial)',
    sinergistas: 'Tríceps Braquial, Trapézio Superior e Serrátil Anterior',
    equipamento: 'Barra Olímpica em Pé (Overhead Press)',
    posicao_inicial: 'Em pé com pés na largura dos ombros, glúteos e abdômen contraídos em contração rígida. Segure a barra na altura das clavículas com pegada pronada ligeiramente além dos ombros, antebraços estritamente verticais sob a barra.',
    concentrica: 'Empurre a barra verticalmente para cima inclinando levemente a cabeça para trás na passagem do queixo e, assim que a barra passar a testa, traga a cabeça para a frente alinhando a barra diretamente sobre a linha da coluna e calcanhares.',
    excentrica: 'Desça a barra em 2 a 3 segundos de volta às clavículas mantendo os cotovelos apontados para a frente no plano escapular (não abertos a 90°).',
    passos: [
      'Retire a barra do suporte na altura do peito e dê um passo firme para trás.',
      'Aperte os glúteos e trave o core em bloco sólido.',
      'Empurre a barra em linha vertical estendendo os braços sobre a cabeça.',
      'Desça com controle até tocar suavemente a parte superior do tórax.'
    ],
    checkpoints: [
      'Glúteos e abdômen contraídos para impedir hiperlordose lombar.',
      'Cotovelos posicionados ligeiramente à frente da barra (plano escapular).',
      'Finalização com os braços alinhados sobre as orelhas.'
    ],
    respiracao: 'Inspire e faça brace antes de empurrar; expire ao bloquear os braços no topo; inspire na descida.',
    erro_comum: 'Inclinar as costas excessivamente para trás transformando o desenvolvimento em um supino inclinado em pé, o que causa grande compressão lombar.',
    beneficio: 'O exercício padrão ouro de empurrar vertical, construindo ombros blindados, estabilidade no core e força funcional integrada de todo o corpo.'
  },
  28: {
    id: 28,
    slug: 'desenvolvimento-com-halteres',
    nome: 'Desenvolvimento com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Médio',
    sinergistas: 'Tríceps Braquial e Trapézio',
    equipamento: 'Banco a 75°-80° + Halteres',
    posicao_inicial: 'Sentado com as costas coladas no encosto inclinado a cerca de 75°-80° (quase reto). Halteres na altura das orelhas com pegada semi-pronada e cotovelos posicionados a cerca de 60° no plano escapular.',
    concentrica: 'Pressione os halteres para cima em trajetória convergente suave até a extensão quase completa dos braços, sem encostar as anilhas no topo.',
    excentrica: 'Desça em 2 a 3 segundos controlados até a altura do queixo/orelhas, mantendo os antebraços verticais.',
    passos: [
      'Suba os halteres até a linha dos ombros usando os joelhos como suporte.',
      'Apoie as costas e mantenha o peito aberto.',
      'Empurre os halteres para cima convergindo levemente no topo.',
      'Desça de maneira compassada até a altura do queixo.'
    ],
    checkpoints: [
      'Cotovelos a cerca de 60° no plano escapular (nunca totalmente abertos a 90° em cruz).',
      'Costas coladas no encosto sem descolar a lombar.',
      'Descida até o nível do queixo para amplitude completa.'
    ],
    respiracao: 'Inspire na descida; expire com força empurrando os halteres para o teto.',
    erro_comum: 'Bater os halteres com força no topo da repetição, o que gera choque articular e dissipa a tensão muscular.',
    beneficio: 'Garante amplitude completa e movimento livre para a articulação do ombro, permitindo corrigir assimetrias de força entre os membros.'
  },
  29: {
    id: 29,
    slug: 'desenvolvimento-na-maquina',
    nome: 'Desenvolvimento na Máquina',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Médio',
    sinergistas: 'Tríceps Braquial',
    equipamento: 'Máquina Shoulder Press Sentado',
    posicao_inicial: 'Sentado com as costas coladas no encosto. Ajuste a altura do assento para que as manoplas fiquem na linha do queixo/ombros.',
    concentrica: 'Empurre as manoplas para cima estendendo os braços de acordo com a trajetória fixa da máquina.',
    excentrica: 'Retorne em 3 segundos controlados até o nível das orelhas sem deixar o peso bater nos apoios.',
    passos: [
      'Regule o banco para que as manoplas fiquem no nível dos ombros.',
      'Apoie os pés e mantenha a coluna alinhada.',
      'Empurre com força focada nos ombros até o topo.',
      'Desça com calma mantendo a musculatura sob tensão.'
    ],
    checkpoints: ['Costas coladas no banco', 'Pés plantados', 'Não travar bruscamente os cotovelos no topo'],
    respiracao: 'Inspire ao descer; expire empurrando.',
    erro_comum: 'Projetar a cabeça para a frente ao aplicar força.',
    beneficio: 'Permite levar o deltoide à fadiga extrema e falha muscular concêntrica com máxima segurança e suporte lombar.'
  },
  30: {
    id: 30,
    slug: 'elevacao-lateral-halteres',
    nome: 'Elevação Lateral com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral (Porção Acromial - Efeito V e Ombros Largos)',
    sinergistas: 'Deltoide Anterior, Supraespinhal e Trapézio Superior',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com pés na largura do quadril, joelhos levemente destravados. Incline o tronco 5°-10° para a frente. Halteres segurados lateralmente ao corpo com os cotovelos ligeiramente flexionados (10°-15° fixos).',
    concentrica: 'Eleve os braços lateralmente no plano escapular (cerca de 15°-30° à frente da linha do corpo) até a altura dos ombros, conduzindo o movimento com os cotovelos e mantendo as mãos niveladas com os antebraços.',
    excentrica: 'Desça os halteres em 2 a 3 segundos controlados parando antes que eles encostem nas coxas para manter a tensão mecânica constante.',
    passos: [
      'Incline o tronco levemente para a frente e destrave os joelhos.',
      'Eleve os halteres pelos cotovelos até a linha dos ombros.',
      'Sustente 1 segundo no topo com controle postural.',
      'Desça devagar freando a descida, sem encostar nas coxas.'
    ],
    checkpoints: [
      'Elevar no plano escapular (braços ligeiramente à frente e não na linha reta do corpo).',
      'Cotovelos lideram a subida (mão não deve ficar mais alta que o cotovelo).',
      'Não usar impulso das pernas ou gangorra com o tronco.'
    ],
    respiracao: 'Solte o ar enquanto eleva os braços; puxe o ar descendo devagar.',
    erro_comum: 'Jogar o tronco para trás e usar impulso do quadril para erguer peso pesado demais, ativando quase só o trapézio em vez do deltoide lateral.',
    beneficio: 'O exercício mais eficiente para criar largura e formato de ombros volumosos e esféricos (3D shoulders).'
  },
  31: {
    id: 31,
    slug: 'elevacao-lateral-polia',
    nome: 'Elevação Lateral na Polia',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral (Tensão Contínua desde a Base)',
    sinergistas: 'Supraespinhal e Trapézio Superior',
    equipamento: 'Polia Baixa + Pegador Simples ou Tornozeleira no Punho',
    posicao_inicial: 'Em pé de lado para a polia baixa. Passe o cabo por trás do corpo ou pela frente e segure com a mão externa. Tronco firme com leve inclinação lateral.',
    concentrica: 'Eleve o braço lateralmente até a altura do ombro, sentindo a resistência constante do cabo desde o primeiro centímetro.',
    excentrica: 'Desça o braço em 3 segundos controlando a tração do cabo.',
    passos: [
      'Posicione a polia no ponto mais baixo e fique de lado.',
      'Segure o cabo com o braço oposto e cotovelo destravado.',
      'Eleve o braço até a linha paralela com o chão.',
      'Retorne suavemente sentindo a resistência do cabo em todo o percurso.'
    ],
    checkpoints: [
      'Cabo proporciona tensão mesmo na posição inicial (diferente dos halteres).',
      'Subir até a linha do ombro (90°).',
      'Manter o tronco imóvel.'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Girar o tronco para o lado do cabo para puxar com o corpo.',
    beneficio: 'Mantém torque mecânico constante mesmo no início do movimento, onde os halteres livres têm tensão quase nula pela gravidade.'
  },
  32: {
    id: 32,
    slug: 'elevacao-frontal-halteres',
    nome: 'Elevação Frontal com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior (Parte Frontal do Ombro)',
    sinergistas: 'Peitoral Superior (Clavicular) e Trapézio',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com postura ereta, segurando os halteres na frente das coxas com pegada pronada ou neutra.',
    concentrica: 'Eleve os halteres à frente do corpo com cotovelos quase retos até a altura dos olhos.',
    excentrica: 'Desça em 2 a 3 segundos de volta à frente das coxas.',
    passos: [
      'Fique ereto com os halteres à frente.',
      'Suba os braços em linha reta até a altura da visão.',
      'Segure 1 segundo no topo.',
      'Desça com controle sem despencar.'
    ],
    checkpoints: ['Subir até a linha dos olhos', 'Tronco firme sem balanço', 'Cotovelos levemente destravados'],
    respiracao: 'Expire ao subir; inspire ao descer.',
    erro_comum: 'Jogar as costas para trás no início da subida.',
    beneficio: 'Isola a flexão de ombro gerando desenvolvimento estético na porção anterior do deltoide.'
  },
  33: {
    id: 33,
    slug: 'elevacao-frontal-polia',
    nome: 'Elevação Frontal na Polia',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior',
    sinergistas: 'Peitoral Superior',
    equipamento: 'Polia Baixa + Barra Reta ou Corda',
    posicao_inicial: 'De costas para a polia baixa, segurando a corda ou barra que passa entre as pernas com os braços estendidos.',
    concentrica: 'Eleve os braços à frente até a linha dos olhos contraindo a frente do ombro.',
    excentrica: 'Desça em 3 segundos sentindo o cabo puxar os braços para baixo.',
    passos: [
      'Fique de costas para a polia com o cabo entre as pernas.',
      'Suba as mãos à frente até o nível dos olhos.',
      'Mantenha a contração por 1 segundo.',
      'Desça devagar resistindo à tensão.'
    ],
    checkpoints: ['Cabo entre as pernas', 'Tronco reto', 'Tensão contínua do cabo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Inclinar o corpo para trás para levantar a carga.',
    beneficio: 'Resistência uniforme do início ao fim do arco de flexão de ombro.'
  },
  34: {
    id: 34,
    slug: 'crucifixo-invertido-halteres',
    nome: 'Crucifixo Invertido com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior (Parte de Trás do Ombro)',
    sinergistas: 'Romboides, Trapézio Médio e Redondo Menor',
    equipamento: 'Par de Halteres Leves',
    posicao_inicial: 'Incline o tronco para a frente até ficar quase paralelo ao chão, com joelhos destravados e coluna reta. Halteres pendem sob o peito com cotovelos ligeiramente flexionados.',
    concentrica: 'Abra os braços para os lados e para trás em arco horizontal amplo, conduzindo o movimento com a parte de trás dos ombros até a linha do tronco.',
    excentrica: 'Desça os halteres em 2 a 3 segundos de volta ao centro sem encostá-los.',
    passos: [
      'Incline o tronco com coluna plana como em uma remada.',
      'Segure halteres leves com cotovelos destravados.',
      'Abra os braços lateralmente focando na contração do deltoide posterior.',
      'Desça suavemente até a posição inicial.'
    ],
    checkpoints: [
      'Tronco bem inclinado (se ficar de pé o exercício vira elevação lateral).',
      'Foco em afastar as mãos para os lados e não apenas puxar para trás com as costas.',
      'Cargas moderadas para não recrutar apenas trapézio e romboides.'
    ],
    respiracao: 'Inspire ao descer; expire abrindo os braços.',
    erro_comum: 'Usar halteres pesados demais e dobrar os braços como se fosse uma remada curvada.',
    beneficio: 'Essencial para a saúde e equilíbrio biomecânico do ombro, combatendo a postura de ombros caídos para a frente (protração escapular).'
  },
  35: {
    id: 35,
    slug: 'crucifixo-invertido-maquina',
    nome: 'Crucifixo Invertido na Máquina',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior e Romboides',
    sinergistas: 'Trapézio Médio e Infraespinhal',
    equipamento: 'Máquina Peck Deck Invertido (Rear Delt Fly)',
    posicao_inicial: 'Sentado de frente para o encosto do aparelho com o peito apoiado. Ajuste os braços da máquina para ficarem na frente. Segure as manoplas na altura dos ombros.',
    concentrica: 'Empurre as manoplas para trás abrindo os braços até ficarem alinhados com o tronco, contraindo a parte posterior dos ombros.',
    excentrica: 'Retorne em 3 segundos com velocidade controlada antes dos pesos tocarem.',
    passos: [
      'Ajuste o banco para que as mãos fiquem na linha dos ombros.',
      'Apoie o peito no encosto e segure com pegada pronada ou neutra.',
      'Abra os braços lateralmente para trás em arco.',
      'Sustente 1 segundo no pico e retorne devagar.'
    ],
    checkpoints: ['Peito colado no apoio', 'Cotovelos levemente destravados e firmes', 'Mãos no nível dos ombros'],
    respiracao: 'Inspire voltando; expire abrindo.',
    erro_comum: 'Projetar a cabeça para a frente ou dar trancos com o corpo.',
    beneficio: 'Isolamento perfeito do deltoide posterior com estabilidade mecânica incomparável.'
  },
  36: {
    id: 36,
    slug: 'crucifixo-invertido-polia',
    nome: 'Crucifixo Invertido na Polia',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior',
    sinergistas: 'Trapézio Médio e Romboides',
    equipamento: 'Estação Crossover com Polias Altas ou Médias sem Pegadores (Segurando os Cabos)',
    posicao_inicial: 'Em pé no centro das polias altas. Cruze as mãos pegando o cabo direito com a mão esquerda e o cabo esquerdo com a mão direita, braços cruzados na frente do rosto.',
    concentrica: 'Abra os braços lateralmente e para trás em arco horizontal puxando os cabos até a linha dos ombros.',
    excentrica: 'Retorne cruzando os braços à frente em 3 segundos controlados.',
    passos: [
      'Cruze as mãos segurando as bolinhas dos cabos no crossover alto.',
      'Dê um passo atrás e mantenha a postura ereta.',
      'Abra os braços para fora e para trás até abrir o peito.',
      'Volte de forma suave sentindo a tensão do cabo.'
    ],
    checkpoints: ['Braços abrem na horizontal', 'Tronco estável', 'Foco no posterior do ombro'],
    respiracao: 'Inspire fechando; expire abrindo.',
    erro_comum: 'Puxar os cotovelos para baixo transformando em pulldown.',
    beneficio: 'Linha de força perfeita que cruza o plano da articulação gleno-umeral, maximizando a ativação do feixe posterior.'
  },
  37: {
    id: 37,
    slug: 'face-pull',
    nome: 'Face Pull',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior, Manguito Rotador (Infraespinhal e Redondo Menor) e Trapézio Médio',
    sinergistas: 'Romboides e Trapézio Superior',
    equipamento: 'Polia Alta + Corda',
    posicao_inicial: 'Polia ajustada na altura dos olhos ou topo da cabeça. Segure a corda com pegada neutra ou polegares apontados para trás. Dê dois passos para trás e estabilize a base com um pé à frente.',
    concentrica: 'Puxe a corda em direção à testa/nariz, abrindo as pontas da corda para fora e realizando uma rotação externa dos ombros (mãos terminam ao lado das orelhas com cotovelos altos).',
    excentrica: 'Retorne à posição inicial em 3 segundos estendendo os braços com controle absoluto.',
    passos: [
      'Segure a corda na altura dos olhos e afaste-se da polia.',
      'Puxe a corda em direção ao nariz, separando as mãos.',
      'Faça a rotação externa dos ombros trazendo as mãos ao lado da cabeça.',
      'Aperte as costas e a parte de trás dos ombros por 1 segundo e retorne suavemente.'
    ],
    checkpoints: [
      'Cotovelos altos e mãos terminam na linha das orelhas.',
      'Rotação externa completa no final (polegares apontam para trás).',
      'Tronco firme sem inclinar para trás.'
    ],
    respiracao: 'Inspire ao estender os braços; expire na puxada contraindo os ombros e manguito.',
    erro_comum: 'Puxar para a linha do peito como se fosse uma remada baixa, perdendo a rotação externa do manguito.',
    beneficio: 'O exercício de ouro para reabilitação e blindagem articular dos ombros, corrigindo assimetrias posturais de quem treina muito supino.'
  },
  38: {
    id: 38,
    slug: 'remada-alta',
    nome: 'Remada Alta',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral e Trapézio Superior',
    sinergistas: 'Deltoide Anterior, Bíceps e Braquial',
    equipamento: 'Barra W / Barra Reta / Polia',
    posicao_inicial: 'Em pé com pés na largura dos ombros. Segure a barra na frente das coxas com pegada moderada (cerca da largura dos ombros, evitando pegada muito fechada).',
    concentrica: 'Puxe a barra verticalmente rente ao corpo conduzindo o movimento com os cotovelos até a linha média do peitoral.',
    excentrica: 'Desça a barra em 2 a 3 segundos de volta à frente das coxas.',
    passos: [
      'Segure a barra com pegada na largura dos ombros.',
      'Puxe para cima guiando com os cotovelos altos.',
      'Suba até a linha do peito (sem passar da linha dos ombros para proteger o manguito).',
      'Desça de maneira compassada.'
    ],
    checkpoints: [
      'Pegada média (evite mãos coladas para não causar impacto subacromial).',
      'Cotovelos sobem mais altos que a barra.',
      'Parar na linha do peitoral médio.'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Puxar com pegada estreita até o queixo, esmagando os tendões do supraespinhal contra o acrômio.',
    beneficio: 'Constrói grande espessura no trapézio superior e largura nos deltoides laterais.'
  },
  39: {
    id: 39,
    slug: 'encolhimento-com-barra',
    nome: 'Encolhimento com Barra',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior',
    sinergistas: 'Levantador da Escápula e Antebraços',
    equipamento: 'Barra Olímpica + Anilhas',
    posicao_inicial: 'Em pé segurando a barra na frente das coxas com pegada pronada na largura dos ombros. Coluna ereta e braços totalmente estendidos.',
    concentrica: 'Eleve os ombros diretamente para cima em direção às orelhas em linha vertical pura, sustentando 1 a 2 segundos no ponto de contração máxima.',
    excentrica: 'Desça os ombros em 2 a 3 segundos de volta à posição neutra permitindo o alongamento do trapézio.',
    passos: [
      'Segure a barra em pé com peito estufado e postura alinhada.',
      'Eleve os ombros reto para cima como se dissesse "não sei".',
      'Aperte o trapézio no topo por 1 a 2 segundos.',
      'Desça com calma até o alongamento completo.'
    ],
    checkpoints: [
      'Movimento estritamente vertical para cima e para baixo (NUNCA rolar os ombros).',
      'Braços permanecem totalmente estendidos sem flexionar cotovelos.',
      'Pausa de contração isométrica no topo.'
    ],
    respiracao: 'Inspire na descida; expire com força ao elevar os ombros.',
    erro_comum: 'Girar ou rolar os ombros para trás ou para frente com carga pesada, destruindo a cartilagem da articulação acromioclavicular.',
    beneficio: 'Sobrecarga direta para a porção superior do trapézio, construindo o visual imponente de pescoço e ombros fortes.'
  },
  40: {
    id: 40,
    slug: 'encolhimento-com-halteres',
    nome: 'Encolhimento com Halteres',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior',
    sinergistas: 'Levantador da Escápula e Antebraços',
    equipamento: 'Par de Halteres Pesados',
    posicao_inicial: 'Em pé com halteres posicionados nas laterais do corpo com pegada neutra (palmas para dentro). Postura alinhada.',
    concentrica: 'Encolha os ombros verticalmente para cima em direção às orelhas, apertando o topo por 2 segundos.',
    excentrica: 'Desça suavemente em 3 segundos permitindo que o peso alongue os trapézios.',
    passos: [
      'Segure os halteres ao lado das coxas com braços retos.',
      'Suba os ombros em direção às orelhas com força máxima.',
      'Segure 2 segundos no pico espremendo o trapézio.',
      'Desça lentamente sem dobrar os cotovelos.'
    ],
    checkpoints: ['Halteres nas laterais do corpo', 'Elevação vertical sem rotação', 'Braços esticados'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Fletir os cotovelos para ajudar a puxar o peso com os bíceps.',
    beneficio: 'A posição lateral dos halteres alinha perfeitamente a direção das fibras do trapézio sem o atrito da barra contra as coxas.'
  },
  147: {
    id: 147,
    slug: 'desenvolvimento-arnold',
    nome: 'Desenvolvimento Arnold com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Lateral com Rotação',
    sinergistas: 'Tríceps e Trapézio',
    equipamento: 'Banco Reto/75° + Halteres',
    posicao_inicial: 'Sentado segurando os halteres na altura do queixo com as palmas voltadas para você (supinadas), como no final de uma rosca direta.',
    concentrica: 'Empurre os halteres para cima enquanto gira gradualmente os punhos para fora (pronação) até bloquear os braços no topo com as palmas voltadas para a frente.',
    excentrica: 'Desça invertendo a rotação até voltar à posição supinada inicial na frente do queixo.',
    passos: [
      'Inicie com os halteres na frente do peito com palmas para dentro.',
      'Suba abrindo os cotovelos e girando as palmas para a frente.',
      'Finalize acima da cabeça com pegada pronada.',
      'Retorne girando de volta até a posição inicial.'
    ],
    checkpoints: ['Rotação suave e fluida durante o movimento', 'Costas apoiadas no encosto', 'Sem pressa na descida'],
    respiracao: 'Inspire descendo e girando para dentro; expire subindo e girando para fora.',
    erro_comum: 'Fazer a rotação antes de começar a empurrar, perdendo a mecânica contínua criada por Arnold Schwarzenegger.',
    beneficio: 'Trabalha os três feixes do deltoide em uma única repetição através da combinação de flexão, abdução e rotação.'
  },
  148: {
    id: 148,
    slug: 'desenvolvimento-smith',
    nome: 'Desenvolvimento no Smith',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Médio',
    sinergistas: 'Tríceps e Trapézio',
    equipamento: 'Smith Machine + Banco 75°',
    posicao_inicial: 'Banco posicionado sob a barra do Smith. Sente-se com as costas coladas e a barra descendo na frente do nariz/queixo.',
    concentrica: 'Destrave a barra e empurre verticalmente até a extensão dos braços.',
    excentrica: 'Desça em 2 a 3 segundos até a altura do queixo/clavícula.',
    passos: [
      'Ajuste o banco no Smith para a barra descer rente à frente do rosto.',
      'Destrave a barra com os punhos retos.',
      'Empurre acelerando nos trilhos.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Barra passa na frente do queixo', 'Sem hiperlordose lombar', 'Trava de segurança ajustada'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Deixar a barra descer atrás da nuca sem ter flexibilidade para isso.',
    beneficio: 'Permite treinar o desenvolvimento pesado com foco na sobrecarga sem necessidade de estabilização do peso.'
  },
  149: {
    id: 149,
    slug: 'push-press-barra',
    nome: 'Push Press com Barra',
    grupo: 'Ombros',
    alvo: 'Deltoides, Tríceps e Potência Corporal Integrada',
    sinergistas: 'Quadríceps, Glúteos e Core',
    equipamento: 'Barra Olímpica em Pé',
    posicao_inicial: 'Barra apoiada nos ombros. Pés na largura do quadril, coluna neutra.',
    concentrica: 'Faça uma flexão rápida e curta de joelhos (cerca de 10-15cm de dip) e exploda estendendo as pernas, transferindo o impulso para empurrar a barra vigorosamente sobre a cabeça.',
    excentrica: 'Abaixe a barra de forma controlada amortecendo com leve flexão de joelhos na volta.',
    passos: [
      'Acomode a barra sobre as clavículas em pé.',
      'Faça um dip rápido com os joelhos mantendo o tronco vertical.',
      'Exploda as pernas e empurre a barra para o alto.',
      'Bloqueie os braços no topo e desça com controle amortecendo.'
    ],
    checkpoints: ['Dip curto e vertical (não incline o tronco para a frente)', 'Extensão explosiva de pernas', 'Finalização sólida no topo'],
    respiracao: 'Inspire no dip; expire com explosão ao empurrar no topo.',
    erro_comum: 'Agachar demais no dip perdendo a velocidade e elasticidade do movimento.',
    beneficio: 'Exercício olímpico que desenvolve transferência de potência da cadeia inferior para os membros superiores.'
  },
  150: {
    id: 150,
    slug: 'desenvolvimento-unilateral-em-pe-halter',
    nome: 'Desenvolvimento Unilateral em Pé com Halter',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior/Médio e Core Anti-Flexão Lateral',
    sinergistas: 'Tríceps e Oblíquos',
    equipamento: '1 Halter',
    posicao_inicial: 'Em pé com base firme, segurando um halter na altura do ombro com a outra mão livre na cintura ou ao lado.',
    concentrica: 'Empurre o halter verticalmente mantendo o tronco completamente reto sem inclinar para os lados.',
    excentrica: 'Desça o halter em 3 segundos controlados até o ombro.',
    passos: [
      'Fique ereto com o halter no ombro.',
      'Trave o abdômen para resistir à inclinação lateral.',
      'Empurre o peso em linha reta.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Tronco 100% vertical', 'Zero inclinação lateral', 'Braço sobe alinhado à orelha'],
    respiracao: 'Inspire na descida; expire empurrando.',
    erro_comum: 'Inclinar o tronco para o lado oposto ao peso para facilitar a alavanca.',
    beneficio: 'Combina desenvolvimento do deltoide com ativação intensa do core para estabilidade anti-lateral.'
  },
  151: {
    id: 151,
    slug: 'elevacao-lateral-banco-inclinado',
    nome: 'Elevação Lateral no Banco Inclinado',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral (Hipertrofia no Alongamento)',
    sinergistas: 'Supraespinhal',
    equipamento: 'Banco Inclinado (60°-75°) + Halteres',
    posicao_inicial: 'Sentado com as costas coladas no banco inclinado a 60°-75°. Halteres pendendo ao lado.',
    concentrica: 'Eleve os halteres lateralmente até a altura dos ombros.',
    excentrica: 'Desça em 3 segundos mantendo a tensão contínua.',
    passos: [
      'Apoie as costas no encosto inclinado.',
      'Suba os halteres lateralmente pelos cotovelos.',
      'Segure 1 segundo no topo.',
      'Desça suavemente até a lateral do banco.'
    ],
    checkpoints: ['Costas coladas no encosto eliminando impulsos', 'Cotovelos destravados', 'Subida controlada'],
    respiracao: 'Expire na subida; inspire na descida.',
    erro_comum: 'Descolar as costas do encosto para usar impulso.',
    beneficio: 'Anula qualquer possibilidade de trapaça corporal, forçando o deltoide lateral a trabalhar em isolamento estrito.'
  },
  152: {
    id: 152,
    slug: 'elevacao-lateral-deitado-lado',
    nome: 'Elevação Lateral Deitado de Lado no Banco',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral (Início da Curva de Força)',
    sinergistas: 'Supraespinhal',
    equipamento: 'Banco Inclinado 30°-45° + 1 Halter',
    posicao_inicial: 'Deitado de lado no banco inclinado segurando o halter com a mão superior estendida para baixo.',
    concentrica: 'Eleve o halter lateralmente até a vertical.',
    excentrica: 'Desça em 3 segundos sentindo o deltoide lateral sob tensão máxima no fundo.',
    passos: [
      'Deite de lado no banco inclinado.',
      'Segure o halter com o braço estendido ao longo do corpo.',
      'Suba o peso em arco lateral até a altura da linha do ombro.',
      'Desça devagar controlando o retorno.'
    ],
    checkpoints: ['Corpo deitado de lado', 'Tensão máxima no terço inicial da subida', 'Controle excêntrico'],
    respiracao: 'Expire subindo; inspire descendo.',
    erro_comum: 'Girar o tronco para trás virando o exercício em elevação frontal.',
    beneficio: 'Altera o ângulo gravitacional fazendo com que a máxima sobrecarga ocorra exatamente onde o músculo está alongado.'
  },
  153: {
    id: 153,
    slug: 'elevacao-lateral-polia-por-tras',
    nome: 'Elevação Lateral Unilateral na Polia por Trás',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral',
    sinergistas: 'Supraespinhal',
    equipamento: 'Polia Baixa + Cabo por Trás das Costas',
    posicao_inicial: 'Em pé de costas para a polia, cabo passando por trás do quadril segurado com a mão oposta.',
    concentrica: 'Eleve o braço lateralmente até a altura do ombro.',
    excentrica: 'Retorne em 3 segundos com tração constante do cabo.',
    passos: [
      'Passe o cabo por trás do corpo.',
      'Eleve o braço lateralmente no plano escapular.',
      'Segure 1 segundo no topo.',
      'Desça com cadência suave.'
    ],
    checkpoints: ['Cabo por trás sem atrito na roupa', 'Subir até 90°', 'Tronco reto'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Puxar o cabo para a frente em vez de para o lado.',
    beneficio: 'O alinhamento por trás permite excelente pré-alongamento do deltoide lateral na posição de descanso.'
  },
  154: {
    id: 154,
    slug: 'elevacao-lateral-maquina-articulada',
    nome: 'Elevação Lateral na Máquina Articulada',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral',
    sinergistas: 'Trapézio Superior',
    equipamento: 'Máquina Lateral Raise Sentado',
    posicao_inicial: 'Sentado com o peito alinhado e cotovelos apoiados nas almofadas laterais da máquina.',
    concentrica: 'Eleve as almofadas empurrando com os cotovelos até a linha dos ombros.',
    excentrica: 'Desça em 3 segundos controlados sem deixar o peso bater.',
    passos: [
      'Ajuste o assento para que o eixo da máquina coincida com a articulação do ombro.',
      'Apoie os cotovelos nas almofadas.',
      'Empurre para cima com a força dos cotovelos.',
      'Retorne devagar.'
    ],
    checkpoints: ['Força exercida pelos cotovelos e não pelas mãos', 'Eixo da máquina alinhado ao ombro', 'Pés apoiados'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Segurar os pegadores com força excessiva contraindo os antebraços e trapézios.',
    beneficio: 'Elimina a participação dos antebraços e pegada, direcionando 100% da tensão mecânica para o deltoide lateral.'
  },
  155: {
    id: 155,
    slug: 'elevacao-frontal-barra-reta',
    nome: 'Elevação Frontal com Barra Reta',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Peitoral Superior',
    sinergistas: 'Trapézio e Serrátil',
    equipamento: 'Barra Reta / Barra W',
    posicao_inicial: 'Em pé segurando a barra na frente das coxas com pegada pronada na largura dos ombros.',
    concentrica: 'Eleve a barra à frente com braços quase retos até o nível dos olhos.',
    excentrica: 'Desça em 2 a 3 segundos até a frente das coxas.',
    passos: [
      'Segure a barra com postura firme.',
      'Suba a barra à frente até a altura dos olhos.',
      'Sustente 1 segundo.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Braços paralelos', 'Coluna firme sem balanço', 'Descida lenta'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Jogar o corpo para trás para levantar a barra com impulso.',
    beneficio: 'Permite sobrecarga progressiva bilateral uniforme nos deltoides anteriores.'
  },
  156: {
    id: 156,
    slug: 'elevacao-frontal-anilha-plate-raise',
    nome: 'Elevação Frontal com Anilha (Plate Raise)',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior e Serrátil Anterior',
    sinergistas: 'Peitoral Superior',
    equipamento: '1 Anilha de 10kg a 20kg',
    posicao_inicial: 'Em pé segurando uma anilha pelas laterais (posição "9h e 15h no relógio") na frente do quadril.',
    concentrica: 'Eleve a anilha à frente até a linha dos olhos ou ligeiramente acima, estufando o peito.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Segure a anilha firmemente nas laterais.',
      'Eleve a anilha à frente até o campo de visão.',
      'Aperte os ombros no topo.',
      'Retorne devagar sem bater nas coxas.'
    ],
    checkpoints: ['Mãos nas laterais da anilha', 'Tronco imóvel', 'Subida suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar o tronco para cima e para baixo.',
    beneficio: 'A pegada neutra na anilha recruta ativamente o serrátil anterior e estabiliza a cintura escapular.'
  },
  157: {
    id: 157,
    slug: 'elevacao-frontal-alternada-halteres',
    nome: 'Elevação Frontal Alternada com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior',
    sinergistas: 'Trapézio e Peitoral Superior',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com um halter em cada mão na frente das coxas com pegada neutra ou pronada.',
    concentrica: 'Eleve um braço à frente até a altura dos olhos enquanto o outro permanece imóvel.',
    excentrica: 'Desça com controle e repita imediatamente com o braço oposto.',
    passos: [
      'Suba o braço direito até a altura dos olhos.',
      'Desça de forma compassada.',
      'Suba o braço esquerdo mantendo o ritmo alternado.',
      'Mantenha a coluna perfeitamente alinhada.'
    ],
    checkpoints: ['Subir um braço por vez com controle', 'Sem torcer o tronco', 'Pausa no topo'],
    respiracao: 'Expire na subida; inspire na descida de cada membro.',
    erro_comum: 'Girar os ombros de lado a lado acompanhando o braço que sobe.',
    beneficio: 'Permite maior concentração mental em cada deltoide individualmente.'
  },
  158: {
    id: 158,
    slug: 'elevacao-frontal-corda-polia-baixa',
    nome: 'Elevação Frontal com Corda na Polia Baixa',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior',
    sinergistas: 'Serrátil Anterior',
    equipamento: 'Polia Baixa + Corda entre as Pernas',
    posicao_inicial: 'De costas para a máquina com o cabo passando entre as pernas segurando as pontas da corda.',
    concentrica: 'Eleve a corda à frente até a linha dos olhos afastando levemente as mãos no topo.',
    excentrica: 'Desça em 3 segundos controlando a resistência contínua.',
    passos: [
      'Segure as pontas da corda de costas para a polia.',
      'Suba os braços estendidos até a linha dos olhos.',
      'Abra ligeiramente a corda no ponto mais alto.',
      'Desça resistindo à tração do cabo.'
    ],
    checkpoints: ['Cabo entre as pernas', 'Afastamento sutil das mãos no topo', 'Sem balanço'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Flexionar os cotovelos puxando como bíceps.',
    beneficio: 'Tensão constante em todo o arco de flexão de ombro sem pontos mortos de gravidade.'
  },
  159: {
    id: 159,
    slug: 'elevacao-y-raise-banco-inclinado',
    nome: 'Elevação Y no Banco Inclinado (Y-Raise)',
    grupo: 'Ombros',
    alvo: 'Trapézio Inferior e Deltoide Posterior/Lateral',
    sinergistas: 'Serrátil Anterior',
    equipamento: 'Banco Inclinado (30°-45°) + Halteres Leves',
    posicao_inicial: 'Deitado de bruços no banco inclinado segurando halteres leves com braços apontados para baixo.',
    concentrica: 'Eleve os braços em diagonal formando a letra "Y" com o corpo, polegares apontados para o teto.',
    excentrica: 'Desça em 3 segundos até a posição vertical.',
    passos: [
      'Deite de bruços no banco inclinado.',
      'Segure halteres leves com polegares apontando para cima.',
      'Eleve os braços em ângulo de 45° formando um "Y".',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Braços em formato de "Y" (45°)', 'Polegares apontam para o teto', 'Peito apoiado no banco'],
    respiracao: 'Inspire descendo; expire na subida em Y.',
    erro_comum: 'Usar carga pesada e subir os braços em linha reta ao lado ou à frente.',
    beneficio: 'O exercício número 1 para ativação e fortalecimento do trapézio inferior, peça chave para estabilidade da escápula.'
  },
  160: {
    id: 160,
    slug: 'crucifixo-invertido-banco-inclinado-halteres',
    nome: 'Crucifixo Invertido no Banco Inclinado com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior',
    sinergistas: 'Romboides e Trapézio Médio',
    equipamento: 'Banco Inclinado 30° + Halteres',
    posicao_inicial: 'Deitado de bruços no banco com queixo acima da borda, halteres sob o peito.',
    concentrica: 'Abra os braços lateralmente em arco com cotovelos levemente dobrados até a linha dos ombros.',
    excentrica: 'Desça em 3 segundos controlados sem deixar os halteres colidirem.',
    passos: [
      'Apoie o peito no encosto inclinado.',
      'Abra os braços para os lados focando na parte traseira dos ombros.',
      'Segure 1 segundo no topo.',
      'Retorne devagar.'
    ],
    checkpoints: ['Peito colado no apoio', 'Cotovelos destravados', 'Movimento amplo para os lados'],
    respiracao: 'Inspire descendo; expire abrindo.',
    erro_comum: 'Puxar com as costas e transformar em remada.',
    beneficio: 'Elimina a fadiga lombar e isola com perfeição o deltoide posterior.'
  },
  161: {
    id: 161,
    slug: 'passaro-halteres-em-pe',
    nome: 'Pássaro com Halteres em Pé',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior e Romboides',
    sinergistas: 'Trapézio Médio',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé, incline o tronco para a frente a 60° com coluna neutra e joelhos destravados.',
    concentrica: 'Abra os braços para os lados como as asas de um pássaro até a linha do tronco.',
    excentrica: 'Desça em 2 a 3 segundos com controle.',
    passos: [
      'Incline o tronco com peito erguido.',
      'Abra os braços para os lados pelos cotovelos.',
      'Aperte a parte de trás dos ombros.',
      'Desça com calma.'
    ],
    checkpoints: ['Tronco inclinado estável', 'Movimento amplo lateral', 'Coluna reta'],
    respiracao: 'Inspire descendo; expire abrindo.',
    erro_comum: 'Subir o tronco durante o movimento para roubar.',
    beneficio: 'Variação clássica da era de ouro para densidade no posterior de ombro.'
  },
  162: {
    id: 162,
    slug: 'face-pull-polia-alta-pegada-dupla',
    nome: 'Face Pull na Polia Alta com Pegada Neutra Dupla',
    grupo: 'Ombros',
    alvo: 'Deltoide Posterior e Manguito Rotador',
    sinergistas: 'Trapézio Médio e Romboides',
    equipamento: 'Polia Alta + 2 Cordas Conectadas (Maior Amplitude)',
    posicao_inicial: 'Conecte duas cordas na mesma polia alta para dobrar a amplitude de movimento. Segure cada corda com pegada neutra.',
    concentrica: 'Puxe em direção à cabeça abrindo as mãos amplamente para trás das orelhas, realizando rotação externa máxima.',
    excentrica: 'Estenda os braços em 3 segundos controlados.',
    passos: [
      'Segure as duas cordas e dê dois passos para trás.',
      'Puxe abrindo os braços amplamente para trás da cabeça.',
      'Mãos passam bem atrás das orelhas graças às duas cordas.',
      'Retorne suavemente estendendo os braços.'
    ],
    checkpoints: ['Uso de corda dupla para amplitude ampliada', 'Mãos terminam atrás das orelhas', 'Cotovelos altos'],
    respiracao: 'Inspire na extensão; expire na puxada.',
    erro_comum: 'Deixar os cotovelos caírem para baixo.',
    beneficio: 'A corda dupla elimina a limitação de comprimento da corda simples, permitindo a maior amplitude de rotação externa possível.'
  },
  163: {
    id: 163,
    slug: 'remada-alta-halteres',
    nome: 'Remada Alta com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral e Trapézio',
    sinergistas: 'Bíceps e Braquial',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com halteres à frente das coxas, palmas voltadas para você.',
    concentrica: 'Puxe os halteres para cima rente ao corpo conduzindo pelos cotovelos até a altura do peito.',
    excentrica: 'Desça em 2 a 3 segundos com controle.',
    passos: [
      'Suba os halteres pelos cotovelos altos.',
      'Mantenha os pesos próximos ao tórax.',
      'Pare na linha média do peito.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Cotovelos sobem mais altos que as mãos', 'Sem passar da linha do peito', 'Halteres livres acompanham o corpo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Subir os halteres até o queixo forçando a articulação do ombro.',
    beneficio: 'Os halteres permitem que as mãos se afastem durante a subida, reduzindo o atrito no manguito rotador.'
  },
  164: {
    id: 164,
    slug: 'remada-alta-polia-baixa',
    nome: 'Remada Alta na Polia Baixa',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral e Trapézio Superior',
    sinergistas: 'Braquial e Deltoide Anterior',
    equipamento: 'Polia Baixa + Barra Reta ou Barra W',
    posicao_inicial: 'Em pé de frente para a polia baixa segurando a barra com pegada na largura dos ombros.',
    concentrica: 'Puxe a barra para cima rente ao corpo com cotovelos apontando para o teto até a linha do peito.',
    excentrica: 'Desça em 3 segundos resistindo à tração do cabo.',
    passos: [
      'Segure a barra na polia baixa.',
      'Puxe verticalmente guiando com os cotovelos.',
      'Sustente 1 segundo no peitoral médio.',
      'Retorne controladamente.'
    ],
    checkpoints: ['Tensão constante do cabo', 'Cotovelos altos', 'Parar no peito'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar o corpo para trás para iniciar a puxada.',
    beneficio: 'Proporciona tração contínua e uniforme ao longo de toda a subida.'
  },
  165: {
    id: 165,
    slug: 'rotacao-externa-ombro-polia-manguito',
    nome: 'Rotação Externa de Ombro na Polia (Manguito Rotador)',
    grupo: 'Ombros',
    alvo: 'Manguito Rotador (Infraespinhal e Redondo Menor)',
    sinergistas: 'Deltoide Posterior',
    equipamento: 'Polia na Altura do Cotovelo + Pegador Simples',
    posicao_inicial: 'Em pé de lado para a polia na altura do cotovelo. Segure o pegador com o braço mais distante. Cotovelo flexionado a 90° colado na costela (pode usar uma toalha enrolada entre o cotovelo e o tronco).',
    concentrica: 'Gire o antebraço para fora afastando a mão do abdômen sem descolar o cotovelo da lateral do corpo.',
    excentrica: 'Retorne em 3 segundos controlados até a frente do umbigo.',
    passos: [
      'Regule a polia na altura do umbigo/cotovelo.',
      'Cole o cotovelo a 90° na costela.',
      'Gire o antebraço para fora em arco horizontal.',
      'Retorne devagar sem solavancos.'
    ],
    checkpoints: [
      'Cotovelo colado ao tronco durante 100% da série.',
      'Carga muito leve (foco estritamente na ativação neuromuscular dos rotadores).',
      'Movimento lento e suave.'
    ],
    respiracao: 'Inspire ao retornar ao centro; expire ao girar para fora.',
    erro_comum: 'Usar carga pesada e afastar o cotovelo do corpo, usando o deltoide lateral em vez do manguito.',
    beneficio: 'Exercício médico e preventivo crucial para estabilização da cabeça do úmero na glenoide, prevenindo lesões graves no supino e arremessos.'
  },
  166: {
    id: 166,
    slug: 'rotacao-interna-ombro-polia-manguito',
    nome: 'Rotação Interna de Ombro na Polia (Manguito Rotador)',
    grupo: 'Ombros',
    alvo: 'Subescapular (Músculo Estabilizador Anterior do Manguito)',
    sinergistas: 'Peitoral Maior e Grande Dorsal',
    equipamento: 'Polia na Altura do Cotovelo + Pegador Simples',
    posicao_inicial: 'Em pé de lado para a polia segurando o pegador com o braço mais próximo. Cotovelo a 90° colado ao corpo e antebraço apontando para fora.',
    concentrica: 'Gire o antebraço para dentro em direção ao abdômen mantendo o cotovelo fixo.',
    excentrica: 'Retorne para fora em 3 segundos com velocidade controlada.',
    passos: [
      'Segure o cabo com o braço do lado da polia.',
      'Cole o cotovelo na cintura.',
      'Puxe a mão para dentro em direção ao umbigo.',
      'Retorne devagar mantendo a estabilidade.'
    ],
    checkpoints: ['Cotovelo colado na lateral', 'Carga leve', 'Movimento estritamente rotacional'],
    respiracao: 'Inspire ao abrir; expire ao puxar para o abdômen.',
    erro_comum: 'Usar força do punho ou girar o corpo todo para dentro.',
    beneficio: 'Fortalece o músculo subescapular, estabilizador anterior primordial da articulação do ombro.'
  },
  167: {
    id: 167,
    slug: 'encolhimento-smith',
    nome: 'Encolhimento no Smith',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior',
    sinergistas: 'Levantador da Escápula',
    equipamento: 'Smith Machine',
    posicao_inicial: 'Em pé no Smith segurando a barra na frente das coxas com pegada pronada.',
    concentrica: 'Encolha os ombros em linha reta para cima nos trilhos até o topo, sustentando 2 segundos.',
    excentrica: 'Desça em 3 segundos até o alongamento completo.',
    passos: [
      'Destrave a barra do Smith com postura alinhada.',
      'Suba os ombros reto para cima.',
      'Sustente a contração máxima.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Movimento estritamente vertical', 'Sem dobrar os braços', 'Pausa de 2s no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Girar os ombros no trilho.',
    beneficio: 'Permite sobrecarregar o trapézio com estabilidade linear perfeita.'
  },
  168: {
    id: 168,
    slug: 'encolhimento-polia-baixa',
    nome: 'Encolhimento na Polia Baixa',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior',
    sinergistas: 'Levantador da Escápula',
    equipamento: 'Polia Baixa Dupla ou Barra Reta',
    posicao_inicial: 'Em pé sobre a polia baixa segurando a barra com braços estendidos.',
    concentrica: 'Eleve os ombros verticalmente contra a tração contínua dos cabos.',
    excentrica: 'Desça em 3 segundos permitindo que o cabo puxe os ombros para baixo em alongamento seguro.',
    passos: [
      'Segure a barra na polia baixa.',
      'Suba os ombros em direção às orelhas.',
      'Segure a contração isométrica por 2 segundos.',
      'Retorne devagar sentindo o trapézio esticar.'
    ],
    checkpoints: ['Tensão permanente mesmo no fundo', 'Ombros sobem retos', 'Braços relaxados'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Dobrar os cotovelos.',
    beneficio: 'A resistência do cabo mantém tensão mesmo no ponto de maior alongamento do trapézio.'
  },
  169: {
    id: 169,
    slug: 'encolhimento-barra-por-tras-haney',
    nome: 'Encolhimento com Barra por Trás (Lee Haney Shrug)',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior e Médio',
    sinergistas: 'Romboides',
    equipamento: 'Barra Olímpica ou Smith por Trás do Corpo',
    posicao_inicial: 'Em pé de costas para a barra, segurando-a atrás dos glúteos com pegada pronada na largura dos ombros.',
    concentrica: 'Encolha os ombros para cima e ligeiramente para trás raspando a barra na parte posterior das coxas/glúteos.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Posicione a barra logo atrás dos glúteos.',
      'Segure com pegada pronada e peito aberto.',
      'Eleve os ombros para cima e para trás.',
      'Desça suavemente até a extensão total.'
    ],
    checkpoints: ['Barra posicionada atrás dos glúteos', 'Elevação vertical para cima e para trás', 'Escápulas se aproximam'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Projetar a cabeça para a frente de forma exagerada.',
    beneficio: 'Criado pelo 8x Mr. Olympia Lee Haney, recruta intensamente tanto o trapézio superior quanto a porção média posterior.'
  },
  170: {
    id: 170,
    slug: 'encolhimento-trap-bar-hexagonal',
    nome: 'Encolhimento na Barra Hexagonal Trap Bar',
    grupo: 'Trapézio',
    alvo: 'Trapézio Superior',
    sinergistas: 'Antebraços e Core',
    equipamento: 'Barra Hexagonal (Trap Bar) + Anilhas',
    posicao_inicial: 'Em pé dentro da Trap Bar segurando as manoplas laterais neutras com postura ereta.',
    concentrica: 'Encolha os ombros verticalmente com força explosiva, segurando 2 segundos no topo.',
    excentrica: 'Desça o peso em 3 segundos permitindo o alongamento do trapézio.',
    passos: [
      'Fique no centro da barra hexagonal e segure as manoplas.',
      'Fique em pé com postura perfeita.',
      'Encolha os ombros diretamente para cima.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Pegada neutra nas laterais sem atrito nas pernas', 'Cargas elevadas com segurança', 'Coluna ereta'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Rolar os ombros com a carga pesada.',
    beneficio: 'A biomecânica perfeita para encolhimento: as pegadas laterais neutralizam o atrito da barra contra as pernas e reduzem estresse nos punhos.'
  },

  // =========================================================================
  // EXPANSÃO: NOVOS EXERCÍCIOS (IDS 321-326)
  // =========================================================================
  321: {
    id: 321,
    slug: 'elevacao-lateral-sentado-halteres',
    nome: 'Elevação Lateral Sentado com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral (Médio)',
    sinergistas: 'Trapézio Superior e Supraespinhal',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Sentado com tronco ereto e colado ao encosto, halteres ao lado do corpo com cotovelos levemente flexionados.',
    concentrica: 'Eleve os halteres lateralmente até a linha dos ombros, cotovelos sempre ligeiramente à frente do tronco.',
    excentrica: 'Desça em 2 a 3 segundos resistindo à gravidade até os braços quase tocarem o tronco.',
    passos: [
      'Sente-se com as costas fixas no encosto, eliminando qualquer impulso do tronco.',
      'Segure os halteres ao lado do quadril com pegada neutra.',
      'Eleve os braços lateralmente até a altura dos ombros.',
      'Desça controlado sem deixar o peso cair.'
    ],
    checkpoints: [
      'Tronco preso ao encosto, sem balanço para gerar impulso',
      'Cotovelos levemente flexionados e fixos durante todo o movimento',
      'Elevação até no máximo a linha dos ombros, sem encolher o trapézio'
    ],
    respiracao: 'Expire subindo os halteres; inspire na descida controlada.',
    erro_comum: 'Usar o encosto inclinado para balançar o tronco e gerar impulso com o trapézio em vez do deltoide lateral.',
    beneficio: 'O apoio do banco remove qualquer compensação do tronco, isolando o deltoide lateral com mais pureza do que a versão em pé.'
  },
  322: {
    id: 322,
    slug: 'elevacao-frontal-sentado-halteres',
    nome: 'Elevação Frontal Sentado com Halteres',
    grupo: 'Ombros',
    alvo: 'Deltoide Anterior',
    sinergistas: 'Deltoide Lateral e Porção Clavicular do Peitoral',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Sentado com tronco ereto, halteres apoiados nas coxas com pegada pronada.',
    concentrica: 'Eleve um halter à frente do corpo até a altura dos ombros, mantendo o cotovelo quase estendido.',
    excentrica: 'Desça em 2 a 3 segundos de volta à coxa antes de iniciar o lado oposto.',
    passos: [
      'Sente-se ereto e segure os halteres sobre as coxas.',
      'Eleve um braço à frente até a linha dos ombros.',
      'Desça com controle total até a coxa.',
      'Alterne os lados mantendo o tronco imóvel.'
    ],
    checkpoints: [
      'Tronco imóvel, sem inclinar para trás para ajudar a subida',
      'Trajetória reta à frente do corpo, sem desviar para o lado',
      'Pausa breve no topo sem usar impulso do quadril'
    ],
    respiracao: 'Expire na subida; inspire na descida.',
    erro_comum: 'Inclinar o tronco para trás no banco para ganhar impulso com a lombar.',
    beneficio: 'A posição sentada bloqueia a inércia do quadril, tornando o isolamento do deltoide anterior mais estrito que a versão em pé.'
  },
  324: {
    id: 324,
    slug: 'elevacao-lateral-iron-cross',
    nome: 'Elevação Lateral "Cruz de Ferro" (Iron Cross)',
    grupo: 'Ombros',
    alvo: 'Deltoide Lateral',
    sinergistas: 'Deltoide Anterior e Trapézio Superior',
    equipamento: 'Halteres',
    posicao_inicial: 'Em pé, halteres à frente do corpo com os braços cruzados próximos ao quadril oposto.',
    concentrica: 'Eleve os halteres em arco lateral e diagonal até os braços formarem uma cruz na altura dos ombros.',
    excentrica: 'Desça em 2 a 3 segundos retornando os halteres ao ponto cruzado à frente do quadril.',
    passos: [
      'Em pé, cruze os halteres à frente do quadril.',
      'Eleve os braços em arco amplo até a altura dos ombros.',
      'Finalize com os braços abertos formando uma cruz.',
      'Desça controlado retornando ao ponto cruzado.'
    ],
    checkpoints: [
      'Trajetória em arco diagonal, não puramente lateral',
      'Tronco estável sem balanço para impulsionar a carga',
      'Carga leve priorizando amplitude completa sobre o peso'
    ],
    respiracao: 'Expire na subida; inspire na descida.',
    erro_comum: 'Usar carga pesada demais, encurtando a amplitude e perdendo o cruzamento inicial dos braços.',
    beneficio: 'O ponto de partida cruzado alonga o deltoide lateral sob tensão antes mesmo de iniciar a subida, aumentando o tempo total sob carga.'
  }
};
