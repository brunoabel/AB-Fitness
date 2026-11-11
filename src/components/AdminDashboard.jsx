import React, { useState, useEffect } from 'react';
import { SkeletonList } from './ui/Skeleton';
import { 
  Users, 
  Dumbbell, 
  Trophy, 
  Clock, 
  Search, 
  RefreshCw, 
  X, 
  Activity,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldPlus,
  ShieldMinus,
  Crown
} from 'lucide-react';
import { fetchAdminAthletesData, fetchAthleteDetails, promoteToCoach, demoteToAthlete } from '../services/workoutService';
import { triggerHaptic } from '../utils/audio';
import { useAuth } from '../context';
import ABLogo from './ABLogo';

export default function AdminDashboard({ onBackToWorkout }) {
  const { isCeo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalLogs: 0, totalVolume: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('athletes'); // 'athletes' | 'sessions'
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [athleteDetailsLoading, setAthleteDetailsLoading] = useState(false);
  const [athleteDetails, setAthleteDetails] = useState(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [roleActionError, setRoleActionError] = useState('');

  const loadData = async () => {
    try {
      const data = await fetchAdminAthletesData();
      setAthletes(data.athletes || []);
      setSessions(data.sessions || []);
      setStats({
        totalLogs: data.totalLogsCount || 0,
        totalVolume: data.totalVolumeKg || 0
      });
    } catch (err) {
      console.error('Erro ao carregar dados admin:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAdminAthletesData();
        if (isMounted) {
          setAthletes(data.athletes || []);
          setSessions(data.sessions || []);
          setStats({
            totalLogs: data.totalLogsCount || 0,
            totalVolume: data.totalVolumeKg || 0
          });
        }
      } catch (err) {
        if (isMounted) console.error('Erro ao carregar dados admin:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    triggerHaptic(10);
    loadData();
  };

  const handleViewAthlete = async (ath) => {
    triggerHaptic(15);
    setSelectedAthlete(ath);
    setAthleteDetailsLoading(true);
    const details = await fetchAthleteDetails(ath.id);
    setAthleteDetails(details);
    setAthleteDetailsLoading(false);
    setRoleActionError('');
  };

  const handleToggleCoachRole = async () => {
    if (!selectedAthlete) return;
    triggerHaptic(15);
    setRoleActionLoading(true);
    setRoleActionError('');
    const isCoach = selectedAthlete.role === 'coach';
    const { data, error } = isCoach
      ? await demoteToAthlete(selectedAthlete.id)
      : await promoteToCoach(selectedAthlete.id);
    setRoleActionLoading(false);
    if (error) {
      setRoleActionError(error);
      return;
    }
    setSelectedAthlete((prev) => ({ ...prev, role: data.role }));
    setAthletes((prev) => prev.map((a) => (a.id === data.id ? { ...a, role: data.role } : a)));
  };

  // Filtragem de atletas por nome ou e-mail
  const filteredAthletes = athletes.filter((ath) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (ath.full_name || '').toLowerCase().includes(q);
    const emailMatch = (ath.email || '').toLowerCase().includes(q);
    return nameMatch || emailMatch;
  });

  const formatDate = (isoString) => {
    if (!isoString) return 'Recentemente';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between transition-colors animate-fadeIn">
      <div className="w-full max-w-5xl mx-auto min-h-screen bg-zinc-950 shadow-2xl relative flex flex-col justify-between border-x border-white/10">
        
        {/* Top Header do Painel de Admin */}
        <header className="sticky top-0 z-20 w-full bg-zinc-950/95 backdrop-blur-md border-b border-white/10 transition-colors pt-[max(env(safe-area-inset-top,0px),12px)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2.5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackToWorkout}
                className="w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer active:scale-95 flex items-center justify-center border border-zinc-700"
                title="Voltar aos Treinos"
                aria-label="Voltar aos Treinos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <ABLogo size={36} showText={false} />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase leading-none">
                      {isCeo ? 'Painel Executivo CEO' : 'Painel do Treinador'}
                    </h1>
                    {isCeo ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider leading-none shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                        <Crown className="w-3 h-3 text-amber-400" />
                        CEO & FUNDADOR
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary text-app text-[11px] font-bold uppercase tracking-wider leading-none">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
                    {isCeo ? 'Controlo Supremo de Atletas, Métricas & Ecossistema' : 'Gestão Geral de Atletas & Treinos'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`w-11 h-11 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer active:scale-95 flex items-center justify-center border border-zinc-700 ${
                refreshing ? 'opacity-50' : ''
              }`}
              title="Atualizar dados"
              aria-label="Atualizar dados de atletas"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Conteúdo Principal do Painel */}
        <main className="p-4 sm:p-6 space-y-5 flex-1 pb-16">
          
          {/* Cartões com Métricas Globais */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5 text-zinc-300" />
                <span>Atletas</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {athletes.length}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">registados</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                <Dumbbell className="w-3.5 h-3.5 text-zinc-300" />
                <span>Treinos</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {sessions.length}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">concluídos</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900 border border-white/10">
              <div className="flex items-center gap-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                <Trophy className="w-3.5 h-3.5 text-zinc-300" />
                <span>Volume</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-white">
                {stats.totalVolume > 999 ? `${(stats.totalVolume / 1000).toFixed(1)}t` : `${stats.totalVolume} kg`}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">levantados</div>
            </div>
          </div>

          {/* Abas: Atletas / Histórico Geral */}
          <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('athletes');
                triggerHaptic(10);
              }}
              className={`min-h-[40px] py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'athletes'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Atletas ({athletes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('sessions');
                triggerHaptic(10);
              }}
              className={`min-h-[40px] py-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Histórico Geral ({sessions.length})
            </button>
          </div>

          {/* Campo de Pesquisa */}
          {activeTab === 'athletes' && (
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
          )}

          {/* TAB 1: LISTA DE ATLETAS */}
          {activeTab === 'athletes' && (
            <div className="space-y-2">
              {loading ? (
                <SkeletonList rows={4} label="A carregar lista de atletas" />
              ) : filteredAthletes.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-zinc-400">
                  Nenhum atleta encontrado para esta pesquisa.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredAthletes.map((ath) => {
                    const athSessionsCount = sessions.filter((s) => s.user_id === ath.id).length;
                    const isAthCeo = ath.role === 'ceo' || ath.email === 'brunoaaraujo2005@gmail.com';
                    const isCurrentAdmin = isAthCeo || ath.role === 'admin';
                    const initials = (ath.full_name || ath.email || 'A')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={ath.id}
                        onClick={() => handleViewAthlete(ath)}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-zinc-700 transition-colors cursor-pointer flex items-center justify-between active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar com Iniciais */}
                          <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-white leading-tight">
                                {ath.full_name || ath.email.split('@')[0]}
                              </h4>
                              {isAthCeo ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-amber-600/25 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                                  CEO
                                </span>
                              ) : isCurrentAdmin ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                                  Treinador
                                </span>
                              ) : ath.role === 'coach' ? (
                                <span className="px-1.5 py-0.5 rounded-md bg-accent border border-accent-hover text-[11px] font-bold uppercase tracking-wider text-white">
                                  Personal Trainer
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-zinc-400 font-medium truncate max-w-[180px]">
                              {ath.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono tabular-nums">
                              <span>Desde: {formatDate(ath.created_at)}</span>
                              <span>•</span>
                              <span className="font-semibold text-zinc-300">
                                {athSessionsCount} {athSessionsCount === 1 ? 'treino concluído' : 'treinos concluídos'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SESSÕES RECENTES CONCLUÍDAS */}
          {activeTab === 'sessions' && (
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-white/10 text-center space-y-2">
                  <Activity className="w-6 h-6 text-zinc-400 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-300">
                    Nenhum treino registado ainda
                  </h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Assim que qualquer atleta concluir um treino na aplicação, ele surgirá aqui com métricas em tempo real.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {sessions.map((sess) => {
                    const athleteOwner = athletes.find((a) => a.id === sess.user_id);
                    const athleteName = athleteOwner?.full_name || athleteOwner?.email?.split('@')[0] || 'Atleta';
                    const durationMin = Math.round((sess.duration_seconds || 0) / 60);

                    return (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] font-bold text-zinc-200">
                            {sess.workout_day_name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono tabular-nums font-medium">
                            {formatTimeAgo(sess.completed_at)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">
                            {sess.workout_title}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-semibold font-mono tabular-nums">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{durationMin} min</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
                          <span>Atleta: <strong className="text-zinc-200">{athleteName}</strong></span>
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </main>

        {/* Modal de Detalhes do Atleta Selecionado */}
        {selectedAthlete && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
            <div 
              className="w-full sm:max-w-lg bg-zinc-950 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[85vh] animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-xs">
                    {(selectedAthlete.full_name || selectedAthlete.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {selectedAthlete.full_name || 'Atleta'}
                    </h3>
                    <p className="text-[11px] text-zinc-500">{selectedAthlete.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAthlete(null);
                    setAthleteDetails(null);
                  }}
                  className="w-10 h-10 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Corpo com Histórico do Atleta */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                {athleteDetailsLoading ? (
                  <SkeletonList rows={3} label="A carregar histórico do atleta" />
                ) : (
                  <>
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 space-y-2">
                      <div className="flex justify-between text-zinc-400">
                        <span>Perfil Desportivo:</span>
                        <strong className="text-zinc-200 uppercase">
                          {selectedAthlete.athlete_type || 'Futebol & Musculação'}
                        </strong>
                      </div>
                      <div className="flex justify-between text-zinc-400 font-mono tabular-nums">
                        <span>Data de Início:</span>
                        <strong className="text-zinc-200">
                          {formatDate(selectedAthlete.created_at)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-zinc-400 font-mono tabular-nums">
                        <span>Total de Sessões:</span>
                        <strong className="text-zinc-200 font-bold">
                          {athleteDetails?.sessions?.length || 0} treinos
                        </strong>
                      </div>
                    </div>

                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-1 pt-1">
                      Sessões Concluídas por este Atleta
                    </h4>

                    {athleteDetails?.sessions?.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-zinc-400 text-xs">
                        Este atleta ainda não registou sessões na base de dados.
                      </div>
                    ) : (
                      (athleteDetails?.sessions || []).map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {s.workout_title}
                            </div>
                            <div className="text-[11px] text-zinc-500 font-mono tabular-nums">
                              {s.workout_day_name} • {Math.round((s.duration_seconds || 0) / 60)} min
                            </div>
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono tabular-nums font-semibold">
                            {formatTimeAgo(s.completed_at)}
                          </span>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Promover/remover papel de Trainer */}
              {selectedAthlete && selectedAthlete.role !== 'admin' && selectedAthlete.role !== 'ceo' && selectedAthlete.email !== 'brunoaaraujo2005@gmail.com' && (
                <div className="px-4 pt-3.5 border-t border-white/10 bg-zinc-900 space-y-2">
                  {roleActionError && (
                    <p className="text-[11px] text-red-400">{roleActionError}</p>
                  )}
                  <button
                    onClick={handleToggleCoachRole}
                    disabled={roleActionLoading}
                    className={`w-full min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60 ${
                      selectedAthlete.role === 'coach'
                        ? 'bg-zinc-800 text-zinc-300 border border-white/10 hover:bg-zinc-700'
                        : 'bg-white text-zinc-950 hover:bg-zinc-200'
                    }`}
                  >
                    {selectedAthlete.role === 'coach' ? (
                      <>
                        <ShieldMinus className="w-4 h-4" />
                        {roleActionLoading ? 'A remover...' : 'Remover papel de Trainer'}
                      </>
                    ) : (
                      <>
                        <ShieldPlus className="w-4 h-4" />
                        {roleActionLoading ? 'A promover...' : 'Promover a Trainer'}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Botão Fechar */}
              <div className="p-3.5 border-t border-white/10 bg-zinc-900">
                <button
                  onClick={() => {
                    setSelectedAthlete(null);
                    setAthleteDetails(null);
                    setRoleActionError('');
                  }}
                  className="w-full min-h-[48px] py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs active:scale-[0.99] transition-colors cursor-pointer"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
