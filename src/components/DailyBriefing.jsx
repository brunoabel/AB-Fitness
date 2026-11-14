import React, { useMemo, useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import useMuscleRecovery from '../hooks/useMuscleRecovery';
import { getLocalConnections, getLocalBiometrics, computeReadinessIndex } from '../services/wearables/wearableManager';
import { triggerHaptic } from '../utils/audio';
import { setEaseModeToday, getEaseModeToday } from '../utils/dailyBriefing';

const normalize = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Primeiro grupo fatigado (>=70%) que o treino de hoje ataca de facto — mesmo cruzamento
 * texto-a-texto já usado em ActiveWorkout.jsx (fatigueWarning), para os dois nunca discordarem. */
function findTargetedFatigue(todayWorkout, muscles) {
  const exercises = Array.isArray(todayWorkout?.exercises) ? todayWorkout.exercises : [];
  if (exercises.length === 0) return null;
  const fatigued = Object.values(muscles || {}).filter((m) => m.status === 'fatigued');
  if (fatigued.length === 0) return null;
  return fatigued.find((m) =>
    exercises.some((ex) => normalize(`${ex.target || ''} ${ex.secondary || ''}`).includes(normalize(m.id)))
  ) || null;
}

/**
 * Briefing diário do AB Coach: cruza a fadiga muscular (local ou da nuvem) com a prontidão dos
 * wearables (quando ligados) num único veredito, em vez de o atleta ter de juntar os dois
 * sinais por conta própria. Quando o músculo que o treino de hoje ataca ainda está fatigado,
 * oferece um ajuste de verdade (−1 série) em vez de só mostrar o dado.
 */
export default function DailyBriefing({ todayWorkout }) {
  const fatigue = useMuscleRecovery();
  const [applied, setApplied] = useState(() => Boolean(getEaseModeToday()));

  const wearables = useMemo(() => {
    const conns = getLocalConnections();
    if (!conns || Object.keys(conns).length === 0) return null;
    const bios = getLocalBiometrics();
    return computeReadinessIndex({ whoop: conns.whoop ? bios.whoop : null, fitbit: conns.fitbit ? bios.fitbit : null });
  }, []);

  const targeted = useMemo(
    () => (fatigue.loading ? null : findTargetedFatigue(todayWorkout, fatigue.muscles)),
    [todayWorkout, fatigue]
  );

  if (fatigue.loading) return null;

  const wearablesStale = Boolean(wearables?.isStale);
  const wearablesLow = !wearablesStale && wearables?.status === 'recovery';
  const wearablesModerate = !wearablesStale && wearables?.status === 'moderate';
  const shouldEase = Boolean(targeted) || wearablesLow;
  const attention = !shouldEase && (wearablesModerate || fatigue.readiness < 70);

  let headline;
  let detail;
  if (shouldEase) {
    headline = 'Hoje, vai com margem';
    detail = targeted
      ? `${targeted.label} ainda está em recuperação e o treino de hoje ataca-o diretamente.`
      : 'Os teus sensores mostram fadiga acumulada esta manhã.';
  } else if (attention) {
    headline = 'Treina normalmente, com atenção';
    detail = wearablesModerate
      ? 'Recuperação estável, mas não é dia de bater recordes pessoais.'
      : 'Fadiga moderada em geral — mantém a técnica antes da carga.';
  } else {
    headline = 'Pronto para ir a fundo';
    detail = wearablesStale
      ? 'Sem leitura recente do wearable — recomendação baseada na recuperação muscular registada.'
      : 'Fadiga muscular e prontidão alinhadas. Bom dia para progressão de carga.';
  }

  const applyEase = () => {
    if (!targeted) return;
    triggerHaptic([12, 40, 12]);
    setEaseModeToday(targeted.id);
    setApplied(true);
  };

  return (
    <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.08] space-y-2.5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent-hover shrink-0" strokeWidth={1.75} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Briefing do AB Coach</span>
      </div>
      <div>
        <p className="text-[14px] font-semibold text-white">{headline}</p>
        <p className="text-[12px] text-zinc-400 mt-0.5 leading-relaxed">{detail}</p>
      </div>
      {shouldEase && targeted && (
        applied ? (
          <p className="text-[12px] font-semibold text-emerald-400">Ajuste aplicado — o treino de hoje começa com 1 série a menos nesse grupo.</p>
        ) : (
          <button
            type="button"
            onClick={applyEase}
            className="inline-flex items-center gap-1 text-[12px] font-bold text-accent-hover hover:text-white cursor-pointer"
          >
            Aplicar −1 série hoje nesse grupo
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )
      )}
    </div>
  );
}
