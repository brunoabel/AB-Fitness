import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Share2, UserPlus, Check, Clock3, Inbox, Users, Activity, HandMetal, Flame, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context';
import HeadToHeadSheet from './HeadToHeadSheet';
import { Avatar, SectionTitle, SPRING, TAP, exerciseLabel, fmtDuration, fmtInt, fmtKg, timeAgo } from './ui';
import { SkeletonList } from '../ui/Skeleton';
import {
  canUseSocial, getFriendFeed, getFriendsWeeklySummary, getMyProfile, listFriendships,
  respondFriendRequest, searchAthletes, sendFriendRequest, shareAthleteLink, toggleRespect
} from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';

const EXIT = { opacity: 0, x: 24, transition: { duration: 0.18 } };

function readAddParam() {
  try {
    return new URLSearchParams(window.location.search).get('add') || '';
  } catch {
    return '';
  }
}

function SearchResult({ r, onAdd, onAccept }) {
  let action;
  if (r.friendship_status === 'accepted') action = <span className="inline-flex items-center gap-1 text-[13px] text-zinc-400"><Check className="w-4 h-4" strokeWidth={2} />Amigos</span>;
  else if (r.friendship_status === 'pending' && r.i_requested) action = <span className="inline-flex items-center gap-1 text-[13px] text-zinc-400"><Clock3 className="w-4 h-4" strokeWidth={1.75} />Pedido enviado</span>;
  else if (r.friendship_status === 'pending') action = <motion.button type="button" whileTap={TAP} onClick={onAccept} className="min-h-[38px] px-3.5 rounded-xl bg-primary text-app text-[13px] font-bold cursor-pointer">Aceitar</motion.button>;
  else
    action = (
      <motion.button type="button" whileTap={TAP} transition={SPRING} onClick={onAdd} className="min-h-[38px] px-3.5 rounded-xl bg-accent border border-accent-hover text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer">
        <UserPlus className="w-4 h-4" strokeWidth={2} />
        Adicionar
      </motion.button>
    );
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar url={r.avatar_url} name={r.full_name || r.username} size={42} />
      <div className="flex-1 min-w-0">
        <p className="text-body font-semibold text-white truncate">{r.full_name || `@${r.username}`}</p>
        <p className="text-[13px] text-zinc-400 truncate">{r.username ? `@${r.username}` : 'Sem @username'}{r.athlete_tag ? ` · ${r.athlete_tag}` : ''}</p>
      </div>
      {action}
    </li>
  );
}

function FeedCard({ item, onRespect }) {
  const name = item.full_name || `@${item.username}`;
  return (
    <article className="rounded-2xl bg-surface border border-white/[0.08] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <header className="flex items-center gap-3">
        <Avatar url={item.avatar_url} name={name} size={38} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] text-white truncate"><span className="font-semibold">{name}</span> <span className="text-zinc-400">concluiu um treino</span></p>
          <p className="text-[12px] text-zinc-500">{timeAgo(item.completed_at)}</p>
        </div>
      </header>
      <h3 className="mt-3 font-heading text-section font-semibold text-white">{item.workout_title}</h3>
      <dl className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-surface-2 border border-white/[0.06] px-3 py-2">
          <dt className="text-[12px] text-zinc-400">Duração</dt>
          <dd className="text-body font-semibold text-white tabular-nums">{fmtDuration(item.duration_seconds)}</dd>
        </div>
        <div className="rounded-xl bg-surface-2 border border-white/[0.06] px-3 py-2">
          <dt className="text-[12px] text-zinc-400">Volume</dt>
          <dd className="text-body font-semibold text-white tabular-nums">{fmtKg(item.volume_kg)}</dd>
        </div>
      </dl>
      {item.top_exercises?.length > 0 && (
        <p className="mt-2.5 text-[13px] text-zinc-400 leading-snug">{item.top_exercises.map(exerciseLabel).join(', ')}</p>
      )}
      <div className="mt-3 flex justify-end">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          transition={SPRING}
          aria-pressed={item.respected_by_me}
          aria-label={`Dar respect a ${name}`}
          onClick={onRespect}
          className={`min-h-[40px] px-3.5 rounded-xl border inline-flex items-center gap-2 text-[13px] font-bold tabular-nums cursor-pointer transition-colors duration-150 ${item.respected_by_me ? 'bg-accent border-accent-hover text-white' : 'bg-surface-2 border-white/[0.08] text-zinc-300'}`}
        >
          <HandMetal className="w-4 h-4" strokeWidth={1.75} />
          Respect
          <span className="min-w-[1.5ch] text-right">{item.respect_count}</span>
        </motion.button>
      </div>
    </article>
  );
}

