import React, { useState, useEffect, useRef } from 'react';
import { ModalBackdrop, ModalPanel } from './ui/Modal';
import { AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Bot, 
  RotateCcw, 
  Play, 
  Bookmark, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Clock, 
  LogIn, 
  Calendar, 
  RefreshCw, 
  Share2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context';
import { sendMessageToCoach } from '../services/abCoach/coachService';
import { toAppWorkout } from '../services/abCoach/adapter';
import { getBiomechanicalSubstitutes } from '../services/abCoach/catalog';
import { generateAndShareWorkoutCard } from '../utils/shareCard';
import { saveCustomWorkout, getSavedUserProfile } from '../utils/storage';
import { triggerHaptic } from '../utils/audio';

const STORAGE_CHAT_KEY = 'ab_fitness_coach_chat_v1';

const SUGGESTION_CHIPS = [
  { id: 'quads', label: 'Ênfase em Quadríceps', prompt: 'Elabora um treino com ênfase total em quadríceps e vasto medial, priorizando agachamento e leg press com cadência controlada.' },
  { id: 'chest_low', label: 'Peitoral Costal & Tríceps', prompt: 'Pretendo um treino focado em peitoral inferior (porção costal) e tríceps. Destaca variações declinadas e paralelas.' },
  { id: 'shoulder_pain', label: 'Proteção de Ombro (Sem Barra Reta)', prompt: 'Tenho desconforto no ombro ao fazer supino com barra. Elabora um treino de peito e ombros seguro com halteres e polias.' },
  { id: 'quick', label: 'Sessão Rápida de 35 min', prompt: 'Tenho apenas 35 minutos disponíveis hoje. Elabora um treino altamente eficiente focado nos grandes exercícios compostos.' },
  { id: 'vtaper', label: 'Costas V-Taper & Posterior', prompt: 'Elabora um treino de costas focado na largura de grande dorsal (formato em V) e deltoide posterior.' },
  { id: 'glutes_hams', label: 'Glúteos & Isquiotibiais', prompt: 'Elabora um treino focado na cadeia posterior e glúteos, com ênfase em elevação pélvica e variações de Romanian Deadlift.' }
];

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
  const [savedWorkouts, setSavedWorkouts] = useState({}); // { [workoutName]: boolean }
  const [scheduledWorkouts, setScheduledWorkouts] = useState({}); // { [msgIndex]: dayLabel }
  const [showDayPickerIndex, setShowDayPickerIndex] = useState(null);
  const [expandedCards, setExpandedCards] = useState({}); // { [msgIndex]: boolean }
  const [toastMessage, setToastMessage] = useState(null);
  const [activeSwap, setActiveSwap] = useState(null); // { msgIndex, exIndex, exercise }
  const [isSharing, setIsSharing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Feedback progressivo dinâmico para eliminar a sensação de espera
  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 3);
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Sincronizar chat no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn('Erro ao guardar histórico do AB Coach:', err);
    }
  }, [messages]);

  // Deslocamento suave para a última mensagem
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen, isLoading]);

  // Foco no input ao abrir
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
    triggerHaptic(15);
    if (window.confirm('Desejas reiniciar a conversa com o AB Coach?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
      showToast('Conversa reiniciada.');
    }
  };

  const handleSend = async (textToSend, baseMessages = messages) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    triggerHaptic(10);
    setInputText('');

    const newMessages = [...baseMessages, { role: 'user', content: text }];
    setMessages(newMessages);
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
      let errorText = err.message || 'Falha ao ligar ao assistente AB Coach.';
      
      const isAuthError = errorText.includes('conectado') || errorText.includes('login') || errorText.includes('sessão');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAuthError 
            ? 'O AB Coach com Inteligência Artificial requer que tenhas sessão iniciada na tua conta AB Fitness para gerar treinos exclusivos.'
            : errorText,
          isError: true,
          isAuthError,
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

    // Reenvia a partir do histórico sem o erro e sem a última pergunta (que é acrescentada de novo)
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
        dica: newEx.dica || oldEx.dica,
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
        className="w-full sm:max-w-2xl bg-white dark:bg-surface rounded-t-xl sm:rounded-xl shadow-xl overflow-hidden border border-zinc-200 dark:border-white/10 flex flex-col h-[94vh] sm:h-[86vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Sóbrio do AB Coach */}
        <div className="p-4 bg-zinc-50 dark:bg-surface-2 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white dark:bg-accent dark:text-app flex items-center justify-center border border-zinc-800 dark:border-zinc-200">
              <Bot className="w-5 h-5 stroke-[2]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-1.5">
                  AB Coach
                  <span className="text-[11px] font-semibold px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    IA
                  </span>
                </h2>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                Consultoria Biomecânica & Prescrição
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Limpar conversa"
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.8]" />
              </button>
            )}

            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              title="Fechar"
              className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* Notificação Toast Interna */}
        {toastMessage && (
          <div className="p-2 text-center text-xs font-semibold bg-zinc-950 text-white dark:bg-accent dark:text-app border-b border-zinc-800 animate-fadeIn">
            {toastMessage}
          </div>
        )}

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Apresentação Inicial */}
          {messages.length === 0 && (
            <div className="py-8 px-2 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-700">
                <Bot className="w-6 h-6 stroke-[1.8]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Como posso estruturar o teu treino hoje?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-sm mx-auto">
                  Prescrevo sessões com foco anatómico específico (vasto medial, porção costal, deltoide posterior), adaptação a desconfortos e tempos reduzidos.
                </p>
              </div>

              {/* Sugestões Rápidas */}
              <div className="pt-2 text-left">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 px-1">
                  Exemplos de Pedidos:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleSend(chip.prompt)}
                      className="p-3 rounded-lg text-left bg-zinc-50 dark:bg-surface-2 hover:bg-zinc-100 dark:hover:bg-surface-3 border border-zinc-200 dark:border-white/10 text-xs text-zinc-800 dark:text-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span className="font-semibold block text-zinc-950 dark:text-zinc-100">
                        {chip.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lista de Mensagens */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[1.8]" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bolha de Texto */}
                  <div
                    className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-zinc-950 text-white dark:bg-accent/15 dark:text-accent font-medium'
                        : msg.isError
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                          : 'bg-zinc-50 dark:bg-surface-2 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-white/10'
                    }`}
                  >
                    {msg.content}

                    {/* Botão de Autenticação */}
                    {msg.isAuthError && (
                      <div className="mt-3 pt-2 border-t border-rose-200 dark:border-rose-800/40">
                        <button
                          onClick={() => {
                            if (onOpenAuth) onOpenAuth();
                            onClose();
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-950 text-white dark:bg-accent dark:text-app font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 stroke-[2]" />
                          <span>Iniciar Sessão no AB Fitness</span>
                        </button>
                      </div>
                    )}

                    {/* Botão de Tentar Novamente em falhas de ligação */}
                    {msg.isError && !msg.isAuthError && (
                      <div className="mt-3 pt-2 border-t border-rose-200 dark:border-rose-800/40">
                        <button
                          onClick={handleRetryLastMessage}
                          disabled={isLoading}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-950 text-white dark:bg-accent dark:text-app font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
                          <span>Tentar Novamente</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cartão de Treino Prescrito */}
                  {msg.treino && (
                    <div className="w-full bg-white dark:bg-surface-2 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 shadow-xs space-y-3">
                      
                      {/* Topo do Cartão */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold uppercase tracking-wider mb-1.5 border border-zinc-200 dark:border-zinc-700">
                            Prescrição do Treinador
                          </div>
                          <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 leading-tight">
                            {msg.treino.nome}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                            Foco: {msg.treino.foco}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 shrink-0 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{msg.treino.duracao_min} min</span>
                        </div>
                      </div>

                      {/* Observações */}
                      {msg.treino.observacoes && (
                        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-surface border border-zinc-200 dark:border-white/10 text-[11px] text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5 stroke-[2]" />
                          <span>{msg.treino.observacoes}</span>
                        </div>
                      )}

                      {/* Lista de Exercícios */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 px-1 uppercase tracking-wider">
                          <span>{msg.treino.exercicios?.length || 0} Exercícios</span>
                          <button
                            onClick={() => toggleCardExpansion(idx)}
                            className="text-zinc-700 dark:text-zinc-300 hover:underline flex items-center gap-0.5 text-[11px] cursor-pointer"
                          >
                            {expandedCards[idx] ? (
                              <>Menos <ChevronUp className="w-3 h-3 stroke-[2]" /></>
                            ) : (
                              <>Ver Detalhes <ChevronDown className="w-3 h-3 stroke-[2]" /></>
                            )}
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {(expandedCards[idx] ? msg.treino.exercicios : msg.treino.exercicios.slice(0, 3)).map((ex, exIdx) => {
                            const isThisSwapping = activeSwap?.msgIndex === idx && activeSwap?.exIndex === exIdx;
                            return (
                              <div
                                key={ex.id || exIdx}
                                onClick={() => onViewExercise && onViewExercise(ex)}
                                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                  isThisSwapping 
                                    ? 'border-zinc-500 dark:border-zinc-400 bg-zinc-100 dark:bg-zinc-800' 
                                    : 'bg-zinc-50 dark:bg-surface border-zinc-200 dark:border-white/10 hover:border-zinc-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded bg-white dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 tabular-nums">
                                      {exIdx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-950 dark:text-zinc-100 truncate">
                                      {ex.nome}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {ex.porcao && (
                                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-medium">
                                        {ex.porcao}
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic(10);
                                        setActiveSwap(
                                          isThisSwapping
                                            ? null
                                            : { msgIndex: idx, exIndex: exIdx, exercise: ex }
                                        );
                                      }}
                                      title="Substituir por exercício biomecanicamente equivalente"
                                      className={`tap-44 p-1.5 rounded border transition-all cursor-pointer ${
                                        isThisSwapping
                                          ? 'bg-zinc-950 text-white dark:bg-accent/15 dark:text-accent border-zinc-950 dark:border-accent/40'
                                          : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                      }`}
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 stroke-[1.8] ${isThisSwapping ? 'animate-spin' : ''}`} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pl-7 tabular-nums">
                                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                    {ex.series} séries × {ex.reps} reps
                                  </span>
                                  <span>•</span>
                                  <span>{ex.descanso_seg}s descanso</span>
                                </div>

                                {/* Menu de Substituição Biomecânica */}
                                {isThisSwapping && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="mt-2.5 p-2.5 bg-white dark:bg-surface-2 border border-zinc-300 dark:border-zinc-700 rounded-lg space-y-2 animate-fadeIn"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                                        <RefreshCw className="w-3 h-3 stroke-[2]" />
                                        <span>Substitutos Equivalentes:</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActiveSwap(null)}
                                        className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-1 py-0.5 rounded cursor-pointer"
                                      >
                                        ✕ Fechar
                                      </button>
                                    </div>

                                    {(() => {
                                      const usedIds = new Set((msg.treino.exercicios || []).map((item) => item.id));
                                      const substitutes = getBiomechanicalSubstitutes(ex.id || ex.nome, usedIds);

                                      if (substitutes.length === 0) {
                                        return (
                                          <p className="text-[11px] text-zinc-400 italic py-1">
                                            Não existem alternativas biomecânicas no catálogo para este perfil de movimento.
                                          </p>
                                        );
                                      }

                                      return (
                                        <div className="space-y-1">
                                          {substitutes.map((sub) => (
                                            <div
                                              key={sub.id}
                                              className="p-2 rounded bg-zinc-50 dark:bg-surface hover:bg-zinc-100 dark:hover:bg-surface-3 border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-2"
                                            >
                                              <div>
                                                <h5 className="text-xs font-semibold text-zinc-950 dark:text-zinc-100">
                                                  {sub.nome}
                                                </h5>
                                                <p className="text-[11px] text-zinc-400">
                                                  {sub.porcao || sub.grupo} • {sub.mecanica || 'Isolado'}
                                                </p>
                                              </div>

                                              <button
                                                type="button"
                                                onClick={() => handleSwapExercise(idx, exIdx, sub)}
                                                className="px-2 py-1 rounded bg-zinc-950 text-white dark:bg-accent dark:text-app text-[11px] font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                                              >
                                                Substituir
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ações do Plano Prescrito */}
                      <div className="pt-2 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            onClick={() => handleStartGeneratedWorkout(msg.treino)}
                            className="w-full py-2.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-800 dark:bg-accent dark:text-app dark:hover:bg-accent-hover text-white font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer min-h-[40px]"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Iniciar Treino Agora</span>
                          </button>

                          <button
                            onClick={() => handleSaveToMyWorkouts(msg.treino, idx)}
                            disabled={savedWorkouts[idx]}
                            className={`w-full py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer min-h-[40px] ${
                              savedWorkouts[idx]
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 cursor-default'
                                : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {savedWorkouts[idx] ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Guardado com Sucesso</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 stroke-[1.8]" />
                                <span>Guardar nos Meus Treinos</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Partilha de Cartão */}
                        <button
                          type="button"
                          onClick={() => handleShareCard(msg.treino)}
                          disabled={isSharing}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                        >
                          <Share2 className="w-3.5 h-3.5 stroke-[1.8]" />
                          <span>{isSharing ? 'A gerar Stories...' : 'Partilhar Treino (Stories 9:16)'}</span>
                        </button>

                        {/* Atribuir a um Dia da Semana */}
                        {onSaveToSchedule && (
                          <div>
                            <button
                              onClick={() => {
                                triggerHaptic(10);
                                setShowDayPickerIndex(showDayPickerIndex === idx ? null : idx);
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px]"
                            >
                              <Calendar className="w-3.5 h-3.5 stroke-[1.8]" />
                              <span>
                                {scheduledWorkouts[idx] 
                                  ? `Associado a ${scheduledWorkouts[idx]} (alterar)`
                                  : (showDayPickerIndex === idx ? 'Fechar Seletor de Dia' : 'Aplicar no Cronograma Semanal')}
                              </span>
                            </button>

                            {showDayPickerIndex === idx && (
                              <div className="mt-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-surface border border-zinc-200 dark:border-white/10 space-y-2 animate-fadeIn">
                                <p className="text-[11px] font-medium text-zinc-500 text-center">
                                  Aplicar em que dia da semana?
                                </p>
                                <div className="grid grid-cols-7 gap-1">
                                  {[
                                    { day: 1, label: 'Seg' },
                                    { day: 2, label: 'Ter' },
                                    { day: 3, label: 'Qua' },
                                    { day: 4, label: 'Qui' },
                                    { day: 5, label: 'Sex' },
                                    { day: 6, label: 'Sáb' },
                                    { day: 0, label: 'Dom' }
                                  ].map((d) => (
                                    <button
                                      key={d.day}
                                      onClick={() => handleAssignToDay(msg.treino, d.day, d.label, idx)}
                                      className="py-1.5 text-center rounded bg-white dark:bg-zinc-800 hover:bg-zinc-950 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-950 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                                    >
                                      {d.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Indicador de Carregamento Dinâmico com Feedback de Progresso */}
          {isLoading && (
            <div className="flex gap-2.5 items-center text-zinc-500 text-xs py-2 animate-fadeIn">
              <div className="w-7 h-7 rounded-md bg-zinc-950 text-white dark:bg-accent dark:text-app border border-zinc-800 dark:border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 stroke-[2] animate-pulse" />
              </div>
              <div className="bg-white dark:bg-surface-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-zinc-700 dark:text-zinc-200 font-medium tracking-tight">
                  {loadingStep === 0 && 'A analisar vetores biomecânicos...'}
                  {loadingStep === 1 && 'A prescrever séries e cadências ideais...'}
                  {loadingStep === 2 && 'A formatar prescrição com precisão...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada / Input Footer */}
        <div className="p-3 bg-zinc-50 dark:bg-surface-2 border-t border-zinc-200 dark:border-white/10">
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
              className="flex-1 bg-white dark:bg-surface border border-zinc-300 dark:border-zinc-700 focus:border-zinc-500 dark:focus:border-zinc-400 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 outline-none transition-colors min-h-[44px]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 rounded-lg font-semibold flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                inputText.trim() && !isLoading
                  ? 'bg-zinc-950 text-white dark:bg-accent/15 dark:text-accent hover:opacity-90 active:scale-95 cursor-pointer shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        </div>

      </ModalPanel>
    </ModalBackdrop>
    )}
    </AnimatePresence>
  );
}
