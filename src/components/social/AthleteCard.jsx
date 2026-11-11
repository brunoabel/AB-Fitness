import React from 'react';
import { MapPin } from 'lucide-react';
import { Avatar, fmtInt, fmtKg } from './ui';
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

  return (
    <article className="relative overflow-hidden rounded-3xl bg-app border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className={`h-16 ${cover.className} border-b border-white/[0.06]`} aria-hidden>
        {/* Linha de barra: assinatura gráfica do AB Fitness */}
        <span className="absolute left-5 right-5 top-8 h-px bg-white/[0.12]" />
      </div>
      <div className="px-5 pb-5 -mt-9">
        <div className="flex items-end justify-between gap-3">
          <Avatar url={avatarPreview || profile?.avatar_url} name={name} size={compact ? 64 : 76} className="ring-4 ring-app" />
          <div className="text-right pb-1">
            <span className="block text-[12px] text-zinc-400">{featured.label}</span>
            <span className="block font-display font-bold text-[30px] leading-none tracking-tight text-white tabular-nums">{statValue(featured.id, stats)}</span>
          </div>
        </div>
        <h3 className="mt-3 font-heading text-title-xl font-bold tracking-tight text-white truncate">{name}</h3>
        <p className="text-body text-zinc-400 truncate">{profile?.username ? `@${profile.username}` : profile?.id ? 'Escolhe o teu @username' : 'Atleta AB Fitness'}</p>
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
