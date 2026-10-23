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
import { getBiomechanicsForExercise } from '../data/exerciseBiomechanics';

export default function ExerciseModal({ exercise, onClose }) {
  const [activeTab, setActiveTab] = useState('biomechanics'); // 'biomechanics' | 'steps' | 'safety'

  if (!exercise) return null;

  // Busca dados biomecânicos auditados e exatos dos 320 exercícios
  const bio = getBiomechanicsForExercise(exercise);

  // Busca dados visuais com foto em alta resolução
  const visual = getExerciseVisual(exercise);

  // Busca dados complementares do banco oficial de exercícios
  const official100 = findExerciseIn100(exercise.id || exercise.name || exercise.nome);

  // Passos de execução técnica
  const steps = (bio?.passos && bio.passos.length > 0) 
    ? bio.passos 
    : (visual?.steps || exercise.steps || [
        'Posicione-se com alinhamento articular neutro e pés firmes no solo.',
        'Execute a descida (fase excêntrica) de forma controlada em 2 a 3 segundos.',
        'Suba com aceleração e contração máxima sem perder a postura correta.'
      ]);

  // Checkpoints anatômicos
  const checkpoints = (bio?.checkpoints && bio.checkpoints.length > 0)
    ? bio.checkpoints
    : (visual?.checkpoints || [
        'Coluna vertebral mantida em curvatura neutra e abdômen contraído.',
        'Trajetória de movimento controlada sem compensações nem impulsos.',
        'Amplitude completa de movimento sem encurtamento precoce.'
      ]);

  // Padrão de respiração
  const breathingTip = bio?.respiracao || visual?.breathing || exercise.breathingTip || 'Inspire na fase excêntrica (descida); expire com força na fase concêntrica (subida).';

  // Erro comum a evitar
  const commonMistake = bio?.erro_comum || visual?.safetyCheck || exercise.beginnerMistake || 'Usar cargas além do controle e balançar o corpo para completar repetições.';

  // Benefício e para que serve
  const evidenceTip = bio?.beneficio || visual?.evidenceTip || exercise.soccerBenefit || 'A literatura científica demonstra que cadências excêntricas controladas (2-3s) maximizam a hipertrofia e previnem lesões tendíneas.';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-zinc-950 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[92vh] animate-slideUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-bold border border-zinc-200 dark:border-zinc-700 shadow-xs">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                  Guia Técnico • {bio?.grupo || official100?.grupo || exercise.target || visual?.targetGroup}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                {bio?.nome || official100?.nome || exercise.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Especificações Biomecânicas (Oficial AB Fitness) */}
        {(official100 || bio) && (
          <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-mono tabular-nums">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-bold text-zinc-900 dark:text-white uppercase">{bio?.grupo || official100?.grupo}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 font-sans">
                {official100?.mecanica || 'Composto / Padrão'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 text-zinc-600 dark:text-zinc-300 text-[10px]">
              <span className="font-bold">{official100?.series || 4} séries</span>
              <span>•</span>
              <span className="font-bold">{official100?.reps || '8-12'} reps</span>
              <span>•</span>
              <span className="font-bold text-amber-500 dark:text-amber-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {official100?.descanso_seg || exercise.restTime || 60}s
              </span>
            </div>
          </div>
        )}

        {/* Abas Superiores de Navegação */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('biomechanics')}
            className={`flex-1 min-h-[44px] py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'biomechanics' 
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Biomecânica
          </button>
          <button
            onClick={() => setActiveTab('steps')}
            className={`flex-1 min-h-[44px] py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'steps' 
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`flex-1 min-h-[44px] py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'safety' 
                ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            Postura & Respiração
          </button>
        </div>

        {/* Conteúdo Rolável do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* ABA 1: BIOMECÂNICA & FASES DE MOVIMENTO */}
          {activeTab === 'biomechanics' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Card de Foco Anatómico Técnico */}
              <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-sky-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    MÚSCULO ALVO PRINCIPAL
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700 font-sans">
                    {official100?.mecanica || 'Padrão Ouro'}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white tracking-tight">
                  {bio?.alvo || official100?.grupo || exercise.target}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {bio?.alvo ? `Ativação primária: ${bio.alvo}` : `Foco mecânico direcionado para hipertrofia e força muscular.`}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Equipamento</span>
                    <span className="font-bold text-zinc-200 text-xs">{bio?.equipamento || visual?.equipment || 'Livre / Máquina'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Sinergistas</span>
                    <span className="font-bold text-zinc-200 text-xs">{bio?.sinergistas || visual?.secondary || 'Cadeia de Estabilização'}</span>
                  </div>
                </div>
              </div>

              {/* Fases Anatómicas de Execução */}
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-xs">
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
                      {visual?.phaseConcentric || 'Execute a fase positiva com aceleração consciente e contraia o músculo alvo no pico.'}
                    </p>
                  </div>

                  {/* Fase Excêntrica */}
                  <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
                    <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold mb-1 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>3. Descida Excêntrica Controlada (2 a 3s):</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed pl-3.5">
                      {visual?.phaseEccentric || 'Retorne de forma controlada resistindo ao peso para maximizar o estímulo mecânico e hipertrofia.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Anatómicas de Apoio */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Equipamento</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">{bio?.equipamento || visual?.equipment || 'Livre / Máquina'}</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-400 block text-[10px] font-bold uppercase">Sinergistas</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 block">{bio?.sinergistas || visual?.secondary || 'Estabilizadores'}</span>
                </div>
              </div>

              {/* Dica Científica Baseada em Evidências & Para Que Serve */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-zinc-900 dark:text-white font-bold mb-0.5 text-[11px]">
                    Finalidade & Propósito do Exercício (Para que serve):
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
                <div key={idx} className="flex gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 items-start">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-mono tabular-nums">
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
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
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
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4 text-sky-400" />
                  <span>Padrão de Respiração</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {breathingTip}
                </p>
              </div>

              {/* Erro Crítico a Evitar */}
              <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Erro Crítico a Evitar</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-rose-200 leading-relaxed font-medium">
                  {commonMistake}
                </p>
              </div>

              {/* Intervalo de Descanso */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Intervalo ideal entre séries: <strong className="text-zinc-900 dark:text-white font-bold font-mono tabular-nums">{exercise.restTime || 60} segundos</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão de Ação */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-white font-bold text-sm shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Executar com Técnica Perfeita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
