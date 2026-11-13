import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Search,
  Share2,
  UserPlus,
  Check,
  Clock3,
  Users,
  Camera,
  Flame,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../../context';
import AthleteCard from './AthleteCard';
import HeadToHeadSheet from './HeadToHeadSheet';
import DirectMessageSheet from './DirectMessageSheet';
import NewPostModal from './NewPostModal';
import ClubFeedView from './ClubFeedView';
import SquadLeaderboardView from './SquadLeaderboardView';
import { Avatar, SPRING, TAP } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified } from '../../utils/userVerification';
import { SkeletonList } from '../ui/Skeleton';
import { deriveActiveToday } from '../../utils/clubHelpers';
import {
  canUseSocial,
  clearPendingInviteUsername,
  getFriendFeed,
  getFriendsWeeklySummary,
  getMyProfile,
  getPublicAthletePass,
  listFeedPosts,
  listFriendships,
  readPendingInviteUsername,
  respondFriendRequest,
  searchAthletes,
  sendFriendRequest,
  shareAthleteLink,
  togglePostRespect,
  toggleRespect
} from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';

const EXIT = { opacity: 0, x: 24, transition: { duration: 0.18 } };

function readAddParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    return (params.get('u') || params.get('add') || readPendingInviteUsername() || '').replace(/^@/, '').trim();
  } catch {
    return readPendingInviteUsername() || '';
  }
}

function SearchResultRow({ r, onAdd, onAccept }) {
  let action;
  if (r.friendship_status === 'accepted') {
    action = (
      <span className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-400">
        <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
        Amigos
      </span>
    );
  } else if (r.friendship_status === 'pending' && r.i_requested) {
    action = (
      <span className="inline-flex items-center gap-1 text-[13px] text-zinc-400">
        <Clock3 className="w-4 h-4" strokeWidth={1.75} />
        Enviado
      </span>
    );
  } else if (r.friendship_status === 'pending') {
    action = (
      <motion.button
        type="button"
        whileTap={TAP}
        onClick={onAccept}
        className="min-h-[40px] px-4 rounded-full bg-white text-black text-[13px] font-bold cursor-pointer touch-manipulation"
      >
        Aceitar
      </motion.button>
    );
  } else {
    action = (
      <motion.button
        type="button"
        whileTap={TAP}
        transition={SPRING}
        onClick={onAdd}
        className="min-h-[40px] px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer touch-manipulation transition-colors"
      >
        <UserPlus className="w-4 h-4" strokeWidth={1.9} />
        Adicionar
      </motion.button>
    );
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <Avatar url={r.avatar_url} name={r.full_name || r.username} size={42} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate flex items-center gap-1.5">
          <span className="truncate">{r.full_name || `@${r.username}`}</span>
          {isAthleteVerified(r) && <VerifiedBadge size={14} />}
        </p>
        <p className="text-[12px] text-zinc-400 truncate mt-0.5">
          {r.username ? `@${r.username}` : 'Sem @username'}
          {r.athlete_tag ? ` · ${r.athlete_tag}` : ''}
        </p>
      </div>
      {action}
    </li>
  );
}

/**
 * AB Athletic Club (Aba Amigos):
 * Experiência editorial em 4 camadas sobre OLED #000000 sem pilhas de caixas fechadas.
 */
