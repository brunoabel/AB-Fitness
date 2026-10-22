import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import ActiveWorkout from './components/ActiveWorkout';
import ExerciseModal from './components/ExerciseModal';
import AthleteManualModal from './components/AthleteManualModal';
import HistoryView from './components/HistoryView';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import AuthScreen from './components/AuthScreen';
import OnboardingModal from './components/OnboardingModal';
import AdminDashboard from './components/AdminDashboard';
import AppSplashScreen from './components/AppSplashScreen';
import RunningHub from './components/RunningHub';
import CustomWorkoutsHub from './components/CustomWorkoutsHub';
import AICoachModal from './components/AICoachModal';
import { AuthProvider, useAuth } from './context';
import { fetchUserSchedule, saveCustomUserPlan, getLocalCustomPlan } from './services/workoutService';
import { 
  getCompletedDays, 
  getSoundPreference, 
  saveSoundPreference,
  getActiveDraft,
  getThemePreference,
  saveThemePreference,
  getSavedUserProfile,
  getCustomWorkouts
} from './utils/storage';
import { WEEKLY_SCHEDULE } from './data/workouts';
import { sound } from './utils/audio';
import ABLogo from './components/ABLogo';


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
  const [soundEnabled, setSoundEnabled] = useState(() => getSoundPreference());
  const [isDark, setIsDark] = useState(() => getThemePreference() === 'dark');

  // Sincronizar classe dark no elemento raiz HTML
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Inicializar o soundService com a preferência persistida
  useEffect(() => {
    sound.toggleSound(soundEnabled);
  }, [soundEnabled]);

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

    // Se o usuário nunca configurou as metas do treino, abrir o wizard automaticamente
    if ((user || isGuest) && !getSavedUserProfile()) {
      const timer = setTimeout(() => {
        if (active) setShowOnboardingModal(true);
      }, 100);
      return () => {
        active = false;
        clearTimeout(timer);
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

  const handleToggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      saveThemePreference(next ? 'dark' : 'light');
      return next;
    });
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
    if (user?.id) {
      saveCustomUserPlan(user.id, customizedPlan).catch((err) => {
        console.warn('Erro ao salvar plano no Supabase:', err);
      });
    }
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

  // 3. Aplicação Logada (Dashboard & Treinos)
  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen bg-zinc-100 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black antialiased flex flex-col justify-between transition-colors duration-200`}>
      {/* Container Central com Proporção Mobile-First Premium */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white dark:bg-[#09090b] shadow-2xl relative flex flex-col justify-between border-x border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
        
        {/* Visualização de Treino Ativo */}
        {currentView === 'active-workout' && activeWorkout ? (
          <ActiveWorkout
            workout={activeWorkout}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : currentView === 'admin' ? (
          <AdminDashboard
            onBackToWorkout={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Visualização do Dashboard Principal */
          <>
            <div className="pb-24 flex-1">
              <Header
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
                isDark={isDark}
                onToggleTheme={handleToggleTheme}
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

              {/* Rodapé Elegante com 'Desenvolvido por Bruno Abel' */}
              <Footer onOpenGuide={() => setShowGuideModal(true)} />
            </div>

            {/* Barra de Navegação Inferior Mobile-First */}
            <Navigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </>
        )}

        {/* Modal de Demonstração Biomecânica de Exercício */}
        {selectedExerciseForModal && (
          <ExerciseModal
            exercise={selectedExerciseForModal}
            onClose={() => setSelectedExerciseForModal(null)}
          />
        )}

        {/* Modal de Manuais do Atleta & Performance Especializados */}
        {showGuideModal && (
          <AthleteManualModal
            onClose={() => setShowGuideModal(false)}
          />
        )}

        {/* Modal de Onboarding & Personalização de Metas */}
        <OnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onComplete={handleOnboardingComplete}
        />

        {/* Modal do AB Coach IA — Treinador Biomecânico */}
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
