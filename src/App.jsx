import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { Skeleton, SkeletonList } from './components/ui/Skeleton';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import AuthScreen from './components/AuthScreen';
import PrivateLaunchScreen from './components/PrivateLaunchScreen';
import { PRIVATE_LAUNCH_MODE } from './config/launchMode';
import { getLocalFitnessProfile, fetchFitnessProfile } from './services/fitnessProfileService';
import BootSequence, { BOOT_SEEN_KEY } from './components/boot/BootSequence';
import CoachAvatar from './components/coach/CoachAvatar';
import TrainModeSwitch from './components/TrainModeSwitch';
import { animate, stagger } from 'motion';
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
import AssignedProgramsCard from './components/trainer/AssignedProgramsCard';
import Sidebar from './components/Sidebar';
import SidebarDrawer from './components/SidebarDrawer';

// Ecrãs secundários em chunks separados: a primeira abertura do app fica mais leve.
// Depois do arranque são pré-carregados em segundo plano, para ficarem em cache (offline).
const lazyImports = {
  history: () => import('./components/HistoryView'), // carregado dentro do Perfil
  running: () => import('./components/RunningHub'),
  custom: () => import('./components/CustomWorkoutsHub'),
  coach: () => import('./components/AICoachModal'),
  admin: () => import('./components/AdminDashboard'),
  trainerHub: () => import('./components/trainer/TrainerHubView'),
  linkTrainer: () => import('./components/trainer/LinkTrainerSheet'),
  manual: () => import('./components/AthleteManualModal'),
  onboarding: () => import('./components/onboarding/OnboardingCoach'),
  social: () => import('./components/social/SocialHub'),
  profile: () => import('./components/profile/ProfileView'),
  workout: () => import('./components/ActiveWorkout'),
  exerciseModal: () => import('./components/ExerciseModal')
};
const RunningHub = lazy(lazyImports.running);
const CustomWorkoutsHub = lazy(lazyImports.custom);
const AICoachModal = lazy(lazyImports.coach);
const AdminDashboard = lazy(lazyImports.admin);
const TrainerHubView = lazy(lazyImports.trainerHub);
const LinkTrainerSheet = lazy(lazyImports.linkTrainer);
const AthleteManualModal = lazy(lazyImports.manual);
const OnboardingCoach = lazy(lazyImports.onboarding);
const SocialHub = lazy(lazyImports.social);
const ProfileView = lazy(lazyImports.profile);
const ActiveWorkout = lazy(lazyImports.workout);
const ExerciseModal = lazy(lazyImports.exerciseModal);

function TabFallback() {
  return (
    <div className="max-w-md mx-auto w-full px-4 pt-6 space-y-4">
      <Skeleton className="h-28 rounded-2xl" />
      <SkeletonList rows={3} />
    </div>
  );
}


