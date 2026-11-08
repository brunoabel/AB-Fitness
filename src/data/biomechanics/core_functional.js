/**
 * Biomecânica de Core, Funcional & Mobilidade — 57 Exercícios
 * Abdômen (90-98, 273-292), Funcional & Cardio (293-308) e Mobilidade Articular (309-320).
 */

export const CORE_FUNCTIONAL_BIOMECHANICS = {
  // =========================================================================
  // ABDÔMEN (29 EXERCÍCIOS)
  // =========================================================================
  90: {
    id: 90,
    slug: 'crunch-abdominal-classico',
    nome: 'Crunch (Abdominal Clássico)',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal (Fibras Superiores e Médias)',
    sinergistas: 'Oblíquos e Transverso do Abdômen',
    equipamento: 'Colchonete no Chão',
    posicao_inicial: 'Deitado de costas com joelhos dobrados a 90° e pés planos no solo. Mãos apoiadas levemente nas têmporas ou cruzadas sobre o peito (nunca entrelaçadas puxando o pescoço). Coluna lombar apoiada no chão.',
    concentrica: 'Flexione o tronco aproximando a caixa torácica da pelve, expirando todo o ar e descolando apenas as escápulas do chão em contração máxima.',
    excentrica: 'Desça o tronco em 2 a 3 segundos controlados até as escápulas tocarem o solo, sem relaxar a tensão muscular.',
    passos: [
      'Deite com pés no chão e lombar apoiada.',
      'Apoie as pontas dos dedos nas têmporas mantendo os cotovelos abertos.',
      'Enrole a coluna para cima soltando todo o ar dos pulmões.',
      'Aperte o abdômen no topo e desça devagar.'
    ],
    checkpoints: [
      'Apenas as escápulas saem do solo (a lombar permanece em contato com o chão).',
      'Olhar fixo no teto mantendo o espaço de uma maçã entre o queixo e o peito.',
      'Expiração completa no topo para máxima compressão do reto abdominal.'
    ],
    respiracao: 'Inspire no solo enchendo o peito; expire com força máxima no enrolamento do tronco.',
    erro_comum: 'Puxar a cabeça com as mãos gerando compressão dolorosa nas vértebras cervicais.',
    beneficio: 'O exercício fundamental de flexão de coluna para hipertrofia dos "gomos" do reto abdominal com segurança lombar.'
  },
  91: {
    id: 91,
    slug: 'crunch-polia',
    nome: 'Crunch na Polia',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal com Sobrecarga Progressiva',
    sinergistas: 'Oblíquos',
    equipamento: 'Polia Alta + Corda + Colchonete',
    posicao_inicial: 'Ajoelhado no solo de frente ou de costas para a polia alta. Segure as pontas da corda coladas aos lados da cabeça/orelhas com os quadris fixos para trás.',
    concentrica: 'Flexione a coluna enrolando o tronco para baixo e para dentro como uma concha, levando os cotovelos em direção aos joelhos.',
    excentrica: 'Retorne em 3 segundos estendendo a coluna de forma controlada até a postura ereta sem mover o quadril.',
    passos: [
      'Ajoelhe-se e segure a corda colada nas têmporas.',
      'Trave os quadris no lugar (eles não devem sentar nos calcanhares).',
      'Enrole a coluna aproximando as costelas do púbis.',
      'Retorne devagar resistindo à carga das placas.'
    ],
    checkpoints: [
      'O movimento é de flexão da coluna (não é uma flexão de quadril).',
      'Quadris permanecem imóveis durante toda a série.',
      'Mãos nunca se afastam da cabeça.'
    ],
    respiracao: 'Inspire no topo; expire com força no enrolamento para baixo.',
    erro_comum: 'Sentar nos calcanhares durante a descida, transformando o exercício em movimento dos quadris.',
    beneficio: 'Permite aplicar sobrecarga progressiva por placas no abdômen, hipertrofiando os gomos com a mesma lógica de qualquer outro músculo.'
  },
  92: {
    id: 92,
    slug: 'elevacao-pernas-suspensao',
    nome: 'Elevação de Pernas em Suspensão',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal (Fibras Inferiores) e Flexores do Quadril',
    sinergistas: 'Oblíquos e Antebraços',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra fixa com pegada pronada na largura dos ombros. Corpo reto e escápulas ativas.',
    concentrica: 'Eleve os joelhos ou pernas retas para cima flexionando o quadril e, no topo, enrole a pelve em direção ao peito (retroversão pélvica ativa).',
    excentrica: 'Desça as pernas em 3 segundos controlados sem balançar o corpo no fundo.',
    passos: [
      'Suspenda-se na barra com pegada firme.',
      'Eleve as pernas e enrole a bacia para cima no final.',
      'Sustente 1 segundo no topo.',
      'Desça de maneira lenta e estável sem embalo.'
    ],
    checkpoints: [
      'Enrolar a pelve para cima (se apenas levantar as pernas o trabalho é quase todo do psoas).',
      'Zero balanço pendular do corpo.',
      'Descida de 3s.'
    ],
    respiracao: 'Inspire na descida; expire com força na subida enrolando a bacia.',
    erro_comum: 'Balançar o corpo como um pêndulo para jogar as pernas para cima com inércia.',
    beneficio: 'Desenvolve força de flexão pélvica profunda e definição da porção inferior do abdômen.'
  },
  93: {
    id: 93,
    slug: 'elevacao-pernas-deitado',
    nome: 'Elevação de Pernas Deitado',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal e Flexores do Quadril',
    sinergistas: 'Transverso do Abdômen',
    equipamento: 'Colchonete no Chão',
    posicao_inicial: 'Deitado de costas no colchonete com braços ao lado do corpo e pernas estendidas à frente.',
    concentrica: 'Eleve as pernas unidas até 90° em relação ao solo descolando ligeiramente a bacia no topo.',
    excentrica: 'Desça as pernas em 3 segundos parando a 5 cm do solo sem encostar os calcanhares no chão e sem arquear a lombar.',
    passos: [
      'Deite com as mãos ao lado do quadril e lombar pressionada no chão.',
      'Eleve as pernas retas até a vertical.',
      'Dê um pequeno empurrão da bacia para cima no topo.',
      'Desça as pernas devagar mantendo a lombar colada no chão.'
    ],
    checkpoints: ['Lombar nunca descola do chão', 'Pernas descem até 5 cm do piso', 'Movimento contínuo'],
    respiracao: 'Inspire descendo as pernas; expire na subida.',
    erro_comum: 'Deixar a coluna lombar arquear descolando do chão na descida das pernas.',
    beneficio: 'Fortalecimento do controle lombo-pélvico e hipertrofia da parede abdominal inferior.'
  },
  94: {
    id: 94,
    slug: 'abdominal-infra-reverso',
    nome: 'Abdominal Infra Reverso',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal (Foco Pélvico Inferior)',
    sinergistas: 'Oblíquos',
    equipamento: 'Colchonete no Chão ou Banco Reto',
    posicao_inicial: 'Deitado de costas com joelhos dobrados a 90° e pés no ar. Braços firmes no chão ao lado do corpo.',
    concentrica: 'Enrole a pelve trazendo os joelhos em direção ao peito e descole o quadril do solo em 5 a 10 cm, apertando o abdômen.',
    excentrica: 'Desça a pelve de volta ao chão em 2 a 3 segundos mantendo a flexão dos joelhos.',
    passos: [
      'Deite com joelhos a 90° suspensos no ar.',
      'Use a musculatura abdominal para enrolar a bacia em direção à cabeça.',
      'Eleve o quadril do solo por 1 segundo.',
      'Desça com controle sem despencar.'
    ],
    checkpoints: ['Movimento de enrolamento da pelve', 'Joelhos permanecem em 90°', 'Sem impulso dos braços'],
    respiracao: 'Inspire ao descer o quadril; expire ao enrolar a pelve para cima.',
    erro_comum: 'Balançar as pernas esticando e dobrando para criar inércia.',
    beneficio: 'Isola a flexão pélvica sobre o tronco sem exigir esforço dos flexores de quadril.'
  },
  95: {
    id: 95,
    slug: 'prancha-isometrica',
    nome: 'Prancha Isométrica',
    grupo: 'Abdômen',
    alvo: 'Transverso do Abdômen e Core Anti-Extensão',
    sinergistas: 'Reto Abdominal, Glúteos, Serrátil e Ombros',
    equipamento: 'Colchonete no Solo',
    posicao_inicial: 'Apoiado nos antebraços e pontas dos pés no solo. Cotovelos alinhados sob os ombros. Corpo formando uma linha rigorosamente reta da cabeça aos calcanhares.',
    concentrica: 'Sustente a posição em isometria ativa, contraindo glúteos e abdômen como se quisesse puxar os cotovelos em direção aos pés.',
    excentrica: 'Mantenha a rigidez isométrica pelo tempo estipulado (ex: 45 a 60 segundos).',
    passos: [
      'Apoie os antebraços e pontas dos pés.',
      'Alinhe quadril, ombros e tornozelos.',
      'Aperte os glúteos e contraia o abdômen fortemente.',
      'Mantenha a respiração contínua sem deixar a bacia ceder.'
    ],
    checkpoints: [
      'Coluna neutra sem deixar a lombar desabar nem empinar os glúteos.',
      'Escápulas ativas empurrando o chão (sem afundar o peito).',
      'Glúteos firmemente contraídos.'
    ],
    respiracao: 'Respire continuamente de forma estável e diafragmática.',
    erro_comum: 'Deixar a pelve cair em direção ao chão por fraqueza no core, sobrecarregando os ligamentos lombares.',
    beneficio: 'O exercício de ouro para estabilidade da coluna vertebral e fortalecimento do transverso do abdômen.'
  },
  96: {
    id: 96,
    slug: 'roda-abdominal-ab-wheel',
    nome: 'Roda Abdominal (Ab Wheel)',
    grupo: 'Abdômen',
    alvo: 'Core Completo (Força Extrema Anti-Extensão Lombar)',
    sinergistas: 'Dorsais, Serrátil e Peitoral',
    equipamento: 'Roda Abdominal (Ab Wheel) + Colchonete para Joelhos',
    posicao_inicial: 'Ajoelhado com as duas mãos segurando as manoplas da roda no chão. Quadril estendido, glúteos contraídos e coluna com leve retroversão pélvica protetora.',
    concentrica: 'Puxe a roda de volta com a força do abdômen e dorsais até o ponto inicial.',
    excentrica: 'Role a roda para a frente em linha reta estendendo o corpo em 3 segundos até onde conseguir controlar sem quebrar a lombar.',
    passos: [
      'Ajoelhe-se e segure a roda sob o peito.',
      'Trave os glúteos e o abdômen em tensão máxima.',
      'Role para a frente suavemente descendo o corpo em bloco.',
      'Puxe a roda de volta usando a contração abdominal.'
    ],
    checkpoints: [
      'Coluna lombar NUNCA arqueia para baixo (manter coluna neutra/leve flexão).',
      'Glúteos travados durante todo o percurso.',
      'Amplitude progressiva respeitando o seu nível de força.'
    ],
    respiracao: 'Inspire ao rolar para frente; expire com força máxima ao recolher a roda.',
    erro_comum: 'Deixar a lombar desabar em hiperextensão quando os braços se estendem à frente.',
    beneficio: 'Um dos exercícios mais intensos e comprovados para recrutar a parede abdominal inteira em sobrecarga excêntrica pesada.'
  },
  97: {
    id: 97,
    slug: 'abdominal-russo-russian-twist',
    nome: 'Abdominal Russo (Russian Twist)',
    grupo: 'Abdômen',
    alvo: 'Oblíquos Internos e Externos',
    sinergistas: 'Reto Abdominal e Transverso',
    equipamento: 'Colchonete + Anilha ou Medicine Ball',
    posicao_inicial: 'Sentado com tronco inclinado 45° para trás, joelhos flexionados e pés suspensos no ar (posição de V). Segure o peso com as duas mãos na frente do peito.',
    concentrica: 'Gire o tronco de um lado para o outro de forma controlada tocando o peso suavemente ao lado do quadril em cada lado.',
    excentrica: 'Mantenha cadência uniforme em cada transição lateral.',
    passos: [
      'Sente-se e incline o tronco 45° tirando os pés do chão.',
      'Gire os ombros e tronco para a direita tocando a anilha no chão.',
      'Gire para a esquerda com controle e ritmo.',
      'Mantenha o peito erguido durante todo o exercício.'
    ],
    checkpoints: ['Girar os ombros e a caixa torácica (não mexer apenas os braços)', 'Coluna ereta a 45°', 'Pés estáveis'],
    respiracao: 'Expire a cada rotação lateral; inspire no centro.',
    erro_comum: 'Mexer apenas os braços de um lado para o outro sem girar o tronco.',
    beneficio: 'Desenvolve capacidade rotacional do tronco e força oblíqua essencial para potência atlética em esportes.'
  },
  98: {
    id: 98,
    slug: 'maquina-abdominal',
    nome: 'Máquina de Abdominal',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal com Carga de Placas',
    sinergistas: 'Oblíquos',
    equipamento: 'Máquina Abdominal Crunch Sentado',
    posicao_inicial: 'Sentado com os pés presos nos rolos e pegadores segurados na altura do peito/ombros.',
    concentrica: 'Flexione a coluna para a frente enrolando o tronco em direção às coxas, espremendo o abdômen.',
    excentrica: 'Retorne em 3 segundos controlando a subida das placas de peso.',
    passos: [
      'Ajuste o assento para que o ponto de dobra da máquina alinhe com sua cintura.',
      'Segure os pegadores e apoie o peito ou almofada.',
      'Enrole a coluna para frente contra a resistência.',
      'Retorne devagar sem deixar o peso bater.'
    ],
    checkpoints: ['Eixo da máquina alinhado com a cintura', 'Enrolamento real da coluna', 'Pausa no fundo'],
    respiracao: 'Inspire voltando; expire flexionando.',
    erro_comum: 'Empurrar com os braços e pernas em vez de flexionar a musculatura abdominal.',
    beneficio: 'Permite trabalho progressivo de força máxima e hipertrofia com carga ajustável.'
  },
  273: {
    id: 273,
    slug: 'prancha-lateral-solo',
    nome: 'Prancha Lateral no Solo',
    grupo: 'Abdômen',
    alvo: 'Oblíquos, Quadrado Lombar e Glúteo Médio',
    sinergistas: 'Transverso do Abdômen e Deltoide',
    equipamento: 'Colchonete no Chão',
    posicao_inicial: 'Deitado de lado com antebraço apoiado no chão sob o ombro e pés alinhados um sobre o outro.',
    concentrica: 'Eleve o quadril formando uma linha reta dos pés à cabeça, sustentando a posição.',
    excentrica: 'Mantenha a sustentação isométrica de 30 a 45 segundos por lado.',
    passos: [
      'Apoie o cotovelo diretamente sob o ombro.',
      'Erga o quadril alinhando o corpo em linha reta lateral.',
      'Sustente com firmeza mantendo a pelve erguida.',
      'Repouse suavemente e repita do outro lado.'
    ],
    checkpoints: ['Pelve alta sem deixar cair em direção ao chão', 'Corpo alinhado em linha reta', 'Cotovelo sob o ombro'],
    respiracao: 'Mantenha respiração constante e ritmada.',
    erro_comum: 'Deixar a bacia rodar para a frente ou despencar para baixo.',
    beneficio: 'Fortalece o quadrado lombar e estabilizadores laterais da coluna, prevenindo dores nas costas.'
  },
  274: {
    id: 274,
    slug: 'prancha-lateral-elevacao-perna',
    nome: 'Prancha Lateral com Elevação de Perna',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Glúteo Médio (Avançado)',
    sinergistas: 'Quadrado Lombar',
    equipamento: 'Colchonete',
    posicao_inicial: 'Em prancha lateral erguida com o corpo alinhado.',
    concentrica: 'Eleve a perna superior estendida para o teto, segurando 1 segundo.',
    excentrica: 'Desça a perna de forma suave até encostar na perna de baixo.',
    passos: [
      'Suba em prancha lateral perfeita.',
      'Eleve a perna de cima em arco vertical.',
      'Sustente a contração do glúteo e core.',
      'Desça a perna com calma mantendo a bacia alta.'
    ],
    checkpoints: ['Quadril não cai durante a elevação da perna', 'Perna de cima sobe esticada', 'Equilíbrio sólido'],
    respiracao: 'Expire na subida da perna; inspire na descida.',
    erro_comum: 'Abaixar o quadril no momento em que levanta a perna.',
    beneficio: 'Combina sobrecarga isométrica para o core com trabalho abdutor potente para o glúteo médio.'
  },
  275: {
    id: 275,
    slug: 'prancha-spiderman-joelho-cotovelo',
    nome: 'Prancha Spiderman com Joelho no Cotovelo',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Reto Abdominal',
    sinergistas: 'Flexores do Quadril e Ombros',
    equipamento: 'Colchonete',
    posicao_inicial: 'Posição de prancha alta (com mãos no chão) ou prancha nos antebraços.',
    concentrica: 'Traga um joelho para fora e para a frente até encostar no cotovelo do mesmo lado.',
    excentrica: 'Retorne a perna à posição inicial e alterne imediatamente com o outro lado.',
    passos: [
      'Posicione-se em prancha firme.',
      'Puxe o joelho direito pela lateral até tocar o cotovelo direito.',
      'Aperte a musculatura oblíqua.',
      'Retorne e execute com a perna esquerda.'
    ],
    checkpoints: ['Joelho passa pela lateral externa do corpo', 'Quadril permanece nivelado', 'Movimento compassado'],
    respiracao: 'Expire ao puxar o joelho; inspire ao estender.',
    erro_comum: 'Empinar o quadril para o alto para facilitar a puxada.',
    beneficio: 'Ativação dinâmica dos oblíquos e flexores com estabilidade lombo-pélvica.'
  },
  276: {
    id: 276,
    slug: 'prancha-toque-ombros-shoulder-taps',
    nome: 'Prancha com Toque nos Ombros (Shoulder Taps)',
    grupo: 'Abdômen',
    alvo: 'Core Anti-Rotação e Estabilidade de Tronco',
    sinergistas: 'Deltoides e Serrátil',
    equipamento: 'Colchonete',
    posicao_inicial: 'Prancha alta com mãos sob os ombros e pés ligeiramente mais afastados que o quadril para base estável.',
    concentrica: 'Tire uma das mãos do chão e toque suavemente o ombro oposto sem girar ou balançar o quadril.',
    excentrica: 'Pouse a mão no solo e repita com a outra mão de forma compassada.',
    passos: [
      'Entre em prancha alta com pés afastados na largura dos ombros.',
      'Trave os glúteos e abdômen.',
      'Tire a mão direita e toque no ombro esquerdo de forma suave.',
      'Pouse no chão e toque com a mão esquerda no ombro direito sem balançar o corpo.'
    ],
    checkpoints: [
      'Bacia permanece perfeitamente paralela ao solo (zero rotação de quadril).',
      'Pés firmes no chão.',
      'Movimento lento e metódico.'
    ],
    respiracao: 'Respire continuamente.',
    erro_comum: 'Rebolar o quadril de um lado para o outro a cada toque de mão.',
    beneficio: 'Treina o core para resistir a forças rotacionais e estabilizar a coluna em movimentos atléticos assimétricos.'
  },
  277: {
    id: 277,
    slug: 'crunch-bicicleta-bicycle-crunch',
    nome: 'Crunch Bicicleta no Chão (Bicycle Crunch)',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Reto Abdominal com Rotação',
    sinergistas: 'Flexores do Quadril',
    equipamento: 'Colchonete',
    posicao_inicial: 'Deitado no solo com mãos nas têmporas, pernas elevadas com joelhos flexionados a 90° e escápulas descoladas do chão.',
    concentrica: 'Gire o tronco levando o cotovelo direito em direção ao joelho esquerdo enquanto estende a perna direita à frente.',
    excentrica: 'Transicione de forma contínua e suave invertendo os lados sem deixar as escápulas encostarem no solo.',
    passos: [
      'Descole as escápulas do chão com as mãos atrás da cabeça.',
      'Gire o tronco trazendo o cotovelo oposto ao joelho.',
      'Estenda a perna contrária a 45° do solo.',
      'Alterne os lados de forma compassada.'
    ],
    checkpoints: ['Girar os ombros e não apenas os cotovelos', 'Perna estendida não toca o chão', 'Cadência controlada (não pedalar rápido)'],
    respiracao: 'Expire na aproximação cotovelo-joelho; inspire na transição.',
    erro_comum: 'Puxar o pescoço e fazer o movimento com giros rápidos e desordenados.',
    beneficio: 'Eleito pelo estudo da Universidade Estadual de San Diego como um dos melhores exercícios abdominais em ativação muscular total.'
  },
  278: {
    id: 278,
    slug: 'abdominal-canivete-v-up',
    nome: 'Abdominal Canivete V-Up',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal Completo e Flexores de Quadril',
    sinergistas: 'Oblíquos',
    equipamento: 'Colchonete',
    posicao_inicial: 'Deitado de costas totalmente estendido, braços acima da cabeça e pernas esticadas juntas.',
    concentrica: 'Eleve simultaneamente o tronco e as pernas retas encontrando as mãos nos pés no topo, equilibrando o corpo sobre a pelve em formato de "V".',
    excentrica: 'Desça tronco e pernas em 2 a 3 segundos controlados até quase encostar no solo.',
    passos: [
      'Deite totalmente esticado no colchonete.',
      'Suba braços e pernas retas simultaneamente.',
      'Toque as pontas dos dedos nos pés no ápice em formato de V.',
      'Desça de maneira suave controlando a queda.'
    ],
    checkpoints: ['Pernas e braços estendidos', 'Equilíbrio sobre os glúteos no topo', 'Descida compassada'],
    respiracao: 'Inspire ao descer; expire com força na subida em V.',
    erro_comum: 'Dobrar os joelhos em excesso perdendo o formato de canivete.',
    beneficio: 'Recruta simultaneamente a porção superior e inferior do reto abdominal em contração de alta demanda.'
  },
  279: {
    id: 279,
    slug: 'dragon-flag-banco-reto',
    nome: 'Dragon Flag no Banco Reto',
    grupo: 'Abdômen',
    alvo: 'Core Completo em Sobrecarga Excêntrica Extrema',
    sinergistas: 'Dorsais, Glúteos e Ombros',
    equipamento: 'Banco Reto',
    posicao_inicial: 'Deitado no banco segurando a borda atrás da cabeça com as mãos firmes. Corpo alinhado.',
    concentrica: 'Erga o corpo inteiro até a vertical apoiando apenas a parte superior das costas e escápulas no banco.',
    excentrica: 'Desça o corpo inteiro em linha reta rígida como uma estaca em 3 a 4 segundos, parando a centímetros do banco antes de subir novamente.',
    passos: [
      'Segure firme atrás da cabeça no banco.',
      'Erga o corpo inteiro em linha reta até apontar para o teto.',
      'Desça o corpo em bloco sem quebrar o quadril.',
      'Pare logo acima do banco e erga novamente.'
    ],
    checkpoints: [
      'Corpo 100% reto (sem dobrar o quadril).',
      'Apoio apenas nos ombros e parte alta das costas.',
      'Descida excêntrica ultra controlada.'
    ],
    respiracao: 'Inspire na descida; expire com força extrema na subida.',
    erro_comum: 'Dobrar o quadril para trás transformando em uma elevação de pernas comum.',
    beneficio: 'Imortalizado por Bruce Lee e Sylvester Stallone (Rocky IV), é o teste supremo de força pura e rigidez do core.'
  },
  280: {
    id: 280,
    slug: 'limpador-para-brisa-barra-wipers',
    nome: 'Limpador de Pára-brisa na Barra (Windshield Wipers)',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Core Rotacional Avançado',
    sinergistas: 'Dorsais e Antebraços',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra fixa. Eleve as pernas retas até a barra em posição invertida (toes to bar sustentado).',
    concentrica: 'Gire as duas pernas juntas de um lado para o outro como um limpador de pára-brisa de carro.',
    excentrica: 'Controle a descida lateral mantendo os pés altos.',
    passos: [
      'Suba as pernas esticadas até ficarem paralelas à barra.',
      'Gire as pernas para a direita com controle.',
      'Traga as pernas para o centro e gire para a esquerda.',
      'Mantenha as dorsais ativas sustentando a suspensão.'
    ],
    checkpoints: ['Pés altos perto da barra', 'Movimento de rotação dos quadris', 'Força de sustentação nas costas'],
    respiracao: 'Respire continuamente.',
    erro_comum: 'Deixar as pernas caírem para baixo por falta de força nas dorsais.',
    beneficio: 'Desenvolvimento brutal de força rotacional em suspensão e controle abdominal avançado.'
  },
  281: {
    id: 281,
    slug: 'toes-to-bar-pes-barra',
    nome: 'Toes to Bar na Barra Fixa (Pés na Barra)',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal e Flexores de Quadril',
    sinergistas: 'Dorsais e Pegada',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra com pegada pronada.',
    concentrica: 'Puxe a barra para baixo com as dorsais enquanto eleva as pernas esticadas até tocar os pés na barra entre as mãos.',
    excentrica: 'Desça as pernas em 3 segundos controlados sem deixar o corpo balançar no fundo.',
    passos: [
      'Suspenda-se com escápulas travadas.',
      'Engaje as dorsais e eleve as pernas estendidas.',
      'Toque a ponta dos dois pés na barra.',
      'Desça controlando a inércia até o início.'
    ],
    checkpoints: ['Pés tocam a barra', 'Controle da descida sem balanceio', 'Dorsais ativas'],
    respiracao: 'Inspire na descida; expire ao tocar os pés na barra.',
    erro_comum: 'Usar balanceio excessivo (kipping) sem controle da força abdominal estrita.',
    beneficio: 'Exercício completo de ginástica para condicionamento do core e força de tração funcional.'
  },
  282: {
    id: 282,
    slug: 'knee-to-elbow-barra-fixa',
    nome: 'Knee to Elbow na Barra Fixa',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal e Oblíquos',
    sinergistas: 'Dorsais',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra fixa com pegada na largura dos ombros.',
    concentrica: 'Flexione os joelhos e eleve a pelve até que os joelhos toquem os cotovelos.',
    excentrica: 'Desça em 3 segundos até a extensão das pernas.',
    passos: [
      'Fique suspenso com corpo reto.',
      'Puxe os joelhos para cima enrolando o tronco.',
      'Toque os dois joelhos nos cotovelos.',
      'Retorne devagar sem balançar.'
    ],
    checkpoints: ['Joelhos tocam fisicamente nos cotovelos', 'Enrolamento pélvico', 'Descida suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Fazer o movimento curto sem tocar nos cotovelos.',
    beneficio: 'Excelente progressão para quem está aprimorando a força para o toes to bar.'
  },
  283: {
    id: 283,
    slug: 'pallof-press-polia-isometria',
    nome: 'Pallof Press na Polia com Isometria',
    grupo: 'Abdômen',
    alvo: 'Core Anti-Rotação (Oblíquos e Transverso)',
    sinergistas: 'Deltoides e Glúteos',
    equipamento: 'Polia na Altura do Peito + Pegador Simples',
    posicao_inicial: 'Em pé de lado para a polia com pegador segurado com ambas as mãos na frente do esterno. Pés na largura dos ombros com joelhos levemente destravados.',
    concentrica: 'Empurre as mãos para a frente em linha reta estendendo os braços, resistindo à tração do cabo que tenta girar seu tronco para o lado.',
    excentrica: 'Sustente 2 a 3 segundos de isometria com braços esticados e retorne as mãos ao peito com controle.',
    passos: [
      'Fique de lado para a polia segurando o cabo no peito.',
      'Estenda os braços para a frente em linha reta.',
      'Resista à força de rotação mantendo o corpo imóvel.',
      'Recolha as mãos para o peito de maneira compassada.'
    ],
    checkpoints: [
      'Corpo não gira nem 1 grau durante a extensão dos braços.',
      'Braços estendem diretamente à frente do esterno.',
      'Pausa isométrica com os braços esticados.'
    ],
    respiracao: 'Inspire no peito; expire mantendo o brace ao empurrar para a frente.',
    erro_comum: 'Girar os ombros em direção à polia cedendo à tensão do cabo.',
    beneficio: 'Criado pelo fisioterapeuta John Pallof, é o exercício mais eficaz para blindagem da coluna lombar contra forças rotacionais.'
  },
  284: {
    id: 284,
    slug: 'woodchopper-polia-alta-lenhador',
    nome: 'Woodchopper na Polia Alta (Lenhador Diagonal)',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Cadeia Cruzada Anterior',
    sinergistas: 'Deltoides e Core',
    equipamento: 'Polia Alta + Pegador Simples',
    posicao_inicial: 'Em pé de lado para a polia alta segurando o pegador com ambas as mãos estendidas para cima.',
    concentrica: 'Puxe o cabo em diagonal descendente cruzando a frente do corpo até o lado oposto do quadril inferior, girando o tronco e o pé de trás.',
    excentrica: 'Retorne em 3 segundos controlados até a posição alta.',
    passos: [
      'Segure o cabo com as duas mãos acima do ombro.',
      'Puxe em diagonal para baixo cruzando o corpo.',
      'Finalize ao lado do joelho oposto com o abdômen contraído.',
      'Retorne devagar resistindo à carga.'
    ],
    checkpoints: ['Trajetória diagonal de cima para baixo', 'Giro do tronco e quadril coordenado', 'Braços quase retos'],
    respiracao: 'Inspire subindo; expire na tração diagonal.',
    erro_comum: 'Puxar apenas com os braços sem girar o tronco.',
    beneficio: 'Desenvolve potência de rotação angular essencial para chutes, golpes e arremessos.'
  },
  285: {
    id: 285,
    slug: 'woodchopper-polia-baixa',
    nome: 'Woodchopper na Polia Baixa',
    grupo: 'Abdômen',
    alvo: 'Oblíquos e Cadeia Cruzada Posterior',
    sinergistas: 'Ombros e Glúteos',
    equipamento: 'Polia Baixa + Pegador Simples',
    posicao_inicial: 'Em pé de lado para a polia baixa segurando o cabo com as duas mãos na altura do joelho.',
    concentrica: 'Puxe o cabo em diagonal ascendente para cima e para o outro lado até acima do ombro oposto.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Segure o cabo na linha baixa com joelhos flexionados.',
      'Gire e suba o cabo em diagonal para o alto.',
      'Aperte os oblíquos no topo da rotação.',
      'Retorne devagar.'
    ],
    checkpoints: ['Trajetória de baixo para cima', 'Extensão com rotação do pé traseiro', 'Postura firme'],
    respiracao: 'Inspire descendo; expire subindo em diagonal.',
    erro_comum: 'Dobrar a coluna lombar sem girar os pés.',
    beneficio: 'Trabalha a rotação diagonal ascendente com grande solicitação dos músculos oblíquos.'
  },
  286: {
    id: 286,
    slug: 'hollow-body-hold-canoa',
    nome: 'Hollow Body Hold (Canoa Isométrica)',
    grupo: 'Abdômen',
    alvo: 'Transverso do Abdômen e Reto Abdominal (Padrão Gimnástico)',
    sinergistas: 'Quadríceps e Flexores',
    equipamento: 'Colchonete no Chão',
    posicao_inicial: 'Deitado de costas no solo com braços estendidos acima da cabeça e pernas estendidas juntas.',
    concentrica: 'Pressione a coluna lombar firmemente contra o chão e eleve as pernas e os ombros a 15-20 cm do solo, formando a curva côncava de uma canoa.',
    excentrica: 'Mantenha a sustentação isométrica rígida por 30 a 60 segundos sem permitir que a lombar descole do piso.',
    passos: [
      'Cole a lombar no solo eliminando qualquer espaço sob as costas.',
      'Eleve as pernas e as escápulas do chão.',
      'Aperte o abdômen e aponte as pontas dos pés para frente.',
      'Mantenha a canoa rígida respirando superficialmente.'
    ],
    checkpoints: [
      'Lombar 100% prensada contra o chão (não passa nem uma folha de papel por baixo).',
      'Braços e pernas estendidos flutuando.',
      'Retroversão pélvica ativa.'
    ],
    respiracao: 'Mantenha respiração constante sem soltar o abdômen.',
    erro_comum: 'Deixar a lombar arquear descolando do chão.',
    beneficio: 'A postura base de toda a ginástica olímpica para transferir força sem vazamento de energia pelo tronco.'
  },
  287: {
    id: 287,
    slug: 'abdominal-declinado-anilha-peito',
    nome: 'Abdominal Declinado com Anilha no Peito',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal com Sobrecarga',
    sinergistas: 'Flexores do Quadril',
    equipamento: 'Banco Declinado + Anilha de 5kg a 20kg',
    posicao_inicial: 'Pernas travadas no banco declinado segurando a anilha colada no peito ou atrás da cabeça.',
    concentrica: 'Flexione o tronco subindo até cerca de 60°, enrolando a coluna.',
    excentrica: 'Desça em 3 segundos controlados sem bater as costas no banco.',
    passos: [
      'Trave as pernas no banco declinado.',
      'Abrace a anilha no peito.',
      'Suba enrolando a coluna com força abdominal.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Anilha fixa no peito', 'Enrolar a coluna (não subir reto como tábua)', 'Descida controlada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Subir com a coluna completamente reta usando apenas os flexores do quadril.',
    beneficio: 'Excelente alavanca para aplicar sobrecarga progressiva com anilhas no reto abdominal.'
  },
  288: {
    id: 288,
    slug: 'stomach-vacuum-vacuo-abdominal',
    nome: 'Stomach Vacuum (Vácuo Abdominal)',
    grupo: 'Abdômen',
    alvo: 'Transverso do Abdômen (Cintura Fina e Pressão Intra-Abdominal)',
    sinergistas: 'Músculos do Assoalho Pélvico e Diafragma',
    equipamento: 'Peso Corporal (Em Pé, 4 Apoios ou Deitado)',
    posicao_inicial: 'Em pé com mãos nos quadris ou apoiadas nas coxas. Solte 100% do ar dos pulmões esvaziando a caixa torácica completamente.',
    concentrica: 'Sem puxar ar, sugue o abdômen e o umbigo para dentro e para cima em direção à coluna e às costelas, expandindo a caixa torácica em apneia.',
    excentrica: 'Sustente o vácuo por 15 a 25 segundos e solte lentamente antes de inspirar suavemente.',
    passos: [
      'Expire todo o ar dos pulmões até ficar completamente sem oxigênio.',
      'Surgue a barriga para dentro como se quisesse encostar o umbigo nas costas.',
      'Abra as costelas criando o vácuo sob o gradil costal.',
      'Segure pelo tempo estipulado e relaxe devagar.'
    ],
    checkpoints: [
      'Esvaziar 100% do ar antes de iniciar a sucção.',
      'Puxar o umbigo para dentro E para cima.',
      'Executar preferencialmente em jejum pela manhã.'
    ],
    respiracao: 'Apneia expiratória durante o vácuo; respiração calma após soltar.',
    erro_comum: 'Tentar fazer o vácuo com os pulmões cheios de ar.',
    beneficio: 'Fortalece o transverso do abdômen (a cinta natural do corpo), reduzindo a circunferência da cintura e prevenindo a dilatação abdominal.'
  },
  289: {
    id: 289,
    slug: 'deadbug-controle-respiratorio',
    nome: 'Deadbug com Controle Respiratório',
    grupo: 'Abdômen',
    alvo: 'Core Profundo, Transverso e Coordenação Cruzada',
    sinergistas: 'Reto Abdominal',
    equipamento: 'Colchonete no Chão',
    posicao_inicial: 'Deitado de costas com braços estendidos para o teto e joelhos flexionados a 90° no ar sobre os quadris. Coluna lombar prensada no chão.',
    concentrica: 'Estenda simultaneamente o braço direito para trás da cabeça e a perna esquerda para a frente rente ao chão, expirando todo o ar.',
    excentrica: 'Retorne ao centro e alterne para o braço esquerdo e perna direita mantendo a lombar imóvel.',
    passos: [
      'Deite com braços para o teto e pernas a 90°.',
      'Pressione a lombar no chão.',
      'Estique o braço direito para trás e perna esquerda para frente.',
      'Retorne e alterne os membros em sincronia perfeita.'
    ],
    checkpoints: [
      'Lombar permanece 100% colada no chão o tempo todo.',
      'Membros opostos se movem simultaneamente.',
      'Movimento lento e metódico.'
    ],
    respiracao: 'Expire na extensão dos membros; inspire retornando ao centro.',
    erro_comum: 'Permitir que a lombar descole do chão quando a perna estende.',
    beneficio: 'O exercício de reabilitação motora mais eficaz para dissociar o movimento dos membros da estabilidade do tronco.'
  },
  290: {
    id: 290,
    slug: 'bird-dog-perdigueiro-isometria',
    nome: 'Bird-Dog (Perdigueiro com Isometria)',
    grupo: 'Abdômen',
    alvo: 'Eretores da Espinha, Glúteo Máximo e Core Posterior',
    sinergistas: 'Deltoides e Trapézio',
    equipamento: 'Colchonete',
    posicao_inicial: 'Em posição de 4 apoios com mãos sob os ombros e joelhos sob os quadris. Coluna neutra.',
    concentrica: 'Estenda o braço direito para a frente e a perna esquerda para trás até alinharem com o tronco, sustentando 2 segundos.',
    excentrica: 'Retorne suavemente ao solo e repita com o braço esquerdo e perna direita.',
    passos: [
      'Posicione-se em 4 apoios com core firme.',
      'Estenda braço e perna opostos em linha reta.',
      'Sustente 2 segundos sem girar o quadril.',
      'Retorne com suavidade e inverta os lados.'
    ],
    checkpoints: ['Pelve nivelada sem girar', 'Corpo forma linha reta horizontal', 'Pausa de 2s no topo'],
    respiracao: 'Expire na extensão; inspire ao apoiar no solo.',
    erro_comum: 'Hiperestender as costas e jogar a perna muito alta.',
    beneficio: 'Um dos "Big 3" do Dr. Stuart McGill para estabilização lombar e saúde da coluna vertebral.'
  },
  291: {
    id: 291,
    slug: 'roda-abdominal-em-pe-advanced',
    nome: 'Roda Abdominal em Pé (Advanced Ab Wheel)',
    grupo: 'Abdômen',
    alvo: 'Core Inteiro (Nível Elite de Força Anti-Extensão)',
    sinergistas: 'Dorsais, Ombros e Peitoral',
    equipamento: 'Roda Abdominal',
    posicao_inicial: 'Em pé com pés na largura dos ombros, dobrando o quadril para apoiar a roda no chão à frente.',
    concentrica: 'Puxe a roda de volta com força máxima do core até retornar à postura em pé.',
    excentrica: 'Role a roda para a frente estendendo o corpo inteiro a partir dos pés até ficar quase paralelo ao solo.',
    passos: [
      'Inicie em pé com a roda no chão.',
      'Role o corpo para a frente estendendo pernas e tronco.',
      'Desça até o corpo quase encostar no chão em linha reta.',
      'Puxe a roda de volta com força descomunal do abdômen.'
    ],
    checkpoints: ['Apenas para atletas avançados', 'Coluna protegida em leve retroversão', 'Sem quebrar o quadril'],
    respiracao: 'Inspire descendo; expire na subida potente.',
    erro_comum: 'Tentar executar sem ter força na versão de joelhos, causando lesão lombar.',
    beneficio: 'O ápice da força abdominal humana com peso corporal.'
  },
  292: {
    id: 292,
    slug: 'crunch-bola-suica-extensao',
    nome: 'Crunch na Bola Suíça com Extensão Lombar',
    grupo: 'Abdômen',
    alvo: 'Reto Abdominal (Amplitude Estendida)',
    sinergistas: 'Oblíquos',
    equipamento: 'Bola Suíça (Fitball)',
    posicao_inicial: 'Apoiado com a região lombar no topo curvo da bola suíça. Pés firmes no chão.',
    concentrica: 'Flexione o tronco para cima enrolando a coluna contra a bola.',
    excentrica: 'Desça o tronco em 3 segundos permitindo que as costas curvem suavemente sobre a bola para alongar o abdômen além de 180°.',
    passos: [
      'Apoie a lombar na curvatura da bola.',
      'Deixe o tronco descer permitindo um alongamento seguro.',
      'Enrole a coluna para cima espremendo o abdômen.',
      'Retorne devagar acompanhando o formato da bola.'
    ],
    checkpoints: [
      'Curvatura da bola permite hiperextensão segura da coluna torácica e lombar.',
      'Maior amplitude que o solo rígido.',
      'Pés firmes.'
    ],
    respiracao: 'Inspire no alongamento; expire no crunch.',
    erro_comum: 'Pular na bola usando o efeito elástico da borracha.',
    beneficio: 'Permite iniciar a contração a partir de uma posição pré-alongada, gerando maior trabalho mecânico por repetição.'
  },

  // =========================================================================
  // FUNCIONAL, CARDIO & PERFORMANCE (16 EXERCÍCIOS)
  // =========================================================================
  293: {
    id: 293,
    slug: 'kettlebell-swing-russo',
    nome: 'Kettlebell Swing Russo',
    grupo: 'Funcional & Cardio',
    alvo: 'Cadeia Posterior, Glúteos e Potência de Quadril',
    sinergistas: 'Isquiotibiais, Core e Ombros',
    equipamento: '1 Kettlebell Pesado',
    posicao_inicial: 'Em pé com pés na largura dos ombros com o kettlebell no chão à frente. Incline o tronco flexionando os quadris com coluna neutra e puxe o kettlebell entre as pernas.',
    concentrica: 'Estenda os quadris de forma explosiva empurrando a bacia para a frente, projetando o kettlebell até a altura do peito pelo impulso dos glúteos (não pelos braços).',
    excentrica: 'Deixe o kettlebell descer em arco pendular e absorva o peso flexionando o quadril para trás como em um hike de futebol americano.',
    passos: [
      'Puxe o kettlebell entre as pernas com dobradiça de quadril.',
      'Exploda os glúteos e estenda os joelhos projetando o peso à frente.',
      'Pare na altura do peito com braços relaxados como cordas.',
      'Receba o peso dobrando o quadril para trás e repita o ciclo de forma fluida.'
    ],
    checkpoints: [
      'O movimento é um hip hinge de quadril (NÃO é um agachamento).',
      'A força vem 100% da extensão explosiva dos glúteos (braços apenas seguram).',
      'Coluna neutra sem arquear no topo.'
    ],
    respiracao: 'Inspire ao descer entre as pernas; expire de forma curta e potente ao estender o quadril.',
    erro_comum: 'Agachar dobrando os joelhos e erguer o kettlebell com a força dos ombros.',
    beneficio: 'O exercício rei do kettlebell para construir potência de arranque, corrida rápida e queima calórica maciça.'
  },
  294: {
    id: 294,
    slug: 'kettlebell-snatch-arranque',
    nome: 'Kettlebell Snatch (Arranque)',
    grupo: 'Funcional & Cardio',
    alvo: 'Cadeia Posterior, Ombros e Condicionamento Cardiovascular',
    sinergistas: 'Dorsais, Trapézio e Core',
    equipamento: '1 Kettlebell',
    posicao_inicial: 'Swing com uma mão levando o kettlebell entre as pernas.',
    concentrica: 'Exploda os quadris e puxe o kettlebell para cima rente ao corpo, encaixando a mão sob a alça no topo em um movimento único sem bater no antebraço.',
    excentrica: 'Desça o kettlebell com controle guiando-o de volta entre as pernas para o próximo ciclo.',
    passos: [
      'Puxe o kettlebell entre as pernas com uma mão.',
      'Exploda o quadril e puxe o peso em linha reta vertical.',
      'Encaixe a mão sob a alça no topo com o braço estendido acima da cabeça.',
      'Desça em arco fluído amortecendo com o quadril.'
    ],
    checkpoints: ['Trajetória vertical rente ao corpo', 'Encaixe suave no antebraço sem colisão', 'Bloqueio sólido no topo'],
    respiracao: 'Inspire na descida; expire com força no bloqueio acima da cabeça.',
    erro_comum: 'Deixar o kettlebell girar por cima da mão e esmagar o antebraço com impacto.',
    beneficio: 'Desenvolve potência metabólica inigualável e resistência cardiovascular de elite.'
  },
  295: {
    id: 295,
    slug: 'kettlebell-clean-and-press',
    nome: 'Kettlebell Clean and Press',
    grupo: 'Funcional & Cardio',
    alvo: 'Corpo Inteiro (Pernas, Ombros e Tríceps)',
    sinergistas: 'Core e Trapézio',
    equipamento: '1 ou 2 Kettlebells',
    posicao_inicial: 'Puxe o kettlebell do solo encaixando-o na posição de rack (apoiado no antebraço e peito).',
    concentrica: 'Empurre o kettlebell verticalmente acima da cabeça até estender o braço.',
    excentrica: 'Abaixe para a posição de rack e depois desça entre as pernas com cadência.',
    passos: [
      'Faça o clean puxando o peso para o peito na posição de rack.',
      'Estabilize a postura com core travado.',
      'Desenvolva o kettlebell sobre a cabeça até o bloqueio.',
      'Desça de forma compassada até o peito e depois ao chão.'
    ],
    checkpoints: ['Posição de rack estável', 'Desenvolvimento estrito ou com impulso', 'Coluna alinhada'],
    respiracao: 'Inspire no clean; expire no press.',
    erro_comum: 'Bater o peso no punho no clean.',
    beneficio: 'Movimento funcional completo de puxar e empurrar vertical integrando todo o corpo.'
  },
  296: {
    id: 296,
    slug: 'turkish-get-up-levantamento-turco',
    nome: 'Levantamento Turco com Kettlebell (Turkish Get-Up)',
    grupo: 'Funcional & Cardio',
    alvo: 'Estabilidade Escapular, Core 360° e Mobilidade Funcional',
    sinergistas: 'Ombros, Glúteos e Pernas',
    equipamento: '1 Kettlebell Leve a Moderado',
    posicao_inicial: 'Deitado de costas segurando o kettlebell com um braço estendido verticalmente para o teto.',
    concentrica: 'Levante-se até ficar em pé em 7 etapas controladas mantendo o kettlebell o tempo todo apontado para o teto e o olhar fixo no peso.',
    excentrica: 'Inverta exatamente as mesmas etapas até deitar-se de volta no solo mantendo o braço estendido.',
    passos: [
      'Deite com o peso erguido no braço direito e perna direita dobrada.',
      'Role sobre o cotovelo esquerdo e depois sobre a mão esquerda.',
      'Eleve o quadril do chão e passe a perna esquerda para trás ajoelhando.',
      'Fique em pé com o peso travado no alto e desça refazendo os passos.'
    ],
    checkpoints: [
      'Olhar fixo no kettlebell durante todo o exercício.',
      'Braço permanece 100% reto e vertical.',
      'Movimento lento, metódico e sem pressa.'
    ],
    respiracao: 'Respire continuamente a cada mudança de apoio.',
    erro_comum: 'Tirar os olhos do peso ou dobrar o cotovelo sob a carga.',
    beneficio: 'O exercício de ouro da fisioterapia e do treinamento funcional para estabilidade de ombro e mobilidade corporal integrada.'
  },
  297: {
    id: 297,
    slug: 'burpee-completo-salto',
    nome: 'Burpee Completo com Salto',
    grupo: 'Funcional & Cardio',
    alvo: 'Condicionamento Metabólico e Potência Corporal Global',
    sinergistas: 'Peitoral, Quadríceps, Glúteos e Core',
    equipamento: 'Peso Corporal (Chão)',
    posicao_inicial: 'Em pé com pés na largura dos ombros.',
    concentrica: 'Apoie as mãos no chão, jogue os pés para trás caindo em prancha e encoste o peito no solo. Empurre o chão, traga os pés sob o quadril e salte verticalmente batendo as mãos acima da cabeça.',
    excentrica: 'Amorteça a queda do salto caindo suavemente nas pontas dos pés e repita imediatamente o ciclo.',
    passos: [
      'Desça as mãos no solo e jogue as pernas para trás.',
      'Encoste o peito e coxas no chão.',
      'Empurre o chão trazendo os pés para perto das mãos.',
      'Salte com os braços erguidos e repita com ritmo constante.'
    ],
    checkpoints: ['Peito toca fisicamente o chão', 'Salte estendendo o quadril', 'Amortecimento suave'],
    respiracao: 'Respire ritmicamente em cadência constante.',
    erro_comum: 'Cair com pernas duras sobrecarregando os joelhos.',
    beneficio: 'Gasto calórico extremo, aceleração do VO2 máx e desenvolvimento de resistência anaeróbica.'
  },
  298: {
    id: 298,
    slug: 'salto-caixa-pliometrica-box-jump',
    nome: 'Salto na Caixa Pliométrica (Box Jump)',
    grupo: 'Funcional & Cardio',
    alvo: 'Potência Pliométrica, Quadríceps e Glúteos',
    sinergistas: 'Panturrilhas e Core',
    equipamento: 'Caixa Pliométrica de Madeira ou Espuma (50 a 75 cm)',
    posicao_inicial: 'Em pé de frente para a caixa a um passo de distância. Pés na largura do quadril.',
    concentrica: 'Balance os braços para trás flexionando os joelhos e salte explosivamente para o alto pousando suavemente sobre a caixa com os dois pés.',
    excentrica: 'Fique totalmente em pé no topo da caixa e desça dando um passo para trás (evite pular de volta para trás para poupar o tendão de Aquiles).',
    passos: [
      'Prepare o salto balançando os braços com flexão rápida de quadril.',
      'Exploda para cima impulsionando o corpo.',
      'Pouse macio no centro da caixa amortecendo o impacto.',
      'Estenda o quadril no topo e desça com um passo suave.'
    ],
    checkpoints: [
      'Pouso suave e silencioso como um gato (absorver com quadril e joelhos).',
      'Extensão completa do quadril no topo da caixa.',
      'Descer com passos em vez de pular de costas.'
    ],
    respiracao: 'Inspire no carregamento; expire no salto.',
    erro_comum: 'Pousar com impacto violento na beirada da caixa com risco de queda.',
    beneficio: 'Desenvolvimento de taxa de desenvolvimento de força (RFD), velocidade de arranque e impulsão vertical para atletas.'
  },
  299: {
    id: 299,
    slug: 'slam-ball-bola-medicinal',
    nome: 'Slam Ball com Bola Medicinal Pesada',
    grupo: 'Funcional & Cardio',
    alvo: 'Dorsais, Core Anterior e Potência de Tronco',
    sinergistas: 'Ombros, Tríceps e Pernas',
    equipamento: 'Slam Ball que não quica (8kg a 15kg)',
    posicao_inicial: 'Em pé segurando a bola no solo entre os pés. Agache, pegue a bola e erga-a acima da cabeça com extensão total.',
    concentrica: 'Arremesse a bola com violência máxima contra o solo usando a força do abdômen e dorsais, flexionando o tronco.',
    excentrica: 'Agache para recolher a bola do solo e repita o ciclo de forma explosiva.',
    passos: [
      'Levante a bola acima da cabeça ficando na ponta dos pés.',
      'Jogue a bola no chão com força máxima como se quisesse quebrar o piso.',
      'Agache para pegar a bola e suba imediatamente.',
      'Mantenha ritmo potente e contínuo.'
    ],
    checkpoints: ['Arremessar com o corpo inteiro e não apenas com os braços', 'Agachar com coluna reta para recolher', 'Bola própria para slam'],
    respiracao: 'Inspire subindo a bola; expire com força máxima ao arremessar no solo.',
    erro_comum: 'Curvar as costas para pegar a bola no chão.',
    beneficio: 'Liberação de estresse e treinamento de potência balística da cadeia anterior sem impacto articular.'
  },
  300: {
    id: 300,
    slug: 'wall-ball-medicine-ball',
    nome: 'Wall Ball com Medicine Ball',
    grupo: 'Funcional & Cardio',
    alvo: 'Quadríceps, Glúteos, Ombros e Condicionamento Global',
    sinergistas: 'Tríceps e Core',
    equipamento: 'Medicine Ball de 6kg a 10kg + Parede/Alvo a 3 metros',
    posicao_inicial: 'Em pé a meio metro da parede segurando a bola na altura do peito com cotovelos sob a bola.',
    concentrica: 'Agache profundamente abaixo da linha paralela e exploda para cima estendendo as pernas, arremessando a bola no alvo a 3 metros de altura na parede.',
    excentrica: 'Receba a bola caindo diretamente na descida do próximo agachamento de forma contínua.',
    passos: [
      'Segure a bola no queixo e agache profundamente.',
      'Exploda as pernas empurrando o chão.',
      'Arremesse a bola no alvo na parede.',
      'Receba a bola e já desça no agachamento seguinte com ritmo fluído.'
    ],
    checkpoints: [
      'Profundidade completa no agachamento a cada repetição.',
      'Arremessar usando o impulso das pernas e não apenas dos ombros.',
      'Transição fluida e contínua.'
    ],
    respiracao: 'Inspire agachando; expire ao arremessar a bola na subida.',
    erro_comum: 'Não agachar até a paralela ou arremessar a bola sem usar a propulsão das pernas.',
    beneficio: 'Um dos exercícios mais intensos do CrossFit para elevar os batimentos cardíacos e queimar calorias.'
  },
  301: {
    id: 301,
    slug: 'corda-naval-ondas-alternadas',
    nome: 'Corda Naval Ondas Alternadas (Battle Ropes)',
    grupo: 'Funcional & Cardio',
    alvo: 'Ombros, Braços, Core e Condicionamento Anaeróbico',
    sinergistas: 'Dorsais e Pernas',
    equipamento: 'Corda Naval Ancorada',
    posicao_inicial: 'Em posição de meio agachamento estável segurando uma ponta da corda em cada mão com braços à frente.',
    concentrica: 'Movimente os braços para cima e para baixo de forma alternada e rápida, gerando ondas contínuas até a âncora da corda.',
    excentrica: 'Mantenha o ritmo ininterrupto por 30 a 45 segundos.',
    passos: [
      'Base de meio agachamento firme com peito aberto.',
      'Mãos seguram as pontas da corda com firmeza.',
      'Bata os braços para cima e para baixo alternando com velocidade máxima.',
      'Mantenha as ondas viajando até o ponto fixo da corda.'
    ],
    checkpoints: ['Ondas consistentes até o final da corda', 'Tronco estável sem balançar a cabeça', 'Joelhos destravados'],
    respiracao: 'Respire em ritmo acelerado e constante.',
    erro_comum: 'Ficar totalmente em pé ereto perdendo a base de potência das pernas.',
    beneficio: 'Trabalho cardiovascular de altíssima intensidade com zero impacto nas articulações dos membros inferiores.'
  },
  302: {
    id: 302,
    slug: 'corda-naval-batida-dupla-slam',
    nome: 'Corda Naval Batida Dupla (Double Slam)',
    grupo: 'Funcional & Cardio',
    alvo: 'Core, Dorsais, Ombros e Potência Total',
    sinergistas: 'Pernas',
    equipamento: 'Corda Naval',
    posicao_inicial: 'Em pé segurando as duas pontas da corda.',
    concentrica: 'Suba ambos os braços juntos acima da cabeça ficando na ponta dos pés e bata as duas cordas simultaneamente no chão com força máxima.',
    excentrica: 'Receba o impacto flexionando os joelhos e suba imediatamente para a próxima batida.',
    passos: [
      'Erga os dois braços juntos para o alto.',
      'Bata as cordas no chão com força corporal total.',
      'Agache para absorver o impacto.',
      'Repita de forma explosiva.'
    ],
    checkpoints: ['Batida simultânea das duas cordas', 'Flexão de quadril no impacto', 'Potência máxima'],
    respiracao: 'Inspire subindo; expire com força na batida.',
    erro_comum: 'Bater apenas com os braços sem engajar o core.',
    beneficio: 'Recruta fibras rápidas do tronco e constrói potência anaeróbica lática.'
  },
  303: {
    id: 303,
    slug: 'pulo-corda-jump-rope',
    nome: 'Pulo de Corda Rápido (Jump Rope)',
    grupo: 'Funcional & Cardio',
    alvo: 'Panturrilhas, Tendão de Aquiles e Resistência Aeróbica',
    sinergistas: 'Ombros e Antebraços',
    equipamento: 'Corda de Pular (Speed Rope)',
    posicao_inicial: 'Em pé segurando as manoplas da corda, cotovelos colados ao corpo, corda atrás dos pés.',
    concentrica: 'Gire a corda usando os punhos e salte de forma leve e rápida na ponta dos pés, descolando apenas 2 a 3 cm do solo.',
    excentrica: 'Amorteça com o antepé mantendo os calcanhares elevados em ritmo contínuo.',
    passos: [
      'Gire a corda estritamente pelos punhos (não pelos ombros).',
      'Salte baixo e rápido na ponta dos pés.',
      'Mantenha os joelhos com microflexão elástica.',
      'Sustente o ritmo por 1 a 3 minutos ininterruptos.'
    ],
    checkpoints: [
      'Giro da corda provém exclusivamente dos punhos.',
      'Saltos baixos e eficientes (2-3 cm do solo).',
      'Calcanhares nunca tocam o chão.'
    ],
    respiracao: 'Respire ritmicamente pelo nariz.',
    erro_comum: 'Pular alto demais dobrando os joelhos para trás e girando os braços inteiros.',
    beneficio: 'O exercício de cardio clássico do boxe para reflexos rápidos, elasticidade dos tendões e alta queima lipídica.'
  },
  304: {
    id: 304,
    slug: 'mountain-climbers-escalador',
    nome: 'Mountain Climbers no Solo (Escalador)',
    grupo: 'Funcional & Cardio',
    alvo: 'Core, Flexores de Quadril e Resistência Cardiovascular',
    sinergistas: 'Ombros e Peitoral',
    equipamento: 'Colchonete / Solo',
    posicao_inicial: 'Em posição de prancha alta com as mãos no chão sob os ombros e corpo em linha reta.',
    concentrica: 'Puxe um joelho em direção ao peito com velocidade e alterne rapidamente com a outra perna, simulando uma corrida no chão.',
    excentrica: 'Mantenha o ritmo acelerado mantendo a bacia baixa.',
    passos: [
      'Firme as mãos no chão em prancha.',
      'Puxe o joelho direito ao peito.',
      'Troque os pés no ar puxando o joelho esquerdo.',
      'Mantenha ritmo dinâmico constante.'
    ],
    checkpoints: ['Quadril rebaixado alinhado com o tronco', 'Mãos firmes no solo', 'Cadência constante'],
    respiracao: 'Respire continuamente.',
    erro_comum: 'Empinar o bumbum para o alto durante a corrida.',
    beneficio: 'Condicionamento dinâmico sem impacto para queimar gordura e acelerar o metabolismo.'
  },
  305: {
    id: 305,
    slug: 'empurrar-treno-sled-push',
    nome: 'Empurrar Trenó de Carga (Prowler Sled Push)',
    grupo: 'Funcional & Cardio',
    alvo: 'Quadríceps, Glúteos, Panturrilhas e Potência de Arranque',
    sinergistas: 'Core, Peitoral e Ombros',
    equipamento: 'Trenó Prowler com Anilhas + Grama Sintética ou Pista',
    posicao_inicial: 'Segure as hastes verticais do trenó com braços estendidos ou dobrados, tronco inclinado 45° para a frente.',
    concentrica: 'Empurre o solo com passos potentes de corrida, cravando as pontas dos pés no solo para mover o trenó à frente.',
    excentrica: 'Mantenha a propulsão contínua pela distância estipulada (ex: 20 a 30 metros).',
    passos: [
      'Incline o corpo contra as hastes do trenó.',
      'Trave os braços e o abdômen.',
      'Dê passos potentes empurrando o chão para trás.',
      'Mantenha a velocidade até cruzar a linha final.'
    ],
    checkpoints: [
      'Ângulo de inclinação corporal de 45° idêntico à aceleração de sprint.',
      'Empurrar através do antepé.',
      'Zero dano excêntrico (sem dor muscular tardia destrutiva).'
    ],
    respiracao: 'Respire forte a cada passada.',
    erro_comum: 'Ficar em pé e empurrar sem inclinação corporal.',
    beneficio: 'Como não possui fase excêntrica significativa, permite trabalhar pernas pesadas com zero dor muscular tardia, sendo o exercício perfeito para atletas.'
  },
  306: {
    id: 306,
    slug: 'puxar-treno-sled-pull',
    nome: 'Puxar Trenó com Corda (Sled Pull)',
    grupo: 'Funcional & Cardio',
    alvo: 'Costas, Isquiotibiais, Glúteos e Braços',
    sinergistas: 'Core e Antebraços',
    equipamento: 'Trenó com Corda Grossa',
    posicao_inicial: 'Em posição de meio agachamento na outra extremidade da corda segurando com as mãos.',
    concentrica: 'Puxe a corda mão sobre mão puxando o trenó em sua direção com a força das costas e braços.',
    excentrica: 'Mantenha a base firme nas pernas absorvendo o peso a cada puxada.',
    passos: [
      'Base baixa e firme com pernas abertas.',
      'Puxe a corda alternando as mãos vigorosamente.',
      'Traga o trenó até os seus pés.',
      'Mantenha as costas ativas durante todo o percurso.'
    ],
    checkpoints: ['Pernas firmes na base', 'Puxada contínua mão sobre mão', 'Coluna neutra'],
    respiracao: 'Respire compassadamente.',
    erro_comum: 'Ficar em pé com pernas esticadas e perder o equilíbrio para trás.',
    beneficio: 'Desenvolvimento maciço de força de tração, espessura nas costas e aderência manual.'
  },
  307: {
    id: 307,
    slug: 'remo-seco-rowing-machine',
    nome: 'Remo Seco Ergômetro (Rowing Machine)',
    grupo: 'Funcional & Cardio',
    alvo: 'Costas, Pernas, Core e Potência Aeróbica (85% da Musculatura Corporal)',
    sinergistas: 'Bíceps e Glúteos',
    equipamento: 'Ergômetro de Remo (Concept 2 ou similar)',
    posicao_inicial: 'Pés travados nas tiras, segure a manopla com braços esticados, joelhos dobrados e tronco inclinado à frente (fase de Catch).',
    concentrica: 'Empurre a plataforma com as pernas (60% da força), incline o tronco para trás (20%) e finalize puxando a manopla no abdômen com os braços (20%).',
    excentrica: 'Retorne estendendo primeiro os braços, inclinando o tronco e por fim dobrando os joelhos de volta à posição inicial.',
    passos: [
      'Empurre com as pernas de forma explosiva.',
      'Incline o tronco levemente para trás.',
      'Puxe a manopla até a linha das costelas inferiores.',
      'Retorne na sequência inversa: braços, tronco e pernas.'
    ],
    checkpoints: [
      'Sequência biomecânica estrita: Pernas -> Tronco -> Braços na puxada; Braços -> Tronco -> Pernas na volta.',
      'A força vem primariamente das pernas e não dos braços.',
      'Coluna alinhada sem curvar.'
    ],
    respiracao: 'Expire na puxada potente; inspire no retorno suave.',
    erro_comum: 'Dobrar os joelhos antes de estender os braços na volta, tendo que levantar a manopla por cima dos joelhos.',
    beneficio: 'O exercício cardiovascular mais completo do planeta, recrutando 85% dos músculos do corpo com zero impacto nas articulações.'
  },
  308: {
    id: 308,
    slug: 'assault-bike-air-bike',
    nome: 'Assault Bike (Air Bike em Alta Intensidade)',
    grupo: 'Funcional & Cardio',
    alvo: 'VO2 Máx, Pernas, Ombros e Condicionamento Metabólico Máximo',
    sinergistas: 'Peito, Costas e Core',
    equipamento: 'Assault Air Bike',
    posicao_inicial: 'Sentado com altura do banco ajustada para que o joelho tenha leve flexão no ponto mais baixo do pedal. Mãos segurando as manoplas móveis.',
    concentrica: 'Pedale com máxima velocidade enquanto empurra e puxa as manoplas com os braços em sincronia.',
    excentrica: 'Quanto mais força você aplica, mais resistência o ventilador de ar gera.',
    passos: [
      'Ajuste o banco e segure as manoplas.',
      'Inicie pedalando com os pés e empurrando/puxando com os braços.',
      'Acelere o ritmo até a intensidade do tiro desejado.',
      'Mantenha a postura sem tombar a cabeça.'
    ],
    checkpoints: ['Braços e pernas trabalham com 100% de esforço integrado', 'Altura correta do selim', 'Ritmo de sprint'],
    respiracao: 'Respire de forma profunda e contínua.',
    erro_comum: 'Pedalar apenas com as pernas deixando os braços moles nas manoplas.',
    beneficio: 'A ferramenta mais brutal da preparação física para elevar a capacidade cardiorrespiratória e o consumo calórico em intervalos HIIT.'
  },

  // =========================================================================
  // MOBILIDADE, POSTURA & RECUPERAÇÃO ARTICULAR (12 EXERCÍCIOS)
  // =========================================================================
  309: {
    id: 309,
    slug: 'rotacao-toracica-4-apoios',
    nome: 'Rotação Torácica em 4 Apoios',
    grupo: 'Mobilidade',
    alvo: 'Mobilidade da Coluna Torácica',
    sinergistas: 'Romboides e Oblíquos',
    equipamento: 'Colchonete',
    posicao_inicial: 'Em 4 apoios com mãos e joelhos no chão. Coloque uma mão atrás da cabeça com cotovelo aberto.',
    concentrica: 'Gire o tronco abrindo o cotovelo para o teto, acompanhando o movimento com o olhar.',
    excentrica: 'Desça o cotovelo em direção ao punho do chão em 3 segundos sentindo o alongamento da coluna torácica.',
    passos: [
      'Posicione-se em 4 apoios com quadril travado.',
      'Mão na nuca com cotovelo aberto.',
      'Gire o peito para cima apontando o cotovelo para o teto.',
      'Desça o cotovelo em direção ao braço de apoio.'
    ],
    checkpoints: ['Quadril permanece imóvel (rotação ocorre apenas na parte alta das costas)', 'Olhar acompanha o cotovelo', 'Movimento suave'],
    respiracao: 'Inspire ao abrir para o teto; expire ao descer.',
    erro_comum: 'Girar a bacia para o lado em vez de rodar a coluna torácica.',
    beneficio: 'Desbloqueia a rigidez da coluna torácica, melhorando a postura no agachamento e diminuindo dores nos ombros e lombar.'
  },
  310: {
    id: 310,
    slug: 'worlds-greatest-stretch-mobilidade',
    nome: 'Maior Alongamento do Mundo (World\'s Greatest Stretch)',
    grupo: 'Mobilidade',
    alvo: 'Quadril, Tornozelos, Torácica e Isquiotibiais',
    sinergistas: 'Flexores e Glúteos',
    equipamento: 'Colchonete',
    posicao_inicial: 'Passada longa no chão com as duas mãos apoiadas no solo por dentro do pé da frente.',
    concentrica: 'Gire o braço do mesmo lado para o teto abrindo o peito, sustente 2 segundos e retorne o cotovelo ao solo.',
    excentrica: 'Estenda o joelho dianteiro empurrando o quadril para trás para alongar os isquiotibiais.',
    passos: [
      'Dê um passo longo e apoie as duas mãos no chão.',
      'Desça o cotovelo de dentro em direção ao tornozelo.',
      'Gire o braço para o teto abrindo a caixa torácica.',
      'Estenda o joelho da frente empurrando o quadril para trás.'
    ],
    checkpoints: [
      'Trabalha 4 articulações cruciais em uma única sequência.',
      'Cadência calma sem solavancos.',
      'Manter calcanhar da frente no chão.'
    ],
    respiracao: 'Respire profunda e calmamente em cada fase.',
    erro_comum: 'Apressar a sequência sem permanecer no ponto de alongamento.',
    beneficio: 'O aquecimento dinâmico mais completo e aclamado do mundo esportivo antes de qualquer sessão de treino pesado.'
  },
  311: {
    id: 311,
    slug: 'ativacao-escapular-barra-fixa',
    nome: 'Ativação Escapular na Barra Fixa (Scapular Pull-Up)',
    grupo: 'Mobilidade',
    alvo: 'Trapézio Inferior e Serrátil Anterior',
    sinergistas: 'Romboides',
    equipamento: 'Barra Fixa',
    posicao_inicial: 'Suspenso na barra com braços totalmente estendidos e relaxados.',
    concentrica: 'Puxe as escápulas para baixo e para trás (depressão e adução escapular), elevando o corpo 5 a 10 cm sem dobrar os cotovelos.',
    excentrica: 'Desça de volta à suspensão relaxada em 2 segundos.',
    passos: [
      'Fique suspenso com braços 100% esticados.',
      'Deprima as escápulas afastando os ombros das orelhas.',
      'Sustente 2 segundos no topo com peito aberto.',
      'Retorne devagar sem dobrar os braços.'
    ],
    checkpoints: ['Cotovelos permanecem totalmente estendidos', 'Movimento exclusivo das escápulas', 'Pausa de 2s'],
    respiracao: 'Expire na ativação escapular; inspire no retorno.',
    erro_comum: 'Flexionar os braços puxando como barra fixa comum.',
    beneficio: 'Ensina o cérebro a ativar a cintura escapular antes de puxar, prevenindo lesões no manguito e fortalecendo a barra fixa.'
  },
  312: {
    id: 312,
    slug: 'flexao-escapular-scapular-push-up',
    nome: 'Flexão Escapular no Chão (Scapular Push-Up)',
    grupo: 'Mobilidade',
    alvo: 'Serrátil Anterior (Protração Escapular)',
    sinergistas: 'Peitoral Menor',
    equipamento: 'Colchonete',
    posicao_inicial: 'Posição de prancha alta com braços estendidos.',
    concentrica: 'Empurre o solo com força afastando as escápulas uma da outra (protração máxima), arredondando suavemente a parte alta das costas.',
    excentrica: 'Deixe o peito descer suavemente aproximando as escápulas sem flexionar os cotovelos.',
    passos: [
      'Prancha alta com braços travados retos.',
      'Deixe o peito afundar juntando as escápulas.',
      'Empurre o chão afastando as escápulas o máximo possível.',
      'Mantenha os cotovelos sempre esticados.'
    ],
    checkpoints: ['Braços retos como pilares', 'Movimento ocorre apenas nas escápulas', 'Core travado'],
    respiracao: 'Inspire descendo; expire empurrando o chão.',
    erro_comum: 'Dobrar os cotovelos fazendo uma flexão de braço comum.',
    beneficio: 'Ativa e hipertrofia o serrátil anterior, músculo que fixa a escápula na caixa torácica e evita a "escápula alada".'
  },
  313: {
    id: 313,
    slug: 'deslocacao-ombros-bastao-elastico',
    nome: 'Dislocação de Ombros com Bastão ou Elástico',
    grupo: 'Mobilidade',
    alvo: 'Mobilidade e Flexibilidade da Articulação Glenoumeral',
    sinergistas: 'Peitoral e Manguito',
    equipamento: 'Bastão de PVC ou Elástico Longo',
    posicao_inicial: 'Em pé segurando o bastão com pegada aberta na frente das coxas.',
    concentrica: 'Eleve o bastão com braços estendidos passando por cima da cabeça até encostar nas costas/glúteos atrás do corpo.',
    excentrica: 'Retorne o bastão para a frente pelo mesmo arco amplo de forma controlada.',
    passos: [
      'Segure o bastão com pegada ampla.',
      'Suba os braços esticados sobre a cabeça.',
      'Passe o bastão suavemente para trás das costas.',
      'Retorne para a frente sem dobrar os cotovelos.'
    ],
    checkpoints: [
      'Cotovelos permanecem estendidos (se precisar dobrar, abra mais a pegada).',
      'Movimento contínuo e sem dor.',
      'Coluna neutra sem arquear a lombar.'
    ],
    respiracao: 'Inspire subindo; expire passando para trás.',
    erro_comum: 'Usar pegada muito fechada e forçar a articulação do ombro.',
    beneficio: 'Restaura a amplitude articular saudável dos ombros, ideal antes de sessões pesadas de supino e desenvolvimento.'
  },
  314: {
    id: 314,
    slug: 'agachamento-cocoras-deep-squat-hold',
    nome: 'Agachamento Cócoras Isométrico (Deep Squat Hold)',
    grupo: 'Mobilidade',
    alvo: 'Mobilidade de Tornozelos, Joelhos e Abertura de Quadril',
    sinergistas: 'Adutores e Eretores',
    equipamento: 'Peso Corporal (Pode segurar em um poste/suporte para apoio)',
    posicao_inicial: 'Pés na largura dos ombros com pontas ligeiramente para fora. Agache até o fundo máximo das cócoras.',
    concentrica: 'Mantenha-se sentado nas cócoras com cotovelos empurrando os joelhos para fora e peito erguido.',
    excentrica: 'Sustente a posição imóvel por 60 segundos respirando profundamente.',
    passos: [
      'Desça em cócoras profunda.',
      'Coloque os cotovelos por dentro dos joelhos e junte as palmas das mãos.',
      'Estufe o peito e mantenha os calcanhares no solo.',
      'Sustente respirando diafragmaticamente.'
    ],
    checkpoints: [
      'Calcanhares colados no chão (se levantar, apoie um calço leve ou segure em um poste).',
      'Peito aberto e coluna longa.',
      'Cotovelos mantêm os joelhos abertos.'
    ],
    respiracao: 'Respirações lentas e profundas no abdômen.',
    erro_comum: 'Ficar na ponta dos pés com os calcanhares no ar.',
    beneficio: 'Restaura o padrão de repouso primal da anatomia humana, desbloqueando tornozelos e quadris para o agachamento livre.'
  },
  315: {
    id: 315,
    slug: 'mobilidade-quadril-9090-transicao',
    nome: 'Mobilidade de Quadril 90/90 com Transição Dinâmica',
    grupo: 'Mobilidade',
    alvo: 'Rotação Interna e Externa da Articulação do Quadril',
    sinergistas: 'Glúteo Médio, Piriforme e Cápsula Articular',
    equipamento: 'Colchonete no Solo',
    posicao_inicial: 'Sentado no chão com ambas as pernas dobradas a 90°: a perna da frente em rotação externa e a perna de trás em rotação interna. Coluna ereta.',
    concentrica: 'Gire os joelhos no ar mantendo os calcanhares em contato com o solo, invertendo as pernas para o lado oposto sem usar as mãos de apoio no chão.',
    excentrica: 'Incline o peito ereto sobre o joelho dianteiro no final de cada transição por 2 segundos.',
    passos: [
      'Sente-se com pernas a 90° (uma na frente e uma ao lado).',
      'Incline o tronco reto sobre a coxa dianteira.',
      'Gire os dois joelhos pelo alto sem tirar os calcanhares do piso.',
      'Acomode-se no lado oposto e repita a inclinação.'
    ],
    checkpoints: [
      'Ângulo de 90° em ambos os joelhos.',
      'Manter os calcanhares fixos no chão durante o giro.',
      'Tronco ereto sem arredondar as costas.'
    ],
    respiracao: 'Inspire na transição; expire na inclinação sobre a perna.',
    erro_comum: 'Arredondar a coluna torácica para tentar descer mais.',
    beneficio: 'O exercício mais recomendado do mundo para destravar a rotação interna do fêmur, aliviando sobrecargas nos joelhos e coluna lombar.'
  },
  316: {
    id: 316,
    slug: 'alongamento-peitoral-biceps-parede',
    nome: 'Alongamento de Peitoral e Bíceps na Parede',
    grupo: 'Mobilidade',
    alvo: 'Peitoral Maior, Menor e Cabeça Curta do Bíceps',
    sinergistas: 'Deltoide Anterior',
    equipamento: 'Parede Lisa ou Batente de Porta',
    posicao_inicial: 'Em pé ao lado da parede. Apoie a palma da mão e o antebraço contra a parede na altura do ombro com cotovelo a 90°.',
    concentrica: 'Dê um passo à frente com a perna do mesmo lado e gire suavemente o tronco para o lado oposto até sentir alongamento profundo no peitoral e ombro.',
    excentrica: 'Mantenha a posição estática respirando suavemente por 30 a 45 segundos por lado.',
    passos: [
      'Apoie a mão e cotovelo na parede na linha do ombro.',
      'Dê um passo à frente com a perna correspondente.',
      'Gire o tronco para o lado contrário sentindo o peitoral abrir.',
      'Sustente a respiração relaxando os tecidos.'
    ],
    checkpoints: ['Cotovelo alinhado com o ombro', 'Giro suave sem forçar o ombro', 'Ombro relaxado para baixo'],
    respiracao: 'Respiração calma e diafragmática.',
    erro_comum: 'Girar o corpo bruscamente forçando os ligamentos anteriores do ombro.',
    beneficio: 'Corrige a postura de ombros caídos para frente e combate o encurtamento gerado pelo excesso de horas sentado ao computador.'
  },
  317: {
    id: 317,
    slug: 'alongamento-flexores-quadril-psoas',
    nome: 'Alongamento de Flexores de Quadril (Psoas) no Chão',
    grupo: 'Mobilidade',
    alvo: 'Iliopsoas e Reto Femoral',
    sinergistas: 'Sartório',
    equipamento: 'Colchonete',
    posicao_inicial: 'Posição de meio ajoelhado (um joelho no chão e o outro pé à frente a 90°). Tronco perfeitamente reto.',
    concentrica: 'Faça uma leve retroversão pélvica (aperte o glúteo da perna de trás) e avance o quadril suavemente para a frente mantendo a coluna ereta.',
    excentrica: 'Sustente o alongamento na frente do quadril traseiro por 30 a 45 segundos por perna.',
    passos: [
      'Ajoelhe-se com um joelho no chão e outro à frente.',
      'Aperte o glúteo da perna de trás encaixando a bacia.',
      'Avance o quadril levemente para a frente com o tronco ereto.',
      'Sustente o alongamento sem arquear a coluna.'
    ],
    checkpoints: [
      'Retroversão pélvica prévia (apertar o glúteo da perna de trás dobra a eficácia do alongamento).',
      'Tronco reto (não hiperestender a lombar).',
      'Manter joelho traseiro acolchoado.'
    ],
    respiracao: 'Inspire profundamente; expire relaxando no alongamento.',
    erro_comum: 'Arquear as costas para trás em vez de mover a bacia para a frente com a retroversão pélvica.',
    beneficio: 'Alivia instantaneamente a tração lombar causada pelo psoas encurtado, prevenindo lombalgias crônicas.'
  },
  318: {
    id: 318,
    slug: 'alongamento-dinamico-isquiotibiais',
    nome: 'Alongamento Dinâmico de Isquiotibiais em Movimento',
    grupo: 'Mobilidade',
    alvo: 'Cadeia Posterior e Fáscia Plantar Dinâmica',
    sinergistas: 'Panturrilhas',
    equipamento: 'Peso Corporal (Chão)',
    posicao_inicial: 'Em pé. Dê um passo à frente apoiando apenas o calcanhar com a perna esticada e ponta do pé para cima.',
    concentrica: 'Incline o quadril para trás varrendo as mãos em direção ao chão como se estivesse pegando algo no solo, sentindo o posterior esticar de forma fluida.',
    excentrica: 'Fique em pé e avance para o próximo passo alternando as pernas em movimento contínuo.',
    passos: [
      'Coloque o calcanhar à frente com a ponta do pé para cima.',
      'Empurre o quadril para trás com coluna reta.',
      'Passe as mãos suavemente perto do chão sentindo o posterior da coxa.',
      'Suba e dê o passo seguinte alternando as pernas.'
    ],
    checkpoints: ['Perna da frente estendida com ponta para cima', 'Movimento contínuo e compassado', 'Coluna plana'],
    respiracao: 'Respire ritmicamente em cada passo.',
    erro_comum: 'Arredondar a coluna lombar sem empurrar o quadril para trás.',
    beneficio: 'Aumenta a flexibilidade dinâmica e a complacência muscular antes de treinos de corrida e pernas.'
  },
  319: {
    id: 319,
    slug: 'liberacao-miofascial-quadriceps-foam-roller',
    nome: 'Rolo de Liberação Miofascial em Quadríceps (Foam Roller)',
    grupo: 'Mobilidade',
    alvo: 'Fáscia e Musculatura do Quadríceps',
    sinergistas: 'Reto Femoral e Vasto Lateral',
    equipamento: 'Rolo de Liberação Miofascial (Foam Roller)',
    posicao_inicial: 'Deitado de bruços em prancha apoiando a face anterior das coxas sobre o rolo de espuma.',
    concentrica: 'Deslize o corpo para a frente e para trás rolando desde a linha acima dos joelhos até a dobra do quadril.',
    excentrica: 'Ao encontrar pontos dolorosos (trigger points), pause imóvel por 20 a 30 segundos respirando até a dor diminuir.',
    passos: [
      'Posicione o rolo sob as coxas em prancha no solo.',
      'Deslize suavemente para cima e para baixo usando o apoio dos braços.',
      'Pause em pontos de tensão acumulada.',
      'Role devagar por 60 segundos por perna.'
    ],
    checkpoints: ['Rolagem lenta e controlada', 'Pausa nos pontos de gatilho', 'Sem arquear a coluna lombar'],
    respiracao: 'Respire profunda e calmamente nos pontos dolorosos.',
    erro_comum: 'Rolar em cima da articulação do joelho (patela).',
    beneficio: 'Quebra aderências fasciais, restaura o fluxo sanguíneo e devolve a elasticidade muscular no pós-treino.'
  },
  320: {
    id: 320,
    slug: 'mobilidade-tornozelo-parede-dorsiflexao',
    nome: 'Mobilidade de Tornozelo na Parede com Joelho à Frente',
    grupo: 'Mobilidade',
    alvo: 'Dorsiflexão do Tornozelo e Tendão de Aquiles',
    sinergistas: 'Sóleo e Gastrocnêmio',
    equipamento: 'Parede Lisa',
    posicao_inicial: 'Em pé de frente para a parede com um pé posicionado a cerca de 8 a 10 cm da parede. Mãos apoiadas na parede.',
    concentrica: 'Avance o joelho em direção à parede até tocá-la, mantendo o calcanhar 100% cravado no solo.',
    excentrica: 'Retorne suavemente e repita por 15 repetições dinâmicas por perna.',
    passos: [
      'Posicione o pé a 8-10 cm da parede.',
      'Empurre o joelho para a frente em direção à parede.',
      'Toque a parede com o joelho sem levantar o calcanhar do chão.',
      'Retorne e repita aumentando a amplitude progressivamente.'
    ],
    checkpoints: [
      'Calcanhar nunca sai do solo durante o avanço do joelho.',
      'Joelho avança em linha com o segundo dedo do pé (sem desabar para dentro).',
      'Distância mínima ideal de 8 a 10 cm da parede.'
    ],
    respiracao: 'Inspire na volta; expire no avanço do joelho.',
    erro_comum: 'Levantar o calcanhar do chão para conseguir encostar o joelho na parede.',
    beneficio: 'Aumenta a dorsiflexão do tornozelo, permitindo agachar muito mais fundo com o tronco reto e sem inclinar para a frente.'
  }
};
