# Prompt Mestre: Aquisição e Mapeamento de Vídeos 3D Anatómicos

> Este documento foi desenhado para ser copiado diretamente para o **Claude Code** (ou executado por um agente de automação). Contém o mapeamento exato dos exercícios sem vídeo, o vocabulário canónico em inglês, o padrão estético inegociável e o pipeline de integração no projeto AB Fitness.

---

## 1. Diretriz Inegociável: Padrão Visual Idêntico ("Compatíveis e Iguais")

Na app **AB Fitness**, todos os vídeos de exercícios seguem uma identidade visual unificada. Não são aceites vídeos de pessoas reais em ginásios com roupas, luzes ou enquadramentos diferentes.

### Especificações Técnicas do Ativo
1. **Estilo Gráfico**: Renderização **3D Anatómica** sobre fundo escuro/neutro, com a musculatura ativa destacada a cor de contraste (vermelho/laranja para agonistas).
2. **Formato**: Ficheiro `.mp4` codificado em H.264 / AAC.
3. **Duração e Cadência**: Loop contínuo de 3 a 6 segundos (uma repetição completa controlada: excêntrica + concêntrica), sem cortes bruscos e sem áudio.
4. **Resolução e Peso**: Resolução 720p ou 1080p quadrada/vertical (1:1 ou 9:16), com compressão otimizada (< 1 MB por ficheiro para cache offline instantânea no Service Worker `ab-fitness-media-v1`).
5. **Paridade de Género**: Versão Masculina (`exercise-videos/male/<slug>.mp4`) e Feminina (`exercise-videos/female/<slug>.mp4`) sempre que disponível, acompanhada do poster de pré-visualização (`exercise-posters/male/<slug>.jpg`).
6. **Regra de Ouro Biomecânica (1:1)**: Cada exercício mostra **apenas o vídeo do seu próprio movimento e equipamento exato**. Nunca reutilizar vídeos de movimentos diferentes (ex.: nunca associar *Agachamento Tradicional* ao *Agachamento Búlgaro*, nem *Supino com Barra* ao *Supino no Smith*). É preferível não ter vídeo a ter um vídeo enganador.

---

## 2. Mapa Canónico dos Exercícios em Falta (179 Exercícios)

Para pesquisar de forma ultra-poupada em tokens nas bases de dados 3D (ex.: *GymVisual*, *Vital Animations*, *WorkoutX*, *MoveKit*, datasets abertos), usa estes termos em inglês:

### Peito (14 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 7 | Crossover Polia Média | `crossover-polia-media` | `Cable Middle Fly` / `Cable Chest Fly` |
| 8 | Crossover Polia Baixa | `crossover-polia-baixa` | `Low Cable Crossover` / `Low Cable Fly` |
| 10 | Pullover com Halter | `pullover-halter` | `Dumbbell Pullover` |
| 102 | Supino Reto no Smith | `supino-reto-smith` | `Smith Machine Bench Press` |
| 103 | Supino Inclinado no Smith | `supino-inclinado-smith` | `Smith Machine Incline Bench Press` |
| 105 | Supino Declinado no Smith | `supino-declinado-smith` | `Smith Machine Decline Bench Press` |
| 106 | Supino no Chão com Halteres (Floor Press) | `supino-chao-floor-press-halteres` | `Dumbbell Floor Press` |
| 107 | Supino no Chão com Barra | `supino-chao-barra` | `Barbell Floor Press` |
| 111 | Supino Articulado Máquina Declinado | `supino-articulado-maquina-declinado` | `Lever Decline Chest Press` |
| 114 | Crucifixo Inclinado na Polia | `crucifixo-inclinado-polia` | `Incline Cable Fly` |
| 117 | Flexão Declinada com Pés Elevados | `flexao-declinada-pes-elevados` | `Decline Push-Up` / `Feet-Elevated Push-Up` |
| 120 | Spoto Press com Pausa no Supino | `spoto-press-supino` | `Spoto Press` / `Board Press` |
| 121 | Larsen Press (Supino sem Apoio dos Pés) | `larsen-press-sem-pes` | `Larsen Press` |
| 122 | Svend Press com Anilha | `svend-press-anilha` | `Svend Press` / `Pinch Press` |

