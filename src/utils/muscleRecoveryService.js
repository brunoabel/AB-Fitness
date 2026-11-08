/**
 * muscleRecoveryService.js — Algoritmo de Fadiga & Recuperação Muscular
 * AB Fitness • Engine de Fisiologia Desportiva
 * 
 * Modela o desgaste e a recuperação muscular com decaimento exponencial de meia-vida de 36 horas
 * sobre uma janela temporal de 96 horas (4 dias).
 */

export const MUSCLE_GROUPS = [
  { id: 'peito', name: 'Peito', view: 'front' },
  { id: 'costas', name: 'Costas', view: 'back' },
  { id: 'ombros', name: 'Ombros', view: 'both' },
  { id: 'biceps', name: 'Bíceps', view: 'front' },
  { id: 'triceps', name: 'Tríceps', view: 'back' },
  { id: 'quadriceps', name: 'Quadríceps', view: 'front' },
  { id: 'posterior', name: 'Isquiotibiais', view: 'back' },
  { id: 'gluteos', name: 'Glúteos', view: 'back' },
  { id: 'gemeos', name: 'Gémeos', view: 'both' },
  { id: 'core', name: 'Abdómen / Core', view: 'front' }
];

/**
 * Normaliza o nome ou foco do exercício para os grupos musculares envolvidos
 */
export function mapExerciseToMuscles(exercise = {}) {
  const text = `${exercise.name || ''} ${exercise.target || ''} ${exercise.secondary || ''} ${exercise.target_muscle || ''} ${exercise.grupo || ''}`.toLowerCase();

  const primary = [];
  const secondary = [];

  // Peito
  if (text.includes('peito') || text.includes('peitoral') || text.includes('supino') || text.includes('crucifixo') || text.includes('crossover') || text.includes('voador') || text.includes('flexão')) {
    primary.push('peito');
    secondary.push('triceps', 'ombros');
  }

  // Costas
  if (text.includes('costas') || text.includes('dorsal') || text.includes('remada') || text.includes('puxada') || text.includes('barra fixa') || text.includes('pulldown') || text.includes('serrote') || text.includes('cavalinho') || text.includes('lombar')) {
    primary.push('costas');
    secondary.push('biceps');
  }

  // Ombros
  if (text.includes('ombro') || text.includes('deltoide') || text.includes('desenvolvimento') || text.includes('elevação lateral') || text.includes('elevação frontal') || text.includes('arnold')) {
    primary.push('ombros');
    secondary.push('triceps');
  }

  // Braços
  if (text.includes('bíceps') || text.includes('biceps') || text.includes('rosca') || text.includes('martelo') || text.includes('scott')) {
    primary.push('biceps');
  }
  if (text.includes('tríceps') || text.includes('triceps') || text.includes('francês') || text.includes('testa') || text.includes('paralelas') || text.includes('pulley')) {
    primary.push('triceps');
  }

  // Membros Inferiores
  if (text.includes('agachamento') || text.includes('leg press') || text.includes('extensora') || text.includes('afundo') || text.includes('passada') || text.includes('quadríceps') || text.includes('quadriceps') || text.includes('sissy')) {
    primary.push('quadriceps');
    secondary.push('gluteos');
  }

  if (text.includes('stiff') || text.includes('flexora') || text.includes('posterior') || text.includes('isquiotibiais') || text.includes('terra') || text.includes('deadlift') || text.includes('romeno') || text.includes('bom dia')) {
    primary.push('posterior');
    secondary.push('gluteos', 'costas');
  }

  if (text.includes('glúteo') || text.includes('gluteo') || text.includes('elevação pélvica') || text.includes('abdução') || text.includes('hip thrust')) {
    primary.push('gluteos');
  }

  if (text.includes('panturrilha') || text.includes('gémeos') || text.includes('gemeos') || text.includes('panturrilhas') || text.includes('sóleo')) {
    primary.push('gemeos');
  }

  // Core / Abdómen
  if (text.includes('abdômen') || text.includes('abdomen') || text.includes('abdominal') || text.includes('prancha') || text.includes('core') || text.includes('infra') || text.includes('supra') || text.includes('obliquo')) {
    primary.push('core');
  }

  return {
    primary: [...new Set(primary)],
    secondary: [...new Set(secondary.filter(s => !primary.includes(s)))]
  };
}

/**
 * Calcula a percentagem de recuperação e prontidão muscular (0% - 100%)
 * Baseado no modelo científico de fadiga acumulada com decaimento exponencial.
 */
