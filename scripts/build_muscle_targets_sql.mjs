/**
 * Gera supabase/migrations/20261110_muscle_fatigue_seed.sql a partir do catálogo e de muscleRegions.js,
 * para o SQL e o cálculo local usarem o mesmo mapeamento.  Uso: node scripts/build_muscle_targets_sql.mjs
 */
import { writeFileSync } from 'node:fs';
import { EXERCISE_CATALOG } from '../src/data/exerciseCatalog.js';
import { MUSCLE_REGIONS, regionsForExercise } from '../src/data/muscleRegions.js';

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;

const regions = MUSCLE_REGIONS.map((r, i) => `  (${q(r.id)}, ${q(r.label)}, ${r.halfLifeH}, ${i})`).join(',\n');

const targets = [];
for (const entry of Object.values(EXERCISE_CATALOG)) {
  const codes = [entry.id, entry.legacy_id != null ? String(entry.legacy_id) : null].filter(Boolean);
  for (const { region, weight } of regionsForExercise(entry)) {
    for (const code of codes) targets.push(`  (${q(code)}, ${q(region)}, ${weight})`);
  }
}

const sql = `-- GERADO por scripts/build_muscle_targets_sql.mjs. Não editar à mão.
-- Correr depois de 20261110_muscle_fatigue.sql.

INSERT INTO public.muscle_regions (muscle_id, label, half_life_h, sort_order) VALUES
${regions}
ON CONFLICT (muscle_id) DO UPDATE SET label = EXCLUDED.label, half_life_h = EXCLUDED.half_life_h, sort_order = EXCLUDED.sort_order;

DELETE FROM public.exercise_muscle_targets;
INSERT INTO public.exercise_muscle_targets (exercise_code, muscle_id, weight) VALUES
${targets.join(',\n')}
ON CONFLICT (exercise_code, muscle_id) DO UPDATE SET weight = EXCLUDED.weight;
`;

writeFileSync('supabase/migrations/20261110_muscle_fatigue_seed.sql', sql);
console.log(`${MUSCLE_REGIONS.length} regiões, ${targets.length} pares exercício→região.`);
