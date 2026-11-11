import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, Crown, Flame } from 'lucide-react';
import { Avatar, SPRING, TAP } from './ui';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified, isAthleteCeo } from '../../utils/userVerification';
import { listDirectMessages, sendDirectMessage } from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';

const QUICK_REACTIONS = ['🔥', '💪', '👏', '⚡', '👊', '🏆'];

export default function DirectMessageSheet({ friend, currentUserId, currentUserProfile, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const friendId = friend?.friend_id || friend?.id;
  const friendName = friend?.full_name || `@${friend?.username}` || 'Amigo';
  const isCeo = isAthleteCeo(friend);
  const isVerified = isAthleteVerified(friend);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (!friendId || !currentUserId) return;
    let alive = true;
    setLoading(true);
    listDirectMessages(currentUserId, friendId).then(({ data }) => {
      if (alive) {
        setMessages(data || []);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 50);
      }
    });

    const interval = setInterval(() => {
      listDirectMessages(currentUserId, friendId).then(({ data }) => {
        if (alive && data && data.length > messages.length) {
          setMessages(data);
          scrollToBottom(true);
        }
      });
    }, 4000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [friendId, currentUserId]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || !currentUserId || !friendId) return;

    triggerHaptic(10);
    setInputText('');

    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      sender_id: currentUserId,
      receiver_id: friendId,
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => scrollToBottom(true), 30);

    const { data } = await sendDirectMessage(currentUserId, friendId, text, currentUserProfile);
    if (data) {
      setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? data : m)));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMsgTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={`Conversa com ${friendName}`}>
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-lg h-[85dvh] rounded-t-[28px] bg-surface border border-white/[0.08] border-b-0 shadow-2xl flex flex-col overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
      >
        {/* Handle */}
        <span className="block mx-auto mt-2 w-9 h-1 rounded-full bg-white/15" aria-hidden />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-surface-2/40">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={friend.avatar_url} name={friendName} size={42} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-heading text-body font-bold text-white truncate">{friendName}</h3>
                {isVerified && <VerifiedBadge size={14} />}
                {isCeo && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    CEO
                  </span>
                )}
              </div>
              <p className="text-[12px] text-zinc-400 truncate">
                {friend.username ? `@${friend.username}` : 'Amigo no AB Fitness'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer active:scale-95"
            aria-label="Fechar conversa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center h-full text-zinc-500 text-[13px]">
              A carregar mensagens...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2 text-zinc-400">
              <span className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mb-1">
                <MessageCircle className="w-6 h-6" strokeWidth={1.5} />
              </span>
              <p className="text-body font-bold text-white">Inicia a conversa com {friendName}</p>
              <p className="text-[12px] text-zinc-400 max-w-xs">
                Partilha planos de treino, combina horários de ginásio ou motiva o teu amigo!
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMine = m.sender_id === currentUserId;
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed break-words ${
                      isMine
                        ? 'bg-accent text-white rounded-br-xs shadow-md'
                        : 'bg-surface-2 border border-white/[0.08] text-zinc-100 rounded-bl-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono tabular-nums">
                    {formatMsgTime(m.created_at)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reactions Bar */}
        <div className="px-4 py-1.5 flex items-center gap-1.5 border-t border-white/[0.04] bg-surface-2/30 overflow-x-auto">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSend(emoji)}
              className="px-2.5 py-1 rounded-xl bg-surface-2 text-[14px] hover:bg-surface-3 transition-colors cursor-pointer active:scale-95 shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-surface-2/60 border-t border-white/[0.08] flex items-center gap-2 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${friendName}...`}
            className="flex-1 min-h-[46px] px-4 rounded-2xl bg-surface border border-white/[0.08] text-body text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-hover text-[14px]"
          />
          <motion.button
            type="button"
            whileTap={TAP}
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-12 h-[46px] rounded-2xl bg-primary text-app flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 font-bold"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
