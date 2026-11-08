/**
 * Biomecânica de Braços & Antebraços — 66 Exercícios (Bíceps 41-50 & 171-186, Tríceps 51-60 & 195-214, Antebraços 99-100 & 187-194)
 * Cabeça longa, cabeça curta do bíceps, braquial, braquiorradial, tríceps medial, lateral e longo, flexores e extensores de punho.
 */

export const ARMS_BIOMECHANICS = {
  // =========================================================================
  // BÍCEPS (26 EXERCÍCIOS)
  // =========================================================================
  41: {
    id: 41,
    slug: 'rosca-direta-barra',
    nome: 'Rosca Direta com Barra',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta e Longa)',
    sinergistas: 'Braquial, Braquiorradial e Deltoide Anterior',
    equipamento: 'Barra Reta ou Barra W + Anilhas',
    posicao_inicial: 'Em pé com pés na largura dos ombros, glúteos contraídos e abdômen firme. Segure a barra com pegada supinada na largura dos ombros, cotovelos posicionados junto às costelas.',
    concentrica: 'Flexione os cotovelos erguendo a barra em arco semicircular até a altura do peito, mantendo os cotovelos travados na lateral do corpo sem projetá-los para a frente.',
    excentrica: 'Desça a barra em 2 a 3 segundos controlados até a extensão quase completa dos braços sem relaxar a tensão muscular.',
    passos: [
      'Segure a barra com pegada supinada e postura ereta.',
      'Fixe os cotovelos ao lado do tronco.',
      'Suba a barra contraindo os bíceps até o pico.',
      'Desça de maneira suave resistindo à carga.'
    ],
    checkpoints: [
      'Cotovelos permanecem colados às laterais (não projetar para a frente).',
      'Coluna reta sem balanço ou gangorra lombar.',
      'Supinação máxima durante a subida.'
    ],
    respiracao: 'Inspire na descida; expire com força na flexão do cotovelo.',
    erro_comum: 'Balançar o tronco para trás e projetar os cotovelos para a frente, transformando o exercício em uma elevação frontal de ombro.',
    beneficio: 'O exercício construtor de massa mais tradicional para o bíceps braquial, permitindo manipular as maiores cargas para os flexores do cotovelo.'
  },
  42: {
    id: 42,
    slug: 'rosca-alternada',
    nome: 'Rosca Alternada',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial com Supinação Dinâmica',
    sinergistas: 'Braquial e Braquiorradial',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com halteres ao lado das coxas em pegada neutra (palmas para dentro). Postura alinhada e peito aberto.',
    concentrica: 'Inicie a subida de um braço girando o punho para fora (supinação) a partir do meio do percurso, finalizando com o dedo mindinho mais alto que o polegar para pico de contração.',
    excentrica: 'Desça o halter em 2 a 3 segundos girando de volta para a pegada neutra, e então inicie com o braço oposto.',
    passos: [
      'Segure os halteres ao lado do corpo em pegada neutra.',
      'Suba um halter girando o punho para cima (supinação total).',
      'Aperte o bíceps no topo por 1 segundo.',
      'Desça controlando e repita no outro braço.'
    ],
    checkpoints: [
      'Supinação ativa (virar a palma da mão para fora no topo).',
      'Cotovelos fixos ao lado do tronco.',
      'Tronco reto sem inclinar para o lado que levanta o peso.'
    ],
    respiracao: 'Expire na subida de cada braço; inspire na descida controlada.',
    erro_comum: 'Girar o corpo de um lado para o outro para ajudar o halter a subir.',
    beneficio: 'A supinação dinâmica ativa as duas funções anatômicas primárias do bíceps braquial: flexão do cotovelo e supinação do antebraço.'
  },
  43: {
    id: 43,
    slug: 'rosca-martelo-halteres',
    nome: 'Rosca Martelo com Halteres',
    grupo: 'Bíceps',
    alvo: 'Braquial, Braquiorradial e Bíceps (Cabeça Longa)',
    sinergistas: 'Flexores e Extensores do Antebraço',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com postura ereta segurando os halteres com pegada neutra (palmas voltadas uma para a outra) durante 100% da série.',
    concentrica: 'Flexione os cotovelos erguendo os halteres verticalmente mantendo a pegada neutra rígida até a linha do ombro.',
    excentrica: 'Desça em 2 a 3 segundos controlados até a extensão dos braços.',
    passos: [
      'Mantenha as palmas viradas para dentro.',
      'Suba os halteres em linha reta como se estivesse martelando.',
      'Sustente 1 segundo no topo com forte aperto nas mãos.',
      'Desça suavemente até a lateral das coxas.'
    ],
    checkpoints: ['Palmas sempre paralelas', 'Cotovelos firmes ao lado do corpo', 'Antebraços ativos'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Girar os punhos no topo ou abrir os cotovelos para os lados.',
    beneficio: 'Hipertrofia o músculo braquial (que fica por baixo do bíceps, empurrando-o para cima e dando espessura ao braço) e o braquiorradial do antebraço.'
  },
  44: {
    id: 44,
    slug: 'rosca-martelo-corda',
    nome: 'Rosca Martelo na Corda',
    grupo: 'Bíceps',
    alvo: 'Braquial e Braquiorradial',
    sinergistas: 'Bíceps Braquial',
    equipamento: 'Polia Baixa + Corda',
    posicao_inicial: 'Em pé de frente para a polia baixa segurando as pontas da corda com pegada neutra.',
    concentrica: 'Flexione os cotovelos puxando a corda para cima até o peito, mantendo as mãos paralelas.',
    excentrica: 'Desça em 3 segundos sentindo a tração contínua do cabo.',
    passos: [
      'Segure as pontas da corda em pegada neutra.',
      'Puxe a corda para cima mantendo os cotovelos nas costelas.',
      'Aperte o topo da contração por 1 segundo.',
      'Retorne de forma compassada.'
    ],
    checkpoints: ['Tensão do cabo contínua', 'Cotovelos travados', 'Postura ereta'],
    respiracao: 'Inspire descendo; expire puxando.',
    erro_comum: 'Afastar as mãos em excesso no topo perdendo a linha neutra.',
    beneficio: 'Proporciona tensão uniforme para o braquial e antebraço sem perda de torque gravitacional no fundo.'
  },
  45: {
    id: 45,
    slug: 'rosca-scott-barra-w',
    nome: 'Rosca Scott com Barra W',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta - Isolamento Estrito)',
    sinergistas: 'Braquial e Antebraço',
    equipamento: 'Banco Scott (Preacher Bench) + Barra W',
    posicao_inicial: 'Sentado no banco Scott com o peito apoiado na parte superior do encosto e as axilas bem encaixadas no topo da almofada. Braços totalmente apoiados na descida da almofada, segurando a barra W na curva interna.',
    concentrica: 'Flexione os cotovelos erguendo a barra até a posição quase vertical, parando antes da barra perder a tensão contra a gravidade.',
    excentrica: 'Desça a barra em 3 segundos controlados até a extensão quase completa dos cotovelos (mantenha uma leve flexão de segurança para não hiperextender os tendões).',
    passos: [
      'Encaixe as axilas no topo do banco e apoie os braços inteiros.',
      'Segure a barra W na curvatura supinada confortável.',
      'Suba a barra com força estrita do bíceps até 80°.',
      'Desça de maneira compassada sentindo o alongamento sem bater as articulações no fundo.'
    ],
    checkpoints: [
      'Axilas coladas no topo do banco Scott durante todo o tempo.',
      'Não descer até o estalo de hiperextensão articular do cotovelo.',
      'Não subir até 90° onde o peso descansa sobre a gravidade.'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Soltar a barra rápido na descida e esticar o cotovelo bruscamente sob carga pesada, com risco de ruptura distal do tendão do bíceps.',
    beneficio: 'Isola o bíceps no ponto de maior sobrecarga no comprimento alongado, enfatizando a cabeça curta e o volume frontal do braço.'
  },
  46: {
    id: 46,
    slug: 'rosca-scott-maquina',
    nome: 'Rosca Scott na Máquina',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta)',
    sinergistas: 'Braquial',
    equipamento: 'Máquina Biceps Curl / Preacher Machine',
    posicao_inicial: 'Sentado com assento ajustado para que o eixo do cotovelo fique alinhado com o eixo giratório da máquina. Braços apoiados na almofada.',
    concentrica: 'Puxe as manoplas para cima até a flexão máxima, mantendo a contração por 1 segundo.',
    excentrica: 'Retorne em 3 segundos controlados resistindo à carga das placas.',
    passos: [
      'Ajuste o assento para alinhar os cotovelos ao pivô da máquina.',
      'Apoie os braços e segure as manoplas.',
      'Flexione com força máxima até o pico.',
      'Desça devagar aproveitando a curva de resistência uniforme.'
    ],
    checkpoints: ['Pivô da máquina alinhado com o cotovelo', 'Peito apoiado', 'Retorno suave'],
    respiracao: 'Inspire na volta; expire na flexão.',
    erro_comum: 'Levantar o bumbum do banco para iniciar o movimento.',
    beneficio: 'Curva de resistência mecânica constante que mantém o bíceps sob tensão inclusive no topo da repetição.'
  },
  47: {
    id: 47,
    slug: 'rosca-concentrada',
    nome: 'Rosca Concentrada',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Pico de Contração Isométrica)',
    sinergistas: 'Braquial',
    equipamento: 'Banco Reto + 1 Halter',
    posicao_inicial: 'Sentado na ponta do banco com pernas afastadas. Apoie a parte posterior do braço (tríceps) contra a face interna da coxa do mesmo lado. Braço estendido segurando o halter.',
    concentrica: 'Flexione o cotovelo erguendo o halter em direção ao ombro, espremendo o pico do bíceps por 1 a 2 segundos no topo.',
    excentrica: 'Desça o halter em 3 segundos controlados até a extensão total.',
    passos: [
      'Apoie o braço firmemente na parte interna da coxa.',
      'Segure o halter com pegada supinada.',
      'Suba o peso focalizando 100% da atenção mental no bíceps.',
      'Aperte o músculo no topo e desça lentamente.'
    ],
    checkpoints: ['Braço fixo na coxa sem se mover', 'Zero impulso do tronco', 'Pausa no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar o tronco para trás para descolar o halter da coxa.',
    beneficio: 'Um dos exercícios com maior ativação eletromiográfica do bíceps, eliminando qualquer ajuda de músculos secundários.'
  },
  48: {
    id: 48,
    slug: 'rosca-inversa',
    nome: 'Rosca Inversa',
    grupo: 'Bíceps',
    alvo: 'Braquiorradial e Extensores do Punho',
    sinergistas: 'Braquial e Bíceps (em menor grau)',
    equipamento: 'Barra W / Barra Reta + Anilhas',
    posicao_inicial: 'Em pé segurando a barra com pegada pronada (palmas voltadas para baixo) na largura dos ombros.',
    concentrica: 'Flexione os cotovelos erguendo a barra com as palmas para baixo até a linha do peito.',
    excentrica: 'Desça em 2 a 3 segundos mantendo os punhos retos e alinhados.',
    passos: [
      'Segure a barra com pegada pronada firme.',
      'Mantenha os cotovelos colados ao tronco.',
      'Suba a barra com a força dos antebraços.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Palmas para baixo o tempo todo', 'Punhos retos sem dobrar para trás', 'Cotovelos estáveis'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar os punhos caírem em flexão durante o movimento.',
    beneficio: 'Desenvolve espessura e força no braquiorradial (antebraço superior), melhorando a pegada e a estética geral dos braços.'
  },
  49: {
    id: 49,
    slug: 'rosca-polia-baixa',
    nome: 'Rosca na Polia Baixa',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial',
    sinergistas: 'Braquial e Antebraço',
    equipamento: 'Polia Baixa + Barra Reta ou Barra W',
    posicao_inicial: 'Em pé de frente para a polia baixa segurando a barra com pegada supinada na largura dos ombros.',
    concentrica: 'Puxe a barra para cima flexionando os cotovelos até o peito.',
    excentrica: 'Desça em 3 segundos sentindo o cabo resistir suavemente.',
    passos: [
      'Fique a um passo da polia baixa com postura alinhada.',
      'Flexione os braços mantendo os cotovelos nas costelas.',
      'Sustente a contração no topo por 1 segundo.',
      'Retorne devagar acompanhando a linha do cabo.'
    ],
    checkpoints: ['Tração contínua no início e no fim', 'Tronco reto', 'Cotovelos fixos'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Dar trancos com as costas na saída do movimento.',
    beneficio: 'Oferece tensão contínua em todo o arco de movimento, sendo muito gentil com os tendões do cotovelo.'
  },
  50: {
    id: 50,
    slug: 'rosca-aranha-spider-curl',
    nome: 'Rosca Aranha (Spider Curl)',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta - Pico de Encurtamento)',
    sinergistas: 'Braquial',
    equipamento: 'Banco Scott Invertido ou Banco Inclinado 45° + Barra W',
    posicao_inicial: 'Deitado de bruços no lado reto do banco Scott ou em um banco a 45°. Braços pendendo verticalmente perpendiculares ao solo segurando a barra W.',
    concentrica: 'Flexione os cotovelos erguendo a barra para cima e para a frente até a contração máxima.',
    excentrica: 'Desça a barra em 3 segundos até a extensão vertical completa dos braços.',
    passos: [
      'Apoie o peito no encosto com os braços pendendo para o chão.',
      'Segure a barra W com pegada supinada.',
      'Flexione os cotovelos sem movimentar os ombros.',
      'Desça suavemente até a vertical.'
    ],
    checkpoints: ['Braços estritamente verticais', 'Peito apoiado', 'Pico de contração de 1s'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar os braços para frente usando inércia.',
    beneficio: 'Mantém os ombros em flexão anterior fixa, eliminando a cabeça longa e isolando a cabeça curta no pico de encurtamento.'
  },
  171: {
    id: 171,
    slug: 'rosca-direta-halteres',
    nome: 'Rosca Direta com Halteres',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial Bilateral',
    sinergistas: 'Braquial e Antebraço',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé segurando os halteres simultaneamente com pegada supinada fixa na frente das coxas.',
    concentrica: 'Suba ambos os halteres juntos até o peito mantendo os cotovelos ao lado das costelas.',
    excentrica: 'Desça em 2 a 3 segundos com controle simultâneo.',
    passos: [
      'Fique ereto com os dois halteres em pegada supinada.',
      'Suba os dois braços ao mesmo tempo.',
      'Aperte os bíceps no topo.',
      'Desça de forma compassada.'
    ],
    checkpoints: ['Movimento simétrico dos dois braços', 'Cotovelos fixos', 'Sem balanço'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Subir um braço mais rápido que o outro por desequilíbrio de força.',
    beneficio: 'Garante que cada braço produza força independente sem a barra mascarar déficits de força.'
  },
  172: {
    id: 172,
    slug: 'rosca-banco-inclinado-45-halteres',
    nome: 'Rosca no Banco Inclinado 45° com Halteres',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Longa no Alongamento Máximo)',
    sinergistas: 'Braquial',
    equipamento: 'Banco Inclinado 45°-60° + Halteres',
    posicao_inicial: 'Sentado com as costas coladas no banco inclinado a 45°. Braços pendendo verticalmente para trás da linha do tronco segurando os halteres com pegada supinada.',
    concentrica: 'Flexione os cotovelos erguendo os halteres mantendo os cotovelos posicionados para trás.',
    excentrica: 'Desça em 3 segundos sentindo um alongamento profundo na parte superior do bíceps no ombro.',
    passos: [
      'Deite no banco inclinado a 45° com os braços pendendo para trás.',
      'Inicie a flexão mantendo os cotovelos apontando para o chão.',
      'Suba até a contração máxima.',
      'Desça devagar aproveitando o estiramento das fibras.'
    ],
    checkpoints: [
      'Cotovelos permanecem atrás do tronco durante todo o exercício.',
      'Alongamento seguro no fundo.',
      'Cabeça encostada no banco.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Projetar os cotovelos para a frente na subida para aliviar a tensão do alongamento.',
    beneficio: 'Coloca a cabeça longa do bíceps sob estiramento passivo extremo por hiperextensão do ombro, gerando hipertrofia mediada por alongamento.'
  },
  173: {
    id: 173,
    slug: 'rosca-scott-unilateral-halter',
    nome: 'Rosca Scott Unilateral com Halter',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta Unilateral)',
    sinergistas: 'Braquial',
    equipamento: 'Banco Scott + 1 Halter',
    posicao_inicial: 'Apoie o braço no banco Scott com axila bem encaixada, segurando o halter com pegada supinada.',
    concentrica: 'Flexione o cotovelo até o pico de contração sem descolar o braço da almofada.',
    excentrica: 'Desça em 3 segundos controlados até a extensão quase completa.',
    passos: [
      'Apoie o braço com precisão no banco Scott.',
      'Suba o halter concentrando na contração da cabeça curta.',
      'Sustente 1 segundo no topo.',
      'Desça suavemente até esticar o braço.'
    ],
    checkpoints: ['Braço totalmente apoiado', 'Foco unilateral estrito', 'Descida suave sem estalo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Descolar a axila do banco para compensar o peso.',
    beneficio: 'Permite rotação natural do punho durante o percurso e correção de assimetrias anatômicas.'
  },
  174: {
    id: 174,
    slug: 'rosca-21-barra-w',
    nome: 'Rosca 21 com Barra W',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Volume Metabólico & Oclusão)',
    sinergistas: 'Braquial e Antebraço',
    equipamento: 'Barra W + Anilhas Moderadas',
    posicao_inicial: 'Em pé com postura ereta segurando a barra W.',
    concentrica: 'Execute 7 repetições da parte inferior até 90°, depois 7 repetições de 90° até o topo, e finalize com 7 repetições completas (totalizando 21 repetições ininterruptas).',
    excentrica: 'Mantenha controle de 2 segundos em cada fase do movimento.',
    passos: [
      'Faça 7 repetições parciais inferiores (do fundo até 90°).',
      'Sem parar, faça 7 repetições parciais superiores (de 90° até o peito).',
      'Sem descansar, execute 7 repetições completas com amplitude total.',
      'Totalize 21 repetições com queimação muscular intensa.'
    ],
    checkpoints: ['7 reps inferiores + 7 reps superiores + 7 reps completas', 'Sem descansar entre as fases', 'Carga leve/moderada'],
    respiracao: 'Respire continuamente durante as 21 repetições.',
    erro_comum: 'Usar carga pesada demais e falhar antes de completar as repetições superiores.',
    beneficio: 'Método consagrado de intensidade que causa acúmulo de metabólitos, estresse celular e pump vascular extremo.'
  },
  175: {
    id: 175,
    slug: 'rosca-drag-curl-barra',
    nome: 'Rosca Drag com Barra (Drag Curl)',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Pico da Cabeça Longa)',
    sinergistas: 'Deltoide Posterior',
    equipamento: 'Barra Olímpica ou Smith Machine',
    posicao_inicial: 'Em pé segurando a barra na frente das coxas com pegada supinada.',
    concentrica: 'Puxe a barra para cima raspando-a verticalmente contra o abdômen e o peito, projetando os cotovelos para trás e para cima.',
    excentrica: 'Desça a barra raspando no corpo de volta às coxas.',
    passos: [
      'Segure a barra com pegada supinada.',
      'Puxe a barra arrastando-a no tronco enquanto joga os cotovelos para trás.',
      'Aperte o bíceps no topo na linha do peitoral.',
      'Desça rente ao corpo.'
    ],
    checkpoints: [
      'A barra sobe em linha reta vertical colada ao tronco (não em arco).',
      'Cotovelos se movem para trás e para cima.',
      'Zero participação do deltoide anterior.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Jogar a barra para a frente em arco como uma rosca direta comum.',
    beneficio: 'Elimina a participação do deltoide anterior por manter a barra em trajeto vertical colada ao corpo, isolando o bíceps no pico.'
  },
  176: {
    id: 176,
    slug: 'rosca-zottman-halteres',
    nome: 'Rosca Zottman com Halteres',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial na Subida e Braquiorradial na Descida',
    sinergistas: 'Extensores do Antebraço e Braquial',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé segurando os halteres com as palmas voltadas para a frente (supinadas).',
    concentrica: 'Suba os halteres em rosca supinada focando na força máxima do bíceps até a altura dos ombros.',
    excentrica: 'No topo, gire os punhos 180° para pegada pronada (palmas para baixo) e desça em 3 segundos trabalhando os antebraços.',
    passos: [
      'Suba com palmas para cima (supinada) contraindo o bíceps.',
      'No topo, gire os punhos para palmas para baixo (pronada).',
      'Desça controlando a carga com os músculos do antebraço.',
      'No fundo, gire de volta para palmas para cima e repita.'
    ],
    checkpoints: ['Subida supinada (bíceps) e descida pronada (antebraço)', 'Rotação suave no topo', 'Descida lenta de 3s'],
    respiracao: 'Expire na subida; inspire na descida.',
    erro_comum: 'Girar os punhos antes da hora no meio da subida.',
    beneficio: 'Combina o melhor dos dois mundos: sobrecarga pesada concêntrica para o bíceps e sobrecarga excêntrica no braquiorradial.'
  },
  177: {
    id: 177,
    slug: 'rosca-martelo-banco-inclinado',
    nome: 'Rosca Martelo no Banco Inclinado',
    grupo: 'Bíceps',
    alvo: 'Braquial e Cabeça Longa no Alongamento',
    sinergistas: 'Braquiorradial',
    equipamento: 'Banco Inclinado 45°-60° + Halteres',
    posicao_inicial: 'Sentado no banco inclinado segurando os halteres com pegada neutra ao lado do tronco.',
    concentrica: 'Suba os halteres mantendo as palmas para dentro até a linha do ombro.',
    excentrica: 'Desça em 3 segundos até a extensão dos braços atrás da linha do tronco.',
    passos: [
      'Apoie as costas no encosto inclinado.',
      'Segure em pegada neutra e suba em martelo.',
      'Sustente 1 segundo.',
      'Desça de maneira compassada sentindo o estiramento.'
    ],
    checkpoints: ['Palmas paralelas', 'Costas apoiadas', 'Cotovelos posicionados para trás'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Descolar os ombros do encosto.',
    beneficio: 'Enfatiza a cabeça longa do bíceps e o braquial a partir de uma posição de pré-alongamento articular.'
  },
  178: {
    id: 178,
    slug: 'rosca-martelo-cruzada-cross-body',
    nome: 'Rosca Martelo Cruzada no Peito (Cross-Body)',
    grupo: 'Bíceps',
    alvo: 'Braquial e Cabeça Longa do Bíceps',
    sinergistas: 'Braquiorradial',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé segurando os halteres com pegada neutra nas laterais das coxas.',
    concentrica: 'Suba um halter em diagonal cruzando a frente do corpo em direção ao ombro oposto, mantendo a pegada neutra.',
    excentrica: 'Desça em 2 a 3 segundos de volta à lateral da coxa e repita com o outro lado.',
    passos: [
      'Suba o halter direito em diagonal na direção do ombro esquerdo.',
      'Aperte o músculo na frente do peito.',
      'Desça de forma suave até a lateral.',
      'Execute com o braço esquerdo na direção do ombro direito.'
    ],
    checkpoints: ['Trajetória diagonal cruzando o peito', 'Halter quase encosta no ombro oposto', 'Pegada neutra estrita'],
    respiracao: 'Expire na subida cruzada; inspire na volta.',
    erro_comum: 'Girar os ombros acompanhando o movimento do braço.',
    beneficio: 'O ângulo aduzido do ombro coloca o músculo braquial em posição de vantagem mecânica ideal.'
  },
  179: {
    id: 179,
    slug: 'rosca-concentrada-polia-baixa',
    nome: 'Rosca Concentrada na Polia Baixa',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Pico de Contração com Tensão Contínua)',
    sinergistas: 'Braquial',
    equipamento: 'Polia Baixa + Pegador Simples',
    posicao_inicial: 'Sentado ou ajoelhado apoiando o cotovelo na face interna da coxa segurando o cabo.',
    concentrica: 'Flexione o braço em direção ao rosto apertando o bíceps no ápice.',
    excentrica: 'Retorne em 3 segundos mantendo a tração do cabo.',
    passos: [
      'Apoie o braço firme na coxa.',
      'Puxe o cabo trazendo a mão na direção da orelha.',
      'Segure a contração por 1 segundo.',
      'Retorne devagar sem bater os pesos.'
    ],
    checkpoints: ['Braço fixo na coxa', 'Tensão do cabo no topo', 'Respiração controlada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Descolar o cotovelo da perna.',
    beneficio: 'Combina a estabilidade da rosca concentrada com a resistência ininterrupta da polia.'
  },
  180: {
    id: 180,
    slug: 'rosca-crossover-duplo-biceps',
    nome: 'Rosca no Crossover Duplo Bíceps (High Cable Curl)',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta em Encurtamento Extremo)',
    sinergistas: 'Braquial',
    equipamento: 'Crossover com Polias Altas em Ambos os Lados',
    posicao_inicial: 'Em pé no centro do crossover com braços estendidos para os lados na altura dos ombros (posição de cruz), segurando os pegadores das polias altas com pegada supinada.',
    concentrica: 'Flexione ambos os cotovelos simultaneamente puxando as mãos em direção à cabeça como na pose de duplo bíceps no fisiculturismo.',
    excentrica: 'Retorne em 3 segundos até a extensão dos braços na horizontal.',
    passos: [
      'Fique no centro com braços abertos a 90° do tronco.',
      'Flexione os cotovelos trazendo as manoplas para perto das orelhas.',
      'Esprema o pico dos bíceps por 1 a 2 segundos no topo.',
      'Abra os braços devagar mantendo-os elevados na altura dos ombros.'
    ],
    checkpoints: [
      'Cotovelos permanecem na altura dos ombros durante todo o tempo (não deixá-los cair).',
      'Corpo imóvel no centro exato da máquina.',
      'Contração de pico sustentada.'
    ],
    respiracao: 'Inspire na abertura; expire na flexão ao lado da cabeça.',
    erro_comum: 'Abaixar os cotovelos para o chão para conseguir puxar mais carga.',
    beneficio: 'Coloca o ombro em abdução a 90°, alcançando o encurtamento máximo da cabeça curta e gerando pico de contração ímpar.'
  },
  181: {
    id: 181,
    slug: 'rosca-barra-reta-pegada-aberta',
    nome: 'Rosca com Barra Reta Pegada Aberta',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta - Parte Interna)',
    sinergistas: 'Braquial',
    equipamento: 'Barra Reta + Anilhas',
    posicao_inicial: 'Em pé com pegada supinada bem mais aberta que a largura dos ombros.',
    concentrica: 'Suba a barra mantendo os cotovelos firmes na lateral.',
    excentrica: 'Desça em 2 a 3 segundos com controle.',
    passos: [
      'Segure a barra com mãos bem afastadas.',
      'Suba com os cotovelos colados ao tronco.',
      'Aperte a parte interna dos bíceps.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Mãos além da largura dos ombros', 'Foco na cabeça curta', 'Sem balanço'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar o corpo para levantar o peso.',
    beneficio: 'O ângulo aberto força maior recrutamento do feixe medial (cabeça curta) do bíceps.'
  },
  182: {
    id: 182,
    slug: 'rosca-barra-reta-pegada-fechada',
    nome: 'Rosca com Barra Reta Pegada Fechada',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Longa - Parte Externa e Pico)',
    sinergistas: 'Braquial e Braquiorradial',
    equipamento: 'Barra Reta ou W + Anilhas',
    posicao_inicial: 'Em pé com as mãos próximas na barra (cerca de 10-15cm de distância entre as mãos).',
    concentrica: 'Suba a barra até o peito mantendo os cotovelos fechados.',
    excentrica: 'Desça em 2 a 3 segundos controlados.',
    passos: [
      'Segure a barra com mãos próximas no centro.',
      'Suba de forma contínua até o peito.',
      'Sustente a contração no topo.',
      'Desça devagar até o fundo.'
    ],
    checkpoints: ['Mãos fechadas no centro', 'Cotovelos estáveis', 'Coluna alinhada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Abrir demais os cotovelos para os lados.',
    beneficio: 'Enfatiza a rotação externa das fibras da cabeça longa, responsável pela altura do "pico" do bíceps.'
  },
  183: {
    id: 183,
    slug: 'rosca-scott-polia-barra',
    nome: 'Rosca Scott na Polia com Barra',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta com Tensão Contínua)',
    sinergistas: 'Braquial',
    equipamento: 'Banco Scott em frente à Polia Baixa + Barra Pequena',
    posicao_inicial: 'Posicione o banco Scott de frente para a polia baixa segurando a barra conectada ao cabo.',
    concentrica: 'Flexione os cotovelos subindo a barra contra a tração angular do cabo.',
    excentrica: 'Desça em 3 segundos resistindo ao retorno do cabo.',
    passos: [
      'Apoie os braços no banco Scott com o cabo vindo da polia.',
      'Suba a barra com força estrita.',
      'Aperte o topo da contração por 1 segundo.',
      'Desça de maneira suave e contínua.'
    ],
    checkpoints: ['Tração constante inclusive no topo', 'Axilas apoiadas', 'Sem hiperextensão no fundo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Descolar os cotovelos do banco.',
    beneficio: 'Diferente da barra livre no banco Scott (onde a tensão cai a zero no topo), o cabo mantém resistência contínua.'
  },
  184: {
    id: 184,
    slug: 'rosca-inversa-polia-barra',
    nome: 'Rosca Inversa na Polia com Barra',
    grupo: 'Bíceps',
    alvo: 'Braquiorradial e Extensores de Punho',
    sinergistas: 'Braquial',
    equipamento: 'Polia Baixa + Barra Reta',
    posicao_inicial: 'Em pé segurando a barra com pegada pronada na polia baixa.',
    concentrica: 'Suba a barra até o peito mantendo os punhos firmes e travados.',
    excentrica: 'Desça em 3 segundos controlando a velocidade.',
    passos: [
      'Segure a barra com palmas para baixo.',
      'Suba com os cotovelos colados ao tronco.',
      'Segure 1 segundo no topo.',
      'Retorne devagar sem soltar os punhos.'
    ],
    checkpoints: ['Punhos travados em linha neutra', 'Palmas para baixo', 'Tensão suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar a barra dobrar os punhos para trás.',
    beneficio: 'Fortalecimento e hipertrofia da face superior dos antebraços com tensão suave nos ligamentos.'
  },
  185: {
    id: 185,
    slug: 'rosca-bayesiana-polia-bayesian-curl',
    nome: 'Rosca Bayesiana na Polia Baixa (Bayesian Curl)',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Longa no Maior Alongamento Dinâmico)',
    sinergistas: 'Braquial',
    equipamento: 'Polia Baixa + Pegador Simples',
    posicao_inicial: 'De costas para a polia baixa segurando o pegador com o braço estendido para trás e para baixo (ombro em hiperextensão passiva). Dê um passo à frente com base firme.',
    concentrica: 'Flexione o cotovelo erguendo a mão para a frente e para cima mantendo o cotovelo para trás da linha do corpo durante a primeira metade.',
    excentrica: 'Retorne o braço para trás em 3 segundos sentindo um estiramento muscular profundo no bíceps.',
    passos: [
      'Fique de costas para a polia e dê um passo à frente.',
      'Deixe o cabo puxar seu braço estendido para trás do corpo.',
      'Flexione o cotovelo com o braço partindo de trás do tronco.',
      'Retorne devagar aproveitando a tração do cabo no ponto de máximo alongamento.'
    ],
    checkpoints: [
      'Braço inicia posicionado atrás da linha do corpo.',
      'Alongamento extremo da cabeça longa sob tensão contínua.',
      'Tronco estável inclinado ligeiramente para frente.'
    ],
    respiracao: 'Inspire descendo para trás; expire na flexão concêntrica.',
    erro_comum: 'Puxar o cotovelo para a frente logo no início, aliviando o alongamento do cabo.',
    beneficio: 'Criada pela escola de Menno Henselmans, aproveita a ciência mais recente da hipertrofia mediada por alongamento com tensão em comprimento aumentado.'
  },
  186: {
    id: 186,
    slug: 'rosca-garcom-anilha-waiter-curl',
    nome: 'Rosca Garçom com Anilha (Waiter Curl)',
    grupo: 'Bíceps',
    alvo: 'Bíceps Braquial (Cabeça Curta - Pico de Contração)',
    sinergistas: 'Braquial e Deltoide Anterior',
    equipamento: '1 Anilha Pesada (10kg a 20kg)',
    posicao_inicial: 'Em pé segurando uma anilha com as duas mãos espalmadas por baixo da borda superior (como um garçom segurando uma bandeja), punhos em supinação forçada.',
    concentrica: 'Flexione os cotovelos erguendo a anilha até a altura do queixo, mantendo a anilha rigorosamente horizontal.',
    excentrica: 'Desça em 3 segundos controlados até a frente das coxas.',
    passos: [
      'Apoie as palmas das mãos abertas sob a anilha.',
      'Suba a anilha mantendo-a plana e horizontal como uma bandeja.',
      'Aperte os bíceps no topo por 1 a 2 segundos.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Palmas das mãos sustentam o peso por baixo', 'Anilha mantida na horizontal', 'Cotovelos fechados'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Segurar a anilha com os dedos em vez de apoiar nas palmas abertas.',
    beneficio: 'A posição de supinação total forçada pelas palmas abertas maximiza o recrutamento e o encurtamento da cabeça curta do bíceps.'
  },

  // =========================================================================
  // ANTEBRAÇOS (10 EXERCÍCIOS)
  // =========================================================================
  99: {
    id: 99,
    slug: 'flexao-punho-barra',
    nome: 'Flexão de Punho com Barra',
    grupo: 'Antebraços',
    alvo: 'Flexores Profundos e Superficiais dos Dedos e Punho',
    sinergistas: 'Pronador Redondo',
    equipamento: 'Banco Reto + Barra',
    posicao_inicial: 'Ajoelhado ao lado do banco com os antebraços apoiados sobre o encosto e os punhos projetados para fora da borda. Barra segurada com pegada supinada.',
    concentrica: 'Flexione os punhos para cima erguendo a barra o mais alto possível, sustentando 1 segundo.',
    excentrica: 'Desça a barra controladamente permitindo que ela role suavemente até a ponta dos dedos para máxima amplitude antes de fechar a mão e subir novamente.',
    passos: [
      'Apoie os antebraços no banco com punhos livres na borda.',
      'Deixe a barra rolar até as falanges dos dedos com cuidado.',
      'Feche os dedos e flexione os punhos para cima com força.',
      'Sustente 1 segundo no pico de contração.'
    ],
    checkpoints: ['Antebraços imóveis no banco', 'Amplitude completa descendo até as pontas dos dedos', 'Carga moderada'],
    respiracao: 'Inspire ao descer os punhos; expire ao flexionar para cima.',
    erro_comum: 'Levantar os antebraços do banco para ajudar no movimento.',
    beneficio: 'Constrói grande volume muscular na face anterior do antebraço e desenvolve força de fechamento da mão (crush grip).'
  },
  100: {
    id: 100,
    slug: 'extensao-punho-barra',
    nome: 'Extensão de Punho com Barra',
    grupo: 'Antebraços',
    alvo: 'Extensores Radiais e Ulnar do Carpo (Face Posterior do Antebraço)',
    sinergistas: 'Extensor dos Dedos',
    equipamento: 'Banco Reto + Barra Leve',
    posicao_inicial: 'Antebraços apoiados no banco com punhos para fora da borda e palmas voltadas para baixo (pegada pronada).',
    concentrica: 'Estenda os punhos erguendo a barra para cima em direção ao teto, contraindo a parte de trás do antebraço.',
    excentrica: 'Desça a barra devagar em 3 segundos até a flexão máxima permitida.',
    passos: [
      'Apoie os braços com palmas viradas para baixo.',
      'Suba a barra estendendo os punhos para o alto.',
      'Segure 1 segundo no topo.',
      'Desça de forma suave e contínua.'
    ],
    checkpoints: ['Carga leve (músculos menores e delicados)', 'Punhos se movem em linha reta', 'Braços colados no banco'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Usar peso excessivo e gerar dor nos tendões do cotovelo (epicondilite lateral).',
    beneficio: 'Equilíbrio articular indispensável entre flexores e extensores do punho, prevenindo lesões de cotovelo e punho.'
  },
  187: {
    id: 187,
    slug: 'flexao-punho-halteres',
    nome: 'Flexão de Punho com Halteres',
    grupo: 'Antebraços',
    alvo: 'Flexores do Punho Unilaterais',
    sinergistas: 'Pronador',
    equipamento: 'Par de Halteres + Banco',
    posicao_inicial: 'Antebraços apoiados nas coxas ou banco segurando halteres com palmas para cima.',
    concentrica: 'Flexione os punhos para cima de forma simultânea ou alternada.',
    excentrica: 'Desça em 3 segundos até a extensão dos dedos.',
    passos: [
      'Apoie os antebraços com halteres nas mãos.',
      'Flexione os punhos para cima.',
      'Sustente 1 segundo.',
      'Desça até a ponta dos dedos com controle.'
    ],
    checkpoints: ['Liberdade de movimento individual para cada punho', 'Sem balanço', 'Descida suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar o halter escapar das mãos.',
    beneficio: 'Permite ajuste fino de angulação para quem sente incômodo ao usar a barra rígida.'
  },
  188: {
    id: 188,
    slug: 'extensao-punho-halteres',
    nome: 'Extensão de Punho com Halteres',
    grupo: 'Antebraços',
    alvo: 'Extensores do Punho',
    sinergistas: 'Extensores dos Dedos',
    equipamento: 'Halteres Leves + Banco',
    posicao_inicial: 'Antebraços apoiados com palmas viradas para baixo segurando halteres leves.',
    concentrica: 'Eleve os halteres estendendo os punhos para cima.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Apoie os braços com firmeza.',
      'Estenda os punhos elevando os pesos.',
      'Aperte a musculatura extensora.',
      'Retorne devagar.'
    ],
    checkpoints: ['Pesos leves', 'Antebraços fixos', 'Movimento estrito'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Usar carga pesada que impede a extensão completa.',
    beneficio: 'Fortalece os extensores que protegem a articulação do punho durante supinos e agachamentos.'
  },
  189: {
    id: 189,
    slug: 'rosca-punho-inversa-banco-barra',
    nome: 'Rosca de Punho Inversa no Banco com Barra',
    grupo: 'Antebraços',
    alvo: 'Extensores do Punho e Braquiorradial',
    sinergistas: 'Extensor Comum dos Dedos',
    equipamento: 'Banco + Barra Reta',
    posicao_inicial: 'Sentado com antebraços apoiados sobre as coxas, punhos projetados além dos joelhos com pegada pronada.',
    concentrica: 'Estenda os punhos erguendo a barra com força dos antebraços.',
    excentrica: 'Desça em 3 segundos com cadência compassada.',
    passos: [
      'Apoie os antebraços nas coxas.',
      'Suba a barra estendendo os punhos para cima.',
      'Sustente 1 segundo no topo.',
      'Desça de maneira controlada.'
    ],
    checkpoints: ['Braços descansando nas coxas', 'Mãos pronadas', 'Cadência de 3s'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Levantar as pernas para empurrar a barra.',
    beneficio: 'Excelente estabilização usando as próprias coxas como base firme.'
  },
  190: {
    id: 190,
    slug: 'rolo-punho-wrist-roller',
    nome: 'Rolo de Punho com Peso (Wrist Roller)',
    grupo: 'Antebraços',
    alvo: 'Antebraços Completos (Flexores e Extensores)',
    sinergistas: 'Deltoide Anterior (Isometria de Sustentação)',
    equipamento: 'Cilindro com Corda e Anilha Suspensa',
    posicao_inicial: 'Em pé segurando o rolo de punho na frente do corpo com braços estendidos ou cotovelos flexionados.',
    concentrica: 'Gire o rolo alternando as mãos para enrolar a corda até que a anilha atinja o topo.',
    excentrica: 'Desenrole o rolo de forma compassada controlando a descida da anilha até o solo.',
    passos: [
      'Segure o rolo com as duas mãos à frente.',
      'Enrole a corda girando um punho de cada vez.',
      'Suba a anilha até o cilindro.',
      'Desenrole com controle sem deixar cair de uma vez.'
    ],
    checkpoints: ['Rotações completas de cada punho', 'Descida controlada sem soltar a corda', 'Postura ereta'],
    respiracao: 'Respire ritmicamente durante a rotação contínua.',
    erro_comum: 'Soltar o rolo e deixar a anilha despencar no chão.',
    beneficio: 'Um dos métodos mais brutais do mundo para construir resistência e queimação muscular insana nos antebraços.'
  },
  191: {
    id: 191,
    slug: 'suspensao-dead-hang-barra-fixa',
    nome: 'Suspensão Isométrica na Barra Fixa (Dead Hang)',
    grupo: 'Antebraços',
    alvo: 'Força de Pegada (Support Grip), Antebraços e Descompressão Espinhal',
    sinergistas: 'Grande Dorsal, Manguito e Core',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra fixa segurando com pegada pronada completa (polegares travando a barra). Corpo totalmente relaxado e pendurado.',
    concentrica: 'Mantenha a contração isométrica esmagando a barra com os dedos pelo tempo prescrito (ex: 30 a 60 segundos).',
    excentrica: 'Pouse suavemente os pés no solo ao terminar a série.',
    passos: [
      'Segure a barra com força máxima nos dedos e palma.',
      'Retire os pés do chão e fique suspenso no ar.',
      'Respire fundo e relaxe a coluna lombar permitindo a descompressão.',
      'Sustente até o tempo limite e desça com cuidado.'
    ],
    checkpoints: ['Aperto total na barra (não segurar apenas na pontinha dos dedos)', 'Corpo relaxado descomprimindo as vértebras', 'Respiração diafragmática'],
    respiracao: 'Mantenha respiração lenta e profunda.',
    erro_comum: 'Pular bruscamente da barra soltando o peso de uma vez.',
    beneficio: 'Fortalece os ligamentos da mão, constrói pegada de aço e descomprime a coluna vertebral após cargas pesadas de agachamento e terra.'
  },
  192: {
    id: 192,
    slug: 'pincamento-pinch-grip-anilhas',
    nome: 'Pinçamento de Dedos com Anilhas (Pinch Grip)',
    grupo: 'Antebraços',
    alvo: 'Força de Pinça nos Dedos (Pinch Grip) e Polegar',
    sinergistas: 'Adutor e Flexores do Polegar',
    equipamento: '2 Anilhas Lisas juntas (ex: duas de 5kg ou 10kg)',
    posicao_inicial: 'Junte duas anilhas com a face lisa voltada para fora. Em pé, agarre as anilhas usando apenas as pontas dos dedos e o polegar.',
    concentrica: 'Erga as anilhas do solo e sustente no ar em isometria por 15 a 30 segundos.',
    excentrica: 'Abaixe as anilhas de volta ao solo com controle antes de perder o atrito.',
    passos: [
      'Junte duas anilhas de faces lisas.',
      'Posicione o polegar de um lado e os 4 dedos do outro.',
      'Aperte com máxima força de pinça e levante do chão.',
      'Sustente pelo tempo indicado e repouse no chão.'
    ],
    checkpoints: ['Usar apenas as pontas dos dedos e polegar', 'Sem apoiar as anilhas na perna', 'Piso protegido'],
    respiracao: 'Respire continuamente.',
    erro_comum: 'Encaixar os dedos nos furos centrais das anilhas para trapacear.',
    beneficio: 'Desenvolve força de pinçamento dos polegares, que é o elo fraco da maioria dos praticantes na pegada de terra.'
  },
  193: {
    id: 193,
    slug: 'caminhada-fazendeiro-farmers-walk',
    nome: 'Caminhada do Fazendeiro com Halteres (Farmer\'s Walk)',
    grupo: 'Antebraços',
    alvo: 'Antebraços (Pegada), Trapézio e Core Anti-Flexão Lateral',
    sinergistas: 'Glúteos, Panturrilhas e Quadríceps',
    equipamento: '2 Halteres Muito Pesados ou Barras Farmer\'s Walk',
    posicao_inicial: 'Em pé entre dois halteres pesados. Agache com coluna reta, segure com pegada firme e fique em pé ereto com peito aberto e ombros alinhados.',
    concentrica: 'Caminhe para a frente em passos curtos, controlados e firmes, sustentando o peso nas mãos sem balançar o corpo lateralmente.',
    excentrica: 'Pouse os halteres no chão flexionando os joelhos e quadril com postura perfeita ao final da distância.',
    passos: [
      'Levante os halteres do chão com postura de levantamento terra.',
      'Fique ereto com escápulas ativas e olhar para frente.',
      'Caminhe em passos firmes e compassados em linha reta.',
      'Pouse os pesos com a coluna reta ao final.'
    ],
    checkpoints: ['Passos curtos e estáveis', 'Coluna 100% vertical sem inclinar de lado', 'Pegada forte esmagando as manoplas'],
    respiracao: 'Respire ritmicamente em cadência constante.',
    erro_comum: 'Dar passos largos e desordenados balançando os pesos contra as pernas.',
    beneficio: 'Um dos exercícios funcionais mais completos do mundo para força da mão, estabilização dos ombros e condicionamento metabólico.'
  },
  194: {
    id: 194,
    slug: 'flexao-punho-polia-baixa-barra',
    nome: 'Flexão de Punho na Polia Baixa com Barra',
    grupo: 'Antebraços',
    alvo: 'Flexores do Punho',
    sinergistas: 'Pronadores',
    equipamento: 'Polia Baixa + Barra Reta',
    posicao_inicial: 'Sentado com antebraços nas coxas segurando a barra vinda da polia baixa com pegada supinada.',
    concentrica: 'Flexione os punhos para cima contra a tensão constante do cabo.',
    excentrica: 'Retorne em 3 segundos permitindo que o cabo puxe os punhos para baixo suavemente.',
    passos: [
      'Apoie os antebraços nas pernas segurando a barra do cabo.',
      'Flexione os punhos para o alto.',
      'Segure 1 segundo no topo.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Tensão permanente do cabo', 'Amplitude completa', 'Descida suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Solavancos rápidos na subida.',
    beneficio: 'Proporciona tensão uniforme em todo o percurso de flexão do punho.'
  },

  // =========================================================================
  // TRÍCEPS (30 EXERCÍCIOS)
  // =========================================================================
  51: {
    id: 51,
    slug: 'triceps-testa-barra-w',
    nome: 'Tríceps Testa com Barra W',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Medial e Longa)',
    sinergistas: 'Cabeça Lateral e Antebraços',
    equipamento: 'Banco Reto + Barra W',
    posicao_inicial: 'Deitado no banco reto segurando a barra W nas curvas internas com pegada pronada. Braços estendidos sobre o peito com os braços ligeiramente inclinados para trás em direção à cabeça (cerca de 75°-80° com o solo, e não 90° perfeito).',
    concentrica: 'Estenda os cotovelos erguendo a barra de volta à posição inicial inclinada sem movimentar a parte superior dos braços.',
    excentrica: 'Flexione apenas os cotovelos descendo a barra em direção à testa/topo da cabeça em 2 a 3 segundos, mantendo os cotovelos apontados para o teto e fechados.',
    passos: [
      'Deite no banco e posicione a barra sobre o rosto com leve inclinação para trás.',
      'Trave os cotovelos no lugar apontando para o teto.',
      'Desça a barra em arco flexionando apenas os cotovelos até a linha da testa.',
      'Estenda os cotovelos acelerando a barra até o topo sem abrir os cotovelos.'
    ],
    checkpoints: [
      'Cotovelos permanecem apontados para o teto e fechados (não deixar abrir para fora).',
      'Leve inclinação dos braços para trás para manter a tensão mecânica no topo.',
      'Descer com controle de 2-3 segundos para não bater a barra na cabeça.'
    ],
    respiracao: 'Inspire na descida; expire com força na extensão dos cotovelos.',
    erro_comum: 'Abrir excessivamente os cotovelos em direção aos lados ou mover os ombros transformando em um pullover.',
    beneficio: 'O exercício construtor número um para a massa total do tríceps braquial, com grande solicitação da cabeça medial e longa.'
  },
  52: {
    id: 52,
    slug: 'triceps-pulley-barra-reta',
    nome: 'Tríceps Pulley (Barra Reta)',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Medial)',
    sinergistas: 'Cabeça Longa e Antebraços',
    equipamento: 'Polia Alta + Barra Reta',
    posicao_inicial: 'Em pé de frente para a polia alta segurando a barra reta com pegada pronada na largura dos ombros. Cotovelos colados às costelas, tronco com leve inclinação à frente (10°).',
    concentrica: 'Empurre a barra para baixo estendendo totalmente os cotovelos, sustentando 1 segundo de contração máxima com os braços esticados.',
    excentrica: 'Retorne a barra de forma controlada em 2 a 3 segundos até que os antebraços atinjam um ângulo de 90° com os braços, mantendo os cotovelos rigorosamente parados.',
    passos: [
      'Cole os cotovelos nas laterais do tronco com leve inclinação corporal.',
      'Empurre a barra verticalmente para baixo até estender os cotovelos.',
      'Aperte o tríceps no fundo por 1 segundo.',
      'Suba suavemente até o ângulo de 90° sem deixar os cotovelos subirem.'
    ],
    checkpoints: [
      'Cotovelos colados ao corpo como se estivessem presos por um pino.',
      'Bloqueio completo no fundo sem mexer os ombros.',
      'Retorno controlado parando a 90°.'
    ],
    respiracao: 'Solte o ar empurrando a barra para baixo; puxe o ar ao subir.',
    erro_comum: 'Deixar os cotovelos subirem em direção aos ombros na volta, transformando em uma remada invertida com o peso do corpo.',
    beneficio: 'Permite isolamento rigoroso das cabeças lateral e medial do tríceps com estabilidade de carga e segurança articular.'
  },
  53: {
    id: 53,
    slug: 'triceps-corda',
    nome: 'Tríceps Corda',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Pico de Contração Terminal)',
    sinergistas: 'Cabeça Medial e Longa',
    equipamento: 'Polia Alta + Corda',
    posicao_inicial: 'Em pé segurando a corda com pegada neutra. Cotovelos colados às costelas, tronco com leve inclinação frontal.',
    concentrica: 'Empurre a corda para baixo estendendo os braços e, no final do movimento, afaste as pontas da corda para os lados (pronação/abdução), espremendo a cabeça lateral.',
    excentrica: 'Retorne em 2 a 3 segundos juntando as pontas da corda até a altura de 90° nos cotovelos.',
    passos: [
      'Segure a corda com pegada neutra e cotovelos colados.',
      'Estenda os cotovelos empurrando para baixo.',
      'Abra as pontas da corda para fora no fundo apertando o músculo.',
      'Retorne devagar unindo as mãos até 90°.'
    ],
    checkpoints: [
      'Abertura das pontas da corda no ponto de extensão máxima.',
      'Cotovelos fixos sem avançar para frente.',
      'Tronco estável sem dar trancos corporais.'
    ],
    respiracao: 'Expire na extensão abrindo a corda; inspire na subida compassada.',
    erro_comum: 'Fazer o movimento rápido e quicado sem abrir a corda no final, perdendo a principal vantagem mecânica da corda.',
    beneficio: 'A flexibilidade da corda permite abrir as mãos no final, atingindo uma amplitude e pico de contração que barras rígidas não permitem.'
  },
  54: {
    id: 54,
    slug: 'triceps-frances-halter',
    nome: 'Tríceps Francês com Halter',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa no Alongamento Superior)',
    sinergistas: 'Cabeça Medial e Lateral',
    equipamento: 'Banco com Encosto Baixo ou Reto + 1 Halter Pesado',
    posicao_inicial: 'Sentado com postura ereta. Segure um halter com ambas as mãos em formato de cálice sob a anilha superior, com os braços estendidos verticalmente acima da cabeça.',
    concentrica: 'Estenda os cotovelos empurrando o halter para cima até o retorno à posição vertical.',
    excentrica: 'Flexione os cotovelos descendo o halter atrás da cabeça em 3 segundos, sentindo a cabeça longa do tríceps esticar totalmente.',
    passos: [
      'Segure o halter com as duas mãos acima da cabeça com cotovelos fechados.',
      'Desça o peso atrás da cabeça flexionando os cotovelos.',
      'Vá até sentir alongamento profundo na parte de trás dos braços.',
      'Empurre o peso de volta ao topo estendendo os cotovelos.'
    ],
    checkpoints: [
      'Manter os cotovelos o mais fechados possível (não deixar abrir em V exagerado).',
      'Coluna lombar apoiada sem hiperlordose descontrolada.',
      'Movimento estritamente no cotovelo.'
    ],
    respiracao: 'Inspire descendo o halter atrás da cabeça; expire empurrando para o teto.',
    erro_comum: 'Bater o halter na nuca ou arquear a coluna lombar de forma perigosa por falta de mobilidade nos ombros.',
    beneficio: 'Com os braços erguidos acima da cabeça, a cabeça longa do tríceps é colocada em estiramento máximo, proporcionando forte estímulo hipertrófico.'
  },
  55: {
    id: 55,
    slug: 'triceps-frances-polia',
    nome: 'Tríceps Francês na Polia',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa com Tensão Constante)',
    sinergistas: 'Cabeça Medial e Lateral',
    equipamento: 'Polia Média ou Baixa + Corda',
    posicao_inicial: 'De costas para a polia com a corda segurada atrás da cabeça, um pé à frente para estabilidade e tronco inclinado 30° para frente.',
    concentrica: 'Estenda os cotovelos empurrando a corda para a frente e para cima em diagonal, abrindo as pontas da corda no topo.',
    excentrica: 'Retorne os antebraços para trás da cabeça em 3 segundos controlados sentindo o alongamento do tríceps.',
    passos: [
      'Segure a corda de costas para a máquina com base de passos firmes.',
      'Mantenha os cotovelos apontados para a frente ao lado da cabeça.',
      'Estenda os braços para a frente na linha da diagonal.',
      'Retorne devagar deixando o cabo puxar os antebraços para trás.'
    ],
    checkpoints: ['Cotovelos fixos apontando para a frente', 'Tensão contínua do cabo no fundo', 'Tronco estável'],
    respiracao: 'Inspire no alongamento atrás da cabeça; expire na extensão.',
    erro_comum: 'Mexer o corpo para frente e para trás para iniciar o movimento.',
    beneficio: 'Oferece tensão contínua na cabeça longa do tríceps sem o risco de queda de halter livre sobre a nuca.'
  },
  56: {
    id: 56,
    slug: 'extensao-unilateral-polia',
    nome: 'Extensão Unilateral na Polia',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Medial Unilateral)',
    sinergistas: 'Cabeça Longa',
    equipamento: 'Polia Alta + Cabo sem Pegador ou Pegador D',
    posicao_inicial: 'Em pé de lado para a polia segurando o cabo com uma das mãos, cotovelo colado à lateral do corpo.',
    concentrica: 'Empurre o cabo para baixo até a extensão completa do braço, sustentando 1 segundo.',
    excentrica: 'Retorne em 3 segundos até o ângulo de 90° nos cotovelos.',
    passos: [
      'Segure o cabo com uma mão e fixe o cotovelo na cintura.',
      'Estenda o braço para baixo até o bloqueio suave.',
      'Sustente a contração no ápice.',
      'Suba com cadência até 90°.'
    ],
    checkpoints: ['Cotovelo colado ao corpo', 'Foco unilateral sem assimetria', 'Bloqueio estrito'],
    respiracao: 'Inspire subindo; expire estendendo o braço.',
    erro_comum: 'Afastar o cotovelo do corpo para usar o peso do ombro.',
    beneficio: 'Permite isolar e corrigir desequilíbrios de força e definição entre o tríceps direito e esquerdo.'
  },
  57: {
    id: 57,
    slug: 'triceps-coice-halter',
    nome: 'Tríceps Coice com Halter',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Pico de Contração da Cabeça Lateral e Longa)',
    sinergistas: 'Deltoide Posterior',
    equipamento: 'Banco Reto + 1 Halter',
    posicao_inicial: 'Apoie o joelho e a mão no banco com coluna paralela ao solo. Segure o halter com a mão livre e posicione o cotovelo alto, alinhado ou acima da linha das costas.',
    concentrica: 'Estenda o cotovelo para trás até o braço ficar completamente reto e paralelo ao chão, sustentando 2 segundos no ponto de contração máxima.',
    excentrica: 'Flexione o cotovelo de volta a 90° em 2 segundos sem deixar o cotovelo cair da altura das costas.',
    passos: [
      'Apoie joelho e mão no banco com costas retas.',
      'Eleve o cotovelo até a linha do tronco e trave-o ali.',
      'Estenda o antebraço para trás até o braço ficar reto.',
      'Aperte o tríceps por 2 segundos e retorne a 90°.'
    ],
    checkpoints: [
      'Cotovelo permanece alto e congelado durante toda a repetição.',
      'Braço atinge a horizontalidade completa no topo.',
      'Sem balançar o halter como um pêndulo.'
    ],
    respiracao: 'Inspire flexionando; expire na extensão esticando o braço.',
    erro_comum: 'Deixar o cotovelo descer em direção ao chão e usar o balanço do braço para mover o peso.',
    beneficio: 'O exercício com maior ativação isométrica terminal das cabeças lateral e longa no ponto de extensão completa do ombro e cotovelo.'
  },
  58: {
    id: 58,
    slug: 'triceps-coice-polia',
    nome: 'Tríceps Coice na Polia',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial com Tensão Contínua',
    sinergistas: 'Deltoide Posterior',
    equipamento: 'Polia Média ou Baixa sem Pegador',
    posicao_inicial: 'Incline o tronco segurando o cabo com o cotovelo alto travado ao lado do corpo.',
    concentrica: 'Estenda o braço para trás contra a resistência do cabo, sustentando 1 segundo.',
    excentrica: 'Retorne em 3 segundos controlando a tração.',
    passos: [
      'Segure a bolinha do cabo e incline o tronco.',
      'Eleve o cotovelo e trave-o na altura das costas.',
      'Estenda o braço para trás de forma potente.',
      'Retorne devagar resistindo ao cabo.'
    ],
    checkpoints: ['Resistência constante do cabo', 'Cotovelo alto e imóvel', 'Pico de 1s'],
    respiracao: 'Inspire voltando; expire estendendo.',
    erro_comum: 'Deixar a polia puxar o cotovelo para frente.',
    beneficio: 'Resolve o principal defeito do coice com halteres (a falta de resistência no início do movimento) mantendo tensão em todo o trajeto.'
  },
  59: {
    id: 59,
    slug: 'supino-fechado',
    nome: 'Supino Fechado',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Sobrecarga Composta Pesada)',
    sinergistas: 'Peitoral Maior e Deltoide Anterior',
    equipamento: 'Banco Reto + Barra Olímpica',
    posicao_inicial: 'Deitado no banco com escápulas travadas e pés no chão. Segure a barra com pegada pronada na largura dos ombros (cerca de 30-40cm de distância, evitando mãos coladas).',
    concentrica: 'Empurre a barra para cima focando na extensão potente dos cotovelos com a musculatura do tríceps.',
    excentrica: 'Desça a barra em 2 a 3 segundos até encostar na linha inferior do esterno, mantendo os cotovelos colados rente às costelas (ângulo de cerca de 30° com o tronco).',
    passos: [
      'Segure a barra na largura dos ombros com punhos retos.',
      'Retire a barra e posicione sobre o peitoral.',
      'Desça a barra com cotovelos bem fechados rente às costelas até tocar o peito.',
      'Empurre estendendo os braços com força máxima de tríceps.'
    ],
    checkpoints: [
      'Pegada na largura dos ombros (não juntar as mãos para não lesionar os punhos).',
      'Cotovelos passam raspando a lateral do corpo.',
      'Descida controlada sem rebote no peito.'
    ],
    respiracao: 'Inspire na descida; expire com força na subida.',
    erro_comum: 'Juntar as mãos com 10 cm de distância no centro da barra, gerando sobrecarga destrutiva nas articulações dos punhos.',
    beneficio: 'O exercício composto mais pesado para o tríceps braquial, permitindo manipular grandes cargas e gerando enorme tensão mecânica.'
  },
  60: {
    id: 60,
    slug: 'mergulho-no-banco',
    nome: 'Mergulho no Banco',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial',
    sinergistas: 'Deltoide Anterior e Peitoral Menor',
    equipamento: 'Banco Reto (Pés no Chão ou em outro Banco)',
    posicao_inicial: 'Sentado na borda do banco com as mãos apoiadas ao lado do quadril com dedos voltados para a frente. Estenda as pernas à frente e retire o quadril do banco mantendo as costas raspando na borda.',
    concentrica: 'Empurre o banco para baixo estendendo os cotovelos até o corpo retornar ao topo.',
    excentrica: 'Desça o quadril verticalmente flexionando os cotovelos até atingirem o ângulo de 90° em 2 a 3 segundos, mantendo as costas bem coladas ao banco.',
    passos: [
      'Apoie as mãos na borda do banco e tire o quadril para fora.',
      'Mantenha as costas coladas na borda do banco.',
      'Desça até os cotovelos formarem 90° (sem descer além disso).',
      'Empurre de volta ao topo estendendo os braços.'
    ],
    checkpoints: [
      'Costas raspam no banco (não projetar o quadril para longe).',
      'Descer apenas até 90° nos cotovelos para proteger o ombro.',
      'Peito aberto com escápulas ativas.'
    ],
    respiracao: 'Inspire na descida; expire empurrando o banco.',
    erro_comum: 'Projetar o quadril para a frente e descer excessivamente, causando hiperextensão prejudicial na cápsula anterior do ombro.',
    beneficio: 'Exercício acessível e versátil para tríceps que pode ser intensificado com anilhas sobre as coxas.'
  },
  195: {
    id: 195,
    slug: 'triceps-testa-halteres-banco-reto',
    nome: 'Tríceps Testa com Halteres no Banco Reto',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Medial e Longa)',
    sinergistas: 'Cabeça Lateral',
    equipamento: 'Banco Reto + Par de Halteres',
    posicao_inicial: 'Deitado no banco segurando os halteres com pegada neutra (palmas para dentro) sobre a linha dos olhos.',
    concentrica: 'Estenda os cotovelos até a posição inicial.',
    excentrica: 'Desça os halteres ao lado das orelhas em 3 segundos com cotovelos apontados para o teto.',
    passos: [
      'Deite com os halteres na vertical e palmas para dentro.',
      'Flexione os cotovelos descendo os halteres ao lado das orelhas.',
      'Sustente 1 segundo no alongamento.',
      'Estenda os cotovelos até o topo.'
    ],
    checkpoints: ['Halteres descem ao lado das orelhas', 'Pegada neutra que alivia os cotovelos', 'Cotovelos firmes'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Abrir os cotovelos em direção aos lados.',
    beneficio: 'A pegada neutra livre com halteres é a mais confortável para quem sente desconforto com a barra rígida no testa.'
  },
  196: {
    id: 196,
    slug: 'triceps-testa-banco-declinado-barra-w',
    nome: 'Tríceps Testa no Banco Declinado com Barra W',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Maior Amplitude e Tensão Contínua)',
    sinergistas: 'Cabeça Longa',
    equipamento: 'Banco Declinado + Barra W',
    posicao_inicial: 'Deitado no banco declinado com pernas travadas segurando a barra W.',
    concentrica: 'Estenda os braços acelerando até a vertical.',
    excentrica: 'Desça a barra além da cabeça em 3 segundos permitindo maior amplitude articular.',
    passos: [
      'Prenda as pernas no banco declinado.',
      'Desça a barra W suavemente até atrás da cabeça.',
      'Estenda os cotovelos de forma potente.',
      'Repita mantendo os cotovelos fixos.'
    ],
    checkpoints: ['Banco declinado aumenta o arco de movimento', 'Barra desce atrás da cabeça', 'Pernas presas'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Balançar os braços para frente.',
    beneficio: 'A declinação do banco mantém tensão mecânica contínua no tríceps mesmo na posição de extensão total.'
  },
  197: {
    id: 197,
    slug: 'triceps-testa-polia-baixa-corda',
    nome: 'Tríceps Testa na Polia Baixa com Corda',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial com Tensão Contínua',
    sinergistas: 'Cabeça Medial e Lateral',
    equipamento: 'Banco Reto em frente à Polia Baixa + Corda',
    posicao_inicial: 'Deitado no banco com a cabeça voltada para a polia baixa segurando as pontas da corda.',
    concentrica: 'Estenda os braços puxando a corda e abrindo as mãos no topo.',
    excentrica: 'Retorne em 3 segundos até a corda chegar atrás da cabeça.',
    passos: [
      'Deite no banco segurando a corda que vem da polia baixa.',
      'Fixe os cotovelos apontando para o teto.',
      'Estenda os braços abrindo a corda no final.',
      'Desça controlando a resistência contínua.'
    ],
    checkpoints: ['Resistência constante do cabo', 'Abertura das mãos no topo', 'Cotovelos fechados'],
    respiracao: 'Inspire descendo; expire estendendo.',
    erro_comum: 'Deixar os cotovelos irem para trás acompanhando o cabo.',
    beneficio: 'Elimina o ponto cego de alívio do peso livre no topo, mantendo o tríceps em tensão ininterrupta.'
  },
  198: {
    id: 198,
    slug: 'triceps-frances-sentado-barra-w',
    nome: 'Tríceps Francês Sentado com Barra W',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa)',
    sinergistas: 'Cabeça Lateral e Medial',
    equipamento: 'Banco Vertical + Barra W',
    posicao_inicial: 'Sentado com encosto firme segurando a barra W acima da cabeça com pegada pronada estreita.',
    concentrica: 'Estenda os braços para cima até o bloqueio do tríceps.',
    excentrica: 'Desça a barra atrás da cabeça em 3 segundos até o alongamento profundo.',
    passos: [
      'Sente-se com as costas apoiadas e erga a barra W.',
      'Desça a barra atrás do pescoço flexionando os cotovelos.',
      'Estenda os braços de volta ao alto.',
      'Mantenha os cotovelos apontados para cima.'
    ],
    checkpoints: ['Costas apoiadas no encosto', 'Cotovelos o mais fechados possível', 'Amplitude profunda'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Abrir os cotovelos em excesso para os lados.',
    beneficio: 'Excelente alavanca para aplicar sobrecarga progressiva pesada na cabeça longa do tríceps.'
  },
  199: {
    id: 199,
    slug: 'triceps-frances-unilateral-halter',
    nome: 'Tríceps Francês Unilateral com Halter',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa Unilateral)',
    sinergistas: 'Cabeça Medial',
    equipamento: '1 Halter + Banco',
    posicao_inicial: 'Sentado com postura ereta segurando um halter com o braço estendido acima da cabeça.',
    concentrica: 'Estenda o braço até a posição vertical.',
    excentrica: 'Desça o halter atrás da cabeça em 3 segundos controlados sentindo o tríceps alongar.',
    passos: [
      'Segure o halter acima da cabeça.',
      'Desça o peso atrás da cabeça com cotovelo apontado para o teto.',
      'Estenda o braço contraindo o tríceps no topo.',
      'Controle o retorno.'
    ],
    checkpoints: ['Braço vertical', 'Mão livre pode apoiar o cotovelo ativo', 'Tronco reto'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Inclinar a cabeça para o lado para dar espaço ao halter.',
    beneficio: 'Garante trabalho igual e simétrico em cada braço isoladamente.'
  },
  200: {
    id: 200,
    slug: 'triceps-frances-corda-polia-baixa',
    nome: 'Tríceps Francês com Corda na Polia Baixa',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa)',
    sinergistas: 'Cabeça Medial e Lateral',
    equipamento: 'Polia Baixa + Corda',
    posicao_inicial: 'De costas para a polia baixa segurando a corda acima da cabeça com cotovelos flexionados.',
    concentrica: 'Estenda os cotovelos para o teto abrindo a corda no topo.',
    excentrica: 'Desça a corda atrás da cabeça em 3 segundos com tração suave do cabo.',
    passos: [
      'Fique de costas para a polia baixa segurando a corda atrás da cabeça.',
      'Estenda os cotovelos para o alto abrindo as mãos.',
      'Aperte o tríceps no topo por 1 segundo.',
      'Desça devagar aproveitando o alongamento.'
    ],
    checkpoints: ['Tração vertical do cabo', 'Abertura das mãos no topo', 'Coluna estável'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Arquear excessivamente a lombar para ajudar.',
    beneficio: 'Tensão suave e constante que protege a articulação do cotovelo na transição excêntrica.'
  },
  201: {
    id: 201,
    slug: 'triceps-katana-polia-overhead',
    nome: 'Tríceps Katana na Polia (Overhead Cable Extension)',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Longa no Alinhamento Escapular Perfeito)',
    sinergistas: 'Cabeça Lateral e Medial',
    equipamento: 'Polias Altas Duplas ou Crossover sem Pegadores',
    posicao_inicial: 'Em pé no crossover com cabos cruzados atrás da cabeça (braço direito segura cabo esquerdo e vice-versa), cotovelos apontados para cima e para fora.',
    concentrica: 'Estenda os dois braços simultaneamente para cima e para fora em diagonal (como sacar duas espadas katanas), espremendo o tríceps no topo.',
    excentrica: 'Retorne flexionando os cotovelos atrás da cabeça em 3 segundos de alongamento supremo.',
    passos: [
      'Cruze os cabos nas polias e segure as bolinhas com pegada neutra.',
      'Dê um passo à frente estabilizando os cotovelos para o alto.',
      'Estenda os dois braços na diagonal como empunhando katanas.',
      'Retorne com suavidade até o alongamento máximo.'
    ],
    checkpoints: [
      'Cabos cruzados alinhados exatamente com o ângulo das fibras do tríceps.',
      'Cotovelos permanecem estáveis no ar.',
      'Pico de contração de 1s.'
    ],
    respiracao: 'Inspire no alongamento atrás; expire na extensão diagonal.',
    erro_comum: 'Abaixar os cotovelos durante o movimento transformando em pushdown.',
    beneficio: 'A biomecânica mais alinhada do mundo moderno para hipertrofia da cabeça longa do tríceps, sem compressão articular no cotovelo.'
  },
  202: {
    id: 202,
    slug: 'triceps-pulley-barra-v',
    nome: 'Tríceps Pulley com Barra V',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Medial)',
    sinergistas: 'Antebraço',
    equipamento: 'Polia Alta + Barra V Angulada',
    posicao_inicial: 'Em pé segurando a barra V com pegada semi-pronada, cotovelos colados ao tronco.',
    concentrica: 'Empurre a barra V para baixo até a extensão completa dos cotovelos.',
    excentrica: 'Retorne em 2 a 3 segundos até 90° com os cotovelos imóveis.',
    passos: [
      'Segure as alças da barra V.',
      'Cole os cotovelos na cintura.',
      'Empurre verticalmente até travar o tríceps.',
      'Suba suavemente parando a 90°.'
    ],
    checkpoints: ['Pegada angulada confortável para os punhos', 'Cotovelos fixos', 'Bloqueio estrito'],
    respiracao: 'Inspire subindo; expire empurrando.',
    erro_comum: 'Usar o tronco para empurrar o peso.',
    beneficio: 'A angulação da barra V reduz o estresse nos punhos em comparação com a barra reta, permitindo cargas mais pesadas.'
  },
  203: {
    id: 203,
    slug: 'triceps-pulley-inverso-supinado',
    nome: 'Tríceps Pulley Inverso com Pegada Supinada',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Medial)',
    sinergistas: 'Cabeça Lateral e Flexores do Punho',
    equipamento: 'Polia Alta + Barra Reta em Pegada Supinada',
    posicao_inicial: 'Em pé segurando a barra com as palmas voltadas para cima (supinadas), cotovelos fixos nas costelas.',
    concentrica: 'Empurre a barra para baixo até estender completamente os braços.',
    excentrica: 'Retorne em 3 segundos controlados até 90°.',
    passos: [
      'Segure a barra com palmas para cima.',
      'Mantenha os cotovelos travados ao lado do corpo.',
      'Empurre estendendo os cotovelos.',
      'Retorne com suavidade.'
    ],
    checkpoints: ['Palmas para cima durante todo o tempo', 'Carga moderada', 'Cotovelos imóveis'],
    respiracao: 'Inspire subindo; expire descendo.',
    erro_comum: 'Deixar a barra escapar das mãos por excesso de carga.',
    beneficio: 'Focaliza a cabeça medial do tríceps, essencial para a estabilização e saúde articular do cotovelo.'
  },
  204: {
    id: 204,
    slug: 'triceps-coice-polia-unilateral',
    nome: 'Tríceps Coice na Polia Baixa Unilateral sem Pegador',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Longa)',
    sinergistas: 'Deltoide Posterior',
    equipamento: 'Polia Baixa + Cabo Direto',
    posicao_inicial: 'Incline o tronco com cotovelo alto segurando a bolinha do cabo.',
    concentrica: 'Estenda o braço para trás até ficar alinhado ao corpo.',
    excentrica: 'Retorne em 3 segundos sem mover o cotovelo.',
    passos: [
      'Segure a extremidade do cabo com pegada neutra.',
      'Trave o cotovelo na altura do tronco.',
      'Estenda o antebraço para trás com força.',
      'Retorne controladamente.'
    ],
    checkpoints: ['Sem pegador rígido permitindo rotação livre', 'Cotovelo alto', 'Contração de 1s'],
    respiracao: 'Inspire voltando; expire estendendo.',
    erro_comum: 'Mexer o ombro durante a extensão.',
    beneficio: 'A pegada direta no cabo permite liberdade anatômica total e tensão pura no tríceps.'
  },
  205: {
    id: 205,
    slug: 'jm-press-barra-smith',
    nome: 'JM Press com Barra no Smith',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Massa e Força Bruta)',
    sinergistas: 'Peitoral Superior e Deltoide Anterior',
    equipamento: 'Smith Machine + Banco Reto',
    posicao_inicial: 'Deitado no banco sob a barra do Smith com pegada na largura dos ombros.',
    concentrica: 'Empurre a barra para cima estendendo os braços com força máxima de tríceps.',
    excentrica: 'Desça a barra em direção ao queixo/pescoço, combinando flexão de cotovelos com leve retração de ombro em movimento híbrido de supino fechado e tríceps testa.',
    passos: [
      'Posicione o banco no Smith com a barra sobre a linha do queixo.',
      'Segure com pegada moderada na largura dos ombros.',
      'Desça a barra controladamente em direção ao queixo até 5cm de distância.',
      'Empurre estendendo os cotovelos com potência.'
    ],
    checkpoints: ['Movimento híbrido testa-supino', 'Barra desce no queixo com segurança nos trilhos', 'Cotovelos a 45°'],
    respiracao: 'Inspire na descida; expire com força na subida.',
    erro_comum: 'Descer a barra no peito como supino ou abrir demais os cotovelos.',
    beneficio: 'Popularizado por JM Blakley, desenvolve força explosiva e volume maciço no tríceps.'
  },
  206: {
    id: 206,
    slug: 'jm-press-barra-w-livre',
    nome: 'JM Press com Barra W Livre',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Medial e Lateral)',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Banco Reto + Barra W Livre',
    posicao_inicial: 'Deitado no banco reto segurando a barra W na largura dos ombros.',
    concentrica: 'Empurre a barra estendendo os braços de volta à vertical.',
    excentrica: 'Desça a barra em direção à garganta/queixo mantendo os antebraços em ângulo de 45° em 3 segundos controlados.',
    passos: [
      'Deite e estabilize a barra W com pegada neutra/fechada.',
      'Desça a barra em direção à base do queixo.',
      'Pause brevemente sem encostar.',
      'Empurre com aceleração de tríceps.'
    ],
    checkpoints: ['Controle estrito da barra livre', 'Descida direcionada ao queixo', 'Pés firmes'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Soltar a barra rápido demais em direção ao pescoço.',
    beneficio: 'Excelente estímulo de sobrecarga para bater recordes no supino reto.'
  },
  207: {
    id: 207,
    slug: 'paralelas-foco-triceps-vertical',
    nome: 'Paralelas com Foco em Tríceps (Corpo Vertical)',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (As Três Cabeças)',
    sinergistas: 'Deltoide Anterior e Peitoral Menor',
    equipamento: 'Barras Paralelas',
    posicao_inicial: 'Suspenso nas barras paralelas com os braços estendidos e o tronco rigorosamente vertical (ereto), pernas retas ou dobradas para trás.',
    concentrica: 'Empurre as barras para baixo estendendo os cotovelos até o topo mantendo a postura ereta.',
    excentrica: 'Desça o corpo em 2 a 3 segundos mantendo os cotovelos colados ao tronco e apontados para trás até os cotovelos atingirem 90°.',
    passos: [
      'Suspenda-se nas paralelas mantendo o corpo 100% reto e vertical.',
      'Desça mantendo os cotovelos fechados para trás.',
      'Pare aos 90° nos cotovelos sem inclinar o peito para frente.',
      'Empurre estendendo os braços com força total nos tríceps.'
    ],
    checkpoints: [
      'Corpo rigorosamente vertical (se inclinar para frente vira peito).',
      'Cotovelos apontam para trás rente ao tronco.',
      'Parar nos 90° para segurança do ombro.'
    ],
    respiracao: 'Inspire descendo; expire empurrando até o topo.',
    erro_comum: 'Inclinar o peito para a frente, transferindo o trabalho para o peitoral.',
    beneficio: 'O exercício de peso corporal mais potente para desenvolver volume massivo nas três cabeças do tríceps.'
  },
  208: {
    id: 208,
    slug: 'paralelas-carga-adicional',
    nome: 'Paralelas com Carga Adicional no Cinto',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial e Força Máxima de Empurrar',
    sinergistas: 'Ombros e Peitoral',
    equipamento: 'Barras Paralelas + Cinto Dip Belt com Anilhas',
    posicao_inicial: 'Cinto com peso ajustado na cintura, suspenda-se nas barras com corpo vertical.',
    concentrica: 'Empurre o peso corporal + anilha adicional até travar os cotovelos.',
    excentrica: 'Desça em 3 segundos controlando a inércia do peso adicional até 90°.',
    passos: [
      'Ajuste o cinto com anilhas entre as pernas.',
      'Suba nas paralelas com tronco vertical.',
      'Desça de maneira compassada até 90°.',
      'Exploda na subida estendendo os cotovelos.'
    ],
    checkpoints: ['Carga adicional bem equilibrada', 'Descida controlada sem tranco no fundo', 'Corpo vertical'],
    respiracao: 'Inspire descendo; expire subindo com potência.',
    erro_comum: 'Adicionar peso excessivo e fazer apenas movimentos curtos sem amplitude.',
    beneficio: 'Permite sobrecarga progressiva infinita quando o peso corporal já não é suficiente.'
  },
  209: {
    id: 209,
    slug: 'tate-press-banco-reto-halteres',
    nome: 'Tate Press no Banco Reto com Halteres',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Bloqueio Terminal)',
    sinergistas: 'Cabeça Medial',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Deitado no banco reto segurando os halteres com as anilhas encostadas sobre o peito e cotovelos abertos para fora.',
    concentrica: 'Estenda os braços para cima girando os halteres até que os braços fiquem retos sobre o peito com forte aperto no tríceps lateral.',
    excentrica: 'Desça os halteres flexionando os cotovelos para fora até as anilhas tocarem o peito suavemente em 3 segundos.',
    passos: [
      'Deite no banco e una as pontas internas dos halteres no peito.',
      'Mantenha os cotovelos apontados para fora.',
      'Estenda os cotovelos empurrando os halteres para cima.',
      'Aperte o tríceps no topo e retorne com calma.'
    ],
    checkpoints: [
      'Cotovelos permanecem abertos para fora durante todo o movimento.',
      'Anilhas se tocam no ponto de descida no peito.',
      'Extensão completa no topo.'
    ],
    respiracao: 'Inspire descendo; expire na extensão.',
    erro_comum: 'Fechar os cotovelos transformando em um supino fechado comum.',
    beneficio: 'Criado pelo mestre de força Dave Tate, isola a cabeça lateral e constrói força de lockout incomparável.'
  },
  210: {
    id: 210,
    slug: 'california-press-barra',
    nome: 'California Press no Banco Reto com Barra',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Força e Hipertrofia Híbrida)',
    sinergistas: 'Peito e Ombros',
    equipamento: 'Banco Reto + Barra Olímpica ou W',
    posicao_inicial: 'Deitado no banco reto segurando a barra com pegada fechada na largura dos ombros.',
    concentrica: 'Empurre a barra de volta à vertical como em um supino fechado potente.',
    excentrica: 'Inicie descendo como um tríceps testa em direção à garganta e, no terço inferior, traga a barra para o peito médio em movimento fluído.',
    passos: [
      'Deite com a barra sobre o peito.',
      'Desça como um tríceps testa em direção ao queixo/pescoço.',
      'No fundo, deslize a barra suavemente até o peito.',
      'Empurre verticalmente como supino fechado até o topo.'
    ],
    checkpoints: ['Descida de testa e subida de supino fechado', 'Controle da barra', 'Pés apoiados'],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Fazer o movimento descoordenado arriscando bater a barra no rosto.',
    beneficio: 'Permite sobrecarregar a fase excêntrica do tríceps testa com uma carga que você consegue empurrar na concêntrica graças à mecânica do supino.'
  },
  211: {
    id: 211,
    slug: 'extensao-unilateral-triceps-halter-deitado',
    nome: 'Extensão Unilateral de Tríceps com Halter Deitado',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Cabeça Lateral e Medial Unilateral)',
    sinergistas: 'Cabeça Longa',
    equipamento: 'Banco Reto + 1 Halter',
    posicao_inicial: 'Deitado no banco reto segurando o halter com um braço estendido para cima, a outra mão apoiando suavemente o cotovelo ativo.',
    concentrica: 'Estenda o cotovelo erguendo o halter de volta à vertical.',
    excentrica: 'Desça o halter em direção à orelha ou ombro oposto em 3 segundos controlados.',
    passos: [
      'Segure o halter na vertical com o braço apontado para o teto.',
      'Flexione o cotovelo descendo o halter ao lado da orelha oposta.',
      'Estenda o braço com força focada no tríceps.',
      'Retorne de forma suave.'
    ],
    checkpoints: ['Braço vertical fixo', 'Descida até a orelha oposta', 'Movimento estrito'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Mover o ombro durante a descida.',
    beneficio: 'Elimina compensações entre os braços e permite amplitude extrema de alongamento.'
  },
  212: {
    id: 212,
    slug: 'mergulho-maquina-articulada-triceps',
    nome: 'Mergulho na Máquina Articulada de Tríceps',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial',
    sinergistas: 'Peitoral Menor e Deltoide Anterior',
    equipamento: 'Máquina Seated Dip Machine',
    posicao_inicial: 'Sentado com as coxas travadas sob os rolos acolchoados segurando as manoplas laterais.',
    concentrica: 'Empurre as manoplas para baixo até estender completamente os braços.',
    excentrica: 'Retorne em 3 segundos com velocidade controlada até 90° nos cotovelos.',
    passos: [
      'Ajuste o cinto ou rolos para manter o quadril firme no banco.',
      'Segure as manoplas e mantenha a postura ereta.',
      'Empurre para baixo com a força dos tríceps.',
      'Retorne devagar sem deixar o peso bater.'
    ],
    checkpoints: ['Pelve colada no assento', 'Corpo vertical', 'Extensão completa no fundo'],
    respiracao: 'Inspire subindo; expire empurrando para baixo.',
    erro_comum: 'Levantar do banco na descida por falta de ajuste do apoio de coxas.',
    beneficio: 'Simula o mergulho em paralelas com controle milimétrico de carga por placas, ideal para drop-sets.'
  },
  213: {
    id: 213,
    slug: 'triceps-pulley-pegada-neutra-corda-dupla',
    nome: 'Tríceps Pulley com Pegada Neutra (Corda Dupla)',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial (Máxima Amplitude de Bloqueio)',
    sinergistas: 'Cabeça Lateral e Longa',
    equipamento: 'Polia Alta + 2 Cordas Conectadas',
    posicao_inicial: 'Em pé segurando uma corda em cada mão na polia alta. Dobre a amplitude convencional da corda.',
    concentrica: 'Empurre para baixo e abra os braços para trás do corpo na linha dos quadris.',
    excentrica: 'Retorne em 3 segundos até a linha do peito.',
    passos: [
      'Segure as duas cordas com pegada neutra.',
      'Empurre estendendo os braços além das laterais do corpo.',
      'Passe as mãos para trás da linha do quadril.',
      'Retorne devagar.'
    ],
    checkpoints: ['Extensão ultra-ampla passando do quadril', 'Dois cabos conectados', 'Contração de 1s'],
    respiracao: 'Inspire subindo; expire empurrando.',
    erro_comum: 'Usar impulso do tronco jogando o corpo para a frente.',
    beneficio: 'A corda dupla permite levar os braços para trás do quadril (hiperextensão do ombro com extensão de cotovelo), ativando as fibras em encurtamento máximo.'
  },
  214: {
    id: 214,
    slug: 'flexao-fechada-chao-isometria',
    nome: 'Flexão Fechada no Chão com Isometria',
    grupo: 'Tríceps',
    alvo: 'Tríceps Braquial e Core',
    sinergistas: 'Peitoral Maior e Deltoide Anterior',
    equipamento: 'Peso Corporal (Chão)',
    posicao_inicial: 'Posição de prancha com mãos na largura dos ombros e cotovelos alinhados colados às costelas.',
    concentrica: 'Empurre o solo com força máxima até estender os braços mantendo o corpo rígido.',
    excentrica: 'Desça em 3 segundos até o peito quase tocar o chão e congele em isometria a 2 cm do solo por 2 segundos antes de subir.',
    passos: [
      'Prancha alta com mãos na largura dos ombros.',
      'Desça raspando os cotovelos nas costelas.',
      'Pause a 2 cm do chão por 2 segundos em isometria rígida.',
      'Empurre o chão de forma explosiva até o topo.'
    ],
    checkpoints: ['Cotovelos colados às costelas durante toda a repetição', 'Pausa isométrica de 2s no fundo', 'Corpo como tábua'],
    respiracao: 'Inspire descendo, retenha o ar na isometria e expire ao empurrar.',
    erro_comum: 'Abrir os cotovelos para os lados transformando em flexão comum de peito.',
    beneficio: 'Desenvolve resistência neuromuscular tremenda e hipertrofia funcional com o próprio peso do corpo.'
  }
};
