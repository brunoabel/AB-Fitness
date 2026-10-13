import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  AlertCircle, 
  Wind, 
  CheckCircle2, 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  Activity,
  Award
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/workoutGenerator';

// Componente de Diagrama Anatómico e Biomecânico Preciso
function BiomechanicalDiagram({ exercise, isPlaying }) {
  const lightBg = '#070d18';
  const animClass = isPlaying ? '' : '[animation-play-state:paused]';

  // Buscar dados ricos do banco de dados anatómico se disponível
  const dbData = EXERCISE_DATABASE[exercise?.id] || {};
  const diagramType = dbData.diagramType || exercise?.diagramType || exercise?.animationType || 'generic';

  // Renderizações vetoriais com precisão anatômica de ângulos e grupos musculares
  switch (diagramType) {
    case 'bench-press':
    case 'dumbbell-press':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full select-none">
          <defs>
            <linearGradient id="chestGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <filter id="glow">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>
          </defs>
          <rect width="340" height="210" rx="16" fill={lightBg} />
          
          {/* Grade de Alinhamento Biomecânico */}
          <line x1="40" y1="180" x2="300" y2="180" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Banco Reto Anatômico */}
          <rect x="65" y="130" width="185" height="14" rx="4" fill="#334155" />
          <line x1="90" y1="144" x2="90" y2="180" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          <line x1="225" y1="144" x2="225" y2="180" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          
          {/* Atleta deitado (Tronco, Cabeça, Pés) */}
          <line x1="220" y1="135" x2="245" y2="155" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <line x1="245" y1="155" x2="245" y2="180" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          {/* Tronco com curvatura lombar natural */}
          <path d="M 85 130 Q 140 123 210 130" fill="none" stroke="#64748b" strokeWidth="16" strokeLinecap="round" />
          {/* Cabeça apoiada */}
          <circle cx="80" cy="122" r="13" fill="#64748b" />

          {/* Destaque Anatômico do Peitoral Maior (Agonista) */}
          <path d="M 125 118 Q 150 115 175 118" fill="none" stroke="url(#chestGlow)" strokeWidth="12" strokeLinecap="round" filter="url(#glow)" className="animate-pulse" />

          {/* Ângulo de Segurança dos Cotovelos (45°-60°) */}
          <text x="18" y="32" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Ângulo Cotovelo: 45°-60° (Protege Ombros)
          </text>
          <text x="18" y="48" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Músculo Alvo: Peitoral Maior
          </text>

          {/* Braços com Trajetória do Haltere */}
          <g className={animClass} style={{ animation: 'benchPressMotion 3.2s infinite ease-in-out' }}>
            <line x1="125" y1="122" x2="135" y2="75" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            <line x1="175" y1="122" x2="165" y2="75" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            {/* Halteres */}
            <rect x="120" y="65" width="30" height="12" rx="3" fill="#ffffff" />
            <rect x="150" y="65" width="30" height="12" rx="3" fill="#ffffff" />
            <line x1="135" y1="71" x2="165" y2="71" stroke="#38bdf8" strokeWidth="3" />
            {/* Vetor de Força com Seta */}
            <path d="M 150 56 L 150 44 M 146 48 L 150 44 L 154 48" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes benchPressMotion {
              0%, 100% { transform: translateY(24px); }
              50% { transform: translateY(-12px); }
            }
          `}</style>
        </svg>
      );

    case 'squat':
    case 'bulgarian-split-squat':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full select-none">
          <defs>
            <linearGradient id="legGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="legShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width="340" height="210" rx="16" fill={lightBg} />

          {/* Solo */}
          <line x1="30" y1="185" x2="310" y2="185" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

          {/* Rótulo de Alinhamento */}
          <text x="18" y="32" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Ângulo de Agachamento: 90° (Coxa Paralela)
          </text>
          <text x="18" y="48" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Músculo Alvo: Quadríceps & Glúteo Máximo
          </text>

          {/* Corpo em Movimento de Agachamento Perfeito */}
          <g className={animClass} style={{ animation: 'squatMotion 3.4s infinite ease-in-out' }}>
            {/* Cabeça e Tronco Ereto com Coluna Neutra */}
            <circle cx="170" cy="55" r="13" fill="#64748b" />
            <line x1="170" y1="68" x2="165" y2="115" stroke="#64748b" strokeWidth="14" strokeLinecap="round" />
            {/* Peso Goblet no Peitoral */}
            <rect x="175" y="75" width="16" height="24" rx="4" fill="#ffffff" />
            
            {/* Coxas (Quadríceps com Destaque Azul Bebê) */}
            <line x1="165" y1="115" x2="195" y2="145" stroke="url(#legGlow)" strokeWidth="12" strokeLinecap="round" filter="url(#legShadow)" className="animate-pulse" />
            {/* Pernas (Canela vertical/alinhada) */}
            <line x1="195" y1="145" x2="195" y2="185" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
            {/* Pé firme */}
            <line x1="185" y1="185" x2="208" y2="185" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

            {/* Vetor de Força Indicativo */}
            <path d="M 135 125 L 135 105 M 131 110 L 135 105 L 139 110" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes squatMotion {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(32px); }
            }
          `}</style>
        </svg>
      );

    case 'lat-pulldown':
    case 'barbell-row':
    case 'seated-cable-row':
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full select-none">
          <defs>
            <linearGradient id="backGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="backShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>
          <rect width="340" height="210" rx="16" fill={lightBg} />

          <text x="18" y="32" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Depressão & Adução das Escápulas
          </text>
          <text x="18" y="48" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Músculo Alvo: Grande Dorsal & Romboides
          </text>

          {/* Torre da Polia */}
          <line x1="170" y1="10" x2="170" y2="35" stroke="#475569" strokeWidth="6" />
          <rect x="145" y="150" width="50" height="12" rx="4" fill="#334155" />
          <line x1="170" y1="162" x2="170" y2="185" stroke="#1e293b" strokeWidth="8" />

          {/* Atleta sentado */}
          <circle cx="170" cy="75" r="12" fill="#64748b" />
          <line x1="170" y1="87" x2="168" y2="148" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />

          {/* Destaque das Dorsais (V-Taper) */}
          <path d="M 158 95 Q 146 115 158 135" stroke="url(#backGlow)" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#backShadow)" className="animate-pulse" />
          <path d="M 178 95 Q 190 115 178 135" stroke="url(#backGlow)" strokeWidth="8" fill="none" strokeLinecap="round" filter="url(#backShadow)" className="animate-pulse" />

          {/* Barra e Braços com Movimento Perfeito */}
          <g className={animClass} style={{ animation: 'latPullMotion 3.2s infinite ease-in-out' }}>
            <line x1="170" y1="35" x2="170" y2="60" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3 3" />
            <path d="M 110 60 Q 170 52 230 60" fill="none" stroke="#f8fafc" strokeWidth="6" strokeLinecap="round" />
            {/* Braços com cotovelos puxando para baixo */}
            <path d="M 160 90 L 130 62" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <path d="M 176 90 L 210 62" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes latPullMotion {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(32px); }
            }
          `}</style>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 340 210" className="w-full h-full select-none">
          <defs>
            <linearGradient id="genGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>
          <rect width="340" height="210" rx="16" fill={lightBg} />

          <text x="18" y="32" fill="#38bdf8" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
            Alinhamento Articular & Tensão Mecânica
          </text>
          <text x="18" y="48" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
            Foco: {exercise?.target || 'Grupo Muscular Ativo'}
          </text>

          {/* Figura em pé com postura perfeita */}
          <line x1="60" y1="185" x2="280" y2="185" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="170" cy="62" r="14" fill="#64748b" />
          <line x1="170" y1="76" x2="170" y2="135" stroke="#64748b" strokeWidth="14" strokeLinecap="round" />
          <line x1="164" y1="135" x2="160" y2="185" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
          <line x1="176" y1="135" x2="180" y2="185" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

          {/* Destaque Ativo */}
          <circle cx="170" cy="95" r="18" fill="url(#genGlow)" opacity="0.3" className="animate-pulse" />

          {/* Movimento com halteres laterais */}
          <g className={animClass} style={{ animation: 'genLateralMotion 3s infinite ease-in-out' }}>
            <path d="M 162 82 Q 130 90 105 105" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <path d="M 178 82 Q 210 90 235 105" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <circle cx="100" cy="108" r="8" fill="#ffffff" />
            <circle cx="240" cy="108" r="8" fill="#ffffff" />
          </g>

          <style>{`
            @keyframes genLateralMotion {
              0%, 100% { transform: translateY(18px); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </svg>
      );
  }
}

