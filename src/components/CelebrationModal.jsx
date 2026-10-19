import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, CheckCircle, Dumbbell, Sparkles, Share2, ArrowRight } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

export default function CelebrationModal({ 
  workout, 
  durationMinutes = 0, 
  totalSetsCompleted = 0, 
  totalVolumeKg = 0, 
  unlockedBadge = null,
  onClose 
}) {
  useEffect(() => {
    // Tocar fanfarra e haptic
    sound.playCelebration();
    triggerHaptic([50, 100, 50, 150, 50, 200]);

    // Disparar confetes elegantes nas cores do tema (Preto, branco, prata, ciano sutil)
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#ffffff', '#000000', '#38bdf8', '#71717a', '#f4f4f5'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleShare = async () => {
    const textToShare = `Treino concluído no AB Fitness! 💪\n"Consistência gera evolução permanente."\nTempo: ${durationMinutes} min • ${totalSetsCompleted} séries • ${totalVolumeKg} kg levantados.\nFoco e evolução contínua! ⚡`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Treino Concluído — AB Fitness',
          text: textToShare,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        alert('Resumo copiado para a área de transferência!');
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#121215] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex flex-col animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner com Troféu */}
        <div className="relative pt-7 pb-5 px-6 bg-zinc-50 dark:bg-zinc-900/50 text-center flex flex-col items-center border-b border-zinc-100 dark:border-zinc-800/80">
          {/* Círculo do Troféu */}
          <div className="relative w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg mb-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <span className="absolute -top-1 -right-1 p-1 bg-zinc-800 dark:bg-zinc-200 rounded-full text-white dark:text-black shadow-xs">
              <Sparkles className="w-3 h-3 text-sky-400 fill-current" />
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão Finalizada</span>
          </span>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Treino Concluído
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
            {(workout?.title && workout?.name && workout.title !== workout.name) 
              ? `${workout.title} • ${workout.name}` 
              : (workout?.title || workout?.name || 'Treino Concluído')}
          </p>
        </div>

        {/* Mensagem de Consistência ou Conquista Desbloqueada */}
        <div className="px-5 py-3">
          {unlockedBadge ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-left flex items-center gap-3">
              <span className="text-3xl shrink-0">{unlockedBadge.icon || '🏆'}</span>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider block">
                  Nova Conquista Desbloqueada!
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                  {unlockedBadge.title}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                  {unlockedBadge.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 text-center">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-tight leading-snug mb-1">
                Consistência gera evolução permanente.
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Cargas e repetições salvas com sucesso no seu histórico.
              </p>
            </div>
          )}
        </div>

        {/* Resumo Estatístico do Treino */}
        <div className="px-5 py-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex justify-center text-zinc-400 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {durationMinutes} <span className="text-[10px] font-normal text-zinc-400">min</span>
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Tempo</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex justify-center text-emerald-500 mb-1">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {totalSetsCompleted}
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Séries</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex justify-center text-zinc-400 mb-1">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {totalVolumeKg} <span className="text-[10px] font-normal text-zinc-400">kg</span>
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Volume</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-5 pt-3 space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>Concluir e Voltar ao Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs border border-zinc-200/80 dark:border-zinc-800 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Compartilhar Resumo do Treino</span>
          </button>
        </div>
      </div>
    </div>
  );
}
