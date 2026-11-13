import React, { useEffect, useMemo, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Flame, Menu } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { computeStreak, weekProgress } from '../utils/streak';
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
  onOpenSidebar
}) {
  const { user } = useAuth();
  const identity = useProfileIdentity(user);

  const streak = useMemo(() => computeStreak(completedDays, schedule), [completedDays, schedule]);
  const week = useMemo(() => weekProgress(completedDays, schedule), [completedDays, schedule]);

  const tabKey = currentView === 'admin' ? 'admin' : activeTab;
  const isHome = tabKey === 'dashboard';
  const greetingText = useMemo(() => {
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10); // formato gravado por markDayCompleted
    return buildGreeting({
      name: identity.firstName,
      streak,
      done: week.done,
      target: week.target,
      todayWorkout: schedule.find((d) => d?.dayId === now.getDay()),
      trainedToday: completedDays.some((c) => c?.date === todayIso),
      now
    });
  }, [identity.firstName, streak, week, schedule, completedDays]);
  const largeTitle = isHome ? greetingText : TAB_TITLES[tabKey] || 'AB Fitness';
  const compactTitle = isHome ? 'Treino' : TAB_TITLES[tabKey] || 'AB Fitness';
  // A Corrida já tem o seu próprio cabeçalho editorial (RunHeader.jsx) — evita duplicar "Corrida"
  const hasOwnHeader = tabKey === 'running';

  // Só transform/opacity: o fundo e o título compacto aparecem com o scroll
  const { scrollY } = useScroll();
  const barOpacity = useTransform(scrollY, [8, 56], [0, 1]);
  const compactOpacity = useTransform(scrollY, [36, 64], [0, 1]);
  const compactY = useTransform(scrollY, [36, 64], [6, 0]);

  return (
    <>
      <header className="sticky top-0 z-20 pt-[env(safe-area-inset-top,0px)]">
        <motion.div aria-hidden style={{ opacity: barOpacity }} className="absolute inset-0 bg-app/80 backdrop-blur-xl border-b border-white/[0.07]" />
        <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(10);
              onOpenSidebar?.();
            }}
            aria-label="Abrir menu do atleta"
            className="flex items-center gap-2 min-h-[40px] pl-1 pr-2.5 -ml-1 rounded-full cursor-pointer shrink-0"
          >
            <Menu className="w-[22px] h-[22px] text-white" strokeWidth={1.9} />
            <Avatar url={identity.avatar} name={identity.fullName || user?.email} size={28} />
          </motion.button>

          <motion.span style={{ opacity: compactOpacity, y: compactY }} className="flex-1 min-w-0 font-heading text-[17px] font-semibold text-white truncate" aria-hidden>
            {compactTitle}
          </motion.span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(8);
              onNavigateTab?.('profile');
            }}
            aria-label={`${streak} ${streak === 1 ? 'dia seguido' : 'dias seguidos'} a treinar. Abrir perfil e histórico`}
            className="min-h-[36px] px-3 rounded-full bg-surface-2 border border-white/[0.08] inline-flex items-center gap-1.5 text-[14px] font-semibold text-white tabular-nums cursor-pointer shrink-0"
          >
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-white' : 'text-zinc-500'}`} strokeWidth={1.75} />
            {streak}
          </motion.button>
        </div>
      </header>

      {/* Título grande: rola com a página e dá lugar ao título compacto — omitido quando a
          própria view já tem cabeçalho editorial dedicado (ex. Corrida), para nunca duplicar */}
      {!hasOwnHeader && (
        <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-1 pb-3">
          <h1 className="font-heading text-[30px] leading-[1.1] font-bold tracking-tight text-white">{largeTitle}</h1>
          {isHome && (
            <p className="mt-1 text-body text-zinc-400 tabular-nums">
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
