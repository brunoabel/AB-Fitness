import React, { useState } from 'react';
import { X, Play, Pause, AlertCircle, Wind, CheckCircle2, Dumbbell, Sparkles, ShieldCheck } from 'lucide-react';

// Ilustrações dinâmicas em SVG animado para os exercícios
function ExerciseSvgAnimation({ type, isPlaying }) {
  const lightBg = '#0f172a';
  const darkBone = '#64748b';

  const animClass = isPlaying ? '' : '[animation-play-state:paused]';

  switch (type) {
    case 'chest-press':
    case 'dumbbell-press':
    case 'incline-press':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full">
          <defs>
            <linearGradient id="blueGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.35" />
            </filter>
          </defs>
          <rect width="320" height="200" rx="16" fill={lightBg} />
          {/* Banco */}
          <rect x="70" y="130" width="180" height="12" rx="6" fill="#334155" />
          <rect x="155" y="142" width="10" height="35" rx="3" fill="#1e293b" />
          <line x1="85" y1="142" x2="85" y2="177" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
          <line x1="235" y1="142" x2="235" y2="177" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

          {/* Tronco */}
          <rect x="90" y="118" width="140" height="14" rx="7" fill={darkBone} />
          {/* Cabeça */}
          <circle cx="80" cy="120" r="12" fill={darkBone} />
          {/* Destaque Peitoral */}
          <rect x="120" y="114" width="45" height="10" rx="5" fill="url(#blueGlow)" filter="url(#shadow)" className="animate-pulse" />

          {/* Braços e Halteres com animação */}
          <g className={`transition-all duration-700 ease-in-out ${animClass}`} style={{
            animation: 'benchPressMotion 3s infinite ease-in-out'
          }}>
            <line x1="100" y1="75" x2="220" y2="75" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <rect x="92" y="63" width="8" height="24" rx="2" fill="url(#blueGlow)" />
            <rect x="220" y="63" width="8" height="24" rx="2" fill="url(#blueGlow)" />
            <path d="M 130 120 Q 120 100 135 75" fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            <path d="M 180 120 Q 195 100 185 75" fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes benchPressMotion {
              0%, 100% { transform: translateY(28px); }
              50% { transform: translateY(-12px); }
            }
          `}</style>
        </svg>
      );

    case 'lat-pulldown':
    case 'underhand-pulldown':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full">
          <defs>
            <linearGradient id="pullGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill={lightBg} />
          <line x1="160" y1="10" x2="160" y2="40" stroke="#475569" strokeWidth="8" />
          <path d="M 100 30 Q 160 20 220 30" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          <rect x="135" y="140" width="50" height="10" rx="4" fill="#334155" />
          <rect x="155" y="150" width="10" height="30" fill="#1e293b" />
          <rect x="150" y="85" width="20" height="55" rx="8" fill={darkBone} />
          <circle cx="160" cy="70" r="12" fill={darkBone} />
          <path d="M 148 92 Q 138 105 148 120" stroke="url(#pullGlow)" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-pulse" />
          <path d="M 172 92 Q 182 105 172 120" stroke="url(#pullGlow)" strokeWidth="6" fill="none" strokeLinecap="round" className="animate-pulse" />

          <g style={{ animation: 'pulldownMotion 3.2s infinite ease-in-out' }}>
            <line x1="160" y1="30" x2="160" y2="55" stroke="#94a3b8" strokeWidth="3" strokeDasharray="3 3" />
            <path d="M 105 55 Q 160 50 215 55" fill="none" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
            <path d="M 152 85 Q 125 70 120 56" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
            <path d="M 168 85 Q 195 70 200 56" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes pulldownMotion {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(34px); }
            }
          `}</style>
        </svg>
      );

    case 'bicep-curl':
    case 'hammer-curl':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full">
          <defs>
            <linearGradient id="armGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill={lightBg} />
          <line x1="60" y1="180" x2="260" y2="180" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="150" cy="50" r="14" fill={darkBone} />
          <rect x="140" y="65" width="22" height="60" rx="8" fill={darkBone} />
          <line x1="145" y1="125" x2="142" y2="178" stroke={darkBone} strokeWidth="8" strokeLinecap="round" />
          <line x1="157" y1="125" x2="160" y2="178" stroke={darkBone} strokeWidth="8" strokeLinecap="round" />

          <g>
            <line x1="150" y1="75" x2="152" y2="105" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
            <circle cx="148" cy="90" r="7" fill="url(#armGlow)" className="animate-pulse" />
            <g style={{
              transformOrigin: '152px 105px',
              animation: 'bicepFlexMotion 3s infinite ease-in-out'
            }}>
              <line x1="152" y1="105" x2="175" y2="128" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
              <circle cx="180" cy="133" r="8" fill="#38bdf8" />
              <rect x="174" y="128" width="12" height="10" rx="2" fill="#0284c7" />
            </g>
          </g>

          <style>{`
            @keyframes bicepFlexMotion {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-75deg); }
            }
          `}</style>
        </svg>
      );

    case 'leg-press':
    case 'squat':
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full">
          <defs>
            <linearGradient id="legGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill={lightBg} />
          <line x1="60" y1="170" x2="230" y2="40" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
          <rect x="65" y="145" width="60" height="25" rx="6" fill="#1e293b" />
          <rect x="80" y="120" width="30" height="40" rx="8" fill={darkBone} transform="rotate(35 80 120)" />
          <circle cx="75" cy="115" r="12" fill={darkBone} />
          <ellipse cx="120" cy="120" rx="14" ry="7" fill="url(#legGlow)" className="animate-pulse" transform="rotate(-30 120 120)" />

          <g style={{ animation: 'legPressMotion 3.5s infinite ease-in-out' }}>
            <rect x="180" y="45" width="20" height="50" rx="4" fill="#64748b" transform="rotate(-45 180 45)" />
            <circle cx="178" cy="62" r="6" fill="#38bdf8" />
            <path d="M 105 140 Q 135 110 175 65" fill="none" stroke="#38bdf8" strokeWidth="9" strokeLinecap="round" />
          </g>

          <style>{`
            @keyframes legPressMotion {
              0%, 100% { transform: translate(0px, 0px); }
              50% { transform: translate(-32px, 24px); }
            }
          `}</style>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 320 200" className="w-full h-full">
          <defs>
            <linearGradient id="stdGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>
          <rect width="320" height="200" rx="16" fill={lightBg} />
          <circle cx="160" cy="55" r="15" fill={darkBone} />
          <rect x="148" y="72" width="24" height="60" rx="8" fill={darkBone} />
          <circle cx="140" cy="80" r="9" fill="url(#stdGlow)" className="animate-pulse" />
          <circle cx="180" cy="80" r="9" fill="url(#stdGlow)" className="animate-pulse" />

          <g style={{ animation: 'lateralRaiseMotion 3s infinite ease-in-out' }}>
            <path d="M 148 76 Q 110 75 90 85" fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            <path d="M 172 76 Q 210 75 230 85" fill="none" stroke="#38bdf8" strokeWidth="7" strokeLinecap="round" />
            <circle cx="85" cy="87" r="8" fill="#38bdf8" />
            <circle cx="235" cy="87" r="8" fill="#38bdf8" />
          </g>
          <style>{`
            @keyframes lateralRaiseMotion {
              0%, 100% { transform: translateY(22px); }
              50% { transform: translateY(-8px); }
            }
          `}</style>
        </svg>
      );
  }
}

