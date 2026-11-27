import React, { useMemo, useState } from 'react';
import { Check, ChevronRight, UserRound } from 'lucide-react';
import { Sheet } from '../social/ui';
import AthleteCard from '../social/AthleteCard';
import { CARD_METRICS, CARD_THEMES, buildCardMetrics, normalizeMetricIds, themeBackground } from '../../utils/profileCard';
import { triggerHaptic } from '../../utils/audio';

/**
 * Personalizar o cartão de perfil: tema e as 3 métricas, com pré-visualização ao vivo.
 * `onSave({ coverStyle, metricIds })` grava (o tema no perfil, as métricas neste aparelho).
 * `onEditProfile` abre a edição de foto, nome, bio e @username (substitui o antigo botão de lápis).
 */
export default function CardCustomizeSheet({ profile, stats, extra, metricIds, saving = false, onSave, onEditProfile, onClose }) {
  const [coverStyle, setCoverStyle] = useState(profile?.cover_style || CARD_THEMES[0].id);
  const [selected, setSelected] = useState(() => normalizeMetricIds(metricIds));

  const previewMetrics = useMemo(() => buildCardMetrics(selected, stats, extra), [selected, stats, extra]);

  const toggleMetric = (id) => {
    triggerHaptic(8);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.length > 1 ? prev.filter((m) => m !== id) : prev;
      // Já com 3: a mais antiga dá lugar à nova
      return prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id];
    });
  };

  const canSave = selected.length === 3 && !saving;

  return (
    <Sheet
      title="Personalizar cartão"
      onClose={onClose}
      footer={
        <button
          type="button"
          disabled={!canSave}
          onClick={() => {
            triggerHaptic(12);
            onSave({ coverStyle, metricIds: selected });
          }}
          className="w-full min-h-[50px] rounded-full bg-primary text-app font-semibold text-sm cursor-pointer active:scale-[0.98] transition-[transform,opacity] duration-150 disabled:opacity-40"
        >
          {saving ? 'A guardar…' : selected.length < 3 ? `Escolhe mais ${3 - selected.length}` : 'Guardar'}
        </button>
      }
    >
      <div className="space-y-7 pt-2">
        <AthleteCard profile={{ ...profile, cover_style: coverStyle }} stats={stats} metrics={previewMetrics} showcase />

        {onEditProfile && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              onEditProfile();
            }}
            className="w-full min-h-[52px] flex items-center gap-3 border-y border-white/[0.06] text-left cursor-pointer"
          >
            <UserRound className="w-[18px] h-[18px] text-zinc-400 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-sm text-white">Foto, nome e bio</span>
            <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" strokeWidth={2} />
          </button>
        )}

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Tema</p>
          <div className="grid grid-cols-4 gap-3">
            {CARD_THEMES.map((t) => {
              const on = coverStyle === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    triggerHaptic(8);
                    setCoverStyle(t.id);
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <span
                    className={`w-full aspect-square rounded-2xl border flex items-center justify-center transition-[border-color,transform] duration-150 ${
                      on ? 'border-white scale-[1.04]' : 'border-white/[0.1]'
                    }`}
                    style={{ background: themeBackground(t) }}
                  >
                    {on && <Check className="w-4 h-4 text-white" strokeWidth={2} />}
                  </span>
                  <span className={`text-[11px] font-medium ${on ? 'text-white' : 'text-zinc-400'}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Métricas</p>
            <span className="text-[11px] text-zinc-500 tabular-nums">{selected.length} de 3</span>
          </div>
          <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
            {CARD_METRICS.map((m) => {
              const position = selected.indexOf(m.id);
              const on = position !== -1;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleMetric(m.id)}
                    className="w-full min-h-[52px] flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-white">{m.label}</span>
                      {!m.server && <span className="block text-[11px] text-zinc-500">Só no teu cartão e nas partilhas</span>}
                    </span>
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-semibold tabular-nums ${
                        on ? 'bg-white text-app border-white' : 'border-white/[0.2] text-transparent'
                      }`}
                    >
                      {on ? position + 1 : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
