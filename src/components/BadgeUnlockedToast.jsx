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
        particleCount: 50,
        spread: 60,
        origin: { y: 0.25 }
      });
    } catch {}

    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed top-5 left-4 right-4 z-50 max-w-sm mx-auto animate-fadeIn">
      <div className="p-4 rounded-2xl bg-zinc-950 text-white border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0 border border-zinc-700">
            <Trophy className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Nova Conquista Desbloqueada
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5 truncate">
              {badge.title}
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
              {badge.desc}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
