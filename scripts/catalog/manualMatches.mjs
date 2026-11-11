/**
 * Correspondências revistas à mão: exercício do app (slug) → nome do exercício no dataset.
 * Critério: o vídeo mostra o MESMO movimento e o mesmo equipamento. Variações (pegada, banco, Smith,
 * barra diferente) ficam de fora, porque um vídeo errado é pior do que nenhum.
 */
export const MANUAL_MATCHES = {
  'crucifixo-invertido-polia': 'Cable Crossover Reverse Fly',
  'prancha-isometrica': 'Front Plank',
  'crucifixo-reto-polia-banco': 'Flat Bench Cable Fly',
  'puxada-unilateral-polia-alta': 'Cable One Arm Lateral Pulldown',
  'remada-curvada-halteres': 'Dumbbell Bent-Over Row',
  'elevacao-lateral-polia-por-tras': 'Cable One Arm Lateral Raise',
  'elevacao-frontal-barra-reta': 'Barbell Front Raise',
  'crucifixo-invertido-banco-inclinado-halteres': 'Dumbbell Incline Rear Lateral Raise',
  'rosca-banco-inclinado-45-halteres': 'Dumbbell Incline Curl',
  'rosca-21-barra-w': 'EZ Bar Biceps Curl',
  'triceps-frances-unilateral-halter': 'Dumbbell One-Arm Triceps Extension',
  'stiff-deficit-bloco': 'Barbell Straight Leg Deadlift',
  'mergulho-no-banco': 'Bench Dips',

  // Expansão do catálogo (28 exercícios novos, ids 321-355, após auditoria visual frame-a-frame
  // que descartou 8 candidatos cujo vídeo não batia com o movimento esperado): slug → nome exato no dataset
  'elevacao-lateral-sentado-halteres': 'Dumbbell Seated Lateral Raise',
  'elevacao-frontal-sentado-halteres': 'Dumbbell Seated Front Raise',
  'elevacao-lateral-iron-cross': 'Dumbbell Iron Cross',
  'rosca-direta-inclinada-halteres': 'Dumbbell Incline Biceps Curl',
  'extensao-triceps-inclinado-halteres': 'Dumbbell Incline Triceps Extension',
  'rosca-scott-bola-suica': 'Dumbbell Preacher Curl Over Exercise Ball',
  'triceps-maquina-articulada': 'Lever Triceps Extension',
  'rosca-unilateral-polia': 'Cable One Arm Curl',
  'supino-fechado-halteres': 'Dumbbell Close-Grip Press',
  'remada-baixa-pegada-aberta-cabo': 'Seated Cable Row (Wide-Grip)',
  'remada-alta-sentada-v': 'Cable Seated High Row (V-bar)',
  'encolhimento-maquina-articulada': 'Lever Shrug',
  'barra-fixa-assistida-banco': 'Bench Pull-Up',
  'remada-alta-argolas': 'Ring High Row',
  'encolhimento-inclinado-halteres': 'Dumbbell Incline Shrug',
  'agachamento-halteres': 'Dumbbell Squat',
  'flexora-deitada-halteres': 'Dumbbell Lying Leg Curl',
  'hiperextensao-reversa-maquina': 'Lever Reverse Hyperextension',
  'extensao-quadril-pe-maquina': 'Lever Standing Hip Extension',
  'leg-press-pes-juntos': 'Close Feet Leg Press',
  'alongamento-dorsais-ajoelhado': 'Kneeling Lat Stretch',
  'alongamento-dinamico-peitoral': 'Dynamic Chest Stretch',
  'postura-borboleta': 'Butterfly Yoga Pose',
  'alongamento-peitoral-acima-cabeca': 'Overhead Chest Stretch',
  'alongamento-adutores-deitado': 'Standing Adductor Stretch',
  'alongamento-quadriceps-deitado': 'Lying Quadriceps Stretch',
  'alongamento-lateral-sentado-banco': 'Seated Lower Back Stretch',
  'alongamento-triceps-ajoelhado': 'Kneeling Triceps Stretch'
};
