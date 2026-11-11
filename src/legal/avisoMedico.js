import { BRAND, STUDIO, CONTACT_EMAIL, LAST_UPDATED } from './config.js';

export default {
  slug: 'aviso-medico',
  title: 'Aviso Médico e de Inteligência Artificial',
  description: `O AB Coach, o Mapa de Recuperação Muscular e os planos de prevenção de lesões do ${BRAND} são informativos e desportivos. Não constituem diagnóstico, tratamento nem aconselhamento médico ou fisioterapêutico.`,
  updated: LAST_UPDATED,
  intro: `O ${BRAND} ajuda a treinar, mas não é um serviço de saúde. Leia este aviso antes de seguir qualquer plano, alongamento ou sugestão da aplicação. Em caso de dúvida sobre a sua saúde, fale primeiro com um profissional qualificado.`,
  sections: [
    {
      id: 'natureza',
      title: '1. Natureza informativa e desportiva',
      blocks: [
        'Todo o conteúdo do Serviço, incluindo planos de treino, cargas sugeridas, vídeos e fichas de exercícios, o **AB Coach**, o **Mapa de Recuperação Muscular** e os planos de **mobilidade e prevenção de lesões**, tem fim exclusivamente **informativo e desportivo**.',
        'Não constitui diagnóstico médico ou fisioterapêutico, prescrição, tratamento, reabilitação nem aconselhamento clínico, nutricional ou psicológico, e não cria qualquer relação entre o Utilizador e um profissional de saúde.',
        `A ${STUDIO} não é um prestador de cuidados de saúde e os seus conteúdos não substituem a avaliação de um médico, fisioterapeuta, nutricionista ou profissional de educação física.`
      ]
    },
    {
      id: 'antes-de-comecar',
      title: '2. Antes de começar a treinar',
      blocks: [
        'Consulte um médico antes de iniciar ou alterar um programa de exercício se:',
        {
          ul: [
            'tem ou teve doença cardiovascular, respiratória, metabólica (como diabetes) ou hipertensão;',
            'tem lesões, dores articulares ou musculares persistentes, ou fez cirurgias recentes;',
            'está grávida, no pós-parto, ou tem condição que afete o exercício;',
            'tem menos de 18 anos, ou mais de 40 e vida sedentária;',
            'toma medicação que afete o ritmo cardíaco, o equilíbrio ou a perceção de esforço;',
            'sentiu alguma vez dor no peito, tonturas ou falta de ar ao esforçar-se.'
          ]
        },
        'Entre os 14 e os 17 anos, a prática deve ser acompanhada por um adulto responsável.'
      ]
    },
    {
      id: 'sinais-de-alerta',
      title: '3. Pare e procure ajuda',
      blocks: [
        'Interrompa de imediato o exercício se sentir dor aguda, dor no peito, pressão ou aperto no tórax, falta de ar fora do normal, tonturas, náuseas, visão turva, palpitações, dormência ou formigueiro, ou um "estalo" numa articulação. Dor persistente, inchaço ou perda de força devem ser avaliados por um profissional.',
        {
          note: 'Em caso de emergência, ligue **112** (Portugal) ou **192 SAMU** (Brasil). Em Portugal, para aconselhamento de saúde não urgente, ligue **SNS 24: 808 24 24 24**.'
        }
      ]
    },
    {
      id: 'ab-coach',
      title: '4. AB Coach e inteligência artificial',
      blocks: [
        'O AB Coach é um sistema de inteligência artificial, e as suas respostas são geradas automaticamente. Ao usá-lo, está a conversar com uma máquina.',
        {
          ul: [
            '**Pode errar.** As respostas podem conter informação incorreta, incompleta, desatualizada ou inadequada ao seu caso, mesmo quando parecem convincentes.',
            '**Não conhece o seu estado de saúde real.** Só tem em conta o que registou na aplicação, e não pode examinar nem avaliar o seu corpo.',
            '**Não faz diagnósticos.** Se descrever dor ou sintomas, o AB Coach pode sugerir prudência ou descanso, mas não identifica a causa nem recomenda tratamento.',
            '**Não substitui um treinador presente,** que pode corrigir o seu movimento em tempo real.',
            'As decisões que tomar com base nas respostas são da sua responsabilidade. Verifique as informações importantes com um profissional.'
          ]
        },
        'As mensagens são processadas por um fornecedor externo de IA, conforme a [Política de Privacidade](/privacidade). Não partilhe dados que não queira divulgar.'
      ]
    },
    {
      id: 'mapa-recuperacao',
      title: '5. Mapa de Recuperação Muscular',
      blocks: [
        'O Mapa de Recuperação Muscular **estima** a fadiga de cada grupo muscular a partir do volume de séries que registou nas últimas 72 horas, usando um modelo matemático simplificado de decaimento. É uma referência para planear o treino, e não uma medição fisiológica.',
        {
          ul: [
            'Não mede lesões, inflamação nem dano muscular, e não deteta doenças;',
            'não considera sono, nutrição, stress, idade, medicação, treinos fora da aplicação ou diferenças individuais de recuperação;',
            'um músculo marcado como "fresco" pode ainda estar lesionado ou dorido, e um marcado como "fadigado" pode estar apto a treinar;',
            'a sua perceção do corpo prevalece sobre o mapa. Se sentir dor, descanse, independentemente da cor.'
          ]
        }
      ]
    },
    {
      id: 'prevencao',
      title: '6. Prevenção de lesões, alongamentos e mobilidade',
      blocks: [
        'Os planos de prevenção de lesões, alongamentos e mobilidade reúnem exercícios de uso corrente no desporto. **Não tratam nem reabilitam lesões** e não garantem que não se lesiona. Em particular:',
        {
          ul: [
            'faça os exercícios dentro de uma amplitude confortável, sem dor aguda;',
            'o desconforto de alongar é normal, mas a dor, o formigueiro ou a perda de força não;',
            'não alongue de forma intensa uma zona lesionada ou inflamada;',
            'reduza a carga e procure um profissional se o desconforto persistir mais de alguns dias.'
          ]
        },
        'Se tem uma lesão diagnosticada, siga a orientação do seu médico ou fisioterapeuta, que prevalece sobre qualquer plano da aplicação.'
      ]
    },
    {
      id: 'corrida',
      title: '7. Corrida e atividade ao ar livre',
      blocks: [
        'Ao correr com a aplicação, mantenha atenção ao trânsito, ao piso e às condições meteorológicas, e use a aplicação de forma segura (idealmente com o ecrã bloqueado). Distâncias, ritmos, calorias e altimetria dependem da precisão do GPS e são **estimativas**. Respeite as regras de trânsito e escolha locais seguros e iluminados.'
      ]
    },
    {
      id: 'tecnica',
      title: '8. Técnica, carga e segurança no ginásio',
      blocks: [
        'Os vídeos e as dicas de execução não substituem a supervisão. Comece com cargas que consiga controlar, use sempre equipamento adequado e em bom estado, peça ajuda ou um apoiante em exercícios de risco (por exemplo, supino ou agachamento com carga elevada) e respeite o seu limite. As cargas e repetições sugeridas são pontos de partida, e não objetivos obrigatórios.'
      ]
    },
    {
      id: 'responsabilidade',
      title: '9. Limitação de responsabilidade',
      blocks: [
        `Ao usar o ${BRAND}, o Utilizador reconhece que o exercício físico envolve riscos e que decide, por sua conta e risco, se segue as informações e sugestões da aplicação. Na máxima medida permitida pela lei, a ${STUDIO} não responde por lesões ou danos resultantes dessa utilização.`,
        'Esta limitação não exclui a responsabilidade que não possa ser afastada por lei, designadamente por dolo ou negligência grosseira, nem os direitos imperativos dos consumidores. Aplica-se em conjunto com os [Termos e Condições](/termos).'
      ]
    },
    {
      id: 'contacto',
      title: '10. Dúvidas e erros de conteúdo',
      blocks: [
        `Se encontrar uma sugestão, exercício ou resposta que lhe pareça incorreta ou perigosa, diga-nos para [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). Analisamos e corrigimos o conteúdo.`
      ]
    }
  ]
};
