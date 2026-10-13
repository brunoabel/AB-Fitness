import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    triggerHaptic(15);

    if (!email || !password) {
      setErrorMessage('Preencha seu e-mail e senha para continuar.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMessage('A senha precisa ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, fullName);
        setSuccessMessage('Conta criada com sucesso! Conectando ao painel...');
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('Invalid login credentials')) {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.message.includes('User already registered')) {
        setErrorMessage('Este e-mail já está cadastrado. Faça login.');
      } else {
        setErrorMessage(err.message || 'Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    triggerHaptic(20);
    continueAsGuest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f8ff] via-[#f7fbfe] to-[#ffffff] dark:from-[#070d18] dark:via-[#0b1322] dark:to-[#070d18] flex flex-col justify-between items-center px-4 py-8 safe-top safe-bottom text-slate-800 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
        
        {/* Topo / Marca AB Fitness */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-slate-950 dark:bg-slate-900 items-center justify-center shadow-lg mb-4 border border-slate-800">
            <ABLogo size={56} variant="dark" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AB Fitness
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Treino, Biomecânica & Sobrecarga Progressiva
          </p>
        </div>


        {/* Caixa Principal de Autenticação */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl p-6 shadow-xl shadow-sky-900/5 border border-sky-100 dark:border-slate-800 backdrop-blur-xl">
          
          {/* Alternador de Abas: Login / Cadastro */}
          <div className="grid grid-cols-2 p-1 bg-sky-50 dark:bg-slate-800/80 rounded-2xl mb-6 border border-sky-100/80 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
                triggerHaptic(10);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
                triggerHaptic(10);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Feedback de Mensagem de Erro / Sucesso */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Formulário Touch-Friendly */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome ou apelido de treino"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8fbfe] dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-sky-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8fbfe] dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-sky-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-4 py-3 bg-[#f8fbfe] dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-sky-100 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Botão de Ação Principal em Azul Bebê */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Acessar Treinos' : 'Criar Minha Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divisor Visual */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sky-100 dark:border-slate-800" />
            </div>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              ou acesso rápido
            </span>
          </div>

          {/* Botão de Modo Convidado / Offline-first */}
          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-between active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div>
                <span className="block font-bold">Acessar como Convidado</span>
                <span className="block text-[10px] text-slate-400 font-normal">
                  Experimente sem criar conta agora
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Badge Informativo de Segurança */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dados e histórico protegidos com criptografia</span>
          </div>
        </div>

      </div>

      {/* Assinatura no Rodapé */}
      <footer className="w-full text-center pt-6 text-[11px] text-slate-400 dark:text-slate-500">
        Desenvolvido por <strong className="text-slate-600 dark:text-slate-300 font-bold">Bruno Abel</strong>
      </footer>
    </div>
  );
}
