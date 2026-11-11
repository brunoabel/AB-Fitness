import React from 'react';
import { SUGGESTION_CHIPS } from './chips';
import CoachAvatar from './CoachAvatar';

/** Secção extraída de AICoachModal.jsx (estado e handlers recebidos por props). */
export default function CoachIntro({ handleSend, messages }) {
  return (
    <>
      {/* Apresentação Inicial */}
      {messages.length === 0 && (
        <div className="py-8 px-2 text-center max-w-lg mx-auto space-y-4">
          <CoachAvatar size={80} alt="AB Coach" className="mx-auto" />

          <div>
            <h3 className="text-base font-bold text-zinc-50">
              Como posso estruturar o teu treino hoje?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-sm mx-auto">
              Prescrevo sessões com foco anatómico específico (vasto medial, porção costal, deltoide posterior), adaptação a desconfortos e tempos reduzidos.
            </p>
          </div>

          {/* Sugestões Rápidas */}
          <div className="pt-2 text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 px-1">
              Exemplos de Pedidos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => handleSend(chip.prompt)}
                  className="p-3 rounded-lg text-left bg-surface-2 hover:bg-surface-3 border border-white/10 text-xs text-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span className="font-semibold block text-zinc-100">
                    {chip.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </>
  );
}
