import React, { useState } from 'react';
import { motion } from 'motion/react';
import { submitPostWorkoutCheckin } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const EASE = [0.22, 1, 0.36, 1];

/** Check-in rápido (10s) de uma sessão prescrita pelo PT: RPE percebido, dor e nota opcional. */
export default function PostWorkoutCheckin({ sessionId, onDone }) {
  const [rpe, setRpe] = useState(7);
  const [pain, setPain] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setSending(true);
    triggerHaptic([12, 40, 12]);
    await submitPostWorkoutCheckin(sessionId, { actualRpe: rpe, painFlag: pain, athleteFeedback: feedback.trim() || null });
    onDone();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-app flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Check-in para o teu PT"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-md mx-auto w-full px-5 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 space-y-7">
          <div>
            <h1 className="font-heading text-title-xl font-bold tracking-tight text-white">Como foi a sessão?</h1>
            <p className="mt-2 text-body text-zinc-400">O teu PT vê isto no painel dele para ajustar o próximo treino.</p>
          </div>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading text-section font-semibold text-white">Esforço percebido (RPE)</h2>
              <span className="font-display font-bold text-[28px] leading-none tabular-nums text-white">{rpe}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={rpe}
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full accent-white cursor-pointer"
              aria-label="RPE de 1 a 10"
            />
            <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
              <span>1 · Muito leve</span>
              <span>10 · Máximo</span>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-section font-semibold text-white mb-3">Sentiste dor ou desconforto?</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPain(false)}
                className={`flex-1 min-h-[48px] rounded-xl border text-[14px] font-semibold cursor-pointer transition-colors ${!pain ? 'bg-accent/70 border-accent-hover text-white' : 'bg-surface-2 border-white/[0.08] text-zinc-300'}`}
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => setPain(true)}
                className={`flex-1 min-h-[48px] rounded-xl border text-[14px] font-semibold cursor-pointer transition-colors ${pain ? 'bg-[#FF968A]/20 border-[#FF968A]/60 text-[#FF968A]' : 'bg-surface-2 border-white/[0.08] text-zinc-300'}`}
              >
                Sim
              </button>
            </div>
          </section>

          <section>
            <label htmlFor="pt-checkin-note" className="block font-heading text-section font-semibold text-white mb-3">
              Queres dizer mais alguma coisa ao teu PT?
            </label>
            <textarea
              id="pt-checkin-note"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Opcional"
              className="w-full px-4 py-3 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
            />
          </section>
        </div>
      </div>

      <div className="shrink-0 max-w-md mx-auto w-full px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.06] flex gap-2">
        <button type="button" onClick={onDone} className="min-h-[54px] px-4 rounded-2xl text-[14px] font-semibold text-zinc-400 hover:text-white cursor-pointer">
          Agora não
        </button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={submit}
          disabled={sending}
          className="flex-1 min-h-[54px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? 'A enviar...' : 'Enviar ao PT'}
        </motion.button>
      </div>
    </motion.div>
  );
}
