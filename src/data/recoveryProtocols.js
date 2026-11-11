/**
 * Plano de recuperação por região. `recover` quando há fadiga (alongar e libertar, sem carga);
 * `prevent` quando está fresco (mobilidade e reforço que previnem lesões).
 * `catalogId` liga ao vídeo do catálogo quando existe.
 */
export const KIND_LABEL = { dinamico: 'Dinâmico', estatico: 'Estático', libertacao: 'Libertação', forca: 'Reforço' };

const D = (name, kind, dose, cue, catalogId) => ({ name, kind, dose, cue, catalogId });

export const DRILLS = {
  'pec-wall': D('Alongamento de peitoral na parede', 'estatico', '2 × 30 s por lado', 'Cotovelo à altura do ombro; roda o tronco para fora até sentir o peito abrir.', 'alongamento-peitoral-biceps-parede'),
  'biceps-wall': D('Alongamento de bíceps na parede', 'estatico', '2 × 30 s por lado', 'Braço esticado e palma na parede; roda o tronco para o lado oposto.', 'alongamento-peitoral-biceps-parede'),
  'thoracic-rot': D('Rotação torácica em 4 apoios', 'dinamico', '2 × 8 por lado', 'Mão atrás da cabeça; abre o cotovelo para o teto e segue-o com o olhar.', 'rotacao-toracica-4-apoios'),
  'shoulder-dislocate': D('Dislocação de ombros com bastão', 'dinamico', '2 × 10', 'Pega larga e braços esticados; a lombar não arqueia.', 'deslocacao-ombros-bastao-elastico'),
  'scap-pushup': D('Flexão escapular', 'forca', '2 × 12', 'Braços fixos; só as omoplatas se aproximam e afastam.', 'flexao-escapular-scapular-push-up'),
  'band-er': D('Rotação externa com elástico', 'forca', '2 × 15 por lado', 'Cotovelo colado ao tronco; roda só o antebraço, devagar.'),
  'shoulder-cars': D('Círculos controlados do ombro', 'dinamico', '5 por sentido', 'O maior círculo possível, lento; o tronco não mexe.'),
  'cross-body': D('Alongamento cruzado do ombro', 'estatico', '2 × 30 s por lado', 'Puxa o braço pelo peito abaixo do cotovelo, ombro longe da orelha.'),
  'childs-pose': D('Postura da criança com alcance lateral', 'estatico', '2 × 40 s', 'Glúteos nos calcanhares, braços longe; respira para as costelas.'),
  'cat-cow': D('Gato-vaca', 'dinamico', '2 × 8', 'Uma vértebra de cada vez, a acompanhar a respiração.'),
  'dead-hang': D('Suspensão passiva na barra', 'estatico', '2 × 25 s', 'Ombros soltos; deixa o peso do corpo esticar os dorsais.'),
  'upper-trap': D('Alongamento do trapézio superior', 'estatico', '2 × 30 s por lado', 'Orelha ao ombro e baixa o ombro do lado oposto.'),
  'chin-tuck': D('Retração cervical', 'forca', '2 × 10', 'Recolhe o queixo para trás sem inclinar a cabeça.'),
  'triceps-overhead': D('Alongamento de tríceps acima da cabeça', 'estatico', '2 × 30 s por lado', 'Cotovelo junto à orelha; a outra mão empurra-o para trás.'),
  'wrist-stretch': D('Alongamento de punho, flexores e extensores', 'estatico', '2 × 30 s cada', 'Braço esticado; puxa os dedos para ti com a palma para cima e depois para baixo.'),
  'forearm-rotation': D('Pronação e supinação com halter leve', 'forca', '2 × 15', 'Cotovelo apoiado; roda o halter devagar nos dois sentidos.'),
  cobra: D('Extensão em cobra', 'estatico', '2 × 30 s', 'Púbis no chão e ombros longe das orelhas; sobe só até ser confortável.'),
  'dead-bug': D('Dead bug', 'forca', '2 × 8 por lado', 'Lombar colada ao chão enquanto estendes braço e perna opostos.'),
  'side-plank': D('Prancha lateral', 'forca', '2 × 30 s por lado', 'Linha reta da cabeça aos pés; a anca não cai.', 'prancha-lateral-isometrica'),
  'hip-flexor': D('Alongamento de flexores do quadril', 'estatico', '2 × 40 s por lado', 'Contrai o glúteo da perna de trás e leva a anca para a frente.', 'alongamento-flexores-quadril-psoas'),
  'foam-quads': D('Rolo miofascial nos quadríceps', 'libertacao', '60 a 90 s por perna', 'Rola devagar; pára 10 s nos pontos mais tensos.', 'liberacao-miofascial-quadriceps-foam-roller'),
  'quad-stretch': D('Alongamento de quadríceps em pé', 'estatico', '2 × 30 s por lado', 'Joelhos juntos e anca para a frente; não arqueies a lombar.'),
  'wall-sit': D('Agachamento isométrico na parede', 'forca', '3 × 30 s', 'Joelhos a 90° e alinhados com os pés.'),
  'leg-swing': D('Balanço de perna frente e trás', 'dinamico', '2 × 12 por perna', 'Tronco direito; aumenta a amplitude aos poucos.'),
  butterfly: D('Borboleta sentado', 'estatico', '2 × 40 s', 'Plantas dos pés juntas; inclina o tronco à frente com as costas direitas.'),
  'deep-squat': D('Cócoras isométricas', 'estatico', '2 × 40 s', 'Calcanhares no chão; cotovelos afastam os joelhos com suavidade.', 'agachamento-cocoras-deep-squat-hold'),
  copenhagen: D('Prancha Copenhagen', 'forca', '2 × 20 s por lado', 'Perna de cima no banco; a anca sobe e fica alinhada.', 'prancha-copenhagen-adutores'),
  'hip-9090': D('Mobilidade de quadril 90/90', 'dinamico', '2 × 6 por lado', 'Joelhos a 90°; troca de lado sem usar as mãos se conseguires.', 'mobilidade-quadril-9090-transicao'),
  'figure-four': D('Alongamento em figura 4', 'estatico', '2 × 40 s por lado', 'Tornozelo sobre o joelho oposto; puxa a perna de baixo para o peito.'),
  'single-bridge': D('Ponte de glúteo unilateral', 'forca', '2 × 10 por lado', 'Empurra pelo calcanhar e pára 1 s em cima; a anca não roda.'),
  'band-walk': D('Passada lateral com elástico', 'forca', '2 × 12 passos por lado', 'Meio agachamento; os joelhos não colapsam para dentro.'),
  'hamstring-dynamic': D('Alongamento dinâmico de isquiotibiais', 'dinamico', '2 × 10', 'Calcanhar à frente e anca para trás, sem curvar as costas.', 'alongamento-dinamico-isquiotibiais'),
  'hamstring-strap': D('Alongamento de isquiotibiais com fita', 'estatico', '2 × 40 s por perna', 'Deitado; perna esticada e a outra no chão.'),
  nordic: D('Nordic hamstring curl', 'forca', '3 × 5 lentas', 'Desce o mais devagar que conseguires com a anca estendida.'),
  'calf-stretch': D('Alongamento de gémeos na parede', 'estatico', '2 × 30 s por perna', 'Calcanhar no chão; primeiro joelho esticado, depois fletido.'),
  'foam-calves': D('Rolo miofascial nos gémeos', 'libertacao', '60 s por perna', 'Cruza a outra perna por cima para aumentar a pressão.'),
  'eccentric-calf': D('Elevação de gémeos excêntrica', 'forca', '3 × 10', 'Sobe com as duas pernas e desce com uma em 3 s.'),
  'ankle-wall': D('Mobilidade de tornozelo na parede', 'dinamico', '2 × 10 por lado', 'Joelho à parede sem levantar o calcanhar.', 'mobilidade-tornozelo-parede-dorsiflexao'),
  'worlds-greatest': D("World's greatest stretch", 'dinamico', '2 × 5 por lado', 'Afundo, cotovelo ao pé da frente e roda o braço para o teto.', 'worlds-greatest-stretch-mobilidade')
};

