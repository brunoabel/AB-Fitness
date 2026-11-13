import React, { useState } from 'react';
import {
  Play,
  Plus,
  Dumbbell,
  Pencil,
  Copy,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles
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

export default function CustomWorkoutsHub({ onStartWorkout, onViewExercise, onOpenAICoach }) {
  const [workouts, setWorkouts] = useState(() => getCustomWorkouts());
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardIds, setExpandedCardIds] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);

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
    if (window.confirm(`Tens a certeza de que desejas eliminar o treino "${workoutTitle}"?`)) {
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
    if (window.confirm('Desejas recarregar os modelos recomendados para Iniciante, Intermédio e Avançado?')) {
      DEFAULT_CUSTOM_WORKOUTS.forEach((tpl) => {
        saveCustomWorkout(tpl);
      });
      reloadWorkouts();
    }
  };

  const filteredWorkouts = workouts.filter((w) => {
    const normLevel = w.level === 'Intermediário' ? 'Intermédio' : w.level;
    const matchesLevel = selectedLevel === 'Todos' || normLevel === selectedLevel;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch = !term ||
      (w.title && w.title.toLowerCase().includes(term)) ||
      (w.focus && w.focus.toLowerCase().includes(term)) ||
      (w.trainerNotes && w.trainerNotes.toLowerCase().includes(term)) ||
      (Array.isArray(w.exercises) && w.exercises.some((ex) => ex?.name && ex.name.toLowerCase().includes(term)));

    return matchesLevel && matchesSearch;
  });

  const countIniciante = workouts.filter((w) => w.level === 'Iniciante').length;
  const countIntermedio = workouts.filter((w) => w.level === 'Intermédio' || w.level === 'Intermediário').length;
  const countAvancado = workouts.filter((w) => w.level === 'Avançado').length;

  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-4 pb-10 space-y-6 animate-fadeIn">
      {/* Cabeçalho editorial limpo sobre OLED preto */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-[-0.025em]">
            Meus Treinos
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 tabular-nums">
            {workouts.length} {workouts.length === 1 ? 'plano guardado' : 'planos guardados'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenAICoach && (
            <button
              type="button"
              onClick={() => {
                onOpenAICoach();
                triggerHaptic(12);
              }}
              className="min-h-[42px] px-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Criar ou adaptar plano com o AB Coach"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pedir ao Coach</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="min-h-[42px] px-4 rounded-full bg-white hover:bg-zinc-100 text-black text-xs font-bold inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* Pesquisa + Filtros em pílulas leves */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 stroke-[1.8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar treino ou exercício..."
            className="w-full min-h-[46px] pl-10 pr-4 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'Todos', label: 'Todos', count: workouts.length },
            { id: 'Iniciante', label: 'Iniciante', count: countIniciante },
            { id: 'Intermédio', label: 'Intermédio', count: countIntermedio },
            { id: 'Avançado', label: 'Avançado', count: countAvancado }
          ].map((tab) => {
            const isSelected = selectedLevel === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedLevel(tab.id);
                  triggerHaptic(10);
                }}
                className={`min-h-[38px] px-4 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`tabular-nums ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Listagem de Planos */}
      {filteredWorkouts.length === 0 ? (
        <div className="py-12 text-center border-t border-white/[0.06] space-y-4">
          <Dumbbell className="w-7 h-7 text-zinc-500 mx-auto stroke-[1.6]" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Nenhum treino encontrado
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchQuery || selectedLevel !== 'Todos'
                ? 'Ajusta os filtros ou cria um plano à tua medida.'
                : 'Cria o teu primeiro treino ou carrega os modelos iniciais.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="min-h-[42px] px-5 rounded-full bg-white text-black text-xs font-bold active:scale-95 transition-all cursor-pointer"
            >
              Criar Treino
            </button>
            <button
              type="button"
              onClick={handleResetTemplates}
              className="min-h-[42px] px-4 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Repor Modelos</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkouts.map((workout) => {
            const isExpanded = !!expandedCardIds[workout.id];

            return (
              <article
                key={workout.id}
                className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 flex flex-col justify-between gap-4 hover:border-white/[0.14] transition-colors"
              >
                <div className="space-y-3">
                  {/* Metadados + Ações discretas */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-400 tabular-nums">
                      {workout.level} · {workout.duration}
                    </span>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditModal(workout, e)}
                        className="min-h-[38px] min-w-[38px] rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
                        title="Editar plano"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(workout.id, e)}
                        className="min-h-[38px] min-w-[38px] rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
                        title="Duplicar plano"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkout(workout.id, workout.title, e)}
                        className="min-h-[38px] min-w-[38px] rounded-full text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center justify-center"
                        title="Eliminar plano"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título e Foco */}
                  <div>
                    <h2 className="font-heading text-lg font-bold text-white tracking-tight leading-snug">
                      {workout.title}
                    </h2>
                    {workout.focus && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {workout.focus}
                      </p>
                    )}
                    {workout.trainerNotes && (
                      <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                        {workout.trainerNotes}
                      </p>
                    )}
                  </div>

                  {/* Lista limpa com divisórias finas (sem caixas aninhadas) */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 pb-1">
                      <span>{workout.exercises?.length || 0} exercícios</span>
                      {workout.exercises?.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(workout.id)}
                          className="text-zinc-300 hover:text-white inline-flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <span>{isExpanded ? 'Ver menos' : 'Ver todos'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <ul className="divide-y divide-white/[0.05]">
                      {(isExpanded ? workout.exercises : workout.exercises.slice(0, 3)).map((ex, idx) => (
                        <li
                          key={ex.id || idx}
                          onClick={() => onViewExercise && onViewExercise(ex)}
                          className="py-2 flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate transition-colors">
                              <span className="text-zinc-500 mr-2 tabular-nums">{idx + 1}.</span>
                              {ex.name}
                            </p>
                            {ex.suggestedWeight > 0 && (
                              <span className="text-[11px] text-zinc-500 pl-5 tabular-nums">
                                Sugestão: {ex.suggestedWeight} kg
                              </span>
                            )}
                          </div>

                          <span className="text-xs font-mono font-semibold text-zinc-400 tabular-nums shrink-0">
                            {ex.defaultSets}×{ex.suggestedReps}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botão Iniciar Treino */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(20);
                    onStartWorkout(workout);
                  }}
                  className="w-full min-h-[48px] rounded-full bg-white hover:bg-zinc-100 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Treino</span>
                </button>
              </article>
            );
          })}
        </div>
      )}

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
