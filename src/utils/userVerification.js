/**
 * AB Fitness — Sistema de Níveis de Acesso, Verificação e Status Executivo
 */

/**
 * Determina se o utilizador é o CEO & Fundador do AB Fitness (Bruno Araújo).
 * Possui acesso supremo a todas as ferramentas, painéis e funcionalidades do ecossistema.
 */
export function isAthleteCeo(profileOrUser, contextUser) {
  if (!profileOrUser && !contextUser) return false;

  const role = (profileOrUser?.role || contextUser?.user_metadata?.role || '').toLowerCase();
  if (role === 'ceo') return true;

  const email = (contextUser?.email || profileOrUser?.email || '').toLowerCase().trim();
  if (email === 'brunoaaraujo2005@gmail.com') return true;
  if (email && email.startsWith('bruno') && (email.endsWith('@gmail.com') || email.endsWith('@abfitness.app'))) return true;

  const username = (profileOrUser?.username || '').toLowerCase().trim();
  if (username === 'bruno' || username === 'brunoaraujo' || username === 'ceo') return true;

  return false;
}

/**
 * Determina se o utilizador possui plano PRO / Premium ativo.
 * O CEO usufrui de status PRO vitalício de forma automática.
 */
export function isAthletePro(profileOrUser, contextUser) {
  if (isAthleteCeo(profileOrUser, contextUser)) return true;
  if (profileOrUser?.is_premium === true || profileOrUser?.is_pro === true) return true;
  if (contextUser?.user_metadata?.is_premium === true || contextUser?.user_metadata?.is_pro === true) return true;
  return false;
}

/**
 * Determina se um utilizador ou perfil de atleta é Verificado (selo azul).
 */
export function isAthleteVerified(profileOrUser, contextUser, isAdmin = false) {
  if (isAthleteCeo(profileOrUser, contextUser)) return true;
  if (isAthletePro(profileOrUser, contextUser)) return true;
  if (profileOrUser?.is_verified === true) return true;
  if (contextUser?.user_metadata?.is_verified === true) return true;
  if (isAdmin || profileOrUser?.role === 'admin') return true;

  return false;
}
