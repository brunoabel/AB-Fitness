import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Activity, Camera, Crown, HandMetal, MessageCircle } from 'lucide-react';
import { Avatar, SPRING, exerciseLabel, fmtDuration, fmtKg, timeAgo } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { SkeletonList } from '../ui/Skeleton';
import { isAthleteCeo, isAthleteVerified } from '../../utils/userVerification';
import { triggerHaptic } from '../../utils/audio';

function RespectActionBar({ count, respected, athleteName, onRespect, reducedMotion }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-[12px] text-zinc-400 tabular-nums">
        {count > 0
          ? `${count} ${count === 1 ? 'respect' : 'respects'}`
          : 'Sê o primeiro a reconhecer'}
      </span>

      <motion.button
        type="button"
        whileTap={reducedMotion ? undefined : { scale: 0.92 }}
        transition={SPRING}
        aria-pressed={respected}
        aria-label={`Dar respect a ${athleteName}`}
        onClick={onRespect}
        className={`min-h-[44px] px-4 rounded-full inline-flex items-center gap-2 text-[13px] font-bold tabular-nums cursor-pointer touch-manipulation transition-colors ${
          respected
            ? 'bg-white text-black shadow-[0_6px_20px_rgba(255,255,255,0.16)]'
            : 'bg-white/[0.06] hover:bg-white/[0.11] text-zinc-200 border border-white/[0.08]'
        }`}
      >
        <HandMetal className="w-4 h-4" strokeWidth={respected ? 2.1 : 1.75} />
        <span>Respect</span>
        {count > 0 && <span className="font-display text-[15px] leading-none">{count}</span>}
      </motion.button>
    </div>
  );
}

function FeedPhotoEntry({ item, onRespect, onOpenChat, reducedMotion }) {
  const name = item.full_name || (item.username ? `@${item.username}` : 'Atleta');
  const ceo = isAthleteCeo(item);

  return (
    <article className="py-6 first:pt-4">
      <header className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar url={item.avatar_url} name={name} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-white truncate flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold truncate">{name}</span>
              {isAthleteVerified(item) && <VerifiedBadge size={14} />}
              {ceo && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  CEO
                </span>
              )}
            </p>
            <p className="text-[12px] text-zinc-500 mt-0.5">{timeAgo(item.created_at)}</p>
          </div>
        </div>

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            aria-label={`Conversar com ${name}`}
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer touch-manipulation transition-colors shrink-0"
          >
            <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        )}
      </header>

      {item.image_url && (
        <div className="relative aspect-[4/5] sm:aspect-[4/3] max-h-[540px] w-full rounded-2xl overflow-hidden bg-zinc-950">
          <img
            src={item.image_url}
            alt={item.caption || 'Foto do atleta'}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {item.caption && (
        <p className="mt-3.5 text-[14px] text-zinc-200 leading-relaxed">
          <span className="font-semibold text-white mr-1.5">{name}</span>
          {item.caption}
        </p>
      )}

      <RespectActionBar
        count={item.respect_count || 0}
        respected={Boolean(item.respected_by_me)}
        athleteName={name}
        onRespect={onRespect}
        reducedMotion={reducedMotion}
      />
    </article>
  );
}

