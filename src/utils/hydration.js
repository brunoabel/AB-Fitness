/**
 * AB Fitness — Hidratação Diária & Lembretes
 * Calcula a meta mínima diária de água a partir do peso do perfil do atleta,
 * regista tomas rápidas por dia local e gere lembretes inteligentes dentro da janela diurna.
 */

import { localDateKey } from './dateKey.js';

const LOG_KEY_PREFIX = 'ab_hydration_log_v1_';
const PREFS_KEY = 'ab_hydration_prefs_v1';

export const DEFAULT_HYDRATION_PREFS = {
  enabled: false,
  intervalMinutes: 120,
  startHour: 8,
  endHour: 21,
  customTargetMl: null,
  lastNotifiedAt: null
};

function resolveStorage(storage) {
  if (storage) return storage;
  return typeof window !== 'undefined' ? window.localStorage : null;
}

/**
 * Meta mínima diária em ml baseada no peso (kg) e objetivo.
 * Padrão clínico-desportivo: 35 ml/kg (mínimo base), 38 ml/kg (hipertrofia/força), 42 ml/kg (definição/atleta).
 * Arredondado ao múltiplo de 50 ml, limitado entre 1500 ml e 5500 ml.
 */
export function computeDailyWaterTargetMl(weightKg, goal = null) {
  const w = Number(weightKg);
  const safeWeight = Number.isFinite(w) && w >= 35 && w <= 220 ? w : 70;
  let mlPerKg = 35;
  if (goal === 'fat_loss' || goal === 'athlete') mlPerKg = 42;
  else if (goal === 'hypertrophy' || goal === 'strength') mlPerKg = 38;
  const raw = safeWeight * mlPerKg;
  const rounded = Math.round(raw / 50) * 50;
  return Math.min(5500, Math.max(1500, rounded));
}

export function formatLiters(ml) {
  const safe = Math.max(0, Number(ml) || 0);
  return `${(safe / 1000).toFixed(2).replace('.', ',')} L`;
}

export function getHydrationPrefs({ storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return { ...DEFAULT_HYDRATION_PREFS };
  try {
    const raw = store.getItem(PREFS_KEY);
    if (!raw) return { ...DEFAULT_HYDRATION_PREFS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_HYDRATION_PREFS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return { ...DEFAULT_HYDRATION_PREFS };
  }
}

export function saveHydrationPrefs(patch, { storage } = {}) {
  const store = resolveStorage(storage);
  const next = { ...getHydrationPrefs({ storage }), ...(patch || {}) };
  if (store) {
    try {
      store.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {}
  }
  return next;
}

export function getHydrationToday({ today = new Date(), storage } = {}) {
  const dateKey = localDateKey(today);
  const empty = { dateKey, consumedMl: 0, entries: [] };
  const store = resolveStorage(storage);
  if (!store) return empty;
  try {
    const raw = store.getItem(`${LOG_KEY_PREFIX}${dateKey}`);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
    const consumedMl = entries.reduce((sum, e) => sum + (Number(e?.ml) || 0), 0);
    return { dateKey, consumedMl, entries };
  } catch {
    return empty;
  }
}

function writeHydrationToday(log, { storage } = {}) {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(`${LOG_KEY_PREFIX}${log.dateKey}`, JSON.stringify(log));
  } catch {}
}

export function addWaterToday(ml, { today = new Date(), storage } = {}) {
  const amount = Math.round(Number(ml) || 0);
  const current = getHydrationToday({ today, storage });
  if (amount <= 0) return current;
  const entries = [...current.entries, { ml: amount, at: new Date(today).toISOString() }];
  const next = {
    dateKey: current.dateKey,
    consumedMl: current.consumedMl + amount,
    entries
  };
  writeHydrationToday(next, { storage });
  return next;
}

export function undoLastWaterToday({ today = new Date(), storage } = {}) {
  const current = getHydrationToday({ today, storage });
  if (current.entries.length === 0) return current;
  const entries = current.entries.slice(0, -1);
  const consumedMl = entries.reduce((sum, e) => sum + (Number(e?.ml) || 0), 0);
  const next = { dateKey: current.dateKey, consumedMl, entries };
  writeHydrationToday(next, { storage });
  return next;
}

export function isWithinReminderWindow(now = new Date(), prefs = DEFAULT_HYDRATION_PREFS) {
  const hour = now.getHours();
  const start = Number.isFinite(prefs.startHour) ? prefs.startHour : 8;
  const end = Number.isFinite(prefs.endHour) ? prefs.endHour : 21;
  return hour >= start && hour < end;
}

export function shouldTriggerHydrationReminder({
  now = new Date(),
  prefs = DEFAULT_HYDRATION_PREFS,
  consumedMl = 0,
  targetMl = 2500
} = {}) {
  if (!prefs?.enabled) return false;
  if (consumedMl >= targetMl) return false;
  if (!isWithinReminderWindow(now, prefs)) return false;
  const intervalMs = Math.max(30, Number(prefs.intervalMinutes) || 120) * 60 * 1000;
  if (!prefs.lastNotifiedAt) return true;
  const last = new Date(prefs.lastNotifiedAt).getTime();
  if (!Number.isFinite(last)) return true;
  return now.getTime() - last >= intervalMs;
}

export function getNotificationSupport() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return { supported: true, permission: window.Notification.permission };
}

export async function requestHydrationNotificationPermission() {
  const { supported, permission } = getNotificationSupport();
  if (!supported) return 'unsupported';
  if (permission === 'granted' || permission === 'denied') return permission;
  try {
    return await window.Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export async function sendHydrationNotification({ remainingMl }) {
  const { supported, permission } = getNotificationSupport();
  if (!supported || permission !== 'granted') return false;
  const body = remainingMl > 0
    ? `Faltam ${formatLiters(remainingMl)} para cumprires a tua meta de hidratação hoje.`
    : 'Hora de beber um copo de água.';
  try {
    if (navigator.serviceWorker?.ready) {
      const reg = await navigator.serviceWorker.ready;
      if (reg?.showNotification) {
        await reg.showNotification('Hora de beber água', {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'ab-hydration-reminder'
        });
        return true;
      }
    }
    new window.Notification('Hora de beber água', {
      body,
      icon: '/icon-192.png',
      tag: 'ab-hydration-reminder'
    });
    return true;
  } catch {
    return false;
  }
}
