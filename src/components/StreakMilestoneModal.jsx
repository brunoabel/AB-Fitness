import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, animate, useMotionValue, useTransform, useReducedMotion } from 'motion/react';
import { Flame, ArrowRight, Share2 } from 'lucide-react';
import { TIER_COLORS } from '../utils/streakMilestones';
import { buildStreakResultCard, shareStreakResultCard } from '../utils/streakResultCard';
import { sound, triggerHaptic } from '../utils/audio';

const RULER_MILESTONES = [3, 7, 10, 30, 60, 100];
const RING_R = 90;
const RING_CIRC = 2 * Math.PI * RING_R;

/**
 * Celebração cinematográfica de streak — 4 atos: aura por patamar, anel + chama vetorial,
 * contador em rolagem e régua de marcos. Toca no máximo uma vez por dia real (ver
 * utils/streakMilestones.shouldShowStreakCelebration), nunca em loop ao reabrir a app.
 */
export default function StreakMilestoneModal({ streakInfo, onClose }) {
  const reduce = useReducedMotion();
  const [isSharing, setIsSharing] = useState(false);
  const counterRef = useRef(null);
  const ringProgress = useMotionValue(streakInfo?.previousProgress ?? 0);
  const ringOffset = useTransform(ringProgress, (p) => RING_CIRC * (1 - p));

  const { streakDays, previousStreakDays, isMilestone, title, tier, nextMilestone, progressToNext } = streakInfo || {};
  const colors = TIER_COLORS[tier] || TIER_COLORS.base;

  useEffect(() => {
    if (!streakInfo) return undefined;

    const ringControls = animate(ringProgress, progressToNext, {
      duration: reduce ? 0 : 1.1,
      delay: reduce ? 0 : 0.25,
      ease: [0.16, 1, 0.3, 1]
    });

    let counterControls;
    const counterTimer = setTimeout(() => {
      triggerHaptic(isMilestone ? [18, 45, 24, 60, 30] : [18, 45, 24]);
      if (isMilestone) sound.playVictory();
      else sound.playSuccess();

      if (counterRef.current) {
        counterControls = animate(previousStreakDays, streakDays, {
          duration: reduce ? 0 : 0.9,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            if (counterRef.current) counterRef.current.textContent = Math.round(v);
          }
        });
      }
    }, reduce ? 0 : 500);

    return () => {
      ringControls.stop();
      counterControls?.stop();
      clearTimeout(counterTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    triggerHaptic(10);
    setIsSharing(true);
    try {
      const blob = await buildStreakResultCard({ streakDays, title, tier });
      await shareStreakResultCard(blob, { streakDays });
    } catch {}
    setIsSharing(false);
  };

  if (!streakInfo) return null;
  const highestReached = [...RULER_MILESTONES].reverse().find((m) => m <= streakDays) ?? null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[95] flex items-center justify-center p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ato 1: palco OLED com aura por patamar */}
        <div className="absolute inset-0 bg-black/95" aria-hidden />
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 38%, ${colors.glow}, transparent 60%)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.6 }}
        />

        <motion.div
          className="relative w-full max-w-sm flex flex-col items-center text-center"
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.1 }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
            {isMilestone ? `Marco atingido · ${title}` : 'Sequência em curso'}
          </p>

          {/* Ato 2: anel de progresso + emblema */}
          <div className="relative w-56 h-56 mt-5 flex items-center justify-center">
            <svg viewBox="0 0 220 220" className="absolute inset-0 -rotate-90">
              <circle cx="110" cy="110" r={RING_R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <motion.circle
                cx="110"
                cy="110"
                r={RING_R}
                fill="none"
                stroke={colors.primary}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                style={{ strokeDashoffset: ringOffset }}
              />
            </svg>

            <motion.div
              initial={{ scale: reduce ? 1 : 0.4, rotate: reduce ? 0 : -18, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: reduce ? 0 : 0.3 }}
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${colors.primary}40` }}
            >
              <Flame className="w-10 h-10" style={{ color: colors.primary }} strokeWidth={1.75} />
            </motion.div>
          </div>

          {/* Ato 3: contador em rolagem */}
          <div className="mt-5 flex items-baseline gap-2">
            <span ref={counterRef} className="font-display font-semibold text-white text-[72px] tracking-[-0.035em] leading-none tabular-nums">
              {previousStreakDays}
            </span>
            <span className="text-sm font-medium text-zinc-400">
              {streakDays === 1 ? 'dia seguido' : 'dias seguidos'}
            </span>
          </div>

          {title && (
            <h2 className="mt-1 font-heading font-bold text-2xl text-white tracking-[-0.02em]">{title}</h2>
          )}

          <p className="mt-1.5 text-xs text-zinc-400">
            {nextMilestone
              ? `Faltam ${nextMilestone - streakDays} ${nextMilestone - streakDays === 1 ? 'dia' : 'dias'} para o próximo marco (${nextMilestone})`
              : 'Já ultrapassaste todos os marcos — a tua própria referência.'}
          </p>

          {/* Ato 4: régua de marcos */}
          <motion.div
            className="mt-6 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.9 }}
          >
            {RULER_MILESTONES.map((m) => (
              <span
                key={m}
                className={`text-[11px] font-bold tabular-nums ${
                  m === highestReached ? 'text-white' : m <= streakDays ? 'text-zinc-500' : 'text-zinc-700'
                }`}
                style={m === highestReached ? { color: colors.primary } : undefined}
              >
                {m}
              </span>
            )).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, <span key={`dot-${i}`} className="text-zinc-700">·</span>, el]), [])}
          </motion.div>

          {/* Ações */}
          <motion.div
            className="mt-7 w-full space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 1.05 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[48px] py-3.5 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="w-full min-h-[40px] py-2 rounded-xl text-zinc-400 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharing ? 'A gerar…' : 'Partilhar sequência'}</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
