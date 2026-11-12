import React from 'react';
import { MapPin, Crown, Flame, Dumbbell, Award } from 'lucide-react';
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

export default function AthleteCard({ profile, stats, avatarPreview, compact = false }) {
  const cover = COVER_STYLES.find((c) => c.id === profile?.cover_style) || COVER_STYLES[0];
  const featured = FEATURED_STATS.find((f) => f.id === profile?.featured_stat) || FEATURED_STATS[0];
  const name = profile?.full_name || 'Atleta AB';
  const isCeo = Boolean(profile?.is_ceo) || isAthleteCeo(profile);
  const isPro = isCeo || Boolean(profile?.is_premium || profile?.is_pro) || isAthletePro(profile);
  const isVerified = Boolean(profile?.is_verified) || isAthleteVerified(profile);

  // Painel de carreira (rodapé): as 3 métricas possíveis, menos a que já está em destaque no
  // topo — nunca repete o mesmo número duas vezes no cartão.
  const careerMetrics = [
    { id: 'total_workouts', label: 'Treinos', value: fmtInt(stats?.total_workouts || 0) },
    { id: 'monthly_volume', label: 'Volume', value: fmtKg(stats?.monthly_volume_kg || 0) },
    { id: 'streak', label: 'Sequência', value: stats?.streak ? `${stats.streak}d` : '–' }
  ].filter((m) => m.id !== featured.id);

  return (
    <article className={`relative overflow-hidden rounded-3xl ${cover.className} ${cover.className.includes('border-') ? '' : 'border border-white/[0.08]'} shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl p-5 sm:p-6 transition-all`}>
      
      {/* Luz ambiente de prestígio no topo */}
      <div 
        aria-hidden 
        className={`absolute -top-20 -right-20 w-52 h-52 rounded-full opacity-30 blur-3xl pointer-events-none ${
          isCeo ? 'bg-amber-500' : 'bg-white'
        }`}
      />

      {/* Topo do Cartão: Avatar com Aura + Métrica em Destaque */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="relative">
          <Avatar 
            url={avatarPreview || profile?.avatar_url} 
            name={name} 
            size={compact ? 60 : 72} 
            className={`ring-2 ${isCeo ? 'ring-amber-500/50' : 'ring-white/20'} shadow-xl`} 
          />
          {isCeo && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg border-2 border-black" title="Fundador / CEO">
              <Crown className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          )}
        </div>

        {/* Estatística de Destaque */}
        <div className="text-right">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {featured.label}
          </span>
          <span className="block font-display font-black text-2xl sm:text-3xl text-white tabular-nums tracking-tight mt-0.5">
            {statValue(featured.id, stats)}
          </span>
        </div>
      </div>

      {/* Identidade do Atleta */}
      <div className="mt-4 relative z-10 space-y-1">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight truncate">
            {name}
          </h2>
          {isVerified && <VerifiedBadge size={compact ? 16 : 20} />}
          {isCeo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              CEO & Founder
            </span>
          ) : isPro ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider">
              PRO
            </span>
          ) : null}
        </div>

        <p className="text-xs font-medium text-zinc-400 truncate">
          {profile?.username ? `@${profile.username}` : isCeo ? 'CEO & Fundador do AB Fitness' : profile?.id ? 'Atleta Registado' : 'Atleta AB Fitness'}
        </p>

        {profile?.bio && !compact && (
          <p className="text-xs text-zinc-300 leading-relaxed pt-1.5 font-normal">
            {profile.bio}
          </p>
        )}

        {(profile?.athlete_tag || profile?.home_gym) && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {profile.athlete_tag && (
              <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-bold text-zinc-200">
                {profile.athlete_tag}
              </span>
            )}
            {profile.home_gym && (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                <MapPin className="w-3 h-3 text-zinc-500" strokeWidth={1.75} />
                {profile.home_gym}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Painel de Carreira (Rodapé do Cartão) — nunca repete a métrica já em destaque acima */}
      {!compact && stats && (
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-center relative z-10">
          {careerMetrics.map((m) => (
            <div key={m.id} className="p-2 rounded-xl bg-white/[0.02]">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">{m.label}</span>
              <span className="font-display font-black text-base text-white tabular-nums">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
