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
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmResetTpl, setConfirmResetTpl] = useState(false);

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

  const handleDeleteWorkout = (workoutId, _workoutTitle, e) => {
    e?.stopPropagation();
    if (confirmDeleteId !== workoutId) {
      triggerHaptic(8);
      setConfirmDeleteId(workoutId);
      return;
    }
    triggerHaptic([30, 40]);
    setConfirmDeleteId(null);
    const updated = deleteCustomWorkout(workoutId);
    setWorkouts(updated);
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
    if (!confirmResetTpl) {
      triggerHaptic(8);
      setConfirmResetTpl(true);
      return;
    }
    triggerHaptic([20, 40]);
    setConfirmResetTpl(false);
    DEFAULT_CUSTOM_WORKOUTS.forEach((tpl) => {
      saveCustomWorkout(tpl);
    });
    reloadWorkouts();
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
              className="min-h-[42px] px-3.5 rounded-full bg-accent/40 hover:bg-accent/60 border border-accent-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
              title="Criar ou adaptar plano com o AB Coach"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-200" strokeWidth={1.75} />
              <span>Pedir ao Coach</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="min-h-[42px] px-4 rounded-full bg-primary hover:bg-zinc-200 text-app text-xs font-semibold inline-flex items-center gap-1.5 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* Pesquisa + Filtros em pílulas com seleção em Azul Marinho */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 stroke-[1.75]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar treino ou exercício..."
            className="w-full min-h-[46px] pl-10 pr-4 rounded-full bg-surface border border-white/[0.08] text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-hover transition-colors"
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
                className={`min-h-[38px] px-4 rounded-full border text-xs font-semibold whitespace-nowrap transition-[background-color,border-color,color] duration-150 cursor-pointer inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent border-accent-hover text-white'
                    : 'bg-transparent border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.16]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`tabular-nums ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista aberta diretamente no preto OLED (sem caixas empilhadas) */}
      {filteredWorkouts.length === 0 ? (
        <div className="py-12 text-center border-t border-white/[0.06] space-y-4">
          <Dumbbell className="w-7 h-7 text-zinc-500 mx-auto stroke-[1.6]" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
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
              className="min-h-[42px] px-5 rounded-full bg-primary text-app hover:bg-zinc-200 text-xs font-semibold active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
            >
              Criar Treino
            </button>
            <button
              type="button"
              onClick={handleResetTemplates}
              className={`min-h-[42px] px-4 rounded-full border text-xs font-semibold active:scale-[0.97] transition-[background-color,border-color,color,transform] duration-150 ease-out cursor-pointer inline-flex items-center gap-1.5 ${
                confirmResetTpl
                  ? 'bg-accent/60 border-accent-hover text-white'
                  : 'bg-transparent border-white/[0.1] hover:border-white/[0.2] text-zinc-300'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{confirmResetTpl ? 'Confirmar reposição' : 'Repor Modelos'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06]">
          {filteredWorkouts.map((workout) => {
            const isExpanded = !!expandedCardIds[workout.id];

            return (
              <article key={workout.id} className="py-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <span className="text-[11px] font-medium text-zinc-400 tabular-nums block">
                      {workout.level} · {workout.duration} · {workout.exercises?.length || 0} exercícios
                    </span>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                      {workout.title}
                    </h2>
                    {workout.focus && (
                      <p className="text-xs text-zinc-400">{workout.focus}</p>
                    )}
                    {workout.trainerNotes && (
                      <p className="text-xs text-zinc-500 pt-0.5 leading-relaxed">
                        {workout.trainerNotes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20);
                      onStartWorkout(workout);
                    }}
                    className="shrink-0 min-h-[42px] px-4 rounded-full bg-primary hover:bg-zinc-200 text-app font-semibold text-xs flex items-center gap-1.5 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Iniciar</span>
                  </button>
                </div>

                {/* Ações discretas + toggle da sequência de exercícios */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {workout.exercises?.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(workout.id)}
                      className="text-xs text-zinc-300 hover:text-white inline-flex items-center gap-1 cursor-pointer font-medium min-h-[36px]"
                    >
                      <span>{isExpanded ? 'Ocultar exercícios' : 'Ver exercícios'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditModal(workout, e)}
                      className="min-h-[36px] min-w-[36px] rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
                      title="Editar plano"
                      aria-label={`Editar ${workout.title}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDuplicate(workout.id, e)}
                      className="min-h-[36px] min-w-[36px] rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
                      title="Duplicar plano"
                      aria-label={`Duplicar ${workout.title}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteWorkout(workout.id, workout.title, e)}
                      className={`min-h-[36px] px-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                        confirmDeleteId === workout.id
                          ? 'bg-red-500/20 border border-red-400/40 text-red-300'
                          : 'min-w-[36px] text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                      }`}
                      title="Eliminar plano"
                      aria-label={`Eliminar ${workout.title}`}
                    >
                      {confirmDeleteId === workout.id ? 'Confirmar' : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Lista de exercícios expandida sem caixas */}
                {isExpanded && workout.exercises?.length > 0 && (
                  <ul className="divide-y divide-white/[0.05] pl-3 border-l-2 border-accent-hover/70">
                    {workout.exercises.map((ex, idx) => (
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

                        <span className="text-xs font-display font-semibold text-zinc-400 tabular-nums shrink-0">
                          {ex.defaultSets}×{ex.suggestedReps}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
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
