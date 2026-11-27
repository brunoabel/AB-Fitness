import React, { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { Play, X } from 'lucide-react';
import { Skeleton, SkeletonList } from './components/ui/Skeleton';
import { AnimatePresence } from 'motion/react';
import Header from './components/Header';
import WeeklyDashboard from './components/WeeklyDashboard';
import Navigation from './components/Navigation';
import InstallPrompt from './components/InstallPrompt';
import { PRIVATE_LAUNCH_MODE } from './config/launchMode';
import { getLocalFitnessProfile, syncFitnessProfileOnAuth, flushFitnessProfileSync } from './services/fitnessProfileService';
import BootSequence, { BOOT_SEEN_KEY } from './components/boot/BootSequence';
import TrainModeSwitch from './components/TrainModeSwitch';
import { animate, stagger } from 'motion';
import { AuthProvider, useAuth } from './context';
import { fetchUserSchedule, saveCustomUserPlan, getLocalCustomPlan, flushWorkoutSyncQueue, flushPlanSyncQueue } from './services/workoutService';
import { flushRunsSyncQueue } from './services/runningSyncService';
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
  saveActiveDraft,
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

function resolveDraftWorkout(draft, currentSchedule) {
  if (!draft || draft.workoutDayId === undefined) return null;
  const planWorkout = (currentSchedule || WEEKLY_SCHEDULE).find((w) => w.dayId === draft.workoutDayId);
  if (planWorkout) return planWorkout;
  const customList = getCustomWorkouts();
  const customWorkout = customList.find((w) => w.id === draft.workoutDayId || w.dayId === draft.workoutDayId);
  if (customWorkout) return customWorkout;
  return draft.workoutSnapshot || null;
}

function formatDraftElapsed(seconds) {
  const s = Math.max(0, Math.round(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

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
    if (params.get('pro_success')) return 'success';
    if (params.get('pro_cancel')) return 'cancel';
    // Regresso do portal da Stripe (api/stripe-portal.js): o plano pode ter mudado ou sido cancelado
    if (params.get('billing_return')) return 'billing';
    return null;
  });
  useEffect(() => {
    if (!checkoutNotice) return undefined;
    window.history.replaceState({}, document.title, window.location.pathname);
    if (checkoutNotice === 'cancel') return undefined;
    refreshProfile();
    // O webhook do Stripe pode chegar depois do redirect: volta a ler o perfil algumas vezes
    const timers = [4000, 10000, 20000].map((ms) => setTimeout(refreshProfile, ms));
    return () => timers.forEach(clearTimeout);
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
  const [resumableDraft, setResumableDraft] = useState(() => getActiveDraft());
  const [activeWorkout, setActiveWorkout] = useState(() => resolveDraftWorkout(getActiveDraft(), getLocalCustomPlan() || WEEKLY_SCHEDULE));
  const resumableWorkout = resumableDraft ? resolveDraftWorkout(resumableDraft, schedule) : null;
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

  // Agendador leve de lembretes de hidratação (corre enquanto a app está aberta/visível)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let alive = true;
    const checkHydration = async () => {
      if (!alive || document.visibilityState !== 'visible') return;
      try {
        const { getHydrationPrefs, saveHydrationPrefs, getHydrationToday, computeDailyWaterTargetMl, shouldTriggerHydrationReminder, sendHydrationNotification } = await import('./utils/hydration');
        const prefs = getHydrationPrefs();
        if (!prefs.enabled) return;
        const profile = getLocalFitnessProfile();
        const targetMl = Number.isFinite(prefs.customTargetMl) && prefs.customTargetMl >= 1000
          ? prefs.customTargetMl
          : computeDailyWaterTargetMl(profile?.weightKg, profile?.primaryGoal);
        const todayLog = getHydrationToday();
        const now = new Date();
        if (shouldTriggerHydrationReminder({ now, prefs, consumedMl: todayLog.consumedMl, targetMl })) {
          const sent = await sendHydrationNotification({ remainingMl: Math.max(0, targetMl - todayLog.consumedMl) });
          if (sent) saveHydrationPrefs({ lastNotifiedAt: now.toISOString() });
        }
      } catch {}
    };
    const intervalId = window.setInterval(checkHydration, 60_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkHydration();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const wearableCallbackHandledRef = useRef(false);

  // Trata o retorno do fluxo OAuth de wearables (ex.: Whoop, Fitbit, Strava ou Garmin)
  useEffect(() => {
    if (typeof window === 'undefined' || loading || wearableCallbackHandledRef.current) return;
    const path = window.location.pathname;
    if (path.includes('/auth/callback/wearable')) {
      wearableCallbackHandledRef.current = true;
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
  }, [loading, user?.id]);
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
      flushRunsSyncQueue(user.id).catch(() => {});
      flushPlanSyncQueue(user.id).catch(() => {});
      flushFitnessProfileSync(user.id).catch(() => {});
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

    // Sincroniza sempre as métricas biométricas e nível do atleta ao autenticar;
    // só abre o onboarding se não existir perfil nem na nuvem nem localmente para esta conta.
    if (user && user.id && user.id !== 'guest-local-user') {
      syncFitnessProfileOnAuth(user.id)
        .then((profile) => {
          if (active && !profile) setShowOnboardingModal(true);
        })
        .catch(() => {
          if (active && !getLocalFitnessProfile() && !getSavedUserProfile()) {
            setShowOnboardingModal(true);
          }
        });
    } else if (isGuest && !getSavedUserProfile() && !getLocalFitnessProfile()) {
      setShowOnboardingModal(true);
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
    setResumableDraft(getActiveDraft());
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
      <div className={`w-full min-h-screen bg-app relative flex flex-col justify-between transition-colors duration-200 lg:flex-1 lg:min-w-0 ${isFullScreenView ? '' : 'max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto sm:border-x border-white/[0.06]'}`}>

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
                onOpenAICoach={() => {
                  sound.playTick();
                  setShowAICoachModal(true);
                }}
              />

              <InstallPrompt />

              {checkoutNotice && (
                <div role="status" className="max-w-5xl mx-auto w-full px-4 mt-3">
                  <div className="flex items-center justify-between gap-3 bg-surface-2 border-l-2 border-accent-hover rounded-r-xl px-3.5 py-2.5">
                    <p className="text-[13px] text-white">
                      {checkoutNotice === 'cancel'
                        ? 'Pagamento cancelado. Nada foi cobrado.'
                        : checkoutNotice === 'billing'
                          ? 'Subscrição atualizada. As alterações aparecem aqui em poucos segundos.'
                          : isTrainer && isPro
                            ? 'Plano ativo. O Trainer Hub está disponível no menu.'
                            : isPro
                              ? 'PRO ativo. Obrigado pela confiança.'
                              : 'Pagamento recebido. O plano fica ativo assim que o Stripe confirmar.'}
                    </p>
                    <button type="button" onClick={() => setCheckoutNotice(null)} className="shrink-0 text-xs font-medium text-zinc-400 hover:text-white">
                      Fechar
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'dashboard' && resumableWorkout && (
                <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-[1360px] mx-auto w-full px-4 sm:px-6 mt-3">
                  <div className="bg-surface border border-accent-hover rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Treino em curso · {formatDraftElapsed(resumableDraft?.elapsedSeconds)}
                      </p>
                      <p className="text-sm font-semibold text-white truncate">
                        {resumableWorkout.title || resumableWorkout.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartWorkout(resumableWorkout)}
                        className="min-h-[44px] px-4 rounded-full bg-primary text-app text-xs font-semibold hover:bg-zinc-200 active:scale-[0.97] transition-[background-color,transform] duration-150 ease-out inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Retomar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          saveActiveDraft(null);
                          setResumableDraft(null);
                        }}
                        aria-label="Descartar treino em curso"
                        title="Descartar"
                        className="min-h-[44px] px-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Descartar</span>
                      </button>
                    </div>
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
                  onApplyPlan={handleOnboardingComplete}
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
            </div>

            {/* Barra de Navegação Inferior Ergonómica */}
            <Navigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
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
