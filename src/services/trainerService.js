/**
 * Trainer Hub: vínculo trainer<->atleta, templates e programas prescritos.
 * A maioria das mutações passa por RPC (supabase/migrations/20261113_trainer_hub.sql e
 * 20261114_trainer_hub_rpcs.sql), que já validam o vínculo ativo no servidor via RLS.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GUEST_ID = 'guest-local-user';
export const canUseTrainerHub = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== GUEST_ID);

const fail = (error) => ({ data: null, error: error?.message || String(error) });

/** Atleta troca o código de 6 dígitos do PT pelo vínculo (RPC redeem_trainer_invite_code). */
export async function redeemInviteCode(code) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { data, error } = await supabase.rpc('redeem_trainer_invite_code', { p_code: (code || '').trim() });
  if (error) return fail(error.message?.includes('inválido') ? 'Código de convite inválido.' : error);
  return { data: data?.[0] || null, error: null };
}

/** Trainer ativo do atleta logado (ou null se não tiver nenhum). */
export async function getMyTrainer() {
  if (!canUseTrainerHub()) return { data: null, error: null };
  const { data, error } = await supabase.rpc('get_my_trainer');
  if (error) return fail(error);
  return { data: data?.[0] || null, error: null };
}

/** Código de convite do próprio trainer (lido diretamente de profiles, já que é a própria linha). */
export async function getMyInviteCode(userId) {
  if (!canUseTrainerHub(userId)) return fail('Sem sessão');
  const { data, error } = await supabase.from('profiles').select('trainer_invite_code').eq('id', userId).maybeSingle();
  if (error) return fail(error);
  return { data: data?.trainer_invite_code || null, error: null };
}

/** Visão do Command Center: um registo por atleta ativo, já com aderência de 7 dias. */
export async function getRosterOverview() {
  if (!canUseTrainerHub()) return { data: [], error: null };
  const { data, error } = await supabase.rpc('get_roster_overview');
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/** Nota privada do trainer sobre o atleta (RPC: só o próprio trainer escreve, coluna fora do GRANT direto). */
export async function setRosterNote(athleteId, note) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { error } = await supabase.rpc('set_roster_note', { p_athlete_id: athleteId, p_note: note || null });
  if (error) return fail(error);
  return { data: true, error: null };
}

/** Arquiva o vínculo com um atleta (soft-unlink, qualquer uma das partes pode fazer). */
export async function archiveRosterLink(trainerId, athleteId) {
  if (!canUseTrainerHub(trainerId)) return fail('Sem sessão');
  const { error } = await supabase.from('trainer_rosters').update({ status: 'archived' }).eq('trainer_id', trainerId).eq('athlete_id', athleteId);
  if (error) return fail(error);
  return { data: true, error: null };
}

/** Tags livres do trainer sobre o atleta (ex: "iniciante", "VIP", "lesão no joelho"). */
export async function setRosterTags(athleteId, tags) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { error } = await supabase.rpc('set_roster_tags', { p_athlete_id: athleteId, p_tags: tags || [] });
  if (error) return fail(error);
  return { data: true, error: null };
}

