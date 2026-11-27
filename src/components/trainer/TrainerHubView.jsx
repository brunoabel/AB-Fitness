import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Ticket, Layers } from 'lucide-react';
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
 * Command Center do Trainer Hub: Consola de Treinador OLED sem blocos.
 * Ledger tipográfico de alta densidade, triagem clínica e master-detail responsivo.
 */
export default function TrainerHubView({ onBack }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roster, setRoster] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [invitingOpen, setInvitingOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [quickAssign, setQuickAssign] = useState(null); // { athleteId, athleteName, lastProgram }

  const load = async () => {
    const { data } = await getRosterOverview();
    setRoster(data || []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let alive = true;
    getRosterOverview().then(({ data }) => {
      if (!alive) return;
      setRoster(data || []);
      setLoading(false);
      setRefreshing(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const activeToday = roster.filter((a) => isSameDay(a.last_session_at)).length;
  const avgAdherence = roster.length
    ? Math.round((roster.reduce((acc, a) => acc + Math.min(1, (a.workouts_7d || 0) / 4), 0) / roster.length) * 100)
    : 0;
  const alerts = roster.filter(isAlert);
  const selectedAthlete = roster.find((a) => a.athlete_id === selectedAthleteId) || null;

  const handleArchiveAthlete = async (athleteId) => {
    await archiveRosterLink(user?.id, athleteId);
    if (selectedAthleteId === athleteId) setSelectedAthleteId(null);
    load();
  };

  const handleQuickAssign = async (athleteId) => {
    const ath = roster.find((a) => a.athlete_id === athleteId);
    const { data } = await listAssignedProgramsForAthlete(athleteId);
    setQuickAssign({
      athleteId,
      athleteName: ath?.full_name || '',
      lastProgram: data?.[0] || null
    });
  };

  return (
    <div className="h-full lg:h-screen bg-app text-zinc-100 flex flex-col overflow-hidden">
      <header className="shrink-0 w-full bg-app border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-2.5 pb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (selectedAthleteId) {
                  triggerHaptic(8);
                  setSelectedAthleteId(null);
                } else {
                  onBack();
                }
              }}
              className="w-11 h-11 rounded-full bg-surface border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center md:hidden shrink-0"
              aria-label={selectedAthleteId ? 'Voltar à lista' : 'Voltar'}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={onBack}
              className="hidden md:flex w-11 h-11 rounded-full bg-surface border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 items-center justify-center shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <div className="min-w-0">
              <h1 className="font-heading text-section font-semibold text-white leading-none truncate">
                {selectedAthleteId && selectedAthlete ? (
                  <span className="md:hidden">{selectedAthlete.full_name}</span>
                ) : null}
                <span className={selectedAthleteId ? 'hidden md:inline' : 'inline'}>Trainer Hub</span>
              </h1>
              <p className="text-[12px] text-zinc-400 tabular-nums mt-0.5 truncate">
                {roster.length} {roster.length === 1 ? 'atleta vinculado' : 'atletas vinculados'}
              </p>
            </div>
          </div>

          <div className={`${selectedAthleteId ? 'hidden md:flex' : 'flex'} items-center gap-2 shrink-0`}>
            <button
              type="button"
              onClick={() => { triggerHaptic(10); setTemplatesOpen(true); }}
              className="min-h-[44px] px-4 rounded-full bg-surface hover:bg-surface-2 border border-white/[0.08] text-white font-semibold text-[13px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers className="w-4 h-4 text-zinc-300" strokeWidth={1.75} />
              <span>Modelos</span>
            </button>
            <button
              type="button"
              onClick={() => { triggerHaptic(10); setInvitingOpen(true); }}
              className="min-h-[44px] px-4 rounded-full bg-primary hover:bg-primary-hover text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Ticket className="w-4 h-4" strokeWidth={2} />
              <span>Convidar</span>
            </button>
            <button
              type="button"
              onClick={() => { setRefreshing(true); triggerHaptic(10); load(); }}
              disabled={refreshing}
              className="w-11 h-11 rounded-full bg-surface border border-white/[0.08] text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center disabled:opacity-50"
              aria-label="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Ledger Editorial de Comando (sem caixas KPI) */}
        <div
          className={`${selectedAthleteId ? 'hidden md:grid' : 'grid'} max-w-6xl mx-auto px-4 sm:px-6 py-3 grid-cols-3 divide-x divide-white/[0.08] border-t border-white/[0.06]`}
        >
          <div className="pr-3">
            <span className="block text-[11px] text-zinc-400">Atletas ativos</span>
            <span className="font-display text-[22px] font-bold tabular-nums text-white leading-tight mt-0.5 block">
              {roster.length}
            </span>
          </div>
          <div className="px-3">
            <span className="block text-[11px] text-zinc-400">Treinaram hoje</span>
            <span className="font-display text-[22px] font-bold tabular-nums text-white leading-tight mt-0.5 block">
              {activeToday}<span className="text-zinc-500 font-normal">/{roster.length}</span>
            </span>
          </div>
          <div className="pl-3">
            <span className="block text-[11px] text-zinc-400">Aderência 7d</span>
            <span className="font-display text-[22px] font-bold tabular-nums text-white leading-tight mt-0.5 block">
              {avgAdherence}%
            </span>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className={`${selectedAthleteId ? 'hidden md:block' : 'block'} max-w-6xl mx-auto px-4 sm:px-6 pb-3`}>
            <RedFlagList athletes={alerts} onSelect={setSelectedAthleteId} />
          </div>
        )}
      </header>

      <div className="flex-1 min-h-0 max-w-6xl mx-auto w-full md:grid md:grid-cols-[360px_1fr] md:divide-x md:divide-white/[0.08]">
        <div className={`${selectedAthleteId ? 'hidden md:block' : 'block'} h-full min-h-0`}>
          <RosterPanel
            roster={roster}
            loading={loading}
            selectedAthleteId={selectedAthleteId}
            onSelect={setSelectedAthleteId}
            onQuickAssign={handleQuickAssign}
            onOpenInvite={() => setInvitingOpen(true)}
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
              athleteSummary={selectedAthlete}
              embedded
              tags={selectedAthlete?.tags || []}
              onTagsChanged={load}
              onArchiveAthlete={handleArchiveAthlete}
              onBack={() => setSelectedAthleteId(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-1.5">
              <p className="text-[14px] font-medium text-zinc-300">
                Seleciona um atleta à esquerda
              </p>
              <p className="text-[12px] text-zinc-500 max-w-xs">
                Consulta volume semanal, restrições articulares, feedback pós-treino e prescreve novas rotinas.
              </p>
            </div>
          )}
        </div>
      </div>

      {invitingOpen && (
        <InviteCodeSheet trainerId={user?.id} onClose={() => setInvitingOpen(false)} />
      )}

      {templatesOpen && (
        <ProgramBuilderSheet
          trainerId={user?.id}
          templateOnly
          onClose={() => setTemplatesOpen(false)}
          onSaved={() => setTemplatesOpen(false)}
        />
      )}

      {quickAssign && (
        <ProgramBuilderSheet
          trainerId={user?.id}
          athleteId={quickAssign.athleteId}
          athleteName={quickAssign.athleteName}
          lastProgram={quickAssign.lastProgram}
          onClose={() => setQuickAssign(null)}
          onSaved={() => {
            setQuickAssign(null);
            load();
          }}
        />
      )}
    </div>
  );
}
