/**
 * Erro definitivo de sincronização: o reenvio nunca vai passar sem mudar os dados
 * (classes SQL 22 e 23, ou 42501 que não seja falta de sessão).
 * Rede, 5xx, timeout e sessão expirada são transitórios e ficam na fila.
 */
export function isPermanentSyncError(error) {
  if (!error || typeof error !== 'object') return false;
  const code = String(error.code || '');
  if (/^2[23]/.test(code)) return true;
  if (code === '42501') return !/autentica/i.test(String(error.message || ''));
  return false;
}
