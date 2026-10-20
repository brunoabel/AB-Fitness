import { getBiomechanicsForExercise } from './exerciseBiomechanics.js';

// Fotos curadas em alta definição por grupo muscular para representação visual moderna
const GROUP_PHOTOS = {
  'Peito': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  'Costas': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  'Ombros': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  'Trapézio': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80',
  'Bíceps': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  'Tríceps': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'Antebraços': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  'Pernas': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'Quadríceps': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'Posterior': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'Posteriores': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'Glúteos': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  'Adutores': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  'Panturrilhas': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'Panturrilha': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'Abdômen': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'Core': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'Funcional': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  'Mobilidade': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  'Alongamento': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
};

export const EXERCISE_VISUALS = {
  // Fotos de referência mantidas para compatibilidade direta
  'panturrilha-explosiva': {
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
  },
  'panturrilha-sentado': {
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  'supino-halteres-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
  },
  'incline-dumbbell-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
  },
  'puxada-alta-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80'
  },
  'remada-serrote-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  'desenvolvimento-halteres': {
    photoUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
  },
  'elevacao-lateral-speed': {
    photoUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80'
  },
  'rosca-w-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80'
  },
  'triceps-corda-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80'
  },
  'bulgaro-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
  },
  'leg-press-45': {
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80'
  },
  'rdl-halteres': {
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
  },
  'mesa-flexora': {
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
  },
  'elevacao-pelvica-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
  },
  'copenhague-leves': {
    photoUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'
  },
  'prancha-rotacional': {
    photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80'
  },
  'mobilidade-9090-soccer': {
    photoUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
  }
};

/**
 * Retorna os dados visuais e anatômicos precisos de qualquer exercício.
 * Consulta o módulo de biomecânica auditada para os 320 exercícios.
 */
export function getExerciseVisual(exercise) {
  if (!exercise) return null;

  // Busca dados biomecânicos auditados e exatos
  const bio = getBiomechanicsForExercise(exercise);

  // Foto baseada no grupo ou entrada explícita
  const rawId = typeof exercise === 'string' ? exercise : (exercise.id || exercise.slug || '');
  const specificPhoto = EXERCISE_VISUALS[rawId]?.photoUrl;
  const groupPhoto = GROUP_PHOTOS[bio.grupo] || GROUP_PHOTOS['Peito'];
  const photoUrl = specificPhoto || groupPhoto;

  return {
    name: bio.nome,
    targetGroup: bio.alvo,
    secondary: bio.sinergistas,
    equipment: bio.equipamento,
    photoUrl: photoUrl,
    phaseInitial: bio.posicao_inicial,
    phaseConcentric: bio.concentrica,
    phaseEccentric: bio.excentrica,
    safetyCheck: bio.erro_comum,
    steps: bio.passos,
    checkpoints: bio.checkpoints,
    breathing: bio.respiracao,
    evidenceTip: bio.beneficio
  };
}
