import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import ExerciseModal from './components/ExerciseModal';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import AuthScreen from './components/AuthScreen';
import { getLocalFitnessProfile, fetchFitnessProfile } from './services/fitnessProfileService';
import AppSplashScreen from './components/AppSplashScreen';
import { AuthProvider, useAuth } from './context';
import { fetchUserSchedule, saveCustomUserPlan, getLocalCustomPlan, flushWorkoutSyncQueue } from './services/workoutService';
import { 
  getCompletedDays, 
  getSoundPreference, 
  saveSoundPreference,
  getActiveDraft,
  getSavedUserProfile,
  getCustomWorkouts
} from './utils/storage';
import { WEEKLY_SCHEDULE } from './data/workouts';
import { sound } from './utils/audio';
import ABLogo from './components/ABLogo';
import { Bot, Sparkles } from 'lucide-react';

// Ecrãs secundários em chunks separados: a primeira abertura do app fica mais leve.
// Depois do arranque são pré-carregados em segundo plano, para ficarem em cache (offline).
const lazyImports = {
  history: () => import('./components/HistoryView'),
  running: () => import('./components/RunningHub'),
  custom: () => import('./components/CustomWorkoutsHub'),
  coach: () => import('./components/AICoachModal'),
  admin: () => import('./components/AdminDashboard'),
  manual: () => import('./components/AthleteManualModal'),
  onboarding: () => import('./components/onboarding/OnboardingCoach'),
  workout: () => import('./components/ActiveWorkout')
};
const HistoryView = lazy(lazyImports.history);
const RunningHub = lazy(lazyImports.running);
const CustomWorkoutsHub = lazy(lazyImports.custom);
const AICoachModal = lazy(lazyImports.coach);
const AdminDashboard = lazy(lazyImports.admin);
const AthleteManualModal = lazy(lazyImports.manual);
const OnboardingCoach = lazy(lazyImports.onboarding);
const ActiveWorkout = lazy(lazyImports.workout);

function TabFallback() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="A carregar">
      <span className="w-6 h-6 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
    </div>
  );
}


