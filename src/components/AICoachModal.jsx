import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  RotateCcw, 
  Play, 
  Bookmark, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Clock, 
  Target, 
  AlertCircle,
  LogIn,
  Dumbbell,
  Calendar,
  RefreshCw,
  Share2
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
  { id: 'quads', label: '🦵 Ênfase em Quadríceps', prompt: 'Monte um treino pesado com ênfase total em quadríceps e vasto medial, priorizando agachamento e leg press.' },
  { id: 'chest_low', label: '🎯 Peitoral Inferior & Tríceps', prompt: 'Quero um treino focado em peitoral inferior (porção costal) e tríceps. Destaque variações declinadas e paralelas.' },
  { id: 'shoulder_pain', label: '🛡️ Dor no Ombro (Sem Supino Reto)', prompt: 'Tenho desconforto no ombro ao fazer supino reto com barra. Monte um treino de peito e ombros seguro usando halteres e polia.' },
  { id: 'quick', label: '⚡ Treino Rápido de 35 min', prompt: 'Tenho apenas 35 minutos disponíveis hoje. Monte um treino super eficiente focado em grandes exercícios compostos.' },
  { id: 'vtaper', label: '🏹 Costas V-Taper & Posterior', prompt: 'Monte um treino de costas focado em largura de dorsal (formato em V) e deltoide posterior.' },
  { id: 'glutes_hams', label: '🍑 Glúteos & Isquiotibiais', prompt: 'Monte um treino focado em posterior de coxa e glúteos, com ênfase em elevação pélvica e variações de stiff/RDL.' }
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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sincronizar chat no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn('Erro ao salvar chat do AB Coach:', err);
    }
  }, [messages]);

  // Scroll automático para a última mensagem
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

  if (!isOpen) return null;

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearHistory = () => {
    triggerHaptic(15);
    if (window.confirm('Deseja reiniciar a conversa com o AB Coach?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
      showToast('Conversa reiniciada.');
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    triggerHaptic(10);
    setInputText('');

    // Adicionar mensagem do usuário
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const perfil = getSavedUserProfile();
      const response = await sendMessageToCoach(newMessages, perfil);

      // Adicionar resposta do treinador
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.mensagem || 'Aqui está o seu plano de treino biomecânico:',
          treino: response.treino || null,
          timestamp: new Date().toISOString()
        }
      ]);
      triggerHaptic(20);
    } catch (err) {
      console.error('Erro na conversa com AB Coach:', err);
      let errorText = err.message || 'Falha ao conectar com o AB Coach.';
      
      const isAuthError = errorText.includes('conectado') || errorText.includes('login') || errorText.includes('sessão');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAuthError 
            ? '🔐 O **AB Coach com Inteligência Artificial** requer que você esteja conectado à sua conta AB Fitness para gerar treinos exclusivos e personalizados.'
            : `⚠️ ${errorText}`,
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
      showToast('Treino adicionado com sucesso a "Montar Treino"!');
    }
  };

  const handleAssignToDay = (treinoIA, dayNumber, dayLabel, msgIndex) => {
    if (!treinoIA || !onSaveToSchedule) return;
    triggerHaptic(15);
    const appWorkout = toAppWorkout(treinoIA);
    onSaveToSchedule(dayNumber, appWorkout);
    setScheduledWorkouts((prev) => ({ ...prev, [msgIndex]: dayLabel }));
    setShowDayPickerIndex(null);
    showToast(`Treino adicionado com sucesso a ${dayLabel}!`);
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
        equipamento: newEx.equipamento || oldEx.equipamento,
        series: oldEx.series,
        reps: oldEx.reps,
        descanso_seg: oldEx.descanso_seg,
        cadencia: oldEx.cadencia,
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
    showToast(`Substituído por: ${newEx.nome}`);
  };

  const handleShareCard = async (treino) => {
    if (!treino || isSharing) return;
    triggerHaptic(15);
    setIsSharing(true);
    showToast('Gerando card 9:16 cinematográfico...');
    try {
      await generateAndShareWorkoutCard(treino);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
      showToast('Não foi possível compartilhar a imagem.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container Principal do Modal */}
      <div className="w-full max-w-2xl h-[94vh] sm:h-[86vh] bg-[#09090b] border border-zinc-800 rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl shadow-sky-950/30">
        
        {/* Toast Notificação */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Header do AB Coach */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800/80 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-cyan-400 to-indigo-600 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  AB Coach
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    IA
                  </span>
                </h2>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Especialista em Biomecânica & Hipertrofia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Limpar conversa"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              title="Fechar"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Mensagem Inicial se o chat estiver vazio */}
          {messages.length === 0 && (
            <div className="py-6 px-2 text-center max-w-lg mx-auto space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Como posso estruturar o seu treino hoje?
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Sou o treinador de IA do AB Fitness. Monto treinos com foco anatômico milimétrico (ex: vasto medial, peitoral inferior, bíceps cabeça longa), adaptações a lesões e limites de tempo.
                </p>
              </div>

              {/* Chips de Sugestão */}
              <div className="pt-2 text-left">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5 px-1">
                  Sugestões Rápidas:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleSend(chip.prompt)}
                      className="p-2.5 rounded-xl text-left bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-sky-500/50 text-xs text-zinc-200 transition-all active:scale-[0.98] group flex items-start gap-2"
                    >
                      <span className="font-semibold text-zinc-100 group-hover:text-sky-300">
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
                  <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-sky-400" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bolha de Texto */}
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-sky-600 text-white rounded-tr-sm shadow-md font-medium'
                        : msg.isError
                          ? 'bg-rose-950/40 text-rose-200 border border-rose-800/60 rounded-tl-sm'
                          : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}

                    {/* Botão de Login se for erro de Auth */}
                    {msg.isAuthError && (
                      <div className="mt-3 pt-2 border-t border-rose-800/40">
                        <button
                          onClick={() => {
                            if (onOpenAuth) onOpenAuth();
                            onClose();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                        >
                          <LogIn className="w-4 h-4" />
                          Fazer Login no AB Fitness
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card de Treino Interativo (se houver treino) */}
                  {msg.treino && (
                    <div className="w-full bg-zinc-900/95 border border-sky-500/40 rounded-2xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
                      
                      {/* Topo do Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-sky-500/30">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            Treino Gerado pelo Coach
                          </div>
                          <h4 className="text-sm font-extrabold text-white leading-tight">
                            {msg.treino.nome}
                          </h4>
                          <p className="text-xs text-sky-400 font-medium mt-0.5">
                            Foco: {msg.treino.foco}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          {msg.treino.duracao_min} min
                        </div>
                      </div>

                      {/* Dica / Observação do Treinador */}
                      {msg.treino.observacoes && (
                        <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px] text-zinc-300 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{msg.treino.observacoes}</span>
                        </div>
                      )}

                      {/* Lista de Exercícios */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 px-1">
                          <span>{msg.treino.exercicios?.length || 0} EXERCÍCIOS PREVISTOS</span>
                          <button
                            onClick={() => toggleCardExpansion(idx)}
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5 text-[11px]"
                          >
                            {expandedCards[idx] ? (
                              <>Menos <ChevronUp className="w-3 h-3" /></>
                            ) : (
                              <>Ver Detalhes <ChevronDown className="w-3 h-3" /></>
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
                                className={`p-2.5 rounded-xl bg-zinc-950/90 border transition-all cursor-pointer group ${
                                  isThisSwapping ? 'border-sky-500 shadow-md shadow-sky-950/40' : 'border-zinc-800/70 hover:border-sky-500/40'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-5 h-5 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                                      {exIdx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-100 group-hover:text-sky-300 transition-colors truncate">
                                      {ex.nome}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {ex.porcao && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium">
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
                                      title="Trocar por exercício equivalente"
                                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                        isThisSwapping
                                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-sky-400'
                                      }`}
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${isThisSwapping ? 'animate-spin text-sky-400' : ''}`} />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-400 pl-7">
                                  <span className="font-semibold text-zinc-300">
                                    {ex.series} séries × {ex.reps} reps
                                  </span>
                                  <span>•</span>
                                  <span>{ex.descanso_seg}s descanso</span>
                                  {ex.cadencia && (
                                    <>
                                      <span>•</span>
                                      <span className="text-zinc-500">{ex.cadencia}</span>
                                    </>
                                  )}
                                </div>

                                {ex.dica && expandedCards[idx] && (
                                  <p className="text-[10px] text-sky-400/90 pl-7 mt-1 italic">
                                    💡 {ex.dica}
                                  </p>
                                )}

                                {/* Menu de Troca Biomecânica Rápida */}
                                {isThisSwapping && (
                                  <div 
                                    onClick={(e) => e.stopPropagation()} 
                                    className="mt-2.5 p-2.5 bg-zinc-900/95 border border-sky-500/40 rounded-xl space-y-2 animate-in fade-in"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-300">
                                        <RefreshCw className="w-3 h-3 text-sky-400" />
                                        <span>Substitutos Biomecânicos Equivalentes:</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setActiveSwap(null)}
                                        className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
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
                                            Nenhum outro exercício equivalente encontrado no catálogo.
                                          </p>
                                        );
                                      }

                                      return (
                                        <div className="space-y-1.5 pt-0.5">
                                          {substitutes.map((sub) => (
                                            <div
                                              key={sub.id}
                                              onClick={() => handleSwapExercise(idx, exIdx, sub)}
                                              className="p-2 rounded-lg bg-zinc-950 hover:bg-sky-950/50 border border-zinc-800 hover:border-sky-500/60 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.99] group/sub"
                                            >
                                              <div className="min-w-0">
                                                <p className="text-xs font-bold text-zinc-200 group-hover/sub:text-sky-300 truncate">
                                                  {sub.nome}
                                                </p>
                                                <p className="text-[10px] text-zinc-400">
                                                  {sub.porcao || sub.grupo} • {sub.equipamento || 'Geral'}
                                                </p>
                                              </div>
                                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 shrink-0 border border-sky-500/30 group-hover/sub:bg-sky-500 group-hover/sub:text-white transition-colors">
                                                Trocar
                                              </span>
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

                          {!expandedCards[idx] && msg.treino.exercicios.length > 3 && (
                            <button
                              onClick={() => toggleCardExpansion(idx)}
                              className="w-full text-center py-1 text-[11px] text-zinc-500 hover:text-zinc-300 font-medium"
                            >
                              + {msg.treino.exercicios.length - 3} outros exercícios...
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botões de Ação do Card */}
                      <div className="pt-2 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            onClick={() => handleStartGeneratedWorkout(msg.treino)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-white" />
                            Iniciar Treino Agora
                          </button>

                          <button
                            onClick={() => handleSaveToMyWorkouts(msg.treino, idx)}
                            disabled={savedWorkouts[idx]}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 cursor-pointer ${
                              savedWorkouts[idx]
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 cursor-default'
                                : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border-zinc-700 hover:border-zinc-500'
                            }`}
                          >
                            {savedWorkouts[idx] ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                Salvo nos Meus Treinos
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-4 h-4 text-sky-400" />
                                Salvar nos Meus Treinos
                              </>
                            )}
                          </button>
                        </div>

                        {/* Botão Compartilhar Stories 9:16 */}
                        <button
                          type="button"
                          onClick={() => handleShareCard(msg.treino)}
                          disabled={isSharing}
                          className="w-full py-2 px-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-sky-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                        >
                          <Share2 className="w-3.5 h-3.5 text-sky-400" />
                          <span>{isSharing ? 'Gerando Stories 9:16...' : 'Compartilhar Treino (Stories 9:16)'}</span>
                        </button>

                        {/* Botão Adicionar à Minha Semana */}
                        {onSaveToSchedule && (
                          <div>
                            <button
                              onClick={() => {
                                triggerHaptic(10);
                                setShowDayPickerIndex(showDayPickerIndex === idx ? null : idx);
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-sky-400 hover:text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {scheduledWorkouts[idx] 
                                  ? `✅ Adicionado a ${scheduledWorkouts[idx]} (clique para trocar)`
                                  : (showDayPickerIndex === idx ? 'Fechar Seletor de Dia' : 'Adicionar à Minha Semana (Cronograma)')}
                              </span>
                            </button>

                            {showDayPickerIndex === idx && (
                              <div className="mt-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 animate-in fade-in">
                                <p className="text-[11px] font-semibold text-zinc-400 text-center">
                                  Substituir ou aplicar em qual dia da semana?
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
                                      className="py-1.5 text-center rounded-lg bg-zinc-900 hover:bg-sky-500 hover:text-white border border-zinc-800 text-xs font-bold text-zinc-200 transition-colors cursor-pointer active:scale-95"
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

          {/* Loading com indicador pulsante */}
          {isLoading && (
            <div className="flex gap-2.5 items-center text-zinc-400 text-xs py-2">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-2xl border border-zinc-800">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-zinc-300 font-medium">
                  AB Coach analisando catálogo biomecânico...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Barra de Entrada / Input Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800/80">
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
              placeholder="Peça um treino específico (ex: peitoral inferior, 35 min, dor no ombro)..."
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
