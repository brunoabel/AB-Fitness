import React, { useReducer, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ChevronLeft, X } from 'lucide-react';
import CoachBubble, { SegmentedProgress } from './CoachBubble';
import BuildingPlan from './BuildingPlan';
import BodyStep from './steps/BodyStep';
import ChoiceStep from './steps/ChoiceStep';
import LogisticsStep from './steps/LogisticsStep';
import SplitStep from './steps/SplitStep';
import RestrictionsStep from './steps/RestrictionsStep';
import ReviewStep from './steps/ReviewStep';
import { DEFAULT_PROFILE, GOALS, LEVELS, SPLITS, SPLIT_BY_DAYS, isStepValid, labelOf } from './profileSchema';
import { buildPlanFromProfile } from '../../data/planFromProfile';
import { saveFitnessProfile } from '../../services/fitnessProfileService';
import { triggerHaptic } from '../../utils/audio';

const STEPS = [
  { title: 'O teu corpo', say: (p, name) => `Olá${name ? `, ${name}` : ''}! Sou o AB Coach. Em 2 minutos monto o teu plano. Começa pelo básico: ajusto cargas e volume a isto.`, render: (props) => <BodyStep {...props} /> },
  { title: 'Meta principal', say: () => 'Qual é a meta que manda no teu treino agora?', render: (props) => <ChoiceStep {...props} options={GOALS} field="primaryGoal" label="Meta principal" /> },
  { title: 'Nível de treino', say: (p) => `${labelOf(GOALS, p.primaryGoal)}, boa escolha. Há quanto tempo treinas com consistência?`, render: (props) => <ChoiceStep {...props} options={LEVELS} field="experienceLevel" label="Nível de treino" /> },
  { title: 'Logística', say: () => 'Onde treinas e quanto tempo tens? Isto define equipamento e volume.', render: (props) => <LogisticsStep {...props} /> },
  { title: 'Divisão', say: (p) => `Com ${p.daysPerWeek} dias, recomendo ${labelOf(SPLITS, SPLIT_BY_DAYS[p.daysPerWeek])}. Preferes outra divisão?`, render: (props) => <SplitStep {...props} /> },
  { title: 'Restrições & foco', say: () => 'Alguma lesão que eu deva proteger? E há músculos que queres destacar?', render: (props) => <RestrictionsStep {...props} /> },
  { title: 'Confirmação', say: () => 'Confere tudo. Toca no lápis para corrigir qualquer ponto.', render: (props) => <ReviewStep {...props} /> }
];
const MIN_BUILD_MS = 2400;

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, profile: { ...state.profile, [action.field]: action.value } };
    case 'go':
      return { ...state, step: action.step, dir: action.step > state.step ? 1 : -1 };
    default:
      return state;
  }
}

/**
 * Onboarding conversacional do AB Coach. Recolhe o perfil, envia-o de uma vez e gera o plano.
 * @param {{ userId?: string, userName?: string, onComplete: Function, onClose?: Function }} props
 */
export default function OnboardingCoach({ userId, userName, onComplete, onClose }) {
  const [{ step, dir, profile }, dispatch] = useReducer(reducer, { step: 0, dir: 1, profile: DEFAULT_PROFILE });
  const [build, setBuild] = useState(null); // null | { ready, plan, notes }

  const set = (field, value) => dispatch({ type: 'set', field, value });
  const goTo = (s) => dispatch({ type: 'go', step: s });
  const valid = isStepValid(profile, step);
  const isLast = step === STEPS.length - 1;

  const submit = async () => {
    triggerHaptic([20, 40, 20]);
    setBuild({ ready: false, notes: [] });
    const started = Date.now();
    const { plan, notes } = buildPlanFromProfile(profile);
    const result = await saveFitnessProfile(userId, profile);
    if (result.error) notes.push('Guardei o perfil neste aparelho. A sincronização com a conta falhou e tento de novo da próxima vez.');
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
      <div className="fixed inset-0 z-[70] bg-app text-zinc-100 flex flex-col overflow-hidden" role="dialog" aria-modal="true" aria-label="Configuração do plano com o AB Coach">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-accent/[0.07] blur-3xl" />

        {build ? (
          <BuildingPlan ready={build.ready} notes={build.notes} onFinish={() => onComplete({ plan: build.plan, profile, notes: build.notes })} />
        ) : (
          <>
            <header className="relative px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 space-y-3 max-w-md mx-auto w-full">
              <div className="flex items-center justify-between h-11">
                <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} aria-label="Etapa anterior" className="w-11 h-11 -ml-2 rounded-xl flex items-center justify-center text-zinc-300 disabled:opacity-0 cursor-pointer">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-zinc-400 tabular-nums">{step + 1} / {STEPS.length} · {STEPS[step].title}</span>
                {onClose ? (
                  <button type="button" onClick={onClose} aria-label="Fechar" className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-zinc-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                ) : <span className="w-11" />}
              </div>
              <SegmentedProgress total={STEPS.length} current={step} />
            </header>

            <main className="relative flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
              <div className="max-w-md mx-auto w-full space-y-5 pt-2">
                <CoachBubble message={STEPS[step].say(profile, userName)} />
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ x: 20 * dir, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20 * dir, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    {STEPS[step].render({ profile, set, goTo })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            <footer className="relative px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] bg-app/80 backdrop-blur-md border-t border-white/10">
              <button
                type="button"
                onClick={next}
                disabled={!valid}
                className="max-w-md mx-auto w-full min-h-[52px] rounded-2xl bg-accent hover:bg-accent-hover text-app font-bold text-base flex items-center justify-center shadow-[0_0_30px_-8px_rgba(0,240,255,0.7)] active:scale-[0.98] transition-all cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isLast ? 'Gerar o meu plano' : valid ? 'Continuar' : 'Escolhe uma opção'}
              </button>
            </footer>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
