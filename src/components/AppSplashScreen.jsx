import React, { useState, useEffect } from 'react';
import ABLogo from './ABLogo';
import { triggerHaptic } from '../utils/audio';

export default function AppSplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('A iniciar biomecânica...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    triggerHaptic(12);

    const timerPhase2 = setTimeout(() => {
      setPhase(2);
      setProgress(40);
      setStatusText('A sincronizar protocolos de sobrecarga...');
    }, 650);

    const timerProgress = setTimeout(() => {
      setProgress(78);
      setStatusText('A calibrar prontidão fisiológica...');
    }, 1600);

    const timerComplete = setTimeout(() => {
      setProgress(100);
      setStatusText('Pronto para treinar.');
      triggerHaptic(15);
    }, 2500);

    const timerFadeOut = setTimeout(() => {
      setIsFadingOut(true);
    }, 3200);

    const timerFinish = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3650);

    return () => {
      clearTimeout(timerPhase2);
      clearTimeout(timerProgress);
      clearTimeout(timerComplete);
      clearTimeout(timerFadeOut);
      clearTimeout(timerFinish);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    triggerHaptic(10);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-[#090a0b] text-white flex flex-col items-center justify-between p-6 select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ minHeight: '100dvh' }}
    >
      {/* Topo: Botão discreto para saltar */}
      <div className="w-full max-w-sm flex justify-end z-10 pt-[env(safe-area-inset-top,8px)]">
        {phase >= 2 && (
          <button
            onClick={handleSkip}
            className="min-h-[40px] text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer active:scale-95 animate-fadeIn"
          >
            Entrar →
          </button>
        )}
      </div>

      {/* Centro: Logo + Boas-Vindas */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center my-auto z-10 px-2">
        
        {/* Contêiner do Logo */}
        <div 
          className={`relative transition-all duration-700 ease-out transform ${
            phase === 1 
              ? 'scale-100 opacity-100 animate-scaleUp' 
              : 'scale-95 -translate-y-2'
          }`}
        >
          <div className="relative rounded-2xl p-0.5">
            <ABLogo size={84} showText={true} />
          </div>
        </div>

        {/* Fase 2: Título e Apresentação em PT-PT */}
        <div 
          className={`transition-all duration-700 ease-out space-y-3 mt-6 ${
            phase >= 2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Engenharia & Biomecânica</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            Bem-vindo à AB Fitness
          </h1>

          <p className="text-xs text-zinc-400 font-normal leading-relaxed max-w-xs mx-auto">
            A sua plataforma de gestão de treinos com rigor biomecânico, 
            sobrecarga progressiva estruturada e acompanhamento fisiológico de alta precisão.
          </p>
        </div>

      </div>

      {/* Rodapé: Barra de Progresso e Status */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2.5 z-10 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        
        <div className="w-full flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          <span className="truncate max-w-[200px] text-zinc-400">{statusText}</span>
          <span className="text-zinc-300 font-mono tabular-nums">{progress}%</span>
        </div>

        {/* Linha de progresso */}
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-zinc-500 font-normal mt-1">
          Desenvolvido por Bruno Abel
        </span>

      </div>
    </div>
  );
}
