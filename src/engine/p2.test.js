import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runningLoad, concurrentAdjustments } from './concurrent.js';
import { weeklyBudget, planVolume } from './volume.js';
import { buildContext } from './balancer.js';
import { getExerciseMeta } from './exerciseMeta.js';
import { muscleTrend, nextWeekOffsets, distributeOffsets, calibrate } from './muscleVolume.js';
import { buildPlanFromProfile } from '../data/planFromProfile.js';
import { updateMuscleVolume } from '../utils/muscleVolumeState.js';
import { loadMesocycle, mesoParamsFor } from '../utils/mesocycleState.js';
import { addBonusSets } from '../utils/mesocycleWeek.js';

const BASE = { gender: 'male', age: 28, weightKg: 78, heightCm: 178, splitPreference: 'auto', hasSport: false, sports: [], sportDays: [], injuries: [], priorityMuscles: [] };
const profile = (over) => ({ ...BASE, experienceLevel: 'intermediate', primaryGoal: 'hypertrophy', daysPerWeek: 4, trainingLocation: 'gym', sessionMinutes: 60, ...over });
const at = (y, m, d, h = 18) => new Date(y, m - 1, d, h).getTime();

// Novembro de 2026: qualidade à quarta, longa ao domingo, leve à segunda
const NOW = at(2026, 11, 28, 12);
const RUNS = [
  ...[25, 18, 11, 4].map((d) => ({ timestamp: at(2026, 11, d), distanceKm: 8, avgPaceSeconds: 270 })),
  ...[22, 15, 8, 1].map((d) => ({ timestamp: at(2026, 11, d), distanceKm: 16, avgPaceSeconds: 350 })),
  ...[23, 16, 9, 2].map((d) => ({ timestamp: at(2026, 11, d), distanceKm: 6, avgPaceSeconds: 330 }))
];

const legShare = (day) => {
  const ex = day.exercises || [];
  if (!ex.length) return 0;
  return ex.filter((e) => ['quads', 'hamstrings', 'glutes'].some((m) => getExerciseMeta(e)?.muscles?.[m] === 1)).length / ex.length;
};

describe('treino concorrente', () => {
  it('lê km reais, dias de qualidade e de longa', () => {
    const load = runningLoad(RUNS, NOW);
    assert.equal(load.weeklyKm, 30);
    assert.deepEqual(load.qualityDays, [2]);
    assert.deepEqual(load.longRunDays, [6]);
    assert.equal(load.highVolume, true);
    const adj = concurrentAdjustments(load);
    assert.deepEqual([...adj.blocked].sort(), [0, 1, 2]);
    assert.deepEqual(adj.budgetScale, { quads: 0.8, hamstrings: 0.8 });
  });

  it('ignora corridas simuladas e antigas', () => {
    const load = runningLoad([{ timestamp: NOW - 40 * 864e5, distanceKm: 50 }, { timestamp: NOW - 864e5, distanceKm: 20, isSimulation: true }], NOW);
    assert.equal(load.weeklyKm, 0);
  });

  it('plano: menos pernas acima de 25 km e sem pernas pesadas perto das corridas fortes', () => {
    const p = profile();
    const without = buildPlanFromProfile(p);
    const withRuns = buildPlanFromProfile(p, { runs: RUNS, now: NOW });
    const v0 = planVolume(without.plan).weekly;
    const v1 = planVolume(withRuns.plan).weekly;
    assert.ok(v1.quads < v0.quads, `quads ${v1.quads} < ${v0.quads}`);
    assert.ok(v1.hamstrings <= v0.hamstrings);
    for (const idx of [0, 1, 2]) assert.ok(legShare(withRuns.plan[idx]) < 0.5, `dia ${idx}`);
    assert.equal(withRuns.validation.filter((i) => i.severity === 'error').length, 0);
    assert.ok(withRuns.notes.some((n) => n.includes('30 km')));
  });
});

describe('preferências de exercícios', () => {
  it('a evitar sai do plano; favorito do mesmo slot entra', () => {
    const p = profile();
    const base = buildPlanFromProfile(p).plan.flatMap((d) => (d.exercises || []).map((e) => e.id));
    assert.ok(base.includes('supino-reto-barra'));
    const prefs = buildPlanFromProfile(p, { preferences: { avoid: ['supino-reto-barra'], favorite: ['supino-pegada-neutra-halteres'] } }).plan.flatMap((d) => (d.exercises || []).map((e) => e.id));
    assert.ok(!prefs.includes('supino-reto-barra'));
    assert.ok(prefs.includes('supino-pegada-neutra-halteres'));
  });
});

describe('orçamento calibrado', () => {
  it('aplica a calibração e o fator do treino concorrente', () => {
    const base = weeklyBudget('intermediate');
    const adj = weeklyBudget('intermediate', [], { calibration: { chest: { cap: -2 }, biceps: { start: 2 } }, scale: { quads: 0.8 } });
    assert.equal(adj.chest.cap, base.chest.cap - 2);
    assert.equal(adj.biceps.start, base.biceps.start + 2);
    assert.equal(adj.quads.cap, Math.round(base.quads.cap * 0.8));
  });
});

const session = (ts, exercisesData) => ({ timestamp: ts, exercisesData });
const sets = (weight, reps, n = 3) => Array.from({ length: n }, () => ({ weight, reps, done: true, type: 'N', rpe: 8 }));

