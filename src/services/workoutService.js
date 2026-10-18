import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WEEKLY_SCHEDULE } from '../data/workouts';
import { 
  getSavedWeights, 
  saveExerciseWeights, 
  addWorkoutToHistory 
} from '../utils/storage';

/**
 * Serviço Modular de Treinos e Banco de Dados (Supabase PostgreSQL & Fallback Local)
 * Separação rigorosa de responsabilidades entre regras de negócio e interface.
 */

// Busca o plano semanal personalizado do usuário logado
export async function fetchUserSchedule(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || userId === 'guest-local-user') {
    return getLocalCustomPlan() || WEEKLY_SCHEDULE;
  }

  try {
    // 1. Tentar buscar dias de treino customizados do usuário no Supabase
    const { data: days, error: daysError } = await supabase
      .from('workout_days')
      .select(`
        id,
        day_number,
        day_name,
        title,
        focus,
        duration,
        intensity,
        is_rest_day,
        badge,
        exercises:exercises (
          id,
          exercise_code,
          name,
          target_muscle,
          secondary_muscle,
          equipment,
          suggested_weight,
          suggested_reps,
          default_sets,
          rest_time_seconds,
          order_index,
          badge,
          soccer_benefit,
          tips
        )
      `)
      .eq('user_id', userId)
      .order('day_number', { ascending: true });

    if (daysError) {
      console.warn('Erro ao carregar treinos do Supabase, usando padrão local:', daysError.message);
      return WEEKLY_SCHEDULE;
    }

    // Se o usuário ainda não possui treinos cadastrados no Supabase, semeia o plano padrão para ele
    if (!days || days.length === 0) {
      await seedDefaultPlanForUser(userId);
      return WEEKLY_SCHEDULE;
    }

    // Mapear dados retornados do Supabase para o formato consumido pela UI
    const mapped = days.map((d) => ({
      dayId: d.day_number,
      supabaseDayId: d.id,
      name: d.day_name,
      shortName: d.day_name.slice(0, 3),
      title: d.title,
      focus: d.focus,
      duration: d.duration,
      intensity: d.intensity,
      badge: d.badge,
      isRestDay: d.is_rest_day,
      exercises: (d.exercises || [])
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map((ex) => ({
          id: ex.exercise_code,
          supabaseExerciseId: ex.id,
          name: ex.name,
          target: ex.target_muscle,
          secondary: ex.secondary_muscle,
          equipment: ex.equipment,
          suggestedWeight: Number(ex.suggested_weight) || 10,
          suggestedReps: ex.suggested_reps || 10,
          defaultSets: ex.default_sets || 3,
          restTime: ex.rest_time_seconds || 60,
          badge: ex.badge,
          soccerBenefit: ex.soccer_benefit,
          steps: ex.tips || [],
          breathingTip: 'Controle a respiração durante a fase de esforço.',
          beginnerMistake: 'Evite movimentos bruscos e mantenha a postura.'
        }))
    }));

    // BLINDAGEM DE SEGURANÇA: Se por qualquer motivo os treinos do Supabase vierem sem exercícios,
    // NUNCA sobrescrever com lista vazia. Mantém o cronograma padrão com todos os exercícios.
    const totalExercises = mapped.reduce((acc, d) => acc + (d.exercises?.length || 0), 0);
    if (totalExercises === 0) {
      console.warn('Treinos retornados sem exercícios no Supabase. Mantendo WEEKLY_SCHEDULE.');
      return getLocalCustomPlan() || WEEKLY_SCHEDULE;
    }

    return mapped;
  } catch (err) {
    console.error('Falha de rede ao buscar plano no Supabase:', err);
    return getLocalCustomPlan() || WEEKLY_SCHEDULE;
  }
}

