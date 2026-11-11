import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check } from 'lucide-react';
import { getMyInviteCode } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 40 };

/** Folha com o código de convite do trainer e um link de 1 toque para copiar. */
export default function InviteCodeSheet({ trainerId, onClose }) {
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    getMyInviteCode(trainerId).then(({ data }) => setCode(data));
    return () => window.removeEventListener('keydown', onKey);
  }, [trainerId, onClose]);

  const link = code ? `${window.location.origin}/?trainer=${code}` : '';

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHaptic(10);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Convidar atleta">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
      >
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-heading text-section font-semibold text-white">Convidar atleta</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-10 h-10 -mr-1 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          <p className="text-[13px] text-zinc-400">Partilha este código com o teu atleta — ele insere-o em "Vincular Personal Trainer" no perfil dele.</p>

          <div className="py-6 rounded-2xl bg-surface-2 border border-accent-hover/60 text-center">
            <span className="font-mono text-[34px] font-bold tracking-[0.3em] text-white tabular-nums">
              {code || '......'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => copy(code)}
            disabled={!code}
            className="w-full min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-semibold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={1.75} />}
            {copied ? 'Código copiado' : 'Copiar código'}
          </button>

          <button
            type="button"
            onClick={() => copy(link)}
            disabled={!code}
            className="w-full min-h-[52px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:opacity-50"
          >
            Copiar link de convite
          </button>
        </div>
      </motion.div>
    </div>
  );
}
