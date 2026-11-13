import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveActiveToday, sortWeeklySquad } from './clubHelpers.js';

describe('clubHelpers — sortWeeklySquad', () => {
  it('ordena por treinos na semana, depois volume conhecido, depois streak', () => {
    const input = [
      { friend_id: 'a', full_name: 'Ana', workouts_week: 2, volume_week_kg: 12000, streak: 4 },
      { friend_id: 'b', full_name: 'Bruno', workouts_week: 4, volume_week_kg: null, streak: 2 },
      { friend_id: 'c', full_name: 'Carla', workouts_week: 4, volume_week_kg: 9500, streak: 1 },
      { friend_id: 'd', full_name: 'Diogo', workouts_week: 2, volume_week_kg: 12000, streak: 9 }
    ];

    const sorted = sortWeeklySquad(input);
    assert.deepEqual(sorted.map((x) => x.friend_id), ['c', 'b', 'd', 'a']);
    // Não muta o array original
    assert.equal(input[0].friend_id, 'a');
  });

  it('lida graciosamente com entradas vazias ou inválidas', () => {
    assert.deepEqual(sortWeeklySquad([]), []);
    assert.deepEqual(sortWeeklySquad(null), []);
  });
});

describe('clubHelpers — deriveActiveToday', () => {
  const now = new Date('2026-11-13T12:00:00Z');

  it('inclui apenas atletas com atividade nas últimas 24h e exclui o próprio utilizador', () => {
    const feed = [
      {
        _type: 'workout',
        session_id: 's1',
        friend_id: 'f1',
        full_name: 'João',
        workout_title: 'Push A',
        completed_at: '2026-11-13T09:00:00Z'
      },
      {
        _type: 'photo',
        id: 'p1',
        user_id: 'me',
        full_name: 'Eu',
        created_at: '2026-11-13T10:00:00Z'
      },
      {
        _type: 'workout',
        session_id: 's2',
        friend_id: 'f2',
        full_name: 'Pedro',
        workout_title: 'Leg Day',
        completed_at: '2026-11-11T10:00:00Z'
      }
    ];
    const summary = [
      { friend_id: 'f1', full_name: 'João', streak: 7, last_workout_at: '2026-11-13T09:00:00Z' },
      { friend_id: 'f3', full_name: 'Marta', streak: 3, last_workout_at: '2026-11-12T15:00:00Z' }
    ];

    const active = deriveActiveToday({ summary, feed, currentUserId: 'me', now });
    assert.deepEqual(active.map((x) => x.friend_id), ['f1', 'f3']);
    assert.equal(active[0].activityLabel, 'Push A');
    assert.equal(active[0].streak, 7);
    assert.equal(active[1].activityLabel, 'Treinou hoje');
  });
});