### Costas & Dorsais (17 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 24 | Levantamento Terra (Deadlift) | `levantamento-terra` | `Barbell Conventional Deadlift` |
| 26 | Rack Pull | `rack-pull` | `Barbell Rack Pull` |
| 124 | Barra Fixa com Carga Adicional | `barra-fixa-carga-adicional` | `Weighted Pull-Up` |
| 126 | Puxada com Pegada Neutra Paralela | `puxada-pegada-neutra-paralela` | `Parallel Grip Lat Pulldown` / `V-Bar Pulldown` |
| 128 | Puxada Atrás da Nuca na Polia | `puxada-atras-nuca` | `Behind Neck Lat Pulldown` |
| 129 | Puxada com Braços Retos na Polia (Straight-Arm) | `puxada-bracos-retos-straight-arm` | `Cable Straight-Arm Pulldown` |
| 134 | Remada Pendlay do Solo | `remada-pendlay-solo` | `Pendlay Row` |
| 135 | Remada Yates Supinada com Barra | `remada-yates-supinada` | `Underhand Barbell Row` / `Yates Row` |
| 136 | Remada Curvada no Smith | `remada-curvada-smith` | `Smith Machine Bent-Over Row` |
| 137 | Remada Cavalinho Unilateral | `remada-cavalinho-unilateral` | `One Arm T-Bar Row` |
| 138 | Remada Kroc com Halter Pesado | `remada-kroc-row-halter` | `Kroc Row` / `Heavy One Arm Dumbbell Row` |
| 139 | Remada Meadows com Barra T | `remada-meadows-barra-t` | `Meadows Row` |
| 140 | Remada Articulada Pegada Neutra | `remada-articulada-pegada-neutra` | `Lever Neutral Grip Seated Row` |
| 141 | Remada Articulada Pegada Aberta | `remada-articulada-pegada-aberta` | `Lever High Row` / `Lever Wide Grip Row` |
| 142 | Puxada Articulada Unilateral na Máquina | `puxada-articulada-unilateral-maquina` | `Lever One Arm Lat Pulldown` |
| 143 | Levantamento Terra Sumô | `levantamento-terra-sumo` | `Sumo Deadlift` |
| 144 | Levantamento Terra com Barra Hexagonal | `terra-trap-bar-hexagonal` | `Trap Bar Deadlift` / `Hex Bar Deadlift` |

### Ombros & Trapézio (17 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 29 | Desenvolvimento na Máquina | `desenvolvimento-na-maquina` | `Lever Seated Shoulder Press` |
| 34 | Crucifixo Invertido com Halteres | `crucifixo-invertido-halteres` | `Dumbbell Rear Delt Fly` / `Dumbbell Reverse Fly` |
| 149 | Push Press com Barra | `push-press-barra` | `Barbell Push Press` |
| 151 | Elevação Lateral no Banco Inclinado | `elevacao-lateral-banco-inclinado` | `Incline Dumbbell Lateral Raise` |
| 152 | Elevação Lateral Deitado de Lado no Banco | `elevacao-lateral-deitado-lado` | `Side-Lying Lateral Raise` |
| 156 | Elevação Frontal com Anilha (Plate Raise) | `elevacao-frontal-anilha-plate-raise` | `Weight Plate Front Raise` |
| 157 | Elevação Frontal Alternada com Halteres | `elevacao-frontal-alternada-halteres` | `Alternating Dumbbell Front Raise` |
| 159 | Elevação Y no Banco Inclinado (Y-Raise) | `elevacao-y-banco-inclinado-y-raise` | `Incline Prone Y-Raise` |
| 161 | Pássaro com Halteres em Pé | `passaro-halteres-em-pe` | `Standing Dumbbell Rear Delt Fly` |
| 162 | Face Pull na Polia Alta com Pegada Neutra Dupla | `face-pull-polia-alta-corda-dupla` | `Cable Rope Face Pull` |
| 164 | Remada Alta na Polia Baixa | `remada-alta-polia-baixa` | `Low Cable Upright Row` |
| 165 | Rotação Externa de Ombro na Polia (Manguito) | `rotacao-externa-manguito-polia` | `Cable External Shoulder Rotation` |
| 166 | Rotação Interna de Ombro na Polia (Manguito) | `rotacao-interna-manguito-polia` | `Cable Internal Shoulder Rotation` |
| 167 | Encolhimento no Smith | `encolhimento-smith` | `Smith Machine Shrug` |
| 168 | Encolhimento na Polia Baixa | `encolhimento-polia-baixa` | `Cable Shrug` |
| 169 | Encolhimento com Barra por Trás (Lee Haney) | `encolhimento-barra-por-tras-haney` | `Behind-The-Back Barbell Shrug` |
| 170 | Encolhimento na Barra Hexagonal Trap Bar | `encolhimento-trap-bar-hexagonal` | `Trap Bar Shrug` |

