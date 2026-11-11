import { supabase, isSupabaseConfigured } from '../lib/supabase';

const WAITLIST_STORAGE_KEY = 'ab_marketing_waitlist_v1';

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
 * Inscreve um lead na Lista VIP de Acesso Antecipado.
 * Grava imediatamente em localStorage e tenta sincronizar com o Supabase.
 */
export async function joinWaitlist({ name, email, goal = 'geral', phone = '' }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanGoal = (goal || '').trim();
  const cleanPhone = (phone || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { data: null, error: 'Por favor, indique um e-mail válido.' };
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
    const updated = [entry, ...existing];
    saveLocalWaitlist(updated);
  }

  // Tenta sincronizar com o Supabase (se a tabela waitlist existir)
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('waitlist').insert({
        name: entry.name,
        email: entry.email,
        goal: entry.goal,
        phone: entry.phone || null,
        created_at: entry.created_at
      });
    } catch {
      // Ignora erro de tabela não existente — o lead já está gravado em local
    }
  }

  return {
    data: entry,
    alreadyJoined,
    error: null
  };
}

export function getWaitlistCount() {
  return getLocalWaitlist().length;
}

/**
 * Exporta a lista de espera para formato CSV para uso no marketing/CRM
 */
export function exportWaitlistCsv() {
  const list = getLocalWaitlist();
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
