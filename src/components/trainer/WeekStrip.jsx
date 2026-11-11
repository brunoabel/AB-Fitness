import React from 'react';

const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/**
 * Grelha semanal de aderência (padrão "GitHub contribution graph"): 7 células Seg..Dom.
 * Nunca só cor — célula preenchida tem um ponto central + aria-label, pra não depender
 * só do heat token pra passar a informação (regra de acessibilidade de heatmap).
 */
export default function WeekStrip({ daysTrainedThisWeek = [], size = 18 }) {
  const trained = new Set((daysTrainedThisWeek || []).map(Number));
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`Treinou ${trained.size} de 7 dias esta semana`}>
      {DAY_LABELS.map((label, idx) => {
        const isoDay = idx + 1;
        const did = trained.has(isoDay);
        return (
          <span
            key={label}
            title={`${label}${did ? ' — treinou' : ''}`}
            aria-hidden="true"
            style={{ width: size, height: size }}
            className={`rounded-[4px] border flex items-center justify-center shrink-0 ${
              did ? 'bg-[var(--color-heat-3,#F4F7FF)] border-white/[0.15]' : 'bg-[var(--color-heat-0,#121C33)] border-white/[0.06]'
            }`}
          >
            {did && <span className="w-[5px] h-[5px] rounded-full bg-app" />}
          </span>
        );
      })}
    </div>
  );
}
