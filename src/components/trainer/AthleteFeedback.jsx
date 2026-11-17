import React from 'react';
import { MessageSquareText, AlertTriangle } from 'lucide-react';

const timeAgo = (iso) => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  return `há ${days}d`;
};

const rpeBadgeClass = (rpe) => {
  if (rpe == null) return 'text-zinc-400';
  if (rpe >= 9.5) return 'text-rose-400';
  if (rpe >= 8) return 'text-amber-300';
  return 'text-emerald-400';
};

const barColorClass = (s) => {
  if (s.pain_flag) return 'bg-rose-400';
  if (s.actual_rpe != null && Number(s.actual_rpe) >= 9.5) return 'bg-amber-400';
  return 'bg-white/25';
};

/** Registo linear de sessões e feedback pós-treino do atleta (sem cartões encaixotados). */
export default function AthleteFeedback({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="py-5 border-y border-white/[0.06] text-[13px] text-zinc-500">
        Ainda sem sessões concluídas por este atleta.
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
      {sessions.map((s) => {
        const mins = s.duration_seconds ? Math.max(1, Math.round(s.duration_seconds / 60)) : null;
        return (
          <div key={s.id} className="relative py-3 pl-3.5 pr-1">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${barColorClass(s)}`}
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-semibold text-white truncate">{s.workout_title}</p>
              <span className="text-[11px] text-zinc-400 tabular-nums shrink-0">{timeAgo(s.completed_at)}</span>
            </div>

            <div className="mt-1 flex items-center gap-2 flex-wrap text-[12px] tabular-nums">
              {mins && <span className="text-zinc-400">{mins} min</span>}
              {s.actual_rpe != null && (
                <span className={`font-semibold ${rpeBadgeClass(s.actual_rpe)}`}>
                  RPE {s.actual_rpe}
                </span>
              )}
              {s.pain_flag && (
                <span className="font-semibold text-rose-400 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" strokeWidth={2} />
                  Dor reportada
                </span>
              )}
              {s.assigned_program_id && (
                <span className="text-zinc-300 font-medium">Prescrito pelo PT</span>
              )}
            </div>

            {s.athlete_feedback && (
              <p className="mt-1.5 text-[13px] text-zinc-300 leading-relaxed flex items-start gap-1.5">
                <MessageSquareText className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>"{s.athlete_feedback}"</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
