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
  const userId = user?.id;
  useEffect(() => {
    let active = true;
    if (!configured || !supabase || !userId || userId === 'guest-local-user') return undefined;
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.warn('Não foi possível ler o papel do utilizador:', error.message);
        setRoleState({ userId, role: data?.role || null });
      });
    return () => {
      active = false;
    };
  }, [configured, userId]);

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
  // O papel 'ceo' (ou o criador Bruno Araújo) possui acesso supremo a todo o ecossistema (Admin + PT + Pro).
  const profileRole = roleState.userId === userId ? roleState.role : null;
  const isCeo = Boolean(
    profileRole === 'ceo' ||
    user?.email === 'brunoaaraujo2005@gmail.com'
  );
  const isAdmin = isCeo || Boolean(profileRole === 'admin');
  const isTrainer = isCeo || Boolean(profileRole === 'coach');
  const isPro = isCeo || Boolean(roleState.isPremium || user?.user_metadata?.is_premium);

  const value = {
    user,
    session,
    loading,
    isGuest,
    isCeo,
    isAdmin,
    isTrainer,
    isPro,
    isConfigured: configured,
    signInWithEmail,
    signUpWithEmail,
    resendConfirmationEmail,
    signOut,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
