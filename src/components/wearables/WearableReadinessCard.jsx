import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Activity, Watch, HeartPulse, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import {
  getLocalConnections,
  getLocalBiometrics,
  computeReadinessIndex
} from '../../services/wearables/wearableManager';

const WearablesModal = lazy(() => import('./WearablesModal'));

export default function WearableReadinessCard({ onOpenWearables }) {
  const [readiness, setReadiness] = useState(null);
  const [hasConnection, setHasConnection] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = () => {
    const conns = getLocalConnections();
    const hasAny = Object.keys(conns || {}).length > 0;
    setHasConnection(hasAny);

    if (hasAny) {
      const bios = getLocalBiometrics();
      const read = computeReadinessIndex({
        whoop: conns.whoop ? bios.whoop : null,
        fitbit: conns.fitbit ? bios.fitbit : null
      });
      setReadiness(read);
    } else {
      setReadiness(null);
    }
  };

  useEffect(() => {
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClick = () => {
    triggerHaptic(8);
    if (onOpenWearables) {
      onOpenWearables();
    } else {
      setModalOpen(true);
    }
  };

  if (!hasConnection) {
    return (
      <>
        <div
          onClick={handleClick}
          className="p-3.5 rounded-xl bg-surface-2/60 border border-white/[0.06] hover:border-white/10 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-xs select-none"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 shrink-0 group-hover:text-white transition-colors">
              <Watch className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Ligar Whoop ou Fitbit</span>
                <span className="px-1.5 py-0.2 rounded bg-accent/60 text-white text-[9px] font-bold uppercase tracking-wider">
                  Novo
                </span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Calibra o treino com a tua recuperação real
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </div>
        {modalOpen && (
          <Suspense fallback={null}>
            <WearablesModal isOpen={modalOpen} onClose={() => { setModalOpen(false); refresh(); }} />
          </Suspense>
        )}
      </>
    );
  }

  if (!readiness) return null;

  return (
    <>
      <div
        onClick={handleClick}
        className="p-4 rounded-xl bg-gradient-to-b from-surface-2 to-surface border border-white/[0.08] hover:border-white/15 transition-all shadow-xs cursor-pointer group select-none relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-heading text-[15px] font-black tabular-nums shadow-sm"
              style={{
                borderColor: readiness.color,
                color: readiness.color
              }}
            >
              {readiness.score}%
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: readiness.color }}
                />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">
                  {readiness.label}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider ml-1">
                  • {readiness.providerUsed === 'composite' ? 'Whoop + Fitbit' : readiness.providerUsed}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                {readiness.advice}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {readiness.hrv && (
              <div className="hidden sm:flex flex-col items-end text-right pr-2 border-r border-white/[0.06]">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">HRV</span>
                <span className="text-[12px] font-bold text-white tabular-nums">{readiness.hrv} ms</span>
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
      {modalOpen && (
        <Suspense fallback={null}>
          <WearablesModal isOpen={modalOpen} onClose={() => { setModalOpen(false); refresh(); }} />
        </Suspense>
      )}
    </>
  );
}
