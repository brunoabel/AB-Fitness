import React from 'react';
import { MapPin, Crown } from 'lucide-react';
import { Avatar, fmtInt, fmtKg } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { COVER_STYLES, FEATURED_STATS } from '../../services/socialService';

const statValue = (id, stats) => {
  if (!stats) return '–';
  if (id === 'streak') return `${fmtInt(stats.streak)} ${stats.streak === 1 ? 'dia' : 'dias'}`;
  if (id === 'monthly_volume') return fmtKg(stats.monthly_volume_kg);
  return fmtInt(stats.total_workouts);
};

/** Athlete Card: preto puro com faixa marinho; usado no perfil e como pré-visualização ao vivo na edição. */
export default function AthleteCard({ profile, stats, avatarPreview, compact = false }) {
  const cover = COVER_STYLES.find((c) => c.id === profile?.cover_style) || COVER_STYLES[0];
  const featured = FEATURED_STATS.find((f) => f.id === profile?.featured_stat) || FEATURED_STATS[0];
  const name = profile?.full_name || 'Atleta AB';
  const isCeo = Boolean(profile?.is_ceo) || isAthleteCeo(profile);
  const isPro = isCeo || Boolean(profile?.is_premium || profile?.is_pro) || isAthletePro(profile);
  const isVerified = Boolean(profile?.is_verified) || isAthleteVerified(profile);

  return (
    <article className="relative overflow-hidden rounded-3xl bg-app border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className={`h-20 ${cover.className} border-b border-white/[0.06] relative transition-colors`} aria-hidden />
      <div className="px-5 pb-5 -mt-10">
        <div className="flex items-end justify-between gap-3">
          <Avatar url={avatarPreview || profile?.avatar_url} name={name} size={compact ? 64 : 76} className="ring-4 ring-app" />
          <div className="text-right pb-1">
            <span className="block text-[12px] text-zinc-400">{featured.label}</span>
            <span className="block font-display font-bold text-[30px] leading-none tracking-tight text-white tabular-nums">{statValue(featured.id, stats)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 min-w-0 flex-wrap">
          <h3 className="font-heading text-title-xl font-bold tracking-tight text-white truncate">{name}</h3>
          {isVerified && <VerifiedBadge size={compact ? 18 : 22} />}
          {isCeo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              CEO
            </span>
          ) : isPro ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-black uppercase tracking-wider">
              PRO
            </span>
          ) : null}
        </div>
        <p className="text-body text-zinc-400 truncate">
          {profile?.username ? `@${profile.username}` : isCeo ? 'CEO & Fundador do AB Fitness' : profile?.id ? 'Escolhe o teu @username' : 'Atleta AB Fitness'}
        </p>
        {profile?.bio && !compact && <p className="mt-2.5 text-body text-zinc-300 leading-relaxed">{profile.bio}</p>}
        {(profile?.athlete_tag || profile?.home_gym) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {profile.athlete_tag && <span className="px-2.5 py-1 rounded-lg bg-accent/70 border border-accent-hover text-[12px] font-semibold text-white">{profile.athlete_tag}</span>}
            {profile.home_gym && (
              <span className="inline-flex items-center gap-1 text-[13px] text-zinc-400">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                {profile.home_gym}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
