/**
 * AB Fitness — Portabilidade Aberta de Dados (Exportação JSON/CSV + Importador Hevy/Strong)
 * Cumpre o direito à portabilidade (RGPD) e permite migrar histórico sem lock-in.
 */

import { EXERCISE_CATALOG } from '../services/abCoach/catalog.js';
import { localDateKey } from './dateKey.js';

const LBS_TO_KG = 0.45359237;

const ENGLISH_SYNONYMS = {
  'bench press': 'supino-reto-barra',
  'bench press (barbell)': 'supino-reto-barra',
  'incline bench press (dumbbell)': 'supino-inclinado-halteres',
  'incline bench press (barbell)': 'supino-inclinado-barra',
  'squat': 'agachamento-livre',
  'squat (barbell)': 'agachamento-livre',
  'back squat': 'agachamento-livre',
  'deadlift': 'levantamento-terra',
  'deadlift (barbell)': 'levantamento-terra',
  'romanian deadlift (barbell)': 'stiff-com-barra',
  'romanian deadlift (dumbbell)': 'stiff-com-halteres',
  'overhead press (barbell)': 'desenvolvimento-militar',
  'shoulder press (dumbbell)': 'desenvolvimento-com-halteres',
  'pull up': 'barra-fixa-pronada',
  'lat pulldown (cable)': 'puxada-frontal-aberta',
  'bent over row (barbell)': 'remada-curvada-barra',
  'seated cable row': 'remada-baixa-cabo',
  'leg press': 'leg-press-45',
  'leg extension (machine)': 'cadeira-extensora',
  'lying leg curl (machine)': 'mesa-flexora',
  'bicep curl (dumbbell)': 'rosca-direta-halteres',
  'bicep curl (barbell)': 'rosca-direta-barra',
  'triceps pushdown': 'triceps-corda',
  'lateral raise (dumbbell)': 'elevacao-lateral-halteres'
};

function normalizeStr(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(s) {
  return normalizeStr(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercicio-importado';
}

/** Mapeia um nome ou ID de exercício importado para o ID oficial do catálogo quando possível. */
export function mapImportedExerciseId(rawNameOrId) {
  const raw = String(rawNameOrId || '').trim();
  if (!raw) return 'exercicio-importado';

  const norm = normalizeStr(raw);
  if (ENGLISH_SYNONYMS[norm]) return ENGLISH_SYNONYMS[norm];

  const exact = EXERCISE_CATALOG.find(
    (e) => e.id.toLowerCase() === norm || normalizeStr(e.nome) === norm
  );
  if (exact) return exact.id;

  const partial = EXERCISE_CATALOG.find(
    (e) => normalizeStr(e.nome).includes(norm) || norm.includes(normalizeStr(e.nome))
  );
  if (partial) return partial.id;

  return slugify(raw);
}

/** Escape seguro de célula CSV (RFC 4180). */
export function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\r\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Parser RFC-4180 de CSV com autodetecção de separador (`,` ou `;`). */
export function parseCsvRows(csvText) {
  const text = String(csvText || '').replace(/^\uFEFF/, '').trim();
  if (!text) return [];

  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const sep = semiCount > commaCount ? ';' : ',';

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === sep) {
      row.push(field.trim());
      field = '';
    } else if (ch === '\r' && next === '\n') {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = '';
      i++;
    } else if (ch === '\n' || ch === '\r') {
      row.push(field.trim());
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell !== ''));
}

/** Exporta o histórico de treinos de força para CSV plano (1 linha por série). */
export function workoutsToCsv(workouts = []) {
  const header = [
    'date',
    'workout_title',
    'exercise_id',
    'set_index',
    'set_type',
    'weight_kg',
    'reps',
    'rpe',
    'completed',
    'duration_minutes'
  ];
  const lines = [header.join(',')];

  for (const w of workouts || []) {
    const dateIso = w.completedAt || (w.timestamp ? new Date(w.timestamp).toISOString() : '');
    const title = w.title || w.dayTitle || w.workoutTitle || w.dayName || 'Treino';
    const duration = Number(w.durationMinutes) || Math.max(1, Math.round((Number(w.durationSeconds) || 0) / 60));
    const exData = w.exercisesData || {};

    for (const [exId, sets] of Object.entries(exData)) {
      if (!Array.isArray(sets)) continue;
      sets.forEach((s, idx) => {
        lines.push(
          [
            dateIso,
            title,
            exId,
            idx + 1,
            s.type || 'N',
            s.weight ?? '',
            s.reps ?? s.seconds ?? '',
            s.rpe ?? '',
            Boolean(s.completed || s.done) ? 'true' : 'false',
            duration
          ]
            .map(csvEscape)
            .join(',')
        );
      });
    }
  }

  return lines.join('\n');
}