### Braços & Antebraços (Bíceps, Tríceps, Antebraços) (26 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 43 | Rosca Martelo com Halteres | `rosca-martelo-halteres` | `Dumbbell Hammer Curl` |
| 44 | Rosca Martelo na Corda | `rosca-martelo-corda` | `Cable Rope Hammer Curl` |
| 45 | Rosca Scott com Barra W | `rosca-scott-barra-w` | `EZ-Bar Preacher Curl` |
| 48 | Rosca Inversa | `rosca-inversa` | `Barbell Reverse Curl` |
| 58 | Tríceps Coice na Polia | `triceps-coice-polia` | `Cable Kickback` |
| 176 | Rosca Zottman com Halteres | `rosca-zottman-halteres` | `Zottman Curl` |
| 179 | Rosca Concentrada na Polia Baixa | `rosca-concentrada-polia-baixa` | `Low Cable Concentration Curl` |
| 180 | Rosca no Crossover Duplo Bíceps | `rosca-crossover-duplo-biceps` | `High Cable Overhead Curl` |
| 181 | Rosca com Barra Reta Pegada Aberta | `rosca-barra-reta-pegada-aberta` | `Wide Grip Barbell Curl` |
| 182 | Rosca com Barra Reta Pegada Fechada | `rosca-barra-reta-pegada-fechada` | `Close Grip Barbell Curl` |
| 183 | Rosca Scott na Polia com Barra | `rosca-scott-polia-barra` | `Cable Preacher Curl` |
| 184 | Rosca Inversa na Polia com Barra | `rosca-inversa-polia-barra` | `Cable Reverse Curl` |
| 185 | Rosca Bayesiana na Polia Baixa | `rosca-bayesiana-polia-baixa` | `Bayesian Cable Curl` |
| 188 | Extensão de Punho com Halteres | `extensao-punho-halteres` | `Dumbbell Wrist Extension` |
| 189 | Rosca de Punho Inversa no Banco com Barra | `rosca-punho-inversa-banco-barra` | `Barbell Reverse Wrist Curl` |
| 190 | Rolo de Punho com Peso (Wrist Roller) | `rolo-punho-wrist-roller` | `Wrist Roller` |
| 191 | Suspensão Isométrica na Barra Fixa (Dead Hang) | `suspensao-dead-hang-barra-fixa` | `Dead Hang` / `Barbell Hang` |
| 192 | Pinçamento de Dedos com Anilhas (Pinch Grip) | `pincamento-pinch-grip-anilhas` | `Plate Pinch Hold` |
| 193 | Caminhada do Fazendeiro com Halteres | `caminhada-fazendeiro-farmers-walk` | `Dumbbell Farmer's Walk` |
| 194 | Flexão de Punho na Polia Baixa com Barra | `flexao-punho-polia-baixa-barra` | `Cable Wrist Curl` |
| 196 | Tríceps Testa Declinado Barra W | `triceps-testa-declinado-barra-w` | `Decline EZ-Bar Skullcrusher` |
| 198 | Tríceps Francês Sentado Barra W | `triceps-frances-sentado-barra-w` | `Seated Overhead EZ-Bar Triceps Extension` |
| 200 | Tríceps Francês com Corda na Polia Baixa | `triceps-frances-corda-polia-baixa` | `Low Cable Overhead Triceps Extension` |
| 201 | Tríceps Katana na Polia | `triceps-katana-polia-overhead` | `Katana Cable Triceps Extension` |
| 202 | Tríceps Pulley com Barra V | `triceps-pulley-barra-v` | `V-Bar Triceps Pushdown` |
| 208 | Paralelas com Carga Adicional no Cinto | `paralelas-carga-adicional-dips` | `Weighted Dips` |

