import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';
import {
  getLocalConnections,
  getLocalBiometrics,
  computeReadinessIndex
} from '../../services/wearables/wearableManager';
import { WhoopMark, FitbitMark, GarminMark, StravaMark } from './WearableLogos';

const WearablesModal = lazy(() => import('./WearablesModal'));

function formatProviderName(providerUsed) {
  if (providerUsed === 'composite') return 'Fusão Multi-Sensor';
  if (providerUsed === 'whoop') return 'WHOOP';
  if (providerUsed === 'fitbit') return 'Fitbit';
  if (providerUsed === 'strava') return 'Strava';
  if (providerUsed === 'garmin') return 'Garmin';
  return providerUsed;
}

function readLocalWearableSnapshot() {
  const conns = getLocalConnections();
  const activeProviders = ['whoop', 'fitbit', 'garmin', 'strava'].filter((p) => Boolean(conns?.[p]));
  if (activeProviders.length === 0) {
    return { hasAny: false, readiness: null, activeProviders: [] };
  }
  const bios = getLocalBiometrics();
  return {
    hasAny: true,
    activeProviders,
    readiness: computeReadinessIndex({
      whoop: conns.whoop ? bios.whoop : null,
      fitbit: conns.fitbit ? bios.fitbit : null,
      strava: conns.strava ? bios.strava : null,
      garmin: conns.garmin ? bios.garmin : null
    })
  };
}

export default function WearableReadinessCard({ onOpenWearables }) {
  const [snapshot, setSnapshot] = useState(() => readLocalWearableSnapshot());
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = () => {
    setSnapshot(readLocalWearableSnapshot());
  };

  const { hasAny: hasConnection, readiness, activeProviders } = snapshot;

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
        <button
          type="button"
          onClick={handleClick}
          className="w-full py-3 px-2 min-h-[56px] rounded-xl hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors flex items-center justify-between gap-3 cursor-pointer text-left group select-none"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <WhoopMark size={22} className="rounded-md" />
              <GarminMark size={22} className="rounded-md" />
              <FitbitMark size={22} className="rounded-md" />
              <StravaMark size={22} className="rounded-md" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white tracking-tight truncate">
                Sincronizar Wearables
              </p>
              <p className="text-[11px] text-zinc-400 truncate">
                Prontidão, HRV e sono integrados ao treino
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
        </button>
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
      <button
        type="button"
        onClick={handleClick}
        className="w-full py-3 px-2 rounded-xl hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors cursor-pointer text-left group select-none"
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
                  {(readiness.providerUsed === 'whoop' || (readiness.providerUsed === 'composite' && activeProviders.includes('whoop'))) && (
                    <WhoopMark size={15} className="rounded-[4px]" />
                  )}
                  {(readiness.providerUsed === 'garmin' || (readiness.providerUsed === 'composite' && activeProviders.includes('garmin'))) && (
                    <GarminMark size={15} className="rounded-[4px]" />
                  )}
                  {(readiness.providerUsed === 'fitbit' || (readiness.providerUsed === 'composite' && activeProviders.includes('fitbit'))) && (
                    <FitbitMark size={15} className="rounded-[4px]" />
                  )}
                  {(readiness.providerUsed === 'strava' || (readiness.providerUsed === 'composite' && activeProviders.includes('strava'))) && (
                    <StravaMark size={15} className="rounded-[4px]" />
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
      </button>
      {modalOpen && (
        <Suspense fallback={null}>
          <WearablesModal isOpen={modalOpen} onClose={() => { setModalOpen(false); refresh(); }} />
        </Suspense>
      )}
    </>
  );
}
