import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Dumbbell, 
  Flame, 
  Activity, 
  ChevronRight,
  LogOut,
  Crown
} from 'lucide-react';
import { useAuth } from '../context';
import { triggerHaptic } from '../utils/audio';
import ABLogo from './ABLogo';
import { joinWaitlist } from '../services/waitlistService';

const GOALS = [
  { id: 'hipertrofia', label: 'Hipertrofia Muscular', icon: Dumbbell },
  { id: 'hibrido', label: 'Atleta Híbrido & Desportos', icon: Activity },
  { id: 'forca', label: 'Força & Powerlifting', icon: Flame },
  { id: 'corrida', label: 'Corrida & Resistência GPS', icon: Sparkles },
];

export default function PrivateLaunchScreen() {
  const { user, signInWithEmail, signOut, isAdmin, isCeo } = useAuth();

  const [activeMode, setActiveMode] = useState('waitlist'); // 'waitlist' | 'admin-login'
  
  // Estado do formulário da Waitlist VIP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('hipertrofia');
  const [submitting, setSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  
  // Estado do formulário de Login do Fundador / Admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const isUserLoggedInNonAdmin = Boolean(user && !isAdmin && !isCeo);

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setWaitlistError('');
    triggerHaptic(15);

    if (!email || !email.includes('@')) {
      setWaitlistError('Por favor, indica um e-mail válido.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await joinWaitlist({
        name,
        email,
        goal: selectedGoal
      });
      if (res.error) {
        setWaitlistError(res.error);
      } else {
        triggerHaptic([12, 40, 12]);
        setWaitlistSuccess(true);
      }
    } catch {
      setWaitlistError('Não foi possível registar o e-mail no momento. Tenta novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    triggerHaptic(15);

    if (!adminEmail || !adminPassword) {
      setAdminError('Preenche o e-mail e a palavra-passe de administrador.');
      return;
    }

    setAdminLoading(true);
    try {
      await signInWithEmail(adminEmail, adminPassword);
      triggerHaptic([15, 30, 15]);
      // O AuthContext atualizará o estado automaticamente e concederá acesso se for admin/CEO
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setAdminError('Credenciais de administrador inválidas.');
      } else {
        setAdminError(msg || 'Erro ao autenticar administrador.');
      }
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 flex flex-col justify-between selection:bg-zinc-200 selection:text-black antialiased">
      {/* Barra superior de status do lançamento */}
      <header className="w-full border-b border-white/[0.06] bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
              Lançamento Privado · Acesso VIP
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveMode((prev) => (prev === 'admin-login' ? 'waitlist' : 'admin-login'));
              triggerHaptic(10);
            }}
            className="text-[12px] font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-white/[0.05] cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{activeMode === 'admin-login' ? 'Voltar' : 'Acesso Fundador'}</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow de fundo luxuoso */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] bg-gradient-to-b from-white/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10 space-y-8 animate-fadeIn">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <ABLogo size={100} showText={true} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                O padrão definitivo de treino e biomecânica.
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
                Estamos em fase final de lançamento fechado. O acesso imediato à plataforma está temporariamente restrito enquanto preparamos os servidores.
              </p>
            </div>
          </div>

          {/* Se um utilizador não-admin estiver com sessão iniciada */}
          {isUserLoggedInNonAdmin && (
            <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Acesso Restrito ao Lançamento</p>
                  <p className="text-zinc-400 mt-0.5">
                    A tua conta (<strong className="text-zinc-200">{user.email}</strong>) não possui permissões de Administrador nesta fase de testes fechados.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminar Sessão</span>
              </button>
            </div>
          )}

          {/* VISUALIZAÇÃO: Formulário de Lista VIP (Waitlist) */}
          {activeMode === 'waitlist' && !isUserLoggedInNonAdmin && (
            <div className="bg-[#0B0D12] rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl shadow-black/80 space-y-6">
              
              {waitlistSuccess ? (
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">Vaga Reservada com Sucesso</h3>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                      Adicionámos o teu e-mail à lista prioritária de membros fundadores. Serás notificado assim que o próximo lote de convites for libertado.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-zinc-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Prioridade Fundador Garantida
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Garantir Acesso Antecipado VIP
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Entra na lista prioritária para receber convite de membro fundador.
                    </p>
                  </div>

                  {waitlistError && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                      <span>{waitlistError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                        O teu nome (opcional)
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: Carlos Atleta"
                          className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-black/50 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                        E-mail para convite <span className="text-amber-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="o-teu-email@exemplo.com"
                          className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-black/50 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                        Principal foco desportivo
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {GOALS.map((g) => {
                          const Icon = g.icon;
                          const selected = selectedGoal === g.id;
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                setSelectedGoal(g.id);
                                triggerHaptic(8);
                              }}
                              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                selected
                                  ? 'bg-white/10 border-white/40 text-white shadow-xs'
                                  : 'bg-black/30 border-white/[0.06] text-zinc-400 hover:border-white/20'
                              }`}
                            >
                              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${selected ? 'text-amber-400' : 'text-zinc-500'}`} />
                              <span className="text-[11px] font-medium leading-tight truncate">{g.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span>{submitting ? 'A registar...' : 'Garantir Vaga na Lista VIP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Badges de Destaque da Plataforma */}
              <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>Sobrecarga Progressiva</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span>Motor Biomecânico</span>
                </div>
              </div>
            </div>
          )}

          {/* VISUALIZAÇÃO: Login de Administrador / Fundador */}
          {activeMode === 'admin-login' && !isUserLoggedInNonAdmin && (
            <div className="bg-[#0B0D12] rounded-3xl p-6 sm:p-7 border border-white/[0.08] shadow-2xl shadow-black/80 space-y-6 animate-fadeIn">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <h2 className="text-base font-bold text-white">Acesso Fundador & Admin</h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Autenticação restrita à administração para gestão e supervisão do sistema.
                </p>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                    E-mail do Administrador
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@abfitness.app"
                      className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-black/50 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full min-h-[46px] pl-10 pr-4 rounded-xl bg-black/50 border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{adminLoading ? 'A validar...' : 'Entrar como Administrador'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Rodapé com links legais obrigatórios */}
      <footer className="w-full border-t border-white/[0.06] py-6 text-center text-[11px] text-zinc-500 space-y-2">
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

