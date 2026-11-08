/** Regras de classificação e correspondência PT → dataset (EN) usadas pelo build do catálogo. */

export const norm = (s) =>
  String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** Equipamento a partir do nome + ficha biomecânica. Ordem importa: o mais específico primeiro. */
export function classifyEquipment(text) {
  const n = ` ${norm(text)} `;
  if (/ elastico| band /.test(n)) return 'bands';
  if (/ polia| cabo| corda| crossover| face pull/.test(n)) return 'cable';
  if (/ maquina| smith| leg press| cadeira| mesa | hack| pec deck| voador| graviton| articulad| puxada /.test(n)) return 'machine';
  if (/ halter| serrote| kettlebell/.test(n)) return 'dumbbell';
  if (/ barra(?! fixa)| barra w| militar| levantamento terra| deadlift| anilha/.test(n)) return 'barbell';
  return 'bodyweight';
}

/** Barra fixa / paralelas contam como equipamento mínimo de casa. */
export function classifyEnvironment(equipment, text) {
  if (equipment === 'machine' || equipment === 'cable' || equipment === 'barbell') return 'gym';
  if (equipment === 'dumbbell' || equipment === 'bands') return 'home_minimal';
  const n = norm(text);
  if (/barra fixa|paralela|argola|caixa|step|banco/.test(n)) return 'home_minimal';
  return 'home_no_equip';
}

/** Dicionário mínimo PT → EN para casar nomes com o dataset. */
const DICT = [
  ['supino', 'bench press'], ['crucifixo', 'fly'], ['flexao de braco', 'push up'], ['flexao', 'push up'],
  ['remada', 'row'], ['puxada', 'pulldown'], ['barra fixa', 'pull up'], ['rosca', 'curl'], ['martelo', 'hammer'],
  ['concentrada', 'concentration'], ['triceps frances', 'overhead triceps extension'], ['triceps testa', 'lying triceps extension'],
  ['triceps', 'triceps'], ['mergulho', 'dip'], ['desenvolvimento', 'shoulder press'], ['elevacao lateral', 'lateral raise'],
  ['elevacao frontal', 'front raise'], ['encolhimento', 'shrug'], ['agachamento', 'squat'], ['afundo', 'lunge'], ['passada', 'lunge'],
  ['bulgaro', 'bulgarian split squat'], ['stiff', 'stiff leg deadlift'], ['levantamento terra', 'deadlift'], ['elevacao pelvica', 'hip thrust'],
  ['ponte', 'glute bridge'], ['panturrilha', 'calf raise'], ['abdominal', 'crunch'], ['prancha', 'plank'], ['extensora', 'leg extension'],
  ['flexora', 'leg curl'], ['cadeira', 'seated'], ['mesa', 'lying'], ['inclinado', 'incline'], ['declinado', 'decline'], ['unilateral', 'one arm single'],
  ['halteres', 'dumbbell'], ['halter', 'dumbbell'], ['barra', 'barbell'], ['polia', 'cable'], ['cabo', 'cable'], ['corda', 'rope'],
  ['maquina', 'lever machine'], ['smith', 'smith'], ['sentado', 'seated'], ['em pe', 'standing'], ['deitado', 'lying'], ['banco', 'bench'],
  ['pegada neutra', 'neutral grip'], ['pegada aberta', 'wide grip'], ['pegada fechada', 'close grip'], ['invertido', 'reverse'], ['inversa', 'reverse'],
  ['pullover', 'pullover'], ['face pull', 'face pull'], ['abducao', 'abduction'], ['aducao', 'adduction'], ['gluteo', 'glute'], ['coice', 'kickback'],
  ['lombar', 'back extension'], ['hiperextensao', 'hyperextension'], ['joelho', 'knee'], ['elevacao de pernas', 'leg raise'], ['russo', 'russian twist']
];

export function toEnglishTokens(ptName) {
  let n = ` ${norm(ptName)} `;
  const out = [];
  for (const [pt, en] of DICT) {
    if (n.includes(` ${pt} `)) {
      out.push(...en.split(' '));
      n = n.replace(` ${pt} `, ' ');
    }
  }
  return new Set(out);
}

const STOP = new Set(['with', 'the', 'on', 'to', 'and', 'of', 'a', 'up', 'one']);
export const enTokens = (s) => new Set(norm(s).split(' ').filter((t) => t && !STOP.has(t)));

/** Equipamento do dataset no mesmo vocabulário do app. */
export function datasetEquipment(eq) {
  if (/band/.test(eq)) return 'bands';
  if (/cable|rope/.test(eq)) return 'cable';
  if (/machine|lever|sled|smith/.test(eq)) return 'machine';
  if (/dumbbell|kettlebell/.test(eq)) return 'dumbbell';
  if (/barbell|weighted/.test(eq)) return 'barbell';
  return 'bodyweight';
}

/** Pontuação de semelhança (0–1) entre o nome PT traduzido e um item do dataset. */
export function matchScore(ptName, appEquipment, item) {
  const a = toEnglishTokens(ptName);
  for (const t of [...a]) if (STOP.has(t)) a.delete(t);
  if (a.size === 0) return 0;
  if (datasetEquipment(item.equipment) !== appEquipment) return 0;
  let best = 0;
  for (const label of [item.name, ...(item.aliases || [])]) {
    const b = enTokens(label);
    const inter = [...a].filter((t) => b.has(t)).length;
    const score = inter / Math.max(a.size, b.size);
    if (score > best) best = score;
  }
  return best;
}

/** Dica curta (leitura de ~2s): primeira oração, até ~48 caracteres. */
export function shortCue(text) {
  const first = String(text || '').split(/[.;(]| — | - /)[0].split(',')[0].trim();
  if (!first) return null;
  if (first.length <= 48) return first;
  const cut = first.slice(0, 46);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,]+(e|de|do|da|a|o|com|sem|para|na|no)$/i, '')}…`;
}
