import React, { useEffect, useRef, useState } from 'react';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import confetti from 'canvas-confetti';
import { Trophy, Clock, CheckCircle, Check, Dumbbell, Sparkles, Share2, ArrowRight, Copy } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';
import { buildWorkoutResultCard, shareWorkoutResultCard, copyWorkoutResultCardToClipboard } from '../utils/workoutResultCard';

const CARD_VARIANTS = [
  { id: 'card', label: 'Cartão' },
  { id: 'sticker-white', label: 'Sticker claro' },
  { id: 'sticker-dark', label: 'Sticker escuro' }
];

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
  const [copied, setCopied] = useState(false);
  const [cardVariant, setCardVariant] = useState('card');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const previewUrlRef = useRef(null);

  const cardParams = {
    workoutName: (workout?.title && workout?.name && workout.title !== workout.name)
      ? `${workout.title} • ${workout.name}`
      : (workout?.title || workout?.name),
    durationMinutes,
    totalSetsCompleted,
    totalVolumeKg,
    newPRs
  };

  // Pré-visualização ao vivo: regenera o Canvas sempre que a variante muda
  useEffect(() => {
    let active = true;
    buildWorkoutResultCard(cardParams, cardVariant).then((blob) => {
      if (!active || !blob) return;
      const url = URL.createObjectURL(blob);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    }).catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardVariant]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    // Tocar fanfarra e haptic
    sound.playCelebration();
    triggerHaptic([50, 100, 50, 150, 50, 200]);

    // Disparar confetes elegantes nas cores do tema (Preto, branco, prata, ciano sutil)
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#ffffff', '#000000', '#ffffff', '#71717a', '#f4f4f5'];

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
    triggerHaptic(10);
    setIsSharing(true);
    try {
      const blob = await buildWorkoutResultCard(cardParams, cardVariant);
      await shareWorkoutResultCard(blob, { hasPRs: newPRs?.length > 0 });
    } catch {
      // Falha a gerar/partilhar o cartão (ex.: navegador sem suporte a Canvas/Share) -> texto simples
      const textToShare = `Treino concluído no AB Fitness!\n"Consistência gera evolução permanente."\nTempo: ${durationMinutes} min • ${totalSetsCompleted} séries • ${totalVolumeKg} kg levantados.\nFoco e evolução contínua!`;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Treino Concluído — AB Fitness', text: textToShare });
        } catch {}
      } else {
        try {
          await navigator.clipboard.writeText(textToShare);
          triggerHaptic(15);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {}
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyImage = async () => {
    triggerHaptic(10);
    setIsSharing(true);
    try {
      const blob = await buildWorkoutResultCard(cardParams, cardVariant);
      const ok = await copyWorkoutResultCardToClipboard(blob);
      if (ok) {
        triggerHaptic(15);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        await shareWorkoutResultCard(blob, { hasPRs: newPRs?.length > 0 });
      }
    } catch {}
    setIsSharing(false);
  };

  return (
    <ModalBackdrop className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <ModalPanel 
        className="w-full max-w-sm bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner com Troféu */}
        {/* O AB Coach celebra contigo (treino concluído ou novo PR) */}
        <div className="relative aspect-[16/9] bg-app overflow-hidden">
          <img
            src="/coach/ab-coach-celebrate.jpg"
            alt="AB Coach a celebrar o teu treino"
            width={800}
            height={447}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-[50%_30%]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950 to-transparent" />
          {newPRs?.length > 0 && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-app text-[12px] font-bold">
              <Trophy className="w-3.5 h-3.5" strokeWidth={2.25} />
              {newPRs.length === 1 ? 'Novo PR' : `${newPRs.length} novos PRs`}
            </span>
          )}
        </div>
        <div className="relative -mt-2 pb-5 px-6 text-center flex flex-col items-center border-b border-white/10">

          <span className="px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 text-xs font-semibold mb-1 flex items-center gap-1.5 border border-white/[0.1]">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sessão finalizada</span>
          </span>

          <h2 className="text-xl font-black text-white tracking-tight">
            Treino Concluído
          </h2>

          <p className="text-xs text-zinc-400 font-semibold mt-0.5">
            {(workout?.title && workout?.name && workout.title !== workout.name) 
              ? `${workout.title} • ${workout.name}` 
              : (workout?.title || workout?.name || 'Treino Concluído')}
          </p>
        </div>

        {/* Mensagem de Consistência, Conquistas ou Novos PRs */}
        <div className="px-5 py-3 space-y-2">
          {/* Destaque de Novos Recordes Pessoais (PR) */}
          {newPRs && newPRs.length > 0 && (
            <div className="p-3 rounded-xl bg-accent/70 border border-accent-hover text-left flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-black shrink-0">
                <Trophy className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                  {newPRs.length === 1 ? 'Novo Recorde Pessoal (PR)!' : `${newPRs.length} Novos Recordes Pessoais!`}
                </span>
                <p className="text-xs font-bold text-zinc-100 truncate">
                  {newPRs.map(p => p.isTimed ? `${p.exerciseName} (${p.duration}s)` : `${p.exerciseName} (${p.e1RM}kg 1RM)`).join(' • ')}
                </p>
              </div>
            </div>
          )}

          {/* Destaque de Análise do Treinador Inteligente (AB Coach) */}
          {coachNarrative && (
            <div className="p-3.5 rounded-xl bg-accent text-white border border-accent-hover text-left flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center font-black shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white/80 block">
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
                <div key={i} className="p-2.5 rounded-xl bg-surface border border-white/10 text-left text-xs text-zinc-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  <span className="font-medium text-[11px] leading-tight">{h.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Estatístico do Treino: texto corrido, sem caixa */}
        <div className="px-5 py-2">
          <div className="flex items-center justify-center gap-6 text-center">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-base font-black text-white font-mono tabular-nums">
                {durationMinutes}<span className="text-xs font-normal text-zinc-400 font-sans"> min</span>
              </span>
            </div>

            <div className="w-px h-5 bg-white/10" aria-hidden />

            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-base font-black text-white font-mono tabular-nums">
                {totalSetsCompleted}<span className="text-xs font-normal text-zinc-400 font-sans"> séries</span>
              </span>
            </div>

            <div className="w-px h-5 bg-white/10" aria-hidden />

            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-zinc-500" />
              <span className="text-base font-black text-white font-mono tabular-nums">
                {totalVolumeKg}<span className="text-xs font-normal text-zinc-400 font-sans"> kg</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pré-visualização & Escolha de Formato de Partilha */}
        <div className="px-5 pt-1">
          <div className="flex gap-3 items-start">
            <div
              className="w-20 shrink-0 rounded-xl overflow-hidden border border-white/10"
              style={cardVariant === 'card' ? undefined : {
                backgroundImage: 'linear-gradient(45deg, #27272a 25%, transparent 25%), linear-gradient(-45deg, #27272a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272a 75%), linear-gradient(-45deg, transparent 75%, #27272a 75%)',
                backgroundSize: '10px 10px',
                backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                backgroundColor: '#18181b'
              }}
            >
              {previewUrl && (
                <img src={previewUrl} alt="Pré-visualização do cartão de partilha" className="w-full aspect-[9/16] object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-[11px] text-zinc-500">
                {cardVariant === 'card' ? 'Cartão com fundo — pronto a partilhar sozinho.' : 'Fundo transparente — cola por cima de uma foto no Stories.'}
              </p>
              <div className="flex flex-col gap-1">
                {CARD_VARIANTS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setCardVariant(v.id);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      cardVariant === v.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="p-5 pt-3 space-y-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>Concluir e Voltar ao Painel</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="min-h-[44px] py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Partilhar</span>
            </button>

            <button
              onClick={handleCopyImage}
              disabled={isSharing}
              className="min-h-[44px] py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copiar imagem</span>
                </>
              )}
            </button>
          </div>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
