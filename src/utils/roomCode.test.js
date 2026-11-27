import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cleanRoomCodeInput, isValidRoomCode, randomRoomCode, ROOM_CODE_LENGTH } from './roomCode.js';

describe('código das salas da dupla', () => {
  it('gera códigos válidos de 8 caracteres', () => {
    for (let i = 0; i < 50; i++) {
      const code = randomRoomCode();
      assert.equal(code.length, ROOM_CODE_LENGTH);
      assert.ok(isValidRoomCode(code));
    }
  });

  it('recusa códigos curtos ou com caracteres ambíguos', () => {
    assert.equal(isValidRoomCode('ABC'), false);
    assert.equal(isValidRoomCode('K7P2QX9'), false);
    assert.equal(isValidRoomCode('K7P2QX9O'), false);
    assert.equal(isValidRoomCode('K7P2QX9M'), true);
  });

  it('limpa o que se escreve no campo', () => {
    assert.equal(cleanRoomCodeInput(' k7p2-qx9m '), 'K7P2QX9M');
    assert.equal(cleanRoomCodeInput('K7P2QX9MZZZ'), 'K7P2QX9M');
  });
});
