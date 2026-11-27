import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import useMuscleRecovery from '../hooks/useMuscleRecovery';
import { getLocalConnections, getLocalBiometrics, computeReadinessIndex } from '../services/wearables/wearableManager';
import { triggerHaptic } from '../utils/audio';
import { setEaseModeToday, getEaseModeToday } from '../utils/dailyBriefing';
import { exerciseTargetsRegion } from '../data/muscleRegions';
import { getWorkoutHistory, getRunsHistory } from '../utils/storage';
import { computeWorkloadACWR } from '../utils/workloadAcwr';
import {
  getSubjectiveReadinessToday,
  saveSubjectiveReadinessToday,
  combineReadinessScores
} from '../utils/subjectiveReadiness';

/** Primeiro grupo fatigado (>=70%) que o treino de hoje ataca de facto — mesmo cruzamento
 * por região muscular usado em ActiveWorkout.jsx (fatigueWarning), para os dois nunca discordarem. */
function findTargetedFatigue(todayWorkout, muscles) {
  const exercises = Array.isArray(todayWorkout?.exercises) ? todayWorkout.exercises : [];
  if (exercises.length === 0) return null;
  const fatigued = Object.values(muscles || {}).filter((m) => m.status === 'fatigued');
  if (fatigued.length === 0) return null;
  return fatigued.find((m) =>
    exercises.some((ex) => exerciseTargetsRegion(ex, m.id))
  ) || null;
}

const CHECKIN_METRICS = [
  { key: 'sleep', label: 'Sono' },
  { key: 'energy', label: 'Energia' },
  { key: 'soreness', label: 'Corpo' }
];

/**
 * Briefing diário do AB Coach: cruza fadiga muscular, prontidão (wearable + check-in subjetivo)
 * e guardrail ACWR (carga aguda vs crónica) num único veredito acionável.
 */
