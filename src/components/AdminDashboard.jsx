import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { fetchAdminAthletesData, fetchAthleteDetails } from '../services/workoutService';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';

export default function AdminDashboard({ onBackToWorkout }) {
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
      return d.toLocaleDateString('pt-BR', {
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
      return d.toLocaleDateString('pt-BR', {
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
    <div className="min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between transition-colors animate-fadeIn">
      <div className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-[#09090b] shadow-2xl relative flex flex-col justify-between border-x border-zinc-200/80 dark:border-zinc-800/80">
        
        {/* Top Header do Painel de Admin — Alinhado e Simétrico com o Header principal */}
        <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors pt-[max(env(safe-area-inset-top,0px),12px)]">
          <div className="max-w-md mx-auto px-4 pt-2.5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onBackToWorkout}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60"
                title="Voltar aos Treinos"
                aria-label="Voltar aos Treinos"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <ABLogo size={36} showText={false} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xs font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                      Painel do Treinador
                    </h1>
                    <span className="px-1.5 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[9px] font-extrabold uppercase tracking-widest leading-none">
                      ADMIN
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    Gestão Geral de Atletas & Treinos
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60 ${
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
        <main className="p-4 space-y-4 flex-1 pb-16">
          
          {/* Cartões com Métricas Globais */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                <Users className="w-3 h-3 text-sky-400" />
                <span>Atletas</span>
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-white">
                {athletes.length}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">cadastrados</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                <Dumbbell className="w-3 h-3 text-sky-400" />
                <span>Treinos</span>
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-white">
                {sessions.length}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">executados</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Volume</span>
              </div>
              <div className="text-xl font-black text-zinc-900 dark:text-white">
                {stats.totalVolume > 999 ? `${(stats.totalVolume / 1000).toFixed(1)}t` : `${stats.totalVolume}kg`}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">levantados</div>
            </div>
          </div>

          {/* Abas: Atletas / Treinos Recentes */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs font-bold">
            <button
              onClick={() => {
                setActiveTab('athletes');
                triggerHaptic(10);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'athletes'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Atletas ({athletes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('sessions');
                triggerHaptic(10);
              }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
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
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
            </div>
          )}

          {/* TAB 1: LISTA DE ATLETAS */}
          {activeTab === 'athletes' && (
            <div className="space-y-2">
              {loading ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  <div className="w-6 h-6 border-2 border-zinc-400 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-2" />
                  Carregando lista de atletas...
                </div>
              ) : filteredAthletes.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400">
                  Nenhum atleta encontrado para esta busca.
                </div>
              ) : (
                filteredAthletes.map((ath) => {
                  const athSessionsCount = sessions.filter((s) => s.user_id === ath.id).length;
                  const isCurrentAdmin = ath.role === 'admin' || ath.email === 'brunoaaraujo2005@gmail.com';
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
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-between active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar com Iniciais */}
                        <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-extrabold text-xs shadow-xs shrink-0">
                          {initials}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                              {ath.full_name || ath.email.split('@')[0]}
                            </h4>
                            {isCurrentAdmin && (
                              <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                                Treinador
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 font-medium truncate max-w-[180px]">
                            {ath.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span>Desde: {formatDate(ath.created_at)}</span>
                            <span>•</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                              {athSessionsCount} {athSessionsCount === 1 ? 'treino feito' : 'treinos feitos'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SESSÕES RECENTES CONCLUÍDAS */}
          {activeTab === 'sessions' && (
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-2">
                  <Activity className="w-6 h-6 text-zinc-400 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Nenhum treino gravado ainda
                  </h4>
                  <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                    Assim que qualquer atleta concluir um treino no app, ele aparecerá aqui com tempo e dados em tempo real.
                  </p>
                </div>
              ) : (
                sessions.map((sess) => {
                  const athleteOwner = athletes.find((a) => a.id === sess.user_id);
                  const athleteName = athleteOwner?.full_name || athleteOwner?.email?.split('@')[0] || 'Atleta';
                  const durationMin = Math.round((sess.duration_seconds || 0) / 60);

                  return (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-800 dark:text-zinc-200">
                          {sess.workout_day_name}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {formatTimeAgo(sess.completed_at)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          {sess.workout_title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-semibold">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{durationMin} min</span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>Atleta: <strong className="text-zinc-800 dark:text-zinc-200">{athleteName}</strong></span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Concluído
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </main>

        {/* Modal de Detalhes do Atleta Selecionado */}
        {selectedAthlete && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
            <div 
              className="w-full sm:max-w-md bg-white dark:bg-[#121215] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex flex-col max-h-[85vh] animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                    {(selectedAthlete.full_name || selectedAthlete.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                      {selectedAthlete.full_name || 'Atleta'}
                    </h3>
                    <p className="text-[10px] text-zinc-400">{selectedAthlete.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAthlete(null);
                    setAthleteDetails(null);
                  }}
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Corpo com Histórico do Atleta */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
                {athleteDetailsLoading ? (
                  <div className="p-6 text-center text-zinc-400">
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-2" />
                    Buscando histórico do atleta...
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Perfil Esportivo:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 uppercase">
                          {selectedAthlete.athlete_type || 'Futebol & Academia'}
                        </strong>
                      </div>
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Data de Início:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200">
                          {formatDate(selectedAthlete.created_at)}
                        </strong>
                      </div>
                      <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Total de Sessões:</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
                          {athleteDetails?.sessions?.length || 0} treinos
                        </strong>
                      </div>
                    </div>

                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1 pt-1">
                      Sessões Realizadas por este Atleta
                    </h4>

                    {athleteDetails?.sessions?.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                        Este atleta ainda não registrou sessões concluídas no banco de dados.
                      </div>
                    ) : (
                      (athleteDetails?.sessions || []).map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {s.workout_title}
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              {s.workout_day_name} • {Math.round((s.duration_seconds || 0) / 60)} min
                            </div>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-semibold">
                            {formatTimeAgo(s.completed_at)}
                          </span>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Botão Fechar */}
              <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
                <button
                  onClick={() => {
                    setSelectedAthlete(null);
                    setAthleteDetails(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs active:scale-[0.98] transition-all cursor-pointer"
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
