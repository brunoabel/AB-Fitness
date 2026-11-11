import React from 'react';
import { Cloud, Volume2, VolumeX } from 'lucide-react';
import { saveVoiceCuesPreference } from '../../utils/speech';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningHub.jsx (estado e handlers recebidos por props). */
export default function RunHeader({ isCloudSynced, setVoiceEnabled, totalKmsAccumulated, totalRunsCount, voiceEnabled }) {
  return (
    <>
      {/* 1. Header do AB Running Club */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-white">
              AB FITNESS • RUNNING CLUB
            </span>
            {isCloudSynced && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                <Cloud className="w-2.5 h-2.5" />
                Nuvem OK
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Running Club
          </h1>
          <p className="text-xs text-zinc-400">
            Rastreio GPS com filtro de Kalman 2D, janela móvel de pace e Auto-Pause inteligente.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Toggle de Locução por Voz nos Fones */}
          <button
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              saveVoiceCuesPreference(next);
              triggerHaptic(10);
            }}
            className={`min-h-[44px] min-w-[44px] p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 ${
              voiceEnabled 
                ? 'bg-accent/70 text-white border-accent-hover' 
                : 'bg-zinc-900 text-zinc-400 border-white/10'
            }`}
            title={voiceEnabled ? 'Locução por voz ativada nos fones' : 'Locução por voz desativada'}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-white" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Badges de Totais Acumulados */}
          <div className="text-right bg-zinc-900 border border-white/10 px-3.5 py-2 rounded-xl">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Total ({totalRunsCount} {totalRunsCount === 1 ? 'sessão' : 'sessões'})
            </span>
            <span className="text-sm font-black text-white font-mono tabular-nums">
              {totalKmsAccumulated.toFixed(1)} <span className="text-[11px] text-white font-sans">KM</span>
            </span>
          </div>
        </div>
      </div>

    </>
  );
}
