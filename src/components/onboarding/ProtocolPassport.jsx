import React, { useEffect, useState } from 'react';
import { Skeleton } from '../ui/Skeleton';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { MicroLabel } from './controls';
import CoachAvatar from '../coach/CoachAvatar';
import { splitSummaryOf } from './calibrationSteps';
import { GOALS, LEVELS, LOCATIONS, PRIORITY_MUSCLES, formatTrainingDays, labelOf } from './profileSchema';

const EASE = [0.22, 1, 0.36, 1];
const PHASES = ['Biometria', 'Equipamento', 'Volume', 'Divisão'];
const PHASE_MS = 520;

const SkeletonLine = ({ w = 'w-24' }) => <Skeleton className={`h-5 ${w} rounded-md bg-surface-3 ml-auto`} />;

/**
 * Geração do protocolo: telemetria de síntese (~2.5 s) e passaporte biométrico do atleta.
 * `build` = { ready, plan, notes }.
 */
export default function ProtocolPassport({ profile, build, onFinish }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? PHASES.length : 0);

  useEffect(() => {
    if (shown >= PHASES.length) return undefined;
    const t = setTimeout(() => setShown((s) => s + 1), PHASE_MS);
    return () => clearTimeout(t);
  }, [shown]);

  const ready = build.ready && shown >= PHASES.length;
  const trainingDays = (build.plan || []).filter((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
  const weeklySets = trainingDays.reduce((s, d) => s + d.exercises.reduce((a, e) => a + (Number(e.defaultSets) || 3), 0), 0);
  const exerciseCount = trainingDays.reduce((s, d) => s + d.exercises.length, 0);
  const focus = profile.priorityMuscles.length
    ? profile.priorityMuscles.map((m) => labelOf(PRIORITY_MUSCLES, m)).join(' · ')
    : 'Equilibrado';

  const formattedDays = formatTrainingDays(profile.trainingDays);
  const rows = [
    ['Divisão', splitSummaryOf(profile)],
    ['Frequência', `${profile.daysPerWeek} dias · ${profile.sessionMinutes === 75 ? '75+' : profile.sessionMinutes} min`],
    ...(formattedDays ? [['Dias de treino', formattedDays]] : []),
    ['Volume semanal', `${weeklySets} séries · ${exerciseCount} exercícios`],
    ['Foco', focus],
    ['Local', labelOf(LOCATIONS, profile.trainingLocation)]
  ];

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-[calc(env(safe-area-inset-bottom,0px)+20px)]" aria-live="polite">
      <div className="max-w-md mx-auto w-full flex flex-col min-h-full">
        {ready ? (
          <motion.div className="flex items-center gap-3" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <CoachAvatar size={44} alt="AB Coach" />
            <p className="text-body text-zinc-300">O teu protocolo está pronto. Bora começar.</p>
          </motion.div>
        ) : (
          <div className="relative -mx-5 -mt-7 aspect-[16/9] overflow-hidden">
            <img src="/coach/ab-coach-thinking.jpg" alt="AB Coach a analisar os teus dados" width={800} height={447} decoding="async" className="absolute inset-0 w-full h-full object-cover object-[50%_35%]" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-app to-transparent" />
            <p className="absolute left-5 bottom-3 text-body text-zinc-200">Estou a analisar os teus dados…</p>
          </div>
        )}
        <MicroLabel className="mt-5">{ready ? 'Protocolo gerado' : 'A gerar protocolo'}</MicroLabel>
        <h2 className="mt-2 font-heading text-title-xl font-bold tracking-tight text-zinc-50">Passaporte biométrico do atleta</h2>

        <ol className="mt-6 grid grid-cols-4 gap-1.5" aria-label="Fases da síntese">
          {PHASES.map((p, i) => {
            const done = i < shown;
            return (
              <li key={p} className="space-y-2">
                <span className="block h-[3px] rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.span className="block h-full bg-white origin-left" initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: done ? 1 : 0 }} transition={{ duration: PHASE_MS / 1000, ease: EASE }} />
                </span>
                <span className={`flex items-center gap-1 text-[10px] uppercase tracking-wide leading-tight truncate ${done ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {done && <Check className="w-3 h-3 text-white shrink-0" strokeWidth={2.5} />}
                  {p}
                </span>
              </li>
            );
          })}
        </ol>

        <section className="mt-6 rounded-2xl bg-surface-2 border border-white/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <MicroLabel>Atleta</MicroLabel>
            <p className="mt-1 font-heading text-section font-semibold text-zinc-100">{labelOf(GOALS, profile.primaryGoal)} · {labelOf(LEVELS, profile.experienceLevel)}</p>
            <p className="mt-0.5 text-[13px] text-zinc-400 tabular-nums">{profile.age} anos · {profile.weightKg.toLocaleString('pt-PT')} kg · {profile.heightCm} cm</p>
          </div>
          <dl className="divide-y divide-white/[0.06]">
            {rows.map(([k, v], i) => (
              <div key={k} className="px-4 py-3 flex items-baseline justify-between gap-4">
                <dt className="text-micro uppercase tracking-wider text-zinc-400 shrink-0">{k}</dt>
                <dd className="text-body text-right text-zinc-100 tabular-nums min-w-0">
                  {ready ? (
                    <motion.span className="block" initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35, ease: EASE }}>
                      {v}
                    </motion.span>
                  ) : (
                    <SkeletonLine w={i % 2 ? 'w-20' : 'w-32'} />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {ready && build.notes.length > 0 && (
          <ul className="mt-4 space-y-2">
            {build.notes.map((n) => (
              <li key={n} className="text-[13px] text-zinc-400 leading-relaxed flex gap-2.5">
                <span className="mt-[7px] w-1 h-1 rounded-full bg-zinc-500 shrink-0" />
                {n}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-8">
          <motion.button
            type="button"
            onClick={onFinish}
            disabled={!ready}
            whileTap={{ scale: 0.98 }}
            className="w-full min-h-[56px] rounded-2xl bg-primary hover:bg-primary-hover text-app font-bold text-body flex items-center justify-center gap-2 cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-wait transition-colors"
          >
            {ready ? 'Iniciar protocolo' : 'A sintetizar'}
            {ready && <ArrowRight className="w-5 h-5" strokeWidth={2} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
