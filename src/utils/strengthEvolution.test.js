import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeStrengthEvolution, formatGain, growthFill } from './strengthEvolution.js';
import { buildCardMetrics, normalizeMetricIds, readCardMetricIds, saveCardMetricIds, getCardTheme, CARD_THEMES, themeBackground } from './profileCard.js';
import { readFileSync } from 'node:fs';

const DAY = 86400000;
const NOW = Date.UTC(2026, 10, 27, 12);
const session = (daysAgo, data) => ({ timestamp: NOW - daysAgo * DAY, exercisesData: data });
const set = (weight, reps, extra = {}) => ({ weight, reps, done: true, type: 'N', ...extra });
const regions = { supino: [{ region: 'peito', weight: 1 }, { region: 'triceps', weight: 0.5 }], agachamento: [{ region: 'quadriceps', weight: 1 }] };
const regionsFor = (id) => regions[id] || [];

describe('Evolução de força do corpo', () => {
  it('sem duas sessões do mesmo exercício não há evolução', () => {
    const res = computeStrengthEvolution([session(10, { supino: [set(60, 8)] })], { regionsFor, now: NOW });
    assert.equal(res.ready, false);
  });

  it('calcula ganho por exercício, por músculo e total', () => {
    const history = [
      session(80, { supino: [set(60, 8)], agachamento: [set(80, 8)] }),
      session(5, { supino: [set(72, 8)], agachamento: [set(84, 8)] })
    ];
    const res = computeStrengthEvolution(history, { regionsFor, now: NOW });
    assert.equal(res.ready, true);
    assert.equal(res.exercisesCount, 2);
    assert.equal(res.regions.find((r) => r.id === 'peito').gainPct, 20);
    assert.equal(res.regions.find((r) => r.id === 'quadriceps').gainPct, 5);
    assert.equal(res.totalGainPct, 13); // média de 20% e 5% = 12,5%
    assert.equal(res.series[0].value, 100);
    assert.ok(res.series.at(-1).value > 110);
  });

  it('usa o melhor antes do período como base e ignora aquecimento e séries por concluir', () => {
    const history = [
      session(200, { supino: [set(70, 5)] }),
      session(20, { supino: [set(100, 5, { type: 'W' }), set(90, 5, { done: false }), set(77, 5)] })
    ];
    const res = computeStrengthEvolution(history, { regionsFor, now: NOW });
    assert.equal(res.totalGainPct, 10);
  });

  it('a linha nunca desce por causa de um dia fraco (usa o melhor acumulado)', () => {
    const history = [session(60, { supino: [set(60, 8)] }), session(40, { supino: [set(70, 8)] }), session(10, { supino: [set(50, 8)] })];
    const res = computeStrengthEvolution(history, { regionsFor, now: NOW });
    const values = res.series.map((p) => p.value);
    assert.deepEqual(values, [...values].sort((a, b) => a - b));
  });

  it('formata e colore o ganho', () => {
    assert.equal(formatGain(14.4), '+14%');
    assert.equal(formatGain(-3), '−3%');
    assert.equal(growthFill(null), 'var(--color-surface-3)');
    assert.ok(growthFill(30).includes('#ffffff 100%'));
  });
});

describe('Cartão de perfil personalizável', () => {
  it('normaliza a escolha para 3 métricas válidas e sem repetidos', () => {
    assert.deepEqual(normalizeMetricIds(['streak', 'streak', 'xpto']), ['streak', 'total_workouts', 'strength_gain']);
    assert.deepEqual(normalizeMetricIds(['run_km', 'top_lift', 'monthly_volume', 'streak']), ['run_km', 'top_lift', 'monthly_volume']);
  });

  it('guarda e lê a escolha', () => {
    const map = new Map();
    const storage = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
    saveCardMetricIds(['run_km', 'streak', 'top_lift'], storage);
    assert.deepEqual(readCardMetricIds(storage), ['run_km', 'streak', 'top_lift']);
  });

  it('formata os valores das métricas', () => {
    const metrics = buildCardMetrics(
      ['monthly_volume', 'strength_gain', 'top_lift'],
      { monthly_volume_kg: 12450 },
      { strengthGainPct: 14, topLift: { name: 'Supino', e1RM: 101.6 } }
    );
    assert.deepEqual(metrics.map((m) => `${m.value}${m.unit}`), ['12,5t', '+14%', '102kg']);
    assert.equal(metrics[2].label, 'Supino');
    assert.equal(buildCardMetrics(['strength_gain'], {}, {})[0].value, '–');
  });

  it('tema desconhecido cai no de omissão; temas antigos continuam a ser desenhados', () => {
    assert.equal(getCardTheme('xpto').id, 'midnight');
    assert.equal(getCardTheme('gold').id, 'gold');
  });

  it('todos os temas do seletor são aceites pela constraint da base de dados', () => {
    const sql = readFileSync(new URL('../../supabase/migrations/20261147_card_themes_expanded.sql', import.meta.url), 'utf8');
    for (const t of CARD_THEMES) assert.ok(sql.includes(`'${t.id}'`), `${t.id} em falta na constraint`);
    assert.equal(new Set(CARD_THEMES.map((t) => t.id)).size, CARD_THEMES.length);
  });

  it('a textura do tema entra por cima do gradiente', () => {
    const glow = CARD_THEMES.find((t) => t.pattern === 'glow');
    assert.ok(themeBackground(glow).startsWith('radial-gradient'));
    assert.ok(themeBackground(CARD_THEMES[0]).startsWith('linear-gradient'));
  });
});
