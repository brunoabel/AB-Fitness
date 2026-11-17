import React, { useState } from 'react';
import { Search, ChevronRight, AlertTriangle, ClipboardPlus, ArrowUpDown, UserPlus } from 'lucide-react';
import { SkeletonList } from '../ui/Skeleton';
import WeekStrip from './WeekStrip';
import { isAlert, alertReason } from './RedFlagList';
import { triggerHaptic } from '../../utils/audio';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoje' },
  { id: 'alert', label: 'Alerta' }
];

const SORT_MODES = [
  { id: 'priority', label: 'Urgência' },
  { id: 'recent', label: 'Recentes' },
  { id: 'adherence', label: 'Aderência' },
  { id: 'name', label: 'A-Z' }
];

const isSameDay = (iso) => {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
};

const timeAgo = (iso) => {
  if (!iso) return 'Sem sessões';
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return 'Agora há pouco';
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
};

const alertWeight = (ath) => {
  if (ath.last_pain_flag) return 3;
  if (Number(ath.last_actual_rpe) >= 9.5) return 2;
  if (isAlert(ath)) return 1;
  return 0;
};

/**
 * Coluna de roster em fluxo editorial OLED sem caixas: ordenação por urgência clínica,
 * telemetria tabular (sem font-mono) e prescrição rápida com alvo de toque seguro.
 */
export default function RosterPanel({
  roster, loading, selectedAthleteId, onSelect, onQuickAssign, onOpenInvite,
  search, onSearchChange, filter, onFilterChange
}) {
  const [sortBy, setSortBy] = useState('priority');
  const alerts = roster.filter(isAlert);
  const allTags = Array.from(new Set(roster.flatMap((a) => a.tags || []))).sort();
  const isTagFilter = filter.startsWith('tag:');

  const filtered = roster
    .filter((ath) => {
      if (search && !(ath.full_name || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filter === 'today') return isSameDay(ath.last_session_at);
      if (filter === 'alert') return isAlert(ath);
      if (isTagFilter) return (ath.tags || []).includes(filter.slice(4));
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const diffAlert = alertWeight(b) - alertWeight(a);
        if (diffAlert !== 0) return diffAlert;
        const ta = a.last_session_at ? new Date(a.last_session_at).getTime() : 0;
        const tb = b.last_session_at ? new Date(b.last_session_at).getTime() : 0;
        return ta - tb;
      }
      if (sortBy === 'recent') {
        const ta = a.last_session_at ? new Date(a.last_session_at).getTime() : 0;
        const tb = b.last_session_at ? new Date(b.last_session_at).getTime() : 0;
        return tb - ta;
      }
      if (sortBy === 'adherence') {
        return (b.workouts_7d || 0) - (a.workouts_7d || 0);
      }
      return (a.full_name || '').localeCompare(b.full_name || '', 'pt');
    });

  const cycleSort = () => {
    triggerHaptic(8);
    const idx = SORT_MODES.findIndex((m) => m.id === sortBy);
    setSortBy(SORT_MODES[(idx + 1) % SORT_MODES.length].id);
  };

  const currentSortLabel = SORT_MODES.find((m) => m.id === sortBy)?.label || 'Urgência';

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 sm:px-5 pt-3 pb-3 space-y-2.5 border-b border-white/[0.08]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { triggerHaptic(8); onFilterChange(f.id); }}
                className={`shrink-0 min-h-[34px] px-3 rounded-full text-[12px] font-semibold tabular-nums cursor-pointer transition-colors ${
                  filter === f.id
                    ? 'bg-primary text-app'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300'
                }`}
              >
                {f.label}{f.id === 'alert' && alerts.length > 0 ? ` (${alerts.length})` : ''}
              </button>
            ))}
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { triggerHaptic(8); onFilterChange(filter === `tag:${tag}` ? 'all' : `tag:${tag}`); }}
                className={`shrink-0 min-h-[34px] px-3 rounded-full text-[12px] font-semibold cursor-pointer transition-colors ${
                  filter === `tag:${tag}`
                    ? 'bg-primary text-app'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={cycleSort}
            title="Alternar ordenação da lista"
            className="shrink-0 min-h-[34px] px-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-semibold text-zinc-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
            <span>{currentSortLabel}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar atleta..."
            className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-accent-hover transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
        {loading ? (
          <div className="p-4"><SkeletonList rows={4} label="A carregar atletas" /></div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center space-y-3">
            <p className="text-[14px] font-medium text-zinc-300">
              {roster.length === 0 ? 'Ainda sem atletas vinculados.' : 'Nenhum atleta para este filtro.'}
            </p>
            {roster.length === 0 && onOpenInvite && (
              <>
                <p className="text-[12px] text-zinc-500 max-w-xs mx-auto">
                  Partilha o teu código de 6 dígitos para acompanhar cargas, aderência e prescrever treinos.
                </p>
                <button
                  type="button"
                  onClick={() => { triggerHaptic(10); onOpenInvite(); }}
                  className="mt-1 min-h-[44px] px-4 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" strokeWidth={2} />
                  Convidar primeiro atleta
                </button>
              </>
            )}
          </div>
        ) : (
          filtered.map((ath) => {
            const initials = (ath.full_name || 'A').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const selected = ath.athlete_id === selectedAthleteId;
            const reason = alertReason(ath);
            return (
              <div
                key={ath.roster_id}
                onClick={() => onSelect(ath.athlete_id)}
                className={`group px-4 sm:px-5 py-3 cursor-pointer transition-colors ${
                  selected
                    ? 'bg-accent/15 border-l-2 border-l-white'
                    : 'border-l-2 border-l-transparent hover:bg-white/[0.025]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-white/[0.08] ring-1 ring-white/[0.14] text-white flex items-center justify-center font-heading font-bold text-[12px] shrink-0 overflow-hidden">
                    {ath.avatar_url ? (
                      <img src={ath.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[14px] font-semibold text-white truncate">{ath.full_name}</h4>
                      {reason && (
                        <AlertTriangle
                          className={`w-3.5 h-3.5 shrink-0 ${ath.last_pain_flag ? 'text-rose-400' : 'text-amber-400'}`}
                          strokeWidth={2}
                          title={reason}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 tabular-nums truncate mt-0.5">
                      <span>{timeAgo(ath.last_session_at)}</span>
                      <span aria-hidden="true" className="mx-1.5 text-zinc-600">·</span>
                      <span>{ath.workouts_7d || 0} sessões/7d</span>
                      {Number(ath.streak) > 0 && (
                        <>
                          <span aria-hidden="true" className="mx-1.5 text-zinc-600">·</span>
                          <span className="text-amber-300 font-semibold">{ath.streak}d</span>
                        </>
                      )}
                    </p>
                    {ath.tags?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {ath.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-semibold text-zinc-400">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 md:hidden" strokeWidth={1.75} />
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <WeekStrip daysTrainedThisWeek={ath.days_trained_this_week} size={15} />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); triggerHaptic(10); onQuickAssign(ath.athlete_id); }}
                    title="Prescrever treino"
                    className="min-h-[34px] px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 hover:text-white text-[11px] font-semibold cursor-pointer inline-flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <ClipboardPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Prescrever</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
