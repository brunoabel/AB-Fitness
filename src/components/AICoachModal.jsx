import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import { RotateCcw, Send, X } from 'lucide-react';
import CoachAvatar from './coach/CoachAvatar';
import CoachChatMessage from './coach/CoachChatMessage';
import CoachIntro from './coach/CoachIntro';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import { useAuth } from '../context';
import { sendMessageToCoach } from '../services/abCoach/coachService';
import { toAppWorkout } from '../services/abCoach/adapter';
import { generateAndShareWorkoutCard } from '../utils/shareCard';
import { saveCustomWorkout, getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';

const STORAGE_CHAT_KEY = 'ab_fitness_coach_chat_v1';
const ProUpgradeSheet = lazy(() => import('./pro/ProUpgradeSheet'));

export default function AICoachModal({
  isOpen,
  onClose,
  onStartWorkout,
  onViewExercise,
  onOpenAuth,
  onSaveToSchedule
}) {
  const { user, isGuest } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState({});
  const [scheduledWorkouts, setScheduledWorkouts] = useState({});
  const [showDayPickerIndex, setShowDayPickerIndex] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [activeSwap, setActiveSwap] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [confirmClearChat, setConfirmClearChat] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!confirmClearChat) return undefined;
    const t = setTimeout(() => setConfirmClearChat(false), 3500);
    return () => clearTimeout(t);
  }, [confirmClearChat]);

  useEffect(() => {
    if (!isLoading) return undefined;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn('Erro ao guardar histórico do AB Coach:', err);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearHistory = () => {
    if (!confirmClearChat) {
      triggerHaptic(8);
      setConfirmClearChat(true);
      return;
    }
    triggerHaptic(15);
    setConfirmClearChat(false);
    setMessages([]);
    localStorage.removeItem(STORAGE_CHAT_KEY);
    showToast('Conversa reiniciada.');
  };

  const handleSend = async (textToSend, baseMessages = messages) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    triggerHaptic(10);
    setInputText('');

    const newMessages = [...baseMessages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoadingStep(0);
    setIsLoading(true);

    try {
      const perfil = getSavedUserProfile();
      const response = await sendMessageToCoach(newMessages, perfil);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.mensagem || 'Aqui está a tua prescrição biomecânica:',
          treino: response.treino || null,
          timestamp: new Date().toISOString()
        }
      ]);
      triggerHaptic(20);
    } catch (err) {
      console.error('Erro na conversa com AB Coach:', err);
      const errorText = err.message || 'Falha ao ligar ao assistente AB Coach.';
      const isQuotaError = err.code === 'COACH_QUOTA';
      const isAuthError = !isQuotaError && (errorText.includes('conectado') || errorText.includes('login') || errorText.includes('sessão'));

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAuthError
            ? 'O AB Coach com Inteligência Artificial requer que tenhas sessão iniciada na tua conta AB Fitness para gerar treinos exclusivos.'
            : errorText,
          isError: true,
          isAuthError,
          isQuotaError,
          quotaIsPro: Boolean(err.isPro),
          timestamp: new Date().toISOString()
        }
      ]);
      triggerHaptic(30);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg || !lastUserMsg.content || isLoading) return;

    const base = [...messages];
    if (base.length && base[base.length - 1].isError) base.pop();
    if (base.length && base[base.length - 1] === lastUserMsg) base.pop();
    handleSend(lastUserMsg.content, base);
  };

  const handleStartGeneratedWorkout = (treinoIA) => {
    if (!treinoIA) return;
    triggerHaptic(20);
    const appWorkout = toAppWorkout(treinoIA);
    if (appWorkout && onStartWorkout) {
      onStartWorkout(appWorkout);
      onClose();
    }
  };

  const handleSaveToMyWorkouts = (treinoIA, msgIndex) => {
    if (!treinoIA) return;
    triggerHaptic(15);
    const appWorkout = toAppWorkout(treinoIA);
    if (appWorkout) {
      saveCustomWorkout(appWorkout);
      setSavedWorkouts((prev) => ({ ...prev, [msgIndex]: true }));
      showToast('Treino guardado com sucesso na secção "Criar Treino"!');
    }
  };

  const handleAssignToDay = (treinoIA, dayNumber, dayLabel, msgIndex) => {
    if (!treinoIA || !onSaveToSchedule) return;
    triggerHaptic(15);
    const appWorkout = toAppWorkout(treinoIA);
    onSaveToSchedule(dayNumber, appWorkout);
    setScheduledWorkouts((prev) => ({ ...prev, [msgIndex]: dayLabel }));
    setShowDayPickerIndex(null);
    showToast(`Treino associado a ${dayLabel} no cronograma!`);
  };

  const toggleCardExpansion = (msgIndex) => {
    setExpandedCards((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex]
    }));
  };

  const handleSwapExercise = (msgIndex, exIndex, newEx) => {
    triggerHaptic(15);
    setMessages((prev) => {
      const updated = [...prev];
      const targetMsg = { ...updated[msgIndex] };
      if (!targetMsg.treino || !targetMsg.treino.exercicios) return prev;

      const newExercicios = [...targetMsg.treino.exercicios];
      const oldEx = newExercicios[exIndex];

      newExercicios[exIndex] = {
        ...oldEx,
        id: newEx.id,
        nome: newEx.nome,
        grupo: newEx.grupo || oldEx.grupo,
        porcao: newEx.porcao || oldEx.porcao,
        dica: newEx.dica || oldEx.dica
      };

      targetMsg.treino = {
        ...targetMsg.treino,
        exercicios: newExercicios
      };

      updated[msgIndex] = targetMsg;
      return updated;
    });

    setActiveSwap(null);
    showToast(`Exercício substituído por ${newEx.nome}!`);
  };

  const handleShareCard = async (treinoIA) => {
    if (!treinoIA) return;
    setIsSharing(true);
    triggerHaptic(15);
    try {
      const userProfile = getSavedUserProfile();
      const athleteName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || userProfile?.name || 'Atleta AB';

      await generateAndShareWorkoutCard({
        workout: treinoIA,
        athleteName,
        dateStr: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
        coachNote: treinoIA.observacoes || 'Prescrição biomecânica oficial AB Fitness'
      });
      showToast('Cartão de treino gerado com sucesso!');
    } catch (err) {
      console.warn('Erro ao partilhar:', err);
      showToast('Não foi possível partilhar o cartão no momento.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop key="modal" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4">
          <ModalPanel
            className="w-full sm:max-w-2xl bg-surface rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden border border-white/10 flex flex-col h-[94vh] sm:h-[86vh] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-surface-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CoachAvatar size={40} alt="" />
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-zinc-50 flex items-center gap-1.5">
                    AB Coach
                    <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                      IA
                    </span>
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-normal">
                    Consultoria Biomecânica & Prescrição
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    title="Limpar conversa"
                    className={`tap-44 p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      confirmClearChat
                        ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]'
                    }`}
                  >
                    {confirmClearChat ? 'Confirmar limpar?' : <RotateCcw className="w-4 h-4 stroke-[1.8]" />}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onClose();
                  }}
                  title="Fechar"
                  aria-label="Fechar"
                  className="tap-44 p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {toastMessage && (
              <div className="p-2 text-center text-xs font-semibold bg-accent text-white border-b border-white/10 animate-fadeIn">
                {toastMessage}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <CoachIntro {...{ handleSend, messages }} />

              {messages.map((msg, idx) => (
                <CoachChatMessage
                  key={idx}
                  activeSwap={activeSwap}
                  canSchedule={Boolean(onSaveToSchedule)}
                  isExpanded={Boolean(expandedCards[idx])}
                  isLoading={isLoading}
                  isSaved={Boolean(savedWorkouts[idx])}
                  isSharing={isSharing}
                  msg={msg}
                  msgIndex={idx}
                  onAssignToDay={handleAssignToDay}
                  onClose={onClose}
                  onOpenAuth={onOpenAuth}
                  onRetry={handleRetryLastMessage}
                  onUpgrade={() => setShowUpgrade(true)}
                  onSaveToWorkouts={handleSaveToMyWorkouts}
                  onShareCard={handleShareCard}
                  onStartWorkout={handleStartGeneratedWorkout}
                  onSwapExercise={handleSwapExercise}
                  onToggleDayPicker={setShowDayPickerIndex}
                  onToggleExpand={toggleCardExpansion}
                  onToggleSwap={setActiveSwap}
                  onViewExercise={onViewExercise}
                  scheduledDayLabel={scheduledWorkouts[idx]}
                  showDayPicker={showDayPickerIndex === idx}
                />
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-zinc-500 text-xs py-2 animate-fadeIn">
                  <img src="/coach/ab-coach-thinking-128.jpg" alt="" width={28} height={28} className="w-7 h-7 rounded-full object-cover border border-white/[0.08] shrink-0" />
                  <div className="bg-surface-2 px-3.5 py-2 rounded-xl border border-white/10 shadow-sm flex items-center gap-2">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <span className="text-zinc-200 font-medium tracking-tight">
                      {loadingStep === 0 && 'A analisar vetores biomecânicos...'}
                      {loadingStep === 1 && 'A prescrever séries e cadências ideais...'}
                      {loadingStep === 2 && 'A formatar prescrição com precisão...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-surface-2 border-t border-white/10">
              {(!user || isGuest) && (
                <div className="mb-2 p-2 px-3 rounded-lg bg-surface/90 border border-white/[0.08] flex items-center justify-between gap-2 text-xs">
                  <span className="text-zinc-300">
                    Inicia sessão para consultares o AB Coach com IA.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) onOpenAuth();
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded bg-primary text-app font-semibold text-[11px] shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Entrar
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pede um treino específico (ex.: peitoral inferior, 35 min, dor no ombro)..."
                  disabled={isLoading}
                  className="flex-1 bg-surface border border-white/[0.08] focus:border-white/30 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 outline-none transition-colors min-h-[44px]"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  aria-label="Enviar mensagem"
                  className={`p-2.5 rounded-lg font-semibold flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                    inputText.trim() && !isLoading
                      ? 'bg-accent/70 text-white hover:opacity-90 active:scale-95 cursor-pointer shadow-xs'
                      : 'bg-white/[0.04] text-zinc-500 cursor-not-allowed border border-white/[0.06]'
                  }`}
                >
                  <Send className="w-4 h-4 stroke-[2]" />
                </button>
              </form>
            </div>
          </ModalPanel>
        </ModalBackdrop>
      )}
      {isOpen && showUpgrade && (
        <Suspense key="pro-upgrade" fallback={null}>
          <ProUpgradeSheet reason="coach_limit" onClose={() => setShowUpgrade(false)} />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
