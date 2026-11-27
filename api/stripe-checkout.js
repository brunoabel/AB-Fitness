/**
 * Vercel Serverless Function: Criação de sessão de Checkout Stripe (PRO mensal, PRO anual ou Personal Trainer).
 * Autentica o utilizador via JWT do Supabase e gera o URL seguro de pagamento.
 * O cliente envia `{ plan: 'pro' | 'pro_annual' | 'trainer' }`; o Price ID vem sempre das variáveis do servidor.
 */

import { createClient } from '@supabase/supabase-js';
import { resolveCheckoutPrice } from '../src/utils/stripeEntitlements.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  proAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  trainer: process.env.STRIPE_TRAINER_PRICE_ID
};
const ALLOWED_PRICE_IDS = Object.values(PRICES)
  .filter((v) => typeof v === 'string' && v.trim() !== '')
  .map((v) => v.trim());

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

  // 2. Parse e validação estrita de Price ID contra allowlist do servidor
  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  // Compatibilidade: `priceId` explícito continua aceite, mas só se estiver na allowlist do servidor
  if (body.priceId !== undefined && !ALLOWED_PRICE_IDS.includes(body.priceId)) {
    return res.status(400).json({ error: 'Plano inválido' });
  }
  if (body.plan !== undefined && !['pro', 'pro_annual', 'trainer'].includes(body.plan)) {
    return res.status(400).json({ error: 'Plano inválido' });
  }
  const resolved = resolveCheckoutPrice(body.plan, PRICES);
  const priceId = body.priceId || resolved.priceId;
  if (!priceId || !ALLOWED_PRICE_IDS.includes(priceId)) {
    return res.status(503).json({
      error: resolved.plan === 'trainer'
        ? 'O plano Personal Trainer ainda não está disponível.'
        : 'Este plano ainda não está disponível.'
    });
  }

  // 2b. Verifica elegibilidade para trial de 14 dias no perfil (evita trials ilimitados)
  const authedSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false }
  });
  const { data: profileRow } = await authedSupabase
    .from('profiles')
    .select('trial_granted_at, stripe_customer_id, is_pro')
    .eq('id', user.id)
    .maybeSingle();

  // Já tem subscrição ativa: mudar de plano faz-se no portal da Stripe (evita duas cobranças em paralelo)
  if (profileRow?.is_pro && profileRow?.stripe_customer_id) {
    return res.status(409).json({
      error: 'Já tens uma subscrição ativa. Muda de plano em Gerir subscrição.',
      code: 'already_subscribed'
    });
  }

  const eligibleForTrial = Boolean(!profileRow?.trial_granted_at && !profileRow?.stripe_customer_id);
  const origin = resolveSafeOrigin(req.headers.origin);

  // 3. Criação da Checkout Session via API REST Stripe
  try {
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    if (profileRow?.stripe_customer_id) {
      params.append('customer', profileRow.stripe_customer_id);
    } else if (user.email) {
      params.append('customer_email', user.email);
    }
    params.append('client_reference_id', user.id);
    params.append('metadata[user_id]', user.id);
    params.append('metadata[plan]', resolved.plan);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('subscription_data[metadata][user_id]', user.id);
    params.append('subscription_data[metadata][plan]', resolved.plan);
    if (eligibleForTrial) {
      params.append('subscription_data[trial_period_days]', '14');
    }
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
