import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Link2, Check } from 'lucide-react';
import { redeemInviteCode } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 40 };

/** Folha "Vincular Personal Trainer": o atleta troca o código de 6 dígitos pelo vínculo. */
export default function LinkTrainerSheet({ initialCode = '', onClose, onLinked }) {
  const [code, setCode] = useState(initialCode);
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'error' | 'done'
  const [error, setError] = useState('');
  const [trainerName, setTrainerName] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = async () => {
    const trimmed = code.trim();
    if (trimmed.length < 6) return;
    setStatus('sending');
    setError('');
    const { data, error: err } = await redeemInviteCode(trimmed);
    if (err || !data) {
      setStatus('error');
      setError(err || 'Código de convite inválido.');
      return;
    }
    triggerHaptic([12, 40, 12]);
    setTrainerName(data.trainer_name || '');
    setStatus('done');
    onLinked?.(data);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Vincular personal trainer">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
      >
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-heading text-section font-semibold text-white">Vincular Personal Trainer</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 pb-6">
          {status === 'done' ? (
            <div className="py-4 text-center space-y-2">
              <span className="inline-flex w-12 h-12 rounded-full bg-accent items-center justify-center">
                <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
              </span>
              <p className="text-body text-white font-semibold">Vinculado{trainerName ? ` a ${trainerName}` : ''}.</p>
              <p className="text-[13px] text-zinc-400">O teu PT já pode ver o teu progresso e prescrever treinos.</p>
              <button type="button" onClick={onClose} className="mt-3 w-full min-h-[48px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer">
                Fechar
              </button>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-zinc-400 mb-3">Pede ao teu PT o código de 6 dígitos e insere-o abaixo.</p>
              <div className="flex items-center gap-2.5 px-4 min-h-[52px] rounded-2xl bg-surface-2 border border-white/[0.08] focus-within:border-accent-hover">
                <Link2 className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={1.75} />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="AB12CD"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  className="flex-1 bg-transparent text-white tracking-[0.2em] font-mono text-body placeholder:text-zinc-600 focus:outline-none"
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
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
