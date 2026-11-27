/**
 * Vercel Serverless Function: Webhook seguro da Stripe.
 * Valida a assinatura criptográfica e atualiza o estado PRO em public.profiles via Service Role Key.
 */

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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
      }
    }

    const assertProfileUpdate = async (patch, filterCol, filterVal) => {
      const { error } = await supabase.from('profiles').update(patch).eq(filterCol, filterVal);
      if (error) {
        throw new Error(`Falha ao atualizar perfil (${filterCol}=${filterVal}): ${error.message}`);
      }
    };

    switch (eventType) {
      case 'checkout.session.completed': {
        const userId = dataObject?.client_reference_id || dataObject?.metadata?.user_id;
        const customerId = dataObject?.customer;
        if (userId) {
          await assertProfileUpdate(
            {
              is_pro: true,
              is_premium: true,
              stripe_customer_id: customerId,
              updated_at: new Date().toISOString()
            },
            'id',
            userId
          );
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const status = dataObject?.status;
        const isPro = status === 'active' || status === 'trialing';
        const userId = dataObject?.metadata?.user_id;
        const customerId = dataObject?.customer;
        const patch = {
          is_pro: isPro,
          is_premium: isPro,
          updated_at: new Date().toISOString()
        };
        if (customerId) patch.stripe_customer_id = customerId;
        if (status === 'trialing') {
          patch.trial_granted_at = new Date().toISOString();
        }

        if (userId) {
          await assertProfileUpdate(patch, 'id', userId);
        } else if (customerId) {
          await assertProfileUpdate(patch, 'stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const userId = dataObject?.metadata?.user_id;
        const customerId = dataObject?.customer;
        const patch = {
          is_pro: false,
          is_premium: false,
          updated_at: new Date().toISOString()
        };

        if (userId) {
          await assertProfileUpdate(patch, 'id', userId);
        } else if (customerId) {
          await assertProfileUpdate(patch, 'stripe_customer_id', customerId);
        }
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
    return res.status(500).json({ error: 'Falha ao processar webhook' });
  }
}
