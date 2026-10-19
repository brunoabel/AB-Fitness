import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente fornecidas pela Vercel / .env local com fallback de segurança do projeto oficial
const DEFAULT_SUPABASE_URL = 'https://tegdtjmglvrvgerrtivx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ2R0am1nbHZydmdlcnJ0aXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjI0MjMsImV4cCI6MjEwMTc5ODQyM30.9QCEIfHfhtRqfG3xrpHLYmb5-Zd-OonMp_IraT0rzk4';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (rawUrl && typeof rawUrl === 'string' && rawUrl.trim() !== '') 
  ? rawUrl.trim() 
  : DEFAULT_SUPABASE_URL;

const supabaseAnonKey = (rawKey && typeof rawKey === 'string' && rawKey.trim() !== '') 
  ? rawKey.trim() 
  : DEFAULT_SUPABASE_ANON_KEY;

// Verifica se as credenciais do Supabase foram configuradas
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

// Cliente Supabase Singleton
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
