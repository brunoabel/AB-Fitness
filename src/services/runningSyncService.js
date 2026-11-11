/**
 * AB Fitness — Serviço de Sincronização em Nuvem de Corridas (Supabase PostgreSQL)
 * e Exportação de Backup Completo de Dados (JSON / CSV).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { simplifyRoute } from '../utils/runningService';
import {
  getRunsHistory,
  getWorkoutHistory,
  getSavedWeights,
  getCompletedDays,
  getSavedUserProfile
} from '../utils/storage';
import { getUnlockedBadges } from '../utils/badgeService';

/**
 * Salva ou sincroniza um registro de corrida na tabela `public.runs` do Supabase
 */
export async function syncRunToSupabase(runRecord, userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || userId === 'guest-local-user') {
    return runRecord;
  }

  try {
    const payload = {
      id: runRecord.id,
      user_id: userId,
      distance_km: Number(runRecord.distanceKm) || 0,
      duration_seconds: Number(runRecord.durationSeconds) || 0,
      avg_pace: runRecord.avgPace || '--:--',
      avg_pace_seconds: Number(runRecord.avgPaceSeconds) || 0,
      calories: Number(runRecord.calories) || 0,
      avg_speed_kmh: Number(runRecord.avgSpeedKmh) || 0,
      elevation_gain_m: Number(runRecord.elevationGainM) || 0,
      splits: runRecord.splits || [],
      coordinates: simplifyRoute(runRecord.coordinates || [], 600, 2.0),
      is_simulation: Boolean(runRecord.isSimulation),
      created_at: new Date(runRecord.timestamp || Date.now()).toISOString()
    };

    const { error } = await supabase
      .from('runs')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Erro ao sincronizar corrida com o Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Falha na sincronização de corrida:', err);
  }

  return runRecord;
}

/**
 * Busca todas as corridas salvas na nuvem para o usuário e mescla com o armazenamento local
 */
export async function syncUserRunsFromSupabase(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId || userId === 'guest-local-user') {
    return getRunsHistory();
  }

  try {
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Erro ao carregar corridas do Supabase:', error.message);
      return getRunsHistory();
    }

    if (data && data.length > 0) {
      const localRuns = getRunsHistory() || [];
      const localMap = new Map(localRuns.map((r) => [r.id, r]));

      // Mesclar dados da nuvem no mapa local
      data.forEach((row) => {
        localMap.set(row.id, {
          id: row.id,
          timestamp: new Date(row.created_at).getTime(),
          date: row.created_at,
          distanceKm: Number(row.distance_km),
          durationSeconds: Number(row.duration_seconds),
          avgPace: row.avg_pace,
          avgPaceSeconds: Number(row.avg_pace_seconds),
          calories: Number(row.calories),
          avgSpeedKmh: Number(row.avg_speed_kmh),
          elevationGainM: Number(row.elevation_gain_m),
          splits: row.splits || [],
          coordinates: row.coordinates || [],
          isSimulation: Boolean(row.is_simulation)
        });
      });

      const mergedRuns = Array.from(localMap.values()).sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );

      // Persistir lista unificada no localStorage
      try {
        localStorage.setItem('ab_fitness_runs_v1', JSON.stringify(mergedRuns));
      } catch {}

      return mergedRuns;
    }
  } catch (err) {
    console.warn('Falha ao sincronizar histórico de corridas:', err);
  }

  return getRunsHistory();
}

/**
 * Exporta todos os dados do atleta em formato JSON para download
 */
export function exportAppDataAsJSON() {
  const exportPayload = {
    appName: 'AB Fitness',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getSavedUserProfile(),
    workoutsHistory: getWorkoutHistory(),
    savedWeights: getSavedWeights(),
    completedDays: getCompletedDays(),
    runsHistory: getRunsHistory(),
    badges: getUnlockedBadges()
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ab-fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta o histórico unificado de treinos e corridas em formato CSV para Excel/Sheets
 */
export function exportAppDataAsCSV() {
  const runs = getRunsHistory() || [];
  const workouts = getWorkoutHistory() || [];

  const headers = ['Tipo', 'Data', 'Identificador/Treino', 'Distancia (KM)', 'Duracao (Min)', 'Ritmo/Pace', 'Calorias', 'Volume Total (KG)'];
  const rows = [];

  // Linhas de corridas
  runs.forEach((r) => {
    rows.push([
      'Corrida',
      new Date(r.timestamp || r.date).toLocaleDateString('pt-BR'),
      r.isSimulation ? 'Corrida (Simulada)' : 'Corrida GPS',
      Number(r.distanceKm || 0).toFixed(2),
      Math.round((r.durationSeconds || 0) / 60),
      r.avgPace || '--',
      r.calories || 0,
      'N/A'
    ]);
  });

  // Linhas de treinos de musculação
  workouts.forEach((w) => {
    rows.push([
      'Musculação',
      new Date(w.completedAt).toLocaleDateString('pt-BR'),
      `"${(w.dayTitle || w.dayName || 'Treino').replace(/"/g, '""')}"`,
      'N/A',
      w.durationMinutes || Math.round((w.durationSeconds || 0) / 60),
      'N/A',
      'N/A',
      w.totalVolumeKg || 0
    ]);
  });

  const csvContent = '\uFEFF' + [
    headers.join(';'),
    ...rows.map((row) => row.join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `ab-fitness-historico-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
