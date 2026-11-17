/**
 * AB Fitness — Serviço de Sincronização em Nuvem de Corridas (Supabase PostgreSQL).
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { simplifyRoute } from '../utils/runningService';
import { getRunsHistory } from '../utils/storage';

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
