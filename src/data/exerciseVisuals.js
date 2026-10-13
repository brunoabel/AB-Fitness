// Catálogo de Fotos Reais e Referências Anatômicas dos Exercícios • AB Fitness
// Cada exercício possui foto real de alta definição, mapeamento exato do músculo alvo e fases de movimento.

export const EXERCISE_VISUALS = {
  // --- PANTURRILHAS (CORREÇÃO CRÍTICA DO FEEDBACK) ---
  'panturrilha-explosiva': {
    name: 'Panturrilha em Pé no Step',
    targetGroup: 'Gastrocnêmio & Tendão de Aquiles',
    secondary: 'Sóleo e Estabilizadores do Tornozelo',
    equipment: 'Degrau / Step + Halteres ou Carga Corporal',
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Antepé apoiado firmemente na borda do degrau, com calcanhares livres e projetados abaixo do nível do step para alongamento completo.',
    phaseConcentric: 'Elevação máxima do calcanhar com contração vigorosa do gastrocnêmio, sustentando 1 segundo de pico no topo.',
    phaseEccentric: 'Descida lenta e controlada em 3 segundos, permitindo dorsiflexão profunda sem quicar no fundo.',
    safetyCheck: 'Nunca execute movimentos rápidos e quicados. A velocidade deve ser controlada para transferir a tensão para a musculatura e tendão sem impacto.'
  },
  'panturrilha-sentado': {
    name: 'Panturrilha Sentado na Máquina',
    targetGroup: 'Sóleo (Músculo Profundo da Panturrilha)',
    secondary: 'Tendão Calcâneo',
    equipment: 'Máquina de Panturrilha Sentado',
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Sentado com almofada sobre a extremidade distal das coxas e pontas dos pés no apoio.',
    phaseConcentric: 'Empurre a almofada para cima estendendo os tornozelos com os joelhos a 90 graus.',
    phaseEccentric: 'Desça até sentir o sóleo alongar sob a carga, mantendo cadência suave de 3 segundos.',
    safetyCheck: 'Com joelhos flexionados a 90°, o gastrocnêmio fica desativado por insuficiência ativa, isolando o músculo sóleo.'
  },

  // --- PEITORAL ---
  'supino-halteres-soccer': {
    name: 'Supino Reto com Halteres',
    targetGroup: 'Peitoral Maior (Fibras Médias)',
    secondary: 'Tríceps Braquial e Deltoide Anterior',
    equipment: 'Banco Reto + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Deitado no banco reto com pés firmes no solo, escápulas aduzidas e halteres ao lado do peito.',
    phaseConcentric: 'Empurre os halteres para cima em trajetória ligeiramente convergente, sem bater os pesos no topo.',
    phaseEccentric: 'Desça em 2 a 3 segundos com cotovelos em ângulo de 45° a 60° em relação ao tronco até sentir o peitoral esticar.',
    safetyCheck: 'Nunca abra os cotovelos a 90° em cruz para preservar a integridade do manguito rotador.'
  },
  'supino-reto-halteres': {
    name: 'Supino Reto com Halteres',
    targetGroup: 'Peitoral Maior',
    secondary: 'Tríceps & Deltoides',
    equipment: 'Banco Reto + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Costas firmemente apoiadas com escápulas travadas contra o banco.',
    phaseConcentric: 'Extensão dos braços convergindo para a linha média do esterno.',
    phaseEccentric: 'Descida controlada sentindo o peitoral abrir com amplitude anatômica.',
    safetyCheck: 'Mantenha os punhos alinhados sobre os antebraços sem dobrar para trás.'
  },
  'incline-dumbbell-soccer': {
    name: 'Supino Inclinado com Halteres (30°)',
    targetGroup: 'Peitoral Superior (Porção Clavicular)',
    secondary: 'Deltoide Anterior e Tríceps',
    equipment: 'Banco Inclinado (30°) + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Sentado no banco a 30°, halteres alinhados à porção superior do tórax.',
    phaseConcentric: 'Empurre verticalmente para o teto contraindo o peitoral superior.',
    phaseEccentric: 'Desça suavemente até a linha da clavícula em 2 a 3 segundos.',
    safetyCheck: 'Evite inclinação acima de 45°, pois transfere a carga quase toda para os ombros.'
  },
  'supino-inclinado-halteres': {
    name: 'Supino Inclinado com Halteres',
    targetGroup: 'Peitoral Superior',
    secondary: 'Deltoides e Tríceps',
    equipment: 'Banco 30° + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Escápulas travadas no encosto inclinado.',
    phaseConcentric: 'Empurre os halteres para cima e para dentro.',
    phaseEccentric: 'Descida ritmada preservando a tensão no peito.',
    safetyCheck: 'Mantenha a cabeça encostada no banco.'
  },
  'crucifixo-reto-cabos': {
    name: 'Crucifixo no Crossover / Cabos',
    targetGroup: 'Peitoral Maior (Isolamento)',
    secondary: 'Deltoide Anterior',
    equipment: 'Polia Dupla / Crossover',
    photoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé entre as polias, braços abertos com cotovelos levemente flexionados (15°).',
    phaseConcentric: 'Aproxime as mãos à frente como em um abraço amplo até as mãos quase se tocarem.',
    phaseEccentric: 'Abra os braços controlando a tração dos cabos sentindo o peito esticar.',
    safetyCheck: 'Mantenha o ângulo do cotovelo constante; não dobre e estique como em um supino.'
  },

  // --- OMBROS ---
  'desenvolvimento-halteres': {
    name: 'Desenvolvimento com Halteres',
    targetGroup: 'Deltoide Anterior & Médio (Ombros)',
    secondary: 'Trapézio Superior e Tríceps',
    equipment: 'Banco 75° a 80° + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Costas bem apoiadas, halteres na altura das orelhas com cotovelos ligeiramente à frente do corpo.',
    phaseConcentric: 'Empurre os halteres para cima de forma contínua até a extensão quase completa dos braços.',
    phaseEccentric: 'Desça em 2 segundos mantendo o controle total do peso até o nível do queixo/orelha.',
    safetyCheck: 'Não hiperestenda a coluna lombar; mantenha o abdômen firme contraído.'
  },
  'elevacao-lateral-speed': {
    name: 'Elevação Lateral com Halteres',
    targetGroup: 'Deltoide Lateral (Ombros em V)',
    secondary: 'Trapézio e Manguito Rotador',
    equipment: 'Par de Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé, tronco ereto com leve inclinação anterior de 5°, halteres ao lado das coxas.',
    phaseConcentric: 'Eleve os braços lateralmente até a linha do ombro, com cotovelos ligeiramente flexionados.',
    phaseEccentric: 'Desça sem despencar o peso, sustentando a tensão até quase tocar as coxas.',
    safetyCheck: 'Não balance o tronco para impulsionar o peso; se precisar de impulso, reduza a carga.'
  },
  'elevacao-lateral-halteres': {
    name: 'Elevação Lateral com Halteres',
    targetGroup: 'Deltoide Lateral',
    secondary: 'Trapézio',
    equipment: 'Par de Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Halteres ao lado do corpo com punhos firmes.',
    phaseConcentric: 'Elevação suave até a altura dos ombros.',
    phaseEccentric: 'Descida em 2 segundos controlados.',
    safetyCheck: 'Polegares apontando sutilmente para baixo ou neutros.'
  },

  // --- TRÍCEPS & BRAÇOS ---
  'triceps-corda-soccer': {
    name: 'Tríceps Pulley na Corda',
    targetGroup: 'Tríceps Braquial (Todas as Cabeças)',
    secondary: 'Antebraço e Pegada',
    equipment: 'Polia Alta + Acessório Corda',
    photoUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Cotovelos colados às costelas, tronco inclinado 10° à frente, mãos segurando a corda.',
    phaseConcentric: 'Estenda os braços completamente para baixo e abra as pontas da corda na contração máxima.',
    phaseEccentric: 'Retorne os antebraços até 90° mantendo os cotovelos travados na mesma posição.',
    safetyCheck: 'Não deixe os cotovelos se moverem para frente e para trás durante a repetição.'
  },
  'triceps-frances-soccer': {
    name: 'Tríceps Francês com Halter',
    targetGroup: 'Tríceps (Cabeça Longa)',
    secondary: 'Deltoides e Estabilizadores',
    equipment: 'Banco ou em Pé + Halter',
    photoUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Halter seguro acima da cabeça com cotovelo vertical apontando para o teto.',
    phaseConcentric: 'Estenda o antebraço para cima contraindo o tríceps em máxima amplitude.',
    phaseEccentric: 'Flexione o cotovelo descendo o peso atrás da nuca sentindo o tríceps alongar.',
    safetyCheck: 'Mantenha o cotovelo próximo da orelha sem abrir excessivamente para os lados.'
  },
  'rosca-w-soccer': {
    name: 'Rosca Direta com Barra W / Halteres',
    targetGroup: 'Bíceps Braquial',
    secondary: 'Braquial e Antebraço',
    equipment: 'Barra W com Anilhas ou Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé, pés firmes, braços estendidos segurando a barra nas curvas anatômicas.',
    phaseConcentric: 'Flexione os cotovelos elevando a barra em direção aos ombros sem balançar a lombar.',
    phaseEccentric: 'Desça em 2 a 3 segundos até a extensão controlada dos braços.',
    safetyCheck: 'Não jogue os cotovelos para frente no topo nem impulsione com o quadril.'
  },
  'rosca-martelo-soccer': {
    name: 'Rosca Martelo com Halteres',
    targetGroup: 'Braquial, Braquiorradial & Bíceps',
    secondary: 'Músculos Flexores do Antebraço',
    equipment: 'Par de Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé com pegada neutra (palmas das mãos voltadas uma para a outra).',
    phaseConcentric: 'Flexione os cotovelos subindo os halteres como se martelasse para cima.',
    phaseEccentric: 'Desça com cadência controlada resistindo à gravidade.',
    safetyCheck: 'A pegada neutra protege os punhos e estimula o músculo braquial profundo.'
  },

  // --- DORSAL & COSTAS ---
  'puxada-alta-soccer': {
    name: 'Puxada Frontal na Polia Alta',
    targetGroup: 'Latíssimo do Dorso (Grande Dorsal / Asas)',
    secondary: 'Bíceps Braquial, Romboides e Trapézio',
    equipment: 'Polia Alta + Barra Larga',
    photoUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Sentado com as coxas travadas sob os rolos acolchoados, pegada ligeiramente mais larga que os ombros.',
    phaseConcentric: 'Inicie o movimento deprimindo as escápulas e puxe a barra até a parte superior do peito.',
    phaseEccentric: 'Retorne em 3 segundos controlando a subida até sentir as dorsais alongarem completamente.',
    safetyCheck: 'Não puxe a barra atrás da nuca, o que gera estresse desnecessário nos ombros e coluna cervical.'
  },
  'puxada-frontal-aberta': {
    name: 'Puxada Frontal na Polia',
    targetGroup: 'Grande Dorsal',
    secondary: 'Bíceps e Romboides',
    equipment: 'Lat Machine + Barra Larga',
    photoUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Coxas fixas, tronco inclinado 10° para trás.',
    phaseConcentric: 'Tração em direção ao esterno alto.',
    phaseEccentric: 'Alongamento dorsal controlado na subida.',
    safetyCheck: 'Escápulas se fecham na descida e se abrem na subida.'
  },
  'remada-serrote-soccer': {
    name: 'Remada Unilateral com Halter (Serrote)',
    targetGroup: 'Grande Dorsal & Espessura das Costas',
    secondary: 'Bíceps, Romboides e Core',
    equipment: 'Banco Reto + Halter',
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Joelho e mão apoiados no banco, coluna reta paralela ao chão, braço estendido segurando o halter.',
    phaseConcentric: 'Puxe o halter em direção ao quadril conduzindo com o cotovelo rente às costelas.',
    phaseEccentric: 'Desça o halter suavemente estendendo o braço sem rotacionar a coluna.',
    safetyCheck: 'Mantenha o quadril e os ombros nivelados para isolar a musculatura dorsal.'
  },

  // --- PERNAS & GLÚTEOS ---
  'bulgaro-soccer': {
    name: 'Agachamento Búlgaro com Halteres',
    targetGroup: 'Quadríceps, Glúteo Máximo & Estabilidade Unilateral',
    secondary: 'Isquiotibiais, Adutores e Tornozelo',
    equipment: 'Banco Reto + Par de Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Um pé à frente bem plantado no solo e o peito do pé de trás apoiado sobre o banco.',
    phaseConcentric: 'Empurre o chão com o calcanhar da perna da frente para retornar à posição inicial.',
    phaseEccentric: 'Flexione o joelho da frente descendo até a coxa ficar paralela ao chão em ângulo de 90°.',
    safetyCheck: 'Mantenha o joelho dianteiro apontando na direção dos dedos dos pés, evitando valgo dinâmico.'
  },
  'agachamento-bulgaro': {
    name: 'Agachamento Búlgaro',
    targetGroup: 'Quadríceps & Glúteos',
    secondary: 'Cadeia Unilateral',
    equipment: 'Banco + Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Postura vertical com pé traseiro elevado.',
    phaseConcentric: 'Força na perna dianteira.',
    phaseEccentric: 'Descida profunda em 3 segundos.',
    safetyCheck: 'Tronco ligeiramente inclinado preserva o joelho.'
  },
  'leg-press-45': {
    name: 'Leg Press 45°',
    targetGroup: 'Quadríceps & Glúteo Máximo',
    secondary: 'Isquiotibiais e Panturrilhas',
    equipment: 'Aparelho Leg Press 45°',
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Sentado com as costas e lombar coladas no encosto, pés na plataforma na largura dos ombros.',
    phaseConcentric: 'Empurre a plataforma com os calcanhares sem travar os joelhos em hiperextensão no topo.',
    phaseEccentric: 'Flexione os joelhos trazendo a plataforma até um ângulo de 90° com segurança.',
    safetyCheck: 'Nunca permita que a lombar descole do banco no ponto mais baixo do movimento.'
  },
  'agachamento-goblet': {
    name: 'Agachamento Goblet com Halter',
    targetGroup: 'Quadríceps, Glúteos & Core',
    secondary: 'Eretores da Espinha e Adutores',
    equipment: 'Halter Segurado Junto ao Peito',
    photoUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé com pés um pouco além da largura dos ombros, halter seguro na vertical contra o esterno.',
    phaseConcentric: 'Empurre o chão com os calcanhares estendendo joelhos e quadris simultaneamente.',
    phaseEccentric: 'Agache empurrando os joelhos para fora com coluna neutra até as coxas ficarem paralelas ao solo.',
    safetyCheck: 'Mantenha o peito aberto e não deixe os cotovelos colidirem nos joelhos.'
  },
  'rdl-halteres': {
    name: 'RDL / Levantamento Terra Romeno com Halteres',
    targetGroup: 'Isquiotibiais (Posterior de Coxa)',
    secondary: 'Glúteo Máximo e Lombar',
    equipment: 'Par de Halteres',
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em pé com halteres à frente das coxas, joelhos levemente destravados (flexão fixa de 15°).',
    phaseConcentric: 'Contraia os glúteos e posteriores estendendo o quadril para voltar à posição ereta.',
    phaseEccentric: 'Projete o quadril para trás como se fosse fechar uma porta com os glúteos, descendo os halteres rentes às canelas.',
    safetyCheck: 'Não dobre a coluna lombar; o movimento é uma articulação pura de quadril (hip hinge).'
  },
  'mesa-flexora': {
    name: 'Mesa Flexora Deitada',
    targetGroup: 'Isquiotibiais (Bíceps Femoral e Semitendinoso)',
    secondary: 'Panturrilhas',
    equipment: 'Máquina Flexora Deitada',
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Deitado de bruços com o rolo posicionado logo acima dos calcanhares/tendão.',
    phaseConcentric: 'Flexione os joelhos puxando o rolo em direção aos glúteos com contração máxima no topo.',
    phaseEccentric: 'Desça a carga controladamente em 3 segundos sem soltar o peso no descanso.',
    safetyCheck: 'Mantenha o quadril colado no banco durante toda a flexão.'
  },
  'elevacao-pelvica-soccer': {
    name: 'Elevação Pélvica / Hip Thrust com Halter',
    targetGroup: 'Glúteo Máximo (Pico de Extensão de Quadril)',
    secondary: 'Posterior de Coxa e Core',
    equipment: 'Banco Reto + Halter sobre o Quadril',
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Escápulas apoiadas no banco, pés plantados no chão, halter seguro sobre a crista ilíaca.',
    phaseConcentric: 'Empurre o quadril para o alto até o corpo formar uma linha reta dos ombros aos joelhos.',
    phaseEccentric: 'Desça o quadril de forma controlada até quase tocar o chão.',
    safetyCheck: 'No topo, certifique-se de que as tíbias (canelas) fiquem 100% verticais em ângulo de 90°.'
  },

  // --- CORE & MOBILIDADE ---
  'prancha-rotacional': {
    name: 'Prancha com Toque nos Ombros (Anti-Rotação)',
    targetGroup: 'Core Profundo, Transverso Abdominal & Oblíquos',
    secondary: 'Ombros e Lombar',
    equipment: 'Colchonete no Solo',
    photoUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Posição de prancha alta com as mãos alinhadas sob os ombros e pés ligeiramente afastados.',
    phaseConcentric: 'Retire uma das mãos e toque no ombro oposto mantendo o quadril totalmente imóvel.',
    phaseEccentric: 'Apoie a mão suavemente de volta e alterne para o outro lado.',
    safetyCheck: 'O segredo é evitar o balanço do quadril; contraia os glúteos e o abdômen firmemente.'
  },
  'copenhague-leves': {
    name: 'Prancha Copenhague (Fortalecimento de Adutores)',
    targetGroup: 'Músculos Adutores da Coxa & Virilha',
    secondary: 'Core Lateral e Quadril',
    equipment: 'Banco ou Colchonete',
    photoUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Em prancha lateral com o joelho da perna superior apoiado no banco.',
    phaseConcentric: 'Eleve o quadril mantendo o corpo alinhado e sustente a posição isométrica.',
    phaseEccentric: 'Desça suavemente após o tempo determinado.',
    safetyCheck: 'Fundamental para prevenção de lesões na virilha (pubalgia) e estabilização pélvica.'
  },
  'mobilidade-9090-soccer': {
    name: 'Mobilidade de Quadril 90/90',
    targetGroup: 'Cápsula Articular do Quadril & Glúteo Médio',
    secondary: 'Lombar e Pelve',
    equipment: 'Colchonete',
    photoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Sentado no solo com ambas as pernas flexionadas a 90° (uma na frente e uma lateral).',
    phaseConcentric: 'Incline o tronco com coluna reta à frente sobre a perna dianteira.',
    phaseEccentric: 'Retorne e alterne o lado mantendo os calcanhares no solo.',
    safetyCheck: 'Respire fundo e não curve a coluna torácica; o movimento deve partir da dobra do quadril.'
  },
  'alongamento-isquiotibiais-dinamico': {
    name: 'Alongamento Ativo de Posteriores & Tornozelo',
    targetGroup: 'Isquiotibiais & Fáscia Plantar',
    secondary: 'Panturrilhas',
    equipment: 'Colchonete',
    photoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Deitado de costas, perna estendida para o alto com auxílio das mãos ou elástico.',
    phaseConcentric: 'Flexione e aponte a ponta do pé para cima e para baixo (dorsiflexão e flexão plantar).',
    phaseEccentric: 'Sustente o alongamento suave da musculatura posterior.',
    safetyCheck: 'Não aplique força excessiva que provoque dor aguda; mantenha tensão suave e confortável.'
  },
  'abdominal-crunch-chute': {
    name: 'Abdominal Crunch com Sobrecarga',
    targetGroup: 'Reto Abdominal (Parte Superior e Média)',
    secondary: 'Oblíquos',
    equipment: 'Colchonete + Anilha ou Halter',
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Deitado de costas com joelhos dobrados a 90°, segurando a carga junto ao peito.',
    phaseConcentric: 'Flexione o tronco aproximando as costelas do quadril, soltando todo o ar dos pulmões.',
    phaseEccentric: 'Desça em 2 segundos sem relaxar o abdômen contra o chão.',
    safetyCheck: 'Não force o pescoço com as mãos; o esforço deve vir unicamente da flexão do abdômen.'
  }
};

