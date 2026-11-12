import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, Trophy, Trash2, Play, Square } from 'lucide-react';
import {
  SET_TYPES,
  SET_TYPE_ORDER,
  e1RM,
  isTimedExercise,
  allowsAdditionalWeight,
  getDefaultDurationSeconds,
  formatDurationSeconds
} from '../utils/strengthMetrics';
import { triggerHaptic } from '../utils/audio';
import NumberField from './ui/NumberField';
import { getLocalFitnessProfile } from '../services/fitnessProfileService';
import { isBeginnerProfile } from './onboarding/profileSchema';

/**
 * SetRow — Linha de Série de Alta Ergonomia para Treino de Força e Isometria
 * 
 * - Alvos táteis amplos (≥ 56px para botão de conclusão)
 * - Suporte híbrido automático:
 *     * Exercícios clássicos: Carga (kg) e Repetições (steppers ±2,5 kg e ±1 rep)
 *     * Exercícios isométricos / temporizados (ex: Prancha, Wall Sit, Alongamentos):
 *       Duração (s) com steppers ±5s desktop / ±15s mobile, sobrecarga opcional (+kg)
 *       ou chip "Livre", e cronómetro de isometria ao vivo (1 toque).
 * - Valores fantasma (Previous Set Hints) com cópia em 1 toque
 * - Ciclo de tipos de série: Normal (N), Aquecimento (W), Drop-set (D), Falha (F)
 * - Indicador visual discreto de Novo PR em tempo real
 */