export default function ExerciseModal({ exercise, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('motion'); // 'motion' | 'steps' | 'safety'

  if (!exercise) return null;

  // Obter detalhes ricos do banco de dados anatómico
  const dbEx = EXERCISE_DATABASE[exercise.id] || {};
  const steps = dbEx.executionSteps || exercise.steps || [
    'Posicione-se com postura neutra e pés firmemente apoiados.',
    'Execute a descida de forma controlada em 2 a 3 segundos.',
    'Suba com aceleração e contração máxima sem travar as articulações.'
  ];
  const checkpoints = dbEx.postureCheckpoints || [
    'Coluna alinhada e abdômen contraído para proteger a lombar.',
    'Trajetória de movimento controlada sem solavancos.',
    'Amplitude completa de movimento sem encurtamento prematuro.'
  ];
  const breathingTip = dbEx.breathing || exercise.breathingTip || 'Inspire na fase excêntrica (descida); expire na fase concêntrica (esforço).';
  const commonMistake = dbEx.commonMistake || exercise.beginnerMistake || 'Usar cargas acima da capacidade e compensar o movimento com a coluna.';
  const evidenceTip = dbEx.evidenceTip || 'A literatura científica demonstra que cadências de 2 a 3 segundos na descida maximizam a hipertrofia e reduzem o risco de lesões articulares.';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-sky-100 dark:border-slate-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal com Marca AB Fitness */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50/90 dark:from-slate-800/90 to-white dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shadow-sm">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                {exercise.target} • AB Fitness
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-tight">
                {exercise.name}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-sky-100 dark:border-slate-800 px-4 pt-2 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('motion')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'motion' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Biomecânica
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'steps' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'safety' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Postura & Respiração
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'motion' && (
            <div className="space-y-4">
              {/* Moldura do Diagrama Anatômico Biomecânico */}
              <div className="relative rounded-2xl overflow-hidden border border-sky-100 dark:border-slate-800 bg-slate-950 p-2 shadow-inner">
                <div className="aspect-[16/10] w-full flex items-center justify-center">
                  <BiomechanicalDiagram exercise={exercise} isPlaying={isPlaying} />
                </div>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-sky-400 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Animar</span>
                    </>
                  )}
                </button>

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black border border-sky-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Músculo Alvo em Azul Bebê
                </div>
              </div>

              {/* Dica Científica Baseada em Evidências */}
              <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Award className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-sky-900 dark:text-sky-300 font-black mb-0.5 uppercase tracking-wide text-[11px]">
                    Ciência do Movimento:
                  </strong>
                  <p className="leading-relaxed">{evidenceTip}</p>
                </div>
              </div>

              {/* Informações de Equipamento e Músculos Secundários */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Equipamento</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exercise.equipment || 'Livre'}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Sinergistas</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exercise.secondary || 'Estabilizadores'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Execução Técnica com Padrão Ouro
              </h3>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 items-start">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-4">
              {/* Checkpoints de Postura */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-black text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  Pontos de Alinhamento e Postura
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {checkpoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Respiração Correta */}
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-black text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4 text-sky-500" />
                  Padrão de Respiração
                </div>
                <p className="text-sm text-sky-950 dark:text-sky-200 leading-relaxed font-medium">
                  {breathingTip}
                </p>
              </div>

              {/* Erro Crítico a Evitar */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-black text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Erro Crítico a Evitar
                </div>
                <p className="text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                  {commonMistake}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Intervalo ideal entre séries: <strong>{exercise.restTime || 60} segundos</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botão de ação */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-sm shadow-md shadow-sky-400/30 transition-all active:scale-[0.98] cursor-pointer"
          >
            Entendido, executar com técnica perfeita!
          </button>
        </div>
      </div>
    </div>
  );
}
