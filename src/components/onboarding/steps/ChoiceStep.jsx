import React from 'react';
import { SelectCard } from '../ui';

/** Etapa de escolha única com cartões táteis (meta, nível...). */
export default function ChoiceStep({ options, field, label, profile, set }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-1 gap-2.5">
      {options.map((o) => (
        <SelectCard key={o.id} option={o} selected={profile[field] === o.id} onSelect={(id) => set(field, id)} />
      ))}
    </div>
  );
}
