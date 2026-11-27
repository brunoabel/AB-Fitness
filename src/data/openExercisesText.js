/**
 * Textos da ficha técnica do lote de 133 exercícios (src/data/openExercisesBatch.js), escritos pelo AB Fitness.
 * Ficam num ficheiro à parte porque só a ficha técnica (exerciseBiomechanics) os usa.
 * Campos: alvo, equip (texto do equipamento), pos (posição inicial), con (fase concêntrica), exc (fase excêntrica),
 * passos, erro (erro comum), ben (benefício) e resp (respiração, opcional; por omissão vem do tipo).
 */
import { OPEN_EXERCISES_BATCH, FIRST_ID } from './openExercisesBatch.js';

const RESPIRACAO = {
  forca: 'Expire na fase de esforço e inspire no regresso controlado, sem prender o ar.',
  isometria: 'Respire de forma curta e contínua mantendo o abdômen firme; não prenda o ar.',
  carga: 'Respire de forma curta e contínua com o tronco firme durante todo o percurso.',
  pliometria: 'Expire no impulso e inspire na aterragem, com ritmo constante.',
  cardio: 'Mantenha uma respiração ritmada pelo nariz e pela boca; não prenda o ar.',
  alongamento: 'Respire fundo e devagar; a cada expiração deixe o músculo ceder um pouco mais.',
  mobilidade: 'Respire de forma lenta e acompanhe o movimento com a respiração.'
};