export default function SetRow({
  exerciseId,
  exercise,
  index,
  displayIndex,
  set,
  prev,
  bestHistorical1RM,
  bestHistoricalDuration,
  onChange,
  onRemove,
  canRemove = false,
  showRpe = false
}) {
  const isDone = Boolean(set.done || set.completed);
  const currentType = set.type || 'N';
  const typeConfig = SET_TYPES[currentType] || SET_TYPES.N;

  // Modo Iniciante: esconde jargão (tipo de série, 1RM estimado) que confunde quem começou agora
  const isSimpleMode = isBeginnerProfile(getLocalFitnessProfile());

  // Deteção inteligente de exercício temporizado / isométrico
  const isTimed = isTimedExercise(exercise, exerciseId);
  const allowsWeight = isTimed ? allowsAdditionalWeight(exercise, exerciseId) : true;
  const defaultDuration = isTimed ? getDefaultDurationSeconds(exercise, exerciseId) : 10;

  // Duração atual normalizada
  const currentDurationVal = set.seconds !== undefined ? set.seconds : set.reps;
  const currentDurationNum = Number(currentDurationVal) || (isDone ? defaultDuration : 0);

  // Cálculo de e1RM (para repetições) e deteção de PR
  const currentE1RM = !isTimed ? e1RM(set.weight, set.reps, set.rpe ? (10 - set.rpe) : 0) : null;
  const isPR = Boolean(
    isDone &&
    currentType !== 'W' &&
    (
      (!isTimed && currentE1RM && bestHistorical1RM && currentE1RM > bestHistorical1RM) ||
      (isTimed && currentDurationNum > 0 && bestHistoricalDuration && currentDurationNum > bestHistoricalDuration)
    )
  );

  // Cronómetro de isometria ao vivo no set row
  const [isHoldingTimer, setIsHoldingTimer] = useState(false);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(0);
  const holdIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Para o cronómetro se a série for dada como concluída
  useEffect(() => {
    if (isDone && isHoldingTimer) {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setIsHoldingTimer(false);
    }
  }, [isDone, isHoldingTimer]);

  const toggleHoldTimer = () => {
    if (isDone) return;
    if (isHoldingTimer) {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setIsHoldingTimer(false);
      triggerHaptic(15);
    } else {
      triggerHaptic(15);
      const initialSec = 0;
      setHoldTimerSeconds(initialSec);
      setIsHoldingTimer(true);
      holdIntervalRef.current = setInterval(() => {
        setHoldTimerSeconds((prevSec) => {
          const nextSec = prevSec + 1;
          onChange({ seconds: nextSec, reps: nextSec });
          return nextSec;
        });
      }, 1000);
    }
  };

  // Ciclo entre tipos de série N -> W -> D -> F
  const cycleType = () => {
    triggerHaptic(12);
    const nextIdx = (SET_TYPE_ORDER.indexOf(currentType) + 1) % SET_TYPE_ORDER.length;
    const nextType = SET_TYPE_ORDER[nextIdx];
    
    const updates = { type: nextType };
    
    // Se mudou para Drop-set (D)
    if (nextType === 'D' && prev) {
      if (isTimed) {
        const prevDur = Number(prev.seconds !== undefined ? prev.seconds : prev.reps) || defaultDuration;
        const dropDur = Math.max(10, Math.round((prevDur * 0.8) / 5) * 5);
        updates.seconds = dropDur;
        updates.reps = dropDur;
      } else if (prev.weight) {
        const dropWeight = Math.round((Number(prev.weight) * 0.8) * 2) / 2;
        updates.weight = dropWeight;
      }
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
    if (isTimed) {
      const prevDur = prev.seconds !== undefined ? prev.seconds : prev.reps;
      onChange({
        weight: allowsWeight ? (prev.weight ?? 0) : 0,
        seconds: prevDur,
        reps: prevDur
      });
    } else {
      onChange({
        weight: prev.weight,
        reps: prev.reps
      });
    }
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

    // Se o cronómetro de isometria estiver ativo, para-o ao concluir
    if (isHoldingTimer) {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
      setIsHoldingTimer(false);
    }

    if (isTimed) {
      const prevSec = prev?.seconds !== undefined ? prev?.seconds : prev?.reps;
      const rawSec = set.seconds !== undefined ? set.seconds : set.reps;
      const duration = isEmpty(rawSec) || Number(rawSec) < 1 
        ? Number(prevSec || defaultDuration) 
        : Number(rawSec);

      const finalWeight = allowsWeight
        ? (isEmpty(set.weight) ? (prev?.weight !== undefined ? Number(prev.weight) : 0) : Number(set.weight))
        : 0;

      const willBePR = currentType !== 'W' && duration && bestHistoricalDuration && duration > bestHistoricalDuration;

      if (willBePR) {
        triggerHaptic([20, 40, 20, 40, 60]);
        const rect = e.currentTarget.getBoundingClientRect();
        try {
          confetti({
            particleCount: 60,
            spread: 55,
            startVelocity: 32,
            ticks: 120,
            colors: ['#ffffff', '#ffffff', '#c9d3e6'],
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

      onChange({
        weight: finalWeight,
        seconds: duration,
        reps: duration,
        done: true,
        completed: true
      });
      return;
    }

    // Validação clássica para repetições
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
          colors: ['#ffffff', '#ffffff', '#c9d3e6'],
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

  // Steppers de Duração para isometria (±5s ou ±15s)
  const adjustDuration = (delta) => {
    if (isDone) return;
    triggerHaptic(8);
    const rawVal = set.seconds !== undefined ? set.seconds : set.reps;
    const curr = Number(rawVal) || (Number(prev?.seconds ?? prev?.reps) || defaultDuration);
    const nextVal = Math.max(5, curr + delta);
    onChange({ seconds: nextVal, reps: nextVal });
  };

  // Texto formatado para o hint anterior
  const prevHintLabel = prev
    ? (isTimed
        ? `${formatDurationSeconds(prev.seconds ?? prev.reps)}${allowsWeight && Number(prev.weight) > 0 ? ` +${prev.weight}kg` : ''}`
        : `${prev.weight}×${prev.reps}`)
    : '—';

  return (
    <div 
      className={`rounded-xl border transition-all duration-150 p-2 sm:p-2.5 ${
        isDone 
          ? 'bg-accent/[0.07] border-accent-hover shadow-xs' 
          : 'bg-surface border-white/10'
      }`}
    >
      <div className="grid grid-cols-[2.5rem_1fr_1fr_3.5rem] sm:grid-cols-[2.75rem_4rem_1fr_1fr_3.5rem] items-center gap-1.5 sm:gap-2 min-h-[56px]">
        {/* 1. Tipo / Número de Série — ciclo N/Aquecimento/Drop-set/Falha só no modo avançado */}
        <div className="flex flex-col items-center justify-center">
          {isSimpleMode ? (
            <span className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs tabular-nums border border-white/[0.08] text-zinc-400">
              {displayIndex}
            </span>
          ) : (
            <button
              type="button"
              onClick={cycleType}
              disabled={isDone}
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs tabular-nums transition-transform active:scale-90 border cursor-pointer ${
                currentType === 'N'
                  ? 'bg-transparent text-zinc-400 border-white/[0.08]'
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
          )}

          <span className="text-[11px] font-semibold text-zinc-500 mt-0.5 uppercase tracking-tighter truncate max-w-full">
            {isSimpleMode ? 'Série' : (currentType === 'N' ? 'Série' : currentType === 'W' ? 'Aquec.' : currentType === 'D' ? 'Drop' : 'Falha')}
          </span>
        </div>

        {/* 2. Previous Set Hint (Valor Fantasma) */}
        <button
          type="button"
          onClick={applyPreviousValues}
          disabled={!prev || isDone}
          className={`hidden sm:flex flex-col items-center justify-center py-1 px-1 rounded-md text-center transition-colors cursor-pointer select-none ${
            prev && !isDone
              ? 'hover:bg-white/[0.08] active:scale-95 text-zinc-400' 
              : 'text-zinc-600 cursor-default'
          }`}
          title={
            prev 
              ? `Última vez: ${prevHintLabel}. Toque para copiar.` 
              : 'Sem registo anterior'
          }
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-zinc-500">
            Anterior
          </span>
          <span className="text-xs font-semibold tabular-nums text-zinc-300">
            {prevHintLabel}
          </span>
        </button>

        {/* 3. Coluna de Carga: Input de Carga (kg) para pesos normais / isometria com carga, ou chip "Livre" */}
        <div className="flex flex-col items-center justify-center">
          {isTimed && !allowsWeight ? (
            <div className="flex items-center justify-center w-full h-11 sm:h-12 rounded-lg bg-surface border border-white/[0.06] text-zinc-400 font-bold text-xs select-none">
              Livre
            </div>
          ) : (
            <>
              <div className="flex items-center w-full gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => adjustWeight(-2.5)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
                  title="-2.5 kg"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <NumberField
                    ref={weightInputRef}
                    inputMode="decimal"
                    step="0.5"
                    value={set.weight ?? ''}
                    placeholder={prev?.weight !== undefined ? String(prev.weight) : (isTimed ? '0' : 'kg')}
                    onCommit={(val) => {
                      if (invalidShake) setInvalidShake(false);
                      onChange({ weight: val });
                    }}
                    disabled={isDone}
                    invalid={invalidShake}
                    ariaLabel={`Carga: ${set.weight || 'por preencher'} kg. Mantém premido para editar.`}
                  />
                  <span className="absolute right-1.5 top-4 text-[11px] font-semibold text-zinc-500 pointer-events-none">
                    {isTimed ? '+kg' : 'kg'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustWeight(2.5)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
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
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  −2,5
                </button>
                <button
                  type="button"
                  onClick={() => adjustWeight(2.5)}
                  aria-label="Aumentar 2,5 kg"
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  +2,5
                </button>
              </div>
            </>
          )}
        </div>

        {/* 4. Coluna de Duração (s) para Isometria OU Repetições para Força */}
        <div className="flex flex-col items-center justify-center">
          {isTimed ? (
            <>
              <div className="flex items-center w-full gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => adjustDuration(-5)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
                  title="-5 segundos"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <NumberField
                    inputMode="numeric"
                    step="5"
                    value={set.seconds !== undefined ? set.seconds : (set.reps ?? '')}
                    placeholder={prev?.seconds !== undefined ? String(prev.seconds) : (prev?.reps !== undefined ? String(prev.reps) : String(defaultDuration))}
                    onCommit={(val) => onChange({ seconds: val, reps: val })}
                    disabled={isDone}
                    ariaLabel={`Duração: ${currentDurationVal || 'por preencher'} segundos. Mantém premido para editar.`}
                  />
                  <span className="absolute right-2 top-4 text-[11px] font-semibold text-zinc-500 pointer-events-none">
                    s
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => adjustDuration(5)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
                  title="+5 segundos"
                >
                  +
                </button>
              </div>

              {/* Steppers Mobile Rápidos por baixo (±15s para isometria) */}
              <div className={`${isDone ? 'hidden' : 'flex'} sm:hidden items-center w-full gap-1 mt-1`}>
                <button
                  type="button"
                  onClick={() => adjustDuration(-15)}
                  aria-label="Diminuir 15 segundos"
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  −15s
                </button>
                <button
                  type="button"
                  onClick={() => adjustDuration(15)}
                  aria-label="Aumentar 15 segundos"
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  +15s
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center w-full gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={() => adjustReps(-1)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
                  title="-1 rep"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <NumberField
                    inputMode="numeric"
                    value={set.reps ?? ''}
                    placeholder={prev?.reps !== undefined ? String(prev.reps) : 'reps'}
                    onCommit={(val) => onChange({ reps: val })}
                    disabled={isDone}
                    ariaLabel={`Repetições: ${set.reps || 'por preencher'}. Mantém premido para editar.`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => adjustReps(1)}
                  disabled={isDone}
                  className="hidden sm:flex w-7 h-10 items-center justify-center rounded text-zinc-500 hover:text-white text-base font-bold active:scale-90 transition-transform cursor-pointer disabled:opacity-20"
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
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  −1
                </button>
                <button
                  type="button"
                  onClick={() => adjustReps(1)}
                  aria-label="Aumentar 1 repetição"
                  className="flex-1 h-11 rounded-lg text-xs font-bold tabular-nums text-zinc-400 active:scale-95 active:text-white transition-transform select-none touch-manipulation"
                >
                  +1
                </button>
              </div>
            </>
          )}
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
                ? 'bg-accent text-white border-accent shadow-sm font-black'
                : 'bg-primary text-app border-primary hover:bg-primary-hover shadow-sm'
            }`}
          >
            <Check className={`w-6 h-6 ${isDone ? 'stroke-[3.5]' : 'stroke-[2.2]'}`} />
          </button>
        </div>
      </div>

      {/* Barra Inferior com PR / Métrica e Ações da Série */}
      <div className="flex items-center justify-between mt-1 px-1 pt-1 border-t border-white/[0.06] text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Anterior (mobile): copia valores da última sessão */}
          {prev && !isDone && (
            <button
              type="button"
              onClick={applyPreviousValues}
              className="sm:hidden flex items-center gap-1 min-h-[44px] px-2 -ml-1 rounded-md text-zinc-400 active:bg-white/[0.04] tabular-nums select-none touch-manipulation"
              aria-label={`Copiar última vez: ${prevHintLabel}`}
            >
              <span className="uppercase tracking-wider font-semibold">Ant.</span>
              <strong className="text-zinc-200 font-semibold">{prevHintLabel}</strong>
            </button>
          )}

          {/* Badge de Novo PR */}
          {isPR && (
            <span className="flex items-center gap-1 font-bold text-white bg-accent/70 px-1.5 py-0.5 rounded border border-accent-hover uppercase tracking-wider motion-safe:animate-[pulse_1s_ease-in-out_3]">
              <Trophy className="w-3 h-3 stroke-[2.5]" />
              <span>Novo PR</span>
            </span>
          )}

          {/* Exibição de Métrica: e1RM para repetições OU Cronómetro / Duração para isometria */}
          {isTimed ? (
            <div className="flex items-center gap-2">
              {!isDone && (
                <button
                  type="button"
                  onClick={toggleHoldTimer}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none active:scale-95 ${
                    isHoldingTimer
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title={isHoldingTimer ? "Parar cronómetro de isometria" : "Iniciar cronómetro de isometria ao vivo"}
                >
                  {isHoldingTimer ? (
                    <>
                      <Square className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span className="tabular-nums font-mono">{holdTimerSeconds}s</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2.5 h-2.5 fill-zinc-300 text-zinc-300" />
                      <span>Cronometrar</span>
                    </>
                  )}
                </button>
              )}
              <span className="text-zinc-400 font-medium tabular-nums">
                Duração: <strong className="text-zinc-200 font-semibold">{formatDurationSeconds(currentDurationVal || defaultDuration)}</strong>
              </span>
            </div>
          ) : (
            currentE1RM && !isSimpleMode && (
              <span className="text-zinc-400 font-medium tabular-nums">
                1RM est.: <strong className="text-zinc-200 font-semibold">{currentE1RM} kg</strong>
              </span>
            )
          )}
        </div>

        {/* Ação de Eliminar se aplicável */}
        {canRemove && !isDone && (
          <button
            type="button"
            onClick={onRemove}
            className="text-zinc-500 hover:text-red-400 p-1 flex items-center gap-1 transition-colors cursor-pointer"
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
