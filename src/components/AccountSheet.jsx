import React, { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, UserRound, Target, BookOpen, Volume2, VolumeX, ShieldCheck, LogOut, ChevronRight, Cloud, HardDrive, Scale, Trash2, Dumbbell, Link2 } from 'lucide-react';
import CoachAvatar from './coach/CoachAvatar';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';

const DeleteAccountSheet = lazy(() => import('./legal/DeleteAccountSheet'));
const LinkTrainerSheet = lazy(() => import('./trainer/LinkTrainerSheet'));

const SPRING = { type: 'spring', stiffness: 420, damping: 40 };

function Row({ icon: Icon, label, hint, onClick, trailing, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[56px] flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer active:bg-white/[0.03] transition-colors"
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${danger ? 'border-red-400/20 text-red-400 bg-red-400/[0.06]' : 'bg-white/[0.04] border-white/[0.06] text-zinc-300'}`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-body font-medium ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span>
        {hint && <span className="block text-[13px] text-zinc-400 truncate">{hint}</span>}
      </span>
      {trailing ?? <ChevronRight className="w-4 h-4 text-zinc-600" strokeWidth={1.75} />}
    </button>
  );
}

/** Folha "Conta": substitui o antigo menu hambúrguer (sem repetir os destinos da barra inferior). */
export default function AccountSheet({ identity, soundEnabled, onToggleSound, onClose, onEditProfile, onOpenCustomize, onOpenGuide, onOpenAICoach, onOpenAdmin, onOpenTrainerHub }) {
  const { user, isGuest, isAdmin, isTrainer, isConfigured, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [linkingTrainer, setLinkingTrainer] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const run = (fn) => () => {
    triggerHaptic(10);
    onClose();
    fn?.();
  };

  const name = identity.fullName || user?.email?.split('@')[0] || 'Atleta';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const synced = isConfigured && !isGuest;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Conta">
      <motion.div className="absolute inset-0 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] will-change-transform"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
      >
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        {/* Identidade */}
        <div className="flex items-center gap-3.5 px-5 pt-4 pb-4">
          <span className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-3 border border-white/[0.1] flex items-center justify-center text-[18px] font-semibold text-white shrink-0">
            {identity.avatar ? <img src={identity.avatar} alt="" className="absolute inset-0 w-full h-full object-cover" /> : initials}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-section font-semibold text-white truncate">{name}</p>
            <p className="text-[13px] text-zinc-400 truncate">{isGuest ? 'Modo convidado' : user?.email}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
              {synced ? <Cloud className="w-3.5 h-3.5" strokeWidth={1.75} /> : <HardDrive className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {synced ? 'Sincronizado na conta' : 'Guardado neste aparelho'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-11 h-11 -mr-2 self-start rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* AB Coach em destaque */}
        <div className="px-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={run(onOpenAICoach)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-accent border border-accent-hover text-left cursor-pointer"
          >
            <CoachAvatar size={44} alt="" />
            <span className="flex-1 min-w-0">
              <span className="block text-body font-semibold text-white">Falar com o AB Coach</span>
              <span className="block text-[13px] text-zinc-300">Treinos, técnica e ajustes ao plano</span>
            </span>
            <ChevronRight className="w-4 h-4 text-white" strokeWidth={1.75} />
          </motion.button>
        </div>

        <div className="mt-3 mx-4 rounded-2xl bg-surface-2 border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
          {!isGuest && onEditProfile && <Row icon={UserRound} label="Perfil de atleta" hint="Foto, @username e privacidade" onClick={run(onEditProfile)} />}
          <Row icon={Target} label="Metas e plano" hint="Refazer a calibração com o AB Coach" onClick={run(onOpenCustomize)} />
          <Row icon={BookOpen} label="Manuais do atleta" hint="Biomecânica, execução e nutrição" onClick={run(onOpenGuide)} />
          <Row
            icon={soundEnabled ? Volume2 : VolumeX}
            label="Sons do treino"
            hint={soundEnabled ? 'Ligados' : 'Desligados'}
            onClick={() => {
              triggerHaptic(8);
              onToggleSound?.(!soundEnabled);
            }}
            trailing={
              <span className={`relative w-[46px] h-[28px] rounded-full border transition-colors duration-150 ${soundEnabled ? 'bg-accent border-accent-hover' : 'bg-surface-3 border-white/[0.08]'}`} aria-hidden>
                <motion.span className="absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white" animate={{ x: soundEnabled ? 18 : 0 }} transition={{ type: 'spring', stiffness: 520, damping: 40 }} />
              </span>
            }
          />
          {isTrainer && onOpenTrainerHub && <Row icon={Dumbbell} label="Trainer Hub" hint="Os teus atletas e prescrições" onClick={run(onOpenTrainerHub)} />}
          {!isTrainer && !isGuest && (
            <Row icon={Link2} label="Vincular Personal Trainer" hint="Insere o código de 6 dígitos do teu PT" onClick={() => { triggerHaptic(10); setLinkingTrainer(true); }} />
          )}
          {isAdmin && <Row icon={ShieldCheck} label="Painel admin" hint="Atletas e sessões" onClick={run(onOpenAdmin)} />}
        </div>

        <div className="mt-3 mx-4 rounded-2xl bg-surface-2 border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
          <Row icon={LogOut} label={isGuest ? 'Sair do modo convidado' : 'Terminar sessão'} onClick={run(signOut)} trailing={null} danger />
          {synced && <Row icon={Trash2} label="Eliminar conta" hint="Apaga a conta e todos os dados" onClick={() => setDeleting(true)} trailing={null} danger />}
        </div>

        <div className="mt-3 mx-4 rounded-2xl bg-surface-2 border border-white/[0.08] overflow-hidden">
          <Row icon={Scale} label="Termos, privacidade e aviso médico" hint="Documentos legais" onClick={() => window.open('/privacidade', '_blank', 'noopener')} />
        </div>
      </motion.div>
      {deleting && (
        <Suspense fallback={null}>
          <DeleteAccountSheet onClose={() => setDeleting(false)} />
        </Suspense>
      )}
      {linkingTrainer && (
        <Suspense fallback={null}>
          <LinkTrainerSheet onClose={() => setLinkingTrainer(false)} />
        </Suspense>
      )}
    </div>
  );
}
