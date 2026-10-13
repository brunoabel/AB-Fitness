import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, CheckCircle, Dumbbell, Sparkles, Share2, ArrowRight, Flame } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';

export default function CelebrationModal({ 
  workout, 
  durationMinutes = 0, 
  totalSetsCompleted = 0, 
  totalVolumeKg = 0, 
  onClose 
}) {
  useEffect(() => {
    // Tocar fanfarra e haptic
    sound.playCelebration();
    triggerHaptic([50, 100, 50, 150, 50, 200]);

    // Disparar confetes elegantes nas cores do tema (Azul bebê, ciano, branco, dourado)
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#38bdf8', '#7dd3fc', '#bae6fd', '#0284c7', '#ffffff', '#fcd34d'];

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
    const textToShare = `Treino concluído no AB Fitness! 💪\n"Excelente treino! Disciplina é a ponte entre metas e conquistas."\nTempo: ${durationMinutes} min • ${totalSetsCompleted} séries • ${totalVolumeKg} kg levantados.\nFoco e evolução contínua! ⚡`;
    
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
        alert('Resumo copiado para a área de transferência! Compartilhe seu progresso!');
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-sky-100 dark:border-slate-800 flex flex-col animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner com Troféu e Brilhos */}
        <div className="relative pt-7 pb-5 px-6 bg-gradient-to-b from-sky-100/80 dark:from-sky-950/40 via-sky-50/40 dark:via-slate-900 to-white dark:to-slate-900 text-center flex flex-col items-center">
          {/* Círculo do Troféu com Glow */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-sky-400/30 mb-3 animate-bounce-subtle">
            <Trophy className="w-10 h-10 text-amber-200" />
            <span className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-white shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 text-[11px] font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Treino Concluído com Sucesso!</span>
          </span>

          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Missão Cumprida!
          </h2>

          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
            {workout?.title} • {workout?.name}
          </p>
        </div>

        {/* Mensagem Motivacional e Positiva de Atleta */}
        <div className="px-5 py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 dark:from-slate-800/80 to-slate-50 dark:to-slate-800/40 border border-sky-200/80 dark:border-sky-500/20 text-center relative overflow-hidden shadow-inner">
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-sky-300/20 rounded-full blur-xl pointer-events-none" />
            
            <p className="text-base font-extrabold text-slate-800 dark:text-sky-200 tracking-tight leading-snug mb-1.5">
              “Excelente treino! Nos vemos amanhã mais fortes.” ⚡🏆
            </p>
            
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              A consistência diária é o segredo dos grandes resultados. Você deu o seu melhor hoje e o seu corpo vai responder na mesma moeda.
            </p>
            
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block mt-2">
              — AB Fitness • Gestão de Treinos
            </span>
          </div>
        </div>

        {/* Resumo Estatístico do Treino */}
        <div className="px-5 py-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-center text-sky-500 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-800 dark:text-white">
                {durationMinutes} <span className="text-[10px] font-normal text-slate-400">min</span>
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase">Tempo</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-center text-emerald-500 mb-1">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-800 dark:text-white">
                {totalSetsCompleted}
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase">Séries</div>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex justify-center text-sky-500 mb-1">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div className="text-base font-black text-slate-800 dark:text-white">
                {totalVolumeKg} <span className="text-[10px] font-normal text-slate-400">kg</span>
              </div>
              <div className="text-[9px] text-slate-400 font-bold uppercase">Volume</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-5 pt-0 space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-extrabold text-sm shadow-md shadow-sky-400/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Bora pro Próximo Play</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Mandar a Resenha no WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
