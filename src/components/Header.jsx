import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { Flame, Menu, ChevronRight } from 'lucide-react';
import CoachAvatar from './coach/CoachAvatar';
import { triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { computeStreak, weekProgress } from '../utils/streak';
import { localDateKey } from '../utils/dateKey.js';
import { getRunsHistory } from '../utils/storage';
import { buildGreeting } from '../utils/greetings';

const TAB_TITLES = {
  running: 'Corrida',
  social: 'Amigos',
  profile: 'Perfil',
  admin: 'Admin'
};


/** Foto e nome do perfil (public.profiles); cai para os metadados da conta. */
function useProfileIdentity(user) {
  const [remote, setRemote] = useState({ id: null, avatar: null, name: null });
  const id = user?.id;
  useEffect(() => {
    if (!id || id === 'guest-local-user' || !isSupabaseConfigured() || !supabase) return undefined;
    let alive = true;
    supabase
      .from('profiles')
      .select('avatar_url, full_name')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data) setRemote({ id, avatar: data.avatar_url, name: data.full_name });
      });
    return () => {
      alive = false;
    };
  }, [id]);
  const own = remote.id === id ? remote : {};
  const fullName = own.name || user?.user_metadata?.full_name || '';
  return {
    avatar: own.avatar || user?.user_metadata?.avatar_url || null,
    fullName,
    firstName: fullName.trim().split(/\s+/)[0] || ''
  };
}

function Avatar({ url, name, size = 36 }) {
  const initials = (name || 'A').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <span
      style={{ width: size, height: size }}
      className="relative rounded-full overflow-hidden bg-surface-3 border border-white/[0.1] flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
    >
      {url ? <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" /> : initials}
    </span>
  );
}

/**
 * Header com título grande que encolhe no scroll (padrão nativo):
 * no topo, saudação + progresso da semana; ao descer, barra fina translúcida com o título do separador.
 * À direita: streak real (dias seguidos, respeita descansos) e a foto do atleta; ambos abrem o Perfil.
 */
