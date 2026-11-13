import React from 'react';
import { Search, ChevronRight, AlertTriangle, ClipboardPlus, Archive } from 'lucide-react';
import { SkeletonList } from '../ui/Skeleton';
import WeekStrip from './WeekStrip';
import { isAlert } from './RedFlagList';
import { triggerHaptic } from '../../utils/audio';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Treinaram hoje' },
  { id: 'alert', label: 'Alerta' }
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

/**
 * Lista compacta de atletas: uma linha por atleta (sem card grande), com ação rápida
 * (atribuir/arquivar) sem precisar abrir o detalhe. Serve como coluna esquerda no
 * master-detail (telas largas) e como lista de tela cheia no mobile.
 */
export default function RosterPanel({
  roster, loading, selectedAthleteId, onSelect, onQuickAssign, onQuickArchive,
  search, onSearchChange, filter, onFilterChange
}) {
  const alerts = roster.filter(isAlert);
  const allTags = Array.from(new Set(roster.flatMap((a) => a.tags || []))).sort();
  const isTagFilter = filter.startsWith('tag:');
  const filtered = roster.filter((ath) => {
    if (search && !(ath.full_name || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'today') return isSameDay(ath.last_session_at);
    if (filter === 'alert') return isAlert(ath);
    if (isTagFilter) return (ath.tags || []).includes(filter.slice(4));
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 px-4 sm:px-5 pt-3 pb-3 space-y-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => { triggerHaptic(8); onFilterChange(f.id); }}
              className={`shrink-0 min-h-[32px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors ${filter === f.id ? 'bg-primary text-app' : 'bg-surface-2 border border-white/[0.08] text-zinc-300'}`}
            >
              {f.label}{f.id === 'alert' && alerts.length > 0 ? ` (${alerts.length})` : ''}
            </button>
          ))}
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { triggerHaptic(8); onFilterChange(filter === `tag:${tag}` ? 'all' : `tag:${tag}`); }}
              className={`shrink-0 min-h-[32px] px-3 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors ${filter === `tag:${tag}` ? 'bg-primary text-app' : 'bg-surface-2 border border-white/[0.08] text-zinc-300'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar atleta..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface-2 border border-white/[0.08] text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-accent-hover transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4"><SkeletonList rows={4} label="A carregar atletas" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-zinc-400">
            {roster.length === 0 ? 'Ainda sem atletas vinculados.' : 'Nenhum atleta para este filtro.'}
          </div>
        ) : (
          filtered.map((ath) => {
            const initials = (ath.full_name || 'A').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const selected = ath.athlete_id === selectedAthleteId;
            return (
              <div
                key={ath.roster_id}
                onClick={() => onSelect(ath.athlete_id)}
                className={`group px-4 sm:px-5 py-2.5 border-b border-white/[0.04] cursor-pointer transition-colors ${selected ? 'bg-accent/10 border-l-2 border-l-accent' : 'border-l-2 border-l-transparent hover:bg-white/[0.02]'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-white text-app flex items-center justify-center font-bold text-[11px] shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[13px] font-semibold text-white truncate">{ath.full_name}</h4>
                      {isAlert(ath) && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" strokeWidth={2} />}
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono tabular-nums">{timeAgo(ath.last_session_at)}</p>
                    {ath.tags?.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {ath.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-semibold text-zinc-400">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 md:hidden" strokeWidth={1.75} />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <WeekStrip daysTrainedThisWeek={ath.days_trained_this_week} size={14} />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); triggerHaptic(10); onQuickAssign(ath.athlete_id); }}
                      title="Atribuir treino"
                      className="w-7 h-7 rounded-lg bg-surface-3 border border-white/[0.08] text-zinc-300 hover:text-white cursor-pointer flex items-center justify-center"
                    >
                      <ClipboardPlus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); triggerHaptic(10); onQuickArchive(ath.athlete_id); }}
                      title="Arquivar vínculo"
                      className="w-7 h-7 rounded-lg bg-surface-3 border border-white/[0.08] text-zinc-400 hover:text-rose-400 cursor-pointer flex items-center justify-center"
                    >
                      <Archive className="w-3.5 h-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
