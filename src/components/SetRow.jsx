import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
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

  const weightInputRef = useRef(null);
  const [invalidShake, setInvalidShake] = useState(false);
  const isEmpty = (v) => v === '' || v === null || v === undefined || Number.isNaN(Number(v));

  // Conclusão em 1 toque: campos vazios herdam a série anterior; sem referência, bloqueia e foca
  const toggleDone = (e) => {
    if (isDone) {
      triggerHaptic(10);
      onChange({ done: false, completed: false });
      return;
    }

    const weight = isEmpty(set.weight) ? prev?.weight : set.weight;
    const reps = isEmpty(set.reps) || Number(set.reps) < 1 ? prev?.reps : set.reps;

    if (isEmpty(weight) || isEmpty(reps) || Number(reps) < 1) {
      triggerHaptic([30, 60, 30]);
      setInvalidShake(true);
      weightInputRef.current?.focus();
      return;
    }

    const finalWeight = Number(weight);
    const finalReps = Number(reps);
    const finalE1RM = e1RM(finalWeight, finalReps, set.rpe ? (10 - set.rpe) : 0);
    const willBePR = currentType !== 'W' && finalE1RM && bestHistorical1RM && finalE1RM > bestHistorical1RM;

    if (willBePR) {
      triggerHaptic([20, 40, 20, 40, 60]);
      const rect = e.currentTarget.getBoundingClientRect();
      try {
        confetti({
          particleCount: 60,
          spread: 55,
          startVelocity: 32,
          ticks: 120,
          colors: ['#00f0ff', '#ffffff', '#5cf6ff'],
          origin: {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight
          },
          disableForReducedMotion: true
        });
      } catch {}
    } else {
      triggerHaptic(25);
    }

    onChange({ weight: finalWeight, reps: finalReps, done: true, completed: true });
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
          ? 'bg-accent/[0.07] border-accent/35 shadow-xs' 
          : 'bg-zinc-50 dark:bg-surface border-zinc-200 dark:border-white/10'
      }`}
    >
      <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] sm:grid-cols-[2.75rem_4rem_1fr_1fr_3.5rem] items-center gap-1.5 sm:gap-2 min-h-[56px]">
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
                    ? 'bg-violet-400/15 text-violet-300 border-violet-400/30'
                    : 'bg-red-400/15 text-red-400 border-red-400/30'
            }`}
            title={`Tipo: ${typeConfig.title}. Toque para alternar (Normal, Aquecimento, Drop-set, Falha)`}
          >
            {typeConfig.label || displayIndex}
          </button>
          
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-tighter truncate max-w-full">
            {currentType === 'N' ? 'Série' : currentType === 'W' ? 'Aquec.' : currentType === 'D' ? 'Drop' : 'Falha'}
          </span>
        </div>

        {/* 2. Previous Set Hint (Valor Fantasma) */}
        <button
          type="button"
          onClick={applyPreviousValues}
          disabled={!prev || isDone}
          className={`hidden sm:flex flex-col items-center justify-center py-1 px-1 rounded-md text-center transition-colors cursor-pointer select-none ${
            prev && !isDone
              ? 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 active:scale-95 text-zinc-500 dark:text-zinc-400' 
              : 'text-zinc-400/60 dark:text-zinc-600 cursor-default'
          }`}
          title={prev ? `Última vez: ${prev.weight}kg × ${prev.reps} reps. Toque para copiar.` : 'Sem registo anterior'}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-zinc-400 dark:text-zinc-500">
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
                ref={weightInputRef}
                type="number"
                inputMode="decimal"
                step="0.5"
                value={set.weight ?? ''}
                placeholder={prev?.weight !== undefined ? String(prev.weight) : 'kg'}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  if (invalidShake) setInvalidShake(false);
                  onChange({ weight: e.target.value });
                }}
                disabled={isDone}
                aria-invalid={invalidShake || undefined}
                className={`w-full h-11 sm:h-12 rounded-lg text-center font-black text-base tabular-nums border transition-all ${
                  isDone
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-transparent text-zinc-500 dark:text-zinc-400'
                    : invalidShake
                      ? 'bg-white dark:bg-zinc-900 border-red-500 ring-2 ring-red-500/60 text-zinc-950 dark:text-zinc-50'
                      : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus:border-accent focus:ring-1 focus:ring-accent'
                }`}
              />
              <span className="absolute right-1.5 top-3.5 text-[11px] font-semibold text-zinc-400 pointer-events-none">
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
          <div className={`${isDone ? 'hidden' : 'flex'} sm:hidden items-center w-full gap-1 mt-1`}>
            <button
              type="button"
              onClick={() => adjustWeight(-2.5)}
              aria-label="Diminuir 2,5 kg"
              className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-200 bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/60 dark:border-white/[0.06] active:scale-95 active:bg-zinc-300 dark:active:bg-zinc-700 transition-transform select-none touch-manipulation"
            >
              −2,5
            </button>
            <button
              type="button"
              onClick={() => adjustWeight(2.5)}
              aria-label="Aumentar 2,5 kg"
              className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-200 bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/60 dark:border-white/[0.06] active:scale-95 active:bg-zinc-300 dark:active:bg-zinc-700 transition-transform select-none touch-manipulation"
            >
              +2,5
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
                    : 'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus:border-accent focus:ring-1 focus:ring-accent'
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
          <div className={`${isDone ? 'hidden' : 'flex'} sm:hidden items-center w-full gap-1 mt-1`}>
            <button
              type="button"
              onClick={() => adjustReps(-1)}
              aria-label="Diminuir 1 repetição"
              className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-200 bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/60 dark:border-white/[0.06] active:scale-95 active:bg-zinc-300 dark:active:bg-zinc-700 transition-transform select-none touch-manipulation"
            >
              −1
            </button>
            <button
              type="button"
              onClick={() => adjustReps(1)}
              aria-label="Aumentar 1 repetição"
              className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-200 bg-zinc-200/80 dark:bg-zinc-800 border border-zinc-300/60 dark:border-white/[0.06] active:scale-95 active:bg-zinc-300 dark:active:bg-zinc-700 transition-transform select-none touch-manipulation"
            >
              +1
            </button>
          </div>
        </div>

        {/* 5. Botão Ergonómico de Conclusão (Alvo Tátil ≥ 56px) */}
        <div className="flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={toggleDone}
            data-on={isDone}
            aria-label={isDone ? 'Desmarcar série' : 'Concluir série e iniciar descanso'}
            className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 border select-none ${
              isDone
                ? 'bg-accent text-zinc-950 border-accent shadow-sm font-black'
                : 'bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <Check className={`w-6 h-6 ${isDone ? 'stroke-[3.5]' : 'stroke-[2.2]'}`} />
          </button>
        </div>
      </div>

      {/* Barra Inferior com PR / 1RM e Ações da Série */}
      <div className="flex items-center justify-between mt-1 px-1 pt-1 border-t border-zinc-200/40 dark:border-zinc-800/60 text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Anterior (mobile): copia valores da última sessão */}
          {prev && !isDone && (
            <button
              type="button"
              onClick={applyPreviousValues}
              className="sm:hidden flex items-center gap-1 min-h-[44px] px-2 -ml-1 rounded-md text-zinc-500 dark:text-zinc-400 active:bg-zinc-200/60 dark:active:bg-zinc-800/80 tabular-nums select-none touch-manipulation"
              aria-label={`Copiar última vez: ${prev.weight} kg por ${prev.reps} repetições`}
            >
              <span className="uppercase tracking-wider font-semibold">Ant.</span>
              <strong className="text-zinc-700 dark:text-zinc-200 font-semibold">{prev.weight}×{prev.reps}</strong>
            </button>
          )}

          {/* Badge de Novo PR */}
          {isPR && (
            <span className="flex items-center gap-1 font-bold text-accent bg-accent/15 px-1.5 py-0.5 rounded border border-accent/30 uppercase tracking-wider motion-safe:animate-[pulse_1s_ease-in-out_3]">
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
