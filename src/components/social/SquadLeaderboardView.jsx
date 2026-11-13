import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronRight, Flame, MessageCircle, Share2, Users } from 'lucide-react';
import { Avatar, SPRING, fmtInt, fmtKg } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { SkeletonList } from '../ui/Skeleton';
import { isAthleteVerified } from '../../utils/userVerification';
import { sortWeeklySquad } from '../../utils/clubHelpers';
import { triggerHaptic } from '../../utils/audio';

function rankColor(index) {
  if (index === 0) return 'text-amber-400';
  if (index === 1) return 'text-zinc-200';
  if (index === 2) return 'text-amber-600';
  return 'text-zinc-500';
}

/** Classificação semanal do Squad: linhas abertas com divisores finos, H2H e chat direto. */
export default function SquadLeaderboardView({
  loaded,
  summary,
  friendships,
  onOpenH2H,
  onOpenChat,
  onShareInvite
}) {
  const reducedMotion = useReducedMotion();
  const ranked = useMemo(() => sortWeeklySquad(summary), [summary]);

  if (!loaded) {
    return (
      <div className="pt-4">
        <SkeletonList rows={3} label="A carregar classificação do squad" />
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="py-14 px-4 text-center">
        <span className="mx-auto w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400">
          <Users className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <h3 className="mt-4 font-heading text-[18px] font-bold text-white">
          Constrói o teu círculo de treino
        </h3>
        <p className="mt-1.5 text-[14px] text-zinc-400 max-w-xs mx-auto">
          Procura atletas por @username ou partilha o teu convite para comparar evolução e treinar em conjunto.
        </p>
        {onShareInvite && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onShareInvite();
            }}
            className="mt-5 min-h-[44px] px-5 rounded-full bg-white text-black text-[13px] font-bold inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer touch-manipulation"
          >
            <Share2 className="w-4 h-4" strokeWidth={2} />
            Convidar amigos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">
          Ranking da Semana
        </span>
        <span className="text-[11px] font-medium text-zinc-500 tabular-nums">
          {ranked.length} {ranked.length === 1 ? 'atleta' : 'atletas'} · toque para H2H
        </span>
      </div>

      <ul className="divide-y divide-white/[0.05]">
        {ranked.map((s, index) => {
          const f = friendships.find((x) => x.friend_id === s.friend_id) || {};
          const friendPayload = { ...s, friendship_id: f.friendship_id };
          const displayName = s.full_name || `@${s.username}`;

          return (
            <li key={s.friend_id} className="flex items-center gap-2.5 py-2.5 group">
              <motion.button
                type="button"
                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                transition={SPRING}
                onClick={() => {
                  triggerHaptic(8);
                  onOpenH2H(friendPayload);
                }}
                className="flex-1 min-w-0 min-h-[52px] flex items-center gap-3 text-left cursor-pointer touch-manipulation py-1"
              >
                <span
                  className={`w-6 text-center font-display text-[19px] font-semibold tabular-nums shrink-0 ${rankColor(index)}`}
                >
                  {index + 1}
                </span>

                <Avatar url={s.avatar_url} name={displayName} size={44} />

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-white truncate flex items-center gap-1.5">
                    <span className="truncate">{displayName}</span>
                    {isAthleteVerified(s) && <VerifiedBadge size={14} />}
                  </p>
                  <p className="text-[13px] text-zinc-400 tabular-nums truncate mt-0.5">
                    {fmtInt(s.workouts_week)} {s.workouts_week === 1 ? 'treino' : 'treinos'} · {fmtKg(s.volume_week_kg)}
                  </p>
                </div>

                {s.streak != null && s.streak > 0 && (
                  <span className="inline-flex items-center gap-1 font-display text-[14px] font-semibold text-amber-300 tabular-nums shrink-0 pr-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                    {s.streak}d
                  </span>
                )}
              </motion.button>

              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onOpenChat(friendPayload);
                  }}
                  aria-label={`Conversar com ${displayName}`}
                  title={`Conversar com ${displayName}`}
                  className="min-w-[44px] min-h-[44px] rounded-full hover:bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer touch-manipulation transition-colors"
                >
                  <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(8);
                    onOpenH2H(friendPayload);
                  }}
                  aria-label={`Comparar com ${displayName}`}
                  className="w-8 h-11 flex items-center justify-center text-zinc-600 group-hover:text-zinc-300 cursor-pointer touch-manipulation transition-colors"
                >
                  <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
