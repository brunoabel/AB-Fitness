import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { enqueueJob, flushQueue, getQueuedJobs } from '../utils/syncQueue.js';

const WAITLIST_STORAGE_KEY = 'ab_marketing_waitlist_v1';
export const WAITLIST_SYNC_QUEUE_KEY = 'ab_waitlist_sync_queue_v1';

export function getLocalWaitlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalWaitlist(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/**
 * Grava um lead individual na tabela `waitlist` do Supabase.
 * Considera duplicado (`23505`) como sucesso idempotente.
 */
export async function pushWaitlistLeadToCloud(entry, client = supabase) {
  if (!client) {
    return { ok: false, error: 'Cliente Supabase indisponível' };
  }
  try {
    const { error } = await client
      .from('waitlist')
      .insert({
        name: entry.name,
        email: entry.email,
        goal: entry.goal,
        phone: entry.phone || null,
        source: entry.source
      });

    if (!error || error.code === '23505') {
      return { ok: true, error: null };
    }
    console.warn('Erro ao sincronizar lead com o Supabase:', error.message);
    return { ok: false, error: error.message || 'Falha ao gravar na nuvem' };
  } catch (err) {
    console.warn('Exceção ao gravar no Supabase:', err);
    return { ok: false, error: err?.message || 'Exceção ao gravar na nuvem' };
  }
}

/**
 * Inscreve um lead na Lista VIP de Acesso Antecipado.
 * Tenta gravar imediatamente no Supabase e, se falhar, enfileira localmente para retry automático.
 */
export async function joinWaitlist(
  { name, email, goal = 'geral', phone = '' },
  { supabaseClient = supabase, configured = isSupabaseConfigured() } = {}
) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanGoal = (goal || '').trim();
  const cleanPhone = (phone || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { data: null, error: 'Por favor, indica um e-mail válido.' };
  }

  const existing = getLocalWaitlist();
  const alreadyJoined = existing.some((item) => item.email.toLowerCase() === cleanEmail);

  const entry = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName || 'Atleta VIP',
    email: cleanEmail,
    goal: cleanGoal,
    phone: cleanPhone,
    source: 'marketing_private_launch',
    created_at: new Date().toISOString()
  };

  if (!alreadyJoined) {
    saveLocalWaitlist([entry, ...existing]);
  }

  let syncRes = { ok: false, error: 'Sem ligação ao servidor' };
  if (configured && supabaseClient) {
    syncRes = await pushWaitlistLeadToCloud(entry, supabaseClient);
  }

  if (!syncRes.ok) {
    enqueueJob(WAITLIST_SYNC_QUEUE_KEY, {
      key: `waitlist:${cleanEmail}`,
      ...entry
    });
    return {
      data: entry,
      alreadyJoined,
      cloudSaved: false,
      queuedForRetry: true,
      syncError: syncRes.error || 'Sem ligação ao servidor',
      error: null
    };
  }

  return {
    data: entry,
    alreadyJoined,
    cloudSaved: true,
    queuedForRetry: false,
    syncError: null,
    error: null
  };
}

/**
 * Reenvia leads pendentes na fila local para o Supabase assim que houver ligação.
 */
export function flushWaitlistSyncQueue({
  supabaseClient = supabase,
  configured = isSupabaseConfigured()
} = {}) {
  if (!configured || !supabaseClient) return Promise.resolve(0);
  return flushQueue(WAITLIST_SYNC_QUEUE_KEY, {
    sendFn: async (job) => (await pushWaitlistLeadToCloud(job, supabaseClient)).ok
  });
}

export function getPendingWaitlistJobs() {
  return getQueuedJobs(WAITLIST_SYNC_QUEUE_KEY);
}

/**
 * Carrega a lista completa de leads da nuvem (Supabase) para o Admin.
 * Se estiver offline ou a tabela ainda não existir, usa o fallback local.
 */
export async function fetchWaitlistLeads() {
  const localList = getLocalWaitlist();

  if (!isSupabaseConfigured() || !supabase) {
    return localList;
  }

  try {
    // 1. Tenta via RPC com SECURITY DEFINER (imune a filtros restritivos de RLS)
    const rpcRes = await supabase.rpc('get_marketing_waitlist');
    if (!rpcRes.error && Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
      saveLocalWaitlist(rpcRes.data);
      return rpcRes.data;
    }

    // 2. Consulta direta à tabela public.waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      saveLocalWaitlist(data);
      return data;
    }
  } catch (err) {
    console.warn('Exceção ao obter leads do Supabase:', err);
  }

  return localList;
}

export function getWaitlistCount() {
  return getLocalWaitlist().length;
}

/**
 * Exporta a lista de espera para formato CSV para uso no marketing/CRM
 */
export function exportWaitlistCsv(customList = null) {
  const list = customList || getLocalWaitlist();
  if (!list.length) return '';
  const headers = ['Data', 'Nome', 'Email', 'Objetivo', 'Telefone'];
  const rows = list.map((l) => [
    l.created_at,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.email}"`,
    `"${(l.goal || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