// Semeia o plano personalizado inicial para o novo usuário no banco de dados isolado
export async function seedDefaultPlanForUser(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;

  try {
    // 1. Criar plano principal
    const { data: plan, error: planError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        title: 'AB Fitness — Performance de Atleta & Shape',
        description: 'Plano focado em atletas de futebol e hipertrofia progressiva',
        is_active: true
      })
      .select()
      .single();

    if (planError || !plan) {
      console.warn('Não foi possível semear plano no Supabase:', planError?.message);
      return;
    }

    // 2. Inserir dias e exercícios padrão
    for (const day of WEEKLY_SCHEDULE) {
      const { data: dayRow, error: dayError } = await supabase
        .from('workout_days')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          day_number: day.dayId,
          day_name: day.name,
          title: day.title,
          focus: day.focus,
          duration: day.duration,
          intensity: day.intensity,
          is_rest_day: day.isRestDay,
          badge: day.badge
        })
        .select()
        .single();

      if (dayError || !dayRow) continue;

      if (day.exercises && day.exercises.length > 0) {
        const exercisePayloads = day.exercises.map((ex, index) => ({
          user_id: userId,
          workout_day_id: dayRow.id,
          exercise_code: ex.id,
          name: ex.name,
          target_muscle: ex.target,
          secondary_muscle: ex.secondary || null,
          equipment: ex.equipment,
          suggested_weight: ex.suggestedWeight || 10,
          suggested_reps: ex.suggestedReps || 10,
          default_sets: ex.defaultSets || 3,
          rest_time_seconds: ex.restTime || 60,
          order_index: index,
          badge: ex.badge,
          soccer_benefit: ex.soccerBenefit,
          tips: ex.steps || []
        }));

        await supabase.from('exercises').insert(exercisePayloads);
      }
    }
  } catch (err) {
    console.error('Erro na semeadura inicial do usuário:', err);
  }
}

// Salva sessão de treino e registros de séries no Supabase + LocalStorage
export async function recordWorkoutCompletion({
  userId,
  workout,
  durationSeconds,
  exercisesData,
  notes = ''
}) {
  // 1. Calcular métricas precisas da sessão
  let totalSets = 0;
  let totalVolumeKg = 0;
  Object.values(exercisesData || {}).forEach((sets) => {
    if (Array.isArray(sets)) {
      sets.forEach((s) => {
        if (s.completed) {
          totalSets++;
          totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    }
  });

  const durationMinutes = Math.max(1, Math.round((durationSeconds || 0) / 60));
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short'
  });

  // Atualizar LocalStorage primeiro para resposta visual instantânea e offline-ready
  const summary = {
    id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    workoutDayId: workout.dayId,
    workoutName: workout.name,
    dayName: workout.name,
    workoutTitle: workout.title,
    durationSeconds: durationSeconds || 0,
    durationMinutes,
    totalSets,
    totalVolumeKg,
    date: dateFormatted,
    completedAt: now.toISOString(),
    notes,
    exerciseCount: workout.exercises?.length || 0,
    exercisesData
  };
  addWorkoutToHistory(summary);

  // Salvar cargas de cada exercício no LocalStorage
  Object.entries(exercisesData || {}).forEach(([exId, sets]) => {
    saveExerciseWeights(exId, sets);
  });

  // 2. Se o usuário estiver autenticado no Supabase, sincronizar na nuvem
  if (isSupabaseConfigured() && supabase && userId && userId !== 'guest-local-user') {
    try {
      // Inserir sessão em workout_sessions
      const { data: sessionRow, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          workout_day_name: workout.name,
          workout_title: workout.title,
          duration_seconds: durationSeconds,
          notes: notes || 'Treino finalizado com sucesso no AB Fitness'
        })
        .select()
        .single();

      if (sessionError) {
        console.warn('Erro ao salvar sessão no Supabase:', sessionError.message);
        return summary;
      }

      // Inserir registros de cada série em exercise_logs
      const logPayloads = [];
      Object.entries(exercisesData).forEach(([exCode, sets]) => {
        sets.forEach((set, setIndex) => {
          logPayloads.push({
            user_id: userId,
            session_id: sessionRow.id,
            exercise_code: exCode,
            set_number: setIndex + 1,
            weight_kg: Number(set.weight) || 0,
            reps_completed: Number(set.reps) || 0,
            completed: Boolean(set.completed)
          });
        });
      });

      if (logPayloads.length > 0) {
        await supabase.from('exercise_logs').insert(logPayloads);
      }
    } catch (cloudErr) {
      console.error('Falha de sincronização na nuvem:', cloudErr);
    }
  }

  return summary;
}

// Busca a última carga usada em um exercício específico
export async function getExerciseLastWeight(userId, exerciseCode) {
  // Tentar primeiro LocalStorage
  const localWeights = getSavedWeights();
  const localSets = localWeights[exerciseCode];
  if (localSets && localSets.length > 0) {
    const validWeights = localSets.map((s) => Number(s.weight)).filter((w) => !isNaN(w) && w > 0);
    if (validWeights.length > 0) {
      return Math.max(...validWeights);
    }
  }

  // Se logado no Supabase, tentar buscar nos logs da nuvem
  if (isSupabaseConfigured() && supabase && userId && userId !== 'guest-local-user') {
    try {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('weight_kg')
        .eq('user_id', userId)
        .eq('exercise_code', exerciseCode)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        return Number(data[0].weight_kg);
      }
    } catch {
      // Silencioso se offline
    }
  }

  return null;
}

const STORAGE_CUSTOM_PLAN_KEY = 'ab_fitness_custom_plan_v1';