export function calculateMuscleRecovery(workoutHistory = []) {
  const now = Date.now();
  const HALFLIFE_HOURS = 36; // 36 horas para dissipar metade da fadiga
  const WINDOW_HOURS = 96;   // Janela de consideração de 4 dias

  // Mapa de fadiga acumulada (0 = sem fadiga, 1+ = fadiga alta)
  const fatigueMap = {};
  const lastTrainedMap = {};

  MUSCLE_GROUPS.forEach(m => {
    fatigueMap[m.id] = 0;
    lastTrainedMap[m.id] = null;
  });

  // Analisa cada sessão recente
  workoutHistory.forEach(session => {
    const sessionTime = session.timestamp || (session.date ? new Date(session.date).getTime() : null);
    if (!sessionTime) return;

    const diffHours = (now - sessionTime) / (1000 * 60 * 60);
    if (diffHours < 0 || diffHours > WINDOW_HOURS) return;

    // Fator de decaimento temporal: 2^(-delta_t / 36)
    const decay = Math.pow(2, -diffHours / HALFLIFE_HOURS);

    // Identificar exercícios da sessão
    const exercisesData = session.exercisesData || {};
    const exercisesList = Array.isArray(session.exercises) ? session.exercises : [];

    // Se temos exercisesData por id:
    const exIds = Object.keys(exercisesData);
    if (exIds.length > 0) {
      exIds.forEach(exId => {
        const sets = exercisesData[exId] || [];
        const completedSets = sets.filter(s => (s.completed || s.done) && s.type !== 'W').length;
        if (completedSets === 0) return;

        // Estima peso do estímulo: 3-4 séries normais = 0.8 de fadiga
        const stimulusWeight = Math.min(1.2, completedSets * 0.25);
        const { primary, secondary } = mapExerciseToMuscles({ id: exId, name: exId });

        primary.forEach(mId => {
          if (fatigueMap[mId] !== undefined) {
            fatigueMap[mId] += stimulusWeight * decay;
            if (!lastTrainedMap[mId] || sessionTime > lastTrainedMap[mId].time) {
              lastTrainedMap[mId] = { time: sessionTime, hoursAgo: Math.round(diffHours), workoutTitle: session.workoutTitle || 'Treino' };
            }
          }
        });

        secondary.forEach(mId => {
          if (fatigueMap[mId] !== undefined) {
            fatigueMap[mId] += (stimulusWeight * 0.4) * decay;
            if (!lastTrainedMap[mId] || sessionTime > lastTrainedMap[mId].time) {
              lastTrainedMap[mId] = { time: sessionTime, hoursAgo: Math.round(diffHours), workoutTitle: session.workoutTitle || 'Treino' };
            }
          }
        });
      });
    } else {
      // Se não há exercisesData, infere pelo foco do treino (ex: "Superior", "Inferior", etc.)
      const text = `${session.workoutTitle || ''} ${session.targetGroup || ''}`.toLowerCase();
      const { primary, secondary } = mapExerciseToMuscles({ name: text });
      const stimulusWeight = 0.8;

      primary.forEach(mId => {
        if (fatigueMap[mId] !== undefined) {
          fatigueMap[mId] += stimulusWeight * decay;
          if (!lastTrainedMap[mId] || sessionTime > lastTrainedMap[mId].time) {
            lastTrainedMap[mId] = { time: sessionTime, hoursAgo: Math.round(diffHours), workoutTitle: session.workoutTitle || 'Treino' };
          }
        }
      });
    }
  });

  // Converte a fadiga residual em percentagem de recuperação (0 a 100%)
  const results = {};
  let totalReadiness = 0;

  MUSCLE_GROUPS.forEach(m => {
    const fatigue = fatigueMap[m.id];
    // Quanto maior a fadiga residual, menor a percentagem de recuperação
    const recoveryPct = Math.round(Math.max(10, Math.min(100, (1 - Math.min(1, fatigue)) * 100)));
    totalReadiness += recoveryPct;

    let status = 'recovered'; // 'recovered' | 'recovering' | 'fatigued'
    let statusLabel = 'Recuperado';
    let colorClass = 'text-emerald-400 fill-emerald-500/30 stroke-emerald-500';

    if (recoveryPct < 45) {
      status = 'fatigued';
      statusLabel = 'Fadiga Elevada';
      colorClass = 'text-rose-400 fill-rose-500/40 stroke-rose-500';
    } else if (recoveryPct < 80) {
      status = 'recovering';
      statusLabel = 'Recuperação Ativa';
      colorClass = 'text-amber-400 fill-amber-500/40 stroke-amber-500';
    }

    results[m.id] = {
      id: m.id,
      name: m.name,
      view: m.view,
      recoveryPct,
      status,
      statusLabel,
      colorClass,
      lastTrained: lastTrainedMap[m.id]
    };
  });

  const overallScore = Math.round(totalReadiness / MUSCLE_GROUPS.length);

  return {
    muscles: results,
    overallScore,
    status: overallScore >= 80 ? 'Ótimo' : overallScore >= 60 ? 'Moderado' : 'Atenção ao Descanso'
  };
}