/** Exporta o histórico de corridas para CSV plano. */
export function runsToCsv(runs = []) {
  const header = [
    'date',
    'distance_km',
    'duration_seconds',
    'avg_pace',
    'avg_speed_kmh',
    'elevation_gain_m',
    'calories',
    'vo2_max'
  ];
  const lines = [header.join(',')];

  for (const r of runs || []) {
    lines.push(
      [
        r.date || (r.timestamp ? new Date(r.timestamp).toISOString() : ''),
        r.distanceKm ?? '',
        r.durationSeconds ?? '',
        r.avgPace ?? '',
        r.avgSpeedKmh ?? '',
        r.elevationGainM ?? 0,
        r.calories ?? '',
        r.vo2Max ?? ''
      ]
        .map(csvEscape)
        .join(',')
    );
  }

  return lines.join('\n');
}

function normalizeSetType(raw) {
  const v = normalizeStr(raw);
  if (v === 'warmup' || v === 'w' || v === 'aquecimento') return 'W';
  if (v === 'dropset' || v === 'drop' || v === 'd' || v === 'drop_set') return 'D';
  if (v === 'failure' || v === 'f' || v === 'falha') return 'F';
  return 'N';
}

const MONTHS = {
  jan: 0, feb: 1, fev: 1, mar: 2, apr: 3, abr: 3, may: 4, mai: 4, jun: 5, jul: 6,
  aug: 7, ago: 7, sep: 8, set: 8, oct: 9, out: 9, nov: 10, dec: 11, dez: 11
};

function localDate(y, m, d, hh = 0, mm = 0, ss = 0) {
  const dt = new Date(Number(y), Number(m), Number(d), Number(hh) || 0, Number(mm) || 0, Number(ss) || 0);
  // Recusa datas que o construtor "corrige" (ex.: 31 fev) e anos fora do razoável
  if (dt.getFullYear() !== Number(y) || dt.getMonth() !== Number(m) || dt.getDate() !== Number(d)) return null;
  if (dt.getFullYear() < 2000 || dt.getTime() > Date.now() + 86400000) return null;
  return dt;
}

/**
 * Data de uma linha CSV, sem depender do parser do browser (o Safari recusa "2025-11-25 18:30:00").
 * Aceita ISO / Strong ("YYYY-MM-DD HH:mm[:ss]"), Hevy ("25 Nov 2025, 18:30") e "DD/MM/YYYY [HH:mm]".
 * Devolve `null` quando não consegue ler: a linha é ignorada em vez de cair no dia de hoje.
 */
export function parseFlexibleDate(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return null;

  // ISO com fuso explícito (Z ou +01:00): o construtor é fiável em todos os browsers
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/.test(str)) {
    const dt = new Date(str);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) return localDate(m[1], Number(m[2]) - 1, m[3], m[4], m[5], m[6]);

  m = str.match(/^(\d{1,2})\s+([A-Za-zÀ-ÿ]{3,})\.?\s+(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
  if (m) {
    const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
    return month === undefined ? null : localDate(m[3], month, m[1], m[4], m[5]);
  }

  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,?\s+(\d{1,2}):(\d{2}))?/);
  if (m) return localDate(m[3], Number(m[2]) - 1, m[1], m[4], m[5]);

  return null;
}

/**
 * Importa ficheiros CSV exportados da Hevy, Strong ou AB Fitness e devolve registos prontos
 * para `addWorkoutToHistory`, com deduplicação contra `existingHistory`.
 */
