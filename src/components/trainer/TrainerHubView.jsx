import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, CalendarCheck, TrendingUp, RefreshCw, Ticket } from 'lucide-react';
import { useAuth } from '../../context';
import { getRosterOverview, archiveRosterLink, listAssignedProgramsForAthlete } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';
import InviteCodeSheet from './InviteCodeSheet';
import RosterPanel from './RosterPanel';
import RedFlagList, { isAlert } from './RedFlagList';
import AthleteWorkspace from './AthleteWorkspace';
import ProgramBuilderSheet from './ProgramBuilderSheet';

const isSameDay = (iso) => iso && new Date(iso).toDateString() === new Date().toDateString();

/**
 * Command Center do Trainer Hub — "operations-console": scan rápido de muitos atletas, não
 * feed de cards. Master-detail em telas largas (roster fixo à esquerda, ficha do atleta ao
 * lado); no mobile a seleção empurra para uma tela cheia (mesmos componentes, layout responsivo).
 */
export default function TrainerHubView({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roster, setRoster] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [invitingOpen, setInvitingOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [quickAssign, setQuickAssign] = useState(null); // { athleteId, lastProgram }

  const load = async () => {
    const { data } = await getRosterOverview();
    setRoster(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const activeToday = roster.filter((a) => isSameDay(a.last_session_at)).length;
  const avgAdherence = roster.length
    ? Math.round((roster.reduce((acc, a) => acc + Math.min(1, (a.workouts_7d || 0) / 4), 0) / roster.length) * 100)
    : 0;
  const alerts = roster.filter(isAlert);

  const handleQuickArchive = async (athleteId) => {
    await archiveRosterLink(user?.id, athleteId);
    if (selectedAthleteId === athleteId) setSelectedAthleteId(null);
    load();
  };

  const handleQuickAssign = async (athleteId) => {
    const { data } = await listAssignedProgramsForAthlete(athleteId);
    setQuickAssign({ athleteId, lastProgram: data?.[0] || null });
  };

  return (
    <div className="h-full lg:h-screen bg-app text-zinc-100 flex flex-col overflow-hidden">
      <header className="shrink-0 w-full bg-surface/95 backdrop-blur-md border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2.5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (selectedAthleteId) { triggerHaptic(8); setSelectedAthleteId(null); } else { onBack(); } }}
              className="w-11 h-11 rounded-xl bg-surface-2 border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center md:hidden"
              aria-label={selectedAthleteId ? 'Voltar à lista' : 'Voltar'}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={onBack}
              className="hidden md:flex w-11 h-11 rounded-xl bg-surface-2 border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 items-center justify-center"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div className={selectedAthleteId ? 'hidden md:block' : 'block'}>
              <h1 className="font-heading text-section font-semibold text-white leading-none">Trainer Hub</h1>
              <p className="text-[12px] text-zinc-400 mt-0.5">{roster.length} atletas vinculados</p>
            </div>
          </div>
          <div className={`${selectedAthleteId ? 'hidden md:flex' : 'flex'} items-center gap-2`}>
            <button
              onClick={() => { triggerHaptic(10); setInvitingOpen(true); }}
              className="min-h-[44px] px-3.5 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4" strokeWidth={2} />
              Convidar
            </button>
            <button
              onClick={() => { setRefreshing(true); triggerHaptic(10); load(); }}
              disabled={refreshing}
              className="w-11 h-11 rounded-xl bg-surface-2 border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center disabled:opacity-50"
              aria-label="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className={`${selectedAthleteId ? 'hidden md:grid' : 'grid'} max-w-6xl mx-auto px-4 sm:px-6 pb-3 grid-cols-3 gap-2.5`}>
          <div className="p-2.5 rounded-lg bg-surface-2 border border-white/[0.08]">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
              <Users className="w-3 h-3" strokeWidth={1.75} />
              <span>Atletas</span>
            </div>
            <div className="text-[17px] font-bold font-mono tabular-nums text-white">{roster.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-2 border border-white/[0.08]">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
              <CalendarCheck className="w-3 h-3" strokeWidth={1.75} />
              <span>Hoje</span>
            </div>
            <div className="text-[17px] font-bold font-mono tabular-nums text-white">{activeToday}/{roster.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-2 border border-white/[0.08]">
            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
              <TrendingUp className="w-3 h-3" strokeWidth={1.75} />
              <span>Aderência</span>
            </div>
            <div className="text-[17px] font-bold font-mono tabular-nums text-white">{avgAdherence}%</div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className={`${selectedAthleteId ? 'hidden md:block' : 'block'} max-w-6xl mx-auto px-4 sm:px-6 pb-3`}>
            <RedFlagList athletes={alerts} onSelect={setSelectedAthleteId} />
          </div>
        )}
      </header>

      {/* Mobile (< md): roster OU ficha do atleta, tela cheia. Desktop (≥ md): master-detail lado a lado. */}
      <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full md:grid md:grid-cols-[360px_1fr] md:divide-x md:divide-white/[0.08]">
        <div className={`${selectedAthleteId ? 'hidden md:block' : 'block'} h-full min-h-0`}>
          <RosterPanel
            roster={roster}
            loading={loading}
            selectedAthleteId={selectedAthleteId}
            onSelect={setSelectedAthleteId}
            onQuickAssign={handleQuickAssign}
            onQuickArchive={handleQuickArchive}
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        <div className={`${selectedAthleteId ? 'block' : 'hidden md:block'} h-full min-h-0`}>
          {selectedAthleteId ? (
            <AthleteWorkspace
              key={selectedAthleteId}
              athleteId={selectedAthleteId}
              embedded
              tags={roster.find((a) => a.athlete_id === selectedAthleteId)?.tags || []}
              onTagsChanged={load}
              onBack={() => setSelectedAthleteId(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center">
              <p className="text-[13px] text-zinc-500">Seleciona um atleta à esquerda para ver a ficha.</p>
            </div>
          )}
        </div>
      </div>

      {invitingOpen && (
        <InviteCodeSheet trainerId={user?.id} onClose={() => setInvitingOpen(false)} />
      )}

      {quickAssign && (
        <ProgramBuilderSheet
          trainerId={user?.id}
          athleteId={quickAssign.athleteId}
          lastProgram={quickAssign.lastProgram}
          onClose={() => setQuickAssign(null)}
          onSaved={() => setQuickAssign(null)}
        />
      )}
    </div>
  );
}
