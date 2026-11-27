import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDailyWaterTargetMl,
  addWaterToday,
  undoLastWaterToday,
  getHydrationToday,
  shouldTriggerHydrationReminder,
  formatLiters
} from './hydration.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k)
  };
}

test('computeDailyWaterTargetMl calculates minimum target from weight and goal', () => {
  assert.equal(computeDailyWaterTargetMl(70), 2450);
  assert.equal(computeDailyWaterTargetMl(70, 'hypertrophy'), 2650);
  assert.equal(computeDailyWaterTargetMl(80, 'fat_loss'), 3350);
  assert.equal(computeDailyWaterTargetMl(null), 2450);
  assert.equal(computeDailyWaterTargetMl(30), 2450); // out of range -> fallback 70kg
});

test('addWaterToday and undoLastWaterToday persist entries per day', () => {
  const storage = createMemoryStorage();
  const today = new Date('2026-11-27T10:00:00');
  assert.equal(getHydrationToday({ today, storage }).consumedMl, 0);

  const after1 = addWaterToday(250, { today, storage });
  assert.equal(after1.consumedMl, 250);
  assert.equal(after1.entries.length, 1);

  const after2 = addWaterToday(500, { today, storage });
  assert.equal(after2.consumedMl, 750);
  assert.equal(after2.entries.length, 2);

  const undone = undoLastWaterToday({ today, storage });
  assert.equal(undone.consumedMl, 250);
  assert.equal(undone.entries.length, 1);
});

test('shouldTriggerHydrationReminder respects enabled flag, window, goal and interval', () => {
  const midday = new Date('2026-11-27T14:00:00');
  const night = new Date('2026-11-27T23:00:00');

  assert.equal(
    shouldTriggerHydrationReminder({ now: midday, prefs: { enabled: false }, consumedMl: 0, targetMl: 2500 }),
    false
  );
  assert.equal(
    shouldTriggerHydrationReminder({ now: night, prefs: { enabled: true, startHour: 8, endHour: 21 }, consumedMl: 0, targetMl: 2500 }),
    false
  );
  assert.equal(
    shouldTriggerHydrationReminder({ now: midday, prefs: { enabled: true, startHour: 8, endHour: 21 }, consumedMl: 2500, targetMl: 2500 }),
    false
  );
  assert.equal(
    shouldTriggerHydrationReminder({
      now: midday,
      prefs: { enabled: true, startHour: 8, endHour: 21, intervalMinutes: 120, lastNotifiedAt: '2026-11-27T13:00:00' },
      consumedMl: 500,
      targetMl: 2500
    }),
    false
  );
  assert.equal(
    shouldTriggerHydrationReminder({
      now: midday,
      prefs: { enabled: true, startHour: 8, endHour: 21, intervalMinutes: 120, lastNotifiedAt: '2026-11-27T11:30:00' },
      consumedMl: 500,
      targetMl: 2500
    }),
    true
  );
});

test('formatLiters formats in PT-PT comma decimal', () => {
  assert.equal(formatLiters(2450), '2,45 L');
  assert.equal(formatLiters(0), '0,00 L');
});