### Membros Inferiores (Quadríceps, Posteriores, Glúteos, Panturrilhas, Adutores) (39 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 64 | Agachamento Búlgaro | `agachamento-bulgaro` | `Bulgarian Split Squat` |
| 69 | Afundo com Halteres | `afundo-com-halteres` | `Dumbbell Lunge` |
| 73 | Levantamento Terra Romeno (RDL) | `terra-romeno-rdl` | `Barbell Romanian Deadlift (RDL)` |
| 77 | Good Morning | `good-morning` | `Barbell Good Morning` |
| 78 | Elevação Pélvica (Hip Thrust) | `elevacao-pelvica-hip-thrust` | `Barbell Hip Thrust` |
| 79 | Elevação Pélvica na Máquina | `elevacao-pelvica-maquina` | `Machine Hip Thrust` |
| 80 | Glúteo na Polia Baixa | `gluteo-polia-baixa` | `Cable Hip Extension` / `Glute Kickback` |
| 89 | Gêmeos no Hack | `gemeos-hack` | `Hack Squat Calf Raise` |
| 220 | Agachamento Pistola Unilateral (Pistol Squat) | `pistol-squat-unilateral` | `Pistol Squat` |
| 224 | Afundo Lateral (Cossack Squat) | `cossack-squat-afundo-lateral` | `Cossack Squat` |
| 227 | Cadeira Extensora Unilateral | `cadeira-extensora-unilateral` | `Single Leg Extension` |
| 228 | Leg Press 45° Unilateral | `leg-press-45-unilateral` | `Single Leg 45 Degree Leg Press` |
| 231 | Belt Squat (Agachamento com Cinto) | `belt-squat-agachamento-cinto` | `Belt Squat` |
| 232 | Agachamento Isométrico na Parede (Wall Sit) | `wall-sit-isometrico-parede` | `Wall Sit` |
| 233 | Sissy Squat com Carga no Peito | `sissy-squat-peito` | `Sissy Squat` |
| 235 | RDL com Halteres | `rdl-halteres-romeno` | `Dumbbell Romanian Deadlift` |
| 238 | Stiff com Déficit sobre Bloco de Madeira | `stiff-deficit-bloco` | `Deficit Stiff-Leg Deadlift` |
| 239 | Flexão Nórdica para Isquiotibiais | `flexao-nordica-isquiotibiais` | `Nordic Hamstring Curl` |
| 240 | Mesa Flexora Unilateral | `mesa-flexora-unilateral` | `Single Leg Lying Leg Curl` |
| 241 | Cadeira Flexora Unilateral | `cadeira-flexora-unilateral` | `Single Leg Seated Leg Curl` |
| 246 | Hip Thrust com Halter Pesado | `hip-thrust-halter-pesado` | `Dumbbell Hip Thrust` |
| 247 | Hip Thrust Unilateral no Chão ou Banco | `hip-thrust-unilateral-chao-banco` | `Single Leg Hip Thrust` |
| 248 | Hip Thrust no Smith | `hip-thrust-smith` | `Smith Machine Hip Thrust` |
| 250 | Ponte de Glúteos Unilateral | `ponte-gluteos-unilateral` | `Single Leg Glute Bridge` |
| 251 | Glúteo Coice no Cabo com Caneleira | `gluteo-coice-cabo-caneleira` | `Cable Glute Kickback` |
| 254 | Cadeira Abdutora com Tronco Inclinado | `cadeira-abdutora-tronco-inclinado` | `Seated Leaning Hip Abduction` |
| 256 | Monster Walk Lateral com Mini Band | `monster-walk-lateral-mini-band` | `Lateral Band Walk` / `Monster Walk` |
| 257 | Clamshell com Mini Band no Colchonete (Ostra) | `clamshell-ostra-mini-band` | `Band Clamshell` |
| 265 | Gêmeos no Leg Press Horizontal | `gemeos-leg-press-horizontal` | `Seated Leg Press Calf Raise` |
| 266 | Panturrilha no Agachamento Smith | `panturrilha-smith-machine` | `Smith Machine Standing Calf Raise` |
| 267 | Dorsiflexão Tibial Anterior com Halter | `tibial-anterior-halter` | `Dumbbell Tibialis Raise` |
| 269 | Cadeira Adutora com Isometria no Final | `cadeira-adutora-isometria` | `Seated Hip Adduction` |
| 270 | Adução de Quadril na Polia Baixa em Pé | `aducao-quadril-polia-baixa` | `Standing Cable Hip Adduction` |
| 271 | Prancha Copenhagen | `prancha-copenhagen-adutores` | `Copenhagen Plank` |
| 272 | Agachamento Sumô no Step com Déficit | `agachamento-sumo-step-deficit` | `Deficit Sumo Squat` |

