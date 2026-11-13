import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PencilLine, Camera, Share2, Link2, Check, X, HandMetal } from 'lucide-react';
import { useAuth } from '../../context';
import AthleteCard from '../social/AthleteCard';
import { Skeleton } from '../ui/Skeleton';
import { athleteLink, canUseSocial, getMyCardStats, getMyProfile, listAthletePosts } from '../../services/socialService';
import { timeAgo } from '../social/ui';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { triggerHaptic } from '../../utils/audio';
import { getWorkoutHistory } from '../../utils/storage';
import NewPostModal from '../social/NewPostModal';
import ConsistencyCalendar from './ConsistencyCalendar';
import {
  buildAthletePassContent,
  buildAthletePassStoryBlob,
  shareAthletePassStory,
  PASS_PALETTES
} from '../../utils/athletePassCard';

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
  const [printModeOpen, setPrintModeOpen] = useState(false);
  const [exportingStory, setExportingStory] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postNotice, setPostNotice] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const noticeTimerRef = useRef(null);

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

  useEffect(() => {
    let alive = true;
    listAthletePosts(userId).then(({ data }) => {
      if (alive && Array.isArray(data)) setPosts(data);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  useEffect(() => () => {
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
  }, []);

  useEffect(() => {
    if (!selectedPost) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPost]);

  const flashPostNotice = (message) => {
    setPostNotice(message);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setPostNotice(''), 3200);
  };

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
  const [localStats] = useState(() => {
    const h = getWorkoutHistory() || [];
    const monthAgo = Date.now() - 30 * 86400000;
    const vol = h.filter((w) => new Date(w.completedAt || w.date || 0).getTime() >= monthAgo).reduce((a, w) => a + (Number(w.totalVolumeKg) || 0), 0);
    return { total_workouts: h.length, streak: null, monthly_volume_kg: vol };
  });
  const stats = state.stats || localStats;
  const canEdit = social && Boolean(state.profile);
  const passContent = buildAthletePassContent({
    profile: { ...profile, username: state.profile?.username },
    stats
  });

  const handleShareStory = async () => {
    if (exportingStory) return;
    triggerHaptic(14);
    setExportingStory(true);
    try {
      const blob = await buildAthletePassStoryBlob({
        profile: { ...profile, username: state.profile?.username },
        stats
      });
      await shareAthletePassStory(blob, { username: state.profile?.username || '' });
    } catch (err) {
      console.warn('Erro ao gerar Story do perfil:', err);
    } finally {
      setExportingStory(false);
    }
  };

  const handleCopyInviteLink = async () => {
    triggerHaptic(12);
    const url = state.profile?.username ? athleteLink(state.profile.username) : 'https://www.abfitness.app';
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {}
  };

  const glow = (PASS_PALETTES[profile.cover_style] || PASS_PALETTES.midnight).glow;

  return (
    <section aria-label="Perfil do Atleta" className="relative overflow-hidden space-y-4">
      {/* Aura ambiente: o tom do skin do cartão dissolve-se suavemente no preto, sem caixa */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[320px] pointer-events-none -z-10"
        style={{ background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${glow}, transparent 70%)` }}
      />

      <div className="relative max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 space-y-3">
        {/* Cartão de Identidade do Atleta (Design Apple Design Award) */}
        {state.loaded ? (
          <AthleteCard
            profile={{ ...profile, username: state.profile?.username }}
            stats={stats}
            onOpenPrintMode={() => {
              triggerHaptic(10);
              setPrintModeOpen(true);
            }}
          />
        ) : (
          <Skeleton className="h-[220px] rounded-3xl" />
        )}

        {/* Convite discreto para definir @username caso ainda não tenha */}
        {canEdit && !state.profile?.username && (
          <div className="flex items-center justify-between gap-3 py-2 px-1 border-b border-white/[0.06] text-xs">
            <span className="text-zinc-400">
              Define o teu <strong className="text-white">@username</strong> para amigos te encontrarem e partilhares o teu Pass.
            </span>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(8);
                setEditing(true);
              }}
              className="shrink-0 font-bold text-white hover:underline cursor-pointer"
            >
              Criar @username
            </button>
          </div>
        )}

        {/* Barra de Ações Rápidas do Atleta (Limpa, Tátil e Pronta para Partilha) */}
        <div className="grid grid-cols-3 gap-2">
          {canEdit ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                triggerHaptic(8);
                setEditing(true);
              }}
              className="min-h-[46px] rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              <PencilLine className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
              <span>Editar</span>
            </motion.button>
          ) : (
            <div className="min-h-[46px] rounded-2xl bg-white/[0.03] border border-white/[0.06] px-2 flex items-center justify-center text-xs text-zinc-500 text-center font-medium">
              Atleta AB
            </div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={exportingStory}
            onClick={handleShareStory}
            className="min-h-[46px] rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-60"
          >
            <Share2 className="w-3.5 h-3.5 text-zinc-300" strokeWidth={2} />
            <span>{exportingStory ? 'A gerar…' : 'Story Pass'}</span>
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              triggerHaptic(10);
              setNewPostOpen(true);
            }}
            className="min-h-[46px] rounded-2xl bg-white text-black hover:bg-zinc-100 font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98] transition-all"
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Publicar Foto</span>
          </motion.button>
        </div>

        {/* Calendário de Consistência: o mês inteiro, de relance */}
        <ConsistencyCalendar />

        {/* Feedback imediato ao publicar foto a partir do Perfil */}
        <AnimatePresence>
          {postNotice && (
            <motion.div
              role="status"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/[0.07] border border-white/[0.12] text-xs font-semibold text-white"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{postNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Publicações fotográficas do atleta no Clube */}
        {posts.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06] space-y-3">
            <div className="flex items-baseline justify-between">
              <h3 className="font-heading text-sm font-bold text-white tracking-tight">
                Publicações no Clube
              </h3>
              <span className="text-xs font-mono tabular-nums text-zinc-500">
                {posts.length} {posts.length === 1 ? 'foto' : 'fotos'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              {posts.map((post) => (
                <motion.button
                  key={post.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    triggerHaptic(8);
                    setSelectedPost(post);
                  }}
                  aria-label={post.caption ? `Abrir foto: ${post.caption}` : 'Abrir publicação no Clube'}
                  className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 cursor-pointer touch-manipulation group"
                >
                  <img
                    src={post.image_url}
                    alt={post.caption || 'Foto publicada no Clube'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {Number(post.respect_count) > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white tabular-nums">
                      <HandMetal className="w-2.5 h-2.5" />
                      {post.respect_count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}
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
            onPostCreated={(createdPost) => {
              if (createdPost) {
                setPosts((prev) => [createdPost, ...prev.filter((p) => p.id !== createdPost.id)]);
              } else {
                listAthletePosts(userId).then(({ data }) => {
                  if (Array.isArray(data)) setPosts(data);
                });
              }
              flashPostNotice('Foto publicada no Clube e adicionada ao teu Perfil.');
            }}
          />
        )}

        {selectedPost && (
          <motion.div
            key="profile-post-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Detalhe da publicação"
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-[92] bg-black/92 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{timeAgo(selectedPost.created_at)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  aria-label="Fechar foto"
                  className="min-w-[44px] min-h-[44px] -mr-2 rounded-full hover:bg-white/[0.08] text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-950">
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.caption || 'Foto publicada no Clube'}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedPost.caption && (
                <p className="text-[14px] text-zinc-100 leading-relaxed">{selectedPost.caption}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 tabular-nums">
                <HandMetal className="w-3.5 h-3.5" />
                <span>
                  {Number(selectedPost.respect_count) > 0
                    ? `${selectedPost.respect_count} ${selectedPost.respect_count === 1 ? 'respect' : 'respects'}`
                    : 'Sem respects ainda'}
                </span>
              </div>
            </div>
          </motion.div>
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

        {printModeOpen && (
          <motion.div
            key="print-showcase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black flex flex-col items-center justify-center px-5 py-8"
          >
            <button
              type="button"
              onClick={() => setPrintModeOpen(false)}
              className="absolute top-[max(env(safe-area-inset-top,0px),20px)] right-5 w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Fechar modo print"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  AB Fitness · Athlete Pass
                </p>
                <p className="text-xs text-zinc-400">
                  Pronto para tirar print ou exportar em HD para os Stories
                </p>
              </div>

              <AthleteCard
                profile={{ ...profile, username: state.profile?.username }}
                stats={stats}
                showcase
              />

              <div className="text-center text-xs text-zinc-400">
                {passContent.handle ? (
                  <span>
                    Procura <strong className="text-white">{passContent.handle}</strong> ou entra em <strong className="text-white">abfitness.app</strong>
                  </span>
                ) : (
                  <span>Treina com precisão em <strong className="text-white">abfitness.app</strong></span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="min-h-[48px] rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4 text-zinc-300" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>

                <button
                  type="button"
                  disabled={exportingStory}
                  onClick={handleShareStory}
                  className="min-h-[48px] rounded-2xl bg-white text-black hover:bg-zinc-100 font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Share2 className="w-4 h-4" strokeWidth={2.2} />
                  <span>{exportingStory ? 'A preparar…' : 'Exportar Story'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
