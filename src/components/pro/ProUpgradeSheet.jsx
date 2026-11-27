import React, { useEffect, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { ModalBackdrop, ModalPanel } from '../ui/Modal';
import { startProCheckout, openBillingPortal } from '../../services/billingService';
import { triggerHaptic } from '../../utils/audio';

// Só o que o PRO desbloqueia hoje no app; nada de promessas de funcionalidades por lançar
const PRO_BENEFITS = [
  'Mesociclo de 5 semanas com RIR alvo por semana e deload planeado',
  'AB Coach com até 50 mensagens por dia (5 no plano gratuito)'
];

// Plano Personal Trainer: o que o Trainer Hub já faz hoje (inclui tudo do PRO)
const TRAINER_BENEFITS = [
  'Trainer Hub com a tua lista de atletas, código de convite e construtor de programas',
  'Alertas de risco e check-ins pós-treino de cada atleta',
  'Os teus atletas ganham 14 dias de PRO ao entrar com o teu código',
  'Inclui tudo o que o PRO desbloqueia'
];

const REASON_TITLES = {
  mesocycles: 'O mesociclo faz parte do PRO',
  coach_limit: 'Mais conversas com o AB Coach',
  trial_ending: 'O teu teste PRO está a terminar',
  trial_ended: 'O teu teste PRO terminou',
  trainer: 'Acompanha os teus atletas na AB Fitness'
};

/**
 * Folha de upgrade: explica o plano e abre o Stripe Checkout. Usar dentro de <AnimatePresence>.
 * `plan`: 'pro' (por omissão) ou 'trainer' (Personal Trainer).
 */
export default function ProUpgradeSheet({ reason = 'mesocycles', plan = 'pro', onClose }) {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const isTrainerPlan = plan === 'trainer';
  const benefits = isTrainerPlan ? TRAINER_BENEFITS : PRO_BENEFITS;
  const title = isTrainerPlan ? REASON_TITLES.trainer : (REASON_TITLES[reason] || REASON_TITLES.mesocycles);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCheckout = async () => {
    triggerHaptic(12);
    setStatus('loading');
    setError('');
    const { error: err, code } = await startProCheckout(isTrainerPlan ? 'trainer' : 'pro');
    if (err) {
      setStatus('idle');
      setError(err);
      setAlreadySubscribed(code === 'already_subscribed');
    }
  };

  const handleManage = async () => {
    triggerHaptic(12);
    setStatus('loading');
    const { error: err } = await openBillingPortal();
    if (err) {
      setStatus('idle');
      setError(err);
    }
  };

  return (
    <ModalBackdrop
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <ModalPanel
        className="w-full sm:max-w-md bg-surface border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{isTrainerPlan ? 'AB Fitness Personal Trainer' : 'AB Fitness PRO'}</p>
            <h2 className="font-display text-xl font-black text-white tracking-tight">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-2 -m-2 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2.5">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[13px] text-zinc-200">
              <Check className="w-4 h-4 text-white shrink-0 mt-0.5" />
              {b}
            </li>
          ))}
        </ul>

        <p className="text-[12px] text-zinc-400">
          A subscrição começa com 14 dias grátis. O preço aparece na página de pagamento, antes de confirmares.
        </p>

        {error && <p role="alert" className="text-[12px] text-zinc-300 bg-surface-2 border-l-2 border-accent-hover rounded-r-lg px-3 py-2">{error}</p>}

        <button
          type="button"
          onClick={alreadySubscribed ? handleManage : handleCheckout}
          disabled={status === 'loading'}
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 bg-primary text-app font-semibold text-sm rounded-xl px-4 py-3.5 disabled:opacity-60"
        >
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {alreadySubscribed ? 'Gerir subscrição' : isTrainerPlan ? 'Assinar Personal Trainer' : 'Assinar PRO'}
        </button>
      </ModalPanel>
    </ModalBackdrop>
  );
}
