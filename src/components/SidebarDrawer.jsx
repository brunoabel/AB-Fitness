import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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
  Watch,
  Flame
} from 'lucide-react';
import CoachAvatar from './coach/CoachAvatar';
import VerifiedBadge from './ui/VerifiedBadge';
import { useAthleteIdentity } from '../hooks/useAthleteIdentity';
import { triggerHaptic } from '../utils/audio';

const DeleteAccountSheet = lazy(() => import('./legal/DeleteAccountSheet'));
const LinkTrainerSheet = lazy(() => import('./trainer/LinkTrainerSheet'));
const WearablesModal = lazy(() => import('./wearables/WearablesModal'));

const SPRING = { type: 'spring', stiffness: 400, damping: 38 };

function SectionLabel({ children }) {
  return (
    <p className="px-5 pt-6 pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">
      {children}
    </p>
  );
}

function DrawerRow({ icon: Icon, label, hint, onClick, trailing, danger = false, isLast = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full min-h-[52px] px-5 py-3 flex items-center gap-3.5 text-left cursor-pointer touch-manipulation hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors ${
        isLast ? '' : 'border-b border-white/[0.04]'
      }`}
    >
      <Icon
        className={`w-[18px] h-[18px] shrink-0 transition-colors ${
          danger ? 'text-rose-400/90 group-hover:text-rose-300' : 'text-zinc-400 group-hover:text-white'
        }`}
        strokeWidth={1.75}
      />
      <span className="flex-1 min-w-0">
        <span className={`block text-[15px] font-medium leading-snug ${danger ? 'text-rose-400' : 'text-white'}`}>
          {label}
        </span>
        {hint && (
          <span className="block text-[12px] text-zinc-400 truncate mt-0.5">
            {hint}
          </span>
        )}
      </span>
      {trailing !== undefined ? (
        trailing
      ) : (
        <ChevronRight
          className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0"
          strokeWidth={1.75}
        />
      )}
    </button>
  );
}

/**
 * Athlete Passport Drawer: folha editorial contínua em OLED Dark Luxury.
 * Substitui pilhas de caixas fechadas por fluxo tipográfico limpo, ícones livres,
 * identidade atlética em destaque e alvos táteis >= 52px.
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
  onToggleSound,
  completedDays = null,
  schedule = []
}) {
  const reducedMotion = useReducedMotion();
  const [deleting, setDeleting] = useState(false);
  const [linkingTrainer, setLinkingTrainer] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [wearablesOpen, setWearablesOpen] = useState(false);

  const {
    isGuest,
    isAdmin,
    isTrainer,
    signOut,
    avatar,
    fullName,
    username,
    initials,
    ceo,
    pro,
    verified,
    synced,
    streak,
    rank,
    wearablesStatus,
    refreshWearables
  } = useAthleteIdentity({ refreshKey: isOpen, completedDays, schedule });

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setConfirmingLogout(false);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    setConfirmingLogout(false);
    triggerHaptic(8);
    onClose?.();
  };

  const run = (fn) => () => {
    setConfirmingLogout(false);
    triggerHaptic(10);
    onClose?.();
    fn?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Menu do atleta">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            onClick={handleClose}
          />

          <motion.aside
            className="relative h-full w-[88%] max-w-[368px] overflow-y-auto overscroll-contain bg-[#06070a]/95 backdrop-blur-2xl backdrop-saturate-[180%] border-r border-white/[0.08] shadow-[16px_0_48px_rgba(0,0,0,0.85)] pt-[max(env(safe-area-inset-top,0px),16px)] pb-[max(env(safe-area-inset-bottom,0px),20px)] will-change-transform select-none"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={reducedMotion ? { duration: 0 } : SPRING}
          >
            {/* Halo sutil de fundo no topo do passaporte */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute top-0 inset-x-0 h-44 blur-2xl opacity-60 ${
                ceo
                  ? 'bg-gradient-to-b from-amber-500/[0.12] via-amber-500/[0.03] to-transparent'
                  : 'bg-gradient-to-b from-white/[0.06] to-transparent'
              }`}
            />

            {/* Hero: Cabeçalho de Dossiê Atlético */}
            <div className="relative flex items-start gap-3.5 px-5 pb-5">
              <span className="relative w-14 h-14 rounded-full overflow-hidden bg-zinc-900 ring-2 ring-white/[0.16] flex items-center justify-center text-[18px] font-semibold text-white shrink-0">
                {avatar ? (
                  <img src={avatar} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </span>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="font-heading text-[20px] font-bold tracking-tight text-white truncate">
                    {fullName}
                  </p>
                  {verified && <VerifiedBadge size={15} />}
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {username && (
                    <span className="text-[12px] text-zinc-400 truncate">@{username}</span>
                  )}
                  {ceo && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35 text-[10px] font-bold uppercase tracking-wider">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      CEO
                    </span>
                  )}
                  {!ceo && pro && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.09] text-white border border-white/[0.15] text-[10px] font-bold uppercase tracking-wider">
                      PRO
                    </span>
                  )}
                  {streak > 0 && (
                    <span className="inline-flex items-center gap-1 font-display tabular-nums text-[12px] font-bold text-amber-300">
                      <Flame className="w-3 h-3 text-amber-400" strokeWidth={2} />
                      {streak}d
                    </span>
                  )}
                </div>

                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-zinc-400">
                  {synced ? (
                    <Cloud className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.75} />
                  ) : (
                    <HardDrive className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.75} />
                  )}
                  <span>
                    {rank.label} · {synced ? 'Sincronizado na nuvem' : 'Guardado neste aparelho'}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar menu"
                className="min-w-[44px] min-h-[44px] -mr-2 -mt-1.5 shrink-0 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer touch-manipulation transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Faixa Conversacional: AB Coach */}
            <div className="px-5 pb-1">
              <motion.button
                type="button"
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                onClick={run(onOpenAICoach)}
                className="group relative w-full min-h-[56px] px-4 py-3 rounded-2xl overflow-hidden bg-gradient-to-r from-accent/35 via-white/[0.05] to-white/[0.02] hover:from-accent/45 hover:via-white/[0.08] border border-white/[0.12] flex items-center gap-3 text-left cursor-pointer touch-manipulation transition-colors"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <span className="shrink-0 rounded-full p-0.5 ring-1 ring-white/[0.18]">
                  <CoachAvatar size={36} alt="" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold text-white">
                    Falar com o AB Coach
                  </span>
                  <span className="block text-[12px] text-zinc-300 truncate">
                    Ajustes biomecânicos e metas
                  </span>
                </span>
                <Sparkles className="w-4 h-4 text-zinc-200 group-hover:text-white shrink-0" strokeWidth={1.75} />
              </motion.button>
            </div>

            {/* Fluxo Editorial Sem Blocos Empilhados */}
            <div className="divide-y divide-white/[0.06]">
              <div>
                <SectionLabel>Carreira &amp; Treino</SectionLabel>
                <DrawerRow
                  icon={UserRound}
                  label="Perfil de atleta"
                  hint="Foto, bio, @username e privacidade"
                  onClick={run(() => onNavigateTab?.('profile'))}
                />
                <DrawerRow
                  icon={Target}
                  label="Metas e planos"
                  hint="Recalibrar dias, foco e divisão com o AB Coach"
                  onClick={run(onOpenCustomize)}
                />
                <DrawerRow
                  icon={BookOpen}
                  label="Manuais do atleta"
                  hint="Biomecânica dos 348 exercícios, execução e nutrição"
                  onClick={run(onOpenGuide)}
                  isLast
                />
              </div>

              <div>
                <SectionLabel>Sensores &amp; Dispositivos</SectionLabel>
                <DrawerRow
                  icon={Watch}
                  label="Dispositivos &amp; Wearables"
                  hint={wearablesStatus}
                  onClick={() => {
                    triggerHaptic(10);
                    setWearablesOpen(true);
                  }}
                  isLast={isGuest}
                />
                {!isGuest && (
                  isTrainer ? (
                    <DrawerRow
                      icon={Dumbbell}
                      label="Trainer Hub"
                      hint="Os teus atletas e prescrições"
                      onClick={run(onOpenTrainerHub)}
                      isLast
                    />
                  ) : (
                    <DrawerRow
                      icon={Link2}
                      label="Vincular Personal Trainer"
                      hint="Insere o código de 6 dígitos do teu PT"
                      onClick={() => {
                        triggerHaptic(10);
                        setLinkingTrainer(true);
                      }}
                      isLast
                    />
                  )
                )}
              </div>

              <div>
                <SectionLabel>Preferências &amp; Som</SectionLabel>
                <DrawerRow
                  icon={soundEnabled ? Volume2 : VolumeX}
                  label="Sons do treino"
                  hint={soundEnabled ? 'Efeitos e alertas de descanso ligados' : 'Efeitos e alertas de descanso desligados'}
                  onClick={() => {
                    triggerHaptic(8);
                    onToggleSound?.(!soundEnabled);
                  }}
                  isLast
                  trailing={
                    <span
                      className={`relative w-[46px] h-[28px] rounded-full border transition-colors duration-150 shrink-0 ${
                        soundEnabled ? 'bg-accent border-accent-hover' : 'bg-zinc-900 border-white/[0.12]'
                      }`}
                      aria-hidden="true"
                    >
                      <motion.span
                        className="absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white shadow-xs"
                        animate={{ x: soundEnabled ? 18 : 0 }}
                        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }}
                      />
                    </span>
                  }
                />
              </div>

              {isAdmin && (
                <div>
                  <SectionLabel>Administração</SectionLabel>
                  <DrawerRow
                    icon={ceo ? Crown : ShieldCheck}
                    label={ceo ? 'Painel Executivo CEO' : 'Painel Admin'}
                    hint={ceo ? 'Waitlist, atletas e métricas de lançamento' : 'Atletas e sessões'}
                    onClick={run(onOpenAdmin)}
                    isLast
                  />
                </div>
              )}

              <div>
                <SectionLabel>Conta &amp; Segurança</SectionLabel>
                <DrawerRow
                  icon={Scale}
                  label="Termos, privacidade e aviso médico"
                  hint="Documentos legais"
                  onClick={run(() => window.open('/privacidade', '_blank', 'noopener'))}
                />
                {confirmingLogout ? (
                  <div className="px-5 py-3.5 space-y-2.5 border-b border-white/[0.04]">
                    <p className="text-[13px] font-medium text-zinc-200">Terminar sessão agora?</p>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(8);
                          setConfirmingLogout(false);
                        }}
                        className="flex-1 min-h-[44px] rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-[13px] font-semibold cursor-pointer touch-manipulation transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={run(signOut)}
                        className="flex-1 min-h-[44px] rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/35 text-rose-300 text-[13px] font-bold cursor-pointer touch-manipulation transition-colors"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <DrawerRow
                    icon={LogOut}
                    label={isGuest ? 'Sair do modo convidado' : 'Terminar sessão'}
                    onClick={() => {
                      triggerHaptic(10);
                      setConfirmingLogout(true);
                    }}
                    trailing={null}
                    danger
                    isLast={!synced}
                  />
                )}
                {synced && (
                  <DrawerRow
                    icon={Trash2}
                    label="Eliminar conta"
                    hint="Apaga a conta e todos os dados"
                    onClick={() => {
                      triggerHaptic(10);
                      setDeleting(true);
                    }}
                    trailing={null}
                    danger
                    isLast
                  />
                )}
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
          {wearablesOpen && (
            <Suspense fallback={null}>
              <WearablesModal
                isOpen={wearablesOpen}
                onClose={() => {
                  setWearablesOpen(false);
                  refreshWearables();
                }}
              />
            </Suspense>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