function FeedWorkoutEntry({ item, onRespect, onOpenChat, reducedMotion }) {
  const name = item.full_name || (item.username ? `@${item.username}` : 'Atleta');

  return (
    <article className="py-6 first:pt-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar url={item.avatar_url} name={name} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] text-white truncate flex items-center gap-1.5">
              <span className="font-semibold truncate">{name}</span>
              {isAthleteVerified(item) && <VerifiedBadge size={14} />}
              <span className="text-zinc-400 shrink-0">concluiu um treino</span>
            </p>
            <p className="text-[12px] text-zinc-500 mt-0.5">{timeAgo(item.completed_at)}</p>
          </div>
        </div>

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            aria-label={`Conversar com ${name}`}
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer touch-manipulation transition-colors shrink-0"
          >
            <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </button>
        )}
      </header>

      <h3 className="mt-3.5 font-heading text-[21px] font-bold tracking-tight text-white">
        {item.workout_title || 'Sessão de Treino'}
      </h3>

      <dl className="mt-3.5 flex items-center gap-6">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Duração
          </dt>
          <dd className="mt-1 font-display text-[24px] leading-none font-bold text-white tabular-nums">
            {fmtDuration(item.duration_seconds)}
          </dd>
        </div>

        <div className="w-px h-8 bg-white/[0.08]" aria-hidden="true" />

        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Volume
          </dt>
          <dd className="mt-1 font-display text-[24px] leading-none font-bold text-white tabular-nums">
            {fmtKg(item.volume_kg)}
          </dd>
        </div>
      </dl>

      {item.top_exercises?.length > 0 && (
        <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">
          {item.top_exercises.map(exerciseLabel).join(' · ')}
        </p>
      )}

      <RespectActionBar
        count={item.respect_count || 0}
        respected={Boolean(item.respected_by_me)}
        athleteName={name}
        onRespect={onRespect}
        reducedMotion={reducedMotion}
      />
    </article>
  );
}

/** Feed editorial do Clube: fotos cinematográficas e sessões em diário aberto sem caixas. */
export default function ClubFeedView({
  loaded,
  feed,
  profile,
  currentUserId,
  onNewPost,
  onRespect,
  onOpenChat
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div>
      {/* Entrada editorial para publicar */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(8);
          onNewPost();
        }}
        className="group w-full min-h-[56px] py-3 border-b border-white/[0.06] flex items-center gap-3.5 text-left cursor-pointer touch-manipulation"
      >
        <Avatar
          url={profile?.avatar_url}
          name={profile?.full_name || profile?.username || 'A'}
          size={36}
        />
        <span className="flex-1 text-[14px] text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
          Partilha a tua evolução ou foto de treino...
        </span>
        <span className="w-9 h-9 rounded-full bg-white/[0.06] group-hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors shrink-0">
          <Camera className="w-4 h-4" strokeWidth={1.75} />
        </span>
      </button>

      {!loaded ? (
        <div className="pt-4">
          <SkeletonList rows={3} label="A carregar atividade do clube" />
        </div>
      ) : feed.length === 0 ? (
        <div className="py-14 px-4 text-center">
          <span className="mx-auto w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center text-zinc-400">
            <Activity className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 font-heading text-[18px] font-bold text-white">
            O feed do clube está pronto
          </h3>
          <p className="mt-1.5 text-[14px] text-zinc-400 max-w-xs mx-auto">
            Conclui um treino ou publica uma foto para inspirar o teu grupo.
          </p>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onNewPost();
            }}
            className="mt-5 min-h-[44px] px-5 rounded-full bg-white text-black text-[13px] font-bold inline-flex items-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer touch-manipulation"
          >
            <Camera className="w-4 h-4" strokeWidth={2} />
            Publicar primeira foto
          </button>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.07]">
          {feed.map((item) => {
            const friendId = item._type === 'photo' ? item.user_id : item.friend_id;
            const canChat = Boolean(friendId && friendId !== currentUserId);
            const openChat = canChat
              ? () => {
                  triggerHaptic(10);
                  onOpenChat({
                    friend_id: friendId,
                    full_name: item.full_name,
                    username: item.username,
                    avatar_url: item.avatar_url
                  });
                }
              : null;

            return item._type === 'photo' ? (
              <FeedPhotoEntry
                key={item.id}
                item={item}
                onRespect={() => onRespect(item)}
                onOpenChat={openChat}
                reducedMotion={reducedMotion}
              />
            ) : (
              <FeedWorkoutEntry
                key={item.session_id}
                item={item}
                onRespect={() => onRespect(item)}
                onOpenChat={openChat}
                reducedMotion={reducedMotion}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
