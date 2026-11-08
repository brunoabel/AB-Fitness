import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Loader2, Bot, ArrowRight } from 'lucide-react';

const PHASES = [
  'A analisar a tua biometria',
  'A aplicar lesões e equipamento',
  'A distribuir o volume semanal',
  'A montar o teu split ótimo'
];
const PHASE_MS = 550;

/** Ecrã de transição: o AB Coach "calcula" o plano e mostra os ajustes feitos. */
export default function BuildingPlan({ ready, notes = [], onFinish }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? PHASES.length : 0);

  useEffect(() => {
    if (shown >= PHASES.length) return undefined;
    const t = setTimeout(() => setShown((s) => s + 1), PHASE_MS);
    return () => clearTimeout(t);
  }, [shown]);

  const finished = ready && shown >= PHASES.length;

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-md mx-auto w-full" aria-live="polite">
      <motion.span
        className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/40 flex items-center justify-center mb-6"
        animate={reduce || finished ? {} : { boxShadow: ['0 0 0px rgba(0,240,255,0)', '0 0 36px rgba(0,240,255,0.55)', '0 0 0px rgba(0,240,255,0)'] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <Bot className="w-8 h-8 text-accent" />
      </motion.span>

      <h2 className="font-display text-4xl font-bold uppercase tracking-tight text-white leading-none">
        {finished ? 'O teu plano está pronto' : 'A montar o teu split ótimo…'}
      </h2>

      <ul className="mt-6 space-y-3">
        {PHASES.slice(0, Math.max(1, shown)).map((p, i) => {
          const done = i < shown - 1 || finished;
          return (
            <motion.li key={p} initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-sm">
              {done ? <Check className="w-4 h-4 text-accent stroke-[3]" /> : <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
              <span className={done ? 'text-zinc-200' : 'text-zinc-400'}>{p}</span>
            </motion.li>
          );
        })}
      </ul>

      {finished && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4">
          {notes.length > 0 && (
            <ul className="rounded-2xl bg-surface/80 backdrop-blur-md border border-white/10 p-4 space-y-2">
              {notes.map((n) => (
                <li key={n} className="text-sm text-zinc-300 leading-relaxed flex gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {n}
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onFinish}
            autoFocus
            className="w-full min-h-[52px] rounded-2xl bg-accent hover:bg-accent-hover text-app font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_30px_-6px_rgba(0,240,255,0.7)] active:scale-[0.98] transition-all cursor-pointer"
          >
            Ver o meu plano
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
