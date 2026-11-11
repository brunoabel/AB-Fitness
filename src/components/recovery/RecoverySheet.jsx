import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Play, Clock3 } from 'lucide-react';
import { Sheet } from '../social/ui';
import VideoSurface from '../video/VideoSurface';
import { getExerciseMedia } from '../../data/exerciseMedia';
import { KIND_LABEL, planFor } from '../../data/recoveryProtocols';
import { HEAT_GRADIENT, STATUS_LABEL, sinceLabel } from './heat';
import { triggerHaptic } from '../../utils/audio';

const ADVICE = {
  fatigued: 'Evita carga pesada neste grupo hoje. Alongar e libertar ajuda a circulação sem atrasar a recuperação.',
  recovering: 'Aguenta trabalho leve ou técnico. Guarda as séries pesadas para quando estiver fresco.',
  fresh: 'Pronto para carga. Estes exercícios mantêm a mobilidade e reduzem o risco de lesão.'
};

function Drill({ drill, open, onToggle }) {
  const media = drill.catalogId ? getExerciseMedia(drill.catalogId) : null;
  const hasVideo = Boolean(media?.videoMale);

  return (
    <li className="rounded-2xl bg-surface-2 border border-white/[0.08] overflow-hidden">
      <button
        type="button"
        disabled={!hasVideo}
        onClick={onToggle}
        aria-expanded={hasVideo ? open : undefined}
        className="w-full flex items-start gap-3 p-3 text-left enabled:cursor-pointer"
      >
        <span className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-surface-3 border border-white/[0.06] flex items-center justify-center">
          {media?.poster && <img src={media.poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
          {hasVideo ? <Play className="relative w-4 h-4 text-white" strokeWidth={2} fill="currentColor" /> : <Clock3 className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-body font-semibold text-white leading-snug">{drill.name}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]">
            <span className="px-2 py-0.5 rounded-md bg-accent/70 border border-accent-hover text-white font-semibold">{KIND_LABEL[drill.kind]}</span>
            <span className="text-zinc-300 tabular-nums">{drill.dose}</span>
            {!hasVideo && <span className="text-zinc-500">Vídeo em breve</span>}
          </span>
          <span className="mt-1.5 block text-[13px] text-zinc-400 leading-relaxed">{drill.cue}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && hasVideo && (
          <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="px-3 pb-3">
            <VideoSurface src={media.videoMale} poster={media.poster} className="aspect-video rounded-xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** Folha do músculo tocado: estado de fadiga e o plano de recuperação (ou prevenção, se estiver fresco). */
export default function RecoverySheet({ muscle, onClose }) {
  const { mode, drills } = planFor(muscle.id, muscle.fatigue);
  const [openId, setOpenId] = useState(null);
  const since = sinceLabel(muscle.lastTrainedAt);

  return (
    <Sheet title={muscle.label} label={`Recuperação: ${muscle.label}`} onClose={onClose}>
      <div className="pt-1">
        <div className="flex items-end justify-between gap-3">
          <p className="font-display font-bold text-[44px] leading-none tracking-tight text-white tabular-nums">
            {muscle.fatigue}
            <span className="text-[22px] text-zinc-400">%</span>
          </p>
          <p className="pb-1 text-right text-[13px] text-zinc-400">
            <span className="block text-body font-semibold text-white">{STATUS_LABEL[muscle.status]}</span>
            {muscle.hoursToRecovered > 0 ? `Fresco em cerca de ${muscle.hoursToRecovered} h` : 'Pronto para treinar'}
          </p>
        </div>
        <p className="mt-1 text-[13px] text-zinc-400">de fadiga{since ? `, último estímulo ${since}` : ', sem carga nas últimas 72 h'}</p>

        {/* Medidor: rampa completa revelada até ao valor atual (só transform) */}
        <div className="relative mt-4 h-2 rounded-full overflow-hidden" style={{ background: HEAT_GRADIENT }} aria-hidden>
          <motion.span
            className="absolute inset-0 bg-surface-3"
            initial={{ x: '0%' }}
            animate={{ x: `${Math.max(2, muscle.fatigue)}%` }}
            transition={{ type: 'spring', stiffness: 220, damping: 30, delay: 0.12 }}
          />
        </div>

        <p className="mt-4 text-body text-zinc-300 leading-relaxed">{ADVICE[muscle.status]}</p>

        <h3 className="mt-6 mb-2.5 font-heading text-section font-semibold text-white">{mode === 'recover' ? 'Plano de recuperação' : 'Prevenção de lesões'}</h3>
        <ol className="space-y-2">
          {drills.map((d) => (
            <Drill
              key={d.id}
              drill={d}
              open={openId === d.id}
              onToggle={() => {
                triggerHaptic(8);
                setOpenId((cur) => (cur === d.id ? null : d.id));
              }}
            />
          ))}
        </ol>
      </div>
    </Sheet>
  );
}
