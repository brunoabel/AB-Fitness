import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Droplets, Moon, Calculator, Zap } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-sky-100 dark:border-slate-800 flex flex-col max-h-[90vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Guia */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-50 dark:from-slate-800 to-white dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-400/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                Guia Exclusivo Sub-17
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                Manual do Atleta de Futebol
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Boas-Vindas do Atleta */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 dark:from-slate-800/80 to-white dark:to-slate-800/40 border border-sky-100 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-black text-xs uppercase mb-1">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Como Conciliar Academia & Clube 4x/Semana
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Quem joga em clube gasta muita energia nas pernas. O seu treino na academia não é pra te deixar travado sem conseguir correr, e sim pra te transformar num <strong>monstro no ombro a ombro</strong>, com arrancada de velocista e zero lesões musculares.
            </p>
          </div>

          {/* Calculadora Didática de Carga Segura */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-sky-200/80 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white font-black text-xs uppercase">
              <Calculator className="w-4 h-4 text-sky-500" />
              Calculadora de Peso Seguro para Atletas
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Calcule a carga ideal para não queimar as pernas pro treino do clube:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Seu Peso (kg)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={calcBodyWeight}
                    onChange={(e) => setCalcBodyWeight(Number(e.target.value) || 60)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-white text-sm focus:border-sky-400 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500 font-medium">kg</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                  Exercício Chave
                </label>
                <select
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-white text-xs focus:border-sky-400 focus:outline-none"
                >
                  <option value="bulgaro">Búlgaro (Sprint)</option>
                  <option value="rdl">RDL / Posterior</option>
                  <option value="peito">Supino (Ombro a Ombro)</option>
                  <option value="costas">Puxada (Postura em V)</option>
                  <option value="bracos">Braços (Rosca/Tríceps)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-sky-50 dark:bg-slate-800 rounded-xl border border-sky-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Carga Inicial Segura:</span>
              <span className="text-base font-black text-sky-600 dark:text-sky-400">
                ~{getSuggestedStartingWeight()} kg em cada mão
              </span>
            </div>
          </div>

          {/* Os 3 Mandamentos do Jogador de 16 Anos */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
              <Droplets className="w-4 h-4 text-sky-500 mx-auto" />
              <div className="font-black text-slate-700 dark:text-slate-200 text-[11px]">Água</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">3 a 4L no dia de jogo e treino</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
              <Moon className="w-4 h-4 text-indigo-400 mx-auto" />
              <div className="font-black text-slate-700 dark:text-slate-200 text-[11px]">Sono</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">8h por noite: hormônio de crescimento</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
              <div className="font-black text-slate-700 dark:text-slate-200 text-[11px]">Reserva</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Guarde 2 reps pra não lesionar no clube</div>
            </div>
          </div>

          {/* Dicas Estratégicas para o Futebol */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Dicas de Ouro dos Preparadores Físicos
            </h3>
            {BEGINNER_GUIDE.map((guide, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">
                    {guide.title}
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    {guide.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {guide.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Fechar */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 text-white font-black text-sm shadow-md shadow-sky-400/30 transition-all active:scale-[0.98]"
          >
            Entendido, fechar manual!
          </button>
        </div>
      </div>
    </div>
  );
}