export default function SocialHub({ onNavigateTab }) {
  const { user } = useAuth();
  const userId = user?.id;
  const enabled = canUseSocial(userId);

  const [profile, setProfile] = useState(null);
  const [friendships, setFriendships] = useState([]);
  const [summary, setSummary] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [query, setQuery] = useState(readAddParam);
  const [results, setResults] = useState({ q: '', items: [] });
  const [h2h, setH2h] = useState(null);
  const [notice, setNotice] = useState('');

  const refreshSocial = useCallback(async () => {
    const [f, s, fd] = await Promise.all([listFriendships(), getFriendsWeeklySummary(), getFriendFeed(30)]);
    setFriendships(f.data || []);
    setSummary(s.data || []);
    setFeed(fd.data || []);
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
  const friendCount = friendships.filter((f) => f.status === 'accepted').length;
  const showResults = query.trim().length >= 2;

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2200);
  };

  const respond = async (f, accept) => {
    triggerHaptic(accept ? [10, 30, 10] : 8);
    setFriendships((list) => (accept ? list.map((x) => (x.friendship_id === f.friendship_id ? { ...x, status: 'accepted' } : x)) : list.filter((x) => x.friendship_id !== f.friendship_id)));
    const { error } = await respondFriendRequest(f.friendship_id, accept);
    if (error) flash(error);
    refreshSocial();
  };

  const add = async (r) => {
    triggerHaptic(10);
    setResults((s) => ({ ...s, items: s.items.map((x) => (x.id === r.id ? { ...x, friendship_status: 'pending', i_requested: true } : x)) }));
    const { error } = await sendFriendRequest(userId, r.id);
    if (error) flash(error);
    refreshSocial();
  };

  const acceptFromSearch = async (r) => {
    const f = friendships.find((x) => x.friend_id === r.id);
    if (f) await respond(f, true);
    setResults((s) => ({ ...s, items: s.items.map((x) => (x.id === r.id ? { ...x, friendship_status: 'accepted' } : x)) }));
  };

  const respect = async (item) => {
    triggerHaptic(item.respected_by_me ? 6 : [8, 24, 8]);
    const flip = (x) => (x.session_id === item.session_id ? { ...x, respected_by_me: !x.respected_by_me, respect_count: x.respect_count + (x.respected_by_me ? -1 : 1) } : x);
    setFeed((list) => list.map(flip));
    const { data, error } = await toggleRespect(item.session_id);
    if (error) {
      setFeed((list) => list.map(flip));
      flash(error);
    } else setFeed((list) => list.map((x) => (x.session_id === item.session_id ? { ...x, respect_count: data } : x)));
  };

  const share = async () => {
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
      <section className="max-w-md mx-auto w-full px-4 pt-6 pb-28">
        <div className="rounded-3xl bg-surface border border-white/[0.08] p-6 text-center">
          <span className="mx-auto w-12 h-12 rounded-2xl bg-accent border border-accent-hover flex items-center justify-center text-white">
            <Users className="w-6 h-6" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-heading text-title-xl font-bold tracking-tight text-white">Treina com os teus amigos</h1>
          <p className="mt-2 text-body text-zinc-400">Cria uma conta para teres perfil de atleta, adicionar amigos e comparar a evolução com eles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-md mx-auto w-full px-4 pt-5 pb-28 space-y-7" aria-label="Amigos">
      {/* Convite: partilhar o link do perfil (o cartão e a edição vivem no separador Perfil) */}
      <div className="space-y-2">
        <motion.button type="button" whileTap={TAP} transition={SPRING} onClick={share} disabled={!loaded} className="w-full min-h-[52px] rounded-2xl bg-accent border border-accent-hover text-white font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          <Share2 className="w-4 h-4" strokeWidth={2} />
          Convidar amigos com o meu link
        </motion.button>
        {loaded && profile && !profile.username && (
          <p className="text-[13px] text-zinc-400">Para partilhar o teu link, escolhe primeiro um @username no Perfil.</p>
        )}
        {loadError && <p className="text-[13px] text-red-400">Não foi possível carregar tudo: {loadError}</p>}
      </div>

      {/* Pesquisa */}
      <div className="space-y-2">
        <label htmlFor="squad-search" className="sr-only">Procurar atletas</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-zinc-500" strokeWidth={1.75} />
          <input
            id="squad-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar por @username ou nome"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full min-h-[50px] pl-11 pr-4 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
          />
        </div>
        {showResults && (
          <div className="rounded-2xl bg-surface border border-white/[0.08] px-4 py-1">
            {results.q !== query.trim() ? (
              <SkeletonList rows={2} className="py-2" label="A procurar atletas" />
            ) : results.items.length === 0 ? (
              <p className="py-4 text-[14px] text-zinc-400">Nenhum atleta encontrado. Confirma o @username ou pede o link do perfil.</p>
            ) : (
              <ul className="divide-y divide-white/[0.06]">
                {results.items.map((r) => (
                  <SearchResult key={r.id} r={r} onAdd={() => add(r)} onAccept={() => acceptFromSearch(r)} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Pedidos pendentes */}
      {(incoming.length > 0 || outgoing.length > 0) && (
        <div className="space-y-3">
          <SectionTitle icon={Inbox} aside={<span className="text-[13px] text-zinc-400 tabular-nums">{incoming.length}</span>}>Pedidos</SectionTitle>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {incoming.map((f) => (
                <motion.li key={f.friendship_id} layout="position" exit={EXIT} className="flex items-center gap-3 rounded-2xl bg-surface border border-white/[0.08] px-4 py-3">
                  <Avatar url={f.avatar_url} name={f.full_name || f.username} size={42} />
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-white truncate">{f.full_name || `@${f.username}`}</p>
                    <p className="text-[13px] text-zinc-400 truncate">quer treinar contigo</p>
                  </div>
                  <motion.button type="button" whileTap={TAP} transition={SPRING} onClick={() => respond(f, false)} className="min-h-[38px] px-3 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-white cursor-pointer">Recusar</motion.button>
                  <motion.button type="button" whileTap={TAP} transition={SPRING} onClick={() => respond(f, true)} className="min-h-[38px] px-3.5 rounded-xl bg-primary text-app text-[13px] font-bold cursor-pointer">Aceitar</motion.button>
                </motion.li>
              ))}
              {outgoing.map((f) => (
                <motion.li key={f.friendship_id} layout="position" exit={EXIT} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] px-4 py-2.5">
                  <Avatar url={f.avatar_url} name={f.full_name || f.username} size={34} />
                  <p className="flex-1 min-w-0 text-[14px] text-zinc-300 truncate">Pedido enviado a {f.full_name || `@${f.username}`}</p>
                  <motion.button type="button" whileTap={TAP} onClick={() => respond(f, false)} className="min-h-[36px] px-2.5 text-[13px] font-semibold text-zinc-500 hover:text-white cursor-pointer">Cancelar</motion.button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {/* Squad esta semana */}
      <div className="space-y-3">
        <SectionTitle icon={Users} aside={<span className="text-[13px] text-zinc-400 tabular-nums">{friendCount} {friendCount === 1 ? 'amigo' : 'amigos'}</span>}>Amigos esta semana</SectionTitle>
        {!loaded ? (
          <SkeletonList rows={2} label="A carregar amigos" />
        ) : summary.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-5 text-[14px] text-zinc-400">Ainda sem amigos. Procura um @username acima ou partilha o teu perfil.</p>
        ) : (
          <ul className="rounded-2xl bg-surface border border-white/[0.08] divide-y divide-white/[0.06]">
            {summary.map((s) => {
              const f = friendships.find((x) => x.friend_id === s.friend_id) || {};
              return (
                <li key={s.friend_id}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    transition={SPRING}
                    onClick={() => setH2h({ ...s, friendship_id: f.friendship_id })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
                  >
                    <Avatar url={s.avatar_url} name={s.full_name || s.username} size={42} />
                    <div className="flex-1 min-w-0">
                      <p className="text-body font-semibold text-white truncate">{s.full_name || `@${s.username}`}</p>
                      <p className="text-[13px] text-zinc-400 tabular-nums truncate">
                        {fmtInt(s.workouts_week)} {s.workouts_week === 1 ? 'treino' : 'treinos'} · {fmtKg(s.volume_week_kg)}
                      </p>
                    </div>
                    {s.streak != null && (
                      <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-white tabular-nums">
                        <Flame className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
                        {s.streak}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600" strokeWidth={1.75} />
                  </motion.button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        <SectionTitle icon={Activity}>Atividade</SectionTitle>
        {!loaded ? (
          <SkeletonList rows={2} label="A carregar atividade" />
        ) : feed.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/[0.1] px-4 py-5 text-[14px] text-zinc-400">Quando os teus amigos concluírem treinos, aparecem aqui.</p>
        ) : (
          <div className="space-y-3">
            {feed.map((item) => (
              <FeedCard key={item.session_id} item={item} onRespect={() => respect(item)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {notice && (
          <motion.p
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={SPRING}
            className="fixed left-1/2 -translate-x-1/2 bottom-[calc(env(safe-area-inset-bottom,0px)+92px)] z-40 px-4 py-2.5 rounded-xl bg-primary text-app text-[14px] font-semibold"
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
          />
        )}
      </AnimatePresence>
    </section>
  );
}
