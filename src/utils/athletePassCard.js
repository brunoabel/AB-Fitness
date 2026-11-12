/**
 * athletePassCard.js — AB Athlete Pass (Cartão Printável & Story 9:16)
 * Lógica pura de patente/conteúdo + geração em Canvas HD (1080×1920) para Instagram Stories.
 */

const W = 1080;
const H = 1920;

const PASS_PALETTES = {
  midnight: { top: '#111827', mid: '#07090f', bottom: '#030407', glow: 'rgba(148, 163, 184, 0.22)', border: 'rgba(255,255,255,0.14)', accent: '#ffffff' },
  carbon: { top: '#18181b', mid: '#09090b', bottom: '#030304', glow: 'rgba(212, 212, 216, 0.16)', border: 'rgba(255,255,255,0.14)', accent: '#f4f4f5' },
  abyss: { top: '#0c192c', mid: '#060c18', bottom: '#02050a', glow: 'rgba(56, 189, 248, 0.24)', border: 'rgba(56, 189, 248, 0.25)', accent: '#7dd3fc' },
  gold: { top: '#2d1c06', mid: '#140d04', bottom: '#060402', glow: 'rgba(245, 158, 11, 0.30)', border: 'rgba(245, 158, 11, 0.42)', accent: '#fbbf24' },
  titanium: { top: '#262626', mid: '#141414', bottom: '#050505', glow: 'rgba(229, 229, 229, 0.22)', border: 'rgba(255,255,255,0.22)', accent: '#e5e5e5' },
  cyberpunk: { top: '#082026', mid: '#051017', bottom: '#020509', glow: 'rgba(34, 211, 238, 0.26)', border: 'rgba(34, 211, 238, 0.35)', accent: '#67e8f9' },
  aurora: { top: '#06261d', mid: '#041210', bottom: '#020605', glow: 'rgba(16, 185, 129, 0.28)', border: 'rgba(16, 185, 129, 0.35)', accent: '#6ee7b7' },
  crimson: { top: '#2b0910', mid: '#140508', bottom: '#060203', glow: 'rgba(244, 63, 94, 0.26)', border: 'rgba(244, 63, 94, 0.35)', accent: '#fda4af' },
  emerald: { top: '#052619', mid: '#03120d', bottom: '#010604', glow: 'rgba(52, 211, 153, 0.28)', border: 'rgba(52, 211, 153, 0.35)', accent: '#6ee7b7' },
  amethyst: { top: '#1d1035', mid: '#0e071a', bottom: '#05020a', glow: 'rgba(168, 85, 247, 0.28)', border: 'rgba(168, 85, 247, 0.35)', accent: '#d8b4fe' },
  sunset: { top: '#2b1208', mid: '#160807', bottom: '#070303', glow: 'rgba(251, 146, 60, 0.28)', border: 'rgba(251, 146, 60, 0.35)', accent: '#fdba74' },
  electric_blue: { top: '#0b1938', mid: '#060d20', bottom: '#02050c', glow: 'rgba(96, 165, 250, 0.28)', border: 'rgba(96, 165, 250, 0.35)', accent: '#93c5fd' },
  magma: { top: '#2b0d06', mid: '#140604', bottom: '#060202', glow: 'rgba(249, 115, 22, 0.28)', border: 'rgba(249, 115, 22, 0.35)', accent: '#fdba74' },
  monochrome_luxury: { top: '#18181b', mid: '#09090b', bottom: '#000000', glow: 'rgba(255, 255, 255, 0.18)', border: 'rgba(255,255,255,0.2)', accent: '#e4e4e7' }
};

/** Calcula a patente atlética com base na consistência e volume histórico de sessões. */
export function getAthleteRank({ totalWorkouts = 0, streak = 0, isCeo = false } = {}) {
  const count = Math.max(0, Number(totalWorkouts) || 0);
  const days = Math.max(0, Number(streak) || 0);

  if (isCeo) {
    return { id: 'founder', label: 'Founder', tone: 'gold' };
  }
  if (count >= 50 || days >= 14) {
    return { id: 'elite', label: 'Elite AB', tone: 'gold' };
  }
  if (count >= 20 || days >= 7) {
    return { id: 'veteran', label: 'Veterano', tone: 'platinum' };
  }
  if (count >= 5 || days >= 3) {
    return { id: 'consistent', label: 'Consistente', tone: 'emerald' };
  }
  return { id: 'starter', label: 'Starter', tone: 'neutral' };
}

