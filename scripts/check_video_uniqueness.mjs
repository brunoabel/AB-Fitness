#!/usr/bin/env node
/** Verifica a regra dos vídeos: cada vídeo pertence a um único exercício (catálogo + ids antigos dos planos). Sai com erro se houver conflito. */
import { createServer } from 'vite';
const vite = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const { getExerciseMedia } = await vite.ssrLoadModule('/src/data/exerciseMedia.js');
const { EXERCISES_100 } = await vite.ssrLoadModule('/src/data/exercises100.js');
const { WEEKLY_SCHEDULE } = await vite.ssrLoadModule('/src/data/workouts.js');
const gen = await vite.ssrLoadModule('/src/data/workoutGenerator.js');
const plans = [3, 4, 5, 6].flatMap((d) => gen.generatePersonalizedWorkoutPlan({ frequencyDays: d, splitPreference: d === 6 ? 'arnold' : 'auto' }));
const planEx = [...WEEKLY_SCHEDULE, ...plans].flatMap((d) => d.exercises || []);
const key = (u) => (u || '').split('/').pop();
const owner = new Map(); const clashes = [];
const all = [...EXERCISES_100.map((e) => ({ id: e.slug, name: e.nome })), ...planEx.map((e) => ({ id: e.id, name: e.name }))];
const seen = new Set();
for (const e of all) {
  const m = getExerciseMedia(e); const k = key(m.videoMale); if (!k) continue;
  const who = m.entry?.id || e.id;
  // o mesmo exercício pode aparecer com id antigo e slug novo: conta como o mesmo dono se o catálogo resolver igual
  const sig = who + '|' + k; if (seen.has(sig)) continue; seen.add(sig);
  if (owner.has(k) && owner.get(k).who !== who) clashes.push(`${k}: ${owner.get(k).name} ≠ ${e.name}`); else owner.set(k, { who, name: e.name });
}
console.log('vídeos distintos em uso:', owner.size, '| conflitos:', clashes.length);
clashes.slice(0, 40).forEach((c) => console.log('  ' + c));
await vite.close();
if (clashes.length) process.exit(1);
