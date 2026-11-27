#!/usr/bin/env node
/**
 * Gera supabase/functions/ab-coach/engineData.ts a partir do motor do app (src/engine/):
 * metadados de treino de cada exercício do catálogo do AB Coach e as tabelas de prescrição.
 * Assim o servidor aplica as mesmas regras que o app, sem duas versões à mão.
 *   node scripts/build_edge_engine.mjs   (depois: deploy da função ab-coach)
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const { EXERCISE_CATALOG } = await import(`${ROOT}/src/services/abCoach/catalog.js`);
const { getExerciseMeta } = await import(`${ROOT}/src/engine/exerciseMeta.js`);
const { PRESCRIPTION_TABLES } = await import(`${ROOT}/src/engine/prescription.js`);
const { WARMUP_MIN, SETUP_MIN_PER_EXERCISE } = await import(`${ROOT}/src/engine/volume.js`);

const meta = {};
let missing = 0;
for (const ex of EXERCISE_CATALOG) {
  const m = getExerciseMeta(ex.id);
  if (!m) {
    missing += 1;
    continue;
  }
  meta[ex.id] = [m.pattern, m.repClass, m.loadType, m.axial, m.muscles, m.contra, m.skill, m.equipment, m.unilateral ? 1 : 0];
}

const out = `/**
 * GERADO por scripts/build_edge_engine.mjs a partir de src/engine/. Não editar à mão.
 * Tuplo por exercício: [padrão, classe, carga, carga axial, músculos, contraindicações, nível, equipamento, unilateral].
 */
export type MetaTuple = [string | null, string, string, number, Record<string, number>, Record<string, string>, string, string[], number];

export const ENGINE_TABLES = ${JSON.stringify(PRESCRIPTION_TABLES)} as const;
export const WARMUP_MIN = ${WARMUP_MIN};
export const SETUP_MIN_PER_EXERCISE = ${SETUP_MIN_PER_EXERCISE};

export const EXERCISE_META: Record<string, MetaTuple> = ${JSON.stringify(meta)};
`;
fs.writeFileSync(path.join(ROOT, 'supabase/functions/ab-coach/engineData.ts'), out);
console.log(`${Object.keys(meta).length} exercícios com metadados; ${missing} sem metadados.`);
