/**
 * bodyPortfolio.js — Portfólio Corporal (AB Fitness)
 *
 * Medidas corporais em LocalStorage (dados leves) e fotos de progresso em IndexedDB (Blobs).
 * Tudo fica apenas neste dispositivo: as fotos nunca são enviadas para o servidor.
 */

import { e1RM } from './strengthMetrics';

const ENTRIES_KEY = 'ab_fitness_body_entries_v1';
const DB_NAME = 'ab_fitness_body_v1';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';
const MAX_PHOTO_SIDE = 1080;

export const BODY_METRICS = [
  { id: 'weight', label: 'Peso', unit: 'kg', short: 'Peso' },
  { id: 'bodyFat', label: '% Gordura', unit: '%', short: '% G' },
  { id: 'waist', label: 'Cintura', unit: 'cm', short: 'Cint.' },
  { id: 'chest', label: 'Peito', unit: 'cm', short: 'Peito' },
  { id: 'arm', label: 'Braço', unit: 'cm', short: 'Braço' },
  { id: 'thigh', label: 'Coxa', unit: 'cm', short: 'Coxa' },
  { id: 'hips', label: 'Quadril', unit: 'cm', short: 'Quad.' }
];

export const PHOTO_POSES = [
  { id: 'front', label: 'Frente' },
  { id: 'side', label: 'Lado' },
  { id: 'back', label: 'Costas' }
];

/* ------------------------------ Medidas ------------------------------ */

export function getBodyEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.sort((a, b) => a.date.localeCompare(b.date)) : [];
  } catch {
    return [];
  }
}

function writeEntries(list) {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Não foi possível guardar as medidas:', err);
  }
}

/** Guarda (ou substitui) o registo de uma data. Campos vazios são ignorados. */
export function saveBodyEntry(entry) {
  const clean = { id: entry.id || `body_${Date.now()}`, date: entry.date };
  for (const m of BODY_METRICS) {
    const v = Number(String(entry[m.id] ?? '').replace(',', '.'));
    if (Number.isFinite(v) && v > 0) clean[m.id] = Math.round(v * 10) / 10;
  }
  const list = getBodyEntries().filter((e) => e.date !== clean.date);
  list.push(clean);
  writeEntries(list);
  return getBodyEntries();
}

export function deleteBodyEntry(id) {
  writeEntries(getBodyEntries().filter((e) => e.id !== id));
  return getBodyEntries();
}

/** Série temporal de uma métrica: [{ date, value }] */
export function getMetricSeries(entries, metricId) {
  return entries
    .filter((e) => typeof e[metricId] === 'number')
    .map((e) => ({ date: e.date, value: e[metricId] }));
}

/* ------------------------------ Fotos (IndexedDB) ------------------------------ */

let dbPromise = null;

function getDB() {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(PHOTO_STORE)) {
            db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

function runTx(mode, fn) {
  return getDB().then((db) => {
    if (!db) throw new Error('IndexedDB indisponível neste navegador.');
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, mode);
      const store = tx.objectStore(PHOTO_STORE);
      const result = fn(store);
      tx.oncomplete = () => resolve(result?.result ?? result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  });
}

/** Redimensiona para no máximo 1080px no lado maior e comprime em JPEG. */
export async function compressImage(file) {
  let source;
  try {
    source = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.src = URL.createObjectURL(file);
    });
  }

  const w = source.width;
  const h = source.height;
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  if (source.close) source.close();
  if (source.src) URL.revokeObjectURL(source.src);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  if (!blob) throw new Error('Falha ao comprimir a imagem.');
  return { blob, width: canvas.width, height: canvas.height };
}

export async function addProgressPhoto(file, { date, pose }) {
  const { blob, width, height } = await compressImage(file);
  const photo = { id: `photo_${Date.now()}`, date, pose, blob, width, height, createdAt: Date.now() };
  await runTx('readwrite', (store) => store.put(photo));
  return photo;
}

export async function getProgressPhotos() {
  try {
    const list = await runTx('readonly', (store) => store.getAll());
    return (list || []).sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt);
  } catch {
    return [];
  }
}

export async function deleteProgressPhoto(id) {
  await runTx('readwrite', (store) => store.delete(id));
}

/* ------------------------------ Força (para o card de marco) ------------------------------ */

/** Melhores 1RM estimados por exercício no histórico, ordenados do maior para o menor. */
export function getTopLifts(history = [], limit = 3) {
  const best = new Map();
  for (const session of history) {
    const data = session.exercisesData || {};
    for (const [exId, sets] of Object.entries(data)) {
      if (!Array.isArray(sets)) continue;
      for (const s of sets) {
        if (!(s.done || s.completed) || s.type === 'W') continue;
        const est = e1RM(s.weight, s.reps, s.rpe ? 10 - s.rpe : 0);
        if (est && (!best.has(exId) || est > best.get(exId).e1RM)) {
          best.set(exId, { exerciseId: exId, e1RM: est, weight: Number(s.weight), reps: Number(s.reps) });
        }
      }
    }
  }
  return [...best.values()].sort((a, b) => b.e1RM - a.e1RM).slice(0, limit);
}

export function formatDatePt(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
