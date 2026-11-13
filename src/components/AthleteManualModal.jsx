import React, { useState, useRef, useEffect } from 'react';
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
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  HeartPulse,
  Star,
  ListFilter,
  ArrowLeft
} from 'lucide-react';
import { ATHLETE_MANUALS } from '../data/athleteManuals';
import { getSavedUserProfile, saveUserProfileLocal } from '../utils/storage';
import { sound, triggerHaptic } from '../utils/audio';

export default function AthleteManualModal({ onClose }) {
  // Carregar perfil inicial do atleta
  const [userProfile, setUserProfile] = useState(() => getSavedUserProfile() || {});
  const currentSavedGoal = userProfile?.goal || 'athlete';
  
  const [activeManualKey, setActiveManualKey] = useState(currentSavedGoal);
  const [calcWeight, setCalcWeight] = useState(68);
  const [showIndexSheet, setShowIndexSheet] = useState(false);
  const [justSavedGoal, setJustSavedGoal] = useState(false);

  const contentScrollRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const tabButtonRefs = useRef({});

  // Lista ordenada de manuais
  const tabOptions = [
    {
      key: 'athlete',
      label: 'Atleta / Futebol',
      shortLabel: 'Atleta',
      icon: Zap,
      tag: 'Futebol & Alta Performance'
    },
    {
      key: 'hypertrophy',
      label: 'Ganhar Peso & Hipertrofia',
      shortLabel: 'Hipertrofia',
      icon: Dumbbell,
      tag: 'Hipertrofia & Massa'
    },
    {
      key: 'fat_loss',
      label: 'Emagrecimento & Definição',
      shortLabel: 'Definição',
      icon: Flame,
      tag: 'Perda de Gordura'
    },
    {
      key: 'strength',
      label: 'Força Pura & Cargas',
      shortLabel: 'Força Pura',
      icon: Activity,
      tag: 'Cargas Pesadas'
    },
    {
      key: 'health',
      label: 'Saúde & Longevidade',
      shortLabel: 'Longevidade',
      icon: ShieldCheck,
      tag: 'Postura & Articulações'
    }
  ];

  const currentIndex = tabOptions.findIndex((t) => t.key === activeManualKey);
  const manual = ATHLETE_MANUALS[activeManualKey] || ATHLETE_MANUALS.athlete;
  const isCurrentGoal = userProfile?.goal === activeManualKey;

  // Auto-scroll da barra de abas para manter a aba ativa no centro
  useEffect(() => {
    const activeTabEl = tabButtonRefs.current[activeManualKey];
    if (activeTabEl && tabsContainerRef.current) {
      activeTabEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
    // Reposiciona scroll do conteúdo para o topo
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeManualKey]);

  // Gestos de toque (Touch Swipe) para navegar entre manuais
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const handleTouchStart = (e) => {
    touchEndRef.current = null;
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const handleTouchMove = (e) => {
    touchEndRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const deltaX = touchStartRef.current.x - touchEndRef.current.x;
    const deltaY = touchStartRef.current.y - touchEndRef.current.y;
    // Só processa se o movimento for predominantemente horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > 60) {
      if (deltaX > 0) {
        goToNextManual();
      } else {
        goToPrevManual();
      }
    }
  };

  const switchManual = (key) => {
    setActiveManualKey(key);
    triggerHaptic(10);
    sound.playTick();
  };

  const goToPrevManual = () => {
    if (currentIndex > 0) {
      switchManual(tabOptions[currentIndex - 1].key);
    }
  };

  const goToNextManual = () => {
    if (currentIndex < tabOptions.length - 1) {
      switchManual(tabOptions[currentIndex + 1].key);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      triggerHaptic(8);
    }
  };

  const handleAdoptGoal = () => {
    const updated = { ...userProfile, goal: activeManualKey };
    saveUserProfileLocal(updated);
    setUserProfile(updated);
    setJustSavedGoal(true);
    triggerHaptic(20);
    sound.playSuccess();
    setTimeout(() => setJustSavedGoal(false), 2400);
  };

  // Cálculos dinâmicos
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full h-full sm:h-auto sm:max-h-[94vh] sm:max-w-2xl bg-surface text-zinc-100 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/[0.06] animate-slideUp transition-all select-none"
        onClick={(e) => e.stopPropagation()}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* ========================================================= */}
        {/* CABEÇALHO SUPERIOR FIXO: Voltar, Paginação & Todos os Manuais */}
        {/* ========================================================= */}
        <div className="p-3.5 sm:p-4 border-b border-white/[0.06] bg-surface flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold active:scale-95 transition-all cursor-pointer border border-white/[0.08]"
              title="Voltar"
              aria-label="Voltar para a aplicação"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
              <span className="hidden xs:inline">Voltar</span>
            </button>

            <div className="flex items-center gap-2 pl-1">
              <span className="px-2 py-0.5 rounded-md bg-accent/70 text-white text-[11px] font-black uppercase tracking-wider border border-accent-hover">
                {currentIndex + 1} de {tabOptions.length}
              </span>
              <span className="font-bold text-xs text-zinc-200 hidden sm:inline truncate max-w-[200px]">
                {manual.tag}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão de Índice Geral dos 5 Manuais */}
            <button
              onClick={() => {
                setShowIndexSheet(true);
                triggerHaptic(10);
              }}
              className="h-9 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.08] text-zinc-200 hover:text-white flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-all cursor-pointer border border-white/[0.08]"
              title="Ver Todos os Manuais"
            >
              <ListFilter className="w-3.5 h-3.5 text-white" />
              <span>Índice ({tabOptions.length})</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-white/[0.08]"
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CARROSSEL DE SELEÇÃO RÁPIDA DE MANUAIS (Setas + Tabs) */}
        {/* ========================================================= */}
        <div className="px-2 py-2 bg-surface-2 border-b border-white/[0.06] flex items-center gap-1.5 shrink-0">
          <button
            onClick={goToPrevManual}
            disabled={currentIndex === 0}
            className="tap-44 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
            title="Manual Anterior"
            aria-label="Manual Anterior"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Lista de Abas Horizontais com Auto-Centralização */}
          <div 
            ref={tabsContainerRef}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-0.5 scroll-smooth"
          >
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeManualKey === tab.key;
              const isUserCurrentGoal = userProfile?.goal === tab.key;

              return (
                <button
                  key={tab.key}
                  ref={(el) => (tabButtonRefs.current[tab.key] = el)}
                  onClick={() => switchManual(tab.key)}
                  className={`min-h-[44px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer border ${
                    isSelected
                      ? 'bg-accent text-white border-accent shadow-sm font-black'
                      : 'bg-surface/80 hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 border-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  <span>{tab.shortLabel}</span>
                  {isUserCurrentGoal && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-zinc-950' : 'bg-emerald-400'}`} 
                      title="O Seu Perfil Atual"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextManual}
            disabled={currentIndex === tabOptions.length - 1}
            className="tap-44 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
            title="Próximo Manual"
            aria-label="Próximo Manual"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* PÍLULAS DE NAVEGAÇÃO INTERNA RÁPIDA (Saltar Secções) */}
        {/* ========================================================= */}
        <div className="px-3 py-1.5 bg-surface border-b border-white/[0.06] overflow-x-auto flex gap-1.5 scrollbar-none text-[11px] font-semibold text-zinc-400 shrink-0">
          <button 
            onClick={() => scrollToSection('sec-philosophy')}
            className="px-2 py-0.5 rounded-md hover:bg-white/[0.08] hover:text-zinc-200 shrink-0 transition-colors cursor-pointer"
          >
            Filosofia
          </button>
          <span className="text-zinc-700">•</span>
          <button 
            onClick={() => scrollToSection('sec-calc')}
            className="px-2 py-0.5 rounded-md hover:bg-white/[0.08] hover:text-zinc-200 shrink-0 transition-colors cursor-pointer"
          >
            Calculadora
          </button>
          <span className="text-zinc-700">•</span>
          <button 
            onClick={() => scrollToSection('sec-split')}
            className="px-2 py-0.5 rounded-md hover:bg-white/[0.08] hover:text-zinc-200 shrink-0 transition-colors cursor-pointer"
          >
            Volume & Divisão
          </button>
          <span className="text-zinc-700">•</span>
          <button 
            onClick={() => scrollToSection('sec-nutrition')}
            className="px-2 py-0.5 rounded-md hover:bg-white/[0.08] hover:text-zinc-200 shrink-0 transition-colors cursor-pointer"
          >
            Nutrição
          </button>
          <span className="text-zinc-700">•</span>
          <button 
            onClick={() => scrollToSection('sec-injuries')}
            className="px-2 py-0.5 rounded-md hover:bg-white/[0.08] hover:text-zinc-200 shrink-0 transition-colors cursor-pointer"
          >
            Prevenção de Lesões
          </button>
        </div>

        {/* ========================================================= */}
        {/* CONTEÚDO ROLÁVEL COM GESTOS DE SWIPE */}
        {/* ========================================================= */}
        <div 
          ref={contentScrollRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-zinc-200"
        >
          {/* Banner do Manual Atual */}
          <div id="sec-philosophy" className="p-4 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/[0.06] space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/[0.04] text-zinc-200 border border-white/[0.08]">
                {manual.tag}
              </span>
              {isCurrentGoal && (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  O Seu Perfil Atual
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-tight tracking-[-0.02em]">
              {manual.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              {manual.philosophy}
            </p>
          </div>

          {/* Dica de Swipe no Telemóvel */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>Dica: Deslize para a esquerda ou direita para alternar manuais</span>
            <span className="font-mono">{currentIndex + 1}/{tabOptions.length}</span>
          </div>

          {/* Calculadora Interativa de Proteína & Hidratação */}
          <div id="sec-calc" className="p-4 rounded-2xl bg-surface border border-white/[0.06] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-white" />
                <span>Calculadora Personalizada de Metas</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono tabular-nums">
                <label className="text-[11px] text-zinc-400 font-sans font-medium">Peso:</label>
                <input
                  type="number"
                  min="40"
                  max="160"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value) || 60)}
                  className="w-16 text-center font-bold text-xs py-1.5 px-2 rounded-lg bg-surface border border-white/[0.08] text-white font-mono tabular-nums focus:border-accent focus:outline-none"
                />
                <span className="text-xs text-zinc-400 font-semibold font-sans">kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-surface/90 border border-white/[0.06]">
                <span className="text-[11px] text-zinc-400 font-semibold uppercase block">
                  Proteína Recomendada
                </span>
                <span className="font-display text-lg font-semibold text-white block mt-0.5 tabular-nums tracking-[-0.02em]">
                  {getProteinTarget()} <span className="text-xs font-medium text-zinc-400">g/dia</span>
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Para reconstrução muscular
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/90 border border-white/[0.06]">
                <span className="text-[11px] text-zinc-400 font-semibold uppercase block">
                  Hidratação Mínima
                </span>
                <span className="font-display text-lg font-semibold text-accent-hover block mt-0.5 tabular-nums tracking-[-0.02em]">
                  {getWaterTarget()} <span className="text-xs font-medium text-zinc-400">L/dia</span>
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Água para células e tendões
                </span>
              </div>
            </div>
          </div>

          {/* Estrutura & Divisão do Treino */}
          <div id="sec-split" className="p-4 rounded-2xl bg-surface border border-white/[0.06] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-white" />
              <span>Diretrizes de Volume & Carga</span>
            </div>

            <div className="space-y-2 text-xs">
              {manual.weeklySplit.map((split, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface/80 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-white font-bold">{split.day}</strong>
                    <span className="text-[11px] font-bold text-white">{split.focus}</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    {split.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Estratégia Nutricional */}
          <div id="sec-nutrition" className="p-4 rounded-2xl bg-surface border border-white/[0.06] space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Droplets className="w-4 h-4 text-accent-hover" />
              <span>Plano Nutricional & Hidratação</span>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-xl bg-surface/60 border border-white/[0.06]">
                <strong className="text-white block font-semibold mb-0.5">Energia & Calorias:</strong>
                <span className="text-zinc-400">{manual.nutritionStrategy.calories}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface/60 border border-white/[0.06]">
                <strong className="text-white block font-semibold mb-0.5">Proteínas & Aminoácidos:</strong>
                <span className="text-zinc-400">{manual.nutritionStrategy.protein}</span>
              </div>
              {manual.nutritionStrategy.carbs && (
                <div className="p-2.5 rounded-xl bg-surface/60 border border-white/[0.06]">
                  <strong className="text-white block font-semibold mb-0.5">Hidratos de Carbono & Glicogénio:</strong>
                  <span className="text-zinc-400">{manual.nutritionStrategy.carbs}</span>
                </div>
              )}
              {manual.nutritionStrategy.matchMeal && (
                <div className="p-2.5 rounded-xl bg-surface/60 border border-white/[0.06]">
                  <strong className="text-white block font-semibold mb-0.5">Refeição Pré-Partida (Matchday):</strong>
                  <span className="text-zinc-400">{manual.nutritionStrategy.matchMeal}</span>
                </div>
              )}
            </div>
          </div>

          {/* Prevenção de Lesões & Saúde Articular */}
          <div id="sec-injuries" className="p-4 rounded-2xl bg-surface border border-white/[0.06] space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Prevenção de Lesões & Blindagem Articular</span>
            </div>

            <div className="space-y-2 text-xs">
              {manual.injuryPrevention.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-surface/60 border border-white/[0.06]">
                  <strong className="text-white font-bold block mb-0.5">{item.name}</strong>
                  <span className="text-zinc-400 leading-relaxed block">{item.solution}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rotina de Recuperação & Sono */}
          <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Moon className="w-4 h-4 text-amber-400" />
              <span>Regeneração & Sono</span>
            </div>

            <ul className="space-y-1.5 text-xs text-zinc-300">
              {manual.recoveryRoutine.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span className="text-zinc-400">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RODAPÉ DOCK FIXO: Anterior, Adotar Objetivo & Próximo */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 border-t border-white/[0.06] bg-surface flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={goToPrevManual}
            disabled={currentIndex === 0}
            className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all border border-white/[0.08] shrink-0"
            title="Manual Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Anterior</span>
          </button>

          <button
            onClick={handleAdoptGoal}
            className={`flex-1 py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border ${
              isCurrentGoal || justSavedGoal
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-xs' 
                : 'bg-accent text-white hover:bg-accent-hover border-accent shadow-sm font-black'
            }`}
          >
            {isCurrentGoal || justSavedGoal ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                <span>O Meu Objetivo Atual</span>
              </>
            ) : (
              <>
                <Star className="w-4 h-4 stroke-[2.5]" />
                <span>Adotar como Meu Objetivo</span>
              </>
            )}
          </button>

          <button
            onClick={goToNextManual}
            disabled={currentIndex === tabOptions.length - 1}
            className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 disabled:opacity-20 disabled:pointer-events-none flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 transition-all border border-white/[0.08] shrink-0"
            title="Próximo Manual"
          >
            <span className="hidden xs:inline">Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODAL / SHEET DO ÍNDICE GERAL DE TODOS OS 5 MANUAIS */}
        {/* ========================================================= */}
        {showIndexSheet && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-6 animate-fadeIn">
            <div 
              className="bg-surface text-zinc-100 rounded-t-2xl sm:rounded-2xl border border-white/[0.06] max-h-[85vh] flex flex-col overflow-hidden animate-slideUp shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-surface-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-white" />
                  <h4 className="font-bold text-sm text-white">
                    Índice de Manuais do Atleta ({tabOptions.length})
                  </h4>
                </div>
                <button
                  onClick={() => setShowIndexSheet(false)}
                  className="tap-44 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2.5">
                {tabOptions.map((opt, idx) => {
                  const Icon = opt.icon;
                  const manualData = ATHLETE_MANUALS[opt.key];
                  const isSelected = activeManualKey === opt.key;
                  const isUserCurrent = userProfile?.goal === opt.key;

                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        switchManual(opt.key);
                        setShowIndexSheet(false);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'bg-accent/70 border-accent text-white'
                          : 'bg-surface/60 hover:bg-white/[0.08] border-white/[0.06] text-zinc-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-accent text-white' : 'bg-white/[0.04] text-zinc-400'
                      }`}>
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[11px] font-mono text-zinc-500 font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs text-white truncate">
                            {manualData.title}
                          </span>
                          {isUserCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                              Meu Perfil
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2">
                          {manualData.subtitle || manualData.philosophy}
                        </p>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 mt-2.5 ${isSelected ? 'text-white' : 'text-zinc-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
