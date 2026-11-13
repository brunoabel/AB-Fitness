import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context';
import { canUseSocial, getMyProfile } from '../services/socialService';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../utils/userVerification';
import { getAthleteRank } from '../utils/athletePassCard';
import { computeStreak } from '../utils/streak';
import { getCompletedDays, getRunsHistory, getWorkoutHistory } from '../utils/storage';
import { getLocalConnections } from '../services/wearables/wearableManager';

function formatWearablesStatus() {
  const conns = getLocalConnections();
  const keys = Object.keys(conns || {});
  if (keys.length > 1) return 'Whoop & Fitbit conectados';
  if (keys.length === 1) return keys[0] === 'whoop' ? 'Whoop 4.0 conectado' : 'Fitbit conectado';
  return 'Ligar Whoop & Fitbit';
}

/**
 * Estado unificado de identidade atlética, patente, sequência e wearables
 * partilhado entre Sidebar (desktop) e SidebarDrawer (mobile).
 */
export function useAthleteIdentity({
  refreshKey = true,
  completedDays = null,
  schedule = []
} = {}) {
  const { user, isGuest, isCeo, isAdmin, isTrainer, isPro, isConfigured, signOut } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [, setWearablesTick] = useState(0);

  useEffect(() => {
    if (!refreshKey || !canUseSocial(userId)) return undefined;
    let alive = true;
    getMyProfile(userId).then(({ data }) => {
      if (alive && data) setProfile(data);
    });
    return () => {
      alive = false;
    };
  }, [refreshKey, userId]);

  const wearablesStatus = formatWearablesStatus();

  const refreshWearables = useCallback(() => {
    setWearablesTick((n) => n + 1);
  }, []);

  const avatar = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta';
  const username = profile?.username || null;
  const initials = fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'A';

  const ceo = isCeo || isAthleteCeo(profile || { full_name: fullName }, user);
  const pro = isPro || isAthletePro(profile || { full_name: fullName }, user);
  const verified = isAthleteVerified(profile || { full_name: fullName }, user, isAdmin);
  const synced = isConfigured && !isGuest;

  const streak = useMemo(() => {
    const days = completedDays ?? getCompletedDays();
    return computeStreak(days, schedule, getRunsHistory());
  }, [completedDays, schedule]);

  const rank = useMemo(() => {
    const total = (getWorkoutHistory()?.length || 0) + (getRunsHistory()?.length || 0);
    return getAthleteRank({ totalWorkouts: total, streak, isCeo: ceo });
  }, [streak, ceo]);

  return {
    user,
    isGuest,
    isAdmin,
    isTrainer,
    signOut,
    avatar,
    fullName,
    username,
    initials,
    ceo,
    pro,
    verified,
    synced,
    streak,
    rank,
    wearablesStatus,
    refreshWearables
  };
}
