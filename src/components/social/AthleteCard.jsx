import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { MapPin, Crown, Maximize2, ShieldCheck } from 'lucide-react';
import { Avatar, fmtInt, fmtKg } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { COVER_STYLES, FEATURED_STATS } from '../../services/socialService';
import { getAthleteRank, sanitizeUsername } from '../../utils/athletePassCard';

const statValue = (id, stats) => {
  if (!stats) return '–';
  if (id === 'streak') return `${fmtInt(stats.streak)} ${stats.streak === 1 ? 'dia' : 'dias'}`;
  if (id === 'monthly_volume') return fmtKg(stats.monthly_volume_kg);
  return fmtInt(stats.total_workouts);
};

const RANK_TONES = {
  gold: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  platinum: 'bg-white/10 text-zinc-100 border-white/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  neutral: 'bg-white/[0.06] text-zinc-300 border-white/[0.1]'
};

const TILT_SPRING = { stiffness: 320, damping: 28, mass: 0.8 };

export default function AthleteCard({
  profile,
  stats,
  avatarPreview,
  compact = false,
  showcase = false,
  onOpenPrintMode
}) {
  const cover = COVER_STYLES.find((c) => c.id === profile?.cover_style) || COVER_STYLES[0];
  const featured = FEATURED_STATS.find((f) => f.id === profile?.featured_stat) || FEATURED_STATS[0];
  const name = profile?.full_name || 'Atleta AB';
  const cleanUsername = sanitizeUsername(profile?.username);
  const isCeo = Boolean(profile?.is_ceo) || isAthleteCeo(profile);
  const isPro = isCeo || Boolean(profile?.is_premium || profile?.is_pro) || isAthletePro(profile);
  const isVerified = Boolean(profile?.is_verified) || isAthleteVerified(profile);
  const rank = getAthleteRank({
    totalWorkouts: stats?.total_workouts,
    streak: stats?.streak,
    isCeo
  });
  const reduce = useReducedMotion();
  const tiltEnabled = !compact && !showcase && !reduce;
  const cardRef = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), TILT_SPRING);
  const glareX = useTransform(px, (v) => `${(1 - v) * 100}%`);
  const glareY = useTransform(py, (v) => `${(1 - v) * 100}%`);
  const glareOpacity = useSpring(0, TILT_SPRING);

  const handlePointerMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
    glareOpacity.set(0.3);
  };
  const resetTilt = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.article
        ref={cardRef}
        onPointerMove={tiltEnabled ? handlePointerMove : undefined}
        onPointerLeave={tiltEnabled ? resetTilt : undefined}
        onPointerUp={tiltEnabled ? resetTilt : undefined}
        onPointerCancel={tiltEnabled ? resetTilt : undefined}
        style={{ rotateX: tiltEnabled ? rotateX : 0, rotateY: tiltEnabled ? rotateY : 0 }}
        className={`relative overflow-hidden rounded-3xl ${cover.className} ${cover.className.includes('border-') ? '' : 'border border-white/[0.08]'} shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl p-5 sm:p-6 transition-shadow`}
      >
        {/* Brilho especular: segue o oposto do ponteiro, só visível durante a interação */}
        {tiltEnabled && (
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              opacity: glareOpacity,
              '--gx': glareX,
              '--gy': glareY,
              background: 'radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.55), transparent 55%)'
            }}
          />
        )}

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
          <span className="block text-xs text-zinc-500">
            {featured.label}
          </span>
          <span className="block font-display font-semibold text-2xl sm:text-[28px] text-white tabular-nums tracking-[-0.025em] mt-0.5">
            {statValue(featured.id, stats)}
          </span>
        </div>
      </div>

      {/* Identidade do Atleta */}
      <div className="mt-4 relative z-10 space-y-1">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-[-0.02em] truncate">
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
          {cleanUsername ? `@${cleanUsername}` : isCeo ? 'CEO & Fundador do AB Fitness' : profile?.id ? 'Atleta Registado' : 'Atleta AB Fitness'}
        </p>

        {profile?.bio && !compact && (
          <p className="text-xs text-zinc-300 leading-relaxed pt-1.5 font-normal">
            {profile.bio}
          </p>
        )}

        {(profile?.athlete_tag || profile?.home_gym || !isCeo) && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {!isCeo && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${RANK_TONES[rank.tone] || RANK_TONES.neutral}`}>
                <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
                {rank.label}
              </span>
            )}
            {profile?.athlete_tag && (
              <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[11px] font-bold text-zinc-200">
                {profile.athlete_tag}
              </span>
            )}
            {profile?.home_gym && (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                <MapPin className="w-3 h-3 text-zinc-500" strokeWidth={1.75} />
                {profile.home_gym}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Assinatura Oficial para Print / Stories + Gatilho de Modo Print Limpo */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2 relative z-10 text-[11px]">
          <span className="font-medium text-zinc-400 truncate">
            {cleanUsername ? (
              <>
                <strong className="text-white font-semibold">@{cleanUsername}</strong> · abfitness.app
              </>
            ) : (
              'AB Fitness · abfitness.app'
            )}
          </span>

          {onOpenPrintMode && !showcase ? (
            <button
              type="button"
              onClick={onOpenPrintMode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] hover:bg-white/[0.14] text-zinc-200 hover:text-white font-semibold transition-colors cursor-pointer shrink-0"
              title="Abrir cartão em ecrã limpo para tirar print"
            >
              <Maximize2 className="w-3 h-3 stroke-[2]" />
              <span>Modo Print</span>
            </button>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0">
              Athlete Pass
            </span>
          )}
        </div>
      )}
      </motion.article>
    </div>
  );
}
