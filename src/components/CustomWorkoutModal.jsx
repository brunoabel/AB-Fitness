import React, { useState } from 'react';
import { REST_OPTIONS } from './custom-workout/options';
import WorkoutDetailsForm from './custom-workout/WorkoutDetailsForm';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import { AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Search, 
  Check, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { EXERCISES_100, MUSCLE_GROUPS } from '../data/exercises100';
import { triggerHaptic, sound } from '../utils/audio';



const createTempExerciseId = () => `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function CustomWorkoutModal({ isOpen, workoutToEdit, onClose, onSave }) {
  // Informações gerais do treino
  const [title, setTitle] = useState(() => workoutToEdit?.title || '');
  const [level, setLevel] = useState(() => {
    if (workoutToEdit?.level === 'Intermediário') return 'Intermédio';
    return workoutToEdit?.level || 'Intermédio';
  });
  const [focus, setFocus] = useState(() => workoutToEdit?.focus || 'Peito & Tríceps');
  const [duration, setDuration] = useState(() => workoutToEdit?.duration || '45 min');
  const [description, setDescription] = useState(() => workoutToEdit?.description || '');
  const [trainerNotes, setTrainerNotes] = useState(() => workoutToEdit?.trainerNotes || '');

  // Lista de exercícios adicionados ao treino
  const [exercises, setExercises] = useState(() => {
    if (workoutToEdit?.exercises && workoutToEdit.exercises.length > 0) {
      return workoutToEdit.exercises.map((ex) => ({
        ...ex,
        tempId: ex.id || createTempExerciseId()
      }));
    }
    return [];
  });

  // Modal / Drawer de Seleção de Exercícios
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState('library'); // 'library' | 'custom'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('Todos');

  // Formulário para criação de exercício avulso
  const [customExName, setCustomExName] = useState('');
  const [customExGroup, setCustomExGroup] = useState('Peito');
  const [customExEquip, setCustomExEquip] = useState('Halteres / Máquina');
  const [customExSets, setCustomExSets] = useState(3);
  const [customExReps, setCustomExReps] = useState('10-12');
  const [customExWeight, setCustomExWeight] = useState(10);
  const [customExRest, setCustomExRest] = useState(60);

  // Erro de validação
  const [validationError, setValidationError] = useState('');

  // Adicionar exercício da Biblioteca de 100
  const handleAddFromLibrary = (ex) => {
    triggerHaptic(15);
    const newEx = {
      tempId: createTempExerciseId(),
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
    };
    setExercises((prev) => [...prev, newEx]);
    setIsPickerOpen(false);
    setSearchTerm('');
  };

  // Adicionar exercício totalmente customizado
  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    if (!customExName.trim()) return;
    triggerHaptic(20);

    const slug = customExName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newEx = {
      tempId: createTempExerciseId(),
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
    };

    setExercises((prev) => [...prev, newEx]);
    setCustomExName('');
    setIsPickerOpen(false);
  };

  // Reordenar exercício
  const handleMoveExercise = (index, direction) => {
    triggerHaptic(10);
    setExercises((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  // Remover exercício
  const handleRemoveExercise = (index) => {
    triggerHaptic(15);
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Atualizar campo de exercício na lista
  const handleUpdateExercise = (index, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Guardar Treino
  const handleSaveWorkout = () => {
    if (!title.trim()) {
      setValidationError('Por favor, indique o nome do treino (Ex: Treino A - Peito).');
      triggerHaptic([40, 40]);
      return;
    }

    if (exercises.length === 0) {
      setValidationError('Adicione pelo menos 1 exercício ao treino.');
      triggerHaptic([40, 40]);
      return;
    }

    setValidationError('');
    triggerHaptic([20, 60, 20]);
    if (sound && typeof sound.playExerciseComplete === 'function') {
      sound.playExerciseComplete();
    }

    const payload = {
      ...workoutToEdit,
      title: title.trim(),
      level,
      focus: focus.trim() || 'Treino Personalizado',
      duration,
      description: description.trim() || `Treino personalizado de nível ${level} com foco em ${focus}.`,
      trainerNotes: trainerNotes.trim(),
      exercises: exercises.map((ex) => ({
        id: ex.id || createTempExerciseId(),
        name: ex.name,
        target: ex.target,
        secondary: ex.secondary || '',
        equipment: ex.equipment || 'Equipamento',
        suggestedWeight: Number(ex.suggestedWeight) || 0,
        suggestedReps: ex.suggestedReps || '10-12',
        defaultSets: Number(ex.defaultSets) || 3,
        restTime: Number(ex.restTime) || 60,
        badge: ex.badge || 'Personal',
        notes: ex.notes || ''
      }))
    };

    onSave(payload);
  };

  // Filtragem na biblioteca
  const filteredLibraryExercises = EXERCISES_100.filter((ex) => {
    const matchesGroup = selectedMuscleFilter === 'Todos' || ex.grupo === selectedMuscleFilter;
    const matchesSearch = !searchTerm || 
      ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.grupo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });


  return (
    <AnimatePresence>
    {isOpen && (
    <ModalBackdrop key="modal" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <ModalPanel className="w-full max-w-xl bg-zinc-950 rounded-t-2xl sm:rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transition-colors">
        
        {/* Topo do Modal com Título e Fechar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4 text-zinc-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                {workoutToEdit ? 'Editar Treino Personalizado' : 'Criar Treino Personalizado'}
              </h2>
              <p className="text-[11px] text-zinc-400 font-normal">
                Monte a sua rotina ou adicione a prescrição do seu treinador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-zinc-800/80">
          
          {/* Mensagem de Erro de Validação */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <WorkoutDetailsForm {...{ description, duration, focus, level, setDescription, setDuration, setFocus, setLevel, setTitle, setTrainerNotes, title, trainerNotes }} />
          {/* 2. SEÇÃO: EXERCÍCIOS ADICIONADOS */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Exercícios ({exercises.length})</span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Configure séries, repetições, carga inicial e descanso
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(true);
                  triggerHaptic(15);
                }}
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-app hover:bg-primary-hover px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Lista dos Exercícios já adicionados */}
            {exercises.length === 0 ? (
              <div 
                onClick={() => {
                  setIsPickerOpen(true);
                  triggerHaptic(15);
                }}
                className="p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-white/[0.2] text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-white">
                  Nenhum exercício adicionado ainda
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Toque aqui para escolher da biblioteca oficial de exercícios ou prescrever um exercício personalizado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, index) => (
                  <div
                    key={ex.tempId || index}
                    className="p-3.5 rounded-xl bg-surface border border-white/10 space-y-3"
                  >
                    {/* Topo do Exercício com Nome e Ações de Ordenação */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white/[0.04] text-zinc-300 text-xs font-mono tabular-nums font-bold flex items-center justify-center border border-white/[0.08] shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {ex.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {ex.target} • {ex.equipment}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveExercise(index, -1)}
                          className="tap-44 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Mover para cima"
                          aria-label="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === exercises.length - 1}
                          onClick={() => handleMoveExercise(index, 1)}
                          className="tap-44 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] flex items-center justify-center disabled:opacity-30 cursor-pointer"
                          title="Mover para baixo"
                          aria-label="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="tap-44 w-8 h-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Controles de Séries, Reps, Carga e Descanso */}
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      {/* Séries */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Séries</span>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateExercise(index, 'defaultSets', Math.max(1, (ex.defaultSets || 3) - 1))}
                            className="tap-44 w-6 h-6 rounded-md bg-white/[0.04] text-xs font-bold text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 border border-white/[0.08]"
                          >
                            -
                          </button>
                          <span className="text-xs font-mono tabular-nums font-bold text-white w-4">
                            {ex.defaultSets || 3}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateExercise(index, 'defaultSets', Math.min(8, (ex.defaultSets || 3) + 1))}
                            className="tap-44 w-6 h-6 rounded-md bg-white/[0.04] text-xs font-bold text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 border border-white/[0.08]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Repetições */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Reps</span>
                        <input
                          type="text"
                          value={ex.suggestedReps || '10'}
                          onChange={(e) => handleUpdateExercise(index, 'suggestedReps', e.target.value)}
                          className="w-full text-center text-xs font-mono tabular-nums font-bold text-white bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* Carga Inicial */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Carga (kg)</span>
                        <input
                          type="number"
                          value={ex.suggestedWeight ?? 0}
                          onChange={(e) => handleUpdateExercise(index, 'suggestedWeight', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full text-center text-xs font-mono tabular-nums font-bold text-white bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* Descanso */}
                      <div className="p-2 rounded-xl bg-zinc-950 border border-white/10">
                        <span className="text-[11px] uppercase font-bold text-zinc-400 block mb-1">Descanso</span>
                        <select
                          value={ex.restTime || 60}
                          onChange={(e) => handleUpdateExercise(index, 'restTime', Number(e.target.value))}
                          className="w-full text-center text-xs font-mono tabular-nums font-bold text-white bg-transparent focus:outline-none cursor-pointer"
                        >
                          {REST_OPTIONS.map((sec) => (
                            <option key={sec} value={sec} className="bg-surface">
                              {sec}s
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dica / Observação individual opcional */}
                    <input
                      type="text"
                      value={ex.notes || ''}
                      onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                      placeholder="Indicação técnica (Ex: Drop-set na última série, pausa 2s)"
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-white/10 text-[11px] text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                    />
                  </div>
                ))}

                {/* Botão de Adicionar mais exercício */}
                <button
                  type="button"
                  onClick={() => {
                    setIsPickerOpen(true);
                    triggerHaptic(15);
                  }}
                  className="min-h-[44px] w-full py-2.5 rounded-xl border border-dashed border-white/[0.12] hover:border-white/[0.24] text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-zinc-300" />
                  <span>Adicionar Mais Exercícios</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo com Botão Guardar */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-surface flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 font-bold text-xs border border-white/[0.08] transition-colors cursor-pointer active:scale-95"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveWorkout}
            className="flex-2 min-h-[48px] py-3 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Guardar Treino</span>
          </button>
        </div>

        {/* SUB-MODAL: PICKER DE EXERCÍCIOS (BIBLIOTECA 100 OU PERSONALIZADO) */}
        {isPickerOpen && (
          <div className="absolute inset-0 z-60 bg-zinc-950 flex flex-col animate-slideUp">
            {/* Topo do Picker */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-surface">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white">
                  Adicionar Exercício ao Treino
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center cursor-pointer transition-colors"
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

            {/* Conteúdo do Picker */}
            {pickerTab === 'library' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Barra de Pesquisa */}
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

                  {/* Pílulas de Grupos Musculares */}
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
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista com os exercícios */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredLibraryExercises.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">
                      Nenhum exercício encontrado para "{searchTerm}".
                    </div>
                  ) : (
                    filteredLibraryExercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => handleAddFromLibrary(ex)}
                        className="p-3 rounded-xl bg-surface hover:bg-surface-2 border border-white/10 transition-colors cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white transition-colors">
                            {ex.nome}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                            <span className="font-semibold text-zinc-300">{ex.grupo}</span>
                            <span>•</span>
                            <span>{ex.mecanica}</span>
                            <span>•</span>
                            <span className="font-mono tabular-nums">{ex.series}x {ex.reps}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="min-h-[44px] px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-[11px] font-bold group-hover:bg-white group-hover:text-black transition-colors"
                        >
                          + Adicionar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Formulário de Criação de Exercício Avulso */
              <form onSubmit={handleAddCustomExercise} className="flex-1 overflow-y-auto p-4 space-y-3.5">
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
                        <option key={g} value={g}>{g}</option>
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
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-mono tabular-nums font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Reps</label>
                    <input
                      type="text"
                      value={customExReps}
                      onChange={(e) => setCustomExReps(e.target.value)}
                      placeholder="10-12"
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-mono tabular-nums font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Carga (kg)</label>
                    <input
                      type="number"
                      value={customExWeight}
                      onChange={(e) => setCustomExWeight(e.target.value)}
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-mono tabular-nums font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-500 mb-1">Descanso (s)</label>
                    <input
                      type="number"
                      value={customExRest}
                      step={15}
                      onChange={(e) => setCustomExRest(e.target.value)}
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-surface border border-white/10 text-xs font-mono tabular-nums font-bold text-white"
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
        )}

      </ModalPanel>
    </ModalBackdrop>
    )}
    </AnimatePresence>
  );
}
