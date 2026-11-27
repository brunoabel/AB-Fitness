import React, { useEffect, useState } from 'react';
import { RefreshCw, Play } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { triggerHaptic } from '../../utils/audio';

/**
 * Métricas do motor de treino (P2 de docs/TRAINING_SCIENCE_AUDIT.md) para afinar os parâmetros da secção 3.1:
 * agregados reais (admin_engine_metrics, migration 20261143) e uma verificação do validador em todos os perfis.
 */

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOALS = ['hypertrophy', 'strength', 'fat_loss', 'conditioning'];
const DAYS = [2, 3, 4, 5, 6];
const LOCATIONS = ['gym', 'home_gym', 'bodyweight'];
const MINUTES = [45, 60, 75];
const INJURIES = [[], ['knee'], ['shoulder'], ['lower_back'], ['hip']];
const BASE = { gender: 'male', age: 28, weightKg: 78, heightCm: 178, splitPreference: 'auto', hasSport: false, sports: [], sportDays: [], priorityMuscles: [] };

function* profiles() {
  for (const experienceLevel of LEVELS)
    for (const primaryGoal of GOALS)
      for (const daysPerWeek of DAYS)
        for (const trainingLocation of LOCATIONS)
          for (const sessionMinutes of MINUTES)
            for (const injuries of INJURIES) yield { ...BASE, experienceLevel, primaryGoal, daysPerWeek, trainingLocation, sessionMinutes, injuries };
}
const TOTAL = LEVELS.length * GOALS.length * DAYS.length * LOCATIONS.length * MINUTES.length * INJURIES.length;

const fmtPct = (v) => (v === null || v === undefined ? 'sem dados' : `${Number(v).toLocaleString('pt-PT')}%`);

async function fetchEngineMetrics() {
  if (!isSupabaseConfigured() || !supabase) return { metrics: null, error: 'Supabase não configurado.' };
  const { data, error } = await supabase.rpc('admin_engine_metrics');
  if (error) {
    return { metrics: null, error: /admin_engine_metrics/.test(error.message || '') ? 'Falta correr a migration 20261143_engine_p2_calibration_metrics.sql.' : error.message };
  }
  return { metrics: Array.isArray(data) ? data[0] : data, error: '' };
}

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-xl bg-surface border border-white/[0.08] p-3">
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="text-lg font-bold text-white tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-zinc-500 mt-0.5">{hint}</p>}
    </div>
  );
}

export default function EngineMetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [metricsError, setMetricsError] = useState('');
  const [sweep, setSweep] = useState(null);
  const [running, setRunning] = useState(false);

  const loadMetrics = () =>
    fetchEngineMetrics().then(({ metrics: m, error }) => {
      setMetricsError(error);
      if (m) setMetrics(m);
    });

  useEffect(() => {
    let alive = true;
    fetchEngineMetrics().then(({ metrics: m, error }) => {
      if (!alive) return;
      setMetricsError(error);
      if (m) setMetrics(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  const runSweep = async () => {
    triggerHaptic(10);
    setRunning(true);
    const { buildPlanFromProfile } = await import('../../data/planFromProfile');
    const codes = {};
    const examples = [];
    let failing = 0;
    let done = 0;
    for (const p of profiles()) {
      const issues = buildPlanFromProfile(p).validation || [];
      if (issues.some((i) => i.severity === 'error')) {
        failing += 1;
        if (examples.length < 8) examples.push(`${p.experienceLevel} ${p.primaryGoal} ${p.daysPerWeek}d ${p.trainingLocation} ${p.sessionMinutes}m [${p.injuries}]: ${issues.filter((i) => i.severity === 'error').map((i) => i.message).join(' | ')}`);
      }
      for (const i of issues) {
        const key = `${i.severity}:${i.code}`;
        codes[key] = (codes[key] || 0) + 1;
      }
      done += 1;
      // Cede o fio principal a cada 60 perfis para a página não congelar
      if (done % 60 === 0) {
        setSweep({ done, failing, codes: { ...codes }, examples: [...examples] });
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    setSweep({ done, failing, codes, examples });
    setRunning(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface-2 border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Motor de treino: dados reais</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Últimas 4 semanas. Serve para afinar volume, RIR e deload.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              loadMetrics();
            }}
            className="min-h-[40px] px-3 rounded-xl border border-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Atualizar
          </button>
        </div>
        {metricsError && <p className="text-xs text-zinc-400">{metricsError}</p>}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Metric label="Adesão ao plano" value={fmtPct(metrics.adherence_pct)} hint={`${metrics.profiles_28d} perfis com 4+ semanas`} />
            <Metric label="Séries com RIR registado" value={fmtPct(metrics.rir_logged_pct)} hint={`${metrics.working_sets_28d} séries de trabalho`} />
            <Metric label="Exercícios a progredir" value={fmtPct(metrics.progressing_pct)} hint={`${metrics.exercises_tracked} exercícios com 8 semanas de dados`} />
            <Metric label="Mesociclos ativos" value={metrics.mesocycles_active} />
            <Metric label="Mesociclos concluídos" value={metrics.mesocycles_completed} />
            <Metric
              label="Deloads reativos"
              value={metrics.mesocycles_completed ? fmtPct(Math.round((1000 * metrics.reactive_deloads) / metrics.mesocycles_completed) / 10) : 'sem dados'}
              hint={`${metrics.reactive_deloads} dos concluídos`}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-surface-2 border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">Validador em todos os perfis</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">{TOTAL} perfis: nível, objetivo, dias, local, duração e lesão.</p>
          </div>
          <button
            type="button"
            disabled={running}
            onClick={runSweep}
            className="min-h-[40px] px-4 rounded-xl bg-primary text-app text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {running ? 'A verificar' : 'Verificar'}
          </button>
        </div>
        {sweep && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-300 tabular-nums">
              {sweep.done} de {TOTAL} perfis · {sweep.failing} com erro
            </p>
            <ul className="space-y-1">
              {Object.entries(sweep.codes)
                .sort((a, b) => b[1] - a[1])
                .map(([key, n]) => {
                  const [severity, code] = key.split(':');
                  return (
                    <li key={key} className="flex items-center justify-between text-xs">
                      <span className={severity === 'error' ? 'text-white font-semibold' : 'text-zinc-400'}>
                        {code} · {severity === 'error' ? 'erro' : 'aviso'}
                      </span>
                      <span className="text-zinc-300 tabular-nums">{n}</span>
                    </li>
                  );
                })}
            </ul>
            {sweep.examples.length > 0 && (
              <div className="pt-2 space-y-1">
                {sweep.examples.map((e) => (
                  <p key={e} className="text-[11px] text-zinc-400 leading-relaxed">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
