/**
 * Determina se um utilizador ou perfil de atleta é Verificado (selo azul).
 *
 * Atualmente qualificados:
 * - O criador e administrador do AB Fitness (Bruno Araújo)
 * - Utilizadores com o papel 'admin'
 * - Perfis com flag 'is_verified' ou 'is_premium'
 *
 * No futuro:
 * - Exclusivo para membros com subscrição Premium ativa.
 */
export function isAthleteVerified(profileOrUser, contextUser, isAdmin = false) {
  if (!profileOrUser && !contextUser) return false;

  // 1. Flag booleana explícita
  if (profileOrUser?.is_verified === true || profileOrUser?.is_premium === true) return true;
  if (contextUser?.user_metadata?.is_verified === true || contextUser?.user_metadata?.is_premium === true) return true;

  // 2. Administrador da plataforma
  if (isAdmin || profileOrUser?.role === 'admin') return true;

  // 3. Email do criador (Bruno Araújo)
  const email = (contextUser?.email || profileOrUser?.email || '').toLowerCase().trim();
  if (email === 'brunoaaraujo2005@gmail.com') return true;
  if (email && email.startsWith('bruno') && (email.endsWith('@gmail.com') || email.endsWith('@abfitness.app'))) return true;

  // 4. Username oficial
  const username = (profileOrUser?.username || '').toLowerCase().trim();
  if (username === 'bruno' || username === 'brunoaraujo' || username === 'admin') return true;

  return false;
}
