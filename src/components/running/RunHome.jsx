import React from 'react';
import { AlertTriangle, Download, Footprints, Play, Satellite, Settings, Share2, Smartphone, Trash2 } from 'lucide-react';
import { downloadGPX, formatDuration } from '../../utils/runningService';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningHub.jsx (estado e handlers recebidos por props). */
export default function RunHome({ gpsAccuracy, gpsError, handleDeleteRun, handlePrewarmGps, handleRequestStartRun, isGpsWarmedUp, isSimulation, permissionState, runsHistory, sessionStatus, setIsSimulation, setSelectedRunForShare, setSimulationMode, simulationMode }) {
  return (
    <>
      {/* 5. TELA INICIAL (PRONTO PARA CORRER) */}
      {sessionStatus === 'idle' && (
        <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 md:space-y-0 items-start">

          {/* Card Principal: Iniciar Nova Corrida */}
          <div className="md:col-span-7 rounded-2xl bg-surface border border-white/[0.08] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-xl bg-white/[0.04] text-white border border-white/[0.08]">
                  <Footprints className="w-5 h-5" />
                </span>

                {/* Botão de Calibrar / Pré-aquecer GPS antes de correr */}
                {!isSimulation && (
                  <button
                    onClick={handlePrewarmGps}
                    className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      isGpsWarmedUp
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white'
                    }`}
                    title="Verificar permissão e adquirir sinal de satélite antes de iniciar"
                  >
                    <Satellite className="w-3.5 h-3.5" />
                    <span>
                      {isGpsWarmedUp && gpsAccuracy
                        ? `GPS Pronto (±${gpsAccuracy}m)`
                        : 'Calibrar Sinal GPS'}
                    </span>
                  </button>
                )}
              </div>

              {/* Botões de Simulação de Teste / Debug */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsSimulation(!isSimulation);
                    triggerHaptic(10);
                  }}
                  className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    isSimulation
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>{isSimulation ? 'Simulação Ativa' : 'Simulação de Teste'}</span>
                </button>

                {isSimulation && (
                  <button
                    onClick={() => {
                      setSimulationMode((prev) => (prev === 'normal' ? 'noisy' : 'normal'));
                      triggerHaptic(8);
                    }}
                    className="min-h-[44px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:text-white text-[11px] font-bold cursor-pointer"
                    title="Alternar entre simulação limpa ou com picos de ruído GPS para testar o filtro"
                  >
                    <Settings className="w-3 h-3" />
                    <span>{simulationMode === 'noisy' ? 'Modo: Com Ruído' : 'Modo: Limpo'}</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Pronto para Correr?
            </h2>
            <p className="text-xs text-zinc-400 mt-1 mb-6 leading-relaxed">
              O motor GPS de alta precisão aplica filtragem Kalman 2D contra desvios, janela móvel de ritmo, Auto-Pause inteligente e guarda rascunhos locais automaticamente.
            </p>

            {/* Diagnóstico de Erro de GPS / Permissões com guia de resolução */}
            {(gpsError || permissionState === 'denied') && !isSimulation && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{gpsError || 'Permissão de localização bloqueada no navegador.'}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  <strong>Como ativar nas definições:</strong> No iPhone (Safari), aceda a <em>Definições &gt; Privacidade e Segurança &gt; Serviços de Localização &gt; Sites do Safari</em> e ative a <strong>Localização Precisa</strong>. No Android (Chrome), toque no ícone de cadeado ao lado do URL &gt; <em>Permissões &gt; Localização</em>.
                </p>
              </div>
            )}

            {/* Botão de Começar Corrida */}
            <button
              onClick={handleRequestStartRun}
              className="w-full min-h-[48px] py-4 px-6 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>INICIAR CORRIDA</span>
            </button>
          </div>

          {/* Histórico Recente de Corridas */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Corridas Concluídas ({runsHistory.length})
              </h3>
            </div>

            {runsHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500">
                <Footprints className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Nenhuma corrida registada ainda.</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Faça a sua primeira corrida para desbloquear cartões exclusivos de partilha!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runsHistory.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedRunForShare(run)}
                    className="p-3.5 rounded-xl bg-surface border border-white/[0.08] flex items-center justify-between hover:border-white/[0.16] transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-zinc-300 border border-white/[0.08] flex items-center justify-center shrink-0">
                        <Footprints className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white font-mono tabular-nums">
                            {Number(run.distanceKm).toFixed(2)} km
                          </span>
                          {run.isSimulation && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                              Teste
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono tabular-nums">
                          <span>{run.avgPace}</span>
                          <span>•</span>
                          <span>{formatDuration(run.durationSeconds)}</span>
                          <span>•</span>
                          <span>{run.calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão de Exportar GPX */}
                      {run.coordinates && run.coordinates.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic(12);
                            downloadGPX(run.coordinates, `corrida_${run.date?.split('T')[0] || 'ab_fitness'}`);
                          }}
                          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                          title="Exportar GPX para Strava / Garmin"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}

                      {/* Botão de Partilhar / Gerar Cartão */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRunForShare(run);
                        }}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                        title="Gerar Cartão para o Instagram"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Botão de Eliminar */}
                      <button
                        onClick={(e) => handleDeleteRun(e, run.id)}
                        className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors flex items-center justify-center cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
