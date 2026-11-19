import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Abre o Stripe Checkout do plano PRO (api/stripe-checkout.js valida o JWT e cria a sessão).
 * Devolve { error } quando não dá para seguir; em sucesso redireciona o browser.
 */
export async function startProCheckout() {
  if (!isSupabaseConfigured() || !supabase) return { error: 'Pagamentos indisponíveis neste momento.' };
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return { error: 'Inicia sessão com a tua conta para assinar o PRO.' };

  try {
    const res = await fetch('/api/stripe-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({})
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) return { error: body.error || 'Não foi possível abrir o pagamento. Tenta novamente.' };
    window.location.assign(body.url);
    return { error: null };
  } catch {
    return { error: 'Sem ligação ao servidor de pagamentos.' };
  }
}
