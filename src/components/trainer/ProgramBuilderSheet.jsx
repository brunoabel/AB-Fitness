import React, { useEffect, useState } from 'react';
import { X, Search, Plus, Trash2, Copy, Layers, Check, BookmarkPlus, Link2, Activity } from 'lucide-react';
import { EXERCISES_100, MUSCLE_GROUPS } from '../../data/exercises100';
import {
  createAssignedProgram,
  listTemplates,
  createTemplate,
  deleteTemplate
} from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

const createRowId = () => `pb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const PROGRESSION_STEPS = [0, 2.5, 5];

const mapStructureToRows = (structure = [], factor = 1) =>
  structure.map((ex) => {
    const rawWeight = ex.targetWeight !== undefined && ex.targetWeight !== '' && ex.targetWeight !== null
      ? Number(ex.targetWeight)
      : '';
    const progressedWeight = rawWeight !== '' && Number.isFinite(rawWeight) && rawWeight > 0
      ? Math.round(rawWeight * factor * 2) / 2
      : '';
    return {
      rowId: createRowId(),
      exerciseCode: ex.exerciseCode || ex.slug || 'exercicio',
      name: ex.name,
      targetMuscle: ex.targetMuscle || '',
      sets: ex.sets || 3,
      repsRange: ex.repsRange || '10-12',
      restSeconds: ex.restSeconds || 60,
      targetWeight: progressedWeight,
      coachNote: ex.coachNote || '',
      supersetGroupId: ex.supersetGroupId || null
    };
  });

/** Grupos com um único membro deixam de ser Bi-Set. */
const pruneLoneSupersets = (list) => {
  const counts = list.reduce((acc, r) => {
    if (r.supersetGroupId) acc[r.supersetGroupId] = (acc[r.supersetGroupId] || 0) + 1;
    return acc;
  }, {});
  return list.map((r) => (r.supersetGroupId && counts[r.supersetGroupId] < 2 ? { ...r, supersetGroupId: null } : r));
};

/**
 * Consola de Prescrição e Biblioteca de Modelos (OLED sem blocos aninhados):
 * matriz em linha (Séries · Reps · Carga kg · Descanso s), progressão real sobre o último
 * treino e gestão completa de modelos reutilizáveis (trainer_templates).
 */
export default function ProgramBuilderSheet({
  trainerId,
  athleteId = null,
  athleteName = '',
  lastProgram = null,
  templateOnly = false,
  athleteRecovery = null,
  athleteInjuries = [],
  onClose,
  onSaved
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [rows, setRows] = useState([]);
  const [activeProgression, setActiveProgression] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(templateOnly);
  const [templates, setTemplates] = useState([]);
  const [confirmDeleteTplId, setConfirmDeleteTplId] = useState(null);
  const [targetRpe, setTargetRpe] = useState('');
  const [restSeconds, setRestSeconds] = useState('90');
  const [coachNotes, setCoachNotes] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [templateSavedFlash, setTemplateSavedFlash] = useState(false);

  const loadTrainerTemplates = async () => {
    const { data } = await listTemplates(trainerId);
    setTemplates(data || []);
  };

  useEffect(() => {
    loadTrainerTemplates();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (pickerOpen) setPickerOpen(false);
        else onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId, pickerOpen]);

  const applyLastProgram = (pct) => {
    if (!lastProgram) return;
    triggerHaptic(10);
    setActiveProgression(pct);
    setSelectedTemplateId(null);
    const factor = 1 + pct / 100;
    setTitle(lastProgram.title || '');
    setTargetRpe(lastProgram.target_rpe != null ? String(lastProgram.target_rpe) : '');
    setRestSeconds(lastProgram.rest_timer_seconds != null ? String(lastProgram.rest_timer_seconds) : '90');
    setCoachNotes(lastProgram.coach_notes || '');
    setRows(mapStructureToRows(lastProgram.structure_json || [], factor));
  };

  const applyTemplate = (tpl) => {
    triggerHaptic(10);
    setSelectedTemplateId(tpl.id);
    setActiveProgression(null);
    setTitle(tpl.title || '');
    if (tpl.category) setCategory(tpl.category);
    setRows(mapStructureToRows(tpl.structure_json || [], 1));
  };

  const handleDeleteTemplate = async (tplId) => {
    if (confirmDeleteTplId !== tplId) {
      triggerHaptic(8);
      setConfirmDeleteTplId(tplId);
      return;
    }
    triggerHaptic(10);
    await deleteTemplate(tplId);
    setConfirmDeleteTplId(null);
    if (selectedTemplateId === tplId) setSelectedTemplateId(null);
    loadTrainerTemplates();
  };

  const filteredLibrary = EXERCISES_100.filter((ex) => {
    const matchesSearch = !search || ex.nome.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !muscleFilter || ex.grupo === muscleFilter;
    return matchesSearch && matchesMuscle;
  }).slice(0, 40);

  const addExercise = (ex) => {
    triggerHaptic(10);
    setRows((prev) => [
      ...prev,
      {
        rowId: createRowId(),
        exerciseCode: ex.slug || `slug_${ex.id}`,
        name: ex.nome,
        targetMuscle: ex.grupo,
        sets: ex.series || 3,
        repsRange: ex.reps || '10-12',
        restSeconds: ex.descanso_seg || 60,
        targetWeight: '',
        coachNote: '',
        supersetGroupId: null
      }
    ]);
    setPickerOpen(false);
    setSearch('');
  };

  const updateRow = (rowId, patch) =>
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  const removeRow = (rowId) => setRows((prev) => pruneLoneSupersets(prev.filter((r) => r.rowId !== rowId)));

  const toggleSuperset = (idx) => {
    triggerHaptic(8);
    setRows((prev) => {
      const prevRow = prev[idx - 1];
      const row = prev[idx];
      if (!prevRow || !row) return prev;
      const linked = Boolean(row.supersetGroupId) && row.supersetGroupId === prevRow.supersetGroupId;
      if (linked) {
        // Desliga: as linhas seguintes do mesmo grupo passam a um grupo próprio
        const oldId = row.supersetGroupId;
        const splitId = `${oldId}_${idx}`;
        return pruneLoneSupersets(
          prev.map((r, i) => {
            if (i === idx) return { ...r, supersetGroupId: null };
            if (i > idx && r.supersetGroupId === oldId) return { ...r, supersetGroupId: splitId };
            return r;
          })
        );
      }
      let groupId = prevRow.supersetGroupId || `bi_${idx - 1}`;
      if (!prevRow.supersetGroupId && prev.some((r, i) => i !== idx - 1 && i !== idx && r.supersetGroupId === groupId)) {
        groupId = `${groupId}_${row.rowId.slice(-5)}`;
      }
      return pruneLoneSupersets(
        prev.map((r, i) => (i === idx - 1 || i === idx ? { ...r, supersetGroupId: groupId } : r))
      );
    });
  };

  const fatigueList = Array.isArray(athleteRecovery?.fatigue) ? athleteRecovery.fatigue : [];
  const overloadedMuscles = fatigueList.filter((m) => Number(m.fatigue) >= 70);
  const recoveryScore = athleteRecovery?.biometrics?.recovery_score;
  const lowRecovery = recoveryScore !== null && recoveryScore !== undefined && Number(recoveryScore) < 55;
  const injuryList = Array.isArray(athleteInjuries) ? athleteInjuries : [];
  const showClinicalBar = !templateOnly && (overloadedMuscles.length > 0 || lowRecovery || injuryList.length > 0);
  const hasWeights = rows.some((r) => r.targetWeight !== '' && Number(r.targetWeight) > 0);

  const applyDeload = () => {
    triggerHaptic([10, 30, 10]);
    setRows((prev) =>
      prev.map((r) => {
        const w = Number(r.targetWeight);
        return r.targetWeight !== '' && Number.isFinite(w) && w > 0 ? { ...r, targetWeight: Math.round(w * 0.9 * 2) / 2 } : r;
      })
    );
  };

  const canSave = title.trim().length > 0 && rows.length > 0 && !saving;

  const serializeStructure = () =>
    rows.map(({ rowId: _rowId, targetWeight, supersetGroupId, ...rest }) => ({
      ...rest,
      ...(supersetGroupId ? { supersetGroupId } : {}),
      sets: Math.max(1, Number(rest.sets) || 3),
      restSeconds: Math.max(0, Number(rest.restSeconds) || 60),
      ...(targetWeight !== '' && targetWeight !== null && targetWeight !== undefined && Number.isFinite(Number(targetWeight))
        ? { targetWeight: Number(targetWeight) }
        : {})
    }));

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError('');
    const structure = serializeStructure();

    if (templateOnly) {
      const { error } = await createTemplate(trainerId, {
        title: title.trim(),
        category: category.trim() || rows[0]?.targetMuscle || 'Geral',
        structure
      });
      setSaving(false);
      if (error) {
        setSaveError(error);
        return;
      }
      triggerHaptic([12, 40, 12]);
      setTitle('');
      setRows([]);
      setTemplateSavedFlash(true);
      setTimeout(() => setTemplateSavedFlash(false), 2000);
      loadTrainerTemplates();
      return;
    }

    let createdTemplateId = selectedTemplateId;
    if (saveAsTemplate) {
      const tplRes = await createTemplate(trainerId, {
        title: title.trim(),
        category: category.trim() || rows[0]?.targetMuscle || 'Geral',
        structure
      });
      if (tplRes.data?.id) createdTemplateId = tplRes.data.id;
    }

    const { error } = await createAssignedProgram(trainerId, athleteId, {
      templateId: createdTemplateId || null,
      title: title.trim(),
      structure,
      targetRpe: targetRpe ? Number(targetRpe) : null,
      restTimerSeconds: restSeconds ? Number(restSeconds) : null,
      coachNotes: coachNotes.trim() || null
    });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    triggerHaptic([12, 40, 12]);
    onSaved?.();
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-app flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={templateOnly ? 'Biblioteca de Modelos' : 'Prescrever treino'}
    >
      <header className="shrink-0 border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)] bg-surface/95 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-5 pt-2 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-section font-semibold text-white">
              {templateOnly ? 'Biblioteca de Modelos' : 'Prescrever treino'}
            </h2>
            {athleteName && !templateOnly && (
              <p className="text-[12px] text-zinc-400 mt-0.5">Para {athleteName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-5 py-5 space-y-6">
          {showClinicalBar && (
            <section
              aria-label="Alerta clínico do atleta"
              className="bg-surface-2 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-300">
                  <Activity className="w-3.5 h-3.5" strokeWidth={1.9} />
                  Copiloto biométrico
                </p>
                {overloadedMuscles.length > 0 && (
                  <p className="text-[12px] text-zinc-300">
                    Sobrecarga:{' '}
                    <span className="text-white font-semibold">
                      {overloadedMuscles.map((m) => `${m.muscle_id} ${Math.round(Number(m.fatigue))}%`).join(', ')}
                    </span>
                  </p>
                )}
                {lowRecovery && (
                  <p className="text-[12px] text-zinc-300 tabular-nums">
                    Recuperação do wearable: <span className="text-white font-semibold">{Math.round(Number(recoveryScore))}%</span>
                  </p>
                )}
                {injuryList.length > 0 && (
                  <p className="text-[12px] text-zinc-300">
                    Lesões: <span className="text-white font-semibold">{injuryList.join(', ')}</span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={applyDeload}
                disabled={!hasWeights}
                className="shrink-0 min-h-[36px] px-3 rounded-lg border border-white/[0.12] bg-white/[0.05] hover:bg-white/[0.1] text-white text-[12px] font-semibold tabular-nums cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Deload (-10% carga)
              </button>
            </section>
          )}

          {/* 1. Biblioteca de Modelos Guardados */}
          {(templates.length > 0 || templateOnly) && (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 tabular-nums">
                  <Layers className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Modelos guardados ({templates.length})
                </span>
                {templateSavedFlash && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-400">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Modelo guardado
                  </span>
                )}
              </div>

              {templates.length === 0 ? (
                <p className="py-3 border-y border-white/[0.06] text-[13px] text-zinc-500">
                  Ainda não tens modelos guardados. Cria um modelo abaixo para reutilizar em qualquer atleta com 1 toque.
                </p>
              ) : (
                <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
                  {templates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    const isConfirmingDelete = confirmDeleteTplId === tpl.id;
                    return (
                      <div key={tpl.id} className="py-2.5 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => applyTemplate(tpl)}
                          className="flex-1 min-w-0 text-left cursor-pointer group"
                        >
                          <p className={`text-[14px] font-semibold truncate ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                            {tpl.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 tabular-nums">
                            {(tpl.structure_json || []).length} exercícios
                            {tpl.category ? ` · ${tpl.category}` : ''}
                          </p>
                        </button>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => applyTemplate(tpl)}
                            className={`min-h-[34px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-primary text-app'
                                : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200'
                            }`}
                          >
                            {isSelected ? 'Carregado' : 'Usar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tpl.id)}
                            title="Eliminar modelo"
                            className={`min-h-[34px] px-2.5 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                              isConfirmingDelete
                                ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                                : 'text-zinc-500 hover:text-rose-400'
                            }`}
                          >
                            {isConfirmingDelete ? 'Confirmar' : <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* 2. Duplicar último programa com progressão persistente */}
          {!templateOnly && lastProgram && (
            <section className="py-3 border-y border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Copy className="w-4 h-4 text-zinc-300 shrink-0" strokeWidth={1.75} />
                  <p className="text-[13px] text-zinc-200 truncate">
                    Duplicar <strong className="text-white">"{lastProgram.title}"</strong> e progredir carga
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PROGRESSION_STEPS.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyLastProgram(pct)}
                    className={`min-h-[38px] rounded-xl text-[13px] font-semibold tabular-nums cursor-pointer transition-colors ${
                      activeProgression === pct
                        ? 'bg-primary text-app'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300'
                    }`}
                  >
                    {pct === 0 ? 'Manter (0%)' : `+${pct}%`}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* 3. Título e Categoria */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                {templateOnly ? 'Nome do modelo' : 'Título do treino'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Push A · Força e Hipertrofia"
                className="w-full px-3.5 min-h-[46px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
              />
            </div>
            {(templateOnly || saveAsTemplate) && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                  Categoria
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Upper/Lower"
                  className="w-full px-3.5 min-h-[46px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
                />
              </div>
            )}
          </div>

          {/* 4. Matriz Editorial de Exercícios (sem caixas aninhadas) */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 tabular-nums">
                Exercícios ({rows.length})
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="min-h-[38px] px-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} />
                Adicionar exercício
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="py-8 border-y border-white/[0.08] text-center space-y-2">
                <p className="text-[13px] text-zinc-400">
                  Nenhum exercício adicionado a esta prescrição.
                </p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="min-h-[40px] px-4 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Escolher do catálogo
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {rows.map((row, index) => {
                  const linkedToPrev = index > 0 && Boolean(row.supersetGroupId) && row.supersetGroupId === rows[index - 1].supersetGroupId;
                  return (
                  <div
                    key={row.rowId}
                    className={`py-3.5 space-y-2.5 ${row.supersetGroupId ? 'border-l-2 border-l-accent-hover pl-3' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2.5 min-w-0">
                        <span className="font-display text-[12px] font-bold text-zinc-500 tabular-nums shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-[15px] font-semibold text-white truncate">{row.name}</span>
                        {row.targetMuscle && (
                          <span className="text-[11px] text-zinc-500 shrink-0 hidden sm:inline">
                            {row.targetMuscle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleSuperset(index)}
                          aria-pressed={linkedToPrev}
                          aria-label={linkedToPrev ? `Desligar Bi-Set de ${row.name}` : `Ligar ${row.name} em Bi-Set ao exercício anterior`}
                          className={`min-h-[30px] px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                            linkedToPrev
                              ? 'bg-accent/70 text-white border-accent-hover'
                              : 'border-white/[0.1] text-zinc-400 hover:text-white'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" strokeWidth={2} />
                          Bi-Set
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeRow(row.rowId)}
                        aria-label={`Remover ${row.name}`}
                        className="tap-44 w-8 h-8 rounded-lg text-zinc-500 hover:text-rose-400 cursor-pointer flex items-center justify-center shrink-0"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                      </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 divide-x divide-white/[0.08] border-y border-white/[0.06]">
                      <label className="px-2 py-1.5 block">
                        <span className="block text-[10px] font-semibold text-zinc-500">Séries</span>
                        <input
                          type="number"
                          min="1"
                          value={row.sets}
                          onChange={(e) => updateRow(row.rowId, { sets: e.target.value })}
                          className="w-full mt-0.5 bg-transparent font-display font-bold text-white text-[14px] tabular-nums focus:outline-none"
                        />
                      </label>
                      <label className="px-2.5 py-1.5 block">
                        <span className="block text-[10px] font-semibold text-zinc-500">Reps</span>
                        <input
                          type="text"
                          value={row.repsRange}
                          onChange={(e) => updateRow(row.rowId, { repsRange: e.target.value })}
                          className="w-full mt-0.5 bg-transparent font-display font-bold text-white text-[14px] tabular-nums focus:outline-none"
                        />
                      </label>
                      <label className="px-2.5 py-1.5 block">
                        <span className="block text-[10px] font-semibold text-zinc-500">Carga (kg)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={row.targetWeight ?? ''}
                          placeholder="Livre"
                          onChange={(e) => updateRow(row.rowId, { targetWeight: e.target.value })}
                          className="w-full mt-0.5 bg-transparent font-display font-bold text-white text-[14px] tabular-nums placeholder:text-zinc-600 focus:outline-none"
                        />
                      </label>
                      <label className="px-2.5 py-1.5 block">
                        <span className="block text-[10px] font-semibold text-zinc-500">Descanso (s)</span>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={row.restSeconds}
                          onChange={(e) => updateRow(row.rowId, { restSeconds: e.target.value })}
                          className="w-full mt-0.5 bg-transparent font-display font-bold text-white text-[14px] tabular-nums focus:outline-none"
                        />
                      </label>
                    </div>

                    <input
                      type="text"
                      value={row.coachNote}
                      onChange={(e) => updateRow(row.rowId, { coachNote: e.target.value })}
                      placeholder="Nota técnica para este exercício (ex: pausa 1s no peito)"
                      className="w-full px-1 py-1 bg-transparent border-b border-white/[0.05] focus:border-accent-hover text-zinc-200 text-[13px] placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* 5. Parâmetros globais da prescrição (quando atribuído a um atleta) */}
          {!templateOnly && (
            <>
              <div className="grid grid-cols-2 divide-x divide-white/[0.08] border-y border-white/[0.08]">
                <label className="pr-4 py-2.5 block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                    RPE alvo (1-10)
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={targetRpe}
                    onChange={(e) => setTargetRpe(e.target.value)}
                    placeholder="7.5 - 8.5"
                    className="w-full mt-1 bg-transparent font-display font-bold text-white text-[16px] tabular-nums placeholder:text-zinc-600 focus:outline-none"
                  />
                </label>
                <label className="pl-4 py-2.5 block">
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Descanso geral (s)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={restSeconds}
                    onChange={(e) => setRestSeconds(e.target.value)}
                    className="w-full mt-1 bg-transparent font-display font-bold text-white text-[16px] tabular-nums focus:outline-none"
                  />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1.5">
                  Instruções gerais para o atleta
                </label>
                <textarea
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value.slice(0, 400))}
                  rows={2}
                  placeholder="Visível ao atleta antes e durante o treino (opcional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
                />
              </div>

              <button
                type="button"
                onClick={() => { triggerHaptic(8); setSaveAsTemplate((v) => !v); }}
                className="w-full py-2.5 flex items-center justify-between gap-3 text-left cursor-pointer border-t border-white/[0.06]"
              >
                <span className="inline-flex items-center gap-2 text-[13px] text-zinc-300">
                  <BookmarkPlus className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
                  Guardar também na biblioteca de modelos
                </span>
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    saveAsTemplate ? 'bg-primary border-primary text-app' : 'border-white/[0.2] bg-transparent'
                  }`}
                >
                  {saveAsTemplate && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
              </button>
            </>
          )}

          {saveError && (
            <p className="text-[13px] text-rose-400 font-medium">{saveError}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 max-w-2xl mx-auto w-full px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.08] bg-app">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="w-full min-h-[52px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
        >
          {saving
            ? 'A guardar...'
            : templateOnly
              ? 'Guardar novo modelo'
              : 'Atribuir treino ao atleta'}
        </button>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[95] bg-app flex flex-col">
          <header className="shrink-0 border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)] bg-surface/95 backdrop-blur-md">
            <div className="max-w-2xl mx-auto px-5 pt-2 pb-3 flex items-center justify-between">
              <h3 className="font-heading text-section font-semibold text-white">Escolher exercício</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="w-11 h-11 -mr-2 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>
          </header>
          <div className="max-w-2xl mx-auto w-full px-5 pt-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar exercício..."
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[14px] text-white placeholder-zinc-500 focus:outline-none focus:border-accent-hover"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setMuscleFilter(null)}
                className={`shrink-0 min-h-[34px] px-3 rounded-full text-[12px] font-semibold cursor-pointer ${
                  !muscleFilter ? 'bg-primary text-app' : 'bg-white/[0.04] text-zinc-300'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setMuscleFilter(g)}
                  className={`shrink-0 min-h-[34px] px-3 rounded-full text-[12px] font-semibold cursor-pointer ${
                    muscleFilter === g ? 'bg-primary text-app' : 'bg-white/[0.04] text-zinc-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-3 max-w-2xl mx-auto w-full divide-y divide-white/[0.06]">
            {filteredLibrary.map((ex) => (
              <button
                key={`${ex.id}-${ex.slug}`}
                type="button"
                onClick={() => addExercise(ex)}
                className="w-full py-3 text-left cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div>
                  <h4 className="text-[14px] font-semibold text-white">{ex.nome}</h4>
                  <p className="text-[12px] text-zinc-400 tabular-nums">
                    {ex.grupo} · {ex.series}×{ex.reps}
                  </p>
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
