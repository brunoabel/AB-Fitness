import { BRAND, STUDIO, OWNER, CONTACT_EMAIL, LEGAL_ID, LEGAL_ADDRESS, LAST_UPDATED } from './config.js';

const E = CONTACT_EMAIL;

export default {
  slug: 'termos',
  title: 'Termos e Condições de Uso',
  description: `Regras de utilização do ${BRAND}: conta, propriedade intelectual, conduta na partilha com amigos, cancelamento e lei aplicável.`,
  updated: LAST_UPDATED,
  intro: `Estes Termos regulam a utilização do ${BRAND}, uma aplicação web instalável (PWA) de registo de treino, corrida e recuperação, desenvolvida pela ${STUDIO}. Ao criar conta ou usar a aplicação, o Utilizador aceita-os. Se não concordar, pode continuar em modo convidado, sem conta, ou deixar de usar o serviço.`,
  sections: [
    {
      id: 'quem-somos',
      title: '1. Quem somos',
      blocks: [
        `O ${BRAND} é um serviço da **${STUDIO}**, marca de **${OWNER}**, com morada fiscal na ${LEGAL_ADDRESS}${LEGAL_ID ? `, com o número de identificação fiscal ${LEGAL_ID}` : ''}.`,
        `Contacto para qualquer assunto relacionado com estes Termos: [${E}](mailto:${E}).`,
        'Para efeitos destes Termos, "Utilizador" é a pessoa que usa a aplicação, com ou sem conta, e "Serviço" é a aplicação, o site, os conteúdos e as funcionalidades associadas.'
      ]
    },
    {
      id: 'servico',
      title: '2. O que o Serviço oferece',
      blocks: [
        'O Serviço permite, entre outras funcionalidades:',
        {
          ul: [
            'criar e seguir planos de treino, registar séries, cargas e repetições, e acompanhar a progressão;',
            'consultar a biblioteca de exercícios, vídeos de execução e fichas técnicas;',
            'registar corridas com percurso GPS, ritmo e distância (AB Running Club);',
            'consultar o Mapa de Recuperação Muscular e planos de mobilidade e prevenção de lesões;',
            'conversar com o AB Coach, um assistente de inteligência artificial;',
            'criar um perfil de atleta, adicionar amigos, partilhar atividade e comparar resultados.'
          ]
        },
        'O Serviço é um instrumento de apoio ao treino. **Não presta cuidados de saúde, não faz diagnósticos e não substitui médicos, fisioterapeutas ou treinadores qualificados.** Leia o [Aviso Médico e de IA](/aviso-medico), que faz parte integrante destes Termos.',
        'Podemos acrescentar, alterar ou retirar funcionalidades. Quando a alteração prejudicar de forma relevante o uso que o Utilizador faz do Serviço, avisamos com antecedência razoável.'
      ]
    },
    {
      id: 'conta',
      title: '3. Conta, idade e modo convidado',
      blocks: [
        'Para usar o Serviço com sincronização na nuvem e funcionalidades sociais é necessário criar uma conta com e-mail e palavra-passe.',
        {
          ul: [
            '**Idade mínima:** 16 anos. Entre os 14 e os 15 anos, apenas com autorização do titular das responsabilidades parentais, que deve acompanhar a utilização. Não é permitido criar conta abaixo dos 14 anos.',
            '**Dados verdadeiros:** o Utilizador compromete-se a fornecer informação correta e a mantê-la atualizada, em especial a que usa para calcular cargas e recomendações.',
            '**Segurança:** a palavra-passe é pessoal. O Utilizador é responsável pela atividade na sua conta e deve avisar-nos de imediato se suspeitar de acesso indevido.',
            '**Uma pessoa, uma conta:** não é permitido partilhar a conta, criar contas falsas ou fazer-se passar por outra pessoa.'
          ]
        },
        'O **modo convidado** permite usar grande parte do Serviço sem conta. Nesse modo os dados ficam guardados apenas no aparelho e perdem-se se os dados do navegador forem apagados ou se a aplicação for desinstalada.'
      ]
    },
    {
      id: 'uso-aceitavel',
      title: '4. Utilização aceitável e conduta com amigos',
      blocks: [
        'O Utilizador compromete-se a usar o Serviço de forma lícita e respeitosa. Em particular, é proibido:',
        {
          ul: [
            'assediar, ameaçar, discriminar ou expor outros utilizadores, incluindo através do nome de utilizador, da biografia ou da fotografia de perfil;',
            'publicar fotografias de terceiros, conteúdo ilícito, ofensivo, sexualmente explícito ou que viole direitos de autor ou de imagem;',
            'enviar pedidos de amizade em massa, recolher dados de outros atletas ou usar a pesquisa de atletas para fins que não sejam treinar em conjunto;',
            'inserir dados falsos para obter vantagem em comparações, recordes ou classificações;',
            'tentar aceder a contas ou dados de outros utilizadores, contornar medidas de segurança, fazer engenharia inversa, extrair dados em massa (scraping) ou sobrecarregar o Serviço;',
            'usar o AB Coach para obter conteúdo ilícito ou para tentar manipular o seu comportamento (por exemplo, injeção de instruções).'
          ]
        },
        'A informação que o Utilizador escolhe mostrar aos amigos (estatísticas, sequência de treinos, cargas, histórico) é controlada nas definições de privacidade do perfil, e pode ser alterada a qualquer momento. O Utilizador pode bloquear ou remover amigos.',
        `Podemos remover conteúdo, limitar funcionalidades ou suspender contas que violem esta secção. Sempre que possível avisamos antes e permitimos explicações. Para denunciar um perfil ou conteúdo, escreva para [${E}](mailto:${E}).`
      ]
    },
    {
      id: 'propriedade-intelectual',
      title: '5. Propriedade intelectual',
      blocks: [
        `Pertencem à ${STUDIO} ou aos respetivos licenciantes o código-fonte, o design e a interface, o nome e o logótipo ${BRAND}, o avatar e a personagem AB Coach, os textos, os planos e demais conteúdos originais do Serviço. Os conteúdos de terceiros licenciados (por exemplo, certos vídeos ou imagens de exercícios) mantêm-se propriedade dos respetivos titulares e são usados ao abrigo da licença correspondente.`,
        'O Utilizador recebe uma licença pessoal, limitada, revogável, não exclusiva e intransmissível para usar o Serviço para treino próprio. Não pode copiar, vender, redistribuir, descarregar em massa ou reutilizar vídeos, imagens, código ou o avatar AB Coach fora do uso normal da aplicação, nem usar a marca sem autorização escrita.',
        '**Conteúdo do Utilizador.** O Utilizador mantém a titularidade dos conteúdos que cria (fotografia, biografia, notas e registos de treino). Concede à ' + STUDIO + ' uma licença não exclusiva, gratuita e limitada ao tempo em que mantiver a conta, apenas para alojar, apresentar e processar esses conteúdos no Serviço, nos termos que o próprio Utilizador define nas definições de privacidade. Garante que tem direito a publicá-los.',
        'Se entender que um conteúdo viola direitos de autor ou outros direitos seus, indique-nos a identificação do conteúdo e do direito invocado e removê-lo-emos rapidamente se a queixa for fundada.'
      ]
    },
    {
      id: 'ia',
      title: '6. AB Coach e inteligência artificial',
      blocks: [
        'O AB Coach é um sistema de inteligência artificial. As respostas são geradas automaticamente e podem conter erros, omissões ou sugestões inadequadas à situação concreta do Utilizador. Quem conversa com o AB Coach está a interagir com uma máquina, e não com uma pessoa.',
        'As sugestões do AB Coach, do Mapa de Recuperação Muscular e dos planos de prevenção de lesões são **informativas e desportivas**. O Utilizador decide, por sua conta e risco, se as aplica, e deve adaptá-las às suas capacidades e condição física. Os detalhes estão no [Aviso Médico e de IA](/aviso-medico).'
      ]
    },
    {
      id: 'precos',
      title: '7. Preço, subscrições e cancelamento',
      blocks: [
        `Na data da última atualização destes Termos, o ${BRAND} é **gratuito**.`,
        'Se vierem a existir funcionalidades pagas ou subscrições, o Utilizador será informado antes de qualquer cobrança, de forma clara, sobre o preço total com impostos, a periodicidade, o método de renovação e o modo de cancelar. Nada será cobrado sem confirmação expressa do Utilizador. Aplicam-se então, conforme a residência do Utilizador, o direito de livre resolução de 14 dias previsto no Decreto-Lei n.º 24/2014 (Portugal) e o direito de arrependimento de 7 dias previsto no artigo 49.º do Código de Defesa do Consumidor (Brasil), com as exceções legalmente admitidas.',
        '**Cancelar a conta.** O Utilizador pode eliminar a conta e todos os dados associados em qualquer altura, sem custos e sem justificação, em Perfil, Definições, Eliminar conta. A eliminação é imediata e irreversível. Pode também deixar de usar o Serviço a qualquer momento.'
      ]
    },
    {
      id: 'privacidade',
      title: '8. Privacidade e dados pessoais',
      blocks: [
        'O tratamento de dados pessoais, incluindo dados de saúde, é descrito na [Política de Privacidade e Cookies](/privacidade). Os dados de saúde só são tratados com consentimento explícito do Utilizador, que pode ser retirado a qualquer momento.'
      ]
    },
    {
      id: 'disponibilidade',
      title: '9. Disponibilidade do Serviço',
      blocks: [
        'Procuramos manter o Serviço disponível e seguro, mas não garantimos funcionamento ininterrupto ou livre de erros. Podem existir interrupções para manutenção, falhas de fornecedores externos, de rede ou do dispositivo. Algumas funcionalidades dependem de permissões do navegador (por exemplo, localização para corridas) e de um sinal GPS adequado, cuja precisão não controlamos.',
        'Recomenda-se que o Utilizador mantenha cópia dos registos que considere importantes, em particular antes de eliminar a conta.'
      ]
    },
    {
      id: 'responsabilidade',
      title: '10. Limitação de responsabilidade',
      blocks: [
        'O exercício físico envolve riscos inerentes. Na máxima medida permitida pela lei, a ' + STUDIO + ' não responde por lesões, problemas de saúde ou danos resultantes da prática de exercício, da aplicação de sugestões do Serviço ou de decisões tomadas com base nelas, nem por perdas indiretas, lucros cessantes ou perda de dados não causada por dolo ou culpa grave nossa.',
        'Nada nestes Termos exclui ou limita a responsabilidade que não possa ser excluída por lei, nomeadamente por dolo ou negligência grosseira, por danos à vida, integridade física ou saúde causados por culpa nossa, nem os direitos imperativos dos consumidores previstos na legislação portuguesa, na legislação da União Europeia ou, para utilizadores no Brasil, no Código de Defesa do Consumidor.'
      ]
    },
    {
      id: 'suspensao',
      title: '11. Suspensão e encerramento',
      blocks: [
        'Podemos suspender ou encerrar uma conta em caso de violação grave ou reiterada destes Termos, de uso fraudulento ou de risco para a segurança do Serviço ou de outros utilizadores. Notificamos o Utilizador, indicando o motivo, salvo se a lei ou a segurança o impedirem, e damos oportunidade de resposta sempre que possível.',
        'Em caso de encerramento, o Utilizador pode pedir cópia dos seus dados pessoais, nos termos da Política de Privacidade. Podemos ainda eliminar contas inativas há mais de 24 meses, com aviso prévio por e-mail.'
      ]
    },
    {
      id: 'alteracoes',
      title: '12. Alterações aos Termos',
      blocks: [
        'Podemos atualizar estes Termos para refletir mudanças no Serviço ou na lei. As alterações relevantes são comunicadas com pelo menos 15 dias de antecedência, na aplicação ou por e-mail. Se o Utilizador não concordar, pode eliminar a conta antes da entrada em vigor. O uso continuado após essa data implica aceitação. A data da última atualização está no topo desta página.'
      ]
    },
    {
      id: 'lei-foro',
      title: '13. Lei aplicável, litígios e foro',
      blocks: [
        'Estes Termos regem-se pela lei portuguesa. Para qualquer litígio é competente o foro da comarca do Porto, **sem prejuízo dos direitos dos consumidores** de recorrer aos tribunais do local da sua residência e de beneficiar das normas imperativas do seu país, incluindo, no Brasil, o Código de Defesa do Consumidor.',
        'Nos termos do artigo 18.º da Lei n.º 144/2015, informa-se que em caso de litígio de consumo o consumidor pode recorrer a uma entidade de Resolução Alternativa de Litígios (RAL): **CICAP – Centro de Informação de Consumo e Arbitragem do Porto**, com sede na Rua Damião de Góis, 31, Loja 6, 4050-225 Porto ([www.cicap.pt](https://www.cicap.pt)), ou consultar a lista nacional no Portal do Consumidor ([www.consumidor.gov.pt](https://www.consumidor.gov.pt)).',
        'Os consumidores podem ainda aceder à plataforma oficial do [Livro de Reclamações Eletrónico](https://www.livroreclamacoes.pt). Reclamações sobre privacidade e proteção de dados podem ser apresentadas à [CNPD](https://www.cnpd.pt) (Portugal) ou à [ANPD](https://www.gov.br/anpd) (Brasil).'
      ]
    },
    {
      id: 'disposicoes-finais',
      title: '14. Disposições finais',
      blocks: [
        'Se alguma cláusula destes Termos for considerada inválida, as restantes mantêm-se em vigor. A tolerância na aplicação de uma cláusula não implica renúncia ao direito de a exigir. Estes Termos, a Política de Privacidade e o Aviso Médico e de IA constituem o acordo integral entre o Utilizador e a ' + STUDIO + ' quanto ao Serviço.'
      ]
    }
  ]
};
