import React from 'react';
import { QUICK_FOCUS_OPTIONS, DURATION_OPTIONS } from './options';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de CustomWorkoutModal.jsx (estado e handlers recebidos por props). */
export default function WorkoutDetailsForm({ description, duration, focus, level, setDescription, setDuration, setFocus, setLevel, setTitle, setTrainerNotes, title, trainerNotes }) {
  return (
    <>
      {/* 1. SEÇÃO: DADOS DO TREINO & NÍVEL */}
      <div className="space-y-3.5 pt-1">
        {/* Nome do Treino */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">
            Nome do Treino <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Treino A - Peitoral e Tríceps"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-sm font-semibold text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all"
          />
        </div>

        {/* SELETOR DE NÍVEL (Iniciante, Intermédio, Avançado) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-zinc-300">
              Nível de Experiência
            </label>
            <span className="text-[11px] text-zinc-500 uppercase font-semibold tracking-wider">
              Disponível para todos
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Iniciante', label: 'Iniciante', desc: 'Adaptação' },
              { id: 'Intermédio', label: 'Intermédio', desc: 'Volume & Carga' },
              { id: 'Avançado', label: 'Avançado', desc: 'Alta Intensidade' }
            ].map((item) => {
              const isSelected = level === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setLevel(item.id);
                    triggerHaptic(10);
                  }}
                  className={`min-h-[48px] p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-accent/70 text-white border-accent-hover font-bold shadow-xs'
                      : 'bg-surface border-white/10 text-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/75' : 'text-zinc-500'}`}>{item.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Foco Muscular */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">
            Foco Muscular / Grupamento
          </label>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ex: Peito, Ombros e Tríceps"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-sm font-semibold text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all mb-2"
          />

          {/* Sugestões Rápidas de Foco */}
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
            {QUICK_FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setFocus(opt);
                  triggerHaptic(10);
                }}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                  focus === opt
                    ? 'bg-accent/70 text-white border-white'
                    : 'bg-surface text-zinc-300 border-white/10 hover:border-zinc-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Duração Estimada */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">
            Duração Estimada
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DURATION_OPTIONS.map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => {
                  setDuration(dur);
                  triggerHaptic(10);
                }}
                className={`min-h-[44px] text-xs font-mono tabular-nums font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  duration === dur
                    ? 'bg-accent/70 text-white border-white'
                    : 'bg-surface text-zinc-300 border-white/10 hover:border-zinc-400'
                }`}
              >
                {dur}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição / Objetivo do Treino */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">
            Descrição / Objetivo do Treino <span className="text-zinc-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Treino focado em força bruta e sobrecarga progressiva"
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all"
          />
        </div>

        {/* Observações do Treinador */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5">
            Observações / Prescrição do Treinador <span className="text-zinc-400 font-normal">(Opcional)</span>
          </label>
          <textarea
            value={trainerNotes}
            onChange={(e) => setTrainerNotes(e.target.value)}
            placeholder="Ex: Descanso de 60s entre séries. Cadência 3s excêntrica. Focar em não usar impulsão."
            rows={2}
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-white/10 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all resize-none"
          />
        </div>
      </div>

    </>
  );
}