/** Normaliza @username removendo arrobas extras, espaços e caracteres inválidos. */
export function sanitizeUsername(raw) {
  const clean = String(raw || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, '');
  return clean.slice(0, 20);
}

/** Formata métricas e identidade para exibição no Athlete Pass (cartão & Story). */
export function buildAthletePassContent({ profile = {}, stats = {} } = {}) {
  const fullName = (profile?.full_name || '').trim() || 'Atleta AB';
  const username = sanitizeUsername(profile?.username);
  const handle = username ? `@${username}` : '';
  const totalWorkouts = Math.max(0, Number(stats?.total_workouts) || 0);
  const streak = Math.max(0, Number(stats?.streak) || 0);
  const monthlyVolume = Math.max(0, Math.round(Number(stats?.monthly_volume_kg) || 0));
  const featuredId = profile?.featured_stat || 'total_workouts';
  const isCeo = Boolean(profile?.is_ceo);

  const rank = getAthleteRank({ totalWorkouts, streak, isCeo });

  const formatVolume = (kg) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1).replace(/\.0$/, '')} t`;
    return `${kg} kg`;
  };

  const featuredMap = {
    total_workouts: { id: 'total_workouts', label: 'Total de treinos', value: `${totalWorkouts}` },
    streak: { id: 'streak', label: 'Sequência ativa', value: streak ? `${streak}d` : '0d' },
    monthly_volume: { id: 'monthly_volume', label: 'Volume mensal', value: formatVolume(monthlyVolume) }
  };

  const heroStat = featuredMap[featuredId] || featuredMap.total_workouts;

  const inviteUrl = username
    ? `https://www.abfitness.app/?u=${encodeURIComponent(username)}`
    : 'https://www.abfitness.app';

  const footerCallout = username
    ? `Segue @${username} em abfitness.app`
    : 'Treina com precisão em abfitness.app';

  return {
    fullName,
    username,
    handle,
    rank,
    coverStyle: profile?.cover_style || (isCeo ? 'gold' : 'midnight'),
    athleteTag: (profile?.athlete_tag || '').trim(),
    homeGym: (profile?.home_gym || '').trim(),
    bio: (profile?.bio || '').trim(),
    heroStat,
    inviteUrl,
    footerCallout
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function textLine(ctx, text, x, y, { size = 28, weight = 700, color = '#ffffff', align = 'left' } = {}) {
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function loadImageSafe(url) {
  if (!url) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => resolve(null), 2200);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

/** Gera a imagem PNG 1080×1920 do Athlete Pass pronta para Instagram Stories. */
export async function buildAthletePassStoryBlob({ profile = {}, stats = {} } = {}) {
  const content = buildAthletePassContent({ profile, stats });
  const palette = PASS_PALETTES[content.coverStyle] || PASS_PALETTES.midnight;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Fundo OLED profundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#07090d');
  bg.addColorStop(0.45, '#030407');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 2. Marca superior discreta
  textLine(ctx, 'AB FITNESS · ATHLETE PASS', W / 2, 185, {
    size: 26,
    weight: 800,
    color: 'rgba(255,255,255,0.6)',
    align: 'center'
  });

  // 3. Cartão principal centrado (estilo Apple / Revolut Metal, sem ruído decorativo)
  const cardX = 88;
  const cardY = 290;
  const cardW = W - 176;
  const cardH = 980;

  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, palette.top);
  cardGrad.addColorStop(0.5, palette.mid);
  cardGrad.addColorStop(1, palette.bottom);

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = cardGrad;
  roundRect(ctx, cardX, cardY, cardW, cardH, 52);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 3;
  roundRect(ctx, cardX, cardY, cardW, cardH, 52);
  ctx.stroke();

  // Avatar ou Iniciais
  const avatarCenterX = cardX + 145;
  const avatarCenterY = cardY + 150;
  const avatarRadius = 74;
  const img = await loadImageSafe(profile?.avatar_url);

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    const side = Math.min(img.width, img.height);
    ctx.drawImage(
      img,
      (img.width - side) / 2,
      (img.height - side) / 2,
      side,
      side,
      avatarCenterX - avatarRadius,
      avatarCenterY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
  } else {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(avatarCenterX - avatarRadius, avatarCenterY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    const initials = content.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'AB';
    textLine(ctx, initials, avatarCenterX, avatarCenterY + 18, { size: 52, weight: 900, color: '#ffffff', align: 'center' });
  }
  ctx.restore();

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius + 4, 0, Math.PI * 2);
  ctx.stroke();

  // Patente no canto superior direito do cartão
  textLine(ctx, content.rank.label.toUpperCase(), cardX + cardW - 65, cardY + 125, {
    size: 24,
    weight: 900,
    color: palette.accent,
    align: 'right'
  });
  textLine(ctx, content.athleteTag || 'ATLETA AB', cardX + cardW - 65, cardY + 165, {
    size: 22,
    weight: 600,
    color: 'rgba(255,255,255,0.55)',
    align: 'right'
  });

  // Nome & @username
  const displayName = content.fullName.length > 22 ? `${content.fullName.slice(0, 20)}…` : content.fullName;
  textLine(ctx, displayName, cardX + 70, cardY + 325, {
    size: 56,
    weight: 900,
    color: '#ffffff'
  });
  if (content.handle) {
    textLine(ctx, content.handle, cardX + 70, cardY + 382, {
      size: 34,
      weight: 700,
      color: palette.accent
    });
  }
  if (content.homeGym) {
    const gymText = content.homeGym.length > 36 ? `${content.homeGym.slice(0, 34)}…` : content.homeGym;
    textLine(ctx, `📍 ${gymText}`, cardX + 70, cardY + 440, {
      size: 26,
      weight: 600,
      color: 'rgba(255,255,255,0.62)'
    });
  }

  // Divisória sutil
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX + 70, cardY + 510);
  ctx.lineTo(cardX + cardW - 70, cardY + 510);
  ctx.stroke();

  // Métrica Hero central gigante
  textLine(ctx, content.heroStat.label.toUpperCase(), W / 2, cardY + 605, {
    size: 26,
    weight: 700,
    color: 'rgba(255,255,255,0.55)',
    align: 'center'
  });
  textLine(ctx, content.heroStat.value, W / 2, cardY + 755, {
    size: 148,
    weight: 900,
    color: '#ffffff',
    align: 'center'
  });

  // Assinatura oficial no fundo do cartão
  textLine(ctx, content.handle ? `${content.handle} · abfitness.app` : 'abfitness.app', W / 2, cardY + cardH - 58, {
    size: 26,
    weight: 700,
    color: 'rgba(255,255,255,0.5)',
    align: 'center'
  });

  // 4. CTA Viral abaixo do cartão para Stories
  textLine(ctx, 'TREINA COMIGO NO AB FITNESS', W / 2, 1475, {
    size: 32,
    weight: 900,
    color: '#ffffff',
    align: 'center'
  });
  textLine(ctx, content.footerCallout, W / 2, 1535, {
    size: 28,
    weight: 600,
    color: palette.accent,
    align: 'center'
  });
  textLine(ctx, 'Toca no link ou pesquisa o @username na app', W / 2, 1615, {
    size: 24,
    weight: 500,
    color: 'rgba(255,255,255,0.45)',
    align: 'center'
  });

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

/** Partilha o Athlete Pass em Story via Web Share API com fallback para download PNG. */
export async function shareAthletePassStory(blob, { username = '' } = {}) {
  if (!blob) return 'failed';
  const cleanUser = sanitizeUsername(username);
  const fileName = cleanUser ? `ab-pass-${cleanUser}.png` : 'ab-athlete-pass.png';
  const file = new File([blob], fileName, { type: 'image/png' });
  const inviteUrl = cleanUser ? `https://www.abfitness.app/?u=${encodeURIComponent(cleanUser)}` : 'https://www.abfitness.app';

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: cleanUser ? `@${cleanUser} — AB Fitness Pass` : 'AB Fitness Athlete Pass',
        text: cleanUser
          ? `Segue-me no AB Fitness (@${cleanUser}): ${inviteUrl}`
          : `Vem treinar comigo no AB Fitness: ${inviteUrl}`
      });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

