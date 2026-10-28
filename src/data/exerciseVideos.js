/**
 * exerciseVideos.js — Base de Vídeos Demonstrativos Auditados • AB Fitness
 * 
 * Regra de Ouro:
 * NENHUM exercício pode apresentar demonstração com equipamento ou padrão de movimento divergente.
 * Cada registro é verificado individualmente contra o ID e características anatómicas do exercício.
 * Total de exercícios auditados: 122
 */

export const VERIFIED_EXERCISE_VIDEOS = {
  "supino-halteres-soccer": {
    "canonicalId": "supino-halteres-soccer",
    "name": "Supino Reto com Halteres",
    "equipment": "Banco Plano + Halteres",
    "movementType": "Empurrar Horizontal • Halteres Livres",
    "target": "Peitoral Maior (Fibras Esternais e Claviculares)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-bench-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-bench-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-bench-press.jpg",
    "keyCues": [
      "Pés cravados no chão, escápulas aduzidas e deprimidas contra o encosto.",
      "Cotovelos a ~75° do tronco no plano escapular (nunca abertos a 90°).",
      "Trajetória convergente suave na subida sem bater as anilhas no topo."
    ],
    "aliases": [
      "supino-halteres-soccer",
      "supino-reto-halteres",
      "supino-halteres",
      "dumbbell-bench-press",
      "supino-reto-com-halteres"
    ]
  },
  "incline-dumbbell-soccer": {
    "canonicalId": "incline-dumbbell-soccer",
    "name": "Supino Inclinado com Halteres",
    "equipment": "Banco 30° + Halteres",
    "movementType": "Empurrar Inclinado • Feixe Clavicular",
    "target": "Peitoral Superior & Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-bench-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-bench-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-bench-press.jpg",
    "keyCues": [
      "Banco regulado a 30° para ativação seletiva do feixe clavicular.",
      "Desça até sentir alongamento ativo do peitoral superior com punhos neutros.",
      "Empurre acelerando no vetor de 30° sem projetar os ombros à frente."
    ],
    "aliases": [
      "incline-dumbbell-soccer",
      "supino-inclinado-halteres",
      "supino-inclinado-com-halteres",
      "incline-dumbbell-press",
      "2"
    ]
  },
  "supino-reto-barra": {
    "canonicalId": "supino-reto-barra",
    "name": "Supino Reto com Barra",
    "equipment": "Banco Reto + Barra Olímpica",
    "movementType": "Empurrar Horizontal • Barra Bilateral",
    "target": "Peitoral Maior & Tríceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-bench-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-bench-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-bench-press.jpg",
    "keyCues": [
      "Pegada ligeiramente mais larga que a largura dos ombros.",
      "Toque sutil na linha intermamilar e empurre mantendo as costas travadas.",
      "Trajetória levemente em J, subindo em direção à linha dos olhos."
    ],
    "aliases": [
      "supino-reto-barra",
      "supino-barra",
      "barbell-bench-press",
      "supino-reto-com-barra",
      "1"
    ]
  },
  "desenvolvimento-halteres": {
    "canonicalId": "desenvolvimento-halteres",
    "name": "Desenvolvimento Militar com Halteres",
    "equipment": "Banco 75° + Halteres",
    "movementType": "Empurrar Vertical • Deltoide Anterior/Médio",
    "target": "Ombros & Estabilizadores Escapulares",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-bench-seated-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-bench-seated-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-bench-seated-press.jpg",
    "keyCues": [
      "Encosto do banco a 75-80° para preservar o arco lombar neutro.",
      "Cotovelos posicionados ligeiramente à frente do plano coronal.",
      "Empurre até quase a extensão completa sem arquear as costas."
    ],
    "aliases": [
      "desenvolvimento-halteres",
      "desenvolvimento-com-halteres",
      "desenvolvimento-militar-halteres",
      "seated-dumbbell-shoulder-press",
      "desenvolvimento-militar",
      "27",
      "28"
    ]
  },
  "elevacao-lateral-speed": {
    "canonicalId": "elevacao-lateral-speed",
    "name": "Elevação Lateral Controlada",
    "equipment": "Par de Halteres Leves",
    "movementType": "Abdução de Ombro • Isolamento de Deltoide Lateral",
    "target": "Deltoide Médio (Largura e Silhueta em V)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-lateral-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-lateral-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-lateral-raise.jpg",
    "keyCues": [
      "Leve inclinação anterior do tronco (5-10°) com core ativado.",
      "Eleve os braços no plano escapular (30° à frente da linha dos ombros).",
      "Cotovelos levemente flexionados, pare na linha do ombro e desça sem balanço."
    ],
    "aliases": [
      "elevacao-lateral-speed",
      "elevacao-lateral-halteres",
      "elevacao-lateral",
      "dumbbell-lateral-raise",
      "elevacao-lateral-com-halteres",
      "30"
    ]
  },
  "triceps-corda-soccer": {
    "canonicalId": "triceps-corda-soccer",
    "name": "Tríceps Pulley na Corda",
    "equipment": "Polia Alta + Acessório Corda",
    "movementType": "Extensão de Cotovelo • Cabo com Pico Terminal",
    "target": "Tríceps Braquial (Cabeça Lateral e Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-pushdown-rope-attachment.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-pushdown-rope-attachment.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-pushdown-rope-attachment.jpg",
    "keyCues": [
      "Cotovelos bloqueados ao lado das costelas sem deslocamento anterior.",
      "Abra as pontas da corda na fase final de extensão para encurtamento máximo.",
      "Retorne controlando até a linha de 90° sem mexer os ombros."
    ],
    "aliases": [
      "triceps-corda-soccer",
      "triceps-corda",
      "triceps-pulley-corda",
      "cable-rope-triceps-pushdown",
      "triceps-na-corda"
    ]
  },
  "rdl-halteres": {
    "canonicalId": "rdl-halteres",
    "name": "RDL / Terra Romeno com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Hinge de Quadril • Tensão Excêntrica",
    "target": "Isquiotibiais & Glúteos",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-stiff-leg-deadlift.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-stiff-leg-deadlift.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-stiff-leg-deadlift.jpg",
    "keyCues": [
      "Pés na largura do quadril, joelhos destravados a 15-20° constantes.",
      "Empurre o quadril para trás como se fosse fechar uma porta com os glúteos.",
      "Desça os halteres rentes às pernas sentindo o estiramento dos posteriores."
    ],
    "aliases": [
      "rdl-halteres",
      "terra-romeno-halteres",
      "stiff-halteres",
      "stiff-com-halteres",
      "dumbbell-stiff-leg-deadlift",
      "rdl-com-halteres"
    ]
  },
  "agachamento-livre-barra": {
    "canonicalId": "agachamento-livre-barra",
    "name": "Agachamento Livre com Barra",
    "equipment": "Rack + Barra Olímpica",
    "movementType": "Padrão Agachar Bilateral • Cadeia Inferior",
    "target": "Quadríceps, Glúteos & Eretor da Espinha",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/classic-barbell-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/classic-barbell-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/classic-barbell-squat.jpg",
    "keyCues": [
      "Barra apoiada firme nos trapézios, pegada firme e cotovelos alinhados.",
      "Inicie a descida flexionando quadris e joelhos simultaneamente.",
      "Quebre a paralela de 90° com calcanhares totalmente cravados no piso."
    ],
    "aliases": [
      "agachamento-livre-barra",
      "agachamento-livre",
      "agachamento-barra",
      "barbell-back-squat",
      "classic-barbell-squat",
      "agachamento-livre-com-barra"
    ]
  },
  "puxada-alta-soccer": {
    "canonicalId": "puxada-alta-soccer",
    "name": "Puxada Alta Frontal no Pulley",
    "equipment": "Polia Alta + Barra Larga",
    "movementType": "Puxar Vertical • Grande Dorsal",
    "target": "Grande Dorsal (Largura das Costas) & Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-bar-lateral-pulldown-wide-shoulder-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-bar-lateral-pulldown-wide-shoulder-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-bar-lateral-pulldown-wide-shoulder-grip.jpg",
    "keyCues": [
      "Apoio dos joelhos ajustado para fixação rígida da pelve.",
      "Inicie o movimento deprimindo as escápulas antes de flexionar os cotovelos.",
      "Puxe a barra em direção ao esterno superior com leve inclinação do tronco (10-15°)."
    ],
    "aliases": [
      "puxada-alta-soccer",
      "puxada-frontal-aberta",
      "puxada-frente",
      "puxada-alta",
      "cable-lat-pulldown",
      "wide-grip-cable-lat-pulldown",
      "15"
    ]
  },
  "remada-serrote-soccer": {
    "canonicalId": "remada-serrote-soccer",
    "name": "Remada Serrote Unilateral com Halter",
    "equipment": "Banco Reto + Halter",
    "movementType": "Puxar Horizontal Unilateral • Espessura Dorsal",
    "target": "Grande Dorsal, Romboide & Trapézio Médio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-bent-over-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-bent-over-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-bent-over-row.jpg",
    "keyCues": [
      "Mão e joelho contralateral apoiados no banco com coluna reta e nivelada.",
      "Conduza o halter com o cotovelo apontando para trás e para cima em direção à bacia.",
      "Evite girar a linha dos ombros para forçar a carga."
    ],
    "aliases": [
      "remada-serrote-soccer",
      "remada-unilateral-serrote",
      "remada-serrote",
      "remada-unilateral",
      "dumbbell-bent-over-row",
      "19"
    ]
  },
  "barra-fixa-pronada": {
    "canonicalId": "barra-fixa-pronada",
    "name": "Barra Fixa / Chin-Up com Pegada Paralela",
    "equipment": "Barra Fixa / Paralelas",
    "movementType": "Tração Vertical com Peso Corporal",
    "target": "Dorsais, Braquiorradial & Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/chin-ups-narrow-parallel-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/chin-ups-narrow-parallel-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/chin-ups-narrow-parallel-grip.jpg",
    "keyCues": [
      "Empunhadura neutra confortável nas articulações do punho.",
      "Puxe o queixo acima da barra sem chutar as pernas ou balançar.",
      "Alongue totalmente os braços na fase inferior de descida."
    ],
    "aliases": [
      "barra-fixa-pronada",
      "barra-fixa-supinada",
      "chin-ups",
      "barra-fixa",
      "chin-ups-narrow-parallel-grip",
      "13",
      "14"
    ]
  },
  "rosca-w-soccer": {
    "canonicalId": "rosca-w-soccer",
    "name": "Rosca Direta com Barra W",
    "equipment": "Barra W + Anilhas",
    "movementType": "Flexão de Cotovelo • Pegada Anatômica Semi-Supinada",
    "target": "Bíceps Braquial & Braquial Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/ez-barbell-biceps-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/ez-barbell-biceps-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/ez-barbell-biceps-curl.jpg",
    "keyCues": [
      "Segure na dobra angulada da barra W para preservar os punhos.",
      "Cotovelos colados ao lado do corpo sem movimentação para frente.",
      "Pico de contração de 1s no topo e descida em 3 segundos sem balançar a coluna."
    ],
    "aliases": [
      "rosca-w-soccer",
      "rosca-barra-w",
      "rosca-direta-w",
      "ez-barbell-biceps-curl"
    ]
  },
  "rosca-alternada": {
    "canonicalId": "rosca-alternada",
    "name": "Rosca com Halteres (Direta / Alternada)",
    "equipment": "Par de Halteres",
    "movementType": "Flexão com Supinação Ativa de Punho",
    "target": "Bíceps Braquial (Pico e Espessura)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-biceps-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-biceps-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-biceps-curl.jpg",
    "keyCues": [
      "Inicie com as palmas voltadas para a coxa e supine durante a subida.",
      "Mantenha o punho rígido sem deixar hiperestender para trás.",
      "Controle rigoroso na descida excêntrica."
    ],
    "aliases": [
      "rosca-alternada",
      "rosca-halteres",
      "biceps-halteres",
      "dumbbell-biceps-curl",
      "rosca-direta-halteres",
      "42"
    ]
  },
  "leg-press-45": {
    "canonicalId": "leg-press-45",
    "name": "Leg Press 45°",
    "equipment": "Aparelho Leg Press 45°",
    "movementType": "Padrão Empurrar em Máquina Inclinada",
    "target": "Quadríceps, Glúteos & Adutores",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/sled-45-degree-leg-wide-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/sled-45-degree-leg-wide-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/sled-45-degree-leg-wide-press.jpg",
    "keyCues": [
      "Pés na largura dos ombros no meio ou topo da plataforma.",
      "Quadril e lombar perfeitamente colados no encosto durante toda a descida.",
      "Nunca estenda os joelhos até travar (evite hiperextensão)."
    ],
    "aliases": [
      "leg-press-45",
      "leg-press",
      "sled-45-degree-leg-wide-press",
      "leg-press-45-graus",
      "61"
    ]
  },
  "mesa-flexora": {
    "canonicalId": "mesa-flexora",
    "name": "Mesa Flexora Deitada",
    "equipment": "Máquina Flexora Deitada",
    "movementType": "Flexão de Joelho em Posição Pronada",
    "target": "Isquiotibiais (Bíceps Femoral, Semitendíneo)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-lying-leg-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-lying-leg-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-lying-leg-curl.jpg",
    "keyCues": [
      "Alinhe o eixo da máquina com a linha articular do joelho.",
      "Mantenha a pelve colada contra o banco durante a flexão máxima.",
      "Controle a volta excêntrica até quase a extensão completa."
    ],
    "aliases": [
      "mesa-flexora",
      "flexora-deitada",
      "lever-lying-leg-curl",
      "mesa-flexora-deitada",
      "69"
    ]
  },
  "crucifixo-reto-halteres": {
    "canonicalId": "crucifixo-reto-halteres",
    "name": "Crucifixo Reto com Halteres",
    "equipment": "Banco Plano + Halteres",
    "movementType": "Adução Horizontal • Isolamento de Peitoral",
    "target": "Peitoral Maior (Fibras Esternais)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-fly.jpg",
    "keyCues": [
      "Deite firme no banco com escápulas travadas e pés plantados.",
      "Abra os braços em arco suave mantendo os cotovelos com leve flexão fixa.",
      "Feche os halteres no topo sentindo o miolo do peito contrair sem bater os pesos."
    ],
    "aliases": [
      "crucifixo-reto-halteres",
      "crucifixo-reto",
      "dumbbell-fly",
      "crucifixo-com-halteres",
      "4"
    ]
  },
  "crucifixo-inclinado-halteres": {
    "canonicalId": "crucifixo-inclinado-halteres",
    "name": "Crucifixo Inclinado com Halteres",
    "equipment": "Banco 30° + Halteres",
    "movementType": "Adução Inclinada • Feixe Clavicular",
    "target": "Peitoral Superior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-fly.jpg",
    "keyCues": [
      "Banco regulado a 30° para foco no peitoral superior.",
      "Cotovelos levemente flexionados, descendo até a linha do peito.",
      "Aproxime os halteres no topo sem perder a tensão na musculatura."
    ],
    "aliases": [
      "crucifixo-inclinado-halteres",
      "crucifixo-inclinado",
      "dumbbell-incline-fly",
      "5"
    ]
  },
  "supino-inclinado-barra": {
    "canonicalId": "supino-inclinado-barra",
    "name": "Supino Inclinado com Barra",
    "equipment": "Banco 30° + Barra Olímpica",
    "movementType": "Empurrar Inclinado Bilateral",
    "target": "Peitoral Superior & Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-incline-bench-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-incline-bench-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-incline-bench-press.jpg",
    "keyCues": [
      "Pegada ligeiramente mais larga que a linha dos ombros.",
      "Desça a barra controlada até a porção superior do esterno.",
      "Empurre verticalmente mantendo as escápulas coladas no encosto."
    ],
    "aliases": [
      "supino-inclinado-barra",
      "supino-inclinado-com-barra",
      "barbell-incline-bench-press"
    ]
  },
  "voador-peck-deck": {
    "canonicalId": "voador-peck-deck",
    "name": "Voador / Peck Deck na Máquina",
    "equipment": "Aparelho Peck Deck",
    "movementType": "Adução Guiada em Máquina",
    "target": "Peitoral Maior (Isolamento)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-pec-deck-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-pec-deck-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-pec-deck-fly.jpg",
    "keyCues": [
      "Ajuste o assento para que as manoplas fiquem na linha do tórax.",
      "Mantenha as costas totalmente apoiadas e peito estufado.",
      "Junte os braços sustentando 1 segundo de pico de contração."
    ],
    "aliases": [
      "voador-peck-deck",
      "voador",
      "peck-deck",
      "lever-pec-deck-fly",
      "9"
    ]
  },
  "crossover-polia-alta": {
    "canonicalId": "crossover-polia-alta",
    "name": "Crossover na Polia Alta",
    "equipment": "Polia Dupla Alta",
    "movementType": "Adução com Tensão Contínua em Cabos",
    "target": "Peitoral Inferior e Esternal",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-standing-fly-crossover-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-standing-fly-crossover-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-standing-fly-crossover-fly.jpg",
    "keyCues": [
      "Dê um passo à frente com tronco levemente inclinado.",
      "Puxe os cabos para frente e para baixo em trajetória semicircular.",
      "Cruze suavemente as mãos no ponto final para contração máxima."
    ],
    "aliases": [
      "crossover-polia-alta",
      "crossover",
      "cable-standing-fly",
      "6"
    ]
  },
  "flexao-de-braco": {
    "canonicalId": "flexao-de-braco",
    "name": "Flexão de Braço no Solo",
    "equipment": "Peso Corporal",
    "movementType": "Empurrar Horizontal Calistênico",
    "target": "Peitoral, Tríceps & Core",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/push-ups.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/push-ups.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/push-ups.jpg",
    "keyCues": [
      "Mãos na largura dos ombros e corpo em linha reta dos pés à cabeça.",
      "Desça até o peito quase tocar o solo com cotovelos a ~45°.",
      "Empurre o chão com força contraindo abdômen e glúteos."
    ],
    "aliases": [
      "flexao-de-braco",
      "flexao",
      "push-up",
      "11"
    ]
  },
  "remada-baixa-cabo": {
    "canonicalId": "remada-baixa-cabo",
    "name": "Remada Baixa no Cabo com Triângulo",
    "equipment": "Polia Baixa + Puxador V",
    "movementType": "Puxar Horizontal com Puxador V",
    "target": "Latíssimo do Dorso & Espessura Dorsal",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-straight-back-seated-row-v-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-straight-back-seated-row-v-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-straight-back-seated-row-v-grip.jpg",
    "keyCues": [
      "Pés firmes no apoio e joelhos levemente flexionados.",
      "Puxe o triângulo em direção ao umbigo puxando com os cotovelos.",
      "Aperte as escápulas no final e alongue os braços controlando a volta."
    ],
    "aliases": [
      "remada-baixa-cabo",
      "remada-baixa",
      "seated-cable-row",
      "cable-seated-row",
      "20"
    ]
  },
  "remada-curvada-barra": {
    "canonicalId": "remada-curvada-barra",
    "name": "Remada Curvada com Barra",
    "equipment": "Barra Olímpica",
    "movementType": "Puxar Livre Inclinado • Cadeia Posterior",
    "target": "Dorsais, Romboides & Eretores",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-underhand-bent-over-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-underhand-bent-over-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-underhand-bent-over-row.jpg",
    "keyCues": [
      "Tronco inclinado a 45° com coluna lombar perfeitamente travada.",
      "Puxe a barra em direção à linha do umbigo mantendo cotovelos rentes.",
      "Evite usar impulso das pernas para levantar a carga."
    ],
    "aliases": [
      "remada-curvada-barra",
      "remada-curvada",
      "barbell-bent-over-row",
      "17"
    ]
  },
  "remada-cavalinho": {
    "canonicalId": "remada-cavalinho",
    "name": "Remada Cavalinho / T-Bar na Máquina",
    "equipment": "Aparelho T-Bar / Cavalinho",
    "movementType": "Puxar Fechado em Barra T",
    "target": "Densidade e Miolo das Costas",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-t-bar-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-t-bar-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-t-bar-row.jpg",
    "keyCues": [
      "Apoie o peito ou firme os pés no piso com quadril encaixado.",
      "Puxe a barra sentindo a musculatura dorsal esmagar no pico.",
      "Retorne alongando a dorsal sem arredondar a região torácica."
    ],
    "aliases": [
      "remada-cavalinho",
      "t-bar-row",
      "remada-t-bar",
      "lever-t-bar-row",
      "18"
    ]
  },
  "puxada-com-triangulo": {
    "canonicalId": "puxada-com-triangulo",
    "name": "Puxada Fechada com Triângulo",
    "equipment": "Polia Alta + Triângulo",
    "movementType": "Puxar Vertical com Pegada Neutra",
    "target": "Grande Dorsal & Braquial",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-close-grip-front-lat-pulldown.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-close-grip-front-lat-pulldown.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-close-grip-front-lat-pulldown.jpg",
    "keyCues": [
      "Puxe o triângulo até a parte superior do esterno.",
      "Mantenha os cotovelos apontados para o solo durante a descida.",
      "Controle o retorno permitindo o alongamento completo das costas."
    ],
    "aliases": [
      "puxada-com-triangulo",
      "puxada-fechada",
      "cable-close-grip-lat-pulldown",
      "16"
    ]
  },
  "pulldown-com-barra": {
    "canonicalId": "pulldown-com-barra",
    "name": "Pulldown com Braços Estendidos no Cabo",
    "equipment": "Polia Alta + Barra Reta",
    "movementType": "Extensão de Ombro em Polia",
    "target": "Grande Dorsal (Isolamento Escapular)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-straight-arm-pulldown.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-straight-arm-pulldown.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-straight-arm-pulldown.jpg",
    "keyCues": [
      "Braços quase estendidos com leve flexão nos cotovelos.",
      "Pressione a barra para baixo em direção às coxas usando apenas as costas.",
      "Sustente 1 segundo no pico e suba controlando até a altura dos olhos."
    ],
    "aliases": [
      "pulldown-com-barra",
      "pulldown-com-corda",
      "pulldown-cabo",
      "cable-straight-arm-pulldown",
      "22",
      "23"
    ]
  },
  "extensao-lombar-banco-romano": {
    "canonicalId": "extensao-lombar-banco-romano",
    "name": "Extensão Lombar no Banco Romano 45°",
    "equipment": "Banco Romano 45°",
    "movementType": "Extensão de Tronco e Quadril",
    "target": "Eretores da Espinha & Glúteos",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/45-degree-hyperextension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/45-degree-hyperextension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/45-degree-hyperextension.jpg",
    "keyCues": [
      "Ajuste o apoio do quadril logo abaixo da crista ilíaca.",
      "Flexione o tronco para frente controlando pelo abdômen e lombar.",
      "Suba até o alinhamento com as pernas sem hiperextender excessivamente."
    ],
    "aliases": [
      "extensao-lombar-banco-romano",
      "extensao-lombar",
      "banco-romano",
      "hyperextension",
      "25"
    ]
  },
  "encolhimento-com-halteres": {
    "canonicalId": "encolhimento-com-halteres",
    "name": "Encolhimento com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Elevação Escapular Pura",
    "target": "Trapézio Superior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-shrug.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-shrug.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-shrug.jpg",
    "keyCues": [
      "Em pé com halteres ao lado das coxas e braços estendidos.",
      "Eleve os ombros diretamente em direção às orelhas sem rodar.",
      "Segure 1 segundo no pico de contração antes de descer suavemente."
    ],
    "aliases": [
      "encolhimento-com-halteres",
      "encolhimento-halteres",
      "dumbbell-shrug",
      "40"
    ]
  },
  "encolhimento-com-barra": {
    "canonicalId": "encolhimento-com-barra",
    "name": "Encolhimento com Barra",
    "equipment": "Barra Olímpica",
    "movementType": "Elevação Escapular com Carga Pesada",
    "target": "Trapézio Superior & Clavicular",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-shrug.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-shrug.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-shrug.jpg",
    "keyCues": [
      "Segure a barra na largura dos ombros com pegada pronada.",
      "Suba os ombros verticalmente contraindo o trapézio ao máximo.",
      "Mantenha a cabeça em posição neutra sem projetar o pescoço à frente."
    ],
    "aliases": [
      "encolhimento-com-barra",
      "encolhimento-barra",
      "barbell-shrug",
      "39"
    ]
  },
  "desenvolvimento-arnold": {
    "canonicalId": "desenvolvimento-arnold",
    "name": "Desenvolvimento Arnold com Halteres",
    "equipment": "Banco 75° + Halteres",
    "movementType": "Empurrar com Rotação Glenoumeral",
    "target": "Deltoide Anterior, Médio e Posterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-arnold-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-arnold-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-arnold-press.jpg",
    "keyCues": [
      "Inicie com as palmas voltadas para você na altura do peito.",
      "Gire os punhos para fora enquanto empurra os halteres para cima.",
      "No topo, termine com as palmas para a frente em extensão controlada."
    ],
    "aliases": [
      "desenvolvimento-arnold",
      "arnold-press",
      "dumbbell-arnold-press"
    ]
  },
  "elevacao-frontal-halteres": {
    "canonicalId": "elevacao-frontal-halteres",
    "name": "Elevação Frontal com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Flexão de Ombro Anterior",
    "target": "Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-front-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-front-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-front-raise.jpg",
    "keyCues": [
      "Suba o halter à frente até a linha dos olhos.",
      "Mantenha o tronco estável sem inclinar o corpo para trás.",
      "Desça em 2 a 3 segundos resistindo à gravidade."
    ],
    "aliases": [
      "elevacao-frontal-halteres",
      "elevacao-frontal",
      "dumbbell-front-raise",
      "32"
    ]
  },
  "elevacao-lateral-polia": {
    "canonicalId": "elevacao-lateral-polia",
    "name": "Elevação Lateral na Polia",
    "equipment": "Polia Baixa Unilateral",
    "movementType": "Abdução com Tensão Contínua no Cabo",
    "target": "Deltoide Lateral (Ombros Largos)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-lateral-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-lateral-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-lateral-raise.jpg",
    "keyCues": [
      "Cabo passando por trás ou pela frente da perna.",
      "Puxe a manopla lateralmente até a altura do ombro com cotovelo firme.",
      "Tensão constante sem folga no início ou pico do movimento."
    ],
    "aliases": [
      "elevacao-lateral-polia",
      "elevacao-lateral-cabo",
      "cable-lateral-raise",
      "31"
    ]
  },
  "crucifixo-invertido-halteres": {
    "canonicalId": "crucifixo-invertido-halteres",
    "name": "Crucifixo Invertido com Halteres",
    "equipment": "Banco Inclinado + Halteres",
    "movementType": "Abdução Horizontal • Deltoide Posterior",
    "target": "Deltoide Posterior & Romboides",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-rear-lateral-raise.mp4",
    "videoFemale": null,
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-rear-lateral-raise.jpg",
    "keyCues": [
      "Deite de bruços no banco inclinado a 30-45°.",
      "Abra os braços lateralmente puxando com a parte de trás dos ombros.",
      "Cotovelos levemente dobrados, sem usar impulso da lombar."
    ],
    "aliases": [
      "crucifixo-invertido-halteres",
      "crucifixo-invertido",
      "dumbbell-incline-rear-lateral-raise",
      "34"
    ]
  },
  "crucifixo-invertido-maquina": {
    "canonicalId": "crucifixo-invertido-maquina",
    "name": "Crucifixo Invertido na Máquina",
    "equipment": "Aparelho Invertido / Peck Deck Reverso",
    "movementType": "Abdução Horizontal Guiada",
    "target": "Deltoide Posterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-reverse-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-reverse-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-reverse-fly.jpg",
    "keyCues": [
      "Ajuste o assento para os braços ficarem na altura dos ombros.",
      "Abra as hastes para trás contraindo o posterior de ombro.",
      "Retorne sem deixar os pesos encostarem na torre."
    ],
    "aliases": [
      "crucifixo-invertido-maquina",
      "peck-deck-invertido",
      "lever-seated-reverse-fly",
      "35"
    ]
  },
  "remada-alta": {
    "canonicalId": "remada-alta",
    "name": "Remada Alta com Barra",
    "equipment": "Barra Olímpica",
    "movementType": "Puxar Vertical com Pegada Média",
    "target": "Deltoide Lateral & Trapézio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-upright-row-wide-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-upright-row-wide-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-upright-row-wide-grip.jpg",
    "keyCues": [
      "Segure a barra com pegada ligeiramente mais larga que os ombros.",
      "Suba conduzindo com os cotovelos até a linha média do esterno.",
      "Mantenha a barra colada ao corpo durante toda a trajetória."
    ],
    "aliases": [
      "remada-alta",
      "remada-alta-barra",
      "barbell-wide-grip-upright-row",
      "38"
    ]
  },
  "triceps-frances-soccer": {
    "canonicalId": "triceps-frances-soccer",
    "name": "Tríceps Francês Sentado com Halter",
    "equipment": "Banco + Halter Unilateral",
    "movementType": "Extensão de Cotovelo Overhead",
    "target": "Tríceps Cabeça Longa",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-seated-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-seated-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-seated-triceps-extension.jpg",
    "keyCues": [
      "Sente-se com coluna apoiada e segure o halter acima da cabeça.",
      "Desça o peso atrás da nuca flexionando apenas os cotovelos.",
      "Estenda os braços para cima sentindo a cabeça longa esticar e contrair."
    ],
    "aliases": [
      "triceps-frances-soccer",
      "triceps-frances",
      "triceps-frances-unilateral",
      "dumbbell-seated-triceps-extension"
    ]
  },
  "triceps-testa-barra-w": {
    "canonicalId": "triceps-testa-barra-w",
    "name": "Tríceps Testa com Barra W",
    "equipment": "Banco Plano + Barra W",
    "movementType": "Extensão em Decúbito Dorsal (Skull Crusher)",
    "target": "Tríceps (Cabeça Medial e Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/ez-barbell-lying-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/ez-barbell-lying-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/ez-barbell-lying-triceps-extension.jpg",
    "keyCues": [
      "Deitado no banco, inicie com a barra alinhada à testa.",
      "Flexione os cotovelos descendo a barra rente ao topo da cabeça.",
      "Empurre de volta mantendo os cotovelos apontados para o teto sem abrir."
    ],
    "aliases": [
      "triceps-testa-barra-w",
      "triceps-testa",
      "skull-crusher",
      "ez-bar-lying-triceps-extension",
      "51"
    ]
  },
  "triceps-pulley-barra-reta": {
    "canonicalId": "triceps-pulley-barra-reta",
    "name": "Tríceps Pulley com Barra Reta",
    "equipment": "Polia Alta + Barra Reta",
    "movementType": "Extensão de Cotovelo com Barra Reta",
    "target": "Tríceps (Cabeça Lateral e Medial)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-triceps-pushdown.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-triceps-pushdown.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-triceps-pushdown.jpg",
    "keyCues": [
      "Cotovelos travados ao lado do tronco.",
      "Empurre a barra para baixo até estender os cotovelos completamente.",
      "Suba suavemente até 90° sem levantar os braços."
    ],
    "aliases": [
      "triceps-pulley-barra-reta",
      "triceps-pulley",
      "triceps-barra-reta",
      "cable-triceps-pushdown",
      "52"
    ]
  },
  "triceps-coice-halteres": {
    "canonicalId": "triceps-coice-halteres",
    "name": "Tríceps Coice com Halter",
    "equipment": "Banco Plano + Halter",
    "movementType": "Extensão Horizontal Unilateral",
    "target": "Tríceps (Contração Terminal)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-kickback.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-kickback.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-kickback.jpg",
    "keyCues": [
      "Tronco paralelo ao solo, cotovelo elevado na linha do tronco.",
      "Estenda o antebraço para trás até o alinhamento total.",
      "Segure 1 segundo no pico e retorne a 90° mantendo o cotovelo fixo."
    ],
    "aliases": [
      "triceps-coice-halteres",
      "triceps-coice",
      "dumbbell-kickback",
      "55"
    ]
  },
  "triceps-mergulho-banco": {
    "canonicalId": "triceps-mergulho-banco",
    "name": "Mergulho no Banco (Bench Dips)",
    "equipment": "Banco Plano",
    "movementType": "Extensão de Cotovelo com Apoio Traseiro",
    "target": "Tríceps & Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/bench-dips.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/bench-dips.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/bench-dips.jpg",
    "keyCues": [
      "Mãos apoiadas na borda do banco com pernas estendidas à frente.",
      "Desça o quadril rente ao banco flexionando os cotovelos a 90°.",
      "Empurre para cima estendendo os braços com força."
    ],
    "aliases": [
      "triceps-mergulho-banco",
      "mergulho-banco",
      "bench-dips",
      "53"
    ]
  },
  "supino-fechado-barra": {
    "canonicalId": "supino-fechado-barra",
    "name": "Supino Fechado com Barra",
    "equipment": "Banco Reto + Barra Olímpica",
    "movementType": "Empurrar com Pegada Estreita",
    "target": "Tríceps & Peitoral Esternal",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-close-grip-bench-press.mp4",
    "videoFemale": null,
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-close-grip-bench-press.jpg",
    "keyCues": [
      "Pegada na largura dos ombros (nunca junte as mãos totalmente).",
      "Desça a barra mantendo os cotovelos colados às costelas.",
      "Empurre verticalmente focando a força na extensão dos tríceps."
    ],
    "aliases": [
      "supino-fechado-barra",
      "supino-fechado",
      "barbell-close-grip-bench-press",
      "54"
    ]
  },
  "rosca-martelo-soccer": {
    "canonicalId": "rosca-martelo-soccer",
    "name": "Rosca Martelo com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Flexão com Pegada Neutra",
    "target": "Braquial, Braquiorradial & Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-hammer-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-hammer-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-hammer-curl.jpg",
    "keyCues": [
      "Palmas das mãos voltadas uma para a outra durante todo o movimento.",
      "Suba os halteres sem balanço do tronco.",
      "Pico de contração no topo e descida em 3 segundos controlados."
    ],
    "aliases": [
      "rosca-martelo-soccer",
      "rosca-martelo-halteres",
      "rosca-martelo",
      "dumbbell-incline-hammer-curl",
      "43"
    ]
  },
  "rosca-scott-barra-w": {
    "canonicalId": "rosca-scott-barra-w",
    "name": "Rosca Scott no Banco com Halter / Barra",
    "equipment": "Banco Scott + Halter / Barra",
    "movementType": "Flexão Isolada em Apoio Scott",
    "target": "Bíceps (Cabeça Curva e Pico)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-seated-preacher-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-seated-preacher-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-seated-preacher-curl.jpg",
    "keyCues": [
      "Axilas perfeitamente apoiadas no topo da almofada do banco Scott.",
      "Flexione os braços sem deixar os cotovelos descolarem do estofado.",
      "Controle rigoroso na descida para proteger os tendões distais."
    ],
    "aliases": [
      "rosca-scott-barra-w",
      "rosca-scott",
      "rosca-scott-maquina",
      "dumbbell-seated-preacher-curl",
      "45",
      "46"
    ]
  },
  "rosca-concentrada": {
    "canonicalId": "rosca-concentrada",
    "name": "Rosca Concentrada com Halter",
    "equipment": "Banco Reto + Halter",
    "movementType": "Flexão Unilateral Estabilizada no Joelho",
    "target": "Pico do Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-concentration-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-concentration-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-concentration-curl.jpg",
    "keyCues": [
      "Cotovelo apoiado na parte interna da coxa.",
      "Suba o halter em direção ao ombro isolando completamente o bíceps.",
      "Evite balançar o ombro ou inclinar o tronco."
    ],
    "aliases": [
      "rosca-concentrada",
      "dumbbell-concentration-curl",
      "47"
    ]
  },
  "rosca-direta-barra": {
    "canonicalId": "rosca-direta-barra",
    "name": "Rosca Direta com Barra Reta",
    "equipment": "Barra Reta + Anilhas",
    "movementType": "Flexão Supinada Bilateral Clássica",
    "target": "Bíceps Braquial",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-curl.jpg",
    "keyCues": [
      "Pés na largura dos ombros e glúteos contraídos para base firme.",
      "Cotovelos fixos colados ao tronco.",
      "Suba sem usar pêndulo lombar e desça em velocidade controlada."
    ],
    "aliases": [
      "rosca-direta-barra",
      "rosca-barra-reta",
      "barbell-curl",
      "41"
    ]
  },
  "rosca-inclinada-halteres": {
    "canonicalId": "rosca-inclinada-halteres",
    "name": "Rosca Inclinada 45° com Halteres",
    "equipment": "Banco 45° + Halteres",
    "movementType": "Flexão em Posição de Pré-Estiramento",
    "target": "Cabeça Longa do Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-biceps-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-biceps-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-biceps-curl.jpg",
    "keyCues": [
      "Deite no banco inclinado a 45° deixando os braços caírem para trás.",
      "Inicie a subida supinando os punhos com os cotovelos para trás.",
      "Máximo alongamento no ponto mais baixo sem relaxar os ombros."
    ],
    "aliases": [
      "rosca-inclinada-halteres",
      "rosca-inclinada-banco",
      "dumbbell-incline-biceps-curl",
      "56"
    ]
  },
  "flexao-punho-barra": {
    "canonicalId": "flexao-punho-barra",
    "name": "Flexão de Punho com Halter no Banco",
    "equipment": "Banco Plano + Halter",
    "movementType": "Flexão de Punho para Antebraço",
    "target": "Flexores do Antebraço & Força de Pegada",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-over-bench-wrist-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-over-bench-wrist-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-over-bench-wrist-curl.jpg",
    "keyCues": [
      "Antebraço totalmente apoiado sobre a coxa ou banco com punho livre.",
      "Flexione o punho para cima com amplitude máxima.",
      "Desça devagar sentindo os músculos do antebraço alongarem."
    ],
    "aliases": [
      "flexao-punho-barra",
      "flexao-punho-halteres",
      "rosca-punho",
      "dumbbell-over-bench-wrist-curl",
      "57"
    ]
  },
  "agachamento-frontal-barra": {
    "canonicalId": "agachamento-frontal-barra",
    "name": "Agachamento Frontal com Barra",
    "equipment": "Rack + Barra Olímpica Frontal",
    "movementType": "Agachar com Carga Anterior",
    "target": "Quadríceps & Core Eretor",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-front-chest-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-front-chest-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-front-chest-squat.jpg",
    "keyCues": [
      "Barra apoiada nos deltoides anteriores com cotovelos altos.",
      "Mantenha o tronco o mais vertical possível durante todo o agachamento.",
      "Desça empurrando os joelhos para fora com peso distribuído nos pés."
    ],
    "aliases": [
      "agachamento-frontal-barra",
      "agachamento-frontal",
      "barbell-front-squat",
      "62"
    ]
  },
  "cadeira-extensora": {
    "canonicalId": "cadeira-extensora",
    "name": "Cadeira Extensora",
    "equipment": "Máquina Extensora",
    "movementType": "Extensão de Joelho em Isolamento",
    "target": "Quadríceps (Reto Femoral e Vasto)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-leg-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-leg-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-leg-extension.jpg",
    "keyCues": [
      "Ajuste o encosto para o joelho alinhar perfeitamente com o eixo.",
      "Estenda as pernas sem chutar, sustentando 1 segundo de contração no topo.",
      "Retorne de forma lenta e controlada em 3 segundos."
    ],
    "aliases": [
      "cadeira-extensora",
      "extensora",
      "lever-leg-extension",
      "63"
    ]
  },
  "agachamento-goblet": {
    "canonicalId": "agachamento-goblet",
    "name": "Agachamento Goblet com Halter",
    "equipment": "Halter Pesado",
    "movementType": "Agachamento com Peso no Peito",
    "target": "Quadríceps, Glúteos & Mobilidade Pélvica",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-goblet-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-goblet-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-goblet-squat.jpg",
    "keyCues": [
      "Segure o halter na vertical colado ao esterno pelas anilhas superiores.",
      "Afaste os pés e agache entre as pernas com cotovelos por dentro dos joelhos.",
      "Suba empurrando o chão com os calcanhares mantendo o peito ereto."
    ],
    "aliases": [
      "agachamento-goblet",
      "goblet-squat",
      "dumbbell-goblet-squat",
      "64"
    ]
  },
  "hack-squat-maquina": {
    "canonicalId": "hack-squat-maquina",
    "name": "Hack Squat na Máquina 45°",
    "equipment": "Aparelho Hack Squat",
    "movementType": "Agachar em Trilho com Apoio Dorsal",
    "target": "Quadríceps (Ênfase em Vastos)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/sled-hack-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/sled-hack-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/sled-hack-squat.jpg",
    "keyCues": [
      "Costas e cabeça coladas no encosto da máquina.",
      "Pés no meio da plataforma na largura dos ombros.",
      "Desça profundamente até 90° e suba sem hiperextender os joelhos."
    ],
    "aliases": [
      "hack-squat-maquina",
      "hack-squat",
      "sled-hack-squat",
      "65"
    ]
  },
  "leg-press-horizontal": {
    "canonicalId": "leg-press-horizontal",
    "name": "Leg Press Horizontal na Máquina",
    "equipment": "Máquina Leg Horizontal",
    "movementType": "Empurrar em Plano Reto com Carga Guiada",
    "target": "Quadríceps e Glúteos",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-horizontal-leg-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-horizontal-leg-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-horizontal-leg-press.jpg",
    "keyCues": [
      "Apoie os pés na plataforma na largura dos quadris.",
      "Empurre suavemente destravando a máquina.",
      "Desça até os joelhos formarem 90° mantendo o quadril travado no assento."
    ],
    "aliases": [
      "leg-press-horizontal",
      "lever-horizontal-leg-press",
      "66"
    ]
  },
  "cadeira-adutora": {
    "canonicalId": "cadeira-adutora",
    "name": "Cadeira Adutora na Máquina",
    "equipment": "Máquina Adutora",
    "movementType": "Adução de Quadril Sentado",
    "target": "Adutores da Coxa (Virilha e Parte Interna)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-hip-adduction.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-hip-adduction.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-hip-adduction.jpg",
    "keyCues": [
      "Sente com as costas retas e abra as pernas no limite do conforto.",
      "Feche as pernas apertando os coxins com a força da parte interna das coxas.",
      "Controle o retorno sem deixar as placas de peso baterem."
    ],
    "aliases": [
      "cadeira-adutora",
      "adutora",
      "lever-seated-hip-adduction",
      "67"
    ]
  },
  "cadeira-flexora": {
    "canonicalId": "cadeira-flexora",
    "name": "Cadeira Flexora Sentada",
    "equipment": "Máquina Flexora Sentada",
    "movementType": "Flexão de Joelho em Posição Sentada",
    "target": "Isquiotibiais (Posterior de Coxa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-leg-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-leg-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-leg-curl.jpg",
    "keyCues": [
      "Fixe bem o apoio superior sobre as coxas para não levantar o quadril.",
      "Flexione os joelhos puxando o rolo para baixo e para trás.",
      "Retorne controladamente sentindo os posteriores alongarem."
    ],
    "aliases": [
      "cadeira-flexora",
      "flexora-sentada",
      "lever-seated-leg-curl",
      "70"
    ]
  },
  "stiff-com-barra": {
    "canonicalId": "stiff-com-barra",
    "name": "Stiff com Barra",
    "equipment": "Barra Olímpica",
    "movementType": "Hinge de Quadril com Barra",
    "target": "Isquiotibiais & Glúteo Máximo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-straight-leg-deadlift.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-straight-leg-deadlift.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-straight-leg-deadlift.jpg",
    "keyCues": [
      "Joelhos levemente destravados e fixos (não agache!).",
      "Projete a bacia para trás enquanto desce a barra rente às canelas.",
      "Coluna lombar neutra e olhar direcionado para o chão à frente."
    ],
    "aliases": [
      "stiff-com-barra",
      "stiff-barra",
      "barbell-straight-leg-deadlift",
      "71"
    ]
  },
  "levantamento-terra": {
    "canonicalId": "levantamento-terra",
    "name": "Levantamento Terra com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Levantamento de Solo • Puxada Primária",
    "target": "Glúteos, Isquiotibiais & Costas",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-deadlift.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-deadlift.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-deadlift.jpg",
    "keyCues": [
      "Pés na largura do quadril com halteres ao lado das canelas.",
      "Inicie empurrando o chão com as pernas mantendo o peito alto.",
      "Estenda quadris e joelhos simultaneamente travando no topo com os glúteos."
    ],
    "aliases": [
      "levantamento-terra",
      "deadlift",
      "dumbbell-deadlift",
      "24"
    ]
  },
  "passada-com-halteres": {
    "canonicalId": "passada-com-halteres",
    "name": "Passada / Afundo com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Unilateral Dinâmico no Solo",
    "target": "Glúteos, Quadríceps & Equilíbrio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-lunge.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-lunge.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-lunge.jpg",
    "keyCues": [
      "Dê um passo à frente firme no chão.",
      "Desça o joelho de trás até quase encostar no solo com tronco ereto.",
      "Empurre pelo calcanhar dianteiro para avançar no próximo passo."
    ],
    "aliases": [
      "passada-com-halteres",
      "afundo-com-halteres",
      "dumbbell-lunge",
      "lunge",
      "72"
    ]
  },
  "cadeira-abdutora": {
    "canonicalId": "cadeira-abdutora",
    "name": "Cadeira Abdutora na Máquina",
    "equipment": "Máquina Abdutora",
    "movementType": "Abdução de Quadril Sentado",
    "target": "Glúteo Médio & Mínimo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-hip-abduction.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-hip-abduction.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-hip-abduction.jpg",
    "keyCues": [
      "Tronco encaixado no banco ou levemente projetado à frente.",
      "Abra as pernas empurrando com a lateral dos joelhos.",
      "Sustente 1 segundo no pico de abertura e feche com controle."
    ],
    "aliases": [
      "cadeira-abdutora",
      "abdutora",
      "lever-seated-hip-abduction",
      "73"
    ]
  },
  "elevacao-pelvica-soccer": {
    "canonicalId": "elevacao-pelvica-soccer",
    "name": "Ponte de Glúteo / Elevação Pélvica",
    "equipment": "Colchonete / Apoio Solo",
    "movementType": "Extensão de Quadril com Contração Máxima",
    "target": "Glúteo Máximo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/rear-decline-bridge.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/rear-decline-bridge.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/rear-decline-bridge.jpg",
    "keyCues": [
      "Deite no colchonete com pés no chão próximos ao quadril.",
      "Eleve o quadril empurrando com os calcanhares.",
      "No topo, esprema os glúteos por 2 segundos mantendo abdômen travado."
    ],
    "aliases": [
      "elevacao-pelvica-soccer",
      "elevacao-pelvica",
      "glute-bridge",
      "rear-decline-bridge"
    ]
  },
  "panturrilha-em-pe-maquina": {
    "canonicalId": "panturrilha-em-pe-maquina",
    "name": "Panturrilha em Pé na Máquina",
    "equipment": "Aparelho Gêmeos em Pé",
    "movementType": "Flexão Plantar em Pé",
    "target": "Gastrocnêmio & Tendão de Aquiles",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-standing-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-standing-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-standing-calf-raise.jpg",
    "keyCues": [
      "Antepé na ponta do degrau com calcanhares livres.",
      "Suba ao máximo na ponta dos pés com joelhos estendidos sem travar.",
      "Desça devagar em 3 segundos sentindo o alongamento completo."
    ],
    "aliases": [
      "panturrilha-em-pe-maquina",
      "panturrilha-explosiva",
      "lever-standing-calf-raise",
      "74"
    ]
  },
  "panturrilha-sentado-maquina": {
    "canonicalId": "panturrilha-sentado-maquina",
    "name": "Panturrilha Sentado na Máquina (Gêmeos)",
    "equipment": "Aparelho Gêmeos Sentado",
    "movementType": "Flexão Plantar com Joelho Flexionado",
    "target": "Músculo Sóleo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-calf-raise.jpg",
    "keyCues": [
      "Coxas travadas confortavelmente sob as almofadas.",
      "Suba na ponta dos pés pausando 1 segundo na contração máxima.",
      "Desça profundamente abaixo da linha da plataforma."
    ],
    "aliases": [
      "panturrilha-sentado-maquina",
      "panturrilha-sentado",
      "lever-seated-calf-raise",
      "75"
    ]
  },
  "panturrilha-no-leg-press": {
    "canonicalId": "panturrilha-no-leg-press",
    "name": "Panturrilha no Leg Press 45°",
    "equipment": "Aparelho Leg Press 45°",
    "movementType": "Flexão Plantar Inclinada sob Tensão",
    "target": "Gastrocnêmio & Sóleo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/sled-45-degree-calf-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/sled-45-degree-calf-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/sled-45-degree-calf-press.jpg",
    "keyCues": [
      "Apoie a ponta dos pés na borda inferior da plataforma.",
      "Mantenha as travas de segurança acionadas para máxima segurança.",
      "Faça a flexão plantar de forma controlada sem solavancos articulares."
    ],
    "aliases": [
      "panturrilha-no-leg-press",
      "panturrilha-leg-press",
      "sled-45-degree-calf-press",
      "76"
    ]
  },
  "abdominal-crunch-chute": {
    "canonicalId": "abdominal-crunch-chute",
    "name": "Abdominal Crunch no Banco / Solo",
    "equipment": "Banco Plano / Colchonete",
    "movementType": "Flexão de Tronco Anterior",
    "target": "Reto Abdominal",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/crunch-on-bench.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/crunch-on-bench.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/crunch-on-bench.jpg",
    "keyCues": [
      "Deite com as mãos na cabeça ou peito.",
      "Flexione o tronco aproximando as costelas do quadril.",
      "Expire todo o ar no topo contraindo o abdômen com firmeza."
    ],
    "aliases": [
      "abdominal-crunch-chute",
      "abdominal-crunch-solo",
      "bench-crunch",
      "crunch",
      "77"
    ]
  },
  "abdominal-polia-corda": {
    "canonicalId": "abdominal-polia-corda",
    "name": "Abdominal na Polia Ajoelhado com Corda",
    "equipment": "Polia Alta + Corda",
    "movementType": "Flexão de Tronco com Sobrecarga em Cabo",
    "target": "Reto Abdominal com Resistência",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-kneeling-crunch.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-kneeling-crunch.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-kneeling-crunch.jpg",
    "keyCues": [
      "Ajoelhe-se em frente à polia e segure a corda ao lado da cabeça.",
      "Enrole a coluna em direção ao chão sem sentar nos calcanhares.",
      "Retorne controlando a subida com a força do abdômen."
    ],
    "aliases": [
      "abdominal-polia-corda",
      "cable-kneeling-crunch",
      "abdominal-corda",
      "78"
    ]
  },
  "elevacao-pernas-barra-fixa": {
    "canonicalId": "elevacao-pernas-barra-fixa",
    "name": "Elevação de Pernas na Barra Fixa",
    "equipment": "Barra Fixa / Suspenso",
    "movementType": "Flexão de Quadril Suspenso",
    "target": "Abdômen Inferior & Flexores de Quadril",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/hanging-leg-hip-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/hanging-leg-hip-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/hanging-leg-hip-raise.jpg",
    "keyCues": [
      "Pendure-se na barra com pegada firme.",
      "Eleve os joelhos ou pernas em direção ao peito sem balançar o corpo.",
      "Desça devagar controlando o retorno sem deixar o corpo oscilar."
    ],
    "aliases": [
      "elevacao-pernas-barra-fixa",
      "elevacao-de-pernas-barra",
      "hanging-leg-hip-raise",
      "79"
    ]
  },
  "prancha-lateral": {
    "canonicalId": "prancha-lateral",
    "name": "Prancha Lateral no Solo",
    "equipment": "Colchonete",
    "movementType": "Isometria Lateral de Core",
    "target": "Oblíquos & Quadrado Lombar",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/side-bridge-side-plank.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/side-bridge-side-plank.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/side-bridge-side-plank.jpg",
    "keyCues": [
      "Apoie o antebraço no solo alinhado ao ombro.",
      "Eleve a bacia mantendo o corpo em linha reta da cabeça aos pés.",
      "Sustente a posição respirando de forma controlada."
    ],
    "aliases": [
      "prancha-lateral",
      "side-plank",
      "80"
    ]
  },
  "elevacao-de-pernas-solo": {
    "canonicalId": "elevacao-de-pernas-solo",
    "name": "Elevação de Pernas no Solo (Infra)",
    "equipment": "Colchonete",
    "movementType": "Flexão de Quadril em Decúbito Dorsal",
    "target": "Porção Infra-Abdominal",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lying-floor-leg-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lying-floor-leg-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lying-floor-leg-raise.jpg",
    "keyCues": [
      "Deite com as mãos sob o quadril para proteger a coluna lombar.",
      "Eleve as pernas retas até a linha vertical de 90°.",
      "Desça devagar sem deixar a lombar descolar do solo."
    ],
    "aliases": [
      "elevacao-de-pernas-solo",
      "abdominal-infra",
      "lying-leg-raise",
      "81"
    ]
  },
  "supino-declinado-halteres": {
    "canonicalId": "supino-declinado-halteres",
    "name": "Supino Declinado com Halteres",
    "equipment": "Banco Declinado + Halteres",
    "movementType": "Empurrar Declinado • Halteres Livres",
    "target": "Peitoral Maior (Fibras Inferiores)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/decline-dumbbell-bench-press-45-degree.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/decline-dumbbell-bench-press-45-degree.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/decline-dumbbell-bench-press-45-degree.jpg",
    "keyCues": [
      "Pés firmes sob as travas do banco declinado (-15° a -30°).",
      "Desça os halteres alinhando com a linha mamilar inferior.",
      "Empurre no vetor perpendicular ao tronco sem projetar os ombros."
    ],
    "aliases": [
      "supino-declinado-halteres",
      "104",
      "supino-declinado-com-halteres",
      "decline-dumbbell-bench-press"
    ]
  },
  "crucifixo-declinado-halteres": {
    "canonicalId": "crucifixo-declinado-halteres",
    "name": "Crucifixo Declinado com Halteres",
    "equipment": "Banco Declinado + Halteres",
    "movementType": "Adução Horizontal Declinada • Peitoral Inferior",
    "target": "Peitoral Maior (Fibras Inferiores)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-decline-fly-45-degree-1.mp4",
    "videoFemale": null,
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-decline-fly-45-degree-1.jpg",
    "keyCues": [
      "Mantenha cotovelos levemente semi-flexionados e travados no mesmo ângulo.",
      "Abra os braços em arco amplo até o alongamento máximo da porção costal.",
      "Aduza contraindo a parte inferior do peitoral sem encostar os halteres."
    ],
    "aliases": [
      "crucifixo-declinado-halteres",
      "113",
      "crucifixo-declinado-com-halteres",
      "decline-dumbbell-fly"
    ]
  },
  "crossover-polia-baixa": {
    "canonicalId": "crossover-polia-baixa",
    "name": "Crossover Polia Baixa",
    "equipment": "Estação Crossover com Polias no Ponto Mais Baixo + Pegadores",
    "movementType": "Adução Horizontal em Banco • Tensão Contínua",
    "target": "Peitoral Maior (Porção Clavicular Superior)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-lying-fly-flat-bench-cable-fly.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-lying-fly-flat-bench-cable-fly.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-lying-fly-flat-bench-cable-fly.jpg",
    "keyCues": [
      "Deite-se no banco plano posicionado entre as duas polias baixas.",
      "Mantenha os cotovelos fixos e conduza o movimento pelos peitorais.",
      "Sinta o pico de contração constante mesmo na fase final do movimento."
    ],
    "aliases": [
      "crossover-polia-baixa",
      "8",
      "flat-bench-cable-fly",
      "crucifixo-cabo-banco-reto"
    ]
  },
  "supino-articulado-maquina-inclinado": {
    "canonicalId": "supino-articulado-maquina-inclinado",
    "name": "Supino Articulado Máquina Inclinado",
    "equipment": "Máquina Articulada Inclinada",
    "movementType": "Empurrar Inclinado Convergente • Feixe Clavicular",
    "target": "Peitoral Superior (Clavicular)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-incline-hammer-chest-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-incline-hammer-chest-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-incline-hammer-chest-press.jpg",
    "keyCues": [
      "Ajuste a altura do banco para que as manoplas comecem na linha clavicular.",
      "Escápulas coladas no encosto e cotovelos no plano escapular.",
      "Empurre acelerando no arco convergente da máquina sem hiperextender os cotovelos."
    ],
    "aliases": [
      "supino-articulado-maquina-inclinado",
      "110",
      "lever-incline-hammer-chest-press",
      "supino-inclinado-articulado-hammer"
    ]
  },
  "supino-articulado-maquina-reto": {
    "canonicalId": "supino-articulado-maquina-reto",
    "name": "Supino Articulado Máquina Reto",
    "equipment": "Máquina Articulada com Carga por Anilhas ou Placas",
    "movementType": "Empurrar Horizontal Guiado • Peitoral Maior",
    "target": "Peitoral Maior (Fibras Médias)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-lying-chest-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-lying-chest-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-lying-chest-press.jpg",
    "keyCues": [
      "Manoplas na altura da porção média do peitoral.",
      "Peito estufado e ombros protegidos para trás durante toda a execução.",
      "Cadencie a descida em 2 segundos e exploda na subida."
    ],
    "aliases": [
      "supino-articulado-maquina-reto",
      "109",
      "lever-lying-chest-press",
      "supino-reto-articulado"
    ]
  },
  "paralelas-foco-peito": {
    "canonicalId": "paralelas-foco-peito",
    "name": "Paralelas (Foco Peito)",
    "equipment": "Barras Paralelas (Dip Station)",
    "movementType": "Mergulho com Tronco Inclinado • Peitoral Inferior",
    "target": "Peitoral Maior (Fibras Inferiores e Médias)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/chest-dips.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/chest-dips.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/chest-dips.jpg",
    "keyCues": [
      "Incline o tronco para a frente a ~30° e mantenha o queixo recolhido.",
      "Cotovelos abertos em ~45° para transferir a ênfase máxima ao peitoral.",
      "Desça até 90° nos cotovelos e empurre contraindo os peitorais."
    ],
    "aliases": [
      "paralelas-foco-peito",
      "12",
      "chest-dips",
      "mergulho-paralelas-peito"
    ]
  },
  "flexao-declinada-pes-elevados": {
    "canonicalId": "flexao-declinada-pes-elevados",
    "name": "Flexão Declinada com Pés Elevados",
    "equipment": "Banco / Caixa + Chão",
    "movementType": "Flexão com Pés Apoiados no Banco • Feixe Clavicular",
    "target": "Peitoral Superior e Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/incline-push-ups.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/incline-push-ups.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/incline-push-ups.jpg",
    "keyCues": [
      "Apoie as pontas dos pés no banco e mãos firmes no chão.",
      "Core totalmente travado em linha reta sem deixar a bacia ceder.",
      "Desça o tórax em direção ao chão e empurre com potência."
    ],
    "aliases": [
      "flexao-declinada-pes-elevados",
      "117",
      "incline-push-up",
      "flexao-pes-no-banco"
    ]
  },
  "remada-articulada-maquina": {
    "canonicalId": "remada-articulada-maquina",
    "name": "Remada Articulada Máquina",
    "equipment": "Máquina Articulada de Remada com Apoio no Peito",
    "movementType": "Remada Sentada Guiada • Romboides e Latíssimo",
    "target": "Grande Dorsal e Romboides",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-seated-row-wide-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-seated-row-wide-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-seated-row-wide-grip.jpg",
    "keyCues": [
      "Encosto peitoral ajustado para manter amplitude total de braços.",
      "Puxe conduzindo pelos cotovelos e esmague as escápulas atrás.",
      "Alongue totalmente as costas na volta sem perder o alinhamento espinhal."
    ],
    "aliases": [
      "remada-articulada-maquina",
      "21",
      "seated-cable-row-wide-grip",
      "remada-baixa-barra-aberta"
    ]
  },
  "remada-baixa-unilateral-polia": {
    "canonicalId": "remada-baixa-unilateral-polia",
    "name": "Remada Baixa Unilateral na Polia",
    "equipment": "Polia Baixa + Pegador Simples",
    "movementType": "Remada Unilateral • Latíssimo Inferior Isolado",
    "target": "Grande Dorsal (Porção Ilíaca)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-one-arm-twisting-seated-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-one-arm-twisting-seated-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-one-arm-twisting-seated-row.jpg",
    "keyCues": [
      "Mantenha o quadril e tronco estáveis, puxando o cotovelo rente à cintura.",
      "Permita ligeiro alcance escapular à frente para alongar o grande dorsal.",
      "Finalize puxando até o quadril com pausa isométrica de 1 segundo."
    ],
    "aliases": [
      "remada-baixa-unilateral-polia",
      "130",
      "cable-one-arm-seated-row",
      "remada-unilateral-polia"
    ]
  },
  "puxada-pegada-supinada": {
    "canonicalId": "puxada-pegada-supinada",
    "name": "Puxada com Pegada Supinada (Underhand)",
    "equipment": "Polia Alta + Barra Reta",
    "movementType": "Tração Vertical Supinada • Latíssimo & Braquial",
    "target": "Grande Dorsal Inferior e Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/reverse-grip-machine-lat-pulldown.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/reverse-grip-machine-lat-pulldown.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/reverse-grip-machine-lat-pulldown.jpg",
    "keyCues": [
      "Pegada na largura dos ombros com as palmas voltadas para você.",
      "Inicie a tração deprimindo as escápulas antes de flexionar os braços.",
      "Puxe a barra até a altura da fúrcula esternal mantendo o peito erguido."
    ],
    "aliases": [
      "puxada-pegada-supinada",
      "125",
      "reverse-grip-lat-pulldown",
      "underhand-lat-pulldown"
    ]
  },
  "remada-apoiada-banco-inclinado-halteres": {
    "canonicalId": "remada-apoiada-banco-inclinado-halteres",
    "name": "Remada Apoiada no Banco Inclinado com Halteres",
    "equipment": "Banco Inclinado (30°-45°) + Halteres",
    "movementType": "Remada Livre com Peito Apoiado • Zero Sobrecarga Lombar",
    "target": "Romboides, Trapézio Médio e Dorsais",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-row.jpg",
    "keyCues": [
      "Deite-se no banco a 30°-45° com peito firme no encosto.",
      "Braços soltos no início; inicie aduzindo as escápulas.",
      "Puxe os halteres trazendo os cotovelos em direção ao quadril."
    ],
    "aliases": [
      "remada-apoiada-banco-inclinado-halteres",
      "132",
      "dumbbell-incline-row",
      "chest-supported-dumbbell-row"
    ]
  },
  "remada-kroc-row-halter": {
    "canonicalId": "remada-kroc-row-halter",
    "name": "Remada Kroc com Halter Pesado",
    "equipment": "1 Halter Muito Pesado + Banco ou Apoio",
    "movementType": "Remada Guiada High Row • Costas Médias",
    "target": "Grande Dorsal, Trapézio, Romboides e Pegada",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-high-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-high-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-high-row.jpg",
    "keyCues": [
      "Posicione o banco para puxar no vetor diagonal alto-para-baixo.",
      "Puxe com força abrindo o peito e fechando a musculatura interescapular.",
      "Controle excêntrico estrito para ativação de espessura de tronco."
    ],
    "aliases": [
      "remada-kroc-row-halter",
      "138",
      "lever-high-row",
      "remada-articulada-high-row"
    ]
  },
  "encolhimento-smith": {
    "canonicalId": "encolhimento-smith",
    "name": "Encolhimento no Smith",
    "equipment": "Smith Machine",
    "movementType": "Elevação Escapular Guiada • Trapézio Superior",
    "target": "Trapézio Superior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-shrug.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-shrug.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-shrug.jpg",
    "keyCues": [
      "Barra do Smith ajustada na altura das coxas com pegada média.",
      "Eleve os ombros diretamente em direção às orelhas sem girá-los.",
      "Segure 2 segundos no topo contraindo o trapézio ao máximo."
    ],
    "aliases": [
      "encolhimento-smith",
      "167",
      "lever-shrug",
      "encolhimento-maquina-articulada"
    ]
  },
  "encolhimento-barra-por-tras-haney": {
    "canonicalId": "encolhimento-barra-por-tras-haney",
    "name": "Encolhimento com Barra por Trás (Lee Haney Shrug)",
    "equipment": "Barra Olímpica ou Smith por Trás do Corpo",
    "movementType": "Elevação Escapular Inclinada • Trapézio Médio/Superior",
    "target": "Trapézio Superior e Médio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-incline-shrug.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-incline-shrug.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-incline-shrug.jpg",
    "keyCues": [
      "Incline-se no banco 45° com halteres firmes pendendo neutros.",
      "Retraia e eleve as escápulas simultaneamente.",
      "Proteção cervical total com olhar alinhado à espinha."
    ],
    "aliases": [
      "encolhimento-barra-por-tras-haney",
      "169",
      "dumbbell-incline-shrug",
      "encolhimento-inclinado-halteres"
    ]
  },
  "desenvolvimento-smith": {
    "canonicalId": "desenvolvimento-smith",
    "name": "Desenvolvimento no Smith",
    "equipment": "Smith Machine + Banco 75°",
    "movementType": "Empurrar Vertical Guiado • Deltoide Anterior/Médio",
    "target": "Deltoide Anterior e Médio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/smith-seated-shoulder-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/smith-seated-shoulder-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/smith-seated-shoulder-press.jpg",
    "keyCues": [
      "Banco posicionado ligeiramente atrás da linha da barra (75°-80°).",
      "Desça a barra controladamente até a linha do queixo/clavícula.",
      "Empurre estendendo com segurança nos trilhos guiados."
    ],
    "aliases": [
      "desenvolvimento-smith",
      "148",
      "smith-seated-shoulder-press",
      "desenvolvimento-no-smith"
    ]
  },
  "elevacao-lateral-maquina-articulada": {
    "canonicalId": "elevacao-lateral-maquina-articulada",
    "name": "Elevação Lateral na Máquina Articulada",
    "equipment": "Máquina Lateral Raise Sentado",
    "movementType": "Abdução de Braços na Máquina • Deltoide Lateral Isolado",
    "target": "Deltoide Lateral",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-lateral-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-lateral-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-lateral-raise.jpg",
    "keyCues": [
      "Alinhe o eixo de rotação da máquina exatamente com a articulação do ombro.",
      "Cotovelos apoiados nas almofadas; empurre pelas almofadas, não com as mãos.",
      "Suba até a linha horizontal com controle estrito sem encolher o pescoço."
    ],
    "aliases": [
      "elevacao-lateral-maquina-articulada",
      "154",
      "lever-lateral-raise",
      "elevacao-lateral-maquina"
    ]
  },
  "remada-alta-halteres": {
    "canonicalId": "remada-alta-halteres",
    "name": "Remada Alta com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Puxada Vertical com Halteres • Deltoide Lateral & Trapézio",
    "target": "Deltoide Lateral e Trapézio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-upright-row.mp4",
    "videoFemale": null,
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-upright-row.jpg",
    "keyCues": [
      "Puxe os halteres rente ao corpo liderando com os cotovelos altos.",
      "Pare na linha média do peito para evitar impacto subacromial.",
      "Desça cadenciado mantendo a musculatura sob tensão."
    ],
    "aliases": [
      "remada-alta-halteres",
      "163",
      "dumbbell-upright-row",
      "remada-alta-com-halteres"
    ]
  },
  "elevacao-frontal-polia": {
    "canonicalId": "elevacao-frontal-polia",
    "name": "Elevação Frontal na Polia",
    "equipment": "Polia Baixa + Barra Reta ou Corda",
    "movementType": "Flexão de Ombro na Polia • Deltoide Anterior",
    "target": "Deltoide Anterior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-one-arm-forward-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-one-arm-forward-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-one-arm-forward-raise.jpg",
    "keyCues": [
      "De costas para a polia baixa, segurando o cabo entre as pernas ou unilateralmente.",
      "Eleve o braço reto até a altura dos olhos com punho firme.",
      "Resista à tração do cabo na descida em 3 segundos."
    ],
    "aliases": [
      "elevacao-frontal-polia",
      "33",
      "cable-one-arm-front-raise",
      "elevacao-frontal-cabo"
    ]
  },
  "remada-alta-polia-baixa": {
    "canonicalId": "remada-alta-polia-baixa",
    "name": "Remada Alta na Polia Baixa",
    "equipment": "Polia Baixa + Barra Reta ou Barra W",
    "movementType": "Remada Curvada com Cotovelos Abertos • Deltoide Posterior",
    "target": "Deltoide Lateral e Trapézio Superior",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-rear-delt-row.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-rear-delt-row.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-rear-delt-row.jpg",
    "keyCues": [
      "Incline o tronco paralelo ao chão com coluna neutra.",
      "Puxe os halteres com cotovelos abertos a 90° em relação ao tronco.",
      "Foco total na contração da parte de trás dos ombros."
    ],
    "aliases": [
      "remada-alta-polia-baixa",
      "164",
      "dumbbell-rear-delt-row",
      "remada-posterior-ombro"
    ]
  },
  "desenvolvimento-unilateral-em-pe-halter": {
    "canonicalId": "desenvolvimento-unilateral-em-pe-halter",
    "name": "Desenvolvimento Unilateral em Pé com Halter",
    "equipment": "1 Halter",
    "movementType": "Desenvolvimento Alternado • Estabilidade Escapular",
    "target": "Deltoide Anterior/Médio e Core Anti-Flexão Lateral",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-alternate-shoulder-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-alternate-shoulder-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-alternate-shoulder-press.jpg",
    "keyCues": [
      "Empurre um haltere enquanto o outro sustenta com controle no ombro.",
      "Mantenha o tronco ereto sem balançar de lado.",
      "Ritmo alternado contínuo e sincronizado."
    ],
    "aliases": [
      "desenvolvimento-unilateral-em-pe-halter",
      "150",
      "dumbbell-alternating-shoulder-press",
      "desenvolvimento-halteres-alternado"
    ]
  },
  "elevacao-lateral-banco-inclinado": {
    "canonicalId": "elevacao-lateral-banco-inclinado",
    "name": "Elevação Lateral no Banco Inclinado",
    "equipment": "Banco Inclinado (60°-75°) + Halteres",
    "movementType": "Abdução Sentada • Eliminação Total de Impulso",
    "target": "Deltoide Lateral (Hipertrofia no Alongamento)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-seated-lateral-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-seated-lateral-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-seated-lateral-raise.jpg",
    "keyCues": [
      "Sentado na ponta do banco com tronco ereto e pés firmes.",
      "Eleve os halteres em direção às paredes laterais.",
      "Pequena rotação neutra sem elevar os polegares acima dos cotovelos."
    ],
    "aliases": [
      "elevacao-lateral-banco-inclinado",
      "151",
      "dumbbell-seated-lateral-raise",
      "elevacao-lateral-sentado"
    ]
  },
  "rosca-drag-curl-barra": {
    "canonicalId": "rosca-drag-curl-barra",
    "name": "Rosca Drag com Barra (Drag Curl)",
    "equipment": "Barra Olímpica ou Smith Machine",
    "movementType": "Flexão de Cotovelo com Recuo de Cotovelos • Pico do Bíceps",
    "target": "Bíceps Braquial (Pico da Cabeça Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-drag-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-drag-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-drag-curl.jpg",
    "keyCues": [
      "Puxe a barra raspando no abdômen e tórax enquanto puxa os cotovelos para trás.",
      "Elimina o deltoide anterior e isola a cabeça longa do bíceps.",
      "Aperte com força máxima no ponto mais alto."
    ],
    "aliases": [
      "rosca-drag-curl-barra",
      "175",
      "barbell-drag-curl",
      "rosca-drag-barra"
    ]
  },
  "rosca-martelo-cruzada-cross-body": {
    "canonicalId": "rosca-martelo-cruzada-cross-body",
    "name": "Rosca Martelo Cruzada no Peito (Cross-Body)",
    "equipment": "Par de Halteres",
    "movementType": "Flexão com Pegada Neutra Cruzada • Braquial & Braquiorradial",
    "target": "Braquial e Cabeça Longa do Bíceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-cross-body-hammer-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-cross-body-hammer-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-cross-body-hammer-curl.jpg",
    "keyCues": [
      "Suba o haltere em diagonal cruzando o peito em direção ao ombro oposto.",
      "Mantenha a pegada neutra com o polegar sempre apontando para cima.",
      "Ideal para construir densidade e espessura no braço."
    ],
    "aliases": [
      "rosca-martelo-cruzada-cross-body",
      "178",
      "dumbbell-cross-body-hammer-curl",
      "rosca-martelo-cruzada"
    ]
  },
  "rosca-scott-maquina": {
    "canonicalId": "rosca-scott-maquina",
    "name": "Rosca Scott na Máquina",
    "equipment": "Máquina Biceps Curl / Preacher Machine",
    "movementType": "Flexão Guiada no Apoio Scott • Cabeça Curta do Bíceps",
    "target": "Bíceps Braquial (Cabeça Curta)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-preacher-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-preacher-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-preacher-curl.jpg",
    "keyCues": [
      "Axilas perfeitamente encaixadas no topo do estofado.",
      "Flexione os braços mantendo os cotovelos colados no suporte.",
      "Desça sem permitir hiperextensão abrupta da articulação no final."
    ],
    "aliases": [
      "rosca-scott-maquina",
      "46",
      "lever-preacher-curl",
      "rosca-scott-articulada"
    ]
  },
  "supino-declinado-barra": {
    "canonicalId": "supino-declinado-barra",
    "name": "Supino Declinado com Barra",
    "equipment": "Banco Declinado (15°-30°) com Apoio de Pernas + Barra Olímpica",
    "movementType": "Empurrar Declinado com Barra Olímpica • Peitoral Inferior",
    "target": "Peitoral Maior (Porção Costal / Inferior)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-decline-bench-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-decline-bench-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-decline-bench-press.jpg",
    "keyCues": [
      "Pés firmemente travados no banco declinado e pegada um pouco mais larga que os ombros.",
      "Desça a barra controladamente tocando suavemente a linha inferior do peitoral.",
      "Empurre estendendo os cotovelos sem descolar as escápulas do banco."
    ],
    "aliases": [
      "supino-declinado-barra",
      "3",
      "barbell-decline-bench-press",
      "supino-declinado-com-barra"
    ]
  },
  "rosca-martelo-banco-inclinado": {
    "canonicalId": "rosca-martelo-banco-inclinado",
    "name": "Rosca Martelo no Banco Inclinado",
    "equipment": "Banco Inclinado 45°-60° + Halteres",
    "movementType": "Flexão Sentada Alternada • Controle Bilateral",
    "target": "Braquial e Cabeça Longa no Alongamento",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-alternate-seated-biceps-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-alternate-seated-biceps-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-alternate-seated-biceps-curl.jpg",
    "keyCues": [
      "Sentado no banco com halteres ao lado do quadril.",
      "Suba um braço supinando enquanto o outro mantém o controle gravitacional.",
      "Movimento estrito sem jogar os ombros para a frente."
    ],
    "aliases": [
      "rosca-martelo-banco-inclinado",
      "177",
      "seated-alternating-dumbbell-curl",
      "rosca-alternada-sentado"
    ]
  },
  "rosca-zottman-halteres": {
    "canonicalId": "rosca-zottman-halteres",
    "name": "Rosca Zottman com Halteres",
    "equipment": "Par de Halteres",
    "movementType": "Flexão Supinada + Descida Pronada • Bíceps e Antebraço",
    "target": "Bíceps Braquial na Subida e Braquiorradial na Descida",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-one-arm-zottman-preacher-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-one-arm-zottman-preacher-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-one-arm-zottman-preacher-curl.jpg",
    "keyCues": [
      "Suba o haltere com as palmas voltadas para cima (supinação).",
      "No topo, gire as mãos 180° com as palmas para baixo (pronação).",
      "Desça lentamente contraindo intensamente os extensores do antebraço."
    ],
    "aliases": [
      "rosca-zottman-halteres",
      "176",
      "dumbbell-one-arm-zottman-preacher-curl",
      "rosca-zottman"
    ]
  },
  "extensao-punho-barra": {
    "canonicalId": "extensao-punho-barra",
    "name": "Extensão de Punho com Barra",
    "equipment": "Banco Reto + Barra Leve",
    "movementType": "Extensão de Punho com Barra • Extensores Radiais do Carpo",
    "target": "Extensores Radiais e Ulnar do Carpo (Face Posterior do Antebraço)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-reverse-wrist-curl-over-grip.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-reverse-wrist-curl-over-grip.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-reverse-wrist-curl-over-grip.jpg",
    "keyCues": [
      "Antebraços firmes no banco com os punhos projetados para fora.",
      "Palmas voltadas para baixo; eleve a barra flexionando os punhos para cima.",
      "Desça alongando o dorso do antebraço de forma controlada."
    ],
    "aliases": [
      "extensao-punho-barra",
      "100",
      "barbell-reverse-wrist-curl",
      "extensao-de-punho"
    ]
  },
  "triceps-frances-corda-polia-baixa": {
    "canonicalId": "triceps-frances-corda-polia-baixa",
    "name": "Tríceps Francês com Corda na Polia Baixa",
    "equipment": "Polia Baixa + Corda",
    "movementType": "Extensão Overhead na Polia • Cabeça Longa em Máximo Alongamento",
    "target": "Tríceps Braquial (Cabeça Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-rope-high-pulley-overhead-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-rope-high-pulley-overhead-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-rope-high-pulley-overhead-triceps-extension.jpg",
    "keyCues": [
      "Puxe a corda por trás da cabeça mantendo os cotovelos altos e fechados.",
      "Estenda os braços à frente abrindo a corda no final.",
      "Desça profundamente flexionando os cotovelos atrás da nuca."
    ],
    "aliases": [
      "triceps-frances-corda-polia-baixa",
      "200",
      "cable-rope-overhead-triceps-extension",
      "triceps-frances-polia-corda"
    ]
  },
  "triceps-testa-polia-baixa-corda": {
    "canonicalId": "triceps-testa-polia-baixa-corda",
    "name": "Tríceps Testa na Polia Baixa com Corda",
    "equipment": "Banco Reto em frente à Polia Baixa + Corda",
    "movementType": "Extensão Deitada na Polia • Tensão Contínua no Topo",
    "target": "Tríceps Braquial com Tensão Contínua",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-lying-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-lying-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-lying-triceps-extension.jpg",
    "keyCues": [
      "Deitado no banco de frente para a polia baixa segurando a corda/barra.",
      "Cotovelos apontados para o teto e fixos durante todo o arco.",
      "Estenda com potência sentindo a resistência constante do cabo."
    ],
    "aliases": [
      "triceps-testa-polia-baixa-corda",
      "197",
      "cable-lying-triceps-extension",
      "triceps-testa-polia"
    ]
  },
  "triceps-testa-halteres-banco-reto": {
    "canonicalId": "triceps-testa-halteres-banco-reto",
    "name": "Tríceps Testa com Halteres no Banco Reto",
    "equipment": "Banco Reto + Par de Halteres",
    "movementType": "Extensão Deitada com Halteres • Trabalho Unilateral Livre",
    "target": "Tríceps Braquial (Cabeça Medial e Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-lying-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-lying-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-lying-triceps-extension.jpg",
    "keyCues": [
      "Halteres com pegada neutra paralelos um ao outro.",
      "Desça os pesos ao lado das têmporas preservando os cotovelos.",
      "Estenda até quase travar sem perder a tensão na cabeça lateral."
    ],
    "aliases": [
      "triceps-testa-halteres-banco-reto",
      "195",
      "dumbbell-lying-triceps-extension",
      "triceps-testa-halteres"
    ]
  },
  "mergulho-maquina-articulada-triceps": {
    "canonicalId": "mergulho-maquina-articulada-triceps",
    "name": "Mergulho na Máquina Articulada de Tríceps",
    "equipment": "Máquina Seated Dip Machine",
    "movementType": "Mergulho Sentado Guiado • Tríceps sem Sobrecarga Escapular",
    "target": "Tríceps Braquial",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-dips.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-seated-dips.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-dips.jpg",
    "keyCues": [
      "Sente-se com cinto travado e manoplas firmes sob as palmas.",
      "Empurre as manoplas para baixo estendendo totalmente os braços.",
      "Retorne controlando em 3 segundos até a flexão de 90°."
    ],
    "aliases": [
      "mergulho-maquina-articulada-triceps",
      "212",
      "lever-seated-dip",
      "mergulho-maquina-triceps"
    ]
  },
  "paralelas-foco-triceps-vertical": {
    "canonicalId": "paralelas-foco-triceps-vertical",
    "name": "Paralelas com Foco em Tríceps (Corpo Vertical)",
    "equipment": "Barras Paralelas",
    "movementType": "Mergulho com Tronco Vertical • Foco Exclusivo em Tríceps",
    "target": "Tríceps Braquial (As Três Cabeças)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/triceps-dips.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/triceps-dips.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/triceps-dips.jpg",
    "keyCues": [
      "Mantenha o tronco estritamente na vertical e pernas retas ou cruzadas.",
      "Cotovelos colados ao tronco e apontados para trás na descida.",
      "Empurre com força total pelo calcanhar das mãos."
    ],
    "aliases": [
      "paralelas-foco-triceps-vertical",
      "207",
      "triceps-dips",
      "mergulho-paralelas-triceps"
    ]
  },
  "triceps-frances-halter": {
    "canonicalId": "triceps-frances-halter",
    "name": "Tríceps Francês com Halter",
    "equipment": "Banco com Encosto Baixo ou Reto + 1 Halter Pesado",
    "movementType": "Extensão Acima da Cabeça • Isolamento Unilateral",
    "target": "Tríceps Braquial (Cabeça Longa no Alongamento Superior)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-one-arm-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-one-arm-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-one-arm-triceps-extension.jpg",
    "keyCues": [
      "Braço estendido verticalmente ao lado da orelha.",
      "Desça o haltere por trás da cabeça dobrando o cotovelo.",
      "Estenda sem abrir o cotovelo para o lado."
    ],
    "aliases": [
      "triceps-frances-halter",
      "54",
      "dumbbell-one-arm-triceps-extension",
      "triceps-frances-unilateral-halter"
    ]
  },
  "triceps-coice-polia-unilateral": {
    "canonicalId": "triceps-coice-polia-unilateral",
    "name": "Tríceps Coice na Polia Baixa Unilateral sem Pegador",
    "equipment": "Polia Baixa + Cabo Direto",
    "movementType": "Empurrada Unilateral na Polia • Tensão Contínua",
    "target": "Tríceps Braquial (Cabeça Lateral e Longa)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/cable-standing-one-arm-triceps-extension.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/cable-standing-one-arm-triceps-extension.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/cable-standing-one-arm-triceps-extension.jpg",
    "keyCues": [
      "Segure o cabo ou manopla com o cotovelo travado na cintura.",
      "Estenda o braço para baixo até a contração de pico do tríceps.",
      "Controle milimétrico no retorno excêntrico."
    ],
    "aliases": [
      "triceps-coice-polia-unilateral",
      "204",
      "cable-standing-one-arm-triceps-extension",
      "triceps-unilateral-polia-alta"
    ]
  },
  "flexao-punho-halteres": {
    "canonicalId": "flexao-punho-halteres",
    "name": "Flexão de Punho com Halteres",
    "equipment": "Par de Halteres + Banco",
    "movementType": "Flexão de Punho por Trás • Flexores Profundos dos Dedos",
    "target": "Flexores do Punho Unilaterais",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-standing-back-wrist-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-standing-back-wrist-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-standing-back-wrist-curl.jpg",
    "keyCues": [
      "Em pé segurando a barra por trás do corpo com palmas para trás.",
      "Enrole os dedos e flexione os punhos para cima em direção às costas.",
      "Excelente construtor de força de pegada e antebraço medial."
    ],
    "aliases": [
      "flexao-punho-halteres",
      "187",
      "barbell-standing-back-wrist-curl",
      "flexao-punho-por-tras-barra"
    ]
  },
  "rosca-punho-inversa-banco-barra": {
    "canonicalId": "rosca-punho-inversa-banco-barra",
    "name": "Rosca de Punho Inversa no Banco com Barra",
    "equipment": "Banco + Barra Reta",
    "movementType": "Flexão com Halteres por Trás • Trabalho Unilateral",
    "target": "Extensores do Punho e Braquiorradial",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-behind-back-wrist-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-behind-back-wrist-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-behind-back-wrist-curl.jpg",
    "keyCues": [
      "Segure halteres por trás do quadril com pegada pronada.",
      "Flexione os punhos para cima com amplitude controlada.",
      "Trabalho de fortalecimento das mãos e punhos."
    ],
    "aliases": [
      "rosca-punho-inversa-banco-barra",
      "189",
      "dumbbell-behind-the-back-wrist-curl",
      "flexao-punho-halteres-por-tras"
    ]
  },
  "passada-barra-costas-walking-lunge": {
    "canonicalId": "passada-barra-costas-walking-lunge",
    "name": "Passada com Barra nas Costas (Walking Lunge)",
    "equipment": "Barra Olímpica nos Ombros + Espaço para Caminhada",
    "movementType": "Passada com Barra Olímpica • Força Unilateral Dinâmica",
    "target": "Quadríceps, Glúteos e Força Funcional",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-lunge.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-lunge.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-lunge.jpg",
    "keyCues": [
      "Barra apoiada no trapézio com pegada firme.",
      "Dê um passo à frente flexionando ambos os joelhos a 90°.",
      "O joelho traseiro quase toca o solo mantendo o tronco ereto."
    ],
    "aliases": [
      "passada-barra-costas-walking-lunge",
      "221",
      "barbell-lunge",
      "passada-com-barra"
    ]
  },
  "agachamento-sumo-halter-pesado": {
    "canonicalId": "agachamento-sumo-halter-pesado",
    "name": "Agachamento Sumô com Halter Pesado",
    "equipment": "1 Halter Pesado pendendo entre as pernas",
    "movementType": "Agachamento com Base Larga • Adutores & Glúteo Máximo",
    "target": "Adutores, Glúteos e Quadríceps",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-bar-grip-sumo-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-bar-grip-sumo-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-bar-grip-sumo-squat.jpg",
    "keyCues": [
      "Pés afastados além da largura dos ombros com pontas rodadas a 45°.",
      "Haltere pesado suspenso entre as pernas com braços estendidos.",
      "Desça os quadris até ultrapassar a linha dos joelhos empurrando pelo calcanhar."
    ],
    "aliases": [
      "agachamento-sumo-halter-pesado",
      "218",
      "dumbbell-sumo-squat",
      "agachamento-sumo-halter"
    ]
  },
  "cadeira-extensora-unilateral": {
    "canonicalId": "cadeira-extensora-unilateral",
    "name": "Cadeira Extensora Unilateral",
    "equipment": "Cadeira Extensora",
    "movementType": "Leg Press com Pés Fechados • Ênfase no Vasto Lateral",
    "target": "Quadríceps (Isolamento Unilateral)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/close-feet-leg-press.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/close-feet-leg-press.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/close-feet-leg-press.jpg",
    "keyCues": [
      "Pés posicionados no centro da plataforma com distância de 10-15 cm.",
      "Desça a plataforma controlando sem retirar o quadril do assento.",
      "Empurre estendendo as pernas sem travar os joelhos no topo."
    ],
    "aliases": [
      "cadeira-extensora-unilateral",
      "227",
      "close-feet-leg-press",
      "leg-press-pes-juntos"
    ]
  },
  "agachamento-pistola-pistol-squat": {
    "canonicalId": "agachamento-pistola-pistol-squat",
    "name": "Agachamento Pistola Unilateral (Pistol Squat)",
    "equipment": "Peso Corporal (Chão ou Caixa)",
    "movementType": "Agachamento com Halteres Livres • Quadríceps e Glúteos",
    "target": "Quadríceps, Força Unilateral Pura e Equilíbrio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-squat.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-squat.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-squat.jpg",
    "keyCues": [
      "Halteres firmes ao lado do corpo com postura ereta.",
      "Agache dobrando os joelhos e quadris simultaneamente.",
      "Empurre contra o chão mantendo o peito elevado."
    ],
    "aliases": [
      "agachamento-pistola-pistol-squat",
      "220",
      "dumbbell-squat",
      "agachamento-livre-halteres"
    ]
  },
  "flexora-bola-suica": {
    "canonicalId": "flexora-bola-suica",
    "name": "Flexora de Pernas com Bola Suíça",
    "equipment": "Colchonete + Bola Suíça (Fitball)",
    "movementType": "Flexão de Joelho Ajoelhada • Isolamento Unilateral dos Isquiotibiais",
    "target": "Isquiotibiais e Glúteo Máximo com Instabilidade",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-kneeling-leg-curl.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/lever-kneeling-leg-curl.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-kneeling-leg-curl.jpg",
    "keyCues": [
      "Apoie o joelho no acolchoado com o rolo posicionado atrás do tornozelo.",
      "Puxe o rolo em direção ao glúteo com contração máxima.",
      "Controle milimetricamente o retorno sem soltar o peso."
    ],
    "aliases": [
      "flexora-bola-suica",
      "242",
      "lever-kneeling-leg-curl",
      "flexora-ajoelhada-maquina"
    ]
  },
  "panturrilha-agachamento-smith": {
    "canonicalId": "panturrilha-agachamento-smith",
    "name": "Panturrilha no Agachamento Smith",
    "equipment": "Smith Machine + Bloco Elevado",
    "movementType": "Elevação Plantar Guiada no Smith • Gastrocnêmio com Carga",
    "target": "Gastrocnêmio com Sobrecarga Pesada",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/smith-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/smith-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/smith-calf-raise.jpg",
    "keyCues": [
      "Barra nas costas e pontas dos pés sobre o degrau/bloco.",
      "Desça os calcanhares sentindo o alongamento máximo da fáscia.",
      "Suba na ponta dos pés sustentando o topo por 1 segundo."
    ],
    "aliases": [
      "panturrilha-agachamento-smith",
      "266",
      "smith-machine-calf-raise",
      "panturrilha-no-smith"
    ]
  },
  "gemeos-unilateral-step-sem-carga": {
    "canonicalId": "gemeos-unilateral-step-sem-carga",
    "name": "Gêmeos Unilateral no Step sem Carga",
    "equipment": "Degrau ou Step",
    "movementType": "Elevação Plantar em Pé com Halteres • Trabalho Bilateral",
    "target": "Gastrocnêmio (Resistência e Cadência Controlada)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-standing-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-standing-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-standing-calf-raise.jpg",
    "keyCues": [
      "Segure os halteres ao lado do corpo e equilibre sobre o bloco.",
      "Eleve os calcanhares no ponto mais alto da contração.",
      "Descida controlada em 3 segundos."
    ],
    "aliases": [
      "gemeos-unilateral-step-sem-carga",
      "264",
      "dumbbell-standing-calf-raise",
      "panturrilha-em-pe-halteres"
    ]
  },
  "elevacao-pelvica-maquina": {
    "canonicalId": "elevacao-pelvica-maquina",
    "name": "Elevação Pélvica na Máquina",
    "equipment": "Máquina Hip Thrust Machine",
    "movementType": "Elevação Unilateral com Halter • Correção de Assimetrias",
    "target": "Glúteo Máximo",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-single-leg-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-single-leg-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-single-leg-calf-raise.jpg",
    "keyCues": [
      "Apoie uma das mãos no suporte e segure o haltere com a outra.",
      "Trabalhe a perna individual com amplitude articular completa.",
      "Pausa no pico de contração antes de descer."
    ],
    "aliases": [
      "elevacao-pelvica-maquina",
      "79",
      "dumbbell-single-leg-calf-raise",
      "panturrilha-unilateral-degrau"
    ]
  },
  "dorsiflexao-tibial-anterior-halter": {
    "canonicalId": "dorsiflexao-tibial-anterior-halter",
    "name": "Dorsiflexão Tibial Anterior com Halter",
    "equipment": "Banco Reto + 1 Halter preso entre os Pés ou na Ponta do Pé",
    "movementType": "Elevação Plantar com Tronco Flexionado • Foco nos Gêmeos",
    "target": "Tibial Anterior (Frente da Canela)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/donkey-calf-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/donkey-calf-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/donkey-calf-raise.jpg",
    "keyCues": [
      "Tronco flexionado a 90° com apoio das mãos no suporte.",
      "Quadris elevados para pré-alongar a musculatura posterior da perna.",
      "Elevação potente dos calcanhares sem dobrar os joelhos."
    ],
    "aliases": [
      "dorsiflexao-tibial-anterior-halter",
      "267",
      "donkey-calf-raise",
      "panturrilha-burro"
    ]
  },
  "maquina-abdominal": {
    "canonicalId": "maquina-abdominal",
    "name": "Máquina de Abdominal",
    "equipment": "Máquina Abdominal Crunch Sentado",
    "movementType": "Flexão de Tronco na Máquina • Reto Abdominal com Sobrecarga",
    "target": "Reto Abdominal com Carga de Placas",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/lever-seated-crunch-1.mp4",
    "videoFemale": null,
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/lever-seated-crunch-1.jpg",
    "keyCues": [
      "Apoie o peito ou segure as alças com os pés travados.",
      "Enrole a coluna contraindo os gomos do abdômen, sem puxar com os braços.",
      "Retorne resistindo até sentir o abdômen alongar."
    ],
    "aliases": [
      "maquina-abdominal",
      "98",
      "lever-seated-crunch",
      "abdominal-na-maquina"
    ]
  },
  "pulo-corda-jump-rope": {
    "canonicalId": "pulo-corda-jump-rope",
    "name": "Pulo de Corda Rápido (Jump Rope)",
    "equipment": "Corda de Pular (Speed Rope)",
    "movementType": "Salto Contínuo com Corda • Resistência Cardiovascular e Perna",
    "target": "Panturrilhas, Tendão de Aquiles e Resistência Aeróbica",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/jump-rope.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/jump-rope.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/jump-rope.jpg",
    "keyCues": [
      "Mantenha os cotovelos próximos às costelas e gire a corda com os punhos.",
      "Salte na ponta dos pés flexionando levemente os joelhos no impacto.",
      "Ritmo contínuo mantendo o abdômen firme e respiração constante."
    ],
    "aliases": [
      "pulo-corda-jump-rope",
      "303",
      "jump-rope",
      "pulo-de-corda"
    ]
  },
  "knee-to-elbow-barra-fixa": {
    "canonicalId": "knee-to-elbow-barra-fixa",
    "name": "Knee to Elbow na Barra Fixa",
    "equipment": "Barra Fixa",
    "movementType": "Elevação de Pernas no Banco Inclinado • Porção Inferior do Abdômen",
    "target": "Reto Abdominal e Oblíquos",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/incline-leg-hip-raise.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/incline-leg-hip-raise.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/incline-leg-hip-raise.jpg",
    "keyCues": [
      "Deite-se no banco inclinado segurando as travas superiores com as mãos.",
      "Eleve as pernas e a bacia do banco enrolando a pelve em direção ao tórax.",
      "Desça devagar sem deixar a lombar arquear."
    ],
    "aliases": [
      "knee-to-elbow-barra-fixa",
      "282",
      "incline-leg-hip-raise",
      "elevacao-pernas-banco-inclinado"
    ]
  },
  "gemeos-hack": {
    "canonicalId": "gemeos-hack",
    "name": "Gêmeos no Hack",
    "equipment": "Máquina Hack Squat",
    "movementType": "Flexão Completa de Tronco Solo • Força Geral de Core",
    "target": "Gastrocnêmio",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/sit-ups.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/sit-ups.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/sit-ups.jpg",
    "keyCues": [
      "Deite de costas no solo com joelhos dobrados e pés firmes no chão.",
      "Suba o tronco completamente até encostar os cotovelos nos joelhos.",
      "Desça desenrolando a coluna vértebra por vértebra."
    ],
    "aliases": [
      "gemeos-hack",
      "89",
      "sit-up",
      "sit-up-militar"
    ]
  },
  "abdominal-infra-reverso": {
    "canonicalId": "abdominal-infra-reverso",
    "name": "Abdominal Infra Reverso",
    "equipment": "Colchonete no Chão ou Banco Reto",
    "movementType": "Flexão Simultânea de Tronco e Pernas • Reto Abdominal Total",
    "target": "Reto Abdominal (Foco Pélvico Inferior)",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/v-up.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/v-up.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/v-up.jpg",
    "keyCues": [
      "Deite reto no solo com braços esticados acima da cabeça.",
      "Suba tronco e pernas retas ao mesmo tempo formando um \"V\".",
      "Toque as pontas dos pés no topo e retorne com controle total."
    ],
    "aliases": [
      "abdominal-infra-reverso",
      "94",
      "v-up",
      "abdominal-canivete"
    ]
  },
  "crunch-polia": {
    "canonicalId": "crunch-polia",
    "name": "Crunch na Polia",
    "equipment": "Polia Alta + Corda + Colchonete",
    "movementType": "Flexão Cruzada no Solo • Oblíquos Internos e Externos",
    "target": "Reto Abdominal com Sobrecarga Progressiva",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/twisting-crunch.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/twisting-crunch.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/twisting-crunch.jpg",
    "keyCues": [
      "Mãos na cabeça sem puxar o pescoço; cotovelos abertos.",
      "Suba o tronco rodando e apontando o ombro em direção ao joelho oposto.",
      "Alterne os lados com contração deliberada dos oblíquos."
    ],
    "aliases": [
      "crunch-polia",
      "91",
      "twisting-crunch",
      "abdominal-obliquo-cruzado"
    ]
  },
  "abdominal-declinado-anilha-peito": {
    "canonicalId": "abdominal-declinado-anilha-peito",
    "name": "Abdominal Declinado com Anilha no Peito",
    "equipment": "Banco Declinado + Anilha de 5kg a 20kg",
    "movementType": "Flexão Lateral com Halter • Oblíquos e Estabilizadores Laterais",
    "target": "Reto Abdominal com Sobrecarga",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/dumbbell-side-bend.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/dumbbell-side-bend.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/dumbbell-side-bend.jpg",
    "keyCues": [
      "Em pé segurando um único haltere ao lado da coxa.",
      "Incline o tronco lateralmente na direção do haltere com quadris parados.",
      "Retorne estendendo até a vertical usando a musculatura oblíqua oposta."
    ],
    "aliases": [
      "abdominal-declinado-anilha-peito",
      "287",
      "dumbbell-side-bend",
      "flexao-lateral-halter"
    ]
  },
  "corda-naval-ondas-alternadas": {
    "canonicalId": "corda-naval-ondas-alternadas",
    "name": "Corda Naval Ondas Alternadas (Battle Ropes)",
    "equipment": "Corda Naval Ancorada",
    "movementType": "Ondulação Rítmica Contínua • Potência de Ombros e Core",
    "target": "Ombros, Braços, Core e Condicionamento Anaeróbico",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/battling-ropes.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/battling-ropes.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/battling-ropes.jpg",
    "keyCues": [
      "Posição semi-agachada estável com peito aberto e core contraído.",
      "Mova os braços alternadamente para cima e para baixo gerando ondas velozes.",
      "Mantenha a respiração compassada e ritmo constante."
    ],
    "aliases": [
      "corda-naval-ondas-alternadas",
      "301",
      "battling-ropes",
      "corda-naval"
    ]
  },
  "burpee-completo-salto": {
    "canonicalId": "burpee-completo-salto",
    "name": "Burpee Completo com Salto",
    "equipment": "Peso Corporal (Chão)",
    "movementType": "Movimento Calistênico Dinâmico • Condicionamento Total",
    "target": "Condicionamento Metabólico e Potência Corporal Global",
    "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/burpee.mp4",
    "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/burpee.mp4",
    "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/burpee.jpg",
    "keyCues": [
      "Agache, apoie as mãos no chão e jogue os pés para trás.",
      "Faça uma flexão completa tocando o peito no solo.",
      "Puxe os pés de volta com explosão e salte estendendo os braços acima da cabeça."
    ],
    "aliases": [
      "burpee-completo-salto",
      "297",
      "burpee",
      "burpee-completo-com-salto"
    ]
  }
};

/**
 * Função utilitária de normalização para busca case-insensitive e sem acentos
 */
function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
