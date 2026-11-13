import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
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

import { findExerciseIn100 } from '../data/exercises100';
import { getBiomechanicsForExercise } from '../data/exerciseBiomechanics';
import { hasExerciseVideo } from '../data/exerciseMedia';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import { getExerciseVisual } from '../data/exerciseVisuals';

export default function ExerciseModal({ exercise, onClose }) {
  const [activeTab, setActiveTab] = useState('biomechanics'); // 'biomechanics' | 'steps' | 'safety'

  if (!exercise) return null;

  // Busca vídeo oficial verificado (garantia de zero mismatch)
  const verifiedVideo = hasExerciseVideo(exercise);

  // Busca dados biomecânicos auditados e exatos dos 320 exercícios
  const bio = getBiomechanicsForExercise(exercise);

  // Textos de reserva (fases, passos, equipamento) quando a ficha biomecânica não os tem.
  // A foto do Unsplash deste objeto não é renderizada.
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
    <ModalBackdrop className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
      <ModalPanel 
        className="w-full sm:max-w-lg bg-app rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-white/[0.08] flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between bg-surface/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-zinc-200 flex items-center justify-center font-bold border border-white/[0.08]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">
                Guia técnico · {bio?.grupo || official100?.grupo || exercise.target || visual?.targetGroup}
              </p>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {bio?.nome || official100?.nome || exercise.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl text-zinc-400 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Especificações Biomecânicas (Oficial AB Fitness) — tipografia de cronógrafo */}
        {(official100 || bio) && (
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between gap-2 overflow-x-auto text-[11px] font-display tabular-nums">
            <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
              <span className="font-bold text-white uppercase">{bio?.grupo || official100?.grupo}</span>
              <span>·</span>
              <span className="uppercase">{official100?.mecanica || 'Composto / Padrão'}</span>
              {verifiedVideo && (
                <span className="flex items-center gap-1 text-white uppercase font-bold">
                  <span>·</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-hover animate-pulse" />
                  Vídeo HD
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0 text-zinc-300 text-[11px]">
              <span className="font-bold">{official100?.series || 4} séries</span>
              <span>•</span>
              <span className="font-bold">{official100?.reps || '8-12'} reps</span>
              <span>•</span>
              <span className="font-bold text-amber-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {official100?.descanso_seg || exercise.restTime || 60}s
              </span>
            </div>
          </div>
        )}

        {/* Abas Superiores de Navegação — indicador desliza entre abas (fluidez nativa) */}
        <div className="flex border-b border-white/[0.06] px-4 text-xs font-semibold">
          {[
            { id: 'biomechanics', label: 'Biomecânica' },
            { id: 'steps', label: 'Passo a Passo' },
            { id: 'safety', label: 'Postura & Respiração' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 min-h-[44px] py-3 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="exercise-modal-tab-indicator"
                  className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent-hover"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Conteúdo Rolável do Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Demonstração em Vídeo de Execução Técnica Auditada (quando disponível) */}
          {/* Vídeo quando existe; caso contrário o próprio player mostra as dicas de execução */}
          <ExerciseVideoPlayer exercise={exercise} />

          {/* ABA 1: BIOMECÂNICA & FASES DE MOVIMENTO */}
          {activeTab === 'biomechanics' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Foco Anatómico Técnico */}
              <div className="p-4 rounded-xl bg-surface text-white border border-white/[0.08] relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">
                    Músculo alvo principal
                  </span>
                  <span className="text-[11px] font-bold uppercase text-zinc-400">
                    {official100?.mecanica || 'Padrão Ouro'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-[-0.02em]">
                  {bio?.alvo || official100?.grupo || exercise.target}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {bio?.alvo ? `Ativação primária: ${bio.alvo}` : `Foco mecânico direcionado para hipertrofia e força muscular.`}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/[0.06] text-xs">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-zinc-500 block">Equipamento</span>
                    <span className="font-bold text-zinc-200 text-xs">{bio?.equipamento || visual?.equipment || 'Livre / Máquina'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase font-bold text-zinc-500 block">Sinergistas</span>
                    <span className="font-bold text-zinc-200 text-xs">{bio?.sinergistas || visual?.secondary || 'Cadeia de Estabilização'}</span>
                  </div>
                </div>
              </div>

              {/* Fases Anatómicas de Execução — lista tipográfica, sem caixas aninhadas */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider px-1 pb-2">
                  <Layers className="w-4 h-4 text-zinc-500" />
                  <span>Fases Biomecânicas do Exercício</span>
                </div>

                <div className="divide-y divide-white/[0.06] border-t border-b border-white/[0.06] text-xs">
                  {[
                    { dot: 'bg-zinc-500', title: '1. Posição Inicial & Alinhamento Articular', text: visual?.phaseInitial || 'Posicione os pés firmemente e ajuste as articulações com a coluna alinhada antes de aplicar força.' },
                    { dot: 'bg-accent-hover', title: '2. Pico de Contração (Fase Concêntrica)', text: visual?.phaseConcentric || 'Execute a fase positiva com aceleração consciente e contraia o músculo alvo no pico.' },
                    { dot: 'bg-amber-400', title: '3. Descida Excêntrica Controlada (2 a 3s)', text: visual?.phaseEccentric || 'Retorne de forma controlada resistindo ao peso para maximizar o estímulo mecânico e hipertrofia.' }
                  ].map((phase) => (
                    <div key={phase.title} className="py-2.5">
                      <div className="flex items-center gap-1.5 text-zinc-200 font-bold mb-1 text-[11px]">
                        <span className={`w-2 h-2 rounded-full ${phase.dot} shrink-0`} />
                        <span>{phase.title}:</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed pl-3.5">{phase.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dica Científica Baseada em Evidências & Para Que Serve */}
              <div className="p-3.5 rounded-xl bg-surface border border-white/[0.08] text-xs text-zinc-300 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-accent-hover shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-bold mb-0.5 text-[11px]">
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
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">
                Execução Técnica Padrão Ouro
              </h3>
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-3 p-3.5 rounded-xl bg-surface border border-white/[0.08] items-start">
                  <div className="w-6 h-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-mono tabular-nums">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
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
              <div className="p-4 rounded-xl bg-surface border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Checkpoints de Alinhamento e Postura</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {checkpoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-hover mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Padrão de Respiração */}
              <div className="p-4 rounded-xl bg-surface border border-white/[0.08] space-y-1">
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-xs uppercase tracking-wide">
                  <Wind className="w-4 h-4 text-accent-hover" />
                  <span>Padrão de Respiração</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
                  {breathingTip}
                </p>
              </div>

              {/* Erro Crítico a Evitar */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-1">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Erro Crítico a Evitar</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-200 leading-relaxed font-medium">
                  {commonMistake}
                </p>
              </div>

              {/* Intervalo de Descanso */}
              <div className="p-3 rounded-xl bg-surface border border-white/[0.08] text-xs text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Intervalo ideal entre séries: <strong className="text-white font-bold font-mono tabular-nums">{exercise.restTime || 60} segundos</strong>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Botão de Ação */}
        <div className="p-4 border-t border-white/[0.06] bg-surface/70">
          <button
            onClick={onClose}
            className="w-full min-h-[48px] py-3.5 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Executar com Técnica Perfeita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}
