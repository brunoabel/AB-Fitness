import React, { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react';
import { Skeleton, SkeletonList } from './components/ui/Skeleton';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import { PRIVATE_LAUNCH_MODE } from './config/launchMode';
import { getLocalFitnessProfile, fetchFitnessProfile } from './services/fitnessProfileService';
import BootSequence, { BOOT_SEEN_KEY } from './components/boot/BootSequence';
import CoachAvatar from './components/coach/CoachAvatar';
import TrainModeSwitch from './components/TrainModeSwitch';
import { animate, stagger } from 'motion';
import { AuthProvider, useAuth } from './context';
import { fetchUserSchedule, saveCustomUserPlan, getLocalCustomPlan, flushWorkoutSyncQueue } from './services/workoutService';
import { flushWearableSyncQueue } from './services/wearables/wearableManager';
import { hydrateWorkoutHistory } from './services/historySyncService';
import { captureAttribution } from './utils/attribution';

// Origem do visitante (utm, ?ref= de indicação) guardada antes de qualquer redirecionamento
captureAttribution();

// Splash só para quem já tem conta ou modo convidado; visitante novo vai direto à landing
const hasReturningSession = () => {
  try {
    return localStorage.getItem('ab_fitness_guest_mode_v1') === 'true' || Object.keys(localStorage).some((k) => /^sb-.+-auth-token$/.test(k));
  } catch {
    return false;
  }
};
import { flushWaitlistSyncQueue } from './services/waitlistService';
import { savePendingInviteUsername, readPendingInviteUsername } from './services/socialService';
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
import ErrorBoundary from './components/ui/ErrorBoundary';
import AssignedProgramsCard from './components/trainer/AssignedProgramsCard';
import Sidebar from './components/Sidebar';
import { connectWearable } from './services/wearables/wearableManager';
import { exchangeWhoopCodeForToken } from './services/wearables/whoopService';
import { exchangeFitbitCodeForToken } from './services/wearables/fitbitService';
import { exchangeStravaCodeForToken } from './services/wearables/stravaService';
import { exchangeGarminCodeForToken } from './services/wearables/garminService';

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
  exerciseModal: () => import('./components/ExerciseModal'),
  sidebarDrawer: () => import('./components/SidebarDrawer'),
  authScreen: () => import('./components/AuthScreen'),
  privateLaunch: () => import('./components/PrivateLaunchScreen')
};
const AuthScreen = lazy(lazyImports.authScreen);
const PrivateLaunchScreen = lazy(lazyImports.privateLaunch);
const RunningHub = lazy(lazyImports.running);
const CustomWorkoutsHub = lazy(lazyImports.custom);
const AICoachModal = lazy(lazyImports.coach);
const AdminDashboard = lazy(lazyImports.admin);
const TrainerHubView = lazy(lazyImports.trainerHub);
const LinkTrainerSheet = lazy(lazyImports.linkTrainer);
const PENDING_TRAINER_CODE_KEY = 'ab_fitness_pending_trainer_code_v1';
const AthleteManualModal = lazy(lazyImports.manual);
const OnboardingCoach = lazy(lazyImports.onboarding);
const SocialHub = lazy(lazyImports.social);
const ProfileView = lazy(lazyImports.profile);
const ActiveWorkout = lazy(lazyImports.workout);
const ExerciseModal = lazy(lazyImports.exerciseModal);
const SidebarDrawer = lazy(lazyImports.sidebarDrawer);

function TabFallback() {
  return (
    <div className="max-w-md mx-auto w-full px-4 pt-6 space-y-4">
      <Skeleton className="h-28 rounded-2xl" />
      <SkeletonList rows={3} />
    </div>
  );
}


