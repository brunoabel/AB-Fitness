import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Play } from 'lucide-react';
import { useAuth } from '../../context';
import { listMyAssignedPrograms, getMyTrainer, assignedProgramToWorkout, canUseTrainerHub } from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';

/** "Prescrito pelo teu PT": treinos atribuídos pelo trainer, fora do plano semanal/custom. */
export default function AssignedProgramsCard({ onStartWorkout }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [programs, setPrograms] = useState([]);
  const [trainer, setTrainer] = useState(null);

  useEffect(() => {
    if (!canUseTrainerHub(userId)) return undefined;
    let alive = true;
    Promise.all([listMyAssignedPrograms(userId), getMyTrainer()]).then(([progs, tr]) => {
      if (!alive) return;
      setPrograms(progs.data || []);
      setTrainer(tr.data || null);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (!programs.length) return null;

  return (
    <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 -mt-1">
      <div className="rounded-2xl bg-surface-2 border border-accent-hover/50 overflow-hidden">
        <div className="px-4 pt-3.5 pb-1 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-white" strokeWidth={1.75} />
          <span className="text-micro uppercase tracking-wider text-zinc-400">
            Prescrito por {trainer?.full_name || 'o teu PT'}
          </span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {programs.map((p) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-body font-semibold text-white truncate">{p.title}</p>
                <p className="text-[12px] text-zinc-400">
                  {(p.structure_json || []).length} exercícios
                  {p.target_rpe ? ` • RPE ${p.target_rpe}` : ''}
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  triggerHaptic(10);
                  onStartWorkout(assignedProgramToWorkout(p, trainer?.full_name));
                }}
                className="min-h-[40px] px-3.5 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
                Começar
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
