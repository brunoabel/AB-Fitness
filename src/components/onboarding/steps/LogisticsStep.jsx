import React from 'react';
import { LOCATIONS, DAYS, MINUTES } from '../profileSchema';
import { ChipGroup, FieldLabel, SelectCard } from '../ui';

export default function LogisticsStep({ profile, set }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Onde vais treinar</FieldLabel>
        <div role="radiogroup" aria-label="Local de treino" className="grid grid-cols-1 gap-2">
          {LOCATIONS.map((o) => (
            <SelectCard key={o.id} option={o} selected={profile.trainingLocation === o.id} onSelect={(id) => set('trainingLocation', id)} />
          ))}
        </div>
      </div>
      <div>
        <FieldLabel aside="dias por semana">Frequência</FieldLabel>
        <ChipGroup
          label="Dias por semana"
          options={DAYS.map((d) => ({ id: d, label: `${d}x` }))}
          value={profile.daysPerWeek}
          onToggle={(id) => set('daysPerWeek', id)}
        />
      </div>
      <div>
        <FieldLabel aside="por sessão">Tempo disponível</FieldLabel>
        <ChipGroup
          label="Minutos por sessão"
          columns={3}
          options={MINUTES.map((m) => ({ id: m, label: m === 75 ? '75+ min' : `${m} min` }))}
          value={profile.sessionMinutes}
          onToggle={(id) => set('sessionMinutes', id)}
        />
      </div>
    </div>
  );
}
