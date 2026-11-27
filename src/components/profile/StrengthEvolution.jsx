import React, { useMemo, useState } from 'react';
import { BODY } from '../recovery/bodyPaths';
import { REGION_BY_ID, regionsForExercise } from '../../data/muscleRegions';
import { getCatalogEntry } from '../../data/exerciseMedia';
import { computeStrengthEvolution, formatGain, growthFill } from '../../utils/strengthEvolution';
import { triggerHaptic } from '../../utils/audio';

const MIRROR = 'matrix(-1 0 0 1 120 0)';
const PERIODS = [
  { days: 90, label: '3 meses' },
  { days: 180, label: '6 meses' },
  { days: 365, label: '1 ano' }
];

const regionsFor = (exId) => regionsForExercise(getCatalogEntry(exId));

const fmtDay = (t) => new Date(t).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' }).replace('.', '');

/** Silhueta (frente ou costas) pintada pelo crescimento de cada músculo: marinho = pouco, branco = muito. */
function GrowthFigure({ view, gains }) {
  const { axis, half } = BODY[view];
  return (
    <svg viewBox="0 0 120 270" className="w-full h-auto" role="img" aria-label={view === 'front' ? 'Corpo de frente' : 'Corpo de costas'}>
      <g fill="var(--color-surface-3)" stroke="var(--color-app)" strokeWidth="0.8">
        {axis.map((p, i) => <path key={i} d={p.d} />)}
      </g>
      {half.map((p, i) => {
        const fill = p.region ? growthFill(gains[p.region]) : 'var(--color-surface-3)';
        return (
          <g key={i} fill={fill} stroke="var(--color-app)" strokeWidth="0.8">
            <path d={p.d} />
            <path d={p.d} transform={MIRROR} />
          </g>
        );
      })}
    </svg>
  );
}

/** Linha da força total (índice 100 = início do período). */
function StrengthLine({ series }) {
  if (!series || series.length < 2) return null;
  const W = 320;
  const H = 96;
  const values = series.map((p) => p.value);
  const min = Math.min(100, ...values);
  const max = Math.max(...values, min + 1);
  const x = (i) => (i / (series.length - 1)) * W;
  const y = (v) => 6 + (H - 12) * (1 - (v - min) / (max - min));
  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const last = series[series.length - 1];

  return (
    <div className="space-y-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-24" aria-hidden="true">
        <line x1="0" x2={W} y1={y(100)} y2={y(100)} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="rgba(255,255,255,0.06)" />
        <path d={line} fill="none" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <circle cx={x(series.length - 1)} cy={y(last.value)} r="3.5" fill="#ffffff" />
      </svg>
      <div className="flex justify-between text-[11px] text-zinc-500 tabular-nums">
        <span>{fmtDay(series[0].t)}</span>
        <span>Hoje</span>
      </div>
    </div>
  );
}

/**
 * Evolução do corpo inteiro: quanto ficaste mais forte, onde, e a linha da força total.
 * Usa o melhor 1RM estimado de cada exercício (ver utils/strengthEvolution.js).
 */
export default function StrengthEvolution({ history }) {
  const [days, setDays] = useState(90);
  const evolution = useMemo(
    () => computeStrengthEvolution(history, { regionsFor, windowDays: days }),
    [history, days]
  );
  const gains = useMemo(
    () => Object.fromEntries(evolution.regions.map((r) => [r.id, r.gainPct])),
    [evolution]
  );
  const top = evolution.regions.slice(0, 4);
  const maxGain = Math.max(1, ...top.map((r) => r.gainPct));

  return (
    <section aria-label="Evolução de força" className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-section font-semibold text-white">Evolução</h3>
        <div role="tablist" aria-label="Período" className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              role="tab"
              aria-selected={days === p.days}
              onClick={() => {
                triggerHaptic(8);
                setDays(p.days);
              }}
              className={`tap-44 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                days === p.days ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!evolution.ready ? (
        <p className="text-sm text-zinc-400 py-6 border-y border-white/[0.06]">
          Repete um exercício em semanas diferentes e a tua evolução aparece aqui.
        </p>
      ) : (
        <>
          <div>
            <p className="font-display font-bold text-[44px] leading-none tracking-[-0.03em] text-white tabular-nums">
              {formatGain(evolution.totalGainPct)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              mais forte · {evolution.exercisesCount} {evolution.exercisesCount === 1 ? 'exercício' : 'exercícios'} desde {fmtDay(evolution.startedAt)}
            </p>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[180px_180px_minmax(0,1fr)] gap-x-4 gap-y-5 items-center">
            <GrowthFigure view="front" gains={gains} />
            <GrowthFigure view="back" gains={gains} />
            <ul className="col-span-2 sm:col-span-1 space-y-3">
              {top.map((r) => (
                <li key={r.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-zinc-200">{REGION_BY_ID[r.id]?.label || r.id}</span>
                    <span className="font-display font-semibold text-white tabular-nums">{formatGain(r.gainPct)}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(2, (Math.max(0, r.gainPct) / maxGain) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Força total</p>
            <StrengthLine series={evolution.series} />
          </div>
        </>
      )}
    </section>
  );
}
