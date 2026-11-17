import React from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { REST_OPTIONS } from './options';

/** Item editável de exercício dentro do construtor de treino personalizado. */
export default function CustomExerciseRow({
  exercise,
  index,
  total,
  onMove,
  onRemove,
  onUpdate
}) {
  return (
    <div className="p-3.5 rounded-xl bg-surface border border-white/10 space-y-3">
      {/* Topo do Exercício com Nome e Ações de Ordenação */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-white/[0.04] text-zinc-300 text-xs font-display tabular-nums font-bold flex items-center justify-center border border-white/[0.08] shrink-0">
            {index + 1}
          </span>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">
              {exercise.name}
            </h4>
            <span className="text-[11px] text-zinc-400 font-medium">
              {exercise.target} · {exercise.equipment}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="tap-44 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] flex items-center justify-center disabled:opacity-30 cursor-pointer"
            title="Mover para cima"
            aria-label="Mover para cima"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="tap-44 w-8 h-8 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] flex items-center justify-center disabled:opacity-30 cursor-pointer"
            title="Mover para baixo"
            aria-label="Mover para baixo"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="tap-44 w-8 h-8 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
            title="Eliminar"
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Matriz Inline: Séries, Reps, Carga e Descanso */}
      <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-y border-white/[0.06] py-2 text-center">
        <div className="px-1.5">
          <span className="text-[11px] font-medium text-zinc-500 block mb-1">Séries</span>
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => onUpdate(index, 'defaultSets', Math.max(1, (exercise.defaultSets || 3) - 1))}
              className="tap-44 w-6 h-6 rounded-md bg-white/[0.04] text-xs font-bold text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 border border-white/[0.08]"
            >
              -
            </button>
            <span className="text-xs font-display tabular-nums font-bold text-white w-4">
              {exercise.defaultSets || 3}
            </span>
            <button
              type="button"
              onClick={() => onUpdate(index, 'defaultSets', Math.min(8, (exercise.defaultSets || 3) + 1))}
              className="tap-44 w-6 h-6 rounded-md bg-white/[0.04] text-xs font-bold text-zinc-300 flex items-center justify-center cursor-pointer active:scale-95 border border-white/[0.08]"
            >
              +
            </button>
          </div>
        </div>

        <div className="px-1.5">
          <span className="text-[11px] font-medium text-zinc-500 block mb-1">Reps</span>
          <input
            type="text"
            value={exercise.suggestedReps || '10'}
            onChange={(e) => onUpdate(index, 'suggestedReps', e.target.value)}
            className="w-full text-center text-xs font-display tabular-nums font-bold text-white bg-transparent focus:outline-none border-b border-transparent focus:border-white/30 py-0.5"
          />
        </div>

        <div className="px-1.5">
          <span className="text-[11px] font-medium text-zinc-500 block mb-1">Carga (kg)</span>
          <input
            type="number"
            value={exercise.suggestedWeight ?? 0}
            onChange={(e) => onUpdate(index, 'suggestedWeight', Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full text-center text-xs font-display tabular-nums font-bold text-white bg-transparent focus:outline-none border-b border-transparent focus:border-white/30 py-0.5"
          />
        </div>

        <div className="px-1.5">
          <span className="text-[11px] font-medium text-zinc-500 block mb-1">Descanso</span>
          <select
            value={exercise.restTime || 60}
            onChange={(e) => onUpdate(index, 'restTime', Number(e.target.value))}
            className="w-full text-center text-xs font-display tabular-nums font-bold text-white bg-transparent focus:outline-none cursor-pointer py-0.5"
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
        value={exercise.notes || ''}
        onChange={(e) => onUpdate(index, 'notes', e.target.value)}
        placeholder="Indicação técnica (Ex: pausa 2s na base, controle excêntrico)"
        className="w-full px-1 py-1.5 bg-transparent border-b border-white/[0.08] text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
      />
    </div>
  );
}
