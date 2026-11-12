import React, { useEffect, useState } from 'react';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import confetti from 'canvas-confetti';
import { Trophy, Share2, ArrowRight, Check } from 'lucide-react';
import { sound, triggerHaptic } from '../utils/audio';
import { ICON_MAP } from './BadgesView';
import { buildBadgeResultCard, shareBadgeResultCard } from '../utils/badgeResultCard';

const TIER_LABEL = { gold: 'Medalha de Ouro', silver: 'Medalha de Prata', bronze: 'Medalha de Bronze' };

const CATEGORY_NARRATIVE = {
  running: 'Cada quilómetro fica registado. É assim que se constrói uma base aeróbica a sério.',
  gym: 'Sobrecarga progressiva não é sorte, é disciplina repetida. Continua a somar.',
  consistency: 'A consistência é o verdadeiro atalho. Hoje provaste isso outra vez.'
};

/**
 * Celebração imersiva de desbloqueio de medalha — mesmo nível de produção do CelebrationModal
 * de Recorde Pessoal (confetes, haptic profundo, fanfarra e partilha em cartão 9:16), para que
 * uma conquista não seja um simples toast enquanto um PR ganha um ecrã inteiro.
 */
export default function BadgeCelebrationModal({ badge, onClose }) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const IconComponent = ICON_MAP[badge?.icon] || Trophy;
  const color = badge?.color || '#ffffff';
  const tierLabel = TIER_LABEL[badge?.tier] || 'Nova Conquista';
  const narrative = CATEGORY_NARRATIVE[badge?.category] || 'Mais uma prova do teu progresso no AB Fitness.';

  useEffect(() => {
    sound.playVictory();
    triggerHaptic([50, 100, 50, 150, 50, 200]);

    const end = Date.now() + 2.5 * 1000;
    const colors = [color, '#ffffff', '#000000', '#f4f4f5'];

    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    triggerHaptic(10);
    setIsSharing(true);
    try {
      const blob = await buildBadgeResultCard(badge);
      await shareBadgeResultCard(blob, badge);
    } catch {
      const textToShare = `Desbloqueei "${badge?.title}" no AB Fitness!\n${badge?.desc || ''}`;
      if (navigator.share) {
        try { await navigator.share({ title: `${badge?.title} — AB Fitness`, text: textToShare }); } catch {}
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

  if (!badge) return null;

  return (
    <ModalBackdrop className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <ModalPanel
        className="w-full max-w-sm bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Medalhão em destaque com halo especular na cor do tier */}
        <div className="relative pt-10 pb-6 px-6 flex flex-col items-center text-center overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-64"
            style={{ background: `radial-gradient(circle at 50% 10%, ${color}33, transparent 70%)` }}
          />
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center border-2 shadow-[0_0_40px_rgba(255,255,255,0.08)]"
            style={{ borderColor: color, background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="absolute inset-[6px] rounded-full border border-white/10" aria-hidden />
            <IconComponent className="w-11 h-11" style={{ color }} strokeWidth={1.75} />
          </div>

          <span className="relative mt-4 text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
            {tierLabel} · Desbloqueada
          </span>
          <h2 className="relative mt-1 text-2xl font-black text-white tracking-tight leading-tight">
            {badge.title}
          </h2>
          <p className="relative mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-[280px]">
            {badge.desc}
          </p>
        </div>

        {/* Narrativa motivacional curta */}
        <div className="px-5 pb-2">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}1a`, color }}>
              <Trophy className="w-4 h-4 stroke-[2.25]" />
            </div>
            <p className="text-xs font-medium text-zinc-200 leading-relaxed">
              {narrative}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="p-5 pt-3 space-y-2">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <span>Continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                <span className="text-emerald-400">Resumo Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isSharing ? 'A gerar cartão...' : 'Partilhar Troféu'}</span>
              </>
            )}
          </button>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
