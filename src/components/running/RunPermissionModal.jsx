import React from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';

/** Modal explicativo de localização em linguagem humana, sem jargões. */
export default function RunPermissionModal({ handleStartCountdown, setShowPermissionModal, showPermissionModal }) {
  if (!showPermissionModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-[#090b10] border border-white/[0.1] p-6 text-white shadow-2xl space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-black text-white tracking-tight">
              Ativar localização da corrida
            </h3>
            <p className="text-xs text-zinc-400">
              Para traçar o teu percurso, distância e ritmo em tempo real.
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Escolhe &ldquo;Permitir durante o uso da app&rdquo;</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mantém a &ldquo;Localização Precisa&rdquo; ligada no telemóvel</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowPermissionModal(false)}
            className="flex-1 min-h-[48px] px-4 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-zinc-300 font-semibold text-sm cursor-pointer transition-colors"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={handleStartCountdown}
            className="flex-1 min-h-[48px] px-4 rounded-2xl bg-white hover:bg-zinc-100 text-black font-bold text-sm cursor-pointer transition-colors"
          >
            Permitir
          </button>
        </div>
      </div>
    </div>
  );
}
