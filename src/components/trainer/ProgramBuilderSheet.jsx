import React, { useState } from 'react';
import { X, Search, Plus, Trash2, Copy } from 'lucide-react';
import { EXERCISES_100, MUSCLE_GROUPS } from '../../data/exercises100';
import { createAssignedProgram } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const createRowId = () => `pb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const PROGRESSION_STEPS = [0, 2.5, 5];

/** Folha de prescrição: título, picker do catálogo de exercícios e matriz série/rep/RPE/descanso/nota por exercício. */
export default function ProgramBuilderSheet({ trainerId, athleteId, lastProgram, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [rows, setRows] = useState([]);
  const [duplicated, setDuplicated] = useState(false);
  const [progression, setProgression] = useState(2.5);

  const duplicateLast = (pct) => {
    if (!lastProgram) return;
    triggerHaptic(10);
    setProgression(pct);
    const factor = 1 + pct / 100;
    setTitle(lastProgram.title);
    setRows((lastProgram.structure_json || []).map((ex) => ({
      rowId: createRowId(),
      exerciseCode: ex.exerciseCode,
      name: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: ex.sets || 3,
      repsRange: ex.repsRange || '10-12',
      restSeconds: ex.restSeconds || 60,
      coachNote: ex.coachNote || '',
      targetWeight: ex.targetWeight ? Math.round(ex.targetWeight * factor * 2) / 2 : undefined
    })));
    setDuplicated(true);
  };
  const [targetRpe, setTargetRpe] = useState('');
  const [restSeconds, setRestSeconds] = useState('90');
  const [coachNotes, setCoachNotes] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(null);
  const [saving, setSaving] = useState(false);

  const filteredLibrary = EXERCISES_100.filter((ex) => {
    const matchesSearch = !search || ex.nome.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !muscleFilter || ex.grupo === muscleFilter;
    return matchesSearch && matchesMuscle;
  }).slice(0, 40);

  const addExercise = (ex) => {
    triggerHaptic(10);
    setRows((prev) => [...prev, {
      rowId: createRowId(),
      exerciseCode: ex.slug || `slug_${ex.id}`,
      name: ex.nome,
      targetMuscle: ex.grupo,
      sets: ex.series || 3,
      repsRange: ex.reps || '10-12',
      restSeconds: ex.descanso_seg || 60,
      coachNote: ''
    }]);
    setPickerOpen(false);
    setSearch('');
  };

  const updateRow = (rowId, patch) => setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  const removeRow = (rowId) => setRows((prev) => prev.filter((r) => r.rowId !== rowId));

  const canSave = title.trim().length > 0 && rows.length > 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    const structure = rows.map(({ rowId: _rowId, ...rest }) => rest);
    const { error } = await createAssignedProgram(trainerId, athleteId, {
      title: title.trim(),
      structure,
      targetRpe: targetRpe ? Number(targetRpe) : null,
      restTimerSeconds: restSeconds ? Number(restSeconds) : null,
      coachNotes: coachNotes.trim() || null
    });
    setSaving(false);
    if (!error) {
      triggerHaptic([12, 40, 12]);
      onSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-app flex flex-col" role="dialog" aria-modal="true" aria-label="Atribuir treino">
      <header className="shrink-0 border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="max-w-md mx-auto px-5 pt-2 pb-3 flex items-center justify-between">
          <h2 className="font-heading text-section font-semibold text-white">Atribuir treino</h2>
          <button onClick={onClose} aria-label="Fechar" className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-md mx-auto px-5 py-4 space-y-5">
          {lastProgram && !duplicated && (
            <div className="p-3.5 rounded-xl bg-surface-2 border border-accent-hover/50 space-y-2.5">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-white shrink-0" strokeWidth={1.75} />
                <p className="text-[13px] text-zinc-200 leading-snug">
                  Duplicar <strong className="text-white">"{lastProgram.title}"</strong> e progredir a carga
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {PROGRESSION_STEPS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => duplicateLast(pct)}
                    className={`flex-1 min-h-[36px] rounded-lg text-[13px] font-semibold cursor-pointer transition-colors ${progression === pct ? 'bg-primary text-app' : 'bg-surface-3 border border-white/[0.08] text-zinc-300'}`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-micro uppercase tracking-wider text-zinc-400 mb-1.5">Título do treino</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Push A — Semana 1"
              className="w-full px-4 min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-micro uppercase tracking-wider text-zinc-400">Exercícios ({rows.length})</span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="min-h-[36px] px-3 rounded-xl bg-surface-2 border border-white/[0.08] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Adicionar
              </button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row) => (
                <div key={row.rowId} className="p-3 rounded-xl bg-surface-2 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold text-white truncate">{row.name}</span>
                    <button onClick={() => removeRow(row.rowId)} className="w-7 h-7 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Séries</label>
                      <input type="number" min="1" value={row.sets} onChange={(e) => updateRow(row.rowId, { sets: Number(e.target.value) })} className="w-full px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.08] text-white text-[13px] tabular-nums focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Reps</label>
                      <input type="text" value={row.repsRange} onChange={(e) => updateRow(row.rowId, { repsRange: e.target.value })} className="w-full px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.08] text-white text-[13px] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Descanso (s)</label>
                      <input type="number" min="0" value={row.restSeconds} onChange={(e) => updateRow(row.rowId, { restSeconds: Number(e.target.value) })} className="w-full px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.08] text-white text-[13px] tabular-nums focus:outline-none" />
                    </div>
                  </div>
                  {row.targetWeight !== undefined && (
                    <div>
                      <label className="block text-[10px] text-zinc-500 uppercase mb-1">Carga alvo (kg)</label>
                      <input type="number" min="0" step="0.5" value={row.targetWeight} onChange={(e) => updateRow(row.rowId, { targetWeight: Number(e.target.value) })} className="w-full px-2 py-1.5 rounded-lg bg-surface-3 border border-white/[0.08] text-white text-[13px] tabular-nums focus:outline-none" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={row.coachNote}
                    onChange={(e) => updateRow(row.rowId, { coachNote: e.target.value })}
                    placeholder="Nota técnica para este exercício (opcional)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-surface-3 border border-white/[0.08] text-white text-[13px] placeholder:text-zinc-600 focus:outline-none"
                  />
                </div>
              ))}
              {rows.length === 0 && (
                <div className="p-6 rounded-xl border border-dashed border-white/[0.1] text-center text-[13px] text-zinc-400">
                  Nenhum exercício ainda. Toca em "Adicionar".
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-micro uppercase tracking-wider text-zinc-400 mb-1.5">RPE alvo</label>
              <input type="number" min="1" max="10" step="0.5" value={targetRpe} onChange={(e) => setTargetRpe(e.target.value)} placeholder="7-9" className="w-full px-4 min-h-[44px] rounded-xl bg-surface-2 border border-white/[0.08] text-white text-[14px] tabular-nums placeholder:text-zinc-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-micro uppercase tracking-wider text-zinc-400 mb-1.5">Descanso geral (s)</label>
              <input type="number" min="0" value={restSeconds} onChange={(e) => setRestSeconds(e.target.value)} className="w-full px-4 min-h-[44px] rounded-xl bg-surface-2 border border-white/[0.08] text-white text-[14px] tabular-nums focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-micro uppercase tracking-wider text-zinc-400 mb-1.5">Nota geral do treino</label>
            <textarea
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value.slice(0, 400))}
              rows={3}
              placeholder="Opcional"
              className="w-full px-4 py-3 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 max-w-md mx-auto w-full px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.06]">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="w-full min-h-[54px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'A atribuir...' : 'Atribuir ao atleta'}
        </button>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[95] bg-app flex flex-col">
          <header className="shrink-0 border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
            <div className="max-w-md mx-auto px-5 pt-2 pb-3 flex items-center justify-between">
              <h3 className="font-heading text-section font-semibold text-white">Escolher exercício</h3>
              <button onClick={() => setPickerOpen(false)} className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
          </header>
          <div className="max-w-md mx-auto w-full px-5 pt-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar exercício..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-white/[0.08] text-[14px] text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setMuscleFilter(null)} className={`shrink-0 min-h-[32px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer ${!muscleFilter ? 'bg-primary text-app' : 'bg-surface-2 border border-white/[0.08] text-zinc-300'}`}>Todos</button>
              {MUSCLE_GROUPS.map((g) => (
                <button key={g} onClick={() => setMuscleFilter(g)} className={`shrink-0 min-h-[32px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer ${muscleFilter === g ? 'bg-primary text-app' : 'bg-surface-2 border border-white/[0.08] text-zinc-300'}`}>{g}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3 max-w-md mx-auto w-full space-y-2">
            {filteredLibrary.map((ex) => (
              <button
                key={`${ex.id}-${ex.slug}`}
                type="button"
                onClick={() => addExercise(ex)}
                className="w-full p-3 rounded-xl bg-surface-2 border border-white/[0.08] text-left cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-[14px] font-semibold text-white">{ex.nome}</h4>
                  <p className="text-[12px] text-zinc-400">{ex.grupo} • {ex.series}x{ex.reps}</p>
                </div>
                <Plus className="w-4 h-4 text-zinc-400" strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
