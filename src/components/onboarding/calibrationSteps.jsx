import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil } from 'lucide-react';
import { OptionCard, Segmented, PrecisionPicker, Chip, MicroLabel } from './controls';
import {
  GENDERS, GOALS, LEVELS, LOCATIONS, INJURIES, PRIORITY_MUSCLES, MAX_PRIORITY, DAYS, MINUTES,
  TRAINING_DAYS, WEEK_DAYS, formatTrainingDays, SPLIT_SUMMARY, SPLIT_SUMMARY_SIMPLE, labelOf,
  SPORTS, SPORT_INTENSITIES, SESSION_ORDERS, overlapSportDays, sportVerdict, isBeginnerProfile
} from './profileSchema';
import { triggerHaptic } from '../../utils/audio';

const SPRING = { type: 'spring', stiffness: 300, damping: 28 };
const LB = 2.20462;
const IN = 2.54;
export const ARNOLD_SUMMARY = 'Peito+Costas / Ombros+Braços / Pernas × 2';

/** Para quem é iniciante, troca a nomenclatura inglesa (Push/Pull/Legs, Upper/Lower) por português simples. */
export const splitSummaryOf = (p) => {
  if (p.daysPerWeek === 6 && p.splitPreference === 'arnold') return ARNOLD_SUMMARY;
  const table = isBeginnerProfile(p) ? SPLIT_SUMMARY_SIMPLE : SPLIT_SUMMARY;
  return table[p.daysPerWeek];
};

function CardList({ options, value, onSelect, meta }) {
  return (
    <div role="radiogroup" className="space-y-2.5">
      {options.map((o) => (
        <OptionCard key={o.id} option={o} selected={value === o.id} onSelect={onSelect} meta={meta?.(o)} />
      ))}
    </div>
  );
}

function WeightControl({ profile, set, units, setUnits }) {
  const lbs = units.weight === 'lbs';
  const value = lbs ? Math.round(profile.weightKg * LB) : Math.round(profile.weightKg * 2) / 2;
  return (
    <div className="space-y-6">
      <Segmented label="Unidade de peso" value={units.weight} onChange={(v) => setUnits({ ...units, weight: v })} options={[{ id: 'kg', label: 'kg' }, { id: 'lbs', label: 'lbs' }]} />
      <PrecisionPicker
        label="Peso corporal"
        unit={units.weight}
        value={value}
        min={lbs ? 77 : 35}
        max={lbs ? 507 : 230}
        step={lbs ? 1 : 0.5}
        decimals={lbs ? 0 : 1}
        onChange={(v) => set('weightKg', lbs ? Math.round((v / LB) * 10) / 10 : v)}
      />
    </div>
  );
}

function HeightControl({ profile, set, units, setUnits }) {
  const ft = units.height === 'ft';
  const value = ft ? Math.round(profile.heightCm / IN) : Math.round(profile.heightCm);
  return (
    <div className="space-y-6">
      <Segmented label="Unidade de altura" value={units.height} onChange={(v) => setUnits({ ...units, height: v })} options={[{ id: 'cm', label: 'cm' }, { id: 'ft', label: 'ft / in' }]} />
      <PrecisionPicker
        label="Altura"
        unit={ft ? '' : 'cm'}
        value={value}
        min={ft ? 47 : 120}
        max={ft ? 90 : 230}
        format={ft ? (v) => `${Math.floor(v / 12)}′${v % 12}″` : undefined}
        onChange={(v) => set('heightCm', ft ? Math.round(v * IN) : v)}
      />
    </div>
  );
}

