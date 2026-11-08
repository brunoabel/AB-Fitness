import React, { useState } from 'react';
import { 
  Zap, 
  Check, 
  ArrowRight, 
  ChevronLeft, 
  Activity, 
  Dumbbell, 
  Flame, 
  ShieldCheck, 
  X,
  Award
} from 'lucide-react';
import { generatePersonalizedWorkoutPlan } from '../data/workoutGenerator';
import { triggerHaptic, sound } from '../utils/audio';
import { saveUserProfileLocal } from '../utils/storage';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1: Objetivo | 2: Nível & Frequência | 3: Foco Muscular
  
  // Respostas do Questionário
  const [goal, setGoal] = useState('hypertrophy');
  const [experience, setExperience] = useState('beginner');
  const [frequencyDays, setFrequencyDays] = useState(4);
  const [focusMuscle, setFocusMuscle] = useState('balanced');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const goals = [
    {
      id: 'hypertrophy',
      title: 'Hipertrofia & Massa Muscular',
      desc: 'Ganho de volume, definição estética e densidade muscular (8-12 reps).',
      icon: Dumbbell,
    },
    {
      id: 'fat_loss',
      title: 'Emagrecimento & Definição',
      desc: 'Alta queima calórica, preservação de massa magra e perda de gordura.',
      icon: Flame,
    },
    {
      id: 'athlete',
      title: 'Performance de Atleta (Futebol / Desportos)',
      desc: 'Força de arranque, potência unilateral e prevenção de lesões.',
      icon: Zap,
    },
    {
      id: 'strength',
      title: 'Força Pura & Cargas Pesadas',
      desc: 'Foco nos básicos (Agachamento, Supino, Terra) para quebrar recordes.',
      icon: Activity,
    },
    {
      id: 'health',
      title: 'Saúde, Postura & Longevidade',
      desc: 'Qualidade de vida, fortalecimento articular e alinhamento postural.',
      icon: ShieldCheck,
    }
  ];

  const experienceLevels = [
    { id: 'beginner', title: 'Iniciante', desc: 'Menos de 6 meses de treino consistente.' },
    { id: 'intermediate', title: 'Intermédio', desc: '6 meses a 2 anos (domínio da biomecânica).' },
    { id: 'advanced', title: 'Avançado', desc: 'Mais de 2 anos (otimização de cargas e periodização).' }
  ];

  const frequencies = [
    { days: 3, label: '3 dias por semana', detail: 'Divisão Full Body A/B/C completa' },
    { days: 4, label: '4 dias por semana', detail: 'Divisão Upper / Lower A/B (Padrão Ouro)' },
    { days: 5, label: '5 dias por semana', detail: 'Divisão Push / Pull / Legs + Upper / Lower' }
  ];

  const musclePriorities = [
    { id: 'balanced', label: 'Equilíbrio Total do Corpo', desc: 'Proporção harmónica em todos os grupos musculares' },
    { id: 'arms_chest', label: 'Tronco & Braços', desc: 'Ênfase em Peito, Bíceps, Tríceps e Ombros' },
    { id: 'legs_glutes', label: 'Pernas & Glúteos', desc: 'Ênfase em Quadricípites, Posteriores e Glúteos' },
    { id: 'back_posture', label: 'Costas & Formato em V', desc: 'Ênfase em Dorsais, Rombóides e Postura' }
  ];

  const handleFinish = () => {
    setIsSubmitting(true);
    triggerHaptic([30, 80, 40]);
    try {
      if (sound && typeof sound.playCelebration === 'function') {
        sound.playCelebration();
      }
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }

    try {
      const profileData = {
        goal,
        experience,
        frequencyDays,
        focusMuscle,
        createdAt: new Date().toISOString()
      };

      // Gera o plano científico sob medida
      const customizedPlan = generatePersonalizedWorkoutPlan({
        goal,
        experience,
        frequencyDays,
        focusMuscle
      });

      saveUserProfileLocal(profileData);

      setTimeout(() => {
        setIsSubmitting(false);
        if (onComplete) {
          onComplete(customizedPlan, profileData);
        }
        onClose();
      }, 500);
    } catch (err) {
      console.error('Erro ao gerar treino:', err);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-white/10 flex flex-col max-h-[92vh] animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Wizard */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
              <Dumbbell className="w-4 h-4 text-white dark:text-zinc-950" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Prescrição Científica • Passo {step} de 3
              </span>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                Personalizar Treino AB Fitness
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso do Wizard */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
          <div 
            className="h-full bg-zinc-900 dark:bg-accent transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* PASSO 1: OBJETIVO PRINCIPAL */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="mb-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Qual é o seu objetivo principal?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  O nosso algoritmo adapta séries, repetições e intervalos de acordo com a ciência do treino.
                </p>
              </div>

              <div className="space-y-2">
                {goals.map((item) => {
                  const Icon = item.icon;
                  const isSelected = goal === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setGoal(item.id);
                        triggerHaptic(10);
                      }}
                      className={`w-full min-h-[52px] p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'border-zinc-950 dark:border-accent/60 bg-zinc-50 dark:bg-accent/[0.06] shadow-xs'
                          : 'border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? 'bg-zinc-950 text-white dark:bg-accent/15 dark:text-accent' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      } flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            {item.title}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-zinc-950 dark:text-white" />}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASSO 2: EXPERIÊNCIA & FREQUÊNCIA */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
                  Qual é o seu nível de experiência com musculação?
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {experienceLevels.map((lvl) => {
                    const isSelected = experience === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => {
                          setExperience(lvl.id);
                          triggerHaptic(10);
                        }}
                        className={`min-h-[64px] p-2.5 rounded-xl border text-center transition-colors cursor-pointer flex flex-col justify-center ${
                          isSelected
                            ? 'border-zinc-950 dark:border-accent/60 bg-zinc-50 dark:bg-accent/[0.06] text-zinc-900 dark:text-white font-bold shadow-xs'
                            : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        <span className="block text-xs font-bold">{lvl.title}</span>
                        <span className="block text-[11px] text-zinc-400 mt-0.5 leading-tight">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-white/10">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">
                  Quantos dias por semana pretende treinar?
                </h3>
                <div className="space-y-2">
                  {frequencies.map((freq) => {
                    const isSelected = frequencyDays === freq.days;
                    return (
                      <button
                        key={freq.days}
                        onClick={() => {
                          setFrequencyDays(freq.days);
                          triggerHaptic(10);
                        }}
                        className={`w-full min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-zinc-950 dark:border-accent/60 bg-zinc-50 dark:bg-accent/[0.06] text-zinc-900 dark:text-white font-bold shadow-xs'
                            : 'border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{freq.label}</span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block font-normal">{freq.detail}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-zinc-950 dark:text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PASSO 3: PRIORIDADE MUSCULAR */}
          {step === 3 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="mb-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Alguma prioridade ou foco especial?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Adaptaremos o volume de séries semanal para enfatizar o seu ponto de maior interesse.
                </p>
              </div>

              <div className="space-y-2">
                {musclePriorities.map((item) => {
                  const isSelected = focusMuscle === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setFocusMuscle(item.id);
                        triggerHaptic(10);
                      }}
                      className={`w-full min-h-[48px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-zinc-950 dark:border-accent/60 bg-zinc-50 dark:bg-accent/[0.06] text-zinc-900 dark:text-white font-bold shadow-xs'
                          : 'border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal block">{item.desc}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-zinc-950 dark:text-white" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
                <span>Baseado em evidências com seleção ideal de exercícios compostos e isolados.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Navegação do Wizard */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => {
                setStep((s) => s - 1);
                triggerHaptic(10);
              }}
              className="min-h-[48px] px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1 active:scale-95 transition-colors cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                setStep((s) => s + 1);
                triggerHaptic(10);
              }}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-accent dark:text-app dark:hover:bg-zinc-200 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-colors ml-auto cursor-pointer"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="min-h-[48px] px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-accent dark:text-app dark:hover:bg-zinc-200 text-white text-xs font-bold flex items-center gap-2 shadow-md active:scale-95 transition-colors ml-auto cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-white dark:border-t-zinc-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" />
                  <span>Gerar Treino Personalizado</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
