import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Dumbbell, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Droplets, 
  Moon, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  Layers,
  HeartPulse
} from 'lucide-react';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile } from './OnboardingModal';
import { triggerHaptic } from '../utils/audio';

export default function AthleteManualModal({ onClose }) {
  // Detecta o objetivo do perfil salvo do usuário ou inicia no atleta
  const savedProfile = getSavedUserProfile();
  const initialGoal = savedProfile?.goal || 'athlete';
  
  const [activeManualKey, setActiveManualKey] = useState(initialGoal);
  const [calcWeight, setCalcWeight] = useState(68);

  const manual = ATHLETE_MANUALS[activeManualKey] || ATHLETE_MANUALS.athlete;

  // Cálculos dinâmicos baseados no peso e no manual ativo
  const getProteinTarget = () => {
    switch (activeManualKey) {
      case 'fat_loss':
        return Math.round(calcWeight * 2.3);
      case 'hypertrophy':
        return Math.round(calcWeight * 2.1);
      case 'athlete':
        return Math.round(calcWeight * 1.9);
      case 'strength':
        return Math.round(calcWeight * 2.0);
      case 'health':
      default:
        return Math.round(calcWeight * 1.7);
    }
  };

  const getWaterTarget = () => {
    const mlPerKg = activeManualKey === 'fat_loss' ? 45 : activeManualKey === 'athlete' ? 45 : 38;
    return ((calcWeight * mlPerKg) / 1000).toFixed(1);
  };

  const tabOptions = [
    { key: 'athlete', label: 'Atleta / Futebol', icon: Zap },
    { key: 'hypertrophy', label: 'Ganhar Peso', icon: Dumbbell },
    { key: 'fat_loss', label: 'Perder Peso', icon: Flame },
    { key: 'strength', label: 'Força Pura', icon: Activity },
    { key: 'health', label: 'Saúde & Postura', icon: ShieldCheck }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-100 dark:border-slate-700 shadow-xs">
              <Sparkles className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">
                Manuais Especializados • AB Fitness
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Diretrizes de Treino & Rendimento
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors active:scale-95"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Seleção de Manual (Segmented Tabs) */}
        <div className="px-3 py-2.5 bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeManualKey === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveManualKey(tab.key);
                  triggerHaptic(10);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo Rolável do Manual Selecionado */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Banner do Manual */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                {manual.tag}
              </span>
              {savedProfile?.goal === activeManualKey && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Seu Perfil Atual
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {manual.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {manual.philosophy}
            </p>
          </div>

          {/* Calculadora Interativa de Proteína & Água */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-sky-500" />
                <span>Calculadora Personalizada de Metas</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value) || 60)}
                  className="w-16 text-center font-bold text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <span className="text-xs text-slate-400 font-semibold">kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                  Proteína Recomendada
                </span>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400 block mt-0.5">
                  {getProteinTarget()} <span className="text-xs font-normal">g/dia</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Para reconstrução muscular
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">
                  Hidratação Mínima
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {getWaterTarget()} <span className="text-xs font-normal">L/dia</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Água para células e tendões
                </span>
              </div>
            </div>
          </div>

          {/* Estrutura & Divisão do Treino */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Diretrizes de Volume & Carga</span>
            </div>

            <div className="space-y-2 text-xs">
              {manual.weeklySplit.map((split, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-900 dark:text-white font-bold">{split.day}</strong>
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">{split.focus}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    {split.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Estratégia Nutricional */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Droplets className="w-4 h-4 text-sky-500" />
              <span>Plano Nutricional & Hidratação</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">Energia & Calorias:</strong>
                <span>{manual.nutritionStrategy.calories}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">Proteínas & Aminoácidos:</strong>
                <span>{manual.nutritionStrategy.protein}</span>
              </div>
              {manual.nutritionStrategy.carbs && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block font-semibold mb-0.5">Carboidratos & Glicogênio:</strong>
                  <span>{manual.nutritionStrategy.carbs}</span>
                </div>
              )}
              {manual.nutritionStrategy.matchMeal && (
                <div className="p-2.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                  <strong className="text-sky-800 dark:text-sky-300 block font-semibold mb-0.5">Refeição Pré-Partida (Matchday):</strong>
                  <span>{manual.nutritionStrategy.matchMeal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prevenção de Lesões & Blindagem */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Prevenção de Lesões & Saúde Articular</span>
            </div>

            <div className="space-y-2 text-xs">
              {manual.injuryPrevention.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">{item.name}</strong>
                  <span className="text-slate-500 dark:text-slate-400">{item.solution}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rotina de Recuperação & Sono */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Moon className="w-4 h-4 text-sky-500" />
              <span>Regeneração & Sono</span>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {manual.recoveryRoutine.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rodapé com Botão */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            Entendido, aplicar ao meu plano de treinos!
          </button>
        </div>
      </div>
    </div>
  );
}
