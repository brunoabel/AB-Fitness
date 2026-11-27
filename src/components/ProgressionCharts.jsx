import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { isBeginnerProfile } from './onboarding/profileSchema';
import { e1RM } from '../utils/strengthMetrics';
import { getWorkoutHistory, getRunsHistory } from '../utils/storage';
import { getCatalogEntry } from '../data/exerciseMedia';
import { regionsForExercise, MUSCLE_REGIONS } from '../data/muscleRegions';
import { parseSessionTime } from '../utils/muscleFatigue';
import { computeWorkloadACWR } from '../utils/workloadAcwr';

/**
 * Constrói histórico real de progressão por exercício a partir das sessões gravadas.
 * Formato: { [exerciseId]: { name, splitGroup, unit: 'kg', sessions: [{ date, weight, reps, estimated1RM }], initialWeight, currentWeight, gainPercent } }
 */
export function buildRealProgression(history = []) {
  if (!Array.isArray(history) || history.length === 0) return {};

  const sortedHistory = [...history].sort((a, b) => parseSessionTime(a) - parseSessionTime(b));

  const map = {};

  for (const session of sortedHistory) {
    const exercisesData = session.exercisesData || {};
    const ts = parseSessionTime(session);
    const dateStr = session.date || (ts > 0 ? new Date(ts).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }) : 'Treino');

    for (const [rawExId, sets] of Object.entries(exercisesData)) {
      if (!Array.isArray(sets) || sets.length === 0) continue;

      const workingSets = sets.filter(s => (s.done || s.completed) && s.type !== 'W' && Number(s.weight) > 0);
      if (workingSets.length === 0) continue;

      let bestSet = workingSets[0];
      for (const s of workingSets) {
        const sw = Number(s.weight) || 0;
        const sr = Number(s.reps) || 0;
        const bw = Number(bestSet.weight) || 0;
        const br = Number(bestSet.reps) || 0;
        if (sw > bw || (sw === bw && sr > br)) {
          bestSet = s;
        }
      }

      const weight = Number(bestSet.weight) || 0;
      const reps = Number(bestSet.reps) || 0;
      if (weight <= 0) continue;

      const calc1RM = e1RM(weight, reps) || (reps > 0 ? Math.round(weight * (1 + reps / 30) * 10) / 10 : weight);
      const catalogEntry = getCatalogEntry(rawExId);
      const exKey = catalogEntry?.id || rawExId;
      const exName = catalogEntry?.name || rawExId.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const splitGroup = catalogEntry?.primary_muscle || session.targetGroup || 'Geral';

      if (!map[exKey]) {
        map[exKey] = {
          name: exName,
          splitGroup,
          unit: 'kg',
          sessions: []
        };
      }

      map[exKey].sessions.push({
        date: dateStr,
        weight,
        reps,
        estimated1RM: calc1RM
      });
    }
  }

  for (const exKey of Object.keys(map)) {
    const ex = map[exKey];
    if (ex.sessions.length > 0) {
      ex.initialWeight = ex.sessions[0].weight;
      ex.currentWeight = ex.sessions[ex.sessions.length - 1].weight;
      const diff = ex.currentWeight - ex.initialWeight;
      const pct = ex.initialWeight > 0 ? ((diff / ex.initialWeight) * 100).toFixed(1) : '0.0';
      ex.gainPercent = diff >= 0 ? `+${pct}%` : `${pct}%`;
    }
  }

  return map;
}

/**
 * Agrega o volume de séries efetivas dos últimos 7 dias por região muscular.
 */
export function computeWeeklyVolumeByMuscle(history = []) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = (history || []).filter(s => parseSessionTime(s) >= oneWeekAgo);

  const volumeMap = {};
  for (const reg of MUSCLE_REGIONS) {
    volumeMap[reg.id] = 0;
  }

  for (const s of recent) {
    const exercisesData = s.exercisesData || {};
    for (const [exId, sets] of Object.entries(exercisesData)) {
      if (!Array.isArray(sets)) continue;
      const hardSetsCount = sets.filter(st => (st.completed || st.done) && st.type !== 'W' && Number(st.reps) > 0).length;
      if (hardSetsCount === 0) continue;

      const entry = getCatalogEntry(exId);
      const regions = regionsForExercise(entry);
      for (const { region, weight } of regions) {
        volumeMap[region] = (volumeMap[region] || 0) + hardSetsCount * weight;
      }
    }
  }

  return volumeMap;
}