function AppContent() {
  const { user, isGuest, loading, isTrainer, isAdmin, isCeo } = useAuth();
  // Abertura cinematográfica só na primeira abertura da sessão
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem(BOOT_SEEN_KEY);
    } catch {
      return true;
    }
  });
  const [bootJustEnded, setBootJustEnded] = useState(false);

  // Fim da abertura: os cards do painel sobem em cascata com mola real (stiffness 300, damping 28)
  useLayoutEffect(() => {
    if (!bootJustEnded) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const cards = document.querySelectorAll('[data-boot-stagger] > *');
    if (!cards.length) return;
    animate(cards, { opacity: [0, 1], y: [24, 0] }, { type: 'spring', stiffness: 300, damping: 28, delay: stagger(0.06) });
  }, [bootJustEnded]);

  const [schedule, setSchedule] = useState(() => getLocalCustomPlan() || WEEKLY_SCHEDULE);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'active-workout'
  // Link de atleta partilhado (?add=username) abre diretamente os Amigos
  const [activeTab, setActiveTab] = useState(() => (new URLSearchParams(window.location.search).has('add') ? 'social' : 'dashboard')); // 'dashboard' | 'custom-workouts' | 'running' | 'history'
  // Link de convite do PT (?trainer=CODE) abre a folha de vínculo já com o código preenchido
  const [trainerCodeFromUrl] = useState(() => new URLSearchParams(window.location.search).get('trainer') || '');
  const [showLinkTrainer, setShowLinkTrainer] = useState(() => Boolean(new URLSearchParams(window.location.search).get('trainer')));
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  // Modo do separador Treino: plano da semana ou treinos personalizados
  const [trainMode, setTrainMode] = useState('plan');

  const handleTabChange = (tab) => {
    // Destinos antigos: Criar vive agora dentro de Treino e o Histórico dentro do Perfil
    if (tab === 'custom-workouts') {
      setTrainMode('custom');
      tab = 'dashboard';
    } else if (tab === 'history') {
      tab = 'profile';
    }
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
    return (
      <BootSequence
        onFinish={() => {
          setShowSplash(false);
          setBootJustEnded(true);
        }}
      />
    );
  }

  // 2. Aguarda autenticação caso a splash finalize antes do Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6 text-center select-none">
        <ABLogo size={76} showText={true} />
      </div>
    );
  }

  // 3. Modo Fechado para Marketing / Lançamento Privado
  // Apenas a conta de administrador/CEO tem acesso total à app.
  // Todos os restantes visitantes vêem a landing page VIP de Lançamento Privado.
  const isAuthorizedAdmin = Boolean(
    isAdmin || 
    isCeo || 
    user?.email === 'brunoaaraujo2005@gmail.com' ||
    (user?.email && user.email.toLowerCase().includes('bruno') && (user.email.endsWith('@gmail.com') || user.email.endsWith('@abfitness.app')))
  );

  if (PRIVATE_LAUNCH_MODE && !isAuthorizedAdmin) {
    return <PrivateLaunchScreen />;
  }

  // 4. Proteção de Rota normal (quando o lançamento privado for desativado)
  if (!user && !isGuest) {
    return <AuthScreen />;
  }

  // 3. Aplicação com Sessão Ativa (Dashboard & Treinos)
  // Admin/Trainer Hub/Treino Ativo desenham o próprio layout de largura (max-w-5xl/6xl internos) —
  // em desktop não ficam presos ao contentor max-w-5xl do painel principal, só o painel comum fica.
  const isFullScreenView = currentView === 'active-workout' || currentView === 'admin' || currentView === 'trainer-hub';
  return (
    <div className="dark min-h-screen bg-app text-zinc-100 font-sans selection:bg-zinc-200 selection:text-black antialiased flex flex-col justify-between transition-colors duration-200 lg:flex-row lg:justify-start">
      <Sidebar
        activeTab={activeTab}
        currentView={currentView}
        onTabChange={handleTabChange}
        onOpenTrainerHub={() => {
          setCurrentView('trainer-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAICoach={() => setShowAICoachModal(true)}
      />
      {/* Contentor Principal Adaptativo (Mobile até Desktop) */}
      <div className={`w-full min-h-screen bg-surface relative flex flex-col justify-between transition-colors duration-200 lg:flex-1 lg:min-w-0 ${isFullScreenView ? '' : 'max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto sm:border-x border-zinc-800/80'}`}>

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
        ) : currentView === 'trainer-hub' ? (
          <Suspense fallback={<TabFallback />}>
            <TrainerHubView
              onBack={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </Suspense>
        ) : (
          /* Visualização do Painel Principal */
          <>
            <div className="pb-28 sm:pb-32 flex-1">
              <Header
                activeTab={activeTab}
                currentView={currentView}
                onNavigateTab={handleTabChange}
                completedDays={completedDays}
                schedule={schedule}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />

              <InstallPrompt />

              {activeTab === 'dashboard' && <AssignedProgramsCard onStartWorkout={handleStartWorkout} />}

              {activeTab === 'dashboard' && <TrainModeSwitch mode={trainMode} onChange={setTrainMode} />}

              {activeTab === 'dashboard' && trainMode === 'plan' && (
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
                {activeTab === 'dashboard' && trainMode === 'custom' && (
                  <CustomWorkoutsHub
                    onStartWorkout={handleStartWorkout}
                    onViewExercise={(ex) => setSelectedExerciseForModal(ex)}
                    onOpenAICoach={() => setShowAICoachModal(true)}
                  />
                )}

                {activeTab === 'running' && (
                  <RunningHub isDark={isDark} />
                )}

                {activeTab === 'profile' && <ProfileView />}

                {activeTab === 'social' && <SocialHub onNavigateTab={handleTabChange} />}
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
              className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 pl-1.5 pr-3.5 min-h-[44px] rounded-full bg-surface/80 backdrop-blur-md text-zinc-100 font-semibold text-xs shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:bg-surface-2/90 active:scale-95 transition-all cursor-pointer border border-white/10 select-none lg:hidden"
              aria-label="Abrir AB Coach IA"
            >
              <span className="relative flex">
                <CoachAvatar size={32} alt="" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface" />
              </span>
              <span className="tracking-tight text-xs font-semibold">
                AB Coach
              </span>
            </button>
          </>
        )}

        {/* Modal de Demonstração Biomecânica de Exercício */}
        <AnimatePresence>
          {selectedExerciseForModal && (
            <Suspense key="exercise-modal" fallback={null}>
              <ExerciseModal
                exercise={selectedExerciseForModal}
                onClose={() => setSelectedExerciseForModal(null)}
              />
            </Suspense>
          )}
        </AnimatePresence>

        {/* Folha de vínculo ao PT a partir de um link de convite (?trainer=CODE) */}
        {showLinkTrainer && !isTrainer && (
          <Suspense fallback={null}>
            <LinkTrainerSheet initialCode={trainerCodeFromUrl} onClose={() => setShowLinkTrainer(false)} />
          </Suspense>
        )}

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
                  localStorage.removeItem('ab_fitness_guest_mode_v1');
                  localStorage.removeItem('ab_fitness_guest_mode');
                  window.location.reload();
                } catch {}
              }}
            />
          </Suspense>
        )}

        {/* Gaveta lateral: gestão do atleta, acessível a partir do Header em qualquer ecrã */}
        <SidebarDrawer
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNavigateTab={handleTabChange}
          onOpenCustomize={() => setShowOnboardingModal(true)}
          onOpenGuide={() => setShowGuideModal(true)}
          onOpenAICoach={() => setShowAICoachModal(true)}
          onOpenAdmin={() => {
            setCurrentView('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenTrainerHub={() => {
            setCurrentView('trainer-hub');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
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
