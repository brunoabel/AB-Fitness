import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const isStale = (iso, days = 4) => !iso || Date.now() - new Date(iso).getTime() > days * 86400000;

export const alertDetails = (ath) => {
  if (ath.last_pain_flag) {
    return { label: 'Dor reportada', barClass: 'bg-rose-400', textClass: 'text-rose-400' };
  }
  if (Number(ath.acwr_ratio) > 1.5 || Number(ath.workouts_7d) >= 7) {
    return {
      label: Number(ath.acwr_ratio) > 1.5 ? `ACWR ${Number(ath.acwr_ratio).toFixed(2)}×` : `${ath.workouts_7d} treinos/7d (pico)`,
      barClass: 'bg-amber-400',
      textClass: 'text-amber-300'
    };
  }
  if (Number(ath.last_actual_rpe) >= 9.5) {
    return { label: `RPE ${ath.last_actual_rpe}`, barClass: 'bg-accent-hover', textClass: 'text-white' };
  }
  if (isStale(ath.last_session_at)) {
    return { label: 'Sem treinar há +4d', barClass: 'bg-zinc-500', textClass: 'text-zinc-400' };
  }
  return null;
};

export const alertReason = (ath) => alertDetails(ath)?.label || null;

export const isAlert = (ath) => Boolean(alertDetails(ath));

/** Faixa clínica editorial (sem caixa colorida): indicador vertical de severidade + acesso direto ao atleta. */
export default function RedFlagList({ athletes, onSelect }) {
  if (!athletes.length) return null;
  return (
    <div className="border-t border-white/[0.06] pt-2.5">
      <div className="flex items-center justify-between pb-1.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-400 tabular-nums">
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.75} />
          {athletes.length} {athletes.length === 1 ? 'atenção prioritária' : 'atenções prioritárias'}
        </span>
      </div>
      <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
        {athletes.slice(0, 5).map((ath) => {
          const info = alertDetails(ath);
          return (
            <button
              key={ath.roster_id}
              type="button"
              onClick={() => onSelect(ath.athlete_id)}
              className="group w-full min-h-[44px] py-2 pl-3 pr-1 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-white/[0.03] transition-colors relative"
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${info?.barClass || 'bg-rose-400'}`}
              />
              <span className="text-[13px] font-semibold text-white truncate">{ath.full_name}</span>
              <span className="shrink-0 inline-flex items-center gap-1.5">
                <span className={`text-[12px] font-semibold tabular-nums ${info?.textClass || 'text-rose-400'}`}>
                  {info?.label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" strokeWidth={1.75} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
