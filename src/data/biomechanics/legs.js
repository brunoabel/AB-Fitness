/**
 * Biomecânica de Membros Inferiores — 88 Exercícios
 * Quadríceps (61-70, 215-234), Posteriores/Isquiotibiais (71-77, 235-245),
 * Glúteos (78-81, 246-260), Adutores (82-83, 269-272) e Panturrilhas/Tibial (84-89, 261-268).
 */

export const LEGS_BIOMECHANICS = {
  // =========================================================================
  // QUADRÍCEPS (30 EXERCÍCIOS)
  // =========================================================================
  61: {
    id: 61,
    slug: 'agachamento-livre',
    nome: 'Agachamento Livre',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Vasto Lateral, Medial, Intermédio e Reto Femoral) e Glúteo Máximo',
    sinergistas: 'Adutores, Isquiotibiais, Eretores da Espinha e Core',
    equipamento: 'Barra Olímpica na Gaiola de Agachamento + Anilhas',
    posicao_inicial: 'Barra apoiada sobre o trapézio médio/superior (barra alta ou baixa). Pés afastados na largura dos ombros com pontas ligeiramente apontadas para fora (15°-30°). Escápulas travadas, peito aberto e ar retido no abdômen (manobra de Valsalva).',
    concentrica: 'Empurre o solo com todo o pé (tripé: calcanhar, base do dedão e base do dedinho) estendendo simultaneamente joelhos e quadris até ficar em pé, mantendo o peito erguido.',
    excentrica: 'Inicie a descida flexionando simultaneamente joelhos e quadris em 2 a 3 segundos, descendo com os joelhos acompanhando exatamente a linha dos dedos dos pés até a dobra do quadril passar a linha superior do joelho (agachamento profundo válido).',
    passos: [
      'Posicione a barra nas costas, dê dois passos para trás e ajuste a base dos pés.',
      'Inspire profundamente, faça o brace abdominal rígido e inicie a descida.',
      'Desça até a dobra do quadril ultrapassar o topo da patela (quebra da paralela).',
      'Empurre o chão de forma explosiva mantendo os joelhos alinhados para fora.'
    ],
    checkpoints: [
      'Joelhos apontam para fora na mesma linha dos pés (proibido colapsar em valgo dinâmico).',
      'Coluna lombar preserva curvatura neutra durante toda a profundidade (sem retroversão pélvica/butt wink excessivo).',
      'Peso distribuído uniformemente no tripé do pé (sem levantar os calcanhares).'
    ],
    respiracao: 'Inspire profundamente e trave o core antes de descer; segure a pressão intra-abdominal e solte o ar no terço final da subida.',
    erro_comum: 'Deixar os joelhos desabarem para dentro (valgo dinâmico) ao subir com carga pesada, sobrecarregando perigosamente o ligamento cruzado anterior (LCA) e meniscos.',
    beneficio: 'O exercício rei da musculação para membros inferiores, estimulando hipertrofia global de coxas e glúteos com a maior liberação hormonal e densidade óssea possível.'
  },
  62: {
    id: 62,
    slug: 'agachamento-smith',
    nome: 'Agachamento no Smith',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Isolamento com Pés à Frente)',
    sinergistas: 'Glúteo Máximo e Adutores',
    equipamento: 'Smith Machine',
    posicao_inicial: 'Posicione os pés ligeiramente à frente da linha da barra (cerca de 15 a 20 cm à frente) para permitir uma descida com tronco mais vertical e maior flexão de joelho.',
    concentrica: 'Empurre o solo através dos trilhos guiados até a extensão quase completa dos joelhos.',
    excentrica: 'Desça em 3 segundos controlados até a profundidade de 90° ou quebra da paralela, enfatizando o alongamento do quadríceps.',
    passos: [
      'Apoie a barra nos trapézios e posicione os pés levemente à frente.',
      'Destrave a barra com os punhos firmes.',
      'Desça de maneira compassada mantendo a coluna ereta encostada na linha do trilho.',
      'Suba empurrando os calcanhares sem travar os joelhos bruscamente no topo.'
    ],
    checkpoints: ['Pés ligeiramente adiantados', 'Tronco ereto', 'Sem rebote no fundo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Posicionar os pés muito para trás, forçando os joelhos excessivamente à frente com sobrecarga patelar.',
    beneficio: 'Permite transferir o foco quase que exclusivamente para o quadríceps ao reduzir a necessidade de equilíbrio e o estresse na musculatura lombar.'
  },
  63: {
    id: 63,
    slug: 'agachamento-frontal',
    nome: 'Agachamento Frontal',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Ênfase Máxima) e Core Anterior',
    sinergistas: 'Glúteo Máximo, Adutores e Eretor da Espinha Torácico',
    equipamento: 'Barra Olímpica nos Ombros Anteriores (Clean Grip ou Mãos Cruzadas)',
    posicao_inicial: 'Barra repousando sobre os deltoides anteriores e clavículas, cotovelos elevados e apontados diretamente para a frente (paralelos ao chão). Tronco 100% vertical.',
    concentrica: 'Empurre o chão mantendo os cotovelos altos e o peito erguido até a postura de pé.',
    excentrica: 'Desça profundamente flexionando joelhos e quadris em 2 a 3 segundos com o tronco estritamente ereto.',
    passos: [
      'Apoie a barra nos deltoides frontais com cotovelos bem altos.',
      'Afaste os pés e trave o abdômen.',
      'Desça mantendo o tronco na vertical absoluta.',
      'Empurre o chão com os calcanhares sem deixar os cotovelos caírem.'
    ],
    checkpoints: [
      'Cotovelos apontam rigorosamente para a frente (se caírem, a barra rola).',
      'Tronco muito mais vertical que no agachamento traseiro.',
      'Profundidade completa.'
    ],
    respiracao: 'Inspire e trave o tórax antes de descer; expire no topo.',
    erro_comum: 'Deixar os cotovelos caírem para baixo, provocando a curvatura da coluna torácica e perda da barra.',
    beneficio: 'Produz altíssima ativação eletromiográfica nos quadríceps com menor estresse de cisalhamento na coluna lombar.'
  },
  64: {
    id: 64,
    slug: 'agachamento-bulgaro',
    nome: 'Agachamento Búlgaro',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteo Máximo (Unilateral)',
    sinergistas: 'Glúteo Médio, Isquiotibiais e Core',
    equipamento: 'Banco Reto + Halteres nas Mãos',
    posicao_inicial: 'Em pé a cerca de dois a três passos de distância do banco. Apoie o peito do pé de trás na borda do banco. O pé da frente fica firme e plano no solo, apontando para a frente.',
    concentrica: 'Empurre o chão firmemente através do calcanhar e meio do pé dianteiro até retornar à posição inicial, estendendo o joelho da frente sem hiperextensão.',
    excentrica: 'Desça o joelho de trás em direção ao chão em 2 a 3 segundos, mantendo o tronco levemente inclinado para a frente em cerca de 15° para alinhar as forças articulares.',
    passos: [
      'Apoie o peito do pé no banco e dê um passo à frente com a outra perna.',
      'Mantenha o peito aberto e halteres ao lado do corpo.',
      'Desça o quadril até o joelho traseiro quase encostar no solo.',
      'Empurre o piso com a perna da frente de forma controlada.'
    ],
    checkpoints: [
      'Joelho da frente permanece alinhado com o segundo dedo do pé.',
      'Descida profunda com o joelho de trás chegando a 2-3 cm do chão.',
      'Sem deixar a perna de trás fazer a força principal (ela serve apenas de apoio/equilíbrio).'
    ],
    respiracao: 'Inspire na descida lenta; expire empurrando o chão na subida.',
    erro_comum: 'Empurrar com a perna de trás ou deixar o joelho dianteiro desabar para dentro em valgo dinâmico.',
    beneficio: 'O exercício unilateral mais completo para desenvolvimento de força, equilíbrio pélvico e hipertrofia profunda de glúteos e quadríceps.'
  },
  65: {
    id: 65,
    slug: 'leg-press-45',
    nome: 'Leg Press 45°',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Vasto Medial, Lateral e Intermédio) e Glúteos',
    sinergistas: 'Adutores e Isquiotibiais',
    equipamento: 'Máquina Leg Press 45°',
    posicao_inicial: 'Sentado com a coluna lombar e o sacro 100% colados no encosto do banco. Pés apoiados na plataforma na largura dos ombros no terço médio da chapa.',
    concentrica: 'Destrave a máquina e empurre a plataforma para cima com a força das coxas até estender quase totalmente os joelhos (parando a 95%, sem trancar a articulação).',
    excentrica: 'Desça a plataforma de forma controlada em 3 segundos até que os joelhos atinjam um ângulo de 90° ou mais, sem permitir que a bacia e a lombar decolem do banco.',
    passos: [
      'Acomode-se no banco colando a lombar e segure as manoplas laterais com firmeza.',
      'Apoie os pés na largura dos ombros.',
      'Destrave a máquina e desça a plataforma de forma suave e profunda.',
      'Empurre estendendo as pernas sem estalar ou travar os joelhos no topo.'
    ],
    checkpoints: [
      'Lombar e glúteos NUNCA descolam do encosto (retroversão pélvica sob carga no leg press é causa primária de hérnias).',
      'Joelhos apontam na mesma direção das pontas dos pés durante a descida.',
      'Nunca travar/bloquear os joelhos em hiperextensão no topo.'
    ],
    respiracao: 'Inspire durante a descida da plataforma; expire com força na subida.',
    erro_comum: 'Descer peso excessivo até a pelve enrolar para cima descolando do encosto, comprimindo brutalmente os discos lombares L4-L5-S1.',
    beneficio: 'Permite aplicar sobrecarga progressiva imensa nos quadríceps com segurança lombar total, desde que respeitada a anatomia do encosto.'
  },
  66: {
    id: 66,
    slug: 'leg-press-horizontal',
    nome: 'Leg Press Horizontal',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps',
    sinergistas: 'Glúteos e Panturrilhas',
    equipamento: 'Máquina Leg Press Horizontal com Cabo/Placas',
    posicao_inicial: 'Sentado com as costas coladas no encosto vertical e pés apoiados na placa frontal.',
    concentrica: 'Empurre a placa estendendo as pernas de forma suave e contínua.',
    excentrica: 'Retorne em 3 segundos até 90° nos joelhos sem bater as placas de peso.',
    passos: [
      'Ajuste a distância do assento.',
      'Apoie os pés na largura do quadril.',
      'Empurre estendendo os joelhos com controle.',
      'Retorne de forma suave.'
    ],
    checkpoints: ['Costas coladas', 'Movimento linear macio', 'Sem bloquear os joelhos'],
    respiracao: 'Inspire na descida; expire ao empurrar.',
    erro_comum: 'Retirar as mãos das alças e empurrar os próprios joelhos.',
    beneficio: 'Excelente opção de baixo impacto e fácil regulagem para hipertrofia com carga constante.'
  },
  67: {
    id: 67,
    slug: 'cadeira-extensora',
    nome: 'Cadeira Extensora',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Isolamento do Reto Femoral e Vastos)',
    sinergistas: 'Tensor da Fáscia Lata',
    equipamento: 'Máquina Cadeira Extensora',
    posicao_inicial: 'Sentado com as costas completamente apoiadas no encosto. Ajuste o rolo acolchoado para ficar logo acima da articulação do tornozelo (sobre a canela inferior). O eixo do joelho deve ficar perfeitamente alinhado com o eixo giratório da máquina. Segure as manoplas laterais com força puxando o quadril contra o assento.',
    concentrica: 'Estenda os joelhos para cima de forma contínua até a extensão completa das pernas, sustentando 1 a 2 segundos de contração isométrica no topo.',
    excentrica: 'Desça o rolo de forma lenta e controlada em 3 segundos parando antes que as placas de peso se toquem, mantendo a musculatura sob tensão contínua.',
    passos: [
      'Ajuste o encosto para alinhar os joelhos ao pivô da máquina.',
      'Posicione o rolo sobre a parte inferior da canela.',
      'Segure as manoplas firmemente para travar a bacia no banco.',
      'Estenda as pernas totalmente, espremendo o quadríceps por 1-2 segundos no topo, e desça em 3 segundos.'
    ],
    checkpoints: [
      'Quadril permanece colado no assento (não levantar a bunda durante a subida).',
      'Pausa de 1 a 2 segundos com as pernas retas no pico de contração.',
      'Descida lenta de 3 segundos para aproveitar a fase excêntrica.'
    ],
    respiracao: 'Inspire na descida do peso; expire com força enquanto estende as pernas.',
    erro_comum: 'Chutar o peso com velocidade balística usando impulso das placas, gerando impacto perigoso na cartilagem patelofemoral.',
    beneficio: 'O único exercício que recruta em encurtamento máximo o reto femoral (músculo biarticular do quadríceps que não é totalmente trabalhado no agachamento).'
  },
  68: {
    id: 68,
    slug: 'passada-walking-lunges',
    nome: 'Passada (Walking Lunges)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteo Máximo e Estabilidade Dinâmica',
    sinergistas: 'Isquiotibiais, Panturrilhas e Core',
    equipamento: 'Halteres nas Mãos ou Barra nas Costas',
    posicao_inicial: 'Em pé com pés juntos segurando halteres ao lado do corpo. Olhar para a frente e tronco ereto.',
    concentrica: 'Dê um passo amplo à frente e desça o joelho de trás até quase encostar no solo. Empurre com o calcanhar da perna da frente para avançar e dar o próximo passo.',
    excentrica: 'Amorteça a pisada de forma suave em 2 segundos sem impacto do joelho traseiro contra o piso.',
    passos: [
      'Dê um passo à frente com amplitude média.',
      'Desça o joelho de trás em direção ao chão com tronco ereto.',
      'Empurre o chão com a perna da frente e avance diretamente para o próximo passo.',
      'Mantenha o ritmo contínuo em linha reta.'
    ],
    checkpoints: ['Joelho dianteiro alinhado com o pé', 'Passos consistentes em linha reta', 'Tronco firme'],
    respiracao: 'Respire continuamente a cada passada.',
    erro_comum: 'Dar passos curtos demais jogando a patela para a frente com sobrecarga no tendão.',
    beneficio: 'Excelente estímulo metabólico e funcional dinâmico para pernas e glúteos em locomoção real.'
  },
  69: {
    id: 69,
    slug: 'afundo-com-halteres',
    nome: 'Afundo com Halteres',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteo Máximo',
    sinergistas: 'Adutores e Core',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com uma perna à frente e outra atrás (base estática de lunge). Halteres ao lado do corpo.',
    concentrica: 'Empurre o solo com a perna dianteira estendendo o joelho até a posição inicial.',
    excentrica: 'Desça o joelho traseiro em linha reta vertical em 2 a 3 segundos.',
    passos: [
      'Monte a base com uma perna à frente e outra atrás.',
      'Desça o quadril verticalmente.',
      'Pare com o joelho traseiro a 2 cm do chão.',
      'Suba com o esforço focado na perna da frente.'
    ],
    checkpoints: ['Pés permanecem no mesmo lugar durante toda a série', 'Descida vertical (não para a frente)', 'Coluna alinhada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Inclinar o joelho da frente para dentro.',
    beneficio: 'Base estática que facilita o equilíbrio em comparação com a passada, ideal para aplicar sobrecarga progressiva.'
  },
  70: {
    id: 70,
    slug: 'sissy-squat',
    nome: 'Sissy Squat',
    grupo: 'Quadríceps',
    alvo: 'Reto Femoral e Vasto Medial (Alongamento Máximo do Quadríceps)',
    sinergistas: 'Flexores do Quadril e Core',
    equipamento: 'Suporte de Sissy Squat ou Peso Corporal com Apoio de Mão',
    posicao_inicial: 'Pés presos nos rolos do banco sissy squat (ou na ponta dos pés no solo segurando um suporte). Tronco, quadril e coxas formando uma linha perfeitamente reta.',
    concentrica: 'Empurre com a força dos quadríceps estendendo os joelhos até voltar à postura em pé.',
    excentrica: 'Incline o tronco para trás flexionando os joelhos em 3 segundos, projetando os joelhos para a frente enquanto a coluna permanece alinhada com as coxas.',
    passos: [
      'Prenda os pés no suporte do sissy squat.',
      'Trave o abdômen e mantenha as coxas e tronco alinhados.',
      'Desça inclinando o corpo para trás com os joelhos avançando.',
      'Empurre estendendo os quadríceps com força pura.'
    ],
    checkpoints: [
      'Manter linha reta entre tronco e coxas (sem flexionar o quadril).',
      'Descida compassada sem despencar.',
      'Exige joelhos saudáveis.'
    ],
    respiracao: 'Inspire descendo; expire estendendo os joelhos.',
    erro_comum: 'Dobrar o quadril para trás como em um agachamento comum.',
    beneficio: 'Isolamento extremo do quadríceps na posição de maior alongamento do reto femoral, estimulando crescimento muscular acelerado.'
  },
  215: {
    id: 215,
    slug: 'agachamento-hack-maquina',
    nome: 'Agachamento Hack na Máquina (Hack Squat)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Vasto Lateral e Medial)',
    sinergistas: 'Glúteos e Adutores',
    equipamento: 'Máquina Hack Squat',
    posicao_inicial: 'Ombros e costas bem apoiados no encosto móvel da máquina. Pés na largura dos ombros na parte inferior da plataforma.',
    concentrica: 'Destrave a máquina e empurre a plataforma para cima com a força das coxas até estender os joelhos a 95%.',
    excentrica: 'Desça de forma suave em 3 segundos até flexão profunda dos joelhos sem descolar a coluna lombar.',
    passos: [
      'Encaixe os ombros nas almofadas e apoie a coluna.',
      'Destrave os ganchos da máquina.',
      'Desça controlando até a quebra da paralela.',
      'Empurre acelerando através de toda a sola do pé.'
    ],
    checkpoints: ['Coluna colada no encosto', 'Joelhos acompanham os dedos dos pés', 'Profundidade máxima segura'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Tirar os calcanhares da plataforma durante a descida.',
    beneficio: 'Um dos melhores construtores de volume para o quadríceps, com suporte total para a coluna vertebral.'
  },
  216: {
    id: 216,
    slug: 'agachamento-zercher-barra',
    nome: 'Agachamento Zercher com Barra',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteos e Core Anterior Brutal',
    sinergistas: 'Trapézio, Braquial e Eretores da Espinha',
    equipamento: 'Barra Olímpica na Dobra dos Cotovelos',
    posicao_inicial: 'Segure a barra aninhada na dobra dos cotovelos (com os braços flexionados e mãos unidas). Pés na largura dos ombros, peito erguido.',
    concentrica: 'Empurre o chão mantendo o tronco ereto até a extensão dos joelhos.',
    excentrica: 'Agache profundamente descendo a barra entre as pernas em 2 a 3 segundos.',
    passos: [
      'Acomode a barra na dobra dos cotovelos e junte as mãos.',
      'Afaste os pés e trave o abdômen.',
      'Desça profundamente com os cotovelos passando por dentro dos joelhos.',
      'Suba mantendo o tronco firme e vertical.'
    ],
    checkpoints: ['Barra segura firme na dobra do cotovelo', 'Tronco ereto', 'Profundidade profunda'],
    respiracao: 'Inspire antes de descer; expire no topo.',
    erro_comum: 'Arredondar a coluna torácica sob o peso da barra.',
    beneficio: 'Constrói um core de aço indestrutível e pernas maciças, com centro de gravidade muito baixo.'
  },
  217: {
    id: 217,
    slug: 'agachamento-taca-goblet-squat',
    nome: 'Agachamento Taça com Halter ou Kettlebell (Goblet Squat)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteos e Mobilidade Pélvica',
    sinergistas: 'Core e Adutores',
    equipamento: '1 Halter Pesado ou Kettlebell no Peito',
    posicao_inicial: 'Em pé segurando o halter na vertical colado contra o peito com ambas as mãos sob as anilhas superiores.',
    concentrica: 'Empurre o solo ficando em pé de forma fluida.',
    excentrica: 'Desça em agachamento profundo em 3 segundos com os cotovelos passando por dentro dos joelhos.',
    passos: [
      'Segure o halter na linha do esterno com cotovelos para baixo.',
      'Afaste os pés ligeiramente além dos ombros.',
      'Agache profundamente com o peito erguido.',
      'Empurre o chão com os calcanhares para subir.'
    ],
    checkpoints: ['Halter colado ao peito durante todo o tempo', 'Cotovelos abrem os joelhos no fundo', 'Coluna neutra'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar o halter se afastar do peito, sobrecarregando os ombros e a lombar.',
    beneficio: 'O melhor agachamento pedagógico do mundo para aprender a mecânica perfeita com o tronco vertical.'
  },
  218: {
    id: 218,
    slug: 'agachamento-sumo-halter-pesado',
    nome: 'Agachamento Sumô com Halter Pesado',
    grupo: 'Quadríceps',
    alvo: 'Adutores, Glúteos e Quadríceps',
    sinergistas: 'Isquiotibiais',
    equipamento: '1 Halter Pesado pendendo entre as pernas',
    posicao_inicial: 'Pés bem afastados com pontas viradas a 45° para fora. Halter seguro com os braços estendidos para baixo.',
    concentrica: 'Empurre o chão aproximando os adutores e glúteos até a postura ereta.',
    excentrica: 'Desça flexionando os joelhos bem abertos em 3 segundos até o halter quase tocar o piso.',
    passos: [
      'Abra a base com pés apontando para fora.',
      'Segure o halter com os braços esticados.',
      'Desça o quadril verticalmente mantendo os joelhos abertos.',
      'Suba apertando a parte interna das coxas.'
    ],
    checkpoints: ['Joelhos acompanham os pés para fora', 'Tronco reto', 'Halter desce no centro'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar os joelhos fecharem para dentro na subida.',
    beneficio: 'Desenvolvimento potente dos músculos adutores da coxa e do glúteo máximo.'
  },
  219: {
    id: 219,
    slug: 'agachamento-bulgaro-smith',
    nome: 'Agachamento Búlgaro no Smith',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos com Estabilidade Guiada',
    sinergistas: 'Core',
    equipamento: 'Smith Machine + Banco Atrás',
    posicao_inicial: 'Pé de trás apoiado no banco, pé da frente sob a barra do Smith nos ombros.',
    concentrica: 'Empurre verticalmente nos trilhos com a perna dianteira.',
    excentrica: 'Desça em 3 segundos até o joelho traseiro chegar próximo ao solo.',
    passos: [
      'Posicione o banco atrás do Smith.',
      'Apoie o pé de trás e posicione a perna da frente.',
      'Destrave a barra apoiada nos trapézios.',
      'Desça de maneira suave e empurre até o topo.'
    ],
    checkpoints: ['Trilho alinhado ao centro de gravidade', 'Descida profunda', 'Estabilidade total'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Pressionar com a ponta do pé em vez do calcanhar.',
    beneficio: 'Elimina o fator equilíbrio do agachamento búlgaro, permitindo usar cargas muito mais elevadas.'
  },
  220: {
    id: 220,
    slug: 'agachamento-pistola-pistol-squat',
    nome: 'Agachamento Pistola Unilateral (Pistol Squat)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Força Unilateral Pura e Equilíbrio',
    sinergistas: 'Glúteos, Tornozelos e Core',
    equipamento: 'Peso Corporal (Chão ou Caixa)',
    posicao_inicial: 'Em pé sobre uma perna só com a outra perna estendida para a frente no ar. Braços estendidos à frente para contrapeso.',
    concentrica: 'Empurre o solo com força máxima da perna de apoio até a extensão completa.',
    excentrica: 'Agache sobre uma perna em 3 segundos descendo até o bumbum quase tocar o calcanhar com a perna livre estendida à frente.',
    passos: [
      'Equilibre-se em uma perna e estenda a outra para frente.',
      'Desça profundamente controlando a velocidade.',
      'Mantenha o calcanhar colado no chão.',
      'Empurre o chão até ficar em pé novamente.'
    ],
    checkpoints: [
      'Calcanhar nunca sai do chão (exige excelente dorsiflexão).',
      'Perna livre não toca o solo.',
      'Controle excêntrico estrito.'
    ],
    respiracao: 'Inspire na descida; expire com força máxima na subida.',
    erro_comum: 'Levantar o calcanhar do chão jogando todo o peso na ponta dos dedos.',
    beneficio: 'O ápice da força relativa e controle neuromuscular unilateral dos membros inferiores.'
  },
  221: {
    id: 221,
    slug: 'passada-barra-costas-walking-lunge',
    nome: 'Passada com Barra nas Costas (Walking Lunge)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteos e Força Funcional',
    sinergistas: 'Core e Isquiotibiais',
    equipamento: 'Barra Olímpica nos Ombros + Espaço para Caminhada',
    posicao_inicial: 'Barra apoiada nos trapézios como no agachamento. Em pé com pés juntos.',
    concentrica: 'Caminhe dando passos longos alternados descendo em lunge a cada pisada.',
    excentrica: 'Amorteça suavemente com o joelho traseiro chegando próximo ao piso.',
    passos: [
      'Apoie a barra firme nas costas com escápulas travadas.',
      'Dê um passo à frente com base sólida.',
      'Desça o joelho de trás com controle.',
      'Avance para o próximo passo sem perder a postura.'
    ],
    checkpoints: ['Barra estável nas costas', 'Passadas ritmadas', 'Tronco reto'],
    respiracao: 'Respire continuamente.',
    erro_comum: 'Perder o equilíbrio lateral balançando a barra.',
    beneficio: 'Aumenta a sobrecarga geral de carga na passada sem fadiga da pegada nas mãos.'
  },
  222: {
    id: 222,
    slug: 'afundo-barra-smith',
    nome: 'Afundo com Barra no Smith',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos',
    sinergistas: 'Adutores',
    equipamento: 'Smith Machine',
    posicao_inicial: 'Barra nos ombros, base de afundo estático com uma perna à frente e outra atrás.',
    concentrica: 'Empurre a barra nos trilhos estendendo o joelho da frente.',
    excentrica: 'Desça em 3 segundos até 90° nos dois joelhos.',
    passos: [
      'Ajuste a base sob a barra do Smith.',
      'Destrave a barra nos ombros.',
      'Desça o quadril verticalmente.',
      'Suba acelerando a barra.'
    ],
    checkpoints: ['Base estática', 'Trilhos guiam o movimento', 'Tronco reto'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Dar passos curtos demais.',
    beneficio: 'Permite focar 100% no esforço muscular sem preocupação com instabilidade de equilíbrio.'
  },
  223: {
    id: 223,
    slug: 'afundo-reverso-halteres',
    nome: 'Afundo Reverso com Halteres (Reverse Lunge)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteo Máximo',
    sinergistas: 'Isquiotibiais e Core',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com pés juntos segurando halteres ao lado do corpo.',
    concentrica: 'Empurre com a perna da frente trazendo a perna traseira de volta à posição inicial.',
    excentrica: 'Dê um passo para trás descendo o joelho em direção ao solo em 2 segundos.',
    passos: [
      'Dê um passo firme para trás com uma perna.',
      'Desça o joelho até quase encostar no chão.',
      'Empurre o chão com o calcanhar da frente.',
      'Retorne à posição de pé com pés juntos.'
    ],
    checkpoints: [
      'Passo dado para trás é muito mais amigável para a articulação do joelho.',
      'Canela dianteira permanece quase vertical.',
      'Tronco com leve inclinação à frente.'
    ],
    respiracao: 'Inspire no passo para trás; expire retornando à frente.',
    erro_comum: 'Bater o joelho traseiro com força no chão.',
    beneficio: 'Muito mais seguro para o tendão patelar do que o afundo frontal, reduzindo o estresse articular de desaceleração.'
  },
  224: {
    id: 224,
    slug: 'afundo-lateral-cossack-squat',
    nome: 'Afundo Lateral (Cossack Squat)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteos, Adutores e Mobilidade de Quadril/Tornozelo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Peso Corporal ou 1 Halter no Peito',
    posicao_inicial: 'Pés bem afastados (base bem ampla). Transfira o peso para uma das pernas enquanto a outra permanece estendida.',
    concentrica: 'Empurre o solo com a perna flexionada voltando à posição central ampla.',
    excentrica: 'Agache profundamente sobre um dos lados até o fundo, enquanto a perna oposta gira o calcanhar no solo com ponta dos dedos apontando para o teto.',
    passos: [
      'Abra uma base bem larga.',
      'Agache sobre o lado direito mantendo o calcanhar direito no solo.',
      'A perna esquerda fica esticada com ponta do pé para cima.',
      'Empurre de volta ao meio e repita para o lado esquerdo.'
    ],
    checkpoints: ['Calcanhar da perna flexionada colado no chão', 'Perna estendida com ponta para cima', 'Coluna ereta'],
    respiracao: 'Inspire descendo; expire subindo ao centro.',
    erro_comum: 'Tirar o calcanhar da perna que agacha do chão.',
    beneficio: 'Combina força unilateral com amplitude extrema de mobilidade do quadril, adutores e dorsiflexão.'
  },
  225: {
    id: 225,
    slug: 'step-up-caixa-halteres',
    nome: 'Step-Up na Caixa com Halteres (Subida no Banco)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteo Máximo',
    sinergistas: 'Panturrilhas e Core',
    equipamento: 'Caixa Pliométrica ou Banco + Halteres',
    posicao_inicial: 'Em pé de frente para a caixa segurando halteres. Apoie um pé inteiro sobre a caixa.',
    concentrica: 'Empurre a caixa com o calcanhar da perna de cima subindo até estender o corpo sem dar impulso com a perna de baixo.',
    excentrica: 'Desça em 3 segundos controlados pousando a perna de trás suavemente no solo.',
    passos: [
      'Coloque o pé inteiro firme sobre a caixa.',
      'Transfira o peso para a perna de cima.',
      'Suba usando exclusivamente a força da perna apoiada na caixa.',
      'Desça de maneira suave e lenta.'
    ],
    checkpoints: [
      'Pé inteiro na caixa (sem calcanhar para fora).',
      'Zero impulso do pé de baixo (não pular com a panturrilha de baixo).',
      'Descida lenta de 3s.'
    ],
    respiracao: 'Expire na subida; inspire na descida.',
    erro_comum: 'Dar um salto com a perna de baixo para ajudar a subir.',
    beneficio: 'Isola a extensão de joelho e quadril com zero impacto e grande ativação do glúteo máximo.'
  },
  226: {
    id: 226,
    slug: 'step-up-smith',
    nome: 'Step-Up no Smith',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos',
    sinergistas: 'Core',
    equipamento: 'Smith Machine + Banco ou Step sob a Barra',
    posicao_inicial: 'Barra nos ombros, um pé apoiado sobre a caixa sob o trilho.',
    concentrica: 'Suba na caixa estendendo a perna contra a barra do Smith.',
    excentrica: 'Desça em 3 segundos até o pé traseiro encostar no chão.',
    passos: [
      'Posicione a caixa sob a barra do Smith.',
      'Apoie o pé na caixa e destrave a barra nos ombros.',
      'Suba com força pura da perna superior.',
      'Desça de forma compassada.'
    ],
    checkpoints: ['Caixa travada no centro', 'Coluna alinhada', 'Descida sob controle'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Bater o pé de trás com força no solo.',
    beneficio: 'Permite usar sobrecargas muito maiores na subida de banco com estabilidade perfeita.'
  },
  227: {
    id: 227,
    slug: 'cadeira-extensora-unilateral',
    nome: 'Cadeira Extensora Unilateral',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Isolamento Unilateral)',
    sinergistas: 'Tensor da Fáscia Lata',
    equipamento: 'Cadeira Extensora',
    posicao_inicial: 'Sentado com uma perna só apoiada no rolo, a outra perna livre.',
    concentrica: 'Estenda o joelho até o pico de contração máxima, segurando 1 a 2 segundos.',
    excentrica: 'Desça em 3 segundos controlados resistindo à carga.',
    passos: [
      'Apoie apenas uma perna sob o rolo.',
      'Estenda o joelho totalmente.',
      'Aperte o quadríceps no topo.',
      'Desça suavemente até o início.'
    ],
    checkpoints: ['Contração isométrica de 1s no topo', 'Quadril firme no banco', 'Sem compensações'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Erguer o quadril do assento no final da extensão.',
    beneficio: 'Corrige assimetrias de força e volume entre as duas coxas com isolamento estrito.'
  },
  228: {
    id: 228,
    slug: 'leg-press-45-unilateral',
    nome: 'Leg Press 45° Unilateral',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos Unilateral',
    sinergistas: 'Adutores',
    equipamento: 'Máquina Leg Press 45°',
    posicao_inicial: 'Apoie apenas um pé no meio da plataforma, o outro pé repousa no chão ou apoio seguro.',
    concentrica: 'Empurre a plataforma com a perna ativa até a extensão segura.',
    excentrica: 'Desça a plataforma em 3 segundos até 90° no joelho sem descolar a lombar.',
    passos: [
      'Posicione um pé no centro da plataforma.',
      'Destrave a máquina segurando as manoplas.',
      'Desça com cadência lenta sentindo o quadríceps.',
      'Empurre estendendo a perna com controle.'
    ],
    checkpoints: ['Pé alinhado ao centro', 'Lombar colada no encosto', 'Sem travar o joelho'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Girar a bacia para o lado da perna livre.',
    beneficio: 'Garante que cada membro inferior desenvolva a mesma capacidade de força e hipertrofia.'
  },
  229: {
    id: 229,
    slug: 'leg-press-vertical-maquina',
    nome: 'Leg Press Vertical na Máquina',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Máquina Leg Press Vertical (90°)',
    posicao_inicial: 'Deitado de costas no solo com a plataforma diretamente acima da linha dos quadris.',
    concentrica: 'Empurre a plataforma verticalmente para cima até estender as pernas.',
    excentrica: 'Desça a plataforma em 3 segundos com os joelhos descendo em direção ao peito.',
    passos: [
      'Deite sob a plataforma com a lombar apoiada.',
      'Apoie os pés na largura dos ombros.',
      'Empurre para cima destravando os apoios.',
      'Desça de forma suave até 90°.'
    ],
    checkpoints: ['Trajetória 100% vertical', 'Lombar colada no chão/banco', 'Travas de segurança sempre ativas'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Tirar o quadril do solo no ponto mais baixo.',
    beneficio: 'Variação clássica dos anos 70 que direciona a carga pura da gravidade diretamente sobre as coxas.'
  },
  230: {
    id: 230,
    slug: 'agachamento-pausa-fundo',
    nome: 'Agachamento com Pausa de 3s no Fundo (Pause Squat)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps, Glúteos e Força de Arranque Isométrica',
    sinergistas: 'Core e Eretores',
    equipamento: 'Barra Olímpica na Gaiola',
    posicao_inicial: 'Posição idêntica ao agachamento livre convencional.',
    concentrica: 'Após a pausa imóvel de 3 segundos no fundo, exploda empurrando o chão até ficar em pé.',
    excentrica: 'Desça até a quebra da paralela e congele completamente estático por 3 segundos sem relaxar o core nem quicar.',
    passos: [
      'Desça no agachamento até a profundidade completa.',
      'Congele imóvel no fundo contando mentalmente: "1... 2... 3...".',
      'Mantenha o peito estufado e abdômen rígido.',
      'Suba com máxima potência concêntrica.'
    ],
    checkpoints: ['Pausa imóvel de 3 segundos reais', 'Zero relaxamento da musculatura no fundo', 'Subida explosiva'],
    respiracao: 'Inspire antes de descer, segure a respiração na pausa e expire na subida.',
    erro_comum: 'Relaxar a musculatura no ponto mais baixo e deixar a barra esmagar o corpo.',
    beneficio: 'Elimina a energia elástica do ciclo alongamento-encurtamento, construindo força concêntrica pura no ponto mais difícil do agachamento.'
  },
  231: {
    id: 231,
    slug: 'belt-squat-cinto',
    nome: 'Belt Squat (Agachamento com Cinto)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps e Glúteos com Carga na Cintura (Zero Carga Axial na Coluna)',
    sinergistas: 'Adutores',
    equipamento: 'Máquina Belt Squat ou Plataforma com Cinto de Carga',
    posicao_inicial: 'Cinto preso na cintura com o cabo/peso puxando diretamente a pelve para baixo. Pés na largura dos ombros.',
    concentrica: 'Empurre o solo estendendo as pernas até a postura ereta.',
    excentrica: 'Desça em 3 segundos controlados até a profundidade máxima.',
    passos: [
      'Prenda o cinto no quadril e suba na plataforma.',
      'Destrave a alavanca da máquina.',
      'Agache profundamente com os braços segurando as manoplas de apoio.',
      'Empurre o chão com as pernas voltando ao topo.'
    ],
    checkpoints: [
      'Zero compressão na coluna vertebral (a carga está na pelve, não nas costas).',
      'Profundidade completa com segurança total.',
      'Permite treinar mesmo com hérnia de disco ou dores nas costas.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Puxar o corpo com as mãos nas manoplas em vez de usar as pernas.',
    beneficio: 'A ferramenta definitiva para hipertrofia massiva de pernas quando a coluna vertebral precisa ser completamente poupada de carga axial.'
  },
  232: {
    id: 232,
    slug: 'agachamento-isometrico-parede-wall-sit',
    nome: 'Agachamento Isométrico na Parede (Wall Sit)',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Resistência Isométrica e Tendão Patelar)',
    sinergistas: 'Glúteos e Core',
    equipamento: 'Parede Lisa (Peso Corporal)',
    posicao_inicial: 'Costas apoiadas na parede. Deslize até que as coxas fiquem rigorosamente paralelas ao solo (joelhos a 90°) e as canelas verticais. Mãos ao lado do corpo ou estendidas.',
    concentrica: 'Mantenha a contração isométrica rígida pressionando os pés no chão e as costas contra a parede pelo tempo prescrito (ex: 45 a 60 segundos).',
    excentrica: 'Ao finalizar, empurre a parede subindo de volta à postura em pé.',
    passos: [
      'Encoste as costas na parede e deslize até 90° nos joelhos.',
      'Mantenha as canelas perpendiculares ao solo.',
      'Segure imóvel contraindo os quadríceps.',
      'Respire fundo até completar o tempo.'
    ],
    checkpoints: ['Ângulo exato de 90° nos joelhos e quadris', 'Costas coladas na parede', 'Mãos livres sem apoiar nas coxas'],
    respiracao: 'Mantenha respiração constante e diafragmática.',
    erro_comum: 'Apoiar as mãos nas coxas para tirar o peso dos quadríceps.',
    beneficio: 'O exercício de reabilitação e fortalecimento tendíneo mais prescrito por fisioterapeutas esportivos para tendinopatia patelar.'
  },
  233: {
    id: 233,
    slug: 'sissy-squat-carga-peito',
    nome: 'Sissy Squat com Carga no Peito',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Sobrecarga no Alongamento Máximo)',
    sinergistas: 'Reto Femoral',
    equipamento: 'Aparelho Sissy Squat + Anilha de 5kg a 10kg no Peito',
    posicao_inicial: 'Pés travados no banco sissy squat segurando a anilha colada contra o esterno.',
    concentrica: 'Estenda os joelhos até voltar à posição ereta.',
    excentrica: 'Incline o corpo para trás em 3 segundos até a flexão profunda dos joelhos.',
    passos: [
      'Prenda os pés e abrace a anilha no peito.',
      'Incline as costas para trás em bloco.',
      'Sustente a descida controlando a gravidade.',
      'Empurre estendendo as coxas de volta ao topo.'
    ],
    checkpoints: ['Anilha colada no peito', 'Tronco alinhado às coxas', 'Cadência lenta'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Soltar a anilha ou fazer o movimento rápido demais.',
    beneficio: 'Nível avançado de sobrecarga progressiva para hipertrofia do reto femoral.'
  },
  234: {
    id: 234,
    slug: 'agachamento-overhead-barra',
    nome: 'Agachamento OverHead com Barra (Overhead Squat)',
    grupo: 'Quadríceps',
    alvo: 'Membros Inferiores, Mobilidade Torácica, Ombros e Core',
    sinergistas: 'Trapézio, Glúteos e Tornozelos',
    equipamento: 'Barra Olímpica Estendida Acima da Cabeça com Pegada Larga de Snatch',
    posicao_inicial: 'Em pé com a barra bloqueada acima da cabeça com pegada bem aberta, escápulas ativas e punhos firmes.',
    concentrica: 'Empurre o solo estendendo joelhos e quadris mantendo a barra imóvel no mesmo ponto vertical acima da cabeça.',
    excentrica: 'Agache profundamente em 3 segundos mantendo o peito erguido e a barra estável alinhada sobre os calcanhares.',
    passos: [
      'Trave a barra acima da cabeça com braços esticados e pegada aberta.',
      'Afaste os pés e mantenha o olhar à frente.',
      'Agache com o tronco ereto sem deixar a barra tombar para a frente.',
      'Suba empurrando o chão com firmeza.'
    ],
    checkpoints: ['Barra alinhada sobre o meio dos pés o tempo todo', 'Braços 100% bloqueados', 'Profundidade completa'],
    respiracao: 'Inspire no topo com brace; segure na descida e expire no terço final da subida.',
    erro_comum: 'Projetar a barra para a frente na descida por falta de mobilidade torácica ou de tornozelo.',
    beneficio: 'O teste definitivo de mobilidade, flexibilidade, força e simetria de todo o corpo humano.'
  },

  // =========================================================================
  // POSTERIORES / ISQUIOTIBIAIS (18 EXERCÍCIOS)
  // =========================================================================
  71: {
    id: 71,
    slug: 'stiff-com-barra',
    nome: 'Stiff com Barra',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Bíceps Femoral, Semitendíneo e Semimembranáceo) e Glúteos',
    sinergistas: 'Eretores da Espinha e Adutor Magno',
    equipamento: 'Barra Olímpica + Anilhas',
    posicao_inicial: 'Em pé segurando a barra com pegada pronada na largura dos ombros. Pés na largura do quadril. Joelhos quase retos (mantendo apenas uma microflexão de 10°-15° congelada, sem dobrar durante o exercício). Coluna ereta com escápulas aduzidas.',
    concentrica: 'Empurre o quadril para a frente através da contração potente dos isquiotibiais e glúteos até voltar à postura ereta.',
    excentrica: 'Inicie projetando o quadril para trás enquanto desce a barra rente às pernas em 3 segundos, sentindo os isquiotibiais esticarem intensamente até a altura da canela média sem curvar a lombar.',
    passos: [
      'Destrave levemente os joelhos (10°) e congele essa angulação.',
      'Empurre a bacia para trás como se quisesse tocar a parede atrás com os glúteos.',
      'Desça a barra colada nas pernas sentindo o estiramento posterior da coxa.',
      'Estenda o quadril voltando à posição inicial apertando os glúteos no topo.'
    ],
    checkpoints: [
      'Coluna lombar totalmente neutra e travada durante todo o arco.',
      'Joelhos com microflexão fixa (não flexione mais os joelhos durante a descida).',
      'Barra desliza colada na coxa e canela (se afastar da perna gera torque lesivo na lombar).'
    ],
    respiracao: 'Inspire na descida controlada; expire na subida estendendo o quadril.',
    erro_comum: 'Arredondar a coluna lombar na tentativa de encostar a barra no chão, ignorando a flexibilidade dos isquiotibiais.',
    beneficio: 'O exercício de peso livre mais eficiente para hipertrofia dos isquiotibiais em posição de alongamento máximo sob sobrecarga.'
  },
  72: {
    id: 72,
    slug: 'stiff-com-halteres',
    nome: 'Stiff com Halteres',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais e Glúteos',
    sinergistas: 'Lombar',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé segurando os halteres na frente das coxas com joelhos quase retos.',
    concentrica: 'Estenda os quadris trazendo os halteres de volta ao topo.',
    excentrica: 'Desça os halteres rentes às canelas empurrando o quadril para trás em 3 segundos.',
    passos: [
      'Fique ereto com os halteres encostados nas coxas.',
      'Projete o quadril para trás mantendo os joelhos destravados.',
      'Desça até sentir grande alongamento nos posteriores.',
      'Suba com força de glúteos e posteriores.'
    ],
    checkpoints: ['Halteres colados às pernas', 'Coluna plana', 'Foco no quadril'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Afastar os halteres das pernas.',
    beneficio: 'Maior liberdade de posicionamento anatômico para as mãos em relação à barra rígida.'
  },
  73: {
    id: 73,
    slug: 'terra-romeno-rdl',
    nome: 'Levantamento Terra Romeno (RDL)',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais e Glúteo Máximo',
    sinergistas: 'Eretores da Espinha e Trapézio',
    equipamento: 'Barra Olímpica',
    posicao_inicial: 'Em pé com a barra nas mãos. Joelhos levemente mais flexionados que no stiff (cerca de 20°-25°).',
    concentrica: 'Estenda o quadril com força para a frente até a postura de pé.',
    excentrica: 'Execute um hip hinge puro levando o quadril para trás até a barra passar logo abaixo dos joelhos, parando antes do solo.',
    passos: [
      'Inicie a descida empurrando o quadril para trás.',
      'Permita flexão de 20° nos joelhos enquanto o quadril recua.',
      'Pare logo abaixo da patela quando os posteriores atingirem o estiramento máximo.',
      'Estenda o quadril com potência até ficar ereto.'
    ],
    checkpoints: [
      'Movimento focado na dobradiça de quadril (hip hinge).',
      'A barra desce logo abaixo dos joelhos (não vai até o solo).',
      'Coluna neutra.'
    ],
    respiracao: 'Inspire na descida; expire estendendo o quadril.',
    erro_comum: 'Transformar em agachamento dobrando os joelhos em demasia.',
    beneficio: 'Aumenta a participação do glúteo máximo e reduz a tensão excessiva no tendão distal dos isquiotibiais.'
  },
  74: {
    id: 74,
    slug: 'cadeira-flexora',
    nome: 'Cadeira Flexora',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Ênfase Máxima na Posição Sentada / Alongada)',
    sinergistas: 'Gastrocnêmio',
    equipamento: 'Máquina Cadeira Flexora',
    posicao_inicial: 'Sentado com a coluna e quadril bem apoiados. Ajuste o rolo acolchoado para ficar logo abaixo das panturrilhas (tendão de Aquiles). Trave a almofada superior firmemente sobre as coxas para impedir que as pernas subam.',
    concentrica: 'Flexione os joelhos puxando os calcanhares para baixo e para trás até a contração máxima sob o banco, segurando 1 segundo.',
    excentrica: 'Retorne em 3 segundos controlados até a extensão quase completa das pernas, aproveitando o alongamento.',
    passos: [
      'Trave o apoio sobre as coxas com firmeza absoluta.',
      'Posicione o rolo atrás dos calcanhares.',
      'Puxe os calcanhares para trás com força máxima dos posteriores.',
      'Sustente 1 segundo no fundo e retorne de maneira compassada.'
    ],
    checkpoints: [
      'Coxas perfeitamente travadas pela almofada superior.',
      'Pés em dorsiflexão neutra (dedos apontando para cima).',
      'Amplitude completa sem solavancos.'
    ],
    respiracao: 'Inspire na volta; expire puxando os calcanhares.',
    erro_comum: 'Não travar o suporte sobre as coxas, permitindo que o quadril se levante e retire a tensão dos isquiotibiais.',
    beneficio: 'A ciência recente comprovou que a cadeira flexora gera significativamente mais hipertrofia que a mesa flexora, pois o quadril flexionado a 90° coloca os isquiotibiais em maior alongamento passivo prévio.'
  },
  75: {
    id: 75,
    slug: 'mesa-flexora',
    nome: 'Mesa Flexora',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Bíceps Femoral e Semitendíneo)',
    sinergistas: 'Gastrocnêmio',
    equipamento: 'Máquina Mesa Flexora Deitada',
    posicao_inicial: 'Deitado de bruços com a bacia colada no estofado angulado. Rolo posicionado logo acima dos calcanhares. Segure as manoplas frontais.',
    concentrica: 'Flexione os joelhos puxando o rolo em direção aos glúteos, sustentando 1 segundo na contração máxima.',
    excentrica: 'Desça em 3 segundos controlados até as pernas ficarem quase retas sem encostar as placas de peso.',
    passos: [
      'Deite de bruços e segure as manoplas.',
      'Cole a bacia contra o banco durante todo o tempo.',
      'Puxe os calcanhares em direção aos glúteos.',
      'Retorne devagar sentindo os posteriores resistirem.'
    ],
    checkpoints: [
      'Pelve colada no banco (não empinar a bunda para cima na flexão).',
      'Manter os pés alinhados.',
      'Controle excêntrico de 3s.'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Levantar o quadril da mesa ao flexionar as pernas com carga pesada, encurtando o músculo de forma ineficaz.',
    beneficio: 'Excelente isolamento da flexão pura de joelho em decúbito ventral, com ênfase na cabeça curta do bíceps femoral.'
  },
  76: {
    id: 76,
    slug: 'flexora-em-pe-unilateral',
    nome: 'Flexora em Pé Unilateral',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Unilateral)',
    sinergistas: 'Panturrilha',
    equipamento: 'Máquina Standing Leg Curl',
    posicao_inicial: 'Em pé apoiando o peito no suporte, rolo encaixado atrás do calcanhar da perna ativa.',
    concentrica: 'Flexione o joelho puxando o calcanhar em direção ao glúteo.',
    excentrica: 'Desça em 3 segundos com controle.',
    passos: [
      'Apoie o tronco e posicione o rolo atrás da perna.',
      'Flexione o joelho com força unilateral.',
      'Aperte o posterior no topo por 1 segundo.',
      'Desça devagar até estender.'
    ],
    checkpoints: ['Perna de apoio firme', 'Sem inclinar o corpo de lado', 'Contração de 1s'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Dar tranco com a perna para iniciar a repetição.',
    beneficio: 'Corrige desbalanços de força entre as pernas com mecânica simples e direta.'
  },
  77: {
    id: 77,
    slug: 'good-morning',
    nome: 'Good Morning',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais, Glúteos e Eretores da Espinha',
    sinergistas: 'Adutores e Core',
    equipamento: 'Barra Olímpica nos Ombros (Trapézio)',
    posicao_inicial: 'Barra apoiada nos trapézios como no agachamento. Pés na largura do quadril com joelhos destravados.',
    concentrica: 'Estenda o quadril empurrando a bacia para a frente até ficar ereto.',
    excentrica: 'Incline o tronco para a frente empurrando o quadril para trás até o tronco ficar quase paralelo ao solo em 3 segundos.',
    passos: [
      'Apoie a barra firme nas costas.',
      'Projete o quadril para trás mantendo a coluna reta como uma tábua.',
      'Desça até o limite do alongamento dos posteriores.',
      'Estenda o quadril voltando à posição ereta.'
    ],
    checkpoints: ['Coluna estritamente neutra', 'Movimento do quadril e não da coluna', 'Carga moderada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Arredondar a coluna lombar sob a barra.',
    beneficio: 'Fortalece profundamente toda a cadeia posterior e eretores contra forças de flexão espinhal.'
  },
  235: {
    id: 235,
    slug: 'terra-romeno-rdl-halteres',
    nome: 'Levantamento Terra Romeno (RDL) com Halteres',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais e Glúteo Máximo',
    sinergistas: 'Lombar',
    equipamento: 'Par de Halteres',
    posicao_inicial: 'Em pé com halteres na frente das coxas com joelhos flexionados a 20°.',
    concentrica: 'Estenda os quadris até a postura vertical.',
    excentrica: 'Leve o quadril para trás descendo os halteres até abaixo dos joelhos em 3 segundos.',
    passos: [
      'Empurre o quadril para trás.',
      'Desça os halteres rentes às canelas.',
      'Sinta o estiramento profundo dos posteriores.',
      'Estenda o quadril apertando os glúteos.'
    ],
    checkpoints: ['Halteres colados ao corpo', 'Joelhos destravados', 'Coluna neutra'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Agachar em vez de realizar a dobradiça de quadril.',
    beneficio: 'Excelente para quem busca hipertrofia de posterior com liberdade nos punhos e ombros.'
  },
  236: {
    id: 236,
    slug: 'rdl-unilateral-halter-single-leg',
    nome: 'RDL Unilateral com Halter (Single-Leg RDL)',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais, Glúteo Médio e Estabilidade Pélvica',
    sinergistas: 'Core e Tornozelos',
    equipamento: '1 Halter na Mão Contralateral',
    posicao_inicial: 'Em pé sobre uma perna, segurando o halter na mão oposta. A outra perna fica estendida no ar atrás.',
    concentrica: 'Empurre o solo com a perna de apoio até ficar ereto.',
    excentrica: 'Incline o tronco para a frente enquanto a perna traseira sobe alinhada como uma gangorra em 3 segundos.',
    passos: [
      'Equilibre-se em uma perna com joelho levemente destravado.',
      'Incline o tronco para a frente enquanto a perna de trás sobe reta.',
      'Desça o halter até a linha da canela.',
      'Retorne estendendo o quadril de apoio.'
    ],
    checkpoints: [
      'Corpo e perna de trás formam uma linha reta contínua.',
      'Quadril nivelado (sem abrir a bacia para o lado).',
      'Equilíbrio e cadência uniforme.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Girar a bacia para o lado perdendo o alinhamento pélvico.',
    beneficio: 'O exercício número 1 de prevenção de lesões de isquiotibiais e fortalecimento de glúteo médio para corredores e atletas.'
  },
  237: {
    id: 237,
    slug: 'rdl-smith-calco',
    nome: 'RDL no Smith com Calço nos Calcanhares',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais e Glúteos',
    sinergistas: 'Lombar',
    equipamento: 'Smith Machine + Calço/Anilha sob os Pés',
    posicao_inicial: 'Em pé sobre o calço com a barra do Smith nas mãos.',
    concentrica: 'Estenda o quadril nos trilhos guiados.',
    excentrica: 'Desça em 3 segundos empurrando o quadril para trás.',
    passos: [
      'Apoie os pés no calço sob a barra.',
      'Destrave a barra do Smith.',
      'Execute a dobradiça de quadril até a linha da canela.',
      'Suba com força dos posteriores.'
    ],
    checkpoints: ['Trilho guiado', 'Coluna firme', 'Alongamento profundo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Solavancos rápidos na saída.',
    beneficio: 'Estabilidade guiada que permite focar 100% no estiramento dos isquiotibiais.'
  },
  238: {
    id: 238,
    slug: 'stiff-deficit-bloco',
    nome: 'Stiff com Déficit sobre Bloco de Madeira',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Amplitude Aumentada)',
    sinergistas: 'Glúteos e Lombar',
    equipamento: 'Barra Olímpica + Bloco de 10-15cm de Altura',
    posicao_inicial: 'Em pé sobre o bloco elevado com a barra nas mãos.',
    concentrica: 'Estenda o quadril voltando à postura ereta.',
    excentrica: 'Desça a barra além do nível dos pés aproveitando a profundidade extra em 3 segundos.',
    passos: [
      'Suba no bloco com base firme.',
      'Desça a barra colada às pernas passando do nível dos pés.',
      'Sinta o estiramento máximo dos posteriores.',
      'Suba com potência controlada.'
    ],
    checkpoints: ['Apenas para quem possui grande flexibilidade prévia', 'Coluna neutra', 'Sem flexionar os joelhos'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Arredondar as costas para tentar alcançar o fundo do déficit.',
    beneficio: 'Aumenta o percurso de alongamento para praticantes avançados com flexibilidade de elite.'
  },
  239: {
    id: 239,
    slug: 'flexao-nordica-nordic-hamstring',
    nome: 'Flexão Nórdica para Isquiotibiais (Nordic Hamstring)',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais (Sobrecarga Excêntrica Supramáxima)',
    sinergistas: 'Glúteos e Gastrocnêmio',
    equipamento: 'Colchonete + Parceiro segurando os tornozelos ou Apoio Travado',
    posicao_inicial: 'Ajoelhado no solo com tornozelos firmemente travados no chão. Corpo reto da cabeça aos joelhos com quadril estendido.',
    concentrica: 'Empurre o solo com as mãos no fundo para ajudar a impulsionar o retorno à posição vertical.',
    excentrica: 'Incline o corpo inteiro para a frente em bloco rígido, resistindo à gravidade o máximo possível com a força excêntrica pura dos isquiotibiais até tocar as mãos no chão.',
    passos: [
      'Trave os tornozelos com firmeza e mantenha o quadril esticado.',
      'Desça o tronco em direção ao chão resistindo com a parte de trás das coxas.',
      'Segure a descida o máximo de segundos que conseguir.',
      'Amorteça com as mãos no chão e empurre de volta.'
    ],
    checkpoints: [
      'Quadril permanece 100% estendido (não quebre a bacia para trás).',
      'Controle excêntrico puro resistindo à queda.',
      'Amortecimento seguro com as mãos.'
    ],
    respiracao: 'Inspire e trave o core antes de descer; expire ao tocar o solo.',
    erro_comum: 'Flexionar o quadril jogando o bumbum para trás para aliviar a carga nos posteriores.',
    beneficio: 'O exercício padrão ouro da literatura científica esportiva para prevenção de estiramentos musculares e aumento do comprimento dos fascículos dos isquiotibiais.'
  },
  240: {
    id: 240,
    slug: 'mesa-flexora-unilateral',
    nome: 'Mesa Flexora Unilateral',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais Unilateral',
    sinergistas: 'Panturrilha',
    equipamento: 'Mesa Flexora Deitada',
    posicao_inicial: 'Deitado de bruços com apenas uma perna sob o rolo.',
    concentrica: 'Flexione o joelho puxando o calcanhar até o glúteo.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Posicione uma perna sob o rolo.',
      'Cole a bacia no banco.',
      'Flexione com força estrita da perna ativa.',
      'Retorne de forma compassada.'
    ],
    checkpoints: ['Pelve colada no banco', 'Sem girar o quadril', 'Descida suave'],
    respiracao: 'Inspire descendo; expire puxando.',
    erro_comum: 'Levantar a bacia na subida.',
    beneficio: 'Garante que a perna dominante não compense o trabalho da perna mais fraca.'
  },
  241: {
    id: 241,
    slug: 'cadeira-flexora-unilateral',
    nome: 'Cadeira Flexora Unilateral',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais na Posição Alongada Unilateral',
    sinergistas: 'Gastrocnêmio',
    equipamento: 'Cadeira Flexora Sentada',
    posicao_inicial: 'Sentado com coxas travadas, uma perna sob o rolo.',
    concentrica: 'Flexione puxando o calcanhar sob o banco.',
    excentrica: 'Retorne em 3 segundos até a extensão total.',
    passos: [
      'Trave o suporte nas coxas.',
      'Puxe o calcanhar para trás e para baixo.',
      'Sustente 1 segundo.',
      'Suba devagar resistindo à carga.'
    ],
    checkpoints: ['Coxas travadas', 'Pico de contração de 1s', 'Controle excêntrico'],
    respiracao: 'Inspire na volta; expire puxando.',
    erro_comum: 'Deixar o joelho subir durante a série.',
    beneficio: 'Combina a hipertrofia superior da cadeira flexora com o benefício corretivo unilateral.'
  },
  242: {
    id: 242,
    slug: 'flexora-bola-suica',
    nome: 'Flexora de Pernas com Bola Suíça',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais e Glúteo Máximo com Instabilidade',
    sinergistas: 'Core e Panturrilhas',
    equipamento: 'Colchonete + Bola Suíça (Fitball)',
    posicao_inicial: 'Deitado de costas no chão com os calcanhares apoiados sobre o topo da bola suíça. Eleve o quadril formando uma ponte reta.',
    concentrica: 'Puxe a bola em direção aos glúteos flexionando os joelhos e elevando ainda mais o quadril.',
    excentrica: 'Role a bola para a frente estendendo as pernas em 3 segundos mantendo o quadril fora do chão.',
    passos: [
      'Deite de costas e apoie os calcanhares na bola.',
      'Eleve o quadril do solo.',
      'Puxe a bola com os calcanhares aproximando-a dos glúteos.',
      'Estenda as pernas controlando o retorno sem descer a bacia.'
    ],
    checkpoints: [
      'Quadril elevado do solo durante toda a série.',
      'Flexão de joelhos combinada com extensão de quadril.',
      'Estabilidade na bola.'
    ],
    respiracao: 'Inspire ao esticar as pernas; expire ao puxar a bola.',
    erro_comum: 'Deixar o quadril cair no chão durante o movimento.',
    beneficio: 'Ativa simultaneamente as duas funções anatômicas dos isquiotibiais (extensão do quadril e flexão do joelho) com estabilização do core.'
  },
  243: {
    id: 243,
    slug: 'flexora-polia-baixa-unilateral',
    nome: 'Flexora na Polia Baixa Unilateral em Pé',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais Unilateral',
    sinergistas: 'Panturrilha',
    equipamento: 'Polia Baixa + Tornozeleira',
    posicao_inicial: 'Em pé de frente para a polia baixa com tornozeleira presa no calcanhar, segurando a estrutura da máquina.',
    concentrica: 'Flexione o joelho puxando o calcanhar para cima em direção ao glúteo.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Prenda a tornozeleira no calcanhar.',
      'Flexione o joelho para trás e para cima.',
      'Aperte o posterior no topo por 1 segundo.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Tronco estável', 'Coxa alinhada com a outra perna', 'Pico de contração'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Mover a coxa para a frente durante a flexão.',
    beneficio: 'Tensão constante em todo o arco sem perda de contato com a carga.'
  },
  244: {
    id: 244,
    slug: 'good-morning-sentado-banco',
    nome: 'Good Morning Sentado no Banco',
    grupo: 'Posteriores',
    alvo: 'Eretores da Espinha, Glúteos e Adutores',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Banco Reto + Barra nos Ombros',
    posicao_inicial: 'Sentado a cavalo na ponta do banco com pernas afastadas e barra nos ombros.',
    concentrica: 'Estenda o tronco até voltar à postura ereta.',
    excentrica: 'Incline o tronco para a frente com coluna neutra em 3 segundos até o abdômen se aproximar do banco.',
    passos: [
      'Sente-se firme com pernas bem abertas.',
      'Barra apoiada nos trapézios com peito estufado.',
      'Incline o tronco para a frente com a coluna reta.',
      'Suba com a força da cadeia posterior.'
    ],
    checkpoints: ['Pernas afastadas travadas no chão', 'Coluna neutra sem corcunda', 'Movimento suave'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Arredondar as costas na descida.',
    beneficio: 'Elimina a participação das pernas e isola a musculatura extensora espinhal e adutora.'
  },
  245: {
    id: 245,
    slug: 'glute-ham-raise-ghr',
    nome: 'Glute Ham Raise (GHR Máquina)',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais Completos e Glúteo Máximo',
    sinergistas: 'Gastrocnêmio e Eretores',
    equipamento: 'Aparelho Glute Ham Developer (GHD)',
    posicao_inicial: 'Apoiado no GHD com pés travados na placa e coxas repousando na almofada arredondada.',
    concentrica: 'Puxe com os isquiotibiais flexionando os joelhos e erguendo o corpo até a vertical.',
    excentrica: 'Desça o corpo para a frente em linha reta estendendo os joelhos em 3 segundos controlados.',
    passos: [
      'Prenda os calcanhares com firmeza na máquina.',
      'Desça o corpo em linha reta para a frente.',
      'Puxe os joelhos contra a almofada curvada subindo o corpo.',
      'Finalize com o tronco reto no topo.'
    ],
    checkpoints: ['Movimento conduzido pelos isquiotibiais', 'Sem dobrar o quadril', 'Ampla extensão'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Quebrar o quadril para trás perdendo a linha rígida do corpo.',
    beneficio: 'O ápice da força funcional para velocistas e atletas, treinando os isquiotibiais nas duas extremidades simultaneamente.'
  },

  // =========================================================================
  // GLÚTEOS (20 EXERCÍCIOS)
  // =========================================================================
  78: {
    id: 78,
    slug: 'elevacao-pelvica-hip-thrust',
    nome: 'Elevação Pélvica (Hip Thrust)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Pico de Contração com Sobrecarga Máxima)',
    sinergistas: 'Isquiotibiais, Adutores e Core',
    equipamento: 'Banco Reto + Barra Olímpica com Protetor Almofadado + Anilhas',
    posicao_inicial: 'Sentado no chão de costas para o banco. Apoie a borda inferior das escápulas na borda do banco. Role a barra acolchoada sobre o quadril (na dobra anterior da bacia). Pés cravados no chão na largura dos ombros.',
    concentrica: 'Empurre o solo com os calcanhares estendendo completamente o quadril até que o tronco, bacia e coxas formem uma linha reta paralela ao chão, sustentando 1 a 2 segundos de contração máxima esmagando os glúteos.',
    excentrica: 'Desça o quadril de forma controlada em 2 a 3 segundos até que as anilhas quase toquem o solo, mantendo o queixo recolhido para o peito.',
    passos: [
      'Apoie a linha das escápulas na borda do banco com a barra acolchoada sobre o quadril.',
      'Posicione os pés de modo que as canelas fiquem rigorosamente verticais no topo do movimento.',
      'Empurre pelos calcanhares estendendo o quadril até a linha neutra.',
      'Aperte os glúteos no topo por 1-2 segundos e desça com controle.'
    ],
    checkpoints: [
      'Canelas rigorosamente verticais (90°) no topo do movimento.',
      'Queixo mantido colado ao peito e olhar voltado para a frente (impede hiperextensão lombar).',
      'Extensão completa do quadril no topo sem arquear a coluna.'
    ],
    respiracao: 'Inspire na descida; expire com força máxima no impulso de subida espremendo os glúteos.',
    erro_comum: 'Hiperestender a coluna lombar no topo jogando a cabeça para trás, o que desativa os glúteos e transfere a sobrecarga para a lombar.',
    beneficio: 'O exercício número 1 da ciência mundial para hipertrofia e força máxima do glúteo máximo, gerando o maior pico de tensão na posição encurtada.'
  },
  79: {
    id: 79,
    slug: 'elevacao-pelvica-maquina',
    nome: 'Elevação Pélvica na Máquina',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Máquina Hip Thrust Machine',
    posicao_inicial: 'Sentado na máquina com o cinto acolchoado afivelado com firmeza sobre o quadril. Pés na plataforma.',
    concentrica: 'Empurre o cinto para cima estendendo a pelve até o topo, segurando 2 segundos.',
    excentrica: 'Desça em 3 segundos até o alongamento sem bater as placas de peso.',
    passos: [
      'Aperte o cinto de segurança sobre o quadril.',
      'Apoie os pés na plataforma na largura dos ombros.',
      'Estenda o quadril empurrando a almofada para o alto.',
      'Sustente a contração e desça de forma suave.'
    ],
    checkpoints: ['Cinto bem ajustado', 'Pausa no topo', 'Movimento contínuo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Fazer o movimento incompleto sem estender o quadril até a linha reta.',
    beneficio: 'Praticidade total para treinar pesado sem o incômodo de montar e carregar a barra olímpica no chão.'
  },
  80: {
    id: 80,
    slug: 'gluteo-polia-baixa',
    nome: 'Glúteo na Polia Baixa',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Extensão Pura com Cabo)',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Polia Baixa + Tornozeleira',
    posicao_inicial: 'Em pé de frente para a polia com tornozeleira presa no calcanhar. Segure a barra de apoio com tronco ligeiramente inclinado para a frente.',
    concentrica: 'Estenda a perna para trás em arco sem arquear a coluna lombar, apertando o glúteo no topo por 1 a 2 segundos.',
    excentrica: 'Retorne em 3 segundos controlando a tração do cabo.',
    passos: [
      'Prenda a tornozeleira e incline o tronco 30°.',
      'Chute para trás e para cima estendendo o quadril.',
      'Esprema o glúteo no ápice.',
      'Retorne devagar acompanhando o cabo.'
    ],
    checkpoints: [
      'O movimento ocorre exclusivamente no quadril (coluna lombar permanece imóvel).',
      'Pausa de contração isométrica no topo.',
      'Joelho da perna ativa quase reto ou com leve flexão fixa.'
    ],
    respiracao: 'Inspire no retorno; expire no chute para trás.',
    erro_comum: 'Balançar o tronco para a frente e arquear as costas a cada repetição.',
    beneficio: 'Mantém tensão mecânica constante durante toda a extensão do quadril, permitindo conexão mente-músculo cirúrgica.'
  },
  81: {
    id: 81,
    slug: 'cadeira-abdutora',
    nome: 'Cadeira Abdutora',
    grupo: 'Glúteos',
    alvo: 'Glúteo Médio e Mínimo (Porção Superior e Lateral do Glúteo)',
    sinergistas: 'Tensor da Fáscia Lata',
    equipamento: 'Máquina Cadeira Abdutora',
    posicao_inicial: 'Sentado com as costas coladas no encosto ou com o tronco ligeiramente inclinado para a frente (para maior ênfase no glúteo médio/máximo superior). Almofadas apoiadas na face externa dos joelhos.',
    concentrica: 'Afaste as pernas abrindo os joelhos com força máxima para fora, sustentando 1 a 2 segundos de contração no ponto mais aberto.',
    excentrica: 'Feche as pernas de forma lenta em 3 segundos resistindo ao retorno antes que os pesos encostem na pilha.',
    passos: [
      'Ajuste o ângulo do encosto e sente-se com joelhos apoiados nas almofadas.',
      'Empurre as almofadas para fora abrindo as pernas o máximo possível.',
      'Segure a contração isométrica por 1-2 segundos.',
      'Retorne devagar sem deixar o peso bater.'
    ],
    checkpoints: [
      'Força exercida a partir dos joelhos e não dos pés.',
      'Pausa estática de 1-2 segundos no ponto de máxima abertura.',
      'Tronco estável sem balançar.'
    ],
    respiracao: 'Inspire ao fechar; expire ao abrir as pernas com força.',
    erro_comum: 'Fazer o exercício de forma rápida e quicada sem pausa no ponto de abertura.',
    beneficio: 'Essencial para preenchimento lateral dos glúteos e estabilização da pelve contra o valgo dinâmico do joelho.'
  },
  246: {
    id: 246,
    slug: 'elevacao-pelvica-hip-thrust-halter',
    nome: 'Elevação Pélvica (Hip Thrust) com Halter Pesado',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Banco Reto + 1 Halter Pesado no Quadril',
    posicao_inicial: 'Escápulas no banco, halter pesado apoiado confortavelmente sobre a linha da pelve.',
    concentrica: 'Empurre o solo estendendo o quadril até a linha reta.',
    excentrica: 'Desça em 3 segundos com controle.',
    passos: [
      'Apoie as escápulas e coloque o halter sobre o quadril.',
      'Estenda o quadril apertando os glúteos no topo.',
      'Sustente 1 segundo.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Halter firme com as mãos', 'Canelas verticais', 'Glúteo espremido no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar o halter rolar durante a série.',
    beneficio: 'Opção rápida e extremamente eficaz quando as barras olímpicas da academia estão ocupadas.'
  },
  247: {
    id: 247,
    slug: 'hip-thrust-unilateral-chao-banco',
    nome: 'Hip Thrust Unilateral no Chão ou Banco',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Unilateral) e Glúteo Médio',
    sinergistas: 'Core e Isquiotibiais',
    equipamento: 'Banco ou Solo (Peso Corporal ou Halter)',
    posicao_inicial: 'Escápulas no banco com uma perna plantada no chão e a outra perna erguida no ar com joelho dobrado.',
    concentrica: 'Empurre o chão com o calcanhar da perna de apoio até estender completamente a pelve.',
    excentrica: 'Desça em 3 segundos com velocidade controlada.',
    passos: [
      'Apoie as costas e levante uma perna no ar.',
      'Empurre o chão com a perna de apoio até o topo.',
      'Aperte o glúteo unilateral por 1 segundo.',
      'Desça de forma suave.'
    ],
    checkpoints: [
      'Pelve nivelada durante todo o movimento (sem deixar um lado cair).',
      'Extensão completa no topo.',
      'Zero impulso.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Girar a bacia para o lado da perna que está no ar.',
    beneficio: 'Elimina assimetrias pélvicas de força e volume entre os lados direito e esquerdo.'
  },
  248: {
    id: 248,
    slug: 'hip-thrust-smith',
    nome: 'Hip Thrust no Smith',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Smith Machine + Banco Reto + Protetor de Barra',
    posicao_inicial: 'Posicione o banco paralelo à barra do Smith. Acomode a barra acolchoada sobre a bacia e destrave com as mãos.',
    concentrica: 'Empurre a barra para cima pelos trilhos estendendo o quadril até o pico.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Alinhe o banco no centro do Smith.',
      'Destrave a barra no quadril.',
      'Estenda o quadril até o alinhamento total.',
      'Trave os ganchos com facilidade ao terminar.'
    ],
    checkpoints: ['Trilho vertical alinhado à pelve', 'Trava de segurança na altura do chão', 'Pausa no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Destravar a barra sem firmar os pés no chão.',
    beneficio: 'Permite treinar até a falha absoluta com cargas pesadas graças às travas rápidas do Smith.'
  },
  249: {
    id: 249,
    slug: 'ponte-gluteos-barra-glute-bridge',
    nome: 'Ponte de Glúteos no Solo com Barra (Glute Bridge)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Colchonete no Chão + Barra Acolchoada',
    posicao_inicial: 'Deitado de costas no chão com joelhos dobrados a 90° e pés planos no solo. Barra acolchoada sobre o quadril.',
    concentrica: 'Empurre os calcanhares no chão elevando a pelve até formar uma linha reta entre joelhos e ombros.',
    excentrica: 'Desça o quadril até tocar de leve o solo em 2 segundos.',
    passos: [
      'Deite no chão com a barra no quadril.',
      'Firme os pés e eleve a bacia para o teto.',
      'Sustente 1 a 2 segundos de contração máxima.',
      'Desça suavemente até encostar no colchonete.'
    ],
    checkpoints: ['Costas coladas no solo', 'Subida até alinhar joelho-quadril-ombro', 'Pés firmes'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Hiperestender a coluna lombar descolando as escápulas do chão.',
    beneficio: 'Apoio no solo que elimina a instabilidade do banco, ideal para quem sente desconforto escapular.'
  },
  250: {
    id: 250,
    slug: 'ponte-gluteos-unilateral',
    nome: 'Ponte de Glúteos Unilateral',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo Unilateral',
    sinergistas: 'Core e Isquiotibiais',
    equipamento: 'Colchonete (Peso Corporal)',
    posicao_inicial: 'Deitado no solo com um pé apoiado e a outra perna estendida para o teto.',
    concentrica: 'Eleve o quadril empurrando com o calcanhar da perna de apoio até a extensão máxima.',
    excentrica: 'Desça em 2 a 3 segundos controlados.',
    passos: [
      'Deite de costas e erga uma perna esticada para cima.',
      'Empurre o chão com o pé apoiado.',
      'Aperte o glúteo no topo por 1 segundo.',
      'Desça com calma.'
    ],
    checkpoints: ['Perna livre aponta para o teto', 'Quadril sobe nivelado', 'Aperto de glúteo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Girar a pelve para o lado.',
    beneficio: 'Ativação neuromuscular profunda e fortalecimento da pelve sem necessidade de pesos.'
  },
  251: {
    id: 251,
    slug: 'gluteo-coice-cabo-kickback',
    nome: 'Glúteo Coice no Cabo com Caneleira (Cable Kickback)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Fibras Superiores e Inferiores)',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Polia Baixa + Caneleira de Cabo',
    posicao_inicial: 'De frente para a máquina segurando o apoio, tronco inclinado 45°. Perna ativa com tornozeleira conectada ao cabo.',
    concentrica: 'Chute para trás e ligeiramente para fora em 45°, sustentando 2 segundos no pico.',
    excentrica: 'Retorne em 3 segundos controlando o cabo.',
    passos: [
      'Incline o tronco com coluna reta.',
      'Chute para trás e para cima acompanhando a linha diagonal das fibras.',
      'Aperte o glúteo com força máxima no topo.',
      'Retorne suavemente resistindo à carga.'
    ],
    checkpoints: ['Trajetória ligeiramente aberta em 45°', 'Coluna imóvel sem arquear', 'Pausa de 2s'],
    respiracao: 'Inspire na volta; expire no chute.',
    erro_comum: 'Jogar o peso com a coluna lombar em vez de contrair o glúteo.',
    beneficio: 'O ângulo diagonal em 45° alinha perfeitamente a direção anatômica das fibras do glúteo máximo.'
  },
  252: {
    id: 252,
    slug: 'gluteo-4-apoios-caneleira',
    nome: 'Glúteo 4 Apoios com Caneleira Pesada',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Colchonete + Caneleiras',
    posicao_inicial: 'Em 4 apoios no solo com antebraços e joelhos apoiados, coluna alinhada.',
    concentrica: 'Eleve a perna dobrada a 90° empurrando a sola do pé para o teto até a linha do quadril.',
    excentrica: 'Desça de volta ao solo em 2 a 3 segundos sem encostar o joelho no chão.',
    passos: [
      'Posicione-se em 4 apoios com core firme.',
      'Eleve o calcanhar em direção ao teto com joelho a 90°.',
      'Aperte o glúteo no ponto mais alto.',
      'Desça com calma mantendo a tensão.'
    ],
    checkpoints: ['Joelho mantém ângulo de 90°', 'Sola do pé aponta para o teto', 'Lombar neutra'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Arquear excessivamente a lombar a cada repetição.',
    beneficio: 'Exercício clássico de isolamento para hipertrofia com carga localizada.'
  },
  253: {
    id: 253,
    slug: 'coice-donkey-kick-smith',
    nome: 'Coice no Smith (Donkey Kick no Smith)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Sobrecarga Guiada Pesada)',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Smith Machine + Colchonete',
    posicao_inicial: 'Em 4 apoios no chão sob a barra do Smith. Apoie o meio da sola do pé contra a barra.',
    concentrica: 'Empurre a barra para cima nos trilhos estendendo o quadril com força de glúteo.',
    excentrica: 'Desça em 3 segundos controlados.',
    passos: [
      'Apoie a sola do pé no centro da barra do Smith.',
      'Destrave a barra com cuidado.',
      'Empurre para o teto com o calcanhar.',
      'Desça de maneira compassada.'
    ],
    checkpoints: ['Pé bem firme na barra', 'Coluna travada', 'Subida vertical pura'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Deixar o pé escorregar da barra lisa.',
    beneficio: 'Permite aplicar sobrecarga muito mais pesada do que com caneleiras comuns.'
  },
  254: {
    id: 254,
    slug: 'cadeira-abdutora-tronco-inclinado',
    nome: 'Cadeira Abdutora com Tronco Inclinado à Frente',
    grupo: 'Glúteos',
    alvo: 'Glúteo Médio e Fibras Superiores do Glúteo Máximo',
    sinergistas: 'Piriforme e Tensor da Fáscia Lata',
    equipamento: 'Máquina Cadeira Abdutora',
    posicao_inicial: 'Sentado com o tronco inclinado 45° para a frente (segurando a estrutura da máquina à frente), descolando as costas do encosto.',
    concentrica: 'Abra as pernas com força máxima para os lados, sustentando 2 segundos no topo.',
    excentrica: 'Feche em 3 segundos controlados.',
    passos: [
      'Incline o tronco para a frente a 45° com peito erguido.',
      'Abra as pernas o máximo possível contra as almofadas.',
      'Aperte a parte superior e lateral dos glúteos.',
      'Retorne devagar sem bater as placas.'
    ],
    checkpoints: [
      'Tronco inclinado a 45° para frente.',
      'Aumenta o braço de momento para o glúteo em relação à postura ereta.',
      'Pausa de 2s no ápice.'
    ],
    respiracao: 'Inspire fechando; expire abrindo.',
    erro_comum: 'Voltar a encostar as costas no banco durante a execução.',
    beneficio: 'A inclinação anterior do tronco posiciona as fibras do glúteo máximo superior e glúteo médio em alinhamento ideal contra a resistência.'
  },
  255: {
    id: 255,
    slug: 'abducao-quadril-polia-baixa',
    nome: 'Abdução de Quadril na Polia Baixa em Pé',
    grupo: 'Glúteos',
    alvo: 'Glúteo Médio e Mínimo',
    sinergistas: 'Tensor da Fáscia Lata',
    equipamento: 'Polia Baixa + Tornozeleira',
    posicao_inicial: 'Em pé de lado para a polia com tornozeleira na perna externa, segurando a máquina para estabilidade.',
    concentrica: 'Eleve a perna lateralmente para fora em arco até cerca de 40°-45° do corpo.',
    excentrica: 'Retorne em 3 segundos cruzando suavemente na frente da perna de apoio.',
    passos: [
      'Fique de lado para a polia com tornozeleira no tornozelo externo.',
      'Abra a perna para a lateral conduzindo pelo calcanhar.',
      'Segure 1 segundo no ponto mais alto.',
      'Retorne controladamente.'
    ],
    checkpoints: ['Calcanhar conduz o movimento (não virar a ponta do pé para cima)', 'Tronco reto', 'Sem gangorra'],
    respiracao: 'Inspire descendo; expire abduzindo a perna.',
    erro_comum: 'Inclinar o tronco para o lado oposto para ajudar a perna a subir.',
    beneficio: 'Tensão contínua proporcionada pelo cabo para esculpir a lateral e a curva superior dos glúteos.'
  },
  256: {
    id: 256,
    slug: 'monster-walk-lateral-mini-band',
    nome: 'Monster Walk Lateral com Mini Band',
    grupo: 'Glúteos',
    alvo: 'Glúteo Médio e Estabilizadores Pélvicos',
    sinergistas: 'Tensor da Fáscia Lata e Glúteo Máximo',
    equipamento: 'Mini Band Elástica (sobre os Joelhos ou Tornozelos)',
    posicao_inicial: 'Em meia-flexão de agachamento com mini band nos tornozelos ou acima dos joelhos. Pés na largura dos ombros com o elástico sob tensão.',
    concentrica: 'Dê passos laterais mantendo a postura de agachamento e o elástico permanentemente esticado.',
    excentrica: 'Amorteça cada passo mantendo os joelhos apontados para fora.',
    passos: [
      'Coloque a mini band e fique em posição de meio agachamento.',
      'Dê um passo lateral mantendo o peito erguido.',
      'Aproxime o outro pé sem deixar o elástico afrouxar.',
      'Caminhe 10 passos para a direita e 10 para a esquerda.'
    ],
    checkpoints: ['Elástico nunca fica frouxo', 'Joelhos nunca caem para dentro', 'Postura atlética baixa'],
    respiracao: 'Respire continuamente durante os passos.',
    erro_comum: 'Juntar os pés e deixar o elástico perder a tensão elástica.',
    beneficio: 'Ativação neuromuscular intensa do glúteo médio, prevenindo lesões e preparando a musculatura para agachamentos pesados.'
  },
  257: {
    id: 257,
    slug: 'clamshell-ostra-mini-band',
    nome: 'Clamshell com Mini Band no Colchonete (Ostra)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Médio, Mínimo e Rotadores Profundos do Quadril',
    sinergistas: 'Piriforme',
    equipamento: 'Colchonete + Mini Band acima dos Joelhos',
    posicao_inicial: 'Deitado de lado com joelhos dobrados a 90° e calcanhares unidos. Mini band posicionada logo acima dos joelhos.',
    concentrica: 'Abra o joelho de cima para o teto como a abertura de uma ostra, mantendo os calcanhares colados um ao outro.',
    excentrica: 'Desça em 2 a 3 segundos controlados até quase fechar os joelhos.',
    passos: [
      'Deite de lado com pernas flexionadas e calcanhares colados.',
      'Abra o joelho de cima rodando o quadril para fora.',
      'Sustente 1 segundo com forte aperto na lateral do glúteo.',
      'Feche devagar sem soltar a tensão da mini band.'
    ],
    checkpoints: ['Calcanhares permanecem colados o tempo todo', 'Pelve não tomba para trás', 'Movimento puramente rotacional'],
    respiracao: 'Inspire fechando; expire abrindo.',
    erro_comum: 'Girar a bacia para trás para abrir mais as pernas.',
    beneficio: 'Isolamento de rotação externa do quadril que ativa a porção posterior do glúteo médio com precisão.'
  },
  258: {
    id: 258,
    slug: 'agachamento-bulgaro-foco-gluteo',
    nome: 'Agachamento Búlgaro com Foco em Glúteo (Tronco Inclinado)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo no Alongamento Extremo',
    sinergistas: 'Quadríceps e Isquiotibiais',
    equipamento: 'Banco Reto + Halteres',
    posicao_inicial: 'Pé de trás no banco, pé da frente um pouco mais adiantado que no búlgaro tradicional. Incline o tronco 30° para a frente sobre a coxa dianteira com a coluna reta.',
    concentrica: 'Empurre o solo com o calcanhar dianteiro estendendo o quadril com foco no glúteo.',
    excentrica: 'Desça o quadril para trás e para baixo em 3 segundos até sentir o glúteo da frente alongar ao máximo.',
    passos: [
      'Posicione o pé no banco e incline o tronco 30° à frente.',
      'Mantenha a canela da frente quase vertical.',
      'Desça empurrando o quadril para trás até o glúteo esticar.',
      'Empurre pelo calcanhar espremendo o glúteo.'
    ],
    checkpoints: [
      'Tronco inclinado 30° à frente com peito aberto.',
      'Canela dianteira vertical (pouco avanço de joelho = mais quadril = mais glúteo).',
      'Foco total no calcanhar dianteiro.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Ficar com o corpo ereto demais, o que transfere o trabalho para o quadríceps.',
    beneficio: 'Aumenta significativamente o braço de alavanca para o glúteo máximo, gerando hipertrofia superior nas nádegas.'
  },
  259: {
    id: 259,
    slug: 'frog-pump-colchonete-halter',
    nome: 'Frog Pump no Colchonete com Halter',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Pico de Oclusão)',
    sinergistas: 'Adutores',
    equipamento: 'Colchonete + Halter no Quadril',
    posicao_inicial: 'Deitado de costas no solo com as solas dos pés unidas uma contra a outra (joelhos abertos para fora como um sapo). Halter apoiado no quadril.',
    concentrica: 'Eleve o quadril esmagando os glúteos com as solas dos pés pressionadas juntas.',
    excentrica: 'Desça até tocar de leve o solo em 2 segundos.',
    passos: [
      'Junte as solas dos pés e abra os joelhos para os lados.',
      'Apoie o halter na bacia.',
      'Eleve o quadril com força de glúteo.',
      'Aperte por 2 segundos no topo e desça com controle.'
    ],
    checkpoints: ['Solas dos pés coladas', 'Joelhos abertos para fora', 'Aperto máximo no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Descolar as solas dos pés durante a elevação.',
    beneficio: 'A abdução e rotação externa combinadas com a extensão pélvica criam queimação metabólica insana no glúteo.'
  },
  260: {
    id: 260,
    slug: 'hiperextensao-45-foco-gluteo',
    nome: 'Hiperextensão 45° com Foco em Glúteo (Arredondamento Lombar)',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo (Isolamento com Coluna Travada)',
    sinergistas: 'Isquiotibiais',
    equipamento: 'Banco de Hiperextensão 45° + Anilha',
    posicao_inicial: 'Pés virados 45° para fora no apoio do banco. Arredonde propositalmente a coluna torácica e lombar superior (postura de corcunda controlada) e cruze os braços.',
    concentrica: 'Eleve o tronco usando estritamente a extensão de quadril com os glúteos, mantendo a coluna arredondada para anular a lombar.',
    excentrica: 'Desça em 3 segundos flexionando apenas o quadril.',
    passos: [
      'Aponte os pés para fora em 45° no banco.',
      'Arredonde a parte superior das costas e trave a coluna imóvel.',
      'Suba esmagando os glúteos sem estender as costas.',
      'Desça de maneira compassada.'
    ],
    checkpoints: [
      'Coluna permanece intencionalmente arredondada para desativar os eretores espinhais.',
      'Pés apontados para fora a 45° para rotação externa dos glúteos.',
      'Extensão ocorre 100% no quadril.'
    ],
    respiracao: 'Inspire descendo; expire subindo com o glúteo.',
    erro_comum: 'Esticar as costas usando a força lombar.',
    beneficio: 'Técnica científica avançada que desativa os eretores da espinha por insuficiência mecânica, canalizando 100% da carga para os glúteos.'
  },

  // =========================================================================
  // ADUTORES (6 EXERCÍCIOS: 82-83, 269-272)
  // =========================================================================
  82: {
    id: 82,
    slug: 'cadeira-adutora',
    nome: 'Cadeira Adutora',
    grupo: 'Adutores',
    alvo: 'Adutores da Coxa (Adutor Magno, Longo, Curto e Grácil)',
    sinergistas: 'Pectíneo',
    equipamento: 'Máquina Cadeira Adutora',
    posicao_inicial: 'Sentado com as costas coladas no encosto. Ajuste as almofadas na parte interna dos joelhos e abra as pernas até a amplitude confortável.',
    concentrica: 'Feche as pernas com força puxando os joelhos um contra o outro, sustentando 1 a 2 segundos de compressão máxima no centro.',
    excentrica: 'Abra as pernas controladamente em 3 segundos sentindo o alongamento da virilha sem deixar os pesos colidirem.',
    passos: [
      'Acomode-se no banco com as costas apoiadas.',
      'Abra as almofadas até uma boa abertura.',
      'Feche os joelhos espremendo a parte interna das coxas.',
      'Sustente 1-2 segundos e retorne de forma lenta.'
    ],
    checkpoints: ['Força pelos joelhos', 'Pausa de compressão no centro', 'Descida de 3 segundos'],
    respiracao: 'Inspire abrindo; expire fechando.',
    erro_comum: 'Deixar o peso bater e abrir as pernas com velocidade descontrolada arriscando estiramento na virilha.',
    beneficio: 'Fortalece os adutores que compõem grande parte da espessura da coxa e previnem lesões de virilha e pubalgia.'
  },
  83: {
    id: 83,
    slug: 'agachamento-sumo',
    nome: 'Agachamento Sumô',
    grupo: 'Adutores',
    alvo: 'Adutores e Glúteos',
    sinergistas: 'Quadríceps',
    equipamento: 'Barra Olímpica ou Halter',
    posicao_inicial: 'Pés bem afastados (1,5x a 2x a largura dos ombros) com pontas viradas a 45° para fora. Tronco ereto.',
    concentrica: 'Empurre o solo estendendo os joelhos e fechando a musculatura adutora.',
    excentrica: 'Desça profundamente abrindo os joelhos na linha dos pés em 3 segundos.',
    passos: [
      'Abra a base com pés apontando para fora.',
      'Desça com tronco vertical mantendo joelhos bem abertos.',
      'Quebre a linha paralela com as coxas.',
      'Suba empurrando o chão com força.'
    ],
    checkpoints: ['Joelhos abertos na direção dos pés', 'Tronco vertical', 'Profundidade completa'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar os joelhos desabarem para dentro durante a subida.',
    beneficio: 'Recruta intensamente o adutor magno e a musculatura profunda do quadril.'
  },
  269: {
    id: 269,
    slug: 'cadeira-adutora-isometria',
    nome: 'Cadeira Adutora com Isometria no Final',
    grupo: 'Adutores',
    alvo: 'Adutores da Coxa',
    sinergistas: 'Grácil e Pectíneo',
    equipamento: 'Máquina Cadeira Adutora',
    posicao_inicial: 'Sentado com almofadas na parte interna dos joelhos.',
    concentrica: 'Feche as pernas totalmente e congele em contração isométrica por 3 segundos a cada repetição.',
    excentrica: 'Abra de forma controlada em 3 segundos.',
    passos: [
      'Feche as pernas com força máxima.',
      'Segure 3 segundos estáticos no ponto de encontro.',
      'Abra devagar sentindo o alongamento.',
      'Repita mantendo a pausa em todas as repetições.'
    ],
    checkpoints: ['Pausa isométrica de 3s no fechamento', 'Sem solavanco', 'Postura firme'],
    respiracao: 'Inspire abrindo; expire fechando.',
    erro_comum: 'Abrir rápido demais após a pausa.',
    beneficio: 'Aumenta o tempo sob tensão e a densidade muscular na parte interna das coxas.'
  },
  270: {
    id: 270,
    slug: 'aducao-quadril-polia-baixa',
    nome: 'Adução de Quadril na Polia Baixa em Pé',
    grupo: 'Adutores',
    alvo: 'Adutores Unilateral',
    sinergistas: 'Grácil',
    equipamento: 'Polia Baixa + Tornozeleira',
    posicao_inicial: 'Em pé de lado para a polia com tornozeleira na perna interna mais próxima do cabo.',
    concentrica: 'Puxe a perna para dentro cruzando pela frente da perna de apoio contra a resistência do cabo.',
    excentrica: 'Retorne em 3 segundos controlados.',
    passos: [
      'Segure o apoio da máquina para estabilidade.',
      'Puxe a perna com tornozeleira em direção à outra perna.',
      'Cruze suavemente pela frente apertando a virilha.',
      'Retorne devagar resistindo à carga.'
    ],
    checkpoints: ['Tronco vertical', 'Movimento estrito da perna', 'Pico de contração de 1s'],
    respiracao: 'Inspire abrindo; expire aduzindo.',
    erro_comum: 'Balançar o corpo para ajudar a puxar o peso.',
    beneficio: 'Fortalecimento esportivo funcional para atletas de futebol, corrida e artes marciais.'
  },
  271: {
    id: 271,
    slug: 'prancha-copenhagen-adutores',
    nome: 'Prancha Copenhagen',
    grupo: 'Adutores',
    alvo: 'Adutores (Força Excêntrica e Isométrica Máxima) e Core Lateral',
    sinergistas: 'Oblíquos e Glúteo Médio',
    equipamento: 'Banco Reto ou Caixa + Colchonete',
    posicao_inicial: 'Em posição de prancha lateral com a face interna do tornozelo/joelho da perna superior apoiada no banco. O cotovelo de baixo fica apoiado no chão e a perna inferior fica suspensa no ar.',
    concentrica: 'Eleve o quadril mantendo o corpo em linha reta suspensa sustentado exclusivamente pela perna apoiada no banco e pelo core.',
    excentrica: 'Mantenha a sustentação isométrica rígida por 15 a 30 segundos por lado.',
    passos: [
      'Apoie o joelho ou tornozelo da perna de cima no banco.',
      'Apoie o antebraço no chão em prancha lateral.',
      'Erga o quadril do chão alinhando o corpo da cabeça aos pés.',
      'Mantenha a perna de baixo no ar sem tocar o solo.'
    ],
    checkpoints: [
      'Corpo reto em prancha lateral sem deixar a bacia despencar.',
      'Força concentrada na parte interna da coxa de cima.',
      'Pode iniciar com o joelho no banco (regressão) antes do tornozelo.'
    ],
    respiracao: 'Respire continuamente de forma estável.',
    erro_comum: 'Permitir a queda da pelve em direção ao solo por fadiga.',
    beneficio: 'O exercício número 1 comprovado por ensaios clínicos da UEFA para reduzir lesões de adutores e pubalgia em até 41% em atletas.'
  },
  272: {
    id: 272,
    slug: 'agachamento-sumo-step-deficit-adutores',
    nome: 'Agachamento Sumô no Step com Déficit',
    grupo: 'Adutores',
    alvo: 'Adutores e Glúteos (Alongamento com Déficit de Profundidade)',
    sinergistas: 'Quadríceps',
    equipamento: '2 Steps ou Caixas + 1 Halter Pesado',
    posicao_inicial: 'Em pé com um pé sobre cada step elevado, base ampla de sumô. Halter suspenso entre os dois steps.',
    concentrica: 'Empurre os steps com as pernas estendendo joelhos e quadris.',
    excentrica: 'Desça profundamente abaixo do nível dos steps em 3 segundos sentindo estiramento máximo dos adutores.',
    passos: [
      'Suba nos steps com base aberta e pontas dos pés para fora.',
      'Segure o halter pesado entre as pernas.',
      'Desça o halter abaixo do nível dos pés sem bater no chão.',
      'Suba com força concentrada nas coxas internas e glúteos.'
    ],
    checkpoints: ['Steps firmes e seguros', 'Descida profunda além do nível dos pés', 'Coluna reta'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Deixar os steps escorregarem no piso.',
    beneficio: 'Aumenta a amplitude de movimento para os adutores permitindo atingir hipertrofia por estiramento mecânico.'
  },

  // =========================================================================
  // PANTURRILHAS & TIBIAL (14 EXERCÍCIOS: 84-89, 261-268)
  // =========================================================================
  84: {
    id: 84,
    slug: 'gemeos-em-pe-maquina',
    nome: 'Gêmeos em Pé na Máquina',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio (Cabeça Medial e Lateral da Panturrilha)',
    sinergistas: 'Sóleo e Tendão de Aquiles',
    equipamento: 'Máquina Standing Calf Raise',
    posicao_inicial: 'Almofadas apoiadas sobre os ombros, antepé (metatarso) na borda do apoio com calcanhares totalmente livres para descer. Joelhos estendidos com microflexão fixa.',
    concentrica: 'Eleve os calcanhares o mais alto possível até a ponta máxima dos pés, sustentando 2 segundos de contração isométrica no topo.',
    excentrica: 'Desça os calcanhares de forma muito lenta em 3 a 4 segundos até o alongamento profundo abaixo do nível da plataforma, pausando 1 segundo no fundo sem quicar.',
    passos: [
      'Apoie as almofadas nos ombros e coloque as pontas dos pés na borda da plataforma.',
      'Destrave a máquina e desça os calcanhares abaixo do nível do apoio.',
      'Pause 1 segundo no fundo para anular o reflexo do tendão de Aquiles.',
      'Suba até a ponta máxima dos pés e aperte por 2 segundos.'
    ],
    checkpoints: [
      'Joelhos mantidos retos (com joelhos esticados o gastrocnêmio trabalha com força máxima).',
      'Pausa de 1 segundo no fundo (anula a energia elástica do tendão de Aquiles).',
      'Pausa de 2 segundos no pico da contração no topo.'
    ],
    respiracao: 'Inspire na descida; expire ao subir na ponta dos pés.',
    erro_comum: 'Quicar no fundo rapidamente aproveitando o rebote do tendão de Aquiles em vez de usar a musculatura da panturrilha.',
    beneficio: 'O exercício primordial para construir volume, largura e formato de diamante na parte visível da panturrilha.'
  },
  85: {
    id: 85,
    slug: 'gemeos-sentado',
    nome: 'Gêmeos Sentado',
    grupo: 'Panturrilhas',
    alvo: 'Sóleo (Músculo Profundo que Alarga a Panturrilha)',
    sinergistas: 'Tendão Calcâneo',
    equipamento: 'Máquina Seated Calf Raise',
    posicao_inicial: 'Sentado com almofada apoiada na extremidade inferior das coxas (perto dos joelhos). Pontas dos pés no apoio com calcanhares livres. Joelhos flexionados a 90°.',
    concentrica: 'Empurre a almofada para cima estendendo os tornozelos até a ponta máxima, segurando 2 segundos no topo.',
    excentrica: 'Desça os calcanhares suavemente em 3 a 4 segundos até sentir o músculo sóleo alongar sob a carga, pausando 1 segundo.',
    passos: [
      'Sente-se e trave a almofada sobre as coxas.',
      'Destrave a alavanca e desça os calcanhares abaixo do apoio.',
      'Pause 1 segundo no fundo.',
      'Suba na ponta máxima dos pés sustentando 2 segundos de contração.'
    ],
    checkpoints: [
      'Com joelhos a 90°, o gastrocnêmio entra em insuficiência ativa e o sóleo assume 100% da carga.',
      'Descida profunda sem quicar.',
      'Pausa no topo.'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Fazer repetições curtas e rápidas sem amplitude completa.',
    beneficio: 'Isola o músculo sóleo, que fica por baixo do gastrocnêmio e é o principal responsável pela espessura lateral da panturrilha.'
  },
  86: {
    id: 86,
    slug: 'gemeos-leg-press',
    nome: 'Gêmeos no Leg Press',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio',
    sinergistas: 'Sóleo',
    equipamento: 'Máquina Leg Press 45°',
    posicao_inicial: 'Sentado no Leg Press com as costas coladas. Apoie apenas a ponta dos pés na borda inferior da plataforma com calcanhares livres. Pernas estendidas.',
    concentrica: 'Empurre a plataforma com as pontas dos pés até a flexão plantar máxima, segurando 1 a 2 segundos.',
    excentrica: 'Desça permitindo a dorsiflexão completa em 3 segundos.',
    passos: [
      'Trave os ganchos de segurança na altura correta.',
      'Posicione as pontas dos pés na borda da chapa.',
      'Empurre estendendo os tornozelos.',
      'Desça devagar até o calcanhar descer além da borda.'
    ],
    checkpoints: ['Travas de segurança sempre acionadas', 'Joelhos quase retos com microflexão fixa', 'Pés firmes sem escorregar'],
    respiracao: 'Inspire descendo; expire empurrando.',
    erro_comum: 'Deixar os pés escorregarem da borda da plataforma por mau posicionamento.',
    beneficio: 'Permite sobrecarga pesada sem compressão vertical na coluna vertebral.'
  },
  87: {
    id: 87,
    slug: 'gemeos-smith',
    nome: 'Gêmeos no Smith',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio',
    sinergistas: 'Sóleo',
    equipamento: 'Smith Machine + Step ou Bloco sob a Barra',
    posicao_inicial: 'Barra nos trapézios, pontas dos pés na borda do step com calcanhares livres para descer.',
    concentrica: 'Suba na ponta dos pés contra a barra do Smith segurando 2 segundos no topo.',
    excentrica: 'Desça em 3 segundos até o alongamento completo abaixo do step.',
    passos: [
      'Coloque o step sob a barra.',
      'Apoie as pontas dos pés e destrave a barra nos ombros.',
      'Desça os calcanhares abaixo do nível do step.',
      'Suba com força máxima na ponta dos pés.'
    ],
    checkpoints: ['Step firme e colado no chão', 'Amplitude máxima', 'Pausa no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Fazer o movimento sem step, com os pés planos no solo cortando a metade excêntrica da repetição.',
    beneficio: 'Estabilidade guiada para sobrecarga progressiva com facilidade de travar a barra.'
  },
  88: {
    id: 88,
    slug: 'elevacao-unilateral-panturrilha',
    nome: 'Elevação Unilateral de Panturrilha',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio Unilateral',
    sinergistas: 'Sóleo',
    equipamento: 'Degrau / Step + 1 Halter na Mão',
    posicao_inicial: 'Em pé sobre um pé na borda do degrau segurando um halter com a mão do mesmo lado. A outra mão segura a parede para equilíbrio.',
    concentrica: 'Eleve o calcanhar até a ponta máxima do pé, sustentando 2 segundos no topo.',
    excentrica: 'Desça o calcanhar profundamente abaixo do degrau em 3 segundos controlados.',
    passos: [
      'Apoie a ponta de um pé no degrau com a outra perna no ar.',
      'Segure o halter na mão correspondente.',
      'Desça o calcanhar até o alongamento máximo.',
      'Suba na ponta do pé com força concentrada.'
    ],
    checkpoints: ['Equilíbrio com apoio suave da mão livre', 'Descida completa de 3s', 'Pausa de 2s no topo'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Usar o braço de apoio para puxar o corpo para cima.',
    beneficio: 'Corrige assimetrias de força e volume entre as panturrilhas com o próprio peso corporal e halter.'
  },
  89: {
    id: 89,
    slug: 'gemeos-hack',
    nome: 'Gêmeos no Hack',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio',
    sinergistas: 'Sóleo',
    equipamento: 'Máquina Hack Squat',
    posicao_inicial: 'Ombros apoiados nas almofadas do Hack. Pontas dos pés na borda da plataforma.',
    concentrica: 'Empurre a máquina na ponta dos pés com joelhos estendidos.',
    excentrica: 'Desça os calcanhares em 3 segundos controlando o peso.',
    passos: [
      'Apoie os ombros e posicione os pés na borda.',
      'Destrave a máquina.',
      'Desça os calcanhares até o alongamento profundo.',
      'Suba até o ápice segurando 1 a 2 segundos.'
    ],
    checkpoints: ['Pés firmes', 'Travas ajustadas', 'Sem dobrar os joelhos'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Flexionar os joelhos para ajudar na subida.',
    beneficio: 'Excelente ângulo de resistência para o gastrocnêmio com suporte ergonômico para as costas.'
  },
  261: {
    id: 261,
    slug: 'gemeos-sentado-halter-joelhos',
    nome: 'Gêmeos Sentado com Halter sobre os Joelhos',
    grupo: 'Panturrilhas',
    alvo: 'Sóleo',
    sinergistas: 'Tendão de Aquiles',
    equipamento: 'Banco Reto + Step no Solo + 1 Halter Pesado',
    posicao_inicial: 'Sentado no banco com pontas dos pés no step. Halter pesado repousando sobre as extremidades das coxas perto dos joelhos.',
    concentrica: 'Eleve os calcanhares na ponta máxima dos pés.',
    excentrica: 'Desça os calcanhares abaixo do step em 3 segundos.',
    passos: [
      'Coloque o step na frente do banco e apoie os pés.',
      'Coloque o halter acolchoado sobre os joelhos.',
      'Desça os calcanhares até o fundo.',
      'Suba na ponta dos pés apertando o sóleo.'
    ],
    checkpoints: ['Halter estável sobre os joelhos', 'Amplitude completa no step', 'Joelhos a 90°'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Fazer sem step reduzindo a amplitude pela metade.',
    beneficio: 'Alternativa perfeita para isolar o sóleo quando a academia não tem a máquina de panturrilha sentado.'
  },
  262: {
    id: 262,
    slug: 'gemeos-donkey-calf-raise',
    nome: 'Gêmeos Donkey (Donkey Calf Raise / Burrinho)',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio no Alongamento Máximo',
    sinergistas: 'Sóleo',
    equipamento: 'Máquina Donkey Calf ou Step com Tronco Inclinado 90°',
    posicao_inicial: 'Tronco inclinado para frente a 90° com apoio dos braços. Peso apoiado sobre a pelve/lombar baixa. Pontas dos pés no step.',
    concentrica: 'Eleve os calcanhares até a ponta máxima com força explosiva, segurando 2 segundos.',
    excentrica: 'Desça profundamente em 3 a 4 segundos sentindo estiramento extremo na panturrilha.',
    passos: [
      'Incline o tronco a 90° e apoie os antebraços.',
      'Coloque as pontas dos pés no step com peso na bacia.',
      'Desça os calcanhares o mais baixo possível.',
      'Suba até a ponta dos dedos sustentando o topo.'
    ],
    checkpoints: [
      'Quadril flexionado a 90° estica os isquiotibiais e pré-tensiona o gastrocnêmio.',
      'Pausa de 2s no pico.',
      'Alongamento profundo no fundo.'
    ],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Flexionar os joelhos durante a subida.',
    beneficio: 'O exercício favorito de Arnold Schwarzenegger para panturrilhas, com máxima ativação biomecânica das duas cabeças do gastrocnêmio.'
  },
  263: {
    id: 263,
    slug: 'gemeos-step-halteres',
    nome: 'Gêmeos no Step com Halteres',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio',
    sinergistas: 'Sóleo',
    equipamento: 'Step no Chão + Par de Halteres',
    posicao_inicial: 'Em pé sobre o step com pontas dos pés na borda, segurando halteres nas laterais do corpo.',
    concentrica: 'Suba na ponta dos pés de forma simultânea.',
    excentrica: 'Desça os calcanhares em 3 segundos abaixo do nível do step.',
    passos: [
      'Suba no step com os halteres nas mãos.',
      'Desça os calcanhares devagar até o fundo.',
      'Eleve os calcanhares contraindo as panturrilhas.',
      'Pause 1 segundo no topo e repita.'
    ],
    checkpoints: ['Equilíbrio firme', 'Descida abaixo do step', 'Sem quicar'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Perder o equilíbrio e descer do step.',
    beneficio: 'Permite treinar em qualquer lugar com halteres livres e step.'
  },
  264: {
    id: 264,
    slug: 'gemeos-unilateral-step-sem-carga',
    nome: 'Gêmeos Unilateral no Step sem Carga',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio (Resistência e Cadência Controlada)',
    sinergistas: 'Sóleo',
    equipamento: 'Degrau ou Step',
    posicao_inicial: 'Em pé sobre uma perna no degrau, mão apoiada na parede.',
    concentrica: 'Suba o calcanhar até a ponta máxima sustentando 2 segundos.',
    excentrica: 'Desça em 4 segundos muito lentos até o alongamento máximo.',
    passos: [
      'Apoie a ponta do pé no degrau.',
      'Suba na ponta do pé com cadência uniforme.',
      'Sustente 2 segundos de contração.',
      'Desça em 4 segundos controlados.'
    ],
    checkpoints: ['Cadência lenta estrita (4s descida, 2s pausa)', 'Amplitude máxima', 'Zero impulso'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Apressar as repetições.',
    beneficio: 'Perfeito para séries de altas repetições (20 a 30 reps) focando em queimação e fadiga profunda.'
  },
  265: {
    id: 265,
    slug: 'gemeos-leg-press-horizontal',
    nome: 'Gêmeos no Leg Press Horizontal',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio',
    sinergistas: 'Sóleo',
    equipamento: 'Leg Press Horizontal',
    posicao_inicial: 'Sentado com pernas estendidas e pontas dos pés na borda da placa.',
    concentrica: 'Empurre a placa estendendo os tornozelos.',
    excentrica: 'Retorne em 3 segundos permitindo a dorsiflexão.',
    passos: [
      'Posicione os pés na borda inferior da placa.',
      'Empurre estendendo as pontas dos pés.',
      'Segure 1 segundo no topo.',
      'Retorne de forma compassada.'
    ],
    checkpoints: ['Pés seguros', 'Movimento estrito no tornozelo', 'Pernas quase retas'],
    respiracao: 'Inspire voltando; expire empurrando.',
    erro_comum: 'Dobrar os joelhos para ajudar.',
    beneficio: 'Excelente para quem sente desconforto na lombar no leg press inclinado.'
  },
  266: {
    id: 266,
    slug: 'panturrilha-agachamento-smith',
    nome: 'Panturrilha no Agachamento Smith',
    grupo: 'Panturrilhas',
    alvo: 'Gastrocnêmio com Sobrecarga Pesada',
    sinergistas: 'Sóleo',
    equipamento: 'Smith Machine + Bloco Elevado',
    posicao_inicial: 'Barra nos ombros, pés no bloco elevado sob a barra.',
    concentrica: 'Empurre a barra subindo na ponta dos pés nos trilhos.',
    excentrica: 'Desça em 3 segundos com controle.',
    passos: [
      'Destrave a barra apoiada nos ombros.',
      'Suba na ponta máxima dos pés.',
      'Aperte por 2 segundos no topo.',
      'Desça abaixo do nível do bloco.'
    ],
    checkpoints: ['Trilho alinhado', 'Descida profunda', 'Trava de segurança ajustada'],
    respiracao: 'Inspire descendo; expire subindo.',
    erro_comum: 'Soltar os calcanhares rápido demais.',
    beneficio: 'Permite sobrecarga máxima com estabilidade vertical absoluta.'
  },
  267: {
    id: 267,
    slug: 'dorsiflexao-tibial-anterior-halter',
    nome: 'Dorsiflexão Tibial Anterior com Halter',
    grupo: 'Panturrilhas',
    alvo: 'Tibial Anterior (Frente da Canela)',
    sinergistas: 'Extensor Longo dos Dedos',
    equipamento: 'Banco Reto + 1 Halter preso entre os Pés ou na Ponta do Pé',
    posicao_inicial: 'Sentado no banco com as pernas estendidas à frente e calcanhares apoiados na borda de um step/bloco com os pés no ar. Halter seguro entre os pés.',
    concentrica: 'Puxe as pontas dos pés para cima em direção às canelas (dorsiflexão máxima), sustentando 2 segundos.',
    excentrica: 'Aponte os pés para a frente em 3 segundos alongando a parte frontal da canela.',
    passos: [
      'Apoie os calcanhares no banco com os pés livres no ar.',
      'Prenda o halter entre as pontas dos pés.',
      'Puxe as pontas dos pés em direção ao joelho.',
      'Sustente a queimação na frente da canela por 2 segundos e retorne devagar.'
    ],
    checkpoints: [
      'Dorsiflexão máxima puxando os dedos para o joelho.',
      'Calcanhares bem apoiados.',
      'Movimento controlado sem soltar o halter.'
    ],
    respiracao: 'Inspire apontando os pés para frente; expire puxando para a canela.',
    erro_comum: 'Dobrar os joelhos para ajudar no movimento.',
    beneficio: 'O exercício de ouro para eliminar e prevenir canelite (shin splints), desaceleração esportiva e equilíbrio articular do tornozelo.'
  },
  268: {
    id: 268,
    slug: 'tibial-anterior-polia-alca',
    nome: 'Tibial Anterior na Polia com Alça',
    grupo: 'Panturrilhas',
    alvo: 'Tibial Anterior',
    sinergistas: 'Extensor Longo do Hálux',
    equipamento: 'Polia Baixa + Alça no Pé',
    posicao_inicial: 'Sentado de frente para a polia baixa com a alça presa na ponta do pé, calcanhar apoiado no chão.',
    concentrica: 'Puxe a ponta do pé para trás em direção à canela contra a tração do cabo.',
    excentrica: 'Deixe o cabo puxar o pé para a frente em 3 segundos de alongamento.',
    passos: [
      'Prenda a alça do cabo na ponta do pé.',
      'Apoie o calcanhar com firmeza.',
      'Puxe a ponta do pé para trás com força do tibial.',
      'Retorne de maneira suave.'
    ],
    checkpoints: ['Calcanhar fixo no solo como pivô', 'Tensão contínua do cabo', 'Contração de 2s'],
    respiracao: 'Inspire voltando; expire puxando.',
    erro_comum: 'Arrastar o calcanhar no solo.',
    beneficio: 'Resistência perfeita do cabo para fortalecimento dos músculos anteriores da perna e blindagem do tornozelo.'
  },

  // =========================================================================
  // EXPANSÃO: NOVOS EXERCÍCIOS (IDS 340-344)
  // =========================================================================
  340: {
    id: 340,
    slug: 'agachamento-halteres',
    nome: 'Agachamento com Halteres',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Vastos e Reto Femoral)',
    sinergistas: 'Glúteos e Isquiotibiais',
    equipamento: 'Halteres',
    posicao_inicial: 'Em pé com os halteres ao lado do corpo ou apoiados nos ombros, pés na largura dos ombros.',
    concentrica: 'Suba empurrando o chão com os calcanhares até a extensão completa de quadril e joelhos.',
    excentrica: 'Desça em 2 a 3 segundos flexionando quadril e joelhos até as coxas ficarem paralelas ao chão.',
    passos: [
      'Segure os halteres ao lado do corpo ou nos ombros.',
      'Desça flexionando quadril e joelhos simultaneamente.',
      'Mantenha o tronco ereto durante toda a descida.',
      'Suba empurrando o chão até a extensão completa.'
    ],
    checkpoints: [
      'Joelhos alinhados com a ponta dos pés, sem colapsar para dentro',
      'Tronco ereto, peso distribuído no meio do pé',
      'Profundidade até as coxas paralelas ao chão'
    ],
    respiracao: 'Inspire na descida; expire na subida.',
    erro_comum: 'Deixar os joelhos avançarem muito à frente da ponta dos pés, transferindo carga excessiva para o tendão patelar.',
    beneficio: 'Uma alternativa acessível ao agachamento com barra, ideal para quem não tem suporte de rack ou está a trabalhar a técnica antes de progredir para cargas maiores.'
  },
  341: {
    id: 341,
    slug: 'flexora-deitada-halteres',
    nome: 'Flexora Deitada com Halteres',
    grupo: 'Posteriores',
    alvo: 'Isquiotibiais',
    sinergistas: 'Gastrocnêmio',
    equipamento: 'Banco + Halter (preso entre os pés)',
    posicao_inicial: 'Deitado de bruços no banco com um halter preso entre os pés, pernas estendidas.',
    concentrica: 'Flexione os joelhos elevando o halter em direção aos glúteos.',
    excentrica: 'Desça em 2 a 3 segundos controlados até a extensão quase completa das pernas.',
    passos: [
      'Deite de bruços com o halter preso entre os pés.',
      'Mantenha o quadril colado ao banco.',
      'Flexione os joelhos levando o peso aos glúteos.',
      'Desça controlado até quase estender as pernas.'
    ],
    checkpoints: [
      'Quadril permanece colado ao banco, sem elevar para ajudar',
      'Movimento isolado no joelho, sem usar impulso',
      'Contração máxima com o calcanhar próximo ao glúteo'
    ],
    respiracao: 'Expire flexionando; inspire estendendo.',
    erro_comum: 'Elevar o quadril do banco para compensar a falta de força nos isquiotibiais.',
    beneficio: 'Uma alternativa de baixo custo à mesa flexora de máquina, útil para treinar em casa ou em academias sem o equipamento específico.'
  },
  342: {
    id: 342,
    slug: 'hiperextensao-reversa-maquina',
    nome: 'Hiperextensão Reversa na Máquina',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais e Eretores da Espinha',
    equipamento: 'Máquina Articulada (Lever)',
    posicao_inicial: 'Deitado de bruços sobre a máquina com o tronco apoiado e as pernas presas na alavanca abaixo do corpo.',
    concentrica: 'Eleve as pernas para trás e para cima estendendo o quadril contra a resistência.',
    excentrica: 'Desça em 2 a 3 segundos controlados até as pernas retornarem abaixo da linha do tronco.',
    passos: [
      'Deite de bruços com o tronco apoiado firme na máquina.',
      'Prenda as pernas na alavanca inferior.',
      'Eleve as pernas estendendo o quadril contra a resistência.',
      'Desça controlado até a posição inicial.'
    ],
    checkpoints: [
      'Tronco fixo e apoiado durante toda a repetição',
      'Movimento ocorre no quadril, não na lombar',
      'Contração máxima do glúteo no topo'
    ],
    respiracao: 'Expire subindo as pernas; inspire descendo.',
    erro_comum: 'Usar a lombar para arremessar as pernas em vez de isolar a extensão de quadril.',
    beneficio: 'Inverte a mecânica da hiperextensão tradicional, fixando o tronco e movendo as pernas, o que isola o glúteo com menor estresse na coluna lombar.'
  },
  343: {
    id: 343,
    slug: 'extensao-quadril-pe-maquina',
    nome: 'Extensão de Quadril em Pé na Máquina',
    grupo: 'Glúteos',
    alvo: 'Glúteo Máximo',
    sinergistas: 'Isquiotibiais e Eretores da Espinha',
    equipamento: 'Máquina Articulada (Lever) em Pé',
    posicao_inicial: 'Em pé apoiado na máquina com uma perna presa na alavanca atrás do corpo, tronco levemente inclinado à frente.',
    concentrica: 'Estenda o quadril empurrando a perna para trás e para cima contra a resistência.',
    excentrica: 'Retorne em 2 a 3 segundos controlados até a perna alinhar com o tronco.',
    passos: [
      'Prenda uma perna na alavanca da máquina.',
      'Apoie as mãos no suporte e incline levemente o tronco.',
      'Estenda o quadril empurrando a perna para trás.',
      'Retorne controlado sem perder a postura.'
    ],
    checkpoints: [
      'Joelho da perna de apoio levemente flexionado e estável',
      'Tronco mantém a mesma inclinação do início ao fim',
      'Perna de trabalho não ultrapassa o ponto de hiperextensão lombar'
    ],
    respiracao: 'Expire estendendo a perna; inspire retornando.',
    erro_comum: 'Compensar com rotação do quadril em vez de manter o movimento no plano sagital.',
    beneficio: 'O trabalho unilateral em pé exige maior ativação dos estabilizadores do quadril de apoio, somando um componente de equilíbrio ao isolamento do glúteo.'
  },
  344: {
    id: 344,
    slug: 'leg-press-pes-juntos',
    nome: 'Leg Press Pés Juntos',
    grupo: 'Quadríceps',
    alvo: 'Quadríceps (Vasto Lateral)',
    sinergistas: 'Glúteos, Adutores e Isquiotibiais',
    equipamento: 'Máquina de Leg Press',
    posicao_inicial: 'Sentado na máquina com os pés juntos e centralizados na plataforma, na altura dos ombros.',
    concentrica: 'Empurre a plataforma estendendo os joelhos até quase a extensão completa, sem travar.',
    excentrica: 'Desça em 2 a 3 segundos controlados até os joelhos se aproximarem do peito.',
    passos: [
      'Sente-se e posicione os pés juntos no centro da plataforma.',
      'Destrave a máquina mantendo os joelhos alinhados.',
      'Desça controlado até os joelhos próximos ao peito.',
      'Empurre a plataforma de volta quase à extensão total.'
    ],
    checkpoints: [
      'Pés mantidos juntos e centralizados durante toda a série',
      'Joelhos seguem a mesma linha dos pés, sem abrir ou fechar',
      'Lombar permanece apoiada no encosto, sem descolar'
    ],
    respiracao: 'Inspire na descida; expire empurrando.',
    erro_comum: 'Descer além da mobilidade de quadril disponível, arredondando a lombar e descolando-a do encosto.',
    beneficio: 'O posicionamento de pés juntos desloca mais ênfase para o vasto lateral do quadríceps em comparação ao posicionamento tradicional mais aberto.'
  }
};
