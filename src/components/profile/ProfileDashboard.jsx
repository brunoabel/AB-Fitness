import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import { CalendarDays, ListChecks, TrendingUp, Award, Scale, Images, ChevronRight, ChevronLeft } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { getUnlockedBadges } from '../../utils/badgeService';
import { BADGES_CATALOG } from '../../data/badges';
import { getBodyEntries, getMetricSeries } from '../../utils/bodyPortfolio';
import { triggerHaptic } from '../../utils/audio';
import ConsistencyCalendar from './ConsistencyCalendar';

const HistoryView = lazy(() => import('../HistoryView'));
const ProgressionCharts = lazy(() => import('../ProgressionCharts'));
const BadgesView = lazy(() => import('../BadgesView'));
const BodyPortfolio = lazy(() => import('../BodyPortfolio'));

const SPRING = { type: 'spring', stiffness: 420, damping: 42 };

function sessionDate(w) {
  if (typeof w?.timestamp === 'number') return new Date(w.timestamp);
  return new Date(w?.completedAt || w?.date || 0);
}

const fmtKg = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-PT');

/** Resumos de cada linha, calculados a partir dos dados locais. */
function useSummaries(history, postsCount) {
  return useMemo(() => {
    const now = new Date();
    const thisMonth = history.filter((w) => {
      const d = sessionDate(w);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;

    const exercises = new Set();
    for (const w of history) {
      for (const [id, sets] of Object.entries(w?.exercisesData || {})) {
        if (Array.isArray(sets) && sets.some((s) => s?.done || s?.completed)) exercises.add(id);
      }
    }

    const unlocked = Object.keys(getUnlockedBadges() || {}).length;
    const weights = getMetricSeries(getBodyEntries(), 'weight');
    const lastWeight = weights.length ? weights[weights.length - 1].value : null;

    return {
      calendar: `${thisMonth} este mês`,
      sessions: String(history.length),
      exercises: String(exercises.size),
      badges: `${unlocked} de ${BADGES_CATALOG.length}`,
      body: lastWeight !== null ? `${fmtKg(lastWeight)} kg` : 'Registar',
      posts: String(postsCount)
    };
  }, [history, postsCount]);
}

const ROWS = [
  { id: 'calendar', label: 'Calendário', icon: CalendarDays },
  { id: 'sessions', label: 'Sessões', icon: ListChecks },
  { id: 'exercises', label: 'Exercícios', icon: TrendingUp },
  { id: 'badges', label: 'Medalhas', icon: Award },
  { id: 'body', label: 'Corpo', icon: Scale },
  { id: 'posts', label: 'Publicações', icon: Images }
];

/**
 * Ecrã empurrado da direita, como a navegação nativa do iOS:
 * botão "Perfil" para voltar, título grande e gesto de arrastar a partir da margem esquerda.
 */
function PushedScreen({ title, onBack, children }) {
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onBack();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onBack]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] bg-app flex flex-col will-change-transform"
      initial={{ x: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 0 : 1 }}
      transition={reducedMotion ? { duration: 0.15 } : SPRING}
      drag="x"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.9 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 600) onBack();
      }}
    >
      {/* Margem esquerda: arrastar para voltar */}
      <div
        aria-hidden
        onPointerDown={(e) => dragControls.start(e)}
        className="absolute left-0 top-0 bottom-0 w-5 z-10 touch-none"
      />

      <header className="shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)] bg-app/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-2 h-11 flex items-center">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onBack();
            }}
            className="min-h-[44px] pl-1 pr-3 inline-flex items-center gap-0.5 text-[15px] text-white cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 -ml-0.5" strokeWidth={2} />
            Perfil
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+32px)]">
          <h2 className="font-heading text-[32px] leading-tight font-bold tracking-[-0.02em] text-white mb-5">{title}</h2>
          <Suspense fallback={<Skeleton className="h-72 rounded-2xl" />}>{children}</Suspense>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Painel do perfil: lista agrupada ao estilo do app Saúde.
 * Cada linha mostra um resumo e abre o ecrã completo dessa secção.
 * `renderPosts()` desenha a grelha de publicações (estado vive no ProfileView).
 */
export default function ProfileDashboard({ history = [], postsCount = 0, renderPosts }) {
  const [open, setOpen] = useState(null);
  const summaries = useSummaries(history, postsCount);
  const current = ROWS.find((r) => r.id === open);

  return (
    <section aria-label="Painel" className="space-y-3">
      <h3 className="font-heading text-section font-semibold text-white">Painel</h3>

      <ul className="rounded-2xl bg-surface border border-white/[0.08] overflow-hidden">
        {ROWS.map((row, i) => {
          const Icon = row.icon;
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setOpen(row.id);
                }}
                className="group w-full min-h-[52px] pl-3.5 flex items-center gap-3 text-left cursor-pointer touch-manipulation active:bg-white/[0.05] transition-colors"
              >
                <span className="shrink-0 w-[30px] h-[30px] rounded-[9px] bg-surface-3 flex items-center justify-center">
                  <Icon className="w-[17px] h-[17px] text-white" strokeWidth={1.9} />
                </span>
                <span
                  className={`flex-1 min-w-0 min-h-[52px] pr-3 flex items-center gap-2 ${
                    i < ROWS.length - 1 ? 'border-b border-white/[0.06]' : ''
                  }`}
                >
                  <span className="flex-1 text-[15px] text-white">{row.label}</span>
                  <span className="text-[15px] text-zinc-500 tabular-nums truncate">{summaries[row.id]}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" strokeWidth={2} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {current && (
          <PushedScreen key={current.id} title={current.label} onBack={() => setOpen(null)}>
            {current.id === 'calendar' && <ConsistencyCalendar />}
            {current.id === 'sessions' && <HistoryView />}
            {current.id === 'exercises' && <ProgressionCharts />}
            {current.id === 'badges' && <BadgesView />}
            {current.id === 'body' && <BodyPortfolio />}
            {current.id === 'posts' && renderPosts?.()}
          </PushedScreen>
        )}
      </AnimatePresence>
    </section>
  );
}
