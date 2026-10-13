import React from 'react';
import { Sparkles, Dumbbell, ShieldCheck } from 'lucide-react';
export default function Footer({ onOpenGuide }) {
  return (
    <footer className="w-full max-w-md mx-auto px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-3 transition-colors">
      <div className="flex items-center justify-center gap-2">
        <span className="w-6 h-px bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold tracking-widest text-[11px] uppercase">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>AB Fitness</span>
        </div>
        <span className="w-6 h-px bg-slate-200 dark:bg-slate-800" />
      </div>

      <p className="text-slate-500 dark:text-slate-400 font-medium">
        Ciência do treinamento, sobrecarga progressiva e biomecânica de precisão.
      </p>

      {onOpenGuide && (
        <div>
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold bg-sky-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-sky-200/60 dark:border-slate-700 active:scale-95 transition-all"
          >
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>Manual Científico: Hipertrofia & Performance</span>
          </button>
        </div>
      )}

      {/* Assinatura Elegante e Discreta */}
      <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1">
        <span>Desenvolvido por</span>
        <strong className="text-slate-700 dark:text-slate-200 font-bold hover:text-sky-600 transition-colors">
          Bruno Abel
        </strong>
      </div>

      <div className="text-[10px] text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3 text-emerald-500" />
        <span>Dados e histórico protegidos com criptografia</span>
      </div>
    </footer>
  );
}
