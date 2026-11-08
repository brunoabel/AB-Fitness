import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Bot } from 'lucide-react';

const TYPING_MS = 650;

/** Mensagem do AB Coach com efeito curto de "a escrever". */
export default function CoachBubble({ message }) {
  const reduce = useReducedMotion();
  // Mensagem já "escrita"; enquanto difere da atual, mostra os três pontos
  const [revealed, setRevealed] = useState(null);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setTimeout(() => setRevealed(message), TYPING_MS);
    return () => clearTimeout(t);
  }, [message, reduce]);

  const typing = !reduce && revealed !== message;

  return (
    <div className="flex items-start gap-2.5" aria-live="polite">
      <span className="relative w-9 h-9 shrink-0 rounded-xl bg-accent/10 border border-accent/40 flex items-center justify-center shadow-[0_0_16px_-4px_rgba(0,240,255,0.6)]">
        <Bot className="w-[18px] h-[18px] text-accent stroke-[2]" />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-app" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-1">AB Coach</span>
        <div className="inline-block max-w-full rounded-2xl rounded-tl-md bg-surface/90 backdrop-blur-md border border-white/10 px-3.5 py-2.5 min-h-[42px]">
          <AnimatePresence mode="wait" initial={false}>
            {typing ? (
              <motion.span key="dots" className="flex gap-1 py-1.5" aria-label="AB Coach a escrever" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.span>
            ) : (
              <motion.p
                key={message}
                className="text-sm leading-relaxed text-zinc-100"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Barra segmentada com brilho cyan nas etapas concluídas e na atual. */
export function SegmentedProgress({ total, current }) {
  return (
    <div className="flex gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1} aria-label={`Etapa ${current + 1} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="relative flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.span
            className="absolute inset-0 rounded-full bg-accent shadow-[0_0_10px_rgba(0,240,255,0.8)]"
            initial={false}
            animate={{ scaleX: i <= current ? 1 : 0 }}
            style={{ originX: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </span>
      ))}
    </div>
  );
}