function FrequencyControl({ profile, set }) {
  const days = profile.daysPerWeek;
  const activeDays = Array.isArray(profile.trainingDays) && profile.trainingDays.length === days
    ? profile.trainingDays
    : (days ? (TRAINING_DAYS[days] || [0, 2, 4]) : []);

  const handlePreset = (v) => {
    triggerHaptic(8);
    const defaultDays = TRAINING_DAYS[v] || [0, 2, 4];
    set({
      daysPerWeek: v,
      trainingDays: defaultDays,
      splitPreference: v === 6 ? profile.splitPreference : 'auto'
    });
  };

  const handleToggleDay = (idx) => {
    const isCurrentlyActive = activeDays.includes(idx);
    let nextDays;
    if (isCurrentlyActive) {
      if (activeDays.length <= 3) {
        triggerHaptic(20);
        return; // mínimo 3 dias
      }
      nextDays = activeDays.filter((d) => d !== idx);
    } else {
      if (activeDays.length >= 6) {
        triggerHaptic(20);
        return; // máximo 6 dias
      }
      nextDays = [...activeDays, idx].sort((a, b) => a - b);
    }
    triggerHaptic(10);
    const count = nextDays.length;
    set({
      daysPerWeek: count,
      trainingDays: nextDays,
      splitPreference: count === 6 ? profile.splitPreference : 'auto'
    });
  };

  const formattedSelected = formatTrainingDays(activeDays);

  return (
    <div className="space-y-6">
      <Segmented
        label="Dias por semana"
        size="lg"
        value={days}
        onChange={handlePreset}
        options={DAYS.map((d) => ({ id: d, label: String(d) }))}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <MicroLabel>Personalizar dias de treino</MicroLabel>
          <span className="text-micro tabular-nums text-zinc-400">
            {activeDays.length} selecionado{activeDays.length !== 1 ? 's' : ''} (3 a 6)
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Dias de treino na semana">
          {WEEK_DAYS.map((w) => {
            const on = activeDays.includes(w.index);
            return (
              <motion.button
                key={w.index}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => handleToggleDay(w.index)}
                aria-pressed={on}
                aria-label={`${w.name}: ${on ? 'Dia de treino' : 'Descanso'}`}
                className={`h-14 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer select-none ${
                  on
                    ? 'bg-accent/80 text-white border-accent shadow-[0_0_12px_rgba(235,94,40,0.25)]'
                    : 'bg-surface-2 text-zinc-400 border-white/[0.07] hover:border-white/[0.15] hover:text-zinc-200'
                }`}
              >
                <span className="text-[12px] font-bold tracking-tight">{w.short}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    on ? 'bg-white scale-100 opacity-100' : 'bg-transparent scale-50 opacity-0'
                  }`}
                />
              </motion.button>
            );
          })}
        </div>
        <p className="text-micro text-zinc-500 text-center">
          {formattedSelected ? `Treino: ${formattedSelected}` : 'Toca nos dias para ativar ou desativar o treino.'}
        </p>
      </div>

      <div className="rounded-2xl bg-surface-2 border border-white/[0.07] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" aria-live="polite">
        <MicroLabel>Split recomendado</MicroLabel>
        {days ? (
          <motion.p key={`${days}-${profile.splitPreference}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="mt-1.5 font-heading text-section font-semibold text-zinc-100 tabular-nums">
            {days} dias · {splitSummaryOf(profile)}
          </motion.p>
        ) : (
          <p className="mt-1.5 text-body text-zinc-400">Escolhe quantos dias treinas.</p>
        )}
      </div>

      {days === 6 && (
        <Segmented
          label="Divisão de 6 dias"
          value={profile.splitPreference === 'arnold' ? 'arnold' : 'auto'}
          onChange={(v) => set('splitPreference', v)}
          options={[{ id: 'auto', label: 'Push / Pull / Legs' }, { id: 'arnold', label: 'Arnold Split' }]}
        />
      )}
    </div>
  );
}

const ENV_CACHE = { counts: null };
function useEnvironmentCounts() {
  const [counts, setCounts] = useState(ENV_CACHE.counts);
  useEffect(() => {
    if (counts) return undefined;
    let alive = true;
    import('../../data/exerciseCatalog').then(({ EXERCISE_CATALOG }) => {
      const c = {};
      Object.values(EXERCISE_CATALOG).forEach((e) => {
        c[e.environment] = (c[e.environment] || 0) + 1;
      });
      ENV_CACHE.counts = c;
      if (alive) setCounts(c);
    });
    return () => {
      alive = false;
    };
  }, [counts]);
  return counts;
}

