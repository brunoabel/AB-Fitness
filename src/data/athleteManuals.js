// Manuais Científicos Personalizados por Objetivo do Usuário • AB Fitness
// Baseado em evidências de fisiologia esportiva, nutrição e biomecânica

export const ATHLETE_MANUALS = {
  // 1. MANUAL DO ATLETA (FUTEBOL & PERFORMANCE ESPORTIVA)
  athlete: {
    id: 'athlete',
    title: 'Manual do Atleta: Futebol & Performance',
    tag: 'Futebol & Atletas',
    icon: 'Zap',
    subtitle: 'Potência, arranque veloz, força unilateral e prevenção de lesões no gramado.',
    accent: 'sky',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    philosophy: 'O atleta de futebol não busca apenas hipertrofia estética; ele precisa de potência elástica, resistência a impactos, equilíbrio unilateral e aceleração sem perder agilidade.',
    
    weeklySplit: [
      {
        day: 'Dias Longe do Jogo (Seg / Ter)',
        focus: 'Sobrecarga Máxima & Força Unilateral',
        detail: 'Agachamento Búlgaro, RDL e Supino com halteres. Foco em construir base neuromuscular sólida.'
      },
      {
        day: 'Meio de Semana (Qua / Qui)',
        focus: 'Potência, Core & Prevenção',
        detail: 'Prancha Copenhague (blindagem de virilha/adutores), mobilidade 90/90 e fortalecimento de panturrilhas.'
      },
      {
        day: 'Véspera de Partida (Matchday -1)',
        focus: 'Ativação & Prontidão Neural',
        detail: 'Apenas mobilidade ativa e pliometria leve. ZERO séries até a falha para não acumular fadiga.'
      },
      {
        day: 'Pós-Jogo (Matchday +1)',
        focus: 'Regeneração Muscular',
        detail: 'Caminhada leve, hidratação profunda, pernas elevadas e liberação miofascial suave.'
      }
    ],

    nutritionStrategy: {
      calories: 'Manutenção alta ou ligeiro superávit (+200 a +300 kcal) nos dias de jogo e treinos intensos.',
      protein: '1.8g a 2.0g por kg de peso corporal (ex: 70kg = 126g a 140g de proteína/dia).',
      carbs: 'Combustível essencial: 6g a 8g/kg em dias de jogo para estocar glicogênio hepático e muscular.',
      hydration: '3 a 4 litros de água com adição de eletrólitos (sódio e magnésio) antes e no intervalo dos jogos para blindar contra cãibras.',
      matchMeal: 'Refeição pré-jogo 3 horas antes: carboidratos de média digestão (arroz, batata ou aveia) + proteína magra (frango ou ovos). Gorduras baixas.'
    },

    injuryPrevention: [
      {
        name: 'Prevenção de Estiramento nos Isquiotibiais (Posterior)',
        solution: 'RDL e flexões excêntricas lentas (3s). O posterior precisa ser forte enquanto está esticado.'
      },
      {
        name: 'Blindagem do Joelho & Ligamento Cruzado Anterior (LCA)',
        solution: 'Agachamento Búlgaro para equilibrar a força entre quadríceps e posteriores, eliminando valgo dinâmico.'
      },
      {
        name: 'Prevenção de Pubalgia & Dores na Virilha',
        solution: 'Prancha Copenhague 2 a 3 vezes por semana para fortalecer os adutores contra mudanças bruscas de direção.'
      },
      {
        name: 'Rigidez Elástica do Tornozelo & Panturrilhas',
        solution: 'Panturrilha em pé no degrau com pausa de 1 segundo no topo para absorver impactos de saltos e arrancadas.'
      }
    ],

    recoveryRoutine: [
      'Sono de 8 a 9 horas: o hormônio GH e a regeneração de microlesões do campo ocorrem no sono profundo.',
      'Imersão em água fria ou banho com contraste após jogos intensos para atenuar a inflamação tecidual aguda.',
      'Mobilidade diária de tornozelo e quadril para evitar sobrecarga compensatória na coluna lombar.'
    ]
  },

  // 2. MANUAL DE GANHO DE PESO & HIPERTROFIA
  hypertrophy: {
    id: 'hypertrophy',
    title: 'Manual de Ganho de Peso & Hipertrofia',
    tag: 'Ganhar Peso & Volume',
    icon: 'Dumbbell',
    subtitle: 'Construção muscular densa, progressão de sobrecarga e superávit calórico limpo.',
    accent: 'sky',
    badgeColor: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    philosophy: 'Para construir massa muscular magra e ganhar peso de verdade, é obrigatório fornecer dois estímulos: sobrecarga progressiva mecânica e superávit energético com proteína suficiente.',

    weeklySplit: [
      {
        day: 'Volume Semanal Ótimo',
        focus: '12 a 20 séries por grupo muscular/semana',
        detail: 'Distribuídas em 2 estímulos semanais para manter a síntese proteica continuamente elevada.'
      },
      {
        day: 'Faixa de Repetições Eficaz',
        focus: '8 a 12 repetições hipertróficas',
        detail: 'Trabalhando com RIR 1-2 (parando a 1 ou 2 repetições antes da falha mecânica total).'
      },
      {
        day: 'Tempo sob Tensão (TUT)',
        focus: 'Cadência 2-0-3',
        detail: '2 segundos na fase concêntrica, sem pausa no topo, e 3 segundos resistindo à descida excêntrica.'
      },
      {
        day: 'Descanso entre Séries',
        focus: '90 a 120 segundos',
        detail: 'Estudos comprovam que descansar menos de 60 segundos reduz a carga utilizável e diminui o ganho de massa.'
      }
    ],

    nutritionStrategy: {
      calories: 'Superávit Calórico Limpo: Consuma +300 a +500 kcal acima do seu gasto energético diário.',
      protein: '2.0g a 2.2g por kg de peso corporal para máxima sinalização da via anabólica mTOR.',
      carbs: 'Abundantes (4g a 6g/kg): repõem o glicogênio muscular, fornecem energia para treinar pesado e evitam catabolismo.',
      hydration: '35 a 45 ml de água por kg de peso corporal ao dia. Músculos bem hidratados têm maior volume celular.',
      creatine: '3g a 5g de Creatina Monohidratada todos os dias (inclusive nos dias de descanso) para saturação dos fosfatos de ATP.'
    },

    injuryPrevention: [
      {
        name: 'Sobrecarga de Peso sem Perder a Postura',
        solution: 'Adicione 1kg ou 2kg apenas quando conseguir fazer todas as séries no teto da faixa de repetições (ex: 3x12).'
      },
      {
        name: 'Amplitude Articular Completa',
        solution: 'Treinar em encurtamento parcial desenvolve menos massa muscular e gera desequilíbrios tendíneos.'
      },
      {
        name: 'Aquecimento Específico com Carga Progressiva',
        solution: 'Faça 2 séries de aquecimento com 50% e 70% do peso de trabalho antes da primeira série pesada do dia.'
      }
    ],

    recoveryRoutine: [
      'Sono inegociável de 8 horas: sem descanso adequado, o cortisol sobe e bloqueia o anabolismo muscular.',
      'Refeição noturna com proteína de absorção gradual (ovos, queijo cottage ou iogurte natural) para sustentar a síntese noturna.',
      'Deload estratégico a cada 6 a 8 semanas: redução de 40% do volume para recuperar ligamentos e tendões.'
    ]
  },

  // 3. MANUAL DE EMAGRECIMENTO & DEFINIÇÃO (PERDER PESO)
  fat_loss: {
    id: 'fat_loss',
    title: 'Manual de Emagrecimento & Definição',
    tag: 'Perder Peso & Queimar Gordura',
    icon: 'Flame',
    subtitle: 'Preservação de massa magra sob déficit calórico, queima de gordura e definição.',
    accent: 'amber',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    philosophy: 'O maior erro de quem quer perder peso é fazer treinos leves com muitas repetições. Você DEVE treinar pesado para sinalizar ao corpo que os músculos são fundamentais, forçando o organismo a oxidar gordura como fonte de energia.',

    weeklySplit: [
      {
        day: 'Musculação com Carga Alta',
        focus: 'Manter a força nos exercícios básicos',
        detail: 'Supino, Agachamento, Puxadas e RDL com 8 a 10 reps pesadas. O músculo preservado mantém o metabolismo acelerado.'
      },
      {
        day: 'Intervalos Moderados',
        focus: '60 a 75 segundos de descanso',
        detail: 'Mantém a densidade do treino e estimula um maior gasto energético intra e pós-treino (efeito EPOC).'
      },
      {
        day: 'Cardio Estratégico (LISS)',
        focus: '20 a 30 min de caminhada inclinada',
        detail: 'Realizado após o treino de força ou em horário oposto para aumentar o gasto calórico sem cansar as articulações.'
      },
      {
        day: 'Passos Diários (NEAT)',
        focus: 'Meta de 8.000 a 10.000 passos/dia',
        detail: 'O gasto energético da atividade espontânea (andar mais) é mais determinante para emagrecer do que o próprio treino.'
      }
    ],

    nutritionStrategy: {
      calories: 'Déficit Calórico Moderado: -400 a -500 kcal do gasto diário (perda segura de 0.5kg a 0.8kg de gordura por semana).',
      protein: 'Alta: 2.2g a 2.4g por kg de peso corporal. A proteína gera saciedade potente e tem efeito térmico digestivo elevado.',
      fiber: 'Mínimo de 30g a 40g de fibras ao dia (vegetais verdes, maçã, aveia, sementes) para saciedade gástrica.',
      hydration: '40 a 50 ml de água por kg de peso corporal ao dia. Frequentemente o cérebro confunde desidratação leve com fome.',
      caution: 'Evite calorias líquidas (refrigerantes comuns, sucos adoçados, bebidas energéticas carregadas em açúcar).'
    },

    injuryPrevention: [
      {
        name: 'Não Pule Refeições Pré-Treino',
        solution: 'Consuma uma pequena porção de carboidrato fácil (ex: 1 banana ou 30g de aveia) 45 min antes para não passar mal.'
      },
      {
        name: 'Não Treine em Jejum Extremo se for Pegar Pesado',
        solution: 'Glicemia baixa reduz o rendimento de força e pode causar tonturas no agachamento.'
      },
      {
        name: 'Ajuste de Cargas em Dias de Cansaço',
        solution: 'Se estiver em déficit agressivo, mantenha a técnica impecável e use repetições na reserva (RIR 2).'
      }
    ],

    recoveryRoutine: [
      'Dormir 7 a 8 horas com quarto escuro: a privação de sono eleva o hormônio grelina (fome) e reduz a leptina (saciedade).',
      'Refeições com grande volume de folhas e legumes cozidos para preencher o estômago sem calorias extras.',
      'Gerenciamento do estresse para evitar picos crônicos de cortisol que aumentam retenção hídrica.'
    ]
  },

  // 4. MANUAL DE FORÇA PURA & CARGAS PESADAS
  strength: {
    id: 'strength',
    title: 'Manual de Força Pura & Cargas Pesadas',
    tag: 'Força & Cargas Pesadas',
    icon: 'Activity',
    subtitle: 'Eficiência neural, recrutamento motor de alto limiar e progressão em multiarticulares.',
    accent: 'blue',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    philosophy: 'A força máxima depende da coordenação neuromuscular, recrutamento sincrônico de unidades motoras e rigidez articular estável sob cargas desafiadoras.',

    weeklySplit: [
      {
        day: 'Exercícios Compostos Principais',
        focus: '3 a 6 repetições por série',
        detail: 'Foco total no Supino, Agachamento, RDL/Terra e Puxadas pesadas com amplitude rigorosa.'
      },
      {
        day: 'Descanso Longo entre Séries',
        focus: '2 a 4 minutos de pausa',
        detail: 'Tempo biológico necessário para restaurar 98% dos estoques intracelulares de fosfocreatina (PCr).'
      },
      {
        day: 'Controle de RPE / RIR',
        focus: 'Trabalhar em RPE 8 a 9',
        detail: 'Nunca treine até a falha concêntrica absoluta em todas as séries; preserve o sistema nervoso central.'
      },
      {
        day: 'Acessórios de Suporte',
        focus: '8 a 10 reps nos isolados',
        detail: 'Tríceps, manguito rotador, panturrilhas e abdômen para blindar os pontos de vulnerabilidade mecânica.'
      }
    ],

    nutritionStrategy: {
      calories: 'Calorias em manutenção ou superávit leve (+200 kcal) para manter o sistema nervoso e tecidos conjuntivos nutridos.',
      protein: '1.8g a 2.0g/kg distribuídos ao longo do dia.',
      hydration: '3 a 4 litros diários para garantir a hidratação dos discos intervertebrais e cartilagens.',
      sodium: 'Ingestão equilibrada de sal de cozinha nos alimentos; o sódio é cofator chave para a condução do impulso nervoso nas sinapses.'
    },

    injuryPrevention: [
      {
        name: 'Manobra de Valsalva & Bracing Abdominal',
        solution: 'Inspire expandindo o abdômen em 360° e trave a pressão intra-abdominal antes de iniciar a descida.'
      },
      {
        name: 'Trajetória Impecável da Barra / Halteres',
        solution: 'Manter a carga alinhada ao centro de gravidade das articulações envolvidas reduz torque lesivo.'
      },
      {
        name: 'Aquecimento Piramidal',
        solution: 'Progressão gradual de cargas (barra vazia -> 50% -> 70% -> 85% -> carga de trabalho do dia).'
      }
    ],

    recoveryRoutine: [
      'Descanso de 48h a 72h entre sessões que recrutam o mesmo grupamento muscular pesado.',
      'Suplementação de ômega-3 e colágeno para apoiar a saúde de cartilagens e tendões sobrecarregados.',
      'Liberação miofascial com rolo nas bandas iliotibiais e dorsais.'
    ]
  },

  // 5. MANUAL DE SAÚDE, POSTURA & LONGEVIDADE
  health: {
    id: 'health',
    title: 'Manual de Saúde, Postura & Longevidade',
    tag: 'Saúde & Longevidade',
    icon: 'ShieldCheck',
    subtitle: 'Fortalecimento articular, equilíbrio da cadeia posterior, flexibilidade e vitalidade.',
    accent: 'emerald',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    philosophy: 'A musculação é o remédio mais potente contra o envelhecimento precoce, sarcopenia e dores posturais. O foco é equilíbrio biomecânico, mobilidade e independência física para a vida toda.',

    weeklySplit: [
      {
        day: 'Treino de Força Funcional',
        focus: '10 a 15 repetições controladas',
        detail: 'Estímulo articular seguro sem sobrecarga compressiva excessiva na coluna vertebral.'
      },
      {
        day: 'Ênfase em Cadeia Posterior',
        focus: 'Puxadas, Remadas e Glúteos',
        detail: 'Combate os efeitos da vida sentada e o uso constante de smartphones, realinhando escápulas e pescoço.'
      },
      {
        day: 'Mobilidade & Flexibilidade',
        focus: '10 min diários de mobilidade',
        detail: 'Cápsula de quadril (90/90), dorsiflexão de tornozelo e rotação torácica para alívio da lombar.'
      },
      {
        day: 'Estabilidade do Core',
        focus: 'Pranchas estáticas e Dead Bug',
        detail: 'Fortalece o transverso abdominal como uma cinta natural de proteção das vértebras.'
      }
    ],

    nutritionStrategy: {
      calories: 'Alimentação baseada em comida de verdade e densidade de micronutrientes.',
      protein: '1.6g a 1.8g por kg de peso corporal para combater a perda de massa muscular ao longo dos anos.',
      antiInflammatory: 'Rica em azeite de oliva extravirgem, peixes, frutas vermelhas, castanhas e cúrcuma.',
      hydration: '35 ml por kg de peso corporal ao dia para lubrificação das cápsulas sinoviais e funcionamento renal.'
    },

    injuryPrevention: [
      {
        name: 'Zero Treino com Dor Articular Aguda',
        solution: 'Dor no músculo é bem-vinda; dor pontual na articulação ou tendão é sinal para ajustar a amplitude.'
      },
      {
        name: 'Respiração Rítmica Fluida',
        solution: 'Nunca prenda a respiração se tiver histórico de pressão arterial alta; expire no esforço.'
      },
      {
        name: 'Postura Neutra em Todos os Movimentos',
        solution: 'Olhar à frente, queixo recolhido e peito aberto durante todo o exercício.'
      }
    ],

    recoveryRoutine: [
      'Caminhadas ao ar livre sob a luz da manhã para regular o ciclo circadiano e a vitamina D.',
      'Alongamentos leves antes de dormir para aliviar a tensão da fáscia muscular.',
      'Consistência acima de intensidade extrema: o melhor treino é aquele que você consegue manter por décadas.'
    ]
  }
};
