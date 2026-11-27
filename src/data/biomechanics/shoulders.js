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
    posicao_inicial: 'Em pé com pés na largura dos ombros, glúteos e abdómen contraídos em contração rígida. Segura a barra na altura das clavículas com pegada pronada ligeiramente além dos ombros, antebraços estritamente verticais sob a barra.',
    concentrica: 'Empurra a barra verticalmente para cima inclinando levemente a cabeça para trás na passagem do queixo e, assim que a barra passar a testa, traz a cabeça para a frente alinhando a barra diretamente sobre a linha da coluna e calcanhares.',
    excentrica: 'Desce a barra em 2 a 3 segundos de volta às clavículas mantendo os cotovelos apontados para a frente no plano escapular (não abertos a 90°).',
    passos: [
      'Retira a barra do suporte na altura do peito e dá um passo firme para trás.',
      'Aperta os glúteos e trava o core em bloco sólido.',
      'Empurra a barra em linha vertical estendendo os braços sobre a cabeça.',
      'Desce com controle até tocar suavemente a parte superior do tórax.'
    ],
    checkpoints: [
      'Glúteos e abdómen contraídos para impedir hiperlordose lombar.',
      'Cotovelos posicionados ligeiramente à frente da barra (plano escapular).',
      'Finalização com os braços alinhados sobre as orelhas.'
    ],
    respiracao: 'Inspira e faz brace antes de empurrar; expira ao bloquear os braços no topo; inspira na descida.',
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
    concentrica: 'Pressiona os halteres para cima em trajetória convergente suave até a extensão quase completa dos braços, sem encostar as anilhas no topo.',
    excentrica: 'Desce em 2 a 3 segundos controlados até a altura do queixo/orelhas, mantendo os antebraços verticais.',
    passos: [
      'Sobe os halteres até a linha dos ombros usando os joelhos como suporte.',
      'Apoia as costas e mantém o peito aberto.',
      'Empurra os halteres para cima convergindo levemente no topo.',
      'Desce de maneira compassada até a altura do queixo.'
    ],
    checkpoints: [
      'Cotovelos a cerca de 60° no plano escapular (nunca totalmente abertos a 90° em cruz).',
      'Costas coladas no encosto sem descolar a lombar.',
      'Descida até o nível do queixo para amplitude completa.'
    ],
    respiracao: 'Inspira na descida; expira com força empurrando os halteres para o teto.',
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
    posicao_inicial: 'Sentado com as costas coladas no encosto. Ajusta a altura do assento para que as manoplas fiquem na linha do queixo/ombros.',
    concentrica: 'Empurra as manoplas para cima estendendo os braços de acordo com a trajetória fixa da máquina.',
    excentrica: 'Regressa em 3 segundos controlados até o nível das orelhas sem deixar o peso bater nos apoios.',
    passos: [
      'Regula o banco para que as manoplas fiquem no nível dos ombros.',
      'Apoia os pés e mantém a coluna alinhada.',
      'Empurra com força focada nos ombros até o topo.',
      'Desce com calma mantendo a musculatura sob tensão.'
    ],
    checkpoints: ['Costas coladas no banco', 'Pés plantados', 'Não travar bruscamente os cotovelos no topo'],
    respiracao: 'Inspira ao descer; expira empurrando.',
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
    posicao_inicial: 'Em pé com pés na largura do quadril, joelhos levemente destravados. Inclina o tronco 5°-10° para a frente. Halteres segurados lateralmente ao corpo com os cotovelos ligeiramente flexionados (10°-15° fixos).',
    concentrica: 'Eleva os braços lateralmente no plano escapular (cerca de 15°-30° à frente da linha do corpo) até a altura dos ombros, conduzindo o movimento com os cotovelos e mantendo as mãos niveladas com os antebraços.',
    excentrica: 'Desce os halteres em 2 a 3 segundos controlados parando antes que eles encostem nas coxas para manter a tensão mecânica constante.',
    passos: [
      'Inclina o tronco levemente para a frente e destrava os joelhos.',
      'Eleva os halteres pelos cotovelos até a linha dos ombros.',
      'Sustenta 1 segundo no topo com controle postural.',
      'Desce devagar freando a descida, sem encostar nas coxas.'
    ],
    checkpoints: [
      'Elevar no plano escapular (braços ligeiramente à frente e não na linha reta do corpo).',
      'Cotovelos lideram a subida (mão não deve ficar mais alta que o cotovelo).',
      'Não usar impulso das pernas ou gangorra com o tronco.'
    ],
    respiracao: 'Solta o ar enquanto eleva os braços; puxa o ar descendo devagar.',
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
    posicao_inicial: 'Em pé de lado para a polia baixa. Passa o cabo por trás do corpo ou pela frente e segura com a mão externa. Tronco firme com leve inclinação lateral.',
    concentrica: 'Eleva o braço lateralmente até a altura do ombro, sentindo a resistência constante do cabo desde o primeiro centímetro.',
    excentrica: 'Desce o braço em 3 segundos controlando a tração do cabo.',
    passos: [
      'Posiciona a polia no ponto mais baixo e fica de lado.',
      'Segura o cabo com o braço oposto e cotovelo destravado.',
      'Eleva o braço até a linha paralela com o chão.',
      'Regressa suavemente sentindo a resistência do cabo em todo o percurso.'
    ],
    checkpoints: [
      'Cabo proporciona tensão mesmo na posição inicial (diferente dos halteres).',
      'Subir até a linha do ombro (90°).',
      'Manter o tronco imóvel.'
    ],
    respiracao: 'Inspira na descida; expira na subida.',
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
    concentrica: 'Eleva os halteres à frente do corpo com cotovelos quase retos até a altura dos olhos.',
    excentrica: 'Desce em 2 a 3 segundos de volta à frente das coxas.',
    passos: [
      'Fica ereto com os halteres à frente.',
      'Sobe os braços em linha reta até a altura da visão.',
      'Segura 1 segundo no topo.',
      'Desce com controle sem despencar.'
    ],
    checkpoints: ['Subir até a linha dos olhos', 'Tronco firme sem balanço', 'Cotovelos levemente destravados'],
    respiracao: 'Expira ao subir; inspira ao descer.',
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
    concentrica: 'Eleva os braços à frente até a linha dos olhos contraindo a frente do ombro.',
    excentrica: 'Desce em 3 segundos sentindo o cabo puxar os braços para baixo.',
    passos: [
      'Fica de costas para a polia com o cabo entre as pernas.',
      'Sobe as mãos à frente até o nível dos olhos.',
      'Mantém a contração por 1 segundo.',
      'Desce devagar resistindo à tensão.'
    ],
    checkpoints: ['Cabo entre as pernas', 'Tronco reto', 'Tensão contínua do cabo'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    posicao_inicial: 'Inclina o tronco para a frente até ficar quase paralelo ao chão, com joelhos destravados e coluna reta. Halteres pendem sob o peito com cotovelos ligeiramente flexionados.',
    concentrica: 'Abre os braços para os lados e para trás em arco horizontal amplo, conduzindo o movimento com a parte de trás dos ombros até a linha do tronco.',
    excentrica: 'Desce os halteres em 2 a 3 segundos de volta ao centro sem encostá-los.',
    passos: [
      'Inclina o tronco com coluna plana como em uma remada.',
      'Segura halteres leves com cotovelos destravados.',
      'Abre os braços lateralmente focando na contração do deltoide posterior.',
      'Desce suavemente até a posição inicial.'
    ],
    checkpoints: [
      'Tronco bem inclinado (se ficar de pé o exercício vira elevação lateral).',
      'Foco em afastar as mãos para os lados e não apenas puxar para trás com as costas.',
      'Cargas moderadas para não recrutar apenas trapézio e romboides.'
    ],
    respiracao: 'Inspira ao descer; expira abrindo os braços.',
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
    posicao_inicial: 'Sentado de frente para o encosto do aparelho com o peito apoiado. Ajusta os braços da máquina para ficarem na frente. Segura as manoplas na altura dos ombros.',
    concentrica: 'Empurra as manoplas para trás abrindo os braços até ficarem alinhados com o tronco, contraindo a parte posterior dos ombros.',
    excentrica: 'Regressa em 3 segundos com velocidade controlada antes dos pesos tocarem.',
    passos: [
      'Ajusta o banco para que as mãos fiquem na linha dos ombros.',
      'Apoia o peito no encosto e segura com pegada pronada ou neutra.',
      'Abre os braços lateralmente para trás em arco.',
      'Sustenta 1 segundo no pico e regressa devagar.'
    ],
    checkpoints: ['Peito colado no apoio', 'Cotovelos levemente destravados e firmes', 'Mãos no nível dos ombros'],
    respiracao: 'Inspira voltando; expira abrindo.',
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
    posicao_inicial: 'Em pé no centro das polias altas. Cruza as mãos pegando o cabo direito com a mão esquerda e o cabo esquerdo com a mão direita, braços cruzados na frente do rosto.',
    concentrica: 'Abre os braços lateralmente e para trás em arco horizontal puxando os cabos até a linha dos ombros.',
    excentrica: 'Regressa cruzando os braços à frente em 3 segundos controlados.',
    passos: [
      'Cruza as mãos segurando as bolinhas dos cabos no crossover alto.',
      'Dá um passo atrás e mantém a postura ereta.',
      'Abre os braços para fora e para trás até abrir o peito.',
      'Volta de forma suave sentindo a tensão do cabo.'
    ],
    checkpoints: ['Braços abrem na horizontal', 'Tronco estável', 'Foco no posterior do ombro'],
    respiracao: 'Inspira fechando; expira abrindo.',
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
    posicao_inicial: 'Polia ajustada na altura dos olhos ou topo da cabeça. Segura a corda com pegada neutra ou polegares apontados para trás. Dá dois passos para trás e estabiliza a base com um pé à frente.',
    concentrica: 'Puxa a corda em direção à testa/nariz, abrindo as pontas da corda para fora e realizando uma rotação externa dos ombros (mãos terminam ao lado das orelhas com cotovelos altos).',
    excentrica: 'Regressa à posição inicial em 3 segundos estendendo os braços com controle absoluto.',
    passos: [
      'Segura a corda na altura dos olhos e afasta-te da polia.',
      'Puxa a corda em direção ao nariz, separando as mãos.',
      'Faz a rotação externa dos ombros trazendo as mãos ao lado da cabeça.',
      'Aperta as costas e a parte de trás dos ombros por 1 segundo e regressa suavemente.'
    ],
    checkpoints: [
      'Cotovelos altos e mãos terminam na linha das orelhas.',
      'Rotação externa completa no final (polegares apontam para trás).',
      'Tronco firme sem inclinar para trás.'
    ],
    respiracao: 'Inspira ao estender os braços; expira na puxada contraindo os ombros e manguito.',
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
    posicao_inicial: 'Em pé com pés na largura dos ombros. Segura a barra na frente das coxas com pegada moderada (cerca da largura dos ombros, evitando pegada muito fechada).',
    concentrica: 'Puxa a barra verticalmente rente ao corpo conduzindo o movimento com os cotovelos até a linha média do peitoral.',
    excentrica: 'Desce a barra em 2 a 3 segundos de volta à frente das coxas.',
    passos: [
      'Segura a barra com pegada na largura dos ombros.',
      'Puxa para cima guiando com os cotovelos altos.',
      'Sobe até a linha do peito (sem passar da linha dos ombros para proteger o manguito).',
      'Desce de maneira compassada.'
    ],
    checkpoints: [
      'Pegada média (evita mãos coladas para não causar impacto subacromial).',
      'Cotovelos sobem mais altos que a barra.',
      'Parar na linha do peitoral médio.'
    ],
    respiracao: 'Inspira na descida; expira na subida.',
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
    concentrica: 'Eleva os ombros diretamente para cima em direção às orelhas em linha vertical pura, sustentando 1 a 2 segundos no ponto de contração máxima.',
    excentrica: 'Desce os ombros em 2 a 3 segundos de volta à posição neutra permitindo o alongamento do trapézio.',
    passos: [
      'Segura a barra em pé com peito estufado e postura alinhada.',
      'Eleva os ombros reto para cima como se dissesse "não sei".',
      'Aperta o trapézio no topo por 1 a 2 segundos.',
      'Desce com calma até o alongamento completo.'
    ],
    checkpoints: [
      'Movimento estritamente vertical para cima e para baixo (NUNCA rolar os ombros).',
      'Braços permanecem totalmente estendidos sem flexionar cotovelos.',
      'Pausa de contração isométrica no topo.'
    ],
    respiracao: 'Inspira na descida; expira com força ao elevar os ombros.',
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
    concentrica: 'Encolhe os ombros verticalmente para cima em direção às orelhas, apertando o topo por 2 segundos.',
    excentrica: 'Desce suavemente em 3 segundos permitindo que o peso alongue os trapézios.',
    passos: [
      'Segura os halteres ao lado das coxas com braços retos.',
      'Sobe os ombros em direção às orelhas com força máxima.',
      'Segura 2 segundos no pico espremendo o trapézio.',
      'Desce lentamente sem dobrar os cotovelos.'
    ],
    checkpoints: ['Halteres nas laterais do corpo', 'Elevação vertical sem rotação', 'Braços esticados'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    posicao_inicial: 'Sentado segurando os halteres na altura do queixo com as palmas voltadas para ti (supinadas), como no final de uma rosca direta.',
    concentrica: 'Empurra os halteres para cima enquanto gira gradualmente os punhos para fora (pronação) até bloquear os braços no topo com as palmas voltadas para a frente.',
    excentrica: 'Desce invertendo a rotação até voltar à posição supinada inicial na frente do queixo.',
    passos: [
      'Inicia com os halteres na frente do peito com palmas para dentro.',
      'Sobe abrindo os cotovelos e girando as palmas para a frente.',
      'Finaliza acima da cabeça com pegada pronada.',
      'Regressa girando de volta até a posição inicial.'
    ],
    checkpoints: ['Rotação suave e fluida durante o movimento', 'Costas apoiadas no encosto', 'Sem pressa na descida'],
    respiracao: 'Inspira descendo e girando para dentro; expira subindo e girando para fora.',
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
    posicao_inicial: 'Banco posicionado sob a barra do Smith. Senta-te com as costas coladas e a barra descendo na frente do nariz/queixo.',
    concentrica: 'Destrava a barra e empurra verticalmente até a extensão dos braços.',
    excentrica: 'Desce em 2 a 3 segundos até a altura do queixo/clavícula.',
    passos: [
      'Ajusta o banco no Smith para a barra descer rente à frente do rosto.',
      'Destrava a barra com os punhos retos.',
      'Empurra acelerando nos trilhos.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Barra passa na frente do queixo', 'Sem hiperlordose lombar', 'Trava de segurança ajustada'],
    respiracao: 'Inspira descendo; expira empurrando.',
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
    concentrica: 'Faz uma flexão rápida e curta de joelhos (cerca de 10-15cm de dip) e explode estendendo as pernas, transferindo o impulso para empurrar a barra vigorosamente sobre a cabeça.',
    excentrica: 'Baixa a barra de forma controlada amortecendo com leve flexão de joelhos na volta.',
    passos: [
      'Acomoda a barra sobre as clavículas em pé.',
      'Faz um dip rápido com os joelhos mantendo o tronco vertical.',
      'Explode as pernas e empurra a barra para o alto.',
      'Bloqueie os braços no topo e desce com controle amortecendo.'
    ],
    checkpoints: ['Dip curto e vertical (não inclina o tronco para a frente)', 'Extensão explosiva de pernas', 'Finalização sólida no topo'],
    respiracao: 'Inspira no dip; expira com explosão ao empurrar no topo.',
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
    concentrica: 'Empurra o halter verticalmente mantendo o tronco completamente reto sem inclinar para os lados.',
    excentrica: 'Desce o halter em 3 segundos controlados até o ombro.',
    passos: [
      'Fica ereto com o halter no ombro.',
      'Trava o abdómen para resistir à inclinação lateral.',
      'Empurra o peso em linha reta.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Tronco 100% vertical', 'Zero inclinação lateral', 'Braço sobe alinhado à orelha'],
    respiracao: 'Inspira na descida; expira empurrando.',
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
    concentrica: 'Eleva os halteres lateralmente até a altura dos ombros.',
    excentrica: 'Desce em 3 segundos mantendo a tensão contínua.',
    passos: [
      'Apoia as costas no encosto inclinado.',
      'Sobe os halteres lateralmente pelos cotovelos.',
      'Segura 1 segundo no topo.',
      'Desce suavemente até a lateral do banco.'
    ],
    checkpoints: ['Costas coladas no encosto eliminando impulsos', 'Cotovelos destravados', 'Subida controlada'],
    respiracao: 'Expira na subida; inspira na descida.',
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
    concentrica: 'Eleva o halter lateralmente até a vertical.',
    excentrica: 'Desce em 3 segundos sentindo o deltoide lateral sob tensão máxima no fundo.',
    passos: [
      'Deita de lado no banco inclinado.',
      'Segura o halter com o braço estendido ao longo do corpo.',
      'Sobe o peso em arco lateral até a altura da linha do ombro.',
      'Desce devagar controlando o retorno.'
    ],
    checkpoints: ['Corpo deitado de lado', 'Tensão máxima no terço inicial da subida', 'Controlo excêntrico'],
    respiracao: 'Expira subindo; inspira descendo.',
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
    concentrica: 'Eleva o braço lateralmente até a altura do ombro.',
    excentrica: 'Regressa em 3 segundos com tração constante do cabo.',
    passos: [
      'Passa o cabo por trás do corpo.',
      'Eleva o braço lateralmente no plano escapular.',
      'Segura 1 segundo no topo.',
      'Desce com cadência suave.'
    ],
    checkpoints: ['Cabo por trás sem atrito na roupa', 'Subir até 90°', 'Tronco reto'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva as almofadas empurrando com os cotovelos até a linha dos ombros.',
    excentrica: 'Desce em 3 segundos controlados sem deixar o peso bater.',
    passos: [
      'Ajusta o assento para que o eixo da máquina coincida com a articulação do ombro.',
      'Apoia os cotovelos nas almofadas.',
      'Empurra para cima com a força dos cotovelos.',
      'Regressa devagar.'
    ],
    checkpoints: ['Força exercida pelos cotovelos e não pelas mãos', 'Eixo da máquina alinhado ao ombro', 'Pés apoiados'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva a barra à frente com braços quase retos até o nível dos olhos.',
    excentrica: 'Desce em 2 a 3 segundos até a frente das coxas.',
    passos: [
      'Segura a barra com postura firme.',
      'Sobe a barra à frente até a altura dos olhos.',
      'Sustenta 1 segundo.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Braços paralelos', 'Coluna firme sem balanço', 'Descida lenta'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva a anilha à frente até a linha dos olhos ou ligeiramente acima, estufando o peito.',
    excentrica: 'Desce em 3 segundos controlados.',
    passos: [
      'Segura a anilha firmemente nas laterais.',
      'Eleva a anilha à frente até o campo de visão.',
      'Aperta os ombros no topo.',
      'Regressa devagar sem bater nas coxas.'
    ],
    checkpoints: ['Mãos nas laterais da anilha', 'Tronco imóvel', 'Subida suave'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva um braço à frente até a altura dos olhos enquanto o outro permanece imóvel.',
    excentrica: 'Desce com controle e repete imediatamente com o braço oposto.',
    passos: [
      'Sobe o braço direito até a altura dos olhos.',
      'Desce de forma compassada.',
      'Sobe o braço esquerdo mantendo o ritmo alternado.',
      'Mantém a coluna perfeitamente alinhada.'
    ],
    checkpoints: ['Subir um braço por vez com controle', 'Sem torcer o tronco', 'Pausa no topo'],
    respiracao: 'Expira na subida; inspira na descida de cada membro.',
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
    concentrica: 'Eleva a corda à frente até a linha dos olhos afastando levemente as mãos no topo.',
    excentrica: 'Desce em 3 segundos controlando a resistência contínua.',
    passos: [
      'Segura as pontas da corda de costas para a polia.',
      'Sobe os braços estendidos até a linha dos olhos.',
      'Abre ligeiramente a corda no ponto mais alto.',
      'Desce resistindo à tração do cabo.'
    ],
    checkpoints: ['Cabo entre as pernas', 'Afastamento sutil das mãos no topo', 'Sem balanço'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva os braços em diagonal formando a letra "Y" com o corpo, polegares apontados para o teto.',
    excentrica: 'Desce em 3 segundos até a posição vertical.',
    passos: [
      'Deita de bruços no banco inclinado.',
      'Segura halteres leves com polegares apontando para cima.',
      'Eleva os braços em ângulo de 45° formando um "Y".',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Braços em formato de "Y" (45°)', 'Polegares apontam para o teto', 'Peito apoiado no banco'],
    respiracao: 'Inspira descendo; expira na subida em Y.',
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
    concentrica: 'Abre os braços lateralmente em arco com cotovelos levemente dobrados até a linha dos ombros.',
    excentrica: 'Desce em 3 segundos controlados sem deixar os halteres colidirem.',
    passos: [
      'Apoia o peito no encosto inclinado.',
      'Abre os braços para os lados focando na parte traseira dos ombros.',
      'Segura 1 segundo no topo.',
      'Regressa devagar.'
    ],
    checkpoints: ['Peito colado no apoio', 'Cotovelos destravados', 'Movimento amplo para os lados'],
    respiracao: 'Inspira descendo; expira abrindo.',
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
    posicao_inicial: 'Em pé, inclina o tronco para a frente a 60° com coluna neutra e joelhos destravados.',
    concentrica: 'Abre os braços para os lados como as asas de um pássaro até a linha do tronco.',
    excentrica: 'Desce em 2 a 3 segundos com controle.',
    passos: [
      'Inclina o tronco com peito erguido.',
      'Abre os braços para os lados pelos cotovelos.',
      'Aperta a parte de trás dos ombros.',
      'Desce com calma.'
    ],
    checkpoints: ['Tronco inclinado estável', 'Movimento amplo lateral', 'Coluna reta'],
    respiracao: 'Inspira descendo; expira abrindo.',
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
    posicao_inicial: 'Conecte duas cordas na mesma polia alta para dobrar a amplitude de movimento. Segura cada corda com pegada neutra.',
    concentrica: 'Puxa em direção à cabeça abrindo as mãos amplamente para trás das orelhas, realizando rotação externa máxima.',
    excentrica: 'Estende os braços em 3 segundos controlados.',
    passos: [
      'Segura as duas cordas e dá dois passos para trás.',
      'Puxa abrindo os braços amplamente para trás da cabeça.',
      'Mãos passam bem atrás das orelhas graças às duas cordas.',
      'Regressa suavemente estendendo os braços.'
    ],
    checkpoints: ['Uso de corda dupla para amplitude ampliada', 'Mãos terminam atrás das orelhas', 'Cotovelos altos'],
    respiracao: 'Inspira na extensão; expira na puxada.',
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
    posicao_inicial: 'Em pé com halteres à frente das coxas, palmas voltadas para ti.',
    concentrica: 'Puxa os halteres para cima rente ao corpo conduzindo pelos cotovelos até a altura do peito.',
    excentrica: 'Desce em 2 a 3 segundos com controle.',
    passos: [
      'Sobe os halteres pelos cotovelos altos.',
      'Mantém os pesos próximos ao tórax.',
      'Para na linha média do peito.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Cotovelos sobem mais altos que as mãos', 'Sem passar da linha do peito', 'Halteres livres acompanham o corpo'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Puxa a barra para cima rente ao corpo com cotovelos apontando para o teto até a linha do peito.',
    excentrica: 'Desce em 3 segundos resistindo à tração do cabo.',
    passos: [
      'Segura a barra na polia baixa.',
      'Puxa verticalmente guiando com os cotovelos.',
      'Sustenta 1 segundo no peitoral médio.',
      'Regressa controladamente.'
    ],
    checkpoints: ['Tensão constante do cabo', 'Cotovelos altos', 'Parar no peito'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    posicao_inicial: 'Em pé de lado para a polia na altura do cotovelo. Segura o pegador com o braço mais distante. Cotovelo flexionado a 90° colado na costela (pode usar uma toalha enrolada entre o cotovelo e o tronco).',
    concentrica: 'Roda o antebraço para fora afastando a mão do abdómen sem descolar o cotovelo da lateral do corpo.',
    excentrica: 'Regressa em 3 segundos controlados até a frente do umbigo.',
    passos: [
      'Regula a polia na altura do umbigo/cotovelo.',
      'Cola o cotovelo a 90° na costela.',
      'Roda o antebraço para fora em arco horizontal.',
      'Regressa devagar sem solavancos.'
    ],
    checkpoints: [
      'Cotovelo colado ao tronco durante 100% da série.',
      'Carga muito leve (foco estritamente na ativação neuromuscular dos rotadores).',
      'Movimento lento e suave.'
    ],
    respiracao: 'Inspira ao retornar ao centro; expira ao girar para fora.',
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
    concentrica: 'Roda o antebraço para dentro em direção ao abdómen mantendo o cotovelo fixo.',
    excentrica: 'Regressa para fora em 3 segundos com velocidade controlada.',
    passos: [
      'Segura o cabo com o braço do lado da polia.',
      'Cola o cotovelo na cintura.',
      'Puxa a mão para dentro em direção ao umbigo.',
      'Regressa devagar mantendo a estabilidade.'
    ],
    checkpoints: ['Cotovelo colado na lateral', 'Carga leve', 'Movimento estritamente rotacional'],
    respiracao: 'Inspira ao abrir; expira ao puxar para o abdómen.',
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
    concentrica: 'Encolhe os ombros em linha reta para cima nos trilhos até o topo, sustentando 2 segundos.',
    excentrica: 'Desce em 3 segundos até o alongamento completo.',
    passos: [
      'Destrava a barra do Smith com postura alinhada.',
      'Sobe os ombros reto para cima.',
      'Sustenta a contração máxima.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Movimento estritamente vertical', 'Sem dobrar os braços', 'Pausa de 2s no topo'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva os ombros verticalmente contra a tração contínua dos cabos.',
    excentrica: 'Desce em 3 segundos permitindo que o cabo puxa os ombros para baixo em alongamento seguro.',
    passos: [
      'Segura a barra na polia baixa.',
      'Sobe os ombros em direção às orelhas.',
      'Segura a contração isométrica por 2 segundos.',
      'Regressa devagar sentindo o trapézio esticar.'
    ],
    checkpoints: ['Tensão permanente mesmo no fundo', 'Ombros sobem retos', 'Braços relaxados'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Encolhe os ombros para cima e ligeiramente para trás raspando a barra na parte posterior das coxas/glúteos.',
    excentrica: 'Desce em 3 segundos controlados.',
    passos: [
      'Posiciona a barra logo atrás dos glúteos.',
      'Segura com pegada pronada e peito aberto.',
      'Eleva os ombros para cima e para trás.',
      'Desce suavemente até a extensão total.'
    ],
    checkpoints: ['Barra posicionada atrás dos glúteos', 'Elevação vertical para cima e para trás', 'Escápulas se aproximam'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Encolhe os ombros verticalmente com força explosiva, segurando 2 segundos no topo.',
    excentrica: 'Desce o peso em 3 segundos permitindo o alongamento do trapézio.',
    passos: [
      'Fica no centro da barra hexagonal e segura as manoplas.',
      'Fica em pé com postura perfeita.',
      'Encolhe os ombros diretamente para cima.',
      'Desce de maneira compassada.'
    ],
    checkpoints: ['Pegada neutra nas laterais sem atrito nas pernas', 'Cargas elevadas com segurança', 'Coluna ereta'],
    respiracao: 'Inspira descendo; expira subindo.',
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
    concentrica: 'Eleva os halteres lateralmente até a linha dos ombros, cotovelos sempre ligeiramente à frente do tronco.',
    excentrica: 'Desce em 2 a 3 segundos resistindo à gravidade até os braços quase tocarem o tronco.',
    passos: [
      'Senta-te com as costas fixas no encosto, eliminando qualquer impulso do tronco.',
      'Segura os halteres ao lado do quadril com pegada neutra.',
      'Eleva os braços lateralmente até a altura dos ombros.',
      'Desce controlado sem deixar o peso cair.'
    ],
    checkpoints: [
      'Tronco preso ao encosto, sem balanço para gerar impulso',
      'Cotovelos levemente flexionados e fixos durante todo o movimento',
      'Elevação até no máximo a linha dos ombros, sem encolher o trapézio'
    ],
    respiracao: 'Expira subindo os halteres; inspira na descida controlada.',
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
    concentrica: 'Eleva um halter à frente do corpo até a altura dos ombros, mantendo o cotovelo quase estendido.',
    excentrica: 'Desce em 2 a 3 segundos de volta à coxa antes de iniciar o lado oposto.',
    passos: [
      'Senta-te ereto e segura os halteres sobre as coxas.',
      'Eleva um braço à frente até a linha dos ombros.',
      'Desce com controle total até a coxa.',
      'Alterna os lados mantendo o tronco imóvel.'
    ],
    checkpoints: [
      'Tronco imóvel, sem inclinar para trás para ajudar a subida',
      'Trajetória reta à frente do corpo, sem desviar para o lado',
      'Pausa breve no topo sem usar impulso do quadril'
    ],
    respiracao: 'Expira na subida; inspira na descida.',
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
    concentrica: 'Eleva os halteres em arco lateral e diagonal até os braços formarem uma cruz na altura dos ombros.',
    excentrica: 'Desce em 2 a 3 segundos retornando os halteres ao ponto cruzado à frente do quadril.',
    passos: [
      'Em pé, cruza os halteres à frente do quadril.',
      'Eleva os braços em arco amplo até a altura dos ombros.',
      'Finaliza com os braços abertos formando uma cruz.',
      'Desce controlado retornando ao ponto cruzado.'
    ],
    checkpoints: [
      'Trajetória em arco diagonal, não puramente lateral',
      'Tronco estável sem balanço para impulsionar a carga',
      'Carga leve priorizando amplitude completa sobre o peso'
    ],
    respiracao: 'Expira na subida; inspira na descida.',
    erro_comum: 'Usar carga pesada demais, encurtando a amplitude e perdendo o cruzamento inicial dos braços.',
    beneficio: 'O ponto de partida cruzado alonga o deltoide lateral sob tensão antes mesmo de iniciar a subida, aumentando o tempo total sob carga.'
  }
};