// Salva plano personalizado no Supabase e LocalStorage
export async function saveCustomUserPlan(userId, planDays, planTitle = 'AB Fitness — Plano Personalizado') {
  // Salvar no LocalStorage para resposta imediata
  try {
    localStorage.setItem(STORAGE_CUSTOM_PLAN_KEY, JSON.stringify(planDays));
  } catch {}

  // Se logado no Supabase, atualizar na nuvem
  if (isSupabaseConfigured() && supabase && userId && userId !== 'guest-local-user') {
    try {
      // 1. Remover dias e exercícios antigos do usuário
      await supabase.from('workout_days').delete().eq('user_id', userId);

      // 2. Inserir novo plano
      const { data: planRow } = await supabase
        .from('workout_plans')
        .upsert({
          user_id: userId,
          title: planTitle,
          is_active: true
        })
        .select()
        .single();

      // 3. Inserir novos dias e exercícios
      for (const day of planDays) {
        const { data: dayRow } = await supabase
          .from('workout_days')
          .insert({
            user_id: userId,
            plan_id: planRow?.id,
            day_number: day.dayId,
            day_name: day.name,
            title: day.title,
            focus: day.focus,
            duration: day.duration,
            intensity: day.intensity,
            is_rest_day: day.isRestDay,
            badge: day.badge
          })
          .select()
          .single();

        if (dayRow && day.exercises && day.exercises.length > 0) {
          const exPayloads = day.exercises.map((ex, idx) => ({
            user_id: userId,
            workout_day_id: dayRow.id,
            exercise_code: ex.id,
            name: ex.name,
            target_muscle: ex.target,
            secondary_muscle: ex.secondary || null,
            equipment: ex.equipment,
            suggested_weight: ex.suggestedWeight || 10,
            suggested_reps: ex.suggestedReps || 10,
            default_sets: ex.defaultSets || 3,
            rest_time_seconds: ex.restTime || 60,
            order_index: idx,
            badge: ex.badge,
            soccer_benefit: ex.soccerBenefit || null,
            tips: ex.executionSteps || ex.steps || []
          }));

          await supabase.from('exercises').insert(exPayloads);
        }
      }
    } catch (err) {
      console.warn('Erro ao salvar plano personalizado no Supabase:', err);
    }
  }

  return planDays;
}

// Recupera plano salvo localmente se existir e tiver exercícios válidos
export function getLocalCustomPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PLAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const hasExercises = parsed.some((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
    return hasExercises ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Funções Exclusivas para o Painel de Administrador
 */

// Busca todos os atletas, treinos e estatísticas gerais
export async function fetchAdminAthletesData() {
  if (!isSupabaseConfigured() || !supabase) {
    return { athletes: [], sessions: [], totalLogsCount: 0, totalVolumeKg: 0 };
  }

  try {
    // 1. Buscar todos os perfis cadastrados
    const { data: athletes, error: athError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (athError) {
      console.error('Erro ao buscar perfis de atletas:', athError);
      return { athletes: [], sessions: [], totalLogsCount: 0, totalVolumeKg: 0 };
    }

    // 2. Buscar todas as sessões de treino concluídas
    const { data: sessions, error: sessError } = await supabase
      .from('workout_sessions')
      .select('*')
      .order('completed_at', { ascending: false });

    if (sessError) {
      console.warn('Erro ao carregar sessões:', sessError.message);
    }

    // 3. Buscar logs de exercícios para volume total
    const { data: logs } = await supabase
      .from('exercise_logs')
      .select('weight_kg, reps_completed, completed');

    const totalVolumeKg = (logs || []).reduce(
      (acc, curr) => acc + (Number(curr.weight_kg) * Number(curr.reps_completed) || 0),
      0
    );

    return {
      athletes: athletes || [],
      sessions: sessions || [],
      totalLogsCount: logs?.length || 0,
      totalVolumeKg: Math.round(totalVolumeKg)
    };
  } catch (err) {
    console.error('Erro no serviço administrativo:', err);
    return { athletes: [], sessions: [], totalLogsCount: 0, totalVolumeKg: 0 };
  }
}

// Busca detalhes aprofundados e histórico de um atleta específico
export async function fetchAthleteDetails(athleteId) {
  if (!isSupabaseConfigured() || !supabase || !athleteId) return null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', athleteId)
      .single();

    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', athleteId)
      .order('completed_at', { ascending: false });

    const { data: plans } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', athleteId);

    return {
      profile,
      sessions: sessions || [],
      plans: plans || []
    };
  } catch (err) {
    console.error('Erro ao buscar detalhes do atleta:', err);
    return null;
  }
}

