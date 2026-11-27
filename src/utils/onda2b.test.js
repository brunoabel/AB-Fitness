import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateWearableActivities } from '../services/wearables/stravaService.js';
import { recommendRunSessionType } from './runGoals.js';

describe('Onda 2B/2C — Deduplicação Wearables & Recomendação Híbrida de Corrida', () => {
  it('remove atividades externas que sobrepõem sessões locais dentro da janela de 25 min', () => {
    const base = Date.UTC(2026, 10, 27, 10, 0, 0);
    const localSessions = [{ completedAt: new Date(base).toISOString() }];
    const external = [
      { id: 'dup', start_date: new Date(base + 10 * 60000).toISOString() },
      { id: 'unique', start_date: new Date(base + 180 * 60000).toISOString() }
    ];

    const filtered = deduplicateWearableActivities(external, localSessions, 25);
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 'unique');
  });

  it('recomenda Z2 Regenerativa em dia de pernas ou fadiga alta e Intervalados com pernas frescas', () => {
    assert.equal(recommendRunSessionType({ isLegDayToday: true, legFatiguePct: 20 }).id, 'z2_easy');
    assert.equal(recommendRunSessionType({ isLegDayToday: false, legFatiguePct: 70 }).id, 'z2_easy');
    assert.equal(recommendRunSessionType({ isLegDayToday: false, legFatiguePct: 45 }).id, 'tempo');
    assert.equal(recommendRunSessionType({ isLegDayToday: false, legFatiguePct: 15 }).id, 'intervals');
  });
});
