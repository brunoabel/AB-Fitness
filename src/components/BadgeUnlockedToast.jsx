import React, { useEffect } from 'react';
import { Trophy, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound, triggerHaptic } from '../utils/audio';

export default function BadgeUnlockedToast({ badge, onClose }) {
  useEffect(() => {
    if (!badge) return;

    try {
      sound.playVictory();
      triggerHaptic(50);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.3 }
      });
    } catch {}

    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed top-5 left-4 right-4 z-50 max-w-sm mx-auto animate-bounceIn">
      <div className="p-4 rounded-3xl bg-zinc-900 border-2 border-amber-500/80 text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 text-black flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              NOVA CONQUISTA DESBLOQUEADA!
            </span>
            <h4 className="text-sm font-black text-white mt-0.5 truncate">
              {badge.title}
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5 line-clamp-2">
              {badge.desc}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-xl text-zinc-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
