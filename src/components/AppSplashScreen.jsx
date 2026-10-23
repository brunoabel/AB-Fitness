import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic } from '../utils/audio';

const TRACE_PATH = "M43 305 L51 298 L102 232 L113 215 L137 186 L139 175 L147 163 L153 159 L153 150 L149 149 L139 139 L131 125 L117 119 L111 118 L125 122 L129 125 L141 125 L165 131 L170 131 L172 129 L173 121 L180 112 L181 108 L192 90 L197 85 L205 81 L217 46 L205 80 L207 87 L200 133 L202 139 L198 146 L197 152 L195 154 L182 157 L166 168 L159 175 L153 177 L146 184 L138 186 L146 184 L153 177 L163 172 L165 174 L170 195 L174 204 L175 213 L182 220 L188 213 L196 153 L202 139 L218 137 L252 120 L278 110 L297 105 L320 105 L332 108 L341 113 L346 118 L351 128 L352 134 L350 148 L343 161 L335 171 L317 187 L300 198 L295 203 L291 211 L274 217 L261 218 L245 235 L242 249 L231 271 L229 282 L219 293 L218 300 L208 321 L207 326 L191 359 L184 369 L191 359 L218 300 L218 291 L209 291 L160 310 L139 321 L111 340 L94 357 L85 370 L82 381 L82 392 L88 404 L107 418 L131 424 L168 423 L206 415 L250 399 L271 389 L302 371 L329 352 L343 340 L367 314 L381 291 L386 274 L386 262 L384 260 L382 248 L377 240 L367 230 L360 225 L336 215 L316 212 L294 213 L290 211 L274 217 L261 217 L264 202 L305 119 L264 202 L261 212 L261 218 L245 235 L238 235 L232 238 L238 235 L245 236 L244 244 L231 271 L229 283 L235 284 L282 272 L326 264 L362 261 L409 262 L423 264 L433 267 L443 275 L433 267 L423 264 L409 262 L386 262 L384 260 L382 248 L377 240 L363 227 L350 220 L331 214 L316 212 L294 213 L292 211 L295 203 L300 198 L317 187 L335 171 L343 161 L351 145 L351 128 L346 118 L338 111 L320 105 L297 105 L278 110 L252 120 L223 135 L210 139 L202 139 L200 134 L196 132 L183 132 L172 130 L165 132 L160 144 L153 151 L153 160 L158 163 L165 174 L170 195 L174 204 L175 213 L182 219 L182 258";

