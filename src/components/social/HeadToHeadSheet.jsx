import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle } from 'lucide-react';
import { Avatar, Sheet, SPRING, fmtInt, fmtKg } from './ui';
import { Skeleton } from '../ui/Skeleton';
import { getHeadToHead, removeFriendship } from '../../services/socialService';

const METRICS = [
  { id: 'workouts', label: 'Treinos', fmt: fmtInt },
  { id: 'active_days', label: 'Dias ativos', fmt: fmtInt },
  { id: 'streak', label: 'Streak', fmt: (v) => (v == null ? 'Privado' : `${fmtInt(v)} d`) },
  { id: 'volume_kg', label: 'Volume', fmt: fmtKg }
];

/** Barra horizontal animada com scaleX (GPU). */
const Bar = ({ ratio, tone }) => (
  <span className="block h-2 rounded-full bg-white/[0.06] overflow-hidden">
    <motion.span
      className={`block h-full origin-left rounded-full ${tone}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: Math.max(0.02, ratio) }}
      transition={SPRING}
    />
  </span>
);

export default function HeadToHeadSheet({ friend, onClose, onRemoved, onOpenChat }) {
  const [days, setDays] = useState(7);
  const [result, setResult] = useState({ days: null, data: null, error: '' });

  useEffect(() => {
    let alive = true;
    getHeadToHead(friend.friend_id, days).then(({ data, error }) => {
      if (alive) setResult({ days, data, error: error || '' });
    });
    return () => {
      alive = false;
    };
  }, [friend.friend_id, days]);

  const loading = result.days !== days;
  const { data, error } = result;
  const name = friend.full_name || `@${friend.username}`;

  return (
    <Sheet onClose={onClose} title="Head-to-head" label={`Comparativo com ${name}`}>
      <div className="space-y-5 pt-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={friend.avatar_url} name={name} size={52} />
            <div className="min-w-0">
              <p className="font-heading text-section font-semibold text-white truncate">{name}</p>
              <p className="text-[13px] text-zinc-400 truncate">@{friend.username}{friend.athlete_tag ? ` · ${friend.athlete_tag}` : ''}</p>
            </div>
          </div>
          {onOpenChat && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChat(friend);
              }}
              className="min-h-[38px] px-3.5 rounded-xl bg-accent border border-accent-hover text-white text-[13px] font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Conversar
            </button>
          )}
        </div>

        <div role="radiogroup" aria-label="Período" className="flex p-1 gap-1 rounded-2xl bg-surface-2 border border-white/[0.08]">
          {[7, 30].map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={days === d}
              onClick={() => setDays(d)}
              className={`relative flex-1 min-h-[40px] rounded-xl text-[13px] font-semibold tabular-nums cursor-pointer ${days === d ? 'text-app' : 'text-zinc-300'}`}
            >
              {days === d && <motion.span layoutId="h2h-period" className="absolute inset-0 rounded-xl bg-primary" transition={SPRING} />}
              <span className="relative">Últimos {d} dias</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-[12px] text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white" />Tu</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent-hover" />{friend.full_name?.split(' ')[0] || 'Amigo'}</span>
        </div>

        {error ? (
          <p className="text-[14px] text-red-400">{error}</p>
        ) : (
          <ul className="space-y-4">
            {METRICS.map((m) => {
              const mine = data?.me?.[m.id];
              const theirs = data?.friend?.[m.id];
              const max = Math.max(Number(mine) || 0, Number(theirs) || 0, 1);
              return (
                <li key={m.id} className="rounded-2xl bg-surface-2 border border-white/[0.08] px-4 py-3.5">
                  <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-[13px] font-medium text-zinc-400">{m.label}</span>
                    {loading ? (
                      <Skeleton className="h-4 w-24 rounded-md" />
                    ) : (
                      <span className="text-body font-semibold text-white tabular-nums">
                        {m.fmt(mine)} <span className="text-zinc-500 font-normal">vs</span> {m.fmt(theirs)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Bar ratio={loading ? 0 : (Number(mine) || 0) / max} tone="bg-white" />
                    <Bar ratio={loading || theirs == null ? 0 : (Number(theirs) || 0) / max} tone="bg-accent-hover" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={async () => {
            if (!window.confirm(`Remover ${name} dos teus amigos?`)) return;
            const { error: e } = await removeFriendship(friend.friendship_id);
            if (!e) onRemoved(friend.friendship_id);
          }}
          className="w-full min-h-[48px] rounded-2xl text-[14px] font-semibold text-zinc-400 hover:text-red-400 cursor-pointer"
        >
          Remover amigo
        </button>
      </div>
    </Sheet>
  );
}
