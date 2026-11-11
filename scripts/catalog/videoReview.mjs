/**
 * Revisão manual dos vídeos (2026-11-09). Regra: cada exercício só mostra o vídeo do PRÓPRIO movimento,
 * e cada vídeo pertence a um único exercício. Usado por scripts/rebuild_video_library.mjs.
 */

/** Exercícios cujo vídeo atual mostra outro movimento/equipamento: ficam sem vídeo (o player mostra as dicas). */
export const REJECTED_VIDEO_IDS = [
  'crossover-polia-baixa', // Crossover Polia Baixa ≠ Resistance Band High Fly
  'pullover-halter', // Pullover com Halter ≠ Dumbbell Lying Hammer Press
  'rack-pull', // Rack Pull ≠ Smith Machine Deadlift
  'desenvolvimento-na-maquina', // Desenvolvimento na Máquina ≠ Smith Seated Shoulder Press
  'crucifixo-invertido-halteres', // Crucifixo Invertido com Halteres ≠ Dumbbell Rear Delt Row
  'rosca-martelo-corda', // Rosca Martelo na Corda ≠ Cable One Arm Curl
  'rosca-inversa', // Rosca Inversa ≠ Barbell Reverse Wrist Curl
  'triceps-coice-polia', // Tríceps Coice na Polia ≠ Cable Standing One Arm Triceps Extension
  'agachamento-bulgaro', // Agachamento Búlgaro ≠ Dumbbell Single Leg Squat
  'good-morning', // Good Morning ≠ Barbell Straight Leg Deadlift
  'elevacao-pelvica-maquina', // Elevação Pélvica na Máquina ≠ Glute Bridge
  'gluteo-polia-baixa', // Glúteo na Polia Baixa ≠ Lever Standing Hip Extension
  'gemeos-hack', // Gêmeos no Hack ≠ Sled 45 Degree Calf Press
  'roda-abdominal-ab-wheel', // Roda Abdominal (Ab Wheel) ≠ Standing Wheel Rollout
  'abdominal-russo-russian-twist', // Abdominal Russo (Russian Twist) ≠ Russian Twist on Stability Ball (Arms Straight)
  'flexao-punho-barra', // Flexão de Punho com Barra ≠ Barbell Standing Back Wrist Curl
  'supino-reto-smith', // Supino Reto no Smith ≠ Lever Lying Chest Press
  'supino-inclinado-smith', // Supino Inclinado no Smith ≠ Lever Incline Hammer Chest Press
  'supino-declinado-smith', // Supino Declinado no Smith ≠ Barbell Decline Bench Press
  'supino-chao-floor-press-halteres', // Supino no Chão com Halteres (Floor Press) ≠ Dumbbell Bench Press (supino no banco)
  'supino-chao-barra', // Supino no Chão com Barra (Barbell Floor Press) ≠ Barbell Close Grip Bench Press
  'supino-articulado-maquina-declinado', // Supino Articulado Máquina Declinado ≠ ?
  'crucifixo-inclinado-polia', // Crucifixo Inclinado na Polia ≠ Flat Bench Cable Fly
  'flexao-declinada-pes-elevados', // Flexão Declinada com Pés Elevados ≠ Deep Push-Up
  'spoto-press-supino', // Spoto Press com Pausa no Supino ≠ Barbell Bench Press
  'larsen-press-sem-pes', // Larsen Press (Supino sem Apoio dos Pés) ≠ Barbell Bench Press
  'svend-press-anilha', // Svend Press com Anilha ≠ Dumbbell Close-Grip Press
  'barra-fixa-carga-adicional', // Barra Fixa com Carga Adicional ≠ Pull-Up / Chin-Up
  'puxada-atras-nuca', // Puxada Atrás da Nuca na Polia ≠ Wide Grip Cable Lat Pulldown
  'remada-pendlay-solo', // Remada Pendlay do Solo ≠ Barbell Underhand Bent-Over Row
  'remada-curvada-smith', // Remada Curvada no Smith ≠ Lever Reverse T-Bar Row
  'remada-cavalinho-unilateral', // Remada Cavalinho Unilateral ≠ Lever T-Bar Row
  'remada-kroc-row-halter', // Remada Kroc com Halter Pesado ≠ Dumbbell Bent-Over Row
  'remada-meadows-barra-t', // Remada Meadows com Barra T ≠ Lever T-Bar Row
  'remada-articulada-pegada-neutra', // Remada Articulada Pegada Neutra ≠ Lever High Row
  'remada-articulada-pegada-aberta', // Remada Articulada Pegada Aberta ≠ Lever Reverse T-Bar Row
  'puxada-articulada-unilateral-maquina', // Puxada Articulada Unilateral na Máquina ≠ Reverse Grip Machine Lat Pulldown
  'levantamento-terra-sumo', // Levantamento Terra Sumô ≠ Kettlebell Deadlift
  'terra-trap-bar-hexagonal', // Levantamento Terra com Barra Hexagonal (Trap Bar) ≠ Dumbbell Deadlift
  'push-press-barra', // Push Press com Barra ≠ Barbell Clean And Press
  'elevacao-lateral-deitado-lado', // Elevação Lateral Deitado de Lado no Banco ≠ Dumbbell One Arm Lateral Raise
  'elevacao-frontal-anilha-plate-raise', // Elevação Frontal com Anilha (Plate Raise) ≠ Barbell Front Raise
  'elevacao-y-raise-banco-inclinado', // Elevação Y no Banco Inclinado (Y-Raise) ≠ EZ Barbell Anti Gravity Press
  'passaro-halteres-em-pe', // Pássaro com Halteres em Pé ≠ Barbell Rear Delt Raise
  'face-pull-polia-alta-pegada-dupla', // Face Pull na Polia Alta com Pegada Neutra Dupla ≠ Cable Rear Delt Row (with rope)
  'remada-alta-polia-baixa', // Remada Alta na Polia Baixa ≠ Barbell Wide-Grip Upright Row
  'rotacao-externa-ombro-polia-manguito', // Rotação Externa de Ombro na Polia (Manguito Rotador) ≠ Band Bent-Over Rear Lateral Raise
  'rotacao-interna-ombro-polia-manguito', // Rotação Interna de Ombro na Polia (Manguito Rotador) ≠ Band Shoulder Warm-Up Stretch
  'encolhimento-polia-baixa', // Encolhimento na Polia Baixa ≠ Lever Shrug
  'encolhimento-trap-bar-hexagonal', // Encolhimento na Barra Hexagonal Trap Bar ≠ Lever Shrug
  'rosca-concentrada-polia-baixa', // Rosca Concentrada na Polia Baixa ≠ Cable One Arm Curl
  'rosca-crossover-duplo-biceps', // Rosca no Crossover Duplo Bíceps (High Cable Curl) ≠ Cable Standing Inner Curl
  'rosca-barra-reta-pegada-fechada', // Rosca com Barra Reta Pegada Fechada ≠ EZ Bar Biceps Curl
  'rosca-scott-polia-barra', // Rosca Scott na Polia com Barra ≠ Lever Preacher Curl
  'rosca-inversa-polia-barra', // Rosca Inversa na Polia com Barra ≠ Cable One Arm Curl
  'rosca-bayesiana-polia-bayesian-curl', // Rosca Bayesiana na Polia Baixa (Bayesian Curl) ≠ Cable One Arm Curl
  'extensao-punho-halteres', // Extensão de Punho com Halteres ≠ Dumbbell Seated Neutral Wrist Curl
  'rolo-punho-wrist-roller', // Rolo de Punho com Peso (Wrist Roller) ≠ Wrist Circles
  'suspensao-dead-hang-barra-fixa', // Suspensão Isométrica na Barra Fixa (Dead Hang) ≠ Shoulder-Width Pull-Up
  'pincamento-pinch-grip-anilhas', // Pinçamento de Dedos com Anilhas (Pinch Grip) ≠ Dumbbell Behind-the-Back Wrist Curl
  'caminhada-fazendeiro-farmers-walk', // Caminhada do Fazendeiro com Halteres (Farmer's Walk) ≠ Dumbbell Shrug
  'flexao-punho-polia-baixa-barra', // Flexão de Punho na Polia Baixa com Barra ≠ Dumbbell Behind-the-Back Wrist Curl
  'triceps-testa-banco-declinado-barra-w', // Tríceps Testa no Banco Declinado com Barra W ≠ EZ Bar Lying Triceps Extension
  'triceps-frances-sentado-barra-w', // Tríceps Francês Sentado com Barra W ≠ Dumbbell Seated Triceps Extension
  'triceps-katana-polia-overhead', // Tríceps Katana na Polia (Overhead Cable Extension) ≠ Cable Rope Overhead Triceps Extension
  'triceps-pulley-inverso-supinado', // Tríceps Pulley Inverso com Pegada Supinada ≠ Cable Standing One Arm Triceps Extension
  'jm-press-barra-smith', // JM Press com Barra no Smith ≠ Barbell Close Grip Bench Press
  'jm-press-barra-w-livre', // JM Press com Barra W Livre ≠ EZ Bar Lying Triceps Extension
  'paralelas-carga-adicional', // Paralelas com Carga Adicional no Cinto ≠ Triceps Dips
  'tate-press-banco-reto-halteres', // Tate Press no Banco Reto com Halteres ≠ Dumbbell Pronate-grip Triceps Extension
  'california-press-barra', // California Press no Banco Reto com Barra ≠ Barbell Close Grip Bench Press
  'agachamento-zercher-barra', // Agachamento Zercher com Barra ≠ Barbell Front Squat
  'agachamento-bulgaro-smith', // Agachamento Búlgaro no Smith ≠ Smith Chair Squat
  'agachamento-pistola-pistol-squat', // Agachamento Pistola Unilateral (Pistol Squat) ≠ Dumbbell Single Leg Squat
  'afundo-barra-smith', // Afundo com Barra no Smith ≠ Barbell Lunge
  'afundo-reverso-halteres', // Afundo Reverso com Halteres (Reverse Lunge) ≠ Dumbbell Lunge
  'afundo-lateral-cossack-squat', // Afundo Lateral (Cossack Squat) ≠ Plyometric Side Lunge Stretch
  'step-up-caixa-halteres', // Step-Up na Caixa com Halteres (Subida no Banco) ≠ Jump Step-Up
  'step-up-smith', // Step-Up no Smith ≠ Jump Step-Up
  'cadeira-extensora-unilateral', // Cadeira Extensora Unilateral ≠ Lever Leg Extension
  'leg-press-45-unilateral', // Leg Press 45° Unilateral ≠ Close Feet Leg Press
  'leg-press-vertical-maquina', // Leg Press Vertical na Máquina ≠ Smith Machine Leg Press
  'agachamento-pausa-fundo', // Agachamento com Pausa de 3s no Fundo (Pause Squat) ≠ Barbell Back Squat
  'belt-squat-cinto', // Belt Squat (Agachamento com Cinto) ≠ Dumbbell Sumo Squat
  'agachamento-isometrico-parede-wall-sit', // Agachamento Isométrico na Parede (Wall Sit) ≠ Squat
  'agachamento-overhead-barra', // Agachamento OverHead com Barra (Overhead Squat) ≠ Barbell Clean And Press
  'terra-romeno-rdl-halteres', // Levantamento Terra Romeno (RDL) com Halteres ≠ Dumbbell Stiff Leg Deadlift
  'rdl-smith-calco', // RDL no Smith com Calço nos Calcanhares ≠ Smith Machine Deadlift
  'stiff-deficit-bloco', // Stiff com Déficit sobre Bloco de Madeira ≠ Barbell Straight Leg Deadlift
  'flexao-nordica-nordic-hamstring', // Flexão Nórdica para Isquiotibiais (Nordic Hamstring) ≠ Band Prone Leg Curl
  'mesa-flexora-unilateral', // Mesa Flexora Unilateral ≠ Lever Lying Leg Curl
  'cadeira-flexora-unilateral', // Cadeira Flexora Unilateral ≠ Lever Seated Leg Curl
  'flexora-polia-baixa-unilateral', // Flexora na Polia Baixa Unilateral em Pé ≠ Band Standing Leg Curl
  'good-morning-sentado-banco', // Good Morning Sentado no Banco ≠ Lever Back Extension
  'glute-ham-raise-ghr', // Glute Ham Raise (GHR Máquina) ≠ Lever Reverse Hyperextension
  'elevacao-pelvica-hip-thrust-halter', // Elevação Pélvica (Hip Thrust) com Halter Pesado ≠ Glute Bridge
  'hip-thrust-unilateral-chao-banco', // Hip Thrust Unilateral no Chão ou Banco ≠ Rear Decline Bridge
  'hip-thrust-smith', // Hip Thrust no Smith ≠ Glute Bridge
  'ponte-gluteos-barra-glute-bridge', // Ponte de Glúteos no Solo com Barra (Glute Bridge) ≠ Bridge Pose (Setu Bandhasana)
  'ponte-gluteos-unilateral', // Ponte de Glúteos Unilateral ≠ Lying Hip Lift on Stability Ball
  'gluteo-coice-cabo-kickback', // Glúteo Coice no Cabo com Caneleira (Cable Kickback) ≠ Lever Standing Rear Kick
  'gluteo-4-apoios-caneleira', // Glúteo 4 Apoios com Caneleira Pesada ≠ Band One-Leg Kickback (Bent Position)
  'coice-donkey-kick-smith', // Coice no Smith (Donkey Kick no Smith) ≠ Lever Standing Rear Kick
  'cadeira-abdutora-tronco-inclinado', // Cadeira Abdutora com Tronco Inclinado à Frente ≠ Lever Seated Hip Abduction
  'abducao-quadril-polia-baixa', // Abdução de Quadril na Polia Baixa em Pé ≠ Band Hip Abduction
  'monster-walk-lateral-mini-band', // Monster Walk Lateral com Mini Band ≠ Band Hip Abduction
  'clamshell-ostra-mini-band', // Clamshell com Mini Band no Colchonete (Ostra) ≠ Band Hip Abduction
  'agachamento-bulgaro-foco-gluteo', // Agachamento Búlgaro com Foco em Glúteo (Tronco Inclinado) ≠ Dumbbell Single Leg Squat
  'frog-pump-colchonete-halter', // Frog Pump no Colchonete com Halter ≠ Glute Bridge
  'gemeos-unilateral-step-sem-carga', // Gêmeos Unilateral no Step sem Carga ≠ Dumbbell Single Leg Calf Raise
  'gemeos-leg-press-horizontal', // Gêmeos no Leg Press Horizontal ≠ Sled 45 Degree Calf Press
  'dorsiflexao-tibial-anterior-halter', // Dorsiflexão Tibial Anterior com Halter ≠ Feet and Ankles Stretch
  'tibial-anterior-polia-alca', // Tibial Anterior na Polia com Alça ≠ Calf Stretch with Rope
  'cadeira-adutora-isometria', // Cadeira Adutora com Isometria no Final ≠ Lever Seated Hip Adduction
  'aducao-quadril-polia-baixa', // Adução de Quadril na Polia Baixa em Pé ≠ Band Hip Adduction
  'prancha-copenhagen-adutores', // Prancha Copenhagen ≠ Side Plank
  'agachamento-sumo-step-deficit', // Agachamento Sumô no Step com Déficit ≠ Dumbbell Sumo Squat
  'prancha-lateral-elevacao-perna', // Prancha Lateral com Elevação de Perna ≠ Side Plank
  'prancha-spiderman-joelho-cotovelo', // Prancha Spiderman com Joelho no Cotovelo ≠ Front Plank
  'prancha-toque-ombros-shoulder-taps', // Prancha com Toque nos Ombros (Shoulder Taps) ≠ Front Plank
  'crunch-bicicleta-bicycle-crunch', // Crunch Bicicleta no Chão (Bicycle Crunch) ≠ 45-Degree Bicycle Twisting Crunch
  'dragon-flag-banco-reto', // Dragon Flag no Banco Reto ≠ Leg Raise with Hip Lift
  'limpador-para-brisa-barra-wipers', // Limpador de Pára-brisa na Barra (Windshield Wipers) ≠ Pilates Corkscrew
  'toes-to-bar-pes-barra', // Toes to Bar na Barra Fixa (Pés na Barra) ≠ Hanging Straight Leg Raise
  'knee-to-elbow-barra-fixa', // Knee to Elbow na Barra Fixa ≠ Hanging Leg Hip Raise
  'pallof-press-polia-isometria', // Pallof Press na Polia com Isometria ≠ Cable Twist (up-down)
  'hollow-body-hold-canoa', // Hollow Body Hold (Canoa Isométrica) ≠ Pilates Hundred
  'abdominal-declinado-anilha-peito', // Abdominal Declinado com Anilha no Peito ≠ Otis-Up
  'stomach-vacuum-vacuo-abdominal', // Stomach Vacuum (Vácuo Abdominal) ≠ Front Plank
  'deadbug-controle-respiratorio', // Deadbug com Controle Respiratório ≠ Lying Scissor Kick
  'bird-dog-perdigueiro-isometria', // Bird-Dog (Perdigueiro com Isometria) ≠ Front Plank
  'crunch-bola-suica-extensao', // Crunch na Bola Suíça com Extensão Lombar ≠ Exercise Ball Sit-Up
  'kettlebell-swing-russo', // Kettlebell Swing Russo ≠ Kettlebell Deadlift
  'kettlebell-clean-and-press', // Kettlebell Clean and Press ≠ Barbell Clean And Press
  'turkish-get-up-levantamento-turco', // Levantamento Turco com Kettlebell (Turkish Get-Up) ≠ Otis-Up
  'salto-caixa-pliometrica-box-jump', // Salto na Caixa Pliométrica (Box Jump) ≠ Jump Step-Up
  'slam-ball-bola-medicinal', // Slam Ball com Bola Medicinal Pesada ≠ Medicine Ball Wall Sit-Up
  'wall-ball-medicine-ball', // Wall Ball com Medicine Ball ≠ Dumbbell Goblet Squat
  'mountain-climbers-escalador', // Mountain Climbers no Solo (Escalador) ≠ Cardio Exercise
  'empurrar-treno-sled-push', // Empurrar Trenó de Carga (Prowler Sled Push) ≠ Treadmill Running
  'puxar-treno-sled-pull', // Puxar Trenó com Corda (Sled Pull) ≠ Running
  'remo-seco-rowing-machine', // Remo Seco Ergômetro (Rowing Machine) ≠ Cardio Machine Exercise
  'assault-bike-air-bike', // Assault Bike (Air Bike em Alta Intensidade) ≠ Stationary Bike
  'worlds-greatest-stretch-mobilidade', // Maior Alongamento do Mundo (World's Greatest Stretch) ≠ Runner's Stretch
  'ativacao-escapular-barra-fixa', // Ativação Escapular na Barra Fixa (Scapular Pull-Up) ≠ Shoulder-Width Pull-Up
  'flexao-escapular-scapular-push-up', // Flexão Escapular no Chão (Scapular Push-Up) ≠ Push-Up
  'deslocacao-ombros-bastao-elastico', // Dislocação de Ombros com Bastão ou Elástico ≠ Band Shoulder Warm-Up Stretch
  'agachamento-cocoras-deep-squat-hold', // Agachamento Cócoras Isométrico (Deep Squat Hold) ≠ All Fours Groin Stretch
  'mobilidade-quadril-9090-transicao', // Mobilidade de Quadril 90/90 com Transição Dinâmica ≠ Hip Circles Stretch
  'liberacao-miofascial-quadriceps-foam-roller', // Rolo de Liberação Miofascial em Quadríceps (Foam Roller) ≠ Lying Quadriceps Stretch
  'levantamento-terra', // Levantamento Terra (Deadlift) ≠ Dumbbell Deadlift
  'rosca-martelo-halteres', // Rosca Martelo com Halteres ≠ Dumbbell Incline Hammer Curl
  'rosca-scott-barra-w', // Rosca Scott com Barra W ≠ Dumbbell Seated Preacher Curl
  'elevacao-lateral-banco-inclinado', // Elevação Lateral no Banco Inclinado ≠ Dumbbell Seated Lateral Raise
  'elevacao-frontal-alternada-halteres', // Elevação Frontal Alternada com Halteres ≠ Dumbbell Seated Front Raise
  'encolhimento-smith', // Encolhimento no Smith ≠ Lever Shrug
  'encolhimento-barra-por-tras-haney', // Encolhimento com Barra por Trás (Lee Haney Shrug) ≠ Dumbbell Incline Shrug
  'rosca-zottman-halteres', // Rosca Zottman com Halteres ≠ Dumbbell One Arm Zottman Preacher Curl
  'kettlebell-snatch-arranque', // Kettlebell Snatch (Arranque) ≠ Kettlebell Deadlift
  'alongamento-peitoral-biceps-parede', // Alongamento de Peitoral e Bíceps na Parede ≠ Overhead Chest Stretch
  'mobilidade-tornozelo-parede-dorsiflexao', // Mobilidade de Tornozelo na Parede com Joelho à Frente ≠ Stairs Calf Stretch
];

/** Donos exatos de um vídeo (lote de casa): ganham sempre a disputa por um vídeo repetido. */
export const PRIORITY_VIDEO_IDS = [
  'remada-invertida-entre-cadeiras',
  'step-up-com-salto',
  'abdominal-bicicleta-45',
  'barra-fixa-comando',
  'mergulho-escapular',
  'barra-fixa-assistida-elastico',
  'puxada-unilateral-elastico',
  'remada-sentada-elastico',
  'remada-alta-deltoide-posterior-elastico',
  'crucifixo-invertido-elastico',
  'elevacao-frontal-unilateral-elastico',
  'crucifixo-alto-elastico',
  'triceps-frances-elastico',
  'triceps-pulley-elastico',
  'extensora-sentado-elastico',
  'flexora-deitado-elastico',
  'flexora-em-pe-elastico',
  'pull-through-elastico',
  'coice-gluteo-elastico',
  'abducao-quadril-elastico',
  'aducao-quadril-elastico',
  'panturrilha-em-pe-elastico',
  'abdominal-em-pe-elastico',
  'flexao-lateral-tronco-elastico',
  'lenhador-inverso-elastico',
  'agachamento-unilateral-halteres',
  'spell-caster-halteres',
];
