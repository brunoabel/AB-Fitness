/**
 * Regiões do mapa de recuperação. Fonte única para o mapa SVG, o cálculo local e o seed SQL
 * (scripts/build_muscle_targets_sql.mjs). `halfLifeH`: horas para dissipar metade da fadiga.
 */
export const MUSCLE_REGIONS = [
  { id: 'peito', label: 'Peito', view: 'front', halfLifeH: 24 },
  { id: 'ombros', label: 'Ombros', view: 'both', halfLifeH: 22 },
  { id: 'biceps', label: 'Bíceps', view: 'front', halfLifeH: 18 },
  { id: 'antebracos', label: 'Antebraços', view: 'both', halfLifeH: 16 },
  { id: 'abdomen', label: 'Abdómen', view: 'front', halfLifeH: 14 },
  { id: 'quadriceps', label: 'Quadríceps', view: 'front', halfLifeH: 30 },
  { id: 'adutores', label: 'Adutores', view: 'front', halfLifeH: 26 },
  { id: 'trapezio', label: 'Trapézio', view: 'back', halfLifeH: 20 },
  { id: 'costas', label: 'Costas', view: 'back', halfLifeH: 28 },
  { id: 'triceps', label: 'Tríceps', view: 'back', halfLifeH: 18 },
  { id: 'gluteos', label: 'Glúteos', view: 'back', halfLifeH: 30 },
  { id: 'posteriores', label: 'Isquiotibiais', view: 'back', halfLifeH: 30 },
  { id: 'gemeos', label: 'Gémeos', view: 'both', halfLifeH: 16 }
];

export const REGION_BY_ID = Object.fromEntries(MUSCLE_REGIONS.map((r) => [r.id, r]));

// Ordem importa: o primeiro padrão que bate ganha ("tríceps braquial" antes de "braquial").
const RULES = [
  ['triceps', /tr[ií]ceps|^cabe[çc]a (lateral|longa|medial)$|^(longa|lateral|medial)$/],
  ['antebracos', /antebra[çc]o|forearm|braquiorradial|punho|extensor(es)? (comum |longo )?dos dedos|pronador|^flexores( do polegar)?$|^pegada$/],
  ['biceps', /b[ií]ceps|^braquial$/],
  ['trapezio', /trap[ée]zio|trapezius|levantador da esc[áa]pula/],
  ['ombros', /ombro|deltoid|manguito|supraespinhal|infraespinhal|infraspinatus|redondo menor|shoulder/],
  ['peito', /peit|pector|coracobraquial/],
  ['costas', /costas|dorsa|romboide|rhom?boid|redondo maior|eretor|erector|lombar|lower back/],
  ['abdomen', /abd[oôó]m|abdominal|^core|obl[ií]quo|oblique|transverso|reto abdominal|rectus abdominis|diafragma|serr[áa]til|serratus/],
  ['adutores', /adutor|pect[íi]neo|gr[áa]cil/],
  ['quadriceps', /quadr[ií]ceps|reto femoral|rectus femoris|vasto|vastus|sart[óo]rio|flexores do quadril|hip flexor/],
  ['gluteos', /gl[úu]te|piriforme|tensor da f[áa]scia|tensor fasciae/],
  ['posteriores', /posteriores|isquiotibiais|hamstring/],
  ['gemeos', /panturrilha|gastrocn|s[óo]leo|soleus|calves|tibial|tend[ãa]o|tornozelo/]
];

export function regionOf(muscleName) {
  const s = String(muscleName || '').toLowerCase().trim();
  if (!s) return null;
  const hit = RULES.find(([, re]) => re.test(s));
  return hit ? hit[0] : null;
}

const NO_FATIGUE = new Set(['Mobilidade']);

/**
 * Peso de cada região num exercício do catálogo: primário 1.0, secundário 0.5.
 * Mobilidade não gera fadiga; "Funcional & Cardio" só conta pelos secundários.
 * @returns {Array<{ region: string, weight: number }>}
 */
export function regionsForExercise(entry) {
  if (!entry || NO_FATIGUE.has(entry.primary_muscle)) return [];
  const out = new Map();
  const primary = regionOf(entry.primary_muscle);
  if (primary) out.set(primary, 1);
  for (const m of entry.secondary_muscles || []) {
    const r = regionOf(m);
    if (r && !out.has(r)) out.set(r, 0.5);
  }
  return [...out].map(([region, weight]) => ({ region, weight }));
}
