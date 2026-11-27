/**
 * Código das salas da dupla ao vivo. O canal Realtime é público, por isso o código é a única barreira:
 * 8 caracteres de um alfabeto sem ambiguidades (sem 0/O/1/I), 32^8 ≈ 1,1 bilião de combinações.
 */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 8;
const ROOM_CODE_RE = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`);

/** Código aleatório criptográfico (256 é múltiplo de 32, por isso o módulo não enviesa). */
export function randomRoomCode() {
  const bytes = new Uint8Array(ROOM_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join('');
}

/** Maiúsculas, sem espaços nem caracteres fora do alfabeto (o que se escreve no campo). */
export function cleanRoomCodeInput(raw) {
  return String(raw ?? '')
    .toUpperCase()
    .split('')
    .filter((c) => ROOM_CODE_ALPHABET.includes(c))
    .join('')
    .slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(code) {
  return ROOM_CODE_RE.test(String(code ?? ''));
}
