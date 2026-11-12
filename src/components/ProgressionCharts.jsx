import React, { useState } from 'react';
import { 
  TrendingUp, 
  Dumbbell, 
  ArrowUpRight 
} from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

// Base de dados de progressão realista para os exercícios clássicos do Arnold Split
const EXERCISE_PROGRESSION_DATA = {
  'bench-press': {
    name: 'Supino Plano com Barra',
    splitGroup: 'Peito & Costas',
    unit: 'kg',
    sessions: [
      { date: '15/Set', weight: 70, reps: 10, estimated1RM: 93 },
      { date: '22/Set', weight: 72.5, reps: 10, estimated1RM: 96 },
      { date: '29/Set', weight: 75, reps: 8, estimated1RM: 95 },
      { date: '06/Out', weight: 77.5, reps: 8, estimated1RM: 98 },
      { date: '10/Out', weight: 80, reps: 8, estimated1RM: 101 },
      { date: '13/Out', weight: 82.5, reps: 8, estimated1RM: 104 }
    ],
    initialWeight: 70,
    currentWeight: 82.5,
    gainPercent: '+17.8%'
  },
  'barbell-row': {
    name: 'Remada Curvada com Barra',
    splitGroup: 'Peito & Costas',
    unit: 'kg',
    sessions: [
      { date: '15/Set', weight: 60, reps: 10, estimated1RM: 80 },
      { date: '22/Set', weight: 62.5, reps: 10, estimated1RM: 83 },
      { date: '29/Set', weight: 65, reps: 10, estimated1RM: 86 },
      { date: '06/Out', weight: 67.5, reps: 8, estimated1RM: 85 },
      { date: '10/Out', weight: 70, reps: 8, estimated1RM: 89 },
      { date: '13/Out', weight: 72.5, reps: 8, estimated1RM: 92 }
    ],
    initialWeight: 60,
    currentWeight: 72.5,
    gainPercent: '+20.8%'
  },
  'military-press': {
    name: 'Desenvolvimento Militar',
    splitGroup: 'Ombros & Braços',
    unit: 'kg',
    sessions: [
      { date: '16/Set', weight: 35, reps: 10, estimated1RM: 46 },
      { date: '23/Set', weight: 37.5, reps: 10, estimated1RM: 50 },
      { date: '30/Set', weight: 40, reps: 8, estimated1RM: 50 },
      { date: '07/Out', weight: 40, reps: 10, estimated1RM: 53 },
      { date: '11/Out', weight: 42.5, reps: 8, estimated1RM: 54 },
      { date: '14/Out', weight: 45, reps: 8, estimated1RM: 57 }
    ],
    initialWeight: 35,
    currentWeight: 45,
    gainPercent: '+28.5%'
  },
  'bicep-curl': {
    name: 'Bíceps com Barra W',
    splitGroup: 'Ombros & Braços',
    unit: 'kg',
    sessions: [
      { date: '16/Set', weight: 26, reps: 12, estimated1RM: 36 },
      { date: '23/Set', weight: 28, reps: 10, estimated1RM: 37 },
      { date: '30/Set', weight: 30, reps: 10, estimated1RM: 40 },
      { date: '07/Out', weight: 30, reps: 12, estimated1RM: 42 },
      { date: '11/Out', weight: 32, reps: 10, estimated1RM: 43 },
      { date: '14/Out', weight: 34, reps: 8, estimated1RM: 43 }
    ],
    initialWeight: 26,
    currentWeight: 34,
    gainPercent: '+30.7%'
  },
  'squat': {
    name: 'Agachamento com Barra',
    splitGroup: 'Pernas & Gémeos',
    unit: 'kg',
    sessions: [
      { date: '17/Set', weight: 90, reps: 10, estimated1RM: 120 },
      { date: '24/Set', weight: 95, reps: 10, estimated1RM: 126 },
      { date: '01/Out', weight: 100, reps: 8, estimated1RM: 126 },
      { date: '08/Out', weight: 105, reps: 8, estimated1RM: 133 },
      { date: '12/Out', weight: 110, reps: 8, estimated1RM: 139 },
      { date: '14/Out', weight: 115, reps: 6, estimated1RM: 138 }
    ],
    initialWeight: 90,
    currentWeight: 115,
    gainPercent: '+27.7%'
  },
  'leg-press': {
    name: 'Leg Press 45°',
    splitGroup: 'Pernas & Gémeos',
    unit: 'kg',
    sessions: [
      { date: '17/Set', weight: 200, reps: 12, estimated1RM: 280 },
      { date: '24/Set', weight: 220, reps: 10, estimated1RM: 293 },
      { date: '01/Out', weight: 240, reps: 10, estimated1RM: 320 },
      { date: '08/Out', weight: 250, reps: 10, estimated1RM: 333 },
      { date: '12/Out', weight: 260, reps: 8, estimated1RM: 330 },
      { date: '14/Out', weight: 280, reps: 8, estimated1RM: 355 }
    ],
    initialWeight: 200,
    currentWeight: 280,
    gainPercent: '+40.0%'
  }
};

