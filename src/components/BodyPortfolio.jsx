import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scale, Camera, Plus, Trash2, Share2, Lock, ChevronDown, Loader2, ImageOff, MoveHorizontal } from 'lucide-react';
import {
  BODY_METRICS,
  PHOTO_POSES,
  getBodyEntries,
  saveBodyEntry,
  deleteBodyEntry,
  getMetricSeries,
  addProgressPhoto,
  getProgressPhotos,
  deleteProgressPhoto,
  getTopLifts,
  formatDatePt,
  todayISO
} from '../utils/bodyPortfolio';
import { buildMilestoneCard, shareMilestoneCard } from '../utils/milestoneCard';
import { getWorkoutHistory } from '../utils/storage';
import { findExerciseIn100 } from '../data/exercises100';
import { triggerHaptic } from '../utils/audio';

const card = 'p-5 rounded-xl bg-surface border border-white/10 shadow-xs space-y-4 transition-colors';
const eyebrow = 'flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider';
const chip = (active) =>
  `px-3 min-h-[40px] rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer select-none ${
    active
      ? 'bg-accent/70 text-white border-accent-hover'
      : 'bg-surface text-zinc-300 border-white/[0.08]'
  }`;
const inputCls =
  'w-full h-11 rounded-lg px-3 text-base tabular-nums bg-surface border border-white/[0.08] text-zinc-50 focus:border-accent focus:ring-1 focus:ring-accent outline-none';

const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
const fmt = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-PT');

function exerciseName(id) {
  const found = findExerciseIn100(id);
  if (found?.nome || found?.name) return found.nome || found.name;
  return String(id).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------ Gráfico ------------------------------ */
function MetricChart({ series, unit }) {
  if (series.length < 2) {
    return (
      <div className="h-36 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 text-center px-6">
        {series.length === 0 ? 'Ainda sem registos desta medida.' : 'Registe mais uma medição para ver a linha de evolução.'}
      </div>
    );
  }

  const W = 320;
  const H = 140;
  const pad = { l: 8, r: 8, t: 16, b: 22 };
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i) => pad.l + (i / (series.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const area = `${line} L${x(series.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  const last = series[series.length - 1];

  return (
    <figure className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Evolução de ${series[0].value} para ${last.value} ${unit}`}>
        <defs>
          <linearGradient id="bodyArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} className="stroke-zinc-800" strokeWidth="1" />
        <path d={area} fill="url(#bodyArea)" />
        <path d={line} fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {series.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r={i === series.length - 1 ? 4.5 : 3} className="fill-surface" stroke="#ffffff" strokeWidth="2" />
        ))}
        <text x={pad.l} y={H - 6} className="fill-zinc-400 text-[11px]">{formatDatePt(series[0].date)}</text>
        <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-zinc-400 text-[11px]">{formatDatePt(last.date)}</text>
      </svg>
      <figcaption className="flex justify-between text-[11px] text-zinc-400 tabular-nums">
        <span>Mín. {fmt(min)} {unit}</span>
        <span>Máx. {fmt(max)} {unit}</span>
      </figcaption>
    </figure>
  );
}

/* ------------------------------ Comparação antes/depois ------------------------------ */
function CompareSlider({ beforeUrl, afterUrl, beforeDate, afterDate }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface select-none">
      <img src={afterUrl} alt={`Depois, ${formatDatePt(afterDate)}`} className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <img
        src={beforeUrl}
        alt={`Antes, ${formatDatePt(beforeDate)}`}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable="false"
      />
      <div className="absolute inset-y-0 w-0.5 bg-accent pointer-events-none" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-lg">
          <MoveHorizontal className="w-4 h-4" strokeWidth={2.25} />
        </span>
      </div>
      <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] font-bold tabular-nums">Antes · {formatDatePt(beforeDate)}</span>
      <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-primary text-app text-[11px] font-bold tabular-nums">Depois · {formatDatePt(afterDate)}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Deslize para comparar antes e depois"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize touch-pan-y"
      />
    </div>
  );
}