/**
 * Retorna os dados visuais e anatômicos exatos de qualquer exercício.
 * Garante que panturrilha SEMPRE retorne dados de panturrilha, supino de peito, etc.
 */
export function getExerciseVisual(exercise) {
  if (!exercise) return null;
  const id = exercise.id;
  const anim = exercise.animationType || exercise.diagramType;

  // 1. Busca direta por ID
  if (EXERCISE_VISUALS[id]) {
    return EXERCISE_VISUALS[id];
  }

  // 2. Busca por categoria ou tipo de movimento
  if (id.includes('panturrilha') || anim === 'calf-raise') {
    return EXERCISE_VISUALS['panturrilha-explosiva'];
  }
  if (id.includes('supino') || id.includes('bench') || anim === 'dumbbell-press') {
    return EXERCISE_VISUALS['supino-halteres-soccer'];
  }
  if (id.includes('inclinado') || anim === 'incline-press') {
    return EXERCISE_VISUALS['incline-dumbbell-soccer'];
  }
  if (id.includes('desenvolvimento') || anim === 'shoulder-press') {
    return EXERCISE_VISUALS['desenvolvimento-halteres'];
  }
  if (id.includes('lateral') || anim === 'lateral-raise') {
    return EXERCISE_VISUALS['elevacao-lateral-speed'];
  }
  if (id.includes('triceps') || anim === 'triceps-pushdown') {
    return EXERCISE_VISUALS['triceps-corda-soccer'];
  }
  if (id.includes('bulgaro') || id.includes('squat') || anim === 'squat') {
    return EXERCISE_VISUALS['bulgaro-soccer'];
  }
  if (id.includes('leg-press') || anim === 'leg-press') {
    return EXERCISE_VISUALS['leg-press-45'];
  }
  if (id.includes('rdl') || id.includes('stiff') || anim === 'leg-curl') {
    return EXERCISE_VISUALS['rdl-halteres'];
  }
  if (id.includes('flexora')) {
    return EXERCISE_VISUALS['mesa-flexora'];
  }
  if (id.includes('pelvica') || id.includes('hip-thrust')) {
    return EXERCISE_VISUALS['elevacao-pelvica-soccer'];
  }
  if (id.includes('puxada') || anim === 'lat-pulldown') {
    return EXERCISE_VISUALS['puxada-alta-soccer'];
  }
  if (id.includes('serrote') || id.includes('remada') || anim === 'one-arm-row') {
    return EXERCISE_VISUALS['remada-serrote-soccer'];
  }
  if (id.includes('rosca') || anim === 'bicep-curl' || anim === 'hammer-curl') {
    return EXERCISE_VISUALS['rosca-w-soccer'];
  }
  if (id.includes('prancha') || id.includes('crunch') || anim === 'crunch') {
    return EXERCISE_VISUALS['prancha-rotacional'];
  }
  if (id.includes('mobilidade') || id.includes('alongamento') || anim === 'mobility' || anim === 'stretch') {
    return EXERCISE_VISUALS['mobilidade-9090-soccer'];
  }

  // Fallback seguro baseado no target do exercício
  return {
    name: exercise.name,
    targetGroup: exercise.target || 'Musculatura Alvo Ativa',
    secondary: exercise.secondary || 'Músculos Estabilizadores',
    equipment: exercise.equipment || 'Equipamento Recomendado',
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    phaseInitial: 'Posicionamento estável com articulações alinhadas.',
    phaseConcentric: 'Fase de contração máxima controlada.',
    phaseEccentric: 'Fase excêntrica suave de 2 a 3 segundos.',
    safetyCheck: 'Mantenha postura neutra e respiração contínua.'
  };
}
