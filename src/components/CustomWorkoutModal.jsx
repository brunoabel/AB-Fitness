import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Check, Dumbbell, Info, Layers, Plus, X } from 'lucide-react';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import WorkoutDetailsForm from './custom-workout/WorkoutDetailsForm';
import CustomExerciseRow from './custom-workout/CustomExerciseRow';
import ExercisePickerOverlay from './custom-workout/ExercisePickerOverlay';
import { sound, triggerHaptic } from '../utils/audio';

const createTempExerciseId = () => `ex_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function CustomWorkoutModal({ isOpen, workoutToEdit, onClose, onSave }) {
  const [title, setTitle] = useState(() => workoutToEdit?.title || '');
  const [level, setLevel] = useState(() => {
    if (workoutToEdit?.level === 'Intermediário') return 'Intermédio';
    return workoutToEdit?.level || 'Intermédio';
  });
  const [focus, setFocus] = useState(() => workoutToEdit?.focus || 'Peito & Tríceps');
  const [duration, setDuration] = useState(() => workoutToEdit?.duration || '45 min');
  const [description, setDescription] = useState(() => workoutToEdit?.description || '');
  const [trainerNotes, setTrainerNotes] = useState(() => workoutToEdit?.trainerNotes || '');

  const [exercises, setExercises] = useState(() => {
    if (workoutToEdit?.exercises && workoutToEdit.exercises.length > 0) {
      return workoutToEdit.exercises.map((ex) => ({
        ...ex,
        tempId: ex.id || createTempExerciseId()
      }));
    }
    return [];
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleAddExercise = (newEx) => {
    setExercises((prev) => [...prev, newEx]);
  };

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

  const handleRemoveExercise = (index) => {
    triggerHaptic(15);
    setExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateExercise = (index, field, value) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

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

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop key="modal" className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <ModalPanel
            onClose={onClose}
            ariaLabel={workoutToEdit ? 'Editar Treino Personalizado' : 'Criar Treino Personalizado'}
            className="w-full max-w-xl bg-app rounded-t-3xl sm:rounded-2xl border border-white/[0.08] flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-app">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent/60 border border-accent-hover text-white flex items-center justify-center font-bold">
                  <Dumbbell className="w-4 h-4 text-white" />
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
                type="button"
                onClick={onClose}
                className="tap-44 w-11 h-11 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain space-y-5 flex-1 divide-y divide-zinc-800/80">
              {validationError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <WorkoutDetailsForm {...{ description, duration, focus, level, setDescription, setDuration, setFocus, setLevel, setTitle, setTrainerNotes, title, trainerNotes }} />

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
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
                    className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-bold bg-primary text-app hover:bg-primary-hover px-4 py-2 rounded-full active:scale-95 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPickerOpen(true);
                      triggerHaptic(15);
                    }}
                    className="w-full p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.04] text-center cursor-pointer transition-all group"
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
                  </button>
                ) : (
                  <div className="space-y-3">
                    {exercises.map((ex, index) => (
                      <CustomExerciseRow
                        key={ex.tempId || index}
                        exercise={ex}
                        index={index}
                        total={exercises.length}
                        onMove={handleMoveExercise}
                        onRemove={handleRemoveExercise}
                        onUpdate={handleUpdateExercise}
                      />
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setIsPickerOpen(true);
                        triggerHaptic(15);
                      }}
                      className="min-h-[44px] w-full py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.2] text-xs font-bold text-zinc-300 flex items-center justify-center gap-1.5 hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-zinc-300" />
                      <span>Adicionar Mais Exercícios</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-white/[0.06] bg-app flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[48px] py-3 rounded-full bg-surface hover:bg-surface-2 text-zinc-200 font-bold text-xs border border-white/[0.08] transition-colors cursor-pointer active:scale-95"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveWorkout}
                className="flex-2 min-h-[48px] py-3 rounded-full bg-primary text-app hover:bg-primary-hover font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar Treino</span>
              </button>
            </div>

            {isPickerOpen && (
              <ExercisePickerOverlay
                createTempId={createTempExerciseId}
                onAddExercise={handleAddExercise}
                onClose={() => setIsPickerOpen(false)}
              />
            )}
          </ModalPanel>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
}
