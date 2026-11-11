import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Settings, PencilLine, UserPlus, Camera, Dumbbell, Image as ImageIcon, HandMetal, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context';
import AthleteCard from '../social/AthleteCard';
import { Skeleton } from '../ui/Skeleton';
import { canUseSocial, getMyCardStats, getMyProfile, listAthletePosts, togglePostRespect } from '../../services/socialService';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { triggerHaptic } from '../../utils/audio';
import { getWorkoutHistory } from '../../utils/storage';
import NewPostModal from '../social/NewPostModal';

const HistoryView = lazy(() => import('../HistoryView'));
const EditProfileSheet = lazy(() => import('../social/EditProfileSheet'));
const AccountSheet = lazy(() => import('../AccountSheet'));

/**
 * Separador Perfil: "eu como atleta". Athlete Card + edição, definições (engrenagem) e,
 * por baixo, o histórico completo (sessões, gráficos, conquistas, corpo).
 */
export default function ProfileView({ onOpenGuide, onOpenCustomize, onOpenAICoach, onOpenAdmin, onOpenTrainerHub, soundEnabled, onToggleSound }) {
  const { user, isGuest, isCeo, isAdmin, isPro } = useAuth();
  const userId = user?.id;
  const social = canUseSocial(userId);

  const [state, setState] = useState({ loaded: !social, profile: null, stats: null, error: '' });
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'photos'
  const [photos, setPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const loadPhotos = async () => {
    if (!userId) return;
    setPhotosLoading(true);
    const { data } = await listAthletePosts(userId);
    setPhotos(data || []);
    setPhotosLoading(false);
  };

  useEffect(() => {
    if (!social) return undefined;
    let alive = true;
    Promise.all([getMyProfile(userId), getMyCardStats()]).then(([p, st]) => {
      if (alive) setState({ loaded: true, profile: p.data, stats: st, error: p.error || '' });
    });
    loadPhotos();
    return () => {
      alive = false;
    };
  }, [social, userId]);

  // Sem perfil social (convidado ou migration por correr): cartão local com o nome da conta
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
    <section aria-label="Perfil">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 space-y-3">
        {state.loaded ? (
          <AthleteCard profile={{ ...profile, username: state.profile?.username }} stats={stats} />
        ) : (
          <Skeleton className="h-[248px] rounded-3xl" />
        )}

        <div className="grid grid-cols-3 gap-2">
          {canEdit ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => setEditing(true)}
              className="min-h-[46px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-bold text-[13px] inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-3 transition-colors"
            >
              <PencilLine className="w-4 h-4" strokeWidth={2} />
              Editar
            </motion.button>
          ) : (
            <div className="min-h-[46px] rounded-2xl border border-dashed border-white/[0.12] px-2 flex items-center justify-center text-[12px] text-zinc-400 text-center">
              Perfil
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(10);
              setNewPostOpen(true);
            }}
            className="min-h-[46px] rounded-2xl bg-primary text-app font-bold text-[13px] inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:brightness-105 transition-all"
          >
            <Camera className="w-4 h-4" strokeWidth={2} />
            Postar foto
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              triggerHaptic(10);
              setSettingsOpen(true);
            }}
            className="min-h-[46px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white font-bold text-[13px] inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-surface-3 transition-colors"
          >
            <Settings className="w-4 h-4" strokeWidth={1.75} />
            Definições
          </motion.button>
        </div>

        {/* Segmented Control: Treinos vs Galeria */}
        <div className="flex p-1 gap-1 rounded-2xl bg-surface-2 border border-white/[0.08] mt-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('history');
            }}
            className={`flex-1 min-h-[40px] rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-primary text-app shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" strokeWidth={1.75} />
            <span>Treinos & Métricas</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setActiveTab('photos');
              loadPhotos();
            }}
            className={`flex-1 min-h-[40px] rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'photos' ? 'bg-primary text-app shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" strokeWidth={1.75} />
            <span>Galeria ({photos.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'history' ? (
        <Suspense fallback={<div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 pt-6"><Skeleton className="h-40 rounded-2xl" /></div>}>
          <HistoryView />
        </Suspense>
      ) : (
        <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-5 pb-24">
          {photosLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <Skeleton key={n} className="aspect-square rounded-2xl" />
              ))}
            </div>
          ) : photos.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.1] bg-surface/50 p-8 text-center space-y-3">
              <span className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-heading text-section font-bold text-white">Nenhuma foto publicada ainda</h3>
                <p className="text-body text-zinc-400 max-w-sm mx-auto mt-1">
                  Mostra aos teus amigos a tua evolução física, o treino do dia ou momentos de glória!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setNewPostOpen(true);
                }}
                className="min-h-[46px] px-5 rounded-2xl bg-primary text-app font-bold text-[14px] inline-flex items-center gap-2 cursor-pointer shadow-md hover:brightness-105 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Publicar primeira foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedPhoto(post);
                  }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-surface-2 border border-white/[0.08] cursor-pointer hover:border-white/30 transition-all shadow-sm"
                >
                  <img src={post.image_url} alt={post.caption || 'Foto do atleta'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    {post.caption && <p className="text-white text-[12px] font-medium line-clamp-2">{post.caption}</p>}
                    <div className="flex items-center gap-1 text-[11px] text-zinc-300 font-bold mt-1">
                      <HandMetal className="w-3 h-3 text-amber-400" />
                      <span>{post.respect_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {newPostOpen && (
          <NewPostModal
            isOpen={newPostOpen}
            onClose={() => setNewPostOpen(false)}
            userId={userId}
            profile={profile}
            onPostCreated={(newP) => {
              setPhotos((prev) => [newP, ...prev]);
              setActiveTab('photos');
            }}
          />
        )}

        {selectedPhoto && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn" onClick={() => setSelectedPhoto(null)}>
            <div className="relative max-w-xl w-full bg-surface rounded-3xl overflow-hidden border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-square max-h-[70vh] bg-black">
                <img src={selectedPhoto.image_url} alt="" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white backdrop-blur-md cursor-pointer hover:bg-black/90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-surface space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-white text-body">{profile.full_name}</span>
                    <span className="text-zinc-500 text-[12px]">• {new Date(selectedPhoto.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-2 border border-white/10 text-white text-[13px] font-bold">
                    <HandMetal className="w-4 h-4 text-amber-400" />
                    <span>{selectedPhoto.respect_count || 0}</span>
                  </div>
                </div>
                {selectedPhoto.caption && (
                  <p className="text-[14px] text-zinc-300 leading-relaxed">{selectedPhoto.caption}</p>
                )}
              </div>
            </div>
          </div>
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
