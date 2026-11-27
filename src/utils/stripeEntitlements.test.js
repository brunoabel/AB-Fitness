import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeEntitlements, buildEntitlementPatch, resolveCheckoutPrice } from './stripeEntitlements.js';

const sub = (status, priceId) => ({ status, items: { data: [{ price: { id: priceId } }] } });
const NOW = '2026-11-27T10:00:00.000Z';

describe('Stripe — direitos por subscrição', () => {
  it('PRO ativo com qualquer subscrição ativa ou em teste; cancelada não conta', () => {
    assert.deepEqual(computeEntitlements([sub('canceled', 'price_pro')], 'price_tr'), { isPro: false, trainerActive: false, trialing: false });
    assert.equal(computeEntitlements([sub('trialing', 'price_pro')], 'price_tr').isPro, true);
    assert.equal(computeEntitlements([sub('past_due', 'price_pro')], 'price_tr').isPro, false);
  });

  it('duas subscrições: apagar uma não tira o PRO se a outra continuar ativa', () => {
    const ent = computeEntitlements([sub('canceled', 'price_pro'), sub('active', 'price_tr')], 'price_tr');
    assert.equal(ent.isPro, true);
    assert.equal(ent.trainerActive, true);
  });

  it('plano Trainer só fica ativo com o preço configurado', () => {
    assert.equal(computeEntitlements([sub('active', 'price_pro')], 'price_tr').trainerActive, false);
    assert.equal(computeEntitlements([sub('active', 'price_tr')], '').trainerActive, false);
  });
});

describe('Stripe — patch do perfil', () => {
  it('sem as colunas do plano Trainer (migration por correr) só grava PRO', () => {
    const patch = buildEntitlementPatch({ id: 'u1', role: 'athlete' }, { isPro: true, trainerActive: true, trialing: false }, { customerId: 'cus_1', now: NOW });
    assert.deepEqual(patch, { is_pro: true, is_premium: true, updated_at: NOW, stripe_customer_id: 'cus_1' });
  });

  it('subscrição Trainer promove atleta a coach e marca a origem Stripe', () => {
    const profile = { id: 'u1', role: 'athlete', trainer_subscription_active: false, trainer_role_from_stripe: false };
    const patch = buildEntitlementPatch(profile, { isPro: true, trainerActive: true, trialing: false }, { now: NOW });
    assert.equal(patch.role, 'coach');
    assert.equal(patch.trainer_role_from_stripe, true);
    assert.equal(patch.trainer_subscription_active, true);
  });

  it('fim da subscrição devolve a role só quando foi o Stripe a concedê-la', () => {
    const ended = { isPro: false, trainerActive: false, trialing: false };
    const fromStripe = buildEntitlementPatch({ role: 'coach', trainer_subscription_active: true, trainer_role_from_stripe: true }, ended, { now: NOW });
    assert.equal(fromStripe.role, 'athlete');
    assert.equal(fromStripe.trainer_role_from_stripe, false);

    const fromAdmin = buildEntitlementPatch({ role: 'coach', trainer_subscription_active: true, trainer_role_from_stripe: false }, ended, { now: NOW });
    assert.equal('role' in fromAdmin, false);
  });

  it('nunca rebaixa admin ou CEO', () => {
    const patch = buildEntitlementPatch({ role: 'ceo', trainer_subscription_active: false, trainer_role_from_stripe: false }, { isPro: true, trainerActive: true, trialing: false }, { now: NOW });
    assert.equal('role' in patch, false);
  });

  it('trial_granted_at só é gravado na primeira vez', () => {
    assert.equal(buildEntitlementPatch({ role: 'athlete' }, { isPro: true, trainerActive: false, trialing: true }, { now: NOW }).trial_granted_at, NOW);
    assert.equal('trial_granted_at' in buildEntitlementPatch({ role: 'athlete', trial_granted_at: '2026-01-01' }, { isPro: true, trainerActive: false, trialing: true }, { now: NOW }), false);
  });
});

describe('Stripe — plano pedido no checkout', () => {
  const prices = { pro: 'price_pro', proAnnual: '', trainer: 'price_tr' };
  it('mapeia o plano para o Price ID do servidor', () => {
    assert.deepEqual(resolveCheckoutPrice('trainer', prices), { plan: 'trainer', priceId: 'price_tr' });
    assert.deepEqual(resolveCheckoutPrice(undefined, prices), { plan: 'pro', priceId: 'price_pro' });
  });
  it('plano sem preço configurado devolve priceId nulo', () => {
    assert.deepEqual(resolveCheckoutPrice('pro_annual', prices), { plan: 'pro_annual', priceId: null });
  });
});
