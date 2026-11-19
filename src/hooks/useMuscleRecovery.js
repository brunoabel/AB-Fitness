import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context';
import { canUseSocial } from '../services/socialService';
import { getWorkoutHistory, getRunsHistory } from '../utils/storage';
import { buildState, computeLocalFatigue } from '../utils/muscleFatigue';
import { getCurrentReadinessScore } from '../utils/activeWorkoutHelpers';

const REFRESH_MS = 10 * 60 * 1000; // a fadiga decai com o tempo; recalcula a cada 10 min

/**
 * Estado de fadiga por região. Mostra logo o cálculo local e substitui pelo da nuvem
 * (get_muscle_fatigue) quando há sessão. Por região fica o maior dos dois valores, para
 * contar treinos deste aparelho ainda por sincronizar sem os somar duas vezes.
 * @returns {import('../utils/muscleFatigue').MuscleFatigueState}
 */
export default function useMuscleRecovery() {
  const { user } = useAuth();
  const userId = user?.id;
  const [tick, setTick] = useState(0);
  const [state, setState] = useState(() => ({ ...computeLocalFatigue(getWorkoutHistory(), Date.now(), getRunsHistory(), getCurrentReadinessScore()), loading: canUseSocial(userId) }));

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    const onFocus = () => document.visibilityState === 'visible' && setTick((t) => t + 1);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    // Prontidão do wearable abranda ou acelera a recuperação (a nuvem faz o mesmo com athlete_biometrics)
    const local = computeLocalFatigue(getWorkoutHistory(), Date.now(), getRunsHistory(), getCurrentReadinessScore());
    const request = canUseSocial(userId)
      ? supabase.rpc('get_muscle_fatigue', { p_window_hours: 72 })
      : Promise.resolve({ data: null, error: 'local' });
    request.then(({ data, error }) => {
      if (!alive) return;
      if (error || !Array.isArray(data)) {
        setState(local); // convidado, migration por aplicar ou offline
        return;
      }
      const rows = {};
      for (const r of data) {
        const loc = local.muscles[r.muscle_id];
        const cloud = Number(r.fatigue) || 0;
        rows[r.muscle_id] =
          loc && loc.fatigue > cloud
            ? { fatigue: loc.fatigue, lastTrainedAt: loc.lastTrainedAt, hoursToRecovered: loc.hoursToRecovered }
            : { fatigue: cloud, lastTrainedAt: r.last_trained_at, hoursToRecovered: Number(r.hours_to_recovered) || 0 };
      }
      setState(buildState(rows, 'cloud'));
    });
    return () => {
      alive = false;
    };
  }, [userId, tick]);

  return state;
}
