import React, { useState, useMemo } from 'react';
import { Activity, ShieldCheck, AlertCircle, Info, RefreshCw, Flame, CheckCircle } from 'lucide-react';
import { calculateMuscleRecovery, MUSCLE_GROUPS } from '../utils/muscleRecoveryService';
import { getWorkoutHistory } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';

export default function MuscleRecoveryMap({ workoutHistory: propHistory = null }) {
  const [history] = useState(() => propHistory || getWorkoutHistory());
  const [activeView, setActiveView] = useState('front'); // 'front' | 'back'
  const [selectedMuscleId, setSelectedMuscleId] = useState('peito');

  const recoveryData = useMemo(() => {
    return calculateMuscleRecovery(history);
  }, [history]);

  const muscles = recoveryData.muscles;
  const selectedMuscle = muscles[selectedMuscleId] || muscles.peito;

  // Contagem de estados
  const stats = useMemo(() => {
    let recovered = 0;
    let recovering = 0;
    let fatigued = 0;

    Object.values(muscles).forEach((m) => {
      if (m.status === 'recovered') recovered++;
      else if (m.status === 'recovering') recovering++;
      else fatigued++;
    });

    return { recovered, recovering, fatigued };
  }, [muscles]);

  // Cores por estado
  const getColor = (muscleId) => {
    const m = muscles[muscleId];
    if (!m) return '#27272a';
    if (m.status === 'fatigued') return '#ef4444';
    if (m.status === 'recovering') return '#f59e0b';
    return '#10b981';
  };

  const getFillOpacity = (muscleId) => {
    const isSelected = selectedMuscleId === muscleId;
    return isSelected ? '0.85' : '0.55';
  };

  const handleMuscleClick = (id) => {
    triggerHaptic(10);
    setSelectedMuscleId(id);
  };

  return (
    <div className="rounded-2xl bg-[#111114] border border-white/[0.08] shadow-md p-5 transition-colors text-zinc-100">
      {/* Topo: Título & Índice de Prontidão Global */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c6f432]/15 text-[#c6f432] flex items-center justify-center font-black">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Mapa de Recuperação Muscular
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c6f432]/15 text-[#c6f432] border border-[#c6f432]/30">
                96h Window
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Decaimento fisiológico de fadiga acumulada em tempo real
            </p>
          </div>
        </div>

        {/* Score de Prontidão Global */}
        <div className="flex items-center gap-3 bg-zinc-900/90 px-3.5 py-2 rounded-xl border border-white/[0.08]">
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Prontidão Global
            </span>
            <span className="text-xs font-semibold text-zinc-300">
              {recoveryData.status}
            </span>
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-[#c6f432]">
            {recoveryData.overallScore}%
          </div>
        </div>
      </div>

      {/* Chips de Resumo Rápido */}
      <div className="grid grid-cols-3 gap-2 py-3">
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-emerald-400 block tabular-nums">{stats.recovered} Grupos</span>
            <span className="text-[10px] text-zinc-500">Recuperados</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-amber-500/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-amber-400 block tabular-nums">{stats.recovering} Grupos</span>
            <span className="text-[10px] text-zinc-500">Em Regeneração</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-rose-500/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-rose-400 block tabular-nums">{stats.fatigued} Grupos</span>
            <span className="text-[10px] text-zinc-500">Fadiga Elevada</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal: SVG Anatómico & Cartão de Detalhe */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
        {/* Painel do Modelo Humano */}
        <div className="md:col-span-7 flex flex-col items-center">
          {/* Seletor Frente / Costas */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/[0.08] text-xs font-bold mb-4 w-full max-w-[220px]">
            <button
              type="button"
              onClick={() => {
                setActiveView('front');
                triggerHaptic(8);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeView === 'front'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vista Anterior
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveView('back');
                triggerHaptic(8);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                activeView === 'back'
                  ? 'bg-zinc-800 text-white shadow-xs border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Vista Posterior
            </button>
          </div>

          {/* SVG Anatómico Interativo */}
          <div className="relative w-full max-w-[280px] h-[340px] flex items-center justify-center bg-zinc-950/60 rounded-2xl border border-white/[0.06] p-2">
            <svg
              viewBox="0 0 200 320"
              className="w-full h-full max-h-[320px] select-none"
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
            >
              {/* Contorno Base da Silhueta Humana */}
              <g opacity="0.25" stroke="#ffffff" strokeWidth="1" fill="none">
                {/* Cabeça */}
                <circle cx="100" cy="24" r="14" />
                {/* Pescoço */}
                <path d="M94 38 L94 48 M106 38 L106 48" />
                {/* Caixa Torácica / Tronco */}
                <path d="M72 58 L52 120 L66 126 L76 170 L100 174 L124 170 L134 126 L148 120 L128 58 Z" />
                {/* Pernas */}
                <path d="M76 172 L68 250 L64 300 L84 300 L94 250 L98 180" />
                <path d="M124 172 L132 250 L136 300 L116 300 L106 250 L102 180" />
              </g>

              {activeView === 'front' ? (
                /* --- VISTA ANTERIOR (FRENTE) --- */
                <g>
                  {/* Ombros (Deltoides) */}
                  <path
                    d="M62 52 C54 54 48 64 48 76 C52 82 58 84 64 80 C68 70 68 58 62 52 Z"
                    fill={getColor('ombros')}
                    fillOpacity={getFillOpacity('ombros')}
                    stroke={selectedMuscleId === 'ombros' ? '#ffffff' : getColor('ombros')}
                    strokeWidth={selectedMuscleId === 'ombros' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('ombros')}
                  />
                  <path
                    d="M138 52 C146 54 152 64 152 76 C148 82 142 84 136 80 C132 70 132 58 138 52 Z"
                    fill={getColor('ombros')}
                    fillOpacity={getFillOpacity('ombros')}
                    stroke={selectedMuscleId === 'ombros' ? '#ffffff' : getColor('ombros')}
                    strokeWidth={selectedMuscleId === 'ombros' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('ombros')}
                  />

                  {/* Peitoral Maior (Esquerdo e Direito) */}
                  <path
                    d="M74 54 C82 54 96 56 98 72 C96 86 80 88 72 84 C66 80 66 60 74 54 Z"
                    fill={getColor('peito')}
                    fillOpacity={getFillOpacity('peito')}
                    stroke={selectedMuscleId === 'peito' ? '#ffffff' : getColor('peito')}
                    strokeWidth={selectedMuscleId === 'peito' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('peito')}
                  />
                  <path
                    d="M126 54 C118 54 104 56 102 72 C104 86 120 88 128 84 C134 80 134 60 126 54 Z"
                    fill={getColor('peito')}
                    fillOpacity={getFillOpacity('peito')}
                    stroke={selectedMuscleId === 'peito' ? '#ffffff' : getColor('peito')}
                    strokeWidth={selectedMuscleId === 'peito' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('peito')}
                  />

                  {/* Bíceps (Braços) */}
                  <path
                    d="M48 82 C44 94 44 112 50 122 C56 120 58 108 58 92 C56 84 52 82 48 82 Z"
                    fill={getColor('biceps')}
                    fillOpacity={getFillOpacity('biceps')}
                    stroke={selectedMuscleId === 'biceps' ? '#ffffff' : getColor('biceps')}
                    strokeWidth={selectedMuscleId === 'biceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('biceps')}
                  />
                  <path
                    d="M152 82 C156 94 156 112 150 122 C144 120 142 108 142 92 C144 84 148 82 152 82 Z"
                    fill={getColor('biceps')}
                    fillOpacity={getFillOpacity('biceps')}
                    stroke={selectedMuscleId === 'biceps' ? '#ffffff' : getColor('biceps')}
                    strokeWidth={selectedMuscleId === 'biceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('biceps')}
                  />

                  {/* Core / Abdómen */}
                  <path
                    d="M84 92 C92 90 108 90 116 92 C118 114 116 136 114 154 C104 158 96 158 86 154 C84 136 82 114 84 92 Z"
                    fill={getColor('core')}
                    fillOpacity={getFillOpacity('core')}
                    stroke={selectedMuscleId === 'core' ? '#ffffff' : getColor('core')}
                    strokeWidth={selectedMuscleId === 'core' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('core')}
                  />

                  {/* Quadríceps (Coxas Frente) */}
                  <path
                    d="M74 166 C86 168 96 172 96 210 C92 236 86 242 78 240 C70 236 66 212 68 178 C70 170 72 166 74 166 Z"
                    fill={getColor('quadriceps')}
                    fillOpacity={getFillOpacity('quadriceps')}
                    stroke={selectedMuscleId === 'quadriceps' ? '#ffffff' : getColor('quadriceps')}
                    strokeWidth={selectedMuscleId === 'quadriceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('quadriceps')}
                  />
                  <path
                    d="M126 166 C114 168 104 172 104 210 C108 236 114 242 122 240 C130 236 134 212 132 178 C130 170 128 166 126 166 Z"
                    fill={getColor('quadriceps')}
                    fillOpacity={getFillOpacity('quadriceps')}
                    stroke={selectedMuscleId === 'quadriceps' ? '#ffffff' : getColor('quadriceps')}
                    strokeWidth={selectedMuscleId === 'quadriceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('quadriceps')}
                  />

                  {/* Gémeos / Tíbia (Canelas) */}
                  <path
                    d="M72 250 C78 250 86 254 84 286 C80 298 72 298 68 286 C66 270 68 254 72 250 Z"
                    fill={getColor('gemeos')}
                    fillOpacity={getFillOpacity('gemeos')}
                    stroke={selectedMuscleId === 'gemeos' ? '#ffffff' : getColor('gemeos')}
                    strokeWidth={selectedMuscleId === 'gemeos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gemeos')}
                  />
                  <path
                    d="M128 250 C122 250 114 254 116 286 C120 298 128 298 132 286 C134 270 132 254 128 250 Z"
                    fill={getColor('gemeos')}
                    fillOpacity={getFillOpacity('gemeos')}
                    stroke={selectedMuscleId === 'gemeos' ? '#ffffff' : getColor('gemeos')}
                    strokeWidth={selectedMuscleId === 'gemeos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gemeos')}
                  />
                </g>
              ) : (
                /* --- VISTA POSTERIOR (COSTAS) --- */
                <g>
                  {/* Costas (Trapézio, Dorsal e Lombar) */}
                  <path
                    d="M78 52 C92 48 108 48 122 52 C134 68 132 108 122 136 C108 142 92 142 78 136 C68 108 66 68 78 52 Z"
                    fill={getColor('costas')}
                    fillOpacity={getFillOpacity('costas')}
                    stroke={selectedMuscleId === 'costas' ? '#ffffff' : getColor('costas')}
                    strokeWidth={selectedMuscleId === 'costas' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('costas')}
                  />

                  {/* Tríceps (Costas do Braço) */}
                  <path
                    d="M48 76 C54 74 58 78 58 98 C56 114 52 118 48 116 C44 104 44 86 48 76 Z"
                    fill={getColor('triceps')}
                    fillOpacity={getFillOpacity('triceps')}
                    stroke={selectedMuscleId === 'triceps' ? '#ffffff' : getColor('triceps')}
                    strokeWidth={selectedMuscleId === 'triceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('triceps')}
                  />
                  <path
                    d="M152 76 C146 74 142 78 142 98 C144 114 148 118 152 116 C156 104 156 86 152 76 Z"
                    fill={getColor('triceps')}
                    fillOpacity={getFillOpacity('triceps')}
                    stroke={selectedMuscleId === 'triceps' ? '#ffffff' : getColor('triceps')}
                    strokeWidth={selectedMuscleId === 'triceps' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('triceps')}
                  />

                  {/* Glúteos */}
                  <path
                    d="M74 142 C84 140 98 142 98 168 C96 182 86 188 76 184 C68 178 68 152 74 142 Z"
                    fill={getColor('gluteos')}
                    fillOpacity={getFillOpacity('gluteos')}
                    stroke={selectedMuscleId === 'gluteos' ? '#ffffff' : getColor('gluteos')}
                    strokeWidth={selectedMuscleId === 'gluteos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gluteos')}
                  />
                  <path
                    d="M126 142 C116 140 102 142 102 168 C104 182 114 188 124 184 C132 178 132 152 126 142 Z"
                    fill={getColor('gluteos')}
                    fillOpacity={getFillOpacity('gluteos')}
                    stroke={selectedMuscleId === 'gluteos' ? '#ffffff' : getColor('gluteos')}
                    strokeWidth={selectedMuscleId === 'gluteos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gluteos')}
                  />

                  {/* Posterior de Coxa (Isquiotibiais) */}
                  <path
                    d="M72 188 C82 188 94 192 94 224 C90 242 82 244 76 242 C70 238 68 214 72 188 Z"
                    fill={getColor('posterior')}
                    fillOpacity={getFillOpacity('posterior')}
                    stroke={selectedMuscleId === 'posterior' ? '#ffffff' : getColor('posterior')}
                    strokeWidth={selectedMuscleId === 'posterior' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('posterior')}
                  />
                  <path
                    d="M128 188 C118 188 106 192 106 224 C110 242 118 244 124 242 C130 238 132 214 128 188 Z"
                    fill={getColor('posterior')}
                    fillOpacity={getFillOpacity('posterior')}
                    stroke={selectedMuscleId === 'posterior' ? '#ffffff' : getColor('posterior')}
                    strokeWidth={selectedMuscleId === 'posterior' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('posterior')}
                  />

                  {/* Gémeos / Panturrilha (Posterior) */}
                  <path
                    d="M70 250 C78 248 88 252 86 288 C82 298 72 298 68 286 C64 270 66 254 70 250 Z"
                    fill={getColor('gemeos')}
                    fillOpacity={getFillOpacity('gemeos')}
                    stroke={selectedMuscleId === 'gemeos' ? '#ffffff' : getColor('gemeos')}
                    strokeWidth={selectedMuscleId === 'gemeos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gemeos')}
                  />
                  <path
                    d="M130 250 C122 248 112 252 114 288 C118 298 128 298 132 286 C136 270 134 254 130 250 Z"
                    fill={getColor('gemeos')}
                    fillOpacity={getFillOpacity('gemeos')}
                    stroke={selectedMuscleId === 'gemeos' ? '#ffffff' : getColor('gemeos')}
                    strokeWidth={selectedMuscleId === 'gemeos' ? '2' : '1'}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => handleMuscleClick('gemeos')}
                  />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Painel Lateral: Cartão Detalhado do Músculo Selecionado */}
        <div className="md:col-span-5 space-y-3.5">
          <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Grupo Selecionado
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                selectedMuscle.status === 'fatigued'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : selectedMuscle.status === 'recovering'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}>
                {selectedMuscle.statusLabel}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-white">
                {selectedMuscle.name}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedMuscle.lastTrained
                  ? `Último estímulo há ${selectedMuscle.lastTrained.hoursAgo}h (${selectedMuscle.lastTrained.workoutTitle})`
                  : 'Sem carga registada nas últimas 96 horas.'}
              </p>
            </div>

            {/* Barra de Recuperação com Numeral Tabular */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                <span className="text-zinc-400">Nível de Prontidão:</span>
                <span className="font-mono tabular-nums text-white">{selectedMuscle.recoveryPct}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    selectedMuscle.status === 'fatigued'
                      ? 'bg-rose-500'
                      : selectedMuscle.status === 'recovering'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${selectedMuscle.recoveryPct}%` }}
                />
              </div>
            </div>

            {/* Prescrição / Recomendação Prática */}
            <div className="pt-2 border-t border-white/[0.06] flex items-start gap-2 text-xs text-zinc-300">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                {selectedMuscle.recoveryPct >= 80
                  ? 'Totalmente regenerado e pronto para novas sobrecargas com intensidade máxima.'
                  : selectedMuscle.recoveryPct >= 45
                    ? 'Em recuperação ativa. Pode tolerar estímulo moderado ou exercícios sinérgicos.'
                    : 'Fadiga residual elevada. Recomenda-se repouso para supercompensação tendínea e hipertrófica.'}
              </p>
            </div>
          </div>

          {/* Lista de Seleção Rápida de Grupos em Mobile */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {MUSCLE_GROUPS.map((m) => {
              const isCurrent = selectedMuscleId === m.id;
              const data = muscles[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMuscleClick(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isCurrent
                      ? 'bg-zinc-800 text-white border-white/[0.2] shadow-xs'
                      : 'bg-zinc-950/70 text-zinc-400 border-white/[0.06] hover:text-zinc-200'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: getColor(m.id) }} />
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
