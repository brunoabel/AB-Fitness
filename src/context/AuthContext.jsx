import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext } from './authContextDef';
import { CONSENT_VERSION } from '../legal/config';
import { PRIVATE_LAUNCH_MODE } from '../config/launchMode';

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
  const refreshProfile = () => setProfileVersion((v) => v + 1);
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
        trialEndsAt: data?.trial_ends_at || null,
        isTrialActive: Boolean(data?.trial_ends_at && new Date(data.trial_ends_at).getTime() > Date.now()),
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

  // Logout
  const signOut = async () => {
    if (configured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_STORAGE_KEY);
    localStorage.removeItem('ab_wearable_connections_v1');
    localStorage.removeItem('ab_wearable_biometrics_v1');
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
  const isPro = isCeo || Boolean(ownState.isPro);
  const hasActiveTrainer = Boolean(ownState.hasActiveTrainer);

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
    hasActiveTrainer,
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
