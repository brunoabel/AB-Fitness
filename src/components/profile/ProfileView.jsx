import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Settings, PencilLine, UserPlus } from 'lucide-react';
import { useAuth } from '../../context';
import AthleteCard from '../social/AthleteCard';
import { Skeleton } from '../ui/Skeleton';
import { canUseSocial, getMyCardStats, getMyProfile } from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';
import { getWorkoutHistory } from '../../utils/storage';

const HistoryView = lazy(() => import('../HistoryView'));
const EditProfileSheet = lazy(() => import('../social/EditProfileSheet'));
const AccountSheet = lazy(() => import('../AccountSheet'));

/**
 * Separador Perfil: "eu como atleta". Athlete Card + edição, definições (engrenagem) e,
 * por baixo, o histórico completo (sessões, gráficos, conquistas, corpo).
 */
export default function ProfileView({ onOpenGuide, onOpenCustomize, onOpenAICoach, onOpenAdmin, onOpenTrainerHub, soundEnabled, onToggleSound }) {
  const { user, isGuest } = useAuth();
  const userId = user?.id;
  const social = canUseSocial(userId);

  const [state, setState] = useState({ loaded: !social, profile: null, stats: null, error: '' });
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!social) return undefined;
    let alive = true;
    Promise.all([getMyProfile(userId), getMyCardStats()]).then(([p, st]) => {
      if (alive) setState({ loaded: true, profile: p.data, stats: st, error: p.error || '' });
    });
    return () => {
      alive = false;
    };
  }, [social, userId]);

  // Sem perfil social (convidado ou migration por correr): cartão local com o nome da conta
  const fallbackProfile = {
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta',
    avatar_url: user?.user_metadata?.avatar_url || null,
    cover_style: 'midnight',
    featured_stat: 'total_workouts'
  };
  const profile = state.profile || fallbackProfile;
  // Estatísticas locais quando o servidor não as dá (convidado / offline)
  const localStats = (() => {
    const h = getWorkoutHistory() || [];
    const monthAgo = Date.now() - 30 * 86400000;
    const vol = h.filter((w) => new Date(w.completedAt || w.date || 0).getTime() >= monthAgo).reduce((a, w) => a + (Number(w.totalVolumeKg) || 0), 0);
    return { total_workouts: h.length, streak: null, monthly_volume_kg: vol };
  })();
  const stats = state.stats || localStats;
  const canEdit = social && Boolean(state.profile);

  return (
    <section aria-label="Perfil">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 space-y-3">
        {state.loaded ? (
          <AthleteCard profile={{ ...profile, username: state.profile?.username }} stats={stats} />
        ) : (
          <Skeleton className="h-[248px] rounded-3xl" />
        )}

        <div className="grid grid-cols-2 gap-2">
          {canEdit ? (
            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setEditing(true)} className="min-h-[48px] rounded-2xl bg-primary text-app font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer">
              <PencilLine className="w-4 h-4" strokeWidth={2} />
              Editar perfil
            </motion.button>
          ) : (
            <div className="min-h-[48px] rounded-2xl border border-dashed border-white/[0.12] px-3 flex items-center justify-center gap-2 text-[13px] text-zinc-400 text-center">
              <UserPlus className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {isGuest ? 'Cria conta para ter perfil público' : 'Perfil público em breve'}
            </div>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(10);
              setSettingsOpen(true);
            }}
            className="min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Settings className="w-4 h-4" strokeWidth={1.75} />
            Definições
          </motion.button>
        </div>
      </div>

      <Suspense fallback={<div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 pt-6"><Skeleton className="h-40 rounded-2xl" /></div>}>
        <HistoryView />
      </Suspense>

      <AnimatePresence>
        {editing && state.profile && (
          <Suspense key="edit" fallback={null}>
            <EditProfileSheet
              userId={userId}
              profile={state.profile}
              stats={state.stats}
              onClose={() => setEditing(false)}
              onSaved={(p) => {
                setState((s) => ({ ...s, profile: { ...p, privacy_settings: { ...s.profile.privacy_settings, ...p.privacy_settings } } }));
                setEditing(false);
              }}
            />
          </Suspense>
        )}
        {settingsOpen && (
          <Suspense key="settings" fallback={null}>
            <AccountSheet
              identity={{ avatar: profile.avatar_url, fullName: profile.full_name }}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              onClose={() => setSettingsOpen(false)}
              onEditProfile={canEdit ? () => setEditing(true) : undefined}
              onOpenCustomize={onOpenCustomize}
              onOpenGuide={onOpenGuide}
              onOpenAICoach={onOpenAICoach}
              onOpenAdmin={onOpenAdmin}
              onOpenTrainerHub={onOpenTrainerHub}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </section>
  );
}
