import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getVoiceCuesPreference } from '../utils/speech';
import { getRunsHistory, deleteRunRecord } from '../utils/storage';
import { syncUserRunsFromSupabase } from '../services/runningSyncService';
import { triggerHaptic } from '../utils/audio';
import { getRunTargetById } from '../utils/runGoals';
import {
  AUTO_PAUSE_PREF_KEY,
  WEEKLY_GOAL_PREF_KEY,
  RUN_TARGET_PREF_KEY
} from '../components/running/runPrefs';

/** Gere preferências locais da corrida, meta semanal e sincronização do histórico. */
export default function useRunPreferences(userId) {
  const [voiceEnabled, setVoiceEnabled] = useState(() => getVoiceCuesPreference());
  const voiceEnabledRef = useRef(voiceEnabled);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  const [autoPauseEnabled, setAutoPauseEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_PAUSE_PREF_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [weeklyGoalKm, setWeeklyGoalKm] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(WEEKLY_GOAL_PREF_KEY));
      return saved > 0 ? saved : 10;
    } catch {
      return 10;
    }
  });

  const [selectedTarget, setSelectedTarget] = useState(() => {
    try {
      return getRunTargetById(localStorage.getItem(RUN_TARGET_PREF_KEY));
    } catch {
      return getRunTargetById('free');
    }
  });

  const [runsHistory, setRunsHistory] = useState(() => getRunsHistory());

  useEffect(() => {
    try {
      localStorage.setItem(WEEKLY_GOAL_PREF_KEY, String(weeklyGoalKm));
    } catch {}
  }, [weeklyGoalKm]);

  useEffect(() => {
    try {
      localStorage.setItem(RUN_TARGET_PREF_KEY, selectedTarget?.id || 'free');
    } catch {}
  }, [selectedTarget]);

  useEffect(() => {
    let active = true;
    if (userId && userId !== 'guest-local-user') {
      syncUserRunsFromSupabase(userId)
        .then((merged) => {
          if (active && Array.isArray(merged) && merged.length > 0) {
            setRunsHistory(merged);
          }
        })
        .catch((err) => {
          console.warn('Sincronização de corridas da nuvem indisponível:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [userId]);

  const reloadHistory = useCallback(() => {
    setRunsHistory(getRunsHistory());
  }, []);

  const handleDeleteRun = useCallback((e, runId) => {
    e?.stopPropagation?.();
    deleteRunRecord(runId);
    setRunsHistory(getRunsHistory());
    triggerHaptic(15);
  }, []);

  const totalKmsAccumulated = useMemo(
    () => runsHistory.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0),
    [runsHistory]
  );

  return {
    voiceEnabled,
    setVoiceEnabled,
    voiceEnabledRef,
    autoPauseEnabled,
    setAutoPauseEnabled,
    weeklyGoalKm,
    setWeeklyGoalKm,
    selectedTarget,
    setSelectedTarget,
    runsHistory,
    reloadHistory,
    handleDeleteRun,
    totalKmsAccumulated
  };
}
