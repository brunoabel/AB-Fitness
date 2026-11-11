import React from 'react';
import { Edit2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningShareModal.jsx (estado e handlers recebidos por props). */
export default function ShareTitleEditor({ isEditingTitle, sessionTitle, setIsEditingTitle, setSessionTitle }) {
  return (
    <>
      {/* Customização: Título da Sessão */}
      <div className="px-3 py-1.5 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 shrink-0">
            Título:
          </span>
          {isEditingTitle ? (
            <input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className="w-full px-2 py-0.5 rounded-lg bg-zinc-800 border border-orange-500/50 text-white text-xs font-bold outline-none"
            />
          ) : (
            <span 
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold text-white hover:text-orange-400 transition-colors cursor-pointer truncate flex items-center gap-1.5"
              title="Clique para editar"
            >
              <span className="truncate">{sessionTitle}</span>
              <Edit2 className="w-3 h-3 text-zinc-500 shrink-0" />
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setSessionTitle(sessionTitle === 'Sessão de Treino de Hoje' ? 'Corrida Matinal' : 'Sessão de Treino de Hoje');
            triggerHaptic(8);
          }}
          className="text-[11px] text-orange-400 hover:underline font-bold shrink-0 cursor-pointer"
        >
          Alternar
        </button>
      </div>

    </>
  );
}
