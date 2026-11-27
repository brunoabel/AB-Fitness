import { supabase, isSupabaseConfigured } from '../lib/supabase';

async function getAccessToken() {
  if (!isSupabaseConfigured() || !supabase) return { token: null, error: 'Pagamentos indisponíveis neste momento.' };
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { token, error: null } : { token: null, error: 'Inicia sessão com a tua conta para continuar.' };
}

/**
 * Abre o Stripe Checkout (api/stripe-checkout.js valida o JWT e cria a sessão).
 * `plan`: 'pro' (mensal), 'pro_annual' ou 'trainer' (Personal Trainer).
 * Devolve { error, code } quando não dá para seguir; em sucesso redireciona o browser.
 */
export async function startProCheckout(plan = 'pro') {
  const { token, error } = await getAccessToken();
  if (!token) return { error };

  try {
    const res = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ plan })
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) {
      return { error: body.error || 'Não foi possível abrir o pagamento. Tenta novamente.', code: body.code || null };
    }
    window.location.assign(body.url);
    return { error: null };
  } catch {
    return { error: 'Sem ligação ao servidor de pagamentos.' };
  }
}

/** Abre o portal da Stripe para cancelar, mudar de plano ou atualizar o cartão (api/stripe-portal.js). */
export async function openBillingPortal() {
  const { token, error } = await getAccessToken();
  if (!token) return { error };

  try {
    const res = await fetch('/api/stripe-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: '{}'
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) return { error: body.error || 'Não foi possível abrir a gestão da subscrição.' };
    window.location.assign(body.url);
    return { error: null };
  } catch {
    return { error: 'Sem ligação ao servidor de pagamentos.' };
  }
}