describe('volume por músculo guiado pela performance', () => {
  const weekStart = new Date(2026, 10, 23).getTime();
  const progressed = [session(at(2026, 11, 11), { 'supino-reto-barra': sets(80, 8) }), session(at(2026, 11, 18), { 'supino-reto-barra': sets(82.5, 8) })];
  const dropped = [session(at(2026, 11, 11), { 'supino-reto-barra': sets(80, 8) }), session(at(2026, 11, 18), { 'supino-reto-barra': sets(75, 7) })];
  const plan = buildPlanFromProfile(profile()).plan;
  const ctx = buildContext({ experience: 'intermediate', sessionMinutes: 75 });
  const baseWeekly = planVolume(plan).weekly;
  const window = { earlyFrom: weekStart - 35 * 864e5, earlyTo: weekStart - 7 * 864e5, lateFrom: weekStart - 7 * 864e5, lateTo: weekStart };

  it('tendência por músculo a partir da força estimada', () => {
    assert.equal(muscleTrend(progressed, 'chest', window), 'up');
    assert.equal(muscleTrend(dropped, 'chest', window), 'down');
    assert.equal(muscleTrend(progressed, 'quads', window), null);
  });

  it('+1 série só com performance mantida e sem fadiga', () => {
    assert.deepEqual(nextWeekOffsets({ history: progressed, checkins: [], weekStart, baseWeekly, budget: ctx.budget }).added, ['chest']);
    assert.deepEqual(nextWeekOffsets({ history: dropped, checkins: [], weekStart, baseWeekly, budget: ctx.budget }).added, []);
    const pain = [{ createdAt: new Date(at(2026, 11, 19)).toISOString(), effort: 3, pain: ['Ombro'] }];
    assert.deepEqual(nextWeekOffsets({ history: progressed, checkins: pain, weekStart, baseWeekly, budget: ctx.budget }).added, []);
  });

  it('nunca acima do teto semanal', () => {
    const offsets = { chest: Math.ceil(ctx.budget.chest.cap - baseWeekly.chest) };
    assert.deepEqual(nextWeekOffsets({ offsets, history: progressed, checkins: [], weekStart, baseWeekly, budget: ctx.budget }).added, []);
  });

  it('distribui as séries extra pelos exercícios do músculo, dentro dos limites', () => {
    const { bonus } = distributeOffsets(plan, { chest: 2 }, ctx);
    const total = Object.values(bonus).flatMap((d) => Object.entries(d)).reduce((t, [id, n]) => {
      assert.equal(getExerciseMeta(id).muscles.chest, 1, id);
      return t + n;
    }, 0);
    assert.equal(total, 2);
  });

  it('calibração: estagnar perto do teto em 2 mesociclos baixa o teto; progredir no teto sobe-o', () => {
    const cap = ctx.budget.chest.cap;
    const stalled = { muscles: { chest: { sets: cap, trend: 'flat', fatigue: false } } };
    assert.deepEqual(calibrate({}, [stalled, stalled], ctx.budget).changes, [{ muscle: 'chest', field: 'cap', delta: -2 }]);
    const up = { muscles: { chest: { sets: cap, trend: 'up', fatigue: false } } };
    assert.deepEqual(calibrate({}, [up], ctx.budget).changes, [{ muscle: 'chest', field: 'cap', delta: 2 }]);
    const low = { muscles: { biceps: { sets: ctx.budget.biceps.start, trend: 'flat', fatigue: false } } };
    assert.deepEqual(calibrate({}, [low, low], ctx.budget).changes, [{ muscle: 'biceps', field: 'start', delta: 2 }]);
    assert.equal(calibrate({ chest: { start: 0, cap: -4 } }, [stalled, stalled], ctx.budget).changes.length, 0, 'limite de 4 séries');
  });
});

describe('estado semanal do volume', () => {
  const memory = () => {
    const m = new Map();
    return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
  };

  it('semana 1 sem extra, semana 2 soma, novo mesociclo recomeça; o treino ativo recebe as séries', () => {
    const storage = memory();
    const p = profile({ sessionMinutes: 75 });
    const plan = buildPlanFromProfile(p).plan;
    const history = [session(at(2026, 11, 10), { 'supino-reto-barra': sets(80, 8) }), session(at(2026, 11, 13), { 'supino-inclinado-halteres': sets(30, 10) })];
    const w1 = updateMuscleVolume({ history, checkins: [], schedule: plan, profile: p, now: new Date(2026, 10, 9, 9), storage });
    assert.deepEqual(w1.volume.offsets, {});
    history.push(session(at(2026, 11, 12), { 'supino-reto-barra': sets(82.5, 8) }));
    const w2 = updateMuscleVolume({ history, checkins: [], schedule: plan, profile: p, now: new Date(2026, 10, 16, 9), storage });
    assert.equal(w2.volume.week, 2);
    assert.ok(w2.volume.offsets.chest >= 1);
    const params = mesoParamsFor(loadMesocycle(new Date(2026, 10, 16, 9), storage));
    const bonus = Object.values(params.setBonus).flatMap((d) => Object.values(d)).reduce((a, b) => a + b, 0);
    assert.ok(bonus >= 1);
    assert.equal(updateMuscleVolume({ history, checkins: [], schedule: plan, profile: p, now: new Date(2026, 10, 17, 9), storage }).changed, false);
    const next = updateMuscleVolume({ history, checkins: [], schedule: plan, profile: p, now: new Date(2026, 11, 15, 9), storage });
    assert.deepEqual(next.volume.offsets, {});
    assert.equal(loadMesocycle(new Date(2026, 11, 15, 9), storage).state.volumeRecords.length, 1);
  });

  it('séries extra copiam a última série por concluir', () => {
    const out = addBonusSets([{ weight: 50, reps: 8, done: true }], 2);
    assert.equal(out.length, 3);
    assert.equal(out[2].done, false);
    assert.equal(out[2].weight, 50);
  });
});
