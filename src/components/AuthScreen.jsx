import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';
import ConsentCheckboxes from './legal/ConsentCheckboxes';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, resendConfirmationEmail, continueAsGuest } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [consent, setConsent] = useState({ terms: false, health: false });
  const [consentTried, setConsentTried] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setResendSuccess('');
    triggerHaptic(15);

    if (!email || !password) {
      setErrorMessage('Preencha o seu e-mail e a palavra-passe para continuar.');
      return;
    }

    if (mode === 'register' && password.length < 8) {
      setErrorMessage('A palavra-passe precisa de ter no mínimo 8 caracteres.');
      return;
    }

    if (mode === 'register' && !(consent.terms && consent.health)) {
      setConsentTried(true);
      setErrorMessage('Para criar conta, aceite os termos e o consentimento para dados de saúde.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        const res = await signUpWithEmail(email, password, fullName, consent);
        if (res?.session) {
          setSuccessMessage('Conta criada com sucesso! A ligar ao painel...');
        } else {
          setPendingConfirmationEmail(email.trim());
          setSuccessMessage('Conta criada! Enviámos um e-mail de confirmação. Toque na ligação recebida para aceder ao AB Fitness.');
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('E-mail ou palavra-passe incorretos.');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('Este e-mail já está registado. Inicie sessão.');
      } else if (msg.toLowerCase().includes('email not confirmed') || err.code === 'email_not_confirmed') {
        setPendingConfirmationEmail(email.trim());
        setErrorMessage('O seu e-mail ainda não foi confirmado. Verifique a caixa de entrada ou reenvie a confirmação abaixo.');
      } else {
        setErrorMessage(msg || 'Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = (pendingConfirmationEmail || email).trim();
    if (!targetEmail) {
      setErrorMessage('Indique o e-mail para o qual pretende reenviar a confirmação.');
      return;
    }
    setResending(true);
    setResendSuccess('');
    setErrorMessage('');
    triggerHaptic(15);
    try {
      await resendConfirmationEmail(targetEmail);
      setResendSuccess(`E-mail de confirmação reenviado para ${targetEmail}. Verifique a caixa de entrada (e a pasta de spam).`);
    } catch (err) {
      console.error(err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
        setErrorMessage('Aguarde cerca de 60 segundos antes de pedir um novo envio.');
      } else {
        setErrorMessage(msg || 'Erro ao reenviar e-mail de confirmação.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleGuestAccess = () => {
    triggerHaptic(20);
    continueAsGuest();
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between items-center px-4 py-8 safe-top safe-bottom text-zinc-100 transition-colors">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
        
        {/* Topo / Marca AB Fitness */}
        <div className="text-center mb-7 animate-fadeIn flex flex-col items-center">
          <ABLogo size={110} showText={true} />
          <p className="text-xs text-zinc-400 font-medium mt-3 tracking-wide">
            Treino, Biomecânica & Sobrecarga Progressiva
          </p>
        </div>

        {/* Caixa Principal de Autenticação */}
        <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl border border-white/10">
          
          {/* Alternador de Abas: Iniciar Sessão / Registar */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
                setResendSuccess('');
                setPendingConfirmationEmail('');
                triggerHaptic(10);
              }}
              className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
                setResendSuccess('');
                setPendingConfirmationEmail('');
                triggerHaptic(10);
              }}
              className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Registar
            </button>
          </div>

          {/* Feedback de Mensagem de Erro / Sucesso */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {/* Reenvio de e-mail de confirmação */}
          {pendingConfirmationEmail && (
            <div className="mb-4 p-3.5 rounded-xl bg-zinc-950/90 border border-amber-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Confirmação pendente</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Enviámos uma ligação para <strong className="text-white">{pendingConfirmationEmail}</strong>. Verifique a caixa de entrada e a pasta de spam.
              </p>
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full min-h-[38px] py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-[0.99] border border-white/10 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {resending ? (
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Reenviar e-mail de confirmação</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Formulário Touch-Friendly */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="O seu nome ou alcunha de treino"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-xl border border-white/10 focus:outline-none focus:border-zinc-400 text-sm transition-all placeholder:text-zinc-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-xl border border-white/10 focus:outline-none focus:border-zinc-400 text-sm transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  minLength={mode === 'register' ? 8 : undefined}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-950 text-white rounded-xl border border-white/10 focus:outline-none focus:border-zinc-400 text-sm transition-all placeholder:text-zinc-400"
                />
              </div>
              {mode === 'register' && (
                <p className="text-[10px] text-zinc-500 mt-1 ml-1">Mínimo de 8 caracteres.</p>
              )}
            </div>

            {mode === 'register' && <ConsentCheckboxes value={consent} onChange={setConsent} showErrors={consentTried} />}

            {/* Botão de Ação Principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3.5 mt-2 rounded-xl bg-primary text-app hover:bg-primary-hover font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Iniciar Sessão' : 'Criar Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divisor Visual */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-zinc-900 px-3 text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
              ou acesso rápido
            </span>
          </div>

          {/* Botão de Modo Convidado / Offline-first */}
          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-white/10 text-zinc-200 font-semibold text-xs flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-left">
              <UserCheck className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div>
                <span className="block font-bold">Entrar como Convidado</span>
                <span className="block text-[11px] text-zinc-400 font-normal">
                  Experimente sem registo imediato
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Badge Informativo de Segurança */}
        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-[11px] text-zinc-400 border border-white/10 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dados e histórico protegidos com encriptação</span>
          </div>
        </div>

      </div>

      {/* Assinatura no Rodapé */}
      <footer className="w-full text-center pt-6 text-[11px] text-zinc-500 space-y-2">
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <a href="/termos" className="underline underline-offset-2 hover:text-zinc-300">Termos</a>
          <a href="/privacidade" className="underline underline-offset-2 hover:text-zinc-300">Privacidade</a>
          <a href="/aviso-medico" className="underline underline-offset-2 hover:text-zinc-300">Aviso médico</a>
          <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-300">Livro de Reclamações</a>
        </p>
        <p>Desenvolvido por <strong className="text-zinc-300 font-bold">ABEX Studio</strong></p>
      </footer>
    </div>
  );
}

