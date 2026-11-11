import React, { useState } from 'react';
import { 
  Play, 
  Plus, 
  Dumbbell, 
  Clock, 
  Pencil, 
  Copy, 
  Trash2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Zap,
  RotateCcw,
  Bot
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
  const [selectedLevel, setSelectedLevel] = useState('Todos'); // 'Todos' | 'Iniciante' | 'Intermédio' | 'Avançado'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Controlo de expansão de detalhes de cada cartão
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

  // Filtragem
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

  // Contadores por nível
  const countIniciante = workouts.filter((w) => w.level === 'Iniciante').length;
  const countIntermedio = workouts.filter((w) => w.level === 'Intermédio' || w.level === 'Intermediário').length;
  const countAvancado = workouts.filter((w) => w.level === 'Avançado').length;

  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-6 animate-fadeIn transition-colors">
      
      {/* 1. CABEÇALHO TÉCNICO DE TREINOS PERSONALIZADOS */}
      <div className="p-5 rounded-xl bg-surface border border-white/10 shadow-xs transition-colors space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Gestão de Planos & Rotinas
          </span>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-app hover:bg-primary-hover px-3 py-2 rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer min-h-[40px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Treino</span>
          </button>
        </div>

        <div>
          <h1 className="text-xl font-bold text-zinc-50 tracking-tight leading-snug">
            Planos Personalizados & Prescrições
          </h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-2xl">
            Cria os teus treinos com total flexibilidade, seleciona da biblioteca oficial de exercícios biomecânicos e regista séries, cargas e repetições na palma da mão.
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>Configuração flexível para todos os níveis</span>
          <span className="tabular-nums font-semibold text-zinc-300">
            {workouts.length} {workouts.length === 1 ? 'treino registado' : 'treinos registados'}
          </span>
        </div>
      </div>

      {/* 1.1 MÓDULO SÓBRIO DO AB COACH IA */}
      <div className="p-4 sm:p-5 rounded-xl bg-surface-2/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5 stroke-[2]" />
            <span>AB Coach • Treinador Biomecânico</span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Prescrição com Ajuste Biomecânico Imediato
          </h2>
          <p className="text-xs text-zinc-400 leading-normal max-w-xl">
            Solicita ênfases específicas (peitoral costal, vasto medial, cadeia posterior) ou adaptação para desconfortos articulares e restrições de tempo.
          </p>
        </div>

        <button
          onClick={() => {
            if (onOpenAICoach) onOpenAICoach();
            triggerHaptic(15);
          }}
          className="px-4 py-2.5 rounded-lg bg-accent/70 text-white hover:opacity-90 font-semibold text-xs transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer border border-zinc-200 min-h-[40px]"
        >
          <Bot className="w-4 h-4 stroke-[2]" />
          <span>Abrir AB Coach</span>
        </button>
      </div>

      {/* 2. PESQUISA E FILTROS */}
      <div className="space-y-3">
        {/* Campo de Pesquisa */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[1.8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, foco muscular ou exercício..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-white/10 text-xs font-medium text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-600 transition-colors min-h-[44px]"
          />
        </div>

        {/* Filtros de Nível */}
        <div className="grid grid-cols-4 gap-2 text-center">
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
                onClick={() => {
                  setSelectedLevel(tab.id);
                  triggerHaptic(10);
                }}
                className={`py-2 px-1 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${
                  isSelected
                    ? 'bg-accent/70 text-white border-accent-hover shadow-xs'
                    : 'bg-surface border-white/10 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] tabular-nums mt-0.5 ${
                  isSelected ? 'text-white/80 font-normal' : 'text-zinc-400 font-normal'
                }`}>
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. LISTAGEM DE TREINOS EM GRELHA ADAPTATIVA */}
      <div>
        {filteredWorkouts.length === 0 ? (
          <div className="p-8 rounded-xl bg-surface border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Dumbbell className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Nenhum plano encontrado
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                {searchQuery || selectedLevel !== 'Todos'
                  ? 'Tenta ajustar os filtros de nível ou a pesquisa para encontrar o treino pretendido.'
                  : 'Começa por criar o teu primeiro plano personalizado ou repõe os modelos oficiais.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-lg bg-primary text-app text-xs font-semibold active:scale-95 transition-all cursor-pointer min-h-[40px]"
              >
                Criar Treino
              </button>
              <button
                onClick={handleResetTemplates}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-700 min-h-[40px]"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.8]" />
                <span>Repor Modelos</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWorkouts.map((workout) => {
              const isExpanded = !!expandedCardIds[workout.id];

              return (
                <div
                  key={workout.id}
                  className="rounded-xl bg-surface border border-white/10 shadow-xs overflow-hidden transition-all hover:border-zinc-700 flex flex-col justify-between"
                >
                  {/* Topo do Cartão */}
                  <div className="p-4 sm:p-5 border-b border-white/10 bg-surface-2/50 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {workout.level}
                        </span>

                        <div className="flex items-center gap-1 text-zinc-400 text-xs font-medium tabular-nums">
                          <Clock className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{workout.duration}</span>
                        </div>
                      </div>

                      {/* Ações Técnicas */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEditModal(workout, e)}
                          className="tap-44 p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Editar plano"
                        >
                          <Pencil className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={(e) => handleDuplicate(workout.id, e)}
                          className="tap-44 p-1.5 rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Duplicar plano"
                        >
                          <Copy className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteWorkout(workout.id, workout.title, e)}
                          className="tap-44 p-1.5 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-950/40 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Eliminar plano"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-50 leading-tight">
                        {workout.title}
                      </h3>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        {workout.focus}
                      </p>
                    </div>

                    {workout.trainerNotes && (
                      <div className="p-2.5 rounded-lg bg-surface border border-zinc-700/80 text-[11px] text-zinc-300 font-normal flex items-start gap-2">
                        <Zap className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 stroke-[2]" />
                        <span className="leading-relaxed">
                          <strong className="text-zinc-100 font-semibold">Nota técnica:</strong> {workout.trainerNotes}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lista de Exercícios & Ação de Iniciar */}
                  <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-semibold uppercase tracking-wider px-1">
                        <span>Exercícios ({workout.exercises?.length || 0})</span>
                        <button
                          onClick={() => handleToggleExpand(workout.id)}
                          className="text-zinc-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <span>{isExpanded ? 'Ocultar detalhes' : 'Ver todos'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 stroke-[2]" /> : <ChevronDown className="w-3 h-3 stroke-[2]" />}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(isExpanded ? workout.exercises : workout.exercises.slice(0, 3)).map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            onClick={() => onViewExercise && onViewExercise(ex)}
                            className="p-2.5 rounded-lg bg-surface-2/80 hover:bg-surface-3 border border-white/10 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 font-semibold text-[11px] flex items-center justify-center border border-zinc-700 shrink-0 tabular-nums">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-white transition-colors">
                                  {ex.name}
                                </h4>
                                <span className="text-[11px] text-zinc-400 tabular-nums">
                                  {ex.target} {ex.suggestedWeight > 0 ? `• ${ex.suggestedWeight} kg` : ''}
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 tabular-nums">
                              {ex.defaultSets} × {ex.suggestedReps}
                            </span>
                          </div>
                        ))}
                      </div>

                      {!isExpanded && workout.exercises.length > 3 && (
                        <button
                          onClick={() => handleToggleExpand(workout.id)}
                          className="w-full py-1 text-center text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                        >
                          + mais {workout.exercises.length - 3} exercícios
                        </button>
                      )}
                    </div>

                    {/* Botão Iniciar Treino */}
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          triggerHaptic(20);
                          onStartWorkout(workout);
                        }}
                        className="w-full py-3 rounded-lg bg-primary text-app hover:bg-primary-hover font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer min-h-[44px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Iniciar Treino</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
