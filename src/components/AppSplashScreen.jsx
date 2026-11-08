import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/audio';

export default function AppSplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(18);
  const [statusText, setStatusText] = useState('A iniciar biomecânica...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasFinishedRef = useRef(false);

  const handleFinish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsFadingOut(true);
    triggerHaptic(10);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  useEffect(() => {
    triggerHaptic(12);

    const timer1 = setTimeout(() => {
      setPhase(2);
      setProgress(52);
      setStatusText('A sincronizar protocolos de sobrecarga...');
    }, 700);

    const timer2 = setTimeout(() => {
      setProgress(86);
      setStatusText('A calibrar prontidão fisiológica...');
    }, 1500);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Pronto para treinar.');
      triggerHaptic(15);
    }, 2300);

    const timerAutoFinish = setTimeout(() => {
      handleFinish();
    }, 3100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerAutoFinish);
    };
  }, []);

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-between p-6 select-none cursor-pointer overflow-hidden transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.03] filter blur-sm pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        minHeight: '100dvh',
        fontFamily: '"Helvetica Neue", Inter, system-ui, -apple-system, sans-serif',
      }}
      role="img"
      aria-label="AB Fitness - Abertura"
    >
      {/* Halo radial de iluminação suave e luxuoso ao fundo */}
      <div 
        className="pointer-events-none absolute w-[85vmin] h-[85vmin] rounded-full animate-softHalo"
        style={{
          background: 'radial-gradient(closest-side, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.015) 60%, transparent)',
        }}
      />

      {/* Topo: Botão elegante e discreto para entrar imediatamente */}
      <header className="w-full max-w-sm flex justify-end items-center z-20 pt-[env(safe-area-inset-top,8px)]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="min-h-[44px] text-[11px] font-semibold text-zinc-400 hover:text-white uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 transition-all cursor-pointer active:scale-95 hover:border-zinc-700"
        >
          Entrar →
        </button>
      </header>

      {/* Centro: Logo oficial AB branco elegante + tipografia suave */}
      <main className="w-full max-w-sm flex flex-col items-center justify-center my-auto z-10 px-2 text-center">
        
        {/* Contêiner do Logo: Proporção equilibrada, nítido, sem tamanho exagerado */}
        <div 
          className={`relative transition-all duration-1000 ease-out transform ${
            phase === 1 
              ? 'scale-95 opacity-0' 
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Logo AB Branco Oficial com brilho suave e fundo 100% transparente */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto">
            <img
              src="/ab-logo-white.png"
              alt="AB Fitness"
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_0_16px_rgba(255,255,255,0.45)]"
            />
          </div>
        </div>

        {/* Nome da Marca com tipografia refinada */}
        <div 
          className={`transition-all duration-700 delay-150 ease-out flex flex-col items-center mt-3 ${
            phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-baseline gap-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
            <span className="tracking-wider">AB</span>
            <span className="font-light tracking-[0.34em] text-zinc-300 text-sm sm:text-base">FITNESS</span>
          </div>

          {/* Badge biomecânico sutil */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mt-4 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-bold uppercase tracking-widest text-zinc-300 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engenharia & Biomecânica</span>
          </div>

          <p className="text-[11px] text-zinc-400 font-normal leading-relaxed max-w-xs mx-auto mt-2">
            Rigor biomecânico, sobrecarga progressiva e alta performance.
          </p>
        </div>

      </main>

      {/* Rodapé: Barra de Progresso e Crédito */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-2.5 z-20 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        <div className="w-full flex items-center justify-between text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          <span className="truncate max-w-[200px] text-zinc-400">{statusText}</span>
          <span className="text-zinc-300 font-mono tabular-nums">{progress}%</span>
        </div>

        {/* Linha de progresso ultra-fina e elegante */}
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,240,255,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[11px] text-zinc-500 font-normal mt-0.5 tracking-wide">
          Desenvolvido por Bruno Abel
        </span>
      </footer>

      {/* Animações CSS suaves */}
      <style>{`
        @keyframes softHalo {
          0% { transform: scale(0.85); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.85; }
          100% { transform: scale(1); opacity: 0.7; }
        }
        .animate-softHalo {
          animation: softHalo 3.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
