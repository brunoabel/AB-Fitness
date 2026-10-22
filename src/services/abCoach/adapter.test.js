/**
 * adapter.test.js — Testes Unitários do AB Coach (Catálogo, Schema e Adapter)
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISE_CATALOG, findExerciseInCatalog, findNearestExercise, getBiomechanicalSubstitutes } from './catalog.js';
import { validateAndSanitizeCoachResponse } from './schema.js';
import { toAppWorkout } from './adapter.js';

describe('AB Coach — FASE 1: Catálogo e Contrato de Dados', () => {

  describe('1. Catálogo de Exercícios (catalog.js)', () => {
    it('deve conter todos os 320 exercícios oficiais', () => {
      assert.equal(EXERCISE_CATALOG.length, 320);
    });

    it('cada item do catálogo deve conter id, nome, grupo, porcao, equipamento e tipo', () => {
      for (const ex of EXERCISE_CATALOG) {
        assert.ok(ex.id, `Exercício sem id: ${JSON.stringify(ex)}`);
        assert.ok(ex.nome, `Exercício sem nome: ${ex.id}`);
        assert.ok(ex.grupo, `Exercício sem grupo: ${ex.id}`);
        assert.ok(ex.porcao, `Exercício sem porcao: ${ex.id}`);
        assert.ok(ex.equipamento, `Exercício sem equipamento: ${ex.id}`);
        assert.ok(ex.tipo === 'composto' || ex.tipo === 'isolador', `Tipo inválido (${ex.tipo}) no exercício: ${ex.id}`);
      }
    });

    it('deve localizar exercícios por slug, ID numérico e nome', () => {
      const bySlug = findExerciseInCatalog('supino-reto-barra');
      assert.ok(bySlug);
      assert.equal(bySlug.nome, 'Supino Reto com Barra');

      const byNum = findExerciseInCatalog(1);
      assert.ok(byNum);
      assert.equal(byNum.id, 'supino-reto-barra');

      const byNumStr = findExerciseInCatalog('1');
      assert.ok(byNumStr);
      assert.equal(byNumStr.id, 'supino-reto-barra');

      const byName = findExerciseInCatalog('Supino Inclinado com Halteres');
      assert.ok(byName);
      assert.equal(byName.id, 'supino-inclinado-halteres');
      assert.equal(byName.porcao, 'clavicular');
    });

    it('deve classificar corretamente a porção anatômica', () => {
      const inclinado = findExerciseInCatalog('supino-inclinado-halteres');
      assert.equal(inclinado.porcao, 'clavicular');

      const declinado = findExerciseInCatalog('supino-declinado-barra');
      assert.equal(declinado.porcao, 'costal');

      const agachamento = findExerciseInCatalog('agachamento-frontal');
      assert.equal(agachamento.porcao, 'quadríceps');
    });

    it('findNearestExercise deve retornar alternativa válida do grupo', () => {
      const nearest = findNearestExercise('Peito', 'costal');
      assert.ok(nearest);
      assert.equal(nearest.grupo, 'Peito');
    });

    it('getBiomechanicalSubstitutes deve retornar exercícios equivalentes da mesma porção/grupo', () => {
      const subs = getBiomechanicalSubstitutes('supino-reto-barra');
      assert.ok(Array.isArray(subs));
      assert.ok(subs.length > 0);
      assert.ok(subs.every((s) => s.id !== 'supino-reto-barra'));
      assert.ok(subs.every((s) => s.grupo === 'Peito'));
    });
  });

  describe('2. Validação e Schema (schema.js)', () => {
    it('deve aceitar resposta teórica sem treino (treino = null)', () => {
      const raw = {
        mensagem: 'O peitoral inferior é trabalhado com movimentos de adução em declínio.'
      };
      const res = validateAndSanitizeCoachResponse(raw);
      assert.equal(res.isValid, true);
      assert.equal(res.data.mensagem, raw.mensagem);
      assert.equal(res.data.treino, null);
    });

    it('deve sanitizar treino completo e fazer clamp de limites', () => {
      const raw = {
        mensagem: 'Aqui está seu treino focado em peitoral inferior.',
        treino: {
          nome: 'Foco Peitoral Inferior',
          foco: 'Porção Costal',
          duracao_min: 200, // deve ser clampado para max 120
          exercicios: [
            {
              id: 'supino-declinado-barra',
              nome: 'Nome Inventado Qualquer',
              series: 12, // deve ser clampado para 6
              reps: '8-10',
              descanso_seg: 500, // deve ser clampado para 240
              cadencia: '3s descida',
              dica: 'Aperte a porção inferior no topo'
            },
            {
              id: 'crossover-polia-alta',
              nome: 'Crossover Polia Alta',
              series: 4,
              reps: '12-15',
              descanso_seg: 10, // deve ser clampado para 20
              dica: 'Cruze as mãos na frente da cintura'
            }
          ]
        }
      };

      const res = validateAndSanitizeCoachResponse(raw);
      assert.equal(res.isValid, true);
      assert.ok(res.data.treino);
      assert.equal(res.data.treino.duracao_min, 120);

      const ex1 = res.data.treino.exercicios[0];
      assert.equal(ex1.id, 'supino-declinado-barra');
      assert.equal(ex1.nome, 'Supino Declinado com Barra'); // sobrescrito pelo nome oficial
      assert.equal(ex1.series, 6);
      assert.equal(ex1.descanso_seg, 240);

      const ex2 = res.data.treino.exercicios[1];
      assert.equal(ex2.descanso_seg, 20);
    });

    it('deve corrigir IDs inventados pela IA usando findNearestExercise', () => {
      const raw = {
        mensagem: 'Treino gerado com id alucinado.',
        treino: {
          nome: 'Treino Teste',
          foco: 'Peito',
          duracao_min: 45,
          exercicios: [
            {
              id: 'id-que-nao-existe-no-catalogo-12345',
              nome: 'Exercício Fantasma',
              series: 3,
              reps: '10',
              descanso_seg: 60
            },
            {
              id: 'supino-reto-barra',
              nome: 'Supino Reto',
              series: 4,
              reps: '8-12',
              descanso_seg: 90
            }
          ]
        }
      };

      const res = validateAndSanitizeCoachResponse(raw);
      assert.equal(res.isValid, true);
      assert.ok(res.data.treino);
      // O exercício inexistente foi substituído por um do mesmo grupo
      assert.ok(res.data.treino.exercicios.every((e) => findExerciseInCatalog(e.id) !== null));
    });
  });

  describe('3. Adapter para CustomWorkoutsHub (adapter.js)', () => {
    it('toAppWorkout(null) e toAppWorkout({}) devem retornar null', () => {
      assert.equal(toAppWorkout(null), null);
      assert.equal(toAppWorkout({}), null);
      assert.equal(toAppWorkout({ exercicios: [] }), null);
    });

    it('toAppWorkout deve converter para o formato nativo exato do app', () => {
      const treinoIA = {
        nome: 'Peitoral Inferior & Tríceps Hipertrofia',
        foco: 'Porção Costal e Tríceps',
        duracao_min: 45,
        observacoes: 'Mantenha cadência excêntrica de 3s e contração voluntária no ponto final.',
        exercicios: [
          {
            id: 'supino-declinado-barra',
            nome: 'Supino Declinado com Barra',
            series: 4,
            reps: '8-10',
            descanso_seg: 90,
            cadencia: '3s descida',
            dica: 'Desça na linha abaixo dos mamilos'
          },
          {
            id: 'crossover-polia-alta',
            nome: 'Crossover Polia Alta',
            series: 3,
            reps: '12-15',
            descanso_seg: 60,
            cadencia: '2s pico',
            dica: 'Convergência para baixo'
          }
        ]
      };

      const appWorkout = toAppWorkout(treinoIA);
      assert.ok(appWorkout);

      // Verificações essenciais de contrato
      assert.ok(appWorkout.id.startsWith('coach_'));
      assert.equal(appWorkout.id, appWorkout.dayId, 'dayId e id precisam ser idênticos para compatibilidade com a engine de treino');
      assert.equal(appWorkout.title, treinoIA.nome);
      assert.equal(appWorkout.duration, '45 min');
      assert.equal(appWorkout.badge, 'AB Coach IA');
      assert.equal(appWorkout.isRestDay, false);
      assert.equal(appWorkout.exercises.length, 2);

      // Exercício 1
      const ex1 = appWorkout.exercises[0];
      assert.equal(ex1.id, 'supino-declinado-barra');
      assert.equal(ex1.name, 'Supino Declinado com Barra');
      assert.equal(ex1.defaultSets, 4);
      assert.equal(ex1.suggestedReps, '8-10');
      assert.equal(ex1.restTime, 90);
      assert.equal(ex1.badge, 'Composto');
      assert.ok(ex1.equipment.includes('Declinado'));
      assert.ok(ex1.notes.includes('Cadência: 3s descida'));
      assert.ok(ex1.notes.includes('Dica: Desça na linha abaixo dos mamilos'));
      assert.ok(Array.isArray(ex1.steps) && ex1.steps.length > 0);

      // Exercício 2
      const ex2 = appWorkout.exercises[1];
      assert.equal(ex2.id, 'crossover-polia-alta');
      assert.equal(ex2.name, 'Crossover Polia Alta');
      assert.equal(ex2.badge, 'Isolado');
    });
  });

});
