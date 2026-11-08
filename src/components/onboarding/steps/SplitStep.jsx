import React from 'react';
import { SPLITS, SPLIT_BY_DAYS } from '../profileSchema';
import { SelectCard } from '../ui';

export default function SplitStep({ profile, set }) {
  const ideal = SPLIT_BY_DAYS[profile.daysPerWeek];
  return (
    <div role="radiogroup" aria-label="Divisão de treino" className="grid grid-cols-1 gap-2.5">
      {SPLITS.map((o) => (
        <SelectCard
          key={o.id}
          option={o}
          selected={profile.splitPreference === o.id}
          onSelect={(id) => set('splitPreference', id)}
          badge={o.id === ideal ? `Ideal p/ ${profile.daysPerWeek}x` : undefined}
        />
      ))}
    </div>
  );
}
