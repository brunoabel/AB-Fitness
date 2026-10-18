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
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import RunningMap from './RunningMap';
import RunningShareModal from './RunningShareModal';
import { 
  haversineDistanceMeters, 
  formatDuration, 
  formatPace, 
  calculateRunningCalories, 
  isValidGpsPoint,
  generateSimulatedStep 
} from '../utils/runningService';
import { getRunsHistory, saveRunRecord, deleteRunRecord } from '../utils/storage';
import { sound, triggerHaptic } from '../utils/audio';

export default function RunningHub({ isDark = true }) {
  // Estados da Sessão de Corrida: 'idle' | 'countdown' | 'running' | 'paused' | 'completed'
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [countdown, setCountdown] = useState(3);
  const [isSimulation, setIsSimulation] = useState(false);

  // Métricas ao vivo
  const [distanceKm, setDistanceKm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentPaceSeconds, setCurrentPaceSeconds] = useState(0);
  const [avgPaceSeconds, setAvgPaceSeconds] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [calories, setCalories] = useState(0);
  const [elevationGainM, setElevationGainM] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [splits, setSplits] = useState([]); // [{ km: 1, durationSeconds: 312, pace: "5'12\"" }]

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

  // Manter ref sincronizada sem disparar re-render do watcher de GPS
  useEffect(() => {
    elapsedSecondsRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

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

  // 1. Cronômetro de Corrida
  useEffect(() => {
    if (sessionStatus === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Calcular pace médio geral (segundos / km)
          if (distanceKm > 0.05) {
            const avgPace = Math.round(next / distanceKm);
            setAvgPaceSeconds(avgPace);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sessionStatus, distanceKm]);

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
            if (lastCoordRef.current) {
              const deltaMeters = haversineDistanceMeters(
                lastCoordRef.current.lat,
                lastCoordRef.current.lng,
                newCoord.lat,
                newCoord.lng
              );
              const deltaKm = deltaMeters / 1000;

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
                  sound.playSuccess();
                  triggerHaptic(25);
                }

                // Calorias e Velocidade
                setCalories(calculateRunningCalories(updatedDist));
                return updatedDist;
              });

              // Ritmo Instantâneo (Pace)
              const timeDeltaSec = (newCoord.timestamp - lastCoordRef.current.timestamp) / 1000;
              if (timeDeltaSec > 0 && deltaKm > 0) {
                const instantPaceSec = Math.round(timeDeltaSec / deltaKm);
                if (instantPaceSec >= 150 && instantPaceSec <= 1200) {
                  setCurrentPaceSeconds(instantPaceSec);
                }
              }

              // Altimetria
              if (newCoord.altitude && lastCoordRef.current.altitude) {
                const elevDiff = newCoord.altitude - lastCoordRef.current.altitude;
                if (elevDiff > 0.5) {
                  setElevationGainM((prev) => Math.round(prev + elevDiff));
                }
              }
            }

            // Atualiza velocidade
            if (speed !== null && speed !== undefined && speed >= 0) {
              setSpeedKmh(Number((speed * 3.6).toFixed(1)));
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
              setSplits((prevSplits) => [
                ...prevSplits,
                {
                  km: currentKmMark,
                  durationSeconds: 312,
                  pace: "5'12\" /km"
                }
              ]);
              try { sound.playSuccess(); } catch {}
              try { triggerHaptic(20); } catch {}
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
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }

    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [sessionStatus, isSimulation]);

  // Contagem regressiva 3, 2, 1, VAI!
  const handleStartCountdown = () => {
    setSessionStatus('countdown');
    setCountdown(3);
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
      }
    }, 1000);
  };

  // Pular contagem regressiva e iniciar imediatamente
  const handleSkipCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSessionStatus('running');
    try { sound.playStart(); } catch {}
    try { triggerHaptic(40); } catch {}
  };

  // Pausar Corrida
  const handlePause = () => {
    setSessionStatus('paused');
    sound.playTap();
    triggerHaptic(15);
  };

  // Retomar Corrida
  const handleResume = () => {
    setSessionStatus('running');
    sound.playTap();
    triggerHaptic(15);
  };

  // Finalizar e Salvar Corrida
  const handleFinishRun = () => {
    triggerHaptic(50);
    sound.playVictory();

    // Limpar timers imediatamente para congelar métricas exatas
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    if (watchIdRef.current) {
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

    // Salva para exibição completa na aba pós-corrida
    setLastCompletedRun(runRecord);
    // Abre imediatamente o modal de compartilhamento Strava
    setSelectedRunForShare(runRecord);
    setSessionStatus('completed');
  };

  // Resetar após fechar resumo do treino
  const handleResetSession = () => {
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
  };

  // Excluir corrida do histórico
  const handleDeleteRun = (e, runId) => {
    e.stopPropagation();
    if (window.confirm('Deseja excluir este registro de corrida?')) {
      deleteRunRecord(runId);
      reloadHistory();
      triggerHaptic(15);
    }
  };

  return (
    <div className="p-4 space-y-5 animate-fadeIn pb-24">
      
      {/* 1. Header do AB Running Club */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-sky-500">
              AB FITNESS • RUNNING CLUB
            </span>
          </div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight mt-0.5">
            Running Club
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Rastreio GPS em tempo real, ritmo e cards de alta performance.
          </p>
        </div>

        {/* Badges de Totais Acumulados */}
        <div className="text-right bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-2xl">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
            Total Corrido ({totalRunsCount} {totalRunsCount === 1 ? 'sessão' : 'sessões'})
          </span>
          <span className="text-sm font-black text-zinc-900 dark:text-white">
            {totalKmsAccumulated.toFixed(1)} <span className="text-[10px] text-sky-500">KM</span>
          </span>
        </div>
      </div>

      {/* 2. CONTAGEM REGRESSIVA 3.. 2.. 1.. */}
      {sessionStatus === 'countdown' && (
        <div 
          onClick={handleSkipCountdown}
          className="rounded-3xl bg-black border border-sky-500/30 p-12 text-center flex flex-col items-center justify-center animate-scaleUp shadow-2xl shadow-sky-500/10 cursor-pointer"
        >
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">
            PREPARAR...
          </span>
          <span className="text-7xl font-black text-white mt-2 tracking-tighter animate-pulse">
            {countdown}
          </span>
          <span className="text-xs text-zinc-400 mt-2">
            Calibrando GPS e preparando traçado
          </span>
          <span className="text-[10px] text-sky-400/80 mt-4 underline font-medium">
            Toque para começar já
          </span>
        </div>
      )}

      {/* 3. MODO AO VIVO (HUD DE CORRIDA ATIVA OU PAUSADA) */}
      {(sessionStatus === 'running' || sessionStatus === 'paused') && (
        <div className="space-y-4">
          
          {/* Mapa Google Maps em Tempo Real */}
          <RunningMap 
            coordinates={coordinates} 
            splits={splits}
            isLive={sessionStatus === 'running'} 
            isDark={isDark} 
            height="240px" 
          />

          {/* Painel Principal de Métricas Strava */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-5 text-white shadow-xl relative overflow-hidden">
            {/* Status do GPS no topo */}
            <div className="flex items-center justify-between mb-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSimulation ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                <span className="font-bold text-zinc-300">
                  {isSimulation ? 'Simulação Ativa (Teste)' : `GPS Ativo (±${gpsAccuracy || 5}m)`}
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                sessionStatus === 'running' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {sessionStatus === 'running' ? 'EM CORRIDA' : 'PAUSADO'}
              </span>
            </div>

            {/* Distância Gigante de Alta Visibilidade */}
            <div className="text-center py-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 block">
                Distância Percorrida
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-black tracking-tighter text-white font-mono">
                  {distanceKm.toFixed(2)}
                </span>
                <span className="text-xl font-black text-sky-400">
                  KM
                </span>
              </div>
            </div>

            {/* Grid 4 Métricas Esportivas */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80">
              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold text-[10px] uppercase">Ritmo / Pace</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  {formatPace(currentPaceSeconds || avgPaceSeconds)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Médio: {formatPace(avgPaceSeconds)}
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Timer className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-semibold text-[10px] uppercase">Tempo</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  {formatDuration(elapsedSeconds)}
                </span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">
                  Velocidade: {speedKmh} km/h
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-semibold text-[10px] uppercase">Calorias</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  {calories} <span className="text-xs font-bold text-zinc-400">kcal</span>
                </span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-[10px] uppercase">Elevação</span>
                </div>
                <span className="text-2xl font-black text-white font-mono">
                  +{elevationGainM} <span className="text-xs font-bold text-zinc-400">m</span>
                </span>
              </div>
            </div>

            {/* Splits / Parciais por KM */}
            {splits.length > 0 && (
              <div className="mt-4 pt-3 border-t border-zinc-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Parciais por KM (Splits)
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {splits.map((s) => (
                    <div 
                      key={s.km}
                      className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-black/40 border border-zinc-800/60 font-mono"
                    >
                      <span className="font-bold text-sky-400">KM {s.km}</span>
                      <span className="text-zinc-300">{s.pace}</span>
                      <span className="text-zinc-500">{formatDuration(s.durationSeconds)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controles Principais de Corrida */}
            <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center gap-3">
              {sessionStatus === 'running' ? (
                <button
                  onClick={handlePause}
                  className="flex-1 py-4 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>PAUSAR</span>
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="flex-1 py-4 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>RETOMAR</span>
                </button>
              )}

              <button
                onClick={handleFinishRun}
                className="py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>CONCLUIR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TELA DE PÓS-CORRIDA / RESUMO CELEBRATÓRIO (COMPLETED) */}
      {sessionStatus === 'completed' && lastCompletedRun && (
        <div className="space-y-4 animate-fadeIn pb-12">
          {/* Header de Celebração */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-emerald-500/30 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  TREINO CONCLUÍDO • STRAVA ENGINE
                </span>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Excelente Corrida, Atleta! 🏆
                </h2>
              </div>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O seu percurso, ritmo médio e parciais foram salvos com sucesso no seu perfil do Running Club.
            </p>

            {/* Ações Rápidas no Topo */}
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setSelectedRunForShare(lastCompletedRun);
                  triggerHaptic(15);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:opacity-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>PARTILHAR (CARD INSTAGRAM)</span>
              </button>

              <button
                onClick={handleResetSession}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span>Nova Corrida</span>
              </button>
            </div>
          </div>

          {/* Mapa do Percurso Percorrido */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                Trajeto Oficial do Treino
              </span>
              <span className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                <span>🛰️ Satélite HD</span>
                <span>•</span>
                <span>🏁 Chegada</span>
              </span>
            </div>
            <RunningMap 
              coordinates={lastCompletedRun.coordinates} 
              splits={lastCompletedRun.splits}
              isLive={false} 
              isDark={isDark} 
              height="260px" 
            />
          </div>

          {/* Painel de Estatísticas Finais */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 text-white shadow-xl space-y-4">
            {/* Distância Gigante */}
            <div className="text-center py-2 bg-black/40 rounded-2xl border border-zinc-800/60">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                Distância Total
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black tracking-tighter text-white font-mono">
                  {Number(lastCompletedRun.distanceKm).toFixed(2)}
                </span>
                <span className="text-lg font-black text-sky-400">
                  KM
                </span>
              </div>
            </div>

            {/* Grid 4 Métricas */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                  <Zap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ritmo Médio</span>
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {lastCompletedRun.avgPace}
                </span>
                <span className="text-[10px] text-zinc-500 block">Ritmo geral</span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                  <Timer className="w-3.5 h-3.5 text-sky-400" />
                  <span>Tempo Total</span>
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {formatDuration(lastCompletedRun.durationSeconds)}
                </span>
                <span className="text-[10px] text-zinc-500 block">Tempo decorrido</span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Calorias</span>
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {lastCompletedRun.calories} <span className="text-xs font-normal text-zinc-400">kcal</span>
                </span>
                <span className="text-[10px] text-zinc-500 block">Energia queimada</span>
              </div>

              <div className="bg-black/50 p-3 rounded-2xl border border-zinc-800/80">
                <div className="flex items-center gap-1 text-zinc-400 text-[10px] uppercase font-bold mb-1">
                  <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Velocidade</span>
                </div>
                <span className="text-xl font-black text-white font-mono">
                  {lastCompletedRun.avgSpeedKmh} <span className="text-xs font-normal text-zinc-400">km/h</span>
                </span>
                <span className="text-[10px] text-zinc-500 block">Média horária</span>
              </div>
            </div>

            {/* Splits / KM a KM */}
            {lastCompletedRun.splits && lastCompletedRun.splits.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                  Parciais por KM (Splits Registrados)
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {lastCompletedRun.splits.map((s) => (
                    <div 
                      key={s.km}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-black/40 border border-zinc-800/60 font-mono"
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
      )}

      {/* 5. TELA INICIAL (PRONTO PARA CORRER) */}
      {sessionStatus === 'idle' && (
        <div className="space-y-4">
          
          {/* Card Principal: Iniciar Nova Corrida */}
          <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Footprints className="w-5 h-5" />
              </span>

              {/* Botão de Alternar Simulação de Teste / Indoor */}
              <button
                onClick={() => {
                  setIsSimulation(!isSimulation);
                  triggerHaptic(10);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                  isSimulation 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isSimulation ? 'Simulação Ativa (Teste)' : 'Simulação de Teste'}</span>
              </button>
            </div>

            <h2 className="text-xl font-black tracking-tight text-white">
              Pronto para Correr?
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
              O GPS do seu telemóvel irá calcular distância, ritmo médio e gerar o mapa do seu percurso para compartilhar nas redes sociais.
            </p>

            {gpsError && !isSimulation && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {gpsError} (Ative a permissão de localização do seu navegador ou ative o botão de Simulação).
              </div>
            )}

            {/* Botão Gigante de Começar Corrida */}
            <button
              onClick={handleStartCountdown}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400 hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2.5 shadow-xl shadow-sky-500/30 active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>INICIAR CORRIDA</span>
            </button>
          </div>

          {/* Histórico Recente de Corridas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Corridas Concluídas ({runsHistory.length})
              </h3>
            </div>

            {runsHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-400 dark:text-zinc-500">
                <Footprints className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium">Nenhuma corrida registrada ainda.</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Faça a sua primeira corrida para desbloquear cards exclusivos de partilha!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runsHistory.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunForShare(run)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between hover:border-sky-500/50 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
                        <Footprints className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-zinc-900 dark:text-white">
                            {Number(run.distanceKm).toFixed(2)} km
                          </span>
                          {run.isSimulation && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Teste
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
                          <span>{run.avgPace}</span>
                          <span>•</span>
                          <span>{formatDuration(run.durationSeconds)}</span>
                          <span>•</span>
                          <span>{run.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão de Compartilhar / Gerar Card */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunForShare(run);
                        }}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-sky-500 transition-colors"
                        title="Gerar Card para o Instagram"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Botão de Excluir */}
                      <button
                        onClick={(e) => handleDeleteRun(e, run.id)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Excluir"
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

    </div>
  );
}
