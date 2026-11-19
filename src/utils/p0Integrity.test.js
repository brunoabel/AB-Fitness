/**
 * p0Integrity.test.js: datas locais no streak, classificação de erros de sync e merge do histórico.
 * Correr com TZ=America/Sao_Paulo para reproduzir o caso real (treino depois das 21h no Brasil).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { localDateKey, toLocalDateKey } from './dateKey.js';
import { computeStreak } from './streak.js';
import { isPermanentSyncError } from './syncErrors.js';
import { mapCloudSession, mergeHistory, missingCompletedDays } from './historyMerge.js';

describe('dateKey: dia local', () => {
  it('usa a data local do aparelho, não a UTC', () => {
    const lateNight = new Date(2026, 10, 16, 22, 30); // segunda 22h30 local
    assert.equal(localDateKey(lateNight), '2026-11-16');
  });

  it('toLocalDateKey aceita ISO, timestamp e chave pronta', () => {
    const d = new Date(2026, 10, 16, 23, 59);
    assert.equal(toLocalDateKey(d.toISOString()), '2026-11-16');
    assert.equal(toLocalDateKey(d.getTime()), '2026-11-16');
    assert.equal(toLocalDateKey('2026-11-16'), '2026-11-16');
    assert.equal(toLocalDateKey('lixo'), null);
    assert.equal(toLocalDateKey(null), null);
  });
});

describe('computeStreak com treinos tarde da noite', () => {
  it('segunda 22h e terça 18h contam como dois dias seguidos', () => {
    const monday = new Date(2026, 10, 16, 22, 0);
    const tuesday = new Date(2026, 10, 17, 18, 0);
    const completed = [
      { dayId: 1, date: localDateKey(monday) },
      { dayId: 2, date: localDateKey(tuesday) }
    ];
    assert.equal(computeStreak(completed, [], [], new Date(2026, 10, 17, 23, 0)), 2);
  });

  it('corrida gravada em ISO às 23h conta no dia local', () => {
    const run = { date: new Date(2026, 10, 17, 23, 0).toISOString() };
    assert.equal(computeStreak([], [], [run], new Date(2026, 10, 17, 23, 30)), 1);
  });
});

describe('isPermanentSyncError', () => {
  it('dados inválidos e conflitos são definitivos', () => {
    assert.equal(isPermanentSyncError({ code: '22023', message: 'session_id obrigatório.' }), true);
    assert.equal(isPermanentSyncError({ code: '23505', message: 'duplicate key' }), true);
    assert.equal(isPermanentSyncError({ code: '42501', message: 'Sessão pertence a outro utilizador' }), true);
  });

  it('rede, servidor e sessão em falta são transitórios', () => {
    assert.equal(isPermanentSyncError({ code: '42501', message: 'Autenticação necessária para sincronizar treino.' }), false);
    assert.equal(isPermanentSyncError({ code: '', message: 'Failed to fetch' }), false);
    assert.equal(isPermanentSyncError({ code: 'PGRST301', message: 'JWT expired' }), false);
    assert.equal(isPermanentSyncError(null), false);
  });
});

describe('historyMerge', () => {
  const row = {
    id: '11111111-1111-4111-8111-111111111111',
    workout_day_name: 'Treino A',
    workout_title: 'Peito e Tríceps',
    duration_seconds: 3000,
    notes: '',
    completed_at: '2026-11-17T21:00:00.000Z',
    assigned_program_id: null,
    logs: [
      { exercise_code: '7', set_number: 2, weight_kg: 60, reps_completed: 8, completed: true, set_type: 'N', rpe: 8, duration_seconds: null },
      { exercise_code: '7', set_number: 1, weight_kg: 40, reps_completed: 10, completed: true, set_type: 'W', rpe: null, duration_seconds: null },
      { exercise_code: '12', set_number: 1, weight_kg: 20, reps_completed: 12, completed: false, set_type: 'N', rpe: null, duration_seconds: null }
    ]
  };

  it('converte a linha da RPC no formato local, com séries por ordem e volume sem aquecimento', () => {
    const rec = mapCloudSession(row);
    assert.equal(rec.sessionId, row.id);
    assert.equal(rec.workoutTitle, 'Peito e Tríceps');
    assert.deepEqual(rec.exercisesData['7'].map((s) => s.type), ['W', 'N']);
    assert.equal(rec.totalSets, 1);
    assert.equal(rec.totalVolumeKg, 480);
    assert.equal(rec.exerciseCount, 2);
    assert.equal(rec.durationMinutes, 50);
  });

  it('não duplica treino que já existe localmente com o mesmo sessionId', () => {
    const local = [{ id: 'workout_1', sessionId: row.id, completedAt: row.completed_at }];
    const { merged, added } = mergeHistory(local, [mapCloudSession(row)]);
    assert.equal(added, 0);
    assert.equal(merged.length, 1);
    assert.equal(merged[0].id, 'workout_1');
  });

  it('não duplica treino local antigo sem sessionId terminado à mesma hora', () => {
    const local = [{ id: 'workout_old', completedAt: '2026-11-17T21:05:00.000Z' }];
    const { added } = mergeHistory(local, [mapCloudSession(row)]);
    assert.equal(added, 0);
  });

  it('acrescenta treino só da nuvem e ordena do mais recente para o mais antigo', () => {
    const local = [{ id: 'workout_new', sessionId: 'x', completedAt: '2026-11-18T10:00:00.000Z' }];
    const { merged, added } = mergeHistory(local, [mapCloudSession(row)]);
    assert.equal(added, 1);
    assert.deepEqual(merged.map((r) => r.id), ['workout_new', `cloud_${row.id}`]);
  });

  it('missingCompletedDays só devolve dias que ainda não estão no streak', () => {
    const rec = mapCloudSession(row);
    const key = toLocalDateKey(rec.completedAt);
    assert.equal(missingCompletedDays([{ dayId: 2, date: key }], [rec]).length, 0);
    const out = missingCompletedDays([], [rec]);
    assert.equal(out.length, 1);
    assert.equal(out[0].date, key);
  });
});
