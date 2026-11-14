const SITE_ORIGIN = 'https://www.abfitness.app';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/coach/ab-coach-wide.jpg`;

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeUsername(raw = '') {
  return String(raw)
    .trim()
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 40);
}

function resolveSafeHttpsImage(url) {
  if (typeof url !== 'string') return DEFAULT_OG_IMAGE;
  const trimmed = url.trim();
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  return DEFAULT_OG_IMAGE;
}

/**
 * Gera HTML estático com meta tags Open Graph e Twitter Card para crawlers
 * de redes sociais/mensagens (/?u=username), com redirecionamento seguro para o Athlete Pass.
 */
export function buildAthleteOgHtml({ username = '', athlete = null } = {}) {
  const cleanUser = sanitizeUsername(athlete?.username || username);
  const canonicalUrl = cleanUser
    ? `${SITE_ORIGIN}/?u=${encodeURIComponent(cleanUser)}`
    : `${SITE_ORIGIN}/`;

  const displayName = (athlete?.full_name || '').trim() || (cleanUser ? `@${cleanUser}` : 'Atleta AB Fitness');
  const handleSuffix = cleanUser && !displayName.includes(`@${cleanUser}`) ? ` (@${cleanUser})` : '';

  const title = cleanUser
    ? `${displayName}${handleSuffix} · AB Fitness Athlete Pass`
    : 'AB Fitness: treino, corrida e recuperação muscular';

  const summaryParts = [];
  if (athlete?.athlete_tag) summaryParts.push(String(athlete.athlete_tag).trim());
  const totalWorkouts = Number(athlete?.total_workouts || 0);
  if (totalWorkouts > 0) summaryParts.push(`${totalWorkouts} treinos`);
  const streak = Number(athlete?.streak || 0);
  if (streak > 0) summaryParts.push(`${streak}d streak`);
  if (athlete?.home_gym) summaryParts.push(String(athlete.home_gym).trim());

  let description;
  if (summaryParts.length > 0) {
    description = `${summaryParts.join(' · ')} — Junta-te ao AB Fitness.`;
  } else if (athlete?.bio) {
    description = String(athlete.bio).trim().slice(0, 180);
  } else if (cleanUser) {
    description = `Adiciona @${cleanUser} no AB Fitness e acompanha treinos de força, corrida GPS e recuperação.`;
  } else {
    description = 'Cargas, sobrecarga progressiva, corrida com GPS e mapa de recuperação muscular, com o AB Coach ao seu lado.';
  }

  const imageUrl = resolveSafeHttpsImage(athlete?.avatar_url);

  const eTitle = escapeHtml(title);
  const eDesc = escapeHtml(description);
  const eUrl = escapeHtml(canonicalUrl);
  const eImage = escapeHtml(imageUrl);
  const eName = escapeHtml(displayName);

  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${eTitle}</title>
    <meta name="description" content="${eDesc}" />
    <link rel="canonical" href="${eUrl}" />
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="AB Fitness" />
    <meta property="og:locale" content="pt_PT" />
    <meta property="og:url" content="${eUrl}" />
    <meta property="og:title" content="${eTitle}" />
    <meta property="og:description" content="${eDesc}" />
    <meta property="og:image" content="${eImage}" />
    <meta property="og:image:alt" content="Athlete Pass de ${eName} no AB Fitness" />
    <meta name="twitter:card" content="${athlete?.avatar_url ? 'summary' : 'summary_large_image'}" />
    <meta name="twitter:title" content="${eTitle}" />
    <meta name="twitter:description" content="${eDesc}" />
    <meta name="twitter:image" content="${eImage}" />
    <meta http-equiv="refresh" content="0;url=${eUrl}" />
  </head>
  <body style="background:#000000;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center;">
    <main>
      <h1 style="font-size:20px;margin:0 0 8px;">${eTitle}</h1>
      <p style="font-size:14px;color:#8e929f;margin:0 0 16px;">${eDesc}</p>
      <a href="${eUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#ffffff;color:#000000;text-decoration:none;font-weight:600;font-size:14px;">Abrir Athlete Pass</a>
    </main>
  </body>
</html>
`;
}
