import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Activity,
  HeartPulse,
  Moon,
  Flame,
  Link2,
  RefreshCw,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import { useAuth } from '../../context';
import {
  getConnectedWearables,
  getLocalBiometrics,
  disconnectWearable,
  syncWearableData,
  computeReadinessIndex
} from '../../services/wearables/wearableManager';
import { buildWhoopAuthUrl, getWhoopClientId } from '../../services/wearables/whoopService';
import { buildFitbitAuthUrl, getFitbitClientId } from '../../services/wearables/fitbitService';
import { WhoopMark, FitbitMark } from './WearableLogos';

const SPRING = { type: 'spring', stiffness: 400, damping: 36 };

function formatProviderName(providerUsed) {
  if (providerUsed === 'composite') return 'WHOOP + Fitbit';
  if (providerUsed === 'whoop') return 'WHOOP';
  if (providerUsed === 'fitbit') return 'Fitbit';
  return providerUsed;
}

function MetricBadge({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-1.5 text-zinc-400">
        <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" strokeWidth={1.75} />
        <span className="text-[11px] font-medium truncate">{label}</span>
      </div>
      <div className="mt-1">
        <span className="font-display text-[18px] font-semibold text-white tracking-[-0.02em] tabular-nums">
          {value}
        </span>
        {sub && <span className="ml-1 text-[11px] font-normal text-zinc-500">{sub}</span>}
      </div>
    </div>
  );
}

