/**
 * workoutResultCard.test.js — Testes Unitários do Conteúdo do Card de Conquista
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkoutCardContent } from './workoutResultCard.js';

describe('Card de Conquista — Derivação de Conteúdo (buildWorkoutCardContent)', () => {
  it('sem PRs: usa o cabeçalho genérico de treino concluído', () => {
    const content = buildWorkoutCardContent({
      workoutName: 'Peito & Tríceps',
      durationMinutes: 42,
      totalSetsCompleted: 18,
      totalVolumeKg: 3200,
      newPRs: []
    });

    assert.equal(content.hasPRs, false);
    assert.equal(content.headline, 'Treino Concluído');
    assert.equal(content.eyebrow, 'AB FITNESS · TREINO CONCLUÍDO');
    assert.equal(content.title, 'Peito & Tríceps');
    assert.deepEqual(content.prLines, []);
  });

  it('1 PR: usa o singular "Novo Recorde Pessoal"', () => {
    const content = buildWorkoutCardContent({
      workoutName: 'Pernas',
      newPRs: [{ exerciseName: 'Agachamento Livre', e1RM: 120 }]
    });

    assert.equal(content.hasPRs, true);
    assert.equal(content.headline, 'Novo Recorde Pessoal');
    assert.equal(content.eyebrow, 'AB FITNESS · NOVO RECORDE');
    assert.equal(content.prLines.length, 1);
    assert.equal(content.prLines[0].name, 'Agachamento Livre');
    assert.equal(content.prLines[0].value, '120 kg');
    assert.equal(content.prLines[0].sub, '1RM estimado');
  });

  it('vários PRs: usa o plural com a contagem exata', () => {
    const content = buildWorkoutCardContent({
      newPRs: [
        { exerciseName: 'Supino Reto', e1RM: 90 },
        { exerciseName: 'Remada Curvada', e1RM: 80 }
      ]
    });

    assert.equal(content.headline, '2 Novos Recordes Pessoais');
    assert.equal(content.prLines.length, 2);
  });

  it('PR de exercício isométrico/temporizado: mostra segundos em vez de kg', () => {
    const content = buildWorkoutCardContent({
      newPRs: [{ exerciseName: 'Prancha Abdominal', isTimed: true, duration: 95 }]
    });

    assert.equal(content.prLines[0].value, '95s');
    assert.equal(content.prLines[0].sub, 'Melhor tempo');
  });

  it('limita a 3 PRs no card mesmo que existam mais', () => {
    const content = buildWorkoutCardContent({
      newPRs: [
        { exerciseName: 'A', e1RM: 1 },
        { exerciseName: 'B', e1RM: 2 },
        { exerciseName: 'C', e1RM: 3 },
        { exerciseName: 'D', e1RM: 4 }
      ]
    });

    assert.equal(content.prLines.length, 3);
    assert.equal(content.headline, '4 Novos Recordes Pessoais');
  });

  it('trunca nomes de exercício longos para não quebrar o layout do card', () => {
    const content = buildWorkoutCardContent({
      newPRs: [{ exerciseName: 'Elevação Lateral Unilateral com Halteres no Banco Inclinado', e1RM: 10 }]
    });

    assert.ok(content.prLines[0].name.length <= 28);
    assert.ok(content.prLines[0].name.endsWith('…'));
  });

  it('usa o título de resguardo quando o nome do treino está vazio', () => {
    const content = buildWorkoutCardContent({ workoutName: '   ' });
    assert.equal(content.title, 'Sessão de Treino');
  });

  it('expõe sempre as 3 estatísticas na ordem Tempo, Séries, Volume', () => {
    const content = buildWorkoutCardContent({
      durationMinutes: 50,
      totalSetsCompleted: 20,
      totalVolumeKg: 4500
    });

    assert.deepEqual(
      content.stats.map((s) => s.label),
      ['TEMPO', 'SÉRIES', 'VOLUME']
    );
    assert.equal(content.stats[0].value, '50');
    assert.equal(content.stats[0].unit, 'min');
    assert.equal(content.stats[2].value, '4500');
    assert.equal(content.stats[2].unit, 'kg');
  });
});
