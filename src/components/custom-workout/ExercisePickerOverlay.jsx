import React, { useMemo, useState } from 'react';
import { Dumbbell, Search, Sparkles, X } from 'lucide-react';
import { EXERCISES_100, MUSCLE_GROUPS } from '../../data/exercises100';
import { triggerHaptic } from '../../utils/audio';

import { displayLabel } from '../../utils/displayLabel.js';
/** Sub-modal para escolher exercícios da biblioteca oficial ou registar um exercício avulso. */
export default function ExercisePickerOverlay({ createTempId, onAddExercise, onClose }) {
  const [pickerTab, setPickerTab] = useState('library');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('Todos');

  const [customExName, setCustomExName] = useState('');
  const [customExGroup, setCustomExGroup] = useState('Peito');
  const [customExEquip, setCustomExEquip] = useState('Halteres / Máquina');
  const [customExSets, setCustomExSets] = useState(3);
  const [customExReps, setCustomExReps] = useState('10-12');
  const [customExWeight, setCustomExWeight] = useState(10);
  const [customExRest, setCustomExRest] = useState(60);

  const filteredLibraryExercises = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return EXERCISES_100.filter((ex) => {
      const matchesGroup = selectedMuscleFilter === 'Todos' || ex.grupo === selectedMuscleFilter;
      const matchesSearch = !query ||
        ex.nome.toLowerCase().includes(query) ||
        ex.grupo.toLowerCase().includes(query);
      return matchesGroup && matchesSearch;
    });
  }, [searchTerm, selectedMuscleFilter]);

  const handleSelectLibrary = (ex) => {
    triggerHaptic(15);
    onAddExercise({
      tempId: createTempId(),
      id: ex.slug || `slug_${ex.id}`,
      name: ex.nome,
      target: ex.grupo,
      secondary: ex.mecanica || '',
      equipment: ex.mecanica === 'Composto' ? 'Barra / Halteres livres' : 'Máquina / Polia',
      suggestedWeight: 10,
      suggestedReps: ex.reps || '10-12',
      defaultSets: ex.series || 3,
      restTime: ex.descanso_seg || 60,
      badge: ex.mecanica || 'Personal',
      notes: ''
    });
    setSearchTerm('');
    onClose();
  };

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!customExName.trim()) return;
    triggerHaptic(20);

    const slug = customExName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    onAddExercise({
      tempId: createTempId(),
      id: slug,
      name: customExName.trim(),
      target: customExGroup,
      secondary: '',
      equipment: customExEquip.trim() || 'Equipamento Personalizado',
      suggestedWeight: Number(customExWeight) || 0,
      suggestedReps: customExReps || '10-12',
      defaultSets: Number(customExSets) || 3,
      restTime: Number(customExRest) || 60,
      badge: 'Personalizado',
      notes: ''
    });
    setCustomExName('');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-60 bg-app flex flex-col animate-slideUp">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-white" />
          <h3 className="text-sm font-bold text-white">
            Adicionar Exercício ao Treino
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="tap-44 w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Fechar seleção"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Abas: Da Biblioteca vs Criar Novo */}
      <div className="flex border-b border-white/10 px-4 pt-2 shrink-0 gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setPickerTab('library');
            triggerHaptic(10);
          }}
          className={`min-h-[44px] pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
            pickerTab === 'library'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          Banco Oficial ({EXERCISES_100.length} Exercícios)
        </button>

        <button
          type="button"
          onClick={() => {
            setPickerTab('custom');
            triggerHaptic(10);
          }}
          className={`min-h-[44px] pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
            pickerTab === 'custom'
              ? 'border-accent text-white'
              : 'border-transparent text-zinc-500 hover:text-zinc-200'
          }`}
        >
          Exercício Personalizado (Avulso)
        </button>
      </div>

      {pickerTab === 'library' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/10 shrink-0 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar exercício por nome ou grupo..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-xs font-medium text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedMuscleFilter('Todos')}
                className={`min-h-[44px] text-[11px] font-bold px-3 py-1 rounded-lg shrink-0 cursor-pointer border ${
                  selectedMuscleFilter === 'Todos'
                    ? 'bg-accent/70 text-white border-white'
                    : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                }`}
              >
                Todos
              </button>
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(group)}
                  className={`min-h-[44px] text-[11px] font-bold px-3 py-1 rounded-lg shrink-0 cursor-pointer border ${
                    selectedMuscleFilter === group
                      ? 'bg-accent/70 text-white border-white'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                  }`}
                >
                  {displayLabel(group)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLibraryExercises.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                Nenhum exercício encontrado para "{searchTerm}".
              </div>
            ) : (
              filteredLibraryExercises.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => handleSelectLibrary(ex)}
                  className="w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-2 border border-white/10 transition-colors cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white transition-colors">
                      {ex.nome}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                      <span className="font-semibold text-zinc-300">{displayLabel(ex.grupo)}</span>
                      <span>·</span>
                      <span>{ex.mecanica}</span>
                      <span>·</span>
                      <span>{ex.series}x {ex.reps}</span>
                    </div>
                  </div>

                  <span className="min-h-[44px] inline-flex items-center px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-[11px] font-bold group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                    + Adicionar
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitCustom} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="p-3 rounded-xl bg-surface border border-white/10 text-zinc-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-white" />
            <span>Registe um exercício exclusivo prescrito pelo seu treinador.</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Nome do Exercício <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={customExName}
              onChange={(e) => setCustomExName(e.target.value)}
              placeholder="Ex: Supino Hammer com pega neutra"
              required
              className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Grupo Muscular
              </label>
              <select
                value={customExGroup}
                onChange={(e) => setCustomExGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400 cursor-pointer"
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>{displayLabel(g)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Equipamento
              </label>
              <input
                type="text"
                value={customExEquip}
                onChange={(e) => setCustomExEquip(e.target.value)}
                placeholder="Ex: Máquina / Polia"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-zinc-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Séries</label>
              <input
                type="number"
                value={customExSets}
                min={1}
                max={10}
                onChange={(e) => setCustomExSets(e.target.value)}
                className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-display tabular-nums font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Reps</label>
              <input
                type="text"
                value={customExReps}
                onChange={(e) => setCustomExReps(e.target.value)}
                placeholder="10-12"
                className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-display tabular-nums font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Carga (kg)</label>
              <input
                type="number"
                value={customExWeight}
                onChange={(e) => setCustomExWeight(e.target.value)}
                className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-display tabular-nums font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1">Descanso (s)</label>
              <input
                type="number"
                value={customExRest}
                step={15}
                onChange={(e) => setCustomExRest(e.target.value)}
                className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-display tabular-nums font-bold text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] py-3 rounded-xl bg-primary text-app font-bold text-xs shadow-md active:scale-95 transition-colors cursor-pointer"
            >
              Adicionar Exercício ao Treino
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
