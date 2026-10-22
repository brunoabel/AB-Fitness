import fs from 'fs';
import path from 'path';
import { EXERCISE_CATALOG } from '../src/services/abCoach/catalog.js';

const outDir = path.resolve('supabase', 'functions', 'ab-coach');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const rawTuples = EXERCISE_CATALOG.map((e) => [
  e.id,
  e.numericId,
  e.nome,
  e.grupo,
  e.porcao,
  e.equipamento,
  e.tipo
]);

const tuplesJson = JSON.stringify(rawTuples);

const tsContent = `/**
 * catalog.ts — Catálogo Compacto Pré-compilado para o Supabase Edge Function (Deno)
 */

export interface CatalogExercise {
  id: string;
  numericId: number;
  nome: string;
  grupo: string;
  porcao: string;
  equipamento: string;
  tipo: 'composto' | 'isolador';
}

const RAW_TUPLES: [string, number, string, string, string, string, 'composto' | 'isolador'][] = ${tuplesJson};

export const EXERCISE_CATALOG: CatalogExercise[] = RAW_TUPLES.map((t) => ({
  id: t[0],
  numericId: t[1],
  nome: t[2],
  grupo: t[3],
  porcao: t[4],
  equipamento: t[5],
  tipo: t[6]
}));

export const CATALOG_BY_ID = new Map<string, CatalogExercise>();
export const CATALOG_BY_NAME_LOWER = new Map<string, CatalogExercise>();

EXERCISE_CATALOG.forEach((ex) => {
  CATALOG_BY_ID.set(ex.id, ex);
  if (ex.numericId) {
    CATALOG_BY_ID.set(String(ex.numericId), ex);
  }
  CATALOG_BY_NAME_LOWER.set(ex.nome.toLowerCase().trim(), ex);
});

export function findExerciseInCatalog(identifier: string | number): CatalogExercise | null {
  if (!identifier) return null;
  const str = String(identifier).trim();
  if (CATALOG_BY_ID.has(str)) return CATALOG_BY_ID.get(str)!;
  const lower = str.toLowerCase();
  if (CATALOG_BY_NAME_LOWER.has(lower)) return CATALOG_BY_NAME_LOWER.get(lower)!;
  return null;
}

export function findNearestExercise(grupo = '', porcao = '', excludeIds = new Set<string>()): CatalogExercise {
  const g = (grupo || '').toLowerCase();
  const p = (porcao || '').toLowerCase();

  const matchBoth = EXERCISE_CATALOG.find(
    (e) => !excludeIds.has(e.id) && e.grupo?.toLowerCase() === g && e.porcao?.toLowerCase() === p
  );
  if (matchBoth) return matchBoth;

  const matchGroup = EXERCISE_CATALOG.find(
    (e) => !excludeIds.has(e.id) && e.grupo?.toLowerCase() === g
  );
  if (matchGroup) return matchGroup;

  return EXERCISE_CATALOG.find((e) => !excludeIds.has(e.id)) || EXERCISE_CATALOG[0];
}

export function formatCatalogForPrompt(): string {
  return EXERCISE_CATALOG.map(
    (e) => \`\${e.id}|\${e.nome}|\${e.grupo}|\${e.porcao}|\${e.equipamento}|\${e.tipo}\`
  ).join('\\n');
}
`;

fs.writeFileSync(path.join(outDir, 'catalog.ts'), tsContent, 'utf8');
console.log('✅ supabase/functions/ab-coach/catalog.ts otimizado e gerado com sucesso!');
