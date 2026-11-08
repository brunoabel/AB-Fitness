import { VERIFIED_EXERCISE_VIDEOS, getVerifiedExerciseVideo, hasVerifiedExerciseVideo } from '../src/data/exerciseVideos.js';

console.log('Auditing VERIFIED_EXERCISE_VIDEOS...');
const entries = Object.entries(VERIFIED_EXERCISE_VIDEOS);
console.log(`Total verified entries: ${entries.length}`);

let passed = 0;
let errors = 0;

for (const [key, item] of entries) {
  if (key !== item.canonicalId) {
    console.error(`[KEY MISMATCH] Dictionary key "${key}" != canonicalId "${item.canonicalId}"`);
    errors++;
  }
  if (!item.videoMale) {
    console.error(`[MISSING MALE VIDEO] ${key}`);
    errors++;
  }
  if (!item.poster) {
    console.error(`[MISSING POSTER] ${key}`);
    errors++;
  }
  if (!item.keyCues || item.keyCues.length < 2) {
    console.error(`[SHORT CUES] ${key}`);
    errors++;
  }
  
  // Test lookup by canonicalId
  const found = getVerifiedExerciseVideo(item.canonicalId);
  if (!found || found.canonicalId !== item.canonicalId) {
    console.error(`[LOOKUP FAIL BY CANONICAL] ${item.canonicalId}`);
    errors++;
  } else {
    passed++;
  }
}

// Test specific constraints:
const bulgarian = getVerifiedExerciseVideo('agachamento-bulgaro');
if (bulgarian !== null) {
  console.error('[CONSTRAINT VIOLATION] Bulgarian split squat MUST be null until authentic bench foot is confirmed!');
  errors++;
} else {
  console.log('[OK] Bulgarian split squat is strictly disabled (null) as requested.');
}

// Test Batch 4 samples:
const samples = [
  'crunch-bicicleta-chao',
  'abdominal-canivete-v-up',
  'elevacao-pernas-barra-fixa-retas',
  'agachamento-taca-goblet-squat',
  'cadeira-abdutora-maquina',
  'cadeira-adutora-maquina',
  'flexao-fechada-chao-diamante-triceps',
  'elevacao-frontal-barra',
  'crucifixo-invertido-crossover-polia-alta',
  'corda-naval-batida-dupla-battling-ropes',
  'alongamento-quadriceps-em-pe',
  'alongamento-panturrilha-sentado',
  'mobilidade-punhos-circulos'
];

for (const s of samples) {
  const v = getVerifiedExerciseVideo(s);
  if (!v) {
    console.error(`[SAMPLE FAIL] Could not find ${s}`);
    errors++;
  } else {
    console.log(`[SAMPLE OK] ${s} -> "${v.name}" (${v.equipment})`);
  }
}

console.log(`\nAudit finished: ${passed} passed, ${errors} errors.`);
if (errors > 0) {
  process.exit(1);
}
