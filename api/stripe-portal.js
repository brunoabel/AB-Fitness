/**
 * Vercel Serverless Function: abre o Stripe Customer Portal (cancelar, mudar de plano, atualizar o cartão, faturas).
 * Autentica o utilizador via JWT do Supabase e usa o stripe_customer_id do próprio perfil (RLS).
 * Requer o Customer Portal ativado no Stripe Dashboard (Settings -> Billing -> Customer portal).
 */

import { createClient } from '@supabase/supabase-js';
import { requireSupabaseUser } from './_auth.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/([a-z0-9-]+\.)?abfitness\.app$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/
];

function resolveSafeOrigin(rawOrigin) {
  if (typeof rawOrigin === 'string' && ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(rawOrigin))) {
    return rawOrigin;
  }
  return 'https://www.abfitness.app';
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Pagamentos indisponíveis neste momento.' });
  }

  const { user, error: authError } = await requireSupabaseUser(req);
  if (authError || !user) {
    return res.status(401).json({ error: authError || 'Autenticação necessária' });
  }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const authedSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
  const { data: profileRow, error: profileErr } = await authedSupabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr) {
    return res.status(500).json({ error: 'Não foi possível ler a tua subscrição.' });
  }
  if (!profileRow?.stripe_customer_id) {
    return res.status(404).json({ error: 'Ainda não tens nenhuma subscrição associada a esta conta.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('customer', profileRow.stripe_customer_id);
    params.append('return_url', `${resolveSafeOrigin(req.headers.origin)}/?billing_return=true`);

    const stripeRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });
    const session = await stripeRes.json().catch(() => ({}));
    if (!stripeRes.ok || !session?.url) {
      console.error('Erro na API Stripe Billing Portal:', stripeRes.status, session?.error?.message);
      return res.status(502).json({ error: 'Não foi possível abrir a gestão da subscrição. Tenta novamente.' });
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Falha ao comunicar com Stripe (portal):', err);
    return res.status(500).json({ error: 'Erro de comunicação com a plataforma de pagamentos' });
  }
}
