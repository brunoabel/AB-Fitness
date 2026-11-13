import React from 'react';
import { MessageSquareText, AlertTriangle } from 'lucide-react';

const timeAgo = (iso) => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `há ${days}d`;
};

const rpeStyle = (rpe) => {
  if (rpe == null) return 'bg-white/[0.04] border-white/[0.08] text-zinc-400';
  if (rpe >= 9.5) return 'bg-rose-400/15 border-rose-400/40 text-rose-400';
  if (rpe >= 8) return 'bg-amber-400/15 border-amber-400/40 text-amber-400';
  return 'bg-emerald-400/15 border-emerald-400/40 text-emerald-400';
};

/** Últimas sessões do atleta com o feedback que ele já envia hoje (RPE, dor, nota livre). */
export default function AthleteFeedback({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="p-6 rounded-xl border border-dashed border-white/[0.1] text-center text-[13px] text-zinc-400">
        Ainda sem sessões concluídas deste atleta.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <div key={s.id} className="p-3 rounded-xl bg-surface-2 border border-white/[0.08]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold text-white truncate">{s.workout_title}</p>
            <span className="text-[11px] text-zinc-500 font-mono tabular-nums shrink-0">{timeAgo(s.completed_at)}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {s.actual_rpe != null && (
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${rpeStyle(s.actual_rpe)}`}>
                RPE {s.actual_rpe}
              </span>
            )}
            {s.pain_flag && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold border bg-rose-400/15 border-rose-400/40 text-rose-400 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                Dor reportada
              </span>
            )}
            {s.assigned_program_id && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-accent/15 border border-accent-hover/40 text-white">
                Prescrito
              </span>
            )}
          </div>
          {s.athlete_feedback && (
            <p className="mt-2 text-[13px] text-zinc-300 leading-relaxed flex items-start gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" strokeWidth={1.75} />
              "{s.athlete_feedback}"
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
