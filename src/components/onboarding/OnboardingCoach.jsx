import React, { useReducer, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ChevronLeft, X } from 'lucide-react';
import ProtocolPassport from './ProtocolPassport';
import CoachIntro from './CoachIntro';
import { CALIBRATION_STEPS } from './calibrationSteps';
import { DEFAULT_PROFILE, fieldsFilled } from './profileSchema';
import { buildPlanFromProfile } from '../../data/planFromProfile';
import { getLocalFitnessProfile, saveFitnessProfile } from '../../services/fitnessProfileService';
import { getBodyEntries, saveBodyEntry, todayISO } from '../../utils/bodyPortfolio';
import { triggerHaptic } from '../../utils/audio';

const MIN_BUILD_MS = 2500;
const TOTAL = CALIBRATION_STEPS.length;
const pad = (n) => String(n).padStart(2, '0');
// Física nativa: mola interrompível (assenta em ~240 ms), entra de scale 0.96, nunca de 0
const STEP_SPRING = { type: 'spring', stiffness: 520, damping: 42, mass: 0.9 };
const STEP_VARIANTS = {
  enter: (d) => ({ x: 28 * d, scale: 0.96, opacity: 0 }),
  center: { x: 0, scale: 1, opacity: 1 },
  exit: (d) => ({ x: -28 * d, scale: 0.96, opacity: 0 })
};

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      if (action.field && typeof action.field === 'object') {
        return { ...state, profile: { ...state.profile, ...action.field } };
      }
      return { ...state, profile: { ...state.profile, [action.field]: action.value } };
    case 'go':
      return { ...state, step: action.step, dir: action.step > state.step ? 1 : -1 };
    default:
      return state;
  }
}

/**
 * Calibração biométrica do AB Coach: um conceito por ecrã, controlos táteis,
 * e síntese final do protocolo antes de gravar e redirecionar.
 * @param {{ userId?: string, userName?: string, onComplete: Function, onClose?: Function }} props
 */
export default function OnboardingCoach({ userId, userName, onComplete, onClose }) {
  const [{ step, dir, profile }, dispatch] = useReducer(reducer, undefined, () => ({
    step: 0,
    dir: 1,
    profile: { ...DEFAULT_PROFILE, ...getLocalFitnessProfile() }
  }));
  const [units, setUnits] = useState({ weight: 'kg', height: 'cm' });
  const [build, setBuild] = useState(null); // null | { ready, plan, notes }
  const [intro, setIntro] = useState(true); // o coach apresenta-se antes da primeira pergunta

  const current = CALIBRATION_STEPS[step];
  const set = (field, value) => dispatch({ type: 'set', field, value });
  const goTo = (target) => {
    const idx = typeof target === 'number' ? target : CALIBRATION_STEPS.findIndex((s) => s.id === target);
    if (idx >= 0) dispatch({ type: 'go', step: idx });
  };
  const valid = fieldsFilled(profile, typeof current.fields === 'function' ? current.fields(profile) : current.fields);
  const isLast = step === TOTAL - 1;

  const submit = async () => {
    triggerHaptic([20, 40, 20]);
    setBuild({ ready: false, plan: [], notes: [] });
    const started = Date.now();
    const { plan, notes } = buildPlanFromProfile(profile);
    if (getBodyEntries().length === 0 && Number(profile.weightKg) > 0) {
      saveBodyEntry({ date: todayISO(), weight: Number(profile.weightKg) });
    }
    const result = await saveFitnessProfile(userId, profile);
    if (result.error) notes.push('Perfil guardado neste aparelho. A sincronização com a conta falhou e volta a ser tentada na próxima abertura.');
    await new Promise((r) => setTimeout(r, Math.max(0, MIN_BUILD_MS - (Date.now() - started))));
    setBuild({ ready: true, plan, notes });
  };

  const next = () => {
    if (!valid) return;
    triggerHaptic(12);
    if (isLast) submit();
    else goTo(step + 1);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-[70] bg-app text-zinc-100 flex flex-col overflow-hidden" role="dialog" aria-modal="true" aria-label="Calibração do protocolo AB Coach">
        {intro ? (
          <CoachIntro userName={userName} onClose={onClose} onStart={() => setIntro(false)} />
        ) : build ? (
          <ProtocolPassport profile={profile} build={build} onFinish={() => onComplete({ plan: build.plan, profile, notes: build.notes })} />
        ) : (
          <>
            <header className="shrink-0 px-4 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-2 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between h-11">
                <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Etapa anterior" className="w-11 h-11 -ml-2.5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 disabled:opacity-0 cursor-pointer">
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
                </button>
                <span className="text-micro uppercase tracking-wider text-zinc-400 font-medium">
                  AB Coach · <span className="tabular-nums text-zinc-100">{pad(step + 1)}</span>
                  <span className="tabular-nums text-zinc-500"> / {pad(TOTAL)}</span>
                </span>
                {onClose ? (
                  <button type="button" onClick={onClose} aria-label="Fechar" className="w-11 h-11 -mr-2.5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-100 cursor-pointer">
                    <X className="w-5 h-5" strokeWidth={1.75} />
                  </button>
                ) : <span className="w-11" />}
              </div>
              <div className="flex gap-1 mt-1" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step + 1}>
                {CALIBRATION_STEPS.map((s, i) => (
                  <span key={s.id} className="flex-1 h-[2px] rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.span className="block h-full bg-white origin-left" initial={false} animate={{ scaleX: i <= step ? 1 : 0 }} transition={STEP_SPRING} />
                  </span>
                ))}
              </div>
            </header>

            <main className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-5">
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div
                  key={current.id}
                  custom={dir}
                  variants={STEP_VARIANTS}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={STEP_SPRING}
                  className="will-change-transform max-w-md mx-auto w-full min-h-full flex flex-col pt-6 pb-6"
                >
                  <div className="shrink-0">
                    <h1 className="font-heading text-title-xl font-bold tracking-tight text-zinc-50 text-balance">{current.title}</h1>
                    <p className="mt-2 text-body text-zinc-400">{current.sub}</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-end pt-8 min-h-[60%]">
                    {current.render({ profile, set, goTo, units, setUnits })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </main>

            <footer className="shrink-0 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.06]">
              <motion.button
                type="button"
                onClick={next}
                disabled={!valid}
                whileTap={valid ? { scale: 0.98 } : undefined}
                className="max-w-md mx-auto w-full min-h-[56px] rounded-2xl bg-primary hover:bg-primary-hover text-app font-bold text-body flex items-center justify-center transition-colors cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-not-allowed"
              >
                {isLast ? 'Gerar protocolo' : valid ? 'Continuar' : 'Escolhe uma opção'}
              </motion.button>
            </footer>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
