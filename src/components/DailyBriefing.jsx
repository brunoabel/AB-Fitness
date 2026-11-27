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
  {
    key: 'sleep',
    label: 'Sono',
    options: [
      { value: 1, text: 'Mal', tone: 'low' },
      { value: 3, text: 'Normal', tone: 'mid' },
      { value: 5, text: 'Bem', tone: 'high' }
    ]
  },
  {
    key: 'energy',
    label: 'Energia',
    options: [
      { value: 1, text: 'Baixa', tone: 'low' },
      { value: 3, text: 'Média', tone: 'mid' },
      { value: 5, text: 'Alta', tone: 'high' }
    ]
  },
  {
    key: 'soreness',
    label: 'Corpo',
    options: [
      { value: 1, text: 'Dolorido', tone: 'low' },
      { value: 3, text: 'Normal', tone: 'mid' },
      { value: 5, text: 'Fresco', tone: 'high' }
    ]
  }
];

const OPTION_ACTIVE_STYLE = {
  low: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
  mid: 'bg-accent/55 text-white border-accent-hover',
  high: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
};

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
      : `Prontidão em ${combinedReadiness}% hoje. Reduz o volume.`;
  } else if (acwrCaution) {
    headline = acwr.headline;
    detail = acwr.detail;
  } else if (attention) {
    headline = 'Treina normalmente, com atenção';
    detail = readinessModerate
      ? `Prontidão em ${combinedReadiness}%. Mantém a carga, sem forçar recordes.`
      : 'Fadiga moderada. Técnica antes da carga.';
  } else {
    headline = 'Pronto para ir a fundo';
    detail = combinedReadiness !== null
      ? `Prontidão em ${combinedReadiness}%. Bom dia para subir carga.`
      : wearablesStale
        ? 'Sem leitura recente do wearable. Baseado na recuperação muscular.'
        : 'Recuperação em dia. Bom dia para subir carga.';
  }

  const easeTargetId = acwrHigh || (!targeted && readinessLow) ? 'all' : targeted?.id || null;
  const easeButtonLabel = easeTargetId === 'all'
    ? 'Menos 1 série hoje'
    : 'Menos 1 série nesse grupo';

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
        {(acwrHigh || acwrCaution) && (
          <span
            className={`shrink-0 text-[11px] font-semibold tabular-nums ${acwrHigh ? 'text-rose-300' : 'text-amber-300'}`}
            title="Rácio de carga agudo:crónico (ACWR)"
          >
            Carga {acwr.ratio.toFixed(2).replace('.', ',')}×
          </span>
        )}
      </div>

      <p className="text-[12px] text-zinc-400 leading-relaxed">{detail}</p>

      {shouldEase && easeTargetId && (
        applied ? (
          <p className="text-[12px] font-semibold text-emerald-400 pt-0.5">
            Feito. Hoje tens 1 série a menos.
          </p>
        ) : (
          <button
            type="button"
            onClick={applyEase}
            className="inline-flex items-center gap-1 min-h-[44px] -my-2 text-[13px] font-semibold text-white hover:text-zinc-300 cursor-pointer touch-manipulation"
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
          className="inline-flex items-center gap-1 min-h-[44px] -my-2 text-[12px] font-medium text-zinc-400 hover:text-white cursor-pointer touch-manipulation"
        >
          Como acordaste hoje?
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      )}

      {showCheckin && (
        <div className="pt-2 space-y-2.5 max-w-sm">
          {CHECKIN_METRICS.map(({ key, label, options }) => (
            <div key={key} className="flex items-center justify-between gap-2.5">
              <span className="text-[12px] font-medium text-zinc-400 w-14 shrink-0">{label}</span>
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {options.map(({ value, text, tone }) => {
                  const selected = draftCheckin[key] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        triggerHaptic(6);
                        setDraftCheckin((prev) => ({ ...prev, [key]: value }));
                      }}
                      className={`min-h-[38px] px-2 rounded-full text-[12px] font-semibold border cursor-pointer touch-manipulation transition-colors ${
                        selected
                          ? OPTION_ACTIVE_STYLE[tone]
                          : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSaveCheckin}
              className="min-h-[44px] px-4 rounded-full bg-primary text-app text-xs font-semibold cursor-pointer hover:bg-zinc-200 active:scale-[0.98] transition-[background-color,transform] duration-150"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowCheckin(false)}
              className="min-h-[44px] px-3 rounded-full text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