export default function ProgressionCharts() {
  const isSimpleMode = isBeginnerProfile(getLocalFitnessProfile());
  const history = useMemo(() => getWorkoutHistory(), []);
  const runsHistory = useMemo(() => getRunsHistory(), []);
  const progressionData = useMemo(() => buildRealProgression(history), [history]);
  const weeklyVolume = useMemo(() => computeWeeklyVolumeByMuscle(history), [history]);
  const acwr = useMemo(() => computeWorkloadACWR({ workouts: history, runs: runsHistory }), [history, runsHistory]);

  const exerciseKeys = useMemo(() => Object.keys(progressionData), [progressionData]);
  const defaultExKey = useMemo(
    () => exerciseKeys.find((k) => progressionData[k].sessions.length >= 2) || exerciseKeys[0] || '',
    [exerciseKeys, progressionData]
  );
  const [selectedExKey, setSelectedExKey] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeExKey = (selectedExKey && progressionData[selectedExKey]) 
    ? selectedExKey 
    : defaultExKey;

  const currentEx = activeExKey ? progressionData[activeExKey] : null;
  const sessions = currentEx?.sessions || [];
  const hasEnoughData = sessions.length >= 2;

  // Parâmetros do gráfico SVG
  const chartWidth = 340;
  const chartHeight = 150;
  const paddingX = 25;
  const paddingTop = 20;
  const paddingBottom = 30;

  let points = [];
  let linePath = '';
  let areaPath = '';

  if (hasEnoughData) {
    const weights = sessions.map(s => s.weight);
    const minW = Math.max(0, Math.min(...weights) - 5);
    const maxW = Math.max(...weights) + 5;
    const range = maxW - minW || 1;

    points = sessions.map((s, idx) => {
      const x = paddingX + (idx / (sessions.length - 1)) * (chartWidth - paddingX * 2);
      const y = paddingTop + (1 - (s.weight - minW) / range) * (chartHeight - paddingTop - paddingBottom);
      return { ...s, x, y };
    });

    linePath = points.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
    }, '');

    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;
  }

  const activeVolumeRegions = useMemo(() => {
    return MUSCLE_REGIONS
      .map(r => ({ ...r, sets: Math.round((weeklyVolume[r.id] || 0) * 10) / 10 }))
      .filter(r => r.sets > 0)
      .sort((a, b) => b.sets - a.sets);
  }, [weeklyVolume]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. VISUALIZAÇÃO DE SOBRECARGA PROGRESSIVA POR EXERCÍCIO */}
      <div className="pt-1 space-y-4">
        
        {/* Cabeçalho e Seletor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-300" />
              <span>{currentEx?.splitGroup || 'Sobrecarga Real'}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {currentEx?.name || 'Progressão de Cargas'}
            </h3>
          </div>

          {exerciseKeys.length > 0 && (
            <select
              value={activeExKey}
              onChange={(e) => {
                setSelectedExKey(e.target.value);
                setHoveredPoint(null);
                triggerHaptic(10);
              }}
              className="min-h-[44px] sm:min-h-[38px] px-4 py-2 sm:py-1.5 rounded-full bg-surface text-zinc-100 text-xs font-semibold border border-white/[0.1] focus:border-accent-hover outline-none cursor-pointer max-w-xs truncate transition-colors"
            >
              {exerciseKeys.map((key) => (
                <option key={key} value={key} className="bg-zinc-950 text-white">
                  {progressionData[key]?.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Estado com Dados Suficientes (>= 2 sessões) */}
        {hasEnoughData ? (
          <>
            {/* Ledger Editorial de Métricas */}
            <div className="grid grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.08] py-3">
              <div className="pr-3">
                <span className="text-[11px] text-zinc-400 block">Carga Inicial</span>
                <span className="text-sm font-bold font-display tabular-nums text-white mt-0.5 block">
                  {currentEx.initialWeight} kg
                </span>
              </div>

              <div className="px-3">
                <span className="text-[11px] text-zinc-400 block">Carga Atual</span>
                <span className="text-sm font-bold font-display tabular-nums text-white mt-0.5 block">
                  {currentEx.currentWeight} kg
                </span>
              </div>

              <div className="pl-3">
                <span className="text-[11px] text-emerald-400 block">Ganho Total</span>
                <span className="text-sm font-bold font-display tabular-nums text-emerald-400 flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {currentEx.gainPercent}
                </span>
              </div>
            </div>

            {/* Gráfico SVG */}
            <div className="relative pt-2">
              <svg 
                className="w-full h-44 overflow-visible" 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B4A7A" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#2B4A7A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line x1={paddingX} y1={paddingTop} x2={chartWidth - paddingX} y2={paddingTop} stroke="currentColor" className="text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="currentColor" className="text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={paddingX} y1={chartHeight - paddingBottom} x2={chartWidth - paddingX} y2={chartHeight - paddingBottom} stroke="currentColor" className="text-zinc-800" strokeWidth="1" />

                <path d={areaPath} fill="url(#areaGrad)" />

                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-white"
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />

                {points.map((pt, i) => {
                  const isHovered = hoveredPoint === i;
                  return (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 3.5}
                        className="fill-app stroke-white cursor-pointer transition-[r,stroke-width] duration-150"
                        strokeWidth={isHovered ? 2.5 : 2}
                        onMouseEnter={() => setHoveredPoint(i)}
                        onTouchStart={() => setHoveredPoint(i)}
                      />
                      <text
                        x={pt.x}
                        y={chartHeight - 12}
                        textAnchor="middle"
                        className="text-[11px] tabular-nums fill-zinc-400 font-medium"
                      >
                        {pt.date}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredPoint !== null && points[hoveredPoint] && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-surface-2 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-accent-hover animate-fadeIn whitespace-nowrap"
                >
                  <span className="tabular-nums text-zinc-300">{points[hoveredPoint].date}:</span>
                  <span className="font-bold font-display tabular-nums">
                    {points[hoveredPoint].weight} kg
                  </span>
                  <span className="text-[11px] text-zinc-300 tabular-nums">
                    ({points[hoveredPoint].reps} reps{!isSimpleMode ? ` · 1RM ~${points[hoveredPoint].estimated1RM} kg` : ''})
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/[0.06]">
              <span className="flex items-center gap-1 font-medium">
                {isSimpleMode ? (
                  <>
                    Maior Carga Registada:{' '}
                    <strong className="font-display tabular-nums text-white font-bold">
                      {Math.max(...sessions.map((s) => s.weight))} kg
                    </strong>
                  </>
                ) : (
                  <>
                    1RM Máximo Estimado:{' '}
                    <strong className="font-display tabular-nums text-white font-bold">
                      {Math.max(...sessions.map((s) => s.estimated1RM))} kg
                    </strong>
                  </>
                )}
              </span>
              <span className="text-[11px]">Toque nos pontos para detalhes</span>
            </div>
          </>
        ) : (
          /* Estado Vazio Elegante (<2 sessões) */
          <div className="py-10 text-center space-y-3 border-t border-white/[0.06]">
            <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-zinc-400">
              <Dumbbell className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white">
                {exerciseKeys.length === 0 ? 'Sem treinos registados' : 'Sessões insuficientes'}
              </h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                {exerciseKeys.length === 0
                  ? 'Completa os teus treinos no AB Fitness para gerar a progressão de cargas real.'
                  : sessions.length === 1
                    ? 'Tens 1 sessão registada deste exercício. Regista mais uma para traçar a curva de sobrecarga.'
                    : 'Conclui pelo menos 2 sessões para gerar a curva de progressão e 1RM.'}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 2. VOLUME SEMANAL REAL POR GRUPO MUSCULAR */}
      <div className="pt-6 border-t border-white/[0.06] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            <h4 className="text-sm font-semibold text-white">Volume Semanal Real</h4>
          </div>
          <span className="text-[11px] text-zinc-400">Últimos 7 dias</span>
        </div>

        {activeVolumeRegions.length > 0 ? (
          <div className="space-y-3 pt-1">
            {activeVolumeRegions.map((reg, index) => {
              const maxDisplay = 20; // Alvo ótimo de 10-20 séries/semana
              const pct = Math.min(100, Math.round((reg.sets / maxDisplay) * 100));
              return (
                <div key={reg.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{reg.label}</span>
                    <span className="tabular-nums font-semibold text-white">
                      {reg.sets} <span className="text-[10px] text-zinc-500 font-normal">séries</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        index === 0 ? 'bg-white' : 'bg-accent-hover'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-zinc-500">
            Nenhuma série efetiva registada nos últimos 7 dias.
          </div>
        )}
      </div>

      {/* 3. GUARDRAIL DE CARGA AGUDA VS. CRÓNICA (ACWR) */}
      <div className="pt-6 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-white">Carga Aguda vs. Crónica (ACWR)</h4>
            <p className="text-[11px] text-zinc-400">Prevenção de sobrecarga (7d vs média 28d · força + corrida)</p>
          </div>
          {acwr.ready ? (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums border ${
                acwr.status === 'high_risk'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : acwr.status === 'caution'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : acwr.status === 'sweet_spot'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-white/[0.05] border-white/[0.1] text-zinc-300'
              }`}
            >
              {acwr.ratio.toFixed(2)}× · {acwr.label}
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500">A calibrar</span>
          )}
        </div>

        {acwr.ready ? (
          <div className="space-y-2.5">
            <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
              {/* Zona ótima 0.80–1.30 numa escala 0..2.0 */}
              <div
                aria-hidden
                className="absolute top-0 bottom-0 bg-emerald-500/25"
                style={{ left: '40%', width: '25%' }}
              />
              <div
                className={`absolute top-0 bottom-0 w-1.5 rounded-full -translate-x-1/2 ${
                  acwr.status === 'high_risk'
                    ? 'bg-rose-400'
                    : acwr.status === 'caution'
                      ? 'bg-amber-400'
                      : 'bg-white'
                }`}
                style={{ left: `${Math.min(98, Math.max(2, (acwr.ratio / 2) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 tabular-nums">
              <span>Aguda 7d: <strong className="text-white">{acwr.acuteLoad} AU</strong></span>
              <span>Crónica 28d: <strong className="text-white">{acwr.chronicLoad} AU/sem</strong></span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{acwr.detail}</p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">{acwr.detail}</p>
        )}
      </div>
    </div>
  );
}
