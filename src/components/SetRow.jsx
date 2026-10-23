import React, { useState, useRef } from 'react';
import { Check, Flame, Trophy, Trash2 } from 'lucide-react';
import { SET_TYPES, SET_TYPE_ORDER, e1RM } from '../utils/strengthMetrics';
import { triggerHaptic } from '../utils/audio';

/**
 * SetRow — Linha de Série de Alta Ergonomia para Treino de Força
 * 
 * - Alvos táteis amplos (≥ 56px para botão de conclusão)
 * - Steppers rápidos (±2,5 kg e ±1 rep)
 * - Valores fantasma (Previous Set Hints) com cópia em 1 toque
 * - Ciclo de tipos de série: Normal (N), Aquecimento (W), Drop-set (D), Falha (F)
 * - Indicador visual discreto de Novo PR em tempo real
 */
export default function SetRow({
  exerciseId,
  index,
  displayIndex,
  set,
  prev,
  bestHistorical1RM,
  onChange,
  onRemove,
  canRemove = false,
  showRpe = false
}) {
  const isDone = Boolean(set.done || set.completed);
  const currentType = set.type || 'N';
  const typeConfig = SET_TYPES[currentType] || SET_TYPES.N;

  // Cálculo de e1RM atual e deteção de PR
  const currentE1RM = e1RM(set.weight, set.reps, set.rpe ? (10 - set.rpe) : 0);
  const isPR = Boolean(
    isDone && 
    currentType !== 'W' && 
    currentE1RM && 
    bestHistorical1RM && 
    currentE1RM > bestHistorical1RM
  );

  // Ciclo entre tipos de série N -> W -> D -> F
  const cycleType = () => {
    triggerHaptic(12);
    const nextIdx = (SET_TYPE_ORDER.indexOf(currentType) + 1) % SET_TYPE_ORDER.length;
    const nextType = SET_TYPE_ORDER[nextIdx];
    
    const updates = { type: nextType };
    
    // Se mudou para Drop-set (D), pré-preenche 80% do peso anterior arredondado a 0.5kg
    if (nextType === 'D' && prev?.weight) {
      const dropWeight = Math.round((Number(prev.weight) * 0.8) * 2) / 2;
      updates.weight = dropWeight;
    }

    // Se mudou para Falha (F), RIR é 0 (RPE 10)
    if (nextType === 'F') {
      updates.rpe = 10;
    }

    onChange(updates);
  };

  // Copia os valores anteriores para a série com toque rápido no hint
  const applyPreviousValues = () => {
    if (!prev || isDone) return;
    triggerHaptic(15);
    onChange({
      weight: prev.weight,
      reps: prev.reps
    });
  };

  // Steppers de Carga (±2.5 kg)
  const adjustWeight = (delta) => {
    if (isDone) return;
    triggerHaptic(8);
    const curr = Number(set.weight) || (Number(prev?.weight) || 0);
    const nextVal = Math.max(0, +(curr + delta).toFixed(1));
    onChange({ weight: nextVal });
  };

  // Steppers de Repetições (±1 rep)
  const adjustReps = (delta) => {
    if (isDone) return;
    triggerHaptic(8);
    const curr = Number(set.reps) || (Number(prev?.reps) || 0);
    const nextVal = Math.max(1, curr + delta);
    onChange({ reps: nextVal });
  };

  return (
    <div 
      className={`rounded-xl border transition-all duration-150 p-2 sm:p-2.5 ${
        isDone 
          ? 'bg-lime-400/10 dark:bg-lime-400/[0.08] border-lime-400/40 dark:border-lime-400/30 shadow-xs' 
          : 'bg-zinc-50 dark:bg-[#111114] border-zinc-200 dark:border-white/[0.08]'
      }`}
    >
      <div className="grid grid-cols-[2.75rem_4rem_1fr_1fr_3.5rem] items-center gap-1.5 sm:gap-2 min-h-[56px]">
        {/* 1. Tipo / Número de Série */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={cycleType}
            disabled={isDone}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs tabular-nums transition-transform active:scale-90 border cursor-pointer ${
              currentType === 'N'
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                : currentType === 'W'
                  ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                  : currentType === 'D'
                    ? 'bg-sky-400/15 text-sky-400 border-sky-400/30'
                    : 'bg-red-400/15 text-red-400 border-red-400/30'
            }`}
            title={`Tipo: ${typeConfig.title}. Toque para alternar (Normal, Aquecimento, Drop-set, Falha)`}
          >
            {typeConfig.label || displayIndex}
          </button>
          
          <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-tighter truncate max-w-full">
            {currentType === 'N' ? 'Série' : currentType === 'W' ? 'Aquec.' : currentType === 'D' ? 'Drop' : 'Falha'}
          </span>
        </div>

        {/* 2. Previous Set Hint (Valor Fantasma) */}
        <button
          type="button"
          onClick={applyPreviousValues}
          disabled={!prev || isDone}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-md text-center transition-colors cursor-pointer select-none ${
            prev && !isDone
              ? 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 active:scale-95 text-zinc-500 dark:text-zinc-400' 
              : 'text-zinc-400/60 dark:text-zinc-600 cursor-default'
          }`}
          title={prev ? `Última vez: ${prev.weight}kg × ${prev.reps} reps. Toque para copiar.` : 'Sem registo anterior'}
        >
          <span className="text-[9px] font-semibold uppercase tracking-wider block text-zinc-400 dark:text-zinc-500">
            Anterior
          </span>
          <span className="text-xs font-semibold tabular-nums text-zinc-600 dark:text-zinc-300">
            {prev ? `${prev.weight}×${prev.reps}` : '—'}
          </span>
        </button>

        {/* 3. Input de Carga (kg) com Steppers ±2.5 kg */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center w-full gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => adjustWeight(-2.5)}
              disabled={isDone}
              className="hidden sm:flex w-7 h-10 items-center justify-center rounded bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 text-xs font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-30"
              title="-2.5 kg"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={set.weight ?? ''}
                placeholder={prev?.weight !== undefined ? String(prev.weight) : 'kg'}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onChange({ weight: e.target.value })}
                disabled={isDone}
                className={`w-full h-11 sm:h-12 rounded-lg text-center font-black text-base tabular-nums border transition-all ${
                  isDone
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 dark:text-zinc-400'
                    : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus:border-[#c6f432] focus:ring-1 focus:ring-[#c6f432]'
                }`}
              />
              <span className="absolute right-1.5 top-3.5 text-[10px] font-semibold text-zinc-400 pointer-events-none">
                kg
              </span>
            </div>
            <button
              type="button"
              onClick={() => adjustWeight(2.5)}
              disabled={isDone}
              className="hidden sm:flex w-7 h-10 items-center justify-center rounded bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 text-xs font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-30"
              title="+2.5 kg"
            >
              +
            </button>
          </div>

          {/* Steppers Mobile Rápidos por baixo */}
          <div className="flex sm:hidden items-center justify-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => adjustWeight(-2.5)}
              disabled={isDone}
              className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 px-1 rounded bg-zinc-200/50 dark:bg-zinc-800/60 active:scale-90"
            >
              -2.5
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(2.5)}
              disabled={isDone}
              className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 px-1 rounded bg-zinc-200/50 dark:bg-zinc-800/60 active:scale-90"
            >
              +2.5
            </button>
          </div>
        </div>

        {/* 4. Input de Repetições com Steppers ±1 rep */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center w-full gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={isDone}
              className="hidden sm:flex w-7 h-10 items-center justify-center rounded bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 text-xs font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-30"
              title="-1 rep"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ''}
                placeholder={prev?.reps !== undefined ? String(prev.reps) : 'reps'}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onChange({ reps: e.target.value })}
                disabled={isDone}
                className={`w-full h-11 sm:h-12 rounded-lg text-center font-black text-base tabular-nums border transition-all ${
                  isDone
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 dark:text-zinc-400'
                    : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus:border-[#c6f432] focus:ring-1 focus:ring-[#c6f432]'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={isDone}
              className="hidden sm:flex w-7 h-10 items-center justify-center rounded bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 text-xs font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-30"
              title="+1 rep"
            >
              +
            </button>
          </div>

          {/* Steppers Mobile Rápidos por baixo */}
          <div className="flex sm:hidden items-center justify-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              disabled={isDone}
              className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 px-1 rounded bg-zinc-200/50 dark:bg-zinc-800/60 active:scale-90"
            >
              -1
            </button>
            <button
              type="button"
              onClick={() => adjustReps(1)}
              disabled={isDone}
              className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 px-1 rounded bg-zinc-200/50 dark:bg-zinc-800/60 active:scale-90"
            >
              +1
            </button>
          </div>
        </div>

        {/* 5. Botão Ergonómico de Conclusão (Alvo Tátil ≥ 56px) */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(isDone ? 10 : 25);
              onChange({ done: !isDone, completed: !isDone });
            }}
            data-on={isDone}
            aria-label={isDone ? 'Desmarcar série' : 'Concluir série e iniciar descanso'}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border select-none ${
              isDone
                ? 'bg-[#c6f432] text-zinc-950 border-[#c6f432] shadow-sm font-black'
                : 'bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <Check className={`w-6 h-6 ${isDone ? 'stroke-[3.5]' : 'stroke-[2.2]'}`} />
          </button>
        </div>
      </div>

      {/* Barra Inferior com PR / 1RM e Ações da Série */}
      <div className="flex items-center justify-between mt-1 px-1 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/60 text-[10px]">
        <div className="flex items-center gap-2">
          {/* Badge de Novo PR */}
          {isPR && (
            <span className="flex items-center gap-1 font-bold text-[#c6f432] bg-[#c6f432]/15 px-1.5 py-0.5 rounded border border-[#c6f432]/30 uppercase tracking-wider animate-pulse">
              <Trophy className="w-3 h-3 stroke-[2.5]" />
              <span>Novo PR</span>
            </span>
          )}

          {/* e1RM Estimado */}
          {currentE1RM && (
            <span className="text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
              1RM est.: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{currentE1RM} kg</strong>
            </span>
          )}
        </div>

        {/* Ação de Eliminar se aplicável */}
        {canRemove && !isDone && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 p-1 flex items-center gap-1 transition-colors cursor-pointer"
            title="Eliminar série"
          >
            <Trash2 className="w-3 h-3 stroke-[1.8]" />
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
}
