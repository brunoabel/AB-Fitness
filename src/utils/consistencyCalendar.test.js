/**
 * consistencyCalendar.test.js — Testes Unitários do Calendário de Consistência
 * Executado nativamente com Node.js test runner (`node --test`)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMonthCalendarMatrix, buildMonthSummary, buildDayDetailLine } from './consistencyCalendar.js';

// Novembro de 2026 começa numa Domingo (dia 1); usamos um "hoje" fixo a meio do mês.
const TODAY = new Date(2026, 10, 12); // 12 de novembro de 2026 (quinta-feira)

const cellFor = (cells, day) => cells.find((c) => c && c.day === day);

describe('consistencyCalendar — buildMonthCalendarMatrix', () => {
  it('marca "trained_gym" num dia com registo em completedDays', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      completedDays: [{ dayId: 1, date: '2026-11-10' }],
      today: TODAY
    });
    assert.equal(cellFor(cells, 10).status, 'trained_gym');
  });

  it('marca "trained_run" num dia com corrida guardada', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      runsHistory: [{ date: '2026-11-09T18:30:00.000Z', distanceKm: 5 }],
      today: TODAY
    });
    assert.equal(cellFor(cells, 9).status, 'trained_run');
  });

  it('marca "trained_both" quando há musculação e corrida no mesmo dia', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      completedDays: [{ dayId: 1, date: '2026-11-08' }],
      runsHistory: [{ date: '2026-11-08T06:00:00.000Z', distanceKm: 8 }],
      today: TODAY
    });
    assert.equal(cellFor(cells, 8).status, 'trained_both');
  });

  it('marca "rest_planned" num dia de descanso agendado sem treino', () => {
    // 2026-11-08 é um domingo (getDay() === 0)
    const cells = buildMonthCalendarMatrix(2026, 10, {
      schedule: [{ dayId: 0, isRestDay: true }],
      today: TODAY
    });
    assert.equal(cellFor(cells, 8).status, 'rest_planned');
  });

  it('marca "missed" num dia passado de treino agendado sem registo', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      schedule: [{ dayId: 0, isRestDay: true }], // só domingo é descanso
      today: TODAY
    });
    // 2026-11-09 é segunda-feira (dia de treino no plano), sem registo
    assert.equal(cellFor(cells, 9).status, 'missed');
  });

  it('marca "today_pending" para hoje sem treino ainda, e "future" para dias seguintes', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, { today: TODAY });
    assert.equal(cellFor(cells, 12).status, 'today_pending');
    assert.equal(cellFor(cells, 13).status, 'future');
  });

  it('o dia de hoje com treino já feito conta como treinado, não "today_pending"', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      completedDays: [{ dayId: 4, date: '2026-11-12' }],
      today: TODAY
    });
    assert.equal(cellFor(cells, 12).status, 'trained_gym');
  });

  it('preenche células vazias à esquerda até ao dia da semana correto (Novembro 2026 começa a Domingo)', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, { today: TODAY });
    // Segunda-first: Domingo é o índice 6 da semana, logo há 6 células vazias antes do dia 1
    assert.equal(cells.slice(0, 6).every((c) => c === null), true);
    assert.equal(cells[6].day, 1);
  });
});

describe('consistencyCalendar — buildMonthSummary', () => {
  it('devolve mensagem neutra sem nenhum dia ativo', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, { today: TODAY });
    assert.equal(buildMonthSummary(cells), 'Ainda sem treinos registados neste mês.');
  });

  it('conta treinos e corridas separadamente em texto corrido', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      completedDays: [{ dayId: 1, date: '2026-11-02' }, { dayId: 3, date: '2026-11-04' }],
      runsHistory: [{ date: '2026-11-05T06:00:00.000Z', distanceKm: 5 }],
      today: TODAY
    });
    assert.equal(buildMonthSummary(cells), '3 dias ativos · 2 treinos · 1 corrida');
  });
});

describe('consistencyCalendar — buildDayDetailLine', () => {
  it('descreve um dia de descanso planeado', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      schedule: [{ dayId: 0, isRestDay: true }],
      today: TODAY
    });
    assert.equal(buildDayDetailLine(cellFor(cells, 8)), 'Dia 8 · Descanso planeado');
  });

  it('descreve um dia sem registo', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      schedule: [{ dayId: 0, isRestDay: true }],
      today: TODAY
    });
    assert.equal(buildDayDetailLine(cellFor(cells, 9)), 'Dia 9 · Sem registo de treino');
  });

  it('descreve um dia treinado com título, duração e volume', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      completedDays: [{ dayId: 1, date: '2026-11-10' }],
      workoutHistory: [{ completedAt: '2026-11-10T19:00:00.000Z', workoutTitle: 'Treino B', durationMinutes: 52, totalVolumeKg: 8420 }],
      today: TODAY
    });
    assert.equal(buildDayDetailLine(cellFor(cells, 10)), 'Dia 10 · Treino B · 52 min · 8420 kg');
  });

  it('descreve uma corrida com distância e ritmo', () => {
    const cells = buildMonthCalendarMatrix(2026, 10, {
      runsHistory: [{ date: '2026-11-09T18:30:00.000Z', distanceKm: 5.23, avgPace: "5'10\"/km" }],
      today: TODAY
    });
    assert.equal(buildDayDetailLine(cellFor(cells, 9)), 'Dia 9 · Corrida 5.2 km · 5\'10"/km');
  });
});
