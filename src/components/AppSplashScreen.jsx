import React, { useState, useEffect } from 'react';
import ABLogo from './ABLogo';
import { triggerHaptic } from '../utils/audio';

export default function AppSplashScreen({ onFinish }) {
  // Fase da animação:
  // 1: Logo surgindo e animando com brilho sutil
  // 2: Logo desliza e revela "Bem-vindo à AB Fitness" + texto explicativo
  // 3: Barra de carregamento completa e transição suave
  const [phase, setPhase] = useState(1);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Inicializando biomecânica...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Feedback tátil sutil ao iniciar o app
    triggerHaptic(12);

    // Passo 1 -> Passo 2: após 650ms de animação do logo, revela o texto de boas-vindas
    const timerPhase2 = setTimeout(() => {
      setPhase(2);
      setProgress(40);
      setStatusText('Sincronizando protocolos de sobrecarga...');
    }, 650);

    // Passo 2 -> Progresso avançando
    const timerProgress = setTimeout(() => {
      setProgress(78);
      setStatusText('Calibrando prontidão fisiológica...');
    }, 1600);

    // Passo final: 100% concluído
    const timerComplete = setTimeout(() => {
      setProgress(100);
      setStatusText('Pronto para treinar.');
      triggerHaptic(15);
    }, 2500);

    // Fade-out suave da tela de splash
    const timerFadeOut = setTimeout(() => {
      setIsFadingOut(true);
    }, 3200);

    // Desmontar e entrar no app
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
      className={`fixed inset-0 z-50 bg-[#000000] text-white flex flex-col items-center justify-between p-6 select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ minHeight: '100dvh' }}
    >
      {/* Luz ambiente de fundo refinada */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Topo: Botão discreto para pular caso o usuário queira rapidez */}
      <div className="w-full max-w-sm flex justify-end z-10 pt-[env(safe-area-inset-top,8px)]">
        {phase >= 2 && (
          <button
            onClick={handleSkip}
            className="text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-widest px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 transition-all cursor-pointer active:scale-95 animate-fadeIn"
          >
            Entrar →
          </button>
        )}
      </div>

      {/* Centro: Logo com Animação Refinada + Boas-Vindas */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center text-center my-auto z-10 px-2">
        
        {/* Contêiner do Logo com Animação Elástica e Brilho */}
        <div 
          className={`relative transition-all duration-700 ease-out transform ${
            phase === 1 
              ? 'scale-100 opacity-100 animate-scaleUp' 
              : 'scale-95 -translate-y-2'
          }`}
        >
          {/* Aura suave em volta do logo */}
          <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl scale-125 pointer-events-none animate-pulse" />
          
          {/* Logo Oficial AB Fitness (intacto, sem alterações) */}
          <div className="relative shadow-2xl rounded-2xl p-0.5">
            <ABLogo size={84} showText={true} />
          </div>
        </div>

        {/* Fase 2: Título de Boas-Vindas e Texto Explicativo Profissional */}
        <div 
          className={`transition-all duration-700 ease-out space-y-3 mt-6 ${
            phase >= 2 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-extrabold uppercase tracking-[0.25em] text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            <span>Engenharia & Biomecânica</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug">
            BEM-VINDO À <span className="text-white">AB FITNESS</span>
          </h1>

          <p className="text-xs sm:text-[13px] text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto">
            A sua plataforma de gestão de treinos com precisão biomecânica, 
            sobrecarga progressiva estruturada e acompanhamento fisiológico com biometria de ponta.
          </p>
        </div>

      </div>

      {/* Rodapé: Barra de Progresso Fina e Status de Inicialização */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2.5 z-10 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        
        <div className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          <span className="truncate max-w-[200px] text-zinc-400">{statusText}</span>
          <span className="text-zinc-300">{progress}%</span>
        </div>

        {/* Linha de progresso luxuosa */}
        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 via-white to-sky-300 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[9px] text-zinc-400 font-medium mt-1">
          Desenvolvido por Bruno Abel
        </span>

      </div>
    </div>
  );
}
