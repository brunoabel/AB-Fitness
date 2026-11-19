/**
 * Vercel Serverless Function: Criação de sessão de Checkout Stripe para o plano PRO.
 * Autentica o utilizador via JWT do Supabase e gera o URL seguro de pagamento.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DEFAULT_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

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
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY não configurada no servidor.' });
  }

  // 1. Validação do JWT Supabase
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada' });
  }

  const user = userData.user;

  // 2. Parse do Corpo da Requisição
  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  const priceId = body.priceId || DEFAULT_PRICE_ID;
  if (!priceId) {
    return res.status(400).json({ error: 'priceId é obrigatório' });
  }

  const origin = resolveSafeOrigin(req.headers.origin);

  // 3. Criação da Checkout Session via API REST Stripe
  try {
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('customer_email', user.email);
    params.append('client_reference_id', user.id);
    params.append('metadata[user_id]', user.id);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('subscription_data[metadata][user_id]', user.id);
    params.append('subscription_data[trial_period_days]', '14');
    params.append('success_url', `${origin}/?pro_success=true&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/?pro_cancel=true`);

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error('Erro na API Stripe Checkout:', session);
      return res.status(stripeRes.status).json({ error: session.error?.message || 'Erro ao criar sessão de pagamento' });
    }

    return res.status(200).json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Falha ao comunicar com Stripe:', err);
    return res.status(500).json({ error: 'Erro de comunicação com a plataforma de pagamentos' });
  }
}
