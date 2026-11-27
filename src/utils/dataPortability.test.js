import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  workoutsToCsv,
  runsToCsv,
  parseCompetitorWorkoutsCsv,
  mapImportedExerciseId
} from './dataPortability.js';

describe('dataPortability — Exportação & Importação CSV (Hevy / Strong / AB Fitness)', () => {
  it('mapeia nomes de exercícios em inglês (Hevy/Strong) para IDs do catálogo', () => {
    assert.equal(mapImportedExerciseId('Bench Press (Barbell)'), 'supino-reto-barra');
    assert.equal(mapImportedExerciseId('Squat (Barbell)'), 'agachamento-livre');
    assert.equal(mapImportedExerciseId('Deadlift (Barbell)'), 'levantamento-terra');
    assert.equal(mapImportedExerciseId('Lat Pulldown (Cable)'), 'puxada-frontal-aberta');
    assert.equal(mapImportedExerciseId('Pull Up'), 'barra-fixa-pronada');
    assert.equal(mapImportedExerciseId('Lateral Raise (Dumbbell)'), 'elevacao-lateral-halteres');
  });

  it('importa CSV da Hevy agrupando séries por sessão e deduplicando', () => {
    const hevyCsv = [
      'title,start_time,end_time,exercise_title,set_index,set_type,weight_kg,reps,rpe',
      '"Push A","2026-11-20T10:00:00Z","2026-11-20T10:50:00Z","Bench Press (Barbell)",0,warmup,40,10,',
      '"Push A","2026-11-20T10:00:00Z","2026-11-20T10:50:00Z","Bench Press (Barbell)",1,normal,80,8,8.5',
      '"Push A","2026-11-20T10:00:00Z","2026-11-20T10:50:00Z","Bench Press (Barbell)",2,normal,80,8,9'
    ].join('\n');

    const res = parseCompetitorWorkoutsCsv(hevyCsv, []);
    assert.equal(res.format, 'hevy');
    assert.equal(res.error, null);
    assert.equal(res.workouts.length, 1);
    assert.equal(res.setsImported, 3);
    assert.equal(res.workouts[0].totalSets, 2); // exclui warmup da contagem de trabalho
    assert.equal(res.workouts[0].totalVolumeKg, 1280);
    assert.ok(res.workouts[0].exercisesData['supino-reto-barra']);

    // Reimportar o mesmo ficheiro deve ignorar duplicado
    const dup = parseCompetitorWorkoutsCsv(hevyCsv, res.workouts);
    assert.equal(dup.workouts.length, 0);
    assert.equal(dup.skippedDuplicates, 1);
  });

  it('importa CSV da Strong e faz round-trip do formato AB Fitness CSV', () => {
    const strongCsv = [
      'Date,Workout Name,Exercise Name,Set Order,Weight,Reps,RPE',
      '2026-11-21 18:00:00,Lower Body,Squat (Barbell),1,100,5,8',
      '2026-11-21 18:00:00,Lower Body,Squat (Barbell),2,100,5,8.5'
    ].join('\n');

    const res = parseCompetitorWorkoutsCsv(strongCsv, []);
    assert.equal(res.format, 'strong');
    assert.equal(res.workouts.length, 1);
    assert.equal(res.workouts[0].totalVolumeKg, 1000);

    const exported = workoutsToCsv(res.workouts);
    const reimported = parseCompetitorWorkoutsCsv(exported, []);
    assert.equal(reimported.format, 'ab_fitness');
    assert.equal(reimported.workouts.length, 1);
    assert.equal(reimported.workouts[0].totalVolumeKg, 1000);
  });

  it('exporta corridas para CSV válido', () => {
    const csv = runsToCsv([
      { date: '2026-11-20T07:00:00Z', distanceKm: 5.2, durationSeconds: 1500, avgPace: "4'48\" /km", avgSpeedKmh: 12.5, elevationGainM: 42, calories: 350, vo2Max: 46 }
    ]);
    assert.ok(csv.includes('distance_km'));
    assert.ok(csv.includes('5.2'));
  });
});