export const OPEN_EXERCISES_TEXT = {
  // ── Casa sem material ──
  'agachamento-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura dos ombros com as pontas ligeiramente para fora, braços estendidos à frente.',
    con: 'Empurre o chão com o pé inteiro e suba até estender joelhos e quadril.',
    exc: 'Desça levando o quadril para trás e para baixo até as coxas ficarem pelo menos paralelas ao chão.',
    passos: ['Pés à largura dos ombros e peso distribuído pelo pé inteiro.', 'Leve o quadril para trás e dobre os joelhos ao mesmo tempo.', 'Desça até as coxas ficarem paralelas ao chão, com o peito aberto.', 'Empurre o chão e suba até ficar de pé.'],
    erro: 'Deixar os joelhos caírem para dentro ou levantar os calcanhares na descida.',
    ben: 'Base de qualquer treino em casa: ensina o padrão do agachamento e fortalece pernas e glúteos sem material.'
  },
  'afundo-frente-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril e mãos na cintura.',
    con: 'Empurre o chão com o pé da frente e regresse à posição inicial.',
    exc: 'Dê um passo largo à frente e desça até os dois joelhos ficarem perto de 90 graus.',
    passos: ['Fique em pé com o tronco direito.', 'Dê um passo largo à frente.', 'Desça até o joelho de trás quase tocar no chão.', 'Empurre com o pé da frente e volte; alterne as pernas.'],
    erro: 'Dar um passo curto, que empurra o joelho da frente muito além da ponta do pé.',
    ben: 'Força unilateral de pernas e glúteos e equilíbrio, sem precisar de material.'
  },
  'afundo-reverso-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril e mãos juntas à frente do peito.',
    con: 'Empurre o chão com o pé da frente e traga a perna de trás de volta.',
    exc: 'Dê um passo largo para trás e desça até o joelho de trás quase tocar no chão.',
    passos: ['Fique em pé com o peso no pé da frente.', 'Dê um passo largo para trás.', 'Desça na vertical até os joelhos ficarem perto de 90 graus.', 'Empurre com o pé da frente e regresse; alterne as pernas.'],
    erro: 'Inclinar o tronco para a frente e apoiar o peso na perna de trás.',
    ben: 'Versão do afundo mais amiga dos joelhos, boa para iniciantes e para quem tem desconforto na rótula.'
  },
  'passada-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, com espaço livre à frente e mãos na cintura.',
    con: 'Empurre com a perna da frente e leve a perna de trás para o passo seguinte.',
    exc: 'Dê um passo à frente e desça até o joelho de trás quase tocar no chão.',
    passos: ['Dê um passo largo à frente.', 'Desça até os dois joelhos ficarem perto de 90 graus.', 'Empurre com a perna da frente e avance com a outra.', 'Continue a caminhar alternando as pernas.'],
    erro: 'Encurtar os passos e perder o equilíbrio para os lados.',
    ben: 'Trabalha pernas, glúteos e coordenação num movimento contínuo, ideal para treino em casa ou no parque.'
  },
  'split-squat-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em posição de passada, um pé à frente e outro atrás, com o calcanhar de trás levantado.',
    con: 'Empurre o chão com o pé da frente e suba sem mexer os pés.',
    exc: 'Desça na vertical até o joelho de trás quase tocar no chão.',
    passos: ['Afaste os pés em posição de passada.', 'Mantenha o tronco direito e o peso no pé da frente.', 'Desça na vertical até os joelhos ficarem perto de 90 graus.', 'Suba sem mexer os pés; troque de perna no fim da série.'],
    erro: 'Deixar o joelho da frente fugir para dentro na subida.',
    ben: 'Progressão segura antes do agachamento búlgaro, com foco em quadríceps e equilíbrio.'
  },
  'afundo-lateral-peso-corporal': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés juntos e mãos unidas à frente do peito.',
    con: 'Empurre o chão com o pé da perna dobrada e regresse ao centro.',
    exc: 'Dê um passo largo para o lado e dobre esse joelho, mantendo a outra perna esticada.',
    passos: ['Dê um passo largo para o lado.', 'Leve o quadril para trás e dobre o joelho desse lado.', 'Mantenha a outra perna esticada e o pé no chão.', 'Empurre e volte ao centro; alterne os lados.'],
    erro: 'Dobrar os dois joelhos e transformar o movimento num agachamento torto.',
    ben: 'Trabalha as pernas no plano lateral e alonga os adutores de forma ativa.'
  },
  'afundo-cruzado-curtsy': {
    alvo: 'Glúteo Médio',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril e mãos unidas à frente do peito.',
    con: 'Empurre com o pé da frente e traga a perna de trás de volta ao lugar.',
    exc: 'Leve uma perna para trás e na diagonal, cruzando por trás da outra, e desça.',
    passos: ['Fique em pé com o peso numa perna.', 'Cruze a outra perna para trás, na diagonal.', 'Desça até o joelho de trás se aproximar do chão.', 'Suba e regresse; alterne os lados.'],
    erro: 'Rodar o quadril para o lado da perna que cruza.',
    ben: 'Dá ênfase ao glúteo médio, importante para a estabilidade do joelho e do quadril.'
  },
  'agachamento-com-salto': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura dos ombros e braços ao lado do corpo.',
    con: 'Estenda pernas e quadril de forma explosiva e salte o mais alto possível.',
    exc: 'Aterre com os joelhos fletidos e desça de imediato para o próximo agachamento.',
    passos: ['Desça para um agachamento até meio.', 'Salte de forma explosiva levando os braços para cima.', 'Aterre suave na ponta dos pés e passe ao pé inteiro.', 'Absorva o impacto e repita.'],
    erro: 'Aterrar com as pernas esticadas e os joelhos a cair para dentro.',
    ben: 'Desenvolve potência de pernas sem material e eleva a frequência cardíaca.'
  },
  'flexao-joelhos-apoiados': {
    alvo: 'Peitoral Maior',
    equip: 'Peso corporal',
    pos: 'De joelhos, mãos no chão um pouco mais abertas que os ombros e corpo alinhado dos joelhos à cabeça.',
    con: 'Empurre o chão até estender os braços.',
    exc: 'Desça o peito em direção ao chão com os cotovelos a cerca de 45 graus do tronco.',
    passos: ['Apoie joelhos e mãos no chão.', 'Alinhe joelhos, quadril e ombros numa linha.', 'Desça o peito até perto do chão.', 'Empurre até estender os braços.'],
    erro: 'Deixar o quadril para trás, o que transforma a flexão num movimento só de ombros.',
    ben: 'Regressão da flexão para quem ainda não faz a versão completa; permite volume com boa técnica.'
  },
  'flexao-na-parede': {
    alvo: 'Peitoral Maior',
    equip: 'Parede',
    pos: 'De frente para a parede, a um passo de distância, mãos apoiadas à altura do peito.',
    con: 'Empurre a parede até estender os braços.',
    exc: 'Dobre os cotovelos e aproxime o peito da parede.',
    passos: ['Apoie as mãos na parede à altura do peito.', 'Afaste os pés para o corpo ficar inclinado.', 'Aproxime o peito da parede dobrando os cotovelos.', 'Empurre até estender os braços.'],
    erro: 'Ficar perto demais da parede e quase não mover os cotovelos.',
    ben: 'Primeiro degrau da flexão, útil para iniciantes, reabilitação e pessoas mais velhas.'
  },
  'flexao-pike-ombros': {
    alvo: 'Deltoide Anterior',
    equip: 'Peso corporal',
    pos: 'Em V invertido, mãos e pés no chão, quadril alto e cabeça entre os braços.',
    con: 'Empurre o chão até estender os braços, mantendo o quadril alto.',
    exc: 'Dobre os cotovelos e leve a cabeça em direção ao chão, à frente das mãos.',
    passos: ['Faça um V invertido com o quadril alto.', 'Aproxime os pés das mãos o quanto conseguir.', 'Desça a cabeça em direção ao chão.', 'Empurre até estender os braços.'],
    erro: 'Baixar o quadril e transformar o movimento numa flexão normal.',
    ben: 'O exercício de ombros mais eficaz sem material e o caminho para a flexão em pino.'
  },
  'flexao-arqueiro': {
    alvo: 'Peitoral Maior',
    equip: 'Peso corporal',
    pos: 'Em prancha alta com as mãos bem afastadas, mais do dobro da largura dos ombros.',
    con: 'Empurre com o braço dobrado até voltar ao centro.',
    exc: 'Desça o corpo para um lado, dobrando esse braço e mantendo o outro esticado.',
    passos: ['Afaste muito as mãos em prancha alta.', 'Desça o peito na direção de uma das mãos.', 'Mantenha o outro braço esticado como apoio.', 'Empurre de volta e alterne os lados.'],
    erro: 'Rodar o tronco e deixar o quadril cair.',
    ben: 'Progressão avançada de peito sem material, a meio caminho da flexão com um braço.'
  },
  'flexao-spiderman': {
    alvo: 'Peitoral Maior',
    equip: 'Peso corporal',
    pos: 'Em prancha alta, mãos um pouco mais abertas que os ombros.',
    con: 'Empurre o chão e devolva a perna à posição inicial.',
    exc: 'Ao descer, leve um joelho por fora em direção ao cotovelo do mesmo lado.',
    passos: ['Fique em prancha alta.', 'Desça o peito e leve um joelho ao cotovelo do mesmo lado.', 'Empurre e regresse à prancha.', 'Alterne a perna em cada repetição.'],
    erro: 'Levantar o quadril para conseguir trazer o joelho.',
    ben: 'Junta trabalho de peito com core e mobilidade de quadril numa só repetição.'
  },
  'mergulho-triceps-chao': {
    alvo: 'Tríceps Braquial',
    equip: 'Peso corporal',
    pos: 'Sentado no chão, joelhos fletidos, mãos atrás do quadril com os dedos para a frente.',
    con: 'Empurre o chão até estender os cotovelos e levantar o quadril.',
    exc: 'Dobre os cotovelos e desça o quadril até quase tocar no chão.',
    passos: ['Sente-se com as mãos atrás do quadril.', 'Levante o quadril apoiando nas mãos e nos pés.', 'Dobre os cotovelos e desça.', 'Empurre até estender os braços.'],
    erro: 'Abrir os cotovelos para os lados, o que sobrecarrega os ombros.',
    ben: 'Trabalho de tríceps sem banco nem cadeira, em qualquer lugar.'
  },
  'super-homem-lombar': {
    alvo: 'Eretores da Espinha',
    equip: 'Colchonete',
    pos: 'Deitado de barriga para baixo, braços estendidos à frente e pernas esticadas.',
    con: 'Levante ao mesmo tempo braços, peito e pernas do chão.',
    exc: 'Desça devagar até apoiar de novo braços e pernas.',
    passos: ['Deite-se de barriga para baixo com os braços à frente.', 'Contraia glúteos e costas.', 'Levante braços, peito e pernas ao mesmo tempo.', 'Segure um segundo e desça devagar.'],
    erro: 'Atirar a cabeça para trás e forçar a lombar com impulso.',
    ben: 'Fortalece a lombar e a cadeia posterior sem material, útil para a postura.'
  },
  'elevacoes-ytw-deitado': {
    alvo: 'Deltoide Posterior',
    equip: 'Colchonete',
    pos: 'Deitado de barriga para baixo, testa apoiada e braços ao lado da cabeça.',
    con: 'Levante os braços do chão formando um Y, depois um T e depois um W.',
    exc: 'Desça os braços devagar entre cada letra.',
    passos: ['Deite-se de barriga para baixo.', 'Levante os braços em Y, com os polegares para cima.', 'Desça e levante em T, braços abertos.', 'Desça e levante em W, cotovelos dobrados junto ao tronco.'],
    erro: 'Levantar o tronco para ganhar altura em vez de mover os braços.',
    ben: 'Reforça a parte de cima das costas e os rotadores do ombro, contra a postura curvada.'
  },
  'ponte-gluteos-solo': {
    alvo: 'Glúteo Máximo',
    equip: 'Colchonete',
    pos: 'Deitado de costas, joelhos fletidos, pés no chão à largura do quadril e braços ao lado do corpo.',
    con: 'Empurre pelos calcanhares e levante o quadril até alinhar joelhos, quadril e ombros.',
    exc: 'Desça o quadril devagar até quase tocar no chão.',
    passos: ['Deite-se de costas com os joelhos fletidos.', 'Apoie os pés perto do quadril.', 'Empurre pelos calcanhares e suba o quadril.', 'Aperte os glúteos no topo e desça devagar.'],
    erro: 'Subir demais arqueando a lombar em vez de estender o quadril.',
    ben: 'Ativa o glúteo sem carga e é a porta de entrada para o hip thrust.'
  },
  'ponte-gluteos-marcha': {
    alvo: 'Glúteo Máximo',
    equip: 'Colchonete',
    pos: 'Em ponte de glúteos, quadril levantado e joelhos fletidos.',
    con: 'Levante um pé do chão trazendo o joelho em direção ao peito.',
    exc: 'Pouse o pé e repita com a outra perna, sem deixar o quadril cair.',
    passos: ['Suba para a ponte de glúteos.', 'Levante um pé trazendo o joelho ao peito.', 'Pouse o pé e troque de perna.', 'Mantenha o quadril alto e nivelado.'],
    erro: 'Deixar o quadril descair para o lado da perna que sobe.',
    ben: 'Junta força de glúteo e estabilidade da bacia, muito útil para corredores.'
  },
  'hidrante-quatro-apoios': {
    alvo: 'Glúteo Médio',
    equip: 'Colchonete',
    pos: 'Em 4 apoios, mãos sob os ombros e joelhos sob o quadril.',
    con: 'Levante um joelho para o lado, mantendo-o dobrado, até à altura do quadril.',
    exc: 'Desça o joelho devagar sem o pousar.',
    passos: ['Fique em 4 apoios com as costas direitas.', 'Levante um joelho para o lado, dobrado a 90 graus.', 'Suba até à altura do quadril.', 'Desça devagar e repita; troque de lado.'],
    erro: 'Inclinar o tronco para o lado oposto para subir mais a perna.',
    ben: 'Isola o glúteo médio sem material, bom para a estabilidade do joelho.'
  },
  'abducao-quadril-deitado-lado': {
    alvo: 'Glúteo Médio',
    equip: 'Colchonete',
    pos: 'Deitado de lado, pernas esticadas e alinhadas com o tronco, cabeça apoiada no braço.',
    con: 'Levante a perna de cima esticada até cerca de 45 graus.',
    exc: 'Desça a perna devagar sem a pousar na outra.',
    passos: ['Deite-se de lado com as pernas esticadas.', 'Rode ligeiramente o pé de cima para baixo.', 'Levante a perna de cima até cerca de 45 graus.', 'Desça devagar; troque de lado no fim da série.'],
    erro: 'Levar a perna para a frente, o que passa o trabalho para os flexores do quadril.',
    ben: 'Clássico de reabilitação e prevenção de lesões de joelho e anca.'
  },
  'flexora-deslizante-chao': {
    alvo: 'Isquiotibiais',
    equip: 'Toalha ou discos deslizantes',
    pos: 'Deitado de costas, calcanhares sobre uma toalha ou discos deslizantes e quadril levantado.',
    con: 'Puxe os calcanhares em direção ao glúteo, mantendo o quadril alto.',
    exc: 'Deslize os pés para a frente devagar até esticar as pernas.',
    passos: ['Apoie os calcanhares numa toalha num chão liso.', 'Levante o quadril como numa ponte.', 'Puxe os calcanhares até ao glúteo.', 'Estique as pernas devagar sem deixar o quadril cair.'],
    erro: 'Deixar o quadril cair na fase de esticar as pernas.',
    ben: 'A melhor forma de treinar os posteriores em casa sem máquina nem bola.'
  },
  'stiff-unilateral-peso-corporal': {
    alvo: 'Isquiotibiais',
    equip: 'Peso corporal',
    pos: 'Em pé sobre uma perna, joelho de apoio ligeiramente fletido.',
    con: 'Contraia glúteo e posteriores e regresse à posição vertical.',
    exc: 'Incline o tronco à frente enquanto a perna livre sobe para trás, até o corpo ficar quase paralelo ao chão.',
    passos: ['Fique em pé numa perna.', 'Incline o tronco levando a outra perna para trás.', 'Desça até sentir os posteriores esticarem.', 'Suba apertando o glúteo; troque de perna.'],
    erro: 'Rodar o quadril para fora e curvar as costas.',
    ben: 'Treina equilíbrio e cadeia posterior ao mesmo tempo, sem carga.'
  },
  'nordico-reverso': {
    alvo: 'Reto Femoral',
    equip: 'Colchonete',
    pos: 'De joelhos, tronco direito e braços cruzados no peito.',
    con: 'Contraia os quadríceps e regresse à posição vertical.',
    exc: 'Incline o tronco para trás como uma peça única, até onde controlar.',
    passos: ['Ajoelhe-se com o tronco direito.', 'Incline o corpo para trás sem dobrar o quadril.', 'Desça até onde conseguir controlar.', 'Volte à vertical com os quadríceps.'],
    erro: 'Dobrar o quadril e sentar nos calcanhares, o que tira o trabalho dos quadríceps.',
    ben: 'Fortalece o quadríceps em alongamento, útil para prevenir lesões de joelho em desportos de corrida.'
  },
  'abdominal-sit-up': {
    alvo: 'Reto Abdominal',
    equip: 'Colchonete',
    pos: 'Deitado de costas, joelhos fletidos, pés no chão e braços cruzados no peito.',
    con: 'Enrole o tronco e suba até ficar sentado.',
    exc: 'Desça devagar, vértebra a vértebra, até as costas tocarem no chão.',
    passos: ['Deite-se com os joelhos fletidos.', 'Cruze os braços no peito.', 'Enrole o tronco até ficar sentado.', 'Desça devagar até ao chão.'],
    erro: 'Puxar o pescoço com as mãos ou atirar o tronco com impulso.',
    ben: 'Abdominal clássico de amplitude completa, também usado em testes de aptidão física.'
  },
  'abdominal-obliquo-solo': {
    alvo: 'Oblíquos',
    equip: 'Colchonete',
    pos: 'Deitado de costas, joelhos fletidos e mãos atrás da cabeça.',
    con: 'Levante o tronco rodando o ombro em direção ao joelho oposto.',
    exc: 'Volte devagar à posição inicial.',
    passos: ['Deite-se com os joelhos fletidos.', 'Coloque as mãos atrás da cabeça sem puxar.', 'Suba rodando um ombro ao joelho oposto.', 'Desça devagar e alterne os lados.'],
    erro: 'Mexer só o cotovelo em vez de rodar o tronco.',
    ben: 'Trabalha os oblíquos sem material, complementando o abdominal clássico.'
  },
  'pernada-alternada-flutter-kick': {
    alvo: 'Reto Abdominal',
    equip: 'Colchonete',
    pos: 'Deitado de costas, pernas esticadas e levantadas uns centímetros do chão, mãos ao lado do corpo.',
    con: 'Alterne as pernas para cima e para baixo em movimentos curtos e rápidos.',
    exc: 'Mantenha as pernas no ar sem tocar no chão durante toda a série.',
    passos: ['Deite-se com as pernas esticadas.', 'Cole a lombar ao chão.', 'Levante as pernas um pouco do chão.', 'Alterne as pernas em movimentos curtos.'],
    erro: 'Deixar a lombar arquear, o que passa a tensão para as costas.',
    ben: 'Resistência do abdómen inferior e do core, usada em treino militar e de natação.'
  },
  'prancha-sobe-desce': {
    alvo: 'Reto Abdominal',
    equip: 'Peso corporal',
    pos: 'Em prancha sobre os antebraços, corpo alinhado.',
    con: 'Passe para prancha alta apoiando uma mão e depois a outra.',
    exc: 'Volte aos antebraços, um braço de cada vez.',
    passos: ['Comece em prancha nos antebraços.', 'Apoie uma mão e depois a outra até à prancha alta.', 'Desça um antebraço e depois o outro.', 'Alterne o braço que começa.'],
    erro: 'Balançar o quadril de um lado para o outro em cada troca.',
    ben: 'Junta estabilidade de core com força de tríceps e ombros.'
  },
  'caminhada-do-urso': {
    alvo: 'Core',
    equip: 'Peso corporal',
    pos: 'Em 4 apoios com os joelhos levantados uns centímetros do chão.',
    con: 'Avance a mão e o pé opostos ao mesmo tempo.',
    exc: 'Mantenha os joelhos baixos e as costas direitas a cada passo.',
    passos: ['Fique em 4 apoios e levante os joelhos.', 'Avance a mão direita e o pé esquerdo.', 'Avance a mão esquerda e o pé direito.', 'Continue com passos curtos.'],
    erro: 'Levantar muito o quadril e andar em V.',
    ben: 'Condicionamento e força do core, com coordenação de braços e pernas.'
  },
  'prancha-invertida': {
    alvo: 'Glúteo Máximo',
    equip: 'Peso corporal',
    pos: 'Sentado com as pernas esticadas e as mãos no chão atrás do quadril.',
    con: 'Levante o quadril até o corpo formar uma linha reta dos calcanhares aos ombros.',
    exc: 'Mantenha a posição e desça devagar no fim.',
    passos: ['Sente-se com as pernas esticadas.', 'Apoie as mãos atrás do quadril.', 'Levante o quadril até o corpo ficar reto.', 'Mantenha a posição a respirar.'],
    erro: 'Deixar o quadril descair a meio da série.',
    ben: 'Trabalha toda a cadeia posterior e abre o peito e os ombros.'
  },
  'elevacao-tibial-parede': {
    alvo: 'Tibial Anterior',
    equip: 'Parede',
    pos: 'Costas apoiadas na parede, pés à frente a cerca de um passo de distância.',
    con: 'Levante as pontas dos pés o mais alto possível, mantendo os calcanhares no chão.',
    exc: 'Desça as pontas dos pés devagar até quase tocarem no chão.',
    passos: ['Encoste as costas na parede.', 'Afaste os pés para a frente.', 'Levante as pontas dos pés.', 'Desça devagar e repita.'],
    erro: 'Fazer o movimento rápido e curto, sem amplitude.',
    ben: 'Fortalece a canela, previne canelites em corredores e protege joelho e tornozelo.'
  },

  // ── Cardio e pliometria ──
  'polichinelo': {
    alvo: 'Cardiorrespiratório',
    equip: 'Peso corporal',
    pos: 'Em pé, pés juntos e braços ao lado do corpo.',
    con: 'Salte abrindo as pernas e levando os braços acima da cabeça.',
    exc: 'Salte de volta juntando as pernas e baixando os braços.',
    passos: ['Fique em pé com os pés juntos.', 'Salte abrindo pernas e braços.', 'Salte de volta à posição inicial.', 'Mantenha um ritmo constante.'],
    erro: 'Aterrar com os calcanhares e as pernas rígidas.',
    ben: 'Aquecimento clássico e base de treinos intervalados em casa.'
  },
  'joelhos-altos-skipping': {
    alvo: 'Flexores do Quadril',
    equip: 'Peso corporal',
    pos: 'Em pé, tronco direito e braços fletidos a 90 graus.',
    con: 'Corra no lugar levando cada joelho à altura do quadril.',
    exc: 'Aterre na ponta do pé e troque logo de perna.',
    passos: ['Fique em pé com o tronco direito.', 'Suba um joelho à altura do quadril.', 'Troque de perna de forma rápida.', 'Acompanhe com os braços como a correr.'],
    erro: 'Inclinar o tronco para trás para levantar os joelhos.',
    ben: 'Eleva a frequência cardíaca e treina a mecânica da corrida.'
  },
  'calcanhar-ao-gluteo': {
    alvo: 'Isquiotibiais',
    equip: 'Peso corporal',
    pos: 'Em pé, tronco direito e braços fletidos.',
    con: 'Corra no lugar levando cada calcanhar em direção ao glúteo.',
    exc: 'Pouse o pé por baixo do quadril e troque de perna.',
    passos: ['Fique em pé com o tronco direito.', 'Leve um calcanhar ao glúteo.', 'Troque de perna de forma rápida.', 'Acompanhe com os braços.'],
    erro: 'Levar os joelhos para a frente, o que tira o foco dos posteriores.',
    ben: 'Aquecimento dinâmico para corrida e treino de pernas.'
  },
  'squat-thrust': {
    alvo: 'Corpo Inteiro',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura dos ombros.',
    con: 'Salte os pés de volta para junto das mãos e levante-se.',
    exc: 'Agache, apoie as mãos no chão e salte os pés para trás até à prancha.',
    passos: ['Agache e apoie as mãos no chão.', 'Salte os pés para trás até à prancha.', 'Salte os pés de volta para as mãos.', 'Levante-se e repita.'],
    erro: 'Deixar o quadril cair quando os pés vão para trás.',
    ben: 'Regressão do burpee sem flexão nem salto, boa para iniciantes em treinos intervalados.'
  },
  'salto-do-patinador': {
    alvo: 'Glúteo Médio',
    equip: 'Peso corporal',
    pos: 'Em pé sobre uma perna, joelho ligeiramente fletido.',
    con: 'Salte para o lado e aterre na outra perna.',
    exc: 'Absorva a aterragem com o joelho fletido e a perna livre cruzada atrás.',
    passos: ['Fique numa perna com o joelho fletido.', 'Salte para o lado.', 'Aterre na outra perna, controlando o joelho.', 'Repita de um lado para o outro.'],
    erro: 'Aterrar com o joelho a cair para dentro.',
    ben: 'Potência lateral e estabilidade do joelho, úteis em desportos com mudanças de direção.'
  },
  'salto-grupado': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril.',
    con: 'Salte e traga os joelhos em direção ao peito.',
    exc: 'Estenda as pernas antes de aterrar e absorva com os joelhos fletidos.',
    passos: ['Faça um pequeno agachamento.', 'Salte de forma explosiva.', 'Traga os joelhos ao peito no ar.', 'Aterre suave e repita.'],
    erro: 'Aterrar com as pernas rígidas.',
    ben: 'Pliometria intensa para potência e condicionamento.'
  },
  'salto-comprimento-parado': {
    alvo: 'Glúteo Máximo',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril e braços levantados.',
    con: 'Balance os braços e salte o mais longe possível para a frente.',
    exc: 'Aterre com os dois pés e os joelhos fletidos, estável.',
    passos: ['Balance os braços para trás e agache.', 'Salte para a frente estendendo quadril e joelhos.', 'Aterre com os dois pés ao mesmo tempo.', 'Estabilize antes do próximo salto.'],
    erro: 'Aterrar desequilibrado e cair para a frente.',
    ben: 'Mede e desenvolve a potência horizontal, importante para sprint e desportos de equipa.'
  },
  'deslocamento-lateral': {
    alvo: 'Glúteo Médio',
    equip: 'Peso corporal',
    pos: 'Em meio agachamento, pés afastados e peso na ponta dos pés.',
    con: 'Desloque-se para o lado com passos rápidos, sem cruzar os pés.',
    exc: 'Mantenha a posição baixa ao mudar de direção.',
    passos: ['Fique em meio agachamento.', 'Dê passos rápidos para o lado.', 'Não cruze os pés.', 'Mude de direção e repita.'],
    erro: 'Endireitar o corpo e perder a posição atlética.',
    ben: 'Agilidade e deslocamento lateral para futebol, ténis e outros desportos.'
  },
  'afundo-com-salto': {
    alvo: 'Quadríceps',
    equip: 'Peso corporal',
    pos: 'Em posição de afundo, uma perna à frente e outra atrás.',
    con: 'Salte e troque as pernas no ar.',
    exc: 'Aterre em afundo com a outra perna à frente e desça controlado.',
    passos: ['Comece em afundo.', 'Salte de forma explosiva.', 'Troque as pernas no ar.', 'Aterre em afundo e repita.'],
    erro: 'Bater com o joelho de trás no chão na aterragem.',
    ben: 'Potência unilateral de pernas e muito trabalho cardiovascular.'
  },
  'boxe-de-sombra': {
    alvo: 'Cardiorrespiratório',
    equip: 'Peso corporal',
    pos: 'Em guarda, pés afastados, um à frente, mãos junto ao queixo.',
    con: 'Lance socos rápidos alternados rodando o tronco.',
    exc: 'Recolha cada soco de volta à guarda.',
    passos: ['Fique em guarda com as mãos junto ao rosto.', 'Lance um soco direto rodando o tronco.', 'Recolha à guarda.', 'Alterne socos e mexa os pés.'],
    erro: 'Estender o cotovelo por completo com força, sem controlo.',
    ben: 'Cardio de baixo impacto para os joelhos, com trabalho de ombros e core.'
  },
  'skip-a-corrida': {
    alvo: 'Flexores do Quadril',
    equip: 'Peso corporal',
    pos: 'Em pé, tronco alto e braços fletidos.',
    con: 'Suba um joelho à altura do quadril enquanto a outra perna faz um pequeno salto.',
    exc: 'Desça o pé com força por baixo do quadril e troque de perna.',
    passos: ['Fique em pé com o tronco alto.', 'Suba um joelho com o pé em dorsiflexão.', 'Pouse o pé por baixo do quadril.', 'Alterne em ritmo, avançando devagar.'],
    erro: 'Pousar o pé à frente do corpo, a travar o movimento.',
    ben: 'Drill técnico de corrida que melhora a passada e a reatividade do pé.'
  },
  'saltos-pogo': {
    alvo: 'Gastrocnêmio',
    equip: 'Peso corporal',
    pos: 'Em pé, pés juntos e joelhos quase esticados.',
    con: 'Salte usando sobretudo os tornozelos, com contactos curtos no chão.',
    exc: 'Aterre na ponta dos pés e ressalte de imediato.',
    passos: ['Fique em pé com os pés juntos.', 'Salte pequeno usando os tornozelos.', 'Aterre na ponta dos pés.', 'Ressalte logo, como uma mola.'],
    erro: 'Dobrar muito os joelhos e transformar em agachamento com salto.',
    ben: 'Aumenta a rigidez elástica do tornozelo, o que melhora a economia de corrida.'
  },
  'salto-em-profundidade': {
    alvo: 'Quadríceps',
    equip: 'Caixa ou degrau',
    pos: 'Em pé em cima de uma caixa baixa.',
    con: 'Assim que tocar no chão, salte o mais alto possível.',
    exc: 'Deixe-se cair da caixa e aterre com os dois pés.',
    passos: ['Suba para uma caixa baixa.', 'Dê um passo para fora e deixe-se cair.', 'Aterre com os dois pés.', 'Salte de imediato o mais alto possível.'],
    erro: 'Usar uma caixa alta demais e ficar muito tempo no chão.',
    ben: 'Pliometria avançada para atletas: treina a reatividade e a força explosiva.'
  },
  'passe-peito-bola-medicinal': {
    alvo: 'Peitoral Maior',
    equip: 'Bola medicinal',
    pos: 'Em pé de frente para uma parede, bola junto ao peito.',
    con: 'Empurre a bola com força contra a parede, estendendo os braços.',
    exc: 'Apanhe a bola com os braços a ceder e traga-a ao peito.',
    passos: ['Segure a bola junto ao peito.', 'Dê um passo à frente.', 'Lance a bola contra a parede com força.', 'Apanhe e repita de imediato.'],
    erro: 'Lançar só com os braços, sem passo nem tronco.',
    ben: 'Potência de membros superiores para desportos de contacto e de lançamento.'
  },
  'lancamento-rotacional-bola-medicinal': {
    alvo: 'Oblíquos',
    equip: 'Bola medicinal',
    pos: 'De lado para a parede, bola segura à altura da anca do lado de fora.',
    con: 'Rode o quadril e o tronco e lance a bola contra a parede.',
    exc: 'Apanhe a bola e leve-a de novo ao lado de fora.',
    passos: ['Fique de lado para a parede.', 'Leve a bola para o lado de fora da anca.', 'Rode quadril e tronco e lance.', 'Apanhe e repita; troque de lado.'],
    erro: 'Rodar só os braços, sem usar as pernas e o quadril.',
    ben: 'Potência rotacional para futebol, ténis, golfe e desportos de combate.'
  },

  // ── Mobilidade e alongamento ──
  'alongamento-do-sofa': {
    alvo: 'Flexores do Quadril',
    equip: 'Parede ou sofá',
    pos: 'Ajoelhado de costas para a parede, peito do pé de trás apoiado na parede e o outro pé à frente.',
    con: 'Contraia o glúteo da perna de trás e leve o quadril para a frente.',
    exc: 'Mantenha a posição respirando fundo.',
    passos: ['Ajoelhe-se de costas para a parede.', 'Apoie o peito do pé de trás na parede.', 'Coloque o outro pé à frente.', 'Aperte o glúteo e leve o quadril à frente.'],
    erro: 'Arquear a lombar para compensar a falta de mobilidade.',
    ben: 'Alonga flexores do quadril e quadríceps, encurtados por passar muitas horas sentado.'
  },
  'postura-do-pombo': {
    alvo: 'Glúteo Máximo',
    equip: 'Colchonete',
    pos: 'Em 4 apoios, leve um joelho à frente para trás do punho, com a canela dobrada no chão.',
    con: 'Estique a outra perna para trás e baixe o quadril em direção ao chão.',
    exc: 'Mantenha a posição e incline o tronco à frente se quiser mais intensidade.',
    passos: ['Comece em 4 apoios.', 'Leve um joelho à frente e pouse a canela no chão.', 'Estique a outra perna para trás.', 'Baixe o quadril e mantenha.'],
    erro: 'Rodar o quadril para o lado e perder o alongamento do glúteo.',
    ben: 'Alivia o glúteo e os rotadores do quadril, úteis contra dor lombar e ciática.'
  },
  'cao-olhando-para-baixo': {
    alvo: 'Isquiotibiais',
    equip: 'Colchonete',
    pos: 'Em 4 apoios, mãos à largura dos ombros e pés à largura do quadril.',
    con: 'Levante o quadril para cima e para trás formando um V invertido.',
    exc: 'Mantenha a posição empurrando os calcanhares para o chão.',
    passos: ['Comece em 4 apoios.', 'Levante o quadril para cima e para trás.', 'Estique braços e pernas o quanto conseguir.', 'Empurre os calcanhares para o chão.'],
    erro: 'Curvar as costas para conseguir esticar as pernas.',
    ben: 'Alonga posteriores, gémeos e ombros ao mesmo tempo.'
  },
  'alongamento-isquiotibiais-sentado': {
    alvo: 'Isquiotibiais',
    equip: 'Colchonete',
    pos: 'Sentado no chão, pernas esticadas à frente.',
    con: 'Incline o tronco à frente a partir do quadril, levando as mãos aos pés.',
    exc: 'Mantenha a posição respirando fundo.',
    passos: ['Sente-se com as pernas esticadas.', 'Endireite as costas.', 'Incline à frente a partir do quadril.', 'Mantenha e respire.'],
    erro: 'Curvar a coluna para chegar aos pés.',
    ben: 'Alongamento simples de posteriores, sem fita nem material.'
  },
  'alongamento-quadriceps-em-pe': {
    alvo: 'Quadríceps',
    equip: 'Apoio para equilíbrio',
    pos: 'Em pé, uma mão apoiada numa parede ou cadeira.',
    con: 'Segure o pé de trás e leve o calcanhar ao glúteo.',
    exc: 'Mantenha a posição com os joelhos juntos.',
    passos: ['Apoie uma mão numa parede.', 'Dobre um joelho e segure o pé.', 'Leve o calcanhar ao glúteo.', 'Mantenha os joelhos juntos e o quadril à frente.'],
    erro: 'Afastar o joelho para o lado e arquear as costas.',
    ben: 'Alongamento rápido de quadríceps para depois de correr ou treinar pernas.'
  },
  'alongamento-do-corredor': {
    alvo: 'Flexores do Quadril',
    equip: 'Peso corporal',
    pos: 'Em afundo baixo, mãos no chão de cada lado do pé da frente.',
    con: 'Baixe o quadril e estique a perna de trás.',
    exc: 'Mantenha a posição respirando fundo.',
    passos: ['Dê um passo largo à frente.', 'Apoie as mãos no chão.', 'Estique a perna de trás.', 'Baixe o quadril e mantenha.'],
    erro: 'Deixar o joelho da frente passar muito à frente do pé.',
    ben: 'Abre quadril e posteriores, ideal no fim de uma corrida.'
  },
  'torcao-coluna-deitado': {
    alvo: 'Oblíquos',
    equip: 'Colchonete',
    pos: 'Deitado de costas, braços abertos em cruz e joelhos fletidos.',
    con: 'Deixe cair os joelhos para um lado, mantendo os ombros no chão.',
    exc: 'Mantenha e depois troque de lado.',
    passos: ['Deite-se de costas com os braços abertos.', 'Dobre os joelhos.', 'Deixe-os cair para um lado.', 'Mantenha os ombros no chão; troque de lado.'],
    erro: 'Levantar o ombro oposto para chegar mais longe.',
    ben: 'Alivia a lombar e melhora a rotação da coluna, bom para fechar o treino.'
  },
  'joelhos-ao-peito': {
    alvo: 'Eretores da Espinha',
    equip: 'Colchonete',
    pos: 'Deitado de costas com as pernas esticadas.',
    con: 'Puxe os dois joelhos em direção ao peito com as mãos.',
    exc: 'Mantenha a posição relaxando a lombar.',
    passos: ['Deite-se de costas.', 'Dobre os joelhos e segure-os.', 'Puxe-os ao peito.', 'Mantenha e relaxe a lombar.'],
    erro: 'Levantar a cabeça e tensionar o pescoço.',
    ben: 'Descomprime a lombar de forma suave, útil depois de agachamentos e levantamentos.'
  },
  'livro-aberto-toracica': {
    alvo: 'Coluna Torácica',
    equip: 'Colchonete',
    pos: 'Deitado de lado, joelhos fletidos à frente e braços esticados juntos à frente do peito.',
    con: 'Abra o braço de cima por cima do corpo até ao outro lado, seguindo-o com o olhar.',
    exc: 'Volte devagar a juntar as mãos.',
    passos: ['Deite-se de lado com os joelhos fletidos.', 'Junte os braços à frente.', 'Abra o braço de cima para o outro lado.', 'Volte devagar e repita; troque de lado.'],
    erro: 'Deixar os joelhos acompanharem a rotação.',
    ben: 'Recupera a rotação da coluna torácica, importante para ombros saudáveis.'
  },
  'passar-a-agulha': {
    alvo: 'Coluna Torácica',
    equip: 'Colchonete',
    pos: 'Em 4 apoios, mãos sob os ombros e joelhos sob o quadril.',
    con: 'Passe um braço por baixo do outro e pouse o ombro no chão.',
    exc: 'Volte e abra o mesmo braço em direção ao teto.',
    passos: ['Comece em 4 apoios.', 'Passe um braço por baixo do corpo.', 'Pouse o ombro e mantenha um instante.', 'Volte e abra o braço para o teto; troque de lado.'],
    erro: 'Sentar para trás e perder a rotação do tronco.',
    ben: 'Solta as costas altas e a parte de trás do ombro.'
  },
  'alongamento-sleeper-ombro': {
    alvo: 'Manguito Rotador',
    equip: 'Colchonete',
    pos: 'Deitado de lado sobre o ombro a alongar, braço de baixo à frente com o cotovelo a 90 graus.',
    con: 'Com a outra mão, empurre o antebraço de baixo em direção ao chão.',
    exc: 'Mantenha a posição sem dor.',
    passos: ['Deite-se de lado sobre o ombro a alongar.', 'Dobre o cotovelo de baixo a 90 graus.', 'Empurre o antebraço para o chão com a outra mão.', 'Mantenha suave e troque de lado.'],
    erro: 'Forçar demais e sentir dor na frente do ombro.',
    ben: 'Melhora a rotação interna do ombro, que costuma faltar em quem treina e em desportos de lançamento.'
  },
  'alongamento-elevador-escapula': {
    alvo: 'Levantador da Escápula',
    equip: 'Cadeira',
    pos: 'Sentado, uma mão a segurar a cadeira e a outra atrás da cabeça.',
    con: 'Leve o nariz em direção à axila do lado oposto com a ajuda da mão.',
    exc: 'Mantenha a posição com o ombro baixo.',
    passos: ['Sente-se direito e segure a cadeira com uma mão.', 'Rode a cabeça para o lado oposto.', 'Baixe o nariz em direção à axila.', 'Puxe de leve com a mão e mantenha.'],
    erro: 'Puxar a cabeça com força.',
    ben: 'Alivia a tensão do pescoço e da zona entre o pescoço e a omoplata.'
  },
  'alongamento-dorsais-deitado-lado': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Cadeira',
    pos: 'Deitado de lado junto a uma cadeira, braço de cima esticado acima da cabeça a segurar a cadeira.',
    con: 'Afaste o quadril da mão para alongar o lado do tronco.',
    exc: 'Mantenha a posição respirando para as costelas.',
    passos: ['Deite-se de lado junto a uma cadeira.', 'Estique o braço de cima e segure a cadeira.', 'Afaste o quadril da mão.', 'Mantenha e respire; troque de lado.'],
    erro: 'Rodar o tronco e perder o alongamento lateral.',
    ben: 'Alonga o grande dorsal, útil para quem faz muitas puxadas e para a mobilidade dos ombros acima da cabeça.'
  },
  'ra-com-balanco': {
    alvo: 'Adutores',
    equip: 'Colchonete',
    pos: 'Em 4 apoios sobre os antebraços, joelhos bem afastados e pés para fora.',
    con: 'Leve o quadril para trás em direção aos calcanhares.',
    exc: 'Volte devagar para a frente.',
    passos: ['Apoie os antebraços no chão.', 'Afaste bem os joelhos.', 'Leve o quadril para trás devagar.', 'Volte à frente e repita.'],
    erro: 'Afastar os joelhos demais e sentir dor na virilha.',
    ben: 'Abre os adutores e o quadril de forma progressiva.'
  },
  'adutores-semiajoelhado-balanco': {
    alvo: 'Adutores',
    equip: 'Colchonete',
    pos: 'Em 4 apoios com uma perna esticada para o lado e o pé apoiado no chão.',
    con: 'Leve o quadril para trás em direção ao calcanhar de apoio.',
    exc: 'Volte devagar para a frente.',
    passos: ['Fique em 4 apoios.', 'Estique uma perna para o lado.', 'Leve o quadril para trás.', 'Volte e repita; troque de lado.'],
    erro: 'Curvar as costas no balanço para trás.',
    ben: 'Mobilidade dinâmica dos adutores, boa para aquecer antes de agachamentos e de desportos.'
  },
  'alongamento-banda-iliotibial': {
    alvo: 'Tensor da Fáscia Lata',
    equip: 'Peso corporal',
    pos: 'Em pé, uma perna cruzada por trás da outra.',
    con: 'Incline o tronco para o lado da perna da frente, levando o braço por cima da cabeça.',
    exc: 'Mantenha e depois troque de lado.',
    passos: ['Cruze uma perna por trás da outra.', 'Levante o braço do lado da perna de trás.', 'Incline o tronco para o lado oposto.', 'Mantenha e troque de lado.'],
    erro: 'Rodar o tronco em vez de inclinar para o lado.',
    ben: 'Alivia a face externa da coxa, zona que costuma ficar tensa em corredores.'
  },
  'alongamento-extensores-punho': {
    alvo: 'Extensores do Punho',
    equip: 'Peso corporal',
    pos: 'Em pé, braço esticado à frente com a palma para baixo.',
    con: 'Com a outra mão, puxe os dedos para baixo e para trás.',
    exc: 'Mantenha a posição sem dor.',
    passos: ['Estique um braço à frente.', 'Vire a palma para baixo.', 'Puxe os dedos para baixo com a outra mão.', 'Mantenha e troque de lado.'],
    erro: 'Dobrar o cotovelo e perder o alongamento.',
    ben: 'Alivia o antebraço depois de puxadas e pega pesada; ajuda contra o cotovelo de tenista.'
  },
  'lagarta-inchworm': {
    alvo: 'Isquiotibiais',
    equip: 'Peso corporal',
    pos: 'Em pé, pés à largura do quadril.',
    con: 'Caminhe com as mãos de volta até aos pés e levante-se.',
    exc: 'Dobre o tronco, apoie as mãos no chão e caminhe com elas até à prancha.',
    passos: ['Dobre o tronco e apoie as mãos no chão.', 'Caminhe com as mãos até à prancha.', 'Caminhe com as mãos de volta aos pés.', 'Levante-se e repita.'],
    erro: 'Deixar o quadril cair na prancha.',
    ben: 'Aquecimento completo: alonga posteriores e ativa ombros e core.'
  },
  'circulos-de-quadril': {
    alvo: 'Articulação do Quadril',
    equip: 'Peso corporal',
    pos: 'Em pé, mãos na cintura e pés à largura do quadril.',
    con: 'Desenhe círculos largos com o quadril.',
    exc: 'Troque de sentido a meio da série.',
    passos: ['Fique em pé com as mãos na cintura.', 'Rode o quadril em círculos largos.', 'Faça metade num sentido.', 'Troque de sentido.'],
    erro: 'Mexer os ombros em vez do quadril.',
    ben: 'Aquecimento articular do quadril antes de treinos de pernas ou corrida.'
  },
  'circulos-de-bracos': {
    alvo: 'Deltoide',
    equip: 'Peso corporal',
    pos: 'Em pé, braços esticados para os lados à altura dos ombros.',
    con: 'Faça círculos com os braços, primeiro pequenos e depois maiores.',
    exc: 'Troque de sentido a meio da série.',
    passos: ['Abra os braços à altura dos ombros.', 'Faça círculos pequenos.', 'Aumente aos poucos o tamanho.', 'Troque de sentido.'],
    erro: 'Encolher os ombros durante os círculos.',
    ben: 'Aquecimento rápido dos ombros antes de treinos de tronco.'
  },
  'deslizamento-na-parede': {
    alvo: 'Manguito Rotador',
    equip: 'Parede',
    pos: 'Costas encostadas à parede, braços em W com cotovelos e mãos na parede.',
    con: 'Deslize os braços para cima até quase esticarem, sem os tirar da parede.',
    exc: 'Volte a descer até à posição em W.',
    passos: ['Encoste as costas à parede.', 'Coloque os braços em W na parede.', 'Deslize os braços para cima.', 'Desça devagar e repita.'],
    erro: 'Arquear a lombar para conseguir subir os braços.',
    ben: 'Melhora a mobilidade dos ombros e o controlo das omoplatas, contra a postura curvada.'
  },
  'rolo-gluteos': {
    alvo: 'Glúteo Máximo',
    equip: 'Rolo de espuma',
    pos: 'Sentado sobre o rolo, um tornozelo cruzado sobre o joelho oposto e mãos no chão atrás.',
    con: 'Role devagar sobre o glúteo da perna cruzada.',
    exc: 'Pare alguns segundos nos pontos mais tensos.',
    passos: ['Sente-se sobre o rolo.', 'Cruze um tornozelo sobre o joelho oposto.', 'Incline-se para o lado da perna cruzada.', 'Role devagar e troque de lado.'],
    erro: 'Rolar depressa e sem controlo.',
    ben: 'Liberta a tensão do glúteo e do piriforme depois de pernas ou corrida.'
  },
  'rolo-posteriores': {
    alvo: 'Isquiotibiais',
    equip: 'Rolo de espuma',
    pos: 'Sentado com o rolo debaixo das coxas e mãos no chão atrás.',
    con: 'Role desde o glúteo até atrás do joelho.',
    exc: 'Pare alguns segundos nos pontos mais tensos.',
    passos: ['Coloque o rolo debaixo das coxas.', 'Levante o quadril com as mãos.', 'Role do glúteo até atrás do joelho.', 'Pare nos pontos tensos.'],
    erro: 'Rolar por cima da parte de trás do joelho.',
    ben: 'Alivia a tensão dos posteriores e complementa o alongamento.'
  },
  'rolo-banda-iliotibial': {
    alvo: 'Tensor da Fáscia Lata',
    equip: 'Rolo de espuma',
    pos: 'Deitado de lado com o rolo sob a face externa da coxa, apoiado no antebraço.',
    con: 'Role devagar do quadril até perto do joelho.',
    exc: 'Use a perna de cima no chão para controlar a pressão.',
    passos: ['Deite-se de lado sobre o rolo.', 'Apoie o antebraço e a perna de cima no chão.', 'Role do quadril até perto do joelho.', 'Troque de lado.'],
    erro: 'Pôr o peso todo no rolo logo de início.',
    ben: 'Alívio da face externa da coxa, muito usado por corredores e ciclistas.'
  },
  'rolo-extensao-toracica': {
    alvo: 'Coluna Torácica',
    equip: 'Rolo de espuma',
    pos: 'Deitado de costas com o rolo sob as costas altas, mãos atrás da cabeça e joelhos fletidos.',
    con: 'Deixe as costas altas estenderem por cima do rolo.',
    exc: 'Volte ao centro e mude o rolo de sítio alguns centímetros.',
    passos: ['Coloque o rolo sob as costas altas.', 'Apoie a cabeça nas mãos.', 'Deixe o tronco estender por cima do rolo.', 'Suba e mude o rolo de sítio.'],
    erro: 'Colocar o rolo na lombar.',
    ben: 'Contraria a postura curvada e melhora a extensão dos ombros acima da cabeça.'
  },
  'rolo-adutores': {
    alvo: 'Adutores',
    equip: 'Rolo de espuma',
    pos: 'De barriga para baixo apoiado nos antebraços, uma perna dobrada para o lado sobre o rolo.',
    con: 'Role devagar a face interna da coxa.',
    exc: 'Pare alguns segundos nos pontos mais tensos.',
    passos: ['Apoie os antebraços no chão.', 'Dobre uma perna para o lado sobre o rolo.', 'Role a face interna da coxa.', 'Troque de lado.'],
    erro: 'Rolar depressa e com o peso todo.',
    ben: 'Liberta os adutores, que costumam ficar tensos depois de agachamentos e de desportos.'
  },

  // ── Casa com halteres, kettlebell ou elástico ──
  'afundo-frente-halteres': {
    alvo: 'Quadríceps',
    equip: 'Halteres',
    pos: 'Em pé, um halter em cada mão ao lado do corpo.',
    con: 'Empurre com o pé da frente e regresse à posição inicial.',
    exc: 'Dê um passo largo à frente e desça até o joelho de trás quase tocar no chão.',
    passos: ['Segure um halter em cada mão.', 'Dê um passo largo à frente.', 'Desça até os joelhos ficarem perto de 90 graus.', 'Empurre e volte; alterne as pernas.'],
    erro: 'Travar a descida com o joelho muito à frente do pé.',
    ben: 'Força unilateral de pernas com carga em casa.'
  },
  'afundo-lateral-halteres': {
    alvo: 'Quadríceps',
    equip: 'Halteres',
    pos: 'Em pé, pés juntos e um halter em cada mão.',
    con: 'Empurre com a perna dobrada e regresse ao centro.',
    exc: 'Dê um passo largo para o lado e dobre esse joelho, com a outra perna esticada.',
    passos: ['Segure os halteres ao lado do corpo.', 'Dê um passo largo para o lado.', 'Leve o quadril para trás e dobre esse joelho.', 'Empurre e volte; alterne os lados.'],
    erro: 'Deixar o joelho da perna dobrada cair para dentro.',
    ben: 'Trabalha pernas e adutores no plano lateral, com carga.'
  },
  'agachamento-frontal-halteres': {
    alvo: 'Quadríceps',
    equip: 'Halteres',
    pos: 'Em pé, halteres apoiados nos ombros com os cotovelos à frente.',
    con: 'Empurre o chão e suba mantendo os cotovelos altos.',
    exc: 'Desça com o tronco direito até as coxas ficarem paralelas ao chão.',
    passos: ['Apoie os halteres nos ombros.', 'Levante os cotovelos à frente.', 'Desça com o tronco direito.', 'Suba empurrando o chão.'],
    erro: 'Deixar os cotovelos cair e o tronco inclinar.',
    ben: 'Dá ênfase aos quadríceps e à postura do tronco, com pouco material.'
  },
  'ponte-gluteos-halter': {
    alvo: 'Glúteo Máximo',
    equip: 'Halter',
    pos: 'Deitado de costas, joelhos fletidos e um halter apoiado sobre o quadril.',
    con: 'Empurre pelos calcanhares e levante o quadril.',
    exc: 'Desça o quadril devagar até quase tocar no chão.',
    passos: ['Deite-se com os joelhos fletidos.', 'Segure o halter sobre o quadril.', 'Suba o quadril empurrando pelos calcanhares.', 'Aperte os glúteos e desça devagar.'],
    erro: 'Empurrar com a ponta dos pés em vez dos calcanhares.',
    ben: 'Progressão com carga da ponte de glúteos, para hipertrofia em casa.'
  },
  'thruster-halteres': {
    alvo: 'Corpo Inteiro',
    equip: 'Halteres',
    pos: 'Em pé, halteres à altura dos ombros.',
    con: 'Suba do agachamento e use o impulso para empurrar os halteres acima da cabeça.',
    exc: 'Baixe os halteres aos ombros e desça para o agachamento.',
    passos: ['Segure os halteres nos ombros.', 'Agache até as coxas ficarem paralelas.', 'Suba com força e empurre os halteres para cima.', 'Baixe aos ombros e repita.'],
    erro: 'Separar o agachamento do empurrão e perder o ritmo.',
    ben: 'Exercício de corpo inteiro muito exigente, ótimo para treinos metabólicos.'
  },
  'remada-renegada': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Halteres',
    pos: 'Em prancha alta com as mãos sobre dois halteres e pés afastados.',
    con: 'Puxe um halter até à anca, mantendo o quadril parado.',
    exc: 'Pouse o halter devagar e repita com o outro braço.',
    passos: ['Fique em prancha sobre os halteres.', 'Afaste os pés para ter equilíbrio.', 'Puxe um halter até à anca.', 'Pouse e alterne os lados.'],
    erro: 'Rodar o tronco para levantar o halter.',
    ben: 'Junta remada de costas com estabilidade anti-rotação do core.'
  },
  'remada-deltoide-posterior-halteres': {
    alvo: 'Deltoide Posterior',
    equip: 'Halteres',
    pos: 'Tronco inclinado à frente, joelhos ligeiramente fletidos e halteres pendurados.',
    con: 'Puxe os halteres com os cotovelos bem abertos, até à altura do peito.',
    exc: 'Desça os halteres devagar.',
    passos: ['Incline o tronco à frente com as costas direitas.', 'Deixe os halteres pendurados.', 'Puxe com os cotovelos abertos para fora.', 'Desça devagar.'],
    erro: 'Puxar com os cotovelos colados ao corpo, o que passa o trabalho para o dorsal.',
    ben: 'Fortalece a parte de trás do ombro, muitas vezes esquecida.'
  },
  'push-press-halteres': {
    alvo: 'Deltoide Anterior',
    equip: 'Halteres',
    pos: 'Em pé, halteres à altura dos ombros.',
    con: 'Faça um pequeno impulso com as pernas e empurre os halteres acima da cabeça.',
    exc: 'Baixe os halteres de forma controlada até aos ombros.',
    passos: ['Segure os halteres nos ombros.', 'Dobre ligeiramente os joelhos.', 'Estenda as pernas e empurre os halteres para cima.', 'Baixe aos ombros e repita.'],
    erro: 'Fazer um agachamento profundo em vez de um impulso curto.',
    ben: 'Permite mais carga que o desenvolvimento estrito e treina potência.'
  },
  'caminhada-da-mala': {
    alvo: 'Oblíquos',
    equip: 'Halter',
    pos: 'Em pé, um halter pesado numa só mão ao lado do corpo.',
    con: 'Caminhe com passos normais sem inclinar o tronco para o lado do peso.',
    exc: 'Mantenha os ombros nivelados durante todo o percurso.',
    passos: ['Segure um halter pesado numa mão.', 'Endireite o tronco.', 'Caminhe sem inclinar para o lado.', 'Troque de mão a meio.'],
    erro: 'Inclinar o tronco para o lado do halter.',
    ben: 'Treina o core a resistir à inclinação lateral e reforça a pega.'
  },
  'flexao-lateral-halter': {
    alvo: 'Oblíquos',
    equip: 'Halter',
    pos: 'Em pé, um halter numa mão ao lado do corpo.',
    con: 'Volte à posição vertical contraindo o lado oposto ao halter.',
    exc: 'Incline o tronco para o lado do halter.',
    passos: ['Segure o halter numa mão.', 'Incline o tronco para o lado do halter.', 'Volte à vertical.', 'Troque de lado no fim da série.'],
    erro: 'Usar dois halteres, o que anula o exercício.',
    ben: 'Isola os oblíquos e o quadrado lombar.'
  },
  'rotacao-externa-halter-em-pe': {
    alvo: 'Manguito Rotador',
    equip: 'Halteres leves',
    pos: 'Em pé, braços abertos à altura dos ombros e cotovelos dobrados a 90 graus, antebraços para a frente.',
    con: 'Rode os antebraços para cima até ficarem na vertical.',
    exc: 'Volte devagar à posição inicial.',
    passos: ['Levante os braços à altura dos ombros.', 'Dobre os cotovelos a 90 graus.', 'Rode os antebraços para cima.', 'Desça devagar.'],
    erro: 'Usar halteres pesados e compensar com o tronco.',
    ben: 'Reforça os rotadores externos e protege o ombro em quem faz muito supino.'
  },
  'rosca-aranha-halteres': {
    alvo: 'Bíceps Braquial',
    equip: 'Halteres e banco inclinado',
    pos: 'Deitado de barriga para baixo num banco inclinado, braços pendurados com um halter em cada mão.',
    con: 'Flexione os cotovelos e suba os halteres sem mexer os braços.',
    exc: 'Desça devagar até esticar os cotovelos.',
    passos: ['Deite-se de barriga para baixo no banco inclinado.', 'Deixe os braços pendurados na vertical.', 'Suba os halteres dobrando os cotovelos.', 'Desça devagar.'],
    erro: 'Puxar os cotovelos para trás durante a subida.',
    ben: 'Isola o bíceps no fim do movimento, sem ajuda do tronco.'
  },
  'rosca-inversa-halteres': {
    alvo: 'Braquiorradial',
    equip: 'Halteres',
    pos: 'Em pé, halteres com as palmas para trás.',
    con: 'Flexione os cotovelos mantendo as palmas para baixo.',
    exc: 'Desça devagar até esticar os braços.',
    passos: ['Segure os halteres com as palmas para trás.', 'Cole os cotovelos ao corpo.', 'Suba os halteres com as palmas para baixo.', 'Desça devagar.'],
    erro: 'Deixar os punhos dobrar para baixo.',
    ben: 'Fortalece antebraço e braquial, o que ajuda na pega e no tamanho do braço.'
  },
  'lenhador-halter': {
    alvo: 'Oblíquos',
    equip: 'Halter',
    pos: 'Em pé, pés afastados, halter seguro com as duas mãos junto à anca de um lado.',
    con: 'Rode o tronco e leve o halter na diagonal até acima do ombro oposto.',
    exc: 'Volte de forma controlada à anca.',
    passos: ['Segure o halter com as duas mãos junto à anca.', 'Dobre ligeiramente os joelhos.', 'Leve o halter na diagonal para cima.', 'Volte controlado; troque de lado.'],
    erro: 'Mover só os braços, sem rodar o tronco.',
    ben: 'Força rotacional para o dia a dia e para desportos.'
  },
  'terra-kettlebell': {
    alvo: 'Glúteo Máximo',
    equip: 'Kettlebell',
    pos: 'Em pé com a kettlebell no chão entre os pés.',
    con: 'Empurre o chão e estenda quadril e joelhos até ficar de pé.',
    exc: 'Leve o quadril para trás e pouse a kettlebell no chão com as costas direitas.',
    passos: ['Coloque a kettlebell entre os pés.', 'Leve o quadril para trás e agarre a pega.', 'Suba estendendo quadril e joelhos.', 'Volte a pousar com as costas direitas.'],
    erro: 'Curvar as costas para chegar à kettlebell.',
    ben: 'Ensina a dobradiça do quadril com segurança, antes do terra com barra.'
  },
  'stiff-kettlebell': {
    alvo: 'Isquiotibiais',
    equip: 'Kettlebell',
    pos: 'Em pé, kettlebell segura à frente das coxas e joelhos ligeiramente fletidos.',
    con: 'Contraia glúteos e posteriores e volte à vertical.',
    exc: 'Leve o quadril para trás e desça a kettlebell junto às pernas até sentir os posteriores esticarem.',
    passos: ['Segure a kettlebell à frente das coxas.', 'Leve o quadril para trás.', 'Desça até meio da canela.', 'Suba apertando os glúteos.'],
    erro: 'Dobrar os joelhos e transformar em agachamento.',
    ben: 'Hipertrofia e força dos posteriores em casa.'
  },
  'remada-unilateral-kettlebell': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Kettlebell',
    pos: 'Tronco inclinado à frente, uma mão apoiada no joelho e a kettlebell pendurada na outra.',
    con: 'Puxe a kettlebell até à anca com o cotovelo junto ao corpo.',
    exc: 'Desça devagar até esticar o braço.',
    passos: ['Incline o tronco com as costas direitas.', 'Apoie uma mão no joelho.', 'Puxe a kettlebell até à anca.', 'Desça devagar; troque de lado.'],
    erro: 'Rodar o tronco para levantar mais peso.',
    ben: 'Remada unilateral para as costas com pouco material.'
  },
  'desenvolvimento-unilateral-kettlebell': {
    alvo: 'Deltoide Anterior',
    equip: 'Kettlebell',
    pos: 'Em pé, kettlebell à altura do ombro com a bola apoiada no antebraço.',
    con: 'Empurre a kettlebell acima da cabeça até esticar o braço.',
    exc: 'Desça de forma controlada até ao ombro.',
    passos: ['Leve a kettlebell ao ombro.', 'Contraia glúteos e abdômen.', 'Empurre para cima até esticar o braço.', 'Desça devagar; troque de lado.'],
    erro: 'Inclinar o tronco para o lado para empurrar.',
    ben: 'Ombros mais estáveis e core forte, com a carga num só lado.'
  },
  'agachamento-frontal-kettlebell': {
    alvo: 'Quadríceps',
    equip: 'Kettlebells',
    pos: 'Em pé, kettlebells em posição de rack junto aos ombros.',
    con: 'Empurre o chão e suba mantendo o tronco direito.',
    exc: 'Desça até as coxas ficarem paralelas ao chão.',
    passos: ['Segure as kettlebells junto aos ombros.', 'Cotovelos junto ao corpo.', 'Desça com o tronco direito.', 'Suba empurrando o chão.'],
    erro: 'Deixar as kettlebells puxarem o tronco para a frente.',
    ben: 'Agachamento com carga frontal que também trabalha o core.'
  },
  'halo-kettlebell': {
    alvo: 'Deltoide',
    equip: 'Kettlebell leve',
    pos: 'Em pé, kettlebell segura pelas laterais da pega, à frente do peito e de cabeça para baixo.',
    con: 'Rode a kettlebell à volta da cabeça, perto do corpo.',
    exc: 'Volte à frente do peito e troque de sentido.',
    passos: ['Segure a kettlebell de cabeça para baixo.', 'Leve-a à volta da cabeça.', 'Mantenha-a perto do corpo.', 'Troque de sentido a cada volta.'],
    erro: 'Arquear a lombar quando a kettlebell passa atrás da cabeça.',
    ben: 'Mobilidade e estabilidade dos ombros com carga leve, ótimo em aquecimento.'
  },
  'moinho-kettlebell': {
    alvo: 'Oblíquos',
    equip: 'Kettlebell',
    pos: 'Em pé, kettlebell acima da cabeça com o braço esticado e pés rodados para o lado oposto.',
    con: 'Volte à vertical mantendo o braço esticado acima da cabeça.',
    exc: 'Leve o quadril para o lado do braço de cima e desça a outra mão pela perna.',
    passos: ['Estique a kettlebell acima da cabeça.', 'Olhe para a kettlebell.', 'Leve o quadril para fora e desça a outra mão pela perna.', 'Volte à vertical; troque de lado.'],
    erro: 'Dobrar o cotovelo de cima ou perder a kettlebell de vista.',
    ben: 'Junta mobilidade de quadril, estabilidade de ombro e força dos oblíquos.'
  },
  'caminhada-fazendeiro-kettlebell': {
    alvo: 'Antebraço',
    equip: 'Kettlebells',
    pos: 'Em pé, uma kettlebell pesada em cada mão ao lado do corpo.',
    con: 'Caminhe com passos curtos e firmes, com o tronco direito.',
    exc: 'Pouse as kettlebells de forma controlada no fim.',
    passos: ['Agarre uma kettlebell em cada mão.', 'Endireite o tronco e baixe os ombros.', 'Caminhe com passos curtos.', 'Pouse com as costas direitas.'],
    erro: 'Encolher os ombros e curvar as costas.',
    ben: 'Força de pega, trapézio e core num exercício simples.'
  },
  'abertura-elastico-pull-apart': {
    alvo: 'Deltoide Posterior',
    equip: 'Elástico',
    pos: 'Em pé, elástico seguro à frente do peito com os braços esticados.',
    con: 'Abra os braços até o elástico tocar no peito.',
    exc: 'Volte devagar à frente.',
    passos: ['Segure o elástico com os braços esticados à frente.', 'Abra os braços para os lados.', 'Junte as omoplatas no fim.', 'Volte devagar.'],
    erro: 'Encolher os ombros durante a abertura.',
    ben: 'O exercício de postura mais usado com elástico: fortalece a parte de trás dos ombros.'
  },
  'face-pull-elastico': {
    alvo: 'Deltoide Posterior',
    equip: 'Elástico preso à altura do rosto',
    pos: 'Em pé, de frente para o ponto de fixação, elástico seguro com os braços esticados.',
    con: 'Puxe o elástico em direção ao rosto, abrindo os cotovelos.',
    exc: 'Volte devagar a esticar os braços.',
    passos: ['Prenda o elástico à altura do rosto.', 'Segure com os braços esticados.', 'Puxe para o rosto com os cotovelos altos.', 'Volte devagar.'],
    erro: 'Puxar com os cotovelos baixos, como numa remada.',
    ben: 'Versão de casa do face pull: ombros mais saudáveis e melhor postura.'
  },
  'elevacao-lateral-elastico': {
    alvo: 'Deltoide Lateral',
    equip: 'Elástico',
    pos: 'Em pé sobre o elástico, uma ponta em cada mão ao lado do corpo.',
    con: 'Levante os braços para os lados até à altura dos ombros.',
    exc: 'Desça devagar resistindo ao elástico.',
    passos: ['Pise o elástico com os dois pés.', 'Segure as pontas ao lado do corpo.', 'Levante os braços até aos ombros.', 'Desça devagar.'],
    erro: 'Subir os braços acima dos ombros encolhendo o trapézio.',
    ben: 'Trabalha o deltoide lateral em casa, com tensão que aumenta no topo.'
  },
  'desenvolvimento-elastico': {
    alvo: 'Deltoide Anterior',
    equip: 'Elástico',
    pos: 'Em pé sobre o elástico, mãos à altura dos ombros.',
    con: 'Empurre as mãos acima da cabeça até esticar os braços.',
    exc: 'Desça devagar até aos ombros.',
    passos: ['Pise o elástico com os dois pés.', 'Leve as mãos aos ombros.', 'Empurre para cima até esticar os braços.', 'Desça devagar.'],
    erro: 'Arquear a lombar para empurrar.',
    ben: 'Desenvolvimento de ombros em casa sem halteres.'
  },
  'agachamento-elastico': {
    alvo: 'Quadríceps',
    equip: 'Elástico',
    pos: 'Em pé sobre o elástico, pontas seguras junto aos ombros.',
    con: 'Suba empurrando o chão contra a tensão do elástico.',
    exc: 'Desça até as coxas ficarem paralelas ao chão.',
    passos: ['Pise o elástico com os pés à largura dos ombros.', 'Segure as pontas junto aos ombros.', 'Agache até as coxas ficarem paralelas.', 'Suba empurrando o chão.'],
    erro: 'Deixar o elástico puxar os ombros para a frente.',
    ben: 'Adiciona resistência ao agachamento em casa, mais intensa no topo.'
  },
  'ponte-gluteos-elastico': {
    alvo: 'Glúteo Máximo',
    equip: 'Mini band',
    pos: 'Deitado de costas, joelhos fletidos e mini band acima dos joelhos.',
    con: 'Levante o quadril empurrando os joelhos para fora contra o elástico.',
    exc: 'Desça o quadril devagar sem deixar os joelhos fechar.',
    passos: ['Coloque a mini band acima dos joelhos.', 'Deite-se com os joelhos fletidos.', 'Suba o quadril afastando os joelhos.', 'Desça devagar.'],
    erro: 'Deixar os joelhos cair para dentro.',
    ben: 'Junta glúteo máximo e médio num só exercício.'
  },
  'good-morning-elastico': {
    alvo: 'Isquiotibiais',
    equip: 'Elástico',
    pos: 'Em pé sobre o elástico, com a outra ponta passada por trás do pescoço, apoiada nos ombros.',
    con: 'Estenda o quadril e volte à vertical.',
    exc: 'Incline o tronco à frente levando o quadril para trás.',
    passos: ['Pise o elástico e passe-o por trás dos ombros.', 'Dobre ligeiramente os joelhos.', 'Incline o tronco levando o quadril para trás.', 'Volte à vertical apertando os glúteos.'],
    erro: 'Curvar as costas na descida.',
    ben: 'Treina a dobradiça do quadril e os posteriores em casa.'
  },
  'pallof-press-elastico': {
    alvo: 'Oblíquos',
    equip: 'Elástico preso à altura do peito',
    pos: 'De lado para o ponto de fixação, elástico seguro junto ao peito com as duas mãos.',
    con: 'Empurre as mãos à frente sem deixar o tronco rodar.',
    exc: 'Traga as mãos de volta ao peito devagar.',
    passos: ['Fique de lado para o elástico.', 'Segure-o junto ao peito.', 'Empurre as mãos à frente.', 'Volte devagar; troque de lado.'],
    erro: 'Deixar o elástico rodar o tronco.',
    ben: 'Treina o core a resistir à rotação, essencial para proteger a coluna.'
  },
  'rotacao-interna-elastico': {
    alvo: 'Manguito Rotador',
    equip: 'Elástico preso à altura do cotovelo',
    pos: 'De lado para o ponto de fixação, cotovelo junto ao corpo e dobrado a 90 graus.',
    con: 'Rode o antebraço para dentro em direção ao abdômen.',
    exc: 'Volte devagar à posição inicial.',
    passos: ['Fique de lado para o elástico.', 'Cole o cotovelo ao corpo.', 'Rode o antebraço para dentro.', 'Volte devagar; troque de lado.'],
    erro: 'Afastar o cotovelo do corpo.',
    ben: 'Completa o trabalho de rotação externa e equilibra o manguito rotador.'
  },
  'monster-walk-frontal': {
    alvo: 'Glúteo Médio',
    equip: 'Mini band',
    pos: 'Em meio agachamento, mini band à volta das pernas e pés afastados.',
    con: 'Avance com passos em diagonal, mantendo a tensão do elástico.',
    exc: 'Mantenha a posição baixa durante todo o percurso.',
    passos: ['Coloque a mini band nas pernas.', 'Fique em meio agachamento.', 'Avance em diagonal, um pé de cada vez.', 'Mantenha os pés afastados.'],
    erro: 'Endireitar as pernas e perder a tensão do elástico.',
    ben: 'Ativa o glúteo médio em deslocamento, ótimo como aquecimento para pernas.'
  },
  'extensao-terminal-joelho-elastico': {
    alvo: 'Vasto Medial',
    equip: 'Elástico preso baixo',
    pos: 'Em pé, elástico preso atrás do joelho de uma perna, joelho ligeiramente fletido.',
    con: 'Estique o joelho por completo contra o elástico.',
    exc: 'Deixe o joelho fletir de novo devagar.',
    passos: ['Prenda o elástico atrás de um joelho.', 'Afaste-se até sentir tensão.', 'Estique o joelho por completo.', 'Volte devagar; troque de perna.'],
    erro: 'Fazer o movimento curto, sem chegar à extensão total.',
    ben: 'Exercício clássico de reabilitação do joelho, foca o vasto medial.'
  },
  'flexao-com-elastico': {
    alvo: 'Peitoral Maior',
    equip: 'Elástico',
    pos: 'Em prancha alta, elástico passado pelas costas e preso sob as mãos.',
    con: 'Empurre o chão contra a resistência do elástico até esticar os braços.',
    exc: 'Desça o peito até perto do chão.',
    passos: ['Passe o elástico pelas costas.', 'Prenda as pontas sob as mãos.', 'Desça o peito até perto do chão.', 'Empurre até esticar os braços.'],
    erro: 'Deixar o quadril cair por causa da resistência extra.',
    ben: 'Progressão de carga da flexão em casa, sem pesos.'
  },

  // ── Ginásio ──
  'barra-fixa-assistida-maquina': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Máquina de barra assistida',
    pos: 'Joelhos na plataforma da máquina, mãos na barra com pega pronada mais aberta que os ombros.',
    con: 'Puxe o corpo até o queixo passar a barra.',
    exc: 'Desça devagar até esticar os braços.',
    passos: ['Escolha o contrapeso de ajuda.', 'Apoie os joelhos na plataforma.', 'Puxe até o queixo passar a barra.', 'Desça devagar.'],
    erro: 'Usar tanta ajuda que o exercício fica fácil demais.',
    ben: 'Permite a quem ainda não faz barra treinar o movimento completo e progredir.'
  },
  'barra-supinada-assistida-maquina': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Máquina de barra assistida',
    pos: 'Na plataforma da máquina, mãos na barra com as palmas viradas para si.',
    con: 'Puxe o corpo até o queixo passar a barra.',
    exc: 'Desça devagar até esticar os braços.',
    passos: ['Escolha o contrapeso de ajuda.', 'Segure a barra com as palmas para si.', 'Puxe até o queixo passar a barra.', 'Desça devagar.'],
    erro: 'Encurtar a descida e não esticar os braços.',
    ben: 'Versão mais fácil da barra supinada, com mais bíceps.'
  },
  'paralelas-assistidas-maquina': {
    alvo: 'Peitoral Maior',
    equip: 'Máquina de paralelas assistidas',
    pos: 'Joelhos na plataforma, mãos nas pegas paralelas e braços esticados.',
    con: 'Empurre as pegas até esticar os braços.',
    exc: 'Desça inclinando ligeiramente o tronco até os cotovelos ficarem a 90 graus.',
    passos: ['Escolha o contrapeso de ajuda.', 'Apoie os joelhos na plataforma.', 'Desça até os cotovelos ficarem a 90 graus.', 'Empurre até esticar os braços.'],
    erro: 'Descer demais e forçar a frente dos ombros.',
    ben: 'Prepara para as paralelas livres, com controlo total da carga.'
  },
  'agachamento-na-caixa-barra': {
    alvo: 'Quadríceps',
    equip: 'Barra e banco ou caixa',
    pos: 'Barra nas costas, de pé à frente de um banco ou caixa à altura do joelho.',
    con: 'Suba a partir da caixa empurrando o chão.',
    exc: 'Desça levando o quadril para trás até se sentar de leve na caixa.',
    passos: ['Coloque a barra nas costas.', 'Fique à frente da caixa.', 'Desça até tocar de leve na caixa.', 'Suba sem balanço.'],
    erro: 'Deixar-se cair na caixa e perder a tensão.',
    ben: 'Ensina a profundidade certa e a usar o quadril, útil para força e técnica.'
  },
  'bulgaro-barra': {
    alvo: 'Quadríceps',
    equip: 'Barra e banco',
    pos: 'Barra nas costas, pé de trás apoiado num banco.',
    con: 'Empurre com o pé da frente e suba.',
    exc: 'Desça na vertical até a coxa da frente ficar paralela ao chão.',
    passos: ['Coloque a barra nas costas.', 'Apoie o pé de trás no banco.', 'Desça na vertical.', 'Suba com o pé da frente; troque de perna.'],
    erro: 'Ficar perto demais do banco e sobrecarregar o joelho.',
    ben: 'Permite carga alta numa perna de cada vez, para força e hipertrofia.'
  },
  'afundo-reverso-barra': {
    alvo: 'Quadríceps',
    equip: 'Barra',
    pos: 'Em pé, barra apoiada nas costas.',
    con: 'Empurre com o pé da frente e traga a perna de trás de volta.',
    exc: 'Dê um passo para trás e desça até o joelho quase tocar no chão.',
    passos: ['Coloque a barra nas costas.', 'Dê um passo largo para trás.', 'Desça até os joelhos ficarem a 90 graus.', 'Volte; alterne as pernas.'],
    erro: 'Perder o equilíbrio por dar o passo em linha reta, sem largura.',
    ben: 'Afundo com carga alta e menos stress no joelho que o afundo à frente.'
  },
  'step-up-barra': {
    alvo: 'Quadríceps',
    equip: 'Barra e banco',
    pos: 'Barra nas costas, de frente para um banco ou caixa.',
    con: 'Suba ao banco empurrando com a perna que está em cima.',
    exc: 'Desça de forma controlada com a mesma perna.',
    passos: ['Coloque a barra nas costas.', 'Apoie um pé inteiro no banco.', 'Suba empurrando com essa perna.', 'Desça controlado; alterne as pernas.'],
    erro: 'Dar impulso com a perna de baixo.',
    ben: 'Força unilateral e transferência direta para subir escadas e saltar.'
  },
  'landmine-press': {
    alvo: 'Deltoide Anterior',
    equip: 'Barra em landmine',
    pos: 'Em pé, ponta da barra segura junto ao ombro com uma mão.',
    con: 'Empurre a barra para cima e para a frente até esticar o braço.',
    exc: 'Baixe a barra devagar até ao ombro.',
    passos: ['Segure a ponta da barra junto ao ombro.', 'Afaste os pés e contraia o core.', 'Empurre para cima e para a frente.', 'Desça devagar; troque de lado.'],
    erro: 'Arquear a lombar para empurrar.',
    ben: 'Desenvolvimento de ombro amigo das articulações, bom para quem tem desconforto acima da cabeça.'
  },
  'agachamento-landmine': {
    alvo: 'Quadríceps',
    equip: 'Barra em landmine',
    pos: 'Em pé, ponta da barra segura com as duas mãos junto ao peito.',
    con: 'Suba empurrando o chão.',
    exc: 'Desça até as coxas ficarem paralelas ao chão, com o tronco direito.',
    passos: ['Segure a ponta da barra junto ao peito.', 'Pés à largura dos ombros.', 'Agache com o tronco direito.', 'Suba empurrando o chão.'],
    erro: 'Deixar a barra afastar-se do corpo.',
    ben: 'Ótimo para aprender o agachamento: a barra guia o movimento.'
  },
  'rotacao-landmine': {
    alvo: 'Oblíquos',
    equip: 'Barra em landmine',
    pos: 'Em pé, ponta da barra segura com as duas mãos à frente, braços esticados.',
    con: 'Leve a barra em arco até à anca de um lado e depois do outro.',
    exc: 'Controle a barra ao passar pelo centro.',
    passos: ['Segure a ponta da barra à frente.', 'Leve-a em arco até uma anca.', 'Rode os pés e o quadril com o movimento.', 'Leve para o outro lado.'],
    erro: 'Fazer o movimento só com os braços.',
    ben: 'Força rotacional para desportos e proteção da coluna.'
  },
  'thruster-barra': {
    alvo: 'Corpo Inteiro',
    equip: 'Barra',
    pos: 'Em pé, barra apoiada à frente dos ombros.',
    con: 'Suba do agachamento e empurre a barra acima da cabeça num só movimento.',
    exc: 'Baixe a barra aos ombros e desça para o agachamento.',
    passos: ['Apoie a barra à frente dos ombros.', 'Faça um agachamento frontal.', 'Suba e empurre a barra para cima.', 'Baixe aos ombros e repita.'],
    erro: 'Parar entre o agachamento e o empurrão.',
    ben: 'Exercício de corpo inteiro para condicionamento e potência.'
  },
  'gemeos-em-pe-barra': {
    alvo: 'Gastrocnêmio',
    equip: 'Barra',
    pos: 'Em pé, barra nas costas e pés à largura do quadril.',
    con: 'Suba na ponta dos pés o mais alto possível.',
    exc: 'Desça devagar até os calcanhares quase tocarem no chão.',
    passos: ['Coloque a barra nas costas.', 'Pés à largura do quadril.', 'Suba na ponta dos pés.', 'Desça devagar.'],
    erro: 'Fazer repetições curtas e rápidas.',
    ben: 'Treino de gémeos quando a máquina está ocupada ou não existe.'
  },
  'rosca-scott-barra-reta': {
    alvo: 'Bíceps Braquial',
    equip: 'Banco Scott e barra reta',
    pos: 'Sentado no banco Scott, braços apoiados no estofo e barra segura com as palmas para cima.',
    con: 'Flexione os cotovelos até a barra subir perto dos ombros.',
    exc: 'Desça devagar até quase esticar os braços.',
    passos: ['Apoie os braços no estofo.', 'Segure a barra com as palmas para cima.', 'Suba a barra dobrando os cotovelos.', 'Desça devagar.'],
    erro: 'Deixar cair a barra no fim e esticar os cotovelos de golpe.',
    ben: 'Isola o bíceps sem ajuda do tronco; complementa a Scott com barra W.'
  },
  'pullover-barra': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Barra e banco',
    pos: 'Deitado num banco, barra segura acima do peito com os braços quase esticados.',
    con: 'Traga a barra de volta acima do peito usando as costas.',
    exc: 'Leve a barra para trás da cabeça em arco até sentir os dorsais esticarem.',
    passos: ['Deite-se no banco com a barra acima do peito.', 'Mantenha os cotovelos ligeiramente fletidos.', 'Leve a barra para trás da cabeça.', 'Volte em arco acima do peito.'],
    erro: 'Dobrar os cotovelos e transformar em tríceps.',
    ben: 'Trabalha o grande dorsal em alongamento, diferente das puxadas.'
  },
  'pull-through-polia': {
    alvo: 'Glúteo Máximo',
    equip: 'Polia baixa com corda',
    pos: 'De costas para a polia baixa, corda segura entre as pernas.',
    con: 'Estenda o quadril de forma explosiva até ficar de pé.',
    exc: 'Leve o quadril para trás deixando a corda passar entre as pernas.',
    passos: ['Fique de costas para a polia com a corda entre as pernas.', 'Afaste-se para ter tensão.', 'Leve o quadril para trás.', 'Estenda o quadril apertando os glúteos.'],
    erro: 'Puxar a corda com os braços.',
    ben: 'Ensina a dobradiça do quadril com pouca carga na coluna.'
  },
  'elevacao-y-polia': {
    alvo: 'Deltoide Lateral',
    equip: 'Crossover com polias baixas',
    pos: 'No meio do crossover, cabos cruzados à frente do corpo seguros nas polias baixas.',
    con: 'Levante os braços em diagonal até formarem um Y acima da cabeça.',
    exc: 'Desça devagar até cruzar os cabos de novo.',
    passos: ['Segure os cabos cruzados à frente do corpo.', 'Levante os braços em diagonal.', 'Termine em Y acima da cabeça.', 'Desça devagar.'],
    erro: 'Encolher os ombros no topo.',
    ben: 'Trabalha deltoide lateral e trapézio inferior, importantes para ombros saudáveis.'
  },
  'remada-deltoide-posterior-polia': {
    alvo: 'Deltoide Posterior',
    equip: 'Polia à altura do peito',
    pos: 'De frente para a polia, pega segura com os braços esticados à altura do peito.',
    con: 'Puxe com os cotovelos altos e abertos até às mãos chegarem perto do peito.',
    exc: 'Volte devagar a esticar os braços.',
    passos: ['Regule a polia à altura do peito.', 'Segure com os braços esticados.', 'Puxe com os cotovelos abertos.', 'Volte devagar.'],
    erro: 'Baixar os cotovelos, o que passa o trabalho para o dorsal.',
    ben: 'Isola a parte de trás do ombro com tensão constante.'
  },
  'rotacao-tronco-polia': {
    alvo: 'Oblíquos',
    equip: 'Polia à altura do peito',
    pos: 'De lado para a polia, pega segura com as duas mãos à frente do peito.',
    con: 'Rode o tronco para o lado oposto à polia.',
    exc: 'Volte devagar à posição inicial.',
    passos: ['Fique de lado para a polia.', 'Segure a pega à frente do peito.', 'Rode o tronco para longe da polia.', 'Volte devagar; troque de lado.'],
    erro: 'Rodar com impulso e sem controlo.',
    ben: 'Força rotacional dos oblíquos com carga regulável.'
  },
  'extensao-lombar-maquina': {
    alvo: 'Eretores da Espinha',
    equip: 'Máquina de extensão lombar',
    pos: 'Sentado na máquina, costas apoiadas no rolo e pés fixos.',
    con: 'Empurre o rolo para trás estendendo o tronco.',
    exc: 'Volte devagar à frente.',
    passos: ['Sente-se e prenda os pés.', 'Apoie as costas no rolo.', 'Estenda o tronco para trás.', 'Volte devagar.'],
    erro: 'Atirar o tronco para trás com impulso.',
    ben: 'Fortalece a lombar com carga guiada e segura.'
  },
  'pullover-maquina': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Máquina de pullover',
    pos: 'Sentado na máquina, braços acima da cabeça a segurar a barra.',
    con: 'Puxe a barra em arco até à frente do tronco.',
    exc: 'Deixe a barra voltar devagar acima da cabeça.',
    passos: ['Ajuste o banco e segure a barra.', 'Comece com os braços acima da cabeça.', 'Puxe em arco até à frente do tronco.', 'Volte devagar.'],
    erro: 'Dobrar os cotovelos e puxar com os braços.',
    ben: 'Isola o grande dorsal sem depender da força dos bíceps.'
  },
  'rosca-biceps-maquina': {
    alvo: 'Bíceps Braquial',
    equip: 'Máquina de rosca',
    pos: 'Sentado na máquina, braços apoiados no estofo e pegas seguras.',
    con: 'Flexione os cotovelos até ao topo do movimento.',
    exc: 'Desça devagar até quase esticar os braços.',
    passos: ['Ajuste o banco à altura dos braços.', 'Apoie os braços no estofo.', 'Suba dobrando os cotovelos.', 'Desça devagar.'],
    erro: 'Levantar o tronco do banco para ajudar.',
    ben: 'Bíceps com movimento guiado, bom para iniciantes e séries até à falha.'
  },
  'remada-cavalinho-maquina-apoiada': {
    alvo: 'Latíssimo do Dorso',
    equip: 'Máquina de remada cavalinho',
    pos: 'Peito apoiado no estofo da máquina, pegas seguras com os braços esticados.',
    con: 'Puxe as pegas em direção ao abdômen.',
    exc: 'Desça devagar até esticar os braços.',
    passos: ['Apoie o peito no estofo.', 'Segure as pegas.', 'Puxe em direção ao abdômen.', 'Desça devagar.'],
    erro: 'Tirar o peito do apoio para dar impulso.',
    ben: 'Remada pesada para as costas sem esforço da lombar.'
  },
  'agachamento-pendulo': {
    alvo: 'Quadríceps',
    equip: 'Máquina pêndulo',
    pos: 'Costas apoiadas na máquina, ombros sob as almofadas e pés na plataforma.',
    con: 'Empurre a plataforma e suba até quase esticar os joelhos.',
    exc: 'Desça o mais fundo possível de forma controlada.',
    passos: ['Encoste as costas e os ombros à máquina.', 'Pés à largura do quadril na plataforma.', 'Desça o mais fundo que controlar.', 'Suba empurrando a plataforma.'],
    erro: 'Encurtar a amplitude para pôr mais peso.',
    ben: 'Muito quadríceps com pouca carga na coluna; máquina cada vez mais comum nos ginásios.'
  },
  'leg-press-pes-afastados': {
    alvo: 'Glúteo Máximo',
    equip: 'Leg press 45 graus',
    pos: 'Sentado no leg press, pés afastados no alto da plataforma e pontas para fora.',
    con: 'Empurre a plataforma até quase esticar os joelhos.',
    exc: 'Desça a plataforma devagar até os joelhos ficarem perto do peito.',
    passos: ['Coloque os pés afastados e altos na plataforma.', 'Rode as pontas dos pés para fora.', 'Desça devagar.', 'Empurre sem travar os joelhos.'],
    erro: 'Deixar a lombar sair do encosto no fundo.',
    ben: 'Variante do leg press com mais glúteos e adutores.'
  },
  'elevacao-joelhos-cadeira-romana': {
    alvo: 'Reto Abdominal',
    equip: 'Cadeira romana',
    pos: 'Costas apoiadas na cadeira romana, antebraços nos apoios e pernas penduradas.',
    con: 'Levante os joelhos em direção ao peito enrolando a bacia.',
    exc: 'Desça as pernas devagar sem balanço.',
    passos: ['Apoie os antebraços e as costas.', 'Deixe as pernas penduradas.', 'Suba os joelhos ao peito.', 'Desça devagar.'],
    erro: 'Balançar as pernas para ganhar impulso.',
    ben: 'Abdominal inferior mais acessível que a elevação de pernas na barra.'
  },
  'nordico-assistido-polia': {
    alvo: 'Isquiotibiais',
    equip: 'Polia alta e apoio para os pés',
    pos: 'De joelhos com os calcanhares presos, de costas para a polia alta e cabo seguro junto ao peito.',
    con: 'Contraia os posteriores e volte à posição vertical com a ajuda do cabo.',
    exc: 'Incline o corpo à frente devagar, com o quadril estendido.',
    passos: ['Prenda os calcanhares.', 'Segure o cabo junto ao peito.', 'Desça o corpo à frente devagar.', 'Volte com os posteriores, ajudado pelo cabo.'],
    erro: 'Dobrar o quadril e descer sentado.',
    ben: 'Regressão do nórdico para treinar posteriores e prevenir lesões musculares.'
  },
  'agachamento-frontal-smith': {
    alvo: 'Quadríceps',
    equip: 'Máquina Smith',
    pos: 'Barra do Smith apoiada à frente dos ombros, cotovelos altos.',
    con: 'Empurre o chão e suba com o tronco direito.',
    exc: 'Desça até as coxas ficarem paralelas ao chão.',
    passos: ['Apoie a barra à frente dos ombros.', 'Levante os cotovelos.', 'Desça com o tronco direito.', 'Suba empurrando o chão.'],
    erro: 'Deixar cair os cotovelos e a barra rolar.',
    ben: 'Agachamento frontal guiado, com foco em quadríceps e sem risco de perder a barra.'
  },
  'caminhada-fazendeiro-barra-hexagonal': {
    alvo: 'Antebraço',
    equip: 'Barra hexagonal',
    pos: 'Dentro da barra hexagonal, pegas seguras e corpo de pé.',
    con: 'Caminhe com passos curtos mantendo a barra estável.',
    exc: 'Pouse a barra de forma controlada no fim.',
    passos: ['Entre na barra e levante-a como num terra.', 'Endireite o tronco.', 'Caminhe com passos curtos.', 'Pouse com as costas direitas.'],
    erro: 'Encolher os ombros e curvar as costas.',
    ben: 'Permite cargas muito altas para pega, trapézio e core.'
  }
};

/** Fichas técnicas (EXERCISE_BIOMECHANICS), com o mesmo id numérico da biblioteca. */
export const OPEN_BIOMECHANICS = Object.fromEntries(
  OPEN_EXERCISES_BATCH.map((e, i) => {
    const t = OPEN_EXERCISES_TEXT[e.slug];
    return [
      FIRST_ID + i,
      {
        id: FIRST_ID + i,
        slug: e.slug,
        nome: e.nome,
        grupo: e.grupo,
        alvo: t.alvo,
        sinergistas: e.sin,
        equipamento: t.equip,
        posicao_inicial: t.pos,
        concentrica: t.con,
        excentrica: t.exc,
        passos: t.passos,
        checkpoints: e.cps,
        respiracao: t.resp || RESPIRACAO[e.tipo],
        erro_comum: t.erro,
        beneficio: t.ben
      }
    ];
  })
);

