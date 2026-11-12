import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PencilLine, Camera } from 'lucide-react';
import { useAuth } from '../../context';
import AthleteCard from '../social/AthleteCard';
import { Skeleton } from '../ui/Skeleton';
import { canUseSocial, getMyCardStats, getMyProfile, listAthletePosts } from '../../services/socialService';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { triggerHaptic } from '../../utils/audio';
import { getWorkoutHistory } from '../../utils/storage';
import NewPostModal from '../social/NewPostModal';

const HistoryView = lazy(() => import('../HistoryView'));
const EditProfileSheet = lazy(() => import('../social/EditProfileSheet'));

/**
 * Separador Perfil: "Identidade & Carreira do Atleta".
 * Athlete Card de luxo com métricas consolidadas, seguido do painel unificado de carreira.
 */
export default function ProfileView() {
  const { user, isCeo, isAdmin, isPro } = useAuth();
  const userId = user?.id;
  const social = canUseSocial(userId);

  const [state, setState] = useState({ loaded: !social, profile: null, stats: null, error: '' });
  const [editing, setEditing] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);

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

  // Sem perfil social (convidado ou offline): cartão local com nome da conta
  const fallbackProfile = {
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Atleta',
    avatar_url: user?.user_metadata?.avatar_url || null,
    cover_style: isCeo ? 'gold' : 'midnight',
    featured_stat: 'total_workouts'
  };
  const ceo = isCeo || isAthleteCeo(state.profile || fallbackProfile, user);
  const pro = isPro || isAthletePro(state.profile || fallbackProfile, user);
  const verified = isAthleteVerified(state.profile || fallbackProfile, user, isAdmin);
  const profile = {
    ...(state.profile || fallbackProfile),
    is_ceo: ceo,
    is_pro: pro,
    is_premium: pro,
    is_verified: verified,
    cover_style: state.profile?.cover_style || (ceo ? 'gold' : 'midnight')
  };

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
    <section aria-label="Perfil do Atleta" className="space-y-4">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 space-y-3">
        {/* Cartão de Identidade do Atleta (Design Apple Design Award) */}
        {state.loaded ? (
          <AthleteCard profile={{ ...profile, username: state.profile?.username }} stats={stats} />
        ) : (
          <Skeleton className="h-[220px] rounded-3xl" />
        )}

        {/* Barra de Ações Rápidas do Atleta */}
        <div className="grid grid-cols-2 gap-2.5">
          {canEdit ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                triggerHaptic(8);
                setEditing(true);
              }}
              className="min-h-[46px] rounded-2xl bg-surface-2/80 hover:bg-surface-2 border border-white/[0.08] text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <PencilLine className="w-4 h-4 text-zinc-400" strokeWidth={2} />
              <span>Editar Perfil</span>
            </motion.button>
          ) : (
            <div className="min-h-[46px] rounded-2xl border border-dashed border-white/[0.08] px-2 flex items-center justify-center text-xs text-zinc-500 text-center font-medium">
              Atleta AB
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerHaptic(10);
              setNewPostOpen(true);
            }}
            className="min-h-[46px] rounded-2xl bg-white text-black hover:bg-zinc-100 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] transition-all"
          >
            <Camera className="w-4 h-4 stroke-[2.2]" />
            <span>Publicar Foto</span>
          </motion.button>
        </div>
      </div>

      {/* Painel Unificado da Carreira do Atleta (Sessões, Evolução, Medalhas, Corpo) */}
      <Suspense fallback={<div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 pt-4"><Skeleton className="h-60 rounded-3xl" /></div>}>
        <HistoryView />
      </Suspense>

      <AnimatePresence>
        {newPostOpen && (
          <NewPostModal
            isOpen={newPostOpen}
            onClose={() => setNewPostOpen(false)}
            userId={userId}
            profile={profile}
            onPostCreated={() => {
              // Recarregar histórico ou avisar
            }}
          />
        )}

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
      </AnimatePresence>
    </section>
  );
}