function AppContent() {
  const { user, isGuest, loading, isTrainer, isAdmin, isCeo, isPro, hasActiveTrainer, refreshProfile } = useAuth();
  // Regresso do Stripe Checkout (?pro_success / ?pro_cancel definidos em api/stripe-checkout.js)
  const [checkoutNotice, setCheckoutNotice] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('pro_success') ? 'success' : params.get('pro_cancel') ? 'cancel' : null;
  });
  useEffect(() => {
    if (!checkoutNotice) return undefined;
    window.history.replaceState({}, document.title, window.location.pathname);
    if (checkoutNotice !== 'success') return undefined;
    refreshProfile();
    // O webhook do Stripe pode chegar depois do redirect: volta a ler o perfil uns segundos depois
    const t = setTimeout(refreshProfile, 4000);
    return () => clearTimeout(t);
  }, [checkoutNotice, refreshProfile]);
  // Abertura cinematográfica só na primeira abertura da sessão
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem(BOOT_SEEN_KEY) && hasReturningSession();
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
  // Link de atleta partilhado (?u=username ou ?add=username) persiste no browser e abre Amigos
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const invited = (params.get('u') || params.get('add') || '').replace(/^@/, '').trim();
      if (invited) {
        savePendingInviteUsername(invited);
        return 'social';
      }
      return readPendingInviteUsername() ? 'social' : 'dashboard';
    } catch {
      return 'dashboard';
    }
  }); // 'dashboard' | 'custom-workouts' | 'running' | 'history'
  // Ao concluir autenticação após visitar link ?u=username, encaminha para Amigos
  useEffect(() => {
    if (user && !isGuest && readPendingInviteUsername()) {
      queueMicrotask(() => setActiveTab('social'));
    }
  }, [user, isGuest]);
  // Link de convite do PT (?trainer=CODE) abre a folha de vínculo já com o código preenchido
  // O código fica guardado para sobreviver ao registo e à confirmação de e-mail (o gate privado deixa-o passar)
  const [trainerCodeFromUrl, setTrainerCodeFromUrl] = useState(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('trainer') || '';
      if (fromUrl) localStorage.setItem(PENDING_TRAINER_CODE_KEY, fromUrl);
      return fromUrl || localStorage.getItem(PENDING_TRAINER_CODE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [showLinkTrainer, setShowLinkTrainer] = useState(() => Boolean(trainerCodeFromUrl));
  const clearPendingTrainerCode = () => {
    try {
      localStorage.removeItem(PENDING_TRAINER_CODE_KEY);
    } catch {}
    setTrainerCodeFromUrl('');
  };
  useEffect(() => {
    if (hasActiveTrainer && trainerCodeFromUrl) queueMicrotask(clearPendingTrainerCode);
  }, [hasActiveTrainer, trainerCodeFromUrl]);
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

  // Pré-carrega apenas as vistas principais quando o browser estiver ocioso
  useEffect(() => {
    const primaryViews = [
      lazyImports.workout,
      lazyImports.running,
      lazyImports.social,
      lazyImports.profile,
    ];
    const prefetch = () => primaryViews.forEach((load) => load().catch(() => {}));
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(prefetch, 2500);
    return () => clearTimeout(t);
  }, []);

  // Trata o retorno do fluxo OAuth de wearables (ex.: Whoop ou Fitbit)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path.includes('/auth/callback/wearable')) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const returnedState = params.get('state');
      const expectedWhoopState = sessionStorage.getItem('whoop_oauth_state');
      const expectedFitbitState = sessionStorage.getItem('fitbit_oauth_state');
      const expectedStravaState = sessionStorage.getItem('strava_oauth_state');
      const expectedGarminState = sessionStorage.getItem('garmin_oauth_state');
      sessionStorage.removeItem('whoop_oauth_state');
      sessionStorage.removeItem('fitbit_oauth_state');
      sessionStorage.removeItem('strava_oauth_state');
      sessionStorage.removeItem('garmin_oauth_state');
      const redirectUri = `${window.location.origin}/auth/callback/wearable`;

      const callbackMap = [
        { provider: 'whoop', state: expectedWhoopState, exchange: exchangeWhoopCodeForToken },
        { provider: 'fitbit', state: expectedFitbitState, exchange: exchangeFitbitCodeForToken },
        { provider: 'strava', state: expectedStravaState, exchange: exchangeStravaCodeForToken },
        { provider: 'garmin', state: expectedGarminState, exchange: exchangeGarminCodeForToken }
      ];
      const matched = code ? callbackMap.find((item) => item.state && returnedState === item.state) : null;

      if (!matched) {
        if (code) {
          console.warn('Estado OAuth do wearable não corresponde ao esperado; a ignorar o código recebido.');
        }
        window.history.replaceState({}, document.title, '/');
      } else {
        matched.exchange(code, redirectUri)
          .then(async (tokenData) => {
            const expiresAt = tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
              : null;
            await connectWearable(user?.id, matched.provider, 'connected', {
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt
            });
            sound.playLevelUp?.();
          })
          .catch((err) => {
            console.warn(`Erro no exchange de token ${matched.provider}:`, err);
          })
          .finally(() => {
            window.history.replaceState({}, document.title, '/');
            window.dispatchEvent(new Event('storage'));
          });
      }
    }
  }, [user?.id]);
  const [soundEnabled, setSoundEnabled] = useState(() => getSoundPreference());
  // App exclusivamente escuro (design system AB Fitness): a classe .dark é fixa no <html>
  const isDark = true;

  // Inicializar o soundService com a preferência persistida
  useEffect(() => {
    sound.toggleSound(soundEnabled);
  }, [soundEnabled]);

  // Reenvia treinos, biometria de wearables e leads da waitlist que ficaram por sincronizar
  // no arranque e quando a ligação volta
  useEffect(() => {
    const flushWaitlist = () => {
      flushWaitlistSyncQueue().catch(() => {});
    };
    flushWaitlist();
    window.addEventListener('online', flushWaitlist);

    if (!user?.id || user.id === 'guest-local-user') {
      return () => window.removeEventListener('online', flushWaitlist);
    }

    const flushUserQueues = () => {
      // Primeiro envia o que está pendente, depois traz da nuvem o que falta neste aparelho
      flushWorkoutSyncQueue(user.id)
        .catch(() => {})
        .then(() => hydrateWorkoutHistory(user.id))
        .then((added) => {
          if (added > 0) setCompletedDays(getCompletedDays());
        })
        .catch(() => {});
      flushWearableSyncQueue(user.id).catch(() => {});
    };
    flushUserQueues();
    window.addEventListener('online', flushUserQueues);
    return () => {
      window.removeEventListener('online', flushWaitlist);
      window.removeEventListener('online', flushUserQueues);
    };
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
  // Entram: admin/CEO, personal trainers (role coach) e alunos com vínculo ativo a um PT.
  // Quem chega com convite de PT (?trainer=CODE) só vê o registo e a folha de vínculo até concluir.
  // Todos os restantes visitantes vêem a landing page VIP de Lançamento Privado.
  const isGateMember = Boolean(isAdmin || isCeo || isTrainer || hasActiveTrainer);
  // Só em `vite dev`: tools/marketing/capture-ui.mjs liga esta flag para capturar telas internas reais.
  const isMarketingCapture = import.meta.env.DEV && localStorage.getItem('ab_fitness_marketing_capture_v1') === 'true';

  if (PRIVATE_LAUNCH_MODE && !isGateMember && !isMarketingCapture) {
    if (trainerCodeFromUrl && !isGuest) {
      return (
        <Suspense fallback={<div className="min-h-screen bg-app flex items-center justify-center"><ABLogo size={76} showText={true} /></div>}>
          {user ? (
            <div className="min-h-screen bg-app">
              <LinkTrainerSheet initialCode={trainerCodeFromUrl} onClose={clearPendingTrainerCode} onLinked={refreshProfile} />
            </div>
          ) : (
            <AuthScreen hideGuest />
          )}
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div className="min-h-screen bg-app flex items-center justify-center"><ABLogo size={76} showText={true} /></div>}>
        <PrivateLaunchScreen />
      </Suspense>
    );
  }

  // 4. Proteção de Rota normal (quando o lançamento privado for desativado)
  if (!user && !isGuest) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-app flex items-center justify-center"><ABLogo size={76} showText={true} /></div>}>
        <AuthScreen />
      </Suspense>
    );
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
        onOpenAccountDrawer={() => setIsSidebarOpen(true)}
        completedDays={completedDays}
        schedule={schedule}
      />
      {/* Contentor Principal Adaptativo (Mobile até Desktop) */}
      <div className={`w-full min-h-screen bg-surface relative flex flex-col justify-between transition-colors duration-200 lg:flex-1 lg:min-w-0 ${isFullScreenView ? '' : 'max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto sm:border-x border-zinc-800/80'}`}>

        {/* Visualização de Treino Ativo */}
        {currentView === 'active-workout' && activeWorkout ? (
          <ErrorBoundary scope="active-workout" onReset={handleBackToDashboard}>
            <Suspense fallback={<TabFallback />}>
              <ActiveWorkout
                workout={activeWorkout}
                onBackToDashboard={handleBackToDashboard}
              />
            </Suspense>
          </ErrorBoundary>
        ) : currentView === 'admin' ? (
          <ErrorBoundary scope="admin" onReset={() => setCurrentView('dashboard')}>
            <Suspense fallback={<TabFallback />}>
              <AdminDashboard
                onBackToWorkout={() => {
                  setCurrentView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </Suspense>
          </ErrorBoundary>
        ) : currentView === 'trainer-hub' ? (
          <ErrorBoundary scope="trainer-hub" onReset={() => setCurrentView('dashboard')}>
            <Suspense fallback={<TabFallback />}>
              <TrainerHubView
                onBack={() => {
                  setCurrentView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </Suspense>
          </ErrorBoundary>
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

              {checkoutNotice && (
                <div role="status" className="max-w-5xl mx-auto w-full px-4 mt-3">
                  <div className="flex items-center justify-between gap-3 bg-surface-2 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-2.5">
                    <p className="text-[13px] text-white">
                      {checkoutNotice === 'cancel'
                        ? 'Pagamento cancelado. Nada foi cobrado.'
                        : isPro
                          ? 'PRO ativo. Obrigado pela confiança.'
                          : 'Pagamento recebido. O PRO fica ativo assim que o Stripe confirmar.'}
                    </p>
                    <button type="button" onClick={() => setCheckoutNotice(null)} className="shrink-0 text-xs font-medium text-zinc-400 hover:text-white">
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && user && !isGuest && <AssignedProgramsCard onStartWorkout={handleStartWorkout} />}

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

              <ErrorBoundary scope={`tab-${activeTab}`} compact>
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
              </ErrorBoundary>

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
            <LinkTrainerSheet initialCode={trainerCodeFromUrl} onClose={() => setShowLinkTrainer(false)} onLinked={refreshProfile} />
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

        {/* Gaveta lateral: gestão do atleta, acessível a partir do Header em qualquer ecrã.
            Em Suspense (fallback null) para sair do bundle principal sem mudar quando monta. */}
        <Suspense fallback={null}>
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
            completedDays={completedDays}
            schedule={schedule}
          />
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary scope="root">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
