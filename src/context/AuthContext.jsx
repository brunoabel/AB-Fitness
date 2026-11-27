import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext } from './authContextDef';
import { CONSENT_VERSION } from '../legal/config';
import { PRIVATE_LAUNCH_MODE } from '../config/launchMode';
import { claimLocalDataOwner, clearUserScopedData, GUEST_USER_ID } from '../utils/userDataReset';

const GUEST_STORAGE_KEY = 'ab_fitness_guest_mode_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });

  const configured = isSupabaseConfigured();

  // Papel lido do servidor (public.profiles.role). Nunca de user_metadata, que o próprio utilizador pode editar.
  const [roleState, setRoleState] = useState({ userId: null, role: null });
  // Incrementar força nova leitura do perfil (ex.: depois de vincular a um PT, que ativa o trial)
  const [profileVersion, setProfileVersion] = useState(0);
  const refreshProfile = useCallback(() => setProfileVersion((v) => v + 1), []);
  const userId = user?.id;
  useEffect(() => {
    let active = true;
    if (!configured || !supabase || !userId || userId === 'guest-local-user') return undefined;
    // select('*'): colunas novas (trial_ends_at, timezone) podem ainda não existir se a migration não correu
    Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.rpc('get_my_trainer')
    ]).then(([{ data, error }, trainerRes]) => {
      if (!active) return;
      if (error) console.warn('Não foi possível ler o papel do utilizador:', error.message);
      setRoleState({
        userId,
        role: data?.role || null,
        isPro: Boolean(data?.is_pro || data?.is_premium),
        // Cliente Stripe associado: mostra "Gerir subscrição" (portal) em vez de um novo checkout
        hasSubscription: Boolean(data?.stripe_customer_id),
        trainerSubscriptionActive: Boolean(data?.trainer_subscription_active),
        trialEndsAt: data?.trial_ends_at || null,
        isTrialActive: Boolean(data?.trial_ends_at && new Date(data.trial_ends_at).getTime() > Date.now()),
        trialDaysLeft: data?.trial_ends_at ? Math.ceil((new Date(data.trial_ends_at).getTime() - Date.now()) / 86400000) : null,
        hasActiveTrainer: Boolean(!trainerRes?.error && Array.isArray(trainerRes?.data) && trainerRes.data.length > 0)
      });
      // Fuso do aparelho no perfil: o servidor agrupa streak e estatísticas por dia local
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (data && 'timezone' in data && tz && data.timezone !== tz) {
        supabase.from('profiles').update({ timezone: tz }).eq('id', userId).then(() => {});
      }
    }).catch(() => {
      if (active) setRoleState({ userId, role: null });
    });
    return () => {
      active = false;
    };
  }, [configured, userId, profileVersion]);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (!configured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Erro ao obter sessão do Supabase:', error.message);
        }
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          if (initialSession?.user) {
            setIsGuest(false);
            localStorage.removeItem(GUEST_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Falha na inicialização da autenticação:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Ouvir alterações de estado de autenticação (LOGIN, LOGOUT, TOKEN_REFRESHED)
    let authListener = null;
    if (configured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user || null);
        if (currentSession?.user) {
          setIsGuest(false);
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, [configured]);

  // Login com Email e Senha
  const signInWithEmail = async (email, password) => {
    if (!configured || !supabase) {
      throw new Error('Supabase não configurado. Por favor, adicione as chaves no ambiente.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
    setSession(data.session);
    setIsGuest(false);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    return data;
  };

  // Cadastro de Novo Usuário
  const signUpWithEmail = async (email, password, fullName, consent = null) => {
    if (!configured || !supabase) {
      throw new Error('Supabase não configurado. Por favor, adicione as chaves no ambiente.');
    }

    // Redirecionamento explícito para o AB Fitness após confirmação de e-mail
    const redirectUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/`
      : 'https://www.abfitness.app/';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || email.split('@')[0],
          // Registo do consentimento (copiado para public.user_consents por trigger no servidor)
          ...(consent?.terms && consent?.health
            ? { consent_terms_at: new Date().toISOString(), consent_health_at: new Date().toISOString(), consent_version: CONSENT_VERSION }
            : {}),
        },
      },
    });
    if (error) throw error;
    if (data.session) {
      setUser(data.user);
      setSession(data.session);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
    return data;
  };

  // Reenviar e-mail de confirmação
  const resendConfirmationEmail = async (emailToResend) => {
    if (!configured || !supabase) {
      throw new Error('Supabase não configurado. Por favor, adicione as chaves no ambiente.');
    }
    const targetEmail = (emailToResend || '').trim();
    if (!targetEmail) {
      throw new Error('Indique o e-mail para o qual pretende reenviar a confirmação.');
    }
    const redirectUrl = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/`
      : 'https://www.abfitness.app/';

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: targetEmail,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    if (error) throw error;
    return data;
  };

  // Dados locais pertencem a uma conta: se entrar outra conta neste aparelho, limpa antes de misturar históricos
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    claimLocalDataOwner(userId).then((cleared) => {
      if (cleared && !cancelled) window.location.reload();
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /**
   * Logout. Numa conta real tenta enviar o que está por sincronizar (até 5 s), apaga do aparelho os dados
   * da conta (histórico, corridas, perfil, fotos, wearables...) e recarrega a app sem estado em memória.
   * `accountDeleted: true` apaga também as filas por sincronizar (a conta já não existe).
   * O modo convidado mantém os dados locais, que são a única cópia.
   */
  const signOut = async ({ accountDeleted = false } = {}) => {
    const previousUserId = user?.id;
    const isRealAccount = Boolean(previousUserId && previousUserId !== GUEST_USER_ID);

    if (isRealAccount && !accountDeleted && configured && supabase) {
      try {
        const [{ flushWorkoutSyncQueue, flushPlanSyncQueue }, { flushRunsSyncQueue }] = await Promise.all([
          import('../services/workoutService'),
          import('../services/runningSyncService')
        ]);
        await Promise.race([
          Promise.allSettled([
            flushWorkoutSyncQueue(previousUserId),
            flushRunsSyncQueue(previousUserId),
            flushPlanSyncQueue(previousUserId)
          ]),
          new Promise((resolve) => setTimeout(resolve, 5000))
        ]);
      } catch {
        // Sem rede: as filas ficam no aparelho e são enviadas no próximo login desta conta
      }
    }

    try {
      if (configured && supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setUser(null);
      setSession(null);
      setIsGuest(false);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem('ab_wearable_connections_v1');
      localStorage.removeItem('ab_wearable_biometrics_v1');
      if (isRealAccount) {
        await clearUserScopedData({ keepPendingSync: !accountDeleted });
        window.location.replace('/');
      }
    }
  };

  // Acesso Convidado / Modo Offline (bloqueado durante o lançamento privado)
  const continueAsGuest = () => {
    if (PRIVATE_LAUNCH_MODE) return;
    setIsGuest(true);
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setUser({
      id: 'guest-local-user',
      email: 'atleta@abfitness.app',
      user_metadata: {
        full_name: 'Atleta Convidado',
      },
    });
  };

  // Só para mostrar/ocultar a UI de admin/trainer: o acesso real aos dados é garantido pelas políticas RLS.
  // Role protegido na base de dados por trigger (prevent_profile_role_change) — "coach" é o papel de PT.
  // O papel 'ceo' possui acesso supremo a todo o ecossistema (Admin + PT + Pro). Lido só da base, nunca por e-mail.
  const profileRole = roleState.userId === userId ? roleState.role : null;
  const isCeo = profileRole === 'ceo';
  const isAdmin = isCeo || Boolean(profileRole === 'admin');
  const isTrainer = isCeo || Boolean(profileRole === 'coach');
  const ownState = roleState.userId === userId ? roleState : {};
  const trialEndsAt = ownState.trialEndsAt || null;
  const isTrialActive = Boolean(ownState.isTrialActive);
  const trialDaysLeft = ownState.trialDaysLeft ?? null;
  const isPro = isCeo || Boolean(ownState.isPro);
  const hasActiveTrainer = Boolean(ownState.hasActiveTrainer);
  const hasSubscription = Boolean(ownState.hasSubscription);
  const trainerSubscriptionActive = Boolean(ownState.trainerSubscriptionActive);

  const value = {
    user,
    session,
    loading,
    isGuest,
    isCeo,
    isAdmin,
    isTrainer,
    isPro,
    isTrialActive,
    trialEndsAt,
    trialDaysLeft,
    hasActiveTrainer,
    hasSubscription,
    trainerSubscriptionActive,
    refreshProfile,
    isConfigured: configured,
    signInWithEmail,
    signUpWithEmail,
    resendConfirmationEmail,
    signOut,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
