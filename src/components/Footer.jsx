import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import ABLogo from './ABLogo';

export default function Footer({ onOpenGuide }) {
  return (
    <footer className="w-full max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto px-4 sm:px-6 py-8 text-center text-xs text-zinc-400 space-y-3 transition-colors border-t border-zinc-800/60 mt-8">
      <div className="flex items-center justify-center gap-2">
        <ABLogo size={24} showText={false} />
        <span className="text-zinc-100 font-bold tracking-wider text-[11px] uppercase">
          AB FITNESS
        </span>
      </div>

      <p className="text-zinc-400 font-normal text-[11px] max-w-sm mx-auto leading-relaxed">
        Biomecânica aplicada, sobrecarga progressiva e monitorização de rendimento atlético.
      </p>

      {onOpenGuide && (
        <div className="pt-1">
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 hover:text-white font-medium bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/60 active:scale-95 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-500 stroke-[1.8]" />
            <span>Consultar Manuais Técnicos do Atleta</span>
          </button>
        </div>
      )}

      <nav aria-label="Documentos legais e apoio ao consumidor" className="pt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px]">
        <a href="/termos" className="text-zinc-400 hover:text-white underline underline-offset-2">Termos</a>
        <a href="/privacidade" className="text-zinc-400 hover:text-white underline underline-offset-2">Privacidade</a>
        <a href="/aviso-medico" className="text-zinc-400 hover:text-white underline underline-offset-2">Aviso médico</a>
        <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline underline-offset-2">Livro de Reclamações</a>
        <a href="https://www.cicap.pt" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline underline-offset-2">Litígios (CICAP)</a>
      </nav>

      {/* Assinatura de Autoria */}
      <div className="pt-2 text-[11px] text-zinc-500 font-normal flex items-center justify-center gap-1">
        <span>Desenvolvido por</span>
        <strong className="text-zinc-300 font-semibold">
          ABEX Studio
        </strong>
      </div>

      <div className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 stroke-[1.8]" />
        <span>Dados e métricas protegidos localmente com segurança</span>
      </div>
    </footer>
  );
}
