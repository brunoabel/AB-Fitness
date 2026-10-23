import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck, Droplets, Moon, Calculator, Zap } from 'lucide-react';
import { BEGINNER_GUIDE } from '../data/workouts';

export default function BeginnerGuideModal({ onClose }) {
  const [calcBodyWeight, setCalcBodyWeight] = useState(65);
  const [exerciseType, setExerciseType] = useState('bulgaro');

  const getSuggestedStartingWeight = () => {
    switch (exerciseType) {
      case 'peito':
        return Math.max(8, Math.round(calcBodyWeight * 0.22));
      case 'costas':
        return Math.max(15, Math.round(calcBodyWeight * 0.3));
      case 'bulgaro':
        return Math.max(6, Math.round(calcBodyWeight * 0.15));
      case 'rdl':
        return Math.max(10, Math.round(calcBodyWeight * 0.25));
      case 'bracos':
        return Math.max(6, Math.round(calcBodyWeight * 0.1));
      default:
        return 8;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-zinc-950 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Guia */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Ciência & Performance • AB Fitness
              </span>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Manual de Hipertrofia & Rendimento
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Boas-Vindas do Atleta */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs uppercase mb-1">
              <BookOpen className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              Princípios Científicos de Treino & Evolução
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              A musculação de alto rendimento é guiada pela <strong>sobrecarga progressiva</strong>, controlo biomecânico e recuperação muscular adequada. Treinar com inteligência garante máxima hipertrofia, potência atlética e longevidade articular sem risco de lesões.
            </p>
          </div>

          {/* Calculadora Didática de Carga Segura */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-xs uppercase">
              <Calculator className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              Calculadora de Carga Inicial Recomendada
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Estime uma faixa de carga recomendada para iniciar a sua progressão com base no seu peso corporal:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">
                  O seu Peso (kg)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={calcBodyWeight}
                    onChange={(e) => setCalcBodyWeight(Number(e.target.value) || 60)}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 font-mono tabular-nums font-bold text-zinc-900 dark:text-white text-sm focus:border-zinc-400 focus:outline-none"
                  />
                  <span className="text-xs text-zinc-500 font-medium">kg</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1 uppercase">
                  Exercício Padrão
                </label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 font-semibold text-zinc-900 dark:text-white text-xs focus:border-zinc-400 focus:outline-none cursor-pointer"
                >
                  <option value="bulgaro">Búlgaro / Unilateral</option>
                  <option value="rdl">RDL / Stiff Posterior</option>
                  <option value="peito">Supino Plano / Inclinado</option>
                  <option value="costas">Puxada / Remada</option>
                  <option value="bracos">Braços (Bíceps / Tríceps)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Carga Inicial Segura:</span>
              <span className="text-sm font-bold font-mono tabular-nums text-zinc-900 dark:text-white">
                ~{getSuggestedStartingWeight()} kg em cada mão
              </span>
            </div>
          </div>

          {/* Os 3 Pilares da Recuperação */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <Droplets className="w-4 h-4 text-zinc-700 dark:text-zinc-300 mx-auto" />
              <div className="font-bold text-zinc-900 dark:text-white text-[11px]">Hidratação</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">35–45 ml/kg diário</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <Moon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 mx-auto" />
              <div className="font-bold text-zinc-900 dark:text-white text-[11px]">Sono Anabólico</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">7 a 9h por noite</div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="font-bold text-zinc-900 dark:text-white text-[11px]">RIR (Reserva)</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono tabular-nums">1–2 reps de reserva</div>
            </div>
          </div>

          {/* Dicas Estratégicas Baseadas em Ciência */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Diretrizes de Fisiologia & Treino
            </h3>
            {BEGINNER_GUIDE.map((guide, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {guide.title}
                  </h4>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                    {guide.tag}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {guide.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Fechar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold text-sm transition-colors cursor-pointer active:scale-[0.99]"
          >
            Entendido, aplicar no treino
          </button>
        </div>
      </div>
    </div>
  );
}