export default function AppSplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('A iniciar biomecânica...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const traceRef = useRef(null);
  const penRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const isFinishedRef = useRef(false);

  const handleFinish = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFadingOut(true);
    triggerHaptic(10);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  useEffect(() => {
    triggerHaptic(12);

    const trace = traceRef.current;
    const pen = penRef.current;
    if (!trace) return;

    const L = trace.getTotalLength();
    const START = 350; // Início do traçado
    const DUR = 2600;  // Duração da assinatura
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      trace.style.strokeDasharray = 'none';
      trace.style.strokeDashoffset = '0';
      if (pen) pen.style.opacity = '0';
      setProgress(100);
      setStatusText('Pronto para treinar.');
      setShowDetails(true);
      const timer = setTimeout(handleFinish, 1200);
      return () => clearTimeout(timer);
    }

    trace.style.strokeDasharray = `${L}`;
    trace.style.strokeDashoffset = `${L}`;
    if (pen) pen.style.opacity = '0';

    const t0 = performance.now();

    function frame(now) {
      const p = Math.min(Math.max((now - t0 - START) / DUR, 0), 1);
      const e = ease(p);
      trace.style.strokeDashoffset = `${L * (1 - e)}`;

      // Atualiza progresso proporcional
      const currentProg = Math.min(95, Math.round(15 + p * 80));
      setProgress(currentProg);

      if (p > 0.05 && p < 0.5) {
        setStatusText('A sintetizar monograma AB...');
      } else if (p >= 0.5 && p < 0.9) {
        setStatusText('A calibrar prontidão neuromuscular...');
      } else if (p >= 0.9) {
        setStatusText('A sincronizar biomecânica...');
      }

      if (p > 0 && p < 1 && pen) {
        const pt = trace.getPointAtLength(L * e);
        pen.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
        pen.style.opacity = '1';
      } else if (pen) {
        pen.style.opacity = '0';
      }

      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Traçado finalizado com sucesso
        triggerHaptic(15);
        setProgress(100);
        setStatusText('Pronto para treinar.');
        setShowDetails(true);
      }
    }

    rafRef.current = requestAnimationFrame(frame);

    // Transição suave para o app após a assinatura e revelação
    const autoFinishTimer = setTimeout(() => {
      handleFinish();
    }, 4500);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(autoFinishTimer);
    };
  }, []);

  const abLetters = ['A', 'B'];
  const fitnessLetters = ['F', 'I', 'T', 'N', 'E', 'S', 'S'];

  return (
    <div
      ref={containerRef}
      id="ab-splash-screen"
      onClick={handleFinish}
      className={`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-between p-6 select-none cursor-pointer overflow-hidden transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-105 filter blur-md pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        minHeight: '100dvh',
        fontFamily: '"Helvetica Neue", Inter, system-ui, -apple-system, sans-serif'
      }}
      role="img"
      aria-label="AB Fitness - Abertura"
    >
      {/* Halo radial de fundo ultra-premium */}
      <div 
        className="pointer-events-none absolute w-[95vmin] h-[95vmin] rounded-full animate-splashHalo"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,255,255,0.13), rgba(255,255,255,0.035) 55%, transparent)'
        }}
      />

      {/* Textura sutil de filme analógico / grain */}
      <div
        className="pointer-events-none absolute -inset-[50%] opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`,
          animation: 'splashGrain 0.6s steps(4) infinite'
        }}
      />

      {/* Topo: Botão elegante para saltar imediatamente */}
      <header className="w-full max-w-sm flex justify-end items-center z-20 pt-[env(safe-area-inset-top,8px)]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          className="min-h-[40px] text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 transition-all cursor-pointer active:scale-95 hover:border-zinc-700"
        >
          Entrar →
        </button>
      </header>

      {/* Centro: Motion de Assinatura AB com caneta de luz + Tipografia */}
      <main className="w-full max-w-sm flex flex-col items-center justify-center my-auto z-10 px-2 text-center">
        {/* SVG de Traçado Biomecânico com Máscara */}
        <div className="relative flex items-center justify-center">
          <svg
            id="sig"
            viewBox="0 0 486 470"
            aria-hidden="true"
            className="w-[min(66vw,340px)] h-auto overflow-visible block animate-splashPulse"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.45)) drop-shadow(0 0 25px rgba(255,255,255,0.2))'
            }}
          >
            <defs>
              <mask id="reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="486" height="470">
                <path
                  ref={traceRef}
                  id="trace"
                  d={TRACE_PATH}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </mask>
              <filter id="g" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            {/* Imagem oficial revelada pelo traçado da caneta */}
            <image
              href="/signature-art.png"
              width="486"
              height="470"
              mask="url(#reveal)"
            />

            {/* Ponta da caneta iluminada que desenha o logo */}
            <g ref={penRef} id="pen" style={{ opacity: 0 }}>
              <circle r="14" fill="#ffffff" opacity="0.55" filter="url(#g)" />
              <circle r="3.2" fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Brand Text com animação de foco letra-a-letra */}
        <div 
          className="relative flex items-baseline justify-center gap-2 mt-4 text-[clamp(24px,6.8vw,36px)] tracking-tight select-none"
          aria-hidden="true"
        >
          <div className="font-extrabold tracking-wider text-white flex">
            {abLetters.map((char, index) => (
              <span
                key={index}
                className="inline-block animate-splashLetter"
                style={{ animationDelay: `${2.8 + index * 0.08}s` }}
              >
                {char}
              </span>
            ))}
          </div>

          <div className="font-light tracking-[0.32em] text-zinc-300 flex text-[0.72em]">
            {fitnessLetters.map((char, index) => (
              <span
                key={index}
                className="inline-block animate-splashLetter"
                style={{ animationDelay: `${2.95 + index * 0.07}s` }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        {/* Detalhes biomecânicos refinados integrados */}
        <div
          className={`transition-all duration-700 ease-out space-y-2 mt-4 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-300 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engenharia & Biomecânica</span>
          </div>

          <p className="text-[11px] text-zinc-400 font-normal leading-relaxed max-w-xs mx-auto">
            Plataforma de alta precisão com sobrecarga progressiva e rigor fisiológico.
          </p>
        </div>
      </main>

      {/* Rodapé: Barra de Progresso e Crédito */}
      <footer className="w-full max-w-xs flex flex-col items-center gap-2.5 z-20 pb-[max(env(safe-area-inset-bottom,0px),16px)]">
        <div className="w-full flex items-center justify-between text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          <span className="truncate max-w-[210px] text-zinc-400 font-medium">{statusText}</span>
          <span className="text-zinc-200 font-mono tabular-nums">{progress}%</span>
        </div>

        {/* Linha de progresso */}
        <div className="w-full h-1 bg-zinc-900/90 rounded-full overflow-hidden border border-zinc-800/80">
          <div
            className="h-full bg-gradient-to-r from-zinc-400 via-white to-zinc-200 rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-[10px] text-zinc-500 font-normal mt-0.5 tracking-wide">
          Desenvolvido por Bruno Abel
        </span>
      </footer>

      {/* CSS das animações de luz, halo, grão e tipografia */}
      <style>{`
        @keyframes splashHalo {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 0.95; transform: scale(1.18); }
        }
        @keyframes splashPulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(255,255,255,0.35)) drop-shadow(0 0 20px rgba(255,255,255,0.15));
          }
          50% {
            filter: drop-shadow(0 0 22px rgba(255,255,255,0.95)) drop-shadow(0 0 50px rgba(255,255,255,0.5));
          }
        }
        @keyframes splashLetter {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(0.4em);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }
        @keyframes splashGrain {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 2%); }
          50% { transform: translate(2%, -1%); }
          75% { transform: translate(-1%, -2%); }
        }
        .animate-splashHalo {
          animation: splashHalo 3.5s ease-out 0.1s forwards;
        }
        .animate-splashPulse {
          animation: splashPulse 1.4s ease-in-out 2.6s 1;
        }
        .animate-splashLetter {
          opacity: 0;
          animation: splashLetter 0.75s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