export default function Header({
  activeTab = 'dashboard',
  currentView = 'dashboard',
  onNavigateTab,
  completedDays = [],
  schedule = [],
  onOpenSidebar,
  onOpenAICoach
}) {
  const { user } = useAuth();
  const identity = useProfileIdentity(user);

  // Sequência consolidada: musculação (completedDays) + corrida — um corredor também mantém o streak
  const streak = useMemo(() => computeStreak(completedDays, schedule, getRunsHistory()), [completedDays, schedule]);
  const week = useMemo(() => weekProgress(completedDays, schedule), [completedDays, schedule]);

  const tabKey = currentView === 'admin' ? 'admin' : activeTab;
  const isHome = tabKey === 'dashboard';
  const [now, setNow] = useState(() => new Date());
  const [showStreakPopover, setShowStreakPopover] = useState(false);

  useEffect(() => {
    if (!showStreakPopover) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowStreakPopover(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showStreakPopover]);

  useEffect(() => {
    const syncClock = () => {
      if (document.visibilityState === 'visible') {
        setNow(new Date());
      }
    };
    document.addEventListener('visibilitychange', syncClock);
    return () => document.removeEventListener('visibilitychange', syncClock);
  }, []);

  const greetingText = useMemo(() => {
    const todayIso = localDateKey(now); // formato gravado por markDayCompleted
    return buildGreeting({
      name: identity.firstName,
      streak,
      done: week.done,
      target: week.target,
      todayWorkout: schedule.find((d) => d?.dayId === now.getDay()),
      trainedToday: completedDays.some((c) => c?.date === todayIso),
      now
    });
  }, [identity.firstName, streak, week, schedule, completedDays, now]);
  const largeTitle = isHome ? greetingText : TAB_TITLES[tabKey] || 'AB Fitness';
  // Corrida e Amigos já têm cabeçalho editorial dedicado — evita repetir o título no topo
  const hasOwnHeader = tabKey === 'running' || tabKey === 'social';

  // Só opacity: o fundo translúcido aparece suavemente ao descer, sem repetir títulos no topo
  const { scrollY } = useScroll();
  const barOpacity = useTransform(scrollY, [8, 56], [0, 1]);

  return (
    <>
      <header className="sticky top-0 z-20 pt-[env(safe-area-inset-top,0px)]">
        <motion.div aria-hidden style={{ opacity: barOpacity }} className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]" />
        <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(10);
              onOpenSidebar?.();
            }}
            aria-label="Abrir menu do atleta"
            className="flex items-center gap-2.5 min-h-[44px] min-w-[44px] pl-1 pr-2.5 -ml-1 rounded-full cursor-pointer touch-manipulation shrink-0"
          >
            <Menu className="w-[22px] h-[22px] text-white" strokeWidth={1.9} />
            <Avatar url={identity.avatar} name={identity.fullName || user?.email} size={28} />
          </motion.button>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAICoach && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerHaptic(8);
                  onOpenAICoach();
                }}
                aria-label="Abrir AB Coach IA"
                className="lg:hidden tap-44 min-h-[36px] pl-1 pr-2.5 rounded-full bg-accent/45 hover:bg-accent/70 border border-accent-hover inline-flex items-center gap-1.5 text-[12px] font-semibold text-white cursor-pointer shrink-0 transition-colors"
              >
                <CoachAvatar size={24} alt="" />
                <span>Coach</span>
              </motion.button>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic(10);
                setShowStreakPopover((v) => !v);
              }}
              aria-expanded={showStreakPopover}
              aria-label={`${streak} ${streak === 1 ? 'dia em sequência' : 'dias em sequência'}. Tocar para ver detalhes`}
              className={`tap-44 min-h-[36px] px-3 rounded-full border inline-flex items-center gap-1.5 text-[14px] font-semibold text-white tabular-nums cursor-pointer shrink-0 transition-colors ${
                streak > 0
                  ? 'bg-orange-500/15 border-orange-500/35 hover:bg-orange-500/20'
                  : 'bg-surface border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              <Flame
                className={`w-4 h-4 transition-transform ${
                  streak > 0
                    ? 'text-orange-400 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.75)]'
                    : 'text-zinc-500'
                }`}
                strokeWidth={1.8}
              />
              {streak}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Popover nativo da sequência de dias */}
      <AnimatePresence>
        {showStreakPopover && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowStreakPopover(false)}
          >
            <motion.div
              role="dialog"
              aria-label="Sequência de dias"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-[calc(env(safe-area-inset-top,0px)+60px)] right-4 sm:right-6 w-[280px] rounded-2xl bg-surface/95 backdrop-blur-2xl border border-white/[0.12] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.75)] space-y-2.5"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                    streak > 0
                      ? 'bg-orange-500/15 border-orange-500/30'
                      : 'bg-white/[0.04] border-white/[0.08]'
                  }`}
                >
                  <Flame
                    className={`w-5 h-5 ${
                      streak > 0
                        ? 'text-orange-400 fill-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.75)]'
                        : 'text-zinc-500'
                    }`}
                    strokeWidth={1.8}
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold text-white tabular-nums leading-tight">
                    {streak > 0
                      ? `${streak} ${streak === 1 ? 'dia em sequência' : 'dias em sequência'}`
                      : 'Sem sequência ativa'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {streak > 0 ? 'Chama acesa' : 'Acende hoje'}
                  </p>
                </div>
              </div>

              <p className="text-[12px] text-zinc-300 leading-relaxed">
                {streak > 0
                  ? 'Continua assim, estás a ir muito bem! Os teus dias de descanso programados protegem a sequência.'
                  : 'Conclui um treino ou corrida hoje para acender a chama e iniciar a tua sequência.'}
              </p>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setShowStreakPopover(false);
                  onNavigateTab?.('profile');
                }}
                className="w-full pt-2 border-t border-white/[0.08] flex items-center justify-between text-[12px] font-semibold text-white hover:text-zinc-300 cursor-pointer"
              >
                <span>Ver calendário e histórico</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Título grande: omitido quando a própria view já tem cabeçalho editorial dedicado (ex. Corrida, Amigos) */}
      {!hasOwnHeader && (
        <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-4 pb-5">
          <h1 className="font-heading text-[30px] leading-[1.12] font-bold tracking-tight text-white">{largeTitle}</h1>
          {isHome && (
            <p className="mt-1.5 text-body text-zinc-400 tabular-nums">
              {week.done === 0
                ? `Esta semana · Meta de ${week.target} treinos`
                : week.done >= week.target
                  ? `Meta semanal cumprida · ${week.done} de ${week.target} treinos`
                  : `Esta semana · ${week.done} de ${week.target} treinos`}
            </p>
          )}
        </div>
      )}

    </>
  );
}