/* ------------------------------ Vista principal ------------------------------ */
export default function BodyPortfolio() {
  const [entries, setEntries] = useState(() => getBodyEntries());
  const [photos, setPhotos] = useState([]);
  const [photosLoaded, setPhotosLoaded] = useState(false);
  const [formOpen, setFormOpen] = useState(() => getBodyEntries().length === 0);
  const [form, setForm] = useState({ date: todayISO() });
  const [metric, setMetric] = useState('weight');
  const [pose, setPose] = useState('front');
  const [beforeId, setBeforeId] = useState(null);
  const [afterId, setAfterId] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    let alive = true;
    getProgressPhotos().then((list) => {
      if (!alive) return;
      setPhotos(list);
      setPhotosLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // URLs temporárias para os Blobs das fotos
  const urls = useMemo(() => Object.fromEntries(photos.map((p) => [p.id, URL.createObjectURL(p.blob)])), [photos]);
  useEffect(() => () => Object.values(urls).forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const metricDef = BODY_METRICS.find((m) => m.id === metric);
  const series = useMemo(() => getMetricSeries(entries, metric), [entries, metric]);
  const weightSeries = useMemo(() => getMetricSeries(entries, 'weight'), [entries]);
  const latest = entries[entries.length - 1];

  const posePhotos = photos.filter((p) => p.pose === pose);
  const before = posePhotos.find((p) => p.id === beforeId) || posePhotos[0];
  const after = posePhotos.find((p) => p.id === afterId) || posePhotos[posePhotos.length - 1];
  const canCompare = before && after && before.id !== after.id;

  const deltas = useMemo(
    () =>
      ['weight', 'waist', 'bodyFat', 'arm', 'chest']
        .map((id) => {
          const s = getMetricSeries(entries, id);
          const def = BODY_METRICS.find((m) => m.id === id);
          return s.length >= 2 ? { label: def.label, unit: def.unit, first: s[0].value, last: s[s.length - 1].value } : null;
        })
        .filter(Boolean),
    [entries]
  );

  const handleSaveEntry = (e) => {
    e.preventDefault();
    const hasValue = BODY_METRICS.some((m) => Number(String(form[m.id] ?? '').replace(',', '.')) > 0);
    if (!hasValue) {
      setError('Preencha pelo menos uma medida.');
      triggerHaptic([30, 60, 30]);
      return;
    }
    setError('');
    setEntries(saveBodyEntry(form));
    setForm({ date: todayISO() });
    setFormOpen(false);
    triggerHaptic(25);
  };

  const handleDeleteEntry = (entry) => {
    if (!window.confirm(`Apagar o registo de ${formatDatePt(entry.date)}?`)) return;
    setEntries(deleteBodyEntry(entry.id));
  };

  const handlePhotoPicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('photo');
    setError('');
    try {
      const photo = await addProgressPhoto(file, { date: todayISO(), pose });
      setPhotos((prev) => [...prev, photo]);
      setAfterId(null);
      triggerHaptic(25);
    } catch (err) {
      setError(err.message || 'Não foi possível guardar a foto.');
    } finally {
      setBusy('');
    }
  };

  const handleDeletePhoto = async (photo) => {
    if (!window.confirm(`Apagar esta foto (${formatDatePt(photo.date)})? Não é possível recuperá-la.`)) return;
    await deleteProgressPhoto(photo.id);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    if (beforeId === photo.id) setBeforeId(null);
    if (afterId === photo.id) setAfterId(null);
  };

  const handleShare = async () => {
    setBusy('card');
    setError('');
    try {
      const dates = [...entries.map((e) => e.date), ...photos.map((p) => p.date)].sort();
      const lifts = getTopLifts(getWorkoutHistory(), 3).map((l) => ({ ...l, name: exerciseName(l.exerciseId) }));
      const blob = await buildMilestoneCard({
        before: canCompare ? before : null,
        after: canCompare ? after : null,
        deltas,
        lifts,
        days: dates.length ? daysBetween(dates[0], dates[dates.length - 1]) : 0
      });
      await shareMilestoneCard(blob);
      triggerHaptic(25);
    } catch (err) {
      setError(err.message || 'Não foi possível gerar o card.');
    } finally {
      setBusy('');
    }
  };

  const weightDelta = weightSeries.length >= 2 ? weightSeries[weightSeries.length - 1].value - weightSeries[0].value : null;
  const canShare = canCompare || deltas.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumo */}
      <div className={card}>
        <div className={eyebrow}>
          <Scale className="w-4 h-4 stroke-[1.8]" />
          <span>Portfólio Corporal</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-surface-2/80 border border-white/10">
            <span className="text-[11px] font-medium text-zinc-400 block">Peso atual</span>
            <span className="font-display text-lg font-semibold text-zinc-50 tabular-nums tracking-[-0.02em] whitespace-nowrap mt-0.5 block">
              {weightSeries.length ? (
                <>
                  {fmt(weightSeries[weightSeries.length - 1].value)}
                  <span className="text-xs font-medium text-zinc-400 ml-1">kg</span>
                </>
              ) : '—'}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-2/80 border border-white/10">
            <span className="text-[11px] font-medium text-zinc-400 block">Variação</span>
            <span className="font-display text-lg font-semibold text-zinc-50 tabular-nums tracking-[-0.02em] whitespace-nowrap mt-0.5 block">
              {weightDelta === null ? '—' : (
                <>
                  {weightDelta > 0 ? '+' : ''}{fmt(weightDelta)}
                  <span className="text-xs font-medium text-zinc-400 ml-1">kg</span>
                </>
              )}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-2/80 border border-white/10">
            <span className="text-[11px] font-medium text-zinc-400 block">Fotos</span>
            <span className="font-display text-lg font-semibold text-zinc-50 tabular-nums tracking-[-0.02em] whitespace-nowrap mt-0.5 block">{photos.length}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          disabled={!canShare || busy === 'card'}
          className="w-full min-h-[48px] rounded-xl bg-primary hover:bg-primary-hover text-app font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy === 'card' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4 stroke-[2.2]" />}
          <span>Partilhar card de evolução</span>
        </button>
        {!canShare && (
          <p className="text-[11px] text-zinc-400 text-center">
            Disponível com duas medições ou duas fotos da mesma pose.
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Medidas */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <div className={eyebrow}>
            <Scale className="w-4 h-4 stroke-[1.8]" />
            <span>Medidas</span>
          </div>
          <button
            type="button"
            onClick={() => setFormOpen((v) => !v)}
            aria-expanded={formOpen}
            className="flex items-center gap-1.5 px-3 min-h-[40px] rounded-lg bg-white/[0.04] text-zinc-100 text-xs font-semibold active:scale-95 cursor-pointer"
          >
            {formOpen ? <ChevronDown className="w-4 h-4 rotate-180" /> : <Plus className="w-4 h-4" />}
            <span>{formOpen ? 'Fechar' : 'Registar'}</span>
          </button>
        </div>

        {formOpen && (
          <form onSubmit={handleSaveEntry} className="space-y-3 pt-1">
            <label className="block space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Data</span>
              <input
                type="date"
                value={form.date}
                max={todayISO()}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value || todayISO() }))}
                className={inputCls}
              />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BODY_METRICS.map((m) => (
                <label key={m.id} className="block space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {m.label} ({m.unit})
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={form[m.id] ?? ''}
                    placeholder={latest?.[m.id] ? String(latest[m.id]) : '—'}
                    onChange={(e) => setForm((f) => ({ ...f, [m.id]: e.target.value }))}
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-zinc-400">
              Meça de manhã, em jejum, sempre nas mesmas condições. Um registo por dia: guardar outra vez substitui o desse dia.
            </p>
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-zinc-100 text-zinc-950 font-bold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              Guardar medidas
            </button>
          </form>
        )}

        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="Medida no gráfico">
          {BODY_METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={metric === m.id}
              onClick={() => setMetric(m.id)}
              className={`${chip(metric === m.id)} shrink-0`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <MetricChart series={series} unit={metricDef.unit} />

        {entries.length > 0 && (
          <ul className="divide-y divide-white/10 border-t border-white/10">
            {[...entries].reverse().slice(0, 8).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-2.5 gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-zinc-100 tabular-nums">{formatDatePt(entry.date)}</span>
                  <p className="text-xs text-zinc-400 truncate tabular-nums">
                    {BODY_METRICS.filter((m) => entry[m.id]).map((m) => `${m.short} ${fmt(entry[m.id])}${m.unit === '%' ? '%' : ''}`).join(' · ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEntry(entry)}
                  aria-label={`Apagar registo de ${formatDatePt(entry.date)}`}
                  className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fotos de progresso */}
      <div className={card}>
        <div className="flex items-center justify-between gap-2">
          <div className={eyebrow}>
            <Camera className="w-4 h-4 stroke-[1.8]" />
            <span>Fotos de progresso</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Lock className="w-3 h-3" />
            Só neste aparelho
          </span>
        </div>

        <div className="flex gap-2" role="tablist" aria-label="Pose">
          {PHOTO_POSES.map((p) => {
            const count = photos.filter((ph) => ph.pose === p.id).length;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={pose === p.id}
                onClick={() => {
                  setPose(p.id);
                  setBeforeId(null);
                  setAfterId(null);
                }}
                className={`${chip(pose === p.id)} flex-1`}
              >
                {p.label}{count ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy === 'photo'}
          className="w-full flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg bg-zinc-100 text-zinc-950 text-sm font-bold active:scale-[0.98] cursor-pointer disabled:opacity-50"
        >
          {busy === 'photo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          <span>Adicionar foto de {PHOTO_POSES.find((p) => p.id === pose).label.toLowerCase()}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoPicked} className="hidden" />

        {photosLoaded && photos.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center px-6">
            <ImageOff className="w-6 h-6 text-zinc-400" />
            <p className="text-xs text-zinc-400">
              Tire uma foto de frente, lado e costas, com a mesma luz e distância. Repita a cada 2–4 semanas.
            </p>
          </div>
        )}

        {photos.length > 0 && (
          <>
            {canCompare ? (
              <div className="space-y-3">
                <CompareSlider beforeUrl={urls[before.id]} afterUrl={urls[after.id]} beforeDate={before.date} afterDate={after.date} />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Antes', before, setBeforeId],
                    ['Depois', after, setAfterId]
                  ].map(([lbl, current, setter]) => (
                    <label key={lbl} className="block space-y-1">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{lbl}</span>
                      <select value={current.id} onChange={(e) => setter(e.target.value)} className={inputCls}>
                        {posePhotos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {formatDatePt(p.date)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">
                Adicione mais uma foto de {PHOTO_POSES.find((p) => p.id === pose).label.toLowerCase()} para comparar antes e depois.
              </p>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[...posePhotos].reverse().map((p) => (
                <div key={p.id} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-surface group">
                  <img src={urls[p.id]} alt={`${PHOTO_POSES.find((x) => x.id === p.pose)?.label}, ${formatDatePt(p.date)}`} className="w-full h-full object-cover" loading="lazy" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[11px] font-semibold tabular-nums">
                    {formatDatePt(p.date)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p)}
                    aria-label={`Apagar foto de ${formatDatePt(p.date)}`}
                    className="tap-44 absolute top-1 right-1 w-8 h-8 rounded-md bg-black/60 text-white flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
