import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { saveVoiceCuesPreference } from '../../utils/speech';
import { triggerHaptic } from '../../utils/audio';

/** Cabeçalho editorial da Corrida: limpo, sem jargões nem cartões repetidos. */
export default function RunHeader({
  gpsAccuracy,
  gpsErrorCode,
  handlePrewarmGps,
  isGpsWarmedUp,
  isSimulation,
  permissionState,
  sessionStatus,
  setVoiceEnabled,
  voiceEnabled
}) {
  const gpsBlocked = permissionState === 'denied' || gpsErrorCode === 'DENIED' || gpsErrorCode === 'COARSE';
  const gpsReady = isGpsWarmedUp || (gpsAccuracy !== null && gpsAccuracy <= 25);

  const statusDot = isSimulation
    ? 'bg-amber-400'
    : gpsBlocked
      ? 'bg-rose-500'
      : gpsReady
        ? 'bg-emerald-400'
        : 'bg-zinc-500';

  const statusText = isSimulation
    ? 'Passadeira'
    : gpsBlocked
      ? 'Sem GPS'
      : gpsReady
        ? 'GPS Pronto'
        : 'GPS';

  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-[-0.025em]">
        Corrida
      </h1>

      <div className="flex items-center gap-2 shrink-0">
        {sessionStatus === 'idle' && (
          <button
            type="button"
            onClick={() => {
              if (!isSimulation && handlePrewarmGps) {
                triggerHaptic(8);
                handlePrewarmGps();
              }
            }}
            className="min-h-[40px] inline-flex items-center gap-2 px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            title={isSimulation ? 'Modo passadeira ativo' : 'Verificar sinal de localização'}
          >
            <span className={`w-2 h-2 rounded-full ${statusDot}`} />
            <span>{statusText}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            const next = !voiceEnabled;
            setVoiceEnabled(next);
            saveVoiceCuesPreference(next);
            triggerHaptic(10);
          }}
          className={`min-h-[44px] min-w-[44px] rounded-full border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
            voiceEnabled
              ? 'bg-white text-black border-white'
              : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08]'
          }`}
          aria-label={voiceEnabled ? 'Desativar voz do treinador' : 'Ativar voz do treinador'}
          title={voiceEnabled ? 'Voz nos fones ligada' : 'Voz nos fones desligada'}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 stroke-[2.2]" /> : <VolumeX className="w-4 h-4 stroke-[2]" />}
        </button>
      </div>
    </header>
  );
}
