import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shuffle, Check, Dumbbell, Sparkles, AlertCircle } from 'lucide-react';
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
        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Cabeçalho */}
        <div className="p-5 border-b border-white/10 flex items-start justify-between bg-zinc-900/90 backdrop-blur-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/20 border border-accent-hover text-white text-[11px] font-bold">
              <Shuffle className="w-3.5 h-3.5 text-sky-400" />
              Adaptação Imediata
            </div>
            <h2 className="text-lg font-black text-white">Aparelho Ocupado?</h2>
            <p className="text-xs text-zinc-400">
              Substitutos biomecânicos para <strong className="text-zinc-200">{exercise.name}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
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
            substitutes.map((sub, idx) => (
              <motion.button
                key={sub.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic(12);
                  onSelectSubstitute(exercise, sub);
                }}
                className="w-full p-4 rounded-2xl bg-zinc-800/70 border border-white/10 hover:border-sky-400/50 hover:bg-zinc-800 transition-all text-left flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-700/80 text-zinc-300">
                      {sub.equipment}
                    </span>
                    <span className="text-[11px] text-sky-400 font-semibold truncate">
                      {sub.porcao || sub.target}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                    {sub.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    Mesmo vetor de força • Séries preservadas
                  </p>
                </div>

                <div className="shrink-0 w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <Check className="w-4 h-4" />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Rodapé com Dica Biomecânica */}
        <div className="p-4 border-t border-white/10 bg-zinc-950/60 text-center text-[11px] text-zinc-500">
          O AB Coach mantém o mesmo volume de séries e ativação neuromuscular do teu treino.
        </div>
      </motion.div>
    </div>
  );
}
