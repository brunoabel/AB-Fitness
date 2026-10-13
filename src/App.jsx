import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import ActiveWorkout from './components/ActiveWorkout';
import ExerciseModal from './components/ExerciseModal';
import BeginnerGuideModal from './components/BeginnerGuideModal';
import HistoryView from './components/HistoryView';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { fetchUserSchedule } from './services/workoutService';
import { 
  getCompletedDays, 
  getSoundPreference, 
  saveSoundPreference,
  getActiveDraft,
  getThemePreference,
  saveThemePreference
} from './utils/storage';
import { WEEKLY_SCHEDULE } from './data/workouts';
import { sound } from './utils/audio';
import { Dumbbell } from 'lucide-react';

function AppContent() {
  const { user, isGuest, loading } = useAuth();

  const [schedule, setSchedule] = useState(WEEKLY_SCHEDULE);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'active-workout'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history'
  const [activeWorkout, setActiveWorkout] = useState(() => {
    const draft = getActiveDraft();
    if (draft && draft.workoutDayId !== undefined) {
      return WEEKLY_SCHEDULE.find((w) => w.dayId === draft.workoutDayId) || null;
    }
    return null;
  });
  const [completedDays, setCompletedDays] = useState(() => getCompletedDays());
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
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
            setSchedule(userPlan);
          }
        })
        .catch((err) => {
          console.warn('Erro ao carregar plano customizado:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [user]);

  const handleStartWorkout = (workout) => {
    setActiveWorkout(workout);
    setCurrentView('active-workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
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
    } else {
      setActiveTab(tab);
    }
  };

  // 1. Tela de Carregamento Inicial (Splash)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f8ff] dark:bg-[#070d18] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 rounded-3xl bg-gradient-to-tr from-sky-400 to-sky-500 text-white shadow-xl shadow-sky-400/30 animate-pulse mb-4">
          <Dumbbell className="w-10 h-10 stroke-[2.2]" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
          AB Fitness
        </h2>
        <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mt-1">
          Carregando treinos e performance...
        </p>
      </div>
    );
  }

  // 2. Proteção de Rota: Usuário não autenticado vê a tela de Login / Cadastro
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  // 3. Aplicação Logada (Dashboard & Treinos)
  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen bg-[#f3f9fd] dark:bg-[#070d18] text-slate-800 dark:text-slate-100 font-sans selection:bg-sky-200 selection:text-sky-900 antialiased flex flex-col justify-between transition-colors duration-300`}>
      {/* Container Central com Proporção Mobile-First Premium */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#f8fbfe] dark:bg-[#0b1322] shadow-2xl relative flex flex-col justify-between border-x border-sky-100/60 dark:border-slate-800/80 transition-colors duration-300">
        
        {/* Visualização de Treino Ativo */}
        {currentView === 'active-workout' && activeWorkout ? (
          <ActiveWorkout
            workout={activeWorkout}
            onBackToDashboard={handleBackToDashboard}
          />
        ) : (
          /* Visualização do Dashboard Principal */
          <>
            <div className="pb-24 flex-1">
              <Header
                completedCount={completedDays.length}
                onOpenGuide={() => setShowGuideModal(true)}
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
                  schedule={schedule}
                />
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

        {/* Modal de Demonstração Visual de Exercício */}
        {selectedExerciseForModal && (
          <ExerciseModal
            exercise={selectedExerciseForModal}
            onClose={() => setSelectedExerciseForModal(null)}
          />
        )}

        {/* Modal do Guia para Atletas de Futebol */}
        {showGuideModal && (
          <BeginnerGuideModal
            onClose={() => setShowGuideModal(false)}
          />
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