export default function WearablesModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [connections, setConnections] = useState({});
  const [biometrics, setBiometrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const conns = await getConnectedWearables(userId);
    const bios = getLocalBiometrics();
    setConnections(conns);
    setBiometrics(bios);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const handleConnectOfficial = (provider) => {
    triggerHaptic(10);
    const redirectUri = `${window.location.origin}/auth/callback/wearable`;
    const url = provider === 'whoop'
      ? buildWhoopAuthUrl(redirectUri)
      : buildFitbitAuthUrl(redirectUri);
    if (url) window.location.href = url;
  };

  const handleDisconnect = async (provider) => {
    triggerHaptic(10);
    setSyncingProvider(provider);
    await disconnectWearable(userId, provider);
    await loadData();
    setSyncingProvider(null);
  };

  const handleSync = async (provider) => {
    triggerHaptic(8);
    setSyncingProvider(provider);
    await syncWearableData(userId, provider);
    await loadData();
    setSyncingProvider(null);
  };

  const whoopConn = connections.whoop;
  const fitbitConn = connections.fitbit;
  const whoopBio = biometrics.whoop;
  const fitbitBio = biometrics.fitbit;

  const readiness = computeReadinessIndex({
    whoop: whoopConn ? whoopBio : null,
    fitbit: fitbitConn ? fitbitBio : null
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Dispositivos & Wearables"
        >
          {/* Overlay Escuro com Blur */}
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              triggerHaptic(8);
              onClose();
            }}
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto overscroll-contain bg-[#070709] border border-white/[0.12] rounded-t-[32px] sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-5 sm:p-6 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] will-change-transform text-white"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={SPRING}
          >
            {/* Grab handle mobile */}
            <span className="sm:hidden block mx-auto -mt-1 mb-3 w-10 h-1 rounded-full bg-white/20" aria-hidden />

            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 shrink-0">
                  <WhoopMark size={26} className="rounded-lg" />
                  <FitbitMark size={26} className="rounded-lg" />
                </div>
                <div>
                  <h2 className="font-heading text-section font-semibold text-white tracking-tight">
                    Dispositivos &amp; Wearables
                  </h2>
                  <p className="text-[12px] text-zinc-400">
                    Sincronização biométrica via APIs oficiais
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onClose();
                }}
                aria-label="Fechar modal"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {/* Painel de Prontidão (visível se pelo menos 1 wearable estiver ligado) */}
            {readiness && (
              <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.09] relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-display text-[17px] font-semibold tabular-nums tracking-[-0.02em] shrink-0"
                      style={{
                        borderColor: readiness.color,
                        color: readiness.color,
                        boxShadow: `0 0 16px ${readiness.color}26`
                      }}
                    >
                      {readiness.score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: readiness.color }}
                        />
                        <span className="text-[13px] font-semibold text-white uppercase tracking-wider">
                          {readiness.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Índice Biomecânico do Dia ({formatProviderName(readiness.providerUsed)})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: readiness.color }}
                    aria-hidden="true"
                  />
                  <p className="text-[12px] text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-white">Parecer AB Coach:</span> {readiness.advice}
                  </p>
                </div>
              </div>
            )}

            {/* Lista de Dispositivos */}
            <div className="mt-5 space-y-4">
              {/* Card WHOOP */}
              <div className="rounded-2xl bg-white/[0.025] border border-white/[0.08] p-4 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <WhoopMark size={40} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-[15px] font-semibold text-white tracking-tight">WHOOP 4.0</h3>
                        {whoopConn ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {whoopConn.status === 'simulated' ? 'Simulado' : 'Conectado'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-medium">Desconectado</span>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-400">
                        Recuperação fisiológica, HRV e Strain diário
                      </p>
                    </div>
                  </div>

                  {whoopConn && (
                    <button
                      type="button"
                      onClick={() => handleSync('whoop')}
                      disabled={syncingProvider === 'whoop'}
                      className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title="Sincronizar agora"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${syncingProvider === 'whoop' ? 'animate-spin text-white' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Métricas Whoop */}
                {whoopConn && whoopBio && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-4 pt-3.5 border-t border-white/[0.06]">
                    <MetricBadge
                      icon={Activity}
                      label="Recuperação"
                      value={`${whoopBio.recovery_score}%`}
                    />
                    <MetricBadge
                      icon={HeartPulse}
                      label="HRV"
                      value={whoopBio.hrv_ms}
                      sub="ms"
                    />
                    <MetricBadge
                      icon={Flame}
                      label="Day Strain"
                      value={whoopBio.day_strain}
                    />
                    <MetricBadge
                      icon={Moon}
                      label="Sono"
                      value={`${Math.floor(whoopBio.sleep_duration_seconds / 3600)}h ${Math.floor((whoopBio.sleep_duration_seconds % 3600) / 60)}m`}
                    />
                  </div>
                )}

                {/* Ações Whoop */}
                <div className="mt-4 flex items-center gap-2">
                  {!whoopConn ? (
                    <button
                      type="button"
                      onClick={() => handleConnectOfficial('whoop')}
                      disabled={!getWhoopClientId()}
                      className="flex-1 min-h-[44px] px-3 rounded-xl bg-primary text-app text-[13px] font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-default"
                      title={getWhoopClientId() ? undefined : 'Requer Client ID WHOOP'}
                    >
                      <Link2 className="w-4 h-4" />
                      Conectar com WHOOP
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDisconnect('whoop')}
                      className="w-full min-h-[40px] rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-zinc-400 hover:text-red-400 text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Desconectar WHOOP
                    </button>
                  )}
                </div>
              </div>

              {/* Card FITBIT */}
              <div className="rounded-2xl bg-white/[0.025] border border-white/[0.08] p-4 transition-all">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <FitbitMark size={40} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading text-[15px] font-semibold text-white tracking-tight">
                          Fitbit
                          <span className="text-[12px] font-normal text-zinc-400 ml-1">by Google</span>
                        </h3>
                        {fitbitConn ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {fitbitConn.status === 'simulated' ? 'Simulado' : 'Conectado'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-zinc-500 font-medium">Desconectado</span>
                        )}
                      </div>
                      <p className="text-[12px] text-zinc-400">
                        FC em repouso, sono, passos e queima calórica
                      </p>
                    </div>
                  </div>

                  {fitbitConn && (
                    <button
                      type="button"
                      onClick={() => handleSync('fitbit')}
                      disabled={syncingProvider === 'fitbit'}
                      className="w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title="Sincronizar agora"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${syncingProvider === 'fitbit' ? 'animate-spin text-white' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {/* Métricas Fitbit */}
                {fitbitConn && fitbitBio && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-4 pt-3.5 border-t border-white/[0.06]">
                    <MetricBadge
                      icon={HeartPulse}
                      label="FC Repouso"
                      value={fitbitBio.resting_hr_bpm}
                      sub="bpm"
                    />
                    <MetricBadge
                      icon={Moon}
                      label="Score Sono"
                      value={`${fitbitBio.sleep_score}/100`}
                    />
                    <MetricBadge
                      icon={Flame}
                      label="Calorias"
                      value={fitbitBio.calories_burned}
                      sub="kcal"
                    />
                    <MetricBadge
                      icon={Activity}
                      label="Passos"
                      value={fitbitBio.steps ? fitbitBio.steps.toLocaleString('pt-PT') : '10.420'}
                    />
                  </div>
                )}

                {/* Ações Fitbit */}
                <div className="mt-4 flex items-center gap-2">
                  {!fitbitConn ? (
                    <button
                      type="button"
                      onClick={() => handleConnectOfficial('fitbit')}
                      disabled={!getFitbitClientId()}
                      className="flex-1 min-h-[44px] px-3 rounded-xl bg-primary text-app text-[13px] font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-default"
                      title={getFitbitClientId() ? undefined : 'Requer Client ID Fitbit'}
                    >
                      <Link2 className="w-4 h-4" />
                      Conectar com Fitbit
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDisconnect('fitbit')}
                      className="w-full min-h-[40px] rounded-xl bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 text-zinc-400 hover:text-red-400 text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Desconectar Fitbit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nota de Privacidade & Atribuição de Marcas */}
            <div className="mt-5 space-y-1.5 text-center">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                O AB Fitness lê apenas dados fisiológicos necessários para calibrar a recuperação muscular. Nenhuma informação médica pessoal é partilhada com terceiros.
              </p>
              <p className="text-[10px] text-zinc-600 leading-relaxed">
                Conexão direta via APIs oficiais OAuth 2.0. WHOOP® e Fitbit® são marcas registadas dos respetivos proprietários.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

