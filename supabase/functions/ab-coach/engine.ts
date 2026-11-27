/**
 * Motor de prescrição do AB Coach no servidor (P1 de docs/TRAINING_SCIENCE_AUDIT.md).
 * A IA escolhe e ordena os exercícios; aqui decide-se o resto com as mesmas regras do app (src/engine/):
 * - só exercícios permitidos para o equipamento, as lesões e o nível do atleta (também como enum no schema);
 * - séries, reps, descanso e RIR alvo pela classe do exercício, objetivo e nível;
 * - validação da sessão: teto de séries diretas por músculo, carga axial e duração, com reparação automática.
 * Os dados vêm de engineData.ts, gerado por scripts/build_edge_engine.mjs.
 */
import { ENGINE_TABLES, EXERCISE_META, WARMUP_MIN, SETUP_MIN_PER_EXERCISE, type MetaTuple } from './engineData.ts';
import { CATALOG_BY_ID } from './catalog.ts';

export interface MotorCtx {
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'conditioning';
  location: 'gym' | 'home_gym' | 'bodyweight';
  equipment: string[];
  injuries: string[];
}

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS = ['hypertrophy', 'strength', 'fat_loss', 'conditioning'];
const LOCATIONS = ['gym', 'home_gym', 'bodyweight'];
const JOINTS = ['shoulder', 'lower_back', 'knee', 'wrist_elbow', 'hip'];
const ITEMS = ['dumbbell', 'kettlebell', 'bench', 'pull_up_bar', 'bands', 'barbell', 'box', 'stability_ball', 'medicine_ball', 'foam_roller', 'rings', 'ab_wheel', 'jump_rope'];
const DEFAULT_HOME = ['dumbbell', 'bench', 'pull_up_bar', 'bands'];
const SESSION_CAP = 8;
const AXIAL_SUM_CAP = 8;

/** Perfil estruturado enviado pelo app (`perfil.motor`); null se faltar ou for inválido. */
export function sanitizeMotor(raw: any): MotorCtx | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!LEVELS.includes(raw.experience) || !GOALS.includes(raw.goal) || !LOCATIONS.includes(raw.location)) return null;
  const list = (v: unknown, allowed: string[]) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && allowed.includes(x)) : []);
  return {
    experience: raw.experience,
    goal: raw.goal,
    location: raw.location,
    equipment: list(raw.equipment, ITEMS),
    injuries: list(raw.injuries, JOINTS)
  };
}

const meta = (id: string) => {
  const t: MetaTuple | undefined = EXERCISE_META[id];
  if (!t) return null;
  const [pattern, repClass, loadType, axial, muscles, contra, skill, equipment, unilateral] = t;
  return { pattern, repClass, loadType, axial, muscles, contra, skill, equipment, unilateral: Boolean(unilateral) };
};
type Meta = NonNullable<ReturnType<typeof meta>>;

function inventory(ctx: MotorCtx): Set<string> | null {
  if (ctx.location === 'gym') return null;
  if (ctx.equipment.length) return new Set(ctx.equipment);
  return new Set(ctx.location === 'home_gym' ? DEFAULT_HOME : []);
}

function isAllowed(m: Meta | null, ctx: MotorCtx, inv: Set<string> | null): boolean {
  if (!m) return false;
  if (inv && m.equipment.some((item) => !inv.has(item))) return false;
  if (ctx.injuries.some((j) => m.contra?.[j] === 'avoid')) return false;
  return LEVELS.indexOf(m.skill) <= LEVELS.indexOf(ctx.experience);
}

/** Ids que a IA pode usar (vai como enum no schema). */
export function allowedExerciseIds(ctx: MotorCtx): string[] {
  const inv = inventory(ctx);
  return Object.keys(EXERCISE_META).filter((id) => {
    const m = meta(id);
    return isAllowed(m, ctx, inv) && m!.pattern !== 'mobility';
  });
}

const primary = (m: Meta) => Object.keys(m.muscles).find((k) => m.muscles[k] === 1) || null;

/** Melhor substituto permitido: mesmo padrão (e músculo, se possível), sem cautela para as lesões. */
function substitute(id: string, ctx: MotorCtx, inv: Set<string> | null, used: Set<string>, axialBudget: number): string | null {
  const m = meta(id);
  if (!m?.pattern) return null;
  const muscle = primary(m);
  let best: { id: string; s: number } | null = null;
  for (const cid of Object.keys(EXERCISE_META)) {
    if (used.has(cid) || cid === id) continue;
    const c = meta(cid);
    if (!c || c.pattern !== m.pattern || !isAllowed(c, ctx, inv)) continue;
    let s = primary(c) === muscle ? 50 : 0;
    if (c.repClass === m.repClass) s += 10;
    if (ctx.injuries.some((j) => c.contra?.[j] === 'caution')) s -= 30;
    if (c.axial > axialBudget) s -= 40;
    if (!best || s > best.s) best = { id: cid, s };
  }
  return best?.id || null;
}

