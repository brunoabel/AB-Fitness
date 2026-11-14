import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import {
  getLocalConnections,
  getLocalBiometrics,
  computeReadinessIndex
} from '../../services/wearables/wearableManager';
import { WhoopMark, FitbitMark } from './WearableLogos';

const WearablesModal = lazy(() => import('./WearablesModal'));

function formatProviderName(providerUsed) {
  if (providerUsed === 'composite') return 'WHOOP + Fitbit';
  if (providerUsed === 'whoop') return 'WHOOP';
  if (providerUsed === 'fitbit') return 'Fitbit';
  return providerUsed;
}

function readLocalWearableSnapshot() {
  const conns = getLocalConnections();
  const hasAny = Object.keys(conns || {}).length > 0;
  if (!hasAny) {
    return { hasAny: false, readiness: null };
  }
  const bios = getLocalBiometrics();
  return {
    hasAny: true,
    readiness: computeReadinessIndex({
      whoop: conns.whoop ? bios.whoop : null,
      fitbit: conns.fitbit ? bios.fitbit : null
    })
  };
}

export default function WearableReadinessCard({ onOpenWearables }) {
  const [readiness, setReadiness] = useState(() => readLocalWearableSnapshot().readiness);
  const [hasConnection, setHasConnection] = useState(() => readLocalWearableSnapshot().hasAny);
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = () => {
    const snap = readLocalWearableSnapshot();
    setHasConnection(snap.hasAny);
    setReadiness(snap.readiness);
  };

  useEffect(() => {
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
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
          className="px-4 py-3.5 min-h-[56px] rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/[0.08] hover:border-white/[0.14] transition-all flex items-center justify-between gap-3 cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <WhoopMark size={28} className="rounded-lg" />
              <FitbitMark size={28} className="rounded-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white tracking-tight truncate">
                Sincronizar WHOOP ou Fitbit
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Prontidão, HRV e sono integrados ao teu treino
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
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
        className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all cursor-pointer group select-none relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-display text-[14px] font-semibold tabular-nums tracking-[-0.02em] shrink-0"
              style={{
                borderColor: readiness.color,
                color: readiness.color
              }}
            >
              {readiness.isStale || readiness.score == null ? '--' : `${readiness.score}%`}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${readiness.isStale ? '' : 'animate-pulse'}`}
                  style={{ backgroundColor: readiness.color }}
                />
                <span className="text-[12px] font-semibold text-white uppercase tracking-wider">
                  {readiness.label}
                </span>
                <span className="text-zinc-600 text-[10px]" aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                  {(readiness.providerUsed === 'whoop' || readiness.providerUsed === 'composite') && (
                    <WhoopMark size={15} className="rounded-[4px]" />
                  )}
                  {(readiness.providerUsed === 'fitbit' || readiness.providerUsed === 'composite') && (
                    <FitbitMark size={15} className="rounded-[4px]" />
                  )}
                  <span>{formatProviderName(readiness.providerUsed)}</span>
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
                <span className="font-display text-[13px] font-semibold text-white tabular-nums">
                  {readiness.hrv}
                  <span className="text-[10px] font-normal text-zinc-500 ml-0.5">ms</span>
                </span>
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
