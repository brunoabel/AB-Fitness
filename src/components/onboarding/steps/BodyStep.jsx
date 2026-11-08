import React from 'react';
import { GENDERS } from '../profileSchema';
import { FieldLabel, RangeField, SelectCard } from '../ui';

export default function BodyStep({ profile, set }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Género</FieldLabel>
        <div role="radiogroup" aria-label="Género" className="grid grid-cols-1 gap-2">
          {GENDERS.map((g) => (
            <SelectCard key={g.id} option={g} selected={profile.gender === g.id} onSelect={(id) => set('gender', id)} />
          ))}
        </div>
      </div>
      <RangeField label="Idade" value={profile.age} min={14} max={90} unit="anos" onChange={(v) => set('age', v)} />
      <RangeField label="Peso atual" value={profile.weightKg} min={30} max={200} step={0.5} unit="kg" onChange={(v) => set('weightKg', v)} />
      <RangeField label="Altura" value={profile.heightCm} min={120} max={230} unit="cm" onChange={(v) => set('heightCm', v)} />
    </div>
  );
}
