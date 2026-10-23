import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Share2, 
  Flame, 
  Timer, 
  Zap, 
  Navigation2, 
  Trophy, 
  Footprints, 
  Trash2,
  CheckCircle2,
  Smartphone,
  Volume2,
  VolumeX,
  Cloud,
  Satellite,
  Flag,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import RunningMap from './RunningMap';
import RunningShareModal from './RunningShareModal';
import BadgeUnlockedToast from './BadgeUnlockedToast';
import { 
  haversineDistanceMeters, 
  formatDuration, 
  formatPace, 
  calculateRunningCalories, 
  isValidGpsPoint,
  generateSimulatedStep,
  downloadGPX,
  computeSplits
} from '../utils/runningService';
import { 
  getRunsHistory, 
  saveRunRecord, 
  deleteRunRecord,
  getActiveRunDraft,
  saveActiveRunDraft,
  clearActiveRunDraft,
  getRunDraftFromIDB
} from '../utils/storage';
import { sound, triggerHaptic } from '../utils/audio';
import { 
  announceSplit, 
  announceStart, 
  announcePause, 
  announceResume, 
  announceFinish, 
  getVoiceCuesPreference, 
  saveVoiceCuesPreference,
  unlockSpeechIOS
} from '../utils/speech';
import { syncRunToSupabase, syncUserRunsFromSupabase } from '../services/runningSyncService';
import { evaluateAndUnlockBadges } from '../utils/badgeService';
import { useAuth } from '../context';
import { useWakeLock } from '../hooks/useWakeLock';