### Abdômen & Core (16 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 96 | Roda Abdominal (Ab Wheel) | `roda-abdominal-ab-wheel` | `Ab Wheel Rollout` |
| 97 | Abdominal Russo (Russian Twist) | `abdominal-russo-russian-twist` | `Russian Twist` |
| 274 | Prancha Lateral com Elevação de Perna | `prancha-lateral-elevacao-perna` | `Side Plank Leg Raise` |
| 275 | Prancha Spiderman com Joelho no Cotovelo | `prancha-spiderman-joelho-cotovelo` | `Spiderman Plank` |
| 276 | Prancha com Toque nos Ombros | `prancha-toque-ombros-shoulder-taps` | `Plank Shoulder Taps` |
| 277 | Crunch Bicicleta no Chão (Bicycle Crunch) | `crunch-bicicleta-chao` | `Bicycle Crunch` |
| 279 | Dragon Flag no Banco Reto | `dragon-flag-banco-reto` | `Dragon Flag` |
| 280 | Limpador de Pára-brisa na Barra (Windshield) | `windshield-wipers-barra-fixa` | `Hanging Windshield Wipers` |
| 281 | Toes to Bar na Barra Fixa | `toes-to-bar-barra-fixa` | `Hanging Toes to Bar` |
| 282 | Knee to Elbow na Barra Fixa | `knee-to-elbow-barra-fixa` | `Hanging Knee to Elbow` |
| 283 | Pallof Press na Polia com Isometria | `pallof-press-polia-isometria` | `Cable Pallof Press` |
| 286 | Hollow Body Hold (Canoa Isométrica) | `hollow-body-hold-canoa` | `Hollow Body Hold` |
| 287 | Abdominal Declinado com Anilha no Peito | `abdominal-declinado-anilha-peito` | `Decline Weighted Crunch` |
| 288 | Stomach Vacuum (Vácuo Abdominal) | `stomach-vacuum-vacuo-abdominal` | `Stomach Vacuum` |
| 289 | Deadbug com Controle Respiratório | `deadbug-controle-respiratorio` | `Dead Bug` |
| 290 | Bird-Dog (Perdigueiro com Isometria) | `bird-dog-perdigueiro-isometria` | `Bird Dog` |

