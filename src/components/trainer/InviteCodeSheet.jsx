import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { getMyInviteCode } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 40 };

/** Folha com o código de convite do trainer, cópia rápida e partilha nativa. */
export default function InviteCodeSheet({ trainerId, onClose }) {
  const reducedMotion = useReducedMotion();
  const [code, setCode] = useState(null);
  const [copiedType, setCopiedType] = useState(null); // 'code' | 'link' | null

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    getMyInviteCode(trainerId).then(({ data }) => setCode(data));
    return () => window.removeEventListener('keydown', onKey);
  }, [trainerId, onClose]);

  const link = code ? `${window.location.origin}/?trainer=${code}` : '';
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHaptic(10);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 1800);
    } catch {}
  };

  const shareNative = async () => {
    if (!code || !canNativeShare) {
      copy(link, 'link');
      return;
    }
    try {
      triggerHaptic(10);
      await navigator.share({
        title: 'Convite Personal Trainer · AB Fitness',
        text: `Usa o meu código ${code} na AB Fitness para te vinculares ao meu acompanhamento:`,
        url: link
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Convidar atleta">
      <motion.div
        className="absolute inset-0 bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
        onClick={onClose}
      />
      <motion.div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={reducedMotion ? { duration: 0 } : SPRING}
      >
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-heading text-section font-semibold text-white">Convidar atleta</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-11 h-11 -mr-1 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-4">
          <p className="text-[13px] text-zinc-400">
            Partilha este código com o teu atleta. Ele pode abrir o link direto ou inserir o código em "Vincular Personal Trainer" no menu lateral.
          </p>

          <div className="py-6 border-y border-white/[0.08] text-center">
            <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500 mb-2">
              Código de vínculo
            </span>
            <span className="font-display text-[36px] font-bold tracking-[0.26em] text-white tabular-nums">
              {code || '......'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => copy(code, 'code')}
              disabled={!code}
              className="min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-semibold text-[13px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {copiedType === 'code' ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={1.75} />}
              {copiedType === 'code' ? 'Código copiado' : 'Copiar código'}
            </button>

            <button
              type="button"
              onClick={() => copy(link, 'link')}
              disabled={!code}
              className="min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-semibold text-[13px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {copiedType === 'link' ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} /> : <Copy className="w-4 h-4" strokeWidth={1.75} />}
              {copiedType === 'link' ? 'Link copiado' : 'Copiar link'}
            </button>
          </div>

          {canNativeShare && (
            <button
              type="button"
              onClick={shareNative}
              disabled={!code}
              className="w-full min-h-[52px] rounded-2xl bg-primary text-app font-bold text-body inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" strokeWidth={2} />
              Partilhar convite
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
