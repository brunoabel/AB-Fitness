import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Dumbbell, 
  Sparkles, 
  Search, 
  Check, 
  Info,
  Layers
} from 'lucide-react';
import { EXERCISES_100, MUSCLE_GROUPS } from '../data/exercises100';
import { triggerHaptic, sound } from '../utils/audio';

const QUICK_FOCUS_OPTIONS = [
  'Peito & Tríceps',
  'Costas & Bíceps',
  'Pernas Completo',
  'Quadríceps & Glúteos',
  'Posterior & Glúteos',
  'Ombros & Trapézio',
  'Superior (Upper)',
  'Inferior (Lower)',
  'Push (Empurrar)',
  'Pull (Puxar)',
  'Legs (Pernas)',
  'Full Body',
  'Abdômen & Core'
];

const REST_OPTIONS = [30, 45, 60, 90, 120, 180];
const DURATION_OPTIONS = ['30 min', '40 min', '45 min', '50 min', '60 min', '75 min', '90 min'];

const createTempExerciseId = () => `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function CustomWorkoutModal({ isOpen, workoutToEdit, onClose, onSave }) {
  // Informações gerais do treino (Declaradas no topo para cumprir rigorosamente as regras de React Hooks)
  const [title, setTitle] = useState(() => workoutToEdit?.title || '');
  const [level, setLevel] = useState(() => workoutToEdit?.level || 'Intermediário');
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

  // Salvar Treino
  const handleSaveWorkout = () => {
    if (!title.trim()) {
      setValidationError('Por favor, informe o nome do treino (Ex: Treino A - Peito).');
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
      ...(workoutToEdit || {}),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0c0c0e] rounded-t-3xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden transition-colors">
        
        {/* Topo do Modal com Título e Fechar */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 shadow-xs">
              <Dumbbell className="w-4 h-4 text-sky-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white leading-tight">
                {workoutToEdit ? 'Editar Treino Personalizado' : 'Criar Treino Personalizado'}
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Monte sua rotina ou adicione a prescrição do Personal Trainer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/80">
          
          {/* Mensagem de Erro de Validação */}
          {validationError && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 1. SEÇÃO: DADOS DO TREINO & NÍVEL */}
          <div className="space-y-3.5 pt-1">
            {/* Nome do Treino */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nome do Treino <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Treino A - Peitoral e Tríceps"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* SELETOR DE NÍVEL (Iniciante, Intermediário, Avançado) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Nível de Experiência
                </label>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  Disponível para todos
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Iniciante', label: 'Iniciante', desc: 'Adaptação', color: 'emerald' },
                  { id: 'Intermediário', label: 'Intermediário', desc: 'Volume & Carga', color: 'sky' },
                  { id: 'Avançado', label: 'Avançado', desc: 'Alta Intensidade', color: 'amber' }
                ].map((item) => {
                  const isSelected = level === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setLevel(item.id);
                        triggerHaptic(10);
                      }}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                        isSelected
                          ? item.color === 'emerald'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                            : item.color === 'amber'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                              : 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Foco Muscular */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Foco Muscular / Grupamento
              </label>
              <input
                type="text"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Ex: Peito, Ombros e Tríceps"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all mb-2"
              />

              {/* Sugestões Rápidas de Foco */}
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {QUICK_FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setFocus(opt);
                      triggerHaptic(10);
                    }}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-xl transition-all cursor-pointer border ${
                      focus === opt
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Duração Estimada */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Duração Estimada
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => {
                      setDuration(dur);
                      triggerHaptic(10);
                    }}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                      duration === dur
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição / Objetivo do Treino */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Descrição / Objetivo do Treino <span className="text-zinc-400 font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Treino focado em força bruta e sobrecarga progressiva"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Observações do Personal Trainer */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Observações / Prescrição do Personal <span className="text-zinc-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                value={trainerNotes}
                onChange={(e) => setTrainerNotes(e.target.value)}
                placeholder="Ex: Descanso de 60s entre séries. Cadência 3s excêntrica. Focar em não usar impulsão."
                rows={2}
                className="w-full px-3.5 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* 2. SEÇÃO: EXERCÍCIOS ADICIONADOS */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>Exercícios ({exercises.length})</span>
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Configure séries, repetições, carga inicial e descanso
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPickerOpen(true);
                  triggerHaptic(15);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-black dark:bg-white dark:text-black hover:opacity-90 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
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
                className="p-6 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 text-sky-500" />
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Nenhum exercício adicionado ainda
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Toque aqui para escolher da biblioteca oficial de mais de 300 exercícios ou criar um exercício avulso.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((ex, index) => (
                  <div
                    key={ex.tempId || index}
                    className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3"
                  >
                    {/* Topo do Exercício com Nome e Ações de Ordenação */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            {ex.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {ex.target} • {ex.equipment}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveExercise(index, -1)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === exercises.length - 1}
                          onClick={() => handleMoveExercise(index, 1)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 cursor-pointer"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Controles de Séries, Reps, Carga e Descanso */}
                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      {/* Séries */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Séries</span>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateExercise(index, 'defaultSets', Math.max(1, (ex.defaultSets || 3) - 1))}
                            className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-zinc-900 dark:text-white w-4">
                            {ex.defaultSets || 3}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateExercise(index, 'defaultSets', Math.min(8, (ex.defaultSets || 3) + 1))}
                            className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Repetições */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Reps</span>
                        <input
                          type="text"
                          value={ex.suggestedReps || '10'}
                          onChange={(e) => handleUpdateExercise(index, 'suggestedReps', e.target.value)}
                          className="w-full text-center text-xs font-bold text-zinc-900 dark:text-white bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* Carga Inicial */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Carga (kg)</span>
                        <input
                          type="number"
                          value={ex.suggestedWeight ?? 0}
                          onChange={(e) => handleUpdateExercise(index, 'suggestedWeight', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full text-center text-xs font-bold text-zinc-900 dark:text-white bg-transparent focus:outline-none"
                        />
                      </div>

                      {/* Descanso */}
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-1">Descanso</span>
                        <select
                          value={ex.restTime || 60}
                          onChange={(e) => handleUpdateExercise(index, 'restTime', Number(e.target.value))}
                          className="w-full text-center text-xs font-bold text-zinc-900 dark:text-white bg-transparent focus:outline-none cursor-pointer"
                        >
                          {REST_OPTIONS.map((sec) => (
                            <option key={sec} value={sec} className="dark:bg-zinc-900">
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
                      placeholder="Dica específica (Ex: Drop-set na última série, pausa 2s)"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700 text-[11px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none"
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
                  className="w-full py-2.5 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-center gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-sky-500" />
                  <span>Adicionar Mais Exercícios</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Fixo com Botão Salvar */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveWorkout}
            className="flex-2 py-3 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Salvar Treino</span>
          </button>
        </div>

        {/* SUB-MODAL: PICKER DE EXERCÍCIOS (BIBLIOTECA 100 OU CUSTOMIZADO) */}
        {isPickerOpen && (
          <div className="absolute inset-0 z-60 bg-white dark:bg-[#0c0c0e] flex flex-col animate-slideUp">
            {/* Topo do Picker */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/80 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                  Adicionar Exercício ao Treino
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abas: Da Biblioteca vs Criar Novo */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-4 pt-2 shrink-0 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setPickerTab('library');
                  triggerHaptic(10);
                }}
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  pickerTab === 'library'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
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
                className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                  pickerTab === 'custom'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                }`}
              >
                Exercício Personalizado (Avulso)
              </button>
            </div>

            {/* Conteúdo do Picker */}
            {pickerTab === 'library' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Barra de Pesquisa */}
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80 shrink-0 space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar exercício por nome ou grupo..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    />
                  </div>

                  {/* Pílulas de Grupos Musculares */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedMuscleFilter('Todos')}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer ${
                        selectedMuscleFilter === 'Todos'
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      Todos
                    </button>
                    {MUSCLE_GROUPS.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedMuscleFilter(group)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer ${
                          selectedMuscleFilter === group
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista com os 100 exercícios */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {filteredLibraryExercises.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-xs">
                      Nenhum exercício encontrado para "{searchTerm}".
                    </div>
                  ) : (
                    filteredLibraryExercises.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => handleAddFromLibrary(ex)}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                            {ex.nome}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            <span className="font-semibold text-zinc-600 dark:text-zinc-300">{ex.grupo}</span>
                            <span>•</span>
                            <span>{ex.mecanica}</span>
                            <span>•</span>
                            <span>{ex.series}x {ex.reps}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-2.5 py-1 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold group-hover:bg-sky-500 group-hover:text-white transition-colors"
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
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-sky-500" />
                  <span>Cadastre um exercício exclusivo passado pelo seu Personal Trainer.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Nome do Exercício <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customExName}
                    onChange={(e) => setCustomExName(e.target.value)}
                    placeholder="Ex: Supino Hammer com pegada neutra"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Grupo Muscular
                    </label>
                    <select
                      value={customExGroup}
                      onChange={(e) => setCustomExGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                    >
                      {MUSCLE_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Equipamento
                    </label>
                    <input
                      type="text"
                      value={customExEquip}
                      onChange={(e) => setCustomExEquip(e.target.value)}
                      placeholder="Ex: Máquina / Polia"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Séries</label>
                    <input
                      type="number"
                      value={customExSets}
                      min={1}
                      max={10}
                      onChange={(e) => setCustomExSets(e.target.value)}
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Reps</label>
                    <input
                      type="text"
                      value={customExReps}
                      onChange={(e) => setCustomExReps(e.target.value)}
                      placeholder="10-12"
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Carga (kg)</label>
                    <input
                      type="number"
                      value={customExWeight}
                      onChange={(e) => setCustomExWeight(e.target.value)}
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 mb-1">Descanso (s)</label>
                    <input
                      type="number"
                      value={customExRest}
                      step={15}
                      onChange={(e) => setCustomExRest(e.target.value)}
                      className="w-full text-center px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-black dark:bg-white dark:text-black text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Adicionar Exercício ao Treino
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