function prescribe(m: Meta | null, ctx: MotorCtx) {
  const repClass = (m?.repClass || 'compound') as 'heavy' | 'compound' | 'isolation' | 'timed';
  const sets = (ENGINE_TABLES.START_SETS as any)[ctx.experience][repClass];
  const rir = (ENGINE_TABLES.RIR_TABLE as any)[ctx.experience][repClass];
  if (repClass === 'timed') return { sets, reps: null, rest: 45, rir };
  const [min, max, rest] = (ENGINE_TABLES.REP_TABLE as any)[ctx.goal][repClass];
  return { sets, reps: `${min}-${max}`, rest, rir };
}

const minutesOf = (list: any[]) =>
  WARMUP_MIN + list.length * SETUP_MIN_PER_EXERCISE +
  list.reduce((t, ex) => t + ex.series * ((meta(ex.id)?.unilateral ? 70 : 40) + ex.descanso_seg), 0) / 60;

/**
 * Aplica o motor a um treino já saneado (validateAndSanitizeCoachResponse).
 * @returns treino ajustado e a lista de ajustes feitos (para as observações)
 */
export function applyEngine(treino: any, ctx: MotorCtx): { treino: any; ajustes: string[] } {
  const ajustes: string[] = [];
  const inv = inventory(ctx);
  const used = new Set<string>();
  let axialSum = 0;
  let heavyAxial = false;
  const out: any[] = [];

  // 1. Exercícios permitidos e carga axial da sessão
  for (const ex of treino.exercicios || []) {
    let id = ex.id;
    let m = meta(id);
    const budget = heavyAxial ? 4 : Math.min(5, AXIAL_SUM_CAP - axialSum);
    if (m && (!isAllowed(m, ctx, inv) || m.axial > budget)) {
      const sub = substitute(id, ctx, inv, used, budget);
      if (!sub) {
        ajustes.push(`tirei ${ex.nome} (não serve ao teu equipamento, lesões ou nível)`);
        continue;
      }
      ajustes.push(`troquei ${ex.nome} por ${CATALOG_BY_ID.get(sub)?.nome || sub}`);
      id = sub;
      m = meta(id);
    }
    if (used.has(id)) continue;
    used.add(id);
    axialSum += m?.axial || 1;
    if ((m?.axial || 1) >= 5) heavyAxial = true;
    const p = prescribe(m, ctx);
    const cat = CATALOG_BY_ID.get(id);
    out.push({
      ...ex,
      id,
      nome: cat?.nome || ex.nome,
      grupo: cat?.grupo || ex.grupo,
      porcao: cat?.porcao || ex.porcao,
      equipamento: cat?.equipamento || ex.equipamento,
      series: p.sets,
      reps: p.reps || ex.reps,
      descanso_seg: p.rest,
      rir_alvo: p.rir
    });
  }

  // 2. Teto de séries diretas por músculo na sessão (isoladores cortam primeiro)
  const direct = () => {
    const d: Record<string, number> = {};
    for (const ex of out) {
      const m = meta(ex.id);
      for (const [k, w] of Object.entries(m?.muscles || {})) if (w === 1) d[k] = (d[k] || 0) + ex.series;
    }
    return d;
  };
  const isoFirst = (a: any, b: any) => (meta(a.id)?.repClass === 'isolation' ? -1 : 0) - (meta(b.id)?.repClass === 'isolation' ? -1 : 0);
  for (let guard = 0; guard < 50; guard++) {
    const over = Object.entries(direct()).find(([, v]) => v > SESSION_CAP);
    if (!over) break;
    const cand = out.filter((ex) => meta(ex.id)?.muscles?.[over[0]] === 1 && ex.series > 2).sort(isoFirst)[0];
    if (!cand) break;
    cand.series -= 1;
    if (!ajustes.includes(`limitei a ${SESSION_CAP} séries diretas por músculo`)) ajustes.push(`limitei a ${SESSION_CAP} séries diretas por músculo`);
  }

  // 3. Duração: corta séries (isoladores primeiro) até caber no tempo do treino
  const limit = Math.max(15, Math.min(120, Number(treino.duracao_min) || 45));
  for (let guard = 0; guard < 60 && minutesOf(out) > limit; guard++) {
    const cand = [...out].filter((ex) => ex.series > 2).sort(isoFirst)[0];
    if (!cand) {
      if (out.length <= 2) break;
      const removed = out.pop();
      ajustes.push(`tirei ${removed.nome} para caber em ${limit} min`);
      continue;
    }
    cand.series -= 1;
  }

  return { treino: { ...treino, exercicios: out, duracao_min: Math.max(limit, Math.round(minutesOf(out))) }, ajustes };
}
