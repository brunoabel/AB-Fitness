import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Check, AlertCircle } from 'lucide-react';
import { getBiomechanicalSubstitutes } from '../../services/abCoach/catalog';
import { findExerciseIn100 } from '../../data/exercises100';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 };

/**
 * Modal de Adaptação ao Vivo no Treino — "Máquina Ocupada / Indisponível"
 * Apresenta alternativas biomecânicas com a mesma porção anatómica e vetor de força.
 */
export default function SwapExerciseModal({
  exercise,
  excludeIds = [],
  prevIndex = null,
  pastWeights = {},
  onSelectSubstitute,
  onClose
}) {
  const reducedMotion = useReducedMotion();
  const substitutes = useMemo(() => {
    if (!exercise) return [];
    const list = getBiomechanicalSubstitutes(exercise.id || exercise.nome, excludeIds);
    return list.map((item) => {
      const full = findExerciseIn100(item.id) || {};
      const prevSets = (prevIndex instanceof Map ? prevIndex.get(item.id) : prevIndex?.[item.id]) || pastWeights?.[item.id] || null;
      const lastWorkingSet = Array.isArray(prevSets)
        ? prevSets.find((s) => (s.completed || s.done || Number(s.weight) > 0) && s.type !== 'W' && Number(s.weight) > 0) || null
        : null;
      const isLightEquip = /peso corporal|el[áa]stico|bodyweight|band/i.test(item.equipamento || '');
      const fallbackWeight = isLightEquip ? 0 : (full.suggestedWeight ?? '');
      return {
        id: item.id,
        name: item.nome,
        target: full.target || `${item.grupo} (${item.porcao})`,
        equipment: item.equipamento || full.equipment || 'Equivalente',
        porcao: item.porcao,
        grupo: item.grupo,
        suggestedWeight: lastWorkingSet?.weight ?? fallbackWeight,
        lastWorkingSet,
        targetReps: exercise.targetReps || '10-12',
        restTime: exercise.restTime || 60,
        isSamePorcao: (item.porcao || '').toLowerCase() === (exercise.target || '').toLowerCase()
      };
    });
  }, [exercise, excludeIds, prevIndex, pastWeights]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={reducedMotion ? { duration: 0 } : SPRING}
        className="w-full max-w-lg bg-app border border-white/[0.08] rounded-t-3xl sm:rounded-2xl max-h-[85dvh] flex flex-col overflow-hidden"
      >
        {/* Pega da folha nativa */}
        <div className="pt-3 pb-1 sm:hidden" aria-hidden>
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pb-4 pt-2 sm:pt-5 border-b border-white/[0.06] flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-bold text-white tracking-[-0.02em]">Trocar exercício</h2>
            <p className="text-xs text-zinc-400 truncate">
              Em vez de <span className="text-zinc-200">{exercise.name}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 rounded-full text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Alternativas */}
        <div className="px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] overflow-y-auto space-y-2 overscroll-contain">
          {substitutes.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
              Sem substitutos diretos para este movimento.
            </div>
          ) : (
            substitutes.map((sub, idx) => {
              const recommended = idx === 0;
              return (
                <motion.button
                  key={sub.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    triggerHaptic(12);
                    onSelectSubstitute(exercise, sub);
                  }}
                  className={`w-full p-4 rounded-2xl border transition-colors duration-150 text-left flex items-center justify-between gap-3 group cursor-pointer ${
                    recommended ? 'bg-accent/10 border-accent-hover' : 'bg-transparent border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                      {recommended && <span className="text-white">Recomendado ·</span>}
                      <span className="truncate">{sub.equipment}</span>
                      <span>·</span>
                      <span className="truncate">{sub.porcao || sub.target}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {sub.name}
                    </h3>
                    {sub.lastWorkingSet && (
                      <p className="text-[11px] text-zinc-500 tabular-nums">
                        Última: {sub.lastWorkingSet.weight} kg × {sub.lastWorkingSet.reps}
                      </p>
                    )}
                  </div>

                  <Check
                    className={`shrink-0 w-4 h-4 stroke-[1.75] transition-colors ${recommended ? 'text-white' : 'text-zinc-600 group-hover:text-white'}`}
                  />
                </motion.button>
              );
            })
          )}
        </div>

      </motion.div>
    </div>
  );
}

