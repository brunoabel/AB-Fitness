/**
 * Testa a cobertura do WorkoutX para os 20 exercícios do plano de prevenção.
 * Uso:  WORKOUTX_API_KEY=wx_... node scripts/probe_workoutx_mobility.mjs
 * Gasta cerca de 1 pedido por termo pesquisado (máx. ~45 dos 500 grátis). Não guarda URLs de media
 * (a licença proíbe guardar/servir os vídeos); grava só ids e nomes em scripts/out/workoutx_mobility.json.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const KEY = process.env.WORKOUTX_API_KEY;
if (!KEY) {
  console.error('Define WORKOUTX_API_KEY (chave wx_ criada na tua conta WorkoutX).');
  process.exit(1);
}
const BASE = 'https://api.workoutxapp.com/v2';

// id do nosso catálogo -> termos de pesquisa (do mais específico ao mais genérico)
const TARGETS = {
  'leg-swing-sagittal': ['leg swing', 'front to back leg swing'],
  'leg-swing-frontal': ['lateral leg swing', 'side leg swing'],
  'worlds-greatest-stretch': ["world's greatest", 'worlds greatest', 'lunge rotation'],
  'knee-to-wall-ankle': ['ankle dorsiflexion', 'knee to wall', 'ankle mobility'],
  inchworm: ['inchworm', 'walkout'],
  'shoulder-cars': ['arm circle', 'shoulder circle'],
  'single-leg-glute-bridge': ['single leg glute bridge', 'single leg bridge'],
  'lateral-band-walk': ['lateral band walk', 'band side step', 'monster walk'],
  'nordic-hamstring-curl': ['nordic'],
  'copenhagen-plank': ['copenhagen'],
  'eccentric-calf-raise': ['single leg calf raise', 'calf raise'],
  'band-external-rotation': ['external rotation'],
  'side-plank': ['side plank'],
  'tibialis-raise': ['tibialis', 'toe raise'],
  'standing-calf-stretch': ['calf stretch'],
  'half-kneeling-hip-flexor': ['hip flexor stretch', 'kneeling hip flexor'],
  'supine-hamstring-strap': ['hamstring stretch'],
  'figure-four-stretch': ['figure four', 'piriformis', 'figure 4'],
  'childs-pose': ["child's pose", 'childs pose', 'child pose'],
  'foam-roll-calves-quads': ['foam roll', 'foam roller']
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastQuota = null;

async function search(name) {
  const url = `${BASE}/exercises?name=${encodeURIComponent(name)}&limit=10`;
  const res = await fetch(url, { headers: { 'X-WorkoutX-Key': KEY } });
  lastQuota = res.headers.get('x-quota-remaining') ?? lastQuota;
  if (res.status === 429) throw new Error('Limite atingido (429).');
  if (!res.ok) throw new Error(`HTTP ${res.status} em "${name}"`);
  const json = await res.json();
  return (json.results || []).map((r) => ({ id: r.id, name: r.name, category: r.category, target: r.target, model: r.model }));
}

const report = {};
for (const [id, terms] of Object.entries(TARGETS)) {
  let hits = [];
  for (const t of terms) {
    hits = await search(t);
    await sleep(2200); // plano grátis: 30 pedidos/min
    if (hits.length) {
      report[id] = { term: t, hits };
      break;
    }
  }
  if (!hits.length) report[id] = { term: null, hits: [] };
  const r = report[id];
  console.log(`${r.hits.length ? 'OK ' : '-- '} ${id.padEnd(26)} ${r.hits.length ? `${r.hits.length} resultado(s) via "${r.term}": ${r.hits.slice(0, 3).map((h) => `${h.name} [${h.model}]`).join(' | ')}` : 'sem resultados'}`);
}

mkdirSync('scripts/out', { recursive: true });
writeFileSync('scripts/out/workoutx_mobility.json', JSON.stringify(report, null, 2));
const found = Object.values(report).filter((r) => r.hits.length).length;
console.log(`\nCobertura candidata: ${found}/20 (rever manualmente: nome parecido não garante o mesmo movimento).`);
if (lastQuota != null) console.log(`Quota restante: ${lastQuota}`);
