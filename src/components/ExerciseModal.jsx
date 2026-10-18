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
  ArrowRight,
  Clock
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/workoutGenerator';
import { getExerciseVisual } from '../data/exerciseVisuals';
import { findExerciseIn100 } from '../data/exercises100';

export default function ExerciseModal({ exercise, onClose }) {
  const [activeTab, setActiveTab] = useState('biomechanics'); // 'biomechanics' | 'steps' | 'safety'

  if (!exercise) return null;

  // Busca dados visuais exatos e verificados
  const visual = getExerciseVisual(exercise);

  // Busca dados complementares do banco oficial de 100 exercícios
  const official100 = findExerciseIn100(exercise.id || exercise.name || exercise.nome);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-[#121215] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-zinc-200/80 dark:border-zinc-700 shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                  Guia Técnico • {official100?.grupo || exercise.target || visual?.targetGroup}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                {official100?.nome || exercise.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Especificações Biomecânicas (Oficial AB Fitness) */}
        {official100 && (
          <div className="px-4 py-2 bg-zinc-100/90 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-black text-zinc-900 dark:text-white uppercase">{official100.grupo}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-zinc-200 dark:bg-zinc-800 text-sky-600 dark:text-sky-400 border border-zinc-300 dark:border-zinc-700">
                {official100.mecanica}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-zinc-600 dark:text-zinc-300 text-[10px]">
              <span className="font-bold">{official100.series} séries</span>
              <span>•</span>
              <span className="font-bold">{official100.reps} reps</span>
              <span>•</span>
              <span className="font-bold text-amber-500 dark:text-amber-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {official100.descanso_seg}s
              </span>
            </div>
          </div>
        )}

        {/* Abas Superiores de Navegação */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-[#121215] px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('biomechanics')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'biomechanics' 
                ? 'border-black dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Biomecânica
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'steps' 
                ? 'border-black dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'safety' 
                ? 'border-black dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Postura & Respiração
          </button>
        </div>

        {/* Conteúdo Rolável do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* ABA 1: BIOMECÂNICA & FASES DE MOVIMENTO (SEM FOTOS INCORRETAS) */}
          {activeTab === 'biomechanics' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Card de Foco Anatômico Técnico */}
              <div className="p-4 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-sky-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    MÚSCULO ALVO PRINCIPAL
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {official100?.mecanica || 'Exercício Técnico'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white tracking-tight">
                  {official100?.grupo || exercise.target || visual?.targetGroup}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {visual?.targetGroup ? `Ativação primária: ${visual.targetGroup}` : `Foco mecânico direcionado para hipertrofia e força muscular.`}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Equipamento</span>
                    <span className="font-bold text-zinc-200 text-xs">{visual?.equipment || official100?.mecanica || 'Livre / Máquina'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Sinergistas</span>
                    <span className="font-bold text-zinc-200 text-xs">{visual?.secondary || 'Cadeia de Estabilização'}</span>
                  </div>
                </div>
              </div>

              {/* Fases Anatômicas de Execução */}
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Fases Biomecânicas do Exercício</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Posição Inicial */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      <span>1. Posição Inicial & Alinhamento Articular:</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed pl-3.5">
                      {visual?.phaseInitial || 'Posicione os pés firmemente e ajuste as articulações com a coluna alinhada antes de aplicar força.'}
                    </p>
                  </div>

                  {/* Pico de Contração */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                      <span>2. Pico de Contração (Fase Concêntrica):</span>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed pl-3.5">
                      {visual?.phaseConcentric || 'Execute a fase positiva com aceleração consciente e aperte o músculo alvo no pico.'}
                    </p>
                  </div>

                  {/* Fase Excêntrica */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>3. Descida Excêntrica Controlada (2 a 3s):</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed pl-3.5">
                      {visual?.phaseEccentric || 'Retorne de forma controlada resistindo ao peso para maximizar o dano mecânico e ganho muscular.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Anatômicas de Apoio */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Equipamento</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">{visual.equipment}</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Sinergistas</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">{visual.secondary}</span>
                </div>
              </div>

              {/* Dica Científica Baseada em Evidências */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-bold mb-0.5 text-[11px]">
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
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                Execução Técnica Padrão Ouro
              </h3>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 items-start">
                  <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">
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
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Checkpoints de Alinhamento e Postura</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {checkpoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Padrão de Respiração */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Padrão de Respiração</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {breathingTip}
                </p>
              </div>

              {/* Erro Crítico a Evitar */}
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Erro Crítico a Evitar</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-rose-200 leading-relaxed font-medium">
                  {commonMistake}
                </p>
              </div>

              {/* Intervalo de Descanso */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Intervalo ideal entre séries: <strong className="text-zinc-900 dark:text-white font-bold">{exercise.restTime || 60} segundos</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão de Ação */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Executar com Técnica Perfeita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