export default function SocialHub({ onNavigateTab }) {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();
  const userId = user?.id;
  const enabled = canUseSocial(userId);

  const [profile, setProfile] = useState(null);
  const [friendships, setFriendships] = useState([]);
  const [summary, setSummary] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [clubTab, setClubTab] = useState('feed'); // 'feed' | 'squad'
  const [requestsOpen, setRequestsOpen] = useState(true);

  const [inviteUsername, setInviteUsername] = useState(readAddParam);
  const [invitePass, setInvitePass] = useState(null);
  const [inviteRequested, setInviteRequested] = useState(false);

  const [query, setQuery] = useState(readAddParam);
  const [results, setResults] = useState({ q: '', items: [] });
  const [h2h, setH2h] = useState(null);
  const [notice, setNotice] = useState('');
  const [activeChatFriend, setActiveChatFriend] = useState(null);
  const [newPostOpen, setNewPostOpen] = useState(false);

  useEffect(() => {
    if (!enabled || !inviteUsername) return undefined;
    let alive = true;
    (async () => {
      const { data } = await getPublicAthletePass(inviteUsername);
      if (!alive) return;
      clearPendingInviteUsername();
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('u') || url.searchParams.has('add')) {
          url.searchParams.delete('u');
          url.searchParams.delete('add');
          window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        }
      } catch {
        // Ambiente sem history API
      }
      if (data && data.id !== userId) {
        setInvitePass(data);
      }
    })();
    return () => {
      alive = false;
    };
  }, [enabled, inviteUsername, userId]);

  const refreshSocial = useCallback(async () => {
    const [f, s, fd, fp] = await Promise.all([
      listFriendships(),
      getFriendsWeeklySummary(),
      getFriendFeed(30),
      listFeedPosts()
    ]);
    setFriendships(f.data || []);
    setSummary(s.data || []);

    const workouts = (fd.data || []).map((w) => ({ ...w, _type: 'workout' }));
    const photos = (fp.data || []).map((p) => ({ ...p, _type: 'photo' }));
    const merged = [...workouts, ...photos].sort((a, b) => {
      const timeA = new Date(a.completed_at || a.created_at || 0).getTime();
      const timeB = new Date(b.completed_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
    setFeed(merged);
    return f.error || s.error || fd.error || '';
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    (async () => {
      const [p, socialErr] = await Promise.all([getMyProfile(userId), refreshSocial()]);
      if (!alive) return;
      setProfile(p.data);
      setLoadError(p.error || socialErr);
      setLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, [enabled, userId, refreshSocial]);

  // Pesquisa com debounce: não bloqueia a digitação
  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 2) return undefined;
    let alive = true;
    const t = setTimeout(async () => {
      const { data } = await searchAthletes(q);
      if (alive) setResults({ q, items: data || [] });
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, enabled]);

  const incoming = useMemo(() => friendships.filter((f) => f.status === 'pending' && f.incoming), [friendships]);
  const outgoing = useMemo(() => friendships.filter((f) => f.status === 'pending' && !f.incoming), [friendships]);
  const friendCount = useMemo(() => friendships.filter((f) => f.status === 'accepted').length, [friendships]);
  const activeToday = useMemo(
    () => deriveActiveToday({ summary, feed, currentUserId: userId }),
    [summary, feed, userId]
  );
  const showResults = query.trim().length >= 2;
  const pendingTotal = incoming.length + outgoing.length;

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2200);
  };

  const respond = async (f, accept) => {
    triggerHaptic(accept ? [10, 30, 10] : 8);
    setFriendships((list) =>
      accept
        ? list.map((x) => (x.friendship_id === f.friendship_id ? { ...x, status: 'accepted' } : x))
        : list.filter((x) => x.friendship_id !== f.friendship_id)
    );
    const { error } = await respondFriendRequest(f.friendship_id, accept);
    if (error) flash(error);
    refreshSocial();
  };

  const add = async (r) => {
    triggerHaptic(10);
    setResults((s) => ({
      ...s,
      items: s.items.map((x) => (x.id === r.id ? { ...x, friendship_status: 'pending', i_requested: true } : x))
    }));
    const { error } = await sendFriendRequest(userId, r.id);
    if (error) flash(error);
    refreshSocial();
  };

  const acceptFromSearch = async (r) => {
    const f = friendships.find((x) => x.friend_id === r.id);
    if (f) await respond(f, true);
    setResults((s) => ({
      ...s,
      items: s.items.map((x) => (x.id === r.id ? { ...x, friendship_status: 'accepted' } : x))
    }));
  };

  const respect = async (item) => {
    if (item._type === 'photo') {
      triggerHaptic([8, 24, 8]);
      const flip = (x) =>
        x.id === item.id
          ? { ...x, respected_by_me: !x.respected_by_me, respect_count: (x.respect_count || 0) + (x.respected_by_me ? -1 : 1) }
          : x;
      setFeed((list) => list.map(flip));
      await togglePostRespect(item.id, userId);
      return;
    }

    triggerHaptic(item.respected_by_me ? 6 : [8, 24, 8]);
    const flip = (x) =>
      x.session_id === item.session_id
        ? { ...x, respected_by_me: !x.respected_by_me, respect_count: x.respect_count + (x.respected_by_me ? -1 : 1) }
        : x;
    setFeed((list) => list.map(flip));
    const { data, error } = await toggleRespect(item.session_id);
    if (error) {
      setFeed((list) => list.map(flip));
      flash(error);
    } else {
      setFeed((list) => list.map((x) => (x.session_id === item.session_id ? { ...x, respect_count: data } : x)));
    }
  };

  const share = async () => {
    triggerHaptic(10);
    if (!profile?.username) {
      onNavigateTab?.('profile');
      return;
    }
    const r = await shareAthleteLink(profile.username);
    if (r === 'copied') flash('Link do teu perfil copiado');
    if (r === 'failed') flash('Não foi possível partilhar o link');
  };

  if (!enabled) {
    return (
      <section className="max-w-xl mx-auto w-full px-5 pt-14 pb-28 text-center">
        <span className="mx-auto w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center text-white">
          <Users className="w-6 h-6" strokeWidth={1.75} />
        </span>
        <h1 className="mt-5 font-heading text-title-xl font-bold tracking-tight text-white">
          Treina com os teus amigos
        </h1>
        <p className="mt-2.5 text-body text-zinc-400 max-w-sm mx-auto leading-relaxed">
          Cria uma conta para teres perfil de atleta, entrar no clube semanal e comparar a evolução com o teu grupo.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-xl mx-auto w-full px-4 sm:px-6 pt-3 pb-28 space-y-6" aria-label="Amigos">
      {/* CAMADA A: Header do Clube & Pesquisa Integrada */}
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-[-0.025em] leading-none">
              Amigos
            </h1>
            <p className="mt-1.5 text-[12px] text-zinc-400 tabular-nums">
              AB Athletic Club · {friendCount} {friendCount === 1 ? 'atleta' : 'atletas'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <motion.button
              type="button"
              whileTap={reducedMotion ? undefined : TAP}
              onClick={share}
              disabled={!loaded}
              aria-label="Convidar amigos com o meu link"
              className="min-h-[44px] px-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer touch-manipulation disabled:opacity-50 transition-colors"
            >
              <Share2 className="w-4 h-4" strokeWidth={1.8} />
              <span>Convidar</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={reducedMotion ? undefined : TAP}
              onClick={() => {
                triggerHaptic(8);
                setNewPostOpen(true);
              }}
              aria-label="Publicar foto no feed"
              className="min-h-[44px] px-3.5 rounded-full bg-white hover:bg-zinc-200 text-black text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer touch-manipulation transition-colors"
            >
              <Camera className="w-4 h-4" strokeWidth={2} />
              <span>Publicar</span>
            </motion.button>
          </div>
        </div>

        {/* Barra de pesquisa fluida sem caixa pesada */}
        <div>
          <label htmlFor="squad-search" className="sr-only">Procurar atletas</label>
          <div className="relative flex items-center rounded-full bg-white/[0.04] focus-within:bg-white/[0.07] border border-white/[0.07] focus-within:border-white/[0.2] transition-colors">
            <Search className="ml-4 w-[17px] h-[17px] text-zinc-500 shrink-0" strokeWidth={1.75} />
            <input
              id="squad-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar atletas por @username ou nome"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full min-h-[46px] pl-3 pr-10 bg-transparent text-[14px] text-white placeholder:text-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar pesquisa"
                className="mr-2 w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.08] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showResults && (
            <div className="mt-2 pt-1 pb-2 border-b border-white/[0.08]">
              {results.q !== query.trim() ? (
                <SkeletonList rows={2} className="py-2" label="A procurar atletas" />
              ) : results.items.length === 0 ? (
                <p className="py-3 text-[13px] text-zinc-400">
                  Nenhum atleta encontrado. Confirma o @username ou pede o link do perfil.
                </p>
              ) : (
                <ul className="divide-y divide-white/[0.05]">
                  {results.items.map((r) => (
                    <SearchResultRow
                      key={r.id}
                      r={r}
                      onAdd={() => add(r)}
                      onAccept={() => acceptFromSearch(r)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {loaded && profile && !profile.username && (
          <p className="text-[12px] text-zinc-400">
            Para partilhar o teu link direto, define primeiro um{' '}
            <button
              type="button"
              onClick={() => onNavigateTab?.('profile')}
              className="text-white underline underline-offset-4 cursor-pointer"
            >
              @username no Perfil
            </button>
            .
          </p>
        )}
        {loadError && <p className="text-[13px] text-rose-400">Não foi possível carregar tudo: {loadError}</p>}
      </header>

      {/* Convite direto via link ?u=username */}
      {invitePass && (
        <div className="space-y-3 py-4 border-y border-white/[0.08]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-[0.22em] uppercase text-zinc-400">
              Athlete Pass · Convite
            </span>
            <button
              type="button"
              onClick={() => {
                setInvitePass(null);
                setInviteUsername('');
                setQuery('');
              }}
              aria-label="Fechar convite"
              className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AthleteCard profile={invitePass} stats={invitePass} />
          {(() => {
            const existing = friendships.find((f) => f.friend_id === invitePass.id);
            if (existing?.status === 'accepted') {
              return (
                <div className="min-h-[44px] rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-[13px] font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Já são amigos de treino
                </div>
              );
            }
            if (existing?.status === 'pending' && existing.incoming) {
              return (
                <motion.button
                  type="button"
                  whileTap={TAP}
                  transition={SPRING}
                  onClick={() => respond(existing, true)}
                  className="w-full min-h-[48px] rounded-full bg-white text-black font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
                >
                  <Check className="w-4 h-4" /> Aceitar convite de @{invitePass.username}
                </motion.button>
              );
            }
            if (inviteRequested || (existing?.status === 'pending' && !existing.incoming)) {
              return (
                <div className="min-h-[44px] rounded-full bg-white/[0.06] border border-white/[0.12] text-zinc-200 text-[13px] font-semibold flex items-center justify-center gap-2">
                  <Clock3 className="w-4 h-4 text-zinc-400" /> Pedido enviado a @{invitePass.username}
                </div>
              );
            }
            return (
              <motion.button
                type="button"
                whileTap={TAP}
                transition={SPRING}
                onClick={async () => {
                  triggerHaptic([10, 30, 10]);
                  setInviteRequested(true);
                  const { error } = await sendFriendRequest(userId, invitePass.id);
                  if (error) {
                    setInviteRequested(false);
                    flash(error);
                  } else {
                    flash(`Pedido enviado a @${invitePass.username}`);
                  }
                  refreshSocial();
                }}
                className="w-full min-h-[48px] rounded-full bg-white text-black font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
              >
                <UserPlus className="w-4 h-4" strokeWidth={2.2} />
                Seguir &amp; Treinar Junto
              </motion.button>
            );
          })()}
        </div>
      )}

      {/* Faixa discreta e recolhível de pedidos pendentes */}
      {pendingTotal > 0 && (
        <div className="border-y border-white/[0.07]">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setRequestsOpen((v) => !v);
            }}
            aria-expanded={requestsOpen}
            className="w-full min-h-[48px] py-2.5 flex items-center justify-between gap-3 text-left cursor-pointer touch-manipulation"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span className="text-[13px] font-semibold text-white">
                {incoming.length > 0
                  ? `${incoming.length} ${incoming.length === 1 ? 'pedido de amizade' : 'pedidos de amizade'}`
                  : `${outgoing.length} ${outgoing.length === 1 ? 'convite enviado' : 'convites enviados'}`}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${requestsOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {requestsOpen && (
            <ul className="divide-y divide-white/[0.05] pb-2">
              <AnimatePresence initial={false}>
                {incoming.map((f) => (
                  <motion.li
                    key={f.friendship_id}
                    layout="position"
                    exit={EXIT}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <Avatar url={f.avatar_url} name={f.full_name || f.username} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-white truncate">
                        {f.full_name || `@${f.username}`}
                      </p>
                      <p className="text-[12px] text-zinc-400 truncate">quer treinar contigo</p>
                    </div>
                    <motion.button
                      type="button"
                      whileTap={TAP}
                      transition={SPRING}
                      onClick={() => respond(f, false)}
                      className="min-h-[40px] px-3 rounded-full text-[13px] font-medium text-zinc-400 hover:text-white cursor-pointer touch-manipulation"
                    >
                      Recusar
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={TAP}
                      transition={SPRING}
                      onClick={() => respond(f, true)}
                      className="min-h-[40px] px-4 rounded-full bg-white text-black text-[13px] font-bold cursor-pointer touch-manipulation"
                    >
                      Aceitar
                    </motion.button>
                  </motion.li>
                ))}
                {outgoing.map((f) => (
                  <motion.li
                    key={f.friendship_id}
                    layout="position"
                    exit={EXIT}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <Avatar url={f.avatar_url} name={f.full_name || f.username} size={34} />
                    <p className="flex-1 min-w-0 text-[13px] text-zinc-300 truncate">
                      Pedido enviado a {f.full_name || `@${f.username}`}
                    </p>
                    <motion.button
                      type="button"
                      whileTap={TAP}
                      onClick={() => respond(f, false)}
                      className="min-h-[40px] px-3 text-[13px] font-medium text-zinc-400 hover:text-white cursor-pointer touch-manipulation"
                    >
                      Cancelar
                    </motion.button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      )}

      {/* CAMADA B: Faixa "Ativos nas Últimas 24h" */}
      {loaded && activeToday.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400 mb-3">
            Ativos nas últimas 24h
          </p>
          <div className="flex items-start gap-4 overflow-x-auto pb-1 -mx-4 px-4">
            {activeToday.map((athlete) => {
              const firstName = (athlete.full_name || `@${athlete.username}` || 'Atleta').trim().split(/\s+/)[0];
              const existingSummary = summary.find((s) => s.friend_id === athlete.friend_id);
              const friendship = friendships.find((f) => f.friend_id === athlete.friend_id);
              const openProfileAction = () => {
                triggerHaptic(8);
                if (existingSummary || friendship) {
                  setH2h({
                    ...(existingSummary || athlete),
                    friendship_id: friendship?.friendship_id
                  });
                } else {
                  setActiveChatFriend({
                    friend_id: athlete.friend_id,
                    full_name: athlete.full_name,
                    username: athlete.username,
                    avatar_url: athlete.avatar_url
                  });
                }
              };

              return (
                <motion.button
                  key={athlete.friend_id}
                  type="button"
                  whileTap={reducedMotion ? undefined : { scale: 0.94 }}
                  onClick={openProfileAction}
                  className="flex flex-col items-center shrink-0 w-[68px] cursor-pointer touch-manipulation group"
                >
                  <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-white/75">
                    <div className="rounded-full bg-black p-[2px]">
                      <Avatar
                        url={athlete.avatar_url}
                        name={athlete.full_name || athlete.username}
                        size={50}
                      />
                    </div>
                    {athlete.streak > 0 && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full bg-black border border-white/[0.14] inline-flex items-center gap-0.5 font-display text-[10px] font-bold text-amber-300 tabular-nums">
                        <Flame className="w-2.5 h-2.5 text-amber-400" strokeWidth={2.2} />
                        {athlete.streak}
                      </span>
                    )}
                  </div>
                  <span className="mt-2 text-[12px] font-semibold text-white truncate max-w-full group-hover:text-zinc-200">
                    {firstName}
                  </span>
                  <span className="text-[10px] text-emerald-300/90 truncate max-w-full">
                    {athlete.activityLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* CAMADA C: Segmentação Fluida (Atividade vs. Classificação) */}
      <div
        role="tablist"
        aria-label="Vistas do clube"
        className="flex p-1 rounded-full bg-white/[0.04] border border-white/[0.06]"
      >
        {[
          { id: 'feed', label: 'Atividade' },
          { id: 'squad', label: 'Classificação', count: summary.length }
        ].map((tab) => {
          const active = clubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (clubTab !== tab.id) {
                  triggerHaptic(8);
                  setClubTab(tab.id);
                }
              }}
              className={`relative flex-1 min-h-[42px] rounded-full text-[13px] flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation transition-colors ${
                active ? 'text-black font-bold' : 'text-zinc-400 hover:text-white font-semibold'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="clubSegmentPill"
                  transition={reducedMotion ? { duration: 0 } : SPRING}
                  className="absolute inset-0 rounded-full bg-white shadow-xs"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span
                  className={`relative z-10 font-display text-[13px] tabular-nums ${
                    active ? 'text-black/70' : 'text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CAMADA D: Feed Editorial ou Classificação Semanal */}
      {clubTab === 'feed' ? (
        <ClubFeedView
          loaded={loaded}
          feed={feed}
          profile={profile}
          currentUserId={userId}
          onNewPost={() => setNewPostOpen(true)}
          onRespect={respect}
          onOpenChat={(friend) => setActiveChatFriend(friend)}
        />
      ) : (
        <SquadLeaderboardView
          loaded={loaded}
          summary={summary}
          friendships={friendships}
          onOpenH2H={(friend) => setH2h(friend)}
          onOpenChat={(friend) => setActiveChatFriend(friend)}
          onShareInvite={share}
        />
      )}

      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={SPRING}
            className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom,0px)+92px)] z-40 px-4 py-2.5 rounded-full bg-white text-black text-[13px] font-bold shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
          >
            {notice}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {h2h && (
          <HeadToHeadSheet
            friend={h2h}
            onClose={() => setH2h(null)}
            onRemoved={() => {
              setH2h(null);
              refreshSocial();
            }}
            onOpenChat={(fr) => {
              setH2h(null);
              setActiveChatFriend(fr);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChatFriend && (
          <DirectMessageSheet
            friend={activeChatFriend}
            currentUserId={userId}
            currentUserProfile={profile}
            onClose={() => setActiveChatFriend(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newPostOpen && (
          <NewPostModal
            isOpen={newPostOpen}
            onClose={() => setNewPostOpen(false)}
            userId={userId}
            profile={profile}
            onPostCreated={() => {
              flash('Foto publicada no feed e perfil com sucesso!');
              refreshSocial();
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
