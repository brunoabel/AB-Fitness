/**
 * Trainer Hub: vínculo trainer<->atleta, templates e programas prescritos.
 * A maioria das mutações passa por RPC (supabase/migrations/20261113_trainer_hub.sql e
 * 20261114_trainer_hub_rpcs.sql), que já validam o vínculo ativo no servidor via RLS.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { escapeHtml } from '../utils/ogAthleteHtml.js';

const GUEST_ID = 'guest-local-user';
export const canUseTrainerHub = (userId, env = { configured: isSupabaseConfigured(), client: supabase }) =>
  Boolean(env.configured && env.client && (userId === undefined || (Boolean(userId) && userId !== GUEST_ID)));

const fail = (error) => ({ data: null, error: error?.message || String(error) });

/**
 * Atleta troca o código de 6 dígitos do PT pelo vínculo (RPC redeem_trainer_invite_code).
 * A RPC devolve só { trainer_id, trainer_name } e ativa 14 dias de PRO em profiles.trial_ends_at;
 * com userId, lê essa data da própria linha de profiles (melhor esforço).
 */
export async function redeemInviteCode(code, userId) {
  if (!canUseTrainerHub()) return fail('Sem sessão');
  const { data, error } = await supabase.rpc('redeem_trainer_invite_code', { p_code: (code || '').trim() });
  if (error) return fail(error.message?.includes('inválido') ? 'Código de convite inválido.' : error);
  const row = data?.[0] || null;
  if (!row || !canUseTrainerHub(userId)) return { data: row, error: null };
  const { data: profile } = await supabase.from('profiles').select('trial_ends_at').eq('id', userId).maybeSingle();
  return { data: { ...row, trial_ends_at: profile?.trial_ends_at || null }, error: null };
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

/** Arquiva o vínculo ativo do próprio atleta com o seu PT (soft-unlink pelo atleta). */
export async function unlinkMyTrainer(athleteId) {
  if (!canUseTrainerHub(athleteId)) return fail('Sem sessão');
  const { error } = await supabase
    .from('trainer_rosters')
    .update({ status: 'archived' })
    .eq('athlete_id', athleteId)
    .eq('status', 'active');
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
    .order('created_at', { ascending: false })
    .limit(100);
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

/** Dados de contexto do atleta (lesões + ficha + nota privada) visíveis ao trainer via RLS (is_active_trainer_of). */
export async function getAthleteContext(athleteId) {
  if (!canUseTrainerHub()) return { data: null, error: null };
  const [{ data: profile }, { data: fitness }, rosterRes, recoveryRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, avatar_url, created_at, is_verified, is_pro, trial_ends_at, role').eq('id', athleteId).maybeSingle(),
    supabase.from('user_fitness_profiles').select('injuries, priority_muscles, experience_level, primary_goal').eq('user_id', athleteId).maybeSingle(),
    supabase.from('trainer_rosters').select('private_notes, tags').eq('athlete_id', athleteId).eq('status', 'active').maybeSingle(),
    Promise.resolve(supabase.rpc('get_athlete_recovery_for_trainer', { p_athlete_id: athleteId })).catch(() => ({ data: null }))
  ]);
  return {
    data: {
      profile: profile || null,
      fitness: fitness || null,
      privateNote: rosterRes?.data?.private_notes ?? null,
      tags: rosterRes?.data?.tags ?? null,
      recovery: recoveryRes?.data || null
    },
    error: null,
  };
}

/**
 * Gera e dispara impressão PDF do Dossier Mensal do Atleta (B2B2C Trainer Hub).
 */
export function exportAthleteMonthlyPdf(athleteContext, programs = [], feedback = []) {
  if (typeof window === 'undefined') return false;
  const safeName = escapeHtml(athleteContext?.profile?.full_name || 'Atleta AB Fitness');
  const dateStr = escapeHtml(new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }));
  const bio = athleteContext?.recovery?.biometrics;
  const fatigueList = Array.isArray(athleteContext?.recovery?.fatigue) ? athleteContext.recovery.fatigue : [];

  const programsHtml = (programs || [])
    .slice(0, 6)
    .map((p) => {
      const title = escapeHtml(p.title || 'Programa');
      const statusLabel = p.status === 'active' ? 'Ativo' : 'Histórico';
      const rpe = escapeHtml(p.target_rpe ?? 8);
      return `<li><strong>${title}</strong> (${statusLabel}) · RPE Alvo ${rpe}</li>`;
    })
    .join('');

  const feedbackHtml = (feedback || [])
    .slice(0, 10)
    .map((f) => {
      const rawDate = f.completed_at || f.created_at;
      const dateLabel = rawDate && !Number.isNaN(new Date(rawDate).getTime())
        ? escapeHtml(new Date(rawDate).toLocaleDateString('pt-PT'))
        : '-';
      const sessionTitle = escapeHtml(f.workout_title || 'Sessão');
      const rpeVal = escapeHtml(f.actual_rpe ?? f.session_rpe ?? '-');
      const painVal = f.pain_flag
        ? 'Dor reportada'
        : (f.joint_comfort != null ? escapeHtml(`${f.joint_comfort}/5`) : 'Sem dor');
      const notesVal = escapeHtml(f.athlete_feedback || f.notes || '-');
      return `<tr><td>${dateLabel}</td><td>${sessionTitle}</td><td>${rpeVal}</td><td>${painVal}</td><td>${notesVal}</td></tr>`;
    })
    .join('');

  const fatigueHtml = fatigueList
    .map((m) => `<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 6px;border:1px solid #ccc;border-radius:4px;font-size:11px;">${escapeHtml(m.muscle_id)}: ${escapeHtml(m.recovery)}% rec.</span>`)
    .join('');

  const bioSummary = bio
    ? `Fornecedor: <strong>${escapeHtml((bio.provider || 'wearable').toUpperCase())}</strong> · Recuperação: <strong>${escapeHtml(bio.recovery_score ?? bio.sleep_score ?? '--')}%</strong> · HRV: <strong>${escapeHtml(bio.hrv_ms ?? '--')} ms</strong> · FC Repouso: <strong>${escapeHtml(bio.resting_hr_bpm ?? '--')} bpm</strong>`
    : 'Sem leitura wearable sincronizada recentemente.';

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <title>Dossier Mensal - ${safeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #070709; padding: 32px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 24px; }
    .meta { color: #555; font-size: 12px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th, td { border-bottom: 1px solid #eee; text-align: left; padding: 6px 8px; }
    @media print { body { padding: 12px; } }
  </style>
</head>
<body>
  <h1>AB FITNESS · Relatório Mensal do Atleta</h1>
  <div class="meta">Atleta: <strong>${safeName}</strong> · Período: ${dateStr}</div>
  <h2>1. Biometria & Prontidão Wearable</h2>
  <p style="font-size:13px;">${bioSummary}</p>
  <div>${fatigueHtml}</div>
  <h2>2. Programas Prescritos</h2>
  <ul style="font-size:13px;">${programsHtml || '<li>Nenhum programa atribuído.</li>'}</ul>
  <h2>3. Registo de Check-ins Pós-Sessão</h2>
  <table>
    <thead><tr><th>Data</th><th>Sessão</th><th>RPE</th><th>Conforto / Dor</th><th>Notas</th></tr></thead>
    <tbody>${feedbackHtml || '<tr><td colspan="5">Sem check-ins registados.</td></tr>'}</tbody>
  </table>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=840,height=900');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}

/** Programas que o trainer já atribuiu a um atleta (histórico + ativo). */
export async function listAssignedProgramsForAthlete(athleteId) {
  if (!canUseTrainerHub()) return { data: [], error: null };
  const { data, error } = await supabase
    .from('assigned_programs')
    .select('id, title, structure_json, target_rpe, rest_timer_seconds, coach_notes, status, assigned_at')
    .eq('athlete_id', athleteId)
    .order('assigned_at', { ascending: false })
    .limit(100);
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
    .order('assigned_at', { ascending: false })
    .limit(100);
  if (error) return { data: [], error: error.message };
  return { data: data || [], error: null };
}

/** Converte um assigned_program em objeto de treino compatível com ActiveWorkout. */
export function assignedProgramToWorkout(program, trainerName, options = {}) {
  const isBeginner = Boolean(options?.isBeginner);
  const exercises = (program.structure_json || []).map((ex, idx) => {
    const rpeVal = ex.targetRpe ?? program.target_rpe ?? null;
    const parsedWeight = ex.targetWeight !== undefined && ex.targetWeight !== '' && ex.targetWeight !== null
      ? Number(ex.targetWeight)
      : 10;
    return {
      id: ex.exerciseCode || ex.code || `assigned_${program.id}_${idx}`,
      name: ex.name,
      target: ex.targetMuscle || '',
      secondary: '',
      equipment: ex.equipment || '',
      suggestedWeight: Number.isFinite(parsedWeight) && parsedWeight >= 0 ? parsedWeight : 10,
      suggestedReps: ex.repsRange || ex.reps || '10-12',
      defaultSets: Number(ex.sets) || 3,
      restTime: Number(ex.restSeconds || program.rest_timer_seconds) || 60,
      badge: rpeVal ? (isBeginner ? `Esforço ${rpeVal}/10` : `RPE ${rpeVal}`) : undefined,
      notes: ex.coachNote || '',
      supersetGroupId: ex.supersetGroupId || null,
    };
  });
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
