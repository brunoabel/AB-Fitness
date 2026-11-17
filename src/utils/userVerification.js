/**
 * AB Fitness — Sistema de Níveis de Acesso, Verificação e Status Executivo
 */

/**
 * Determina se o utilizador é o CEO & Fundador do AB Fitness (Bruno Araújo).
 * Possui acesso supremo a todas as ferramentas, painéis e funcionalidades do ecossistema.
 */
export function isAthleteCeo(profileOrUser, contextUser) {
  if (!profileOrUser && !contextUser) return false;

  const role = (profileOrUser?.role || '').toLowerCase();
  if (role === 'ceo') return true;

  const email = (contextUser?.email || profileOrUser?.email || '').toLowerCase().trim();
  if (email === 'brunoaaraujo2005@gmail.com') return true;

  return false;
}

/**
 * Determina se o utilizador possui plano PRO / Premium ativo.
 * O CEO usufrui de status PRO vitalício de forma automática.
 */
export function isAthletePro(profileOrUser, contextUser) {
  if (isAthleteCeo(profileOrUser, contextUser)) return true;
  if (profileOrUser?.is_premium === true || profileOrUser?.is_pro === true) return true;
  return false;
}

/**
 * Determina se um utilizador ou perfil de atleta é Verificado (selo azul).
 */
export function isAthleteVerified(profileOrUser, contextUser, isAdmin = false) {
  if (isAthleteCeo(profileOrUser, contextUser)) return true;
  if (isAthletePro(profileOrUser, contextUser)) return true;
  if (profileOrUser?.is_verified === true) return true;
  if (isAdmin || profileOrUser?.role === 'admin') return true;

  return false;
}

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
