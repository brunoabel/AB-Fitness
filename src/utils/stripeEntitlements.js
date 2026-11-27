/**
 * Direitos de subscrição Stripe (lógica pura, partilhada pelo webhook e pelos testes).
 * - PRO: qualquer subscrição ativa ou em teste.
 * - Personal Trainer: subscrição ativa com o preço STRIPE_TRAINER_PRICE_ID. Inclui o PRO e dá role 'coach'.
 */

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

export function subscriptionPriceIds(subscription) {
  const items = subscription?.items?.data;
  if (!Array.isArray(items)) return [];
  return items.map((item) => item?.price?.id).filter((id) => typeof id === 'string' && id);
}

/** Calcula os direitos a partir de TODAS as subscrições do cliente (o estado atual, não a ordem dos eventos). */
export function computeEntitlements(subscriptions, trainerPriceId) {
  const list = Array.isArray(subscriptions) ? subscriptions : [];
  const active = list.filter((s) => ACTIVE_STATUSES.has(s?.status));
  const trainerId = typeof trainerPriceId === 'string' ? trainerPriceId.trim() : '';
  return {
    isPro: active.length > 0,
    trainerActive: Boolean(trainerId) && active.some((s) => subscriptionPriceIds(s).includes(trainerId)),
    trialing: active.some((s) => s.status === 'trialing')
  };
}

/**
 * Patch a aplicar em public.profiles.
 * A role só muda entre 'athlete' e 'coach', e só é revertida quando foi o próprio Stripe a concedê-la
 * (trainer_role_from_stripe): um PT promovido por um admin nunca perde o acesso por causa da faturação.
 * As colunas do plano Trainer só entram no patch quando já existem no perfil (migration 20261146).
 */
export function buildEntitlementPatch(profile, entitlements, { customerId = null, now = new Date().toISOString() } = {}) {
  const patch = {
    is_pro: entitlements.isPro,
    is_premium: entitlements.isPro,
    updated_at: now
  };
  if (customerId) patch.stripe_customer_id = customerId;
  if (entitlements.trialing && !profile?.trial_granted_at) patch.trial_granted_at = now;

  const hasTrainerColumns = Boolean(profile) && Object.prototype.hasOwnProperty.call(profile, 'trainer_subscription_active');
  if (!hasTrainerColumns) return patch;

  patch.trainer_subscription_active = entitlements.trainerActive;
  const role = profile.role || 'athlete';
  if (entitlements.trainerActive && role === 'athlete') {
    patch.role = 'coach';
    patch.trainer_role_from_stripe = true;
  } else if (!entitlements.trainerActive && profile.trainer_role_from_stripe) {
    if (role === 'coach') patch.role = 'athlete';
    patch.trainer_role_from_stripe = false;
  }
  return patch;
}

/** Plano pedido pelo cliente -> Price ID configurado no servidor (nunca aceita um Price ID arbitrário). */
export function resolveCheckoutPrice(plan, prices) {
  const map = {
    pro: prices?.pro,
    pro_annual: prices?.proAnnual,
    trainer: prices?.trainer
  };
  const key = typeof plan === 'string' && plan in map ? plan : 'pro';
  const priceId = typeof map[key] === 'string' ? map[key].trim() : '';
  return { plan: key, priceId: priceId || null };
}
