#!/usr/bin/env node
/**
 * Lista os metadados de treino dos 508 exercícios, agrupados por padrão de movimento, para revisão humana.
 *   node scripts/review_exercise_meta.mjs [padrão]
 * Colunas: id | classe | carga axial | nível | alongamento | contraindicações | equipamento | músculos
 */
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { EXERCISE_CATALOG } = await import(`${ROOT}/src/data/exerciseMedia.js`);
const { getExerciseMeta } = await import(`${ROOT}/src/engine/exerciseMeta.js`);
const only = process.argv[2];

const byPattern = new Map();
for (const id of Object.keys(EXERCISE_CATALOG)) {
  const meta = getExerciseMeta(id);
  const key = meta?.pattern || '(sem padrão)';
  if (only && key !== only) continue;
  if (!byPattern.has(key)) byPattern.set(key, []);
  byPattern.get(key).push([id, meta]);
}
const short = (o) => Object.entries(o || {}).map(([k, v]) => `${k}${v === 'caution' ? '?' : v === 1 || v === 'avoid' ? '' : `.${String(v).slice(2)}`}`).join(',');
for (const [pattern, list] of [...byPattern].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n## ${pattern} (${list.length})`);
  for (const [id, m] of list) {
    console.log(`${id} | ${m.repClass} | ax${m.axial} | ${m.skill[0]} | L${m.lengthened} | ${short(m.contra)} | ${m.equipment.join(',')} | ${short(m.muscles)}`);
  }
}