export default function DailyBriefing({ todayWorkout }) {
  const fatigue = useMuscleRecovery();
  const [applied, setApplied] = useState(() => Boolean(getEaseModeToday()));
  const [subjective, setSubjective] = useState(() => getSubjectiveReadinessToday());
  const [showCheckin, setShowCheckin] = useState(false);
  const [draftCheckin, setDraftCheckin] = useState({ sleep: 3, energy: 3, soreness: 3 });

  const wearables = useMemo(() => {
    const conns = getLocalConnections();
    if (!conns || Object.keys(conns).length === 0) return null;
    const bios = getLocalBiometrics();
    return computeReadinessIndex({
      whoop: conns.whoop ? bios.whoop : null,
      fitbit: conns.fitbit ? bios.fitbit : null,
      strava: conns.strava ? bios.strava : null,
      garmin: conns.garmin ? bios.garmin : null
    });
  }, []);

  const acwr = useMemo(
    () => computeWorkloadACWR({ workouts: getWorkoutHistory(), runs: getRunsHistory() }),
    []
  );

  const targeted = useMemo(
    () => (fatigue.loading ? null : findTargetedFatigue(todayWorkout, fatigue.muscles)),
    [todayWorkout, fatigue]
  );

  if (fatigue.loading) return null;

  const wearablesStale = Boolean(wearables?.isStale);
  const freshWearableScore = !wearablesStale && typeof wearables?.score === 'number' ? wearables.score : null;
  const combinedReadiness = combineReadinessScores(freshWearableScore, subjective?.score ?? null);
  const readinessLow = combinedReadiness !== null && combinedReadiness < 55;
  const readinessModerate = combinedReadiness !== null && combinedReadiness >= 55 && combinedReadiness < 75;
  const acwrHigh = acwr.ready && acwr.status === 'high_risk';
  const acwrCaution = acwr.ready && acwr.status === 'caution';

  const shouldEase = acwrHigh || Boolean(targeted) || readinessLow;
  const attention = !shouldEase && (acwrCaution || readinessModerate || fatigue.readiness < 70);

  let headline;
  let detail;
  if (acwrHigh) {
    headline = acwr.headline;
    detail = acwr.detail;
  } else if (shouldEase) {
    headline = 'Hoje, vai com margem';
    detail = targeted
      ? `${targeted.label} ainda está em recuperação e o treino de hoje ataca-o diretamente.`
      : `Prontidão em ${combinedReadiness}% hoje — reduz o volume para recuperar melhor.`;
  } else if (acwrCaution) {
    headline = acwr.headline;
    detail = acwr.detail;
  } else if (attention) {
    headline = 'Treina normalmente, com atenção';
    detail = readinessModerate
      ? `Prontidão em ${combinedReadiness}% — mantém carga sólida, sem forçar recordes hoje.`
      : 'Fadiga moderada em geral — mantém a técnica antes da carga.';
  } else {
    headline = 'Pronto para ir a fundo';
    detail = combinedReadiness !== null
      ? `Prontidão em ${combinedReadiness}% e fadiga alinhada. Bom dia para progressão de carga.`
      : wearablesStale
        ? 'Sem leitura recente do wearable — recomendação baseada na recuperação muscular registada.'
        : 'Fadiga muscular e prontidão alinhadas. Bom dia para progressão de carga.';
  }

  const easeTargetId = acwrHigh || (!targeted && readinessLow) ? 'all' : targeted?.id || null;
  const easeButtonLabel = easeTargetId === 'all'
    ? 'Ativar modo proteção (−1 série hoje)'
    : 'Aplicar −1 série hoje nesse grupo';

  const applyEase = () => {
    if (!easeTargetId) return;
    triggerHaptic([12, 40, 12]);
    setEaseModeToday(easeTargetId);
    setApplied(true);
  };

  const handleSaveCheckin = () => {
    triggerHaptic(12);
    const saved = saveSubjectiveReadinessToday(draftCheckin);
    setSubjective(saved);
    setShowCheckin(false);
  };

  const accentBorder = acwrHigh
    ? 'border-rose-400'
    : shouldEase
      ? 'border-accent-hover'
      : attention
        ? 'border-zinc-500/70'
        : 'border-emerald-400/50';

  return (
    <div className={`pl-3.5 py-1 border-l-2 ${accentBorder} space-y-1.5`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-white leading-snug">{headline}</p>
        {acwr.ready && (
          <span
            className={`shrink-0 text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-full border ${
              acwrHigh
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                : acwrCaution
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-white/[0.04] border-white/[0.08] text-zinc-400'
            }`}
          >
            ACWR {acwr.ratio.toFixed(2)}×
          </span>
        )}
      </div>

      <p className="text-[12px] text-zinc-400 leading-relaxed">{detail}</p>

      {shouldEase && easeTargetId && (
        applied ? (
          <p className="text-[12px] font-semibold text-emerald-400 pt-0.5">
            Ajuste aplicado: o treino de hoje começa com 1 série a menos.
          </p>
        ) : (
          <button
            type="button"
            onClick={applyEase}
            className="inline-flex items-center gap-1 pt-0.5 text-[12px] font-semibold text-white hover:text-zinc-300 cursor-pointer"
          >
            {easeButtonLabel}
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )
      )}

      {!subjective && !showCheckin && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            setShowCheckin(true);
          }}
          className="block pt-0.5 text-[11px] font-medium text-zinc-400 hover:text-white cursor-pointer"
        >
          Como acordaste hoje? Fazer check-in rápido →
        </button>
      )}

      {showCheckin && (
        <div className="pt-2 space-y-2 max-w-sm">
          {CHECKIN_METRICS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-zinc-400 w-14">{label}</span>
              <div className="flex items-center gap-1 flex-1 justify-end">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      triggerHaptic(6);
                      setDraftCheckin((prev) => ({ ...prev, [key]: val }));
                    }}
                    className={`w-8 h-8 rounded-full text-xs font-semibold tabular-nums border cursor-pointer transition-colors ${
                      draftCheckin[key] === val
                        ? 'bg-accent text-white border-accent-hover'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveCheckin}
              className="px-3.5 py-1.5 rounded-full bg-primary text-app text-xs font-semibold cursor-pointer hover:bg-zinc-200"
            >
              Guardar prontidão
            </button>
            <button
              type="button"
              onClick={() => setShowCheckin(false)}
              className="px-3 py-1.5 rounded-full text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