export function parseCompetitorWorkoutsCsv(csvText, existingHistory = []) {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return { format: 'unknown', workouts: [], setsImported: 0, skippedDuplicates: 0, error: 'Ficheiro CSV vazio ou sem linhas de dados.' };
  }

  const headers = rows[0].map((h) => normalizeStr(h));
  const idxOf = (...names) => {
    for (const name of names) {
      const i = headers.indexOf(name);
      if (i !== -1) return i;
    }
    return -1;
  };

  let format = 'unknown';
  if (idxOf('exercise_title') !== -1 && idxOf('start_time') !== -1) {
    format = 'hevy';
  } else if (idxOf('exercise name') !== -1 && idxOf('workout name') !== -1) {
    format = 'strong';
  } else if (idxOf('exercise_id') !== -1 && idxOf('workout_title') !== -1) {
    format = 'ab_fitness';
  }

  if (format === 'unknown') {
    return {
      format,
      workouts: [],
      setsImported: 0,
      skippedDuplicates: 0,
      error: 'Formato CSV não reconhecido. Suportamos exportações da Hevy, Strong ou AB Fitness.'
    };
  }

  const colDate = idxOf('start_time', 'date');
  const colTitle = idxOf('title', 'workout name', 'workout_title');
  const colExercise = idxOf('exercise_title', 'exercise name', 'exercise_id');
  const colSetType = idxOf('set_type', 'set order');
  const colWeightKg = idxOf('weight_kg', 'weight');
  const colWeightLbs = idxOf('weight_lbs');
  const colReps = idxOf('reps');
  const colRpe = idxOf('rpe');
  const colDuration = idxOf('duration_minutes', 'workout duration');

  const existingKeys = new Set(
    (existingHistory || []).map((w) => {
      const d = w.completedAt ? localDateKey(new Date(w.completedAt)) : '';
      const t = normalizeStr(w.title || w.dayTitle || w.workoutTitle || '');
      return `${d}|${t}`;
    })
  );

  const grouped = new Map();
  let setsImported = 0;
  let skippedInvalid = 0;

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    const exRaw = cols[colExercise];
    if (!exRaw) continue;

    const dt = parseFlexibleDate(cols[colDate]);
    if (!dt) {
      skippedInvalid += 1;
      continue;
    }
    const dateKey = localDateKey(dt);
    const title = (colTitle !== -1 && cols[colTitle]) ? cols[colTitle] : `Treino Importado (${dateKey})`;
    const groupKey = `${dateKey}|${normalizeStr(title)}`;

    if (!grouped.has(groupKey)) {
      const durRaw = colDuration !== -1 ? Number.parseFloat(cols[colDuration]) : NaN;
      grouped.set(groupKey, {
        groupKey,
        dt,
        title,
        durationMinutes: Number.isFinite(durRaw) && durRaw > 0 ? Math.round(durRaw) : 45,
        exercisesData: {}
      });
    }

    const session = grouped.get(groupKey);
    const exId = format === 'ab_fitness' ? exRaw : mapImportedExerciseId(exRaw);
    if (!session.exercisesData[exId]) session.exercisesData[exId] = [];

    let weight = 0;
    if (colWeightKg !== -1 && cols[colWeightKg] !== '' && cols[colWeightKg] !== undefined) {
      weight = Number.parseFloat(String(cols[colWeightKg]).replace(',', '.')) || 0;
    } else if (colWeightLbs !== -1 && cols[colWeightLbs] !== '' && cols[colWeightLbs] !== undefined) {
      const lbs = Number.parseFloat(String(cols[colWeightLbs]).replace(',', '.')) || 0;
      weight = Math.round(lbs * LBS_TO_KG * 2) / 2;
    }

    const reps = colReps !== -1 ? (Number.parseInt(cols[colReps], 10) || 0) : 0;
    const rpeVal = colRpe !== -1 ? Number.parseFloat(String(cols[colRpe]).replace(',', '.')) : NaN;
    const setType = colSetType !== -1 ? normalizeSetType(cols[colSetType]) : 'N';

    session.exercisesData[exId].push({
      weight,
      reps,
      type: setType,
      rpe: Number.isFinite(rpeVal) && rpeVal > 0 ? rpeVal : null,
      completed: true,
      done: true
    });
    setsImported += 1;
  }

  const workouts = [];
  let skippedDuplicates = 0;

  for (const session of grouped.values()) {
    if (existingKeys.has(session.groupKey)) {
      skippedDuplicates += 1;
      continue;
    }

    let totalSets = 0;
    let totalVolumeKg = 0;
    Object.values(session.exercisesData).forEach((sets) => {
      sets.forEach((s) => {
        if (s.type !== 'W') {
          totalSets += 1;
          totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });

    const ts = session.dt.getTime();
    workouts.push({
      id: `imported_${format}_${ts}_${workouts.length}`,
      sessionId: `imported_${format}_${ts}_${workouts.length}`,
      timestamp: ts,
      completedAt: session.dt.toISOString(),
      date: session.dt.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      workoutDayId: 'imported',
      dayName: 'Importado',
      dayTitle: session.title,
      title: session.title,
      workoutTitle: session.title,
      durationMinutes: session.durationMinutes,
      durationSeconds: session.durationMinutes * 60,
      totalSets,
      totalSetsCompleted: totalSets,
      exerciseCount: Object.keys(session.exercisesData).length,
      totalVolumeKg: Math.round(totalVolumeKg),
      exercisesData: session.exercisesData,
      targetGroup: 'Importado',
      importedFrom: format
    });
  }

  return { format, workouts, setsImported, skippedDuplicates, skippedInvalid, error: null };
}

/** Dispara o download de um ficheiro de texto (JSON/CSV) no browser. */
export function triggerFileDownload(content, filename, mimeType) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
