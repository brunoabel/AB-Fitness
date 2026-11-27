import React, { useState } from 'react';
import { Users, Copy, Check, LogOut, X, Radio } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

function randomRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'AB';
  for (let i = 0; i < 4; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Sheet de Sessão Partilhada em Tempo Real (Supabase Realtime Presence + Broadcast).
 * Permite criar ou entrar numa sala por código curto e ver séries concluídas em dupla ao vivo.
 */
export default function LiveBuddySheet({
  isOpen,
  onClose,
  roomCode,
  members = [],
  events = [],
  canUseRealtime = false,
  onJoinRoom,
  onLeaveRoom
}) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    triggerHaptic(12);
    onJoinRoom?.(randomRoomCode());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const cleaned = inputCode.trim().toUpperCase();
    if (cleaned.length < 3) return;
    triggerHaptic(12);
    onJoinRoom?.(cleaned);
    setInputCode('');
  };

  const handleCopy = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      triggerHaptic(8);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Treinar em dupla ao vivo"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 pb-[calc(env(safe-area-inset-bottom,0px)+20px)] space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" strokeWidth={1.75} />
            <h3 className="text-base font-bold text-white">Treino em Dupla (Ao Vivo)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!canUseRealtime ? (
          <p className="text-xs text-zinc-400 leading-relaxed">
            Inicia sessão com a tua conta para sincronizares séries ao vivo com um parceiro de treino.
          </p>
        ) : !roomCode ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cria uma sala e partilha o código com o teu parceiro — cada série concluída aparece em tempo real no ecrã de ambos.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              className="w-full min-h-[48px] rounded-full bg-primary text-app font-semibold text-sm hover:bg-zinc-200 active:scale-[0.98] transition-[background-color,transform] duration-150 cursor-pointer"
            >
              Criar sala ao vivo
            </button>

            <form onSubmit={handleJoin} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Código (ex: AB4K9P)"
                maxLength={12}
                className="flex-1 min-h-[44px] px-4 rounded-full bg-black border border-white/[0.12] text-sm font-mono uppercase tracking-wider text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-hover"
              />
              <button
                type="submit"
                disabled={inputCode.trim().length < 3}
                className="min-h-[44px] px-4 rounded-full bg-accent border border-accent-hover text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
              >
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-black/60 border border-accent-hover/80">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <Radio className="w-3 h-3 animate-pulse" />
                  Sala ativa
                </span>
                <p className="font-mono text-lg font-bold tracking-widest text-white mt-0.5">{roomCode}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="min-h-[40px] px-3 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    onLeaveRoom?.();
                  }}
                  aria-label="Sair da sala"
                  title="Sair da sala"
                  className="min-h-[40px] min-w-[40px] rounded-full bg-white/[0.04] hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 flex items-center justify-center cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Na sala ({members.length || 1})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((m, i) => (
                  <span
                    key={`${m.userId}_${i}`}
                    className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-medium text-zinc-200"
                  >
                    {m.displayName}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Feed ao vivo
              </p>
              {events.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">
                  À espera das primeiras séries concluídas...
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {events.slice(0, 12).map((ev, i) => (
                    <div
                      key={`${ev.sentAt}_${i}`}
                      className="text-xs text-zinc-200 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <strong className="text-white font-semibold">{ev.displayName}</strong>{' '}
                      concluiu <span className="text-zinc-300">{ev.exerciseName}</span>
                      {ev.weight > 0 ? ` · ${ev.weight} kg × ${ev.reps}` : ev.reps ? ` · ${ev.reps} reps` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
