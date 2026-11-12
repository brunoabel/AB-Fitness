/**
 * syncQueue.test.js — Testes Unitários da Fila de Sincronização Offline Genérica
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { upsertJob, removeJobByKey } from './syncQueue.js';

describe('syncQueue — upsertJob', () => {
  it('acrescenta um job novo a uma lista vazia', () => {
    const result = upsertJob([], { key: 'a', value: 1 });
    assert.deepEqual(result, [{ key: 'a', value: 1 }]);
  });

  it('acrescenta um job com key diferente, preservando os existentes', () => {
    const result = upsertJob([{ key: 'a', value: 1 }], { key: 'b', value: 2 });
    assert.deepEqual(result, [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]);
  });

  it('substitui (não duplica) um job com a mesma key, mantendo a versão mais recente', () => {
    const result = upsertJob([{ key: 'a', value: 1 }, { key: 'b', value: 2 }], { key: 'a', value: 99 });
    assert.deepEqual(result, [{ key: 'b', value: 2 }, { key: 'a', value: 99 }]);
  });

  it('trata lista inválida (não-array) como vazia, sem lançar erro', () => {
    const result = upsertJob(null, { key: 'a', value: 1 });
    assert.deepEqual(result, [{ key: 'a', value: 1 }]);
  });
});

describe('syncQueue — removeJobByKey', () => {
  it('remove apenas o job com a key indicada', () => {
    const list = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
    assert.deepEqual(removeJobByKey(list, 'b'), [{ key: 'a' }, { key: 'c' }]);
  });

  it('não falha e devolve a lista intacta quando a key não existe', () => {
    const list = [{ key: 'a' }];
    assert.deepEqual(removeJobByKey(list, 'inexistente'), [{ key: 'a' }]);
  });

  it('trata lista inválida (não-array) como vazia', () => {
    assert.deepEqual(removeJobByKey(undefined, 'a'), []);
  });
});
