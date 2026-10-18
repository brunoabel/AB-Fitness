import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import ABLogo from './ABLogo';

export default function Footer({ onOpenGuide }) {
  return (
    <footer className="w-full max-w-md mx-auto px-4 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500 space-y-3.5 transition-colors">
      <div className="flex items-center justify-center gap-3">
        <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex items-center gap-2">
          <ABLogo size={28} showText={false} />
          <span className="text-zinc-900 dark:text-white font-extrabold tracking-widest text-[11px] uppercase">
            AB FITNESS
          </span>
        </div>
        <span className="w-8 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <p className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] max-w-xs mx-auto leading-relaxed">
        Ciência do treinamento, sobrecarga progressiva e biomecânica de precisão.
      </p>

      {onOpenGuide && (
        <div>
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-700 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>Manuais de Treino: Futebol, Hipertrofia & Metas</span>
          </button>
        </div>
      )}

      {/* Assinatura Elegante e Discreta */}
      <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium flex items-center justify-center gap-1">
        <span>Desenvolvido por</span>
        <strong className="text-zinc-800 dark:text-zinc-200 font-bold">
          Bruno Abel
        </strong>
      </div>

      <div className="text-[10px] text-zinc-400 dark:text-zinc-600 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Dados e histórico protegidos com criptografia</span>
      </div>
    </footer>
  );
}

