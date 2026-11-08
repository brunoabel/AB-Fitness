/**
 * Biomecânica de Peitoral — 34 Exercícios (IDs 1-12, 101-122)
 * Dados anatômicos, execução padrão ouro, checkpoints e propósito científico.
 */

export const CHEST_BIOMECHANICS = {
  1: {
    id: 1,
    slug: 'supino-reto-barra',
    nome: 'Supino Reto com Barra',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Esternais e Médias)',
    sinergistas: 'Tríceps Braquial e Deltoide Anterior',
    equipamento: 'Banco Reto + Barra Olímpica e Anilhas',
    posicao_inicial: 'Deitado no banco com os olhos alinhados verticalmente com a barra. Pés cravados no chão, escápulas aduzidas e deprimidas contra o encosto, pegada cerca de 1,5x a largura dos ombros com os punhos neutros sobre os antebraços.',
    concentrica: 'Empurre a barra para cima e ligeiramente para trás em trajetória curva suave em direção à linha dos ombros, estendendo os cotovelos sem deslocar as escápulas do banco.',
    excentrica: 'Desça a barra de forma controlada em 2 a 3 segundos até tocar suavemente a porção média ou inferior do esterno, mantendo os cotovelos a 45°-60° do tronco.',
    passos: [
      'Deite-se, trave as escápulas no banco e firme os pés no chão gerando leg drive estável.',
      'Retire a barra do suporte e posicione-a sobre a linha média do peito com cotovelos estendidos.',
      'Inspire profundamente, estabilize o core e desça a barra até tocar o esterno em 2-3 segundos.',
      'Empurre o peso com aceleração constante, soltando o ar próximo ao ponto final sem bater os cotovelos.'
    ],
    checkpoints: [
      'Escápulas sempre aduzidas e fixadas no banco durante toda a série.',
      'Cotovelos alinhados a cerca de 45° a 60° em relação ao tronco (nunca abertos a 90°).',
      'Trajetória da barra em curva suave (toca o esterno e sobe alinhando aos ombros).'
    ],
    respiracao: 'Inspire e retenha ar no abdômen (manobra de Valsalva controlada) na descida; expire com força no terço final da subida.',
    erro_comum: 'Abrir os cotovelos em ângulo de 90° em relação ao tronco, sobrecarregando perigosamente o manguito rotador e a cápsula articular do ombro.',
    beneficio: 'Exercício rei para construção de força pura e densidade em todo o feixe esternal do peitoral maior, permitindo aplicar sobrecarga progressiva com as maiores cargas possíveis.'
  },
  2: {
    id: 2,
    slug: 'supino-inclinado-halteres',
    nome: 'Supino Inclinado com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Clavicular - Superior)',
    sinergistas: 'Deltoide Anterior e Tríceps Braquial',
    equipamento: 'Banco Inclinado a 30°-45° + Halteres',
    posicao_inicial: 'Sentado com as costas coladas no encosto inclinado a 30°-45°. Pés firmes no chão, halteres apoiados nas coxas e erguidos com impulso dos joelhos até a altura dos ombros. Escápulas fechadas atrás.',
    concentrica: 'Pressione os halteres para cima e ligeiramente para dentro em trajetória convergente, contraindo o peitoral superior sem colidir os halteres no topo.',
    excentrica: 'Desça os halteres em 2 a 3 segundos abrindo a caixa torácica até que fiquem na linha da clavícula/peitoral superior, sentindo um alongamento seguro.',
    passos: [
      'Posicione o banco em 30° a 45° de inclinação e deite com escápulas travadas no encosto.',
      'Eleve os halteres acima do peitoral superior com pegada neutra ou semi-pronada.',
      'Desça de forma suave e controlada até sentir alongamento na porção superior do peito.',
      'Empurre verticalmente convergindo no topo, sustentando 1 segundo de contração máxima.'
    ],
    checkpoints: [
      'Inclinação ideal entre 30° e 45° (banco acima de 45° transfere o trabalho para o deltoide).',
      'Punhos alinhados diretamente sobre os cotovelos para evitar torque no punho.',
      'Não bater os halteres no topo para não dissipar a tensão mecânica das fibras.'
    ],
    respiracao: 'Puxe o ar na descida controlada; expire forte enquanto empurra os halteres para o topo.',
    erro_comum: 'Usar inclinação excessiva (60°) ou projetar o pescoço para a frente perdendo a retração escapular.',
    beneficio: 'Ativação seletiva da cabeça clavicular do peitoral para preenchimento da parte superior do tórax, com maior amplitude articular e segurança para os ombros proporcionada pelos halteres livres.'
  },
  3: {
    id: 3,
    slug: 'supino-declinado-barra',
    nome: 'Supino Declinado com Barra',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Costal / Inferior)',
    sinergistas: 'Tríceps Braquial e Deltoide Anterior',
    equipamento: 'Banco Declinado (15°-30°) com Apoio de Pernas + Barra Olímpica',
    posicao_inicial: 'Prenda bem as pernas nos rolos acolchoados do banco declinado. Deite-se com a cabeça apoiada, escápulas retraídas e pegue a barra com pegada ligeiramente mais larga que os ombros.',
    concentrica: 'Empurre a barra para cima verticalmente até estender os braços, focalizando a força na base do peitoral.',
    excentrica: 'Desça a barra controladamente em 2 a 3 segundos até a linha logo abaixo dos mamilos (sulco inframamário).',
    passos: [
      'Prenda firmemente as canelas nos rolos e deite-se com controle.',
      'Trave as escápulas, retire a barra com cuidado e estabilize-a sobre a porção inferior do tórax.',
      'Desça em 2 a 3 segundos até encostar na linha inferior do peito.',
      'Empurre com aceleração e controle até a extensão dos cotovelos.'
    ],
    checkpoints: [
      'Pernas firmemente travadas para não deslizar no banco.',
      'Barra desce na linha inframamária (nunca no pescoço nem no abdômen).',
      'Controle rigoroso da carga na descida.'
    ],
    respiracao: 'Inspire na descida; expire no esforço da subida concêntrica.',
    erro_comum: 'Bater a barra no osso esterno ou retirar a barra sem travar as pernas.',
    beneficio: 'Excelente alavanca biomecânica que permite recrutar com máxima potência o feixe inferior do peitoral maior com menor estresse no deltoide anterior.'
  },
  4: {
    id: 4,
    slug: 'crucifixo-reto-halteres',
    nome: 'Crucifixo Reto com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Médias - Alongamento em Isolamento)',
    sinergistas: 'Deltoide Anterior e Coracobraquial',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Deitado no banco reto com pés apoiados, escápulas presas e braços estendidos segurando os halteres com palmas voltadas uma para a outra. Mantenha os cotovelos levemente flexionados (15°) e congelados nesse ângulo.',
    concentrica: 'Aproxime os halteres em arco amplo como se estivesse dando um abraço em um tronco largo até ficarem sobre o peito.',
    excentrica: 'Abra os braços em arco descendente de 2 a 3 segundos até sentir um alongamento profundo nas fibras do peitoral, sem deixar os cotovelos caírem abaixo da linha do banco.',
    passos: [
      'Deite-se no banco reto com os halteres na vertical e cotovelos com leve flexão (15°).',
      'Abra os braços em movimento de arco amplo, sentindo o peitoral esticar.',
      'Pare quando os cotovelos atingirem a linha do tronco.',
      'Feche os braços em arco apertando o peitoral no topo sem bater os pesos.'
    ],
    checkpoints: [
      'Ângulo dos cotovelos fixo em 15° durante todo o percurso (não dobre e estique os braços).',
      'Não descer os halteres excessivamente para não hiperestender a cápsula do ombro.',
      'Mantenha as escápulas coladas no banco.'
    ],
    respiracao: 'Inspire abrindo os braços e enchendo o peito; expire na adução horizontal fechando o arco.',
    erro_comum: 'Transformar o crucifixo em um supino por dobrar os cotovelos excessivamente durante a descida para tentar usar carga pesada.',
    beneficio: 'Isola o peitoral maior em adução horizontal pura sob tensão no comprimento alongado (stretch-mediated hypertrophy).'
  },
  5: {
    id: 5,
    slug: 'crucifixo-inclinado-halteres',
    nome: 'Crucifixo Inclinado com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Claviculares Superiores)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Inclinado (30°) + Halteres',
    posicao_inicial: 'Deitado no banco inclinado a 30°, escápulas presas no encosto, halteres sobre a linha dos olhos com leve flexão dos cotovelos.',
    concentrica: 'Traga os halteres para cima e para dentro em arco circular até a linha superior do tórax, apertando o topo do peito.',
    excentrica: 'Abra os braços lateralmente em arco suave em 2 a 3 segundos, sentindo a porção superior do peito alongar sob controle.',
    passos: [
      'Ajuste o banco em 30° e posicione os halteres acima do peitoral superior.',
      'Com cotovelos semi-flexionados, abra os braços em arco para os lados.',
      'Vá até a amplitude em que sinta o alongamento da cabeça clavicular.',
      'Retorne fechando os braços e espremendo o peitoral superior no topo.'
    ],
    checkpoints: [
      'Banco em 30° para otimizar foco na porção clavicular.',
      'Cotovelos levemente flexionados e congelados nessa angulação.',
      'Cabeça e costas bem apoiadas.'
    ],
    respiracao: 'Inspire abrindo a caixa torácica; expire concentrando a força na subida.',
    erro_comum: 'Excesso de carga que força o praticante a empurrar como supino ou esticar demais os ombros.',
    beneficio: 'Isola a porção superior do peitoral na fase de maior alongamento, estimulando hipertrofia regional clavicular sem sobrecarregar o tríceps.'
  },
  6: {
    id: 6,
    slug: 'crossover-polia-alta',
    nome: 'Crossover Polia Alta',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Esternocostal e Inferior)',
    sinergistas: 'Deltoide Anterior e Peitoral Menor',
    equipamento: 'Estação Crossover com Polias Reguladas no Ponto Mais Alto + Pegadores',
    posicao_inicial: 'Em pé no centro do crossover com um pé à frente para estabilidade. Tronco levemente inclinado para a frente (15°-20°). Braços abertos com cotovelos semiflexionados segurando os pegadores na polia alta.',
    concentrica: 'Puxe os cabos para baixo e para a frente em trajetória diagonal descendente, cruzando ligeiramente ou aproximando as mãos na frente da linha do quadril.',
    excentrica: 'Retorne os braços para cima e para os lados de forma controlada em 3 segundos, permitindo alongamento peitoral sem perder a postura do tronco.',
    passos: [
      'Segure os pegadores, dê um passo à frente e estabilize o tronco inclinado 15°.',
      'Com cotovelos firmes e levemente flexionados, traga as mãos em direção à linha do umbigo/quadril.',
      'Aperte o peitoral com máxima contração isométrica por 1 segundo na junção.',
      'Retorne resistindo à tração dos cabos em 3 segundos até sentir o peito abrir.'
    ],
    checkpoints: [
      'Tronco estável sem balanço durante o movimento.',
      'Cotovelos mantêm a mesma angulação fixa.',
      'Linha de força diagonal apontando para baixo e para a frente.'
    ],
    respiracao: 'Inspire no retorno dos cabos; expire com vigor ao fechar os braços à frente.',
    erro_comum: 'Usar o peso do corpo para empurrar o cabo para baixo ou transformar o exercício em um tríceps pushdown.',
    beneficio: 'Mantém tensão mecânica contínua durante todo o arco de movimento, especialmente no pico de encurtamento do feixe inferior do peitoral.'
  },
  7: {
    id: 7,
    slug: 'crossover-polia-media',
    nome: 'Crossover Polia Média',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Esternais Médias)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Estação Crossover com Polias na Altura do Peito',
    posicao_inicial: 'Em pé no meio da estação, polias reguladas na altura do esterno. Um pé à frente, tronco quase vertical com leve inclinação estável.',
    concentrica: 'Aproxime as mãos à frente do peito em linha horizontal reta, como em um abraço firme, apertando o centro do tórax.',
    excentrica: 'Abra os braços lateralmente controlando a tensão constante dos cabos em 2 a 3 segundos.',
    passos: [
      'Ajuste as polias na altura do peito e dê um passo à frente com base sólida.',
      'Abra os braços com cotovelos destravados sentindo a tração horizontal.',
      'Traga as mãos para a frente do esterno até quase se tocarem.',
      'Sustente 1 segundo no pico e abra controlando o retorno.'
    ],
    checkpoints: [
      'Trajetória rigorosamente horizontal alinhada com o meio do peito.',
      'Escápulas ativas e peito estufado.',
      'Pés firmes sem gangorra corporal.'
    ],
    respiracao: 'Inspire ao abrir; expire na adução das mãos à frente.',
    erro_comum: 'Balançar o corpo para frente e para trás para iniciar a repetição com impulso inercial.',
    beneficio: 'Tensão constante e linear sobre as fibras médias do peitoral maior, ideal para trabalho metabólico e congestão sanguínea.'
  },
  8: {
    id: 8,
    slug: 'crossover-polia-baixa',
    nome: 'Crossover Polia Baixa',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Clavicular Superior)',
    sinergistas: 'Deltoide Anterior e Bíceps Braquial (Cabeça Curta)',
    equipamento: 'Estação Crossover com Polias no Ponto Mais Baixo + Pegadores',
    posicao_inicial: 'Em pé no centro, polias na base do solo. Um pé à frente, braços estendidos para baixo e para trás com palmas voltadas para a frente e cotovelos destravados.',
    concentrica: 'Puxe os cabos para cima e para a frente em trajetória diagonal ascendente até a altura do queixo/olhos, focando na contração do peitoral superior.',
    excentrica: 'Desça os cabos em trajetória suave de 3 segundos resistindo ao retorno do peso.',
    passos: [
      'Pegue os cabos baixos, dê um passo à frente e mantenha a coluna ereta.',
      'Suba as mãos em arco diagonal para cima e para dentro até a altura do queixo.',
      'Aperte intensamente a porção clavicular do peito no topo por 1 segundo.',
      'Retorne devagar até a posição inicial de alongamento.'
    ],
    checkpoints: [
      'Trajetória de baixo para cima e para o centro.',
      'Não erguer os ombros em direção às orelhas (mantenha os trapézios relaxados).',
      'Manter os cotovelos levemente flexionados sem dobrar mais durante o movimento.'
    ],
    respiracao: 'Inspire na descida das mãos; expire enquanto conduz os cabos para cima.',
    erro_comum: 'Puxar com o bíceps flexionando os cotovelos em vez de realizar a flexão e adução horizontal do ombro com o peito.',
    beneficio: 'Estímulo direcionado à porção superior do peitoral que combina flexão de ombro e adução horizontal sob tensão contínua dos cabos.'
  },
  9: {
    id: 9,
    slug: 'voador-peck-deck',
    nome: 'Voador (Peck Deck)',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Isolamento Completo)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Máquina Peck Deck / Voador',
    posicao_inicial: 'Sentado com as costas e cabeça completamente apoiadas no encosto. Ajuste o banco de forma que as mãos/pegadores fiquem alinhados com o terço médio do peitoral. Pés firmes no chão.',
    concentrica: 'Empurre os pegadores à frente em movimento convergente até se aproximarem, apertando vigorosamente o peitoral no ponto máximo.',
    excentrica: 'Abra os braços de maneira controlada em 2 a 3 segundos até sentir um alongamento seguro na musculatura peitoral sem hiperestender os ombros.',
    passos: [
      'Ajuste o banco para que os pegadores fiquem na altura do meio do peitoral.',
      'Apoie as costas firmemente, retraia as escápulas e segure os pegadores.',
      'Feche os braços trazendo as manoplas à frente e segure a contração por 1 segundo.',
      'Abra com controle de 2 a 3 segundos até a linha do ombro.'
    ],
    checkpoints: [
      'Escápulas retraídas coladas no encosto durante todo o exercício.',
      'Não deixar o peso bater na pilha no final da descida para manter a tensão.',
      'Cotovelos na mesma altura dos punhos.'
    ],
    respiracao: 'Puxe o ar na abertura controlada; solte o ar na adução frontal.',
    erro_comum: 'Projetar os ombros para a frente na tentativa de fechar o aparelho, perdendo a retração escapular e sobrecarregando a articulação acromioclavicular.',
    beneficio: 'Excelente estabilização mecânica sem necessidade de equilíbrio de pesos livres, permitindo focar 100% na conexão mente-músculo e ir até a falha com total segurança.'
  },
  10: {
    id: 10,
    slug: 'pullover-halter',
    nome: 'Pullover com Halter',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Esternais) e Grande Dorsal',
    sinergistas: 'Serrátil Anterior, Tríceps (Cabeça Longa) e Peitoral Menor',
    equipamento: 'Banco Reto + 1 Halter Pesado',
    posicao_inicial: 'Deite transversalmente sobre o banco (apoiando apenas a parte superior das costas e escápulas) ou deitado ao longo do banco. Segure o halter com ambas as mãos em formato de diamante/cálice sob a anilha superior, braços estendidos sobre o peito com cotovelos quase retos.',
    concentrica: 'Puxe o halter de volta sobre o peito utilizando a força do peitoral e serrátil, mantendo o quadril estável.',
    excentrica: 'Desça o halter para trás da cabeça em arco controlado em 3 segundos, sentindo a caixa torácica expandir e o peitoral/dorsal alongar.',
    passos: [
      'Apoie a parte alta das costas no banco e segure o halter acima do peito.',
      'Com cotovelos levemente flexionados (cerca de 10°-15° fixos), desça o peso atrás da cabeça em arco.',
      'Desça até sentir grande amplitude e alongamento da caixa torácica.',
      'Puxe o halter de volta até a linha do peito contraindo peitoral e serrátil.'
    ],
    checkpoints: [
      'Cotovelos não flexionam nem estendem durante o movimento (movimento puramente do ombro).',
      'Quadril firme e nivelado, sem hiperlordose lombar descontrolada.',
      'Amplitude confortável que respeite a flexibilidade do seu ombro.'
    ],
    respiracao: 'Inspire profundamente expandindo o gradil costal ao descer; expire ao puxar o peso para cima.',
    erro_comum: 'Flexionar os cotovelos em excesso transformando o movimento em um tríceps francês.',
    beneficio: 'Expansão e fortalecimento do serrátil anterior e feixe esternal do peitoral em posição de máximo alongamento sob carga.'
  },
  11: {
    id: 11,
    slug: 'flexao-de-braco',
    nome: 'Flexão de Braço',
    grupo: 'Peito',
    alvo: 'Peitoral Maior, Deltoide Anterior e Tríceps',
    sinergistas: 'Serrátil Anterior, Core (Reto Abdominal e Transverso)',
    equipamento: 'Peso Corporal (Chão / Colchonete)',
    posicao_inicial: 'Em prancha alta com as mãos no chão ligeiramente mais largas que os ombros. Dedos levemente abertos, corpo formando uma linha reta da cabeça aos calcanhares, glúteos e abdômen firmemente contraídos.',
    concentrica: 'Empurre o chão com vigor até a extensão quase total dos braços, mantendo o corpo rígido como uma tábua.',
    excentrica: 'Flexione os cotovelos em 2 a 3 segundos descendo o peito até ficar a 2-3 cm do solo, com os cotovelos apontando a 45° em relação ao tronco.',
    passos: [
      'Assuma a posição de prancha com as mãos na linha do peito e core ativado.',
      'Desça o corpo em bloco controlando a velocidade até o peito quase encostar no chão.',
      'Mantenha cotovelos em 45° em relação ao corpo (flecha, não cruz).',
      'Empurre o chão com força até o topo mantendo a coluna alinhada.'
    ],
    checkpoints: [
      'Corpo 100% rígido e alinhado (sem deixar o quadril desabar nem empinar para cima).',
      'Cotovelos formam desenho de flecha (45°) e não de T (90°).',
      'Amplitude completa (peito próximo ao solo).'
    ],
    respiracao: 'Inspire na descida do corpo; expire com força ao empurrar o chão.',
    erro_comum: 'Deixar o quadril ceder por falta de ativação do core, gerando sobrecarga lombar.',
    beneficio: 'Padrão fundamental de empurrar horizontal com ativação integrada do core e serrátil anterior, sem necessidade de equipamentos.'
  },
  12: {
    id: 12,
    slug: 'paralelas-foco-peito',
    nome: 'Paralelas (Foco Peito)',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Inferiores e Médias)',
    sinergistas: 'Tríceps Braquial, Deltoide Anterior e Peitoral Menor',
    equipamento: 'Barras Paralelas (Dip Station)',
    posicao_inicial: 'Suspenso nas barras paralelas com os braços estendidos. Incline o tronco para a frente cerca de 30°, dobre os joelhos e cruze os pés, afastando os cotovelos ligeiramente para fora.',
    concentrica: 'Empurre as barras para baixo estendendo os braços e convergindo a força para a porção inferior do peitoral.',
    excentrica: 'Desça o corpo em 2 a 3 segundos flexionando os cotovelos até que os braços fiquem paralelos ao solo (ângulo de 90° no cotovelo), preservando a inclinação do tronco para frente.',
    passos: [
      'Suba nas barras paralelas e estabilize o peso corporal.',
      'Incline o tronco para a frente cerca de 30° para direcionar o trabalho ao peitoral.',
      'Desça o corpo de forma controlada até os cotovelos atingirem 90°.',
      'Empurre com força concentrada no peitoral até o retorno ao topo.'
    ],
    checkpoints: [
      'Tronco sempre inclinado para frente (se ficar vertical o foco vai todo para o tríceps).',
      'Não descer além de 90° nos cotovelos se não tiver grande mobilidade de ombro.',
      'Controle rigoroso sem dar solavancos no fundo.'
    ],
    respiracao: 'Inspire na descida controlada; expire forte na subida.',
    erro_comum: 'Fazer o exercício com o corpo ereto e vertical, transferindo quase todo o esforço para o tríceps em vez do peitoral.',
    beneficio: 'Um dos melhores construtores de massa para a porção inferior e borda externa do peitoral, gerando alta tensão mecânica com peso livre corporal.'
  },
  101: {
    id: 101,
    slug: 'supino-inclinado-barra',
    nome: 'Supino Inclinado com Barra',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Clavicular)',
    sinergistas: 'Deltoide Anterior e Tríceps',
    equipamento: 'Banco Inclinado (30°-45°) + Barra Olímpica',
    posicao_inicial: 'Deitado no banco a 30°-45° com pés firmes no chão, escápulas retraídas, pegada 1.5x a largura dos ombros.',
    concentrica: 'Empurre a barra para cima até a extensão dos cotovelos, focando na contração do peitoral superior.',
    excentrica: 'Desça a barra em 2 a 3 segundos em direção à clavícula/peito alto com cotovelos em 45°-60°.',
    passos: [
      'Acomode-se no banco, aduza as escápulas e firme a base dos pés.',
      'Retire a barra do suporte e fixe o ponto de partida sobre a clavícula.',
      'Desça de forma compassada até tocar de leve o topo do peito.',
      'Empurre verticalmente com controle e aceleração constante.'
    ],
    checkpoints: ['Banco em 30° a 45°', 'Barra desce no peito superior', 'Escápulas travadas'],
    respiracao: 'Inspire na descida; expire no impulso de subida.',
    erro_comum: 'Descer a barra no pescoço ou abrir os cotovelos a 90°.',
    beneficio: 'Permite sobrecarga progressiva pesada diretamente no feixe clavicular do peitoral.'
  },
  102: {
    id: 102,
    slug: 'supino-reto-smith',
    nome: 'Supino Reto no Smith',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Esternais)',
    sinergistas: 'Tríceps e Deltoide Anterior',
    equipamento: 'Máquina Smith + Banco Reto',
    posicao_inicial: 'Posicione o banco centralizado no Smith. Deite de modo que a barra fique alinhada ao peitoral médio. Escápulas travadas.',
    concentrica: 'Destrave a barra e empurre com máxima força peitoral até estender os braços na linha fixa do aparelho.',
    excentrica: 'Desça em 2 a 3 segundos até 2 cm do esterno mantendo tensão constante sem desapoiar as escápulas.',
    passos: [
      'Alinhe o banco no centro dos trilhos do Smith.',
      'Deite, trave os pés e posicione a pegada com punhos alinhados.',
      'Gire a barra para destravar os ganchos e desça controladamente.',
      'Empurre acelerando contra os trilhos e trave no final se necessário.'
    ],
    checkpoints: ['Trilho alinhado ao peitoral médio', 'Pegada simétrica e punhos retos', 'Sem rebote no peito'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Posicionar o banco muito à frente ou muito atrás do trilho vertical.',
    beneficio: 'Estabilidade guiada que permite levar as séries até a falha neuromuscular com travas de segurança ativadas.'
  },
  103: {
    id: 103,
    slug: 'supino-inclinado-smith',
    nome: 'Supino Inclinado no Smith',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Porção Clavicular)',
    sinergistas: 'Deltoide Anterior e Tríceps',
    equipamento: 'Máquina Smith + Banco Inclinado',
    posicao_inicial: 'Banco inclinado a 30° posicionado no Smith com a barra alinhada à clavícula.',
    concentrica: 'Empurre a barra para cima nos trilhos estendendo os braços com foco no peitoral alto.',
    excentrica: 'Desça em 3 segundos até o nível superior do peitoral com cotovelos controlados.',
    passos: [
      'Ajuste o banco no Smith para a barra descer na linha da clavícula.',
      'Retraia as escápulas e empurre a barra destravando.',
      'Desça de forma suave sem quicar no peito.',
      'Suba concentrando o esforço nas fibras superiores.'
    ],
    checkpoints: ['Trajetória linear controlada', 'Escápulas no encosto', 'Descida suave'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Deixar a barra descer na garganta por mau posicionamento do banco.',
    beneficio: 'Excelente para sobrecarga segura nas fibras claviculares com redução de estabilizadores.'
  },
  104: {
    id: 104,
    slug: 'supino-declinado-halteres',
    nome: 'Supino Declinado com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Inferiores)',
    sinergistas: 'Tríceps e Deltoide Anterior',
    equipamento: 'Banco Declinado + Halteres',
    posicao_inicial: 'Pernas travadas nos rolos do banco declinado, halteres apoiados na frente das coxas, deite-se com controle.',
    concentrica: 'Empurre os halteres para cima de forma convergente até estender os cotovelos sobre a linha inferior do peito.',
    excentrica: 'Desça em 2 a 3 segundos abrindo os cotovelos a 45° até o nível do tronco.',
    passos: [
      'Trave as pernas e deite segurando os halteres com firmeza.',
      'Empurre verticalmente convergindo no topo.',
      'Desça com cadência controlada até a lateral do peito inferior.',
      'Suba apertando a porção inferior do peitoral.'
    ],
    checkpoints: ['Pernas presas', 'Descida controlada', 'Convergência sem choque'],
    respiracao: 'Inspire na descida; expire no topo.',
    erro_comum: 'Soltar os halteres de forma descuidada ao terminar a série.',
    beneficio: 'Maior liberdade de rotação nos punhos e amplitude anatômica para o feixe inferior do peitoral.'
  },
  105: {
    id: 105,
    slug: 'supino-declinado-smith',
    nome: 'Supino Declinado no Smith',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Inferior)',
    sinergistas: 'Tríceps Braquial',
    equipamento: 'Smith Machine + Banco Declinado',
    posicao_inicial: 'Banco declinado alinhado para a barra descer no sulco inframamário.',
    concentrica: 'Empurre a barra para cima nos trilhos contraindo a base do peitoral.',
    excentrica: 'Desça em 2 a 3 segundos até quase encostar no peito inferior.',
    passos: [
      'Alinhe o banco declinado aos trilhos do Smith.',
      'Destrave a barra e inicie a descida controlada.',
      'Pare a 2 cm do tórax e empurre acelerando.',
      'Trave a barra com os ganchos ao atingir a fadiga.'
    ],
    checkpoints: ['Alinhamento inframamário', 'Pegada firme', 'Controle excêntrico'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Descer a barra na linha da barriga.',
    beneficio: 'Permite treinar o feixe inferior com cargas altas e segurança autônoma.'
  },
  106: {
    id: 106,
    slug: 'supino-chao-floor-press-halteres',
    nome: 'Supino no Chão com Halteres (Floor Press)',
    grupo: 'Peito',
    alvo: 'Peitoral Médio & Tríceps (Bloqueio / Lockout)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Colchonete / Chão + Halteres',
    posicao_inicial: 'Deitado de costas no chão com joelhos flexionados e pés apoiados. Halteres na vertical com cotovelos apoiados no chão a 45° do corpo.',
    concentrica: 'Empurre os halteres para cima até estender os braços sobre o peitoral.',
    excentrica: 'Desça os halteres até os tríceps tocarem de leve o solo, pausando por 1 segundo sem relaxar a tensão muscular.',
    passos: [
      'Deite-se no chão com os halteres e joelhos flexionados.',
      'Inicie com os tríceps encostados suavemente no solo.',
      'Empurre com força máxima concêntrica até o topo.',
      'Desça até encostar o braço no chão, pausando sem bater.'
    ],
    checkpoints: ['Pausa controlada no chão', 'Sem bater os cotovelos com impacto', 'Cotovelos a 45°'],
    respiracao: 'Inspire na descida; expire no impulso explosivo.',
    erro_comum: 'Bater os cotovelos com força contra o chão sólido.',
    beneficio: 'Elimina o estresse excessivo de hiperextensão no ombro e desenvolve força de arranque e tracionamento puro do tríceps e peitoral.'
  },
  107: {
    id: 107,
    slug: 'supino-chao-barra',
    nome: 'Supino no Chão com Barra (Barbell Floor Press)',
    grupo: 'Peito',
    alvo: 'Peitoral Maior e Tríceps Braquial',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Barra Olímpica + Suporte Baixo ou Gaiola',
    posicao_inicial: 'Deitado no chão sob a barra montada nos apoios baixos da gaiola. Joelhos dobrados, escápulas apoiadas no piso.',
    concentrica: 'Empurre a barra para cima até a extensão completa dos cotovelos.',
    excentrica: 'Desça até a parte posterior dos braços tocarem o chão, pausando 1 segundo para anular a energia elástica.',
    passos: [
      'Posicione-se no chão sob a gaiola e pegue a barra.',
      'Tire a barra e estabilize sobre o peito.',
      'Desça até encostar os tríceps no chão de forma macia.',
      'Exploda na subida sem leg drive.'
    ],
    checkpoints: ['Pausa no chão de 1 segundo', 'Corpo rígido', 'Sem solavanco nos cotovelos'],
    respiracao: 'Inspire na descida; expire forte na subida.',
    erro_comum: 'Relaxar completamente a musculatura ao tocar o solo.',
    beneficio: 'Exercício clássico de powerlifting para quebrar platôs de força no terço médio e final do supino.'
  },
  108: {
    id: 108,
    slug: 'supino-pegada-neutra-halteres',
    nome: 'Supino com Pegada Neutra com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior e Tríceps Braquial',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Deitado no banco reto segurando os halteres com as palmas voltadas uma para a outra (pegada neutra). Cotovelos fechados rente às costelas.',
    concentrica: 'Empurre os halteres verticalmente mantendo as palmas voltadas uma para a outra durante todo o percurso.',
    excentrica: 'Desça os halteres com os cotovelos rentes ao tronco até o nível do peitoral em 2 a 3 segundos.',
    passos: [
      'Deite-se com os halteres paralelos e palmas viradas para dentro.',
      'Empurre para cima mantendo os braços alinhados.',
      'Desça rentes às costelas sentindo o peito e tríceps.',
      'Repita mantendo o controle total da rotação.'
    ],
    checkpoints: ['Palmas sempre voltadas uma para a outra', 'Cotovelos junto ao corpo', 'Ombros relaxados'],
    respiracao: 'Inspire na descida; expire na extensão.',
    erro_comum: 'Girar os punhos no meio do caminho transformando em pegada pronada.',
    beneficio: 'Excelente alternativa para quem sente dores articulares ou impacto no manguito rotador no supino tradicional.'
  },
  109: {
    id: 109,
    slug: 'supino-articulado-maquina-reto',
    nome: 'Supino Articulado Máquina Reto',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Médias)',
    sinergistas: 'Tríceps e Deltoide Anterior',
    equipamento: 'Máquina Articulada com Carga por Anilhas ou Placas',
    posicao_inicial: 'Sentado com banco ajustado para que as manoplas fiquem na linha dos mamilos. Costas coladas e escápulas aduzidas.',
    concentrica: 'Empurre as manoplas para a frente até quase estender os cotovelos, sem perder a retração das escápulas.',
    excentrica: 'Retorne de forma lenta em 3 segundos até sentir o peito alongar profundamente.',
    passos: [
      'Ajuste o banco na altura correta do peito.',
      'Apoie as costas, segure as manoplas e aduza as escápulas.',
      'Empurre com força sustentando 1 segundo na contração.',
      'Volte em 3 segundos sem deixar o peso encostar no suporte.'
    ],
    checkpoints: ['Banco na altura dos mamilos', 'Costas coladas', 'Descida de 3 segundos'],
    respiracao: 'Inspire ao abrir; expire ao empurrar.',
    erro_comum: 'Descolar as costas do encosto para conseguir mais alavanca.',
    beneficio: 'Tensão mecânica pura com convergência anatômica guiada sem perigo de desequilíbrio.'
  },
  110: {
    id: 110,
    slug: 'supino-articulado-maquina-inclinado',
    nome: 'Supino Articulado Máquina Inclinado',
    grupo: 'Peito',
    alvo: 'Peitoral Superior (Clavicular)',
    sinergistas: 'Deltoide Anterior e Tríceps',
    equipamento: 'Máquina Articulada Inclinada',
    posicao_inicial: 'Sentado com as costas coladas no encosto inclinado da máquina. Manoplas na linha da clavícula.',
    concentrica: 'Empurre as manoplas para cima e para a frente em linha diagonal, espremendo o peitoral superior.',
    excentrica: 'Retorne controlando em 3 segundos até sentir o alongamento da porção alta do tórax.',
    passos: [
      'Regule a altura do assento para que as pegadas fiquem no peito superior.',
      'Pés firmes no piso e peito erguido.',
      'Empurre na trajetória ascendente da máquina.',
      'Desça devagar aproveitando o alongamento mecânico.'
    ],
    checkpoints: ['Ombros longe das orelhas', 'Escápulas fixadas', 'Manoplas no peito superior'],
    respiracao: 'Inspire na volta; expire na propulsão.',
    erro_comum: 'Erguer os ombros usando o trapézio para empurrar o peso.',
    beneficio: 'Isolamento preciso e estável do peitoral superior com curva de resistência otimizada.'
  },
  111: {
    id: 111,
    slug: 'supino-articulado-maquina-declinado',
    nome: 'Supino Articulado Máquina Declinado',
    grupo: 'Peito',
    alvo: 'Peitoral Inferior',
    sinergistas: 'Tríceps',
    equipamento: 'Máquina Articulada Declinada',
    posicao_inicial: 'Sentado com encosto declinado, manoplas alinhadas com a porção inferior do tórax.',
    concentrica: 'Empurre para a frente e ligeiramente para baixo estendendo os cotovelos.',
    excentrica: 'Controle o retorno em 2 a 3 segundos até o alongamento do feixe inferior.',
    passos: [
      'Ajuste o assento e fixe as costas.',
      'Empurre as manoplas ativando o peitoral inferior.',
      'Sustente 1 segundo no pico de contração.',
      'Retorne com suavidade.'
    ],
    checkpoints: ['Trajetória descendente suave', 'Pés apoiados', 'Controle constante'],
    respiracao: 'Inspire na volta; expire na extensão.',
    erro_comum: 'Soltar os braços na fase de retorno perdendo o controle excêntrico.',
    beneficio: 'Foco no peitoral inferior com mínimo impacto nos ombros.'
  },
  112: {
    id: 112,
    slug: 'chest-press-convergente',
    nome: 'Chest Press Sentado Convergente',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Médio e Superior)',
    sinergistas: 'Tríceps e Deltoide Anterior',
    equipamento: 'Máquina Chest Press com Manoplas Convergentes',
    posicao_inicial: 'Sentado com a coluna alinhada no encosto vertical. Manoplas na altura do peitoral médio.',
    concentrica: 'Empurre as manoplas para a frente convergindo as mãos em direção ao centro sem encostá-las.',
    excentrica: 'Retorne em 3 segundos permitindo a abertura dos braços até o limite articular seguro.',
    passos: [
      'Ajuste a altura do assento.',
      'Segure as manoplas e retraia as escápulas.',
      'Pressione para a frente acompanhando o arco convergente.',
      'Aperte o peitoral no ponto máximo e retorne suavemente.'
    ],
    checkpoints: ['Acompanhe a curva convergente da máquina', 'Cotovelos alinhados', 'Pés plantados'],
    respiracao: 'Inspire na abertura; expire no fechamento.',
    erro_comum: 'Projetar os ombros para a frente no final do percurso.',
    beneficio: 'A convergência simula a adução anatômica natural do peitoral, gerando contração máxima.'
  },
  113: {
    id: 113,
    slug: 'crucifixo-declinado-halteres',
    nome: 'Crucifixo Declinado com Halteres',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Inferiores)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Declinado + Halteres',
    posicao_inicial: 'Deitado no banco declinado com pernas travadas, halteres estendidos sobre o peito inferior com cotovelos levemente dobrados.',
    concentrica: 'Aproxime os halteres em arco até ficarem sobre a linha inferior do peito.',
    excentrica: 'Abra os braços em arco descendente em 2 a 3 segundos até o limite do alinhamento do tronco.',
    passos: [
      'Trave as pernas e deite com os halteres no alto.',
      'Abra os braços em arco circular com cotovelos a 15°.',
      'Desça até sentir alongamento na base do peitoral.',
      'Feche o arco espremendo a musculatura inferior.'
    ],
    checkpoints: ['Pernas presas com firmeza', 'Ângulo de cotovelo estável', 'Arco suave'],
    respiracao: 'Inspire abrindo; expire fechando.',
    erro_comum: 'Flexionar os braços transformando em supino.',
    beneficio: 'Isolamento com foco exclusivo na expansão e definição do contorno inferior do peitoral.'
  },
  114: {
    id: 114,
    slug: 'crucifixo-inclinado-polia',
    nome: 'Crucifixo Inclinado na Polia',
    grupo: 'Peito',
    alvo: 'Peitoral Superior (Porção Clavicular)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Inclinado 30° entre duas Polias Baixas + Pegadores',
    posicao_inicial: 'Banco a 30° no centro das polias baixas. Deite-se segurando os pegadores com cotovelos levemente flexionados.',
    concentrica: 'Feche os cabos em arco em direção ao peitoral superior, sustentando a tensão contínua do cabo.',
    excentrica: 'Abra os braços em 3 segundos controlando a tração dos cabos até o alongamento peitoral.',
    passos: [
      'Posicione o banco no centro das duas polias baixas.',
      'Pegue os cabos e deite com escápulas travadas.',
      'Feche os braços em arco trazendo as mãos sobre a clavícula.',
      'Abra devagar sentindo a tração contínua dos cabos.'
    ],
    checkpoints: ['Tensão constante no topo e no fundo', 'Cotovelos levemente flexionados', 'Estabilidade total'],
    respiracao: 'Inspire abrindo; expire fechando.',
    erro_comum: 'Deixar o peso puxar os braços bruscamente no fundo do movimento.',
    beneficio: 'Ao contrário dos halteres, os cabos mantêm sobrecarga máxima mesmo no topo do movimento.'
  },
  115: {
    id: 115,
    slug: 'crucifixo-reto-polia-banco',
    nome: 'Crucifixo Reto na Polia no Banco',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Médias)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Reto no meio do Crossover com Polias Baixas',
    posicao_inicial: 'Deitado no banco reto entre duas polias baixas, braços abertos segurando as manoplas.',
    concentrica: 'Aproxime as mãos em arco sobre o meio do peito, mantendo a contração por 1 segundo.',
    excentrica: 'Abra os braços em 2 a 3 segundos sentindo o peito esticar sem descer além do plano do banco.',
    passos: [
      'Deite no banco centralizado entre as polias.',
      'Segure os pegadores com cotovelos ligeiramente destravados.',
      'Suba em arco amplo até as mãos se aproximarem sobre o esterno.',
      'Abra controlando a resistência dos cabos.'
    ],
    checkpoints: ['Banco perfeitamente centralizado', 'Tensão ininterrupta', 'Escápulas no encosto'],
    respiracao: 'Inspire abrindo; expire fechando.',
    erro_comum: 'Balançar o tronco ou arquear a lombar de maneira exagerada.',
    beneficio: 'Combina a estabilidade do banco com a curva de resistência perfeita dos cabos.'
  },
  116: {
    id: 116,
    slug: 'flexao-diamante',
    nome: 'Flexão Diamante',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Mediais) & Tríceps Braquial',
    sinergistas: 'Deltoide Anterior e Core',
    equipamento: 'Peso Corporal (Chão)',
    posicao_inicial: 'Posição de flexão com polegares e indicadores unidos sob o esterno formando a figura de um diamante/triângulo.',
    concentrica: 'Empurre o chão estendendo os cotovelos com forte contração do tríceps e miolo do peitoral.',
    excentrica: 'Desça o corpo em linha reta até o peito quase tocar as mãos em 2 a 3 segundos.',
    passos: [
      'Monte a prancha e junte as mãos no chão formando um diamante.',
      'Trave o abdômen e os glúteos.',
      'Desça o corpo em bloco até o peito encostar nas mãos.',
      'Empurre o chão de forma potente até o topo.'
    ],
    checkpoints: ['Mãos em formato de diamante sob o peito', 'Cotovelos colados ao tronco', 'Coluna neutra'],
    respiracao: 'Inspire na descida; expire no topo.',
    erro_comum: 'Deixar os cotovelos abrirem em excesso ou flexionar a coluna cervical.',
    beneficio: 'Forte ênfase na adução medial do peitoral e recrutamento massivo de todas as cabeças do tríceps.'
  },
  117: {
    id: 117,
    slug: 'flexao-declinada-pes-elevados',
    nome: 'Flexão Declinada com Pés Elevados',
    grupo: 'Peito',
    alvo: 'Peitoral Superior e Deltoide Anterior',
    sinergistas: 'Tríceps e Core',
    equipamento: 'Banco / Caixa + Chão',
    posicao_inicial: 'Pés apoiados sobre um banco ou caixa e mãos no chão na largura dos ombros.',
    concentrica: 'Empurre o solo com firmeza até a extensão dos braços, focando na porção clavicular.',
    excentrica: 'Desça a cabeça e peito em direção ao chão em 2 a 3 segundos mantendo o core blindado.',
    passos: [
      'Apoie as pontas dos pés no banco e mãos firmes no chão.',
      'Mantenha o corpo perfeitamente reto da cabeça aos pés.',
      'Desça até o nariz/peito quase tocar o chão.',
      'Empurre para cima com potência.'
    ],
    checkpoints: ['Pés elevados a 30-40cm', 'Core contraído sem deixar a pelve cair', 'Cotovelos a 45°'],
    respiracao: 'Inspire na descida; expire ao empurrar.',
    erro_comum: 'Desabar a lombar criando hiperextensão prejudicial.',
    beneficio: 'Aumenta a porcentagem de peso corporal levantada e direciona a sobrecarga para a porção superior do peitoral.'
  },
  118: {
    id: 118,
    slug: 'flexao-inclinada-maos-elevadas',
    nome: 'Flexão Inclinada com Mãos Elevadas',
    grupo: 'Peito',
    alvo: 'Peitoral Inferior e Geral',
    sinergistas: 'Tríceps e Ombros',
    equipamento: 'Banco / Step',
    posicao_inicial: 'Mãos apoiadas na borda do banco e pés no solo, corpo inclinado em linha reta.',
    concentrica: 'Empurre o banco estendendo os braços com foco no peitoral inferior.',
    excentrica: 'Desça o peito em direção à borda do banco em 2 a 3 segundos.',
    passos: [
      'Apoie as mãos no banco com largura ligeiramente maior que os ombros.',
      'Alinhe pés e tronco em prancha sólida.',
      'Desça o peito até tocar suavemente a borda.',
      'Empurre estendendo os braços com controle.'
    ],
    checkpoints: ['Corpo rígido', 'Mãos firmes na borda', 'Amplitude completa até o peito'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Empinar o quadril para trás reduzindo o esforço peitoral.',
    beneficio: 'Excelente variação regressiva para iniciantes ou para finalizar treinos com alto volume metabólico.'
  },
  119: {
    id: 119,
    slug: 'flexao-deficit-blocos',
    nome: 'Flexão com Déficit em Blocos',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Hipertrofia no Ponto de Alongamento Máximo)',
    sinergistas: 'Deltoide Anterior e Tríceps',
    equipamento: '2 Blocos de Madeira / Anilhas / Parallettes',
    posicao_inicial: 'Mãos apoiadas sobre dois blocos elevados (10-15cm do solo) e pés no chão, corpo em prancha.',
    concentrica: 'Empurre os blocos até o retorno à posição de prancha no topo.',
    excentrica: 'Desça o peito abaixo do nível das mãos em 3 segundos, aproveitando a profundidade extra sem dor articular.',
    passos: [
      'Posicione os blocos na largura dos ombros.',
      'Apoie as mãos e entre em posição de prancha.',
      'Desça o peito abaixo do nível dos blocos sentindo alongamento profundo.',
      'Empurre com força muscular constante até o topo.'
    ],
    checkpoints: ['Desça abaixo do nível das mãos com conforto articular', 'Core ativado', 'Movimento sem pressa'],
    respiracao: 'Inspire na descida profunda; expire na subida.',
    erro_comum: 'Descer com velocidade descontrolada arriscando lesão no ombro no ponto de máxima profundidade.',
    beneficio: 'Aumenta significativamente a amplitude de movimento (ROM), recrutando mais fibras por hipertrofia mediada por alongamento.'
  },
  120: {
    id: 120,
    slug: 'spoto-press-supino',
    nome: 'Spoto Press com Pausa no Supino',
    grupo: 'Peito',
    alvo: 'Peitoral Maior e Tríceps (Ponto de Transição e Força Estática)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Reto + Barra Olímpica',
    posicao_inicial: 'Posição idêntica ao supino reto convencional com escápulas travadas e pés cravados no piso.',
    concentrica: 'Após a pausa estática no ar, acelere a barra para cima com máxima força concêntrica.',
    excentrica: 'Desça a barra controladamente e pare bruscamente a exatamente 2 a 3 cm acima do peito, segurando imóvel no ar por 1 a 2 segundos sem encostar no tórax.',
    passos: [
      'Retire a barra do suporte e posicione sobre o peito.',
      'Desça controlando até 2-3 cm do peito.',
      'Congele a barra no ar por 1 a 2 segundos com tensão isométrica extrema.',
      'Empurre de forma explosiva até a extensão dos braços.'
    ],
    checkpoints: ['Parar a barra 2-3 cm do peito sem encostar', 'Pausa visível de 1 a 2 segundos', 'Manter escápulas aduzidas'],
    respiracao: 'Inspire na descida, segure na pausa isométrica e expire na subida.',
    erro_comum: 'Deixar a barra encostar na camisa ou no peito durante a pausa.',
    beneficio: 'Elimina o reflexo miotático e a energia elástica, desenvolvendo força concêntrica pura e estabilização de elite no supino.'
  },
  121: {
    id: 121,
    slug: 'larsen-press-sem-pes',
    nome: 'Larsen Press (Supino sem Apoio dos Pés)',
    grupo: 'Peito',
    alvo: 'Peitoral Maior e Tríceps (Isolamento Puro da Cadeia Superior)',
    sinergistas: 'Deltoide Anterior e Core',
    equipamento: 'Banco Reto + Barra Olímpica',
    posicao_inicial: 'Deitado no banco reto com as pernas estendidas à frente flutuando no ar ou descansando esticadas, sem nenhum apoio dos pés no solo.',
    concentrica: 'Empurre a barra para cima usando exclusivamente a força muscular do tronco, estabilizando o corpo no banco pelo core.',
    excentrica: 'Desça a barra em 3 segundos controlados até o esterno, sem balançar o corpo lateralmente.',
    passos: [
      'Deite no banco e estenda as pernas para frente sem encostar os pés no chão.',
      'Retire a barra equilibrando o centro de gravidade.',
      'Desça com máxima suavidade até tocar o peito.',
      'Empurre a barra estritamente com os membros superiores e core.'
    ],
    checkpoints: ['Pés sem contato com o solo', 'Zero impulso de pernas (sem leg drive)', 'Equilíbrio e cadência uniforme'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Balançar o corpo de lado a lado por falta de estabilidade no banco.',
    beneficio: 'Elimina o leg drive e o arco excessivo, forçando o peitoral a produzir 100% da força de empurrar com estrita retração escapular.'
  },
  122: {
    id: 122,
    slug: 'svend-press-anilha',
    nome: 'Svend Press com Anilha',
    grupo: 'Peito',
    alvo: 'Peitoral Maior (Fibras Mediais e Pico de Isometria)',
    sinergistas: 'Deltoide Anterior',
    equipamento: '1 ou 2 Anilhas de 5kg ou 10kg',
    posicao_inicial: 'Em pé ou sentado com postura ereta. Segure uma anilha (ou duas prensadas juntas) entre as palmas das mãos na altura do peito, com os cotovelos flexionados.',
    concentrica: 'Empurre a anilha para a frente em linha reta estendendo os braços, enquanto aperta continuamente as palmas uma contra a outra com máxima força.',
    excentrica: 'Traga a anilha de volta em direção ao esterno em 2 segundos sem diminuir a pressão das mãos contra o peso.',
    passos: [
      'Pressione a anilha firmemente entre as palmas das mãos na linha do peito.',
      'Mantenha a força de compressão máxima nas mãos e estenda os braços para frente.',
      'Sustente 2 segundos no ponto de extensão máxima com o peito espremido.',
      'Retorne devagar mantendo a anilha sob forte aperto.'
    ],
    checkpoints: ['Apertar as mãos contra a anilha durante todo o tempo', 'Braços sobem no nível do peito', 'Tronco reto'],
    respiracao: 'Inspire ao recolher; expire ao empurrar para a frente.',
    erro_comum: 'Apenas segurar a anilha pelos dedos sem exercer a força de compressão das palmas.',
    beneficio: 'Cria uma das maiores contrações isométricas possíveis nas fibras internas do peitoral, gerando pump e estímulo vascular excepcional.'
  }
};
