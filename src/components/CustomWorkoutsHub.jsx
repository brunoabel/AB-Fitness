import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Dumbbell, 
  Sparkles, 
  Clock, 
  Pencil, 
  Copy, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  RotateCcw
} from 'lucide-react';
import CustomWorkoutModal from './CustomWorkoutModal';
import { 
  getCustomWorkouts, 
  saveCustomWorkout, 
  deleteCustomWorkout, 
  duplicateCustomWorkout,
  DEFAULT_CUSTOM_WORKOUTS 
} from '../utils/storage';
import { triggerHaptic } from '../utils/audio';

export default function CustomWorkoutsHub({ onStartWorkout, onViewExercise }) {
  const [workouts, setWorkouts] = useState(() => getCustomWorkouts());
  const [selectedLevel, setSelectedLevel] = useState('Todos'); // 'Todos' | 'Iniciante' | 'Intermediário' | 'Avançado'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Controle de expansão de detalhes de cada card
  const [expandedCardIds, setExpandedCardIds] = useState({});

  // Modais de Criação e Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);

  // Recarregar treinos do storage
  const reloadWorkouts = () => {
    setWorkouts(getCustomWorkouts());
  };

  const handleOpenCreateModal = () => {
    triggerHaptic(15);
    setWorkoutToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (workout, e) => {
    e?.stopPropagation();
    triggerHaptic(15);
    setWorkoutToEdit(workout);
    setIsModalOpen(true);
  };

  const handleSaveWorkout = (workoutData) => {
    const { workouts: updatedList } = saveCustomWorkout(workoutData);
    setWorkouts(updatedList);
    setIsModalOpen(false);
    setWorkoutToEdit(null);
  };

  const handleDeleteWorkout = (workoutId, workoutTitle, e) => {
    e?.stopPropagation();
    triggerHaptic([30, 40]);
    if (window.confirm(`Deseja excluir o treino "${workoutTitle}"?`)) {
      const updated = deleteCustomWorkout(workoutId);
      setWorkouts(updated);
    }
  };

  const handleDuplicate = (workoutId, e) => {
    e?.stopPropagation();
    triggerHaptic(20);
    const updated = duplicateCustomWorkout(workoutId);
    setWorkouts(updated);
  };

  const handleToggleExpand = (id) => {
    triggerHaptic(10);
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleResetTemplates = () => {
    triggerHaptic([20, 40]);
    if (window.confirm('Deseja recarregar os modelos recomendados para Iniciante, Intermediário e Avançado?')) {
      DEFAULT_CUSTOM_WORKOUTS.forEach((tpl) => {
        saveCustomWorkout(tpl);
      });
      reloadWorkouts();
    }
  };

  // Filtragem
  const filteredWorkouts = workouts.filter((w) => {
    const matchesLevel = selectedLevel === 'Todos' || w.level === selectedLevel;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term || 
      (w.title && w.title.toLowerCase().includes(term)) ||
      (w.focus && w.focus.toLowerCase().includes(term)) ||
      (w.trainerNotes && w.trainerNotes.toLowerCase().includes(term)) ||
      (Array.isArray(w.exercises) && w.exercises.some((ex) => ex?.name && ex.name.toLowerCase().includes(term)));

    return matchesLevel && matchesSearch;
  });

  // Contadores por nível
  const countIniciante = workouts.filter((w) => w.level === 'Iniciante').length;
  const countIntermediario = workouts.filter((w) => w.level === 'Intermediário').length;
  const countAvancado = workouts.filter((w) => w.level === 'Avançado').length;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 animate-fadeIn transition-colors">
      
      {/* 1. CABEÇALHO EXECUTIVO DE TREINOS PERSONALIZADOS */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-colors space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              AB Fitness • Treino Personalizado
            </span>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Treino</span>
          </button>
        </div>

        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-snug">
            Crie sua Rotina ou Siga seu Personal
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Monte seus treinos com total flexibilidade, escolha da enciclopédia oficial de mais de 300 exercícios e grave séries, cargas e repetições na palma da mão.
          </p>
        </div>

        {/* Banner de Níveis (Iniciante, Intermediário, Avançado) */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Disponível para todos os níveis</span>
          </span>
          <span className="text-zinc-400">
            {workouts.length} {workouts.length === 1 ? 'treino cadastrado' : 'treinos cadastrados'}
          </span>
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA E FILTRO POR NÍVEL */}
      <div className="space-y-2">
        {/* Campo de Busca Rápida */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, foco muscular ou exercício..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-xs"
          />
        </div>

        {/* Pílulas de Filtro por Nível */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {[
            { id: 'Todos', label: 'Todos', count: workouts.length, color: 'zinc' },
            { id: 'Iniciante', label: 'Iniciante', count: countIniciante, color: 'emerald' },
            { id: 'Intermediário', label: 'Intermed.', count: countIntermediario, color: 'sky' },
            { id: 'Avançado', label: 'Avançado', count: countAvancado, color: 'amber' }
          ].map((tab) => {
            const isSelected = selectedLevel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedLevel(tab.id);
                  triggerHaptic(10);
                }}
                className={`py-2 px-1 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-xs'
                    : 'bg-white dark:bg-[#121215] border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] mt-0.5 ${
                  isSelected 
                    ? 'text-white/80 dark:text-black/80 font-normal' 
                    : 'text-zinc-400 dark:text-zinc-500 font-normal'
                }`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LISTAGEM DE CARDS DE TREINOS PERSONALIZADOS */}
      <div className="space-y-3.5">
        {filteredWorkouts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Nenhum treino encontrado
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mt-0.5">
                {searchQuery || selectedLevel !== 'Todos'
                  ? 'Tente ajustar os filtros ou a pesquisa para encontrar o seu treino.'
                  : 'Comece criando o seu primeiro treino personalizado ou carregue os modelos oficiais.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                Criar Treino
              </button>
              <button
                onClick={handleResetTemplates}
                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Modelos</span>
              </button>
            </div>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const isExpanded = !!expandedCardIds[workout.id];
            const levelColor = workout.level === 'Iniciante' 
              ? 'emerald' 
              : workout.level === 'Avançado' 
                ? 'amber' 
                : 'sky';

            return (
              <div
                key={workout.id}
                className="rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {/* Topo do Card com Nível, Duração e Ações */}
                <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Badge do Nível */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        levelColor === 'emerald'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800'
                          : levelColor === 'amber'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800'
                            : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200/80 dark:border-sky-800'
                      }`}>
                        {workout.level}
                      </span>

                      <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{workout.duration}</span>
                      </div>
                    </div>

                    {/* Ações Rápidas: Editar, Duplicar, Excluir */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleOpenEditModal(workout, e)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar treino"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDuplicate(workout.id, e)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Duplicar treino"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteWorkout(workout.id, workout.title, e)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Excluir treino"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título e Foco Muscular */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                      {workout.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">
                      {workout.focus}
                    </p>
                  </div>

                  {/* Observação do Personal (se houver) */}
                  {workout.trainerNotes && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/80 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        <strong className="text-zinc-900 dark:text-white font-bold">Personal:</strong> {workout.trainerNotes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Conteúdo do Card: Exercícios & Botão Iniciar */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Prévia dos Exercícios */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider px-1">
                      <span>Exercícios ({workout.exercises?.length || 0})</span>
                      <button
                        onClick={() => handleToggleExpand(workout.id)}
                        className="text-sky-500 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Ocultar detalhes' : 'Ver todos'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Exibe lista compacta ou expandida */}
                    {(isExpanded ? workout.exercises : workout.exercises.slice(0, 3)).map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        onClick={() => onViewExercise && onViewExercise(ex)}
                        className="p-2.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-xl bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-[11px] flex items-center justify-center border border-zinc-200/80 dark:border-zinc-700 shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                              {ex.name}
                            </h4>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {ex.target} {ex.suggestedWeight > 0 ? `• ${ex.suggestedWeight} kg` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700">
                            {ex.defaultSets}x {ex.suggestedReps}
                          </span>
                        </div>
                      </div>
                    ))}

                    {!isExpanded && workout.exercises.length > 3 && (
                      <button
                        onClick={() => handleToggleExpand(workout.id)}
                        className="w-full py-1.5 text-center text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        + mais {workout.exercises.length - 3} exercícios
                      </button>
                    )}
                  </div>

                  {/* BOTÃO PRINCIPAL: INICIAR TREINO PERSONALIZADO */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        triggerHaptic(20);
                        onStartWorkout(workout);
                      }}
                      className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Iniciar Treino</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Criação / Edição de Treino */}
      {isModalOpen && (
        <CustomWorkoutModal
          key={workoutToEdit?.id || 'new_custom_workout'}
          isOpen={isModalOpen}
          workoutToEdit={workoutToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setWorkoutToEdit(null);
          }}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  );
}
