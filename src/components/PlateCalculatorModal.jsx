import React, { useState } from 'react';
import { X, Dumbbell, Info } from 'lucide-react';
import { platesPerSide } from '../utils/strengthMetrics';
import { triggerHaptic } from '../utils/audio';

const PLATE_COLORS = {
  25: { bg: '#ef4444', text: '#ffffff', height: 110, width: 22 },
  20: { bg: '#3b82f6', text: '#ffffff', height: 110, width: 20 },
  15: { bg: '#eab308', text: '#000000', height: 95, width: 18 },
  10: { bg: '#10b981', text: '#ffffff', height: 80, width: 16 },
  5: { bg: '#f4f4f5', text: '#000000', height: 65, width: 14 },
  2.5: { bg: '#27272a', text: '#ffffff', height: 50, width: 12 },
  1.25: { bg: '#71717a', text: '#ffffff', height: 40, width: 10 }
};

export default function PlateCalculatorModal({ initialWeight = 60, onClose }) {
  const [targetWeight, setTargetWeight] = useState(() => Number(initialWeight) || 60);
  const [barWeight, setBarWeight] = useState(20);

  const calc = platesPerSide(targetWeight, barWeight);

  const adjustWeight = (delta) => {
    triggerHaptic(8);
    setTargetWeight((prev) => Math.max(barWeight, +(prev + delta).toFixed(1)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-surface rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                Calculadora de Anilhas
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Distribuição exata por cada lado da barra
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tap-44 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-5">
          {/* Escolha da Barra */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
              Peso da Barra
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { weight: 20, label: '20 kg (Olímpica)' },
                { weight: 15, label: '15 kg (Técnica)' },
                { weight: 10, label: '10 kg (EZ)' }
              ].map((b) => (
                <button
                  key={b.weight}
                  type="button"
                  onClick={() => {
                    setBarWeight(b.weight);
                    triggerHaptic(10);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                    barWeight === b.weight
                      ? 'bg-accent text-zinc-950 border-accent shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carga Alvo Total */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
              Carga Alvo Total (Barra + Anilhas)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustWeight(-5)}
                className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-black text-sm active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(-2.5)}
                className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                -2.5
              </button>

              <div className="flex-1 relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Math.max(barWeight, parseFloat(e.target.value) || barWeight))}
                  className="w-full h-12 rounded-xl text-center font-black text-xl tabular-nums bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50 focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <span className="absolute right-3 top-3.5 text-xs font-bold text-zinc-400 pointer-events-none">
                  kg
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustWeight(2.5)}
                className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                +2.5
              </button>
              <button
                type="button"
                onClick={() => adjustWeight(5)}
                className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-black text-sm active:scale-95 transition-transform border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          {/* Desenho da Barra em SVG */}
          <div className="bg-zinc-100 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 text-center">
              Visualização por lado da barra
            </div>

            <div className="h-32 flex items-center justify-center overflow-x-auto py-2">
              <svg width="340" height="120" viewBox="0 0 340 120" className="max-w-full">
                {/* Colar da Barra */}
                <rect x="20" y="52" width="50" height="16" fill="#71717a" rx="2" />
                <rect x="65" y="30" width="12" height="60" fill="#a1a1aa" rx="2" />

                {/* Eixo da Manga da Barra */}
                <rect x="77" y="54" width="240" height="12" fill="#52525b" />

                {/* Anilhas Enfileiradas */}
                {calc?.plates && calc.plates.map((plateWeight, idx) => {
                  const cfg = PLATE_COLORS[plateWeight] || { bg: '#71717a', text: '#fff', height: 60, width: 14 };
                  // Posição x acumulada
                  let currentX = 82;
                  for (let i = 0; i < idx; i++) {
                    const prevCfg = PLATE_COLORS[calc.plates[i]] || { width: 14 };
                    currentX += prevCfg.width + 3;
                  }
                  const y = 60 - cfg.height / 2;

                  return (
                    <g key={idx}>
                      <rect
                        x={currentX}
                        y={y}
                        width={cfg.width}
                        height={cfg.height}
                        fill={cfg.bg}
                        rx="3"
                        stroke="#000"
                        strokeWidth="1"
                        opacity="0.95"
                      />
                      <text
                        x={currentX + cfg.width / 2}
                        y="64"
                        fill={cfg.text}
                        fontSize="9"
                        fontWeight="900"
                        textAnchor="middle"
                        transform={`rotate(-90 ${currentX + cfg.width / 2} 64)`}
                        letterSpacing="-0.5"
                      >
                        {plateWeight}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Resumo Textual */}
            <div className="text-center mt-2 border-t border-zinc-200 dark:border-white/10 pt-2 text-xs">
              {calc?.plates && calc.plates.length > 0 ? (
                <div className="space-y-1">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Colocar por lado ({calc.perSideKg} kg):
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 font-mono font-bold text-xs">
                    {calc.plates.map((p, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 rounded text-[11px]"
                        style={{ backgroundColor: PLATE_COLORS[p]?.bg, color: PLATE_COLORS[p]?.text }}
                      >
                        {p}kg
                      </span>
                    ))}
                  </div>
                  {calc.remainder > 0 && (
                    <p className="text-[11px] text-amber-500 font-semibold mt-1">
                      Aviso: sobram {calc.remainder} kg não atingíveis com o escalonamento padrão.
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-zinc-500 font-medium">
                  Apenas a barra sem anilhas ({barWeight} kg).
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