export const REGION_PLANS = {
  peito: { recover: ['pec-wall', 'thoracic-rot'], prevent: ['shoulder-dislocate', 'scap-pushup'] },
  ombros: { recover: ['cross-body', 'childs-pose'], prevent: ['band-er', 'shoulder-cars'] },
  biceps: { recover: ['biceps-wall', 'wrist-stretch'], prevent: ['shoulder-dislocate', 'forearm-rotation'] },
  antebracos: { recover: ['wrist-stretch'], prevent: ['forearm-rotation', 'dead-hang'] },
  abdomen: { recover: ['cobra', 'cat-cow'], prevent: ['dead-bug', 'side-plank'] },
  quadriceps: { recover: ['foam-quads', 'quad-stretch', 'hip-flexor'], prevent: ['wall-sit', 'leg-swing'] },
  adutores: { recover: ['butterfly', 'deep-squat'], prevent: ['copenhagen', 'hip-9090'] },
  trapezio: { recover: ['upper-trap', 'thoracic-rot'], prevent: ['chin-tuck', 'scap-pushup'] },
  costas: { recover: ['childs-pose', 'cat-cow', 'dead-hang'], prevent: ['thoracic-rot', 'worlds-greatest'] },
  triceps: { recover: ['triceps-overhead', 'childs-pose'], prevent: ['band-er', 'shoulder-cars'] },
  gluteos: { recover: ['figure-four', 'hip-9090'], prevent: ['single-bridge', 'band-walk'] },
  posteriores: { recover: ['hamstring-strap', 'hamstring-dynamic'], prevent: ['nordic', 'leg-swing'] },
  gemeos: { recover: ['calf-stretch', 'foam-calves'], prevent: ['eccentric-calf', 'ankle-wall'] }
};

/** @returns {{ mode: 'recover'|'prevent', drills: Array<object> }} */
export function planFor(regionId, fatigue) {
  const mode = fatigue >= 35 ? 'recover' : 'prevent';
  const ids = REGION_PLANS[regionId]?.[mode] || [];
  return { mode, drills: ids.map((id) => ({ id, ...DRILLS[id] })) };
}
