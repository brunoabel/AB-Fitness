import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Check, AlertCircle } from 'lucide-react';
import { getBiomechanicalSubstitutes } from '../../services/abCoach/catalog';
import { findExerciseIn100 } from '../../data/exercises100';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 420, damping: 36 };

/**
 * Modal de Adaptação ao Vivo no Treino — "Máquina Ocupada / Indisponível"
 * Apresenta alternativas biomecânicas com a mesma porção anatómica e vetor de força.
 */
export default function SwapExerciseModal({ exercise, onSelectSubstitute, onClose }) {
  const substitutes = useMemo(() => {
    if (!exercise) return [];
    const list = getBiomechanicalSubstitutes(exercise.id || exercise.nome);
    return list.map((item) => {
      const full = findExerciseIn100(item.id) || {};
      return {
        id: item.id,
        name: item.nome,
        target: full.target || `${item.grupo} (${item.porcao})`,
        equipment: item.equipamento || full.equipment || 'Equivalente',
        porcao: item.porcao,
        grupo: item.grupo,
        suggestedWeight: exercise.suggestedWeight || full.suggestedWeight || 20,
        targetReps: exercise.targetReps || '10-12',
        restTime: exercise.restTime || 60,
        isSamePorcao: (item.porcao || '').toLowerCase() === (exercise.target || '').toLowerCase()
      };
    });
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={SPRING}
        className="w-full max-w-lg bg-surface border border-white/[0.08] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Pega da folha nativa */}
        <div className="pt-3 pb-1 sm:hidden" aria-hidden>
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto" />
        </div>

        {/* Cabeçalho */}
        <div className="px-5 pb-5 pt-2 sm:pt-5 border-b border-white/[0.06] flex items-start justify-between bg-surface/90 backdrop-blur-md">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Aparelho Ocupado?</p>
            <h2 className="text-lg font-bold text-white tracking-[-0.02em]">Substitutos biomecânicos</h2>
            <p className="text-xs text-zinc-400">
              Para <strong className="text-zinc-200">{exercise.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de Alternativas */}
        <div className="p-5 overflow-y-auto space-y-3 overscroll-contain">
          {substitutes.length === 0 ? (
            <div className="p-6 text-center text-zinc-400 text-sm">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-zinc-500" />
              Nenhum substituto direto encontrado para este movimento.
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
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between gap-3 group cursor-pointer ${
                    recommended ? 'bg-accent/10 border-accent-hover' : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
                      {recommended && <span className="text-white font-bold uppercase tracking-wider">Recomendado ·</span>}
                      <span className="truncate">{sub.equipment}</span>
                      <span>·</span>
                      <span className="truncate">{sub.porcao || sub.target}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">
                      {sub.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Mesmo vetor de força · Séries preservadas
                    </p>
                  </div>

                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    recommended ? 'bg-accent text-white' : 'text-zinc-500 group-hover:text-white'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Rodapé com Dica Biomecânica */}
        <div className="p-4 border-t border-white/[0.06] bg-app/70 text-center text-[11px] text-zinc-500">
          O AB Coach mantém o mesmo volume de séries e ativação neuromuscular do teu treino.
        </div>
      </motion.div>
    </div>
  );
}

