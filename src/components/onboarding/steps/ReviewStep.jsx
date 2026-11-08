import React from 'react';
import { Pencil } from 'lucide-react';
import { GENDERS, GOALS, LEVELS, LOCATIONS, SPLITS, INJURIES, PRIORITY_MUSCLES, labelOf } from '../profileSchema';

const list = (ids, opts, empty) => (ids.length ? ids.map((id) => labelOf(opts, id)).join(', ') : empty);

export default function ReviewStep({ profile, goTo }) {
  const rows = [
    ['Corpo', `${labelOf(GENDERS, profile.gender)} · ${profile.age} anos · ${profile.weightKg.toLocaleString('pt-PT')} kg · ${profile.heightCm} cm`, 0],
    ['Meta', labelOf(GOALS, profile.primaryGoal), 1],
    ['Nível', labelOf(LEVELS, profile.experienceLevel), 2],
    ['Rotina', `${labelOf(LOCATIONS, profile.trainingLocation)} · ${profile.daysPerWeek}x por semana · ${profile.sessionMinutes === 75 ? '75+' : profile.sessionMinutes} min`, 3],
    ['Divisão', labelOf(SPLITS, profile.splitPreference), 4],
    ['Lesões', list(profile.injuries, INJURIES, 'Nenhuma'), 5],
    ['Prioridade', list(profile.priorityMuscles, PRIORITY_MUSCLES, 'Equilibrado'), 5]
  ];

  return (
    <ul className="rounded-2xl bg-surface/80 backdrop-blur-md border border-white/10 divide-y divide-white/10">
      {rows.map(([label, value, step]) => (
        <li key={label} className="flex items-center gap-3 pl-4 pr-1.5 py-1.5">
          <div className="flex-1 min-w-0 py-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{label}</span>
            <span className="block text-sm text-zinc-100 mt-0.5">{value}</span>
          </div>
          <button
            type="button"
            onClick={() => goTo(step)}
            aria-label={`Editar ${label}`}
            className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-zinc-400 hover:text-accent hover:bg-accent/10 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