function AppContent() {
  const { user, isGuest, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const [schedule, setSchedule] = useState(() => getLocalCustomPlan() || WEEKLY_SCHEDULE);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'active-workout'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'custom-workouts' | 'running' | 'history'
  const [activeWorkout, setActiveWorkout] = useState(() => {
    const draft = getActiveDraft();
    if (draft && draft.workoutDayId !== undefined) {
      const planWorkout = (getLocalCustomPlan() || WEEKLY_SCHEDULE).find((w) => w.dayId === draft.workoutDayId);
      if (planWorkout) return planWorkout;
      const customList = getCustomWorkouts();
      return customList.find((w) => w.id === draft.workoutDayId || w.dayId === draft.workoutDayId) || null;
    }
    return null;
  });
  const [completedDays, setCompletedDays] = useState(() => getCompletedDays());
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  // O modal do Coach só é montado na primeira abertura e depois mantém-se (preserva a conversa)
  const [coachMounted, setCoachMounted] = useState(false);
  if (showAICoachModal && !coachMounted) setCoachMounted(true);

  // Pré-carrega os ecrãs secundários quando o browser estiver ocioso
  useEffect(() => {
    const prefetch = () => Object.values(lazyImports).forEach((load) => load().catch(() => {}));
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetch, 2500);
    return () => clearTimeout(t);
  }, []);
  const [soundEnabled, setSoundEnabled] = useState(() => getSoundPreference());
  // App exclusivamente escuro (design system AB Fitness): a classe .dark é fixa no <html>
  const isDark = true;

  // Inicializar o soundService com a preferência persistida
  useEffect(() => {
    sound.toggleSound(soundEnabled);
  }, [soundEnabled]);

  // Reenvia treinos que ficaram por sincronizar (sem rede no ginásio) no arranque e quando a ligação volta
  useEffect(() => {
    if (!user?.id || user.id === 'guest-local-user') return undefined;
    const flush = () => flushWorkoutSyncQueue(user.id).catch(() => {});
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, [user?.id]);

  // Carregar plano do usuário no Supabase ao autenticar
  useEffect(() => {
    let active = true;
    if (user && user.id && user.id !== 'guest-local-user') {
      fetchUserSchedule(user.id)
        .then((userPlan) => {
          if (active && userPlan && userPlan.length > 0) {
            const hasExercises = userPlan.some((d) => Array.isArray(d.exercises) && d.exercises.length > 0);
            if (hasExercises) {
              setSchedule(userPlan);
            }
          }
        })
        .catch((err) => {
          console.warn('Erro ao carregar plano customizado:', err);
        });
    }

    // Primeiro acesso: sem perfil local nem remoto, o AB Coach conduz o onboarding
    if ((user || isGuest) && !getSavedUserProfile() && !getLocalFitnessProfile()) {
      const remote = user?.id ? fetchFitnessProfile(user.id).catch(() => null) : Promise.resolve(null);
      remote.then((found) => {
        if (active && !found) setShowOnboardingModal(true);
      });
      return () => {
        active = false;
      };
    }

    return () => {
      active = false;
    };
  }, [user, isGuest]);

  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    setCurrentView('active-workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveWorkout(null);
    setCompletedDays(getCompletedDays());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = (val) => {
    setSoundEnabled(val);
    saveSoundPreference(val);
  };

  const handleTabChange = (tab) => {
    if (tab === 'guide') {
      setShowGuideModal(true);
    } else if (tab === 'admin') {
      setCurrentView('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (currentView === 'admin') {
        setCurrentView('dashboard');
      }
      setActiveTab(tab);
    }
  };

  // Callback ao finalizar questionário de personalização de treinos
  const handleOnboardingComplete = (customizedPlan) => {
    setSchedule(customizedPlan);
    // Guarda sempre localmente (também em modo convidado); sincroniza com o Supabase só com sessão
    saveCustomUserPlan(user?.id, customizedPlan).catch((err) => {
      console.warn('Erro ao salvar plano no Supabase:', err);
    });
  };

  // Callback para aplicar treino do AB Coach em um dia específico da semana
  const handleAssignToSchedule = async (dayNumber, workout) => {
    const updated = schedule.map((d) => {
      const match = d.dayId === dayNumber || d.dayNumber === dayNumber;
      if (match) {
        return {
          ...d,
          title: workout.title,
          focus: workout.focus,
          duration: workout.duration,
          intensity: workout.intensity,
          badge: workout.badge,
          isRestDay: false,
          exercises: workout.exercises
        };
      }
      return d;
    });
    setSchedule(updated);
    if (user?.id && user.id !== 'guest-local-user') {
      try {
        await saveCustomUserPlan(user.id, updated);
      } catch (err) {
        console.warn('Erro ao salvar plano customizado no Supabase:', err);
      }
    }
  };

  // 1. Tela de Apresentação & Carregamento com Animação do Logo e Boas-Vindas
  if (showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Aguarda autenticação caso a splash finalize antes do Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center select-none">
        <ABLogo size={76} showText={true} />
      </div>
    );
  }

  // 3. Proteção de Rota: Usuário não autenticado vê a tela de Login / Cadastro
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  // 3. Aplicação com Sessão Ativa (Dashboard & Treinos)
  return (
    <div className={`dark min-h-screen bg-[#f8f9fa] dark:bg-app text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black antialiased flex flex-col justify-between transition-colors duration-200`}>
      {/* Contentor Principal Adaptativo (Mobile até Desktop) */}
      <div className="w-full max-w-5xl mx-auto min-h-screen bg-white dark:bg-surface sm:border-x border-zinc-200 dark:border-zinc-800/80 relative flex flex-col justify-between transition-colors duration-200">
        
        {/* Visualização de Treino Ativo */}
        {currentView === 'active-workout' && activeWorkout ? (
          <Suspense fallback={<TabFallback />}>
            <ActiveWorkout
              workout={activeWorkout}
              onBackToDashboard={handleBackToDashboard}
            />
          </Suspense>
        ) : currentView === 'admin' ? (
          <Suspense fallback={<TabFallback />}>
            <AdminDashboard
              onBackToWorkout={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        ) : (
          /* Visualização do Painel Principal */
          <>
            <div className="pb-24 flex-1">
              <Header
                activeTab={activeTab}
                currentView={currentView}
                onNavigateTab={handleTabChange}
                completedCount={completedDays.length}
                onOpenGuide={() => setShowGuideModal(true)}
                onOpenCustomize={() => setShowOnboardingModal(true)}
                onOpenAICoach={() => setShowAICoachModal(true)}
                onOpenAdmin={() => {
                  setCurrentView('admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
              />

              <InstallPrompt />

              {activeTab === 'dashboard' && (
                <WeeklyDashboard
                  completedDays={completedDays}
                  onStartWorkout={handleStartWorkout}
                  onViewExercise={(ex) => setSelectedExerciseForModal(ex)}
                  onOpenGuide={() => setShowGuideModal(true)}
                  onOpenCustomize={() => setShowOnboardingModal(true)}
                  onNavigateTab={handleTabChange}
                  schedule={schedule}
                />
              )}

              <Suspense fallback={<TabFallback />}>
                {activeTab === 'custom-workouts' && (
                  <CustomWorkoutsHub
                    onStartWorkout={handleStartWorkout}
                    onViewExercise={(ex) => setSelectedExerciseForModal(ex)}
                    onOpenAICoach={() => setShowAICoachModal(true)}
                  />
                )}

                {activeTab === 'running' && (
                  <RunningHub isDark={isDark} />
                )}

                {activeTab === 'history' && (
                  <HistoryView />
                )}
              </Suspense>

              {/* Rodapé Institucional */}
              <Footer onOpenGuide={() => setShowGuideModal(true)} />
            </div>

            {/* Barra de Navegação Inferior Ergonómica */}
            <Navigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />

            {/* Botão Flutuante do AB Coach (Sóbrio & Técnico) */}
            <button
              onClick={() => {
                sound.playTick();
                setShowAICoachModal(true);
              }}
              className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 min-h-[44px] rounded-xl bg-surface/80 backdrop-blur-md text-zinc-100 font-semibold text-xs shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-surface-2/90 active:scale-95 transition-all cursor-pointer border border-white/10 select-none"
              aria-label="Abrir AB Coach IA"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-4 h-4 stroke-[2] text-accent" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </div>
              <span className="tracking-tight text-xs font-semibold">
                AB Coach
              </span>
            </button>
          </>
        )}

        {/* Modal de Demonstração Biomecânica de Exercício */}
        <AnimatePresence>
          {selectedExerciseForModal && (
            <ExerciseModal
              key="exercise-modal"
              exercise={selectedExerciseForModal}
              onClose={() => setSelectedExerciseForModal(null)}
            />
          )}
        </AnimatePresence>

        {/* Modal de Manuais do Atleta & Performance Especializados */}
        {showGuideModal && (
          <Suspense fallback={null}>
            <AthleteManualModal
              onClose={() => setShowGuideModal(false)}
            />
          </Suspense>
        )}

        {/* Modal de Onboarding & Personalização de Metas */}
        {showOnboardingModal && (
          <Suspense fallback={<div className="fixed inset-0 z-[70] bg-app" />}>
          <OnboardingCoach
            userId={user?.id}
            userName={(user?.user_metadata?.full_name || '').split(' ')[0] || ''}
            onClose={() => setShowOnboardingModal(false)}
            onComplete={({ plan }) => {
              handleOnboardingComplete(plan);
              setShowOnboardingModal(false);
              setCurrentView('dashboard');
              setActiveTab('dashboard');
              window.scrollTo({ top: 0 });
            }}
          />
          </Suspense>
        )}

        {/* Modal do AB Coach IA — Treinador Biomecânico */}
        {coachMounted && (
          <Suspense fallback={null}>
            <AICoachModal
              isOpen={showAICoachModal}
              onClose={() => setShowAICoachModal(false)}
              onStartWorkout={handleStartWorkout}
              onViewExercise={(ex) => setSelectedExerciseForModal(ex)}
              onSaveToSchedule={handleAssignToSchedule}
              onOpenAuth={() => {
                // Se o usuário estiver em modo convidado e quiser autenticar
                try {
                  localStorage.removeItem('ab_fitness_guest_mode');
                  window.location.reload();
                } catch {}
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
