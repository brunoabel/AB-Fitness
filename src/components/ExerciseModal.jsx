import React, { useState } from 'react';
import { 
  X, 
  AlertCircle, 
  Wind, 
  CheckCircle2, 
  Dumbbell, 
  ShieldCheck, 
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/workoutGenerator';
import { getExerciseVisual } from '../data/exerciseVisuals';

export default function ExerciseModal({ exercise, onClose }) {
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'steps' | 'safety'
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!exercise) return null;

  // Busca dados visuais exatos e verificados
  const visual = getExerciseVisual(exercise);

  // Busca dados complementares do banco de dados anatômico
  const dbEx = EXERCISE_DATABASE[exercise.id] || {};
  const steps = dbEx.executionSteps || exercise.steps || [
    'Posicione-se com alinhamento articular neutro e pés firmes no solo.',
    'Execute a descida (fase excêntrica) de forma controlada em 2 a 3 segundos.',
    'Suba com aceleração e contração máxima sem perder a postura correta.'
  ];
  const checkpoints = dbEx.postureCheckpoints || [
    'Coluna vertebral mantida em curvatura neutra e abdômen contraído.',
    'Trajetória de movimento controlada sem compensações nem impulsos.',
    'Amplitude completa de movimento sem encurtamento precoce.'
  ];
  const breathingTip = dbEx.breathing || exercise.breathingTip || 'Inspire na fase excêntrica (descida); expire com força na fase concêntrica (subida).';
  const commonMistake = dbEx.commonMistake || exercise.beginnerMistake || 'Usar cargas além do controle e balançar o corpo para completar repetições.';
  const evidenceTip = dbEx.evidenceTip || exercise.soccerBenefit || 'A literatura científica demonstra que cadências excêntricas controladas (2-3s) maximizam a hipertrofia e previnem lesões tendíneas.';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold border border-sky-100 dark:border-slate-700 shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest block">
                Guia Técnico • {exercise.target || visual?.targetGroup}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {exercise.name}
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

        {/* Abas Superiores de Navegação */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'visual' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Execução & Fases
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'steps' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'safety' 
                ? 'border-sky-500 text-sky-600 dark:text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Postura & Respiração
          </button>
        </div>

        {/* Conteúdo Rolável do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* ABA 1: EXECUÇÃO VISUAL REALISTA */}
          {activeTab === 'visual' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Foto Real de Alta Resolução do Exercício Exato */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 shadow-md">
                <div className="aspect-[16/10] w-full relative overflow-hidden bg-slate-900">
                  <img
                    src={visual.photoUrl}
                    alt={exercise.name}
                    onLoad={() => setImageLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                      imageLoaded ? 'opacity-90' : 'opacity-0'
                    }`}
                  />
                  
                  {/* Gradiente sutil inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Badges sobre a foto */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-sky-400 text-[10px] font-bold border border-sky-400/30 flex items-center gap-1 shadow-xs">
                      🎯 Músculo Alvo: {visual.targetGroup}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 font-semibold text-[11px] truncate">
                      {visual.equipment}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fases Anatômicas de Execução */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>Fases Biomecânicas do Exercício</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Posição Inicial */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>1. Posição Inicial & Apoio:</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                      {visual.phaseInitial}
                    </p>
                  </div>

                  {/* Pico de Contração */}
                  <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                    <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>2. Pico de Contração (Força):</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-3.5">
                      {visual.phaseConcentric}
                    </p>
                  </div>

                  {/* Fase Excêntrica */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>3. Descida Excêntrica (Sob Tensão):</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-3.5">
                      {visual.phaseEccentric}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Anatômicas de Apoio */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Equipamento</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{visual.equipment}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Sinergistas</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{visual.secondary}</span>
                </div>
              </div>

              {/* Dica Científica Baseada em Evidências */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 dark:text-white font-bold mb-0.5 text-[11px]">
                    Ciência & Rendimento Fisiológico:
                  </strong>
                  <p className="leading-relaxed text-[11px]">{evidenceTip}</p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: PASSO A PASSO TÉCNICO */}
          {activeTab === 'steps' && (
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
                Execução Técnica Padrão Ouro
              </h3>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 items-start">
                  <div className="w-6 h-6 rounded-full bg-sky-500 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ABA 3: POSTURA & SEGURANÇA */}
          {activeTab === 'safety' && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Checkpoints de Alinhamento */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>Checkpoints de Alinhamento e Postura</span>
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

              {/* Padrão de Respiração */}
              <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 space-y-1">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4 text-sky-500" />
                  <span>Padrão de Respiração</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {breathingTip}
                </p>
              </div>

              {/* Erro Crítico a Evitar */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Erro Crítico a Evitar</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-rose-200 leading-relaxed font-medium">
                  {commonMistake}
                </p>
              </div>

              {/* Intervalo de Descanso */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Intervalo ideal entre séries: <strong className="text-sky-600 dark:text-sky-400 font-bold">{exercise.restTime || 60} segundos</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão de Ação */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Executar com Técnica Perfeita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
