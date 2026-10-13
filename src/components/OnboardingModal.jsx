import React, { useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Calendar, 
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

const STORAGE_PROFILE_KEY = 'ab_fitness_user_profile_v1';

export const getSavedUserProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUserProfileLocal = (profile) => {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch {}
};

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
      color: 'from-sky-400 to-sky-600'
    },
    {
      id: 'fat_loss',
      title: 'Emagrecimento & Definição',
      desc: 'Alta queima calórica, preservação de músculos e queima de gordura.',
      icon: Flame,
      color: 'from-amber-400 to-rose-500'
    },
    {
      id: 'athlete',
      title: 'Performance de Atleta (Futebol / Esportes)',
      desc: 'Força de arranque, potência unilateral e prevenção de lesões.',
      icon: Zap,
      color: 'from-sky-500 to-indigo-600'
    },
    {
      id: 'strength',
      title: 'Força Pura & Cargas Pesadas',
      desc: 'Foco nos básicos (Agachamento, Supino, Terra) para quebrar recordes.',
      icon: Activity,
      color: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'health',
      title: 'Saúde, Postura & Longevidade',
      desc: 'Qualidade de vida, fortalecimento articular e alinhamento postural.',
      icon: ShieldCheck,
      color: 'from-emerald-400 to-teal-500'
    }
  ];

  const experienceLevels = [
    { id: 'beginner', title: 'Iniciante', desc: 'Menos de 6 meses de treino consistente.' },
    { id: 'intermediate', title: 'Intermediário', desc: '6 meses a 2 anos (domínio dos movimentos).' },
    { id: 'advanced', title: 'Avançado', desc: 'Mais de 2 anos (busca otimização de cargas).' }
  ];

  const frequencies = [
    { days: 3, label: '3 dias na semana', detail: 'Divisão Full Body A/B/C completa' },
    { days: 4, label: '4 dias na semana', detail: 'Divisão Upper / Lower A/B (Padrão Ouro)' },
    { days: 5, label: '5 dias na semana', detail: 'Divisão Push / Pull / Legs + Upper / Lower' }
  ];

  const musclePriorities = [
    { id: 'balanced', label: 'Equilíbrio Total do Corpo', desc: 'Proporção harmônica em todos os grupos' },
    { id: 'arms_chest', label: 'Tronco & Braços', desc: 'Ênfase em Peito, Bíceps, Tríceps e Ombros' },
    { id: 'legs_glutes', label: 'Pernas & Glúteos', desc: 'Ênfase em Quadríceps, Posterior e Glúteo Máximo' },
    { id: 'back_posture', label: 'Costas & Formato em V', desc: 'Ênfase em Dorsais, Romboides e Postura' }
  ];

  const handleFinish = () => {
    setIsSubmitting(true);
    triggerHaptic([30, 80, 40]);
    sound.playWorkoutComplete();

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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-sky-100 dark:border-slate-800 flex flex-col max-h-[92vh] animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Wizard */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 dark:from-slate-800/90 to-white dark:to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-500 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-400/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                Prescrição Científica • Passo {step} de 3
              </span>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Personalizar Meu Treino AB Fitness
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Progresso do Wizard */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* PASSO 1: OBJETIVO PRINCIPAL */}
          {step === 1 && (
            <div className="space-y-3 animate-fadeIn">
              <div className="mb-2">
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  Qual é o seu objetivo principal?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O nosso algoritmo adapta séries, repetições e intervalos de acordo com a ciência da hipertrofia.
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
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[0.99] ${
                        isSelected
                          ? 'border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 shadow-sm shadow-sky-400/20'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-200'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl text-white bg-gradient-to-tr ${item.color} shadow-sm flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-white'}`}>
                            {item.title}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
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
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1">
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
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-extrabold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="block text-xs font-bold">{lvl.title}</span>
                        <span className="block text-[9px] text-slate-400 mt-0.5 leading-tight">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1">
                  Quantos dias por semana você pretende treinar?
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
                        className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{freq.label}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{freq.detail}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-500" />}
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
                <h3 className="text-base font-black text-slate-800 dark:text-white">
                  Alguma prioridade ou foco especial?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
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
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[11px] text-slate-400 font-normal block">{item.desc}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-sky-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <span>Baseado em evidências com seleção ideal de exercícios compostos e isolados.</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Navegação do Wizard */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={() => {
                setStep((s) => s - 1);
                triggerHaptic(10);
              }}
              className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 active:scale-95 transition-all"
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-sky-400/30 active:scale-95 transition-all ml-auto"
            >
              <span>Avançar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 transition-all ml-auto cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Meu Treino Pro</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