function LocationControl({ profile, set }) {
  const counts = useEnvironmentCounts();
  const total = (loc) => loc.environments.reduce((s, env) => s + (counts?.[env] || 0), 0);
  return (
    <CardList
      options={LOCATIONS}
      value={profile.trainingLocation}
      onSelect={(v) => set('trainingLocation', v)}
      meta={(o) => (counts ? `${total(o)} exercícios no catálogo` : 'A ler catálogo')}
    />
  );
}

function RestrictionsControl({ profile, set }) {
  const toggleInjury = (id) => {
    if (id === 'none') return set('injuries', []);
    const has = profile.injuries.includes(id);
    set('injuries', has ? profile.injuries.filter((x) => x !== id) : [...profile.injuries, id]);
  };
  const toggleMuscle = (id) => {
    const has = profile.priorityMuscles.includes(id);
    set('priorityMuscles', has ? profile.priorityMuscles.filter((x) => x !== id) : [...profile.priorityMuscles, id].slice(-MAX_PRIORITY));
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <MicroLabel>Lesões ou dores</MicroLabel>
        <div className="grid grid-cols-2 gap-2">
          <Chip label="Nenhuma" selected={profile.injuries.length === 0} onToggle={() => toggleInjury('none')} />
          {INJURIES.map((o) => (
            <Chip key={o.id} label={o.label} selected={profile.injuries.includes(o.id)} onToggle={() => toggleInjury(o.id)} />
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between">
          <MicroLabel>Músculos prioritários</MicroLabel>
          <span className="text-micro tabular-nums text-zinc-500">{profile.priorityMuscles.length} / {MAX_PRIORITY}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRIORITY_MUSCLES.map((o) => (
            <Chip key={o.id} label={o.label} selected={profile.priorityMuscles.includes(o.id)} onToggle={() => toggleMuscle(o.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SportScreeningControl({ profile, set }) {
  const overlap = overlapSportDays(profile);
  const verdict = sportVerdict(profile);

  const chooseHasSport = (value) => {
    triggerHaptic(10);
    set(value ? { hasSport: true } : { hasSport: false, sports: [], otherSport: '', sportDays: [], sportIntensity: null, sessionOrder: null });
  };
  const toggleSport = (id) => {
    const has = profile.sports.includes(id);
    set('sports', has ? profile.sports.filter((x) => x !== id) : [...profile.sports, id]);
  };
  const toggleSportDay = (idx) => {
    triggerHaptic(10);
    const has = profile.sportDays.includes(idx);
    set('sportDays', has ? profile.sportDays.filter((x) => x !== idx) : [...profile.sportDays, idx].sort((a, b) => a - b));
  };

  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label="É atleta híbrido?" className="space-y-2.5">
        <OptionCard option={{ id: true, label: 'Sim, sou atleta híbrido', hint: 'Pratico desporto além do ginásio', icon: 'Trophy' }} selected={profile.hasSport === true} onSelect={() => chooseHasSport(true)} />
        <OptionCard option={{ id: false, label: 'Não, foco exclusivo em musculação', hint: 'Avança diretamente para o treino', icon: 'Dumbbell' }} selected={profile.hasSport === false} onSelect={() => chooseHasSport(false)} />
      </div>

      <AnimatePresence initial={false}>
        {profile.hasSport === true && (
          <motion.div key="sport-layers" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="overflow-hidden">
            <div className="space-y-6 pt-1">
              <div className="space-y-2.5">
                <MicroLabel>Modalidade(s)</MicroLabel>
                <div className="grid grid-cols-2 gap-2">
                  {SPORTS.map((o) => (
                    <Chip key={o.id} label={o.label} selected={profile.sports.includes(o.id)} onToggle={() => toggleSport(o.id)} />
                  ))}
                </div>
                <AnimatePresence initial={false}>
                  {profile.sports.includes('outro') && (
                    <motion.div key="other-sport" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="overflow-hidden">
                      <input
                        type="text"
                        value={profile.otherSport}
                        onChange={(e) => set('otherSport', e.target.value)}
                        placeholder="Qual modalidade?"
                        className="w-full min-h-[48px] mt-2 px-4 rounded-2xl bg-surface-2 border border-white/[0.07] text-body text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-accent-hover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence initial={false}>
                {profile.sports.length > 0 && (
                  <motion.div key="sport-days" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="overflow-hidden">
                    <div className="space-y-2">
                      <MicroLabel>Dias de desporto</MicroLabel>
                      <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Dias de desporto na semana">
                        {WEEK_DAYS.map((w) => {
                          const on = profile.sportDays.includes(w.index);
                          return (
                            <motion.button
                              key={w.index}
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => toggleSportDay(w.index)}
                              aria-pressed={on}
                              aria-label={`${w.name}: ${on ? 'Dia de desporto' : 'Sem desporto'}`}
                              className={`h-11 min-w-[44px] rounded-xl flex items-center justify-center text-[12px] font-bold tracking-tight border transition-all cursor-pointer select-none ${
                                on ? 'bg-accent/80 text-white border-accent' : 'bg-surface-2 text-zinc-400 border-white/[0.07] hover:border-white/[0.15]'
                              }`}
                            >
                              {w.letter}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {profile.sportDays.length > 0 && (
                  <motion.div key="sport-intensity" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="overflow-hidden">
                    <Segmented label="Nível de intensidade" size="lg" value={profile.sportIntensity} onChange={(v) => set('sportIntensity', v)} options={SPORT_INTENSITIES} />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {profile.sportIntensity && overlap.length > 0 && (
                  <motion.div key="session-order" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={SPRING} className="overflow-hidden space-y-2">
                    <MicroLabel>Nos dias partilhados, a musculação é feita</MicroLabel>
                    <Segmented value={profile.sessionOrder} onChange={(v) => set('sessionOrder', v)} options={SESSION_ORDERS} />
                  </motion.div>
                )}
              </AnimatePresence>

              {verdict && (
                <motion.div key={verdict} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="rounded-2xl bg-surface-2 border border-white/[0.07] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" aria-live="polite">
                  <MicroLabel>AB Coach</MicroLabel>
                  <p className="mt-1.5 text-body text-zinc-100 leading-relaxed">{verdict}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const listOf = (ids, opts, empty) => (ids.length ? ids.map((id) => labelOf(opts, id)).join(', ') : empty);

function ReviewControl({ profile, goTo }) {
  const formattedDays = formatTrainingDays(profile.trainingDays);
  const sportSummary = profile.hasSport
    ? `${listOf(profile.sports, SPORTS, '—')} · ${formatTrainingDays(profile.sportDays) || '—'} · ${labelOf(SPORT_INTENSITIES, profile.sportIntensity)}`
    : 'Foco exclusivo em musculação';
  const rows = [
    ['Objetivo', labelOf(GOALS, profile.primaryGoal), 'goal'],
    ['Experiência', labelOf(LEVELS, profile.experienceLevel), 'level'],
    ['Biometria', `${profile.age} anos · ${profile.weightKg.toLocaleString('pt-PT')} kg · ${profile.heightCm} cm`, 'weight'],
    ['Frequência', `${profile.daysPerWeek} dias · ${splitSummaryOf(profile)}`, 'frequency'],
    ['Dias de treino', formattedDays || `${profile.daysPerWeek} dias`, 'frequency'],
    ['Atleta híbrido', sportSummary, 'sport'],
    ['Sessão', `${profile.sessionMinutes === 75 ? '75+' : profile.sessionMinutes} min`, 'minutes'],
    ['Local', labelOf(LOCATIONS, profile.trainingLocation), 'location'],
    ['Restrições', listOf(profile.injuries, INJURIES, 'Nenhuma'), 'restrictions'],
    ['Prioridade', listOf(profile.priorityMuscles, PRIORITY_MUSCLES, 'Equilibrado'), 'restrictions']
  ];
  return (
    <ul className="rounded-2xl bg-surface-2 border border-white/[0.07] divide-y divide-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      {rows.map(([label, value, id]) => (
        <li key={label} className="flex items-center gap-3 pl-4 pr-1.5 py-1">
          <div className="flex-1 min-w-0 py-2">
            <MicroLabel>{label}</MicroLabel>
            <span className="block text-body text-zinc-100 mt-0.5 tabular-nums">{value}</span>
          </div>
          <button type="button" onClick={() => goTo(id)} aria-label={`Editar ${label}`} className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-100 cursor-pointer">
            <Pencil className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Um conceito por ecrã. `fields` define quando o CTA fica ativo. */
export const CALIBRATION_STEPS = [
  { id: 'goal', title: 'Qual é o teu objetivo principal?', sub: 'Define a carga, o volume e o descanso de cada sessão.', fields: ['primaryGoal'], render: (p) => <CardList options={GOALS} value={p.profile.primaryGoal} onSelect={(v) => p.set('primaryGoal', v)} /> },
  { id: 'level', title: 'Qual é a tua experiência?', sub: 'Ajusta a complexidade dos exercícios e a progressão.', fields: ['experienceLevel'], render: (p) => <CardList options={LEVELS} value={p.profile.experienceLevel} onSelect={(v) => p.set('experienceLevel', v)} /> },
  { id: 'gender', title: 'Como te identificas?', sub: 'Usado só para calibrar referências de carga.', fields: ['gender'], render: (p) => <CardList options={GENDERS} value={p.profile.gender} onSelect={(v) => p.set('gender', v)} /> },
  { id: 'age', title: 'Qual é a tua idade?', sub: 'Influencia a recuperação entre sessões.', fields: ['age'], render: (p) => <PrecisionPicker label="Idade" unit="anos" value={p.profile.age} min={14} max={90} onChange={(v) => p.set('age', v)} /> },
  { id: 'weight', title: 'Qual é o teu peso?', sub: 'Ponto de partida do teu portfólio corporal.', fields: ['weightKg'], render: (p) => <WeightControl {...p} /> },
  { id: 'height', title: 'Qual é a tua altura?', sub: 'Completa a tua biometria base.', fields: ['heightCm'], render: (p) => <HeightControl {...p} /> },
  { id: 'frequency', title: 'Quantos dias treinas por semana?', sub: 'A divisão do treino adapta-se em tempo real.', fields: ['daysPerWeek'], render: (p) => <FrequencyControl {...p} /> },
  {
    id: 'sport',
    title: 'Praticas outro desporto?',
    sub: 'Protegemos a recuperação entre a musculação e a tua modalidade.',
    fields: (profile) => {
      if (profile.hasSport !== true) return ['hasSport'];
      const base = ['hasSport', 'sports', 'sportDays', 'sportIntensity'];
      return overlapSportDays(profile).length > 0 ? [...base, 'sessionOrder'] : base;
    },
    render: (p) => <SportScreeningControl {...p} />
  },
  { id: 'minutes', title: 'Quanto tempo tens por sessão?', sub: 'Controla o número de séries por exercício.', fields: ['sessionMinutes'], render: (p) => <Segmented label="Minutos por sessão" size="lg" value={p.profile.sessionMinutes} onChange={(v) => p.set('sessionMinutes', v)} options={MINUTES.map((m) => ({ id: m, label: m === 75 ? '75+ min' : `${m} min` }))} /> },
  { id: 'location', title: 'Onde vais treinar?', sub: 'O catálogo filtra-se pelo equipamento disponível.', fields: ['trainingLocation'], render: (p) => <LocationControl {...p} /> },
  { id: 'restrictions', title: 'Restrições e foco', sub: 'Protegemos zonas sensíveis e reforçamos as prioritárias.', fields: [], render: (p) => <RestrictionsControl {...p} /> },
  { id: 'review', title: 'Confirma a calibração', sub: 'Toca no lápis para corrigir qualquer ponto.', fields: [], render: (p) => <ReviewControl {...p} /> }
];