export default function RunningHub({ isDark = true }) {
  const { user } = useAuth();

  // Preferência de áudio / locução por voz nos fones
  const [voiceEnabled, setVoiceEnabled] = useState(() => getVoiceCuesPreference());
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState(null);

  // Rascunho de corrida recuperado (caso o usuário tenha pausado ou recarregado o app)
  const initialDraft = React.useMemo(() => getActiveRunDraft(), []);

  // Estados da Sessão de Corrida: 'idle' | 'countdown' | 'running' | 'paused' | 'completed'
  const [sessionStatus, setSessionStatus] = useState(() => (
    initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')
      ? 'paused'
      : 'idle'
  ));

  // Mantém o ecrã ligado durante a corrida ativa
  useWakeLock(sessionStatus === 'running');
  const [countdown, setCountdown] = useState(3);
  const [isSimulation, setIsSimulation] = useState(() => initialDraft?.isSimulation ?? false);

  // Métricas ao vivo inicializadas do rascunho se existente
  const [distanceKm, setDistanceKm] = useState(() => initialDraft?.distanceKm ?? 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(() => initialDraft?.elapsedSeconds ?? 0);
  const [currentPaceSeconds, setCurrentPaceSeconds] = useState(0);
  const [avgPaceSeconds, setAvgPaceSeconds] = useState(() => initialDraft?.avgPaceSeconds ?? 0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [calories, setCalories] = useState(() => initialDraft?.calories ?? 0);
  const [elevationGainM, setElevationGainM] = useState(() => initialDraft?.elevationGainM ?? 0);
  const [coordinates, setCoordinates] = useState(() => initialDraft?.coordinates ?? []);
  const [splits, setSplits] = useState(() => initialDraft?.splits ?? []); // [{ km: 1, durationSeconds: 312, pace: "5'12\"" }]

  // GPS Sensor Status
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // Em metros
  const [gpsError, setGpsError] = useState(null);

  // Histórico e Modal de Compartilhamento
  const [runsHistory, setRunsHistory] = useState(() => getRunsHistory());
  const [selectedRunForShare, setSelectedRunForShare] = useState(null);
  const [lastCompletedRun, setLastCompletedRun] = useState(null);

  // Refs de controle de tempo e geolocalização
  const timerIntervalRef = useRef(null);
  const simIntervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastCoordRef = useRef(null);
  const currentKmStartSecondsRef = useRef(0);
  const simStepRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const countdownIntervalRef = useRef(null);
  const justResumedRef = useRef(false);

  // Manter ref sincronizada sem disparar re-render do watcher de GPS
  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  // Se montou com rascunho recuperado, restaura refs necessárias
  useEffect(() => {
    if (initialDraft && (initialDraft.sessionStatus === 'running' || initialDraft.sessionStatus === 'paused')) {
      if (initialDraft.coordinates && initialDraft.coordinates.length > 0) {
        lastCoordRef.current = initialDraft.coordinates[initialDraft.coordinates.length - 1];
      }
      simStepRef.current = initialDraft.coordinates?.length || 0;
      if (initialDraft.splits && initialDraft.splits.length > 0) {
        const lastSplitTime = initialDraft.splits.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
        currentKmStartSecondsRef.current = lastSplitTime;
      }
      return;
    }

    // Hidratação assíncrona do IndexedDB se não havia rascunho legado no LocalStorage
    getRunDraftFromIDB().then((draft) => {
      if (draft && (draft.sessionStatus === 'running' || draft.sessionStatus === 'paused')) {
        setSessionStatus('paused');
        setDistanceKm(draft.distanceKm ?? 0);
        setElapsedSeconds(draft.elapsedSeconds ?? 0);
        setAvgPaceSeconds(draft.avgPaceSeconds ?? 0);
        setCalories(draft.calories ?? 0);
        setElevationGainM(draft.elevationGainM ?? 0);
        setCoordinates(draft.coordinates ?? []);
        setSplits(draft.splits ?? []);
        setIsSimulation(draft.isSimulation ?? false);
        if (draft.coordinates && draft.coordinates.length > 0) {
          lastCoordRef.current = draft.coordinates[draft.coordinates.length - 1];
        }
        simStepRef.current = draft.coordinates?.length || 0;
        if (draft.splits && draft.splits.length > 0) {
          const lastSplitTime = draft.splits.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
          currentKmStartSecondsRef.current = lastSplitTime;
        }
      }
    });
  }, [initialDraft]);

  // Limpeza geral ao desmontar componente
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      if (watchIdRef.current && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Totais Acumulados
  const totalKmsAccumulated = runsHistory.reduce((acc, r) => acc + (Number(r.distanceKm) || 0), 0);
  const totalRunsCount = runsHistory.length;

  // Atualizar lista de histórico
  const reloadHistory = () => {
    setRunsHistory(getRunsHistory());
  };

  // Sincronizar corridas com o Supabase quando o usuário estiver autenticado
  useEffect(() => {
    let active = true;
    if (user && user.id && user.id !== 'guest-local-user') {
      syncUserRunsFromSupabase(user.id)
        .then((merged) => {
          if (active && Array.isArray(merged) && merged.length > 0) {
            setRunsHistory(merged);
            setIsCloudSynced(true);
          }
        })
        .catch((err) => {
          console.warn('Sincronização de corridas da nuvem indisponível:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [user?.id]);

  // 1. Cronômetro de Corrida (depende estritamente de sessionStatus para cadência precisa de 1s sem ser resetado)
  useEffect(() => {
    if (sessionStatus === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [sessionStatus]);

  // 1b. Cálculo Reativo e Estável do Pace Médio Geral (sem re-criar timer e sem side-effects impuros)
  useEffect(() => {
    if (distanceKm > 0.05 && elapsedSeconds > 0) {
      const avg = Math.round(elapsedSeconds / distanceKm);
      setAvgPaceSeconds(avg);
    }
  }, [elapsedSeconds, distanceKm]);

  // 1c. Salvar rascunho automaticamente a cada mudança enquanto em corrida ou em pausa
  useEffect(() => {
    if (sessionStatus === 'running' || sessionStatus === 'paused') {
      saveActiveRunDraft({
        sessionStatus,
        distanceKm,
        elapsedSeconds,
        avgPaceSeconds,
        calories,
        elevationGainM,
        coordinates,
        splits,
        isSimulation,
        timestamp: Date.now()
      });
    }
  }, [sessionStatus, distanceKm, elapsedSeconds, avgPaceSeconds, calories, elevationGainM, coordinates, splits, isSimulation]);

  // 2. Rastreamento GPS Real via navigator.geolocation (Estável, sem reiniciar a cada segundo)
  useEffect(() => {
    if (sessionStatus === 'running' && !isSimulation) {
      if (!('geolocation' in navigator)) {
        setTimeout(() => setGpsError('Geolocalização não suportada neste dispositivo.'), 0);
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, speed } = position.coords;
          setGpsAccuracy(Math.round(accuracy));
          setGpsError(null);

          const newCoord = {
            lat: latitude,
            lng: longitude,
            timestamp: position.timestamp || Date.now(),
            accuracy,
            altitude: altitude || 0
          };

          // Validar ponto com filtro de ruído
          if (isValidGpsPoint(newCoord, lastCoordRef.current)) {
            // Se acabou de retomar da pausa, atualiza o ponto de referência sem calcular delta da pausa
            if (justResumedRef.current) {
              lastCoordRef.current = newCoord;
              justResumedRef.current = false;
              setCoordinates((prev) => [...prev, newCoord]);
              return;
            }

            if (lastCoordRef.current) {
              const deltaMeters = haversineDistanceMeters(
                lastCoordRef.current.lat,
                lastCoordRef.current.lng,
                newCoord.lat,
                newCoord.lng
              );
              const deltaKm = deltaMeters / 1000;

              // Ignora ruído estático minúsculo (< 1.5 metros) para não inflar distância parado
              if (deltaMeters >= 1.5) {
                setDistanceKm((prevDist) => {
                  const updatedDist = prevDist + deltaKm;

                  // Checagem de Novo KM Concluído (Split)
                  const currentKmMark = Math.floor(updatedDist);
                  const prevKmMark = Math.floor(prevDist);
                  if (currentKmMark > prevKmMark && currentKmMark > 0) {
                    const splitTimeSec = elapsedSecondsRef.current - currentKmStartSecondsRef.current;
                    currentKmStartSecondsRef.current = elapsedSecondsRef.current;
                    const splitPace = formatPace(splitTimeSec);

                    setSplits((prevSplits) => [
                      ...prevSplits,
                      {
                        km: currentKmMark,
                        durationSeconds: splitTimeSec,
                        pace: splitPace
                      }
                    ]);
                    try { sound.playSuccess(); } catch {}
                    try { triggerHaptic(25); } catch {}
                    if (voiceEnabled) {
                      try { announceSplit(currentKmMark, splitTimeSec, splitPace); } catch {}
                    }
                  }

                  // Calorias
                  setCalories(calculateRunningCalories(updatedDist));
                  return updatedDist;
                });

                // Altimetria
                if (newCoord.altitude && lastCoordRef.current.altitude) {
                  const elevDiff = newCoord.altitude - lastCoordRef.current.altitude;
                  if (elevDiff > 0.5) {
                    setElevationGainM((prev) => Math.round(prev + elevDiff));
                  }
                }
              }

              // Ritmo Instantâneo (Pace) via delta de tempo
              const timeDeltaSec = (newCoord.timestamp - lastCoordRef.current.timestamp) / 1000;
              if (timeDeltaSec > 0 && deltaKm > 0) {
                const instantPaceSec = Math.round(timeDeltaSec / deltaKm);
                if (instantPaceSec >= 120 && instantPaceSec <= 1200) {
                  setCurrentPaceSeconds(instantPaceSec);
                }
              }
            }

            // Velocidade direta do sensor GNSS do smartphone (alta fidelidade)
            if (speed !== null && speed !== undefined && speed >= 0) {
              setSpeedKmh(Number((speed * 3.6).toFixed(1)));
              if (speed > 0.6) {
                const instantFromGps = Math.round(1000 / speed);
                if (instantFromGps >= 120 && instantFromGps <= 1200) {
                  setCurrentPaceSeconds(instantFromGps);
                }
              }
            }

            lastCoordRef.current = newCoord;
            setCoordinates((prev) => [...prev, newCoord]);
          }
        },
        (err) => {
          console.warn('Erro de GPS:', err.message);
          setGpsError('Sinal de GPS fraco ou permissão pendente.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    } else {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation]);

  // 3. Simulação Realista (Para testes rápidos ou corrida em passadeira)
  useEffect(() => {
    if (sessionStatus === 'running' && isSimulation) {
      // Se ainda não temos ponto de partida, gerar o primeiro
      if (!lastCoordRef.current) {
        const startCoord = generateSimulatedStep(0, null, null);
        lastCoordRef.current = startCoord;
        setCoordinates([startCoord]);
      }

      simIntervalRef.current = setInterval(() => {
        simStepRef.current += 1;
        const newCoord = generateSimulatedStep(
          simStepRef.current,
          lastCoordRef.current,
          null
        );

        if (lastCoordRef.current) {
          const deltaMeters = haversineDistanceMeters(
            lastCoordRef.current.lat,
            lastCoordRef.current.lng,
            newCoord.lat,
            newCoord.lng
          );
          // Adiciona incremento realista (~3.2 metros por segundo = ~11.5 km/h)
          const effectiveMeters = Math.max(deltaMeters, 3.2);
          const deltaKm = effectiveMeters / 1000;

          setDistanceKm((prevDist) => {
            const updatedDist = prevDist + deltaKm;
            const currentKmMark = Math.floor(updatedDist);
            const prevKmMark = Math.floor(prevDist);

            if (currentKmMark > prevKmMark && currentKmMark > 0) {
              const splitTimeSec = elapsedSecondsRef.current - currentKmStartSecondsRef.current;
              currentKmStartSecondsRef.current = elapsedSecondsRef.current;
              const splitPace = formatPace(splitTimeSec || 312);

              setSplits((prevSplits) => [
                ...prevSplits,
                {
                  km: currentKmMark,
                  durationSeconds: splitTimeSec || 312,
                  pace: splitPace
                }
              ]);
              try { sound.playSuccess(); } catch {}
              try { triggerHaptic(20); } catch {}
              if (voiceEnabled) {
                try { announceSplit(currentKmMark, splitTimeSec || 312, splitPace); } catch {}
              }
            }

            setCalories(calculateRunningCalories(updatedDist));
            return updatedDist;
          });
        }

        lastCoordRef.current = newCoord;
        setCoordinates((prev) => [...prev, newCoord]);
        setCurrentPaceSeconds(315); // ~5:15 /km
        setSpeedKmh(11.4);
      }, 1000);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [sessionStatus, isSimulation]);

  // Contagem regressiva 3, 2, 1, VAI!
  const handleStartCountdown = () => {
    // Limpar qualquer rascunho anterior e resetar para início limpo
    clearActiveRunDraft();
    setDistanceKm(0);
    setElapsedSeconds(0);
    setCurrentPaceSeconds(0);
    setAvgPaceSeconds(0);
    setSpeedKmh(0);
    setCalories(0);
    setElevationGainM(0);
    setCoordinates([]);
    setSplits([]);
    lastCoordRef.current = null;
    currentKmStartSecondsRef.current = 0;
    simStepRef.current = 0;
    justResumedRef.current = false;

    setSessionStatus('countdown');
    setCountdown(3);
    try { unlockSpeechIOS(); } catch {}
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        try { sound.playTap(); } catch {}
        try { triggerHaptic(15); } catch {}
      } else {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setSessionStatus('running');
        try { sound.playStart(); } catch {}
        try { triggerHaptic(40); } catch {}
        if (voiceEnabled) {
          try { announceStart(); } catch {}
        }
      }
    }, 1000);
  };

  // Pular contagem regressiva e iniciar imediatamente
  const handleSkipCountdown = () => {
    try { unlockSpeechIOS(); } catch {}
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSessionStatus('running');
    try { sound.playStart(); } catch {}
    try { triggerHaptic(40); } catch {}
    if (voiceEnabled) {
      try { announceStart(); } catch {}
    }
  };

  // Pausar Corrida (congela velocidade e pace instantâneo sem afetar o tempo ou o pace médio acumulados)
  const handlePause = () => {
    setSessionStatus('paused');
    setSpeedKmh(0);
    setCurrentPaceSeconds(0);
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}
    if (voiceEnabled) {
      try { announcePause(); } catch {}
    }
  };

  // Retomar Corrida (estabelece nova âncora de GPS para evitar saltos ou distorções)
  const handleResume = () => {
    justResumedRef.current = true;
    setSessionStatus('running');
    try { sound.playTap(); } catch {}
    try { triggerHaptic(15); } catch {}
    if (voiceEnabled) {
      try { announceResume(); } catch {}
    }
  };

  // Finalizar e Salvar Corrida
  const handleFinishRun = () => {
    try { triggerHaptic(50); } catch {}
    try { sound.playVictory(); } catch {}

    clearActiveRunDraft();

    // Limpar timers imediatamente para congelar métricas exatas
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (watchIdRef.current && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Efeito de confetes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    const finalDistance = Number(distanceKm.toFixed(2));
    const finalSeconds = elapsedSeconds;
    const computedAvgPaceSec = avgPaceSeconds || (finalDistance > 0 ? Math.round(finalSeconds / finalDistance) : 0);
    const avgSpeed = finalDistance > 0 && finalSeconds > 0 
      ? Number((finalDistance / (finalSeconds / 3600)).toFixed(1))
      : 0;

    // Locução por voz de finalização nos fones
    if (voiceEnabled) {
      try { announceFinish(finalDistance, finalSeconds); } catch {}
    }

    const runRecord = {
      id: `run_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      distanceKm: finalDistance,
      durationSeconds: finalSeconds,
      avgPace: formatPace(computedAvgPaceSec),
      avgPaceSeconds: computedAvgPaceSec,
      calories: calories || calculateRunningCalories(finalDistance),
      avgSpeedKmh: avgSpeed,
      elevationGainM,
      splits,
      coordinates: coordinates.slice(0, 500), // Armazena coordenadas do trajeto
      isSimulation
    };

    saveRunRecord(runRecord);
    reloadHistory();

    // 1. Sincronização em Nuvem (Supabase PostgreSQL)
    if (user?.id && user.id !== 'guest-local-user') {
      syncRunToSupabase(runRecord, user.id)
        .then(() => {
          setIsCloudSynced(true);
        })
        .catch((err) => {
          console.warn('Erro ao salvar corrida na nuvem:', err);
        });
    }

    // 2. Avaliação de Conquistas & Medalhas Desbloqueadas
    try {
      const unlocked = evaluateAndUnlockBadges();
      if (unlocked && unlocked.length > 0) {
        setNewlyUnlockedBadge(unlocked[0]);
      }
    } catch (badgeErr) {
      console.warn('Erro ao avaliar conquistas:', badgeErr);
    }

    // Salva para exibição completa na aba pós-corrida
    setLastCompletedRun(runRecord);
    // Abre imediatamente o modal de compartilhamento Strava
    setSelectedRunForShare(runRecord);
    setSessionStatus('completed');
  };

  // Resetar após fechar resumo do treino ou descartar
  const handleResetSession = () => {
    clearActiveRunDraft();
    setSessionStatus('idle');
    setLastCompletedRun(null);
    setDistanceKm(0);
    setElapsedSeconds(0);
    setCurrentPaceSeconds(0);
    setAvgPaceSeconds(0);
    setSpeedKmh(0);
    setCalories(0);
    setElevationGainM(0);
    setCoordinates([]);
    setSplits([]);
    lastCoordRef.current = null;
    currentKmStartSecondsRef.current = 0;
    simStepRef.current = 0;
    justResumedRef.current = false;
  };

  // Eliminar corrida do histórico
  const handleDeleteRun = (e, runId) => {
    e.stopPropagation();
    if (window.confirm('Deseja eliminar este registo de corrida?')) {
      deleteRunRecord(runId);
      reloadHistory();
      triggerHaptic(15);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fadeIn pb-24">
      
      {/* 1. Header do AB Running Club */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-sky-500">
              AB FITNESS • RUNNING CLUB
            </span>
            {isCloudSynced && (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                <Cloud className="w-2.5 h-2.5" />
                Nuvem OK
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
            Running Club
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Rastreio GPS em tempo real, ritmo métrico e cartões de alta performance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle de Locução por Voz nos Fones */}
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              saveVoiceCuesPreference(next);
              triggerHaptic(10);
            }}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              voiceEnabled 
                ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' 
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
            }`}
            title={voiceEnabled ? 'Locução por voz ativada nos fones' : 'Locução por voz desativada'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Badges de Totais Acumulados */}
          <div className="text-right bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2 rounded-xl">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total ({totalRunsCount} {totalRunsCount === 1 ? 'sessão' : 'sessões'})
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums">
              {totalKmsAccumulated.toFixed(1)} <span className="text-[10px] text-sky-500 font-sans">KM</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. CONTAGEM REGRESSIVA 3.. 2.. 1.. */}
      {sessionStatus === 'countdown' && (
        <div 
          onClick={handleSkipCountdown}
          className="rounded-2xl bg-zinc-950 border border-sky-500/30 p-12 text-center flex flex-col items-center justify-center animate-scaleUp shadow-xl cursor-pointer"
        >
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            A PREPARAR...
          </span>
          <span className="text-7xl font-black text-white mt-2 tracking-tighter animate-pulse font-mono tabular-nums">
            {countdown}
          </span>
          <span className="text-xs text-zinc-400 mt-2">
            A calibrar o sinal GPS e a preparar o traçado
          </span>
          <span className="text-xs text-sky-400 mt-4 underline font-semibold">
            Tocar para iniciar imediatamente
          </span>
        </div>
      )}

      {/* 3. MODO AO VIVO (HUD DE CORRIDA ATIVA OU PAUSADA) */}
      {(sessionStatus === 'running' || sessionStatus === 'paused') && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
          
          {/* Mapa em Tempo Real (mantém o trajeto e corredor ativos mesmo em pausa) */}
          <div className="md:col-span-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <RunningMap 
              coordinates={coordinates} 
              splits={splits}
              isLive={sessionStatus === 'running' || sessionStatus === 'paused'} 
              isDark={isDark} 
              height="340px" 
            />
          </div>

          {/* Painel Principal de Métricas */}
          <div className="md:col-span-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 text-white shadow-xl relative overflow-hidden">
            {/* Status do GPS no topo */}
            <div className="flex items-center justify-between mb-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  isSimulation 
                    ? 'bg-amber-400' 
                    : (sessionStatus === 'running' ? 'bg-emerald-400' : 'bg-amber-400')
                } animate-pulse`} />
                <span className="font-bold text-zinc-300">
                  {isSimulation ? 'Simulação Ativa (Teste)' : `GPS Ativo (±${gpsAccuracy || 5}m)`}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider ${
                sessionStatus === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {sessionStatus === 'running' ? 'EM CORRIDA' : 'PAUSADO'}
              </span>
            </div>

            {/* Distância Gigante de Alta Visibilidade */}
            <div className="text-center py-2 bg-black/40 rounded-xl border border-zinc-800/60 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                Distância Percorrida
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-6xl font-black tracking-tighter text-white font-mono tabular-nums">
                  {distanceKm.toFixed(2)}
                </span>
                <span className="text-xl font-black text-sky-400 font-sans">
                  KM
                </span>
              </div>
            </div>

            {/* Grid 4 Métricas Técnicas */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Ritmo / Pace</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {sessionStatus === 'paused'
                    ? (avgPaceSeconds > 0 ? formatPace(avgPaceSeconds) : "--'--\"")
                    : formatPace(currentPaceSeconds || avgPaceSeconds)}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused' ? 'Pausado (Pace Médio)' : `Médio: ${formatPace(avgPaceSeconds)}`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Timer className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Tempo</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-[10px] text-zinc-400 block mt-0.5 font-mono tabular-nums">
                  {sessionStatus === 'paused' ? 'Treino Pausado' : `Velocidade: ${speedKmh} km/h`}
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Calorias</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                </span>
              </div>

              <div className="bg-black/50 p-3.5 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">Elevação</span>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  +{elevationGainM} <span className="text-xs font-normal text-zinc-400 font-sans">m</span>
                </span>
              </div>
            </div>

            {/* Splits / Parciais por KM com Barras Proporcionais e Destaque da Mais Rápida */}
            {splits.length > 0 && (() => {
              const minSec = Math.min(...splits.map(s => Number(s.durationSeconds) || 999999));
              const maxSec = Math.max(...splits.map(s => Number(s.durationSeconds) || 1));
              return (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Parciais por KM (Splits)
                    </span>
                    <span className="text-[9px] text-[#c6f432] font-semibold">
                      Ritmo Proporcional
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {splits.map((s) => {
                      const isFastest = (Number(s.durationSeconds) || 0) === minSec && splits.length > 1;
                      const barPct = maxSec > 0 ? Math.max(15, Math.min(100, (minSec / (Number(s.durationSeconds) || minSec)) * 100)) : 100;
                      return (
                        <div 
                          key={s.km}
                          className={`relative overflow-hidden py-1.5 px-3 rounded-lg border text-xs font-mono tabular-nums transition-colors ${
                            isFastest
                              ? 'bg-[#c6f432]/10 border-[#c6f432]/40 text-[#c6f432]'
                              : 'bg-black/40 border-zinc-800/80 text-zinc-200'
                          }`}
                        >
                          <div 
                            className={`absolute left-0 top-0 bottom-0 opacity-15 pointer-events-none ${
                              isFastest ? 'bg-[#c6f432]' : 'bg-sky-400'
                            }`}
                            style={{ width: `${barPct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${isFastest ? 'text-[#c6f432]' : 'text-sky-400'}`}>
                                KM {s.km}
                              </span>
                              {isFastest && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#c6f432]/20 text-[#c6f432] font-bold uppercase tracking-tighter">
                                  Mais rápido
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold">{s.paceStr || s.pace}</span>
                              <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Controles Principais de Corrida */}
            <div className="mt-5 pt-3 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center gap-3">
                {sessionStatus === 'running' ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSAR</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    className="flex-1 min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>RETOMAR</span>
                  </button>
                )}

                <button
                  onClick={handleFinishRun}
                  className="min-h-[48px] py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>CONCLUIR</span>
                </button>
              </div>

              {sessionStatus === 'paused' && (
                <button
                  onClick={() => {
                    if (window.confirm('Deseja descartar este treino? Os dados da sessão atual serão cancelados.')) {
                      handleResetSession();
                    }
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Descartar e Cancelar Treino
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. TELA DE PÓS-CORRIDA / RESUMO CELEBRATÓRIO (COMPLETED) */}
      {sessionStatus === 'completed' && lastCompletedRun && (
        <div className="space-y-4 animate-fadeIn pb-12">
          {/* Header de Celebração */}
          <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TREINO CONCLUÍDO • RUNNING CLUB
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Excelente Corrida, Atleta!
                </h2>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O seu percurso, ritmo médio e parciais foram guardados com sucesso no seu perfil do Running Club.
            </p>

            {/* Ações Rápidas no Topo */}
            <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRunForShare(lastCompletedRun);
                  triggerHaptic(15);
                }}
                className="w-full sm:flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>PARTILHAR CARTÃO (INSTAGRAM)</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic(15);
                  downloadGPX(lastCompletedRun.coordinates, `corrida_${lastCompletedRun.date?.split('T')[0] || 'ab_fitness'}`);
                }}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                title="Descarregar ficheiro GPX compatível com Strava e Garmin"
              >
                <Download className="w-4 h-4 text-[#c6f432]" />
                <span>Exportar GPX</span>
              </button>

              <button
                onClick={handleResetSession}
                className="w-full sm:w-auto min-h-[44px] py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span>Nova Corrida</span>
              </button>
            </div>
          </div>

          {/* Grid de Mapa e Estatísticas */}
          <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
            {/* Mapa do Percurso Percorrido */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Trajeto Oficial do Treino
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5">
                  <span className="flex items-center gap-1"><Satellite className="w-3 h-3 text-sky-400" /> Satélite HD</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-emerald-400" /> Chegada</span>
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-sm">
                <RunningMap 
                  coordinates={lastCompletedRun.coordinates} 
                  splits={lastCompletedRun.splits}
                  isLive={false} 
                  isDark={isDark} 
                  height="300px" 
                />
              </div>
            </div>

            {/* Painel de Estatísticas Finais */}
            <div className="md:col-span-6 p-5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl space-y-4">
              {/* Distância Gigante */}
              <div className="text-center py-3 bg-black/40 rounded-xl border border-zinc-800/60">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-0.5">
                  Distância Total
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black tracking-tighter text-white font-mono tabular-nums">
                    {Number(lastCompletedRun.distanceKm).toFixed(2)}
                  </span>
                  <span className="text-lg font-black text-sky-400 font-sans">
                    KM
                  </span>
                </div>
              </div>

              {/* Grid 4 Métricas */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ritmo Médio</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgPace}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Ritmo geral</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                    <Timer className="w-3.5 h-3.5 text-sky-400" />
                    <span>Tempo Total</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {formatDuration(lastCompletedRun.durationSeconds)}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Tempo decorrido</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>Calorias</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.calories} <span className="text-xs font-normal text-zinc-400 font-sans">kcal</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Energia queimada</span>
                </div>

                <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                    <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Velocidade</span>
                  </div>
                  <span className="text-xl font-black text-white font-mono tabular-nums">
                    {lastCompletedRun.avgSpeedKmh} <span className="text-xs font-normal text-zinc-400 font-sans">km/h</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 block">Média horária</span>
                </div>
              </div>

              {/* Splits / KM a KM */}
              {lastCompletedRun.splits && lastCompletedRun.splits.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Parciais por KM (Splits Registados)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {lastCompletedRun.splits.map((s) => (
                      <div 
                        key={s.km}
                        className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-black/40 border border-zinc-800/60 font-mono tabular-nums"
                      >
                        <span className="font-bold text-sky-400">KM {s.km}</span>
                        <span className="text-zinc-200">{s.pace}</span>
                        <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. TELA INICIAL (PRONTO PARA CORRER) */}
      {sessionStatus === 'idle' && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">
          
          {/* Card Principal: Iniciar Nova Corrida */}
          <div className="md:col-span-7 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2.5 rounded-xl bg-zinc-800 text-sky-400 border border-zinc-700/60">
                <Footprints className="w-5 h-5" />
              </span>

              {/* Botão de Alternar Simulação de Teste / Indoor */}
              <button
                onClick={() => {
                  setIsSimulation(!isSimulation);
                  triggerHaptic(10);
                }}
                className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                  isSimulation 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isSimulation ? 'Simulação Ativa (Teste)' : 'Simulação de Teste'}</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pronto para Correr?
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
              O GPS do seu telemóvel calcula distância, ritmo métrico e gera o mapa do seu percurso para partilhar nas redes sociais.
            </p>

            {gpsError && !isSimulation && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {gpsError} (Ative a permissão de localização do seu navegador ou ative o botão de Simulação).
              </div>
            )}

            {/* Botão de Começar Corrida */}
            <button
              onClick={handleStartCountdown}
              className="w-full min-h-[48px] py-4 px-6 rounded-xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INICIAR CORRIDA</span>
            </button>
          </div>

          {/* Histórico Recente de Corridas */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Corridas Concluídas ({runsHistory.length})
              </h3>
            </div>

            {runsHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-400 dark:text-zinc-500">
                <Footprints className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Nenhuma corrida registada ainda.</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Faça a sua primeira corrida para desbloquear cartões exclusivos de partilha!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runsHistory.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunForShare(run)}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center shrink-0">
                        <Footprints className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-900 dark:text-white font-mono tabular-nums">
                            {Number(run.distanceKm).toFixed(2)} km
                          </span>
                          {run.isSimulation && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Teste
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono tabular-nums">
                          <span>{run.avgPace}</span>
                          <span>•</span>
                          <span>{formatDuration(run.durationSeconds)}</span>
                          <span>•</span>
                          <span>{run.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão de Exportar GPX */}
                      {run.coordinates && run.coordinates.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic(12);
                            downloadGPX(run.coordinates, `corrida_${run.date?.split('T')[0] || 'ab_fitness'}`);
                          }}
                          className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#c6f432] transition-colors flex items-center justify-center cursor-pointer"
                          title="Exportar GPX para Strava / Garmin"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botão de Partilhar / Gerar Cartão */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunForShare(run);
                        }}
                        className="min-h-[36px] min-w-[36px] p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-sky-500 transition-colors flex items-center justify-center cursor-pointer"
                        title="Gerar Cartão para o Instagram"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Botão de Eliminar */}
                      <button
                        onClick={(e) => handleDeleteRun(e, run.id)}
                        className="min-h-[36px] min-w-[36px] p-2 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL DE COMPARTILHAMENTO ESTILO STRAVA */}
      {selectedRunForShare && (
        <RunningShareModal
          runData={selectedRunForShare}
          isOpen={!!selectedRunForShare}
          onClose={() => {
            setSelectedRunForShare(null);
          }}
        />
      )}

      {/* Toast de Conquista / Medalha Desbloqueada */}
      {newlyUnlockedBadge && (
        <BadgeUnlockedToast
          badge={newlyUnlockedBadge}
          onClose={() => setNewlyUnlockedBadge(null)}
        />
      )}

    </div>
  );
}