### Mobilidade, Alongamento & Funcional (23 exercícios)
| ID | Nome no AB Fitness | Slug | Termo de Pesquisa em Inglês (3D) |
|---|---|---|---|
| 293 | Kettlebell Swing Russo | `kettlebell-swing-russo` | `Kettlebell Swing` |
| 294 | Kettlebell Snatch (Arranque) | `kettlebell-snatch-arranque` | `Kettlebell Snatch` |
| 295 | Kettlebell Clean and Press | `kettlebell-clean-and-press` | `Kettlebell Clean and Press` |
| 296 | Levantamento Turco (Turkish Get-Up) | `turkish-get-up-levantamento-turco` | `Turkish Get-Up` |
| 298 | Salto na Caixa Pliométrica (Box Jump) | `salto-caixa-pliometrica-box-jump` | `Box Jump` |
| 299 | Slam Ball com Bola Medicinal | `slam-ball-bola-medicinal` | `Medicine Ball Slam` |
| 300 | Wall Ball com Medicine Ball | `wall-ball-medicine-ball` | `Wall Ball` |
| 302 | Corda Naval Batida Dupla (Double Slam) | `corda-naval-batida-dupla-slam` | `Battle Ropes Double Wave` |
| 304 | Mountain Climbers no Solo (Escalador) | `mountain-climbers-escalador` | `Mountain Climbers` |
| 305 | Empurrar Trenó de Carga (Sled Push) | `empurrar-treno-sled-push` | `Sled Push` |
| 307 | Remo Seco Ergômetro (Rowing Machine) | `remo-seco-rowing-machine` | `Rowing Machine` |
| 308 | Assault Bike (Air Bike) | `assault-bike-air-bike` | `Air Bike` |
| 310 | Maior Alongamento do Mundo (World's Greatest) | `worlds-greatest-stretch-mobilidade` | `World's Greatest Stretch` |
| 311 | Ativação Escapular na Barra Fixa | `ativacao-escapular-barra-fixa` | `Scapular Pull-Up` |
| 312 | Flexão Escapular no Chão (Scapular Push-Up) | `flexao-escapular-scapular-push-up` | `Scapular Push-Up` |
| 313 | Dislocação de Ombros com Bastão/Elástico | `deslocacao-ombros-bastao-elastico` | `Shoulder Dislocate with Band` |
| 314 | Agachamento Cócoras Isométrico (Deep Squat) | `agachamento-cocoras-deep-squat-hold` | `Deep Squat Hold` |
| 315 | Mobilidade de Quadril 90/90 Dinâmica | `mobilidade-quadril-9090-transicao` | `90/90 Hip Mobility` |
| 316 | Alongamento de Peitoral e Bíceps na Parede | `alongamento-peitoral-biceps-parede` | `Doorway / Wall Chest Stretch` |
| 319 | Rolo de Liberação Miofascial (Foam Roller) | `liberacao-miofascial-quadriceps-foam-roller` | `Foam Roll Quadriceps` |
| 320 | Mobilidade de Tornozelo na Parede | `mobilidade-tornozelo-parede-dorsiflexao` | `Knee to Wall Ankle Mobility` |

---

## 3. Instruções de Integração no Código da AB Fitness

Quando obtiveres os ficheiros `.mp4` correspondentes:

1. **Upload para o Cloudflare R2**:
   - Guarda os ficheiros na pasta do bucket:
     - `exercise-videos/male/<nome-do-ficheiro>.mp4`
     - `exercise-videos/female/<nome-do-ficheiro>.mp4`
     - `exercise-posters/male/<nome-do-ficheiro>.jpg`
   - O endpoint público é `https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev`

2. **Registo em `src/data/exerciseVideos.js`**:
   Adiciona cada novo exercício no objeto `VERIFIED_EXERCISE_VIDEOS` seguindo a estrutura padrão:
   ```javascript
   "levantamento-terra": {
     "canonicalId": "levantamento-terra",
     "name": "Levantamento Terra (Deadlift)",
     "englishName": "Barbell Conventional Deadlift",
     "category": "back",
     "videoMale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/male/barbell-deadlift.mp4",
     "videoFemale": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-videos/female/barbell-deadlift.mp4",
     "poster": "https://pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev/exercise-posters/male/barbell-deadlift.jpg",
     "targetMuscles": ["Costas", "Posteriores", "Glúteos"],
     "equipment": "barbell",
     "keyCues": [
       "Barra colada às canelas",
       "Coluna neutra e peito aberto",
       "Empurrar o chão com os calcanhares"
     ],
     "aliases": ["24", "levantamento-terra", "Levantamento Terra (Deadlift)"]
   }
   ```

3. **Recompilação e Validação**:
   - Executa `node scripts/rebuild_video_library.mjs`
   - Executa `node scripts/build_exercise_catalog.mjs`
   - Corre os testes: `npm test` (devem passar todos os testes)
   - Valida o build: `npm run build`