/** Últimas sessões do atleta com o feedback pós-treino (RPE, dor, nota) que ele já envia hoje. */
export async function listAthleteFeedback(athleteId, limit = 10) {
  if (!canUseTrainerHub()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, workout_title, completed_at, duration_seconds, actual_rpe, pain_flag, athlete_feedback, assigned_program_id')
    .eq('user_id', athleteId)
    .order('completed_at', { ascending: false })
    .limit(limit);
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/** Templates reutilizáveis do trainer. */
export async function listTemplates(trainerId) {
  if (!canUseTrainerHub(trainerId)) return { data: [], error: null };
  const { data, error } = await supabase
    .from('trainer_templates')
    .select('id, title, category, structure_json, created_at')
    .eq('trainer_id', trainerId)
    .order('created_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function createTemplate(trainerId, { title, category, structure }) {
  if (!canUseTrainerHub(trainerId)) return fail('Sem sessão');
  const { data, error } = await supabase
    .from('trainer_templates')
    .insert({ trainer_id: trainerId, title, category: category || null, structure_json: structure || [] })
    .select('id, title, category, structure_json, created_at')
    .single();
  if (error) return fail(error);
  return { data, error: null };
}

export async function deleteTemplate(templateId) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { error } = await supabase.from('trainer_templates').delete().eq('id', templateId);
  if (error) return fail(error);
  return { data: true, error: null };
}

/** Dados de contexto do atleta (lesões + ficha) visíveis ao trainer via RLS (is_active_trainer_of). */
export async function getAthleteContext(athleteId) {
  if (!canUseTrainerHub()) return { data: null, error: null };
  const [{ data: profile }, { data: fitness }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, created_at').eq('id', athleteId).maybeSingle(),
    supabase.from('user_fitness_profiles').select('injuries, priority_muscles, experience_level, primary_goal').eq('user_id', athleteId).maybeSingle(),
  ]);
  return { data: { profile: profile || null, fitness: fitness || null }, error: null };
}

/** Programas que o trainer já atribuiu a um atleta (histórico + ativo). */
export async function listAssignedProgramsForAthlete(athleteId) {
  if (!canUseTrainerHub()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('assigned_programs')
    .select('id, title, structure_json, target_rpe, rest_timer_seconds, coach_notes, status, assigned_at')
    .eq('athlete_id', athleteId)
    .order('assigned_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

export async function createAssignedProgram(trainerId, athleteId, program) {
  if (!canUseTrainerHub(trainerId)) return fail('Sem sessão');
  const { data, error } = await supabase
    .from('assigned_programs')
    .insert({
      trainer_id: trainerId,
      athlete_id: athleteId,
      template_id: program.templateId || null,
      title: program.title,
      structure_json: program.structure || [],
      target_rpe: program.targetRpe ?? null,
      rest_timer_seconds: program.restTimerSeconds ?? null,
      coach_notes: program.coachNotes || null,
    })
    .select('id, title, structure_json, target_rpe, rest_timer_seconds, coach_notes, status, assigned_at')
    .single();
  if (error) return fail(error);
  return { data, error: null };
}

export async function archiveAssignedProgram(programId) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { error } = await supabase.from('assigned_programs').update({ status: 'archived' }).eq('id', programId);
  if (error) return fail(error);
  return { data: true, error: null };
}

/** Programas ativos atribuídos ao próprio atleta logado ("Prescrito pelo teu PT"). */
export async function listMyAssignedPrograms(athleteId) {
  if (!canUseTrainerHub(athleteId)) return { data: [], error: null };
  const { data, error } = await supabase
    .from('assigned_programs')
    .select('id, trainer_id, title, structure_json, target_rpe, rest_timer_seconds, coach_notes, status, assigned_at')
    .eq('athlete_id', athleteId)
    .eq('status', 'active')
    .order('assigned_at', { ascending: false });
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/** Converte um assigned_program em objeto de treino compatível com ActiveWorkout. */
export function assignedProgramToWorkout(program, trainerName) {
  const exercises = (program.structure_json || []).map((ex, idx) => ({
    id: ex.exerciseCode || ex.code || `assigned_${program.id}_${idx}`,
    name: ex.name,
    target: ex.targetMuscle || '',
    secondary: '',
    equipment: ex.equipment || '',
    suggestedWeight: ex.targetWeight ?? 10,
    suggestedReps: ex.repsRange || ex.reps || '10-12',
    defaultSets: ex.sets || 3,
    restTime: ex.restSeconds || program.rest_timer_seconds || 60,
    badge: ex.targetRpe ? `RPE ${ex.targetRpe}` : undefined,
    notes: ex.coachNote || '',
  }));
  return {
    dayId: `assigned-${program.id}`,
    title: program.title,
    focus: 'Prescrito pelo PT',
    isRestDay: false,
    exercises,
    assignedProgramId: program.id,
    trainerName: trainerName || 'o teu PT',
    coachNotes: program.coach_notes || '',
  };
}

/** Grava o check-in pós-treino (RPE percebido, dor, feedback) numa sessão prescrita. */
export async function submitPostWorkoutCheckin(sessionId, { actualRpe, painFlag, athleteFeedback }) {
  if (!canUseTrainerHub() || !sessionId) return fail('Sem sessão');
  const { error } = await supabase
    .from('workout_sessions')
    .update({ actual_rpe: actualRpe ?? null, pain_flag: Boolean(painFlag), athlete_feedback: athleteFeedback || null })
    .eq('id', sessionId);
  if (error) return fail(error);
  return { data: true, error: null };
}
