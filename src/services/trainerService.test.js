import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canUseTrainerHub, assignedProgramToWorkout } from './trainerService.js';

describe('trainerService — validações de sessão e conversão de prescrição', () => {
  const mockEnv = { configured: true, client: {} };

  it('canUseTrainerHub aceita chamadas sem userId quando o cliente Supabase está configurado (RPCs autenticadas via JWT)', () => {
    assert.equal(canUseTrainerHub(undefined, mockEnv), true);
  });

  it('canUseTrainerHub aceita um UUID válido de utilizador autenticado', () => {
    assert.equal(canUseTrainerHub('c0ffee00-1111-2222-3333-444455556666', mockEnv), true);
  });

  it('canUseTrainerHub rejeita modo convidado, null, string vazia ou Supabase não configurado', () => {
    assert.equal(canUseTrainerHub('guest-local-user', mockEnv), false);
    assert.equal(canUseTrainerHub(null, mockEnv), false);
    assert.equal(canUseTrainerHub('', mockEnv), false);
    assert.equal(canUseTrainerHub('c0ffee00-1111-2222-3333-444455556666', { configured: false, client: null }), false);
  });

  it('assignedProgramToWorkout preserva targetWeight, coachNotes e adapta badge para iniciantes vs avançados', () => {
    const program = {
      id: 'prog-1',
      title: 'Upper A — Força',
      target_rpe: 8,
      rest_timer_seconds: 90,
      coach_notes: 'Controla 2s na descida em todas as séries.',
      structure_json: [
        {
          exerciseCode: 'supino-reto',
          name: 'Supino Reto com Barra',
          targetMuscle: 'Peito',
          sets: 4,
          repsRange: '6-8',
          restSeconds: 120,
          targetWeight: 72.5,
          coachNote: 'Escápulas retraídas'
        }
      ]
    };

    const advWorkout = assignedProgramToWorkout(program, 'Coach Miguel', { isBeginner: false });
    assert.equal(advWorkout.assignedProgramId, 'prog-1');
    assert.equal(advWorkout.trainerName, 'Coach Miguel');
    assert.equal(advWorkout.coachNotes, 'Controla 2s na descida em todas as séries.');
    assert.equal(advWorkout.exercises.length, 1);
    assert.equal(advWorkout.exercises[0].suggestedWeight, 72.5);
    assert.equal(advWorkout.exercises[0].defaultSets, 4);
    assert.equal(advWorkout.exercises[0].restTime, 120);
    assert.equal(advWorkout.exercises[0].badge, 'RPE 8');
    assert.equal(advWorkout.exercises[0].notes, 'Escápulas retraídas');

    const begWorkout = assignedProgramToWorkout(program, 'Coach Miguel', { isBeginner: true });
    assert.equal(begWorkout.exercises[0].badge, 'Esforço 8/10');
  });
});
