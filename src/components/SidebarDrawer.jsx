import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  UserRound,
  Target,
  BookOpen,
  Volume2,
  VolumeX,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Cloud,
  HardDrive,
  Scale,
  Trash2,
  Dumbbell,
  Link2,
  Crown,
  Sparkles,
  Calculator,
  Bell,
  LifeBuoy
} from 'lucide-react';
import CoachAvatar from './coach/CoachAvatar';
import VerifiedBadge from './ui/VerifiedBadge';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../utils/userVerification';
import { canUseSocial, getMyProfile } from '../services/socialService';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';

const DeleteAccountSheet = lazy(() => import('./legal/DeleteAccountSheet'));
const LinkTrainerSheet = lazy(() => import('./trainer/LinkTrainerSheet'));

const SPRING = { type: 'spring', stiffness: 400, damping: 38 };

function SectionLabel({ children }) {
  return <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">{children}</p>;
}

function Row({ icon: Icon, label, hint, onClick, trailing, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[52px] flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer active:bg-white/[0.03] transition-colors"
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

/**
 * Gaveta lateral (esquerda) de gestão do atleta: aberta pelo gatilho do Header em qualquer
 * ecrã. Substitui o antigo AccountSheet enquanto ponto único de definições, conta e sessão.
 */
export default function SidebarDrawer({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenCustomize,
  onOpenGuide,
  onOpenAICoach,
  onOpenAdmin,
  onOpenTrainerHub,
  soundEnabled,
  onToggleSound
}) {
  const { user, isGuest, isCeo, isAdmin, isTrainer, isPro, isConfigured, signOut } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [linkingTrainer, setLinkingTrainer] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    if (!isOpen || !canUseSocial(userId)) return;
    let alive = true;
    getMyProfile(userId).then(({ data }) => {
      if (alive && data) setProfile(data);
    });
    return () => {
      alive = false;
    };
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmingLogout(false);
      return undefined;
    }
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const identity = {
    avatar: profile?.avatar_url || user?.user_metadata?.avatar_url || null,
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta',
    username: profile?.username || null
  };
  const ceo = isCeo || isAthleteCeo(profile || identity, user);
  const pro = isPro || isAthletePro(profile || identity, user);
  const verified = isAthleteVerified(profile || identity, user, isAdmin);
  const name = identity.fullName;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const synced = isConfigured && !isGuest;

  const run = (fn) => () => {
    triggerHaptic(10);
    onClose();
    fn?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Menu do atleta">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
          />

          <motion.aside
            className="relative h-full w-[86%] max-w-[360px] overflow-y-auto overscroll-contain bg-[#070709]/90 backdrop-blur-2xl backdrop-saturate-[180%] border-r border-white/[0.08] shadow-[12px_0_36px_rgba(0,0,0,0.7)] pt-[max(env(safe-area-inset-top,0px),16px)] pb-[max(env(safe-area-inset-bottom,0px),16px)] will-change-transform"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={SPRING}
          >
            {/* Cabeçalho da gaveta: identidade do atleta */}
            <div className="flex items-start gap-3.5 px-5 pb-4">
              <span className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-3 border-2 border-white/[0.14] flex items-center justify-center text-[18px] font-semibold text-white shrink-0">
                {identity.avatar ? <img src={identity.avatar} alt="" className="absolute inset-0 w-full h-full object-cover" /> : initials}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <p className="font-heading text-section font-semibold text-white truncate">{name}</p>
                  {verified && <VerifiedBadge size={15} />}
                </div>
                {identity.username && <p className="text-[13px] text-zinc-400 truncate">@{identity.username}</p>}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  {ceo && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                      <Crown className="w-3 h-3 text-amber-400" />
                      CEO
                    </span>
                  )}
                  {!ceo && pro && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-black uppercase tracking-wider">
                      PRO
                    </span>
                  )}
                </div>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
                  {synced ? <Cloud className="w-3.5 h-3.5" strokeWidth={1.75} /> : <HardDrive className="w-3.5 h-3.5" strokeWidth={1.75} />}
                  {synced ? 'Sincronizado na nuvem' : 'Guardado neste aparelho'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onClose();
                }}
                aria-label="Fechar menu"
                className="w-10 h-10 -mr-1.5 -mt-1 shrink-0 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* AB Coach em destaque */}
            <div className="px-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={run(onOpenAICoach)}
                className="w-full min-h-[52px] flex items-center gap-3 p-3 rounded-2xl bg-accent border border-accent-hover text-left cursor-pointer"
              >
                <CoachAvatar size={40} alt="" />
                <span className="flex-1 min-w-0">
                  <span className="block text-body font-semibold text-white">Falar com o AB Coach</span>
                  <span className="block text-[13px] text-zinc-300">Ajustes técnicos imediatos</span>
                </span>
                <Sparkles className="w-4 h-4 text-white shrink-0" strokeWidth={1.75} />
              </motion.button>
            </div>

            {/* Secção 1 · Atleta & Treino */}
            <div className="mt-5 px-2">
              <SectionLabel>Atleta &amp; Treino</SectionLabel>
              <div className="mx-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                <Row icon={UserRound} label="Perfil de atleta" hint="Foto, bio, @username e privacidade" onClick={run(() => onNavigateTab?.('profile'))} />
                <Row icon={Target} label="Metas e planos" hint="Recalibrar dias, foco e divisão com o AB Coach" onClick={run(onOpenCustomize)} />
                <Row icon={BookOpen} label="Manuais do atleta" hint="Biomecânica dos 348 exercícios, execução e nutrição" onClick={run(onOpenGuide)} />
              </div>
            </div>

            {/* Secção 2 · Experiência & Som */}
            <div className="mt-5 px-2">
              <SectionLabel>Experiência &amp; Som</SectionLabel>
              <div className="mx-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                <Row
                  icon={soundEnabled ? Volume2 : VolumeX}
                  label="Sons do treino"
                  hint={soundEnabled ? 'Efeitos e alertas de descanso ligados' : 'Efeitos e alertas de descanso desligados'}
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
              </div>
            </div>

            {/* Secção 3 · Conexão & Treinador */}
            {!isGuest && (
              <div className="mt-5 px-2">
                <SectionLabel>Conexão &amp; Treinador</SectionLabel>
                <div className="mx-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                  {isTrainer ? (
                    <Row icon={Dumbbell} label="Trainer Hub" hint="Os teus atletas e prescrições" onClick={run(onOpenTrainerHub)} />
                  ) : (
                    <Row icon={Link2} label="Vincular Personal Trainer" hint="Insere o código de 6 dígitos do teu PT" onClick={() => { triggerHaptic(10); setLinkingTrainer(true); }} />
                  )}
                </div>
              </div>
            )}

            {/* Secção 4 · Administração (condicional) */}
            {isAdmin && (
              <div className="mt-5 px-2">
                <SectionLabel>Administração</SectionLabel>
                <div className="mx-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
                  <Row
                    icon={ceo ? Crown : ShieldCheck}
                    label={ceo ? 'Painel Executivo CEO' : 'Painel admin'}
                    hint={ceo ? 'Waitlist, atletas e métricas de lançamento' : 'Atletas e sessões'}
                    onClick={run(onOpenAdmin)}
                  />
                </div>
              </div>
            )}

            {/* Secção 5 · Conta & Sessão */}
            <div className="mt-5 px-2">
              <SectionLabel>Conta &amp; Sessão</SectionLabel>
              <div className="mx-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
                <Row icon={Scale} label="Termos, privacidade e aviso médico" hint="Documentos legais" onClick={run(() => window.open('/privacidade', '_blank', 'noopener'))} />
                {confirmingLogout ? (
                  <div className="px-4 py-3 space-y-2">
                    <p className="text-[13px] text-zinc-300">Terminar sessão agora?</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingLogout(false)}
                        className="flex-1 min-h-[40px] rounded-xl bg-surface-3 border border-white/[0.08] text-white text-[13px] font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={run(signOut)}
                        className="flex-1 min-h-[40px] rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-[13px] font-bold cursor-pointer"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <Row
                    icon={LogOut}
                    label={isGuest ? 'Sair do modo convidado' : 'Terminar sessão'}
                    onClick={() => {
                      triggerHaptic(10);
                      setConfirmingLogout(true);
                    }}
                    trailing={null}
                    danger
                  />
                )}
                {synced && <Row icon={Trash2} label="Eliminar conta" hint="Apaga a conta e todos os dados" onClick={() => { triggerHaptic(10); setDeleting(true); }} trailing={null} danger />}
              </div>
            </div>

            {/* Área extensível (placeholder elegante) */}
            <div className="mt-5 px-2 pb-2">
              <SectionLabel>Em breve</SectionLabel>
              <div className="mx-2 rounded-2xl border border-dashed border-white/[0.1] p-3 flex items-center gap-4 text-zinc-600">
                <span className="flex flex-col items-center gap-1">
                  <Calculator className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[10px]">1RM</span>
                </span>
                <span className="flex flex-col items-center gap-1">
                  <Bell className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[10px]">Alertas</span>
                </span>
                <span className="flex flex-col items-center gap-1">
                  <LifeBuoy className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-[10px]">Suporte</span>
                </span>
              </div>
            </div>
          </motion.aside>

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
      )}
    </AnimatePresence>
  );
}
