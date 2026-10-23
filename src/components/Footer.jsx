import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import ABLogo from './ABLogo';

export default function Footer({ onOpenGuide }) {
  return (
    <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-3 transition-colors border-t border-zinc-200/60 dark:border-zinc-800/60 mt-8">
      <div className="flex items-center justify-center gap-2">
        <ABLogo size={24} showText={false} />
        <span className="text-zinc-900 dark:text-zinc-100 font-bold tracking-wider text-[11px] uppercase">
          AB FITNESS
        </span>
      </div>

      <p className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px] max-w-sm mx-auto leading-relaxed">
        Biomecânica aplicada, sobrecarga progressiva e monitorização de rendimento atlético.
      </p>

      {onOpenGuide && (
        <div className="pt-1">
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-500 stroke-[1.8]" />
            <span>Consultar Manuais Técnicos do Atleta</span>
          </button>
        </div>
      )}

      {/* Assinatura de Autoria */}
      <div className="pt-2 text-[11px] text-zinc-400 dark:text-zinc-500 font-normal flex items-center justify-center gap-1">
        <span>Desenvolvido por</span>
        <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">
          Bruno Abel
        </strong>
      </div>

      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 stroke-[1.8]" />
        <span>Dados e métricas protegidos localmente com segurança</span>
      </div>
    </footer>
  );
}
