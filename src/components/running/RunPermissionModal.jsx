import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

/** Secção extraída de RunningHub.jsx (estado e handlers recebidos por props). */
export default function RunPermissionModal({ handleStartCountdown, setShowPermissionModal, showPermissionModal }) {
  return (
    <>
      {/* Modal Explicativo de Permissão Progressiva */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-zinc-900 border border-zinc-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent/70 border border-accent-hover flex items-center justify-center text-white shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                  Permissão de Geolocalização
                </span>
                <h3 className="text-lg font-black text-white">
                  Ativar GPS de Alta Precisão
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Para desenhar o seu percurso em tempo real, medir cada quilómetro com precisão e calcular o seu ritmo (pace), o <strong>AB Fitness</strong> precisa de acesso à sua <strong>Localização Precisa</strong> durante o treino.
            </p>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Selecione &ldquo;Permitir durante o uso da app&rdquo;</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mantenha a opção &ldquo;Localização Precisa&rdquo; ligada (iOS/Android)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowPermissionModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Agora Não
              </button>
              <button
                onClick={handleStartCountdown}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-app font-black text-xs cursor-pointer transition-colors"
              >
                Continuar e Permitir
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
