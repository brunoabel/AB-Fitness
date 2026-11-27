import React, { useRef, useState } from 'react';
import { motion, animate, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { Crown, Share, ShieldCheck, RotateCw, Link2, Check, SlidersHorizontal } from 'lucide-react';
import { fmtInt, fmtKg } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { getAthleteRank, isAthleteVerified, isAthleteCeo, isAthletePro } from '../../utils/userVerification';
import { FEATURED_STATS, athleteLink } from '../../services/socialService';
import { sanitizeUsername } from '../../utils/athletePassCard';
import { buildCardMetrics, getCardTheme, themeBackground } from '../../utils/profileCard';
import { triggerHaptic } from '../../utils/audio';


const RANK_TONES = {
  gold: 'bg-accent/60 text-white border-accent-hover',
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
  metrics = null,
  onOpenPrintMode,
  onCustomize
}) {
  const theme = getCardTheme(profile?.cover_style);
  const featured = FEATURED_STATS.find((f) => f.id === profile?.featured_stat) || FEATURED_STATS[0];
  // Sem escolha local (cartão de um amigo): as 3 métricas do servidor, com a métrica em destaque primeiro
  const cardMetrics = Array.isArray(metrics) && metrics.length
    ? metrics
    : buildCardMetrics([featured.id, ...FEATURED_STATS.map((f) => f.id)], stats);
  const name = profile?.full_name || 'Atleta AB';
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
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
  const flipEnabled = !compact && !showcase;
  const cardRef = useRef(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), TILT_SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), TILT_SPRING);
  const glareX = useTransform(px, (v) => `${(1 - v) * 100}%`);
  const glareY = useTransform(py, (v) => `${(1 - v) * 100}%`);
  const glareOpacity = useSpring(0, TILT_SPRING);
  const flipScale = useMotionValue(1);

  const [isFlipped, setIsFlipped] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

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
  /** "Flip" sem 3D real (backface-visibility quebra com overflow-hidden + cantos arredondados):
   * aperta a largura a 0 (o cartão vira-se de lado), troca o conteúdo nesse instante invisível, solta. */
  const toggleFlip = async () => {
    triggerHaptic(10);
    if (reduce) {
      setIsFlipped((v) => !v);
      return;
    }
    await animate(flipScale, 0, { duration: 0.15, ease: [0.4, 0, 1, 1] });
    setIsFlipped((v) => !v);
    animate(flipScale, 1, { duration: 0.22, ease: [0, 0, 0.2, 1] });
  };
  const handleCopyLink = async () => {
    if (!cleanUsername) return;
    try {
      await navigator.clipboard.writeText(athleteLink(cleanUsername));
      triggerHaptic(10);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.article
        ref={cardRef}
        onPointerMove={tiltEnabled ? handlePointerMove : undefined}
        onPointerLeave={tiltEnabled ? resetTilt : undefined}
        onPointerUp={tiltEnabled ? resetTilt : undefined}
        onPointerCancel={tiltEnabled ? resetTilt : undefined}
        style={{
          rotateX: tiltEnabled ? rotateX : 0,
          rotateY: tiltEnabled ? rotateY : 0,
          scaleX: flipScale,
          background: themeBackground(theme),
          borderColor: theme.line
        }}
        className="relative overflow-hidden rounded-3xl border p-5 sm:p-6"
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

      {!isFlipped ? (
      <div>
      {/* Identidade: avatar recortado + nome, selo e handle */}
      <div className="flex items-center gap-3.5 relative z-10">
        <div className="relative shrink-0">
          {avatarPreview || profile?.avatar_url ? (
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ width: compact ? 52 : 64, height: compact ? 52 : 64 }}
            >
              <img
                src={avatarPreview || profile.avatar_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 62%, transparent 100%)'
                }}
              />
            </div>
          ) : (
            <div
              className="relative flex items-center justify-center rounded-2xl bg-white/[0.06] font-heading font-semibold text-white"
              style={{ width: compact ? 52 : 64, height: compact ? 52 : 64, fontSize: (compact ? 52 : 64) * 0.36 }}
            >
              {initials}
            </div>
          )}
          {isCeo && (
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center border-2 border-black" title="Fundador / CEO">
              <Crown className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-white tracking-[-0.02em] truncate">
              {name}
            </h2>
            {isVerified && <VerifiedBadge size={compact ? 16 : 18} variant={isCeo ? 'gold' : 'pro'} />}
            {!isVerified && isPro && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                PRO
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-zinc-400 truncate mt-0.5">
            {cleanUsername ? `@${cleanUsername}` : isCeo ? 'CEO & Fundador' : 'Atleta AB Fitness'}
            {!isCeo && <span className="text-zinc-500"> · {rank.label}</span>}
          </p>
        </div>
      </div>

      {profile?.bio && !compact && (
        <p className="relative z-10 mt-3 text-[13px] text-zinc-300 leading-snug line-clamp-2">{profile.bio}</p>
      )}

      {/* As 3 métricas do atleta */}
      <dl className={`relative z-10 grid grid-cols-3 ${compact ? 'mt-4' : 'mt-6'}`}>
        {cardMetrics.slice(0, 3).map((m, i) => (
          <div key={m.id} className={`min-w-0 ${i > 0 ? 'pl-3 border-l' : 'pr-3'}`} style={i > 0 ? { borderColor: theme.line } : undefined}>
            <dd className="font-display font-semibold tabular-nums tracking-[-0.03em] leading-none truncate" style={{ color: theme.accent }}>
              <span className={compact ? 'text-xl' : 'text-[28px] sm:text-[32px]'}>{m.value}</span>
              {m.unit && <span className="ml-0.5 text-[13px] font-medium text-zinc-400">{m.unit}</span>}
            </dd>
            <dt className="mt-1.5 text-[11px] font-medium text-zinc-400 truncate">{m.label}</dt>
          </div>
        ))}
      </dl>

      {/* Assinatura para print + ações do cartão */}
      {!compact && (
        <div className="mt-5 pt-3 border-t flex items-center justify-between gap-2 relative z-10" style={{ borderColor: theme.line }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 truncate">
            AB Fitness <span className="font-medium normal-case tracking-normal text-zinc-500">· abfitness.app</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {onCustomize && !showcase && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCustomize(); }}
                aria-label="Personalizar cartão"
                title="Personalizar cartão"
                className="tap-44 w-8 h-8 rounded-full text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
            {flipEnabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
                aria-label="Ver verso do cartão"
                title="Ver verso do cartão"
                className="tap-44 w-8 h-8 rounded-full text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
            {onOpenPrintMode && !showcase && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenPrintMode(); }}
                aria-label="Partilhar cartão"
                title="Partilhar cartão"
                className="tap-44 w-8 h-8 rounded-full text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <Share className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>
      )}
      </div>
      ) : (
      <div className="min-h-[200px] flex flex-col relative z-10">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${RANK_TONES[rank.tone] || RANK_TONES.neutral}`}>
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
            {rank.label}
          </span>

          {(profile?.athlete_tag || profile?.home_gym) && (
            <div className="space-y-1">
              {profile?.athlete_tag && <p className="text-sm font-semibold text-white">{profile.athlete_tag}</p>}
              {profile?.home_gym && <p className="text-xs text-zinc-400">{profile.home_gym}</p>}
            </div>
          )}

          <p className="text-xs text-zinc-400 tabular-nums">
            {fmtInt(stats?.total_workouts)} treinos · {fmtKg(stats?.monthly_volume_kg)} este mês
          </p>

          {cleanUsername && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCopyLink(); }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] text-[12px] font-semibold text-white cursor-pointer"
            >
              {justCopied ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Link2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {justCopied ? 'Link copiado' : `abfitness.app/?u=${cleanUsername}`}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
          className="self-center pt-2 text-[11px] font-semibold text-zinc-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCw className="w-3 h-3" strokeWidth={2} />
          Voltar à frente
        </button>
      </div>
      )}
      </motion.article>
    </div>
  );
}
