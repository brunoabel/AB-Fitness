import React from 'react';
import { AlertTriangle } from 'lucide-react';

const isStale = (iso, days = 4) => !iso || Date.now() - new Date(iso).getTime() > days * 86400000;

export const alertReason = (ath) => {
  if (ath.last_pain_flag) return 'Dor reportada';
  if (Number(ath.last_actual_rpe) >= 9.5) return `RPE ${ath.last_actual_rpe}`;
  if (isStale(ath.last_session_at)) return 'Sem treinar há dias';
  return null;
};

export const isAlert = (ath) => Boolean(alertReason(ath));

/** Red Flag Radar acionável: cada linha diz o motivo específico e leva direto ao atleta. */
export default function RedFlagList({ athletes, onSelect }) {
  if (!athletes.length) return null;
  return (
    <div className="rounded-xl bg-[#FF968A]/10 border border-[#FF968A]/40 overflow-hidden">
      <div className="px-3.5 pt-3 pb-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#FF968A]" strokeWidth={1.75} />
        <span className="text-micro uppercase tracking-wider text-[#FF968A]">
          {athletes.length} {athletes.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </div>
      <div className="divide-y divide-[#FF968A]/15">
        {athletes.slice(0, 5).map((ath) => (
          <button
            key={ath.roster_id}
            type="button"
            onClick={() => onSelect(ath.athlete_id)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-[#FF968A]/10 transition-colors"
          >
            <span className="text-[13px] font-semibold text-white truncate">{ath.full_name}</span>
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-[#FF968A]/15 text-[#FF968A] text-[11px] font-bold uppercase tracking-wide">
              {alertReason(ath)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
