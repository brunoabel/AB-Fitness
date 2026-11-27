/**
 * Vercel Serverless Function: Webhook seguro da Stripe.
 * Valida a assinatura criptográfica e atualiza o estado PRO em public.profiles via Service Role Key.
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { computeEntitlements, buildEntitlementPatch } from '../src/utils/stripeEntitlements.js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const TRAINER_PRICE_ID = (process.env.STRIPE_TRAINER_PRICE_ID || '').trim();

export const config = {
  api: {
    bodyParser: false
  }
};

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req && typeof req[Symbol.asyncIterator] === 'function') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf8');
  }
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  return '';
}

function verifyStripeSignature(payload, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  let timestamp = null;
  const v1Signatures = [];
  for (const item of sigHeader.split(',')) {
    const idx = item.indexOf('=');
    if (idx === -1) continue;
    const k = item.slice(0, idx).trim();
    const v = item.slice(idx + 1).trim();
    if (k === 't' && !timestamp) timestamp = v;
    else if (k === 'v1' && v) v1Signatures.push(v);
  }

  if (!timestamp || v1Signatures.length === 0) return false;

  // Tolerância de 5 minutos contra ataques de replay (passado ou futuro)
  const ageSeconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (!Number.isFinite(ageSeconds) || Math.abs(ageSeconds) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const hmacBuf = Buffer.from(
    crypto.createHmac('sha256', secret).update(signedPayload).digest('hex'),
    'utf8'
  );

  return v1Signatures.some((sig) => {
    try {
      const sigBuf = Buffer.from(sig, 'utf8');
      return hmacBuf.length === sigBuf.length && crypto.timingSafeEqual(hmacBuf, sigBuf);
    } catch {
      return false;
    }
  });
}

/** Todas as subscrições do cliente na Stripe. `null` quando não há chave ou cliente (o chamador usa o evento). */
async function listCustomerSubscriptions(customerId) {
  if (!STRIPE_SECRET_KEY || !customerId) return null;
  const url = `https://api.stripe.com/v1/subscriptions?customer=${encodeURIComponent(customerId)}&status=all&limit=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } });
  if (!res.ok) throw new Error(`Stripe subscriptions HTTP ${res.status}`);
  const body = await res.json().catch(() => null);
  return Array.isArray(body?.data) ? body.data : [];
}

/** Lê o perfil (por user_id ou stripe_customer_id) e grava PRO, plano Trainer e role. Lança em erro para a Stripe repetir. */
async function applyEntitlements(supabase, { userId, customerId }, entitlements) {
  const query = supabase.from('profiles').select('*');
  const { data: profile, error: readErr } = userId
    ? await query.eq('id', userId).maybeSingle()
    : await query.eq('stripe_customer_id', customerId).maybeSingle();
  if (readErr) throw new Error(`Falha ao ler perfil: ${readErr.message}`);
  if (!profile) {
    console.warn('Webhook Stripe sem perfil correspondente:', { userId: userId || null, customerId: customerId || null });
    return;
  }

  const patch = buildEntitlementPatch(profile, entitlements, { customerId });
  const { error } = await supabase.from('profiles').update(patch).eq('id', profile.id);
  if (error) throw new Error(`Falha ao atualizar perfil ${profile.id}: ${error.message}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET não configurado no servidor.');
    return res.status(500).json({ error: 'Configuração de webhook incompleta' });
  }

  const sigHeader = req.headers['stripe-signature'];
  const rawBody = await readRawBody(req);

  const isValid = verifyStripeSignature(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET);
  if (!isValid) {
    console.warn('Assinatura Stripe Webhook inválida.');
    return res.status(400).json({ error: 'Assinatura inválida' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Configuração do Supabase Service Role incompleta para o Webhook.');
    return res.status(500).json({ error: 'Erro de configuração interna' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  const eventType = event.type;
  const eventId = event.id;
  const dataObject = event.data?.object;
  let dedupeRecorded = false;

  try {
    // Idempotência: ignora reenvios já processados do mesmo event.id
    if (eventId) {
      const { error: dedupeErr } = await supabase
        .from('stripe_webhook_events')
        .insert({ event_id: eventId, event_type: eventType });
      if (dedupeErr) {
        if (dedupeErr.code === '23505') {
          return res.status(200).json({ received: true, duplicate: true });
        }
        // Se a tabela ainda não existir no ambiente remoto, segue sem bloquear; outros erros falham para retry
        if (dedupeErr.code !== '42P01' && dedupeErr.code !== 'PGRST205') {
          console.error('Erro ao registar idempotência de webhook Stripe:', dedupeErr);
          return res.status(500).json({ error: 'Falha ao registar evento' });
        }
      } else {
        dedupeRecorded = true;
      }
    }

    switch (eventType) {
      case 'checkout.session.completed': {
        const userId = dataObject?.client_reference_id || dataObject?.metadata?.user_id;
        const customerId = dataObject?.customer;
        if (!userId && !customerId) break;
        const subscriptions = await listCustomerSubscriptions(customerId);
        // Sem lista (sem chave Stripe), o checkout concluído vale como PRO ativo; o plano Trainer chega no evento de subscrição
        const entitlements = subscriptions
          ? computeEntitlements(subscriptions, TRAINER_PRICE_ID)
          : { isPro: true, trainerActive: false, trialing: false };
        await applyEntitlements(supabase, { userId, customerId }, entitlements);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const userId = dataObject?.metadata?.user_id;
        const customerId = dataObject?.customer;
        if (!userId && !customerId) break;
        // Estado atual de todas as subscrições do cliente: resolve eventos fora de ordem e subscrições em duplicado
        const subscriptions = (await listCustomerSubscriptions(customerId)) || [dataObject];
        await applyEntitlements(supabase, { userId, customerId }, computeEntitlements(subscriptions, TRAINER_PRICE_ID));
        break;
      }

      case 'invoice.payment_failed': {
        console.warn('Stripe invoice.payment_failed:', {
          eventId,
          customer: dataObject?.customer || null,
          subscription: dataObject?.subscription || null
        });
        break;
      }

      default:
        // Outros eventos são ignorados sem erro
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Erro ao processar evento Stripe:', err);
    // Liberta o event_id para o reenvio da Stripe voltar a processar o evento (senão seria tratado como duplicado)
    if (dedupeRecorded) {
      await supabase.from('stripe_webhook_events').delete().eq('event_id', eventId).then(() => {}, () => {});
    }
    return res.status(500).json({ error: 'Falha ao processar webhook' });
  }
}
