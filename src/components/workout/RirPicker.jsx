import React from 'react';
import { triggerHaptic } from '../../utils/audio';

const OPTIONS = [0, 1, 2, 3, 4];

/** RIR (reps em reserva) a partir do RPE guardado na série: RPE 10 = 0 reps em reserva. */
export const rirFromSet = (set) => (set?.rpe !== null && set?.rpe !== undefined && set?.rpe !== '' ? Math.max(0, Math.min(4, 10 - Number(set.rpe))) : null);

/** Guardado como RPE (10 - RIR) para manter o formato do histórico e da coluna `rpe` de exercise_logs; 4+ fica RPE 6. */
export const rpeFromRir = (rir) => 10 - Math.min(4, Number(rir));

/**
 * Registo de esforço de uma série concluída: quantas repetições ainda conseguia fazer.
 * Alimenta a progressão (dupla progressão com RIR). Sem resposta, a progressão não assume nenhum valor.
 */
export default function RirPicker({ value = null, target = null, label = 'Quantas reps mais conseguias fazer?', onChange, compact = false }) {
  return (
    <div className={compact ? 'flex items-center gap-2 flex-wrap' : 'space-y-2'}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold text-zinc-400`}>{label}</span>
        {!compact && Number.isFinite(target) && <span className="text-[11px] text-zinc-500 tabular-nums">Alvo: {target}</span>}
      </div>
      <div role="radiogroup" aria-label={label} className="flex gap-1.5">
        {OPTIONS.map((rir) => {
          const selected = value === rir;
          const isTarget = Number.isFinite(target) && Math.min(4, target) === rir;
          return (
            <button
              key={rir}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic(10);
                onChange?.(rir);
              }}
              className={`${compact ? 'h-8 min-w-[36px] text-xs' : 'h-10 min-w-[44px] text-sm'} px-2 rounded-lg border font-display font-semibold tabular-nums transition-colors active:scale-95 cursor-pointer ${
                selected
                  ? 'bg-accent/70 text-white border-accent-hover'
                  : isTarget
                    ? 'bg-surface-2 text-zinc-200 border-white/25'
                    : 'bg-surface-2 text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {rir === 4 ? '4+' : rir}
            </button>
          );
        })}
      </div>
    </div>
  );
}
