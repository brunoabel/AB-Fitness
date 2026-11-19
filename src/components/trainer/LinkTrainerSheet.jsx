import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Link2, Check, UserMinus } from 'lucide-react';
import { useAuth } from '../../context';
import { redeemInviteCode, getMyTrainer, unlinkMyTrainer } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 40 };

/** Folha "Personal Trainer": permite ao atleta vincular por código de 6 dígitos ou desvincular o PT ativo. */
export default function LinkTrainerSheet({ initialCode = '', onClose, onLinked }) {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'error' | 'done' | 'unlinked'
  const [error, setError] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [trialAlreadyUsed, setTrialAlreadyUsed] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [loadingTrainer, setLoadingTrainer] = useState(true);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let alive = true;
    getMyTrainer().then(({ data }) => {
      if (!alive) return;
      setCurrentTrainer(data || null);
      setLoadingTrainer(false);
    });

    return () => {
      alive = false;
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6) return;
    setStatus('sending');
    setError('');
    const { data, error: err } = await redeemInviteCode(trimmed, user?.id);
    if (err || !data) {
      setStatus('error');
      setError(err || 'Código de convite inválido.');
      return;
    }
    triggerHaptic([12, 40, 12]);
    setTrainerName(data.trainer_name || '');
    setTrialEndsAt(data.trial_ends_at || null);
    setTrialAlreadyUsed(Boolean(data.trial_ends_at && new Date(data.trial_ends_at).getTime() <= Date.now()));
    setCurrentTrainer({ trainer_id: data.trainer_id, full_name: data.trainer_name });
    setStatus('done');
    if (typeof window !== 'undefined' && window.location.search.includes('trainer=')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
    onLinked?.(data);
  };

  const handleUnlink = async () => {
    if (!confirmUnlink) {
      triggerHaptic(8);
      setConfirmUnlink(true);
      return;
    }
    setStatus('sending');
    setError('');
    const { error: err } = await unlinkMyTrainer(user?.id);
    if (err) {
      setStatus('error');
      setError(err);
      setConfirmUnlink(false);
      return;
    }
    triggerHaptic(12);
    setCurrentTrainer(null);
    setConfirmUnlink(false);
    setStatus('unlinked');
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Personal trainer">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reducedMotion ? { duration: 0 } : SPRING}
      >
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-heading text-section font-semibold text-white">Personal Trainer</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-11 h-11 -mr-1 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          {status === 'done' ? (
            <div className="py-4 text-center space-y-2">
              <span className="inline-flex w-12 h-12 rounded-full bg-accent items-center justify-center">
                <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
              </span>
              <p className="text-body text-white font-semibold">
                Vinculado{trainerName ? ` a ${trainerName}` : ''}.
              </p>
              <p className="text-[13px] text-zinc-400">
                O teu PT já pode acompanhar o teu progresso e prescrever treinos.
              </p>
              {trialAlreadyUsed ? (
                // O trial B2B2C é concedido uma vez por conta (trial_granted_at)
                <p className="mt-3 text-[12px] text-zinc-500">O período de teste PRO já foi usado nesta conta.</p>
              ) : (
                <div className="mt-3 bg-surface-2 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-2.5 text-left">
                  <p className="text-[13px] font-semibold text-white">14 dias de AB Fitness PRO ativados</p>
                  <p className="text-[12px] text-zinc-400 tabular-nums">
                    {trialEndsAt && !Number.isNaN(new Date(trialEndsAt).getTime())
                      ? `Acesso PRO até ${new Date(trialEndsAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                      : 'Oferta do vínculo com o teu PT: mesociclos, coach ilimitado e análise avançada.'}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full min-h-[48px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer"
              >
                Concluir
              </button>
            </div>
          ) : status === 'unlinked' ? (
            <div className="py-4 text-center space-y-2">
              <p className="text-body text-white font-semibold">Vínculo terminado</p>
              <p className="text-[13px] text-zinc-400">
                O treinador deixou de ter acesso ao teu histórico e prescrições.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full min-h-[48px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              {!loadingTrainer && currentTrainer && (
                <div className="py-3.5 border-y border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      Vínculo ativo
                    </span>
                    <p className="text-[15px] font-semibold text-white truncate mt-0.5">
                      {currentTrainer.full_name || 'Personal Trainer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {confirmUnlink && (
                      <button
                        type="button"
                        onClick={() => setConfirmUnlink(false)}
                        className="min-h-[36px] px-2 text-[12px] text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleUnlink}
                      disabled={status === 'sending'}
                      className={`min-h-[36px] px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                        confirmUnlink
                          ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-rose-400'
                      }`}
                    >
                      <UserMinus className="w-3.5 h-3.5" strokeWidth={1.75} />
                      {confirmUnlink ? 'Confirmar' : 'Desvincular'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[13px] text-zinc-400 mb-3">
                  {currentTrainer
                    ? 'Queres mudar de Personal Trainer? Insere o novo código de 6 dígitos abaixo.'
                    : 'Pede ao teu PT o código de 6 dígitos e insere-o abaixo.'}
                </p>
                <div className="flex items-center gap-2.5 px-4 min-h-[52px] rounded-2xl bg-surface-2 border border-white/[0.08] focus-within:border-accent-hover">
                  <Link2 className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="AB12CD"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    className="flex-1 bg-transparent text-white tracking-[0.22em] font-display font-bold tabular-nums text-body placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
                {status === 'error' && <p className="mt-2 text-[13px] text-rose-400">{error}</p>}
                <button
                  type="button"
                  onClick={submit}
                  disabled={code.trim().length < 6 || status === 'sending'}
                  className="mt-4 w-full min-h-[52px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'sending' ? 'A vincular...' : 'Vincular'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
