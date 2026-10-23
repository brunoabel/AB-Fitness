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
  newPRs = [],
  insights = null,
  coachNarrative = null,
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
    const textToShare = `Treino concluído no AB Fitness!\n"Consistência gera evolução permanente."\nTempo: ${durationMinutes} min • ${totalSetsCompleted} séries • ${totalVolumeKg} kg levantados.\nFoco e evolução contínua!`;
    
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
        className="w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner com Troféu */}
        <div className="relative pt-7 pb-5 px-6 bg-zinc-50 dark:bg-zinc-900/60 text-center flex flex-col items-center border-b border-zinc-200 dark:border-zinc-800">
          {/* Caixa do Troféu */}
          <div className="w-14 h-14 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center shadow-md mb-3">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>

          <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão Finalizada</span>
          </span>

          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
            Treino Concluído
          </h2>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
            {(workout?.title && workout?.name && workout.title !== workout.name) 
              ? `${workout.title} • ${workout.name}` 
              : (workout?.title || workout?.name || 'Treino Concluído')}
          </p>
        </div>

        {/* Mensagem de Consistência, Conquistas ou Novos PRs */}
        <div className="px-5 py-3 space-y-2">
          {/* Destaque de Novos Recordes Pessoais (PR) */}
          {newPRs && newPRs.length > 0 && (
            <div className="p-3 rounded-xl bg-[#c6f432]/15 border border-[#c6f432]/30 text-left flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#c6f432] text-zinc-950 flex items-center justify-center font-black shrink-0">
                <Trophy className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-[#c6f432] uppercase tracking-wider block">
                  {newPRs.length === 1 ? 'Novo Recorde Pessoal (PR)!' : `${newPRs.length} Novos Recordes Pessoais!`}
                </span>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {newPRs.map(p => `${p.exerciseName} (${p.e1RM}kg 1RM)`).join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Destaque de Análise do Treinador Inteligente (AB Coach) */}
          {coachNarrative && (
            <div className="p-3.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-800 dark:border-zinc-200 text-left flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-[#c6f432] text-zinc-950 flex items-center justify-center font-black shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#c6f432] dark:text-zinc-900 block">
                  Análise AB Coach
                </span>
                <p className="text-xs font-semibold leading-relaxed mt-0.5">
                  {coachNarrative}
                </p>
              </div>
            </div>
          )}

          {/* Destaques Determinísticos (Variação de Volume / Sobrecarga) */}
          {insights?.highlights && insights.highlights.length > 0 && !coachNarrative && (
            <div className="space-y-1.5">
              {insights.highlights.slice(0, 2).map((h, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-left text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#c6f432] shrink-0" />
                  <span className="font-medium text-[11px] leading-tight">{h.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Estatístico do Treino */}
        <div className="px-5 py-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-center text-zinc-400 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono tabular-nums">
                {durationMinutes} <span className="text-[10px] font-normal text-zinc-400 font-sans">min</span>
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Tempo</div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-center text-emerald-500 mb-1">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono tabular-nums">
                {totalSetsCompleted}
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Séries</div>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-center text-zinc-400 mb-1">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono tabular-nums">
                {totalVolumeKg} <span className="text-[10px] font-normal text-zinc-400 font-sans">kg</span>
              </div>
              <div className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">Volume</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-5 pt-3 space-y-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>Concluir e Voltar ao Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>Partilhar Resumo do Treino</span>
          </button>
        </div>
      </div>
    </div>
  );
}