// Dados de volume semanal por bloco do Arnold Split
export default function ProgressionCharts() {
  const [selectedExKey, setSelectedExKey] = useState('bench-press');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const currentEx = EXERCISE_PROGRESSION_DATA[selectedExKey] || EXERCISE_PROGRESSION_DATA['bench-press'];
  const sessions = currentEx.sessions;

  // Cálculos do gráfico SVG de sobrecarga
  const weights = sessions.map(s => s.weight);
  const minW = Math.min(...weights) - 5;
  const maxW = Math.max(...weights) + 5;
  const range = maxW - minW || 1;

  // Coordenadas SVG (viewBox 0 0 340 160)
  const chartWidth = 340;
  const chartHeight = 150;
  const paddingX = 25;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = sessions.map((s, idx) => {
    const x = paddingX + (idx / (sessions.length - 1)) * (chartWidth - paddingX * 2);
    const y = paddingTop + (1 - (s.weight - minW) / range) * (chartHeight - paddingTop - paddingBottom);
    return { ...s, x, y };
  });

  // Caminho da linha SVG suave (Curva Bézier cúbica)
  const linePath = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, '');

  // Caminho da área com gradiente preenchido
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Abas Superiores dos Gráficos — Apenas Sobrecarga Ativa, Whoop e Arnold ocultos */}
      <div className="flex items-center justify-between px-1 text-xs font-bold text-white">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent-hover" />
          <span>Evolução de Sobrecarga Progressiva (PRs)</span>
        </div>

        {/* OCULTO: Módulos Arnold Volume e Whoop x Cargas desativados a pedido do utilizador
        <div className="flex gap-1">
          <button onClick={() => setActiveTab('split-volume')}>Arnold Volume</button>
          <button onClick={() => setActiveTab('whoop-cross')}>Whoop x Cargas</button>
        </div>
        */}
      </div>

      {/* 1. VISUALIZAÇÃO DE SOBRECARGA PROGRESSIVA POR EXERCÍCIO */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-white/10 shadow-sm space-y-4 transition-colors">
        
        {/* Seletor de Exercício do Arnold Split */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-bold uppercase tracking-wider">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-300" />
              <span>Evolução de Força • {currentEx.splitGroup}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {currentEx.name}
            </h3>
          </div>

          {/* Select de exercício */}
          <select
            value={selectedExKey}
            onChange={(e) => {
              setSelectedExKey(e.target.value);
              triggerHaptic(10);
            }}
            className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-xl bg-zinc-800 text-zinc-100 text-xs font-semibold border border-zinc-700 outline-none cursor-pointer"
          >
            <option value="bench-press">Supino Plano (Peito)</option>
            <option value="barbell-row">Remada Curvada (Costas)</option>
            <option value="military-press">Desenvolvimento Militar (Ombros)</option>
            <option value="bicep-curl">Bíceps Barra W (Braços)</option>
            <option value="squat">Agachamento com Barra (Pernas)</option>
            <option value="leg-press">Leg Press 45° (Pernas)</option>
          </select>
        </div>

        {/* Cards de Métricas do Exercício */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-white/10">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Carga Inicial</span>
            <span className="text-sm font-bold font-mono tabular-nums text-white">{currentEx.initialWeight} kg</span>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-800/60 border border-white/10">
            <span className="text-[11px] text-zinc-400 uppercase font-semibold block">Carga Atual</span>
            <span className="text-sm font-bold font-mono tabular-nums text-white">{currentEx.currentWeight} kg</span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
            <span className="text-[11px] text-emerald-400 uppercase font-semibold block">Ganho Total</span>
            <span className="text-sm font-bold font-mono tabular-nums text-emerald-400 flex items-center justify-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {currentEx.gainPercent}
            </span>
          </div>
        </div>

        {/* Gráfico SVG de Linha e Área Suave */}
        <div className="relative pt-2">
          <svg 
            className="w-full h-44 overflow-visible" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" className="text-zinc-600" stopOpacity="0.25" />
                <stop offset="100%" stopColor="currentColor" className="text-zinc-600" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Linhas horizontais de grade técnica */}
            <line x1={paddingX} y1={paddingTop} x2={chartWidth - paddingX} y2={paddingTop} stroke="currentColor" className="text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="currentColor" className="text-zinc-800" strokeDasharray="4 4" strokeWidth="1" />
            <line x1={paddingX} y1={chartHeight - paddingBottom} x2={chartWidth - paddingX} y2={chartHeight - paddingBottom} stroke="currentColor" className="text-zinc-800" strokeWidth="1" />

            {/* Área com Gradiente neutro */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Linha Principal de Carga */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="currentColor" 
              className="text-white"
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Pontos nas sessões */}
            {points.map((pt, i) => {
              const isHovered = hoveredPoint === i;
              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3.5}
                    className="fill-zinc-950 stroke-white cursor-pointer transition-all duration-150"
                    strokeWidth={isHovered ? 2.5 : 2}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onTouchStart={() => setHoveredPoint(i)}
                  />
                  {/* Rótulo da Data embaixo */}
                  <text
                    x={pt.x}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    className="text-[11px] font-mono tabular-nums fill-zinc-400 font-medium"
                  >
                    {pt.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip Dinâmico ao passar o dedo/mouse */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-900 px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-zinc-300 animate-fadeIn"
            >
              <span className="font-mono tabular-nums">{points[hoveredPoint].date}:</span>
              <span className="font-bold font-mono tabular-nums">
                {points[hoveredPoint].weight} kg
              </span>
              <span className="text-[11px] opacity-80 font-mono tabular-nums">
                ({points[hoveredPoint].reps} reps • 1RM ~{points[hoveredPoint].estimated1RM} kg)
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1 font-medium">
            1RM Máximo Estimado: <strong className="font-mono tabular-nums text-white font-bold">{Math.max(...sessions.map(s => s.estimated1RM))} kg</strong>
          </span>
          <span className="text-[11px]">Toque nos pontos para detalhes</span>
        </div>

      </div>
    </div>
  );
}
