import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthContext } from './authContextDef';

const GUEST_STORAGE_KEY = 'ab_fitness_guest_mode_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });

  const configured = isSupabaseConfigured();

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
  const signUpWithEmail = async (email, password, fullName) => {
    if (!configured || !supabase) {
      throw new Error('Supabase não configurado. Por favor, adicione as chaves no ambiente.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || email.split('@')[0],
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

  // Acesso Convidado / Modo Offline
  const continueAsGuest = () => {
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

  const isAdmin = Boolean(
    user?.email === 'brunoaaraujo2005@gmail.com' ||
    user?.user_metadata?.role === 'admin'
  );

  const value = {
    user,
    session,
    loading,
    isGuest,
    isAdmin,
    isConfigured: configured,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
