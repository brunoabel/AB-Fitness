import React from 'react';
import { INJURIES, PRIORITY_MUSCLES, MAX_PRIORITY } from '../profileSchema';
import { ChipGroup, FieldLabel } from '../ui';

const NONE = 'none';

export default function RestrictionsStep({ profile, set }) {
  const injuryValue = profile.injuries.length ? profile.injuries : [NONE];

  const toggleInjury = (id) => {
    if (id === NONE) return set('injuries', []);
    const next = profile.injuries.includes(id) ? profile.injuries.filter((x) => x !== id) : [...profile.injuries, id];
    set('injuries', next);
  };

  const toggleMuscle = (id) => {
    const has = profile.priorityMuscles.includes(id);
    if (has) return set('priorityMuscles', profile.priorityMuscles.filter((x) => x !== id));
    // Ao passar do limite, substitui o mais antigo em vez de bloquear o toque
    const next = [...profile.priorityMuscles, id].slice(-MAX_PRIORITY);
    set('priorityMuscles', next);
  };

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel aside="vários">Lesões ou dores</FieldLabel>
        <ChipGroup
          label="Lesões"
          columns={2}
          options={[{ id: NONE, label: 'Nenhuma' }, ...INJURIES]}
          value={injuryValue}
          onToggle={toggleInjury}
        />
        <p className="text-xs text-zinc-400 mt-2">Os exercícios que sobrecarregam estas zonas são trocados por alternativas seguras.</p>
      </div>
      <div>
        <FieldLabel aside={`até ${MAX_PRIORITY} · ${profile.priorityMuscles.length}/${MAX_PRIORITY}`}>Músculos prioritários</FieldLabel>
        <ChipGroup label="Músculos prioritários" columns={2} options={PRIORITY_MUSCLES} value={profile.priorityMuscles} onToggle={toggleMuscle} />
        <p className="text-xs text-zinc-400 mt-2">Opcional. Recebem uma série extra por exercício.</p>
      </div>
    </div>
  );
}
