import { BRAND, STUDIO, OWNER, CONTACT_EMAIL, LEGAL_ID, LEGAL_ADDRESS, LAST_UPDATED } from './config.js';

const E = CONTACT_EMAIL;

export default {
  slug: 'privacidade',
  title: 'Política de Privacidade e Cookies',
  description: `Que dados pessoais e de saúde o ${BRAND} trata, porquê, durante quanto tempo, com quem os partilha e como exercer os seus direitos (RGPD e LGPD).`,
  updated: LAST_UPDATED,
  intro: `Esta Política explica como a ${STUDIO} trata os seus dados pessoais no ${BRAND}, em cumprimento do Regulamento (UE) 2016/679 (RGPD), da Lei n.º 58/2019 (Portugal) e, para utilizadores no Brasil, da Lei Geral de Proteção de Dados (Lei n.º 13.709/2018, LGPD). Em resumo: recolhemos o necessário para o treino funcionar, tratamos dados de saúde apenas com o seu consentimento explícito, não vendemos dados, não usamos publicidade nem cookies de rastreamento, e pode eliminar a conta e todos os dados a qualquer momento na própria aplicação.`,
  sections: [
    {
      id: 'responsavel',
      title: '1. Responsável pelo tratamento',
      blocks: [
        `O responsável pelo tratamento é a **${STUDIO}**, marca de **${OWNER}**, com morada fiscal na ${LEGAL_ADDRESS}${LEGAL_ID ? `, NIF ${LEGAL_ID}` : ''}. Não é obrigatória a designação de Encarregado de Proteção de Dados; o contacto para todas as questões de privacidade é [${E}](mailto:${E}).`,
        'Para os utilizadores no Brasil, a mesma pessoa atua como controlador e como encarregado para efeitos do artigo 41.º da LGPD, no mesmo contacto.'
      ]
    },
    {
      id: 'dados',
      title: '2. Dados que tratamos',
      blocks: [
        'Só pedimos os dados de que a aplicação precisa. Em modo convidado, os dados ficam no seu aparelho e não são enviados para os nossos servidores (exceto as mensagens enviadas ao AB Coach, descritas abaixo).',
        {
          table: {
            head: ['Categoria', 'Dados', 'Origem'],
            rows: [
              ['Conta e perfil', 'Nome, e-mail, palavra-passe (guardada cifrada pelo Supabase Auth, nunca em texto simples), fotografia, nome de utilizador, biografia, ginásio habitual, etiqueta de atleta', 'Fornecidos por si'],
              ['Dados biométricos e de saúde (categoria especial)', 'Peso, altura, idade, sexo, objetivo, nível de experiência, lesões ou dores articulares e musculares que indique, músculos prioritários, avaliações de esforço e desconforto nos check-ins pós-treino, nível estimado de fadiga muscular', 'Fornecidos por si e calculados pela aplicação'],
              ['Treino', 'Planos, sessões, exercícios, cargas, repetições, duração, recordes, sequência de treinos', 'Registados por si'],
              ['Corrida e localização', 'Percurso GPS (coordenadas), distância, ritmo, parciais, altimetria, calorias estimadas', 'Dispositivo, durante uma corrida ativa e com a sua permissão'],
              ['Social', 'Pedidos e lista de amigos, "respeitos" dados a treinos, opções de privacidade', 'Gerados pelo uso'],
              ['Conversas com o AB Coach', 'Mensagens que escreve e um resumo do seu perfil de treino', 'Fornecidos por si'],
              ['Técnicos', 'Endereço IP, tipo de navegador e dispositivo, registos de erros e de segurança', 'Recolhidos automaticamente pelos fornecedores de alojamento']
            ]
          }
        },
        'O peso, a altura e as informações sobre lesões e fadiga são considerados **dados relativos à saúde** (artigo 9.º do RGPD; artigo 11.º da LGPD, dados pessoais sensíveis). A localização só é lida quando inicia uma corrida e o navegador lhe pede permissão; pode revogá-la a qualquer momento nas definições do navegador.'
      ]
    },
    {
      id: 'finalidades',
      title: '3. Finalidades e fundamentos legais',
      blocks: [
        {
          table: {
            head: ['Finalidade', 'Fundamento legal'],
            rows: [
              ['Criar e gerir a conta, autenticar, sincronizar dados entre aparelhos', 'Execução do contrato (art. 6.º, n.º 1, al. b) do RGPD)'],
              ['Registar treinos e calcular a sobrecarga progressiva, cargas sugeridas, recordes e sequência', 'Execução do contrato (art. 6.º, n.º 1, al. b)); para os dados de saúde envolvidos, consentimento explícito (art. 9.º, n.º 2, al. a))'],
              ['Calcular o Mapa de Recuperação Muscular e sugerir mobilidade e prevenção de lesões', 'Consentimento explícito para dados de saúde (art. 9.º, n.º 2, al. a))'],
              ['Personalizar planos e respostas do AB Coach com o seu perfil, lesões e check-ins', 'Consentimento explícito (art. 9.º, n.º 2, al. a))'],
              ['Registar e mostrar corridas com percurso GPS', 'Execução do contrato (art. 6.º, n.º 1, al. b)); permissão de localização do navegador'],
              ['Perfil de atleta, amigos, feed e comparação entre amigos, conforme as suas opções de privacidade', 'Execução do contrato (art. 6.º, n.º 1, al. b)); a visibilidade é controlada por si'],
              ['Segurança, prevenção de abuso e fraude, diagnóstico de erros', 'Interesse legítimo (art. 6.º, n.º 1, al. f))'],
              ['Cumprir obrigações legais e responder a autoridades', 'Obrigação legal (art. 6.º, n.º 1, al. c))'],
              ['Guardar prova do consentimento dado', 'Obrigação legal e interesse legítimo (art. 7.º, n.º 1 e art. 6.º, n.º 1, al. f))']
            ]
          }
        },
        '**Consentimento para dados de saúde.** Pedimo-lo de forma separada, no registo, com uma caixa que não vem pré-selecionada. Sem ele não criamos conta com sincronização, mas pode usar o modo convidado, em que os dados ficam só no aparelho. Pode retirar o consentimento a qualquer momento (por exemplo, eliminando a conta); a retirada não afeta a licitude do tratamento anterior. Registamos a versão e a data do consentimento.',
        'Não tomamos decisões exclusivamente automatizadas com efeitos jurídicos ou semelhantes sobre si. As sugestões do AB Coach e do Mapa de Recuperação são apoio informativo; consulte o [Aviso Médico e de IA](/aviso-medico).'
      ]
    },
    {
      id: 'destinatarios',
      title: '4. Com quem partilhamos os dados (subprocessadores)',
      blocks: [
        'Não vendemos dados pessoais nem os usamos para publicidade. Recorremos aos seguintes prestadores, que tratam dados em nosso nome ao abrigo de contratos de tratamento de dados:',
        {
          table: {
            head: ['Prestador', 'Função', 'Dados', 'Localização e garantias'],
            rows: [
              ['Supabase Inc.', 'Base de dados, autenticação, armazenamento de fotografias, funções de servidor', 'Conta, perfil, saúde, treinos, corridas, social, fotografia', 'Infraestrutura na região configurada para o projeto; cláusulas contratuais-tipo e certificações do fornecedor'],
              ['Vercel Inc.', 'Alojamento e entrega da aplicação (CDN)', 'IP e dados técnicos de pedido', 'EUA e rede global; Quadro de Privacidade UE-EUA e cláusulas contratuais-tipo'],
              ['Google LLC (Gemini API)', 'Geração das respostas do AB Coach', 'Mensagens da conversa e resumo do perfil de treino (cargas, últimos treinos, objetivos, check-ins, lesões indicadas)', 'EUA; Quadro de Privacidade UE-EUA e cláusulas contratuais-tipo'],
              ['Cloudflare, Inc. (R2)', 'Entrega de vídeos e imagens de exercícios', 'IP e dados técnicos de pedido', 'Rede global; cláusulas contratuais-tipo'],
              ['Google Fonts', 'Tipos de letra da interface', 'IP e dados técnicos de pedido', 'EUA; Quadro de Privacidade UE-EUA'],
              ['Esri e OpenStreetMap Foundation', 'Imagens do mapa nas corridas', 'IP e coordenadas das áreas do mapa pedidas (não o seu percurso nem a sua identidade)', 'EUA e Reino Unido']
            ]
          }
        },
        'Os dados enviados ao fornecedor de IA **não incluem a sua palavra-passe**. Evite escrever no chat dados que não queira partilhar. Pode ainda ser necessário comunicar dados a autoridades judiciais ou administrativas, quando a lei o exigir.',
        '**Amigos e outros utilizadores.** Quem aceita como amigo vê apenas o que as suas opções de privacidade permitem (perfil público, cargas, sequência, histórico; os dados biométricos estão desligados por defeito). Se o perfil for público, outros utilizadores podem encontrá-lo pela pesquisa por nome ou nome de utilizador.',
        '**Fotografia de perfil.** As fotografias são guardadas num repositório de leitura pública: quem tiver o endereço da imagem consegue vê-la, mesmo sem conta. Use uma fotografia com que se sinta à vontade, e elimine-a quando quiser.'
      ]
    },
    {
      id: 'transferencias',
      title: '5. Transferências internacionais',
      blocks: [
        'Alguns prestadores estão sediados fora do Espaço Económico Europeu (sobretudo nos Estados Unidos). Nesses casos, as transferências assentam em decisão de adequação (Quadro de Privacidade UE-EUA, quando o prestador está certificado) ou em cláusulas contratuais-tipo aprovadas pela Comissão Europeia, com medidas complementares quando necessário. Para utilizadores no Brasil, aplicam-se os mecanismos previstos nos artigos 33.º e seguintes da LGPD.'
      ]
    },
    {
      id: 'retencao',
      title: '6. Prazos de conservação',
      blocks: [
        {
          table: {
            head: ['Dados', 'Prazo'],
            rows: [
              ['Conta, perfil, saúde, treinos, corridas, amigos e fotografia', 'Enquanto a conta existir. Eliminados de imediato quando a elimina, ou, em caso de inatividade superior a 24 meses, após aviso por e-mail'],
              ['Registo do consentimento', 'Enquanto a conta existir; eliminado com a conta'],
              ['Mensagens enviadas ao AB Coach', 'O histórico da conversa fica no seu aparelho; o fornecedor de IA conserva-as pelo prazo definido nos seus termos de tratamento de dados'],
              ['Registos técnicos e de segurança', 'Pelo prazo mínimo necessário, definido pelos fornecedores de alojamento'],
              ['Cópias de segurança', 'Os dados eliminados podem permanecer em cópias de segurança automáticas do fornecedor de base de dados (Supabase) por um período de até 30 dias (ciclo padrão de rotação e retenção de backups), sem qualquer processamento ativo, sendo sobrescritos após esse prazo'],
              ['Dados em modo convidado', 'Apenas no seu aparelho, até os apagar ou desinstalar a aplicação']
            ]
          }
        }
      ]
    },
    {
      id: 'direitos',
      title: '7. Os seus direitos (ARCO)',
      blocks: [
        'Tem os seguintes direitos, que pode exercer a qualquer momento e sem custos, na aplicação ou por e-mail para [' + E + '](mailto:' + E + '):',
        {
          ul: [
            '**Acesso:** saber se tratamos dados seus e obter cópia (RGPD art. 15.º; LGPD art. 18.º, II);',
            '**Retificação:** corrigir dados inexatos ou incompletos. Pode editar o perfil e os dados de treino diretamente na aplicação;',
            '**Cancelamento e esquecimento:** eliminar os dados. Em Perfil, Definições, Eliminar conta, apagamos a conta e todos os dados associados de imediato;',
            '**Oposição:** opor-se ao tratamento baseado em interesse legítimo;',
            '**Limitação** do tratamento e **portabilidade** dos dados num formato estruturado e de uso corrente;',
            '**Retirar o consentimento** para dados de saúde, sem prejuízo do tratamento anterior;',
            '**Revisão** de decisões automatizadas, e informação sobre as entidades com quem os dados são partilhados (LGPD).'
          ]
        },
        'Respondemos no prazo máximo de um mês (RGPD) ou de 15 dias (LGPD, para a declaração completa), prorrogável nos termos legais. Podemos pedir informação adicional para confirmar a sua identidade.'
      ]
    },
    {
      id: 'eliminacao',
      title: '8. Eliminar a conta e os dados',
      blocks: [
        'Em **Perfil, Definições, Eliminar conta**, o utilizador confirma escrevendo "ELIMINAR". A eliminação é imediata e irreversível e remove:',
        {
          ul: [
            'a conta de autenticação e o perfil de atleta;',
            'dados de saúde, planos, sessões, cargas e corridas (incluindo percursos GPS);',
            'amizades, pedidos e "respeitos";',
            'a fotografia de perfil;',
            'o registo de consentimento;',
            'e os dados guardados neste aparelho.'
          ]
        },
        'Se não conseguir aceder à conta, peça a eliminação por e-mail a partir do endereço registado.'
      ]
    },
    {
      id: 'cookies',
      title: '9. Cookies e armazenamento local',
      blocks: [
        '**Não usamos cookies de publicidade, estatística ou rastreamento**, nem ferramentas de análise de terceiros. Por isso não apresentamos faixa de cookies: apenas tecnologias estritamente necessárias ao serviço pedido por si, isentas de consentimento (Lei n.º 41/2004, art. 5.º, n.º 3, e Diretiva 2002/58/CE).',
        {
          table: {
            head: ['Tecnologia', 'Finalidade', 'Duração'],
            rows: [
              ['Armazenamento local do navegador (localStorage): sessão do Supabase Auth', 'Manter a sessão iniciada e autenticar pedidos', 'Até terminar a sessão'],
              ['Armazenamento local (localStorage e IndexedDB): treinos, rascunhos, preferências, check-ins, histórico', 'Funcionar offline e guardar o treino em curso', 'Até apagar os dados do navegador ou eliminar a conta'],
              ['Service worker e cache da aplicação (PWA)', 'Abrir rapidamente e funcionar sem rede. Os pedidos ao Supabase nunca são guardados em cache', 'Até desinstalar ou limpar os dados do site']
            ]
          }
        },
        'Os pedidos de fontes, mapas e vídeos descritos na secção 4 expõem o seu endereço IP aos respetivos fornecedores, como acontece com qualquer ligação à Internet.'
      ]
    },
    {
      id: 'seguranca',
      title: '10. Segurança',
      blocks: [
        'Aplicamos medidas técnicas e organizativas adequadas: ligações cifradas (HTTPS), palavras-passe cifradas, controlo de acesso ao nível da linha na base de dados (cada utilizador só acede aos seus dados) e dados de amigos expostos apenas através de funções que respeitam as suas opções de privacidade. Nenhum sistema é totalmente infalível. Em caso de violação de dados com risco para os seus direitos, notificaremos a autoridade de controlo e, quando exigido, o utilizador, nos prazos legais (artigos 33.º e 34.º do RGPD).'
      ]
    },
    {
      id: 'menores',
      title: '11. Menores',
      blocks: [
        'O serviço destina-se a maiores de 16 anos. Entre os 14 e os 15 anos só é permitido com autorização do titular das responsabilidades parentais. Se tomarmos conhecimento de que tratamos dados de um menor sem a devida autorização, eliminamo-los.'
      ]
    },
    {
      id: 'reclamacoes',
      title: '12. Reclamações junto das autoridades',
      blocks: [
        'Se considerar que o tratamento viola a lei, tem direito de apresentar reclamação à autoridade de controlo:',
        {
          ul: [
            '**Portugal:** Comissão Nacional de Proteção de Dados (CNPD), Av. D. Carlos I, 134, 1.º, 1200-651 Lisboa, [www.cnpd.pt](https://www.cnpd.pt);',
            '**Brasil:** Autoridade Nacional de Proteção de Dados (ANPD), [www.gov.br/anpd](https://www.gov.br/anpd);',
            'ou a autoridade do Estado-Membro da União Europeia onde reside ou trabalha.'
          ]
        },
        'Agradecemos que nos contacte primeiro, para tentarmos resolver a situação.'
      ]
    },
    {
      id: 'alteracoes',
      title: '13. Alterações a esta Política',
      blocks: [
        'Podemos atualizar esta Política. A data da última atualização consta no topo da página. Em caso de alteração relevante, em especial de finalidades ou de novas categorias de dados, informamos na aplicação ou por e-mail e, quando necessário, pedimos novo consentimento.'
      ]
    }
  ]
};