export default function ExerciseModal({ exercise, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('motion'); // 'motion' | 'steps' | 'tips'

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-sky-100 dark:border-slate-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50/80 dark:from-slate-800/80 to-white dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                {exercise.target}
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

        {/* Tabs de navegação dentro do modal */}
        <div className="flex border-b border-sky-100 dark:border-slate-800 px-4 pt-2 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('motion')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'motion' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Visual & Campo
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'steps' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Execução Correta
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'tips' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Respiração & Erros
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'motion' && (
            <div className="space-y-4">
              {/* Moldura da Demonstração Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-sky-100 dark:border-slate-800 bg-slate-950 p-2 shadow-inner">
                <div className="aspect-[16/10] w-full flex items-center justify-center">
                  <ExerciseSvgAnimation type={exercise.animationType} isPlaying={isPlaying} />
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-sky-400 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Animar
                    </>
                  )}
                </button>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-black border border-sky-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  Músculo Alvo Ativado
                </div>
              </div>

              {/* Destaque do benefício no futebol */}
              {exercise.soccerBenefit && (
                <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-sky-900 dark:text-sky-300 font-black mb-0.5 uppercase tracking-wide">
                      Por que você precisa disso no futebol:
                    </strong>
                    {exercise.soccerBenefit}
                  </div>
                </div>
              )}

              {/* Informações de Equipamento */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Equipamento</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exercise.equipment}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Músculos Secundários</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{exercise.secondary}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Como executar com perfeição
              </h3>
              {exercise.steps.map((step, idx) => (
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

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-200/80 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-black text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4" />
                  Como Respirar (Oxigênio para Correr Mais)
                </div>
                <p className="text-sm text-sky-950 dark:text-sky-200 leading-relaxed font-medium">
                  {exercise.breathingTip}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4" />
                  Erro de Frango a Evitar
                </div>
                <p className="text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                  {exercise.beginnerMistake}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Tempo de descanso sugerido: <strong className="text-slate-800 dark:text-white font-bold">{exercise.restTime} segundos</strong>.
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com botão de ação */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-sm shadow-md shadow-sky-400/30 transition-all active:scale-[0.98]"
          >
            Peguei a visão, bora treinar!
          </button>
        </div>
      </div>
    </div>
  );
}
